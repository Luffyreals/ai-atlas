// Words of ResidualBlockFigure (cv/cnn-image-classification): a ResNet basic block. The input goes through two
// 3 × 3 convolutions (the residual F(x)) and is added back through the shortcut, so the block only learns
// what to change. The symbols x, F(x) and F(x) + x are drawn with FigMath / FigFormula in the component.
// Order of the layers as in He et al. (2016): conv, BN, ReLU, conv, BN, add, ReLU.
// vi follows docs/architecture/cv-lessons.md section 4; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'input' | 'conv1' | 'conv2' | 'residual' | 'shortcut' | 'add' | 'relu' | 'output';

export const RESIDUAL_BLOCK = {
  vi: {
    caption:
      'Khối dư của ResNet (He và cộng sự, 2016) tính $\\mathrm{ReLU}(F(\\mathbf{x}) + \\mathbf{x})$. Khi khối tốt nhất gần với "giữ nguyên đầu vào", hai lớp tích chập chỉ cần đẩy $F(\\mathbf{x})$ về gần $\\mathbf{0}$, dễ hơn học lại cả ánh xạ.',
    label: 'Sơ đồ khối dư của ResNet: hai lớp tích chập cộng với đường tắt',
    description:
      'Đầu vào x đi theo hai đường. Đường chính qua tích chập 3 × 3 kèm chuẩn hóa batch và ReLU, rồi tích chập 3 × 3 kèm chuẩn hóa batch; kết quả là phần dư F(x). ' +
      'Đường tắt mang nguyên x vòng bên phải, không qua lớp nào. ' +
      'Hai đường gặp nhau ở phép cộng, cho F(x) + x, rồi qua ReLU thành đầu ra.',
    labels: {
      input: 'Đầu vào',
      conv1: ['Tích chập 3 × 3', 'BN, ReLU'],
      conv2: ['Tích chập 3 × 3', 'BN'],
      residual: 'phần dư',
      shortcut: ['Đường tắt:', 'giữ nguyên'],
      add: 'Cộng',
      relu: 'ReLU',
      output: 'Đầu ra',
    },
  },
  en: {
    caption:
      'A ResNet residual block (He et al., 2016) computes $\\mathrm{ReLU}(F(\\mathbf{x}) + \\mathbf{x})$. When the best block is close to "keep the input", the two convolutions only have to push $F(\\mathbf{x})$ towards $\\mathbf{0}$, which is easier than learning the whole mapping again.',
    label: 'Diagram of a ResNet residual block: two convolutions added to a shortcut',
    description:
      'The input x takes two paths. The main path goes through a 3 × 3 convolution with batch normalisation and ReLU, then a 3 × 3 convolution with batch normalisation; the result is the residual F(x). ' +
      'The shortcut carries x unchanged round the right, through no layer. ' +
      'The two paths meet at an addition, giving F(x) + x, then a ReLU gives the output.',
    labels: {
      input: 'Input',
      conv1: ['3 × 3 convolution', 'BN, ReLU'],
      conv2: ['3 × 3 convolution', 'BN'],
      residual: 'residual',
      shortcut: ['Shortcut:', 'identity'],
      add: 'Add',
      relu: 'ReLU',
      output: 'Output',
    },
  },
} satisfies FigureText<Key>;
