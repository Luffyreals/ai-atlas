import { expect, test, type Locator, type Page } from '@playwright/test';
import { SETTLE_MS } from '../../src/components/viz/kit/use-settled';
import { APARTMENTS, APARTMENTS_LINEAR_FIT } from '../../src/data/datasets/apartments';
import { LOCALES, type Locale } from '../../src/data/roadmap';
import { formatString } from '../../src/i18n/format';
import { inlineMarkupLabel } from '../../src/lib/inline-markup';
import { formatNumber, MINUS } from '../../src/lib/viz/format';
import { fitLeastSquares, meanPoint, mse, type Line } from '../../src/lib/viz/linear-fit';
import { pct, toPercentX, toPercentY } from '../../src/lib/viz/scale';
import { s } from './helpers';

// LinearFitViz on the lesson ml/linear-regression (docs/architecture/viz.md, sections 4.5–4.9; task V5 (8)–(14)).
// The shared checks of every VIZ are in viz.spec.ts. Expected numbers come from src/lib/viz and the dataset
// (relative imports). Marks are counted inside .atlas-viz-plot: the key and readouts use the same classes.
// All URLs end with "/" (trailingSlash 'always').

const v = (locale: Locale, key: string) => s(locale, `vizLinearFit.${key}`);

const lessonPath = (locale: Locale) => `/${locale}/ml/linear-regression/`;
const ROWS = APARTMENTS.rows;
const CONFIG = APARTMENTS_LINEAR_FIT;
const { digits } = CONFIG;
const N = ROWS.length;
const BEST = fitLeastSquares(ROWS);
const MEAN = meanPoint(ROWS);
const INITIAL: Line = { w: CONFIG.w.initial, b: CONFIG.b.initial };
const mseLine = (locale: Locale, line: Line) =>
  formatString(v(locale, 'mseValue'), { value: formatNumber(mse(ROWS, line), digits.mse) });
const units = (locale: Locale) => ({ xUnit: APARTMENTS.x.unit[locale], yUnit: APARTMENTS.y.unit[locale] });

function viz(page: Page): Locator {
  return page.locator('.atlas-viz').filter({ has: page.locator('astro-island[component-url*="LinearFitVizIsland"]') });
}

function parts(block: Locator, locale: Locale) {
  return {
    w: block.getByRole('slider', { name: inlineMarkupLabel(v(locale, 'wLabel')), exact: true }),
    b: block.getByRole('slider', { name: inlineMarkupLabel(v(locale, 'bLabel')), exact: true }),
    toggle: block.getByRole('button', { name: v(locale, 'showBest'), exact: true }),
    plot: block.locator('.atlas-viz-plot'),
    key: block.locator('ul.atlas-viz-key > li'),
    yourMse: block.locator('.atlas-viz-readout').nth(0).locator(':scope > .atlas-viz-num'),
    bestMse: block.locator('.atlas-viz-readout').nth(1).locator(':scope > .atlas-viz-num'),
    bestRow: block.locator('.atlas-viz-readout').nth(1),
    live: block.locator('[aria-live="polite"]'),
    /** The number next to a slider's label. */
    shown: (slider: Locator) => slider.locator('xpath=..').locator('.atlas-viz-control-head .atlas-viz-num'),
  };
}

/** Scrolled to and hydrated: Astro drops `ssr` before React commits; enabled controls mean it has. */
async function hydrate(block: Locator): Promise<void> {
  await block.scrollIntoViewIfNeeded();
  await expect(block.locator('astro-island:not([ssr])')).toHaveCount(1);
  await expect(block.getByRole('slider').first()).toBeEnabled();
  await expect(block.getByRole('slider').last()).toBeEnabled();
}

/** Sets a range input the way a drag does: the native setter, then an input event (React reads it). */
async function setSlider(slider: Locator, value: number): Promise<void> {
  await slider.evaluate((input: HTMLInputElement, next) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, String(next));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  await expect(slider).toHaveValue(String(value));
}

/** Page-relative top of an element (so scrolling does not count as moving). */
const pageTop = (target: Locator) => target.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);

/** Centre of the union of the boxes of `selector` inside `root`, relative to the plot box, in percent. */
async function centreInPlot(plot: Locator, selector: string): Promise<{ x: number; y: number; px: { w: number; h: number } }> {
  return plot.evaluate((root, sel) => {
    const box = root.getBoundingClientRect();
    const rects = [...root.querySelectorAll(sel)].map((el) => el.getBoundingClientRect());
    const left = Math.min(...rects.map((r) => r.left));
    const right = Math.max(...rects.map((r) => r.right));
    const top = Math.min(...rects.map((r) => r.top));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    return {
      x: (((left + right) / 2 - box.left) / box.width) * 100,
      y: (((top + bottom) / 2 - box.top) / box.height) * 100,
      px: { w: box.width, h: box.height },
    };
  }, selector);
}

