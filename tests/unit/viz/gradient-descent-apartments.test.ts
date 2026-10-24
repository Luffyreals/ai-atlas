// GradientDescentViz on the apartment table (docs/architecture/viz/gradient-descent.md, sections 12.2, 12.4.2, 12.6 task D0):
// APARTMENTS_GD meets its constraints, the fixture comes from the current data, the TS paths match the exact ones of
// scripts/gradient-descent-fixture.py and show the same strings at every step, and the story of section 12.2.3
// (slow, reached at 69, reached at 29, zigzag, diverged at 4) comes out of the code.
import { describe, expect, it } from 'vitest';
import { APARTMENTS, APARTMENTS_GD as CONFIG } from '../../../src/data/datasets/apartments';
import type { Row } from '../../../src/data/datasets/types';
import { formatNumber } from '../../../src/lib/viz/format';
import {
  contour,
  gdOutcome,
  gdPath,
  hessian,
  minMaxOf,
  scaleRows,
  toOriginal,
  unitCircle,
  type Params,
} from '../../../src/lib/viz/gradient-descent';
import { fitLeastSquares, mse } from '../../../src/lib/viz/linear-fit';
import { formatMse, toPolyline } from '../../../src/lib/viz/poly-fit';
import { detLog10 } from '../../../src/lib/viz/scale';
import { PYTHON_GRADIENT_DESCENT as PYTHON } from '../fixtures/gradient-descent-python';
import { PYTHON_LINEAR_FIT } from '../fixtures/linear-fit-python';

const rows: readonly Row[] = APARTMENTS.rows;
const s = minMaxOf(rows);
const scaled = scaleRows(rows, s);
const best = fitLeastSquares(scaled);
const h = hessian(scaled);
const paths = CONFIG.levels.map((eta) => gdPath(scaled, eta, best.mse, CONFIG));
const { digits } = CONFIG;
const isIncreasing = (values: readonly number[]) => values.every((value, i) => i === 0 || value > values[i - 1]);
const inBox = (p: Params) =>
  p.w >= CONFIG.wDomain[0] && p.w <= CONFIG.wDomain[1] && p.b >= CONFIG.bDomain[0] && p.b <= CONFIG.bDomain[1];
const again = 'run scripts/gradient-descent-fixture.py again (venv of docs/architecture/viz/README.md section 2.5)';

/** The strings the VIZ shows for one step: MSE, (w̃, b̃), and w, b of ŷ = wx + b. */
function shown(w: number, b: number, wOriginal: number, bOriginal: number, value: number): string[] {
  return [
    formatMse(value, digits),
    formatNumber(w, digits.params),
    formatNumber(b, digits.params),
    formatNumber(wOriginal, digits.w),
    formatNumber(bOriginal, digits.b),
  ];
}

describe('APARTMENTS_GD meets viz/gradient-descent.md section 12.4.2', () => {
  it('levels increase strictly; the slider is an index into them', () => {
    expect(isIncreasing(CONFIG.levels)).toBe(true);
    expect(CONFIG.levels.every((eta) => eta > 0)).toBe(true);
    const { min, max, step, initial } = CONFIG.slider;
    expect([min, step, max]).toEqual([0, 1, CONFIG.levels.length - 1]);
    expect(Number.isInteger(initial) && initial >= min && initial <= max).toBe(true);
    expect(CONFIG.levels[initial]).toBe(0.3);
  });

  it('the box is exactly 4 : 3 in the same unit on both axes', () => {
    const [w0, w1] = CONFIG.wDomain;
    const [b0, b1] = CONFIG.bDomain;
    expect((w1 - w0) * 3).toBe((b1 - b0) * 4);
  });

  it('start lies inside the box', () => {
    expect(inBox(CONFIG.start)).toBe(true);
  });

  it.each([
    ['wTicks', CONFIG.wTicks, CONFIG.wDomain],
    ['bTicks', CONFIG.bTicks, CONFIG.bDomain],
    ['stepTicks', CONFIG.stepTicks, [0, CONFIG.maxSteps]],
    ['logMseTicks', CONFIG.logMseTicks, CONFIG.logMseDomain],
  ] as const)('%s increase and lie inside their domain', (_, ticks, domain) => {
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(isIncreasing(ticks)).toBe(true);
    for (const tick of ticks) {
      expect(tick).toBeGreaterThanOrEqual(domain[0]);
      expect(tick).toBeLessThanOrEqual(domain[1]);
    }
  });

  it('logMseTicks are whole powers of ten (labels 0.1 … 1000)', () => {
    for (const tick of CONFIG.logMseTicks) expect(Number.isInteger(tick)).toBe(true);
    expect(CONFIG.logMseTicks.map((tick) => formatNumber(10 ** tick, Math.max(0, -tick)))).toEqual([
      '0.1',
      '1',
      '10',
      '100',
      '1000',
    ]);
  });

  it('contourLevels increase and are all above the least MSE', () => {
    expect(isIncreasing(CONFIG.contourLevels)).toBe(true);
    expect(CONFIG.contourLevels[0]).toBeGreaterThan(best.mse);
  });

  it('minMaxOf(APARTMENTS.rows) is { min: 25, range: 60 }', () => {
    expect(s).toEqual({ min: 25, range: 60 });
  });

  it('the fixture was made with this config', () => {
    expect(PYTHON.levels.map((level) => level.eta)).toEqual([...CONFIG.levels]);
    expect(PYTHON.start).toEqual(CONFIG.start);
    expect(PYTHON.maxSteps).toBe(CONFIG.maxSteps);
    expect(PYTHON.wBox).toEqual([...CONFIG.wDomain]);
    expect(PYTHON.bBox).toEqual([...CONFIG.bDomain]);
  });
});

