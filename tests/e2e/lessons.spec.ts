import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { expect, test } from '@playwright/test';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { LOCALES } from '../../src/data/roadmap';
import { formatString } from '../../src/i18n/format';
import rehypeKatexA11y from '../../src/lib/rehype-katex-a11y';
import { figureCount, lessonShape } from '../unit/fixtures/lesson-shape';
import { axNames, contentLocale, installContrast, isNarrow, s, type Contrast } from './helpers';
import { DOCS_DIR, pathOf, readSource, WITH_PAGE } from './lesson-pages';

// Lesson pages: the tests that depend on the viewport (static figures, no sideways scroll, display formulas
// at 375px), so they run in both projects, desktop and mobile (375px). The tests that do not (meta tags,
// sitemap, sidebar, KaTeX, Prerequisites, component count, language select, links to lessons) are in
// lessons-meta.spec.ts, desktop only (docs/architecture/llm-lessons.md section 2.10, E1).
// Expectations come from src/data/roadmap.ts (hasPage, isTranslated), so the same tests hold while every
// lesson is planned and once lessons are published. All URLs end with "/" (trailingSlash 'always').

// --- Static figures (docs/architecture/viz.md, section 8.2 d–h). Both functions run in the page. ---

const FIGURE_BUDGET = { chars: 10_000, elements: 200 }; // outerHTML of one figure.atlas-figure (section 8.2 g)
const FIGURE_MIN_TEXT_PX = 12; // every visible text, at 375px and on a desktop (section 8.2 e)

interface FigureReport {
  id: string;
  lang: string | null;
  caption: string;
  /** Visible svg.atlas-fig-svg: exactly one, the other layout (if any) is display: none. */
  visibleSvgs: number;
  svg: { role: string | null; label: string; description: string } | null;
  duplicateIds: string[];
  /** Elements that are JS or load another file. */
  forbidden: string[];
  /** Without the KaTeX of the caption (section 11.5 T3): the budget is for the hand-drawn SVG. */
  chars: number;
  elements: number;
  /** The KaTeX trees of the caption, counted apart for the annotation. */
  katexChars: number;
  katexElements: number;
  texts: number;
  smallestPx: number;
  /** Text too small, outside the viewBox, or out of its box. */
  textIssues: string[];
}

/** Structure, budget and text geometry of one figure, after document.fonts.ready. */
function inspectFigure(figure: Element, minPx: number): FigureReport {
  const svgs = [...figure.querySelectorAll<SVGSVGElement>('svg.atlas-fig-svg')];
  const visible = svgs.filter((svg) => svg.checkVisibility());
  const svg = visible.length === 1 ? (visible[0] ?? null) : null;
  const describedBy = svg?.getAttribute('aria-describedby') ?? '';
  const ids = [figure, ...figure.querySelectorAll('[id]')].map((el) => el.id).filter(Boolean);
  const forbidden = [
    ...figure.querySelectorAll('astro-island, script, img, image, foreignObject, foreignobject, iframe, object, embed, use'),
  ]
    .filter((el) => !(el.tagName === 'use' && (el.getAttribute('href') ?? el.getAttribute('xlink:href') ?? '').startsWith('#')))
    .map((el) => el.tagName);

  const textIssues: string[] = [];
  let smallestPx = Infinity;
  let texts = 0;
  if (svg) {
    const box = svg.viewBox.baseVal;
    type Box = { x: number; y: number; width: number; height: number };
    const inside = (b: Box, outer: Box, slack: number) =>
      b.x >= outer.x - slack &&
      b.y >= outer.y - slack &&
      b.x + b.width <= outer.x + outer.width + slack &&
      b.y + b.height <= outer.y + outer.height + slack;
    const show = (b: Box) => [b.x, b.y, b.width, b.height].map((v) => Math.round(v * 10) / 10).join(' ');
    for (const text of svg.querySelectorAll<SVGTextElement>('text')) {
      const spans = [...text.querySelectorAll('tspan')];
      const lines = spans.length > 0 ? spans : [text];
      const words = lines.map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim()).join(' / ');
      if (!words.replace(/[\s/]/g, '')) continue;
      texts++;
      // Font size in viewBox units, times the viewBox-to-screen scale: the size on screen.
      const scale = text.getScreenCTM()?.a ?? 0;
      for (const el of lines) {
        const px = Math.round(parseFloat(getComputedStyle(el).fontSize) * scale * 100) / 100;
        smallestPx = Math.min(smallestPx, px);
        if (!(px >= minPx)) textIssues.push(`"${(el.textContent ?? '').trim()}": ${px}px, under ${minPx}px`);
      }
      const b = text.getBBox();
      if (!inside(b, box, 0.5)) textIssues.push(`"${words}": box ${show(b)} outside the viewBox ${show(box)}`);
      const rect = text.closest('.atlas-fig-node')?.querySelector<SVGRectElement>(':scope > rect');
      if (rect) {
        const r = rect.getBBox();
        if (!inside(b, r, 1)) textIssues.push(`"${words}": box ${show(b)} outside its node ${show(r)}`);
      }
    }
  }
  // Outermost .katex trees only (none sits inside another), so nothing is subtracted twice.
  const katex = [...figure.querySelectorAll('.katex')].filter((el) => !el.parentElement?.closest('.katex'));
  const katexChars = katex.reduce((sum, el) => sum + el.outerHTML.length, 0);
  const katexElements = figure.querySelectorAll('.katex, .katex *').length;
  return {
    id: figure.id,
    lang: figure.getAttribute('lang'),
    caption: (figure.querySelector('figcaption')?.textContent ?? '').trim(),
    visibleSvgs: visible.length,
    svg: svg && {
      role: svg.getAttribute('role'),
      label: (svg.getAttribute('aria-label') ?? '').trim(),
      description: describedBy ? (document.getElementById(describedBy)?.textContent ?? '').trim() : '',
    },
    duplicateIds: ids.filter((id) => document.querySelectorAll(`[id="${CSS.escape(id)}"]`).length !== 1),
    forbidden,
    chars: figure.outerHTML.length - katexChars,
    elements: figure.querySelectorAll('*').length + 1 - katexElements,
    katexChars,
    katexElements,
    texts,
    smallestPx,
    textIssues,
  };
}

