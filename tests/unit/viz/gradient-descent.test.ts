// Gradient descent of GradientDescentViz (docs/architecture/viz/gradient-descent.md, sections 12.2, 12.4.1, 12.6 task D0), detLog10
// (section 12.2.6) and the kit additions of section 12.4.3, on hand-made examples. No real dataset here:
// tests/unit/viz/gradient-descent-apartments.test.ts checks the apartment numbers against the exact Python ones.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CrossMark from '../../../src/components/viz/kit/CrossMark';
import PlotFrame from '../../../src/components/viz/kit/PlotFrame';
import type { Row } from '../../../src/data/datasets/types';
import {
  contour,
  gdOutcome,
  gdPath,
  gradient,
  hessian,
  inBox,
  minMaxOf,
  REACH_RATIO,
  scaleRows,
  toOriginal,
  unitCircle,
  type GdPath,
  type GradientDescentConfig,
} from '../../../src/lib/viz/gradient-descent';
import { fitLeastSquares, mse, predict } from '../../../src/lib/viz/linear-fit';
import { detLog10 } from '../../../src/lib/viz/scale';

const GD_FILE = fileURLToPath(new URL('../../../src/lib/viz/gradient-descent.ts', import.meta.url));
const SCALE_FILE = fileURLToPath(new URL('../../../src/lib/viz/scale.ts', import.meta.url));

/** A config for hand-made data: a wide box, many steps; the drawing fields do not matter here. */
function config(overrides: Partial<GradientDescentConfig> = {}): GradientDescentConfig {
  return {
    start: { w: 0, b: 0 },
    levels: [0.1],
    slider: { min: 0, max: 0, step: 1, initial: 0 },
    maxSteps: 200,
    wDomain: [-100, 100],
    bDomain: [-100, 100],
    wTicks: [-100, 0, 100],
    bTicks: [-100, 0, 100],
    contourLevels: [1],
    contourHalf: 24,
    stepTicks: [0, 200],
    logMseDomain: [-1, 3],
    logMseTicks: [-1, 3],
    digits: { eta: 2, params: 2, w: 4, b: 2, mse: 4, mseLarge: 2, limit: 3 },
    ...overrides,
  };
}

// y = 2x̃ + 1 on x̃ = 0, 0.5, 1, plus a small noise so the least MSE is above 0.
const LINE_ROWS: Row[] = [
  [0, 1.1],
  [0.5, 1.9],
  [1, 3.05],
];
// z-scored: mean 0, Σx² = m, so the two columns [x, 1] are orthogonal and H = 2I.
const Z_ROWS: Row[] = [
  [-1, 0],
  [-1, 1],
  [1, 3],
  [1, 5],
];

describe('minMaxOf, scaleRows, toOriginal (section 12.2.1)', () => {
  const rows: Row[] = [
    [10, 1],
    [40, 3],
    [20, 2],
  ];
  const s = minMaxOf(rows);

  it('finds min and range over x, in any row order', () => {
    expect(s).toEqual({ min: 10, range: 30 });
  });

  it('scales x to [0, 1] and keeps y', () => {
    expect(scaleRows(rows, s)).toEqual([
      [0, 1],
      [1, 3],
      [1 / 3, 2],
    ]);
  });

  it('w = w̃ / range, b = b̃ − w · min: ŷ = 6x̃ + 1 is ŷ = 0.2x − 1', () => {
    const line = toOriginal({ w: 6, b: 1 }, s);
    expect(line.w).toBeCloseTo(0.2, 15);
    expect(line.b).toBeCloseTo(-1, 14);
    // The same prediction at every x, raw or scaled.
    const scaled = scaleRows(rows, s);
    rows.forEach(([x], i) => {
      expect(predict(line, x)).toBeCloseTo(6 * (scaled[i]?.[0] ?? Number.NaN) + 1, 13);
    });
  });

  it('undoes the scaling: from (w, b) to (w · range, b + w · min) and back', () => {
    for (const [w, b] of [
      [0.17, 2.04],
      [-3, 0.5],
      [0, 7],
      [12.5, -40],
    ] as const) {
      const back = toOriginal({ w: w * s.range, b: b + w * s.min }, s);
      expect(back.w).toBeCloseTo(w, 13);
      expect(back.b).toBeCloseTo(b, 12);
    }
  });

  it('throws on no rows and when every x is the same', () => {
    expect(() => minMaxOf([])).toThrow(/no rows/);
    expect(() =>
      minMaxOf([
        [3, 1],
        [3, 2],
      ]),
    ).toThrow(/every x is 3/);
  });
});

