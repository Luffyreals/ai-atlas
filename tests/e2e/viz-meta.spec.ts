import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { CONTROLS, hydrateAll, PAGES, SCHEMES } from './viz-pages';

// VIZ checks that do not depend on the project's viewport (docs/architecture/viz/README.md, sections 2.7–2.9, 2.12):
// island attributes, JS and props budget (they read the DOM, the HTML and dist/), and the 375px check, which
// sets its own viewport and so gives the same result in both projects. Desktop only (playwright.config.ts:
// the mobile project ignores *-meta.spec.ts; docs/architecture/llm-lessons.md section 2.10, E1). The other
// VIZ checks are in viz.spec.ts. All URLs end with "/" (trailingSlash 'always').

const ASTRO_DIR = fileURLToPath(new URL('../../dist/_astro/', import.meta.url));
const JS_BUDGET = 10 * 1024; // own JS of one VIZ island, gzip (section 2.9)
const PROPS_BUDGET = 8 * 1024; // the props attribute of its astro-island, as written in the HTML

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
    }

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