/**
 * Text ≥ 4.5 against the nearest background: its box, a shaded region its centre lies in (section 11.5 T2),
 * or the page. Marks ≥ 3 against the page (T1), and also against the fill of every region they run over
 * (an axis through a region, section 11.4.3). Not measured on purpose: the inside of a box (the background
 * of its text), the fill of a region (decoration) and the halo of a touch dot (the page colour). Any other
 * shape is returned as unmeasured, so a new kind of mark is added here, not left out silently.
 */
function figureContrast(figure: Element): { text: Contrast[]; marks: Contrast[]; unmeasured: string[] } {
  const { backgroundOf, over, rgba, pair } = window.atlasContrast!;
  const text: Contrast[] = [];
  const marks: Contrast[] = [];
  const unmeasured: string[] = [];
  const caption = figure.querySelector('figcaption');
  if (caption) text.push(pair('figcaption', getComputedStyle(caption).color, backgroundOf(caption)));

  // A point of `el`'s user space, in `region`'s user space (through the svg viewport: an ellipse is rotated).
  const inRegion = (el: SVGGraphicsElement, x: number, y: number, region: SVGGeometryElement): boolean => {
    const from = el.getCTM();
    const to = region.getCTM();
    if (!from || !to) return false;
    return region.isPointInFill(new DOMPoint(x, y).matrixTransform(from).matrixTransform(to.inverse()));
  };
  // The centre, and points along the outline of a shape (its stroke, or the edge of its fill).
  const samples = (el: SVGGeometryElement): [number, number][] => {
    const length = el.getTotalLength();
    const along = Array.from({ length: 24 }, (_, i) => el.getPointAtLength((length * i) / 24));
    const box = el.getBBox();
    return [[box.x + box.width / 2, box.y + box.height / 2], ...along.map((p): [number, number] => [p.x, p.y])];
  };
  // "ellipse.atlas-fig-level[touch]", or "g.atlas-fig-node > rect[accent]" for a shape without a class.
  const describe = (el: Element) => {
    const tone = el.closest('[data-tone]')?.getAttribute('data-tone');
    const name = (node: Element) =>
      `${node.tagName.toLowerCase()}${(node.getAttribute('class') ?? '').trim().replace(/^|\s+/g, '.').replace(/^\.$/, '')}`;
    const self = el.getAttribute('class') || !el.parentElement ? name(el) : `${name(el.parentElement)} > ${name(el)}`;
    return `${self}${tone ? `[${tone}]` : ''}`;
  };

  for (const svg of figure.querySelectorAll('svg.atlas-fig-svg')) {
    if (!svg.checkVisibility()) continue;
    const page = backgroundOf(svg);
    const regions = [...svg.querySelectorAll<SVGGeometryElement>('.atlas-fig-region')];
    const regionBg = (region: Element) => over(rgba(getComputedStyle(region).fill), page);

    for (const el of svg.querySelectorAll<SVGTextElement>('text')) {
      const spans = [...el.querySelectorAll('tspan')];
      const words = (spans.length > 0 ? spans : [el]).map((line) => (line.textContent ?? '').trim()).join(' / ');
      if (!words.replace(/[\s/]/g, '')) continue;
      const rect = el.closest('.atlas-fig-node')?.querySelector(':scope > rect');
      const b = el.getBBox();
      const region = rect ? undefined : regions.find((r) => inRegion(el, b.x + b.width / 2, b.y + b.height / 2, r));
      const background = rect ? over(rgba(getComputedStyle(rect).fill), page) : region ? regionBg(region) : page;
      text.push(pair(`"${words.slice(0, 40)}"${region ? ' on a region' : ''}`, getComputedStyle(el).fill, background));
    }

    const measured = new Set<Element>();
    for (const [selector, property] of [
      ['.atlas-fig-node > rect', 'stroke'],
      ['.atlas-fig-arrow', 'stroke'],
      ['.atlas-fig-arrow-head', 'fill'],
      ['.atlas-fig-region', 'stroke'],
      ['.atlas-fig-level', 'stroke'],
      ['.atlas-fig-dot', 'fill'],
    ] as const) {
      for (const el of svg.querySelectorAll<SVGGeometryElement>(selector)) {
        measured.add(el);
        const colour = getComputedStyle(el).getPropertyValue(property);
        const what = `${describe(el)} ${property}`;
        marks.push(pair(what, colour, page));
        const points = samples(el);
        for (const region of regions) {
          if (region === el || !points.some(([x, y]) => inRegion(el, x, y, region))) continue;
          marks.push(pair(`${what} on ${describe(region)}`, colour, regionBg(region)));
        }
      }
    }
    for (const el of svg.querySelectorAll('line, circle, ellipse, polyline, polygon, path, rect')) {
      if (!measured.has(el)) unmeasured.push(`<${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}">`);
    }
  }
  return { text, marks, unmeasured };
}

