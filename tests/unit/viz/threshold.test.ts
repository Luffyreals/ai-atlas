// threshold.ts (docs/architecture/viz/threshold.md): hand-made cases, then every threshold t = k/20 on the 20
// patients of ml/classification-metrics against NumPy 2.4.6 + scikit-learn 1.8.0 (venv ai-atlas-py314, 06/11/2026):
//   y_pred = (p >= t).astype(int); tn, fp, fn, tp = confusion_matrix(y, y_pred, labels=[0, 1]).ravel()
//   accuracy (tp + tn) / 20, precision tp / (tp + fp) or "—", recall tp / (tp + fn), F1 2tp / (2tp + fp + fn), :.3f
import { describe, expect, it } from 'vitest';
import { PATIENTS, PATIENTS_THRESHOLD } from '../../../src/data/datasets/patients';
import { snapToStep } from '../../../src/lib/viz/linear-fit';
import {
  confusionCounts,
  formatMetric,
  laneRows,
  metricFractions,
  metricsOf,
  predictPositive,
} from '../../../src/lib/viz/threshold';

describe('threshold.ts on small cases', () => {
  it('predicts positive when p >= t, also when t carries float noise', () => {
    expect(predictPositive(0.5, 0.5)).toBe(true);
    expect(predictPositive(0.49, 0.5)).toBe(false);
    expect(predictPositive(0.3, 0.1 + 0.2)).toBe(true); // 0.30000000000000004
  });

  it('counts the four cells', () => {
    expect(confusionCounts([1, 0, 1, 0], [0.9, 0.8, 0.2, 0.1], 0.5)).toEqual({ tp: 1, fp: 1, fn: 1, tn: 1 });
    expect(() => confusionCounts([1], [0.5, 0.2], 0.5)).toThrow(RangeError);
    expect(() => confusionCounts([], [], 0.5)).toThrow(RangeError);
  });

  it('gives null for 0/0 only, and F1 = 0 when TP = 0', () => {
    const m = metricsOf({ tp: 0, fp: 0, fn: 2, tn: 3 });
    expect(m).toEqual({ accuracy: 0.6, precision: null, recall: 0, f1: 0 });
    expect(metricsOf({ tp: 0, fp: 0, fn: 0, tn: 3 }).f1).toBeNull();
    expect(() => metricsOf({ tp: 0, fp: 0, fn: 0, tn: 0 })).toThrow(RangeError);
  });

  it('formats a metric, "—" for null', () => {
    expect(formatMetric(4 / 7, 3)).toBe('0.571');
    expect(formatMetric(null, 3)).toBe('—');
  });

  it('writes the fractions as the lesson does', () => {
    expect(metricFractions({ tp: 4, fp: 3, fn: 2, tn: 11 })).toEqual({
      accuracy: '15/20',
      precision: '4/7',
      recall: '4/6',
      f1: '8/13',
    });
  });

  it('puts close points of one class on different rows', () => {
    expect(laneRows([0, 0, 0, 1], [0.5, 0.48, 0.4, 0.49], 0.05)).toEqual([0, 1, 0, 0]);
  });
});

// [t, TP, FP, FN, TN, accuracy, precision, recall, F1], from the Python command above.
const PYTHON: readonly (readonly [number, number, number, number, number, string, string, string, string])[] = [
  [0.0, 6, 14, 0, 0, '0.300', '0.300', '1.000', '0.462'],
  [0.05, 6, 12, 0, 2, '0.400', '0.333', '1.000', '0.500'],
  [0.1, 6, 10, 0, 4, '0.500', '0.375', '1.000', '0.545'],
  [0.15, 6, 8, 0, 6, '0.600', '0.429', '1.000', '0.600'],
  [0.2, 6, 7, 0, 7, '0.650', '0.462', '1.000', '0.632'],
  [0.25, 6, 6, 0, 8, '0.700', '0.500', '1.000', '0.667'],
  [0.3, 6, 5, 0, 9, '0.750', '0.545', '1.000', '0.706'],
  [0.35, 5, 5, 1, 9, '0.700', '0.500', '0.833', '0.625'],
  [0.4, 5, 4, 1, 10, '0.750', '0.556', '0.833', '0.667'],
  [0.45, 5, 3, 1, 11, '0.800', '0.625', '0.833', '0.714'],
  [0.5, 4, 3, 2, 11, '0.750', '0.571', '0.667', '0.615'],
  [0.55, 4, 2, 2, 12, '0.800', '0.667', '0.667', '0.667'],
  [0.6, 3, 2, 3, 12, '0.750', '0.600', '0.500', '0.545'],
  [0.65, 3, 1, 3, 13, '0.800', '0.750', '0.500', '0.600'],
  [0.7, 3, 1, 3, 13, '0.800', '0.750', '0.500', '0.600'],
  [0.75, 2, 1, 4, 13, '0.750', '0.667', '0.333', '0.444'],
  [0.8, 2, 0, 4, 14, '0.800', '1.000', '0.333', '0.500'],
  [0.85, 2, 0, 4, 14, '0.800', '1.000', '0.333', '0.500'],
  [0.9, 1, 0, 5, 14, '0.750', '1.000', '0.167', '0.286'],
  [0.95, 0, 0, 6, 14, '0.700', '—', '0.000', '0.000'],
  [1.0, 0, 0, 6, 14, '0.700', '—', '0.000', '0.000'],
];

