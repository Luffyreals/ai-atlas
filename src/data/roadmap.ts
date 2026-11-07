// Roadmap data: parts and lessons in learning order. Data and types only, no logic.
// Loaded by astro.config.ts, so use relative imports only and never import `astro:*`.

export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export type Localized<T = string> = Record<Locale, T>;

export const PART_IDS = ['python', 'math', 'ml', 'dl', 'nlp', 'cv', 'llm'] as const;
export type PartId = (typeof PART_IDS)[number];

/** "<part>/<kebab-case-slug>", e.g. "ml/linear-regression". Equals the MDX path under vi/ and en/. */
export type LessonId = `${PartId}/${string}`;

export type LocaleStatus = 'planned' | 'published';

export interface PartSection {
  id: string; // e.g. 'apps'
  title: Localized;
}

export interface Part {
  id: PartId;
  number: string; // display number from PLAN.md: '1'…'4', '5a', '5b', '5c'
  title: Localized;
  description: Localized; // one short line for RoadmapMap
  track: 'core' | 'branch';
  requires: PartId[]; // part-level hint only
  sections?: PartSection[]; // only 'llm' in MVP
}

export interface Lesson {
  id: LessonId;
  title: Localized; // MUST equal the frontmatter `title` of the MDX file in each locale
  shortTitle?: Localized; // optional shorter label for sidebar and RoadmapMap
  prerequisites: LessonId[]; // direct prerequisites only; each must appear earlier in LESSONS
  status: Localized<LocaleStatus>;
  section?: string; // required for parts with `sections`, must match a section id
  notebooks?: { colab?: string; kaggle?: string }; // reserved (out of scope for now), not rendered in MVP
}

export const PARTS: readonly Part[] = [
  {
    id: 'python',
    number: '1',
    title: { vi: 'Python', en: 'Python' },
    description: {
      vi: 'Cú pháp, cấu trúc dữ liệu, OOP, NumPy, Pandas, Matplotlib',
      en: 'Syntax, data structures, OOP, NumPy, Pandas, Matplotlib',
    },
    track: 'core',
    requires: [],
  },
  {
    id: 'math',
    number: '2',
    title: { vi: 'Toán cho AI', en: 'Math for AI' },
    description: {
      vi: 'Đại số tuyến tính, giải tích, xác suất thống kê',
      en: 'Linear algebra, calculus, probability and statistics',
    },
    track: 'core',
    requires: ['python'],
  },
  {
    id: 'ml',
    number: '3',
    title: { vi: 'Học máy', en: 'Machine Learning' },
    description: {
      vi: 'Hồi quy, phân loại, phân cụm, tối ưu, đánh giá mô hình',
      en: 'Regression, classification, clustering, optimization, evaluation',
    },
    track: 'core',
    requires: ['python', 'math'],
  },
  {
    id: 'dl',
    number: '4',
    title: { vi: 'Học sâu', en: 'Deep Learning' },
    description: {
      vi: 'Mạng nơ-ron, CNN, RNN, LSTM, Transformers',
      en: 'Neural networks, CNNs, RNNs, LSTMs, Transformers',
    },
    track: 'core',
    requires: ['ml'],
  },
  {
    id: 'nlp',
    number: '5a',
    title: { vi: 'Xử lý ngôn ngữ tự nhiên', en: 'Natural Language Processing' },
    description: {
      vi: 'Tokenizer, embeddings, BERT, GPT, các bài toán ngôn ngữ',
      en: 'Tokenizers, embeddings, BERT, GPT, language tasks',
    },
    track: 'branch',
    requires: ['dl'],
  },
  {
    id: 'cv',
    number: '5b',
    title: { vi: 'Thị giác máy tính', en: 'Computer Vision' },
    description: {
      vi: 'Phân loại ảnh, segmentation, CLIP, sinh ảnh, diffusion',
      en: 'Image classification, segmentation, CLIP, image generation, diffusion',
    },
    track: 'branch',
    requires: ['dl'],
  },
  {
    id: 'llm',
    number: '5c',
    title: { vi: 'Mô hình ngôn ngữ lớn', en: 'Large Language Models' },
    description: {
      vi: 'Prompt, RAG, Agents, fine-tune, RLHF/DPO, deploy',
      en: 'Prompting, RAG, agents, fine-tuning, RLHF/DPO, deployment',
    },
    track: 'branch',
    requires: ['dl'],
    sections: [
      { id: 'apps', title: { vi: 'Ứng dụng LLM', en: 'Building LLM Applications' } },
      { id: 'build', title: { vi: 'Xây dựng và huấn luyện LLM', en: 'Building and Training LLMs' } },
    ],
  },
];

