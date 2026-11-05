// Words of MlpFigure (dl/neural-networks, "Minh họa"): top, one neuron, z = wᵀx + b then a = g(z); bottom, an
// MLP 2 → 3 → 1 whose hidden layer is a row of such neurons. The symbols (x_j, w_j, b, z, g, a, x, a^[1], ŷ)
// are drawn with FigMath / FigFormula in the component, as the lesson writes them (dl-lessons.md, section 2);
// here are only the words. `more` is the vertical ellipsis between x_2 and x_n, one dot per line.
// vi written from docs/architecture/dl-lessons.md, section 4; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'neuron' | 'more' | 'sum' | 'weighted' | 'activation' | 'output' | 'mlp' | 'layers';

export const MLP = {
  vi: {
    caption:
      'Trên: một nơ-ron tính $z = \\mathbf{w}^\\top\\mathbf{x} + b = \\sum_j w_j x_j + b$ rồi $a = g(z)$. Dưới: MLP 2 → 3 → 1, mỗi ô của lớp ẩn là một nơ-ron như vậy; mỗi mũi tên mang một trọng số, gom lại thành $\\mathbf{W}^{[1]}$ (3 × 2) và $\\mathbf{W}^{[2]}$ (1 × 3).',
    label: 'Sơ đồ một nơ-ron nhân tạo và một mạng MLP 2–3–1',
    description:
      'Phần trên là một nơ-ron: các đầu vào x1, x2 đến xn đi vào khối tổng, mỗi đầu vào nhân với trọng số w1, w2 đến wn, cộng thêm hệ số tự do b, ra z. ' +
      'z qua hàm kích hoạt g, ra a. ' +
      'Phần dưới là một MLP: lớp vào có hai ô x1, x2, nối tới cả ba nơ-ron của lớp ẩn, ba nơ-ron này cùng nối tới một nơ-ron ở lớp ra. ' +
      'Dưới ba cột lần lượt ghi vectơ x, vectơ a mũ 1 và y mũ.',
    labels: {
      neuron: 'Một nơ-ron',
      more: ['·', '·', '·'],
      sum: 'Tổng',
      weighted: 'có trọng số',
      activation: 'kích hoạt',
      output: 'đầu ra',
      mlp: 'Mạng nhiều lớp (MLP)',
      layers: ['Lớp vào', 'Lớp ẩn', 'Lớp ra'],
    },
  },
  en: {
    caption:
      'Top: one neuron computes $z = \\mathbf{w}^\\top\\mathbf{x} + b = \\sum_j w_j x_j + b$, then $a = g(z)$. Bottom: an MLP 2 → 3 → 1; each unit of the hidden layer is such a neuron, and each arrow carries one weight, gathered into $\\mathbf{W}^{[1]}$ (3 × 2) and $\\mathbf{W}^{[2]}$ (1 × 3).',
    label: 'Diagram of one artificial neuron and a 2–3–1 MLP',
    description:
      'The top part is one neuron: the inputs x1, x2 up to xn go into a sum, each multiplied by its weight w1, w2 up to wn, plus the bias b, giving z. ' +
      'z goes through the activation function g, giving a. ' +
      'The bottom part is an MLP: the input layer has two units x1, x2, each linked to all three neurons of the hidden layer, and those three neurons all link to one neuron in the output layer. ' +
      'Under the three columns are the vector x, the vector a superscript 1, and y hat.',
    labels: {
      neuron: 'One neuron',
      more: ['·', '·', '·'],
      sum: 'Weighted',
      weighted: 'sum',
      activation: 'activation',
      output: 'output',
      mlp: 'Multilayer perceptron (MLP)',
      layers: ['Input layer', 'Hidden layer', 'Output layer'],
    },
  },
} satisfies FigureText<Key>;
