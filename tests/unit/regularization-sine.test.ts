// RegularizationViz on the sine data (docs/architecture/viz.md, sections 10.2.3, 10.2.4, 10.4.1, 10.4.3, 10.6
// task R0): SINE_REGULARIZATION meets its constraints, the generated Lasso path and the fixture come from the
// current data, the TS numbers match the exact ones of scripts/sine-lasso-path.py and show the same strings, the
// Lasso rows satisfy KKT in floating point, and the story of the table in section 10.2.3 comes out of the code.
import { describe, expect, it } from 'vitest';
import { SINE_REGULARIZATION as CONFIG, SINE_TEST, SINE_TRAIN } from '../../src/data/datasets/sine';
import { SINE_LASSO_PATH } from '../../src/data/datasets/sine-lasso-path';
import type { Row } from '../../src/data/datasets/types';
import { evalPolynomial, fitPolynomial, formatMse, type FitZone } from '../../src/lib/viz/poly-fit';
import {
  bestLevel,
  features,
  levelZone,
  penaltyPath,
  predictPenalized,
  standardizer,
  type PenalizedFit,
  type Penalty,
} from '../../src/lib/viz/regularized-fit';
import { PYTHON_REGULARIZATION as PYTHON } from './fixtures/regularization-python';

const train: readonly Row[] = SINE_TRAIN.rows;
const test: readonly Row[] = SINE_TEST.rows;
const s = standardizer(train, CONFIG.degree);
const paths = penaltyPath(train, test, CONFIG, SINE_LASSO_PATH);
const penalties: Penalty[] = ['ridge', 'lasso'];
const show = (value: number) => formatMse(value, CONFIG.digits);
const indexOf = (lambda: number) => CONFIG.levels.findIndex((level) => level.lambda === lambda);
const [, coefMax] = CONFIG.coefDomain;
const overCount = (fit: PenalizedFit) => fit.w.filter((value) => Math.abs(value) > coefMax).length;
const isIncreasing = (values: readonly number[]) => values.every((value, i) => i === 0 || value > values[i - 1]);
const again = 'run scripts/sine-lasso-path.py again (venv of viz.md section 2.5)';

describe('SINE_REGULARIZATION meets viz.md section 10.4.3', () => {
  it('levels[0] is λ = 0, then λ increases strictly, each λ = 10^exp', () => {
    expect(CONFIG.levels[0]).toEqual({ lambda: 0, exp: null });
    expect(isIncreasing(CONFIG.levels.map((level) => level.lambda))).toBe(true);
    for (const level of CONFIG.levels.slice(1)) {
      expect(level.exp, `λ = ${level.lambda}`).not.toBeNull();
      expect(level.lambda).toBe(Number(`1e${level.exp}`));
    }
  });

  it('decision 48: 17 levels, 0 and 10⁻¹⁴ … 10, one per power of ten', () => {
    expect(CONFIG.levels.map((level) => level.exp)).toEqual([null, ...Array.from({ length: 16 }, (_, i) => i - 14)]);
  });

  it('the slider is an index into levels: min 0, step 1, max = levels − 1, initial inside', () => {
    const { min, max, step, initial } = CONFIG.slider;
    expect([min, step, max]).toEqual([0, 1, CONFIG.levels.length - 1]);
    expect(Number.isInteger(initial) && initial >= min && initial <= max).toBe(true);
    expect(initial).toBe(0);
    expect(CONFIG.initialPenalty).toBe('ridge');
  });

  it('one generated Lasso row per level, each with degree finite coefficients and a finite b', () => {
    expect(SINE_LASSO_PATH).toHaveLength(CONFIG.levels.length);
    for (const row of SINE_LASSO_PATH) {
      expect(row.w).toHaveLength(CONFIG.degree);
      expect(row.w.every(Number.isFinite) && Number.isFinite(row.b)).toBe(true);
    }
  });

  it('degree = training points − 1', () => {
    expect(CONFIG.degree).toBe(train.length - 1);
  });

  it.each([
    ['xTicks', CONFIG.xTicks, CONFIG.xDomain],
    ['yTicks', CONFIG.yTicks, CONFIG.yDomain],
    ['featureTicks', CONFIG.featureTicks, CONFIG.featureDomain],
    ['coefTicks', CONFIG.coefTicks, CONFIG.coefDomain],
  ] as const)('%s increase and lie inside their domain', (_, ticks, domain) => {
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(isIncreasing(ticks)).toBe(true);
    for (const tick of ticks) {
      expect(tick).toBeGreaterThanOrEqual(domain[0]);
      expect(tick).toBeLessThanOrEqual(domain[1]);
    }
  });

  it('featureDomain holds k = 1..degree; coefDomain is [−10, 10]', () => {
    expect(CONFIG.featureDomain[0]).toBeLessThan(1);
    expect(CONFIG.featureDomain[1]).toBeGreaterThan(CONFIG.degree);
    expect(CONFIG.coefDomain).toEqual([-10, 10]);
    expect(CONFIG.samples).toBeGreaterThanOrEqual(101);
  });
});

