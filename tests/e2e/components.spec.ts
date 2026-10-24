import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Locator, type Page } from '@playwright/test';
import { getLessonsByPart } from '../../src/lib/roadmap';
import { LESSONS, LOCALES, type Locale } from '../../src/data/roadmap';
import { pipCommand, readEnvVars } from '../../src/lib/local-code';
import { codeImports, localCodeTags, type LocalCodeTag } from '../unit/fixtures/local-code-tags';
import { installContrast, s, scrollThrough, type Contrast } from './helpers';
import { readSource, WITH_PAGE } from './lesson-pages';

// M1 components on the demo page (docs/architecture/components.md, plan row M1-7). Runs in CI, no network:
// nothing here may download Pyodide. All URLs end with "/" (trailingSlash 'always').

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
      // Scrolls the whole page: on a loaded machine this took 25 s once, against about 2 s normally.
      test.slow();
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
      await first.evaluate((radio) => {
        // Astro drops `ssr` as soon as it calls hydrateRoot; React commits and runs the island's effects
        // 10-30 ms later. A Tab pressed in between hit the stale radio group (1 run in 20-80 failed).
        // Wait for the island's own fix instead: the same radio blurred, then focused again.
        const seen = { blurred: false, refocused: false };
        (window as unknown as { atlasRefocus: typeof seen }).atlasRefocus = seen;
        radio.addEventListener('blur', () => (seen.blurred = true));
        radio.addEventListener('focus', () => (seen.refocused = seen.blurred));
        (radio as HTMLInputElement).focus({ preventScroll: true });
      });
      await expect(quiz.locator('astro-island[ssr]')).toHaveCount(1);

      await hydrated(quiz);
      await page.waitForFunction(
        () => (window as unknown as { atlasRefocus: { refocused: boolean } }).atlasRefocus.refocused,
        undefined,
        { timeout: 5_000 },
      );
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

// --- LocalCode on the demo page (docs/architecture/llm-lessons.md, 4.4 and 4.5). No island, no network. ---

const CODE_DIR = fileURLToPath(new URL('../../src/code/', import.meta.url));
// Demo page: local-chat, then local-app (whose first line is the comment "# app.py", section 2.2).
const LOCAL_BLOCKS = 2;

interface DemoBlock {
  tag: LocalCodeTag;
  /** Path under src/code/, e.g. 'dev/local-chat.vi.py'. */
  path: string;
  /** The file's lines, without the final line break, trailing spaces removed. */
  lines: string[];
  source: string;
}

/** The LocalCode tags written in the demo page of a locale, with the file each one shows. */
function demoBlocks(locale: Locale): DemoBlock[] {
  const page = readSource(locale, 'dev/components');
  const imports = codeImports(page);
  return localCodeTags(page).map((tag) => {
    const path = imports.get(tag.code ?? '');
    if (!path) throw new Error(`no @code import for code={${tag.code}} in ${locale}/dev/components`);
    const source = readFileSync(join(CODE_DIR, path), 'utf8');
    const lines = source.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n').map((line) => line.trimEnd());
    return { tag, path, lines, source };
  });
}

/** [label, value] of each requirement row the props and the code call for, in the order of section 4.1. */
function expectedRequirements(locale: Locale, block: DemoBlock): [string, string][] {
  const rows: [string, string][] = [];
  const install = pipCommand(block.tag.packages);
  if (install) rows.push([s(locale, 'localCode.install'), install]);
  const vars = readEnvVars(block.source);
  if (vars.length > 0) {
    const optional = s(locale, 'localCode.optional');
    rows.push([s(locale, 'localCode.env'), vars.map((v) => (v.optional ? `${v.name} (${optional})` : v.name)).join(', ')]);
  }
  if (block.tag.command) rows.push([s(locale, 'localCode.command'), block.tag.command]);
  if (block.tag.hardware) rows.push([s(locale, 'localCode.hardware'), block.tag.hardware]);
  return rows;
}

