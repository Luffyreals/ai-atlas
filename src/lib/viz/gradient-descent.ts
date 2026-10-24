// Gradient descent on the MSE of simple linear regression, for GradientDescentViz (docs/architecture/viz.md,
// sections 12.2, 12.4.1). Pure: no DOM, no React. Notation follows the lesson ml/gradient-descent: the feature is
// min-max scaled, x̃ = (x − min) / (max − min), the model is ŷ = w̃ x̃ + b̃, the loss is the MSE with 1/m (no 1/2),
// so ∇L = (2/m) Xᵀ(Xθ − y) and the Hessian is H = (2/m) XᵀX. y stays raw: the MSE is the one of ml/linear-regression.
// Only + − × ÷, Math.sqrt, Math.abs (section 9.2.2): the numbers are the same bit for bit at build time and in every
// browser, so the prerendered HTML matches the hydrated one. tests/unit/gradient-descent.test.ts scans this file.
// Relative imports only: Playwright e2e may import this file.
import type { Row } from '../../data/datasets/types';
import { mse, type Line, type Point, type SliderSpec } from './linear-fit';
import type { Domain } from './scale';

/** "Near the bottom": the first step with MSE ≤ REACH_RATIO · the least MSE (within 1 %). */
export const REACH_RATIO = 1.01;

/** x̃ = (x − min) / range, range = max − min over the rows (min-max scaling, section 12.2.1). */
export interface MinMax {
  min: number;
  range: number;
}

/** Parameters of ŷ = w̃ x̃ + b̃ on the scaled feature. */
export interface Params {
  w: number;
  b: number;
}

export interface GradientDescentConfig {
  start: Params; // where every path starts
  levels: readonly number[]; // the learning rates η of the slider, increasing
  slider: SliderSpec; // an index into levels: min 0, step 1, max levels.length − 1
  maxSteps: number; // steps of a path that stays in the box
  wDomain: Domain; // the w̃ axis of the contour map; also the box a path must stay in
  bDomain: Domain; // the b̃ axis; same unit as w̃ (PlotFrame shape 'equal')
  wTicks: readonly number[];
  bTicks: readonly number[];
  contourLevels: readonly number[]; // MSE of each level curve, increasing, all above the least MSE
  contourHalf: number; // points per half circle = contourHalf + 1
  stepTicks: readonly number[]; // x of the MSE chart; its domain is [0, maxSteps]
  logMseDomain: Domain; // y of the MSE chart, in log10 MSE
  logMseTicks: readonly number[]; // whole powers of ten
  // Fixed decimals: η on the slider, (w̃, b̃), w and b of the line in raw units, MSE (mseLarge from 10 up), 2/L.
  digits: { eta: number; params: number; w: number; b: number; mse: number; mseLarge: number; limit: number };
}

/** min and range of x over the rows. Throws on no rows or when every x is the same (range 0). */
export function minMaxOf(rows: readonly Row[]): MinMax {
  if (rows.length === 0) throw new RangeError('minMaxOf: no rows');
  let min = rows[0][0];
  let max = min;
  for (const [x] of rows) {
    if (!Number.isFinite(x)) throw new RangeError(`minMaxOf: x = ${x} is not finite`);
    if (x < min) min = x;
    if (x > max) max = x;
  }
  if (!(max > min)) throw new RangeError(`minMaxOf: every x is ${min}, so min-max scaling divides by 0`);
  return { min, range: max - min };
}

/** [(x − min) / range, y], in row order. Same bits as NumPy's (x − x.min()) / (x.max() − x.min()). */
export function scaleRows(rows: readonly Row[], s: MinMax): Row[] {
  return rows.map(([x, y]) => [(x - s.min) / s.range, y] as const);
}

/**
 * Back to the lesson's ŷ = w x + b on raw x: put x̃ = (x − min) / range into ŷ = w̃ x̃ + b̃, so
 * w = w̃ / range and b = b̃ − w · min.
 */
