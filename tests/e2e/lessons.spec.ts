import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { expect, test, type Locator } from '@playwright/test';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { LESSONS, LOCALES, PARTS, type Lesson, type Locale } from '../../src/data/roadmap';
import { formatString } from '../../src/i18n/format';
import rehypeKatexA11y from '../../src/lib/rehype-katex-a11y';
import { getPartIdOf, hasPage, isTranslated, requireLesson } from '../../src/lib/roadmap';
import { lessonShape, prose, splitMdx } from '../unit/fixtures/lesson-shape';
import { axNames, contentLocale, isNarrow, s, showPreferences } from './helpers';

// Lesson pages and every place that links to them: homepage map, Prerequisites, sidebar, sitemap.
// Expectations come from src/data/roadmap.ts (hasPage, isTranslated), so the same tests hold while every
// lesson is planned and once lessons are published. All URLs end with "/" (trailingSlash 'always').

// Starlight's own notice on a fallback page (@astrojs/starlight/dist/translations/{en,vi}.js).
const FALLBACK_NOTICE: Record<Locale, string> = {
  en: 'This content is not available in your language yet.',
  vi: 'Nội dung này hiện chưa có sẵn bằng ngôn ngữ của bạn.',
};
const LANGUAGE_LABEL: Record<Locale, string> = { vi: 'Tiếng Việt', en: 'English' };

const DOCS_DIR = fileURLToPath(new URL('../../src/content/docs/', import.meta.url));
const WITH_PAGE = LESSONS.filter(hasPage);
const pathOf = (locale: Locale, id: string) => `/${locale}/${id}/`;
const labelOf = (lesson: Lesson, locale: Locale) => (lesson.shortTitle ?? lesson.title)[locale];
const squash = (text: string | null) => (text === null ? null : text.replace(/\s+/g, ' ').trim());

function readSource(locale: Locale, id: string): string {
  const file = ['.mdx', '.md'].map((ext) => join(DOCS_DIR, locale, id + ext)).find((path) => existsSync(path));
  if (!file) throw new Error(`no file for ${locale}/${id}`);
  return readFileSync(file, 'utf8');
}

/**
 * Decision 30 (docs/mvp.md): hreflang names only the languages the lesson has a file in, plus x-default
 * (the vi page). Sorted [hreflang, path] pairs, so a duplicate link shows up too.
 */
function expectedAlternates(lesson: Lesson): [string, string][] {
  const pairs: [string, string][] = LOCALES.filter((locale) => isTranslated(lesson, locale)).map((locale) => [
    locale,
    pathOf(locale, lesson.id),
  ]);
  return [...pairs, ['x-default', pathOf('vi', lesson.id)] as [string, string]].sort();
}

/** Every lesson of a RoadmapMap: a link when it has a page, "(coming soon)" text otherwise; and the legend. */
async function expectMap(map: Locator, locale: Locale, lessons: readonly Lesson[]): Promise<void> {
  const seen = await map.locator('li[data-lesson-id]').evaluateAll((items) =>
    items.map((li) => ({
      id: li.getAttribute('data-lesson-id'),
      hrefs: [...li.querySelectorAll('a')].map((a) => a.getAttribute('href')),
      soon: li.querySelector('.is-soon')?.textContent ?? null,
      note: li.querySelector('.lesson-note')?.textContent ?? null,
    })),
  );
  expect(seen.map((item) => ({ ...item, soon: squash(item.soon), note: squash(item.note) }))).toEqual(
    lessons.map((lesson) => ({
      id: lesson.id,
      hrefs: hasPage(lesson) ? [pathOf(locale, lesson.id)] : [],
      soon: hasPage(lesson) ? null : `${labelOf(lesson, locale)} (${s(locale, 'common.comingSoon')})`,
      note: hasPage(lesson) && !isTranslated(lesson, locale) ? s(locale, 'common.notTranslated') : null,
    })),
  );

  // The legend speaks of the whole site: "no lesson is open yet" only while no lesson has a page.
  const legend = map.locator('.roadmap-legend');
  if (WITH_PAGE.length > 0) {
    await expect(legend.locator('.legend-open')).toHaveText(s(locale, 'roadmap.legendOpen'));
    await expect(legend.locator('.legend-soon')).toHaveText(s(locale, 'roadmap.legendSoon'));
  } else {
    await expect(legend.locator('.legend-open')).toHaveCount(0);
    await expect(legend.locator('.legend-soon')).toHaveText(s(locale, 'roadmap.legendNone'));
  }
}