/** Contrast of the text of every element matching each selector, against the background behind it. */
async function textContrast(root: Locator, selectors: string[]): Promise<Contrast[]> {
  return root.evaluate(
    (el, list) =>
      list.flatMap((selector) =>
        [...el.querySelectorAll(selector)].map((node) =>
          window.atlasContrast!.pair(selector, getComputedStyle(node).color, window.atlasContrast!.backgroundOf(node)),
        ),
      ),
    selectors,
  );
}

for (const locale of LOCALES) {
  test.describe(`LocalCode on /${locale}/dev/components/`, () => {
    const blocks = demoBlocks(locale);

    test('(1) two blocks, no island or script inside, badge and lang of the page', async ({ page }) => {
      expect(blocks).toHaveLength(LOCAL_BLOCKS);
      await page.goto(demo(locale));
      const local = page.locator('.atlas-local');
      await expect(local).toHaveCount(LOCAL_BLOCKS);
      await expect(local.locator('astro-island, script')).toHaveCount(0);
      // LocalCode adds no island: the demo page keeps its 7 (section 4.4).
      await expect(page.locator('astro-island')).toHaveCount(ISLANDS);
      for (const block of await local.all()) {
        await expect(block).toHaveAttribute('lang', locale);
        await expect(block.locator('.atlas-local-badge')).toHaveText(s(locale, 'localCode.badge'));
        await expect(block.locator('.atlas-local-badge')).toHaveAttribute('data-pagefind-ignore', '');
        // The demo page has its own file in both languages: the code inherits the page's lang.
        await expect(block.locator('.atlas-local-code')).not.toHaveAttribute('lang', /./);
      }
      await expect(local.locator('.atlas-local-title')).toHaveText(blocks.map((block) => block.tag.title ?? ''));
    });

    test('(2, 5) the code shown is the file, line for line, and the copy button copies the file', async ({ page }) => {
      await page.goto(demo(locale));
      const local = page.locator('.atlas-local');
      for (const [index, block] of blocks.entries()) {
        const root = local.nth(index);
        const shown = await root
          .locator('.atlas-local-code pre .ec-line')
          .evaluateAll((lines) => lines.map((line) => (line.textContent ?? '').replace(/\n$/, '').trimEnd()));
        expect(shown, `${block.path}: lines shown`).toEqual(block.lines);

        const copy = root.locator('.atlas-local-code .copy button');
        await expect(copy, `${block.path}: one copy button`).toHaveCount(1);
        // Expressive Code joins the lines of data-code with U+007F.
        const copied = ((await copy.getAttribute('data-code')) ?? '').split('\u007f').map((line) => line.trimEnd());
        expect(copied, `${block.path}: data-code of the copy button`).toEqual(block.lines);

        // The frame title: the file prop, or no title at all (never a comment taken from the code, section 2.2).
        const title = root.locator('.atlas-local-code figcaption .title');
        if (block.tag.file) await expect(title).toHaveText(block.tag.file);
        else await expect(title).toHaveCount(0);
      }
      // The case that motivated title={file ?? ''}: local-app starts with "# app.py", and that line is shown.
      const app = blocks.findIndex((block) => block.path.startsWith('dev/local-app.'));
      expect(app, 'local-app is on the demo page').toBeGreaterThanOrEqual(0);
      expect(blocks[app]?.lines[0]).toBe('# app.py');
      await expect(local.nth(app).locator('.atlas-local-code pre .ec-line').first()).toHaveText('# app.py');
    });

    test('(3, 4) requirement rows follow the props and the code; a sample output only when the tag has content', async ({
      page,
    }) => {
      await page.goto(demo(locale));
      const local = page.locator('.atlas-local');
      for (const [index, block] of blocks.entries()) {
        const root = local.nth(index);
        const rows = await root.locator('.atlas-local-reqs > div').evaluateAll((groups) =>
          groups.map((group) => [
            (group.querySelector('dt')?.textContent ?? '').trim(),
            (group.querySelector('dd')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
          ]),
        );
        expect(rows, `${block.path}: requirement rows`).toEqual(expectedRequirements(locale, block));
        // Each variable name is its own <code>, so it can be selected and copied alone.
        const vars = readEnvVars(block.source);
        if (vars.length > 0) {
          const env = root
            .locator('.atlas-local-reqs > div')
            .filter({ has: page.getByText(s(locale, 'localCode.env'), { exact: true }) });
          await expect(env.locator('dd code')).toHaveText(vars.map((v) => v.name));
        }

        const output = root.locator('.atlas-local-output');
        await expect(output, `${block.path}: sample output`).toHaveCount(block.tag.hasOutput ? 1 : 0);
        if (block.tag.hasOutput) {
          await expect(output.locator('.atlas-local-output-label')).toHaveText(s(locale, 'localCode.sampleOutput'));
          await expect(output.locator('.atlas-local-output-note')).toHaveText(
            s(locale, block.tag.sampleVaries ? 'localCode.sampleNote' : 'localCode.sampleNoteFixed'),
          );
        }
      }
      // Control for the expected rows: the chat block reads the three variables of section 2.3, in this order.
      const chat = blocks.find((block) => block.path.startsWith('dev/local-chat.'));
      expect(chat && readEnvVars(chat.source).map((v) => `${v.name}${v.optional ? '?' : ''}`)).toEqual([
        'OPENAI_BASE_URL?',
        'OPENAI_API_KEY',
        'LLM_MODEL',
      ]);
    });

    for (const scheme of ['light', 'dark'] as const) {
      test(`(6) in ${scheme} mode the badge, title and labels reach a contrast of 4.5`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(demo(locale));
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        await installContrast(page);
        const pairs: Contrast[] = [];
        for (const block of await page.locator('.atlas-local').all()) {
          pairs.push(
            ...(await textContrast(block, [
              '.atlas-local-badge',
              '.atlas-local-title',
              '.atlas-local-reqs dt',
              '.atlas-local-reqs dd',
              '.atlas-local-reqs code',
              '.atlas-local-output-label',
              '.atlas-local-output-note',
            ])),
          );
        }
        expect(pairs.length).toBeGreaterThanOrEqual(LOCAL_BLOCKS * 3);
        expect(pairs.filter((pair) => pair.ratio < 4.5)).toEqual([]);
      });
    }

    test('(7) at 375px no block is wider than the text column', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(demo(locale));
      const report = await page.locator('.atlas-local').evaluateAll((items) =>
        items.map((el) => {
          const column = el.closest('.sl-markdown-content') ?? el.parentElement!;
          const box = el.getBoundingClientRect();
          const col = column.getBoundingClientRect();
          return {
            scroll: el.scrollWidth,
            client: el.clientWidth,
            insideColumn: box.left >= col.left - 1 && box.right <= col.right + 1,
          };
        }),
      );
      expect(report).toHaveLength(LOCAL_BLOCKS);
      for (const item of report) {
        expect(item.scroll).toBeLessThanOrEqual(item.client + 1);
        expect(item.insideColumn).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    });
  });
}