for (const locale of LOCALES) {
  test.describe(`LinearFitViz on ${lessonPath(locale)}`, () => {
    test('(8) the plot has every point and residual, the × at the mean point, a 3-item key and the first MSE', async ({
      page,
    }) => {
      await page.goto(lessonPath(locale));
      const block = viz(page);
      await expect(block).toHaveCount(1);
      await hydrate(block);
      const ui = parts(block, locale);

      await expect(ui.plot.locator('circle.atlas-viz-point')).toHaveCount(N);
      await expect(ui.plot.locator('line.atlas-viz-error')).toHaveCount(N);
      await expect(ui.plot.locator('line.atlas-viz-primary')).toHaveCount(1);
      await expect(ui.plot.locator('line.atlas-viz-reference')).toHaveCount(1);
      await expect(ui.plot.locator('line.atlas-viz-marker')).toHaveCount(2);
      await expect(ui.plot.locator('line.atlas-viz-halo')).toHaveCount(2);

      // Drawn where the data says, in real pixels (the SVG has no viewBox, coordinates are percentages).
      const box = await ui.plot.boundingBox();
      for (const [i, [x, y]] of ROWS.entries()) {
        const point = await ui.plot.locator('circle.atlas-viz-point').nth(i).boundingBox();
        expect(point, `point ${i}`).not.toBeNull();
        expect(Math.abs(point!.x + point!.width / 2 - (box!.x + (box!.width * toPercentX(x, CONFIG.xDomain)) / 100))).toBeLessThan(1);
        expect(Math.abs(point!.y + point!.height / 2 - (box!.y + (box!.height * toPercentY(y, CONFIG.yDomain)) / 100))).toBeLessThan(1);
      }
      const cross = await centreInPlot(ui.plot, 'line.atlas-viz-marker');
      expect(Math.abs(cross.x - toPercentX(MEAN.x, CONFIG.xDomain)) * (cross.px.w / 100)).toBeLessThan(1.5);
      expect(Math.abs(cross.y - toPercentY(MEAN.y, CONFIG.yDomain)) * (cross.px.h / 100)).toBeLessThan(1.5);
      const holder = ui.plot.locator('svg:has(> line.atlas-viz-marker)');
      await expect(holder).toHaveAttribute('x', pct(toPercentX(MEAN.x, CONFIG.xDomain)));
      await expect(holder).toHaveAttribute('y', pct(toPercentY(MEAN.y, CONFIG.yDomain)));
      for (const marker of await ui.plot.locator('line.atlas-viz-marker').all()) await expect(marker).toBeVisible();

      await expect(ui.key).toHaveCount(3);
      const mean = { x: formatNumber(MEAN.x, digits.meanX), y: formatNumber(MEAN.y, digits.meanY) };
      await expect(ui.key.nth(1)).toHaveText(formatString(v(locale, 'meanPoint'), mean));
      await expect(ui.key.nth(1)).toContainText('(52.4, 10.92)');
      await expect(ui.yourMse).toHaveText(mseLine(locale, INITIAL));
      await expect(ui.yourMse).toHaveText('MSE = 10.5020');
    });

    test('(9) keyboard: arrows, End, Home, Tab to the button, Space shows the best line', async ({ page }) => {
      await page.goto(lessonPath(locale));
      const block = viz(page);
      await hydrate(block);
      const ui = parts(block, locale);
      const wText = (value: number) => formatString(v(locale, 'wValueText'), { value: formatNumber(value, digits.w), ...units(locale) });
      const bText = (value: number) => formatString(v(locale, 'bValueText'), { value: formatNumber(value, digits.b), ...units(locale) });

      await ui.w.focus();
      for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
      const w3 = CONFIG.w.initial + 3 * CONFIG.w.step;
      await expect(ui.w).toHaveValue(String(w3));
      await expect(ui.w).toHaveAttribute('aria-valuetext', wText(w3));
      await expect(ui.shown(ui.w)).toHaveText('0.0150');
      await expect(ui.yourMse).toHaveText(mseLine(locale, { w: w3, b: INITIAL.b }));

      await page.keyboard.press('End');
      await expect(ui.w).toHaveValue(String(CONFIG.w.max));
      await expect(ui.w).toHaveAttribute('aria-valuetext', wText(CONFIG.w.max));
      await expect(ui.yourMse).toHaveText(mseLine(locale, { w: CONFIG.w.max, b: INITIAL.b }));

      await page.keyboard.press('Tab');
      await expect(ui.b).toBeFocused();
      await page.keyboard.press('Home');
      await expect(ui.b).toHaveValue(String(CONFIG.b.min));
      await expect(ui.shown(ui.b)).toHaveText(`${MINUS}10.50`);
      await expect(ui.b).toHaveAttribute('aria-valuetext', bText(CONFIG.b.min));
      await expect(ui.yourMse).toHaveText(mseLine(locale, { w: CONFIG.w.max, b: CONFIG.b.min }));

      await page.keyboard.press('Tab');
      await expect(ui.toggle).toBeFocused();
      await expect(ui.bestRow).not.toBeVisible();
      await page.keyboard.press('Space');
      await expect(ui.toggle).toHaveAttribute('aria-pressed', 'true');
      await expect(ui.bestRow.locator('.atlas-viz-readout-text')).toBeVisible();
      await expect(ui.bestMse).toBeVisible();
      await expect(ui.bestMse).toHaveText(
        formatString(v(locale, 'mseValue'), { value: formatNumber(BEST.mse, digits.mse) }),
      );
      await expect(ui.bestMse).toHaveText('MSE = 0.3615');
      await expect(ui.plot.locator('line.atlas-viz-reference')).toBeVisible();
      await expect(block.locator('.atlas-viz-status')).toHaveText(
        formatString(v(locale, 'bestNote'), { mse: formatNumber(BEST.mse, digits.mse) }),
      );
    });

    test('(10) five quick ArrowRight presses: the live region waits, then reads the MSE once within 1.5 s', async ({
      page,
    }) => {
      await page.goto(lessonPath(locale));
      const block = viz(page);
      await hydrate(block);
      const ui = parts(block, locale);
      const reading = (w: number) =>
        formatString(v(locale, 'announce'), { mse: formatNumber(mse(ROWS, { w, b: INITIAL.b }), digits.mse) });

      // In the page, on one clock (performance.now): when each step changed the slider, and every change of
      // the live text. So the checks below do not depend on how fast this machine presses keys.
      type Log = { steps: { t: number; value: string }[]; live: { t: number; text: string }[] };
      await page.evaluate(() => {
        (window as unknown as { atlasLog: Log }).atlasLog = { steps: [], live: [] };
      });
      await ui.w.evaluate((input: HTMLInputElement) => {
        const log = (window as unknown as { atlasLog: Log }).atlasLog;
        input.addEventListener('input', () => log.steps.push({ t: performance.now(), value: input.value }));
      });
      await ui.live.evaluate((live) => {
        const log = (window as unknown as { atlasLog: Log }).atlasLog;
        new MutationObserver(() => log.live.push({ t: performance.now(), text: live.textContent ?? '' })).observe(live, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      });

      await ui.w.focus();
      for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
      await expect(ui.w).toHaveValue('0.025');
      const spoken = reading(0.025);
      await expect(ui.live).toHaveText(spoken, { timeout: 1_500 });

      const { steps, live } = await page.evaluate(() => (window as unknown as { atlasLog: Log }).atlasLog);
      expect(steps.map((step) => Number(step.value))).toEqual([1, 2, 3, 4, 5].map((n) => INITIAL.w + n * CONFIG.w.step));
      const gaps = steps.slice(1).map((step, i) => Math.round(step.t - steps[i]!.t));
      test.info().annotations.push({ type: 'gaps between steps', description: `${gaps.join(', ')} ms` });
      // A gap of SETTLE_MS or more means the page stalled between two presses (seen under a loaded full run:
      // 1425 ms). The timer of the earlier step is then overdue and may run just after the next input event,
      // so the log pins its reading on the wrong step. The presses were not quick, which is what this test is
      // about: only the final reading (checked above) holds then.
      if (gaps.some((gap) => gap >= SETTLE_MS)) {
        test.info().annotations.push({ type: 'not checked', description: 'a gap ≥ SETTLE_MS: the presses were not quick' });
        return;
      }

      // Each change of the live text, with the step it follows and how long after that step it came.
      const changes = live.map(({ t, text }) => {
        const after = steps.findLastIndex((step) => step.t <= t);
        return { text, after, wait: after < 0 ? -1 : t - steps[after]!.t };
      });
      // The live region waits: it never changes before a step, nor sooner than SETTLE_MS after the last one
      // (a few ms of slack for timer rounding; a reading on every step would come within a frame).
      for (const change of changes) {
        expect(change.after, `"${change.text}" came before any step`).toBeGreaterThanOrEqual(0);
        expect(change.wait, `"${change.text}" came ${Math.round(change.wait)} ms after a step`).toBeGreaterThanOrEqual(
          SETTLE_MS - 5,
        );
      }
      // At most one reading per pause, each the MSE of the value it settled on; the last one after the last step.
      expect(new Set(changes.map((change) => change.after)).size).toBe(changes.length);
      for (const change of changes) expect(change.text).toBe(reading(Number(steps[change.after]!.value)));
      expect(changes.at(-1)?.after).toBe(steps.length - 1);
      // So with every gap under SETTLE_MS there is exactly one reading: the final value.
      expect(changes.map((change) => change.text)).toEqual([spoken]);
    });

    test('(11) showing and hiding the best line moves neither slider nor the button', async ({ page }) => {
      await page.goto(lessonPath(locale));
      const block = viz(page);
      await hydrate(block);
      const ui = parts(block, locale);
      // At the grid point nearest the best line, so the status shows "very close" too (two lines once on).
      await setSlider(ui.w, 0.17);
      await setSlider(ui.b, 2);
      await expect(block.locator('.atlas-viz-near')).toHaveText(v(locale, 'nearBest'));

      const positions = async () => ({
        w: await pageTop(ui.w),
        b: await pageTop(ui.b),
        toggle: await pageTop(ui.toggle),
        block: await block.evaluate((el) => el.getBoundingClientRect().height),
      });
      const before = await positions();
      // From the keyboard: a mouse left over the button would lift it 1px (hover style).
      await ui.toggle.focus();
      await page.keyboard.press('Space');
      await expect(ui.toggle).toHaveAttribute('aria-pressed', 'true');
      const on = await positions();
      await page.keyboard.press('Space');
      await expect(ui.toggle).toHaveAttribute('aria-pressed', 'false');
      const off = await positions();

      for (const [name, after] of [['on', on], ['off', off]] as const) {
        expect(Math.abs(after.w - before.w), `w slider, best line ${name}`).toBeLessThanOrEqual(0.5);
        expect(Math.abs(after.b - before.b), `b slider, best line ${name}`).toBeLessThanOrEqual(0.5);
        expect(Math.abs(after.toggle - before.toggle), `button, best line ${name}`).toBeLessThanOrEqual(0.5);
      }
      expect(Math.abs(off.block - before.block)).toBeLessThanOrEqual(0.5);
    });

    test('(13) at 375px the x and y tick labels do not overlap and stay on screen', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(lessonPath(locale));
      const block = viz(page);
      await hydrate(block);
      await page.evaluate(() => document.fonts.ready);
      const boxes = async (selector: string) =>
        block.locator(selector).evaluateAll((spans) =>
          spans.map((span) => {
            const r = span.getBoundingClientRect();
            return { text: span.textContent, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
          }),
        );
      const x = (await boxes('.atlas-viz-xticks > span')).sort((a, b) => a.left - b.left);
      expect(x.map((tick) => tick.text)).toEqual(CONFIG.xTicks.map(String));
      for (let i = 1; i < x.length; i++) {
        expect(x[i]!.left, `"${x[i - 1]!.text}" and "${x[i]!.text}"`).toBeGreaterThanOrEqual(x[i - 1]!.right);
      }
      expect(x[0]!.left).toBeGreaterThanOrEqual(0);
      expect(x.at(-1)!.right).toBeLessThanOrEqual(375);

      const y = (await boxes('.atlas-viz-yticks > span')).sort((a, b) => a.top - b.top);
      expect(y).toHaveLength(CONFIG.yTicks.length);
      for (let i = 1; i < y.length; i++) {
        expect(y[i]!.top, `"${y[i - 1]!.text}" and "${y[i]!.text}"`).toBeGreaterThanOrEqual(y[i - 1]!.bottom);
      }
      expect(y.every((tick) => tick.left >= 0)).toBe(true);
    });

    for (const scheme of ['light', 'dark'] as const) {
      test(`"very close to the best line" is readable in ${scheme} mode (≥ 4.5:1)`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(lessonPath(locale));
        const block = viz(page);
        await hydrate(block);
        const ui = parts(block, locale);
        await setSlider(ui.w, 0.17);
        await setSlider(ui.b, 2);
        const near = block.locator('p.atlas-viz-near');
        await expect(near).toHaveText(v(locale, 'nearBest'));
        const ratio = await near.evaluate((el) => {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
          const rgb = (color: string) => {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 1, 1);
            return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
          };
          let bg = 'rgba(0, 0, 0, 0)';
          for (let node: Element | null = el; node; node = node.parentElement) {
            const color = getComputedStyle(node).backgroundColor;
            if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
              bg = color;
              break;
            }
          }
          const lum = (c: number[]) =>
            c
              .map((value) => value / 255)
              .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
              .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i]!, 0);
          const [a, b] = [lum(rgb(getComputedStyle(el).color)), lum(rgb(bg))].sort((p, q) => q - p) as [number, number];
          return (a + 0.05) / (b + 0.05);
        });
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }

    test.describe('without JavaScript', () => {
      test.use({ javaScriptEnabled: false });

      test('(12) the static plot is complete; the controls are disabled and the note asks for JavaScript', async ({
        page,
      }) => {
        await page.goto(lessonPath(locale));
        const block = viz(page);
        await expect(block).toHaveCount(1);
        await block.scrollIntoViewIfNeeded();
        const ui = parts(block, locale);

        const points = ui.plot.locator('circle.atlas-viz-point');
        await expect(points).toHaveCount(N);
        for (const point of await points.all()) await expect(point).toBeVisible();
        // A vertical line has a zero-width box (Playwright calls that hidden): check length and style instead.
        const residuals = await ui.plot.locator('line.atlas-viz-error').evaluateAll((lines) =>
          lines.map((line) => ({
            visibility: getComputedStyle(line).visibility,
            display: getComputedStyle(line).display,
            height: line.getBoundingClientRect().height,
          })),
        );
        expect(residuals).toHaveLength(N);
        for (const residual of residuals) {
          expect(residual.visibility).toBe('visible');
          expect(residual.display).not.toBe('none');
          expect(residual.height).toBeGreaterThan(0); // no point sits on the first line, b = 10.9
        }
        await expect(ui.plot.locator('line.atlas-viz-marker')).toHaveCount(2);
        for (const marker of await ui.plot.locator('line.atlas-viz-marker').all()) await expect(marker).toBeVisible();
        // The first line is flat (w = 0): a zero-height box, so the same check as the residuals.
        const primary = await ui.plot.locator('line.atlas-viz-primary').evaluateAll((lines) =>
          lines.map((line) => ({ visibility: getComputedStyle(line).visibility, width: line.getBoundingClientRect().width })),
        );
        expect(primary).toHaveLength(1);
        expect(primary[0]?.visibility).toBe('visible');
        expect(primary[0]?.width).toBeGreaterThan(100);

        await expect(ui.yourMse).toHaveText(mseLine(locale, INITIAL));
        await expect(block.locator('.atlas-viz-noscript')).toBeVisible();
        await expect(block.locator('.atlas-viz-noscript')).toHaveText(s(locale, 'common.needsScript'));
        await expect(ui.w).toBeDisabled();
        await expect(ui.b).toBeDisabled();
        await expect(ui.toggle).toBeDisabled();
        await expect(block.locator('astro-island[ssr]')).toHaveCount(1);
      });
    });
  });
}