/** A Prerequisites list: link and note of each lesson follow its status in the page's locale. */
async function expectPrerequisites(list: Locator, locale: Locale, ids: readonly string[]): Promise<void> {
  const seen = await list.locator('li').evaluateAll((items) =>
    items.map((li) => ({
      id: li.getAttribute('data-lesson-id'),
      href: li.querySelector('a')?.getAttribute('href') ?? null,
      title: li.querySelector('.atlas-prereq-title')?.textContent ?? null,
      note: li.querySelector('.atlas-prereq-note')?.textContent ?? null,
    })),
  );
  expect(seen.map((item) => ({ ...item, title: squash(item.title), note: squash(item.note) }))).toEqual(
    ids.map((id) => {
      const lesson = requireLesson(id);
      const note = !hasPage(lesson)
        ? `(${s(locale, 'common.comingSoon')})`
        : isTranslated(lesson, locale)
          ? null
          : `(${s(locale, 'common.notTranslated')})`;
      return { id, href: hasPage(lesson) ? pathOf(locale, id) : null, title: lesson.title[locale], note };
    }),
  );
}

test('every lesson URL answers 200 exactly when the lesson has a vi page, in vi and in en', async ({ request }) => {
  const checks = LESSONS.flatMap((lesson) =>
    LOCALES.map((locale) => ({ path: pathOf(locale, lesson.id), expected: hasPage(lesson) ? 200 : 404 })),
  );
  const results = await Promise.all(
    checks.map(async (check) => ({ ...check, status: (await request.get(check.path, { maxRedirects: 0 })).status() })),
  );
  expect(results.filter((result) => result.status !== result.expected)).toEqual([]);
  // Control: the server does answer 200 for a page that exists.
  expect((await request.get('/vi/dev/components/')).status()).toBe(200);
});

test('the sitemap lists each lesson page that has its own file, and neither a planned lesson nor a fallback page', async ({
  request,
}) => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  // Each <url>: its <loc>, and the hreflang alternates @astrojs/sitemap writes as <xhtml:link>.
  const urls = new Map(
    [...xml.matchAll(/<url>(.*?)<\/url>/gs)].map((match) => {
      const block = match[1] ?? '';
      const loc = new URL(/<loc>([^<]+)<\/loc>/.exec(block)?.[1] ?? '').pathname;
      const links = [...block.matchAll(/<xhtml:link [^>]*hreflang="([^"]+)" href="([^"]+)"/g)].map(
        (link) => `${link[1]} ${new URL(link[2] ?? '').pathname}`,
      );
      return [loc, links.sort()] as const;
    }),
  );
  expect(urls.size, 'the sitemap was read').toBeGreaterThan(0);
  expect(urls.has('/vi/'), 'control: the vi homepage is listed').toBe(true);
  const wrong = LESSONS.flatMap((lesson) =>
    LOCALES.flatMap((locale) => {
      const path = pathOf(locale, lesson.id);
      if (!hasPage(lesson)) return urls.has(path) ? [`${path} listed, but planned`] : [];
      // Decision 30: a fallback page (/en/<lesson>/ of a lesson with no en file) is out of the sitemap.
      if (!isTranslated(lesson, locale)) return urls.has(path) ? [`${path} listed, but it is a fallback page`] : [];
      if (!urls.has(path)) return [`${path} missing`];
      // Its alternates: the languages the lesson has a file in, so no link to a fallback page.
      const expected = LOCALES.filter((other) => isTranslated(lesson, other))
        .map((other) => `${other} ${pathOf(other, lesson.id)}`)
        .sort();
      const links = urls.get(path) ?? [];
      // A lesson in one language only has no alternate at all (@astrojs/sitemap writes none for a single page).
      return JSON.stringify(links) === JSON.stringify(expected.length > 1 ? expected : [])
        ? []
        : [`${path} alternates ${JSON.stringify(links)}`];
    }),
  );
  expect(wrong).toEqual([]);
  // Nothing in the whole sitemap points to a fallback page, not even as an alternate.
  const fallbacks = WITH_PAGE.flatMap((lesson) =>
    LOCALES.filter((locale) => !isTranslated(lesson, locale)).map((locale) => pathOf(locale, lesson.id)),
  );
  const named = [...urls.values()].flat().map((link) => link.split(' ')[1]);
  expect(named.filter((path) => fallbacks.includes(path ?? ''))).toEqual([]);
});

