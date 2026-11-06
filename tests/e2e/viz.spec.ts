import { expect, test, type ConsoleMessage, type Locator, type Page } from '@playwright/test';
import { installContrast, type Contrast } from './helpers';
import { CONTROLS, hydrate, hydrateAll, PAGES, SCHEMES } from './viz-pages';

// Checks shared by every VIZ (docs/architecture/viz/, sections 2.7–2.9, 2.12; task V5 in section 6), on every
// lesson page whose file uses one: /vi/<id>/ when status.vi is 'published', and /en/<id>/ (the fallback page
// shows the vi file with en strings). A new VIZ is covered here without a test of its own.
// The checks that do not depend on the project's viewport (island attributes, the 375px check, JS and props
// budget) are in viz-meta.spec.ts, desktop only (docs/architecture/llm-lessons.md section 2.10, E1).
// All URLs end with "/" (trailingSlash 'always').


/** Console errors and uncaught exceptions, from the moment this is called. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message: ConsoleMessage) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

// --- Contrast (WCAG 2.x): the core (rgba, backgroundOf, luminance, pair) is in helpers.ts. Runs in the page. ---

/**
 * States a contrast test walks through, so marks that only some states draw are measured too: every toggle
 * pressed in turn (Ridge then Lasso: the last one wins), then every slider at its end (RegularizationViz
 * draws its "exactly 0" rings only with Lasso at a λ above 0; at λ = 0 it draws bars and triangles).
 * A Run button (GradientDescentViz) is pressed too: its animation is still going while 'toggles on' is
 * measured (step dots appear as it goes; their colour is also measured on the key swatch); no button is ever disabled, so no click waits on it (section 12.2.7).
 */
const CONTRAST_STATES = ['as loaded', 'toggles on', 'sliders at the end'] as const;
type ContrastState = (typeof CONTRAST_STATES)[number];

/** Moves a hydrated VIZ from the previous state of CONTRAST_STATES to `state`. */
async function enterState(page: Page, viz: Locator, state: ContrastState): Promise<void> {
  if (state === 'toggles on') for (const button of await viz.getByRole('button').all()) await button.click();
  if (state === 'sliders at the end') {
    for (const slider of await viz.getByRole('slider').all()) {
      await slider.focus();
      await page.keyboard.press('End');
    }
  }
}

/**
 * A table VIZ: its bars are HTML spans in a `.atlas-viz-meter` cell of a table row, not marks on an SVG plot
 * (SamplingViz, docs/architecture/llm-lessons.md section 4.6.8). Detected by the DOM, not by the lesson.
 */
const METER = '.atlas-viz-meter';

/**
 * A table VIZ whose sliders cut rows away (SamplingViz): only such a VIZ draws the dashed outline of a removed
 * row. A table VIZ without sliders (BpeMergeViz, docs/architecture/viz/bpe-merge.md: pair counts, one solid bar
 * per row, stepped with buttons) never removes a row, so its solid bars are measured but no outline is required.
 */
async function cutsRows(viz: Locator): Promise<boolean> {
  return (await viz.locator(METER).count()) > 0 && (await viz.getByRole('slider').count()) > 0;
}

/**
 * Enters each state a contrast test measures, and yields its name once there. Every VIZ: CONTRAST_STATES, as
 * before. A table VIZ then also gets each slider at its start in turn, the others left at their end: only a
 * cut draws a removed row, and its dashed outline needs a value before the cut above 0 (SamplingViz: with
 * every slider at its end, k and p cut nothing; at T = 0 the removed rows have no faint bar at all; k = 1 or
 * p = 0.05 at T = 2 cut 9 rows that keep their faint bar, so it turns into the dashed outline).
 */
async function* contrastStates(page: Page, viz: Locator): AsyncGenerator<string> {
  for (const state of CONTRAST_STATES) {
    await enterState(page, viz, state);
    yield state;
  }
  if ((await viz.locator(METER).count()) === 0) return;
  for (const [i, slider] of (await viz.getByRole('slider').all()).entries()) {
    await slider.focus();
    await page.keyboard.press('Home');
    yield `slider ${i} at its start`;
    await slider.focus();
    await page.keyboard.press('End');
  }
}

