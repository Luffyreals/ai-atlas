// Polynomial fit for PolyFitViz (docs/architecture/viz/poly-fit.md, sections 9.2.2, 9.4.2). Pure: no DOM, no React.
// Notation follows the lesson ml/overfitting-underfitting: degree d, MSE with 1/m, training and test sets.
// Only + − × ÷, Math.sqrt, Math.abs (section 9.2.2): IEEE 754 rounds these correctly, so the numbers are the
// same bit for bit at build time (Node) and in every browser, and the prerendered HTML matches the hydrated one.
// Powers come from repeated multiplication. tests/unit/viz/poly-fit.test.ts scans this file to keep the rule.
// Relative imports only: Playwright e2e may import this file.
import type { Row } from '../../data/datasets/types';
import { formatNumber } from './format';
import type { Point, SliderSpec } from './linear-fit';
import { toPercentX, toPercentY, type Domain } from './scale';

/** From here formatMse shows digits.mseLarge decimals. */
export const LARGE_MSE = 10;
/** Section 9.2.5: a degree is underfit or overfit when its MSE is at least this many times the best one's. */
export const ZONE_RATIO = 2;
/** |r_kk| at or below this times max |r_jj| means a rank-deficient matrix. */
const RANK_TOLERANCE = 1e-12;
/** toPolyline holds y within ±POLYLINE_LIMIT viewBox units. */
const POLYLINE_LIMIT = 1e5;

export type FitZone = 'underfit' | 'good' | 'overfit';

export interface DegreeFit {
  degree: number;
  coef: readonly number[]; // c_0..c_d of ŷ = Σ c_k t^k, t = toUnit(x, domain)
  mseTrain: number;
  mseTest: number;
}

export interface PolyFitConfig {
  degree: SliderSpec; // the slider
  xDomain: Domain; // main plot; also the scaling domain of the fit
  yDomain: Domain;
  xTicks: readonly number[];
  yTicks: readonly number[];
  degreeDomain: Domain; // x of the error chart
  degreeTicks: readonly number[];
  mseDomain: Domain; // y of the error chart; values above are "off the chart"
  mseTicks: readonly number[];
  samples: number; // points of the fitted curve over xDomain
  truthSamples: number; // points of the true curve (wrapper, build time)
  digits: { mse: number; mseLarge: number };
}

function checkDomain(name: string, domain: Domain): void {
  const [a, b] = domain;
  if (!Number.isFinite(a) || !Number.isFinite(b) || !(a < b)) {
    throw new RangeError(`${name}: the domain must be [a, b] with finite a < b, got [${a}, ${b}]`);
  }
}

/** t = (2x − (a + b)) / (b − a): the domain [a, b] onto [−1, 1]. */
export function toUnit(x: number, domain: Domain): number {
  checkDomain('toUnit', domain);
  const [a, b] = domain;
  return (2 * x - (a + b)) / (b - a);
}

/**
 * Householder QR, then back substitution. A is m × n with m ≥ n. Throws on m < n or a rank-deficient A
 * (|r_kk| ≤ 1e-12 · max |r_jj|), with a message naming the sizes.
 */
