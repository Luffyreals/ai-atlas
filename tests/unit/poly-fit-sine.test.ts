// PolyFitViz on the sine data (docs/architecture/viz.md, sections 9.2.1, 9.2.2, 9.2.5, 9.4.3, 9.6 task P1):
// the data keep their invariants, the TS fit matches scikit-learn (fixture) within the tolerance of section 9.2.2
// and shows the same strings, SINE_POLY_FIT meets every constraint of section 9.4.3, and the numbers of the table
// in section 9.2.1 (the ones the lesson quotes) come out of the code.
import { describe, expect, it } from 'vitest';
import { SINE_POLY_FIT as CONFIG, SINE_TEST, SINE_TRAIN, SINE_TRUTH } from '../../src/data/datasets/sine';
import type { Row } from '../../src/data/datasets/types';
import {
  bestDegree,
  evalPolynomial,
  fitDegrees,
  fitZone,
  formatMse,
  sampleCurve,
  toUnit,
  type DegreeFit,
  type FitZone,
} from '../../src/lib/viz/poly-fit';
import { PYTHON_POLY_FIT as PYTHON } from './fixtures/poly-fit-python';

// Widened from the literal tuple types of `as const`, so x values of the two sets compare.
const train: readonly Row[] = SINE_TRAIN.rows;
const test: readonly Row[] = SINE_TEST.rows;
const fits = fitDegrees(train, test, CONFIG.degree, CONFIG.xDomain);
const degrees = fits.map((fit) => fit.degree);
const show = (value: number) => formatMse(value, CONFIG.digits);

function fitOf(degree: number): DegreeFit {
  const fit = fits.find((item) => item.degree === degree);
  if (!fit) throw new Error(`no fit for degree ${degree}`);
  return fit;
}

/** Section 9.2.2: |Δ| ≤ 5e-4 · max(1, |v_py|). */
function expectNear(ts: number, py: number, what: string): void {
  const tolerance = 5e-4 * Math.max(1, Math.abs(py));
  expect(Math.abs(ts - py), `${what}: TS ${ts}, Python ${py}, tolerance ${tolerance}`).toBeLessThanOrEqual(tolerance);
}

const isIncreasing = (values: readonly number[]) => values.every((value, i) => i === 0 || value > values[i - 1]);

describe('sine data: TS matches the scikit-learn fixture', () => {
  it('the fixture was computed from the current rows (if not: run the command in the fixture again)', () => {
    const again = 'run the command in tests/unit/fixtures/poly-fit-python.ts again';
    expect(PYTHON.train, `SINE_TRAIN.rows changed: ${again}`).toEqual(train);
    expect(PYTHON.test, `SINE_TEST.rows changed: ${again}`).toEqual(test);
  });

  it('fits every slider degree, 1 to 15, as the fixture does', () => {
    expect(degrees).toEqual(PYTHON.mse.map((row) => row.degree));
    expect(degrees).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
  });

  it.each(PYTHON.mse)('degree $degree: MSE train and MSE test within tolerance, same strings', (row) => {
    const fit = fitOf(row.degree);
    expectNear(fit.mseTrain, row.train, `MSE train, degree ${row.degree}`);
    expectNear(fit.mseTest, row.test, `MSE test, degree ${row.degree}`);
    expect(show(fit.mseTrain)).toBe(show(row.train));
    expect(show(fit.mseTest)).toBe(show(row.test));
  });

  it.each(Object.entries(PYTHON.grid.pred))('degree %s: predictions on x = 0, 0.1, …, 1 within tolerance', (key, pred) => {
    const fit = fitOf(Number(key));
    expect(pred).toHaveLength(PYTHON.grid.x.length);
    PYTHON.grid.x.forEach((x, i) => {
      expectNear(evalPolynomial(fit.coef, x, CONFIG.xDomain), pred[i], `ŷ(${x}), degree ${key}`);
    });
  });

  it('checks the predictions of degrees 1, 3, 9 and 15', () => {
    expect(Object.keys(PYTHON.grid.pred).map(Number)).toEqual([1, 3, 9, 15]);
  });
});

