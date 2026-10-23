import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Locator, type Page } from '@playwright/test';
import { LESSONS, LOCALES, type Locale } from '../../src/data/roadmap';
import { isTranslated } from '../../src/lib/roadmap';
import { lessonShape } from '../unit/fixtures/lesson-shape';
import { installContrast, type Contrast } from './helpers';

// Checks shared by every VIZ (docs/architecture/viz.md, sections 2.7–2.9, 2.12; task V5 in section 6), on every
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

/** Contrast of plot marks, key swatches and text of one VIZ. Needs installContrast(page) first. */
function measureContrast(root: Element): { marks: Contrast[]; swatches: Contrast[]; text: Contrast[] } {
  const { backgroundOf, pair } = window.atlasContrast!;

  // Marks on the plot against the plot background. Not measured on purpose (section 4.9): the grid
  // (decoration), the halo of the × and the outline of the points (both the plot background colour).
  const plot = root.querySelector('.atlas-viz-plot');
  const marks: Contrast[] = [];
  if (plot) {
    const plotBg = backgroundOf(plot);
    for (const [selector, property] of [
      ['circle.atlas-viz-point', 'fill'],
      ['line.atlas-viz-primary', 'stroke'],
      ['line.atlas-viz-reference', 'stroke'],
      ['line.atlas-viz-error', 'stroke'],
      ['line.atlas-viz-axis', 'stroke'],
      ['line.atlas-viz-marker', 'stroke'],
    ] as const) {
      for (const el of plot.querySelectorAll(selector)) {
        marks.push(pair(`${selector} ${property}`, getComputedStyle(el).getPropertyValue(property), plotBg));
      }
    }
  }

  // Swatches of the key and the readouts against the block (section 4.9, second table): 3:1 like any mark.
  const swatches: Contrast[] = [];
  for (const swatch of root.querySelectorAll('svg.atlas-viz-swatch')) {
    const background = backgroundOf(swatch);
    for (const el of swatch.querySelectorAll('line, circle')) {
      const property = el.tagName.toLowerCase() === 'circle' ? 'fill' : 'stroke';
      swatches.push(pair(`swatch ${el.getAttribute('class')} ${property}`, getComputedStyle(el).getPropertyValue(property), background));
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
  return { marks, swatches, text };
}

if (PAGES.length === 0) {
  test.skip('VIZ: no published lesson uses a VIZ yet', () => {});
}

for (const { path, count } of PAGES) {
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
          };
        }),
      );
      for (const island of islands) {
        expect(island).toEqual({ islands: 1, client: 'visible', notContent: true, pagefindIgnore: true });
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
          // Measure with every toggle on as well, so parts hidden at first are measured too.
          for (const pass of ['as loaded', 'toggles on']) {
            if (pass === 'toggles on') for (const button of await viz.getByRole('button').all()) await button.click();
            await page.mouse.move(0, 0); // no hover style on a button
            await installContrast(page);
            const { marks, swatches, text } = await viz.evaluate(measureContrast);
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

    test('(4) control: the contrast check does see a mark and a text that are too faint', async ({ page }) => {
      await page.goto(path);
      const viz = page.locator('.atlas-viz').first();
      await hydrate(viz);
      await viz.evaluate((root) => {
        const plot = root.querySelector('.atlas-viz-plot') as HTMLElement;
        const caption = root.querySelector('figcaption') as HTMLElement;
        root.querySelector('line.atlas-viz-error')?.setAttribute('style', `stroke: ${getComputedStyle(plot).backgroundColor}`);
        caption.style.color = getComputedStyle(root).backgroundColor;
      });
      await installContrast(page);
      const result = await viz.evaluate(measureContrast);
      expect(result.marks.some((m) => m.what.includes('atlas-viz-error') && m.ratio < 1.1)).toBe(true);
      expect(result.text.some((m) => m.ratio < 1.1)).toBe(true);
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
