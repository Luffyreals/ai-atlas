// Words of ResidualBlockFigure (dl/modern-cnn-architectures, ResNet): the input x goes down two paths, the
// stacked layers f (conv 3×3, BN, ReLU, conv 3×3, BN) and the identity shortcut; they add up to x + f(x), then
// ReLU. The symbols (x, f(x), x + f(x)) are drawn with FigMath / FigFormula in the component; here are only the
// words. `add` is the sign in the small add box, the same in every language.
// vi written from docs/architecture/dl-lessons.md, section 4; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'input' | 'conv' | 'bn' | 'relu' | 'add' | 'output' | 'shortcut';

export const RESIDUAL_BLOCK = {
  vi: {
    caption:
      'Khối phần dư của ResNet (He và cộng sự): các lớp chỉ cần học phần chênh $f(\\mathbf{x})$, đầu ra là $\\text{ReLU}(\\mathbf{x} + f(\\mathbf{x}))$. Khi $f$ đổi số kênh hay kích thước, đường tắt dùng tích chập 1×1 để hai vế cộng được.',
    label: 'Sơ đồ khối phần dư của ResNet với đường tắt',
    description:
      'Đầu vào x đi xuống theo hai đường. Đường chính qua tích chập 3×3, BatchNorm, ReLU, tích chập 3×3, BatchNorm; cả chuỗi này là f của x. ' +
      'Đường tắt bên phải mang nguyên x vòng qua các lớp đó. ' +
      'Hai đường gặp nhau ở phép cộng, ra x cộng f của x, rồi qua ReLU thành đầu ra.',
    labels: {
      input: 'Đầu vào',
      conv: 'Tích chập 3×3',
      bn: 'BatchNorm',
      relu: 'ReLU',
      add: '+',
      output: 'Đầu ra',
      shortcut: ['đường tắt', '(identity)'],
    },
  },
  en: {
    caption:
      'The residual block of ResNet (He et al.): the layers only have to learn the difference $f(\\mathbf{x})$, and the output is $\\text{ReLU}(\\mathbf{x} + f(\\mathbf{x}))$. When $f$ changes the number of channels or the size, the shortcut uses a 1×1 convolution so that the two sides can be added.',
    label: 'Diagram of a ResNet residual block with its shortcut',
    description:
      'The input x goes down two paths. The main path goes through a 3×3 convolution, BatchNorm, ReLU, a 3×3 convolution and BatchNorm; this whole chain is f of x. ' +
      'The shortcut on the right carries x unchanged round those layers. ' +
      'The two paths meet at an addition, giving x plus f of x, which goes through ReLU to the output.',
    labels: {
      input: 'Input',
      conv: '3×3 conv',
      bn: 'BatchNorm',
      relu: 'ReLU',
      add: '+',
      output: 'Output',
      shortcut: ['shortcut', '(identity)'],
    },
  },
} satisfies FigureText<Key>;