export function toOriginal(p: Params, s: MinMax): Line {
  const w = p.w / s.range;
  return { w, b: p.b - w * s.min };
}

/**
 * ∂L/∂w̃ = (2/m) Σ x̃ r and ∂L/∂b̃ = (2/m) Σ r with r = w̃ x̃ + b̃ − y, summed in row order (section 12.2.4).
 * Throws on no rows.
 */
export function gradient(rows: readonly Row[], p: Params): Params {
  const m = rows.length;
  if (m === 0) throw new RangeError('gradient: no rows');
  let sw = 0;
  let sb = 0;
  for (const [x, y] of rows) {
    const r = p.w * x + p.b - y;
    sw += x * r;
    sb += r;
  }
  return { w: (2 / m) * sw, b: (2 / m) * sb };
}

/** Σx̃² and Σx̃ in row order, and m: all XᵀX needs. Throws (naming the caller) on no rows. */
function moments(rows: readonly Row[], caller: string): { m: number; sxx: number; sx: number } {
  const m = rows.length;
  if (m === 0) throw new RangeError(`${caller}: no rows`);
  let sxx = 0;
  let sx = 0;
  for (const [x] of rows) {
    sxx += x * x;
    sx += x;
  }
  return { m, sxx, sx };
}

/**
 * H = (2/m) [Σx̃², Σx̃; Σx̃, m] and its eigenvalues by the closed form of a symmetric 2 × 2 matrix:
 * L = (h11 + h22)/2 + √(((h11 − h22)/2)² + h12²), μ = det H / L (no cancellation when μ is small).
 * Throws on no rows.
 */
export function hessian(rows: readonly Row[]): { h11: number; h12: number; h22: number; L: number; mu: number } {
  const { m, sxx, sx } = moments(rows, 'hessian');
  const h11 = (2 / m) * sxx;
  const h12 = (2 / m) * sx;
  const h22 = 2;
  const half = (h11 - h22) / 2;
  const L = (h11 + h22) / 2 + Math.sqrt(half * half + h12 * h12);
  const mu = (h11 * h22 - h12 * h12) / L;
  return { h11, h12, h22, L, mu };
}

export interface GdPath {
  eta: number;
  points: Params[]; // points[0] = start; at most maxSteps + 1; ends at exitStep when it leaves the box
  mse: number[]; // mse[k] of points[k], by mse() of linear-fit.ts on the scaled rows
  reachStep: number | null; // first k with mse[k] ≤ REACH_RATIO · best
  exitStep: number | null; // first k with points[k] outside wDomain × bDomain
}

/** Whether (w̃, b̃) lies in wDomain × bDomain, edges included: the map's box and the box a path must stay in. */
export function inBox(p: Params, config: Pick<GradientDescentConfig, 'wDomain' | 'bDomain'>): boolean {
  const [w0, w1] = config.wDomain;
  const [b0, b1] = config.bDomain;
  return p.w >= w0 && p.w <= w1 && p.b >= b0 && p.b <= b1;
}

/**
 * θ ← θ − η ∇L(θ) from config.start, for config.maxSteps steps or until the first point outside the box
 * (section 12.2.3: a diverging path stops there, so no huge number ever shows). best is the least MSE.
 */
