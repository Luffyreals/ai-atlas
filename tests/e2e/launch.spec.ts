// M4 launch checks that depend on the viewport or on interaction (docs/architecture/launch.md, section 8,
// items 1, 2 and 5): the About page and the footer note at 375px in light and dark mode (no sideways scroll,
// contrast), and running a PythonRunner from the keyboard while Pyodide cannot load. The DOM-only checks are
// in launch-meta.spec.ts. All URLs end with "/" (trailingSlash 'always').
import { expect, test, type Locator, type Page } from '@playwright/test';
import { isTranslated } from '../../src/lib/roadmap';
import { installContrast, isNarrow, PYODIDE_URL, s, type Contrast } from './helpers';
import { WITH_PAGE } from './lesson-pages';

const FALLBACK = WITH_PAGE.find((lesson) => !isTranslated(lesson, 'en'));

/** Contrast of the text of every visible element matching `selector` inside `root`, against its background. */
async function textContrast(root: Locator, selector: string): Promise<Contrast[]> {
  return root.evaluate(
    (el, sel) =>
      [...el.querySelectorAll(sel)]
        .filter((node) => node.checkVisibility() && (node.textContent ?? '').trim() !== '')
        .map((node) =>
          window.atlasContrast!.pair(
            `${node.tagName.toLowerCase()} "${(node.textContent ?? '').trim().slice(0, 30)}"`,
            getComputedStyle(node).color,
            window.atlasContrast!.backgroundOf(node),
          ),
        ),
    selector,
  );
}

async function pageWidth(page: Page): Promise<{ scrollWidth: number; innerWidth: number }> {
  return page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
}

// --- 1 and 2: About page and footer note at 375px, light and dark ---

const NOTE_PAGES = [
  '/vi/about/',
  '/en/about/',
  '/vi/ml/linear-regression/',
  '/en/ml/linear-regression/',
  ...(FALLBACK ? [`/en/${FALLBACK.id}/`] : []),
  '/khong-co-trang-nay/',
];

