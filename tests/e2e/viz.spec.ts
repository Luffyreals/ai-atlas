import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Locator, type Page } from '@playwright/test';
import { LESSONS, LOCALES, type Locale } from '../../src/data/roadmap';
import { isTranslated } from '../../src/lib/roadmap';
import { lessonShape } from '../unit/fixtures/lesson-shape';
import { installContrast, type Contrast } from './helpers';

// Checks shared by every VIZ (docs/architecture/viz/, sections 2.7–2.9, 2.12; task V5 in section 6), on every
// lesson page whose file uses one: /vi/<id>/ when status.vi is 'published', and /en/<id>/ (the fallback page
// shows the vi file with en strings). A new VIZ is covered here without a test of its own.
// All URLs end with "/" (trailingSlash 'always').

const DOCS_DIR = fileURLToPath(new URL('../../src/content/docs/', import.meta.url));
const ASTRO_DIR = fileURLToPath(new URL('../../dist/_astro/', import.meta.url));
const SCHEMES = ['light', 'dark'] as const;
const JS_BUDGET = 10 * 1024; // own JS of one VIZ island, gzip (section 2.9)
const PROPS_BUDGET = 8 * 1024; // the props attribute of its astro-island, as written in the HTML
const CONTROLS = 'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';

function readSource(locale: Locale, id: string): string {
  const file = ['.mdx', '.md'].map((ext) => join(DOCS_DIR, locale, id + ext)).find((path) => existsSync(path));
  if (!file) throw new Error(`no file for ${locale}/${id}`);
  return readFileSync(file, 'utf8');
}

/** VIZ tags written in a lesson file: components imported from @components/viz/. */
function vizCount(source: string): number {
  const shape = lessonShape(source);
  const names = shape.imports.flatMap((statement) => {
    const match = /^import (\w+) from '@components\/viz\/[\w/-]+\.astro'$/.exec(statement);
    return match?.[1] ? [match[1]] : [];
  });
  return names.reduce((sum, name) => sum + (shape.components[name] ?? 0), 0);
}

const PAGES = LESSONS.filter((lesson) => lesson.status.vi === 'published').flatMap((lesson) =>
  LOCALES.map((locale) => {
    const source = readSource(isTranslated(lesson, locale) ? locale : 'vi', lesson.id);
    return { path: `/${locale}/${lesson.id}/`, locale, count: vizCount(source) };
  }),
).filter((page) => page.count > 0);

/** Every VIZ of the page, scrolled to, hydrated, and its controls enabled (they are disabled until then). */
async function hydrateAll(page: Page): Promise<Locator[]> {
  const blocks = await page.locator('.atlas-viz').all();
  for (const viz of blocks) await hydrate(viz);
  return blocks;
}