describe('the generated files come from the current data', () => {
  it('the fixture rows are the sine rows', () => {
    expect(PYTHON.train, `SINE_TRAIN.rows changed: ${again}`).toEqual(train);
    expect(PYTHON.test, `SINE_TEST.rows changed: ${again}`).toEqual(test);
  });

  it('the fixture has the levels of SINE_REGULARIZATION', () => {
    expect(PYTHON.levels.map((level) => level.lambda), `levels changed: ${again}`).toEqual(
      CONFIG.levels.map((level) => level.lambda),
    );
  });

  it('was made with the versions Pyodide 314.0.7 ships', () => {
    expect(PYTHON.versions).toEqual({ python: '3.14.5', numpy: '2.4.6', sklearn: '1.8.0' });
  });
});

describe('TS matches the exact numbers of scripts/sine-lasso-path.py', () => {
  /** |Δ| ≤ 1e-6 · max(1, |v_py|). */
  function expectNear(ts: number, py: number, what: string): void {
    const tolerance = 1e-6 * Math.max(1, Math.abs(py));
    expect(Math.abs(ts - py), `${what}: TS ${ts}, Python ${py}, tolerance ${tolerance}`).toBeLessThanOrEqual(tolerance);
  }

  const cases = PYTHON.levels.flatMap((level, i) => penalties.map((penalty) => ({ i, lambda: level.lambda, penalty })));

  it('checks 17 levels × 2 penalties × 2 MSE = 68 numbers', () => {
    expect(cases).toHaveLength(34);
  });

  it.each(cases)('$penalty, λ = $lambda: MSE train and MSE test within 1e-6, same strings', ({ i, penalty }) => {
    const fit = paths[penalty][i];
    const py = PYTHON.levels[i][penalty];
    expectNear(fit.mseTrain, py.mseTrain, `MSE train, ${penalty}, level ${i}`);
    expectNear(fit.mseTest, py.mseTest, `MSE test, ${penalty}, level ${i}`);
    expect(show(fit.mseTrain)).toBe(show(py.mseTrain));
    expect(show(fit.mseTest)).toBe(show(py.mseTest));
  });

  it('the number of Lasso coefficients exactly 0 matches at every level', () => {
    expect(paths.lasso.map((fit) => fit.zeros)).toEqual(PYTHON.levels.map((level) => level.lasso.zeros));
  });

  it('Ridge has no coefficient exactly 0 at any λ > 0', () => {
    expect(paths.ridge.slice(1).map((fit) => fit.zeros)).toEqual(new Array(16).fill(0));
  });

  it('the row of λ = 0 is the degree-15 least-squares fit: same ŷ as fitPolynomial on x = 0, 0.1, …, 1', () => {
    const poly = fitPolynomial(train, CONFIG.degree, CONFIG.xDomain);
    for (let i = 0; i <= 10; i++) {
      const x = i / 10;
      const v = evalPolynomial(poly, x, CONFIG.xDomain);
      const tolerance = 1e-3 * Math.max(1, Math.abs(v));
      expect(Math.abs(predictPenalized(SINE_LASSO_PATH[0], x, s) - v), `ŷ(${x})`).toBeLessThanOrEqual(tolerance);
    }
  });
});

