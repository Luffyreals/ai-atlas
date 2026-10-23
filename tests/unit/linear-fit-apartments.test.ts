// LinearFitViz on the apartments data (docs/architecture/viz.md, sections 4.1, 4.5, 6 task V1):
// the TS numbers match Python, and APARTMENTS_LINEAR_FIT passes every constraint of section 4.1.
import { describe, expect, it } from 'vitest';
import { APARTMENTS, APARTMENTS_LINEAR_FIT as CONFIG } from '../../src/data/datasets/apartments';
import { decimalsOf, formatNumber } from '../../src/lib/viz/format';
import {
  fitLeastSquares,
  meanPoint,
  mse,
  NEAR_BEST_RATIO,
  residuals,
  snapToStep,
  type SliderSpec,
} from '../../src/lib/viz/linear-fit';
import { PYTHON_LINEAR_FIT as PYTHON } from './fixtures/linear-fit-python';

const rows = APARTMENTS.rows;
const best = fitLeastSquares(rows);
const mean = meanPoint(rows);
const initial = { w: CONFIG.w.initial, b: CONFIG.b.initial };
const xs = rows.map(([x]) => x);
const ys = rows.map(([, y]) => y);

/** Every value a slider can take, as the island gets it (snapToStep). */
function sliderGrid(spec: SliderSpec): number[] {
  const count = Math.round((spec.max - spec.min) / spec.step);
  return Array.from({ length: count + 1 }, (_, i) => snapToStep(spec.min + i * spec.step, spec));
}

/** n is an integer, up to 1e-9. */
const isWhole = (n: number) => Math.abs(n - Math.round(n)) < 1e-9;

describe('apartments: TS matches the Python fixture', () => {
  it('the fixture was computed from the current rows (if not: run the command in the fixture again)', () => {
    expect(PYTHON.rows, 'APARTMENTS.rows changed: run the command in tests/unit/fixtures/linear-fit-python.ts again').toEqual(rows);
    expect(PYTHON.initial.w, 'initial w changed: run the fixture command again').toBe(CONFIG.w.initial);
    expect(PYTHON.initial.b, 'initial b changed: run the fixture command again').toBe(CONFIG.b.initial);
  });

  it('fitLeastSquares equals np.polyfit', () => {
    expect(best.w).toBeCloseTo(PYTHON.best.w, 9);
    expect(best.b).toBeCloseTo(PYTHON.best.b, 9);
    expect(best.mse).toBeCloseTo(PYTHON.best.mse, 9);
  });

  it('mse of the initial line equals NumPy', () => {
    expect(mse(rows, initial)).toBeCloseTo(PYTHON.initial.mse, 9);
  });

  it('at the solution, Σe and Σx·e are 0 (normal equations)', () => {
    const e = residuals(rows, best);
    const scale = Math.max(...xs.map(Math.abs)) * Math.max(...ys.map(Math.abs)) * rows.length;
    expect(Math.abs(e.reduce((sum, value) => sum + value, 0))).toBeLessThan(1e-9 * scale);
    expect(Math.abs(e.reduce((sum, value, i) => sum + value * (xs[i] ?? 0), 0))).toBeLessThan(1e-9 * scale);
  });

  it('meanPoint equals NumPy x.mean(), y.mean(), and the best line passes through it', () => {
    expect(mean.x).toBeCloseTo(PYTHON.mean.x, 9);
    expect(mean.y).toBeCloseTo(PYTHON.mean.y, 9);
    expect(best.b).toBeCloseTo(mean.y - best.w * mean.x, 9);
  });

  it('shows the numbers the lesson quotes: ŷ = 0.1695x + 2.04, MSE 0.3615, initial MSE 10.5020, (52.4, 10.92)', () => {
    expect(formatNumber(best.w, CONFIG.digits.w)).toBe('0.1695');
    expect(formatNumber(best.b, CONFIG.digits.b)).toBe('2.04');
    expect(formatNumber(best.mse, CONFIG.digits.mse)).toBe('0.3615');
    expect(formatNumber(mse(rows, initial), CONFIG.digits.mse)).toBe('10.5020');
    expect(formatNumber(mean.x, CONFIG.digits.meanX)).toBe('52.4');
    expect(formatNumber(mean.y, CONFIG.digits.meanY)).toBe('10.92');
  });
});

