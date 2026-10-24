// Penalized fit of RegularizationViz (docs/architecture/viz.md, sections 10.2, 10.4.2, 10.6 task R0), on hand-made
// examples. No real dataset here: tests/unit/regularization-sine.test.ts checks the sine numbers against Python.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { CoefRow } from '../../src/data/datasets/sine-lasso-path';
import type { Row } from '../../src/data/datasets/types';
import {
  bestLevel,
  features,
  formatLambda,
  levelZone,
  penalizedMse,
  penaltyPath,
  predictPenalized,
  ridgeFit,
  standardizer,
  type PenalizedFit,
  type RegularizationConfig,
} from '../../src/lib/viz/regularized-fit';

const SOURCE_FILE = fileURLToPath(new URL('../../src/lib/viz/regularized-fit.ts', import.meta.url));

const mean = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

/** A fit with only the numbers levelZone and bestLevel read. */
const fitOf = (mseTrain: number, mseTest: number): PenalizedFit => ({ b: 0, w: [], mseTrain, mseTest, zeros: 0 });

describe('standardizer', () => {
  it('x = 1, 2, 3, degree 2: μ = (2, 14/3), σ = (√(2/3), 7√2/3), by hand', () => {
    const s = standardizer([[1, 0], [2, 0], [3, 0]], 2);
    expect(s.mean[0]).toBeCloseTo(2, 14);
    expect(s.mean[1]).toBeCloseTo(14 / 3, 14);
    expect(s.scale[0]).toBeCloseTo(Math.sqrt(2 / 3), 14);
    expect(s.scale[1]).toBeCloseTo((7 * Math.sqrt(2)) / 3, 14);
  });

  it('gives a constant column the scale 1, as StandardScaler does', () => {
    const s = standardizer([[0.5, 1], [0.5, 2]], 2);
    expect(s.mean).toEqual([0.5, 0.25]);
    expect(s.scale).toEqual([1, 1]);
  });

  it('throws on no rows and on a degree that is not a whole number ≥ 1', () => {
    expect(() => standardizer([], 2)).toThrow(/no rows/);
    expect(() => standardizer([[1, 1]], 0)).toThrow(/whole number ≥ 1/);
    expect(() => standardizer([[1, 1]], 1.5)).toThrow(/whole number ≥ 1/);
  });
});

describe('features', () => {
  const train: Row[] = [[0.1, 0], [0.35, 0], [0.4, 0], [0.62, 0], [0.9, 0]];
  const s = standardizer(train, 4);
  const Z = train.map(([x]) => features(x, s));

  it('every z_k has mean 0 and (population) standard deviation 1 on the training rows', () => {
    for (let k = 0; k < 4; k++) {
      const column = Z.map((row) => row[k]);
      expect(Math.abs(mean(column)), `mean of z_${k + 1}`).toBeLessThan(1e-14);
      expect(mean(column.map((v) => v * v)), `variance of z_${k + 1}`).toBeCloseTo(1, 13);
    }
  });

  it('z_k = (x^k − μ_k) / σ_k', () => {
    const x = 0.7;
    const z = features(x, s);
    [x, x * x, x * x * x, x * x * x * x].forEach((power, k) => {
      expect(z[k]).toBeCloseTo((power - s.mean[k]) / s.scale[k], 14);
    });
  });

  it('throws on a broken standardizer', () => {
    expect(() => features(1, { mean: [], scale: [] })).toThrow(/0 means/);
    expect(() => features(1, { mean: [0, 0], scale: [1] })).toThrow(/2 means and 1 scales/);
  });
});

