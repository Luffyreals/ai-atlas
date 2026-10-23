import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page, type Request } from '@playwright/test';
import { HOME } from '../../src/data/home';
import { LESSONS, LOCALES, type Locale } from '../../src/data/roadmap';
import { formatString } from '../../src/i18n/format';
import { lessonLinkView } from '../../src/lib/lesson-link';
import { getFirstOpenLesson, isTranslated, requireLesson } from '../../src/lib/roadmap';
import { countParts, routeTo } from '../../src/lib/route';
import { isNarrow, scrollThrough, STRINGS } from './helpers';

// Homepage (src/components/home/*, RoadmapMap.astro). All URLs end with "/" (trailingSlash 'always').

const OPEN_MAP: Record<Locale, string> = { vi: 'Mở bản đồ', en: 'Open the map' };
/** Parses "…: {{count}} bài, qua {{parts}} phần." / "… Lessons on the way: {{count}}. Parts: {{parts}}." */
const RESULT_PATTERN: Record<Locale, RegExp> = {
  vi: /:\s*(\d+) bài, qua (\d+) phần\.$/,
  en: /Lessons on the way: (\d+)\. Parts: (\d+)\.$/,
};

const prerequisitesOf = (id: string) => requireLesson(id).prerequisites;
const titleOf = (id: string, locale: Locale) => {
  const lesson = requireLesson(id);
  return (lesson.shortTitle ?? lesson.title)[locale];
};

async function readResult(page: Page, locale: Locale): Promise<{ text: string; count: number; parts: number }> {
  const text = ((await page.locator('[data-route-result]').textContent()) ?? '').trim();
  const match = RESULT_PATTERN[locale].exec(text);
  expect(match, `route result text: "${text}"`).not.toBeNull();
  return { text, count: Number(match![1]), parts: Number(match![2]) };
}

