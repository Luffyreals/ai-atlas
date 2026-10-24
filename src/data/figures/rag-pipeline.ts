// Words of RagPipelineFigure (llm/rag-chatbot, "Hai giai đoạn của RAG"; reused as is in llm/langchain-llamaindex
// and llm/graph-rag): the indexing column runs once, the query column runs for every question, and both embed
// with the same model. Box labels are [main, small...]; `answer` and `same` are all main / free text.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 'indexTitle'
  | 'indexNote'
  | 'queryTitle'
  | 'queryNote'
  | 'docs'
  | 'chunk'
  | 'embed'
  | 'store'
  | 'question'
  | 'retrieve'
  | 'prompt'
  | 'chat'
  | 'answer'
  | 'same';

export const RAG_PIPELINE = {
  vi: {
    caption:
      'Câu hỏi và chunk được embed bằng cùng một mô hình; chunk thứ $i$ được chấm điểm $s^{(i)} = \\cos(\\mathbf{q}, \\mathbf{c}^{(i)})$, rồi giữ $k$ chunk điểm cao nhất.',
    label: 'Sơ đồ pipeline RAG: lập chỉ mục một lần, truy vấn với mỗi câu hỏi',
    description:
      'Cột lập chỉ mục, làm một lần: tài liệu được chia chunk, embedding, rồi cất vào kho vectơ. ' +
      'Cột truy vấn, làm với mỗi câu hỏi: câu hỏi được embedding bằng cùng một mô hình, rồi tìm top-k chunk theo cosine trong kho vectơ. ' +
      'Các chunk đó được ghép vào prompt cùng chỉ dẫn và câu hỏi, đánh số [1], [2]; mô hình chat đọc prompt và trả lời kèm nguồn.',
    labels: {
      indexTitle: 'Lập chỉ mục',
      indexNote: 'làm một lần',
      queryTitle: 'Truy vấn',
      queryNote: 'mỗi câu hỏi',
      docs: 'Tài liệu',
      chunk: 'Chia chunk',
      embed: 'Embedding',
      store: 'Kho vectơ',
      question: 'Câu hỏi',
      retrieve: ['Tìm top-k', '(cosine)'],
      prompt: ['Ghép prompt', 'chỉ dẫn, chunk [1] [2],', 'câu hỏi'],
      chat: 'Mô hình chat',
      answer: ['Câu trả lời', '+ nguồn'],
      same: ['cùng một', 'mô hình'],
    },
  },
  en: {
    caption:
      'The question and the chunks are embedded with the same model; chunk $i$ gets the score $s^{(i)} = \\cos(\\mathbf{q}, \\mathbf{c}^{(i)})$, and the $k$ chunks with the highest scores are kept.',
    label: 'Diagram of a RAG pipeline: index once, query for every question',
    description:
      'The indexing column, done once: the documents are split into chunks, embedded, and stored in a vector store. ' +
      'The query column, done for every question: the question is embedded with the same model, then the top-k chunks by cosine are found in the vector store. ' +
      'Those chunks go into the prompt with the instructions and the question, numbered [1], [2]; the chat model reads the prompt and answers with sources.',
    labels: {
      indexTitle: 'Indexing',
      indexNote: 'done once',
      queryTitle: 'Query',
      queryNote: 'every question',
      docs: 'Documents',
      chunk: 'Chunking',
      embed: 'Embedding',
      store: 'Vector store',
      question: 'Question',
      retrieve: ['Top-k search', '(cosine)'],
      prompt: ['Build prompt', 'instructions, chunks', '[1] [2], question'],
      chat: 'Chat model',
      answer: ['Answer', '+ sources'],
      same: ['same', 'model'],
    },
  },
} satisfies FigureText<Key>;