describe('gradient (section 12.2.1)', () => {
  it('is (2/m) Σ x̃ r and (2/m) Σ r with r = ŷ − y, by hand on 2 points', () => {
    // r = (1·0 + 0 − 1, 1·1 + 0 − 3) = (−1, −2): Σ x r = −2, Σ r = −3, 2/m = 1.
    expect(
      gradient(
        [
          [0, 1],
          [1, 3],
        ],
        { w: 1, b: 0 },
      ),
    ).toEqual({ w: -2, b: -3 });
  });

  it('is 0 at the least-squares point of fitLeastSquares', () => {
    for (const rows of [LINE_ROWS, Z_ROWS]) {
      const best = fitLeastSquares(rows);
      const g = gradient(rows, best);
      expect(Math.abs(g.w)).toBeLessThan(1e-12);
      expect(Math.abs(g.b)).toBeLessThan(1e-12);
    }
  });

  it('throws on no rows', () => {
    expect(() => gradient([], { w: 0, b: 0 })).toThrow(/no rows/);
  });
});

describe('hessian (section 12.2.2)', () => {
  it('is 2I on z-scored data: L = μ = 2', () => {
    expect(hessian(Z_ROWS)).toEqual({ h11: 2, h12: 0, h22: 2, L: 2, mu: 2 });
  });

  it('has L ≥ μ > 0 with L + μ = trace and L μ = det on other data', () => {
    const h = hessian(LINE_ROWS);
    // (2/3) [1.25, 1.5; 1.5, 3]
    expect(h.h11).toBeCloseTo(2.5 / 3, 15);
    expect(h.h12).toBeCloseTo(1, 15);
    expect(h.h22).toBe(2);
    expect(h.L).toBeGreaterThanOrEqual(h.mu);
    expect(h.mu).toBeGreaterThan(0);
    expect(h.L + h.mu).toBeCloseTo(h.h11 + h.h22, 14);
    expect(h.L * h.mu).toBeCloseTo(h.h11 * h.h22 - h.h12 * h.h12, 14);
  });
});