export const LESSONS: readonly Lesson[] = [
  // Part 1: Python (7)
  {
    id: 'python/colab-kaggle',
    title: { vi: 'Làm quen công cụ: Google Colab, Kaggle', en: 'Getting Started: Google Colab and Kaggle' },
    prerequisites: [],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'python/basic-syntax',
    title: { vi: 'Cú pháp cơ bản: biến, nhập/xuất, điều kiện, vòng lặp, toán tử logic', en: 'Basic Syntax: Variables, Input/Output, Conditions, Loops, Logical Operators' },
    shortTitle: { vi: 'Cú pháp cơ bản', en: 'Basic Syntax' },
    prerequisites: [],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'python/data-structures',
    title: { vi: 'Cấu trúc dữ liệu: list, tuple, set, dict', en: 'Data Structures: list, tuple, set, dict' },
    prerequisites: ['python/basic-syntax'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'python/functions-strings-files',
    title: { vi: 'Hàm, chuỗi, đọc/ghi file', en: 'Functions, Strings, and File I/O' },
    prerequisites: ['python/data-structures'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'python/oop',
    title: { vi: 'Lập trình hướng đối tượng (OOP)', en: 'Object-Oriented Programming (OOP)' },
    prerequisites: ['python/functions-strings-files'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'python/numpy-pandas',
    title: { vi: 'Numpy và Pandas', en: 'NumPy and Pandas' },
    prerequisites: ['python/functions-strings-files'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'python/data-visualization',
    title: { vi: 'Trực quan hóa dữ liệu: Matplotlib và Seaborn', en: 'Data Visualization: Matplotlib and Seaborn' },
    prerequisites: ['python/numpy-pandas'],
    status: { vi: 'published', en: 'planned' },
  },

  // Part 2: Math for AI (3)
  {
    id: 'math/linear-algebra',
    title: { vi: 'Đại số tuyến tính', en: 'Linear Algebra' },
    prerequisites: ['python/numpy-pandas'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'math/calculus',
    title: { vi: 'Giải tích', en: 'Calculus' },
    prerequisites: ['math/linear-algebra'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'math/probability-statistics',
    title: { vi: 'Xác suất thống kê', en: 'Probability and Statistics' },
    prerequisites: ['math/calculus'],
    status: { vi: 'published', en: 'planned' },
  },

  // Part 3: Machine Learning (14)
  {
    id: 'ml/ml-overview',
    title: { vi: 'Tổng quan về Học máy', en: 'Introduction to Machine Learning' },
    prerequisites: ['python/numpy-pandas'],
    status: { vi: 'published', en: 'published' },
  },
  {
    id: 'ml/linear-regression',
    title: { vi: 'Hồi quy tuyến tính', en: 'Linear Regression' },
    prerequisites: ['ml/ml-overview', 'math/linear-algebra', 'math/calculus'],
    status: { vi: 'published', en: 'published' },
  },
  {
    id: 'ml/overfitting-underfitting',
    title: { vi: 'Overfitting và Underfitting', en: 'Overfitting and Underfitting' },
    prerequisites: ['ml/linear-regression'],
    status: { vi: 'published', en: 'published' },
  },
  {
    id: 'ml/regularization',
    title: { vi: 'Ridge, Lasso, Elastic Net', en: 'Ridge, Lasso, and Elastic Net' },
    prerequisites: ['ml/overfitting-underfitting'],
    status: { vi: 'published', en: 'published' },
  },
  {
    id: 'ml/gradient-descent',
    title: { vi: 'Gradient Descent', en: 'Gradient Descent' },
    prerequisites: ['ml/linear-regression', 'math/calculus'],
    status: { vi: 'published', en: 'published' },
  },
  {
    id: 'ml/optimizers',
    title: { vi: 'Các thuật toán tối ưu nâng cao: SGD, Momentum, RMSProp, Adam', en: 'Advanced Optimizers: SGD, Momentum, RMSProp, Adam' },
    shortTitle: { vi: 'Thuật toán tối ưu nâng cao', en: 'Advanced Optimizers' },
    prerequisites: ['ml/gradient-descent'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'ml/k-means',
    title: { vi: 'K-means', en: 'K-means' },
    prerequisites: ['ml/ml-overview', 'math/linear-algebra'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'ml/k-nearest-neighbors',
    title: { vi: 'K-Nearest Neighbors (KNN)', en: 'K-Nearest Neighbors (KNN)' },
    prerequisites: ['ml/ml-overview', 'math/linear-algebra'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'ml/logistic-regression',
    title: { vi: 'Hồi quy Logistic', en: 'Logistic Regression' },
    prerequisites: ['ml/linear-regression', 'ml/gradient-descent', 'math/probability-statistics'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'ml/classification-metrics',
    title: { vi: 'Đánh giá mô hình: Accuracy, Precision, Recall, F1', en: 'Model Evaluation: Accuracy, Precision, Recall, F1' },
    prerequisites: ['ml/logistic-regression'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'ml/softmax-regression',
    title: { vi: 'Hồi quy Softmax', en: 'Softmax Regression' },
    prerequisites: ['ml/logistic-regression'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'ml/decision-tree-random-forest',
    title: { vi: 'Decision Tree và Random Forest', en: 'Decision Trees and Random Forests' },
    prerequisites: ['ml/overfitting-underfitting', 'ml/classification-metrics'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'ml/data-preprocessing',
    title: { vi: 'Xử lý dữ liệu, tăng cường dữ liệu, dữ liệu mất cân bằng', en: 'Data Preprocessing, Augmentation, and Imbalanced Data' },
    shortTitle: { vi: 'Xử lý dữ liệu', en: 'Data Preprocessing' },
    prerequisites: ['ml/classification-metrics', 'python/numpy-pandas'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'ml/end-to-end-project',
    title: { vi: 'Dự án ML từ đầu đến cuối', en: 'An End-to-End ML Project' },
    prerequisites: ['ml/regularization', 'ml/decision-tree-random-forest', 'ml/data-preprocessing'],
    status: { vi: 'published', en: 'planned' },
  },

  // Part 4: Deep Learning (8)
  {
    id: 'dl/neural-networks',
    title: { vi: 'Mạng nơ-ron nhân tạo: perceptron, MLP, lan truyền xuôi, hàm kích hoạt', en: 'Neural Networks: Perceptron, MLP, Forward Propagation, Activation Functions' },
    shortTitle: { vi: 'Mạng nơ-ron nhân tạo', en: 'Neural Networks' },
    prerequisites: ['ml/gradient-descent', 'ml/logistic-regression', 'ml/softmax-regression'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'dl/training-neural-networks',
    title: { vi: 'Huấn luyện mạng nơ-ron: vanishing/exploding gradient, BatchNorm, Dropout', en: 'Training Neural Networks: Vanishing/Exploding Gradients, BatchNorm, Dropout' },
    shortTitle: { vi: 'Huấn luyện mạng nơ-ron', en: 'Training Neural Networks' },
    prerequisites: ['dl/neural-networks', 'ml/optimizers', 'ml/regularization'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'dl/cnn',
    title: { vi: 'Mạng tích chập (CNN)', en: 'Convolutional Neural Networks (CNN)' },
    prerequisites: ['dl/training-neural-networks'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'dl/modern-cnn-architectures',
    title: { vi: 'Các kiến trúc CNN hiện đại: LeNet, AlexNet, VGG, GoogLeNet, ResNet, Xception, SENet, YOLO', en: 'Modern CNN Architectures: LeNet, AlexNet, VGG, GoogLeNet, ResNet, Xception, SENet, YOLO' },
    shortTitle: { vi: 'Kiến trúc CNN hiện đại', en: 'Modern CNN Architectures' },
    prerequisites: ['dl/cnn'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'dl/rnn',
    title: { vi: 'Mạng nơ-ron hồi tiếp (RNN)', en: 'Recurrent Neural Networks (RNN)' },
    prerequisites: ['dl/training-neural-networks'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'dl/gru',
    title: { vi: 'GRU', en: 'GRU' },
    prerequisites: ['dl/rnn'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'dl/lstm-bilstm',
    title: { vi: 'LSTM và BiLSTM', en: 'LSTM and BiLSTM' },
    prerequisites: ['dl/gru'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'dl/transformers',
    title: { vi: 'Transformers', en: 'Transformers' },
    prerequisites: ['dl/lstm-bilstm'],
    status: { vi: 'published', en: 'planned' },
  },

  // Part 5a: NLP (13)
  {
    id: 'nlp/regex',
    title: { vi: 'Biểu thức chính quy (Regex)', en: 'Regular Expressions (Regex)' },
    prerequisites: ['python/functions-strings-files'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/tokenization',
    title: { vi: 'Tách từ (Tokenizer)', en: 'Tokenization' },
    prerequisites: ['nlp/regex'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/text-normalization',
    title: { vi: 'Chuẩn hóa văn bản', en: 'Text Normalization' },
    prerequisites: ['nlp/tokenization'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/vector-semantics-embeddings',
    title: { vi: 'Vector Semantics và Embeddings', en: 'Vector Semantics and Embeddings' },
    prerequisites: ['nlp/text-normalization', 'math/linear-algebra'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/word2vec-glove-fasttext',
    title: { vi: 'Word2Vec (CBOW, Skip-gram), GloVe, FastText', en: 'Word2Vec (CBOW, Skip-gram), GloVe, FastText' },
    prerequisites: ['nlp/vector-semantics-embeddings', 'dl/neural-networks'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/bert',
    title: { vi: 'BERT', en: 'BERT' },
    prerequisites: ['nlp/word2vec-glove-fasttext', 'dl/transformers'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/gpt-distributed-training',
    title: { vi: 'GPT và huấn luyện phân tán', en: 'GPT and Distributed Training' },
    prerequisites: ['dl/transformers'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/advanced-transformers',
    title: { vi: 'Transformers nâng cao', en: 'Advanced Transformers' },
    prerequisites: ['nlp/bert', 'nlp/gpt-distributed-training'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/information-retrieval',
    title: { vi: 'Truy xuất thông tin (Information Retrieval)', en: 'Information Retrieval' },
    prerequisites: ['nlp/vector-semantics-embeddings'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/sentiment-analysis',
    title: { vi: 'Phân tích cảm xúc', en: 'Sentiment Analysis' },
    prerequisites: ['nlp/bert', 'ml/classification-metrics'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/named-entity-recognition',
    title: { vi: 'Nhận dạng thực thể (NER)', en: 'Named Entity Recognition (NER)' },
    prerequisites: ['nlp/bert'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/text-generation-summarization',
    title: { vi: 'Sinh văn bản và tóm tắt văn bản', en: 'Text Generation and Summarization' },
    prerequisites: ['nlp/gpt-distributed-training'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'nlp/question-answering',
    title: { vi: 'Hỏi đáp (Question Answering)', en: 'Question Answering' },
    prerequisites: ['nlp/bert', 'nlp/information-retrieval'],
    status: { vi: 'published', en: 'planned' },
  },

  // Part 5b: Computer Vision (10)
  {
    id: 'cv/cnn-image-classification',
    title: { vi: 'Phân loại ảnh với CNN: AlexNet → VGG → ResNet → MobileNet → EfficientNet', en: 'Image Classification with CNNs: AlexNet → VGG → ResNet → MobileNet → EfficientNet' },
    shortTitle: { vi: 'Phân loại ảnh với CNN', en: 'Image Classification with CNNs' },
    prerequisites: ['dl/modern-cnn-architectures'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'cv/vision-transformer',
    title: { vi: 'Phân loại ảnh với Transformer: Attention, ViT', en: 'Image Classification with Transformers: Attention, ViT' },
    prerequisites: ['cv/cnn-image-classification', 'dl/transformers'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'cv/semantic-segmentation',
    title: { vi: 'Semantic Segmentation: FCN, UNet, FPN, DeepLab, HRNet', en: 'Semantic Segmentation: FCN, UNet, FPN, DeepLab, HRNet' },
    prerequisites: ['cv/cnn-image-classification'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'cv/instance-universal-segmentation',
    title: { vi: 'Instance và Universal Segmentation: Mask R-CNN, Mask2Former, SAM', en: 'Instance and Universal Segmentation: Mask R-CNN, Mask2Former, SAM' },
    shortTitle: { vi: 'Instance và Universal Segmentation', en: 'Instance and Universal Segmentation' },
    prerequisites: ['cv/semantic-segmentation'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'cv/clip-blip-glip',
    title: { vi: 'Ảnh + văn bản (1): CLIP, BLIP, GLIP', en: 'Vision and Language (1): CLIP, BLIP, GLIP' },
    prerequisites: ['cv/vision-transformer'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'cv/llava',
    title: { vi: 'Ảnh + văn bản (2): LLaVA và các biến thể', en: 'Vision and Language (2): LLaVA and Its Variants' },
    prerequisites: ['cv/clip-blip-glip'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'cv/vae-gan',
    title: { vi: 'Sinh ảnh (1): VAE, GAN, CycleGAN, Pix2Pix', en: 'Image Generation (1): VAE, GAN, CycleGAN, Pix2Pix' },
    prerequisites: ['dl/modern-cnn-architectures', 'math/probability-statistics'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'cv/diffusion-models',
    title: { vi: 'Sinh ảnh (2): Diffusion, Stable Diffusion, LoRA', en: 'Image Generation (2): Diffusion, Stable Diffusion, LoRA' },
    prerequisites: ['cv/vae-gan'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'cv/image-augmentation',
    title: { vi: 'Data augmentation trong CV', en: 'Data Augmentation in Computer Vision' },
    prerequisites: ['cv/cnn-image-classification', 'ml/data-preprocessing'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'cv/self-supervised-learning',
    title: { vi: 'Self-supervised learning với ảnh', en: 'Self-Supervised Learning for Images' },
    prerequisites: ['cv/vision-transformer', 'cv/image-augmentation'],
    status: { vi: 'published', en: 'planned' },
  },

  // Part 5c: LLM (23), section "apps" (1-11)
  {
    id: 'llm/text-api',
    section: 'apps',
    title: { vi: 'Sử dụng API văn bản', en: 'Using Text Generation APIs' },
    prerequisites: ['python/functions-strings-files'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/gradio-streamlit',
    section: 'apps',
    title: { vi: 'Làm giao diện với Gradio/Streamlit', en: 'Building UIs with Gradio and Streamlit' },
    prerequisites: ['llm/text-api'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/prompt-engineering',
    section: 'apps',
    title: { vi: 'Prompt Engineering', en: 'Prompt Engineering' },
    prerequisites: ['llm/text-api'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/docker-cloud',
    section: 'apps',
    title: { vi: 'Docker và Cloud', en: 'Docker and the Cloud' },
    prerequisites: ['llm/gradio-streamlit'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/deploy-custom-model',
    section: 'apps',
    title: { vi: 'Deploy mô hình riêng', en: 'Deploying Your Own Model' },
    prerequisites: ['llm/docker-cloud'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/rag-chatbot',
    section: 'apps',
    title: { vi: 'RAG và chatbot hiện đại', en: 'RAG and Modern Chatbots' },
    prerequisites: ['llm/prompt-engineering', 'nlp/information-retrieval'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/web-crawling-mongodb',
    section: 'apps',
    title: { vi: 'Crawl dữ liệu và MongoDB', en: 'Web Crawling and MongoDB' },
    prerequisites: ['python/functions-strings-files'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/langchain-llamaindex',
    section: 'apps',
    title: { vi: 'LangChain và LlamaIndex', en: 'LangChain and LlamaIndex' },
    prerequisites: ['llm/rag-chatbot'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/agents',
    section: 'apps',
    title: { vi: 'Agents', en: 'Agents' },
    prerequisites: ['llm/langchain-llamaindex'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/graph-rag',
    section: 'apps',
    title: { vi: 'Graph RAG', en: 'Graph RAG' },
    prerequisites: ['llm/rag-chatbot'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/image-video-api',
    section: 'apps',
    title: { vi: 'API cho hình ảnh và video', en: 'Image and Video APIs' },
    prerequisites: ['llm/text-api'],
    status: { vi: 'published', en: 'planned' },
  },

  // Part 5c: LLM, section "build" (12-23)
  {
    id: 'llm/build-first-llm',
    section: 'build',
    title: { vi: 'Xây dựng LLM đầu tiên', en: 'Building Your First LLM' },
    prerequisites: ['llm/text-api', 'dl/transformers', 'nlp/tokenization'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/gpt-family-finetuning',
    section: 'build',
    title: { vi: 'Họ GPT và fine-tune đa nhiệm', en: 'The GPT Family and Multi-Task Fine-Tuning' },
    prerequisites: ['llm/build-first-llm'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/pretraining-data',
    section: 'build',
    title: { vi: 'Chuẩn bị dữ liệu pre-train', en: 'Preparing Pre-Training Data' },
    prerequisites: ['llm/build-first-llm'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/rlhf',
    section: 'build',
    title: { vi: 'RLHF', en: 'RLHF' },
    prerequisites: ['llm/gpt-family-finetuning'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/dpo',
    section: 'build',
    title: { vi: 'DPO', en: 'DPO' },
    prerequisites: ['llm/rlhf'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/evaluation-peft',
    section: 'build',
    title: { vi: 'Đánh giá mô hình và PEFT: LoRA, quantization, distillation, pruning', en: 'Model Evaluation and PEFT: LoRA, Quantization, Distillation, Pruning' },
    shortTitle: { vi: 'Đánh giá mô hình và PEFT', en: 'Model Evaluation and PEFT' },
    prerequisites: ['llm/gpt-family-finetuning'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/llama-family',
    section: 'build',
    title: { vi: 'Họ LLaMA: RoPE, huấn luyện song song', en: 'The LLaMA Family: RoPE and Parallel Training' },
    prerequisites: ['llm/build-first-llm'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/seq2seq',
    section: 'build',
    title: { vi: 'Mô hình chuỗi sang chuỗi (Seq2Seq)', en: 'Sequence-to-Sequence Models (Seq2Seq)' },
    prerequisites: ['dl/lstm-bilstm', 'dl/transformers'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/deepseek-family',
    section: 'build',
    title: { vi: 'Họ DeepSeek', en: 'The DeepSeek Family' },
    prerequisites: ['llm/llama-family', 'llm/rlhf'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/debugging-language-models',
    section: 'build',
    title: { vi: 'Debug mô hình ngôn ngữ', en: 'Debugging Language Models' },
    prerequisites: ['llm/build-first-llm'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/multimodal',
    section: 'build',
    title: { vi: 'Multimodal', en: 'Multimodal LLMs' },
    prerequisites: ['llm/llama-family', 'cv/llava'],
    status: { vi: 'published', en: 'planned' },
  },
  {
    id: 'llm/llm-deployment',
    section: 'build',
    title: { vi: 'Deploy LLM: nhiều GPU, phân tán', en: 'Deploying LLMs: Multi-GPU and Distributed Serving' },
    prerequisites: ['llm/deploy-custom-model', 'llm/evaluation-peft'],
    status: { vi: 'published', en: 'planned' },
  },
];
