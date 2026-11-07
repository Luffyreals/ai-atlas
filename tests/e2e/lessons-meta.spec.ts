import { expect, test, type Locator } from '@playwright/test';
import { LESSONS, LOCALES, PARTS, type Lesson, type Locale } from '../../src/data/roadmap';
import { getPartIdOf, hasPage, isTranslated, requireLesson } from '../../src/lib/roadmap';
import { lessonShape, prose, splitMdx } from '../unit/fixtures/lesson-shape';
import { localCodeTags } from '../unit/fixtures/local-code-tags';
import { contentLangAttr, contentLocale, PYODIDE_URL, pyodideChunks, s, scrollThrough, showPreferences } from './helpers';
import { pathOf, readSource, WITH_PAGE } from './lesson-pages';

// Lesson tests that do not depend on the viewport: meta tags, sitemap, sidebar and Previous/Next, KaTeX,
// formula names, Prerequisites, component count, language select; and the links to lessons from the homepage
// map, the demo page and the sidebar. They read the DOM, not the layout, so they run in the desktop project
// only (playwright.config.ts: the mobile project ignores *-meta.spec.ts; docs/architecture/llm-lessons.md
// section 2.10, E1). Tests that depend on the viewport (static figures, no sideways scroll, wide formulas at
// 375px) stay in lessons.spec.ts and run in both projects. A test that reads the layout does not belong here.
// Expectations come from src/data/roadmap.ts (hasPage, isTranslated), so the same tests hold while every
// lesson is planned and once lessons are published. All URLs end with "/" (trailingSlash 'always').

// Starlight's own notice on a fallback page (@astrojs/starlight/dist/translations/{en,vi}.js).
const FALLBACK_NOTICE: Record<Locale, string> = {
  en: 'This content is not available in your language yet.',
  vi: 'Nội dung này hiện chưa có sẵn bằng ngôn ngữ của bạn.',
};
const LANGUAGE_LABEL: Record<Locale, string> = { vi: 'Tiếng Việt', en: 'English' };

const labelOf = (lesson: Lesson, locale: Locale) => (lesson.shortTitle ?? lesson.title)[locale];
const squash = (text: string | null) => (text === null ? null : text.replace(/\s+/g, ' ').trim());

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
      test(`language, title, fallback notice, hreflang, canonical, ${translated ? 'no noindex, searchable' : 'noindex and out of search (fallback page)'}`, async ({
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
        // Decision 33: a fallback page is left out of the search index (no data-pagefind-body anywhere).
        await expect(page.locator('[data-pagefind-body]')).toHaveCount(translated ? 1 : 0);
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

        // LocalCode (docs/architecture/llm-lessons.md 4.5): the labels follow the page's language; the code, the
        // title and the sample output come from the file shown, so on a fallback page they keep lang="vi".
        const local = page.locator('.atlas-local');
        await expect(local).toHaveCount(shape.components.LocalCode ?? 0);
        const tags = localCodeTags(source);
        expect(tags, 'LocalCode tags read from the file').toHaveLength(shape.components.LocalCode ?? 0);
        const contentLang = contentLangAttr(lesson, locale);
        for (const [i, tag] of tags.entries()) {
          const block = local.nth(i);
          await expect(block).toHaveAttribute('lang', locale);
          await expect(block.locator('.atlas-local-badge')).toHaveText(s(locale, 'localCode.badge'));
          if (contentLang) await expect(block.locator('.atlas-local-code')).toHaveAttribute('lang', contentLang);
          else await expect(block.locator('.atlas-local-code')).not.toHaveAttribute('lang', /./);
          await expect(block.locator('.atlas-local-output'), `LocalCode ${i + 1}: sample output`).toHaveCount(
            tag.hasOutput ? 1 : 0,
          );
          if (tag.hasOutput) {
            await expect(block.locator('.atlas-local-output-note')).toHaveText(
              s(locale, tag.sampleVaries ? 'localCode.sampleNote' : 'localCode.sampleNoteFixed'),
            );
            if (contentLang) await expect(block.locator('.atlas-local-output > div')).toHaveAttribute('lang', contentLang);
          }
        }
      });

      test('the language select leads to the same lesson in the other language', async ({ page }) => {
        await page.goto(path);
        await showPreferences(page);
        await page.locator('starlight-lang-select select').filter({ visible: true }).selectOption({ label: LANGUAGE_LABEL[other] });
        await page.waitForURL(`**${pathOf(other, lesson.id)}`);
        await expect(page.locator('html')).toHaveAttribute('lang', other);
      });
    });
  }
}

// docs/architecture/launch.md, section 8 item 4: on every lesson that has a PythonRunner, opening the page and
// scrolling through it (so every island hydrates) sends no request to Pyodide: it loads on the first Run only.
const WITH_RUNNER: [Locale, Lesson][] = WITH_PAGE.flatMap((lesson) =>
  LOCALES.filter((locale) => isTranslated(lesson, locale))
    .filter((locale) => /<PythonRunner\b/.test(prose(splitMdx(readSource(locale, lesson.id)).body)))
    .map((locale) => [locale, lesson] as [Locale, Lesson]),
);

test('some lesson has a PythonRunner (the test below is not empty)', () => {
  expect(WITH_RUNNER.length).toBeGreaterThan(0);
});

for (const [locale, lesson] of WITH_RUNNER) {
  const path = pathOf(locale, lesson.id);
  test(`${path}: opening and scrolling the page loads no Pyodide (CDN, worker or client chunk)`, async ({ page }) => {
    test.slow(); // scrolls a long page and waits for the network
    const urls: string[] = [];
    page.on('request', (request) => urls.push(request.url()));
    page.on('worker', (worker) => urls.push(`worker: ${worker.url()}`));
    await page.goto(path);
    await scrollThrough(page, { hydrated: true, networkIdle: true });

    const chunks = pyodideChunks();
    expect(chunks.length, 'worker and client.ts chunks in dist/_astro').toBeGreaterThanOrEqual(2);
    expect(urls.filter((url) => PYODIDE_URL.test(url) || /pyodide/i.test(url))).toEqual([]);
    expect(urls.filter((url) => chunks.some((chunk) => url.endsWith(`/_astro/${chunk}`)))).toEqual([]);
    expect(urls.filter((url) => url.startsWith('worker:'))).toEqual([]);
    // Control: the runner islands did load, so the page was really exercised.
    await expect(page.locator('.atlas-runner').first()).toBeVisible();
    expect(urls.some((url) => /PythonRunnerIsland\.[\w-]+\.js$/.test(url))).toBe(true);
  });
}
