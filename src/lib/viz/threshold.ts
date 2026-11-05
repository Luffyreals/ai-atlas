// Decision threshold, confusion matrix and the four metrics for ThresholdViz (docs/architecture/viz/threshold.md).
// Pure: no DOM, no React. Notation follows ml/classification-metrics: probability p, threshold t, predict
// positive when p >= t; TP, FP, FN, TN; accuracy, precision, recall, F1 = 2TP / (2TP + FP + FN).
// tests/unit/viz/threshold.test.ts compares every threshold of the lesson with NumPy and scikit-learn.
// Relative imports only: Playwright e2e may import this file.
import type { SliderSpec } from './linear-fit';
import { formatNumber } from './format';
import type { Domain } from './scale';

/** Slack of the p >= t test: a slider may report 0.30000000000000004, and that must still take p = 0.30. */
export const THRESHOLD_EPS = 1e-9;

export interface ConfusionCounts {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

/** null where the lesson's formula divides 0 by 0 (precision with no positive prediction). */
export interface ClassificationMetrics {
  accuracy: number;
  precision: number | null;
  recall: number | null;
  f1: number | null;
}

/** Slider, axis and layout of ThresholdViz (PATIENTS_THRESHOLD in src/data/datasets/patients.ts). */
export interface ThresholdConfig {
  slider: SliderSpec; // t: 0–1, step 0.05, initial 0.5
  xTicks: readonly number[];
  yDomain: Domain; // the plot's vertical room; points sit in lanes, no y axis meaning
  lanes: { positive: number; negative: number; row: number }; // y of each class's first row, and the step down
  minGap: number; // two points of one class closer than this on p go to different rows
  digits: { t: number; metric: number };
}

/** ŷ = 1 when p >= t (the lesson's rule, unlike sklearn's predict, which uses p > 0.5). */
export function predictPositive(p: number, t: number): boolean {
  return p >= t - THRESHOLD_EPS;
}

/** The four cells at threshold t. Throws when y and p differ in length or are empty. */
export function confusionCounts(y: readonly number[], p: readonly number[], t: number): ConfusionCounts {
  if (y.length === 0 || y.length !== p.length) {
    throw new RangeError(`confusionCounts: ${y.length} labels and ${p.length} probabilities`);
  }
  const counts = { tp: 0, fp: 0, fn: 0, tn: 0 };
  y.forEach((label, i) => {
    const positive = predictPositive(p[i] ?? 0, t);
    if (label === 1) counts[positive ? 'tp' : 'fn'] += 1;
    else counts[positive ? 'fp' : 'tn'] += 1;
  });
  return counts;
}

const ratio = (num: number, den: number): number | null => (den === 0 ? null : num / den);

/** Accuracy, precision, recall and F1, as written in the lesson. F1 in its TP, FP, FN form: 0 when TP = 0. */
export function metricsOf({ tp, fp, fn, tn }: ConfusionCounts): ClassificationMetrics {
  const total = tp + fp + fn + tn;
  if (total === 0) throw new RangeError('metricsOf: no samples');
  return {
    accuracy: (tp + tn) / total,
    precision: ratio(tp, tp + fp),
    recall: ratio(tp, tp + fn),
    f1: ratio(2 * tp, 2 * tp + fp + fn),
  };
}

/** A metric with fixed decimals, or "—" for 0/0. */
export function formatMetric(value: number | null, digits: number): string {
  return value === null ? '—' : formatNumber(value, digits);
}

/**
 * Row of each point inside its class's lane, so that no two points of one class sit closer than minGap on p:
 * greedy, from the largest p down, each point takes the first row whose last point is far enough.
 */
export function laneRows(y: readonly number[], p: readonly number[], minGap: number): number[] {
  const rows = y.map(() => 0);
  const lastOfRow: Record<number, number[]> = { 0: [], 1: [] };
  const order = p.map((_, i) => i).sort((a, b) => (p[b] ?? 0) - (p[a] ?? 0) || a - b);
  for (const i of order) {
    const last = (lastOfRow[y[i] === 1 ? 1 : 0] ??= []);
    const value = p[i] ?? 0;
    let row = last.findIndex((prev) => prev - value >= minGap - THRESHOLD_EPS);
    if (row === -1) row = last.length;
    last[row] = value;
    rows[i] = row;
  }
  return rows;
}

/** Names of the four cells: notation of the lesson, the same in every locale (like the symbols of a formula). */
export const CELL_SYMBOLS = { tp: 'TP', fp: 'FP', fn: 'FN', tn: 'TN' } as const;

/** The fraction behind each metric, e.g. precision "4/7": numerator and denominator as the lesson writes them. */
export function metricFractions({ tp, fp, fn, tn }: ConfusionCounts): Record<keyof ClassificationMetrics, string> {
  return {
    accuracy: `${tp + tn}/${tp + fp + fn + tn}`,
    precision: `${tp}/${tp + fp}`,
    recall: `${tp}/${tp + fn}`,
    f1: `${2 * tp}/${2 * tp + fp + fn}`,
  };
}