for (const locale of LOCALES) {
  test.describe(`links to lessons in /${locale}/`, () => {
    test('homepage map: a link for each lesson with a page, "coming soon" for the others, and the legend', async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator('[data-roadmap]')).toHaveCount(1);
      await expectMap(page.locator('[data-roadmap]'), locale, LESSONS);
    });

    test('demo page: the ml-only map follows the same rules', async ({ page }) => {
      await page.goto(pathOf(locale, 'dev/components'));
      await expectMap(
        page.locator('[data-roadmap]'),
        locale,
        LESSONS.filter((lesson) => getPartIdOf(lesson.id) === 'ml'),
      );
    });

    test('demo page: Prerequisites links lessons with a page and marks the others "coming soon"', async ({ page }) => {
      // The ids written in the demo page, e.g. ['ml/linear-regression', 'math/calculus'].
      const list = /<Prerequisites ids=\{\[([^\]]+)\]\}/.exec(readSource(locale, 'dev/components'))?.[1] ?? '';
      const ids = [...list.matchAll(/'([^']+)'/g)].map((match) => match[1] ?? '');
      expect(ids.length, 'ids read from the demo page').toBeGreaterThan(0);
      await page.goto(pathOf(locale, 'dev/components'));
      await expect(page.locator('[data-prereq]')).toHaveCount(1);
      await expectPrerequisites(page.locator('[data-prereq]'), locale, ids);
    });

    test('sidebar of a doc page: exactly the lessons with a page, grouped by part, in roadmap order', async ({ page }) => {
      await page.goto(pathOf(locale, 'dev/components'));
      const sidebar = page.locator('#starlight__sidebar ul.top-level');
      await expect(sidebar).toHaveCount(1);
      const links = await sidebar.locator('a').evaluateAll((items) =>
        items.map((a) => ({ href: a.getAttribute('href'), text: (a.textContent ?? '').replace(/\s+/g, ' ').trim() })),
      );
      expect(links).toEqual(WITH_PAGE.map((lesson) => ({ href: pathOf(locale, lesson.id), text: labelOf(lesson, locale) })));

      const groups = await sidebar
        .locator(':scope > li > details > summary .group-label')
        .evaluateAll((items) => items.map((item) => (item.textContent ?? '').trim()));
      expect(groups).toEqual(
        PARTS.filter((part) => WITH_PAGE.some((lesson) => getPartIdOf(lesson.id) === part.id)).map(
          (part) => part.title[locale],
        ),
      );
    });
  });
}

if (WITH_PAGE.length === 0) {
  test.skip('lesson pages: no lesson has a vi page yet, so there is no lesson page to check', () => {});
}

