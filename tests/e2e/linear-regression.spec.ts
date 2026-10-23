import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { APARTMENTS } from '../../src/data/datasets/apartments';
import { LOCALES, type Locale } from '../../src/data/roadmap';
import { formatString } from '../../src/i18n/format';
import { formatNumber } from '../../src/lib/viz/format';
import { hasPage, requireLesson } from '../../src/lib/roadmap';
import { splitMdx } from '../unit/fixtures/lesson-shape';
import { axNames, contentLangAttr, contentLocale, isNarrow, s, scrollThrough } from './helpers';

// The lesson ml/linear-regression: what is particular to it. While it has no en file, /en/ is Starlight's
// fallback (the vi file with en strings); the language of the content comes from roadmap.ts (helpers.ts),
// so these tests hold once it is translated. The checks shared by every lesson page are in lessons.spec.ts,
// those of its VIZ in viz.spec.ts and linear-fit-viz.spec.ts. Runs without the network: nothing here may
// download Pyodide. All URLs end with "/" (trailingSlash 'always').

const ID = 'ml/linear-regression';
const LESSON = requireLesson(ID);
const lessonPath = (locale: Locale) => `/${locale}/${ID}/`;

// The quiz of the lesson: answer index of each question, from the frontmatter of the file each URL shows
// (the vi file on /en/ until the lesson is translated).
const quizOf = (locale: Locale) => {
  const file = new URL(`../../src/content/docs/${contentLocale(LESSON, locale)}/${ID}.mdx`, import.meta.url);
  return (splitMdx(readFileSync(fileURLToPath(file), 'utf8')).data.quiz ?? []) as { answer: number; options: string[] }[];
};

