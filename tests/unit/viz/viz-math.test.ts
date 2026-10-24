// Pure helpers of every VIZ (docs/architecture/viz/, sections 4.2, 6 task V0), on hand-made examples.
// No real dataset here: tests/unit/viz/linear-fit-apartments.test.ts checks the apartments numbers.
import { describe, expect, it } from 'vitest';
import type { Row } from '../../../src/data/datasets/types';
import { decimalsOf, formatNumber, lineParts } from '../../../src/lib/viz/format';
import {
  fitLeastSquares,
  isNearBest,
  meanPoint,
  mse,
  NEAR_BEST_RATIO,
  predict,
  residuals,
  snapToStep,
  type SliderSpec,
} from '../../../src/lib/viz/linear-fit';
import { clamp, clipLineToBox, pct, toPercentX, toPercentY } from '../../../src/lib/viz/scale';

describe('linear-fit', () => {
  it('predict is w x + b', () => {
    expect(predict({ w: 2, b: 1 }, 3)).toBe(7);
    expect(predict({ w: -0.5, b: 4 }, 2)).toBe(3);
  });

  it('residuals are y − ŷ: positive above the line, negative below', () => {
    expect(residuals([[1, 5], [2, 1]], { w: 1, b: 1 })).toEqual([3, -2]);
  });

  it('mse([[1,1],[2,2],[3,3]], {w:0,b:0}) = 14/3, with 1/m', () => {
    expect(mse([[1, 1], [2, 2], [3, 3]], { w: 0, b: 0 })).toBeCloseTo(14 / 3, 15);
  });

  it('mse is 0 on a line through every point, and refuses no rows', () => {
    expect(mse([[0, 1], [1, 3], [2, 5]], { w: 2, b: 1 })).toBe(0);
    expect(() => mse([], { w: 0, b: 0 })).toThrow(/no rows/);
  });

  it('fitLeastSquares recovers y = 2x + 1', () => {
    const rows: Row[] = [[-3, -5], [0, 1], [0.5, 2], [4, 9], [10, 21]];
    const best = fitLeastSquares(rows);
    expect(Math.abs(best.w - 2)).toBeLessThan(1e-12);
    expect(Math.abs(best.b - 1)).toBeLessThan(1e-12);
    expect(best.mse).toBeLessThan(1e-24);
  });

  it('fitLeastSquares matches a fit worked out by hand', () => {
    // x̄ = 2, ȳ = 10/3; Σ(x − x̄)(y − ȳ) = 7/3 + 5/3 = 4, Σ(x − x̄)² = 2, so w = 2 and b = 10/3 − 2·2 = −2/3.
    // Residuals −1/3, 2/3, −1/3: MSE = (1/9 + 4/9 + 1/9) / 3 = 2/9.
    const simple = fitLeastSquares([[1, 1], [2, 4], [3, 5]]);
    expect(simple.w).toBeCloseTo(2, 12);
    expect(simple.b).toBeCloseTo(-2 / 3, 12);
    expect(simple.mse).toBeCloseTo(2 / 9, 12);
  });

  it('fitLeastSquares sets the residuals to sum 0 and to be orthogonal to x', () => {
    const rows: Row[] = [[1, 2], [2, 2.5], [4, 7], [5, 6], [9, 13]];
    const best = fitLeastSquares(rows);
    const e = residuals(rows, best);
    expect(Math.abs(e.reduce((sum, value) => sum + value, 0))).toBeLessThan(1e-12);
    expect(Math.abs(e.reduce((sum, value, i) => sum + value * (rows[i]?.[0] ?? 0), 0))).toBeLessThan(1e-11);
  });

  it('meanPoint is (x̄, ȳ), and the least-squares line passes through it', () => {
    const rows: Row[] = [[1, 2], [2, 2.5], [4, 7], [5, 6], [9, 13]];
    expect(meanPoint(rows)).toEqual({ x: 4.2, y: 6.1 });
    const best = fitLeastSquares(rows);
    expect(predict(best, 4.2)).toBeCloseTo(6.1, 12);
    expect(meanPoint([[-3, 5]])).toEqual({ x: -3, y: 5 });
    expect(() => meanPoint([])).toThrow(/no rows/);
  });

  it('fitLeastSquares throws a clear message on one row or when every x is the same', () => {
    expect(() => fitLeastSquares([])).toThrow(/at least 2 rows, got 0/);
    expect(() => fitLeastSquares([[1, 2]])).toThrow(/at least 2 rows, got 1/);
    expect(() => fitLeastSquares([[3, 1], [3, 2], [3, 5]])).toThrow(/every x is 3/);
  });

  it('isNearBest uses NEAR_BEST_RATIO = 1.05', () => {
    expect(NEAR_BEST_RATIO).toBe(1.05);
    expect(isNearBest(1.05, 1)).toBe(true);
    expect(isNearBest(1, 1)).toBe(true);
    expect(isNearBest(1.0500001, 1)).toBe(false);
  });

  describe('snapToStep', () => {
    const spec: SliderSpec = { min: 0, max: 1, step: 0.1, initial: 0 };

    it('removes the float noise of a range input', () => {
      expect(snapToStep(0.30000000000000004, spec)).toBe(0.3);
      expect(snapToStep(0.7000000000000001, spec)).toBe(0.7);
    });

    it('snaps to the nearest grid value and clamps to [min, max]', () => {
      expect(snapToStep(0.26, spec)).toBe(0.3);
      expect(snapToStep(0.24, spec)).toBe(0.2);
      expect(snapToStep(-3, spec)).toBe(0);
      expect(snapToStep(7, spec)).toBe(1);
    });

    it('keeps a grid that starts off zero', () => {
      const offset: SliderSpec = { min: -2, max: 12, step: 0.1, initial: 10.9 };
      expect(snapToStep(10.9, offset)).toBe(10.9);
      expect(snapToStep(-1.9000000000000001, offset)).toBe(-1.9);
      expect(snapToStep(2.0394, offset)).toBe(2);
      const fine: SliderSpec = { min: 0, max: 0.4, step: 0.005, initial: 0 };
      expect(snapToStep(0.17, fine)).toBe(0.17);
      expect(snapToStep(0.16947, fine)).toBe(0.17);
      expect(snapToStep(0.015000000000000001, fine)).toBe(0.015);
    });

    it('falls back to the initial value on NaN', () => {
      expect(snapToStep(Number.NaN, { ...spec, initial: 0.5 })).toBe(0.5);
    });
  });
});