for (const lesson of WITH_PAGE) {
  for (const locale of LOCALES) {
    const path = pathOf(locale, lesson.id);
    const other: Locale = locale === 'vi' ? 'en' : 'vi';
    // An en page without its own file is Starlight's fallback: it shows the vi file.
    const translated = isTranslated(lesson, locale);
    // The language of the text shown: this locale's file, or the vi file on a fallback page.
    const textLocale = contentLocale(lesson, locale);
    const source = readSource(textLocale, lesson.id);
    const shape = lessonShape(source);
    const body = prose(splitMdx(source).body);
    const index = WITH_PAGE.indexOf(lesson);

    test.describe(`lesson page ${path}`, () => {
      test(`language, title, fallback notice, hreflang, canonical, and ${translated ? 'no noindex' : 'noindex (fallback page)'}`, async ({
        page,
      }) => {
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('h1#_top')).toHaveText(lesson.title[textLocale]);
        await expect(page.getByText(FALLBACK_NOTICE[locale], { exact: true })).toHaveCount(translated ? 0 : 1);
        await expect(page.getByText(FALLBACK_NOTICE[other], { exact: true })).toHaveCount(0);

        // Decision 30: the same alternates on both pages of a lesson; a page with no file is never named.
        const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((links) =>
          links.map((link) => [link.getAttribute('hreflang'), new URL(link.getAttribute('href') ?? '').pathname]),
        );
        expect(alternates.sort()).toEqual(expectedAlternates(lesson));
        await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
        expect(new URL((await page.locator('link[rel="canonical"]').getAttribute('href')) ?? '').pathname).toBe(path);
        // Only a fallback page is noindex, with exactly one robots tag.
        await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(translated ? 0 : 1);
        if (!translated) await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
      });

      test('sidebar marks this lesson as current; Previous and Next follow the roadmap', async ({ page }) => {
        await page.goto(path);
        const current = page.locator('#starlight__sidebar a[aria-current="page"]');
        await expect(current).toHaveCount(1);
        await expect(current).toHaveAttribute('href', path);
        await expect(current).toHaveText(labelOf(lesson, locale));

        const [prev, next] = [WITH_PAGE[index - 1], WITH_PAGE[index + 1]];
        const prevLink = page.locator('.pagination-links a[rel="prev"]');
        const nextLink = page.locator('.pagination-links a[rel="next"]');
        await expect(prevLink).toHaveCount(prev ? 1 : 0);
        await expect(nextLink).toHaveCount(next ? 1 : 0);
        if (prev) await expect(prevLink).toHaveAttribute('href', pathOf(locale, prev.id));
        if (next) await expect(nextLink).toHaveAttribute('href', pathOf(locale, next.id));
      });

      test('formulas are rendered by KaTeX, with no raw TeX left', async ({ page }) => {
        test.skip(!shape.hasMath, 'the lesson has no formula');
        await page.goto(path);
        const content = page.locator('.sl-markdown-content');
        expect(await content.locator('.katex').count()).toBeGreaterThan(0);
        expect(await content.locator('.katex-display').count()).toBeGreaterThanOrEqual(Math.floor(shape.displayMath));
        const text = await content.evaluate((root) => {
          const copy = root.cloneNode(true) as HTMLElement;
          for (const el of copy.querySelectorAll('pre, code, .katex, astro-island, script, style')) el.remove();
          return copy.textContent ?? '';
        });
        expect(text).not.toMatch(/\$\$|\$\\[a-zA-Z]/);
      });

      test('display formulas are named groups: the word "formula" in the language of the content, plus the TeX', async ({
        page,
      }) => {
        test.skip(shape.displayMath < 1, 'the lesson has no display formula');
        await page.goto(path);
        // A fallback page shows the vi file, so its formulas are named in Vietnamese, like its <main lang="vi">.
        await expect(page.locator('main')).toHaveAttribute('lang', textLocale);
        const formulas = await page.locator('.sl-markdown-content .katex-display').evaluateAll((items) =>
          items.map((el) => ({
            role: el.getAttribute('role'),
            label: el.getAttribute('aria-label'),
            tex: (el.querySelector('annotation[encoding="application/x-tex"]')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
          })),
        );
        expect(formulas.length).toBeGreaterThanOrEqual(Math.floor(shape.displayMath));
        for (const formula of formulas) {
          expect(formula.tex, 'TeX source in the MathML').not.toBe('');
          expect(formula).toEqual({
            role: 'group',
            label: s(textLocale, 'common.formulaLabel').replace('{{tex}}', formula.tex),
            tex: formula.tex,
          });
        }
        // Inline formulas (in the text, the Quiz, a VIZ) keep no role or label of their own.
        await expect(page.locator('.katex[role], .katex[aria-label]')).toHaveCount(0);
      });

      test('at 375px, a display formula that scrolls sideways has a name in Chrome\'s accessibility tree', async ({
        page,
      }) => {
        test.skip(!isNarrow(page), 'mobile project (375px) only');
        test.skip(shape.displayMath < 1, 'the lesson has no display formula');
        await page.goto(path);
        const selector = '.sl-markdown-content .katex-display';
        const blocks = await page.locator(selector).evaluateAll((items) =>
          items.map((el) => ({
            scrolls: el.scrollWidth > el.clientWidth + 1,
            tex: (el.querySelector('annotation[encoding="application/x-tex"]')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
          })),
        );
        test.skip(!blocks.some((block) => block.scrolls), 'no display formula is wider than the column at 375px');

        const names = await axNames(page, selector);
        expect(names).toHaveLength(blocks.length);
        const wide = blocks.flatMap((block, i) => (block.scrolls ? [{ tex: block.tex, node: names[i] }] : []));
        for (const { tex, node } of wide) {
          expect(tex, 'TeX source in the MathML').not.toBe('');
          expect(node).toEqual({ role: 'group', name: formatString(s(textLocale, 'common.formulaLabel'), { tex }), ignored: false });
        }
      });

      test('Prerequisites lists the prerequisites from the roadmap, with links in this language', async ({ page }) => {
        test.skip(!/<Prerequisites\s*\/>/.test(body), 'no <Prerequisites /> without ids on this page');
        await page.goto(path);
        if (lesson.prerequisites.length === 0) {
          await expect(page.locator('.atlas-prereq-empty')).toHaveText(s(locale, 'prereq.none'));
        } else {
          await expect(page.locator('[data-prereq]')).toHaveCount(1);
          await expectPrerequisites(page.locator('[data-prereq]'), locale, lesson.prerequisites);
        }
      });

      test('every lesson component written in the file is on the page', async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('.atlas-quiz')).toHaveCount(shape.components.Quiz ?? 0);
        await expect(page.locator('.atlas-runner')).toHaveCount(shape.components.PythonRunner ?? 0);
        await expect(page.locator('atlas-lesson-progress')).toHaveCount(shape.components.LessonProgress ?? 0);
        if (/<LessonProgress\s*\/>/.test(body)) {
          await expect(page.locator(`atlas-lesson-progress[data-lesson-id="${lesson.id}"]`)).toHaveCount(1);
        }
      });

      test('the language select leads to the same lesson in the other language', async ({ page }) => {
        await page.goto(path);
        await showPreferences(page);
        await page.locator('starlight-lang-select select').filter({ visible: true }).selectOption({ label: LANGUAGE_LABEL[other] });
        await page.waitForURL(`**${pathOf(other, lesson.id)}`);
        await expect(page.locator('html')).toHaveAttribute('lang', other);
      });

      test('the page does not scroll sideways', async ({ page }) => {
        await page.goto(path);
        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
      });
    });
  }
}

