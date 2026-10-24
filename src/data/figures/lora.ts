// Words of LoraFigure (llm/evaluation-peft, "LoRA: cập nhật hạng thấp", after step 3): the input splits into
// the frozen original matrix W0 and the learned low-rank branch A → r dimensions → B → scale, and the two
// branches add up to the output. The symbols (x, h, W0, A, B, r) are drawn with FigMath in the component, as
// the lesson writes them; here are only the words. `aNote`, `bNote` and `rank` are free text beside boxes.
// The numbers of the caption are the lesson's step 4 (4096 × 4096, r = 8).
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'input' | 'output' | 'base' | 'frozen' | 'aNote' | 'bNote' | 'rank' | 'scale' | 'add';

export const LORA = {
  vi: {
    caption:
      '$\\mathbf{h} = \\mathbf{W}_0\\mathbf{x} + \\frac{\\alpha}{r}\\mathbf{B}\\mathbf{A}\\mathbf{x}$, với $\\mathbf{A} \\in \\mathbb{R}^{r \\times d_{\\text{in}}}$, $\\mathbf{B} \\in \\mathbb{R}^{d_{\\text{out}} \\times r}$. Với $d_{\\text{in}} = d_{\\text{out}} = 4096$ và $r = 8$: học 65 536 số thay vì 16 777 216.',
    label: 'Sơ đồ LoRA: ma trận gốc đóng băng và nhánh hạng thấp được học',
    description:
      'Đầu vào x đi lên theo hai nhánh. Nhánh trái là ma trận gốc W0, vuông và lớn, đóng băng. ' +
      'Nhánh phải được học: x qua ma trận A dẹt, khởi tạo ngẫu nhiên, chỉ còn r chiều ở chỗ thắt, rồi qua ma trận B hẹp và cao, khởi tạo bằng 0, rồi nhân hệ số. ' +
      'Hai nhánh cộng lại thành đầu ra h. A và B vẽ mỏng hơn hẳn ma trận gốc, vì r nhỏ hơn nhiều so với số chiều đầu vào và đầu ra.',
    labels: {
      input: 'Đầu vào',
      output: 'Đầu ra',
      base: 'Ma trận gốc',
      frozen: 'đóng băng',
      aNote: ['được học,', 'khởi tạo', 'ngẫu nhiên'],
      bNote: ['được học,', 'khởi tạo', 'bằng 0'],
      rank: 'chiều',
      scale: 'Nhân hệ số',
      add: 'Cộng',
    },
  },
  en: {
    caption:
      '$\\mathbf{h} = \\mathbf{W}_0\\mathbf{x} + \\frac{\\alpha}{r}\\mathbf{B}\\mathbf{A}\\mathbf{x}$, with $\\mathbf{A} \\in \\mathbb{R}^{r \\times d_{\\text{in}}}$, $\\mathbf{B} \\in \\mathbb{R}^{d_{\\text{out}} \\times r}$. With $d_{\\text{in}} = d_{\\text{out}} = 4096$ and $r = 8$: 65,536 numbers to learn instead of 16,777,216.',
    label: 'Diagram of LoRA: a frozen original matrix and a learned low-rank branch',
    description:
      'The input x goes up along two branches. The left branch is the original matrix W0, square and large, frozen. ' +
      'The right branch is learned: x goes through a flat matrix A, initialised at random, down to r dimensions at the narrow point, then through a tall, narrow matrix B, initialised to 0, then a scale factor. ' +
      'The two branches add up to the output h. A and B are drawn much thinner than the original matrix, because r is much smaller than the input and output sizes.',
    labels: {
      input: 'Input',
      output: 'Output',
      base: 'Base matrix',
      frozen: 'frozen',
      aNote: ['learned,', 'random', 'init'],
      bNote: ['learned,', 'init', 'to zero'],
      rank: 'dimensions',
      scale: 'Scale factor',
      add: 'Add',
    },
  },
} satisfies FigureText<Key>;
