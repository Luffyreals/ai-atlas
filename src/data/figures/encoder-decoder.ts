// Words of EncoderDecoderFigure (llm/seq2seq, "Minh họa"): the encoder reads the whole source sentence once;
// the decoder makes one target token at a time, and each of its layers looks back at the encoder output
// through cross-attention (Q from the decoder, K and V from the encoder). `source` and `target` hold one token
// per entry (a row of boxes), not lines of one label. Q, K, V and N are drawn with FigMath in the component.
// N = 6 in the original Transformer; N = 2 in the lesson's PyTorch cell (src/code/llm/seq2seq/tiny-transformer).
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 'encoder'
  | 'decoder'
  | 'source'
  | 'target'
  | 'selfAttn'
  | 'unmasked'
  | 'masked'
  | 'cross'
  | 'feedForward'
  | 'layers'
  | 'encoderOut'
  | 'next'
  | 'append';

export const ENCODER_DECODER = {
  vi: {
    caption:
      'Ma trận điểm của cross-attention có kích thước $L_y \\times L_x$ và không có mặt nạ nhân quả; chỉ self-attention của decoder có mặt nạ. Transformer gốc có $N = 6$, ô PyTorch của bài có $N = 2$.',
    label: 'Sơ đồ Transformer encoder–decoder: decoder nhìn lại encoder qua cross-attention',
    description:
      'Bên trái là encoder: các token nguồn the, black, cat đi lên qua self-attention không mặt nạ rồi truyền thẳng, lặp N lớp, ra đầu ra encoder. ' +
      'Bên phải là decoder: các token đầu vào BOS, con, mèo đi lên qua self-attention có mặt nạ, rồi cross-attention, rồi truyền thẳng, lặp N lớp, ra token kế là đen. ' +
      'Cross-attention lấy Q từ self-attention có mặt nạ của decoder, còn K và V từ đầu ra encoder. ' +
      'Khi sinh, token kế được nối vào cuối hàng đầu vào của decoder.',
    labels: {
      encoder: 'Encoder',
      decoder: 'Decoder',
      source: ['the', 'black', 'cat'],
      target: ['<BOS>', 'con', 'mèo'],
      selfAttn: 'Self-attention',
      unmasked: 'không mặt nạ',
      masked: 'có mặt nạ',
      cross: 'Cross-attention',
      feedForward: 'Truyền thẳng',
      layers: 'lớp',
      encoderOut: 'Đầu ra encoder',
      next: 'Token kế: đen',
      append: ['nối vào', 'khi sinh'],
    },
  },
  en: {
    caption:
      'The score matrix of cross-attention is $L_y \\times L_x$ and has no causal mask; only the self-attention of the decoder is masked. The original Transformer has $N = 6$, the lesson\'s PyTorch cell $N = 2$.',
    label: 'Diagram of an encoder–decoder Transformer: the decoder looks back at the encoder through cross-attention',
    description:
      'On the left is the encoder: the source tokens the, black, cat go up through unmasked self-attention, then feed-forward, repeated for N layers, giving the encoder output. ' +
      'On the right is the decoder: the input tokens BOS, con, mèo go up through masked self-attention, then cross-attention, then feed-forward, repeated for N layers, giving the next token, đen. ' +
      'Cross-attention takes Q from the masked self-attention of the decoder, and K and V from the encoder output. ' +
      'While generating, the next token is appended to the end of the decoder input row.',
    labels: {
      encoder: 'Encoder',
      decoder: 'Decoder',
      source: ['the', 'black', 'cat'],
      target: ['<BOS>', 'con', 'mèo'],
      selfAttn: 'Self-attention',
      unmasked: 'no mask',
      masked: 'masked',
      cross: 'Cross-attention',
      feedForward: 'Feed-forward',
      layers: 'layers',
      encoderOut: 'Encoder output',
      next: 'Next token: đen',
      append: ['appended', 'while', 'generating'],
    },
  },
} satisfies FigureText<Key>;