describe('the Lasso rows satisfy KKT in floating point (λ ≥ 10⁻⁶)', () => {
  const m = train.length;
  const Z = train.map(([x]) => features(x, s));
  const levels = CONFIG.levels.map((level, i) => ({ i, lambda: level.lambda })).filter(({ lambda }) => lambda >= 1e-6);

  it.each(levels)('λ = $lambda: g_j = λ sign(w_j) on w_j ≠ 0, |g_j| ≤ λ on w_j = 0', ({ i, lambda }) => {
    const row = SINE_LASSO_PATH[i];
    const r = train.map(([x, y]) => y - predictPenalized(row, x, s));
    row.w.forEach((w, j) => {
      const g = (2 / m) * Z.reduce((sum, z, n) => sum + z[j] * r[n], 0);
      if (w !== 0) {
        expect(Math.abs(g - lambda * Math.sign(w)), `w_${j + 1} = ${w}`).toBeLessThanOrEqual(1e-6 * lambda);
      } else {
        expect(Math.abs(g), `w_${j + 1} = 0`).toBeLessThanOrEqual((1 + 1e-6) * lambda);
      }
    });
  });

  it('every level from 10⁻⁶ up is checked', () => {
    expect(levels).toHaveLength(8); // 10⁻⁶, 10⁻⁵, …, 1, 10
  });

  it('λ_max = max |(2/m) z_jᵀ y_c| sits between the last two levels: all zero at 10, not at 1', () => {
    expect(PYTHON.lambdaMax).toBeGreaterThan(1);
    expect(PYTHON.lambdaMax).toBeLessThan(10);
    expect(paths.lasso[indexOf(10)].zeros).toBe(15);
    expect(paths.lasso[indexOf(1)].zeros).toBe(14);
  });
});

describe('the story of section 10.2.3', () => {
  const best = indexOf(1e-3);

  it('both penalties have their smallest test MSE at λ = 10⁻³', () => {
    expect(bestLevel(paths.ridge)).toBe(best);
    expect(bestLevel(paths.lasso)).toBe(best);
  });

  it('λ = 0 is the unpenalized degree 15: MSE test ≥ 100 (133.20), MSE train 0.0000', () => {
    for (const penalty of penalties) {
      expect(paths[penalty][0].mseTest).toBeGreaterThanOrEqual(100);
      expect([show(paths[penalty][0].mseTrain), show(paths[penalty][0].mseTest)]).toEqual(['0.0000', '133.20']);
    }
  });

  it('shows the numbers of the table at 10⁻³ and at 10', () => {
    const at = (penalty: Penalty, i: number) => [show(paths[penalty][i].mseTrain), show(paths[penalty][i].mseTest)];
    expect(at('ridge', best)).toEqual(['0.0491', '0.0894']);
    expect(at('lasso', best)).toEqual(['0.0314', '0.0851']);
    expect(at('ridge', indexOf(10))).toEqual(['0.3148', '0.4750']);
    expect(at('lasso', indexOf(10))).toEqual(['0.4165', '0.5985']);
  });

  it('Lasso keeps only z_1, z_2, z_4, z_9, z_15 at the best level: 10 coefficients exactly 0', () => {
    const fit = paths.lasso[best];
    expect(fit.zeros).toBe(10);
    expect(fit.w.flatMap((w, k) => (w !== 0 ? [k + 1] : []))).toEqual([1, 2, 4, 9, 15]);
  });

  it('Lasso zeros per level: 0 1 1 2 2 3 4 5 5 7 9 9 10 11 12 14 15 (never fewer as λ grows)', () => {
    expect(paths.lasso.map((fit) => fit.zeros)).toEqual([0, 1, 1, 2, 2, 3, 4, 5, 5, 7, 9, 9, 10, 11, 12, 14, 15]);
  });

  it('coefficients off the chart (|w_k| > 10) per level, as the table says', () => {
    expect(paths.ridge.map(overCount)).toEqual([15, 14, 15, 15, 15, 15, 14, 13, 11, 1, 0, 0, 0, 0, 0, 0, 0]);
    expect(paths.lasso.map(overCount)).toEqual([15, 14, 14, 13, 13, 12, 10, 10, 10, 7, 1, 0, 0, 0, 0, 0, 0]);
  });

  it('zones: Ridge overfit {0..10⁻¹²}, good {10⁻¹¹..10⁻¹}, underfit {1, 10}', () => {
    const expected = (i: number): FitZone => (i <= indexOf(1e-12) ? 'overfit' : i <= indexOf(1e-1) ? 'good' : 'underfit');
    expect(paths.ridge.map((_, i) => levelZone(paths.ridge, i))).toEqual(paths.ridge.map((_, i) => expected(i)));
  });

  it('zones: Lasso overfit {0..10⁻⁷}, good {10⁻⁶..10⁻²}, underfit {10⁻¹, 1, 10}', () => {
    const expected = (i: number): FitZone => (i <= indexOf(1e-7) ? 'overfit' : i <= indexOf(1e-2) ? 'good' : 'underfit');
    expect(paths.lasso.map((_, i) => levelZone(paths.lasso, i))).toEqual(paths.lasso.map((_, i) => expected(i)));
  });

  it('b = ȳ = 0.0831 at every level, for both penalties (b is not penalized)', () => {
    for (const penalty of penalties) {
      for (const fit of paths[penalty]) expect(fit.b.toFixed(4)).toBe('0.0831');
    }
  });
});