describe('the fixture comes from the current data', () => {
  it(`its rows are APARTMENTS.rows (if not: the data changed, ${again})`, () => {
    expect(PYTHON.rows).toEqual(APARTMENTS.rows);
    expect(PYTHON.scale).toEqual(s);
  });
});

describe('the bowl: least-squares point and curvature (sections 12.2.1, 12.2.2)', () => {
  it('the least-squares point on x̃ matches the exact one', () => {
    expect(Math.abs(best.w - PYTHON.best.w) / PYTHON.best.w).toBeLessThan(1e-12);
    expect(Math.abs(best.b - PYTHON.best.b) / PYTHON.best.b).toBeLessThan(1e-12);
    expect(Math.abs(best.mse - PYTHON.best.mse) / PYTHON.best.mse).toBeLessThan(1e-12);
  });

  it('back in raw units it is the line of ml/linear-regression: 0.1695x + 2.04, MSE 0.3615', () => {
    const line = toOriginal(best, s);
    expect(formatNumber(line.w, digits.w)).toBe('0.1695');
    expect(formatNumber(line.b, digits.b)).toBe('2.04');
    expect(formatMse(best.mse, digits)).toBe('0.3615');
    expect(line.w).toBeCloseTo(PYTHON.best.wOriginal, 12);
    expect(line.b).toBeCloseTo(PYTHON.best.bOriginal, 12);
    expect(line.w).toBeCloseTo(PYTHON_LINEAR_FIT.best.w, 12);
    expect(line.b).toBeCloseTo(PYTHON_LINEAR_FIT.best.b, 12);
    expect(best.mse).toBeCloseTo(PYTHON_LINEAR_FIT.best.mse, 12);
  });

  it('H, L and μ match the exact ones within 1e-12; 2/L reads 0.815', () => {
    for (const key of ['h11', 'h12', 'h22', 'L', 'mu'] as const) {
      expect(Math.abs(h[key] - PYTHON.hessian[key]), key).toBeLessThan(1e-12);
    }
    expect(formatNumber(2 / h.L, digits.limit)).toBe('0.815');
    expect(formatNumber(h.L / h.mu, 2)).toBe('15.34');
  });
});

describe('every path matches the exact one at every step (section 12.2.4)', () => {
  it.each(CONFIG.levels.map((eta, i) => [eta, i] as const))('η = %s', (eta, i) => {
    const path = paths[i];
    const exact = PYTHON.levels[i];
    expect(path.eta).toBe(eta);
    expect(path.points).toHaveLength(exact.steps.length);
    expect(path.mse).toHaveLength(exact.steps.length);
    exact.steps.forEach(([w, b, wOriginal, bOriginal, value], k) => {
      const p = path.points[k];
      const v = path.mse[k];
      expect(Math.abs(v - value), `step ${k}: MSE ${v} vs ${value}`).toBeLessThanOrEqual(1e-12 * Math.max(1, Math.abs(value)));
      expect(v).toBe(mse(scaled, p));
      const line = toOriginal(p, s);
      expect(shown(p.w, p.b, line.w, line.b, v), `step ${k}`).toEqual(shown(w, b, wOriginal, bOriginal, value));
    });
    expect(path.reachStep).toBe(exact.reachStep);
    expect(path.exitStep).toBe(exact.exitStep);
  });
});