test('(14) on /en/ml/linear-regression/ the VIZ speaks English (also while the page is the vi fallback)', async ({ page }) => {
  await page.goto(lessonPath('en'));
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const block = viz(page);
  await hydrate(block);
  const ui = parts(block, 'en');
  await expect(ui.toggle).toHaveText('Show the best line');
  await expect(ui.toggle).toHaveText(v('en', 'showBest'));
  await expect(ui.key.nth(1)).toHaveText('Mean point (52.4, 10.92)');
  await expect(ui.key.nth(0)).toHaveText(APARTMENTS.itemLabel.en);
  await expect(block.locator('figcaption')).toHaveText(v('en', 'caption'));
  await expect(block.getByRole('group', { name: v('en', 'controls'), exact: true })).toHaveCount(1);
  await expect(ui.w).toHaveAttribute('aria-label', 'Weight w (slope)');
  await expect(ui.w).toHaveAttribute('aria-valuetext', '0.0000 million VND/month per m²');
  await expect(block.locator('.atlas-viz-xtitle')).toHaveText('Floor area (m²)');
  await expect(block.getByRole('img', { name: /^Scatter plot of 10 data points/ })).toHaveCount(1);
  // Nothing of the vi strings is left in the block.
  for (const key of ['showBest', 'caption', 'residual', 'yourLine']) await expect(block).not.toContainText(v('vi', key));
});
