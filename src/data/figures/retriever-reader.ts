// Words of RetrieverReaderFigure (nlp/question-answering, "Minh họa"): open-domain QA as two steps in a row.
// The retriever narrows the whole store to a few passages; the reader scores spans only in those, so a right
// passage that is not retrieved cannot be answered. `store`, `retriever`, `reader`, `answer` are
// [main, small…]; `top1`–`top3` are the three retrieved passages, numbered. No numbers of a real run: the
// figure shows the shape, not a result. vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'question' | 'store' | 'retriever' | 'topK' | 'top1' | 'top2' | 'top3' | 'reader' | 'answer';

export const RETRIEVER_READER = {
  vi: {
    caption:
      'Retriever chọn $k$ đoạn; reader tìm span có $s_i + e_j$ lớn nhất trên từng đoạn rồi lấy span tốt nhất trong tất cả.',
    label: 'Sơ đồ hỏi đáp miền mở: retriever lấy top-k đoạn từ kho, reader chấm span trong các đoạn đó',
    description:
      'Câu hỏi đi vào retriever (BM25 hoặc bi-encoder như DPR); retriever tìm trong kho hàng triệu đoạn văn và chỉ lấy ra top-k đoạn, vẽ là ba đoạn đánh số 1, 2, 3. ' +
      'Mỗi đoạn đi vào reader, một mô hình BERT chấm điểm vị trí đầu và cuối của câu trả lời trên từng đoạn; câu hỏi cũng đi thẳng vào reader theo một mũi tên đứt, vì reader đọc cả câu hỏi lẫn đoạn. ' +
      'Reader trả ra câu trả lời là một đoạn trích kèm điểm. Mọi thứ reader biết đều đi qua chỗ hẹp top-k.',
    labels: {
      question: 'Câu hỏi',
      store: ['Kho đoạn văn', 'hàng triệu đoạn'],
      retriever: ['Retriever', 'BM25 hoặc', 'bi-encoder (DPR)'],
      topK: 'Top-k đoạn',
      top1: 'Đoạn 1',
      top2: 'Đoạn 2',
      top3: 'Đoạn 3',
      reader: ['Reader', 'BERT chấm điểm', 'đầu và cuối trên từng đoạn'],
      answer: ['Câu trả lời', 'đoạn trích + điểm'],
    },
  },
  en: {
    caption:
      'The retriever picks $k$ passages; the reader finds the span with the largest $s_i + e_j$ in each passage, then takes the best span of all.',
    label: 'Diagram of open-domain QA: the retriever takes the top-k passages from the store, the reader scores spans in them',
    description:
      'The question goes into the retriever (BM25, or a bi-encoder such as DPR); the retriever searches a store of millions of passages and takes out only the top k, drawn as three passages numbered 1, 2, 3. ' +
      'Each passage goes into the reader, a BERT model that scores where the answer starts and ends in each passage; the question also goes straight into the reader along a dashed arrow, since the reader reads both the question and the passage. ' +
      'The reader returns the answer as an excerpt with a score. Everything the reader knows passes through the top-k bottleneck.',
    labels: {
      question: 'Question',
      store: ['Passage store', 'millions of', 'passages'],
      retriever: ['Retriever', 'BM25 or', 'bi-encoder (DPR)'],
      topK: 'Top-k passages',
      top1: 'Passage 1',
      top2: 'Passage 2',
      top3: 'Passage 3',
      reader: ['Reader', 'BERT scores', 'start and end in each passage'],
      answer: ['Answer', 'excerpt + score'],
    },
  },
} satisfies FigureText<Key>;
