// Penalized polynomial fit for RegularizationViz (docs/architecture/viz.md, sections 10.2, 10.4.2). Pure: no DOM,
// no React. Notation follows the lesson ml/regularization: λ, w_k of the standardized feature z_k, b not penalized,
// MSE with 1/m. Ridge is solved here; Lasso comes precomputed (exact) from scripts/sine-lasso-path.py.
// Only + − × ÷, Math.sqrt, Math.abs (section 9.2.2), so build and browser agree bit for bit. Powers come from
// repeated multiplication, as PolynomialFeatures makes them. tests/unit/regularized-fit.test.ts scans this file.
// Relative imports only: Playwright e2e may import this file.
import type { CoefRow } from '../../data/datasets/sine-lasso-path';
import type { Row } from '../../data/datasets/types';
import type { SliderSpec } from './linear-fit';
import { leastSquaresQR, ZONE_RATIO, type FitZone } from './poly-fit';
import type { Domain } from './scale';

export type Penalty = 'ridge' | 'lasso';

/** λ = 0 when exp is null, else λ = 10^exp (the test checks lambda === Number(`1e${exp}`)). */
export interface LambdaLevel {
  lambda: number;
  exp: number | null;
}

export interface RegularizationConfig {
  degree: number; // 15
  levels: readonly LambdaLevel[]; // λ increasing, levels[0].lambda === 0
  slider: SliderSpec; // { min: 0, max: levels.length − 1, step: 1, initial }: an index into levels
  initialPenalty: Penalty;
  xDomain: Domain; // main plot
  yDomain: Domain;
  xTicks: readonly number[];
  yTicks: readonly number[];
  featureDomain: Domain; // x of the bar chart: k
  featureTicks: readonly number[];
  coefDomain: Domain; // y of the bar chart; |w_k| above it is "off the chart"
  coefTicks: readonly number[];
  samples: number; // points of the fitted curve over xDomain
  digits: { mse: number; mseLarge: number }; // formatMse of poly-fit.ts
}

/** Mean and scale (population std, like StandardScaler) of x^1..x^d on the training rows. */
export interface Standardizer {
  mean: readonly number[];
  scale: readonly number[];
}

/** penaltyPath's result: one fit per level for each penalty, and the standardizer they share. */
export interface PenaltyPath extends Record<Penalty, PenalizedFit[]> {
  standardizer: Standardizer;
}

export interface PenalizedFit extends CoefRow {
  mseTrain: number;
  mseTest: number;
  zeros: number; // coefficients exactly 0
}

/** x^1..x^d, each power one multiplication from the last. */
function powers(x: number, degree: number): number[] {
  const out = new Array<number>(degree);
  let power = 1;
  for (let k = 0; k < degree; k++) {
    power *= x;
    out[k] = power;
  }
  return out;
}

/**
 * μ_k = (1/m) Σ x_i^k and σ_k = √((1/m) Σ (x_i^k − μ_k)²), k = 1..d. A constant column gets σ_k = 1, as in
 * StandardScaler. Throws on no rows or a degree that is not a whole number ≥ 1.
 */
export function standardizer(train: readonly Row[], degree: number): Standardizer {
  if (!Number.isInteger(degree) || degree < 1) {
    throw new RangeError(`standardizer: the degree must be a whole number ≥ 1, got ${degree}`);
  }
  if (train.length === 0) throw new RangeError('standardizer: no rows');
  const m = train.length;
  const columns = train.map(([x]) => powers(x, degree));
  const mean: number[] = [];
  const scale: number[] = [];
  for (let k = 0; k < degree; k++) {
    let sum = 0;
    for (const row of columns) sum += row[k];
    const mu = sum / m;
    let squares = 0;
    for (const row of columns) {
      const d = row[k] - mu;
      squares += d * d;
    }
    const sigma = Math.sqrt(squares / m);
    mean.push(mu);
    scale.push(sigma === 0 ? 1 : sigma);
  }
  return { mean, scale };
}

/** z_k = (x^k − μ_k) / σ_k, k = 1..d; powers by repeated multiplication (as PolynomialFeatures). */
export function features(x: number, s: Standardizer): number[] {
  const degree = s.mean.length;
  if (degree === 0 || s.scale.length !== degree) {
    throw new RangeError(`features: the standardizer has ${degree} means and ${s.scale.length} scales`);
  }
  const p = powers(x, degree);
  return p.map((value, k) => (value - s.mean[k]) / s.scale[k]);
}

/**
 * λ > 0: least squares of [Z_c; √(mλ) I] w ≈ [y_c; 0] with leastSquaresQR, which minimizes m · J_Ridge without
 * squaring the condition number as the normal equations (Z_cᵀZ_c + mλI) w = Z_cᵀy_c would; b = ȳ − Σ w_k z̄_k.
 * Throws on λ ≤ 0 (λ = 0 is plain least squares: take it from the generated rows) or on no rows.
 */
export function ridgeFit(train: readonly Row[], lambda: number, s: Standardizer): CoefRow {
  if (!Number.isFinite(lambda) || !(lambda > 0)) {
    throw new RangeError(`ridgeFit: λ must be a finite number > 0, got ${lambda}`);
  }
  if (train.length === 0) throw new RangeError('ridgeFit: no rows');
  const m = train.length;
  const n = s.mean.length;
  const Z = train.map(([x]) => features(x, s));
  const zBar = new Array<number>(n).fill(0);
  let yBar = 0;
  for (let i = 0; i < m; i++) {
    for (let k = 0; k < n; k++) zBar[k] += Z[i][k];
    yBar += train[i][1];
  }
  for (let k = 0; k < n; k++) zBar[k] /= m;
  yBar /= m;

  const root = Math.sqrt(m * lambda);
  const A: number[][] = Z.map((row) => row.map((value, k) => value - zBar[k]));
  const target: number[] = train.map(([, y]) => y - yBar);
  for (let j = 0; j < n; j++) {
    const row = new Array<number>(n).fill(0);
    row[j] = root;
    A.push(row);
    target.push(0);
  }
  const w = leastSquaresQR(A, target);
  let b = yBar;
  for (let k = 0; k < n; k++) b -= w[k] * zBar[k];
  return { b, w };
}