/** Presses Tab until `target` has focus (at most `max` times), then checks it. */
async function tabTo(page: Page, target: Locator, max = 8): Promise<void> {
  for (let i = 0; i < max && !(await target.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}

for (const locale of LOCALES) {
  test.describe(`lesson ${lessonPath(locale)}`, () => {
    test('Prerequisites: a lesson that is not written yet says "coming soon" and has no link', async ({ page }) => {
      const soon = LESSON.prerequisites.filter((id) => !hasPage(requireLesson(id)));
      test.skip(soon.length === 0, 'every prerequisite has a page (lessons.spec.ts checks their links)');
      await page.goto(lessonPath(locale));
      const list = page.locator('[data-prereq]');
      await expect(list).toHaveCount(1);
      for (const id of soon) {
        const item = list.locator(`li[data-lesson-id="${id}"]`);
        await expect(item).toHaveCount(1);
        await expect(item.locator('a, [href], [tabindex]')).toHaveCount(0);
        await expect(item.locator('.atlas-prereq-title')).toHaveText(requireLesson(id).title[locale]);
        await expect(item.locator('.atlas-prereq-note')).toHaveText(`(${s(locale, 'common.comingSoon')})`);
      }
      // Tab never stops inside an item without a page.
      const stops = await list.evaluate((el) => [...el.querySelectorAll('a[href], button, input')].length);
      expect(stops).toBe(LESSON.prerequisites.length - soon.length);
    });

    test('the root of every component has the page language; on the en fallback the lesson text keeps vi', async ({
      page,
    }) => {
      // WCAG 3.1.2: on /en/ the <main> of the fallback page is lang="vi" (the vi file), but the component
      // strings are English.
      await page.goto(lessonPath(locale));
      await scrollThrough(page, { hydrated: true }); // every island has hydrated: the attributes must survive it
      const roots = {
        Prerequisites: page.locator('[data-prereq]'),
        DatasetTable: page.getByRole('table', { name: APARTMENTS.caption[locale] }),
        LinearFitViz: page.locator('.atlas-viz'),
        PythonRunner: page.locator('.atlas-runner'),
        Quiz: page.locator('.atlas-quiz'),
        LessonProgress: page.locator('atlas-lesson-progress'),
      };
      for (const [name, root] of Object.entries(roots)) {
        const langs = await root.evaluateAll((items) => items.map((item) => item.getAttribute('lang')));
        expect(langs.length, name).toBeGreaterThan(0);
        expect(langs, name).toEqual(langs.map(() => locale));
      }

      // The words that come from the lesson file are marked with its language on a fallback page (the vi
      // file on /en/), and inherit the page's language where the page has its own file.
      const quiz = quizOf(locale);
      const fromFile = await page
        .locator(
          '.atlas-runner-title, .atlas-runner-static, .atlas-quiz-prompt, .atlas-quiz-option-text, .atlas-quiz input[type="radio"]',
        )
        .evaluateAll((items) => items.map((item) => item.getAttribute('lang')));
      expect(fromFile.length).toBeGreaterThan(quiz.length);
      expect([...new Set(fromFile)]).toEqual([contentLangAttr(LESSON, locale)]);
      // The strings inside keep the page's language: nothing between them and the root sets another one.
      // (Not the copy button of Expressive Code: it sits in the code block, which, like every other code block
      // of the page, is in the file's language.)
      const buttons = page.locator('.atlas-quiz button, .atlas-runner-body button, .atlas-viz button');
      expect(await buttons.count()).toBeGreaterThan(0);
      const buttonLangs = await buttons.evaluateAll((items) =>
        items.map((item) => item.closest('[lang]')?.getAttribute('lang') ?? null),
      );
      expect([...new Set(buttonLangs)]).toEqual([locale]);
    });

    test('opening the page and scrolling through it sends no request to Pyodide', async ({ page }) => {
      // Scrolls the whole page: on a loaded machine this took 25 s once, against about 2 s normally.
      test.slow();
      const urls: string[] = [];
      page.on('request', (request) => urls.push(request.url()));
      page.on('worker', (worker) => urls.push(`worker: ${worker.url()}`));
      await page.goto(lessonPath(locale));
      await scrollThrough(page, { hydrated: true });
      await page.waitForLoadState('networkidle');
      expect(urls.filter((url) => /pyodide/i.test(url))).toEqual([]);
      expect(urls.filter((url) => url.startsWith('worker:'))).toEqual([]);
      // Control: the three runners did hydrate, so their code was loaded and could have asked for Pyodide.
      await expect(page.locator('.atlas-runner')).toHaveCount(3);
      expect(urls.some((url) => /PythonRunnerIsland\.[\w-]+\.js$/.test(url))).toBe(true);
    });

    test('the quiz has 4 questions and works with the keyboard only', async ({ page }) => {
      const QUIZ = quizOf(locale);
      expect(QUIZ).toHaveLength(4);
      await page.goto(lessonPath(locale));
      const quiz = page.locator('.atlas-quiz');
      await expect(quiz).toHaveCount(1);
      const question = (n: number) =>
        quiz.getByRole('group', {
          name: new RegExp(`^${formatString(s(locale, 'quiz.question'), { n, total: QUIZ.length })}`),
        });
      await expect(quiz.getByRole('group')).toHaveCount(4);
      const check = s(locale, 'quiz.check');

      // Focus on the first answer while the quiz is still build HTML, as a reader tabbing down the page.
      // Astro drops `ssr` before React commits; the island then blurs and focuses that answer again
      // (decision 16): wait for that, so no key is pressed half-way through hydration.
      await expect(quiz.locator('astro-island[ssr]')).toHaveCount(1);
      await question(1).getByRole('radio').first().evaluate((radio) => {
        const seen = { blurred: false, refocused: false };
        (window as unknown as { atlasRefocus: typeof seen }).atlasRefocus = seen;
        radio.addEventListener('blur', () => (seen.blurred = true));
        radio.addEventListener('focus', () => (seen.refocused = seen.blurred));
        (radio as HTMLInputElement).focus({ preventScroll: true });
      });
      await quiz.scrollIntoViewIfNeeded();
      await expect(quiz.locator('astro-island:not([ssr])')).toHaveCount(1);
      await page.waitForFunction(() => (window as unknown as { atlasRefocus: { refocused: boolean } }).atlasRefocus.refocused);

      // The last question answered wrong first, then retried: the score must count the retry.
      for (const [i, { answer, options }] of QUIZ.entries()) {
        const group = question(i + 1);
        await expect(group.getByRole('radio')).toHaveCount(options.length);
        const pick = i === QUIZ.length - 1 ? (answer + 1) % options.length : answer;
        await tabTo(page, group.getByRole('radio').first());
        if (pick === 0) await page.keyboard.press('Space');
        for (let k = 0; k < pick; k++) await page.keyboard.press('ArrowDown');
        await expect(group.getByRole('radio').nth(pick)).toBeChecked();
        await tabTo(page, group.getByRole('button', { name: check }));
        await page.keyboard.press('Enter');
        const feedback = group.locator('[aria-live="polite"]');
        await expect(feedback).toContainText(s(locale, pick === answer ? 'quiz.correct' : 'quiz.incorrect'));
        await expect(group.locator('.atlas-quiz-explanation')).toBeVisible();
      }
      const score = quiz.locator('.atlas-quiz-score');
      await expect(score).toHaveText(formatString(s(locale, 'quiz.score'), { correct: 3, total: 4 }));

      const last = question(4);
      await expect(last.getByRole('button', { name: s(locale, 'quiz.retry') })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(last.getByRole('radio').first()).toBeFocused();
      const answer = QUIZ[3]!.answer;
      if (answer === 0) await page.keyboard.press('Space');
      for (let k = 0; k < answer; k++) await page.keyboard.press('ArrowDown');
      await expect(last.getByRole('radio').nth(answer)).toBeChecked();
      await tabTo(page, last.getByRole('button', { name: check }));
      await page.keyboard.press('Enter');
      await expect(score).toHaveText(formatString(s(locale, 'quiz.score'), { correct: 4, total: 4 }));
    });

    test('in Chrome every display formula is a named group, also the ones that do not scroll', async ({ page }) => {
      await page.goto(lessonPath(locale));
      const selector = '.sl-markdown-content .katex-display';
      const count = await page.locator(selector).count();
      expect(count).toBeGreaterThan(5);
      const nodes = await axNames(page, selector);
      expect(nodes).toHaveLength(count);
      // In the language of the file shown: vi on the en fallback.
      const prefix = s(contentLocale(LESSON, locale), 'common.formulaLabel').replace('{{tex}}', '');
      const bad = nodes.filter((node) => node.ignored || node.role !== 'group' || !node.name.startsWith(prefix) || node.name.length <= prefix.length + 1);
      expect(bad).toEqual([]);
    });

    test('the apartment table has the 10 rows of apartments.ts, numbers right-aligned', async ({ page }) => {
      await page.goto(lessonPath(locale));
      const table = page.getByRole('table', { name: APARTMENTS.caption[locale] });
      await expect(table).toHaveCount(1);
      const header = (column: typeof APARTMENTS.x | typeof APARTMENTS.y) => `${column.name[locale]} (${column.unit[locale]})`;
      await expect(table.getByRole('columnheader')).toHaveText([header(APARTMENTS.x), header(APARTMENTS.y)]);
      const rows = await table.locator('tbody tr').evaluateAll((trs) =>
        trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => ({ text: td.textContent, align: getComputedStyle(td).textAlign }))),
      );
      expect(rows).toHaveLength(10);
      expect(rows.map((row) => row.map((cell) => cell.text))).toEqual(
        APARTMENTS.rows.map(([x, y]) => [formatNumber(x, APARTMENTS.x.digits), formatNumber(y, APARTMENTS.y.digits)]),
      );
      // A decimal point and a fixed decimal: 12.0, not 12 or 12,0.
      expect(rows[6]?.map((cell) => cell.text)).toEqual(['60', '12.0']);
      for (const cell of rows.flat()) expect(cell.align).toMatch(/right$/);
    });

    for (const scheme of ['light', 'dark'] as const) {
      test(`at 375px in ${scheme} mode the page never scrolls sideways, with every island open`, async ({ page }) => {
        test.skip(!isNarrow(page), 'mobile project (375px) only');
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(lessonPath(locale));
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        const width = () => page.evaluate(() => document.documentElement.scrollWidth);
        expect(await width()).toBeLessThanOrEqual(375);
        await scrollThrough(page, { hydrated: true });
        expect(await width()).toBeLessThanOrEqual(375);

        // The editors of the runners open, the best line of the VIZ on, every question graded.
        for (const runner of await page.locator('.atlas-runner').all()) {
          await runner.getByRole('button', { name: s(locale, 'runner.edit') }).click();
        }
        await page.locator('.atlas-viz').getByRole('button', { name: s(locale, 'vizLinearFit.showBest') }).click();
        for (const group of await page.locator('.atlas-quiz').getByRole('group').all()) {
          await group.getByRole('radio').first().check();
          await group.getByRole('button', { name: s(locale, 'quiz.check') }).click();
        }
        await expect(page.locator('.atlas-quiz-score')).toBeVisible();
        expect(await width()).toBeLessThanOrEqual(375);
      });
    }
  });
}
