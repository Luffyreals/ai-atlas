// Polynomial fit of PolyFitViz (docs/architecture/viz.md, sections 9.2.2, 9.4.2, 9.6 task P0), on hand-made
// examples. No real dataset here: tests/unit/poly-fit-sine.test.ts (P1) checks the sine numbers against Python.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { Row } from '../../src/data/datasets/types';
import type { SliderSpec } from '../../src/lib/viz/linear-fit';
import {
  bestDegree,
  evalPolynomial,
  fitAt,
  fitDegrees,
  fitPolynomial,
  fitZone,
  formatMse,
  LARGE_MSE,
  leastSquaresQR,
  polyMse,
  sampleCurve,
  toPolyline,
  toUnit,
  ZONE_RATIO,
  type DegreeFit,
} from '../../src/lib/viz/poly-fit';
import type { Domain } from '../../src/lib/viz/scale';

const SOURCE_FILE = fileURLToPath(new URL('../../src/lib/viz/poly-fit.ts', import.meta.url));
const DIGITS = { mse: 4, mseLarge: 2 };

/** |a − b| for every pair, with the worst one in the message. */
function expectClose(actual: readonly number[], expected: readonly number[], tolerance: number): void {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, i) => {
    expect(Math.abs(value - (expected[i] ?? Number.NaN)), `[${i}]: ${value} vs ${expected[i]}`).toBeLessThan(tolerance);
  });
}

// y = 1 − 2x + 3x² at x = 0..4. On the domain [0, 4], t = (x − 2)/2, so x = 2t + 2 and
// y = 1 − 2(2t + 2) + 3(2t + 2)² = 12t² + 20t + 9: the coefficients in t are [9, 20, 12].
const quadratic = (x: number) => 1 - 2 * x + 3 * x * x;
const QUAD_DOMAIN: Domain = [0, 4];
const QUAD_ROWS: Row[] = [0, 1, 2, 3, 4].map((x) => [x, quadratic(x)] as const);

describe('toUnit', () => {
  it('maps a, (a + b)/2, b to −1, 0, 1', () => {
    for (const [a, b] of [[0, 1], [0, 4], [-3, 5], [0.5, 15.5]] as const) {
      expect(toUnit(a, [a, b])).toBe(-1);
      expect(toUnit((a + b) / 2, [a, b])).toBe(0);
      expect(toUnit(b, [a, b])).toBe(1);
    }
  });

  it('is linear, and goes past ±1 outside the domain', () => {
    expect(toUnit(0.25, [0, 1])).toBe(-0.5);
    expect(toUnit(2, [0, 1])).toBe(3);
  });

  it('refuses an empty or reversed domain', () => {
    expect(() => toUnit(0, [1, 1])).toThrow(/finite a < b/);
    expect(() => toUnit(0, [2, 1])).toThrow(/finite a < b/);
  });
});

describe('leastSquaresQR', () => {
  it('matches a 3 × 2 system worked out by hand, to 1e-12', () => {
    // Line c_0 + c_1 x through (0, 1), (1, 2), (2, 4): x̄ = 1, ȳ = 7/3,
    // c_1 = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)² = (4/3 + 0 + 5/3) / 2 = 3/2, c_0 = 7/3 − 3/2 = 5/6.
    const c = leastSquaresQR([[1, 0], [1, 1], [1, 2]], [1, 2, 4]);
    expectClose(c, [5 / 6, 3 / 2], 1e-12);
  });

  it('solves a square system exactly, whatever the sign of the pivots', () => {
    // [[−2, 1], [4, 3]] c = [0, 10] → c = [1, 2]
    expectClose(leastSquaresQR([[-2, 1], [4, 3]], [0, 10]), [1, 2], 1e-12);
  });

  it('leaves a residual orthogonal to every column (the normal equations hold)', () => {
    const A = [[1, 0.2, 3], [1, -1, 0.5], [1, 2.5, -1], [1, 0.7, 0.7], [1, -0.3, 2], [1, 1.1, -2.2]];
    const y = [2.1, -0.4, 3.3, 1.2, 0.9, -1.7];
    const c = leastSquaresQR(A, y);
    const r = A.map((row, i) => (y[i] ?? 0) - row.reduce((sum, value, j) => sum + value * (c[j] ?? 0), 0));
    for (let j = 0; j < 3; j++) {
      expect(Math.abs(A.reduce((sum, row, i) => sum + (row[j] ?? 0) * (r[i] ?? 0), 0))).toBeLessThan(1e-12);
    }
  });

  it('throws with the sizes on fewer rows than columns, or a rank-deficient A', () => {
    expect(() => leastSquaresQR([[1, 2, 3], [4, 5, 6]], [1, 2])).toThrow(/2 × 3.*at least as many rows as columns/);
    expect(() => leastSquaresQR([[1, 2], [2, 4], [3, 6]], [1, 2, 3])).toThrow(/3 × 2\) is rank-deficient/);
    expect(() => leastSquaresQR([[0, 1], [0, 2]], [1, 2])).toThrow(/rank-deficient/);
    expect(() => leastSquaresQR([], [])).toThrow(/at least one row and one column/);
    expect(() => leastSquaresQR([[1], [1]], [1])).toThrow(/2 rows but y has 1/);
    expect(() => leastSquaresQR([[1, 2], [3]], [1, 2])).toThrow(/row 1 has 1 columns/);
    expect(() => leastSquaresQR([[1], [Number.NaN]], [1, 2])).toThrow(/not finite/);
  });
});