describe('sine data: the fit is a least-squares solution', () => {
  it('degree 15 passes through every training point: largest residual < 1e-8', () => {
    const fit = fitOf(15);
    const largest = Math.max(...train.map(([x, y]) => Math.abs(evalPolynomial(fit.coef, x, CONFIG.xDomain) - y)));
    expect(largest).toBeLessThan(1e-8);
  });

  it.each(degrees.filter((d) => d <= 14))('degree %i: ‖Vᵀr‖∞ < 1e-10 (normal equations, V in t)', (degree) => {
    const fit = fitOf(degree);
    const r = train.map(([x, y]) => evalPolynomial(fit.coef, x, CONFIG.xDomain) - y);
    let largest = 0;
    for (let k = 0; k <= degree; k++) {
      let sum = 0;
      train.forEach(([x], i) => {
        const t = toUnit(x, CONFIG.xDomain);
        let power = 1;
        for (let j = 0; j < k; j++) power *= t;
        sum += power * r[i];
      });
      largest = Math.max(largest, Math.abs(sum));
    }
    expect(largest).toBeLessThan(1e-10);
  });
});

describe('sine data: the story of section 9.2.1', () => {
  it('MSE train never rises with the degree (so "falls" in errorDesc is true)', () => {
    fits.forEach((fit, i) => {
      if (i > 0) expect(fit.mseTrain, `degree ${fit.degree}`).toBeLessThanOrEqual(fits[i - 1].mseTrain);
    });
  });

  it('MSE train ≤ MSE test at every degree', () => {
    for (const fit of fits) expect(fit.mseTrain, `degree ${fit.degree}`).toBeLessThanOrEqual(fit.mseTest);
  });

  it('the best degree is 3, and test MSE rises at every step from degree 5 (best + 2) on', () => {
    expect(bestDegree(fits)).toBe(3);
    for (let d = 6; d <= 15; d++) expect(fitOf(d).mseTest, `degree ${d}`).toBeGreaterThan(fitOf(d - 1).mseTest);
  });

  it('zones: underfit {1, 2}, good {3..8}, overfit {9..15}', () => {
    const zones = Object.fromEntries(degrees.map((d) => [d, fitZone(fits, d)])) as Record<number, FitZone>;
    const expected = (d: number): FitZone => (d <= 2 ? 'underfit' : d <= 8 ? 'good' : 'overfit');
    expect(zones).toEqual(Object.fromEntries(degrees.map((d) => [d, expected(d)])));
  });

  it('shows the numbers of the table, degree 1 0.1663 / 0.2732, 3 0.0377 / 0.0754, 15 0.0000 / 133.20', () => {
    const table: Record<number, [string, string]> = {
      1: ['0.1663', '0.2732'],
      2: ['0.1624', '0.2766'],
      3: ['0.0377', '0.0754'],
      4: ['0.0308', '0.0896'],
      5: ['0.0301', '0.0969'],
      6: ['0.0287', '0.0982'],
      7: ['0.0247', '0.1027'],
      8: ['0.0216', '0.1215'],
      9: ['0.0206', '0.1656'],
      10: ['0.0189', '0.3286'],
      11: ['0.0077', '0.6439'],
      12: ['0.0013', '3.5439'],
      13: ['0.0009', '4.2848'],
      14: ['0.0002', '30.07'],
      15: ['0.0000', '133.20'],
    };
    for (const fit of fits) expect([show(fit.mseTrain), show(fit.mseTest)], `degree ${fit.degree}`).toEqual(table[fit.degree]);
  });

  it('the curve of degree 8 stays inside yDomain, the one of degree 9 leaves it', () => {
    const range = (degree: number) => {
      const ys = sampleCurve((x) => evalPolynomial(fitOf(degree).coef, x, CONFIG.xDomain), CONFIG.xDomain, CONFIG.samples)
        .map((point) => point.y);
      return [Math.min(...ys), Math.max(...ys)];
    };
    const [low8, high8] = range(8);
    expect(low8).toBeGreaterThanOrEqual(CONFIG.yDomain[0]);
    expect(high8).toBeLessThanOrEqual(CONFIG.yDomain[1]);
    expect(range(9)[0]).toBeLessThan(CONFIG.yDomain[0]);
  });
});

