// Words and numbers of RegularizationGeometryFigure (ml/regularization, section "Lasso"): the level ellipses of
// one shared loss touch the circle (Ridge) where both weights are non-zero, and the diamond (Lasso) at a vertex
// on an axis, where one weight is exactly 0 (docs/architecture/viz.md, section 11.4; decision 49).
// vi follows the lesson's FIG comment; en is a draft for lesson-translator (decision 43). The axis labels w1, w2
// are math, drawn with FigMath in the component, so they are not here.
import type { Quadratic } from '../../lib/figures/plot';
import type { FigureText } from './types';

type Key = 'ridge' | 'lasso' | 'touch' | 'bothNonZero' | 'onAxis' | 'ols';

export const REGULARIZATION_GEOMETRY = {
  vi: {
    caption:
      'Vùng cho phép $w_1^2 + w_2^2 \\le t$ là hình tròn, $\\lvert w_1\\rvert + \\lvert w_2\\rvert \\le t$ là hình thoi; elip đồng mức của MSE thường chạm hình thoi ở một đỉnh, nơi một trọng số bằng đúng 0.',
    label: 'Hình học của Ridge và Lasso: elip đồng mức chạm vùng cho phép',
    description:
      'Hai ô cạnh nhau, trái là Ridge, phải là Lasso; mỗi ô có trục ngang là trọng số w1 và trục đứng là trọng số w2. ' +
      'Quanh gốc tọa độ là vùng cho phép tô nhạt: hình tròn ở ô Ridge, hình thoi ở ô Lasso. ' +
      'Nghiệm không phạt là một chấm ở góc phần tư thứ nhất, nằm ngoài vùng cho phép và gần trục w1 hơn, có ba elip đồng mức lồng nhau quanh nó. ' +
      'Elip ngoài cùng chạm hình tròn ở điểm có cả hai trọng số dương, khoảng 0.91 và 0.41, còn chạm hình thoi ở đỉnh nằm trên trục w1, nơi w2 bằng 0.',
    labels: {
      ridge: 'Ridge (L2)',
      lasso: 'Lasso (L1)',
      touch: 'Điểm chạm:',
      bothNonZero: 'cả hai trọng số khác 0',
      onAxis: 'nằm trên trục',
      ols: 'Nghiệm không phạt',
    },
  },
  en: {
    caption:
      'The allowed region $w_1^2 + w_2^2 \\le t$ is a circle, and $\\lvert w_1\\rvert + \\lvert w_2\\rvert \\le t$ is a diamond; a level ellipse of the MSE often touches the diamond at a vertex, where one weight is exactly 0.',
    label: 'Geometry of Ridge and Lasso: level ellipses touching the allowed region',
    description:
      'Two panels side by side, Ridge on the left and Lasso on the right; in each, the horizontal axis is the weight w1 and the vertical axis the weight w2. ' +
      'Around the origin is the shaded allowed region: a circle for Ridge, a diamond for Lasso. ' +
      'The unpenalized solution is a dot in the first quadrant, outside the allowed region and closer to the w1 axis, with three nested level ellipses around it. ' +
      'The outermost ellipse touches the circle at a point where both weights are positive, about 0.91 and 0.41, and touches the diamond at its vertex on the w1 axis, where w2 is 0.',
    labels: {
      ridge: 'Ridge (L2)',
      lasso: 'Lasso (L1)',
      touch: 'Touch point:',
      bothNonZero: 'both weights non-zero',
      onAxis: 'on an axis',
      ols: 'Unpenalized solution',
    },
  },
} satisfies FigureText<Key>;

/**
 * Numbers of viz.md section 11.4.4 (one loss for both panels, decision 49). The touch points come from the
 * Python check there; tests/unit/figure-geometry.test.ts checks that they are the true touch points.
 */
export const REGULARIZATION_GEOMETRY_PLOT = {
  budget: 1, // circle radius and diamond vertex: t = 1
  loss: { centre: [1.3, 0.8], majorAngle: -70, axisRatio: 0.4 } satisfies Quadratic,
  ridgeTouch: [0.9116, 0.4111],
  lassoTouch: [1, 0],
  levelScales: [1 / 3, 2 / 3, 1], // the last ellipse passes through the touch point
  xDomain: [-1.2, 2.6],
  yDomain: [-1.2, 2.35],
  unit: 44,
} as const;
