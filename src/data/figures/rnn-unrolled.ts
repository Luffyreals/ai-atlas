// Words of RnnUnrolledFigure (dl/rnn, "Minh họa"): an RNN cell with its loop is a chain of copies that share
// one set of weights, linked through the hidden state. The symbols (x_t, h_t, W_x, W_h, with steps t−1, t, t+1)
// are drawn with FigMath in the component, as the lesson writes them; here are only the words.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'cell' | 'equals' | 'unrolled' | 'shared';

export const RNN_UNROLLED = {
  vi: {
    caption:
      'Mỗi bước tính $\\mathbf{h}_t = \\tanh(\\mathbf{W}_h \\mathbf{h}_{t-1} + \\mathbf{W}_x \\mathbf{x}_t + \\mathbf{b})$ với cùng $\\mathbf{W}_h$, $\\mathbf{W}_x$, $\\mathbf{b}$; trên hình ghi $\\mathbf{x}_{t-1}, \\mathbf{x}_t, \\mathbf{x}_{t+1}$ ở đầu vào và $\\mathbf{h}_{t-1}, \\mathbf{h}_t, \\mathbf{h}_{t+1}$ ở trạng thái ẩn.',
    label: 'Sơ đồ ô RNN có vòng lặp và bản mở rộng theo thời gian của nó',
    description:
      'Phía trên là một ô RNN: đầu vào x t đi vào từ dưới qua trọng số W x, trạng thái ẩn h t đi ra phía trên, và một mũi tên vòng qua trọng số W h đưa trạng thái quay lại chính ô đó. ' +
      'Dấu bằng và dòng chữ "mở rộng theo thời gian" nối sang phía dưới, nơi cùng ô ấy được vẽ thành ba ô giống hệt nhau cho các bước t − 1, t và t + 1. ' +
      'Mỗi ô nhận đầu vào của bước mình từ dưới qua W x, nhận trạng thái ẩn của bước trước từ bên trái qua W h, và đưa trạng thái ẩn mới lên trên và sang ô bên phải. ' +
      'Cả ba ô dùng chung một bộ trọng số.',
    labels: {
      cell: 'Ô RNN',
      equals: '=',
      unrolled: ['mở rộng', 'theo thời gian'],
      shared: 'Cùng trọng số ở mọi bước',
    },
  },
  en: {
    caption:
      'Each step computes $\\mathbf{h}_t = \\tanh(\\mathbf{W}_h \\mathbf{h}_{t-1} + \\mathbf{W}_x \\mathbf{x}_t + \\mathbf{b})$ with the same $\\mathbf{W}_h$, $\\mathbf{W}_x$, $\\mathbf{b}$; the figure marks the inputs $\\mathbf{x}_{t-1}, \\mathbf{x}_t, \\mathbf{x}_{t+1}$ and the hidden states $\\mathbf{h}_{t-1}, \\mathbf{h}_t, \\mathbf{h}_{t+1}$.',
    label: 'Diagram of an RNN cell with its loop, and the same cell unrolled through time',
    description:
      'At the top is one RNN cell: the input x t comes in from below through the weights W x, the hidden state h t goes out at the top, and a loop through the weights W h feeds the state back into the same cell. ' +
      'An equals sign and the words "unrolled through time" lead to the bottom, where that cell is drawn as three identical cells for the steps t − 1, t and t + 1. ' +
      'Each cell takes its own input from below through W x and the previous hidden state from the left through W h, and passes its new hidden state up and on to the cell on its right. ' +
      'All three cells share one set of weights.',
    labels: {
      cell: ['RNN', 'cell'],
      equals: '=',
      unrolled: ['unrolled', 'through time'],
      shared: 'Same weights at every step',
    },
  },
} satisfies FigureText<Key>;