describe('sine data and SINE_POLY_FIT meet viz.md section 9.4.3', () => {
  const all = [...train, ...test];

  it('16 training rows, 8 test rows; x strictly increasing in each; no x in both', () => {
    expect(train).toHaveLength(16);
    expect(test).toHaveLength(8);
    expect(isIncreasing(train.map(([x]) => x))).toBe(true);
    expect(isIncreasing(test.map(([x]) => x))).toBe(true);
    const trainX = new Set(train.map(([x]) => x));
    expect(test.filter(([x]) => trainX.has(x))).toEqual([]);
  });

  it('the smallest and the largest x of all 24 points are training points (no extrapolation on test)', () => {
    const xs = all.map(([x]) => x);
    expect(trainXHas(Math.min(...xs))).toBe(true);
    expect(trainXHas(Math.max(...xs))).toBe(true);
  });

  it(`every point is within 4σ = ${4 * SINE_TRUTH.sigma} of sin(2πx)`, () => {
    for (const [x, y] of all) {
      expect(Math.abs(y - SINE_TRUTH.f(x)), `(${x}, ${y})`).toBeLessThanOrEqual(4 * SINE_TRUTH.sigma);
    }
  });

  it('every point is inside xDomain × yDomain', () => {
    for (const [x, y] of all) {
      expect(x, `(${x}, ${y})`).toBeGreaterThanOrEqual(CONFIG.xDomain[0]);
      expect(x, `(${x}, ${y})`).toBeLessThanOrEqual(CONFIG.xDomain[1]);
      expect(y, `(${x}, ${y})`).toBeGreaterThanOrEqual(CONFIG.yDomain[0]);
      expect(y, `(${x}, ${y})`).toBeLessThanOrEqual(CONFIG.yDomain[1]);
    }
  });

  it('slider: min 1, step 1, min ≤ initial ≤ max ≤ training points − 1', () => {
    const { min, max, step, initial } = CONFIG.degree;
    expect(min).toBe(1);
    expect(step).toBe(1);
    expect(Number.isInteger(initial) && Number.isInteger(max)).toBe(true);
    expect(min).toBeLessThanOrEqual(initial);
    expect(initial).toBeLessThanOrEqual(max);
    expect(max).toBeLessThanOrEqual(train.length - 1);
  });

  it.each([
    ['xTicks', CONFIG.xTicks, CONFIG.xDomain],
    ['yTicks', CONFIG.yTicks, CONFIG.yDomain],
    ['degreeTicks', CONFIG.degreeTicks, CONFIG.degreeDomain],
    ['mseTicks', CONFIG.mseTicks, CONFIG.mseDomain],
  ] as const)('%s increase and lie inside their domain', (_, ticks, domain) => {
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(isIncreasing(ticks)).toBe(true);
    for (const tick of ticks) {
      expect(tick).toBeGreaterThanOrEqual(domain[0]);
      expect(tick).toBeLessThanOrEqual(domain[1]);
    }
  });

  it('degreeDomain holds every slider degree', () => {
    expect(CONFIG.degreeDomain[0]).toBeLessThan(CONFIG.degree.min);
    expect(CONFIG.degreeDomain[1]).toBeGreaterThan(CONFIG.degree.max);
  });

  it('samples ≥ 101, truthSamples ≥ 31', () => {
    expect(CONFIG.samples).toBeGreaterThanOrEqual(101);
    expect(CONFIG.truthSamples).toBeGreaterThanOrEqual(31);
  });

  it('every MSE train, and MSE test of degrees 1–10, is inside mseDomain; degrees 11–15 test MSE is above it', () => {
    const [low, high] = CONFIG.mseDomain;
    for (const fit of fits) {
      expect(fit.mseTrain, `MSE train, degree ${fit.degree}`).toBeGreaterThanOrEqual(low);
      expect(fit.mseTrain, `MSE train, degree ${fit.degree}`).toBeLessThanOrEqual(high);
    }
    for (const fit of fits.filter((item) => item.degree <= 10)) {
      expect(fit.mseTest, `MSE test, degree ${fit.degree}`).toBeLessThanOrEqual(high);
    }
    // The error chart draws 10 rings and 5 triangles (section 9.4.6).
    expect(fits.filter((fit) => fit.mseTest > high).map((fit) => fit.degree)).toEqual([11, 12, 13, 14, 15]);
  });
});

function trainXHas(x: number): boolean {
  return train.some(([value]) => value === x);
}
