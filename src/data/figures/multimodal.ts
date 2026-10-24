// Words of MultimodalFigure (llm/multimodal, "Minh họa"): LLaVA-style concatenation. The image goes through
// the frozen image encoder and the learned projector into image tokens, which sit in one sequence with the
// text tokens of the question. Numbers match the lesson's PyTorch cell (src/code/llm/multimodal/projector.vi.py):
// 224 × 224 image, 14 × 14 patches, N = 256 image tokens, L_text = 10 text tokens, L = 266. Cell numbers and
// "…" are drawn by the component. `words` are the first text tokens of the question, one per line (3 at
// most); `gridNote`, `encoder`, `projector`, `question` are [main, small...] or several lines.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 'image'
  | 'gridNote'
  | 'encoder'
  | 'features'
  | 'projector'
  | 'imageTokens'
  | 'question'
  | 'embedding'
  | 'textTokens'
  | 'words'
  | 'imageCount'
  | 'textCount'
  | 'llm'
  | 'answer';

export const MULTIMODAL = {
  vi: {
    caption:
      'Ảnh $224 \\times 224$, patch $14 \\times 14$ cho $N = 256$ token ảnh; cùng 10 token chữ, LLM đọc một chuỗi $L = 266$ vectơ $D$ chiều, khớp ô PyTorch. Cross-attention của Llama 3.2 không có trong hình, xem mục Lý thuyết và bảng dưới.',
    label: 'Sơ đồ cách nối chuỗi của LLaVA: token ảnh và token chữ nằm chung một chuỗi cho LLM',
    description:
      'Ảnh 224 × 224 được chia thành lưới ô, đánh số theo thứ tự đọc từ trái sang phải, trên xuống dưới; hình vẽ lưới 4 × 4 cho dễ nhìn, ảnh thật có 16 × 16 ô. ' +
      'Ảnh đi qua bộ mã hóa ảnh, đóng băng, thành một hàng đặc trưng ảnh, mỗi ô một vectơ, rồi qua projector, phần được học, thành token ảnh rộng bằng token chữ. ' +
      'Bên cạnh, câu hỏi "Ảnh có gì?" đi qua bảng embedding thành token chữ. ' +
      'Hai phần nối thành một chuỗi duy nhất: 256 token ảnh đứng trước 10 token chữ, tổng cộng L bằng 266 vectơ; chuỗi đi vào LLM, LLM sinh câu trả lời.',
    labels: {
      image: 'Ảnh 224 × 224',
      gridNote: ['Lưới minh họa 4 × 4,', 'ảnh thật có 16 × 16 ô'],
      encoder: ['Bộ mã hóa ảnh', 'đóng băng'],
      features: 'Đặc trưng ảnh',
      projector: ['Projector', 'học'],
      imageTokens: 'Token ảnh',
      question: ['Câu hỏi:', 'Ảnh có gì?'],
      embedding: ['Bảng', 'embedding'],
      textTokens: 'Token chữ',
      words: ['Ảnh', 'có', 'gì'],
      imageCount: '256 token ảnh',
      textCount: '10 token chữ',
      llm: 'LLM',
      answer: 'Câu trả lời',
    },
  },
  en: {
    caption:
      'A $224 \\times 224$ image with $14 \\times 14$ patches gives $N = 256$ image tokens; with 10 text tokens, the LLM reads one sequence of $L = 266$ vectors of $D$ dimensions, as in the PyTorch cell. The cross-attention of Llama 3.2 is not in the figure: see the Theory section and the table below.',
    label: 'Diagram of LLaVA-style concatenation: image tokens and text tokens share one sequence for the LLM',
    description:
      'A 224 × 224 image is cut into a grid of cells, numbered in reading order, left to right and top to bottom; the figure draws a 4 × 4 grid to keep it readable, the real image has 16 × 16 cells. ' +
      'The image goes through the image encoder, frozen, into a row of image features, one vector per cell, then through the projector, the part that learns, into image tokens as wide as text tokens. ' +
      'Beside it, the question "What is in it?" goes through the embedding table into text tokens. ' +
      'The two parts join into one sequence: 256 image tokens before 10 text tokens, L equal to 266 vectors in all; the sequence goes into the LLM, which writes the answer.',
    labels: {
      image: 'Image 224 × 224',
      gridNote: ['Grid drawn 4 × 4;', 'the real one is 16 × 16'],
      encoder: ['Image encoder', 'frozen'],
      features: 'Image features',
      projector: ['Projector', 'learns'],
      imageTokens: 'Image tokens',
      question: ['Question:', 'What is in it?'],
      embedding: ['Embedding', 'table'],
      textTokens: 'Text tokens',
      words: ['What', 'is', 'in'],
      imageCount: '256 image tokens',
      textCount: '10 text tokens',
      llm: 'LLM',
      answer: 'Answer',
    },
  },
} satisfies FigureText<Key>;