test('(7) control: the column check sees a LocalCode block that is too wide', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(demo('vi'));
  const block = page.locator('.atlas-local').first();
  await block.evaluate((el) => {
    const wide = document.createElement('div');
    wide.style.width = '600px';
    wide.style.height = '1px';
    el.append(wide);
  });
  expect(await block.evaluate((el) => el.scrollWidth > el.clientWidth + 1)).toBe(true);
});

// Neither demo block has a sample output (no .env.llm when they were written), so the contrast of the output
// label and note is measured on the first lesson that has one.
const WITH_OUTPUT = WITH_PAGE.find((lesson) => localCodeTags(readSource('vi', lesson.id)).some((tag) => tag.hasOutput));

for (const scheme of ['light', 'dark'] as const) {
  test(`(6) in ${scheme} mode a sample output's label and note reach a contrast of 4.5 (on a lesson)`, async ({
    page,
  }) => {
    test.skip(!WITH_OUTPUT, 'no lesson has a LocalCode with a sample output yet');
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(`/vi/${WITH_OUTPUT!.id}/`);
    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
    await installContrast(page);
    const output = page.locator('.atlas-local-output').first();
    await expect(output).toBeVisible();
    const pairs = await textContrast(output, ['.atlas-local-output-label', '.atlas-local-output-note']);
    expect(pairs).toHaveLength(2);
    expect(pairs.filter((pair) => pair.ratio < 4.5)).toEqual([]);
  });
}