for (const locale of LOCALES) {
  // Per language: /en/ starts at the first lesson written in English (decision 43).
  const FIRST_OPEN = getFirstOpenLesson(locale);
  test.describe(`homepage /${locale}/`, () => {
    test('has exactly one h1, and the hero button leads to #map', async ({ page }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();

      const button = page.locator('.hero').getByRole('link', { name: OPEN_MAP[locale], exact: true });
      await expect(button).toHaveCount(1);
      await expect(button).toHaveAttribute('href', '#map');
      await expect(page.locator('#map')).toHaveCount(1);

      await button.click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/#map$`));
      await expect(page.locator('#map')).toBeInViewport();
    });

    test('route finder: default route, then llm/rag-chatbot', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const select = page.locator('[data-route-select]');
      const onRoute = page.locator('[data-roadmap] [data-on-route]');
      const destination = page.locator('[data-roadmap] [data-destination]');

      // Server-rendered default: ml/linear-regression, 8 lessons across 3 parts.
      await expect(select).toHaveValue('ml/linear-regression');
      await expect(onRoute).toHaveCount(8);
      const initial = await readResult(page, locale);
      expect(initial).toMatchObject({ count: 8, parts: 3 });
      expect(initial.text).toContain(titleOf('ml/linear-regression', locale));

      const target = 'llm/rag-chatbot';
      const expected = routeTo(target, prerequisitesOf);
      await select.selectOption(target);
      await expect(page.locator('[data-route-result]')).toContainText(titleOf(target, locale));

      const result = await readResult(page, locale);
      await expect(onRoute).toHaveCount(result.count);
      expect(result.count).toBe(expected.size);
      expect(result.parts).toBe(countParts(expected));

      const marked = await onRoute.evaluateAll((items) => items.map((item) => item.getAttribute('data-lesson-id')));
      expect(marked.sort()).toEqual([...expected].sort());

      await expect(destination).toHaveCount(1);
      await expect(destination).toHaveAttribute('data-lesson-id', target);
    });

    test('at 375px the first screen shows the map button and the other-language link', async ({ page }) => {
      test.skip(!isNarrow(page), 'mobile project (375px) only');
      const other: Locale = locale === 'vi' ? 'en' : 'vi';
      await page.goto(`/${locale}/`);

      const button = page.locator('.hero').getByRole('link', { name: OPEN_MAP[locale], exact: true });
      await expect(button).toBeVisible();
      await expect(button).toBeInViewport({ ratio: 1 });
      expect(await page.evaluate(() => window.scrollY)).toBe(0);

      // "Start learning" too, on the same row as the map link.
      const start = page.locator('.hero [data-start-learning]');
      await expect(start).toHaveCount(FIRST_OPEN ? 1 : 0);
      if (FIRST_OPEN) {
        await expect(start).toBeInViewport({ ratio: 1 });
        await page.evaluate(() => document.fonts.ready);
        const [startBox, mapBox] = [await start.boundingBox(), await button.boundingBox()];
        expect(startBox && mapBox && Math.abs(startBox.y + startBox.height / 2 - (mapBox.y + mapBox.height / 2))).toBeLessThan(4);
      }

      const languageLink = page.locator(`.hero a[hreflang="${other}"]`);
      await expect(languageLink).toHaveCount(1);
      await expect(languageLink).toBeVisible();
      await expect(languageLink).toHaveAttribute('href', `/${other}/`);
      await languageLink.click();
      await page.waitForURL(`**/${other}/`);
      await expect(page.locator('html')).toHaveAttribute('lang', other);
    });

    test('"Start learning" opens the first lesson with a page; beside it the map is a plain link', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const start = page.locator('.hero [data-start-learning]');
      const map = page.locator('.hero').getByRole('link', { name: OPEN_MAP[locale], exact: true });
      if (!FIRST_OPEN) {
        await expect(start).toHaveCount(0);
        await expect(map).toHaveClass(/\batlas-button\b/);
        return;
      }

      // Same link as the roadmap map: an untranslated lesson keeps its /en/ URL (Starlight's fallback page).
      const view = lessonLinkView(FIRST_OPEN, locale);
      const note = view.state === 'untranslated' ? ` (${STRINGS[locale]['atlas.common.notTranslated']})` : '';
      await expect(start).toHaveCount(1);
      await expect(start).toHaveText(STRINGS[locale]['atlas.home.startLearning']!);
      await expect(start).toHaveAccessibleName(
        formatString(STRINGS[locale]['atlas.home.startLearningLabel']!, { lesson: FIRST_OPEN.title[locale] }) + note,
      );
      await expect(start).toHaveAttribute('href', `/${locale}/${FIRST_OPEN.id}/`);
      await expect(start).toHaveClass(/\batlas-button\b/);
      await expect(map).toHaveClass(/\bhero-map-link\b/);
      await expect(map).not.toHaveClass(/\batlas-button\b/);

      await start.click();
      await page.waitForURL(`**/${locale}/${FIRST_OPEN.id}/`);
      await expect(page.locator('h1#_top')).toHaveText(FIRST_OPEN.title[isTranslated(FIRST_OPEN, locale) ? locale : 'vi']);
    });

    test('the letter links each [label](lesson:<id>) to that lesson in this language', async ({ page }) => {
      const links = HOME.letter.paragraphs[locale].flatMap((paragraph) =>
        [...paragraph.matchAll(/\[([^\]]+)\]\(lesson:([^)]+)\)/g)].map(([, label, id]) => ({ label, id: id ?? '' })),
      );
      expect(links.length).toBeGreaterThan(0);
      await page.goto(`/${locale}/`);
      const seen = await page.locator('.letter .sheet-body a').evaluateAll((items) =>
        items.map((a) => ({ label: (a.textContent ?? '').trim(), href: a.getAttribute('href') })),
      );
      expect(seen).toEqual(links.map(({ label, id }) => ({ label, href: lessonLinkView(requireLesson(id), locale).href })));
      // No markup is left over as text.
      await expect(page.locator('.letter')).not.toContainText('](lesson:');
    });
  });
}

