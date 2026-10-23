// Words of MlWorkflowFigure (ml/ml-overview, section "Minh họa"): the supervised workflow on the apartment
// table, with the test set split off first and used only to evaluate. Box labels are [main, small...], except
// `use`, whose two lines are one phrase and both main. `note` is free text beside the test arrow.
// The 10 / 7 / 3 apartments and 70% / 30% match src/code/ml/ml-overview/train-test-split.vi.py (test_size=0.3).
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key = 'data' | 'split' | 'train' | 'test' | 'fit' | 'model' | 'evaluate' | 'use' | 'note';

export const ML_WORKFLOW = {
  vi: {
    caption:
      'Quy trình học có giám sát trên bảng căn hộ. Tập kiểm tra được giữ riêng từ đầu, nên MSE trên đó ước lượng được sai số của $\\hat{y} = f(\\mathbf{x})$ trên căn hộ chưa thấy. ' +
      'Với chỉ 3 căn, ước lượng này còn dao động theo cách chia. Số 7 và 3 khớp ô code thứ hai (`test_size=0.3`).',
    label: 'Sơ đồ quy trình học có giám sát, có tách tập huấn luyện và tập kiểm tra',
    description:
      'Dữ liệu 10 căn hộ được tách ngẫu nhiên thành 70% và 30%. Tập huấn luyện, 7 căn, đi vào bước huấn luyện (fit), cho ra mô hình, rồi mô hình đi tới bước đánh giá. ' +
      'Tập kiểm tra, 3 căn, đi thẳng tới bước đánh giá và không đưa vào huấn luyện. ' +
      'Bước đánh giá dùng predict và tính MSE trên tập kiểm tra; sau đó mô hình được dùng cho căn hộ mới.',
    labels: {
      data: ['Dữ liệu', '10 căn hộ'],
      split: ['Tách ngẫu nhiên', '70% và 30%'],
      train: ['Tập huấn luyện', '7 căn'],
      test: ['Tập kiểm tra', '3 căn'],
      fit: ['Huấn luyện', 'fit'],
      model: 'Mô hình',
      evaluate: ['Đánh giá', 'predict, tính MSE'],
      use: ['Dùng cho', 'căn hộ mới'],
      note: ['Không đưa vào', 'huấn luyện'],
    },
  },
  en: {
    caption:
      'The supervised workflow on the apartment table. The test set is kept apart from the start, so the MSE on it estimates the error of $\\hat{y} = f(\\mathbf{x})$ on apartments not seen before. ' +
      'With only 3 apartments, this estimate still moves with the split. The 7 and 3 match the second code cell (`test_size=0.3`).',
    label: 'Diagram of the supervised learning workflow, with a training set and a test set',
    description:
      'The data, 10 apartments, is split at random into 70% and 30%. The training set, 7 apartments, goes into training (fit), which gives a model, and the model goes on to evaluation. ' +
      'The test set, 3 apartments, goes straight to evaluation and is never used in training. ' +
      'Evaluation runs predict and computes the MSE on the test set; then the model is used on new apartments.',
    labels: {
      data: ['Data', '10 apartments'],
      split: ['Random split', '70% and 30%'],
      train: ['Training set', '7 apartments'],
      test: ['Test set', '3 apartments'],
      fit: ['Training', 'fit'],
      model: 'Model',
      evaluate: ['Evaluation', 'predict, MSE'],
      use: ['Use on new', 'apartments'],
      note: ['Never used', 'in training'],
    },
  },
} satisfies FigureText<Key>;
