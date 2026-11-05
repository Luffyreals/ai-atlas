// Words of ResidualBlockFigure (cv/cnn-image-classification, after "Cách sửa"): a residual block. The input
// goes through 3 × 3 convolution, ReLU, 3 × 3 convolution (the residual F(x)) and is added back through the
// shortcut: y = F(x) + x, then a ReLU, as in He et al. (2016). The symbols x, F(x) and y = F(x) + x are drawn
// with FigMath / FigFormula in the component; here are only the words. `conv` names both convolutions.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'input' | 'conv' | 'relu' | 'residual' | 'shortcut' | 'add' | 'output';

export const RESIDUAL_BLOCK = {
  vi: {
    caption:
      'Khối dư tính $\\mathbf{y} = F(\\mathbf{x}) + \\mathbf{x}$ rồi qua ReLU; nếu khối không giúp gì, chỉ cần $F(\\mathbf{x}) \\approx \\mathbf{0}$. Đường tắt đồng nhất không có tham số.',
    label: 'Sơ đồ khối dư của ResNet: hai lớp tích chập cộng với đường tắt',
    description:
      'Đầu vào x đi theo hai đường. Đường chính qua tích chập 3 × 3, ReLU, rồi tích chập 3 × 3; ba lớp này được đóng khung và ghi là phần dư F(x). ' +
      'Đường tắt đồng nhất mang nguyên x vòng bên phải, không qua lớp nào, vào thẳng phép cộng. ' +
      'Phép cộng cho y bằng F(x) cộng x, rồi qua ReLU thành đầu ra.',
    labels: {
      input: 'Đầu vào',
      conv: 'Tích chập 3 × 3',
      relu: 'ReLU',
      residual: 'Phần dư',
      shortcut: ['Đường tắt', '(đồng nhất)'],
      add: 'Cộng',
      output: 'Đầu ra',
    },
  },
  en: {
    caption:
      'A residual block computes $\\mathbf{y} = F(\\mathbf{x}) + \\mathbf{x}$, then a ReLU; if the block does not help, it only needs $F(\\mathbf{x}) \\approx \\mathbf{0}$. The identity shortcut has no parameters.',
    label: 'Diagram of a ResNet residual block: two convolutions added to a shortcut',
    description:
      'The input x takes two paths. The main path goes through a 3 × 3 convolution, a ReLU, then a 3 × 3 convolution; these three layers are framed and named the residual F(x). ' +
      'The identity shortcut carries x unchanged round the right, through no layer, straight into the addition. ' +
      'The addition gives y equal to F(x) plus x, then a ReLU gives the output.',
    labels: {
      input: 'Input',
      conv: '3 × 3 convolution',
      relu: 'ReLU',
      residual: 'Residual',
      shortcut: ['Shortcut', '(identity)'],
      add: 'Add',
      output: 'Output',
    },
  },
} satisfies FigureText<Key>;
