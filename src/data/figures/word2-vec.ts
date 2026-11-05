// Words of Word2VecFigure (nlp/word2vec-glove-fasttext, "Minh họa"); id "word2-vec", since the kebab-case
// rule of figure-conventions.test.ts splits "2V". The two Word2Vec architectures on one sentence: CBOW averages
// the four context vectors and guesses the centre word once; skip-gram guesses each context word from the
// centre word, four separate times. The sentence is the lesson's example, t0–t6 in order; the window is ±2
// around t4, as in the code cell (skipgram-ns.vi.py, win = 2). The tokens stay Vietnamese in en (the lesson's
// data), glossed in the description. vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 't0'
  | 't1'
  | 't2'
  | 't3'
  | 't4'
  | 't5'
  | 't6'
  | 'window'
  | 'outside'
  | 'cbow'
  | 'cbowNote'
  | 'average'
  | 'guess'
  | 'skipgram'
  | 'skipgramNote'
  | 'guesses';

/** Index of the centre word in the sentence, and the window on each side (the code cell's win = 2). */
export const WORD2VEC_CENTRE = 4;
export const WORD2VEC_WINDOW = 2;

export const WORD2VEC = {
  vi: {
    caption:
      'CBOW chấm một lần $\\sigma(\\mathbf{c} \\cdot \\mathbf{h})$ với $\\mathbf{h}$ là trung bình bốn vectơ ngữ cảnh, còn skip-gram chấm bốn lần $\\sigma(\\mathbf{c} \\cdot \\mathbf{w})$, mỗi lần kèm $k$ mẫu âm. Cửa sổ ±2 khớp ô code của bài.',
    label: 'Sơ đồ so sánh CBOW và skip-gram trên câu "tôi ăn một bát phở nóng hổi"',
    description:
      'Trên cùng là câu "tôi ăn một bát phở nóng hổi"; từ giữa là "phở", cửa sổ ±2 gồm "một", "bát", "nóng", "hổi"; "tôi" và "ăn" nằm ngoài cửa sổ. ' +
      'CBOW: bốn từ ngữ cảnh cùng đi vào một khối "trung bình 4 vectơ", rồi từ khối đó đoán một lần ra "phở". ' +
      'Skip-gram: đi ngược chiều, từ "phở" tỏa ra bốn mũi tên riêng, mỗi mũi tên là một lần đoán một từ ngữ cảnh.',
    labels: {
      t0: 'tôi',
      t1: 'ăn',
      t2: 'một',
      t3: 'bát',
      t4: 'phở',
      t5: 'nóng',
      t6: 'hổi',
      window: 'cửa sổ ±2',
      outside: 'ngoài cửa sổ',
      cbow: 'CBOW',
      cbowNote: 'ngữ cảnh đoán từ giữa',
      average: 'trung bình 4 vectơ',
      guess: '1 lần đoán',
      skipgram: 'Skip-gram',
      skipgramNote: 'từ giữa đoán từng ngữ cảnh',
      guesses: '4 lần đoán riêng',
    },
  },
  en: {
    caption:
      'CBOW scores once, $\\sigma(\\mathbf{c} \\cdot \\mathbf{h})$ with $\\mathbf{h}$ the average of the four context vectors, while skip-gram scores four times, $\\sigma(\\mathbf{c} \\cdot \\mathbf{w})$, each with $k$ negative samples. The ±2 window matches the lesson\'s code cell.',
    label: 'Diagram comparing CBOW and skip-gram on the sentence "tôi ăn một bát phở nóng hổi"',
    description:
      'At the top is the Vietnamese sentence "tôi ăn một bát phở nóng hổi" (I eat a bowl of steaming hot pho); the centre word is "phở", the ±2 window holds "một", "bát", "nóng", "hổi"; "tôi" and "ăn" are outside the window. ' +
      'CBOW: the four context words all go into one "average of 4 vectors" box, which guesses "phở" once. ' +
      'Skip-gram: the other way round, four separate arrows fan out from "phở", each one guess of one context word.',
    labels: {
      t0: 'tôi',
      t1: 'ăn',
      t2: 'một',
      t3: 'bát',
      t4: 'phở',
      t5: 'nóng',
      t6: 'hổi',
      window: '±2 window',
      outside: 'outside',
      cbow: 'CBOW',
      cbowNote: 'context guesses the centre',
      average: 'average of 4 vectors',
      guess: '1 guess',
      skipgram: 'Skip-gram',
      skipgramNote: 'centre guesses each context',
      guesses: '4 separate guesses',
    },
  },
} satisfies FigureText<Key>;