describe('scale', () => {
  it('toPercentX is 0 at min and 100 at max', () => {
    expect(toPercentX(0, [0, 100])).toBe(0);
    expect(toPercentX(100, [0, 100])).toBe(100);
    expect(toPercentX(25, [0, 100])).toBe(25);
    expect(toPercentX(5, [-5, 15])).toBe(50);
  });

  it('toPercentY is 100 at min (bottom) and 0 at max: SVG y grows down', () => {
    expect(toPercentY(0, [0, 20])).toBe(100);
    expect(toPercentY(20, [0, 20])).toBe(0);
    expect(toPercentY(5, [0, 20])).toBe(75);
  });

  it('pct has two decimals, a "%" and never "-0.00%"', () => {
    expect(pct(42.857142)).toBe('42.86%');
    expect(pct(100)).toBe('100.00%');
    expect(pct(0)).toBe('0.00%');
    expect(pct(-0.001)).toBe('0.00%');
    expect(pct(-12.5)).toBe('-12.50%');
  });

  it('clamp keeps a value inside the domain', () => {
    expect(clamp(-1, [0, 20])).toBe(0);
    expect(clamp(25, [0, 20])).toBe(20);
    expect(clamp(7, [0, 20])).toBe(7);
  });

  describe('clipLineToBox, box x [0, 10], y [0, 10]', () => {
    const box = [0, 10] as const;

    it('a line inside the box spans the whole width', () => {
      expect(clipLineToBox({ w: 0.5, b: 2 }, box, box)).toEqual({ x1: 0, y1: 2, x2: 10, y2: 7 });
      expect(clipLineToBox({ w: 0, b: 4 }, box, box)).toEqual({ x1: 0, y1: 4, x2: 10, y2: 4 });
    });

    it('a line leaving through the top edge stops there', () => {
      expect(clipLineToBox({ w: 2, b: 0 }, box, box)).toEqual({ x1: 0, y1: 0, x2: 5, y2: 10 });
    });

    it('a line entering through the bottom edge starts there', () => {
      expect(clipLineToBox({ w: 1, b: -4 }, box, box)).toEqual({ x1: 4, y1: 0, x2: 10, y2: 6 });
    });

    it('a steep line crossing both the bottom and the top edge', () => {
      expect(clipLineToBox({ w: 4, b: -10 }, box, box)).toEqual({ x1: 2.5, y1: 0, x2: 5, y2: 10 });
      // Falling line: enters at the top, leaves at the bottom.
      expect(clipLineToBox({ w: -4, b: 30 }, box, box)).toEqual({ x1: 5, y1: 10, x2: 7.5, y2: 0 });
    });

    it('a line that misses the box gives null', () => {
      expect(clipLineToBox({ w: 1, b: 20 }, box, box)).toBeNull();
      expect(clipLineToBox({ w: 1, b: -30 }, box, box)).toBeNull();
      expect(clipLineToBox({ w: 0, b: 11 }, box, box)).toBeNull();
      expect(clipLineToBox({ w: 0, b: -0.5 }, box, box)).toBeNull();
    });
  });
});