// Phones narrower than the mobile project: 320px (the narrowest common width) and 360px (a common Android
// width). Same height as the mobile project (800), so only the width differs from the 375px test above: the
// English labels are longer, and the two actions may wrap onto two rows.
for (const width of [320, 360]) {
  for (const locale of LOCALES) {
    const FIRST_OPEN = getFirstOpenLesson(locale);
    test(`at ${width}px (${locale}) the first screen still shows both hero actions and the other-language link`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile', 'the viewport is set here; one project is enough');
      test.skip(!FIRST_OPEN, 'no lesson has a page yet, so there is no "Start learning" button');
      const other: Locale = locale === 'vi' ? 'en' : 'vi';
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/${locale}/`);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

      const targets = {
        start: page.locator('.hero [data-start-learning]'),
        map: page.locator('.hero').getByRole('link', { name: OPEN_MAP[locale], exact: true }),
        language: page.locator(`.hero a[hreflang="${other}"]`),
      };
      const boxes = Object.fromEntries(
        await Promise.all(
          Object.entries(targets).map(async ([name, target]) => [name, await target.boundingBox()] as const),
        ),
      );
      const where = JSON.stringify(boxes);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      for (const [name, target] of Object.entries(targets)) {
        await expect(target, `${name} in the first ${width}×800 screen: ${where}`).toBeInViewport({ ratio: 1 });
      }
    });
  }
}

/** JS files in dist/_astro that contain React (e.g. the @astrojs/react client renderer). */
function reactChunksInDist(): string[] {
  const dir = fileURLToPath(new URL('../../dist/_astro/', import.meta.url));
  try {
    return readdirSync(dir)
      .filter((file) => file.endsWith('.js'))
      .filter((file) => /Symbol\.for\(["'`]react\./.test(readFileSync(dir + file, 'utf8')));
  } catch {
    return [];
  }
}

test('/vi/ loads no React and no Pyodide', async ({ page }) => {
  const requests: Request[] = [];
  page.on('request', (request) => requests.push(request));
  const reactScripts: string[] = [];
  page.on('response', async (response) => {
    if (response.request().resourceType() !== 'script') return;
    const body = await response.text().catch(() => '');
    if (/Symbol\.for\(["'`]react\./.test(body) || body.includes('react-dom')) reactScripts.push(response.url());
  });

  await page.goto('/vi/');
  await scrollThrough(page, { networkIdle: true });

  const urls = requests.map((request) => request.url());
  const reactChunks = reactChunksInDist();
  expect(urls.filter((url) => /pyodide/i.test(url))).toEqual([]);
  expect(urls.filter((url) => /react/i.test(url))).toEqual([]);
  expect(urls.filter((url) => reactChunks.some((chunk) => url.endsWith(`/_astro/${chunk}`)))).toEqual([]);
  expect(reactScripts).toEqual([]);
  await expect(page.locator('astro-island')).toHaveCount(0);
});

test('every <img> on /vi/ has alt text, except the decorative lesson background', async ({ page }) => {
  await page.goto('/vi/');
  const images = await page.locator('img').evaluateAll((items) =>
    items.map((img) => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      decorative: img.closest('.lesson-photo[aria-hidden="true"]') !== null,
    })),
  );
  expect(images.length).toBeGreaterThan(10);
  for (const image of images) {
    expect(image.alt, `missing alt: ${image.src}`).not.toBeNull();
    if (image.decorative) expect(image.alt, image.src ?? '').toBe('');
    else expect(image.alt!.trim(), `empty alt: ${image.src}`).not.toBe('');
  }
  expect(images.filter((image) => image.alt === '')).toHaveLength(1);
});

test.describe('hero plates', () => {
  async function currentPlate(page: Page): Promise<number[]> {
    return page.locator('[data-crossfade] > figure').evaluateAll((figures) =>
      figures.flatMap((figure, index) => (figure.classList.contains('is-current') ? [index] : [])),
    );
  }

  test('with prefers-reduced-motion: reduce, the first plate stays after 8 s', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/vi/');
    expect(await currentPlate(page)).toEqual([0]);
    await page.waitForTimeout(8_000);
    expect(await currentPlate(page)).toEqual([0]);
    await expect(page.locator('[data-crossfade] > figure').first()).not.toHaveAttribute('aria-hidden', 'true');
  });

  test('control: without reduced motion, wide screens crossfade and narrow ones do not', async ({ page }) => {
    // Proves the test above can fail: on wide screens the crossfade runs every 6.5 s when motion is
    // allowed. Below 64rem it is switched off on purpose (page weight), and the other plates never load.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/vi/');
    expect(await currentPlate(page)).toEqual([0]);
    await page.waitForTimeout(8_000);
    if ((page.viewportSize()?.width ?? 1280) >= 1024) {
      expect(await currentPlate(page)).toEqual([1]);
      await expect(page.locator('[data-crossfade] > figure').first()).toHaveAttribute('aria-hidden', 'true');
    } else {
      expect(await currentPlate(page)).toEqual([0]);
      await expect(page.locator('[data-crossfade] > figure.is-deferred')).toHaveCount(2);
    }
  });
});