export function leastSquaresQR(A: readonly (readonly number[])[], y: readonly number[]): number[] {
  const m = A.length;
  const n = m === 0 ? 0 : A[0].length;
  if (n === 0) throw new RangeError(`leastSquaresQR: A is ${m} × ${n}, it needs at least one row and one column`);
  if (m < n) {
    throw new RangeError(`leastSquaresQR: A is ${m} × ${n}; least squares needs at least as many rows as columns`);
  }
  if (y.length !== m) throw new RangeError(`leastSquaresQR: A has ${m} rows but y has ${y.length} values`);
  A.forEach((row, i) => {
    if (row.length !== n) throw new RangeError(`leastSquaresQR: A row ${i} has ${row.length} columns, row 0 has ${n}`);
    row.forEach((value, j) => {
      if (!Number.isFinite(value)) throw new RangeError(`leastSquaresQR: A[${i}][${j}] = ${value} is not finite`);
    });
  });
  y.forEach((value, i) => {
    if (!Number.isFinite(value)) throw new RangeError(`leastSquaresQR: y[${i}] = ${value} is not finite`);
  });

  // R starts as a copy of A and becomes upper triangular; qy starts as y and becomes Qᵀy.
  const R = A.map((row) => row.slice());
  const qy = y.slice();
  const v = new Array<number>(m).fill(0);

  for (let k = 0; k < n; k++) {
    let norm2 = 0;
    for (let i = k; i < m; i++) norm2 += R[i][k] * R[i][k];
    if (norm2 === 0) continue; // the column is already 0 here: the rank check below throws
    const norm = Math.sqrt(norm2);
    const rkk = R[k][k];
    // α = −sign(r_kk)‖·‖, so v_k = r_kk − α adds two numbers of the same sign: no cancellation.
    const alpha = rkk >= 0 ? -norm : norm;
    v[k] = rkk - alpha;
    for (let i = k + 1; i < m; i++) v[i] = R[i][k];
    let vtv = 0;
    for (let i = k; i < m; i++) vtv += v[i] * v[i];
    // H = I − 2 v vᵀ / (vᵀv) on the columns right of k, and on qy.
    for (let j = k + 1; j < n; j++) {
      let s = 0;
      for (let i = k; i < m; i++) s += v[i] * R[i][j];
      const f = (2 * s) / vtv;
      for (let i = k; i < m; i++) R[i][j] = R[i][j] - f * v[i];
    }
    let s = 0;
    for (let i = k; i < m; i++) s += v[i] * qy[i];
    const f = (2 * s) / vtv;
    for (let i = k; i < m; i++) qy[i] = qy[i] - f * v[i];
    R[k][k] = alpha;
    for (let i = k + 1; i < m; i++) R[i][k] = 0;
  }

  let largest = 0;
  for (let k = 0; k < n; k++) {
    const size = Math.abs(R[k][k]);
    if (size > largest) largest = size;
  }
  for (let k = 0; k < n; k++) {
    if (largest === 0 || Math.abs(R[k][k]) <= RANK_TOLERANCE * largest) {
      throw new RangeError(
        `leastSquaresQR: A (${m} × ${n}) is rank-deficient: |r_${k}${k}| = ${Math.abs(R[k][k])} ` +
          `against max |r_jj| = ${largest}, so the solution is not unique`,
      );
    }
  }

  const c = new Array<number>(n).fill(0);
  for (let k = n - 1; k >= 0; k--) {
    let sum = qy[k];
    for (let j = k + 1; j < n; j++) sum -= R[k][j] * c[j];
    c[k] = sum / R[k][k];
  }
  return c;
}

/**
 * Least-squares polynomial of the given degree in t = toUnit(x, domain): c_0..c_d of ŷ = Σ c_k t^k.
 * Throws when rows.length < degree + 1, or when the x values give a rank-deficient matrix (e.g. a repeated x).
 */
