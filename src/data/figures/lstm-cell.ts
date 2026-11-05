// Words of LstmCellFigure (dl/lstm-bilstm, "Minh họa"): the cell state runs straight across the top like a
// conveyor belt, only multiplied by the forget gate and added to; the heavy work sits below. Symbols (c_{t−1},
// c_t, h_{t−1}, h_t, x_t, f_t, i_t, c̃_t, o_t, σ) are drawn with FigMath in the component; here are only the words
// and the operator signs of the small boxes (× is the element-wise product ⊙, which Barlow does not have).
// The four branches match src/code/dl/lstm-bilstm/lstm-step.vi.py (f, i, o, c_tilde; c = f*c + i*c_tilde;
// h = o*tanh(c)). vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'state' | 'forget' | 'input' | 'output' | 'tanh' | 'candidate' | 'times' | 'plus';

export const LSTM_CELL = {
  vi: {
    caption:
      'Một bước LSTM: $\\mathbf{c}_t = \\mathbf{f}_t \\odot \\mathbf{c}_{t-1} + \\mathbf{i}_t \\odot \\tilde{\\mathbf{c}}_t$ chạy trên đường ngang phía trên, $\\mathbf{h}_t = \\mathbf{o}_t \\odot \\tanh(\\mathbf{c}_t)$ đi ra bên phải. Ô × là tích từng phần tử $\\odot$; khối viền đứt là bốn nhánh có trọng số.',
    label: 'Sơ đồ một ô LSTM với trạng thái ô chạy ngang phía trên',
    description:
      'Đường trên cùng là trạng thái ô: c t − 1 vào từ bên trái, nhân từng phần tử với cổng quên, cộng thêm phần mới, rồi ra bên phải thành c t. Trên đường này không có ma trận trọng số nào. ' +
      'Phía dưới, trạng thái ẩn h t − 1 vào từ bên trái và đầu vào x t vào từ dưới, nhập thành một bó đi vào bốn nhánh: sigmoid cổng quên, sigmoid cổng vào, tanh tạo ứng viên c ngã t, và sigmoid cổng ra. ' +
      'Cổng quên f t đi lên phép nhân trên đường trạng thái ô. Cổng vào i t nhân với ứng viên, rồi đi lên phép cộng. ' +
      'Từ c t, một nhánh rẽ xuống qua tanh, nhân với cổng ra o t, thành trạng thái ẩn h t đi ra bên phải.',
    labels: {
      state: 'trạng thái ô',
      forget: 'quên',
      input: 'vào',
      output: 'ra',
      tanh: 'tanh',
      candidate: 'ứng viên',
      times: '×',
      plus: '+',
    },
  },
  en: {
    caption:
      'One LSTM step: $\\mathbf{c}_t = \\mathbf{f}_t \\odot \\mathbf{c}_{t-1} + \\mathbf{i}_t \\odot \\tilde{\\mathbf{c}}_t$ runs along the top line, and $\\mathbf{h}_t = \\mathbf{o}_t \\odot \\tanh(\\mathbf{c}_t)$ leaves on the right. A × box is the element-wise product $\\odot$; the dashed boxes are the four branches with weights.',
    label: 'Diagram of an LSTM cell with the cell state running across the top',
    description:
      'The top line is the cell state: c t − 1 comes in from the left, is multiplied element by element by the forget gate, has the new part added, and leaves on the right as c t. There is no weight matrix on this line. ' +
      'Below it, the hidden state h t − 1 comes in from the left and the input x t from below; they join into one bundle that feeds four branches: a sigmoid forget gate, a sigmoid input gate, a tanh that makes the candidate c tilde t, and a sigmoid output gate. ' +
      'The forget gate f t goes up to the product on the cell-state line. The input gate i t multiplies the candidate, and the result goes up to the sum. ' +
      'From c t, a branch goes down through tanh, is multiplied by the output gate o t, and leaves on the right as the hidden state h t.',
    labels: {
      state: 'cell state',
      forget: 'forget',
      input: 'input',
      output: 'output',
      tanh: 'tanh',
      candidate: 'candidate',
      times: '×',
      plus: '+',
    },
  },
} satisfies FigureText<Key>;