for (const scheme of ['light', 'dark'] as const) {
  for (const path of NOTE_PAGES) {
    test(`${path} at 375px in ${scheme} mode: no sideways scroll; footer note readable (4.5:1)`, async ({ page }) => {
      test.skip(!isNarrow(page), 'mobile project (375px) only');
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
      await page.evaluate(() => document.fonts.ready);
      const { scrollWidth, innerWidth } = await pageWidth(page);
      expect(innerWidth).toBe(375);
      expect(scrollWidth).toBeLessThanOrEqual(375);

      const note = page.locator('.atlas-site-note');
      await note.scrollIntoViewIfNeeded();
      // The note itself fits: no line wider than the column.
      const overflow = await note.evaluate((el) =>
        [...el.querySelectorAll('p, span, a')].filter((child) => child.getBoundingClientRect().right > window.innerWidth + 0.5).length,
      );
      expect(overflow).toBe(0);
      await installContrast(page);
      const pairs = await textContrast(note, 'span, a');
      expect(pairs.length).toBeGreaterThanOrEqual(path.startsWith('/khong') ? 6 : 3);
      expect(pairs.filter((pair) => pair.ratio < 4.5)).toEqual([]);
      // The About link stands alone: a target at least 24px tall (WCAG 2.5.8).
      for (const about of await note.locator('a.about').all()) {
        expect((await about.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(24);
      }
    });
  }

  for (const path of ['/vi/about/', '/en/about/']) {
    test(`${path} at 375px in ${scheme} mode: the text of the page reaches 4.5:1`, async ({ page }) => {
      test.skip(!isNarrow(page), 'mobile project (375px) only');
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
      await installContrast(page);
      const pairs = await textContrast(page.locator('.sl-markdown-content'), 'p, li, a, h2, h3, strong, code, kbd');
      expect(pairs.length).toBeGreaterThan(40);
      expect(pairs.filter((pair) => pair.ratio < 4.5)).toEqual([]);
      await expect(page.locator('h1#_top')).toBeInViewport();
    });
  }
}

test('control: the 375px note check sees a line wider than the column', async ({ page }) => {
  test.skip(!isNarrow(page), 'mobile project (375px) only');
  await page.goto('/vi/about/');
  await page.locator('.atlas-site-note span').first().evaluate((el) => {
    (el as HTMLElement).style.whiteSpace = 'nowrap';
  });
  expect((await pageWidth(page)).scrollWidth).toBeGreaterThan(375);
});

// --- 5: Run from the keyboard, Pyodide blocked (desktop project: keyboard does not depend on the width) ---

const LESSON = '/vi/ml/linear-regression/';

/** Blocks Pyodide, after a pause so the "loading Python" status can be seen first. */
async function blockPyodide(page: Page): Promise<string[]> {
  const blocked: string[] = [];
  // context.route also sees the requests of the module worker.
  await page.context().route('**/pyodide/**', async (route) => {
    blocked.push(route.request().url());
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    await route.abort();
  });
  return blocked;
}

async function firstRunner(page: Page): Promise<Locator> {
  await page.goto(LESSON);
  const runner = page.locator('.atlas-runner').first();
  await runner.scrollIntoViewIfNeeded();
  await expect(runner.locator('astro-island:not([ssr])')).toHaveCount(1);
  return runner;
}

/** Puts focus on the Run button by keyboard: focus "Edit code", then Shift+Tab (Run is just before it). */
async function tabToRun(page: Page, runner: Locator): Promise<Locator> {
  const run = runner.getByRole('button', { name: s('vi', 'runner.run'), exact: true });
  await runner.getByRole('button', { name: s('vi', 'runner.edit'), exact: true }).focus();
  await page.keyboard.press('Shift+Tab');
  await expect(run).toBeFocused();
  return run;
}

async function expectLoadingThenFailed(runner: Locator, blocked: string[]): Promise<void> {
  const status = runner.locator('.atlas-runner-status');
  await expect(status).toHaveText(s('vi', 'runner.loadingPython'), { timeout: 10_000 });
  await expect(status).toHaveText(s('vi', 'runner.loadFailed'), { timeout: 20_000 });
  expect(blocked.length).toBeGreaterThan(0);
  expect(blocked.every((url) => PYODIDE_URL.test(url))).toBe(true);
}

for (const key of ['Enter', 'Space'] as const) {
  test(`${LESSON}: Tab to the first Run, press ${key}: "loading Python", then "could not load"`, async ({ page }) => {
    test.skip(isNarrow(page), 'desktop project only');
    const blocked = await blockPyodide(page);
    const runner = await firstRunner(page);
    await expect(runner.locator('.atlas-runner-status')).toHaveText(s('vi', 'runner.firstRunNote'));
    expect(blocked).toEqual([]);
    await tabToRun(page, runner);
    await page.keyboard.press(key);
    await expectLoadingThenFailed(runner, blocked);
    await expect(runner.getByRole('button', { name: s('vi', 'runner.retry'), exact: true })).toBeVisible();
  });
}

test(`${LESSON}: in the code editor, Ctrl+Enter runs the code`, async ({ page }) => {
  test.skip(isNarrow(page), 'desktop project only');
  const blocked = await blockPyodide(page);
  const runner = await firstRunner(page);
  const edit = runner.getByRole('button', { name: s('vi', 'runner.edit'), exact: true });
  await edit.focus();
  await page.keyboard.press('Enter');
  const editor = runner.getByRole('textbox', { name: s('vi', 'runner.editorLabel') });
  await expect(editor).toBeVisible();
  await editor.focus();
  const code = await editor.inputValue();
  expect(code.trim()).not.toBe('');
  await page.keyboard.press('Control+Enter');
  await expectLoadingThenFailed(runner, blocked);
  // Ctrl+Enter runs; it does not type a line break into the code.
  expect(await editor.inputValue()).toBe(code);
});

test(`control: ${LESSON}, Enter on "Edit code" does not run anything`, async ({ page }) => {
  test.skip(isNarrow(page), 'desktop project only');
  const blocked = await blockPyodide(page);
  const runner = await firstRunner(page);
  await runner.getByRole('button', { name: s('vi', 'runner.edit'), exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1_000);
  await expect(runner.locator('.atlas-runner-status')).toHaveText(s('vi', 'runner.firstRunNote'));
  expect(blocked).toEqual([]);
});