// A display formula far wider than a 375px column, made by the site's own Markdown steps (remark-math,
// rehype-katex, then rehype-katex-a11y with the labels of the i18n files, as in astro.config.ts) and put
// into a built page, so the site's CSS applies. The lessons may or may not have a formula that wide (the
// per-lesson test above skips then); this one always is, whatever the lessons say.
const WIDE_TEX = [...Array.from({ length: 16 }, (_, i) => `w_{${i + 1}} x_{${i + 1}}`), 'b'].join(' + ');

for (const locale of LOCALES) {
  test(`/${locale}/ at 375px: a display formula wider than the column scrolls in its own box, and Chrome names it`, async ({
    page,
  }) => {
    test.skip(!isNarrow(page), 'mobile project (375px) only');
    const processor = await createMarkdownProcessor({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeKatex,
        [rehypeKatexA11y, { labels: { vi: s('vi', 'common.formulaLabel'), en: s('en', 'common.formulaLabel') } }],
      ],
    });
    // As if it were a lesson file of this locale: the plugin reads the language from the path.
    const { code } = await processor.render(['$$', WIDE_TEX, '$$', ''].join('\n'), {
      fileURL: pathToFileURL(join(DOCS_DIR, locale, 'ml', 'wide-formula-fixture.md')),
    });

    // The demo page is always built and has the lesson column; the fixture goes at its top, at runtime only.
    await page.goto(pathOf(locale, 'dev/components'));
    await page.locator('.sl-markdown-content').evaluate((root, html) => {
      const box = document.createElement('div');
      box.id = 'atlas-wide-formula';
      box.innerHTML = html;
      root.prepend(box);
    }, code);
    const selector = '#atlas-wide-formula .katex-display';
    await expect(page.locator(selector)).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);

    const size = await page.locator(selector).evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      page: document.documentElement.scrollWidth,
    }));
    expect(size.scrollWidth, 'the formula is wider than its box').toBeGreaterThan(size.clientWidth + 1);
    expect(size.page, 'the page itself does not scroll sideways').toBeLessThanOrEqual(375);

    expect(await axNames(page, selector)).toEqual([
      { role: 'group', name: formatString(s(locale, 'common.formulaLabel'), { tex: WIDE_TEX }), ignored: false },
    ]);
  });
}