if (WITH_PAGE.length === 0) {
  test.skip('lesson pages: no lesson has a vi page yet, so there is no lesson page to check', () => {});
}

for (const lesson of WITH_PAGE) {
  for (const locale of LOCALES) {
    const path = pathOf(locale, lesson.id);
    // The language of the text shown: this locale's file, or the vi file on a fallback page.
    const textLocale = contentLocale(lesson, locale);
    const source = readSource(textLocale, lesson.id);
    const shape = lessonShape(source);
    const figures = figureCount(source);

    test.describe(`lesson page ${path}`, () => {
      test('at 375px, a display formula that scrolls sideways has a name in Chrome\'s accessibility tree', async ({
        page,
      }) => {
        test.skip(!isNarrow(page), 'mobile project (375px) only');
        test.skip(shape.displayMath < 1, 'the lesson has no display formula');
        await page.goto(path);
        const selector = '.sl-markdown-content .katex-display';
        const blocks = await page.locator(selector).evaluateAll((items) =>
          items.map((el) => ({
            scrolls: el.scrollWidth > el.clientWidth + 1,
            tex: (el.querySelector('annotation[encoding="application/x-tex"]')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
          })),
        );
        test.skip(!blocks.some((block) => block.scrolls), 'no display formula is wider than the column at 375px');

        const names = await axNames(page, selector);
        expect(names).toHaveLength(blocks.length);
        const wide = blocks.flatMap((block, i) => (block.scrolls ? [{ tex: block.tex, node: names[i] }] : []));
        for (const { tex, node } of wide) {
          expect(tex, 'TeX source in the MathML').not.toBe('');
          expect(node).toEqual({ role: 'group', name: formatString(s(textLocale, 'common.formulaLabel'), { tex }), ignored: false });
        }
      });

      test('static figures: one per tag, named, described, readable, no JS', async ({ page }) => {
        test.skip(figures === 0, 'the lesson has no static figure');
        for (const scheme of ['light', 'dark'] as const) {
          await page.emulateMedia({ colorScheme: scheme });
          await page.goto(path);
          await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
          const blocks = page.locator('figure.atlas-figure');
          await expect(blocks).toHaveCount(figures);
          await page.evaluate(() => document.fonts.ready);
          await installContrast(page);

          for (const figure of await blocks.all()) {
            const report = await figure.evaluate(inspectFigure, FIGURE_MIN_TEXT_PX);
            const where = `#${report.id} (${scheme})`;
            if (scheme === 'light') {
              test.info().annotations.push({
                type: `figure #${report.id}`,
                description:
                  `${report.chars} characters, ${report.elements} elements (KaTeX apart: ${report.katexChars} characters, ` +
                  `${report.katexElements} elements), ${report.texts} texts, smallest ${report.smallestPx}px`,
              });
              // The figure follows the page's language, even on a fallback page (section 8.2 c).
              expect.soft(report.lang, `${where}: lang`).toBe(locale);
              expect.soft(report.caption, `${where}: figcaption`).not.toBe('');
              expect.soft(report.visibleSvgs, `${where}: visible svg.atlas-fig-svg`).toBe(1);
              expect.soft(report.svg?.role, `${where}: role`).toBe('img');
              expect.soft(report.svg?.label, `${where}: aria-label`).toBeTruthy();
              expect.soft(report.svg?.description, `${where}: text of aria-describedby`).toBeTruthy();
              expect.soft(report.duplicateIds, `${where}: ids used twice on the page`).toEqual([]);
              expect.soft(report.forbidden, `${where}: JS or another file inside`).toEqual([]);
              expect.soft(report.chars, `${where}: outerHTML characters`).toBeLessThanOrEqual(FIGURE_BUDGET.chars);
              expect.soft(report.elements, `${where}: elements`).toBeLessThanOrEqual(FIGURE_BUDGET.elements);
              expect.soft(report.texts, `${where}: texts measured`).toBeGreaterThan(0);
              expect.soft(report.textIssues, `${where}: text too small or overflowing`).toEqual([]);
            }
            const { text, marks, unmeasured } = await figure.evaluate(figureContrast);
            expect.soft(unmeasured, `${where}: shapes that figureContrast does not know`).toEqual([]);
            const lowest = (list: Contrast[]) =>
              list.length ? list.reduce((low, c) => (c.ratio < low.ratio ? c : low)) : { what: '-', ratio: NaN };
            test.info().annotations.push({
              type: `figure #${report.id} contrast (${scheme})`,
              description: `${marks.length} marks, lowest ${lowest(marks).what} ${lowest(marks).ratio} | ${text.length} texts, lowest ${lowest(text).what} ${lowest(text).ratio}`,
            });
            expect.soft(text.length, `${where}: texts measured for contrast`).toBeGreaterThan(1);
            expect.soft(marks.length, `${where}: marks measured for contrast`).toBeGreaterThan(0);
            expect.soft(text.filter((c) => c.ratio < 4.5), `${where}: text below 4.5:1`).toEqual([]);
            expect.soft(marks.filter((c) => c.ratio < 3), `${where}: marks below 3:1`).toEqual([]);
          }
        }
      });

      test('static figures, control: figureContrast sees a faint mark of each kind and a faint text on a region', async ({
        page,
      }) => {
        test.skip(figures === 0, 'the lesson has no static figure');
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        await installContrast(page);
        for (const figure of await page.locator('figure.atlas-figure').all()) {
          // In the visible svg: the first mark of each kind made the page colour; and, when there is a region,
          // a short text ("Tt") centred on it, with the region filled in the text's colour.
          const broken = await figure.evaluate((root) => {
            const svg = [...root.querySelectorAll<SVGSVGElement>('svg.atlas-fig-svg')].find((el) => el.checkVisibility());
            if (!svg) return { kinds: [] as { name: string; property: string }[], onRegion: false };
            const [r, g, b] = window.atlasContrast!.backgroundOf(svg);
            const pageColour = `rgb(${r}, ${g}, ${b})`;
            // Named as figureContrast names them, e.g. "polyline.atlas-fig-arrow", "g.atlas-fig-node > rect".
            const kinds: { name: string; property: string }[] = [];
            for (const [selector, property, name] of [
              ['.atlas-fig-node > rect', 'stroke', 'g.atlas-fig-node > rect'],
              ['.atlas-fig-arrow', 'stroke', 'polyline.atlas-fig-arrow'],
              ['.atlas-fig-arrow-head', 'fill', 'polygon.atlas-fig-arrow-head'],
              ['.atlas-fig-region', 'stroke', '.atlas-fig-region'],
              ['.atlas-fig-level', 'stroke', 'ellipse.atlas-fig-level'],
              ['.atlas-fig-dot', 'fill', 'circle.atlas-fig-dot'],
            ] as const) {
              const el = svg.querySelector(selector);
              if (!el) continue;
              el.setAttribute('style', `${property}: ${pageColour}`);
              kinds.push({ name, property });
            }
            const region = svg.querySelector<SVGGraphicsElement>('.atlas-fig-region');
            if (region) {
              const box = region.getBBox();
              const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              text.setAttribute('class', 'atlas-fig-text');
              text.setAttribute('x', String(box.x + box.width / 2));
              text.setAttribute('y', String(box.y + box.height / 2));
              text.setAttribute('font-size', '15');
              text.setAttribute('text-anchor', 'middle');
              text.setAttribute('dominant-baseline', 'central');
              text.textContent = 'Tt';
              svg.append(text);
              region.style.fill = getComputedStyle(text).fill;
            }
            return { kinds, onRegion: !!region };
          });
          expect(broken.kinds.length, 'a mark kind to break').toBeGreaterThan(0);
          const result = await figure.evaluate(figureContrast);
          const faint = result.marks.filter((m) => m.ratio < 1.1).map((m) => m.what);
          // Each broken kind is seen as too faint against the page.
          for (const { name, property } of broken.kinds) {
            expect(
              faint.some((what) => what.includes(name) && what.endsWith(` ${property}`)),
              `${name} ${property} seen as too faint; faint: ${faint.join(', ')}`,
            ).toBe(true);
          }
          if (broken.onRegion) {
            expect(
              result.text.some((m) => m.what === '"Tt" on a region' && m.ratio < 1.1),
              'a text on a region is measured against the region',
            ).toBe(true);
          }
        }
      });

      test('the page does not scroll sideways', async ({ page }) => {
        await page.goto(path);
        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
      });
    });
  }
}

// A display formula far wider than a 375px column, made by the site's own Markdown steps (remark-math,
// rehype-katex, then rehype-katex-a11y with the labels of the i18n files, as in astro.config.ts) and put
// into a built page, so the site's CSS applies. The lessons may or may not have a formula that wide (the
// per-lesson test above skips then); this one always is, whatever the lessons say.
const WIDE_TEX = [...Array.from({ length: 16 }, (_, i) => `w_{${i + 1}} x_{${i + 1}}`), 'b'].join(' + ');

for (const locale of LOCALES) {
  test(`/${locale}/ at 375px: a display formula wider than the column scrolls in its own box, and Chrome names it`, async ({
    page,
  }) => {
    test.skip(!isNarrow(page), 'mobile project (375px) only');
    const processor = await createMarkdownProcessor({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeKatex,
        [rehypeKatexA11y, { labels: { vi: s('vi', 'common.formulaLabel'), en: s('en', 'common.formulaLabel') } }],
      ],
    });
    // As if it were a lesson file of this locale: the plugin reads the language from the path.
    const { code } = await processor.render(['$$', WIDE_TEX, '$$', ''].join('\n'), {
      fileURL: pathToFileURL(join(DOCS_DIR, locale, 'ml', 'wide-formula-fixture.md')),
    });

    // The demo page is always built and has the lesson column; the fixture goes at its top, at runtime only.
    await page.goto(pathOf(locale, 'dev/components'));
    await page.locator('.sl-markdown-content').evaluate((root, html) => {
      const box = document.createElement('div');
      box.id = 'atlas-wide-formula';
      box.innerHTML = html;
      root.prepend(box);
    }, code);
    const selector = '#atlas-wide-formula .katex-display';
    await expect(page.locator(selector)).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);

    const size = await page.locator(selector).evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      page: document.documentElement.scrollWidth,
    }));
    expect(size.scrollWidth, 'the formula is wider than its box').toBeGreaterThan(size.clientWidth + 1);
    expect(size.page, 'the page itself does not scroll sideways').toBeLessThanOrEqual(375);

    expect(await axNames(page, selector)).toEqual([
      { role: 'group', name: formatString(s(locale, 'common.formulaLabel'), { tex: WIDE_TEX }), ignored: false },
    ]);
  });
}