describe('gdPath and gdOutcome (sections 12.2.2, 12.2.3, 12.2.8)', () => {
  const best = fitLeastSquares(LINE_ROWS);
  const { L } = hessian(LINE_ROWS);

  it('converges when η < 2/L: no exit, ends at the least-squares point, reachStep set', () => {
    const path = gdPath(LINE_ROWS, 0.9 * (2 / L), best.mse, config());
    expect(path.exitStep).toBeNull();
    expect(path.points).toHaveLength(201);
    expect(path.mse).toHaveLength(201);
    const end = path.points[200];
    expect(end.w).toBeCloseTo(best.w, 9);
    expect(end.b).toBeCloseTo(best.b, 9);
    expect(path.reachStep).not.toBeNull();
    const reach = path.reachStep ?? -1;
    expect(path.mse[reach]).toBeLessThanOrEqual(REACH_RATIO * best.mse);
    expect(path.mse[reach - 1]).toBeGreaterThan(REACH_RATIO * best.mse);
    expect(gdOutcome(path, L)).toEqual({ kind: 'reached', step: reach });
  });

  it('leaves the box when η > 2/L, and stops at the first point outside it', () => {
    const box = config({ wDomain: [-10, 10], bDomain: [-10, 10] });
    const path = gdPath(LINE_ROWS, 1.1 * (2 / L), best.mse, box);
    expect(path.exitStep).not.toBeNull();
    const exit = path.exitStep ?? -1;
    expect(path.points).toHaveLength(exit + 1);
    const inside = (p: { w: number; b: number }) => Math.abs(p.w) <= 10 && Math.abs(p.b) <= 10;
    expect(path.points.slice(0, exit).every(inside)).toBe(true);
    expect(inside(path.points[exit])).toBe(false);
    expect(path.mse[exit]).toBeGreaterThan(path.mse[0]);
    expect(gdOutcome(path, L)).toEqual({ kind: 'diverged', step: exit });
  });

  it('reaches the bottom in one step when η = 1/L on z-scored data (H = 2I)', () => {
    const zBest = fitLeastSquares(Z_ROWS);
    expect([zBest.w, zBest.b]).toEqual([1.75, 2.25]);
    const path = gdPath(Z_ROWS, 1 / hessian(Z_ROWS).L, zBest.mse, config({ maxSteps: 3 }));
    expect(path.points[1]).toEqual({ w: 1.75, b: 2.25 });
    expect(path.mse[1]).toBe(zBest.mse);
    expect(path.reachStep).toBe(1);
  });

  it('records every point and its MSE, from the start', () => {
    const path = gdPath(LINE_ROWS, 0.1, best.mse, config({ start: { w: 1, b: -1 }, maxSteps: 5 }));
    expect(path.eta).toBe(0.1);
    expect(path.points[0]).toEqual({ w: 1, b: -1 });
    path.points.forEach((p, k) => expect(path.mse[k]).toBe(mse(LINE_ROWS, p)));
    const g = gradient(LINE_ROWS, path.points[0]);
    expect(path.points[1]).toEqual({ w: 1 - 0.1 * g.w, b: -1 - 0.1 * g.b });
  });

  it('inBox: edges count as inside, anything past them does not', () => {
    const box = { wDomain: [-10, 22], bDomain: [-4, 20] } as const;
    expect([
      inBox({ w: -10, b: -4 }, box),
      inBox({ w: 22, b: 20 }, box),
      inBox({ w: 0, b: 0 }, box),
      inBox({ w: 22.001, b: 0 }, box),
      inBox({ w: 0, b: -4.001 }, box),
    ]).toEqual([true, true, true, false, false]);
  });

  it('a start outside the box exits at step 0', () => {
    const path = gdPath(LINE_ROWS, 0.1, best.mse, config({ start: { w: 500, b: 0 } }));
    expect(path.exitStep).toBe(0);
    expect(path.points).toHaveLength(1);
  });

  it('throws on a bad η or maxSteps', () => {
    expect(() => gdPath(LINE_ROWS, 0, best.mse, config())).toThrow(/η/);
    expect(() => gdPath(LINE_ROWS, Number.NaN, best.mse, config())).toThrow(/η/);
    expect(() => gdPath(LINE_ROWS, 0.1, best.mse, config({ maxSteps: 2.5 }))).toThrow(/maxSteps/);
  });

  it('gdOutcome: unfinished, with zigzag when η L > 1', () => {
    const unfinished = (eta: number): GdPath => ({ eta, points: [], mse: [], reachStep: null, exitStep: null });
    expect(gdOutcome(unfinished(0.4), 2)).toEqual({ kind: 'unfinished', zigzag: false });
    expect(gdOutcome(unfinished(0.5), 2)).toEqual({ kind: 'unfinished', zigzag: false });
    expect(gdOutcome(unfinished(0.6), 2)).toEqual({ kind: 'unfinished', zigzag: true });
  });
});

