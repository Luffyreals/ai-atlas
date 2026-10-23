import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Locator, type Page } from '@playwright/test';
import { getLessonsByPart } from '../../src/lib/roadmap';
import { LESSONS } from '../../src/data/roadmap';

// M1 components on the demo page (docs/architecture/components.md, plan row M1-7). Runs in CI, no network:
// nothing here may download Pyodide. All URLs end with "/" (trailingSlash 'always').

const LOCALES = ['vi', 'en'] as const;
type Locale = (typeof LOCALES)[number];
const readStrings = (locale: Locale): Record<string, string> =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`../../src/content/i18n/${locale}.json`, import.meta.url)), 'utf8'));
const STRINGS: Record<Locale, Record<string, string>> = { vi: readStrings('vi'), en: readStrings('en') };
const s = (locale: Locale, key: string) => {
  const value = STRINGS[locale][`atlas.${key}`];
  if (!value) throw new Error(`missing atlas.${key} in ${locale}.json`);
  return value;
};
const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(values[name]));

const demo = (locale: Locale) => `/${locale}/dev/components/`;
const PYODIDE_URL = /cdn\.jsdelivr\.net\/pyodide/i;
// Demo page: 2 quizzes + 5 runners (hello, plot, error, slow, input), in this order.
const ISLANDS = 7;
const RUNNERS = 5;
const DEMO_LESSON = 'ml/linear-regression';

/** /_astro files that start Pyodide: the worker and client.ts (the only chunk that names the worker). */
function pyodideChunks(): string[] {
  const dir = fileURLToPath(new URL('../../dist/_astro/', import.meta.url));
  const files = readdirSync(dir).filter((file) => file.endsWith('.js'));
  const workers = files.filter((file) => file.startsWith('worker-'));
  const clients = files.filter((file) => workers.some((worker) => readFileSync(dir + file, 'utf8').includes(worker)));
  return [...workers, ...clients];
}

/** Scrolls to every part of the page so every client:visible island hydrates. */
async function scrollThrough(page: Page): Promise<void> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = page.viewportSize()?.height ?? 800;
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(100);
  }
}

/** Astro removes `ssr` from an island once it has hydrated; a click before that is lost. */
async function hydrated(scope: Locator, count = 1): Promise<void> {
  await scope.scrollIntoViewIfNeeded();
  await expect(scope.locator('astro-island:not([ssr])')).toHaveCount(count);
}