/** ŷ = b + Σ w_k z_k(x). */
export function predictPenalized(coef: CoefRow, x: number, s: Standardizer): number {
  if (coef.w.length !== s.mean.length) {
    throw new RangeError(`predictPenalized: ${coef.w.length} coefficients for ${s.mean.length} features`);
  }
  const z = features(x, s);
  let value = coef.b;
  for (let k = 0; k < z.length; k++) value += coef.w[k] * z[k];
  return value;
}

/** (1/m) Σ (ŷ − y)²; throws on no rows. */
export function penalizedMse(rows: readonly Row[], coef: CoefRow, s: Standardizer): number {
  if (rows.length === 0) throw new RangeError('penalizedMse: no rows');
  let sum = 0;
  for (const [x, y] of rows) {
    const error = predictPenalized(coef, x, s) - y;
    sum += error * error;
  }
  return sum / rows.length;
}

function countZeros(w: readonly number[]): number {
  let zeros = 0;
  for (const value of w) if (value === 0) zeros++;
  return zeros;
}

/**
 * Both paths, one fit per level: Ridge from ridgeFit (level 0 from lasso[0]), Lasso from the generated rows; and
 * the standardizer of train, so the caller does not compute it again.
 * Throws when levels[0] is not λ = 0, when a later λ is not > 0, or when lasso has not one row per level.
 */
export function penaltyPath(
  train: readonly Row[],
  test: readonly Row[],
  config: RegularizationConfig,
  lasso: readonly CoefRow[],
): PenaltyPath {
  const { levels, degree } = config;
  if (levels.length === 0 || levels[0].lambda !== 0) {
    throw new RangeError('penaltyPath: levels[0] must be λ = 0');
  }
  if (lasso.length !== levels.length) {
    throw new RangeError(`penaltyPath: ${levels.length} levels but ${lasso.length} Lasso rows`);
  }
  const s = standardizer(train, degree);
  const fit = (coef: CoefRow): PenalizedFit => ({
    b: coef.b,
    w: coef.w,
    mseTrain: penalizedMse(train, coef, s),
    mseTest: penalizedMse(test, coef, s),
    zeros: countZeros(coef.w),
  });
  const ridge: PenalizedFit[] = [];
  const lassoFits: PenalizedFit[] = [];
  levels.forEach((level, i) => {
    if (i > 0 && !(level.lambda > 0)) {
      throw new RangeError(`penaltyPath: level ${i} has λ = ${level.lambda}; only level 0 may be 0`);
    }
    ridge.push(fit(i === 0 ? lasso[0] : ridgeFit(train, level.lambda, s)));
    lassoFits.push(fit(lasso[i]));
  });
  return { ridge, lasso: lassoFits, standardizer: s };
}

/** Index of the smallest test MSE; the larger λ (higher index) on a tie. */
export function bestLevel(fits: readonly PenalizedFit[]): number {
  if (fits.length === 0) throw new RangeError('bestLevel: no fits');
  let best = 0;
  fits.forEach((fit, i) => {
    if (fit.mseTest <= fits[best].mseTest) best = i;
  });
  return best;
}

/**
 * Section 10.2.7, with i* = bestLevel(fits): overfit when i < i* and MSE test(i) ≥ ZONE_RATIO · MSE test(i*);
 * underfit when i > i*, MSE test(i) ≥ ZONE_RATIO · MSE test(i*) and MSE train(i) ≥ ZONE_RATIO · MSE train(i*);
 * good otherwise.
 */
export function levelZone(fits: readonly PenalizedFit[], index: number): FitZone {
  if (!Number.isInteger(index) || index < 0 || index >= fits.length) {
    throw new RangeError(`levelZone: no level ${index} (levels 0 to ${fits.length - 1})`);
  }
  const best = bestLevel(fits);
  const fit = fits[index];
  const bestFit = fits[best];
  const testHigh = fit.mseTest >= ZONE_RATIO * bestFit.mseTest;
  if (index < best && testHigh) return 'overfit';
  if (index > best && testHigh && fit.mseTrain >= ZONE_RATIO * bestFit.mseTrain) return 'underfit';
  return 'good';
}

const SUPERSCRIPT_DIGITS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const SUPERSCRIPT_MINUS = '⁻';

/** "0" | "0.001" … "10" (exp ≥ −3) | "10⁻⁴" … "10⁻¹⁴" (Unicode superscripts). */
export function formatLambda(level: LambdaLevel): string {
  const { exp } = level;
  if (exp === null) return '0';
  if (!Number.isInteger(exp)) throw new RangeError(`formatLambda: exp must be a whole number, got ${exp}`);
  if (exp >= 0) return '1' + '0'.repeat(exp);
  if (exp >= -3) return '0.' + '0'.repeat(-exp - 1) + '1';
  const digits = String(-exp)
    .split('')
    .map((digit) => SUPERSCRIPT_DIGITS[Number(digit)])
    .join('');
  return '10' + SUPERSCRIPT_MINUS + digits;
}