describe('fitPolynomial and evalPolynomial', () => {
  it('degree 2 on 5 points of y = 1 − 2x + 3x² gives back the curve, to 1e-12', () => {
    const coef = fitPolynomial(QUAD_ROWS, 2, QUAD_DOMAIN);
    expectClose(coef, [9, 20, 12], 1e-12);
    for (const x of [0, 0.5, 1, 2, 2.5, 3.7, 4]) {
      expect(Math.abs(evalPolynomial(coef, x, QUAD_DOMAIN) - quadratic(x)), `x = ${x}`).toBeLessThan(1e-12);
    }
    expect(polyMse(QUAD_ROWS, coef, QUAD_DOMAIN)).toBeLessThan(1e-24);
  });

  it('degree 4 on 5 points interpolates: every residual < 1e-12', () => {
    const rows: Row[] = [[0, 0.3], [1, -1.2], [2, 2.5], [3, 0.7], [4, 4.1]];
    const coef = fitPolynomial(rows, 4, QUAD_DOMAIN);
    expect(coef).toHaveLength(5);
    for (const [x, y] of rows) expect(Math.abs(evalPolynomial(coef, x, QUAD_DOMAIN) - y), `x = ${x}`).toBeLessThan(1e-12);
  });

  it('degree 1 is the least-squares line', () => {
    // Same points as the 3 × 2 system above, on the domain [0, 2] (t = x − 1): ŷ = 5/6 + 3x/2 = 7/3 + 3t/2.
    const coef = fitPolynomial([[0, 1], [1, 2], [2, 4]], 1, [0, 2]);
    expectClose(coef, [7 / 3, 3 / 2], 1e-12);
  });

  it('throws with a message when rows < degree + 1', () => {
    expect(() => fitPolynomial(QUAD_ROWS, 5, QUAD_DOMAIN)).toThrow(
      /degree 5 has 6 coefficients, so it needs at least 6 rows, got 5/,
    );
    expect(() => fitPolynomial([], 0, QUAD_DOMAIN)).toThrow(/at least 1 rows, got 0/);
  });

  it('throws with a message when two equal x values leave too few distinct points', () => {
    const rows: Row[] = [[0, 1], [1, 2], [1, 3], [2, 0]];
    expect(() => fitPolynomial(rows, 3, [0, 2])).toThrow(/degree 3 on 4 rows: .*rank-deficient.*different x values/);
    // One degree lower, 3 distinct x values are enough.
    expect(fitPolynomial(rows, 2, [0, 2])).toHaveLength(3);
  });

  it('refuses a degree that is not a whole number ≥ 0', () => {
    expect(() => fitPolynomial(QUAD_ROWS, 1.5, QUAD_DOMAIN)).toThrow(/whole number/);
    expect(() => fitPolynomial(QUAD_ROWS, -1, QUAD_DOMAIN)).toThrow(/whole number/);
  });

  it('evalPolynomial is Horner in t', () => {
    // 1 + 2t + 3t² at t = 2 is 17; at x = 2 on [−1, 1], t = 2.
    expect(evalPolynomial([1, 2, 3], 2, [-1, 1])).toBe(17);
    expect(evalPolynomial([4], 123, [0, 1])).toBe(4);
    expect(() => evalPolynomial([], 0, [0, 1])).toThrow(/no coefficients/);
  });

  it('polyMse is (1/m) Σ (ŷ − y)², and refuses no rows', () => {
    // ŷ = 0 everywhere: errors −1, 3 → (1 + 9) / 2 = 5
    expect(polyMse([[0, 1], [1, -3]], [0], [0, 1])).toBe(5);
    expect(() => polyMse([], [0], [0, 1])).toThrow(/no rows/);
  });
});

