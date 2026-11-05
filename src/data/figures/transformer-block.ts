// Words of TransformerBlockFigure (dl/transformers, "Minh họa"): one Transformer block, Post-LN as in Vaswani et
// al. (2017), read bottom-up: tokens → embedding + positional encoding → [multi-head attention → add & norm →
// FFN → add & norm] × N → output, with a residual connection round each sub-layer. `tokens` holds one token
// per entry (a row of boxes), not lines of one label; `add` is the sign in the small add box. N is drawn with
// FigMath in the component. vi written from docs/architecture/dl-lessons.md, section 4; en is a draft for
// lesson-translator.
import type { FigureText } from './types';

type Key = 'tokens' | 'embedding' | 'position' | 'add' | 'attention' | 'addNorm' | 'ffn' | 'layers' | 'residual' | 'output';

export const TRANSFORMER_BLOCK = {
  vi: {
    caption:
      'Mỗi khối con tính $\\text{LayerNorm}(\\mathbf{x} + \\text{Sublayer}(\\mathbf{x}))$: kết nối tắt rồi chuẩn hóa lớp, kiểu Post-LN của bài gốc (Vaswani và cộng sự, 2017). Nhiều mô hình hiện nay dùng Pre-LN, chuẩn hóa trước khối con: $\\mathbf{x} + \\text{Sublayer}(\\text{LayerNorm}(\\mathbf{x}))$.',
    label: 'Sơ đồ một khối Transformer: attention nhiều đầu, FFN, kết nối tắt và chuẩn hóa lớp',
    description:
      'Đọc từ dưới lên. Các token qua embedding, được cộng với mã hóa vị trí, rồi vào khối lặp N lần. ' +
      'Trong khối: attention nhiều đầu, rồi cộng và chuẩn hóa; truyền thẳng (FFN), rồi cộng và chuẩn hóa. ' +
      'Mỗi khối con có một kết nối tắt chạy theo lề phải, mang đầu vào của khối con tới bước cộng và chuẩn hóa ngay sau nó. ' +
      'Ra khỏi N khối là đầu ra, mỗi token một vectơ.',
    labels: {
      tokens: ['con', 'mèo', 'ngủ'],
      embedding: 'Embedding',
      position: ['Mã hóa', 'vị trí'],
      add: '+',
      attention: 'Attention nhiều đầu',
      addNorm: 'Cộng và chuẩn hóa',
      ffn: 'Truyền thẳng (FFN)',
      layers: 'khối',
      residual: ['kết nối', 'tắt'],
      output: 'Đầu ra',
    },
  },
  en: {
    caption:
      'Each sub-layer computes $\\text{LayerNorm}(\\mathbf{x} + \\text{Sublayer}(\\mathbf{x}))$: a residual connection, then layer normalization, the Post-LN form of the original paper (Vaswani et al., 2017). Many models today use Pre-LN, normalizing before the sub-layer: $\\mathbf{x} + \\text{Sublayer}(\\text{LayerNorm}(\\mathbf{x}))$.',
    label: 'Diagram of one Transformer block: multi-head attention, FFN, residual connections and layer normalization',
    description:
      'Read bottom-up. The tokens go through the embedding, are added to the positional encoding, then enter the block repeated N times. ' +
      'Inside the block: multi-head attention, then add and norm; feed-forward (FFN), then add and norm. ' +
      'Each sub-layer has a residual connection along the right edge, carrying its input to the add and norm step right after it. ' +
      'Out of the N blocks comes the output, one vector per token.',
    labels: {
      tokens: ['the', 'cat', 'sleeps'],
      embedding: 'Embedding',
      position: ['Positional', 'encoding'],
      add: '+',
      attention: 'Multi-head attention',
      addNorm: 'Add & norm',
      ffn: 'Feed-forward (FFN)',
      layers: 'blocks',
      residual: ['residual', 'connection'],
      output: 'Output',
    },
  },
} satisfies FigureText<Key>;
