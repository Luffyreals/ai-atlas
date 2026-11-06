// Words of AttentionMaskFigure (nlp/bert, "Minh họa"): the attention masks of BERT's encoder (every token sees
// every token) and GPT's decoder (a token sees itself and the tokens before it) on one 5-token sentence. Rows
// are the token being computed, columns the token it looks at. t0–t4 are the tokens in order; the compared cell
// is row t1 ("chim"), column t2 ("bay"), ATTENTION_MASK_COMPARED. The tokens stay Vietnamese in en (the
// lesson's example sentence), glossed in the description. `rows`, `columns`: the axis notes, [name, meaning].
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 't0'
  | 't1'
  | 't2'
  | 't3'
  | 't4'
  | 'bert'
  | 'gpt'
  | 'rows'
  | 'columns'
  | 'allSeen'
  | 'seen'
  | 'masked'
  | 'compared';

/** The compared cell, [row, column], 0-based: "chim" looks at "bay". */
export const ATTENTION_MASK_COMPARED = [1, 2] as const;

export const ATTENTION_MASK = {
  vi: {
    caption:
      'Mặt nạ cộng vào $\\mathbf{Q}\\mathbf{K}^\\top/\\sqrt{d}$ trước softmax: ô bị che nhận $-\\infty$ nên có trọng số 0; BERT không che ô nào (25 trên 25 ô được nhìn), GPT che 10 ô phía trên đường chéo.',
    label: 'Hai lưới mặt nạ attention 5×5 của BERT và GPT trên câu "Con chim bay qua sông"',
    description:
      'Hai lưới 5×5 trên câu "Con chim bay qua sông"; mỗi hàng là token đang tính, mỗi cột là token được nhìn. ' +
      'Lưới trên, BERT (encoder): cả 25 ô đều được nhìn, mỗi token nhìn cả hai phía. ' +
      'Lưới dưới, GPT (decoder): 15 ô từ đường chéo trở xuống được nhìn, 10 ô phía trên đường chéo bị che và có dấu gạch chéo; mỗi token chỉ nhìn chính nó và các token đứng trước. ' +
      'Ô hàng "chim", cột "bay" có viền dày ở cả hai lưới: BERT được nhìn, GPT bị che.',
    labels: {
      t0: 'Con',
      t1: 'chim',
      t2: 'bay',
      t3: 'qua',
      t4: 'sông',
      bert: 'BERT (encoder): nhìn cả hai phía',
      gpt: 'GPT (decoder): chỉ nhìn phía trước',
      rows: ['Hàng:', 'token đang tính'],
      columns: ['Cột:', 'token được nhìn'],
      allSeen: ['25 / 25 ô', 'được nhìn'],
      seen: 'được nhìn',
      masked: 'bị che',
      compared: ['ô đang so:', 'chim', 'nhìn bay'],
    },
  },
  en: {
    caption:
      'The mask is added to $\\mathbf{Q}\\mathbf{K}^\\top/\\sqrt{d}$ before the softmax: a masked cell gets $-\\infty$, so its weight is 0; BERT masks no cell (all 25 of 25 are visible), GPT masks the 10 cells above the diagonal.',
    label: 'Two 5×5 attention masks, BERT and GPT, on the sentence "Con chim bay qua sông"',
    description:
      'Two 5×5 grids on the Vietnamese sentence "Con chim bay qua sông" (the bird flies over the river); each row is the token being computed, each column the token it looks at. ' +
      'Top grid, BERT (encoder): all 25 cells are visible, every token looks both ways. ' +
      'Bottom grid, GPT (decoder): the 15 cells on and below the diagonal are visible, the 10 above it are masked and crossed out; each token sees only itself and the tokens before it. ' +
      'The cell in row "chim" (bird), column "bay" (flies) has a thick border in both grids: visible in BERT, masked in GPT.',
    labels: {
      t0: 'Con',
      t1: 'chim',
      t2: 'bay',
      t3: 'qua',
      t4: 'sông',
      bert: 'BERT (encoder): looks both ways',
      gpt: 'GPT (decoder): looks only back',
      rows: ['Rows:', 'token computed'],
      columns: ['Columns:', 'token looked at'],
      allSeen: ['25 / 25 cells', 'visible'],
      seen: 'visible',
      masked: 'masked',
      compared: ['compared:', 'chim looks', 'at bay'],
    },
  },
} satisfies FigureText<Key>;
