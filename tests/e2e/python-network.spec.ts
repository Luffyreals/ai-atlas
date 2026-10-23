import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { LOCALES, type Locale } from '../../src/data/roadmap';
import { s as atlas } from './helpers';

// PythonRunner with the real Pyodide from the CDN (docs/architecture/components.md, plan row M1-8).
// Needs the network, so every test is tagged @network: `npm run test:e2e:network` runs them (desktop only),
// `npm run test:e2e` (and CI) leaves them out. All URLs end with "/" (trailingSlash 'always').

// Same as test.setTimeout(120_000) in every test: the first run downloads Pyodide.
test.describe.configure({ timeout: 120_000 });

/** A string of the runner: atlas.runner.<key>. */
const s = (locale: Locale, key: string) => atlas(locale, `runner.${key}`);
const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(values[name]));
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** A template with {{...}} placeholders as a RegExp; each placeholder matches anything. */
const pattern = (template: string) =>
  new RegExp(`^${template.split(/\{\{\w+\}\}/).map(escapeRegExp).join('.+?')}$`);

// Runners on the demo page, in order.
const HELLO = 0;
const PLOT = 1;
const ERROR = 2;
const SLOW = 3;
const INPUT = 4;
const LOAD = 90_000; // first run: Pyodide (~10 MB), plus matplotlib and numpy for the plot cells

// src/code/dev/hello.*.py
const HELLO_OUTPUT = 'Hello from Python!\n2 + 3 = 5\nLine 1\nLine 2\nLine 3\n';

/** Runner n of the demo page, hydrated (a click before hydration is lost). */
async function runner(page: Page, n: number): Promise<Locator> {
  const box = page.locator('.atlas-runner').nth(n);
  await box.scrollIntoViewIfNeeded();
  // A runner taller than the screen (lesson code) keeps its island (Run, output) below the code, still off
  // screen: client:visible watches the island's own element, so scroll to that.
  await box.locator('astro-island > *').first().scrollIntoViewIfNeeded();
  await expect(box.locator('astro-island:not([ssr])')).toHaveCount(1);
  return box;
}

function parts(box: Locator, locale: Locale) {
  return {
    run: box.getByRole('button', { name: s(locale, 'run'), exact: true }),
    stop: box.getByRole('button', { name: s(locale, 'stop'), exact: true }),
    edit: box.getByRole('button', { name: s(locale, 'edit'), exact: true }),
    editor: box.getByRole('textbox', { name: s(locale, 'editorLabel') }),
    status: box.locator('.atlas-runner-status'),
    output: box.getByLabel(s(locale, 'output'), { exact: true }),
    images: box.getByRole('img'),
  };
}

const done = (locale: Locale) => pattern(s(locale, 'done'));

/** Replaces the code of a runner through "Edit code". */
async function editCode(box: Locator, locale: Locale, code: string): Promise<void> {
  const ui = parts(box, locale);
  if (!(await ui.editor.isVisible())) await ui.edit.click();
  await ui.editor.fill(code);
}

function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