test.describe('homepage CSS does not leak into other pages', () => {
  test('/vi/dev/components/ keeps its title and content padding', async ({ page }) => {
    await page.goto('/vi/dev/components/');
    await expect(page.locator('html')).not.toHaveAttribute('data-has-hero', /.*/);
    await expect(page.locator('html')).not.toHaveClass(/atlas-motion/);
    await expect(page.locator('.atlas-home')).toHaveCount(0);

    const title = page.locator('h1#_top');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Kiểm tra component');
    await expect(page.locator('.sl-markdown-content')).toBeVisible();

    const styles = await page.evaluate(() => {
      const panel = document.querySelector('.content-panel');
      const container = document.querySelector('.content-panel .sl-container');
      const header = document.querySelector('header.header');
      const panelStyle = panel ? getComputedStyle(panel) : undefined;
      return {
        panelTop: parseFloat(panelStyle?.paddingTop ?? '0'),
        panelLeft: parseFloat(panelStyle?.paddingLeft ?? '0'),
        containerMaxWidth: container ? getComputedStyle(container).maxWidth : 'missing',
        headerBorder: header ? getComputedStyle(header).borderBottomColor : 'missing',
      };
    });
    expect(styles.panelTop).toBeGreaterThanOrEqual(16);
    expect(styles.panelLeft).toBeGreaterThanOrEqual(16);
    expect(styles.containerMaxWidth).not.toBe('none');
    expect(styles.headerBorder).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('control: on /vi/ the same rules do apply', async ({ page }) => {
    await page.goto('/vi/');
    const panelPadding = await page
      .locator('.content-panel')
      .first()
      .evaluate((panel) => getComputedStyle(panel).paddingLeft);
    expect(panelPadding).toBe('0px');
  });
});

test.describe('homepage content without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every [data-reveal] block is visible and the default route is marked', async ({ page }) => {
    await page.goto('/vi/');
    const hidden = await page.locator('[data-reveal]').evaluateAll((items) =>
      items.filter((item) => getComputedStyle(item).opacity !== '1').map((item) => item.outerHTML.slice(0, 80)),
    );
    expect(hidden).toEqual([]);
    await expect(page.locator('[data-roadmap] [data-on-route]')).toHaveCount(8);
  });
});

test('every [data-reveal] block appears once the reader reaches it', async ({ page }) => {
  await page.goto('/vi/');
  const count = await page.locator('[data-reveal]').count();
  expect(count).toBeGreaterThan(10);
  for (let index = 0; index < count; index++) {
    await page.locator('[data-reveal]').nth(index).evaluate((item) => item.scrollIntoView({ block: 'center', inline: 'center' }));
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(1_500);
  const stuck = await page.locator('[data-reveal]').evaluateAll((items) =>
    items
      .filter((item) => !item.classList.contains('is-in') || getComputedStyle(item).opacity !== '1')
      .map((item) => item.outerHTML.slice(0, 80)),
  );
  expect(stuck).toEqual([]);
});

test('roadmap ids on the page are exactly the roadmap', async ({ page }) => {
  await page.goto('/en/');
  const ids = await page.locator('[data-roadmap] [data-lesson-id]').evaluateAll((items) =>
    items.map((item) => item.getAttribute('data-lesson-id')),
  );
  expect([...ids].sort()).toEqual(LESSONS.map((lesson) => lesson.id).sort());
  const options = await page.locator('[data-route-select] option').evaluateAll((items) =>
    items.map((item) => (item as HTMLOptionElement).value),
  );
  expect([...options].sort()).toEqual(LESSONS.map((lesson) => lesson.id).sort());
});
