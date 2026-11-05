// Words of GruCellFigure (dl/gru, "Minh họa"): one GRU step, PyTorch's convention
// h_t = (1 − z_t) ⊙ h̃_t + z_t ⊙ h_{t−1}. The hidden-state line across the top only meets one product and one
// sum, so when z_t is near 1 the old state goes straight through. Symbols (h_{t−1}, x_t, r_t, z_t, h̃_t, h_t, σ)
// are drawn with FigMath in the component; here are only the words and the operator signs of the small boxes
// (× is the element-wise product ⊙, which Barlow does not have).
// vi written from docs/architecture/dl-lessons.md, section 4; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'state' | 'reset' | 'update' | 'tanh' | 'candidate' | 'times' | 'plus' | 'oneMinus';

export const GRU_CELL = {
  vi: {
    caption:
      'Một bước GRU, theo quy ước của PyTorch: $\\mathbf{h}_t = (1 - \\mathbf{z}_t) \\odot \\tilde{\\mathbf{h}}_t + \\mathbf{z}_t \\odot \\mathbf{h}_{t-1}$. Ô × là tích từng phần tử $\\odot$; khối viền đứt là ba nhánh có trọng số. Khi $\\mathbf{z}_t$ gần 1, trạng thái cũ đi gần như nguyên vẹn theo đường trên cùng.',
    label: 'Sơ đồ một ô GRU với cổng reset, cổng update và trạng thái ứng viên',
    description:
      'Trạng thái ẩn cũ h t − 1 đi vào từ bên trái theo đường trên cùng, đầu vào x t đi vào từ dưới. ' +
      'Hai cổng sigmoid, reset và update, cùng nhận h t − 1 và x t, cho ra r t và z t. ' +
      'r t nhân từng phần tử với h t − 1; kết quả cùng x t đi vào lớp tanh, cho ra trạng thái ứng viên h ngã t. ' +
      'Trên đường trên cùng, h t − 1 nhân với z t, ứng viên nhân với 1 − z t, rồi hai phần cộng lại thành h t đi ra bên phải.',
    labels: {
      state: 'trạng thái ẩn',
      reset: 'reset',
      update: 'update',
      tanh: 'tanh',
      candidate: 'ứng viên',
      times: '×',
      plus: '+',
      oneMinus: '1 −',
    },
  },
  en: {
    caption:
      'One GRU step, in PyTorch\'s convention: $\\mathbf{h}_t = (1 - \\mathbf{z}_t) \\odot \\tilde{\\mathbf{h}}_t + \\mathbf{z}_t \\odot \\mathbf{h}_{t-1}$. A × box is the element-wise product $\\odot$; the dashed boxes are the three branches with weights. When $\\mathbf{z}_t$ is near 1, the old state goes almost untouched along the top line.',
    label: 'Diagram of a GRU cell with its reset gate, update gate and candidate state',
    description:
      'The old hidden state h t − 1 comes in from the left along the top line, and the input x t comes in from below. ' +
      'Two sigmoid gates, reset and update, both take h t − 1 and x t, giving r t and z t. ' +
      'r t multiplies h t − 1 element by element; the result goes with x t into a tanh layer, giving the candidate state h tilde t. ' +
      'On the top line, h t − 1 is multiplied by z t, the candidate by 1 − z t, and the two parts add up to h t, which leaves on the right.',
    labels: {
      state: 'hidden state',
      reset: 'reset',
      update: 'update',
      tanh: 'tanh',
      candidate: 'candidate',
      times: '×',
      plus: '+',
      oneMinus: '1 −',
    },
  },
} satisfies FigureText<Key>;
