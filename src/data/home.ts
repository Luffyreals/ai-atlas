// Homepage copy in both languages. Content, not UI chrome: short reusable labels live in
// src/content/i18n/*.json, everything editorial lives here, next to the roadmap it describes.
// "{{count}}" is filled with the real number of lessons in src/data/roadmap.ts.
import type { Localized, PartId } from './roadmap';

export interface Slip {
  title: Localized;
  /** Plain lines; $...$ is rendered with KaTeX. */
  lines?: Localized<string[]>;
  /** Exactly what a program printed, shown as program output. */
  output?: string[];
  /** A remark under the output, set apart from it. */
  note?: Localized;
}

export interface Term {
  vi: string;
  en: string;
}

export const HOME = {
  hero: {
    title: { vi: 'Học AI theo một tấm bản đồ', en: 'Learn AI from a single map' },
    lead: {
      vi: 'Lộ trình {{count}} bài, từ Python đến mô hình ngôn ngữ lớn, xếp theo thứ tự nên học. Bài được viết dần bằng tiếng Việt và tiếng Anh, miễn phí, không cần tài khoản.',
      en: 'A {{count}}-lesson route from Python to large language models, in the order to learn them. Lessons are being written in Vietnamese and English, free, no account needed.',
    },
  },

  route: {
    heading: { vi: 'Bảy phần, một ngã ba', en: 'Seven parts, one fork' },
    intro: {
      vi: 'Đi lần lượt qua Python, Toán, Học máy và Học sâu. Tới đó đường rẽ ba: ngôn ngữ, hình ảnh, hoặc mô hình ngôn ngữ lớn.',
      en: 'Walk through Python, Math, Machine Learning and Deep Learning in order. There the road splits three ways: language, vision, or large language models.',
    },
    /** Why each part sits where it does on the road, one short line. */
    why: {
      python: { vi: 'Ngôn ngữ chung của mọi bài sau.', en: 'The language every later lesson speaks.' },
      math: { vi: 'Vectơ, đạo hàm và xác suất: đủ dùng, không hơn.', en: 'Vectors, derivatives and probability: enough, no more.' },
      ml: { vi: 'Mô hình đầu tiên, và cách biết nó sai ở đâu.', en: 'The first models, and how to tell where they go wrong.' },
      dl: { vi: 'Xếp nhiều lớp nơ-ron chồng lên nhau.', en: 'Stacking layers of neurons.' },
      nlp: { vi: 'Máy đọc chữ: từ tách từ đến BERT, GPT.', en: 'Machines that read: from tokenization to BERT and GPT.' },
      cv: { vi: 'Máy nhìn ảnh: từ CNN đến diffusion.', en: 'Machines that see: from CNNs to diffusion.' },
      llm: { vi: 'Dùng, xây và huấn luyện mô hình ngôn ngữ lớn.', en: 'Using, building and training large language models.' },
    } satisfies Record<PartId, Localized>,
  },

  map: {
    heading: { vi: 'Toàn bộ {{count}} bài', en: 'All {{count}} lessons' },
    intro: {
      vi: 'Mỗi bài biết những bài nào dẫn tới nó. Chọn một điểm đến để thấy đường đi.',
      en: 'Every lesson knows which lessons lead to it. Pick a destination to see the route.',
    },
  },

  lesson: {
    heading: { vi: 'Bên trong một bài học', en: 'Inside a lesson' },
    lead: {
      vi: 'Mỗi bài đi cùng một trình tự: trực giác trước, rồi lý thuyết, rồi code ví dụ.',
      en: 'Every lesson follows the same order: intuition first, then the theory, then example code.',
    },
    note: {
      vi: 'Từ Python tới Học máy, code chạy ngay trên trang. Đây là phác thảo bài Hồi quy tuyến tính, bài đầu tiên đã mở.',
      en: 'From Python to Machine Learning, the code runs right on the page. This is a sketch of Linear Regression, the first lesson to open.',
    },
    slips: [
      {
        title: { vi: 'Trực giác', en: 'Intuition' },
        lines: {
          vi: ['Nhà rộng hơn thường đắt hơn.', 'Kẻ một đường thẳng đi gần', 'mọi điểm (diện tích, giá).', 'Đường đó đoán giá cho', 'căn nhà chưa bán.'],
          en: ['Bigger houses tend to cost more.', 'Draw one straight line close', 'to every (size, price) point.', 'That line guesses the price', 'of a house not yet sold.'],
        },
      },
      {
        title: { vi: 'Lý thuyết', en: 'Theory' },
        lines: {
          vi: ['$\\hat{y}_i = w x_i + b$', '$\\mathcal{L} = \\frac{1}{m} \\sum_{i=1}^{m} (\\hat{y}_i - y_i)^2$', 'Tìm $w$ và $b$', 'để $\\mathcal{L}$ nhỏ nhất.'],
          en: ['$\\hat{y}_i = w x_i + b$', '$\\mathcal{L} = \\frac{1}{m} \\sum_{i=1}^{m} (\\hat{y}_i - y_i)^2$', 'Find $w$ and $b$', 'that make $\\mathcal{L}$ smallest.'],
        },
      },
      {
        title: { vi: 'Kết quả', en: 'Output' },
        output: ['w = 3.018', 'b = 1.653', 'L = 1.290'],
        note: {
          vi: 'Dữ liệu tạo từ w = 3, b = 2. Mô hình đoán sát dù có nhiễu.',
          en: 'The data came from w = 3, b = 2. Close, despite the noise.',
        },
      },
      {
        title: { vi: 'Kiểm tra nhanh', en: 'Quick check' },
        lines: {
          vi: ['Mọi giá nhà tăng gấp đôi.', '$w$ mới bằng bao nhiêu?', 'Đáp án: gấp đôi $w$ cũ.', 'Đường thẳng dốc gấp đôi.'],
          en: ['Every price doubles.', 'What is the new $w$?', 'Answer: twice the old $w$.', 'The line gets twice as steep.'],
        },
      },
      {
        title: { vi: 'Tóm tắt', en: 'Summary' },
        lines: {
          vi: ['Một đường thẳng gần mọi điểm.', '"Gần" đo bằng $\\mathcal{L}$.', 'Đọc thêm: Galton (1886),', 'bài báo đặt tên cho "regression".'],
          en: ['One line close to every point.', '"Close" is measured by $\\mathcal{L}$.', 'Further reading: Galton (1886),', 'the paper that named "regression".'],
        },
      },
    ] satisfies Slip[],
    codeTitle: { vi: 'Code', en: 'Code' },
    /** Real code, run with numpy 2.5.3 (seed 42); the Output slip shows its actual output. */
    code: {
      vi: [
        'import numpy as np',
        '',
        'rng = np.random.default_rng(42)',
        'm = 50',
        'x = rng.uniform(0, 10, m)',
        '# tham số thật: w = 3, b = 2, cộng nhiễu',
        'y = 3 * x + 2 + rng.normal(0, 1.5, m)',
        '',
        'w, b = np.polyfit(x, y, 1)',
        'loss = np.mean((w * x + b - y) ** 2)',
        'print(f"w = {w:.3f}")',
        'print(f"b = {b:.3f}")',
        'print(f"L = {loss:.3f}")',
      ].join('\n'),
      en: [
        'import numpy as np',
        '',
        'rng = np.random.default_rng(42)',
        'm = 50',
        'x = rng.uniform(0, 10, m)',
        '# true parameters: w = 3, b = 2, plus noise',
        'y = 3 * x + 2 + rng.normal(0, 1.5, m)',
        '',
        'w, b = np.polyfit(x, y, 1)',
        'loss = np.mean((w * x + b - y) ** 2)',
        'print(f"w = {w:.3f}")',
        'print(f"b = {b:.3f}")',
        'print(f"L = {loss:.3f}")',
      ].join('\n'),
    },
  },

  terms: {
    heading: { vi: 'Một ý, hai cái tên', en: 'One idea, two names' },
    intro: {
      vi: 'Lần đầu xuất hiện, mỗi thuật ngữ đi kèm tên tiếng Anh. Đọc tài liệu tiếng Anh sẽ bớt lạ.',
      en: 'In the Vietnamese lessons, each term carries its English name the first time it appears, so English material feels familiar.',
    },
    /** From docs/glossary.md. */
    rows: [
      { vi: 'hồi quy tuyến tính', en: 'linear regression' },
      { vi: 'hàm mất mát', en: 'loss function' },
      { vi: 'tốc độ học', en: 'learning rate' },
      { vi: 'trọng số', en: 'weight' },
      { vi: 'hệ số tự do', en: 'bias' },
      { vi: 'siêu tham số', en: 'hyperparameter' },
      { vi: 'tập huấn luyện', en: 'training set' },
      { vi: 'học có giám sát', en: 'supervised learning' },
      { vi: 'phân cụm', en: 'clustering' },
      { vi: 'mạng nơ-ron', en: 'neural network' },
      { vi: 'lan truyền ngược', en: 'backpropagation' },
      { vi: 'cơ chế chú ý', en: 'attention mechanism' },
      { vi: 'tách từ', en: 'tokenization' },
      { vi: 'mô hình ngôn ngữ lớn', en: 'large language model' },
    ] satisfies Term[],
  },

  letter: {
    heading: { vi: 'Vì sao có AI Atlas', en: 'Why AI Atlas exists' },
    /** **phrase** is marked; [label](lesson:<id>) links to the lesson's page in the page's language. */
    paragraphs: {
      vi: [
        'Chào bạn,',
        'AI Atlas bắt đầu từ một giáo án học AI. Mình sắp các buổi học lại thành một tấm bản đồ, để ai cũng thấy nên học gì trước, học gì sau, và vì sao.',
        'Mỗi bài viết bằng tiếng Việt trước, rồi mới dịch sang tiếng Anh. Code trong bài đều được chạy thử, nguồn tham khảo đều có thật.',
        'Trang này miễn phí và **không cần tài khoản**. Tiến độ học được lưu ngay trên trình duyệt của bạn, không gửi đi đâu cả.',
        'Bài đầu tiên đã mở: [Làm quen công cụ: Google Colab, Kaggle](lesson:python/colab-kaggle). Hẹn gặp bạn ở đó.',
      ],
      en: [
        'Hello,',
        'AI Atlas began as a course syllabus for learning AI. I rearranged its sessions into one map, so anyone can see what to learn first, what comes next, and why.',
        'Each lesson is written in Vietnamese first, then translated into English. Every code example is run, every source is real.',
        'The site is free and needs **no account**. Your progress is kept in your own browser and sent nowhere.',
        'The first lesson is now open: [Introduction to Machine Learning](lesson:ml/ml-overview). See you there.',
      ],
    },
    signName: { vi: 'Luffyreals', en: 'Luffyreals' },
    signRole: { vi: 'Người làm AI Atlas', en: 'Maker of AI Atlas' },
    stub: {
      vi: 'Nội dung theo giấy phép CC BY-NC-SA 4.0. Mã nguồn theo giấy phép MIT.',
      en: 'Content under CC BY-NC-SA 4.0. Code under the MIT license.',
    },
    stubAction: { vi: 'Đọc giấy phép', en: 'Read the license' },
  },

  footer: {
    signoff: { vi: 'Hẹn gặp bạn trên bản đồ', en: 'See you on the map' },
    message: {
      vi: 'Tấm bản đồ sáng dần lên mỗi khi một bài được mở. Điểm sáng đầu tiên: Hồi quy tuyến tính.',
      en: 'The map lights up as each lesson opens. The first to light up: Linear Regression.',
    },
    linkMap: { vi: 'Bản đồ {{count}} bài', en: 'The {{count}}-lesson map' },
    linkTerms: { vi: 'Một ý, hai cái tên', en: 'One idea, two names' },
    linkLicence: { vi: 'Giấy phép nội dung', en: 'Content license' },
    imprint: {
      vi: '© 2026 AI Atlas · Nội dung CC BY-NC-SA 4.0 · Mã nguồn MIT',
      en: '© 2026 AI Atlas · Content CC BY-NC-SA 4.0 · Code MIT',
    },
    creditsTitle: { vi: 'Nguồn ảnh', en: 'Picture credits' },
    /** One line per picture; the title stays in its original language. */
    creditLine: {
      vi: '{{creator}}, {{year}}. {{licence}}, qua {{via}}.',
      en: '{{creator}}, {{year}}. {{licence}}, via {{via}}.',
    },
  },
} as const;

export const CC_LICENCE_URL: Localized = {
  vi: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.vi',
  en: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
};