/** Contrast of plot marks, key swatches and text of one VIZ. Needs installContrast(page) first. */
function measureContrast(root: Element): {
  marks: Contrast[];
  swatches: Contrast[];
  text: Contrast[];
  unmeasured: string[];
} {
  const { backgroundOf, pair } = window.atlasContrast!;
  const SHAPES = 'line, circle, polyline, polygon, path, rect, ellipse';

  // Marks on every plot (a VIZ may have more than one, e.g. an error chart) against the plot background.
  // Not measured on purpose (sections 4.9, 9.4.7 and 10.4.6): the grid (decoration), the halo of the ×, the
  // outline of the points and the inside of a ring, a triangle or a zero ring (the plot background colour).
  const marks: Contrast[] = [];
  const unmeasured: string[] = [];
  for (const [n, plot] of [...root.querySelectorAll('.atlas-viz-plot')].entries()) {
    const plotBg = backgroundOf(plot);
    const measured = new Set<Element>();
    for (const [selector, property] of [
      ['circle.atlas-viz-point', 'fill'],
      ['circle.atlas-viz-ring', 'stroke'],
      ['polygon.atlas-viz-ring', 'stroke'],
      ['line.atlas-viz-primary', 'stroke'],
      ['polyline.atlas-viz-primary', 'stroke'],
      ['polyline.atlas-viz-series', 'stroke'], // also the second series (atlas-viz-series atlas-viz-series-alt)
      ['polyline.atlas-viz-guide', 'stroke'],
      ['line.atlas-viz-reference', 'stroke'],
      ['line.atlas-viz-error', 'stroke'],
      ['line.atlas-viz-axis', 'stroke'],
      ['line.atlas-viz-marker', 'stroke'],
      ['line.atlas-viz-cursor', 'stroke'],
      ['line.atlas-viz-bar', 'stroke'], // a coefficient bar and its 2px stub (section 10.4.5)
      ['circle.atlas-viz-zero', 'stroke'], // a coefficient exactly 0: a hollow ring on the zero line
      ['polyline.atlas-viz-level', 'stroke'], // a contour line of the MSE (section 12.4.6)
      ['polyline.atlas-viz-path', 'stroke'], // the gradient descent path, one point at step 0
      ['circle.atlas-viz-step', 'fill'], // a dot per step of the path
    ] as const) {
      for (const el of plot.querySelectorAll(selector)) {
        measured.add(el);
        const what = `plot ${n} ${el.tagName.toLowerCase()}.${el.getAttribute('class')?.trim().replace(/\s+/g, '.')} ${property}`;
        marks.push(pair(what, getComputedStyle(el).getPropertyValue(property), plotBg));
      }
    }
    // A new kind of mark must be added above (or here, if it is decoration), not left out silently.
    for (const el of plot.querySelectorAll(SHAPES)) {
      if (measured.has(el) || el.matches('.atlas-viz-grid-line, .atlas-viz-halo')) continue;
      unmeasured.push(`plot ${n}: <${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}">`);
    }
  }

  // A table VIZ: the bar of each row against the meter behind it, 3:1 like a mark on a plot. The solid bar by
  // its fill; a removed row's faint bar is a hollow dashed outline, measured by its border. Not measured on
  // purpose: a kept row's faint bar (the value before the cut), since the solid bar on top is at least as
  // wide (renormalising only raises a kept value) and hides it.
  for (const [n, meter] of [...root.querySelectorAll('.atlas-viz-meter')].entries()) {
    const meterBg = backgroundOf(meter);
    const removed = meter.closest('[data-removed]') !== null;
    for (const el of meter.querySelectorAll('*')) {
      const tag = `meter ${n} ${el.tagName.toLowerCase()}.${el.getAttribute('class')?.trim().replace(/\s+/g, '.')}`;
      const style = getComputedStyle(el);
      if (el.matches('span.atlas-viz-bar')) {
        marks.push(pair(`${tag} background-color`, style.backgroundColor, meterBg));
      } else if (el.matches('span.atlas-viz-bar-base') && removed) {
        if (style.borderTopStyle !== 'dashed' || parseFloat(style.borderTopWidth) < 1) {
          unmeasured.push(`${tag} (removed row): no dashed outline, but ${style.borderTopStyle} ${style.borderTopWidth}`);
        }
        marks.push(pair(`${tag} border-color (removed row)`, style.borderTopColor, meterBg));
      } else if (!el.matches('span.atlas-viz-bar-base')) {
        unmeasured.push(`${tag}`);
      }
    }
  }

  // A grid of numbered cells (ConvolutionViz, viz/convolution.md): the accent frame of the window or of the
  // chosen cell, 3:1 against the grid's background (the frame's halo is that colour).
  for (const [n, frame] of [...root.querySelectorAll('.atlas-viz-frame')].entries()) {
    marks.push(pair(`frame ${n} border-color`, getComputedStyle(frame).borderTopColor, backgroundOf(frame)));
  }

  // Swatches of the key and the readouts against the block (section 4.9, second table): 3:1 like any mark.
  // A filled point is measured by its fill; a ring, a zero ring, a triangle and every line by their stroke
  // (the inside of a ring is the plot background on purpose, sections 9.4.7 and 10.4.6).
  const swatches: Contrast[] = [];
  for (const swatch of root.querySelectorAll('svg.atlas-viz-swatch')) {
    const background = backgroundOf(swatch);
    for (const el of swatch.querySelectorAll(SHAPES)) {
      const hollow = el.matches('.atlas-viz-ring, .atlas-viz-zero');
      const property = el.tagName.toLowerCase() === 'circle' && !hollow ? 'fill' : 'stroke';
      const what = `swatch ${el.tagName.toLowerCase()}.${el.getAttribute('class')?.trim().replace(/\s+/g, '.')} ${property}`;
      swatches.push(pair(what, getComputedStyle(el).getPropertyValue(property), background));
    }
  }

  // Every visible text against the nearest coloured background (the block, a button).
  const text: Contrast[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    const words = (node.textContent ?? '').trim();
    if (!parent || !words) continue;
    if (parent.closest('.sr-only, .katex-mathml, noscript')) continue;
    if (!parent.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue;
    text.push(pair(`"${words.slice(0, 40)}"`, getComputedStyle(parent).color, backgroundOf(parent)));
  }
  // A cell with a signed fill draws it in its ::before at some opacity, which backgroundOf does not see: its
  // number is measured again on that fill, laid over the cell's own background.
  const { rgba, over } = window.atlasContrast!;
  for (const cell of root.querySelectorAll('.atlas-viz-cell[data-fill]')) {
    const before = getComputedStyle(cell, '::before');
    const [r, g, b, a] = rgba(before.backgroundColor);
    const fill = over([r, g, b, a * parseFloat(before.opacity)], backgroundOf(cell));
    text.push(pair(`cell "${(cell.textContent ?? '').trim()}" on its fill`, getComputedStyle(cell).color, fill));
  }
  return { marks, swatches, text, unmeasured };
}

if (PAGES.length === 0) {
  test.skip('VIZ: no published lesson uses a VIZ yet', () => {});
}

for (const { path } of PAGES) {
  test.describe(`VIZ on ${path}`, () => {
    test('(1) a VIZ more than 1.5 screens down waits: still ssr, no request for its code; scrolled to, it hydrates', async ({
      page,
    }) => {
      const requests: string[] = [];
      page.on('request', (request) => requests.push(new URL(request.url()).pathname));
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const blocks = await page.locator('.atlas-viz').evaluateAll((list) =>
        list.map((block) => {
          const island = block.querySelector('astro-island');
          return {
            top: block.getBoundingClientRect().top,
            url: island?.getAttribute('component-url') ?? '',
            ssr: island?.hasAttribute('ssr') ?? false,
          };
        }),
      );
      const screen = await page.evaluate(() => window.innerHeight);
      const isFar = (block: (typeof blocks)[number]) => block.top > 1.5 * screen;
      test.skip(!blocks.some(isFar), 'no VIZ starts more than 1.5 screens down on this page');

      for (const [i, block] of blocks.entries()) {
        if (!isFar(block)) continue;
        expect(block.url, `VIZ ${i}: component-url`).toMatch(/^\/_astro\/\w+Island\.[\w-]+\.js$/);
        expect(block.ssr, `VIZ ${i} (top ${block.top}px) is still build HTML`).toBe(true);
        // Its code is not loaded, unless an island higher up uses the same file.
        if (blocks.every((other) => other.url !== block.url || isFar(other))) {
          expect(requests.filter((url) => url === block.url), `VIZ ${i}: ${block.url}`).toEqual([]);
        }
      }

      const vizs = page.locator('.atlas-viz');
      for (const [i, block] of blocks.entries()) {
        await hydrate(vizs.nth(i));
        expect(requests, `VIZ ${i}: ${block.url} requested once scrolled to`).toContain(block.url);
      }
    });

    test('(2) each VIZ keeps its height through hydration (±1px)', async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const vizs = await page.locator('.atlas-viz').all();
      let measured = 0;
      for (const viz of vizs) {
        if ((await viz.locator('astro-island[ssr]').count()) === 0) continue; // already hydrated near the top
        const before = await viz.evaluate((el) => el.getBoundingClientRect().height);
        await hydrate(viz);
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
        const after = await viz.evaluate((el) => el.getBoundingClientRect().height);
        expect(Math.abs(after - before), `height ${before}px before, ${after}px after`).toBeLessThanOrEqual(1);
        measured++;
      }
      test.skip(measured === 0, 'every VIZ hydrated before it could be measured');
    });

    for (const scheme of SCHEMES) {

      test(`(4) contrast in ${scheme} mode: marks ≥ 3 on the plot, swatches ≥ 3, text ≥ 4.5`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        for (const viz of await hydrateAll(page)) {
          // A table VIZ must have shown a removed row's dashed outline in one of its states, or that part of
          // the check measured nothing.
          const table = await cutsRows(viz);
          let outlines = 0;
          // Measure in every state of contrastStates, so parts hidden at first are measured too.
          for await (const pass of contrastStates(page, viz)) {
            await page.mouse.move(0, 0); // no hover style on a button
            await installContrast(page);
            const { marks, swatches, text, unmeasured } = await viz.evaluate(measureContrast);
            expect(unmeasured, 'marks on a plot that measureContrast does not know').toEqual([]);
            const lowest = (list: Contrast[]) => list.reduce((low, m) => (m.ratio < low.ratio ? m : low), list[0]!);
            test.info().annotations.push({
              type: `contrast ${pass}`,
              description: [marks, swatches, text]
                .map((list) => (list.length ? `${lowest(list).what} ${lowest(list).ratio}` : '-'))
                .join(' | '),
            });
            expect(marks.length, 'marks measured').toBeGreaterThan(0);
            expect(text.length, 'text measured').toBeGreaterThan(0);
            expect(marks.filter((m) => m.ratio < 3), `${pass}: marks below 3:1`).toEqual([]);
            expect(swatches.filter((m) => m.ratio < 3), `${pass}: swatches below 3:1`).toEqual([]);
            expect(text.filter((m) => m.ratio < 4.5), `${pass}: text below 4.5:1`).toEqual([]);
            outlines += marks.filter((m) => m.what.includes('(removed row)')).length;
          }
          if (table) expect(outlines, 'dashed outlines of removed rows measured').toBeGreaterThan(0);
        }
      });
    }

    test('(4) control: the contrast check does see a mark, a swatch and a text that are too faint', async ({ page }) => {
      await page.goto(path);
      const viz = page.locator('.atlas-viz').first();
      await hydrate(viz);
      const table = await cutsRows(viz);
      let brokenInPlots = 0;
      const brokenInTable = new Set<string>();
      // In each state (a zero ring is only drawn in the last one), one mark of each of these kinds that the
      // VIZ has, on its plots and in its swatches, made the colour of what is behind it (a ring by its
      // stroke: its inside is that colour already). The inline style stays until React redraws the mark.
      // A table VIZ: one solid bar and one dashed outline of a removed row, made the colour of their meter.
      for await (const state of contrastStates(page, viz)) {
        await page.mouse.move(0, 0);
        const broken = await viz.evaluate((root) => {
          const kinds = [
            ['line.atlas-viz-error', 'stroke'],
            ['circle.atlas-viz-ring', 'stroke'],
            ['polygon.atlas-viz-ring', 'stroke'],
            ['line.atlas-viz-bar', 'stroke'],
            ['circle.atlas-viz-zero', 'stroke'],
            ['polyline.atlas-viz-path', 'stroke'],
          ] as const;
          // Undo the previous state's breaks first, so each state is checked on its own. The attribute holds
          // the inline style the element had (an HTML bar has its width there).
          for (const el of root.querySelectorAll('[data-atlas-broken]')) {
            const style = el.getAttribute('data-atlas-broken') ?? '';
            if (style) el.setAttribute('style', style);
            else el.removeAttribute('style');
            el.removeAttribute('data-atlas-broken');
          }
          const out: { where: 'plot' | 'swatch' | 'meter'; what: string }[] = [];
          for (const [where, scope, behind] of [
            ['plot', '.atlas-viz-plot', '.atlas-viz-plot'],
            ['swatch', 'svg.atlas-viz-swatch', '.atlas-viz'],
          ] as const) {
            for (const [selector, property] of kinds) {
              const el = root.querySelector(`${scope} ${selector}`);
              if (!el) continue;
              const bg = getComputedStyle(el.closest(behind) as Element).backgroundColor;
              el.setAttribute('style', `${property}: ${bg}`);
              el.setAttribute('data-atlas-broken', '');
              out.push({ where, what: `${selector} ${property}` });
            }
          }
          for (const [selector, property, what] of [
            ['.atlas-viz-meter > span.atlas-viz-bar', 'background-color', 'span.atlas-viz-bar background-color'],
            [
              '[data-removed] .atlas-viz-meter > span.atlas-viz-bar-base',
              'border-color',
              'span.atlas-viz-bar-base border-color (removed row)',
            ],
          ] as const) {
            const el = root.querySelector<HTMLElement>(selector);
            if (!el) continue;
            el.setAttribute('data-atlas-broken', el.getAttribute('style') ?? '');
            el.style.setProperty(property, getComputedStyle(el.closest('.atlas-viz-meter') as Element).backgroundColor);
            out.push({ where: 'meter', what });
          }
          // A grid VIZ: the frame of the window, made the colour of its grid.
          const frame = root.querySelector<HTMLElement>('.atlas-viz-frame');
          if (frame) {
            frame.setAttribute('data-atlas-broken', frame.getAttribute('style') ?? '');
            frame.style.borderColor = getComputedStyle(frame.parentElement as Element).backgroundColor;
            out.push({ where: 'plot', what: 'frame 0 border-color' });
          }
          (root.querySelector('figcaption') as HTMLElement).style.color = getComputedStyle(root).backgroundColor;
          return out;
        });
        brokenInPlots += broken.filter((b) => b.where !== 'swatch').length;
        for (const b of broken) if (b.where === 'meter') brokenInTable.add(b.what);
        await installContrast(page);
        const result = await viz.evaluate(measureContrast);
        for (const { where, what } of broken) {
          const list = where === 'swatch' ? result.swatches : result.marks;
          expect(list.some((m) => m.what.includes(what) && m.ratio < 1.1), `${state}, ${where}: ${what} seen as too faint`).toBe(
            true,
          );
        }
        expect(result.text.some((m) => m.ratio < 1.1), `${state}: the faint caption seen`).toBe(true);
      }
      expect(brokenInPlots, 'a mark kind to break').toBeGreaterThan(0);
      if (table) {
        expect([...brokenInTable].sort(), 'both kinds of HTML bar broken in some state').toEqual([
          'span.atlas-viz-bar background-color',
          'span.atlas-viz-bar-base border-color (removed row)',
        ]);
      }
    });

    test('(5) Tab goes through every control in DOM order, each with the focus ring, then leaves the VIZ', async ({
      page,
    }) => {
      await page.goto(path);
      for (const viz of await hydrateAll(page)) {
        const controls = viz.locator(CONTROLS);
        const n = await controls.count();
        expect(n).toBeGreaterThan(0);
        // A stand-in for "the last thing before the VIZ": Tab from it goes into the VIZ.
        await viz.evaluate((el) => {
          document.getElementById('atlas-test-before')?.remove();
          const before = document.createElement('button');
          before.id = 'atlas-test-before';
          before.textContent = 'before';
          el.before(before);
          before.focus();
        });
        const accent = await page.evaluate(() => {
          const probe = document.createElement('span');
          probe.style.color = 'var(--sl-color-accent)';
          document.querySelector('.atlas-viz')?.append(probe);
          const color = getComputedStyle(probe).color;
          probe.remove();
          return color;
        });
        for (let i = 0; i < n; i++) {
          await page.keyboard.press('Tab');
          const control = controls.nth(i);
          await expect(control).toBeFocused();
          const ring = await control.evaluate((el) => {
            const style = getComputedStyle(el);
            return {
              focusVisible: el.matches(':focus-visible'),
              style: style.outlineStyle,
              width: parseFloat(style.outlineWidth),
              color: style.outlineColor,
            };
          });
          expect(ring, await control.evaluate((el) => el.outerHTML.slice(0, 80))).toEqual({
            focusVisible: true,
            style: 'solid',
            width: 2,
            color: accent,
          });
        }
        await page.keyboard.press('Tab');
        expect(await viz.evaluate((el) => el.contains(document.activeElement))).toBe(false);
      }
    });

    test('(6) loading, hydrating and using each VIZ logs no error', async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(path);
      for (const viz of await hydrateAll(page)) {
        for (const slider of await viz.getByRole('slider').all()) {
          await slider.focus();
          for (const key of ['ArrowRight', 'ArrowRight', 'End', 'Home', 'PageUp']) await page.keyboard.press(key);
        }
        for (const button of await viz.getByRole('button').all()) {
          await button.click();
          await button.click();
        }
      }
      await page.waitForTimeout(1_000); // the live region settles after 600 ms
      expect(errors).toEqual([]);
    });

  });
}