async function openDemo(page: Page, locale: Locale): Promise<void> {
  await page.goto(demo(locale));
  await scrollThrough(page);
  await expect(page.locator('astro-island')).toHaveCount(ISLANDS);
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

/** Presses Tab until `target` has focus (at most `max` times), then checks it. */
async function tabTo(page: Page, target: Locator, max = 6): Promise<void> {
  for (let i = 0; i < max && !(await target.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}

function runners(page: Page): Locator {
  return page.locator('.atlas-runner');
}

function quizzes(page: Page): Locator {
  return page.locator('.atlas-quiz');
}

/** Question n (1-based) of a quiz, by its legend "Câu n/total". */
function question(quiz: Locator, locale: Locale, n: number, total: number): Locator {
  return quiz.getByRole('group', { name: new RegExp(`^${fill(s(locale, 'quiz.question'), { n, total })}`) });
}

/** Console errors and uncaught exceptions, from the moment this is called. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message: ConsoleMessage) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

for (const locale of LOCALES) {
  test.describe(`demo page /${locale}/dev/components/`, () => {
    test('(a) opening and scrolling the whole page sends no request to Pyodide', async ({ page }) => {
      const urls: string[] = [];
      page.on('request', (request) => urls.push(request.url()));
      page.on('worker', (worker) => urls.push(`worker: ${worker.url()}`));
      await openDemo(page, locale);
      await page.waitForLoadState('networkidle');

      const chunks = pyodideChunks();
      expect(chunks.length, 'worker and client.ts chunks in dist/_astro').toBeGreaterThanOrEqual(2);
      expect(urls.filter((url) => PYODIDE_URL.test(url) || /pyodide/i.test(url))).toEqual([]);
      expect(urls.filter((url) => chunks.some((chunk) => url.endsWith(`/_astro/${chunk}`)))).toEqual([]);
      expect(urls.filter((url) => url.startsWith('worker:'))).toEqual([]);
      // Control: the islands did load, so the page was really exercised.
      expect(urls.some((url) => /PythonRunnerIsland\.[\w-]+\.js$/.test(url))).toBe(true);
    });

    test('(b) Pyodide blocked: Run shows "could not load", Try again tries again', async ({ page, context }) => {
      const blocked: string[] = [];
      // context.route also sees the requests of the module worker.
      await context.route('**/pyodide/**', (route) => {
        blocked.push(route.request().url());
        return route.abort();
      });
      await page.goto(demo(locale));
      const hello = runners(page).nth(0);
      await hydrated(hello);
      await expect(hello.locator('.atlas-runner-status')).toHaveText(s(locale, 'runner.firstRunNote'));

      await hello.getByRole('button', { name: s(locale, 'runner.run'), exact: true }).click();
      await expect(hello.locator('.atlas-runner-status')).toHaveText(s(locale, 'runner.loadFailed'), {
        timeout: 20_000,
      });
      expect(blocked.length).toBeGreaterThan(0);
      expect(blocked.every((url) => PYODIDE_URL.test(url))).toBe(true);
      const retry = hello.getByRole('button', { name: s(locale, 'runner.retry'), exact: true });
      await expect(retry).toBeVisible();
      await expect(hello.getByRole('button', { name: s(locale, 'runner.stop'), exact: true })).toHaveCount(0);

      const before = blocked.length;
      await retry.click();
      await expect(hello.locator('.atlas-runner-status')).toHaveText(s(locale, 'runner.loadFailed'), {
        timeout: 20_000,
      });
      expect(blocked.length).toBeGreaterThan(before);
      await expect(retry).toBeVisible();
    });

    test('(b) Pyodide blocked: a queued runner also ends with "could not load"', async ({ page, context }) => {
      await context.route('**/pyodide/**', (route) => route.abort());
      await page.goto(demo(locale));
      const [hello, plot] = [runners(page).nth(0), runners(page).nth(1)];
      await hydrated(hello);
      await hydrated(plot);
      const run = s(locale, 'runner.run');
      await hello.getByRole('button', { name: run, exact: true }).click();
      await plot.getByRole('button', { name: run, exact: true }).click();
      for (const runner of [hello, plot]) {
        await expect(runner.locator('.atlas-runner-status')).toHaveText(s(locale, 'runner.loadFailed'), {
          timeout: 20_000,
        });
        await expect(runner.getByRole('button', { name: s(locale, 'runner.retry'), exact: true })).toBeVisible();
      }
    });

    test('(c) quiz works with the keyboard only, and the score is right', async ({ page }) => {
      await page.goto(demo(locale));
      const quiz = quizzes(page).nth(0);
      await hydrated(quiz);
      const check = s(locale, 'quiz.check');
      const q1 = question(quiz, locale, 1, 3);
      const q2 = question(quiz, locale, 2, 3);
      const q3 = question(quiz, locale, 3, 3);

      // Q1, right answer is the 2nd option. Focus the first radio, then keyboard only.
      // tabTo() tolerates extra tab stops; the test below checks there are none.
      await q1.getByRole('radio').first().focus();
      await page.keyboard.press('ArrowDown');
      await expect(q1.getByRole('radio').nth(1)).toBeChecked();
      await tabTo(page, q1.getByRole('button', { name: check }));
      await page.keyboard.press('Enter');
      await expect(q1.locator('[aria-live="polite"]')).toContainText(s(locale, 'quiz.correct'));
      await expect(q1.locator('[aria-live="polite"]')).toContainText(s(locale, 'quiz.explanation'));

      // Q2, right answer is the 1st option: Tab into the group, Space selects.
      await tabTo(page, q2.getByRole('radio').first());
      await page.keyboard.press('Space');
      await expect(q2.getByRole('radio').first()).toBeChecked();
      await tabTo(page, q2.getByRole('button', { name: check }));
      await page.keyboard.press('Space');
      await expect(q2.locator('[aria-live="polite"]')).toContainText(s(locale, 'quiz.correct'));

      // Q3, right answer is the 3rd option; pick the 2nd (wrong) on purpose.
      await tabTo(page, q3.getByRole('radio').first());
      await page.keyboard.press('ArrowDown');
      await expect(q3.getByRole('radio').nth(1)).toBeChecked();
      await tabTo(page, q3.getByRole('button', { name: check }));
      await page.keyboard.press('Enter');
      await expect(q3.locator('[aria-live="polite"]')).toContainText(s(locale, 'quiz.incorrect'));
      await expect(q3).toContainText(s(locale, 'quiz.yourAnswer'));
      await expect(q3).toContainText(s(locale, 'quiz.correctAnswer'));

      await expect(quiz.locator('.atlas-quiz-score')).toHaveText(
        fill(s(locale, 'quiz.score'), { correct: 2, total: 3 }),
      );

      // Retry Q3 from the keyboard: focus goes back to its first answer, the score is hidden until graded.
      await expect(q3.getByRole('button', { name: s(locale, 'quiz.retry') })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(q3.getByRole('radio').first()).toBeFocused();
      await expect(quiz.locator('.atlas-quiz-score')).toHaveCount(0);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await expect(q3.getByRole('radio').nth(2)).toBeChecked();
      await tabTo(page, q3.getByRole('button', { name: check }));
      await page.keyboard.press('Enter');
      await expect(quiz.locator('.atlas-quiz-score')).toHaveText(
        fill(s(locale, 'quiz.score'), { correct: 3, total: 3 }),
      );
    });

    test('(c) in a quiz, Tab goes from the answers straight to Check (no extra tab stops)', async ({ page }) => {
      // Every island hydrated first: focus held from before hydration is covered by its own test below.
      await openDemo(page, locale);
      const focused = () =>
        page.evaluate(() => {
          const el = document.activeElement;
          return el ? `${el.tagName.toLowerCase()}.${el.className} "${(el.textContent ?? '').slice(0, 30)}"` : 'none';
        });
      for (const quiz of await quizzes(page).all()) {
        await hydrated(quiz);
        for (const group of await quiz.getByRole('group').all()) {
          const where = `question "${await group.locator('legend').textContent()}"`;
          const first = group.getByRole('radio').first();
          // Answers (KaTeX fractions sit a few px taller than the line): Tab lands on Check.
          await first.focus();
          await page.keyboard.press('Tab');
          expect(await focused(), `after Tab from the first answer of ${where}`).toMatch(/^button\.atlas-quiz-button/);

          // The question text in the legend: Shift+Tab from the first answer does not stop on it.
          await first.focus();
          await page.keyboard.press('Shift+Tab');
          expect(
            await group.locator('legend').evaluate((legend) => legend.contains(document.activeElement)),
            `after Shift+Tab from the first answer of ${where}: ${await focused()}`,
          ).toBe(false);

          // The explanation, once graded: Tab from "Try again" leaves the question.
          await first.check();
          await group.getByRole('button', { name: s(locale, 'quiz.check') }).click();
          await expect(group.locator('.atlas-quiz-explanation')).toBeVisible();
          await group.getByRole('button', { name: s(locale, 'quiz.retry') }).focus();
          await page.keyboard.press('Tab');
          expect(
            await group.evaluate((fieldset) => fieldset.contains(document.activeElement)),
            `after Tab from Try again of ${where}: ${await focused()}`,
          ).toBe(false);
        }
      }
    });

    test('(c) a radio focused before its quiz hydrates: Tab still goes straight to Check (decision 16)', async ({
      page,
    }) => {
      await page.goto(demo(locale));
      // The second quiz is far down the page: still server-rendered markup until it scrolls into view.
      const quiz = quizzes(page).nth(1);
      await expect(quiz.locator('astro-island[ssr]')).toHaveCount(1);
      const group = question(quiz, locale, 1, 2);
      const first = group.getByRole('radio').first();
      await first.evaluate((radio) => (radio as HTMLInputElement).focus({ preventScroll: true }));
      await expect(quiz.locator('astro-island[ssr]')).toHaveCount(1);

      await hydrated(quiz);
      await expect(first).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(group.getByRole('button', { name: s(locale, 'quiz.check') })).toBeFocused();
    });

    test('(c) in Chrome every quiz answer and question has a name, formulas included (decision 12)', async ({
      page,
    }) => {
      await openDemo(page, locale);
      // Chrome's own accessibility tree (CDP), not Playwright's name computation: Chrome leaves MathML out.
      const cdp = await page.context().newCDPSession(page);
      const { nodes } = await cdp.send('Accessibility.getFullAXTree');
      const named = (role: string) =>
        nodes
          .filter((node) => !node.ignored && node.role?.value === role)
          .map((node) => String(node.name?.value ?? '').trim());

      const radios = named('radio');
      expect(radios).toHaveLength(await page.locator('.atlas-quiz input[type="radio"]').count());
      expect(radios.filter((name) => name === '')).toEqual([]);
      // Question 1 of the demo quiz: every answer is only a formula.
      expect(radios.slice(0, 4)).toEqual(['2', String.raw`\frac{1}{2}`, '1', String.raw`\frac{1}{4}`]);

      const count = (n: number, total: number) => fill(s(locale, 'quiz.question'), { n, total });
      const groups = named('group').filter((name) => name.startsWith(count(1, 3).slice(0, 3)));
      expect(groups).toHaveLength(3 + 2);
      for (const name of groups) expect(name.length, name).toBeGreaterThan(count(1, 3).length + 5);
      expect(groups[0]).toContain(String.raw`\frac{1}{2}(\hat{y} - y)^2`);
    });

    test('(c) LessonProgress works with the keyboard and survives a reload', async ({ page }) => {
      await page.goto(demo(locale));
      const toggle = page.getByRole('button', { name: s(locale, 'progress.markDone') });
      await expect(toggle).toBeEnabled();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');

      await toggle.focus();
      await page.keyboard.press('Space');
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.atlas-progress-status')).toHaveText(s(locale, 'progress.doneStatus'));
      await expect(page.getByText(s(locale, 'progress.storageBlocked'))).toBeHidden();

      await page.reload();
      await expect(toggle).toBeEnabled();
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');

      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('.atlas-progress-status')).toHaveText('');
      await page.reload();
      await expect(toggle).toBeEnabled();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    // Two ways storage is blocked: reading window.localStorage throws, or the Storage methods throw.
    const BLOCKERS = {
      'window.localStorage throws': () => {
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          get() {
            throw new DOMException('The operation is insecure.', 'SecurityError');
          },
        });
      },
      'Storage methods throw': () => {
        for (const name of ['getItem', 'setItem', 'removeItem'] as const) {
          Storage.prototype[name] = () => {
            throw new DOMException('blocked', 'SecurityError');
          };
        }
      },
    };

    for (const [name, blocker] of Object.entries(BLOCKERS)) {
      test(`(c) LessonProgress with blocked storage (${name}): no error on click, a warning`, async ({ page }) => {
        await page.addInitScript(blocker);
        await page.goto(demo(locale));
        const toggle = page.getByRole('button', { name: s(locale, 'progress.markDone') });
        await expect(toggle).toBeEnabled();
        await scrollThrough(page);
        await page.waitForLoadState('networkidle');

        // Starlight's own inline script already throws while loading; only errors after the click count.
        const errors = collectErrors(page);
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByText(s(locale, 'progress.storageBlocked'))).toBeVisible();
        // The ticks of the demo map and Prerequisites still follow (in memory).
        await expect(page.locator(`.roadmap li[data-lesson-id="${DEMO_LESSON}"]`)).toHaveAttribute('data-done', 'true');
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-pressed', 'false');
        await page.waitForTimeout(300);
        expect(errors).toEqual([]);
      });
    }

    test('(d) the two quizzes do not affect each other, and no id is used twice', async ({ page }) => {
      await openDemo(page, locale);
      const [first, second] = [quizzes(page).nth(0), quizzes(page).nth(1)];
      const a1 = question(first, locale, 1, 3);
      const b1 = question(second, locale, 1, 2);

      await a1.getByRole('radio').nth(1).check();
      for (const radio of await b1.getByRole('radio').all()) await expect(radio).not.toBeChecked();
      await b1.getByRole('radio').nth(0).check();
      await expect(a1.getByRole('radio').nth(1)).toBeChecked();
      await expect(b1.getByRole('radio').nth(0)).toBeChecked();
      // Radio groups are distinct per question and per quiz.
      const names = await page.locator('.atlas-quiz input[type="radio"]').evaluateAll((inputs) =>
        [...new Set(inputs.map((input) => (input as HTMLInputElement).name))],
      );
      expect(names).toHaveLength(3 + 2);

      // Open the editor of every runner: the textareas get ids too.
      for (const runner of await runners(page).all()) {
        await runner.getByRole('button', { name: s(locale, 'runner.edit') }).click();
      }
      await expect(page.getByRole('textbox', { name: s(locale, 'runner.editorLabel') })).toHaveCount(RUNNERS);

      const report = await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
        const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
        // Every reference (for, aria-describedby, aria-labelledby, aria-controls) must point to an element.
        const missing: string[] = [];
        for (const el of document.querySelectorAll('[for], [aria-describedby], [aria-labelledby], [aria-controls]')) {
          const refs = ['for', 'aria-describedby', 'aria-labelledby', 'aria-controls'].flatMap((attr) =>
            (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean),
          );
          for (const ref of refs) if (!document.getElementById(ref)) missing.push(`${el.tagName} -> ${ref}`);
        }
        return { duplicates, missing };
      });
      expect(report.duplicates).toEqual([]);
      expect(report.missing).toEqual([]);
    });

    test('hydration of every island logs no error', async ({ page }) => {
      const errors = collectErrors(page);
      await openDemo(page, locale);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });

    for (const scheme of ['light', 'dark'] as const) {
      test(`(e) at 375px in ${scheme} mode the page does not scroll sideways, also while editing`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 375, height: 800 });
        await page.emulateMedia({ colorScheme: scheme });
        await openDemo(page, locale);
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        const width = () => page.evaluate(() => document.documentElement.scrollWidth);
        expect(await width()).toBeLessThanOrEqual(375);

        // Editor open in every runner, plus the "could not load" state with its Try again button.
        await page.context().route('**/pyodide/**', (route) => route.abort());
        for (const runner of await runners(page).all()) {
          await runner.getByRole('button', { name: s(locale, 'runner.edit') }).click();
        }
        const hello = runners(page).nth(0);
        await hello.getByRole('button', { name: s(locale, 'runner.run'), exact: true }).click();
        await expect(hello.getByRole('button', { name: s(locale, 'runner.retry'), exact: true })).toBeVisible({
          timeout: 20_000,
        });
        expect(await width()).toBeLessThanOrEqual(375);
      });
    }
  });
}

test('(e) control: the 375px check sees overflow when there is some', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(demo('vi'));
  await page.evaluate(() => {
    const wide = document.createElement('div');
    wide.style.width = '600px';
    wide.style.height = '1px';
    document.querySelector('.sl-markdown-content')?.append(wide);
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeGreaterThan(375);
});

test('(f) the sitemap leaves out /dev/ and keeps both languages with hreflang', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.status()).toBe(200);
  expect(await index.text()).toContain('sitemap-0.xml');

  const response = await request.get('/sitemap-0.xml');
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  expect(locs.length).toBeGreaterThan(0);
  expect(xml).not.toContain('/dev/');
  expect(locs).toContain('/vi/');
  expect(locs).toContain('/en/');
  expect(xml).toContain('hreflang="vi"');
  expect(xml).toContain('hreflang="en"');
});

test.describe('learned lessons on the homepage map', () => {
  const mlTotal = getLessonsByPart('ml').length;

  test('nothing marked: no tick and no "Learned x/y" on /vi/', async ({ page }) => {
    await page.goto('/vi/');
    await expect(page.locator('[data-roadmap] .done-mark').filter({ visible: true })).toHaveCount(0);
    await expect(page.locator('[data-progress-summary]').filter({ visible: true })).toHaveCount(0);
  });

  test('marking one lesson on the demo page gives /vi/ exactly one tick and "Đã học 1/14"', async ({ page }) => {
    expect(mlTotal).toBe(14);
    await page.goto(demo('vi'));
    const toggle = page.getByRole('button', { name: s('vi', 'progress.markDone') });
    await expect(toggle).toBeEnabled();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    // The demo map and Prerequisites on the same page follow at once.
    await expect(page.locator(`.roadmap li[data-lesson-id="${DEMO_LESSON}"] .done-mark`)).toBeVisible();
    await expect(page.locator(`[data-prereq] li[data-lesson-id="${DEMO_LESSON}"] .atlas-check`)).toBeVisible();
    await expect(page.locator('[data-prereq] li[data-lesson-id="math/calculus"] .atlas-check')).toBeHidden();

    await page.goto('/vi/');
    const ticks = page.locator('[data-roadmap] .done-mark').filter({ visible: true });
    await expect(ticks).toHaveCount(1);
    await expect(page.locator(`[data-roadmap] li[data-lesson-id="${DEMO_LESSON}"] .done-mark`)).toBeVisible();
    await expect(page.locator('[data-roadmap] li[data-done="true"]')).toHaveCount(1);

    const summaries = page.locator('.part-progress').filter({ visible: true });
    await expect(summaries).toHaveCount(1);
    await expect(summaries).toHaveText(fill(s('vi', 'roadmap.progressSummary'), { done: 1, total: mlTotal }));
    // It sits in the Machine Learning part.
    await expect(
      page.locator('[data-roadmap] section[data-progress-scope]').filter({ has: page.locator(`[data-lesson-id="${DEMO_LESSON}"]`) })
        .locator('.part-progress'),
    ).toBeVisible();
    await expect(page.locator('.legend-total')).toHaveText(
      fill(s('vi', 'roadmap.progressTotal'), { done: 1, total: LESSONS.length }),
    );
    await expect(page.locator('.legend-done')).toBeVisible();
  });
});