describe('ridgeFit', () => {
  // 4 rows, degree 2: the 2 × 2 system (Z_cᵀZ_c + mλI) w = Z_cᵀy_c solved by Cramer's rule.
  const train: Row[] = [[0.2, 1.0], [0.5, 0.3], [0.7, -0.4], [1.1, 0.8]];
  const s = standardizer(train, 2);

  it.each([1e-3, 0.1, 2])('λ = %s: matches (Z_cᵀZ_c + mλI)⁻¹ Z_cᵀy_c by hand within 1e-12', (lambda) => {
    const m = train.length;
    const Z = train.map(([x]) => features(x, s));
    const zBar = [mean(Z.map((row) => row[0])), mean(Z.map((row) => row[1]))];
    const yBar = mean(train.map(([, y]) => y));
    const Zc = Z.map((row) => [row[0] - zBar[0], row[1] - zBar[1]]);
    const yc = train.map(([, y]) => y - yBar);
    const g = (j: number, k: number) => Zc.reduce((sum, row) => sum + row[j] * row[k], 0);
    const c = (j: number) => Zc.reduce((sum, row, i) => sum + row[j] * yc[i], 0);
    const a11 = g(0, 0) + m * lambda;
    const a12 = g(0, 1);
    const a22 = g(1, 1) + m * lambda;
    const det = a11 * a22 - a12 * a12;
    const w1 = (c(0) * a22 - a12 * c(1)) / det;
    const w2 = (a11 * c(1) - a12 * c(0)) / det;
    const b = yBar - w1 * zBar[0] - w2 * zBar[1];

    const fit = ridgeFit(train, lambda, s);
    expect(fit.w).toHaveLength(2);
    expect(Math.abs(fit.w[0] - w1)).toBeLessThan(1e-12);
    expect(Math.abs(fit.w[1] - w2)).toBeLessThan(1e-12);
    expect(Math.abs(fit.b - b)).toBeLessThan(1e-12);
  });

  it('degree 3 on 6 rows: the gradient of J_Ridge is 0, (2/m) Z_cᵀ(y − ŷ) = 2λw within 1e-12', () => {
    const rows: Row[] = [[0, 0.1], [0.2, 0.9], [0.4, 0.5], [0.6, -0.6], [0.8, -0.9], [1, 0.2]];
    const s3 = standardizer(rows, 3);
    const lambda = 0.01;
    const fit = ridgeFit(rows, lambda, s3);
    const m = rows.length;
    const r = rows.map(([x, y]) => y - predictPenalized(fit, x, s3));
    expect(Math.abs(mean(r)), 'Σ r = 0: b is not penalized').toBeLessThan(1e-12);
    for (let k = 0; k < 3; k++) {
      const gk = (2 / m) * rows.reduce((sum, [x], i) => sum + features(x, s3)[k] * r[i], 0);
      expect(Math.abs(gk - 2 * lambda * fit.w[k]), `k = ${k + 1}`).toBeLessThan(1e-12);
    }
  });

  it('a very large λ squeezes w to 0 (‖w‖ < 1e-6) and leaves b = ȳ', () => {
    const fit = ridgeFit(train, 1e12, s);
    expect(Math.sqrt(fit.w.reduce((sum, v) => sum + v * v, 0))).toBeLessThan(1e-6);
    expect(fit.b).toBeCloseTo(mean(train.map(([, y]) => y)), 6);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('throws on λ = %s', (lambda) => {
    expect(() => ridgeFit(train, lambda, s)).toThrow(/λ must be a finite number > 0/);
  });

  it('throws on no rows', () => {
    expect(() => ridgeFit([], 1, s)).toThrow(/no rows/);
  });
});

describe('predictPenalized and penalizedMse', () => {
  const s = { mean: [1, 2], scale: [2, 4] };
  const coef: CoefRow = { b: 0.5, w: [2, -1] };

  it('ŷ = b + Σ w_k z_k: x = 3 gives z = (1, 7/4), ŷ = 0.5 + 2 − 1.75 = 0.75', () => {
    expect(predictPenalized(coef, 3, s)).toBeCloseTo(0.75, 15);
  });

  it('MSE with 1/m', () => {
    // x = 1: z = (0, −1/4), ŷ = 0.75; x = 3: ŷ = 0.75.
    expect(penalizedMse([[1, 0.25], [3, 1.75]], coef, s)).toBeCloseTo((0.25 + 1) / 2, 15);
  });

  it('throws on no rows and on a coefficient count that does not match the features', () => {
    expect(() => penalizedMse([], coef, s)).toThrow(/no rows/);
    expect(() => predictPenalized({ b: 0, w: [1] }, 1, s)).toThrow(/1 coefficients for 2 features/);
  });
});

describe('penaltyPath', () => {
  const train: Row[] = [[0.1, 0.2], [0.3, 0.9], [0.5, 0.1], [0.7, -0.5], [0.9, 0.3]];
  const test: Row[] = [[0.2, 0.5], [0.6, -0.2]];
  const config = {
    degree: 2,
    levels: [{ lambda: 0, exp: null }, { lambda: 0.01, exp: -2 }, { lambda: 1, exp: 0 }],
  } as unknown as RegularizationConfig;
  const lasso: CoefRow[] = [{ b: 0.2, w: [0.3, -0.1] }, { b: 0.2, w: [0.2, 0] }, { b: 0.2, w: [0, 0] }];

  it('Ridge from ridgeFit (level 0 from the first Lasso row), Lasso from the rows; MSE and zeros of each', () => {
    const path = penaltyPath(train, test, config, lasso);
    const s = standardizer(train, 2);
    expect(path.ridge).toHaveLength(3);
    expect(path.lasso).toHaveLength(3);
    expect(path.ridge[0]).toEqual(path.lasso[0]);
    expect(path.ridge[2].w).toEqual(ridgeFit(train, 1, s).w);
    expect(path.ridge[1].zeros).toBe(0);
    expect(path.lasso.map((fit) => fit.zeros)).toEqual([0, 1, 2]);
    expect(path.lasso[1].mseTrain).toBe(penalizedMse(train, lasso[1], s));
    expect(path.lasso[1].mseTest).toBe(penalizedMse(test, lasso[1], s));
  });

  it('returns the standardizer of train with the fits, so the island does not compute it again', () => {
    expect(penaltyPath(train, test, config, lasso).standardizer).toEqual(standardizer(train, 2));
  });

  it('throws when level 0 is not λ = 0, a later λ is not > 0, or the Lasso rows do not match the levels', () => {
    const levels = (lambdas: number[]) =>
      ({ degree: 2, levels: lambdas.map((lambda) => ({ lambda, exp: null })) }) as unknown as RegularizationConfig;
    expect(() => penaltyPath(train, test, levels([0.1, 1, 2]), lasso)).toThrow(/levels\[0\] must be λ = 0/);
    expect(() => penaltyPath(train, test, levels([0, 0, 1]), lasso)).toThrow(/level 1 has λ = 0/);
    expect(() => penaltyPath(train, test, config, lasso.slice(0, 2))).toThrow(/3 levels but 2 Lasso rows/);
  });
});

describe('bestLevel', () => {
  it('the smallest test MSE', () => {
    expect(bestLevel([fitOf(0, 3), fitOf(0, 1), fitOf(0, 2)])).toBe(1);
  });

  it('the larger λ (higher index) on a tie', () => {
    expect(bestLevel([fitOf(0, 5), fitOf(0, 1), fitOf(0, 1), fitOf(0, 4)])).toBe(2);
  });

  it('throws on no fits', () => {
    expect(() => bestLevel([])).toThrow(/no fits/);
  });
});

describe('levelZone (section 10.2.7)', () => {
  // Best is level 2 (test 0.1, train 0.02).
  const fits = [
    fitOf(0, 10), // test ≥ 2 × best, left of best: overfit
    fitOf(0.01, 0.15), // test < 2 × best: good
    fitOf(0.02, 0.1), // best
    fitOf(0.03, 0.25), // test twice the best but train not yet twice: good
    fitOf(0.05, 0.3), // both twice the best: underfit
  ];

  it('gives overfit, good, good, good, underfit', () => {
    expect(fits.map((_, i) => levelZone(fits, i))).toEqual(['overfit', 'good', 'good', 'good', 'underfit']);
  });

  it('a level left of the best is never underfit, one right of it never overfit', () => {
    // Left: a huge train MSE, test below twice the best. Right: a huge test MSE, train MSE 0.
    const flipped = [fitOf(1, 0.09), fitOf(0.02, 0.05), fitOf(0, 10)];
    expect(flipped.map((_, i) => levelZone(flipped, i))).toEqual(['good', 'good', 'good']);
  });

  it('throws on a level that does not exist', () => {
    expect(() => levelZone(fits, 5)).toThrow(/no level 5/);
    expect(() => levelZone(fits, -1)).toThrow(/no level -1/);
    expect(() => levelZone(fits, 1.5)).toThrow(/no level 1.5/);
  });
});

describe('formatLambda', () => {
  it.each([
    [{ lambda: 0, exp: null }, '0'],
    [{ lambda: 1e-3, exp: -3 }, '0.001'],
    [{ lambda: 1e-2, exp: -2 }, '0.01'],
    [{ lambda: 1e-1, exp: -1 }, '0.1'],
    [{ lambda: 1, exp: 0 }, '1'],
    [{ lambda: 10, exp: 1 }, '10'],
    [{ lambda: 1e-4, exp: -4 }, '10⁻⁴'],
    [{ lambda: 1e-10, exp: -10 }, '10⁻¹⁰'],
    [{ lambda: 1e-14, exp: -14 }, '10⁻¹⁴'],
  ])('%o → %s', (level, text) => {
    expect(formatLambda(level)).toBe(text);
  });

  it('the decimal forms are the numbers themselves', () => {
    for (let exp = -3; exp <= 1; exp++) expect(Number(formatLambda({ lambda: 0, exp }))).toBe(Number(`1e${exp}`));
  });

  it('throws on an exponent that is not a whole number', () => {
    expect(() => formatLambda({ lambda: 0.5, exp: -0.5 })).toThrow(/whole number/);
  });
});

describe('regularized-fit.ts source', () => {
  /** The code without its comments: "/**" of a doc comment is not the ** operator. */
  const code = readFileSync(SOURCE_FILE, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  it('has code left once the comments are gone', () => {
    expect(code).toContain('export function ridgeFit');
  });

  // Section 9.2.2: only + − × ÷, Math.sqrt and Math.abs, so build and browser agree bit for bit.
  it.each(['**', 'Math.pow', 'Math.hypot', 'Math.exp', 'Math.log', 'Math.sin', 'Math.cos'])(
    'does not use %s',
    (forbidden) => {
      expect(code.includes(forbidden), `${forbidden} in src/lib/viz/regularized-fit.ts`).toBe(false);
    },
  );

  it('calls no Math function but Math.sqrt and Math.abs', () => {
    const used = new Set(code.match(/\bMath\.\w+/g) ?? []);
    expect([...used].filter((name) => name !== 'Math.sqrt' && name !== 'Math.abs')).toEqual([]);
  });
});