describe('APARTMENTS_LINEAR_FIT meets viz.md section 4.1', () => {
  it('8 to 12 rows; finite values with at most `digits` decimals', () => {
    expect(rows.length).toBeGreaterThanOrEqual(8);
    expect(rows.length).toBeLessThanOrEqual(12);
    for (const [x, y] of rows) {
      expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
      expect(decimalsOf(x)).toBeLessThanOrEqual(APARTMENTS.x.digits);
      expect(decimalsOf(y)).toBeLessThanOrEqual(APARTMENTS.y.digits);
    }
  });

  it('the x domain starts at 0, so b is where the line meets the y axis', () => {
    expect(CONFIG.xDomain[0]).toBe(0);
  });

  it('every point is inside the domains, at least 2% of their width from each edge', () => {
    for (const [values, [min, max], axis] of [
      [xs, CONFIG.xDomain, 'x'],
      [ys, CONFIG.yDomain, 'y'],
    ] as const) {
      const margin = 0.02 * (max - min);
      for (const value of values) {
        expect(value - min, `${axis} = ${value} too close to ${min}`).toBeGreaterThanOrEqual(margin);
        expect(max - value, `${axis} = ${value} too close to ${max}`).toBeGreaterThanOrEqual(margin);
      }
    }
  });

  it('the y domain holds best.b and the initial b', () => {
    const [min, max] = CONFIG.yDomain;
    for (const b of [best.b, CONFIG.b.initial]) {
      expect(b).toBeGreaterThanOrEqual(min);
      expect(b).toBeLessThanOrEqual(max);
    }
  });

  it.each([
    ['w', CONFIG.w],
    ['b', CONFIG.b],
  ] as const)('slider %s: min ≤ initial ≤ max, both on an even grid', (_name, spec) => {
    expect(spec.step).toBeGreaterThan(0);
    expect(spec.min).toBeLessThanOrEqual(spec.initial);
    expect(spec.initial).toBeLessThanOrEqual(spec.max);
    expect(isWhole((spec.max - spec.min) / spec.step)).toBe(true);
    expect(isWhole((spec.initial - spec.min) / spec.step)).toBe(true);
    expect(snapToStep(spec.initial, spec)).toBe(spec.initial);
  });

  it('best w and b are inside the slider ranges, at least 2 steps from each end', () => {
    for (const [value, spec] of [
      [best.w, CONFIG.w],
      [best.b, CONFIG.b],
    ] as const) {
      expect(value - spec.min).toBeGreaterThanOrEqual(2 * spec.step);
      expect(spec.max - value).toBeGreaterThanOrEqual(2 * spec.step);
    }
  });

  it('for every w on the slider, a b on the slider keeps the line within one step of the mean point (decision 24)', () => {
    expect(mean.x).toBeGreaterThanOrEqual(CONFIG.xDomain[0]);
    expect(mean.x).toBeLessThanOrEqual(CONFIG.xDomain[1]);
    expect(mean.y).toBeGreaterThanOrEqual(CONFIG.yDomain[0]);
    expect(mean.y).toBeLessThanOrEqual(CONFIG.yDomain[1]);
    for (const w of sliderGrid(CONFIG.w)) {
      const through = mean.y - w * mean.x; // b = ȳ − w x̄
      expect(through, `w = ${w}`).toBeGreaterThanOrEqual(CONFIG.b.min);
      expect(through, `w = ${w}`).toBeLessThanOrEqual(CONFIG.b.max);
      expect(Math.abs(snapToStep(through, CONFIG.b) - through), `w = ${w}`).toBeLessThanOrEqual(CONFIG.b.step / 2 + 1e-9);
    }
  });

  it('the initial line leaves room to improve: mse(initial) ≥ 2 × best.mse', () => {
    expect(mse(rows, initial)).toBeGreaterThanOrEqual(2 * best.mse);
  });

  it('on the slider grid: MSE never beats the best line, and "very close" is reachable', () => {
    let smallest = Number.POSITIVE_INFINITY;
    for (const w of sliderGrid(CONFIG.w)) {
      for (const b of sliderGrid(CONFIG.b)) {
        const value = mse(rows, { w, b });
        expect(value).toBeGreaterThanOrEqual(best.mse);
        smallest = Math.min(smallest, value);
      }
    }
    expect(smallest).toBeLessThanOrEqual(best.mse * NEAR_BEST_RATIO);
    // Rounded the same way, the reader's MSE never shows smaller than the best line's.
    expect(Number(formatNumber(smallest, CONFIG.digits.mse))).toBeGreaterThanOrEqual(
      Number(formatNumber(best.mse, CONFIG.digits.mse)),
    );
  });

  it.each([
    ['x', CONFIG.xTicks, CONFIG.xDomain],
    ['y', CONFIG.yTicks, CONFIG.yDomain],
  ] as const)('%s ticks increase, stay in the domain and include both ends', (_axis, ticks, [min, max]) => {
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    ticks.forEach((tick, i) => {
      if (i > 0) expect(tick).toBeGreaterThan(ticks[i - 1] ?? Number.NEGATIVE_INFINITY);
      expect(tick).toBeGreaterThanOrEqual(min);
      expect(tick).toBeLessThanOrEqual(max);
    });
    expect(ticks[0]).toBe(min);
    expect(ticks[ticks.length - 1]).toBe(max);
  });

  it('shown numbers have enough decimals for the slider steps', () => {
    expect(CONFIG.digits.w).toBeGreaterThanOrEqual(decimalsOf(CONFIG.w.step));
    expect(CONFIG.digits.b).toBeGreaterThanOrEqual(decimalsOf(CONFIG.b.step));
    for (const digits of [CONFIG.digits.mse, CONFIG.digits.meanX, CONFIG.digits.meanY]) {
      expect(Number.isInteger(digits) && digits >= 0).toBe(true);
    }
    // The mean point shows exactly, not rounded: (52.4, 10.92) is what the lesson writes.
    expect(Math.abs(Number(formatNumber(mean.x, CONFIG.digits.meanX)) - mean.x)).toBeLessThan(1e-9);
    expect(Math.abs(Number(formatNumber(mean.y, CONFIG.digits.meanY)) - mean.y)).toBeLessThan(1e-9);
  });
});