describe('format', () => {
  it('formatNumber: fixed decimals, decimal point, U+2212, never "−0.00"', () => {
    expect(formatNumber(-0.5, 2)).toBe('−0.50');
    expect(formatNumber(-0.0001, 2)).toBe('0.00');
    expect(formatNumber(-0, 2)).toBe('0.00');
    expect(formatNumber(0.15, 3)).toBe('0.150');
    expect(formatNumber(10.502, 4)).toBe('10.5020');
    expect(formatNumber(12345.678, 1)).toBe('12345.7');
    expect(formatNumber(25, 0)).toBe('25');
  });

  it('formatNumber refuses NaN and Infinity', () => {
    expect(() => formatNumber(Number.NaN, 2)).toThrow(RangeError);
    expect(() => formatNumber(Number.POSITIVE_INFINITY, 2)).toThrow(RangeError);
  });

  it('decimalsOf', () => {
    expect(decimalsOf(0.005)).toBe(3);
    expect(decimalsOf(0.1)).toBe(1);
    expect(decimalsOf(1)).toBe(0);
    expect(decimalsOf(20)).toBe(0);
    expect(decimalsOf(0.25)).toBe(2);
    expect(decimalsOf(-2)).toBe(0);
  });

  it('lineParts gives the pieces of "ŷ = wx ± b"', () => {
    expect(lineParts({ w: 0.15, b: 1.2 }, { w: 3, b: 2 })).toEqual({ w: '0.150', sign: '+', b: '1.20' });
    expect(lineParts({ w: 0.15, b: -1.2 }, { w: 3, b: 2 })).toEqual({ w: '0.150', sign: '−', b: '1.20' });
    expect(lineParts({ w: -0.5, b: 0 }, { w: 1, b: 1 })).toEqual({ w: '−0.5', sign: '+', b: '0.0' });
    // A negative b that rounds to zero is "+ 0.0", never "− 0.0".
    expect(lineParts({ w: 1, b: -0.01 }, { w: 1, b: 1 })).toEqual({ w: '1.0', sign: '+', b: '0.0' });
  });
});
