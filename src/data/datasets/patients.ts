// src/data/datasets/patients.ts — the one copy of the 20 patients of ml/classification-metrics
// (docs/architecture/viz/threshold.md). Made up for the lesson: true label y (1 = ill) and the screening model's
// probability p, sorted by p from the largest. The lesson's table and the cells confusion-matrix.*.py and
// threshold-curves.*.py list the same numbers (tests/unit/viz/threshold-patients.test.ts).
// Relative imports only: Playwright e2e imports this file too.
import type { ThresholdConfig } from '../../lib/viz/threshold';
import type { ScoredDataset } from './types';

export const PATIENTS = {
  id: 'patients',
  lessons: ['ml/classification-metrics'],
  itemLabel: { vi: 'Một bệnh nhân', en: 'One patient' },
  positive: { vi: 'Có bệnh (y = 1)', en: 'Ill (y = 1)' },
  negative: { vi: 'Không bệnh (y = 0)', en: 'Not ill (y = 0)' },
  probability: { vi: 'Xác suất có bệnh p', en: 'Probability of being ill, p' },
  description: {
    vi:
      '20 bệnh nhân tự tạo, 6 người có bệnh và 14 người không bệnh, đặt theo xác suất có bệnh mà mô hình dự đoán. ' +
      'Người có bệnh phần lớn có xác suất cao, nhưng hai nhóm xen nhau trong khoảng từ 0.3 tới 0.8.',
    en:
      '20 made-up patients, 6 ill and 14 not ill, placed by the probability of being ill that the model predicts. ' +
      'Most ill patients get a high probability, but the two groups overlap between about 0.3 and 0.8.',
  },
  y: [1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  p: [0.93, 0.86, 0.78, 0.71, 0.63, 0.58, 0.54, 0.46, 0.42, 0.36, 0.31, 0.27, 0.22, 0.18, 0.14, 0.12, 0.09, 0.07, 0.04, 0.02],
} as const satisfies ScoredDataset;

/** Slider, axis and lanes of ThresholdViz (threshold.md). t = k/20; no p is a multiple of 0.05. */
export const PATIENTS_THRESHOLD = {
  slider: { min: 0, max: 1, step: 0.05, initial: 0.5 },
  xTicks: [0, 0.2, 0.4, 0.6, 0.8, 1],
  yDomain: [0, 1],
  // Ill patients in the upper lane, the others in two rows below it (laneRows with minGap 0.05).
  lanes: { positive: 0.75, negative: 0.45, row: 0.25 },
  minGap: 0.05,
  digits: { t: 2, metric: 3 },
} as const satisfies ThresholdConfig;