describe('the story of section 12.2.3', () => {
  it('start (0, 0) has MSE 129.75', () => {
    expect(formatMse(paths[0].mse[0], digits)).toBe('129.75');
  });

  it('reachStep = [null, 69, 29, null, null], exitStep = [null, null, null, null, 4]', () => {
    expect(paths.map((path) => path.reachStep)).toEqual([null, 69, 29, null, null]);
    expect(paths.map((path) => path.exitStep)).toEqual([null, null, null, null, 4]);
  });

  it('gdOutcome: slow, reached at 69, reached at 29, zigzag, diverged at 4', () => {
    expect(paths.map((path) => gdOutcome(path, h.L))).toEqual([
      { kind: 'unfinished', zigzag: false },
      { kind: 'reached', step: 69 },
      { kind: 'reached', step: 29 },
      { kind: 'unfinished', zigzag: true },
      { kind: 'diverged', step: 4 },
    ]);
  });

  it('the end of each path reads as in the table', () => {
    const ends = paths.map((path) => {
      const k = path.points.length - 1;
      const p = path.points[k];
      return [k, formatMse(path.mse[k], digits), formatNumber(p.w, digits.params), formatNumber(p.b, digits.params)];
    });
    expect(ends).toEqual([
      [100, '1.0023', '7.63', '7.54'],
      [100, '0.3617', '10.13', '6.30'],
      [100, '0.3615', '10.17', '6.28'],
      [100, '0.4240', '10.07', '6.07'],
      [4, '244.32', '0.76', '−4.76'],
    ]);
  });

  it('the first four paths stay inside the box at every step; the last one leaves it only at its last point', () => {
    for (const path of paths.slice(0, 4)) {
      expect(path.points).toHaveLength(CONFIG.maxSteps + 1);
      expect(path.points.every(inBox)).toBe(true);
    }
    const last = paths[4];
    expect(last.points.slice(0, -1).every(inBox)).toBe(true);
    expect(inBox(last.points[last.points.length - 1])).toBe(false);
  });

  it('η L sorts the levels: 0.05 and 0.3 below 1, 0.7 and 0.8 between 1 and 2, 0.85 above 2', () => {
    expect(CONFIG.levels.map((eta) => (eta * h.L < 1 ? 'one side' : eta * h.L < 2 ? 'zigzag' : 'diverge'))).toEqual([
      'one side',
      'one side',
      'zigzag',
      'zigzag',
      'diverge',
    ]);
  });

  it('every MSE of every path fits the log axis of the MSE chart', () => {
    const [lo, hi] = CONFIG.logMseDomain;
    for (const path of paths) {
      for (const value of path.mse) {
        const y = detLog10(value);
        expect(y).toBeGreaterThan(lo);
        expect(y).toBeLessThan(hi);
      }
    }
    expect(formatNumber(detLog10(best.mse), 3)).toBe('−0.442');
  });
});

describe('the level curves (section 12.2.5)', () => {
  const circle = unitCircle(CONFIG.contourHalf);

  it.each([...CONFIG.contourLevels])('MSE %s: 49 points, each at that MSE within 1e-12 (relative)', (level) => {
    const points = contour(scaled, best, level, circle);
    expect(points).toHaveLength(2 * CONFIG.contourHalf + 1);
    for (const p of points) expect(Math.abs(mse(scaled, { w: p.x, b: p.y }) - level) / level).toBeLessThan(1e-12);
    expect(() => toPolyline(points, CONFIG.wDomain, CONFIG.bDomain)).not.toThrow();
  });

  it('the smallest curve (0.5) lies inside the box, around the least-squares point', () => {
    const points = contour(scaled, best, CONFIG.contourLevels[0], circle);
    expect(points.every((p) => inBox({ w: p.x, b: p.y }))).toBe(true);
  });
});