export function gdPath(rows: readonly Row[], eta: number, best: number, config: GradientDescentConfig): GdPath {
  if (!Number.isFinite(eta) || !(eta > 0)) throw new RangeError(`gdPath: η must be a finite number > 0, got ${eta}`);
  const { maxSteps } = config;
  if (!Number.isInteger(maxSteps) || maxSteps < 0) {
    throw new RangeError(`gdPath: maxSteps must be a whole number ≥ 0, got ${maxSteps}`);
  }
  const target = REACH_RATIO * best;
  let p: Params = { w: config.start.w, b: config.start.b };
  const points: Params[] = [p];
  const losses: number[] = [mse(rows, p)];
  let reachStep: number | null = losses[0] <= target ? 0 : null;
  let exitStep: number | null = inBox(p, config) ? null : 0;
  for (let k = 1; k <= maxSteps && exitStep === null; k++) {
    const g = gradient(rows, p);
    p = { w: p.w - eta * g.w, b: p.b - eta * g.b };
    points.push(p);
    losses.push(mse(rows, p));
    if (reachStep === null && losses[k] <= target) reachStep = k;
    if (!inBox(p, config)) exitStep = k;
  }
  return { eta, points, mse: losses, reachStep, exitStep };
}

export type GdOutcome =
  | { kind: 'reached'; step: number }
  | { kind: 'diverged'; step: number }
  | { kind: 'unfinished'; zigzag: boolean }; // zigzag: η L > 1, each step jumps across the valley

/** How a path ends (section 12.2.8): it left the box, it came within 1 % of the least MSE, or neither. */
export function gdOutcome(path: GdPath, L: number): GdOutcome {
  if (path.exitStep !== null) return { kind: 'diverged', step: path.exitStep };
  if (path.reachStep !== null) return { kind: 'reached', step: path.reachStep };
  return { kind: 'unfinished', zigzag: path.eta * L > 1 };
}

/**
 * The closed unit circle by the rational parametrisation ((1 − t²)/(1 + t²), 2t/(1 + t²)), no trigonometry:
 * t = −1 + 2j/half, j = 0..half, goes up the right half from (0, −1) to (0, 1); the left half is its mirror
 * (−x, y) back down, without repeating the top. 2 · half + 1 points; the last one equals the first.
 */
export function unitCircle(half: number): Point[] {
  if (!Number.isInteger(half) || half < 1) throw new RangeError(`unitCircle: half must be a whole number ≥ 1, got ${half}`);
  const right: Point[] = [];
  for (let j = 0; j <= half; j++) {
    const t = -1 + (2 * j) / half;
    const d = 1 + t * t;
    right.push({ x: (1 - t * t) / d, y: (2 * t) / d });
  }
  const left: Point[] = [];
  // 0 − x, not −x: the closing point is (0, −1), never (−0, −1).
  for (let j = half - 1; j >= 0; j--) left.push({ x: 0 - right[j].x, y: right[j].y });
  return [...right, ...left];
}

/**
 * The level curve MSE = level around the least-squares point (section 12.2.5), as points (x = w̃, y = b̃).
 * MSE(θ) = best.mse + dᵀ A d with d = θ − θ*, A = H/2 = [a, c; c, 1], a = (1/m) Σx̃², c = (1/m) Σx̃.
 * Cholesky A = RᵀR, R = [r11, r12; 0, r22]; with s = √(level − best.mse), R d = s u for each u on the circle.
 * Throws when level ≤ best.mse, or when every x̃ is the same (A singular).
 */
export function contour(
  rows: readonly Row[],
  best: Params & { mse: number },
  level: number,
  circle: readonly Point[],
): Point[] {
  const { m, sxx, sx } = moments(rows, 'contour');
  if (!(level > best.mse)) {
    throw new RangeError(`contour: the level ${level} must be above the least MSE ${best.mse}`);
  }
  const a = sxx / m;
  const c = sx / m;
  const r11 = Math.sqrt(a);
  const r12 = c / r11;
  const r22sq = 1 - r12 * r12;
  if (!(r11 > 0) || !(r22sq > 0)) throw new RangeError('contour: every x̃ is the same, so the level curves are not ellipses');
  const r22 = Math.sqrt(r22sq);
  const s = Math.sqrt(level - best.mse);
  return circle.map((u) => {
    const d2 = (s * u.y) / r22;
    const d1 = (s * u.x - r12 * d2) / r11;
    return { x: best.w + d1, y: best.b + d2 };
  });
}
