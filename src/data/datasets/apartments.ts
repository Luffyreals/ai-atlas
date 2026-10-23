// The one copy of the apartment table (decision 19 in docs/mvp.md; docs/architecture/viz.md, section 4.1).
// Used by DatasetTable (Intuition), LinearFitViz (Illustration) and src/code/ml/{ml-overview,linear-regression}/*.py, where
// the same numbers sit under "# dataset: apartments" (kept equal by tests/unit/datasets.test.ts).
// Relative imports only: Playwright e2e imports this file too.
import type { LinearFitConfig } from '../../lib/viz/linear-fit';
import type { XYDataset } from './types';

export const APARTMENTS = {
  id: 'apartments',
  lessons: ['ml/ml-overview', 'ml/linear-regression'],
  caption: {
    vi: 'Giá thuê theo diện tích của 10 căn hộ. Số liệu tự tạo cho bài học, không phải giá thị trường.',
    en: 'Rent by floor area for 10 apartments. The numbers are made up for the lesson, not market prices.',
  },
  itemLabel: { vi: 'Một căn hộ', en: 'One apartment' },
  description: {
    vi:
      'Mười điểm đi lên từ trái sang phải, từ căn 25 m² giá 6.7 triệu tới căn 85 m² giá 16.8 triệu. ' +
      'Căn rộng hơn thường đắt hơn, nhưng các điểm không nằm trên cùng một đường thẳng.',
    en:
      'Ten points rise from left to right, from a 25 m² apartment at 6.7 million to an 85 m² one at 16.8 million. ' +
      'Larger apartments tend to cost more, but the points do not lie on one straight line.',
  },
  x: { name: { vi: 'Diện tích', en: 'Floor area' }, unit: { vi: 'm²', en: 'm²' }, digits: 0, python: 'area' },
  y: {
    name: { vi: 'Giá thuê', en: 'Rent' },
    unit: { vi: 'triệu đồng/tháng', en: 'million VND/month' },
    digits: 1,
    python: 'rent',
  },
  rows: [
    [25, 6.7],
    [30, 6.5],
    [36, 8.8],
    [42, 8.8],
    [48, 9.4],
    [55, 12.2],
    [60, 12.0],
    [68, 14.1],
    [75, 13.9],
    [85, 16.8],
  ],
} as const satisfies XYDataset;

/**
 * LinearFitViz on ml/linear-regression. Checked by tests/unit/linear-fit-apartments.test.ts against
 * the constraints of viz.md section 4.1 and the Python fixture.
 * - Starts from the flat line w = 0 at about the mean rent (10.92): "line A" of the lesson, MSE 10.5020.
 * - b goes down to −10.5 (decision 24): for every w on the slider, the line through the mean point
 *   (52.4, 10.92) needs b = 10.92 − 52.4 w ≥ −10.04, so the reader can keep the line on that point while
 *   raising w. Below y = 0 the line is cut at the plot's edge (clipLineToBox).
 * - The slider grid gets down to MSE 0.36172 at w = 0.17, b = 2.0 (best 0.36148, ratio 1.0007).
 * - Four decimals for w and MSE, two for b: the best line reads 0.1695x + 2.04, MSE 0.3615, as in the
 *   lesson and the output of its normal-equation code. The mean point reads (52.4, 10.92).
 */
export const APARTMENTS_LINEAR_FIT: LinearFitConfig = {
  w: { min: 0, max: 0.4, step: 0.005, initial: 0 },
  b: { min: -10.5, max: 12, step: 0.1, initial: 10.9 },
  xDomain: [0, 100],
  yDomain: [0, 20],
  xTicks: [0, 20, 40, 60, 80, 100],
  yTicks: [0, 5, 10, 15, 20],
  digits: { w: 4, b: 2, mse: 4, meanX: 1, meanY: 2 },
};