describe('fitDegrees', () => {
  const spec: SliderSpec = { min: 1, max: 4, step: 1, initial: 1 };
  const test: Row[] = [[0.5, quadratic(0.5)], [3.5, quadratic(3.5)]];

  it('fits every slider degree on train and scores it on train and test', () => {
    const fits = fitDegrees(QUAD_ROWS, test, spec, QUAD_DOMAIN);
    expect(fits.map((fit) => fit.degree)).toEqual([1, 2, 3, 4]);
    fits.forEach((fit) => expect(fit.coef).toHaveLength(fit.degree + 1));
    // Degree 1: y = 3(x − 2)² + 10x − 11, and (x − 2)² is symmetric about x = 2, so the best line is
    // 10x − 11 + 6 = 10x − 5 (6 is the mean of 3(x − 2)²). Residuals 3(x − 2)² − 6: 6, −3, −6, −3, 6 on train
    // (MSE 126/5 = 25.2) and 0.75, 0.75 on test (MSE 0.5625).
    expect(fits[0]?.mseTrain).toBeCloseTo(25.2, 10);
    expect(fits[0]?.mseTest).toBeCloseTo(0.5625, 10);
    // From degree 2 on, train and test are both exact up to rounding.
    for (const fit of fits.slice(1)) {
      expect(fit.mseTrain, `degree ${fit.degree}`).toBeLessThan(1e-20);
      expect(fit.mseTest, `degree ${fit.degree}`).toBeLessThan(1e-20);
    }
  });

  it('refuses a slider that is not made of whole degrees', () => {
    expect(() => fitDegrees(QUAD_ROWS, test, { ...spec, step: 0.5 }, QUAD_DOMAIN)).toThrow(/whole numbers/);
    expect(() => fitDegrees(QUAD_ROWS, test, { ...spec, min: 3, max: 2 }, QUAD_DOMAIN)).toThrow(/whole numbers/);
  });

  it('throws when the slider goes past what the training rows allow', () => {
    expect(() => fitDegrees(QUAD_ROWS, test, { ...spec, max: 5 }, QUAD_DOMAIN)).toThrow(/needs at least 6 rows, got 5/);
  });
});

/** Made-up fits: only degree, mseTrain and mseTest matter to bestDegree and fitZone. */
const fitsOf = (train: readonly number[], test: readonly number[], firstDegree = 1): DegreeFit[] =>
  train.map((mseTrain, i) => ({ degree: firstDegree + i, coef: [0], mseTrain, mseTest: test[i] ?? Number.NaN }));

describe('bestDegree', () => {
  it('picks the smallest test MSE', () => {
    expect(bestDegree(fitsOf([1, 1, 1, 1], [0.9, 0.4, 0.3, 0.5]))).toBe(3);
  });

  it('picks the lowest degree on a tie, in any order', () => {
    expect(bestDegree(fitsOf([1, 1, 1, 1], [0.5, 0.2, 0.2, 0.3]))).toBe(2);
    expect(bestDegree([...fitsOf([1, 1, 1, 1], [0.5, 0.2, 0.2, 0.3])].reverse())).toBe(2);
  });

  it('refuses no fits', () => {
    expect(() => bestDegree([])).toThrow(/no fits/);
  });
});

describe('fitZone', () => {
  // d* = 3 (test 0.3). Underfit: d < 3 and train ≥ 2 · 0.3 = 0.6. Overfit: d > 3 and test ≥ 2 · 0.3 = 0.6.
  const fits = fitsOf([1.0, 0.5, 0.3, 0.2, 0.1, 0.05], [1.2, 0.5, 0.3, 0.4, 0.6, 2.0]);

  it('uses ZONE_RATIO = 2', () => {
    expect(ZONE_RATIO).toBe(2);
  });

  it('gives the three zones from the numbers, with the ratio boundary included', () => {
    expect([1, 2, 3, 4, 5, 6].map((degree) => fitZone(fits, degree))).toEqual([
      'underfit', // train 1.0 ≥ 0.6
      'good', // train 0.5 < 0.6, though below d*
      'good', // d* itself
      'good', // test 0.4 < 0.6, though above d*
      'overfit', // test 0.6 = 2 · 0.3: the boundary counts
      'overfit',
    ]);
  });

  it('throws on a degree without a fit', () => {
    expect(() => fitZone(fits, 7)).toThrow(/no fit for degree 7/);
  });
});

describe('fitAt', () => {
  it('finds a fit by its degree, not by its index, so a slider step above 1 works', () => {
    const fits = fitsOf([0.9, 0.5, 0.2], [1, 0.6, 0.3], 2).filter((_, i) => i !== 1); // degrees 2 and 4
    expect(fitAt(fits, 2).mseTrain).toBe(0.9);
    expect(fitAt(fits, 4).mseTrain).toBe(0.2);
  });

  it('throws, naming the degrees it has, on a degree without a fit', () => {
    expect(() => fitAt(fitsOf([0.9, 0.5], [1, 0.6]), 3)).toThrow(/no fit for degree 3 \(degrees: 1, 2\)/);
    expect(() => fitAt(fitsOf([0.9, 0.5, 0.2], [1, 0.6, 0.3], 2).filter((_, i) => i !== 1), 3)).toThrow(/degree 3/);
    expect(() => fitAt([], 1)).toThrow(/no fit for degree 1/);
  });
});