describe('ThresholdViz on the 20 patients', () => {
  const { slider, digits } = PATIENTS_THRESHOLD;
  const show = (t: number) => {
    const c = confusionCounts(PATIENTS.y, PATIENTS.p, t);
    const m = metricsOf(c);
    return [c.tp, c.fp, c.fn, c.tn, ...[m.accuracy, m.precision, m.recall, m.f1].map((v) => formatMetric(v, digits.metric))];
  };

  it('has 20 patients, 6 ill, p sorted from the largest, no p on the 0.05 grid', () => {
    expect(PATIENTS.y).toHaveLength(20);
    expect(PATIENTS.p).toHaveLength(20);
    expect(PATIENTS.y.filter((v) => v === 1)).toHaveLength(6);
    expect([...PATIENTS.p].sort((a, b) => b - a)).toEqual(PATIENTS.p);
    for (const p of PATIENTS.p) expect(Math.round(p * 100) % 5).not.toBe(0);
  });

  it('the slider gives the 21 values t = k/20, starting at 0.50', () => {
    expect(slider).toEqual({ min: 0, max: 1, step: 0.05, initial: 0.5 });
    for (let k = 0; k <= 20; k++) expect(snapToStep(k * 0.05, slider)).toBe(Number((k / 20).toFixed(2)));
  });

  it.each(PYTHON)('t = %s matches NumPy and scikit-learn', (t, ...expected) => {
    expect(show(snapToStep(t, slider))).toEqual(expected);
  });

  it('shows the numbers the lesson quotes', () => {
    expect(show(0.5)).toEqual([4, 3, 2, 11, '0.750', '0.571', '0.667', '0.615']);
    expect(show(0.3)).toEqual([6, 5, 0, 9, '0.750', '0.545', '1.000', '0.706']);
    expect(show(0.8)).toEqual([2, 0, 4, 14, '0.800', '1.000', '0.333', '0.500']);
    expect(show(0.95)).toEqual([0, 0, 6, 14, '0.700', '—', '0.000', '0.000']);
  });

  it('row sums stay 6 and 14 at every threshold', () => {
    for (const [t] of PYTHON) {
      const c = confusionCounts(PATIENTS.y, PATIENTS.p, t);
      expect([c.tp + c.fn, c.fp + c.tn]).toEqual([6, 14]);
    }
  });

  it('no two dots of one class overlap: same row means at least minGap apart', () => {
    const rows = laneRows(PATIENTS.y, PATIENTS.p, PATIENTS_THRESHOLD.minGap);
    // Ill patients: one row (their lane sits right above the other one); the others: two rows.
    expect(rows.filter((_, i) => PATIENTS.y[i] === 1)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(Math.max(...rows)).toBe(1);
    PATIENTS.p.forEach((a, i) => {
      PATIENTS.p.forEach((b, j) => {
        if (i < j && PATIENTS.y[i] === PATIENTS.y[j] && rows[i] === rows[j]) {
          expect(Math.round(Math.abs(a - b) * 100)).toBeGreaterThanOrEqual(5);
        }
      });
    });
    const { lanes, yDomain } = PATIENTS_THRESHOLD;
    // The lowest row of either lane stays inside the plot.
    expect(lanes.negative - lanes.row).toBeGreaterThan(yDomain[0]);
    expect(lanes.positive).toBeLessThan(yDomain[1]);
    expect(lanes.positive).toBeGreaterThan(lanes.negative);
  });
});