async function hydrate(viz: Locator): Promise<void> {
  await viz.scrollIntoViewIfNeeded();
  await expect(viz.locator('astro-island')).toHaveCount(1);
  await expect(viz.locator('astro-island:not([ssr])')).toHaveCount(1);
  // Astro drops `ssr` when it calls hydrateRoot; React commits a little later. Enabled controls mean it did.
  await expect(viz.locator(':is(input, button, select, textarea):disabled')).toHaveCount(0);
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

// --- JS budget (section 2.9): the island file plus the chunks only it imports statically. ---

function staticImports(file: string): string[] {
  const code = readFileSync(join(ASTRO_DIR, file), 'utf8');
  // import{a as b}from"./x.js" and import"./x.js"; import("./x.js") loads later, so it is not counted.
  return [...code.matchAll(/(?:\bfrom\s*|\bimport\s*)["']\.\/([^"'/]+\.js)["']/g)].map((match) => match[1] ?? '');
}

function closure(file: string): Set<string> {
  const seen = new Set<string>();
  const todo = [file];
  while (todo.length > 0) {
    const next = todo.pop()!;
    if (seen.has(next)) continue;
    seen.add(next);
    todo.push(...staticImports(next));
  }
  return seen;
}

/** Files counted as the island's own JS, and their gzip size. */
function ownJs(islandFile: string, rendererFile: string): { files: string[]; gzip: number } {
  const all = readdirSync(ASTRO_DIR).filter((file) => file.endsWith('.js'));
  const shared = new Set<string>([...closure(rendererFile)]);
  for (const other of all.filter((file) => /^[A-Z]\w*Island\.[\w-]+\.js$/.test(file) && file !== islandFile)) {
    for (const file of closure(other)) shared.add(file);
  }
  // React itself is the renderer's, whoever imports it (section 2.9).
  for (const file of all.filter((name) => /^(?:client|jsx-runtime|react)\.[\w-]+\.js$/.test(name))) shared.add(file);
  const files = [...closure(islandFile)].filter((file) => !shared.has(file));
  const gzip = files.reduce((sum, file) => sum + gzipSync(readFileSync(join(ASTRO_DIR, file))).length, 0);
  return { files, gzip };
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
  return { marks, swatches, text, unmeasured };
}

if (PAGES.length === 0) {
  test.skip('VIZ: no published lesson uses a VIZ yet', () => {});
}

for (const { path, locale, count } of PAGES) {
  test.describe(`VIZ on ${path}`, () => {
    test('every VIZ written in the file is on the page, as one client:visible island', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.atlas-viz')).toHaveCount(count);
      const islands = await page.locator('.atlas-viz').evaluateAll((blocks) =>
        blocks.map((block) => {
          const island = block.querySelector('astro-island');
          return {
            islands: block.querySelectorAll('astro-island').length,
            client: island?.getAttribute('client'),
            notContent: block.classList.contains('not-content'),
            pagefindIgnore: block.hasAttribute('data-pagefind-ignore'),
            // The VIZ speaks the page's language, even on a fallback page showing the vi file (decision 43).
            lang: block.getAttribute('lang'),
          };
        }),
      );
      for (const island of islands) {
        expect(island).toEqual({ islands: 1, client: 'visible', notContent: true, pagefindIgnore: true, lang: locale });
      }
    });

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
      test(`(3) at 375px in ${scheme} mode: no sideways scroll, every control at least 44px tall`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 800 });
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        const width = () => page.evaluate(() => document.documentElement.scrollWidth);
        for (const viz of await hydrateAll(page)) {
          const controls = await viz.locator(CONTROLS).all();
          expect(controls.length).toBeGreaterThan(0);
          for (const control of controls) {
            const box = await control.boundingBox();
            expect(box?.height ?? 0, await control.evaluate((el) => el.outerHTML.slice(0, 80))).toBeGreaterThanOrEqual(44);
            expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(375);
          }
          expect(await width()).toBeLessThanOrEqual(375);
          // Every toggle on: the parts it shows were kept in place, so nothing gets wider.
          for (const button of await viz.getByRole('button').all()) await button.click();
          expect(await width()).toBeLessThanOrEqual(375);
          const right = await viz.evaluate((el) => el.getBoundingClientRect().right);
          expect(right).toBeLessThanOrEqual(375);
        }
      });

      test(`(4) contrast in ${scheme} mode: marks ≥ 3 on the plot, swatches ≥ 3, text ≥ 4.5`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        for (const viz of await hydrateAll(page)) {
          // Measure in every state of CONTRAST_STATES, so parts hidden at first are measured too.
          for (const pass of CONTRAST_STATES) {
            await enterState(page, viz, pass);
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
          }
        }
      });
    }

    test('(4) control: the contrast check does see a mark, a swatch and a text that are too faint', async ({ page }) => {
      await page.goto(path);
      const viz = page.locator('.atlas-viz').first();
      await hydrate(viz);
      let brokenInPlots = 0;
      // In each state (a zero ring is only drawn in the last one), one mark of each of these kinds that the
      // VIZ has, on its plots and in its swatches, made the colour of what is behind it (a ring by its
      // stroke: its inside is that colour already). The inline style stays until React redraws the mark.
      for (const state of CONTRAST_STATES) {
        await enterState(page, viz, state);
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
          // Undo the previous state's breaks first, so each state is checked on its own.
          for (const el of root.querySelectorAll('[data-atlas-broken]')) {
            el.removeAttribute('style');
            el.removeAttribute('data-atlas-broken');
          }
          const out: { where: 'plot' | 'swatch'; what: string }[] = [];
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
          (root.querySelector('figcaption') as HTMLElement).style.color = getComputedStyle(root).backgroundColor;
          return out;
        });
        brokenInPlots += broken.filter((b) => b.where === 'plot').length;
        await installContrast(page);
        const result = await viz.evaluate(measureContrast);
        for (const { where, what } of broken) {
          const list = where === 'plot' ? result.marks : result.swatches;
          expect(list.some((m) => m.what.includes(what) && m.ratio < 1.1), `${state}, ${where}: ${what} seen as too faint`).toBe(
            true,
          );
        }
        expect(result.text.some((m) => m.ratio < 1.1), `${state}: the faint caption seen`).toBe(true);
      }
      expect(brokenInPlots, 'a mark kind to break').toBeGreaterThan(0);
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

    test('(7) each VIZ island: own JS ≤ 10 KB gzip, props attribute ≤ 8 KB', async ({ page, request }) => {
      await page.goto(path);
      const islands = await page.locator('.atlas-viz astro-island').evaluateAll((list) =>
        list.map((island) => ({
          uid: island.getAttribute('uid') ?? '',
          component: island.getAttribute('component-url') ?? '',
          renderer: island.getAttribute('renderer-url') ?? '',
        })),
      );
      expect(islands).toHaveLength(count);
      const html = await (await request.get(path)).text();
      for (const island of islands) {
        const file = island.component.replace(/^\/_astro\//, '');
        const renderer = island.renderer.replace(/^\/_astro\//, '');
        expect(existsSync(join(ASTRO_DIR, file)), `dist/_astro/${file}`).toBe(true);
        const own = ownJs(file, renderer);
        expect(own.files).toContain(file);
        test.info().annotations.push({ type: 'own JS', description: `${file}: ${own.files.join(', ')} = ${own.gzip} B gzip` });
        expect(own.gzip, `${own.files.join(' + ')}`).toBeLessThanOrEqual(JS_BUDGET);

        // The attribute as written in the HTML (entities included), found by the island's uid.
        const tag = new RegExp(`<astro-island[^>]*\\buid="${island.uid}"[^>]*>`).exec(html)?.[0] ?? '';
        const props = /\bprops="([^"]*)"/.exec(tag)?.[1];
        expect(props, `props of island ${island.uid}`).toBeDefined();
        test.info().annotations.push({ type: 'props', description: `${file}: ${props?.length} characters` });
        expect(props?.length ?? Infinity).toBeLessThanOrEqual(PROPS_BUDGET);
      }
    });
  });
}