describe('unitCircle (section 12.2.5)', () => {
  const circle = unitCircle(24);

  it('has 2 · 24 + 1 = 49 points, the last one equal to the first', () => {
    expect(circle).toHaveLength(49);
    expect(circle[48]).toEqual(circle[0]);
    expect(circle[0]).toEqual({ x: 0, y: -1 });
  });

  it('every point is on the unit circle within 1e-15', () => {
    for (const u of circle) expect(Math.abs(u.x * u.x + u.y * u.y - 1)).toBeLessThanOrEqual(1e-15);
  });

  it('goes round once: right half up through (1, 0), left half down through (−1, 0)', () => {
    expect(circle[12]).toEqual({ x: 1, y: 0 });
    expect(circle[24]).toEqual({ x: 0, y: 1 });
    expect(circle[36]).toEqual({ x: -1, y: 0 });
    circle.slice(1, 25).forEach((u, i) => expect(u.y).toBeGreaterThan(circle[i].y));
    circle.slice(25).forEach((u, i) => expect(u.y).toBeLessThan(circle[24 + i].y));
  });

  it('throws on a bad half', () => {
    expect(() => unitCircle(0)).toThrow(/half/);
    expect(() => unitCircle(1.5)).toThrow(/half/);
  });
});

describe('contour (section 12.2.5)', () => {
  const circle = unitCircle(24);

  it.each([
    ['y ≈ 2x̃ + 1', LINE_ROWS],
    ['z-scored', Z_ROWS],
  ] as const)('on %s, MSE equals the level within 1e-12 (relative) at every point', (_, rows) => {
    const best = fitLeastSquares(rows);
    for (const level of [best.mse + 1e-3, best.mse * 2, best.mse + 1, best.mse + 100]) {
      const points = contour(rows, best, level, circle);
      expect(points).toHaveLength(49);
      for (const p of points) {
        expect(Math.abs(mse(rows, { w: p.x, b: p.y }) - level) / level).toBeLessThan(1e-12);
      }
    }
  });

  it('is a circle around the bottom when H = 2I: radius √(level − best)', () => {
    const best = fitLeastSquares(Z_ROWS);
    for (const p of contour(Z_ROWS, best, best.mse + 4, circle)) {
      expect(Math.hypot(p.x - best.w, p.y - best.b)).toBeCloseTo(2, 14);
    }
  });

  it('throws when the level is not above the least MSE', () => {
    const best = fitLeastSquares(LINE_ROWS);
    expect(() => contour(LINE_ROWS, best, best.mse, circle)).toThrow(/above the least MSE/);
    expect(() => contour(LINE_ROWS, best, best.mse / 2, circle)).toThrow(/above the least MSE/);
  });
});

describe('detLog10 (section 12.2.6)', () => {
  it('is within 1e-12 of Math.log10 on 1 000 values from 1e-3 to 1e9', () => {
    let worst = 0;
    for (let i = 0; i < 1000; i++) {
      const v = 10 ** (-3 + (12 * i) / 999) * (1 + ((i * 7919) % 101) / 1e4);
      worst = Math.max(worst, Math.abs(detLog10(v) - Math.log10(v)));
    }
    expect(worst).toBeLessThan(1e-12);
  });

  it('is exact at every power of ten', () => {
    for (let k = -300; k <= 308; k++) expect(detLog10(Number(`1e${k}`)), `1e${k}`).toBe(k);
  });

  it('handles the ends of the double range', () => {
    expect(detLog10(Number.MIN_VALUE)).toBeCloseTo(Math.log10(Number.MIN_VALUE), 10);
    expect(detLog10(Number.MAX_VALUE)).toBeCloseTo(Math.log10(Number.MAX_VALUE), 10);
  });

  it.each([0, -1, -0, Number.NaN, Number.POSITIVE_INFINITY])('throws on %s', (v) => {
    expect(() => detLog10(v)).toThrow(/finite v > 0/);
  });
});

