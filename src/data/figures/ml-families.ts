// Words of MlFamiliesFigure (ml/ml-overview, section "Ba nhóm học máy"): the three families of machine
// learning, told apart by what the machine learns from. Each card is [family, learns from, example]; the
// component draws the first line as the main label and the others as small lines.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'root' | 'supervised' | 'unsupervised' | 'reinforcement';

export const ML_FAMILIES = {
  vi: {
    caption:
      'Ba nhóm học máy. Bài này và các bài ngay sau tập trung vào học có giám sát, nơi mỗi mẫu có đầu vào $\\mathbf{x}$ và nhãn $y$.',
    label: 'Sơ đồ ba nhóm học máy',
    description:
      'Học máy chia thành ba nhóm, khác nhau ở tín hiệu dùng để học. Có giám sát: học từ dữ liệu có nhãn, ví dụ đoán giá thuê, lọc thư rác; đây là nhóm được tô đậm. ' +
      'Không giám sát: chỉ có dữ liệu, không có nhãn, ví dụ chia nhóm khách hàng. ' +
      'Tăng cường: học từ phần thưởng, ví dụ chương trình tự chơi game.',
    labels: {
      root: 'Học máy',
      supervised: ['Có giám sát', 'Học từ dữ liệu có nhãn', 'Ví dụ: đoán giá thuê, lọc thư rác'],
      unsupervised: ['Không giám sát', 'Chỉ có dữ liệu, không có nhãn', 'Ví dụ: chia nhóm khách hàng'],
      reinforcement: ['Tăng cường', 'Học từ phần thưởng', 'Ví dụ: chương trình tự chơi game'],
    },
  },
  en: {
    caption:
      'The three families of machine learning. This lesson and the next ones focus on supervised learning, where each sample has an input $\\mathbf{x}$ and a label $y$.',
    label: 'Diagram of the three families of machine learning',
    description:
      'Machine learning splits into three families, told apart by what the machine learns from. Supervised: learns from labelled data, for example predicting rent or filtering spam; this family is highlighted. ' +
      'Unsupervised: only data, no labels, for example grouping customers. ' +
      'Reinforcement: learns from rewards, for example a program that teaches itself a game.',
    labels: {
      root: 'Machine learning',
      supervised: ['Supervised', 'Learns from labelled data', 'e.g. predicting rent, spam filters'],
      unsupervised: ['Unsupervised', 'Only data, no labels', 'e.g. grouping customers'],
      reinforcement: ['Reinforcement', 'Learns from rewards', 'e.g. a program playing a game'],
    },
  },
} satisfies FigureText<Key>;
