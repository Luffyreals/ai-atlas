// src/data/datasets/sine.ts — the one copy of the overfitting data (decisions 38, 44; viz/poly-fit.md section 9.2.1).
// Made with NumPy 2.4.6: rng = np.random.default_rng(236); x = (np.arange(24) + rng.uniform(0.15, 0.85, 24)) / 24;
// y = np.sin(2 * np.pi * x) + rng.normal(0, 0.2, 24); both rounded to 2 decimals; every third point
// (i % 3 == 1, by increasing x) is a test point. The rounded numbers below ARE the data: no code regenerates them.
// Relative imports only: Playwright e2e imports this file too.
import type { PolyFitConfig } from '../../lib/viz/poly-fit';
import type { RegularizationConfig } from '../../lib/viz/regularized-fit';
import type { XYDataset } from './types';

const X = { name: { vi: 'x', en: 'x' }, unit: { vi: '', en: '' }, digits: 2 } as const;
const Y = { name: { vi: 'y', en: 'y' }, unit: { vi: '', en: '' }, digits: 2 } as const;

export const SINE_TRAIN = {
  id: 'sine-train',
  lessons: ['ml/overfitting-underfitting', 'ml/regularization'],
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
  lessons: ['ml/overfitting-underfitting', 'ml/regularization'],
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
 * PolyFitViz on SINE_TRAIN / SINE_TEST (viz/poly-fit.md, sections 9.2.4, 9.4.3; tests/unit/viz/poly-fit-sine.test.ts checks it).
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

/**
 * RegularizationViz on SINE_TRAIN / SINE_TEST (viz/regularization.md, sections 10.2.2, 10.2.6, 10.4.3; decision 48;
 * tests/unit/viz/regularization-sine.test.ts checks it).
 * - 17 levels: λ = 0 (the degree-15 fit of PolyFitViz), then 10⁻¹⁴ … 10, one per power of ten. The 15 features
 *   are nearly the same column, so a tiny λ already tames the fit: the grid goes down to 10⁻¹⁴ so that both Ridge
 *   and Lasso pass through overfit, good and underfit. The slider moves over the index, the label shows λ.
 *   scripts/sine-lasso-path.py uses the same levels: change both, then run the script again.
 * - Starts with Ridge at λ = 0, where the curve leaves the plot and every bar is off the chart.
 * - Bar chart: k over [0.5, 15.5]; w_k linear over [−10, 10], cut at the edges (the bars off the chart get a
 *   triangle), so every level from 10⁻⁵ up reads in full (but one Lasso coefficient, −11.1 at 10⁻⁵).
 */
export const SINE_REGULARIZATION: RegularizationConfig = {
  degree: 15,
  levels: [
    { lambda: 0, exp: null },
    { lambda: 1e-14, exp: -14 },
    { lambda: 1e-13, exp: -13 },
    { lambda: 1e-12, exp: -12 },
    { lambda: 1e-11, exp: -11 },
    { lambda: 1e-10, exp: -10 },
    { lambda: 1e-9, exp: -9 },
    { lambda: 1e-8, exp: -8 },
    { lambda: 1e-7, exp: -7 },
    { lambda: 1e-6, exp: -6 },
    { lambda: 1e-5, exp: -5 },
    { lambda: 1e-4, exp: -4 },
    { lambda: 1e-3, exp: -3 },
    { lambda: 1e-2, exp: -2 },
    { lambda: 1e-1, exp: -1 },
    { lambda: 1, exp: 0 },
    { lambda: 10, exp: 1 },
  ],
  slider: { min: 0, max: 16, step: 1, initial: 0 },
  initialPenalty: 'ridge',
  xDomain: [0, 1],
  yDomain: [-2, 2],
  xTicks: [0, 0.2, 0.4, 0.6, 0.8, 1],
  yTicks: [-2, -1, 0, 1, 2],
  featureDomain: [0.5, 15.5],
  featureTicks: [1, 5, 10, 15],
  coefDomain: [-10, 10],
  coefTicks: [-10, -5, 0, 5, 10],
  samples: 201,
  digits: { mse: 4, mseLarge: 2 },
};