describe('sources: only + − × ÷, Math.sqrt, Math.abs (sections 9.2.2, 12.2.4, 12.2.6)', () => {
  /** The code without its comments ("/**" of a doc comment is not the ** operator), with "\n" line ends. */
  const strip = (text: string) =>
    text
      .replace(/\r\n/g, '\n')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
  const gd = strip(readFileSync(GD_FILE, 'utf8'));
  const scale = strip(readFileSync(SCALE_FILE, 'utf8'));
  const start = scale.indexOf('export function detLog10');
  const detLog10Body = scale.slice(start, scale.indexOf('\n}\n', start) + 2);
  const forbidden = ['**', 'Math.pow', 'Math.hypot', 'Math.exp', 'Math.log', 'Math.sin', 'Math.cos', 'Math.atan'];

  it('found the code', () => {
    expect(gd).toContain('export function gdPath');
    expect(detLog10Body).toMatch(/^export function detLog10[\s\S]*Math\.sqrt[\s\S]*return e \+[^\n]*\n}$/);
  });

  it.each(forbidden)('gradient-descent.ts and detLog10 do not use %s', (name) => {
    expect(gd.includes(name), `${name} in gradient-descent.ts`).toBe(false);
    expect(detLog10Body.includes(name), `${name} in detLog10`).toBe(false);
  });

  it('call no Math function but Math.sqrt and Math.abs', () => {
    const used = new Set([...(gd.match(/\bMath\.\w+/g) ?? []), ...(detLog10Body.match(/\bMath\.\w+/g) ?? [])]);
    expect([...used].filter((name) => name !== 'Math.sqrt' && name !== 'Math.abs')).toEqual([]);
  });

  it('gradient-descent.ts imports by relative path only', () => {
    const imports = [...gd.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1]);
    expect(imports.length).toBeGreaterThan(0);
    for (const path of imports) expect(path, path).toMatch(/^\.\.?\//);
  });
});

describe('kit additions (section 12.4.3)', () => {
  const frame = (props: Partial<Parameters<typeof PlotFrame>[0]> = {}) =>
    renderToStaticMarkup(
      createElement(PlotFrame, {
        xDomain: [0, 100],
        yDomain: [-1, 3],
        xTicks: [0, 50, 100],
        yTicks: [-1, 0, 1, 2, 3],
        xTitle: 'x',
        yTitle: 'y',
        label: 'plot',
        children: null,
        ...props,
      }),
    );

  it('PlotFrame: data-shape only for short and equal', () => {
    expect(frame()).not.toContain('data-shape');
    expect(frame({ shape: 'default' })).not.toContain('data-shape');
    expect(frame({ shape: 'short' })).toContain('data-shape="short"');
    expect(frame({ shape: 'equal' })).toContain('data-shape="equal"');
  });

  it('PlotFrame: yTickLabels replace the y tick numbers and size the tick column', () => {
    const labels = ['0.1', '1', '10', '100', '1000'];
    const html = frame({ yTickLabels: labels });
    const yTicks = /<div class="atlas-viz-yticks"[^>]*>(.*?)<\/div>/.exec(html)?.[1] ?? '';
    expect([...yTicks.matchAll(/>([^<]*)<\/span>/g)].map((match) => match[1])).toEqual(labels);
    expect(html).toContain('--atlas-viz-ytick-ch:4');
    expect(frame()).toContain('>−1</span>');
  });

  it('PlotFrame: throws when yTickLabels and yTicks differ in length', () => {
    expect(() => frame({ yTickLabels: ['1', '10'] })).toThrow(/2 yTickLabels for 5 yTicks/);
  });

  it('CrossMark keeps the DOM it had in LinearFitVizIsland', () => {
    const arms = (name: string) =>
      `<line class="${name}" x1="-6" y1="-6" x2="6" y2="6"></line><line class="${name}" x1="-6" y1="6" x2="6" y2="-6"></line>`;
    const open = '<svg x="12.50%" y="40.00%" width="1" height="1" overflow="visible">';
    expect(renderToStaticMarkup(createElement(CrossMark, { x: '12.50%', y: '40.00%', halo: true }))).toBe(
      `${open}${arms('atlas-viz-halo')}${arms('atlas-viz-marker')}</svg>`,
    );
    expect(renderToStaticMarkup(createElement(CrossMark, { x: '12.50%', y: '40.00%' }))).toBe(
      `${open}${arms('atlas-viz-marker')}</svg>`,
    );
  });
});