export function fitPolynomial(rows: readonly Row[], degree: number, domain: Domain): number[] {
  if (!Number.isInteger(degree) || degree < 0) {
    throw new RangeError(`fitPolynomial: the degree must be a whole number ≥ 0, got ${degree}`);
  }
  const columns = degree + 1;
  if (rows.length < columns) {
    throw new RangeError(
      `fitPolynomial: degree ${degree} has ${columns} coefficients, so it needs at least ${columns} rows, ` +
        `got ${rows.length}`,
    );
  }
  checkDomain('fitPolynomial', domain);
  // Vandermonde matrix in t: 1, t, t², …, t^d, each power one multiplication from the last.
  const V = rows.map(([x]) => {
    const t = toUnit(x, domain);
    const powers = new Array<number>(columns);
    let power = 1;
    for (let k = 0; k < columns; k++) {
      powers[k] = power;
      power *= t;
    }
    return powers;
  });
  try {
    return leastSquaresQR(
      V,
      rows.map(([, y]) => y),
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new RangeError(
      `fitPolynomial: degree ${degree} on ${rows.length} rows: ${reason} (do fewer than ${columns} rows ` +
        `have different x values?)`,
    );
  }
}

/** Horner in t. */
export function evalPolynomial(coef: readonly number[], x: number, domain: Domain): number {
  if (coef.length === 0) throw new RangeError('evalPolynomial: no coefficients');
  const t = toUnit(x, domain);
  let value = 0;
  for (let k = coef.length - 1; k >= 0; k--) value = value * t + coef[k];
  return value;
}

/** (1/m) Σ (ŷ − y)²; throws on no rows. */
export function polyMse(rows: readonly Row[], coef: readonly number[], domain: Domain): number {
  if (rows.length === 0) throw new RangeError('polyMse: no rows');
  let sum = 0;
  for (const [x, y] of rows) {
    const error = evalPolynomial(coef, x, domain) - y;
    sum += error * error;
  }
  return sum / rows.length;
}

/** One fit per slider degree (spec.min..spec.max), on train; MSE on train and on test. */
export function fitDegrees(
  train: readonly Row[],
  test: readonly Row[],
  spec: SliderSpec,
  domain: Domain,
): DegreeFit[] {
  const { min, max, step } = spec;
  if (!Number.isInteger(min) || !Number.isInteger(max) || !Number.isInteger(step) || min < 0 || step < 1 || max < min) {
    throw new RangeError(
      `fitDegrees: the degree slider needs whole numbers 0 ≤ min ≤ max and step ≥ 1, got min ${min}, max ${max}, ` +
        `step ${step}`,
    );
  }
  const fits: DegreeFit[] = [];
  for (let degree = min; degree <= max; degree += step) {
    const coef = fitPolynomial(train, degree, domain);
    fits.push({ degree, coef, mseTrain: polyMse(train, coef, domain), mseTest: polyMse(test, coef, domain) });
  }
  return fits;
}

/** Degree with the smallest test MSE; the lowest degree on a tie. */
export function bestDegree(fits: readonly DegreeFit[]): number {
  if (fits.length === 0) throw new RangeError('bestDegree: no fits');
  let best = fits[0];
  for (const fit of fits) {
    if (fit.mseTest < best.mseTest || (fit.mseTest === best.mseTest && fit.degree < best.degree)) best = fit;
  }
  return best.degree;
}

/** The fit of one degree, found by its degree (so any slider step works); throws when there is none. */
export function fitAt(fits: readonly DegreeFit[], degree: number): DegreeFit {
  const fit = fits.find((item) => item.degree === degree);
  if (!fit) {
    throw new RangeError(`fitAt: no fit for degree ${degree} (degrees: ${fits.map((item) => item.degree).join(', ')})`);
  }
  return fit;
}

/**
 * Section 9.2.5, with d* = bestDegree(fits):
 * underfit when d < d* and MSE train(d) ≥ ZONE_RATIO · MSE train(d*);
 * overfit when d > d* and MSE test(d) ≥ ZONE_RATIO · MSE test(d*); good otherwise.
 */
export function fitZone(fits: readonly DegreeFit[], degree: number): FitZone {
  const best = bestDegree(fits);
  const fit = fitAt(fits, degree);
  const bestFit = fitAt(fits, best);
  if (degree < best && fit.mseTrain >= ZONE_RATIO * bestFit.mseTrain) return 'underfit';
  if (degree > best && fit.mseTest >= ZONE_RATIO * bestFit.mseTest) return 'overfit';
  return 'good';
}

/** n points of f, evenly spaced over the domain, both ends included (n ≥ 2). */
export function sampleCurve(f: (x: number) => number, domain: Domain, n: number): Point[] {
  if (!Number.isInteger(n) || n < 2) throw new RangeError(`sampleCurve: needs a whole number n ≥ 2, got ${n}`);
  checkDomain('sampleCurve', domain);
  const [a, b] = domain;
  const points: Point[] = [];
  for (let i = 0; i < n; i++) {
    // The last x is b itself, not a + (b − a), which may be off by one rounding.
    const x = i === n - 1 ? b : a + ((b - a) * i) / (n - 1);
    points.push({ x, y: f(x) });
  }
  return points;
}

/** toFixed(2) without "-0.00". */
function fixed2(value: number): string {
  const text = value.toFixed(2);
  return text === '-0.00' ? '0.00' : text;
}

/** "x,y x,y …" in viewBox 0 0 100 100 units (y down), toFixed(2), "-0.00" → "0.00", y held within ±1e5. */
export function toPolyline(points: readonly Point[], x: Domain, y: Domain): string {
  checkDomain('toPolyline (x)', x);
  checkDomain('toPolyline (y)', y);
  return points
    .map((point, i) => {
      if (!Number.isFinite(point.x) || Number.isNaN(point.y)) {
        throw new RangeError(`toPolyline: point ${i} is (${point.x}, ${point.y}), not a number`);
      }
      let py = toPercentY(point.y, y);
      // Far off the plot the curve is clipped anyway: the limit only keeps the numbers sane, never a flat line in view.
      if (py > POLYLINE_LIMIT) py = POLYLINE_LIMIT;
      else if (py < -POLYLINE_LIMIT) py = -POLYLINE_LIMIT;
      return `${fixed2(toPercentX(point.x, x))},${fixed2(py)}`;
    })
    .join(' ');
}

/**
 * formatNumber(value, digits.mse) below LARGE_MSE, formatNumber(value, digits.mseLarge) from there. The test is
 * on the value as rounded to digits.mse, so 9.99996 reads "10.00", never "10.0000".
 */
export function formatMse(value: number, digits: PolyFitConfig['digits']): string {
  const small = formatNumber(value, digits.mse);
  return Number(small) < LARGE_MSE ? small : formatNumber(value, digits.mseLarge);
}
