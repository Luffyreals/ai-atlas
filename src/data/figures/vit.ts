// Words of VitFigure (cv/vision-transformer, "Minh họa"): the image is cut into N = 4 patches (2 × 2, as the
// lesson's 8 × 8 digit with P = 4), each projected by the shared matrix E into a token; the learned [CLS] token
// leads the row; position embeddings 0–4 are added; the rows go through J encoder blocks; only the output of
// [CLS] goes on to the classification head. Cell numbers, N = 4, E and × J are drawn by the component.
// `encoder`, `projection`, `head`, `predicted` are [main, small...]; `cls` is the same word in both languages.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 'image'
  | 'cut'
  | 'patches'
  | 'projection'
  | 'cls'
  | 'clsNote'
  | 'tokens'
  | 'position'
  | 'encoder'
  | 'outputs'
  | 'head'
  | 'predicted';

export const VIT = {
  vi: {
    caption:
      'Ảnh $8 \\times 8$ với $P = 4$ cho $N = 4$ patch, cộng token [CLS] là 5 token $D$ chiều; chỉ hàng [CLS] ở lớp cuối đi vào đầu phân loại.',
    label: 'Sơ đồ Vision Transformer: patch thành token, token [CLS] đi vào đầu phân loại',
    description:
      'Ảnh được cắt thành lưới 2 × 2, tức N bằng 4 patch đánh số 1 tới 4 theo thứ tự đọc. Mỗi patch qua cùng một phép chiếu tuyến tính E thành một token. ' +
      'Token [CLS] học được đứng đầu hàng, trước 4 token patch; mỗi token được cộng embedding vị trí của nó, từ 0 tới 4. ' +
      'Năm token đi qua J khối bộ mã hóa Transformer, mỗi khối gồm LN, attention nhiều đầu, LN, MLP và kết nối tắt. ' +
      'Ở đầu ra, chỉ ô của [CLS] đi tiếp vào đầu phân loại rồi thành lớp dự đoán, từ 0 tới 9; các ô ra của patch vẽ mờ và không đi tiếp.',
    labels: {
      image: 'Ảnh',
      cut: 'Cắt patch',
      patches: 'patch',
      projection: ['Chiếu tuyến tính', 'dùng chung mọi patch'],
      cls: '[CLS]',
      clsNote: 'token học được',
      tokens: 'Token',
      position: '+ Vị trí',
      encoder: ['Bộ mã hóa Transformer', 'LN, attention nhiều đầu,', 'LN, MLP, kết nối tắt'],
      outputs: 'Đầu ra',
      head: ['Đầu phân loại', 'MLP'],
      predicted: ['Lớp dự đoán', '0–9'],
    },
  },
  en: {
    caption:
      'An $8 \\times 8$ image with $P = 4$ gives $N = 4$ patches; with [CLS] that is 5 tokens of $D$ dimensions. Only the [CLS] row of the last layer goes into the classification head.',
    label: 'Diagram of a Vision Transformer: patches become tokens, the [CLS] token goes into the classification head',
    description:
      'The image is cut into a 2 × 2 grid, N equal to 4 patches numbered 1 to 4 in reading order. Each patch goes through the same linear projection E into a token. ' +
      'The learned [CLS] token leads the row, before the 4 patch tokens; each token gets its position embedding added, 0 to 4. ' +
      'The five tokens go through J Transformer encoder blocks, each made of LN, multi-head attention, LN, MLP and skip connections. ' +
      'At the output, only the [CLS] cell goes on into the classification head and becomes the predicted class, 0 to 9; the patch outputs are faded and go no further.',
    labels: {
      image: 'Image',
      cut: 'Patchify',
      patches: 'patches',
      projection: ['Linear projection', 'shared by every patch'],
      cls: '[CLS]',
      clsNote: 'learned token',
      tokens: 'Tokens',
      position: '+ Position',
      encoder: ['Transformer encoder', 'LN, multi-head attention,', 'LN, MLP, skip connections'],
      outputs: 'Outputs',
      head: ['Classification head', 'MLP'],
      predicted: ['Predicted class', '0–9'],
    },
  },
} satisfies FigureText<Key>;
