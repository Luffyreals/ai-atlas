// src/data/datasets/sine.ts — the one copy of the overfitting data (decisions 38, 44; viz.md section 9.2.1).
// Made with NumPy 2.4.6: rng = np.random.default_rng(236); x = (np.arange(24) + rng.uniform(0.15, 0.85, 24)) / 24;
// y = np.sin(2 * np.pi * x) + rng.normal(0, 0.2, 24); both rounded to 2 decimals; every third point
// (i % 3 == 1, by increasing x) is a test point. The rounded numbers below ARE the data: no code regenerates them.
// Relative imports only: Playwright e2e imports this file too.
import type { PolyFitConfig } from '../../lib/viz/poly-fit';
import type { XYDataset } from './types';

const X = { name: { vi: 'x', en: 'x' }, unit: { vi: '', en: '' }, digits: 2 } as const;
const Y = { name: { vi: 'y', en: 'y' }, unit: { vi: '', en: '' }, digits: 2 } as const;

export const SINE_TRAIN = {
  id: 'sine-train',
  lessons: ['ml/overfitting-underfitting'], // + 'ml/regularization' when that lesson is written
  caption: {
    vi: '16 điểm train, tự sinh từ đường sin y = sin(2πx) cộng nhiễu. Không phải số liệu thật.',
    en: '16 training points, generated from the sine curve y = sin(2πx) plus noise. Not real data.',
  },
  itemLabel: { vi: 'Điểm train', en: 'Training point' },
  description: {
    vi:
      '16 điểm train, x từ 0.03 tới 0.98, đi theo một vòng sóng: lên gần 1 khi x từ 0.1 tới 0.35, ' +
      'xuống gần −1 khi x từ 0.7 tới 0.85, rồi về gần 0. Các điểm lệch khỏi dạng sóng vì có nhiễu.',
    en:
      '16 training points, x from 0.03 to 0.98, follow one wave: up near 1 for x from 0.1 to 0.35, ' +
      'down near −1 for x from 0.7 to 0.85, then back near 0. The points stray from the wave because of noise.',
  },
  x: { ...X, python: 'x_train' },
  y: { ...Y, python: 'y_train' },
  rows: [
    [0.03, 0.15], [0.12, 1.06], [0.15, 0.84], [0.23, 0.96], [0.26, 0.83], [0.35, 0.94], [0.41, 0.3], [0.47, -0.09],
    [0.51, -0.17], [0.6, -0.32], [0.64, -0.68], [0.73, -0.84], [0.77, -0.28], [0.85, -0.82], [0.9, -0.53], [0.98, -0.02],
  ],
} as const satisfies XYDataset;

export const SINE_TEST = {
  id: 'sine-test',
  lessons: ['ml/overfitting-underfitting'],
  caption: {
    vi: '8 điểm test, sinh cùng cách với tập train và không dùng khi khớp.',
    en: '8 test points, generated like the training set and never used for fitting.',
  },
  itemLabel: { vi: 'Điểm test', en: 'Test point' },
  description: {
    vi: '8 điểm test nằm xen giữa các điểm train, theo cùng dạng sóng.',
    en: '8 test points sit between the training points and follow the same wave.',
  },
  x: { ...X, python: 'x_test' },
  y: { ...Y, python: 'y_test' },
  rows: [[0.06, 0.33], [0.18, 0.66], [0.32, 0.93], [0.43, 0.43], [0.55, -0.42], [0.67, -1.11], [0.8, -1.18], [0.94, -0.45]],
} as const satisfies XYDataset;

/** The noise-free curve. f runs at build time only (PolyFitViz.astro), never in the island (section 9.2.2). */
export const SINE_TRUTH = {
  f: (x: number): number => Math.sin(2 * Math.PI * x),
  sigma: 0.2,
  description: {
    vi: 'Dữ liệu được sinh từ đường sin y = sin(2πx) cộng nhiễu ngẫu nhiên.',
    en: 'The data come from the sine curve y = sin(2πx) plus random noise.',
  },
} as const;

/**
 * PolyFitViz on SINE_TRAIN / SINE_TEST (viz.md, sections 9.2.4, 9.4.3; tests/unit/poly-fit-sine.test.ts checks it).
 * - Starts at degree 1 (underfitting); the slider tops out at 15 = training points − 1, the highest degree with
 *   a unique least-squares fit, where the curve passes through every training point.
 * - yDomain [−2, 2] holds every point (−1.18 to 1.06); the degree-8 curve stays inside, degree 9 leaves it (−3.0).
 * - The error chart: degrees over [0.5, 15.5], so degrees 1 and 15 sit off the axes (an exception, with a reason,
 *   to "ticks include both ends"); MSE over [0, 0.4], linear: every training MSE and the test MSE of degrees 1–10
 *   fit, degrees 11–15 show as triangles at the top edge.
 * - MSE with 4 decimals, 2 from 10 up (formatMse): at degrees 14–15 the 3rd and 4th decimals differ between ways
 *   of computing the fit, the first two do not.
 */
export const SINE_POLY_FIT: PolyFitConfig = {
  degree: { min: 1, max: 15, step: 1, initial: 1 },
  xDomain: [0, 1],
  yDomain: [-2, 2],
  xTicks: [0, 0.2, 0.4, 0.6, 0.8, 1],
  yTicks: [-2, -1, 0, 1, 2],
  degreeDomain: [0.5, 15.5],
  degreeTicks: [1, 5, 10, 15],
  mseDomain: [0, 0.4],
  mseTicks: [0, 0.1, 0.2, 0.3, 0.4],
  samples: 201,
  truthSamples: 61,
  digits: { mse: 4, mseLarge: 2 },
};
