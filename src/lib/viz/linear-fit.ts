// Simple linear regression for LinearFitViz (docs/architecture/viz.md, section 4.2). Pure: no DOM, no React.
// Notation follows the lesson ml/linear-regression: ŷ = wx + b, residual e = y − ŷ, MSE with 1/m.
// Relative imports only: Playwright e2e imports this file to compute the expected numbers.
import type { Row } from '../../data/datasets/types';
import { decimalsOf } from './format';

export interface Line {
  w: number;
  b: number;
}

export interface BestFit extends Line {
  mse: number;
}

export interface SliderSpec {
  min: number;
  max: number;
  step: number;
  initial: number;
}

export interface LinearFitConfig {
  w: SliderSpec;
  b: SliderSpec;
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  xTicks: readonly number[];
  yTicks: readonly number[];
  // Fixed decimals of every shown number; meanX, meanY for the mean point (x̄, ȳ).
  digits: { w: number; b: number; mse: number; meanX: number; meanY: number };
}

export interface Point {
  x: number;
  y: number;
}

/** "Very close to the best line" when mse <= best.mse * NEAR_BEST_RATIO. */
export const NEAR_BEST_RATIO = 1.05;

/** ŷ = w x + b */
export function predict(line: Line, x: number): number {
  return line.w * x + line.b;
}

/** e = y − ŷ for every row, the same sign as in the lesson (positive: the point is above the line). */
export function residuals(rows: readonly Row[], line: Line): number[] {
  return rows.map(([x, y]) => y - predict(line, x));
}

/** (1/m) Σ (ŷ − y)² */
export function mse(rows: readonly Row[], line: Line): number {
  if (rows.length === 0) throw new Error('mse: no rows');
  let sum = 0;
  for (const [x, y] of rows) {
    const error = predict(line, x) - y;
    sum += error * error;
  }
  return sum / rows.length;
}

/** The mean point (x̄, ȳ). The least-squares line always passes through it: b = ȳ − w x̄. */
export function meanPoint(rows: readonly Row[]): Point {
  if (rows.length === 0) throw new Error('meanPoint: no rows');
  let sumX = 0;
  let sumY = 0;
  for (const [x, y] of rows) {
    sumX += x;
    sumY += y;
  }
  return { x: sumX / rows.length, y: sumY / rows.length };
}

/**
 * Closed form for one feature: w = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)², b = ȳ − w x̄.
 * Throws (clear message) on fewer than 2 rows or when every x is the same.
 */
export function fitLeastSquares(rows: readonly Row[]): BestFit {
  if (rows.length < 2) {
    throw new Error(`fitLeastSquares: needs at least 2 rows, got ${rows.length}`);
  }
  const firstX = rows[0]?.[0];
  if (rows.every(([x]) => x === firstX)) {
    throw new Error(`fitLeastSquares: every x is ${firstX}, so the slope is undefined (Σ(x − x̄)² = 0)`);
  }
  const { x: meanX, y: meanY } = meanPoint(rows);
  let sxy = 0;
  let sxx = 0;
  for (const [x, y] of rows) {
    sxy += (x - meanX) * (y - meanY);
    sxx += (x - meanX) * (x - meanX);
  }
  const w = sxy / sxx;
  const b = meanY - w * meanX;
  return { w, b, mse: mse(rows, { w, b }) };
}

export function isNearBest(value: number, best: number): boolean {
  return value <= best * NEAR_BEST_RATIO;
}

/** Snaps to the slider grid, then to the step's decimals: range inputs may report 0.30000000000000004. */
export function snapToStep(value: number, spec: SliderSpec): number {
  const { min, max, step } = spec;
  if (!Number.isFinite(value)) return spec.initial;
  const clamped = Math.min(max, Math.max(min, value));
  const digits = Math.max(decimalsOf(step), decimalsOf(min));
  const snapped = Number((min + Math.round((clamped - min) / step) * step).toFixed(digits));
  return Math.min(max, Math.max(min, snapped));
}