describe('sampleCurve', () => {
  it('takes n evenly spaced points, both ends included', () => {
    expect(sampleCurve((x) => 2 * x, [0, 1], 3)).toEqual([
      { x: 0, y: 0 },
      { x: 0.5, y: 1 },
      { x: 1, y: 2 },
    ]);
    const points = sampleCurve((x) => x, [0.1, 0.7], 7);
    expect(points).toHaveLength(7);
    expect(points[0]?.x).toBe(0.1);
    expect(points[6]?.x).toBe(0.7);
  });

  it('refuses n < 2 or a non-integer n', () => {
    expect(() => sampleCurve((x) => x, [0, 1], 1)).toThrow(/n ≥ 2/);
    expect(() => sampleCurve((x) => x, [0, 1], 2.5)).toThrow(/n ≥ 2/);
  });
});

describe('toPolyline', () => {
  it('writes "x,y x,y …" in viewBox units, y down, two decimals', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0.5, y: 1 },
      { x: 1, y: -1 },
      { x: 0.25, y: 0.5 },
    ];
    expect(toPolyline(points, [0, 1], [-1, 1])).toBe('0.00,50.00 50.00,0.00 100.00,100.00 25.00,25.00');
    expect(toPolyline([], [0, 1], [-1, 1])).toBe('');
  });

  it('never writes "-0.00"', () => {
    // Just above the top and just left of the start: −0.0000005 rounds to "-0.00" without the fix.
    const text = toPolyline([{ x: -0.00000001, y: 1.00000001 }], [0, 1], [-1, 1]);
    expect(text).toBe('0.00,0.00');
    expect(text).not.toContain('-0.00');
  });

  it('holds y within ±1e5 viewBox units, and leaves values inside the limit alone', () => {
    expect(toPolyline([{ x: 0, y: 1e9 }, { x: 1, y: -1e9 }], [0, 1], [-1, 1])).toBe('0.00,-100000.00 100.00,100000.00');
    // y = 199 on [−1, 1] is −9900 units: far off the plot, but not held.
    expect(toPolyline([{ x: 0, y: 199 }], [0, 1], [-1, 1])).toBe('0.00,-9900.00');
  });

  it('refuses a point that is not a number', () => {
    expect(() => toPolyline([{ x: 0, y: Number.NaN }], [0, 1], [-1, 1])).toThrow(/point 0/);
    expect(() => toPolyline([{ x: Number.POSITIVE_INFINITY, y: 0 }], [0, 1], [-1, 1])).toThrow(/point 0/);
  });
});

describe('formatMse', () => {
  it('shows digits.mse decimals below LARGE_MSE, digits.mseLarge from there', () => {
    expect(LARGE_MSE).toBe(10);
    expect(formatMse(9.99994, DIGITS)).toBe('9.9999');
    expect(formatMse(133.20044, DIGITS)).toBe('133.20');
    expect(formatMse(10, DIGITS)).toBe('10.00');
    expect(formatMse(0.27320046663099196, DIGITS)).toBe('0.2732');
    expect(formatMse(1.0175002343048952e-11, DIGITS)).toBe('0.0000');
  });

  it('decides on the value rounded to digits.mse: one that rounds up to LARGE_MSE reads with digits.mseLarge', () => {
    expect(formatMse(9.99996, DIGITS)).toBe('10.00');
    expect(formatMse(9.99994, DIGITS)).toBe('9.9999');
    expect(formatMse(9.99996, { mse: 6, mseLarge: 2 })).toBe('9.999960');
  });
});

describe('poly-fit.ts source', () => {
  /** The code without its comments: "/**" of a doc comment is not the ** operator. */
  const code = readFileSync(SOURCE_FILE, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  it('has code left once the comments are gone', () => {
    expect(code).toContain('export function leastSquaresQR');
  });

  // Section 9.2.2: only + − × ÷, Math.sqrt and Math.abs, so build and browser agree bit for bit.
  it.each(['**', 'Math.pow', 'Math.hypot', 'Math.exp', 'Math.log', 'Math.sin', 'Math.cos'])(
    'does not use %s',
    (forbidden) => {
      expect(code.includes(forbidden), `${forbidden} in src/lib/viz/poly-fit.ts`).toBe(false);
    },
  );

  it('calls no Math function but Math.sqrt and Math.abs', () => {
    const used = new Set(code.match(/\bMath\.\w+/g) ?? []);
    expect([...used].filter((name) => name !== 'Math.sqrt' && name !== 'Math.abs')).toEqual([]);
  });

  it('imports by relative path only', () => {
    const imports = [...code.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1]);
    expect(imports.length).toBeGreaterThan(0);
    for (const path of imports) expect(path, path).toMatch(/^\.\.?\//);
  });
});