for (const locale of LOCALES) {
  test(`hello prints its lines, and the first-run note goes away in every runner (${locale})`, { tag: '@network' }, async ({
    page,
  }) => {
    const errors = trackPageErrors(page);
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto(`/${locale}/dev/components/`);
    // Runners 0-2 hydrate before Pyodide loads, 3-4 after: the note must go away in both cases.
    for (const n of [ERROR, PLOT]) await runner(page, n);
    const hello = parts(await runner(page, HELLO), locale);
    await expect(hello.status).toHaveText(s(locale, 'firstRunNote'));
    expect(requests.filter((url) => /pyodide/i.test(url))).toEqual([]);

    await hello.run.click();
    await expect(hello.status).toHaveText(s(locale, 'loadingPython'));
    await expect(hello.run).toHaveAttribute('aria-disabled', 'true');
    await expect(hello.stop).toBeVisible();
    await expect(hello.status).toHaveText(done(locale), { timeout: LOAD });
    await expect(hello.output).toHaveText(HELLO_OUTPUT, { useInnerText: false });
    await expect(hello.stop).toHaveCount(0);
    expect(requests.some((url) => /cdn\.jsdelivr\.net\/pyodide\/v314\.0\.7\/full\//.test(url))).toBe(true);

    // Pyodide is loaded for the whole page now, also in runners that hydrate later (client:visible).
    for (const n of [SLOW, INPUT]) await runner(page, n);
    await expect(page.locator('.atlas-runner-status').filter({ hasText: s(locale, 'firstRunNote') })).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('plot shows one figure with its alt text, and at 375px the figure fits', { tag: '@network' }, async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/vi/dev/components/');
  const plotBox = await runner(page, PLOT);
  const plot = parts(plotBox, 'vi');
  await plot.run.click();
  // matplotlib and numpy are not part of the core: the status names them.
  await expect(plot.status).toHaveText(/matplotlib|numpy/, { timeout: LOAD });
  await expect(plot.status).toHaveText(done('vi'), { timeout: LOAD });

  await expect(plot.images).toHaveCount(1);
  const image = plot.images.first();
  await expect(image).toHaveAttribute('alt', 'Các điểm dữ liệu nằm quanh đường thẳng y = 2x + 1');
  await expect(image).toHaveAttribute('src', /^data:image\/png;base64,/);
  await image.scrollIntoViewIfNeeded();
  const size = await image.evaluate((img: HTMLImageElement) => ({
    natural: img.naturalWidth,
    client: img.clientWidth,
    right: img.getBoundingClientRect().right,
  }));
  expect(size.natural).toBeGreaterThan(0);
  expect(size.client).toBeGreaterThan(0);
  expect(size.client).toBeLessThanOrEqual(375);
  expect(size.right).toBeLessThanOrEqual(375);
  // np.random.seed(0): the same value as `python src/code/dev/plot.vi.py`.
  await expect(plot.output).toHaveText('Mean of y: 11.44\n', { useInnerText: false });
  await expect(plotBox).not.toContainText(s('vi', 'figuresBeforeError'));
  await expect(plotBox).not.toContainText(s('vi', 'errorTitle'));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

for (const locale of LOCALES) {
  test(`error shows NameError on line 6 and the figure drawn before it (${locale})`, { tag: '@network' }, async ({
    page,
  }) => {
    await page.goto(`/${locale}/dev/components/`);
    const box = await runner(page, ERROR);
    const error = parts(box, locale);
    await error.run.click();
    const title = box.locator('.atlas-runner-error').getByText(s(locale, 'errorTitle'));
    await expect(title).toBeVisible({ timeout: LOAD });

    await expect(box).toContainText("NameError: name 'totl' is not defined");
    await expect(box).toContainText(fill(s(locale, 'errorLine'), { line: 6 }));
    await expect(box.locator('.atlas-runner-error-line pre')).toHaveText(/^print\(totl\)/);
    await expect(box).toContainText(s(locale, 'hintNameError'));
    // The traceback has the user's frame and none of Pyodide's own.
    const details = box.locator('details');
    await details.locator('summary').click();
    await expect(details).toContainText('File "<exec>", line 6');
    await expect(details).not.toContainText('_pyodide');
    // On screen the box says it all; the live status only holds an sr-only line, so it is read out (decision 15).
    await expect(error.status).toHaveText(s(locale, 'errorTitle'));
    await expect(error.status.locator('p.sr-only')).toHaveCount(1);

    await expect(box).toContainText(s(locale, 'figuresBeforeError'));
    await expect(error.images).toHaveCount(1);
    await expect(error.images.first()).toHaveAttribute('alt', fill(s(locale, 'figure'), { n: 1 }));
  });
}

test('slow: the Stop hint appears after 10 s, Stop stops it, and it runs again', { tag: '@network' }, async ({
  page,
}) => {
  await page.goto('/vi/dev/components/');
  const slow = parts(await runner(page, SLOW), 'vi');
  const hint = fill(s('vi', 'longRunning'), { seconds: '10' });

  await slow.run.click();
  await expect(slow.output).toContainText('Tick 0', { timeout: LOAD });
  // Output streams while the code runs.
  await expect(slow.output).toContainText('Tick 2', { timeout: 5_000 });
  await expect(slow.status).toContainText(s('vi', 'running'));
  await expect(slow.status).not.toContainText(hint);
  await expect(slow.status).toContainText(hint, { timeout: 15_000 });

  await slow.stop.click();
  await expect(slow.status).toHaveText(s('vi', 'stopped'));
  await expect(slow.run).toBeFocused();
  await expect(slow.stop).toHaveCount(0);
  const ticks = (await slow.output.textContent()) ?? '';
  await page.waitForTimeout(1_500);
  // Really stopped: no new line after Stop.
  expect((await slow.output.textContent()) ?? '').toBe(ticks);

  // Runs again (on a new worker), from the start, with a fresh output.
  await slow.run.click();
  await expect(slow.output).toContainText('Tick 0', { timeout: LOAD });
  await expect(slow.output).not.toContainText(ticks.trim().split('\n').at(-1)!);
  await expect(slow.status).not.toContainText(hint);
  await slow.stop.click();
  await expect(slow.status).toHaveText(s('vi', 'stopped'));
});

test('two runners clicked back to back: the second waits, then finishes', { tag: '@network' }, async ({ page }) => {
  await page.goto('/vi/dev/components/');
  const hello = parts(await runner(page, HELLO), 'vi');
  const plot = parts(await runner(page, PLOT), 'vi');

  await hello.run.click();
  await plot.run.click();
  await expect(plot.status).toHaveText(s('vi', 'queued'));
  await expect(plot.stop).toBeVisible();
  await expect(hello.status).toHaveText(done('vi'), { timeout: LOAD });
  await expect(hello.output).toHaveText(HELLO_OUTPUT, { useInnerText: false });
  await expect(plot.status).toHaveText(done('vi'), { timeout: LOAD });
  await expect(plot.images).toHaveCount(1);
  // Each run has its own namespace and its own output.
  await expect(plot.output).toHaveText('Mean of y: 11.44\n', { useInnerText: false });
});

test('Stop on runner 1 while runner 2 waits: runner 2 still finishes', { tag: '@network' }, async ({ page }) => {
  await page.goto('/vi/dev/components/');
  const slow = parts(await runner(page, SLOW), 'vi');
  const hello = parts(await runner(page, HELLO), 'vi');

  await slow.run.click();
  await hello.run.click();
  await expect(hello.status).toHaveText(s('vi', 'queued'));
  await expect(slow.output).toContainText('Tick 0', { timeout: LOAD });
  await expect(hello.status).toHaveText(s('vi', 'queued'));

  await slow.stop.click();
  await expect(slow.status).toHaveText(s('vi', 'stopped'));
  await expect(hello.status).toHaveText(done('vi'), { timeout: LOAD });
  await expect(hello.output).toHaveText(HELLO_OUTPUT, { useInnerText: false });
});

test('a run that ends mid-line (print end="") leaks nothing into the next run', { tag: '@network' }, async ({
  page,
}) => {
  await page.goto('/vi/dev/components/');
  const helloBox = await runner(page, HELLO);
  const plotBox = await runner(page, PLOT);
  const hello = parts(helloBox, 'vi');
  const plot = parts(plotBox, 'vi');

  await editCode(helloBox, 'vi', 'print("x", end="")');
  await hello.run.click();
  await expect(hello.status).toHaveText(done('vi'), { timeout: LOAD });
  // Known limit (section 2.7): the half line comes out with a line break.
  await expect(hello.output).toHaveText(/^x\n?$/, { useInnerText: false });

  await editCode(plotBox, 'vi', 'print("y")');
  await plot.run.click();
  await expect(plot.status).toHaveText(done('vi'), { timeout: LOAD });
  await expect(plot.output).toHaveText('y\n', { useInnerText: false });

  // Same runner again.
  await editCode(helloBox, 'vi', 'print("z")');
  await hello.run.click();
  await expect(hello.status).toHaveText(done('vi'), { timeout: LOAD });
  await expect(hello.output).toHaveText('z\n', { useInnerText: false });
});

test('input(): the input box feeds input(); missing lines give the right hint', { tag: '@network' }, async ({
  page,
}) => {
  await page.goto('/vi/dev/components/');
  const inputBox = await runner(page, INPUT);
  const input = parts(inputBox, 'vi');
  const stdin = inputBox.getByRole('textbox', { name: s('vi', 'input') });
  await expect(stdin).toHaveValue('Lan\n20');

  await input.run.click();
  await expect(input.status).toHaveText(done('vi'), { timeout: LOAD });
  await expect(input.output).toHaveText('Hello, Lan\nNext year you will be 21\n', { useInnerText: false });

  // One line only: the second input() hits EOF. The runner has an input box, so hintEOFError.
  await stdin.fill('Minh');
  await input.run.click();
  await expect(inputBox).toContainText('EOFError', { timeout: LOAD });
  await expect(inputBox).toContainText(fill(s('vi', 'errorLine'), { line: 3 }));
  await expect(inputBox).toContainText(s('vi', 'hintEOFError'));
  await expect(inputBox).not.toContainText(s('vi', 'stdinMissing'));

  // A runner without an input box: input() gets stdinMissing instead.
  const helloBox = await runner(page, HELLO);
  await editCode(helloBox, 'vi', 'name = input()\nprint(name)');
  await parts(helloBox, 'vi').run.click();
  await expect(helloBox).toContainText('EOFError', { timeout: LOAD });
  await expect(helloBox).toContainText(s('vi', 'stdinMissing'));
  await expect(helloBox).not.toContainText(s('vi', 'hintEOFError'));
});

test('Restore after an edited run shows the original code, and it runs the original', { tag: '@network' }, async ({
  page,
}) => {
  await page.goto('/vi/dev/components/');
  const box = await runner(page, HELLO);
  const hello = parts(box, 'vi');
  const staticBlock = box.locator('[data-runner-static]');

  await editCode(box, 'vi', 'print(40 + 2)');
  await expect(staticBlock).toBeHidden();
  await hello.run.click();
  await expect(hello.status).toHaveText(done('vi'), { timeout: LOAD });
  await expect(hello.output).toHaveText('42\n', { useInnerText: false });

  await box.getByRole('button', { name: s('vi', 'reset'), exact: true }).click();
  await expect(hello.editor).toHaveCount(0);
  await expect(staticBlock).toBeVisible();
  await hello.run.click();
  await expect(hello.status).toHaveText(done('vi'), { timeout: LOAD });
  await expect(hello.output).toHaveText(HELLO_OUTPUT, { useInnerText: false });
});

// --- The lesson ml/linear-regression (vi): its three runners, with the real Pyodide. ---

const LESSON = '/vi/ml/linear-regression/';
const LESSON_SOURCE = readFileSync(
  fileURLToPath(new URL('../../src/content/docs/vi/ml/linear-regression.mdx', import.meta.url)),
  'utf8',
);
/** figureAlt={['…']} of each <PythonRunner> in the lesson, in order (undefined when it has none). */
const LESSON_ALTS = [...LESSON_SOURCE.matchAll(/<PythonRunner\b([\s\S]*?)\/>/g)].map(
  (match) => /figureAlt=\{\['([^']+)'\]\}/.exec(match[1] ?? '')?.[1],
);
// Output of `python -I src/code/ml/linear-regression/<name>.vi.py` (venv of viz.md 2.5, the versions Pyodide
// 314.0.7 ships). The lesson quotes these numbers: b = 2.0394, w = 0.1695, MSE = 0.3615; 65 m² -> 13.06,
// 300 m² -> 52.88; with the outlier w = 0.0760, b = 6.36.
const LESSON_RUNS = [
  { name: 'normal-equation', output: 'b = 2.0394\nw = 0.1695\nMSE = 0.3615\n', figures: 0 },
  {
    name: 'sklearn-fit',
    output: 'sklearn: w = 0.1695, b = 2.0394\nformula: w = 0.1695, b = 2.0394\n65 m² -> 13.06\n300 m² -> 52.88\n',
    figures: 1,
  },
  {
    name: 'outlier',
    output: 'without outlier: w = 0.1695, b = 2.04\nwith outlier:    w = 0.0760, b = 6.36\n',
    figures: 1,
  },
] as const;

test('ml/linear-regression: the three runners print the numbers the lesson quotes, and draw their figures', { tag: '@network' }, async ({
  page,
}) => {
  test.setTimeout(180_000); // three runs, the second one loads scikit-learn
  const errors = trackPageErrors(page);
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(LESSON);
  await expect(page.locator('.atlas-runner')).toHaveCount(LESSON_RUNS.length);
  expect(LESSON_ALTS).toHaveLength(LESSON_RUNS.length);

  for (const [n, run] of LESSON_RUNS.entries()) {
    const box = await runner(page, n);
    const ui = parts(box, 'vi');
    // The code shown is the file, so the output belongs to it.
    const lines = readFileSync(
      fileURLToPath(new URL(`../../src/code/ml/linear-regression/${run.name}.vi.py`, import.meta.url)),
      'utf8',
    ).trim().split(/\r?\n/);
    await expect(box.locator('[data-runner-static]')).toContainText(lines.at(-1)!.trim());
    if (n === 0) expect(requests.filter((url) => /pyodide/i.test(url)), 'before the first Run').toEqual([]);

    await ui.run.click();
    await expect(ui.status).toHaveText(done('vi'), { timeout: LOAD });
    await expect(ui.output).toHaveText(run.output, { useInnerText: false });
    await expect(box.locator('.atlas-runner-error')).toHaveCount(0);
    await expect(box).not.toContainText(s('vi', 'errorTitle'));
    await expect(ui.images).toHaveCount(run.figures);
    for (const image of await ui.images.all()) {
      await expect(image).toHaveAttribute('src', /^data:image\/png;base64,/);
      await expect(image).toHaveAttribute('alt', LESSON_ALTS[n] ?? '');
      expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    }
  }
  expect(errors).toEqual([]);
});
