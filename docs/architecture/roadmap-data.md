# Thiết kế dữ liệu lộ trình: `src/data/roadmap.ts`

> Phạm vi: schema, hàm tiện ích và test cho dữ liệu lộ trình (mốc M0), cùng danh sách slug cho toàn bộ 78 bài.
> Liên quan: [scaffold.md](scaffold.md) (sidebar sinh từ dữ liệu này), [components.md](components.md) (`RoadmapMap`, `Prerequisites` đọc dữ liệu này).

## 1. Mục tiêu và phạm vi

`roadmap.ts` là **nguồn sự thật duy nhất** cho:

- danh sách phần và bài, theo đúng thứ tự học;
- tiêu đề vi/en của phần và bài (dùng cho sidebar, `RoadmapMap`, `Prerequisites`);
- quan hệ "cần biết trước";
- trạng thái từng ngôn ngữ: bài đã có trang chưa, đã dịch chưa.

Mục tiêu của MVP: thêm bài mới chỉ cần **thêm một file MDX và đổi một dòng trạng thái** trong `roadmap.ts`.

**Không** chứa: nội dung bài, mô tả SEO (nằm trong frontmatter), chuỗi giao diện (nằm trong `src/content/i18n/`), tiến độ học của người đọc (localStorage, xem [components.md](components.md)).

## 2. Phương án đã chọn

### 2.1. Thứ tự: theo vị trí trong mảng, không dùng số `order`

| Phương án | Ưu | Nhược |
|---|---|---|
| **A. Thứ tự = vị trí trong mảng `LESSONS` (chọn)** | Chèn bài mới chỉ cần chèn một dòng; không phải đánh số lại | Không có số thứ tự hiển thị sẵn (tính được khi cần) |
| B. Trường `order: number` | Rõ ràng | Chèn giữa phải đánh lại số; dễ trùng số |

Ràng buộc kèm theo: bài của cùng một phần phải **liền nhau** trong mảng, và các phần xếp theo thứ tự trong `PARTS`. Test kiểm tra điều này.

### 2.2. Trạng thái: riêng cho từng ngôn ngữ, chỉ 2 giá trị

```ts
status: { vi: 'planned' | 'published'; en: 'planned' | 'published' }
```

| Trạng thái | Nghĩa | File |
|---|---|---|
| `vi: 'planned'` | Bài chưa viết. Không có trang. Lộ trình hiện "Sắp có" | **Không** được có file ở `vi/` hoặc `en/` |
| `vi: 'published', en: 'planned'` | Đã có bản Việt. `/en/...` dùng fallback của Starlight (nội dung Việt + thông báo chưa dịch) | Có file `vi/`, **không** có file `en/` |
| `vi: 'published', en: 'published'` | Đủ hai ngôn ngữ | Có cả hai file |
| `vi: 'planned', en: 'published'` | **Không hợp lệ** (viết tiếng Việt trước) | `validateRoadmap` báo lỗi |

Không thêm trạng thái `draft`. Bài đang viết dở chưa đổi trạng thái thì chưa có file trên `main`. Nếu cần ẩn một trang đã có file, dùng frontmatter `draft: true` có sẵn của Starlight (trang không vào bản build production).

"Bài đã xuất bản đủ" theo tiêu chí MVP (`docs/mvp.md` mục 4) nghĩa là `vi` và `en` đều `published`.

### 2.3. Quan hệ "cần biết trước": danh sách tối thiểu, phải đứng trước trong lộ trình

- `prerequisites` chỉ ghi bài **trực tiếp** cần biết, không ghi lại bài đã bao hàm qua bắc cầu.
- Được trỏ sang phần khác, kể cả nhánh khác (ví dụ `llm/rag-chatbot` cần `nlp/information-retrieval`).
- **Quy tắc thứ tự:** mọi prerequisite phải đứng **trước** bài đó trong mảng `LESSONS`. Quy tắc này vừa đảm bảo người đọc theo lộ trình luôn gặp bài nền trước, vừa tự loại bỏ vòng lặp. Vẫn có hàm `findCycle()` riêng để báo lỗi dễ hiểu và để test.

### 2.4. Nhánh sau phần Học sâu

Cấp **phần** có `track: 'core' | 'branch'` và `requires: PartId[]`:

- `core`: `python` → `math` → `ml` → `dl`, học tuần tự.
- `branch`: `nlp`, `cv`, `llm`, đều `requires: ['dl']`. Người học chọn nhánh nào cũng được.
- Phần `llm` có 2 mục con (`sections`): `apps` (bài 1–11) và `build` (bài 12–23).

`requires` ở cấp phần chỉ để hiển thị gợi ý trên `RoadmapMap` ("Sau phần Học sâu, chọn một nhánh"). Điều kiện cụ thể vẫn nằm ở `prerequisites` từng bài. Vì vậy vài bài nhánh LLM phần ứng dụng chỉ cần Python (ví dụ `llm/text-api`), đúng thực tế.

### 2.5. Tách dữ liệu và logic

| File | Chứa | Được import bởi |
|---|---|---|
| `src/data/roadmap.ts` | Kiểu + hằng `PARTS`, `LESSONS`. Không logic | mọi nơi |
| `src/lib/roadmap.ts` | Hàm truy vấn, `validateRoadmap()`, `findCycle()` | component, test |
| `src/lib/sidebar.ts` | `buildSidebar()` | `astro.config.ts`, test |

Ba file này **chỉ dùng import tương đối và không import `astro:*`**, vì `astro.config.ts` nạp chúng (xem [scaffold.md](scaffold.md) mục 2.4).

Không tách `LESSONS` theo từng phần thành nhiều file. 78 dòng dữ liệu (khoảng 600 dòng code) vẫn dễ đọc trong một file, và `CLAUDE.md` đã chỉ định `src/data/roadmap.ts`.

## 3. Cấu trúc file

```
src/data/roadmap.ts         # kiểu + PARTS + LESSONS
src/lib/roadmap.ts          # hàm tiện ích, validateRoadmap, findCycle
src/lib/sidebar.ts          # buildSidebar
tests/unit/lib/roadmap.test.ts        # dữ liệu hợp lệ, số bài, slug, vòng lặp
tests/unit/content/roadmap-files.test.ts  # trạng thái khớp file thật, title khớp frontmatter
tests/unit/lib/sidebar.test.ts        # buildSidebar
```

## 4. Giao diện

### 4.1. Kiểu và dữ liệu (`src/data/roadmap.ts`)

```ts
export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export type Localized<T = string> = Record<Locale, T>;

export const PART_IDS = ['python', 'math', 'ml', 'dl', 'nlp', 'cv', 'llm'] as const;
export type PartId = (typeof PART_IDS)[number];

/** "<part>/<kebab-case-slug>", e.g. "ml/linear-regression". Equals the MDX path under vi/ and en/. */
export type LessonId = `${PartId}/${string}`;

export type LocaleStatus = 'planned' | 'published';

export interface PartSection {
  id: string;                 // e.g. 'apps'
  title: Localized;
}

export interface Part {
  id: PartId;
  number: string;             // display number from PLAN.md: '1'…'4', '5a', '5b', '5c'
  title: Localized;
  description: Localized;     // one short line for RoadmapMap
  track: 'core' | 'branch';
  requires: PartId[];         // part-level hint only
  sections?: PartSection[];   // only 'llm' in MVP
}

export interface Lesson {
  id: LessonId;
  title: Localized;           // MUST equal the frontmatter `title` of the MDX file in each locale
  shortTitle?: Localized;     // optional shorter label for sidebar and RoadmapMap
  prerequisites: LessonId[];  // direct prerequisites only; each must appear earlier in LESSONS
  status: Localized<LocaleStatus>;
  section?: string;           // required for parts with `sections`, must match a section id
  notebooks?: { colab?: string; kaggle?: string }; // reserved (PLAN.md: out of scope for now), not rendered in MVP
}

export const PARTS: readonly Part[] = [/* 7 parts, see section 5 */];
export const LESSONS: readonly Lesson[] = [/* 78 lessons in roadmap order, see section 5 */];
```

Ví dụ một bài:

```ts
{
  id: 'ml/linear-regression',
  title: { vi: 'Hồi quy tuyến tính', en: 'Linear Regression' },
  prerequisites: ['ml/ml-overview', 'math/linear-algebra', 'math/calculus'],
  status: { vi: 'planned', en: 'planned' },
},
```

Phần (part) của bài **suy ra từ tiền tố của `id`**, không lưu riêng, để không bao giờ lệch.

`LessonId` là kiểu template literal nên TypeScript chỉ bắt được tiền tố phần sai. Việc id có tồn tại hay không do `validateRoadmap()` và test kiểm tra.

### 4.2. Hàm tiện ích (`src/lib/roadmap.ts`)

```ts
import type { Lesson, LessonId, Locale, Part, PartId } from '../data/roadmap';

export const LESSON_ID_PATTERN: RegExp; // /^(python|math|ml|dl|nlp|cv|llm)\/[a-z0-9]+(?:-[a-z0-9]+)*$/

// Lookup
export function getPart(id: PartId): Part;                          // throws if unknown
export function getLesson(id: string): Lesson | undefined;
export function requireLesson(id: string): Lesson;                  // throws with a readable message
export function getPartIdOf(lessonId: LessonId): PartId;
export function getLessonsByPart(partId: PartId): Lesson[];         // roadmap order
export function getLessonsBySection(partId: PartId, sectionId: string): Lesson[];
export function getPrerequisites(id: LessonId): Lesson[];           // direct, in declared order
export function getDependents(id: LessonId): Lesson[];              // lessons that list `id` as a prerequisite

// Status
export function hasPage(lesson: Lesson): boolean;                   // status.vi === 'published'
export function isTranslated(lesson: Lesson, locale: Locale): boolean; // status[locale] === 'published'
export function getLessonUrl(id: LessonId, locale: Locale): string; // `/${locale}/${id}/` (trailing slash)
export function getRouteLessonId(routeId: string): LessonId | undefined;
// 'vi/ml/linear-regression' -> 'ml/linear-regression'; returns undefined for non-lesson pages (index, dev/...)

// Validation (pure: takes data as arguments so tests can feed broken fixtures)
export type RoadmapIssue =
  | { kind: 'duplicate-id'; id: string }
  | { kind: 'invalid-id'; id: string }
  | { kind: 'unknown-part'; id: string }
  | { kind: 'part-not-contiguous'; partId: PartId }
  | { kind: 'part-order'; partId: PartId }
  | { kind: 'unknown-prerequisite'; id: string; prerequisite: string }
  | { kind: 'self-prerequisite'; id: string }
  | { kind: 'duplicate-prerequisite'; id: string; prerequisite: string }
  | { kind: 'prerequisite-after-lesson'; id: string; prerequisite: string }
  | { kind: 'cycle'; path: LessonId[] }
  | { kind: 'en-without-vi'; id: string }
  | { kind: 'invalid-section'; id: string; section: string | undefined }
  | { kind: 'empty-title'; id: string; locale: Locale };

export function validateRoadmap(parts: readonly Part[], lessons: readonly Lesson[]): RoadmapIssue[];

/** Returns one cycle as a path (first id repeated at the end), or null if the graph is acyclic. */
export function findCycle(lessons: readonly Lesson[]): LessonId[] | null;
```

Ghi chú cài đặt (không bắt buộc cách làm):

- `findCycle`: DFS ba màu (trắng/xám/đen), O(số bài + số cạnh).
- Hàm tra cứu dùng `Map` dựng một lần khi nạp module.
- `getRouteLessonId` chỉ trả id khi id có trong `LESSONS`.

### 4.3. Sidebar (`src/lib/sidebar.ts`)

```ts
import type { StarlightUserConfig } from '@astrojs/starlight/types';
type SidebarConfig = NonNullable<StarlightUserConfig['sidebar']>;

/** Builds the Starlight sidebar: one group per part, only lessons that have a page. */
export function buildSidebar(parts?: readonly Part[], lessons?: readonly Lesson[]): SidebarConfig;
```

Kết quả cho một phần có bài:

```ts
{
  label: 'Học máy',                       // part.title.vi (default locale)
  translations: { en: 'Machine Learning' },
  items: [
    { slug: 'ml/linear-regression', label: 'Hồi quy tuyến tính', translations: { en: 'Linear Regression' } },
  ],
}
```

Quy tắc:

- Chỉ bài có `hasPage()`. Phần không có bài nào thì bỏ hẳn nhóm.
- Nhãn bài: `shortTitle ?? title`. Luôn có `translations.en`, nên sidebar bản en hiện tiếng Anh kể cả khi bài chưa dịch.
- Phần có `sections` (LLM): nhóm con lồng bên trong, mỗi mục con là một nhóm; mục con rỗng thì bỏ.
- `slug` không có tiền tố ngôn ngữ. Starlight tự thêm `/vi/` hoặc `/en/` (đã kiểm chứng).

## 5. Danh sách 78 bài và slug đề xuất

Tiêu đề `vi` giữ đúng như `PLAN.md` mục 6. Tiêu đề `en` là bản đề xuất, `lesson-translator` có thể chỉnh khi dịch (khi đó sửa luôn `roadmap.ts`). Năm bài ML đầu dùng đúng slug trong `docs/mvp.md`.

Cột "Cần biết trước" viết tắt: bỏ tiền tố phần nếu cùng phần với bài.

### Các phần

| id | number | title.vi | title.en | track | requires | description.vi / description.en |
|---|---|---|---|---|---|---|
| `python` | 1 | Python | Python | core | – | Cú pháp, cấu trúc dữ liệu, OOP, NumPy, Pandas, Matplotlib / Syntax, data structures, OOP, NumPy, Pandas, Matplotlib |
| `math` | 2 | Toán cho AI | Math for AI | core | python | Đại số tuyến tính, giải tích, xác suất thống kê / Linear algebra, calculus, probability and statistics |
| `ml` | 3 | Học máy | Machine Learning | core | python, math | Hồi quy, phân loại, phân cụm, tối ưu, đánh giá mô hình / Regression, classification, clustering, optimization, evaluation |
| `dl` | 4 | Học sâu | Deep Learning | core | ml | Mạng nơ-ron, CNN, RNN, LSTM, Transformers / Neural networks, CNNs, RNNs, LSTMs, Transformers |
| `nlp` | 5a | Xử lý ngôn ngữ tự nhiên | Natural Language Processing | branch | dl | Tokenizer, embeddings, BERT, GPT, các bài toán ngôn ngữ / Tokenizers, embeddings, BERT, GPT, language tasks |
| `cv` | 5b | Thị giác máy tính | Computer Vision | branch | dl | Phân loại ảnh, segmentation, CLIP, sinh ảnh, diffusion / Image classification, segmentation, CLIP, image generation, diffusion |
| `llm` | 5c | Mô hình ngôn ngữ lớn | Large Language Models | branch | dl | Prompt, RAG, Agents, fine-tune, RLHF/DPO, deploy / Prompting, RAG, agents, fine-tuning, RLHF/DPO, deployment |

Mục con của `llm`: `apps` = "Ứng dụng LLM" / "Building LLM Applications"; `build` = "Xây dựng và huấn luyện LLM" / "Building and Training LLMs".

### Phần 1: Python (7)

| # | id | title.vi | title.en | Cần biết trước |
|---|---|---|---|---|
| 1 | `python/colab-kaggle` | Làm quen công cụ: Google Colab, Kaggle | Getting Started: Google Colab and Kaggle | – |
| 2 | `python/basic-syntax` | Cú pháp cơ bản: biến, nhập/xuất, điều kiện, vòng lặp, toán tử logic | Basic Syntax: Variables, Input/Output, Conditions, Loops, Logical Operators | – |
| 3 | `python/data-structures` | Cấu trúc dữ liệu: list, tuple, set, dict | Data Structures: list, tuple, set, dict | basic-syntax |
| 4 | `python/functions-strings-files` | Hàm, chuỗi, đọc/ghi file | Functions, Strings, and File I/O | data-structures |
| 5 | `python/oop` | Lập trình hướng đối tượng (OOP) | Object-Oriented Programming (OOP) | functions-strings-files |
| 6 | `python/numpy-pandas` | Numpy và Pandas | NumPy and Pandas | functions-strings-files |
| 7 | `python/data-visualization` | Trực quan hóa dữ liệu: Matplotlib và Seaborn | Data Visualization: Matplotlib and Seaborn | numpy-pandas |

### Phần 2: Toán cho AI (3)

| # | id | title.vi | title.en | Cần biết trước |
|---|---|---|---|---|
| 1 | `math/linear-algebra` | Đại số tuyến tính | Linear Algebra | python/numpy-pandas |
| 2 | `math/calculus` | Giải tích | Calculus | linear-algebra |
| 3 | `math/probability-statistics` | Xác suất thống kê | Probability and Statistics | calculus |

### Phần 3: Machine Learning (14)

| # | id | title.vi | title.en | Cần biết trước |
|---|---|---|---|---|
| 1 | `ml/ml-overview` | Tổng quan về Học máy | Introduction to Machine Learning | python/numpy-pandas |
| 2 | `ml/linear-regression` | Hồi quy tuyến tính | Linear Regression | ml-overview, math/linear-algebra, math/calculus |
| 3 | `ml/overfitting-underfitting` | Overfitting và Underfitting | Overfitting and Underfitting | linear-regression |
| 4 | `ml/regularization` | Ridge, Lasso, Elastic Net | Ridge, Lasso, and Elastic Net | overfitting-underfitting |
| 5 | `ml/gradient-descent` | Gradient Descent | Gradient Descent | linear-regression, math/calculus |
| 6 | `ml/optimizers` | Các thuật toán tối ưu nâng cao: SGD, Momentum, RMSProp, Adam | Advanced Optimizers: SGD, Momentum, RMSProp, Adam | gradient-descent |
| 7 | `ml/k-means` | K-means | K-means | ml-overview, math/linear-algebra |
| 8 | `ml/k-nearest-neighbors` | K-Nearest Neighbors (KNN) | K-Nearest Neighbors (KNN) | ml-overview, math/linear-algebra |
| 9 | `ml/logistic-regression` | Hồi quy Logistic | Logistic Regression | linear-regression, gradient-descent, math/probability-statistics |
| 10 | `ml/classification-metrics` | Đánh giá mô hình: Accuracy, Precision, Recall, F1 | Model Evaluation: Accuracy, Precision, Recall, F1 | logistic-regression |
| 11 | `ml/softmax-regression` | Hồi quy Softmax | Softmax Regression | logistic-regression |
| 12 | `ml/decision-tree-random-forest` | Decision Tree và Random Forest | Decision Trees and Random Forests | overfitting-underfitting, classification-metrics |
| 13 | `ml/data-preprocessing` | Xử lý dữ liệu, tăng cường dữ liệu, dữ liệu mất cân bằng | Data Preprocessing, Augmentation, and Imbalanced Data | classification-metrics, python/numpy-pandas |
| 14 | `ml/end-to-end-project` | Dự án ML từ đầu đến cuối | An End-to-End ML Project | regularization, decision-tree-random-forest, data-preprocessing |

### Phần 4: Deep Learning (8)

| # | id | title.vi | title.en | Cần biết trước |
|---|---|---|---|---|
| 1 | `dl/neural-networks` | Mạng nơ-ron nhân tạo: perceptron, MLP, lan truyền xuôi, hàm kích hoạt | Neural Networks: Perceptron, MLP, Forward Propagation, Activation Functions | ml/gradient-descent, ml/logistic-regression, ml/softmax-regression |
| 2 | `dl/training-neural-networks` | Huấn luyện mạng nơ-ron: vanishing/exploding gradient, BatchNorm, Dropout | Training Neural Networks: Vanishing/Exploding Gradients, BatchNorm, Dropout | neural-networks, ml/optimizers, ml/regularization |
| 3 | `dl/cnn` | Mạng tích chập (CNN) | Convolutional Neural Networks (CNN) | training-neural-networks |
| 4 | `dl/modern-cnn-architectures` | Các kiến trúc CNN hiện đại: LeNet, AlexNet, VGG, GoogLeNet, ResNet, Xception, SENet, YOLO | Modern CNN Architectures: LeNet, AlexNet, VGG, GoogLeNet, ResNet, Xception, SENet, YOLO | cnn |
| 5 | `dl/rnn` | Mạng nơ-ron hồi tiếp (RNN) | Recurrent Neural Networks (RNN) | training-neural-networks |
| 6 | `dl/gru` | GRU | GRU | rnn |
| 7 | `dl/lstm-bilstm` | LSTM và BiLSTM | LSTM and BiLSTM | gru |
| 8 | `dl/transformers` | Transformers | Transformers | lstm-bilstm |

### Phần 5a: NLP (13)

| # | id | title.vi | title.en | Cần biết trước |
|---|---|---|---|---|
| 1 | `nlp/regex` | Biểu thức chính quy (Regex) | Regular Expressions (Regex) | python/functions-strings-files |
| 2 | `nlp/tokenization` | Tách từ (Tokenizer) | Tokenization | regex |
| 3 | `nlp/text-normalization` | Chuẩn hóa văn bản | Text Normalization | tokenization |
| 4 | `nlp/vector-semantics-embeddings` | Vector Semantics và Embeddings | Vector Semantics and Embeddings | text-normalization, math/linear-algebra |
| 5 | `nlp/word2vec-glove-fasttext` | Word2Vec (CBOW, Skip-gram), GloVe, FastText | Word2Vec (CBOW, Skip-gram), GloVe, FastText | vector-semantics-embeddings, dl/neural-networks |
| 6 | `nlp/bert` | BERT | BERT | word2vec-glove-fasttext, dl/transformers |
| 7 | `nlp/gpt-distributed-training` | GPT và huấn luyện phân tán | GPT and Distributed Training | dl/transformers |
| 8 | `nlp/advanced-transformers` | Transformers nâng cao | Advanced Transformers | bert, gpt-distributed-training |
| 9 | `nlp/information-retrieval` | Truy xuất thông tin (Information Retrieval) | Information Retrieval | vector-semantics-embeddings |
| 10 | `nlp/sentiment-analysis` | Phân tích cảm xúc | Sentiment Analysis | bert, ml/classification-metrics |
| 11 | `nlp/named-entity-recognition` | Nhận dạng thực thể (NER) | Named Entity Recognition (NER) | bert |
| 12 | `nlp/text-generation-summarization` | Sinh văn bản và tóm tắt văn bản | Text Generation and Summarization | gpt-distributed-training |
| 13 | `nlp/question-answering` | Hỏi đáp (Question Answering) | Question Answering | bert, information-retrieval |

### Phần 5b: Computer Vision (10)

| # | id | title.vi | title.en | Cần biết trước |
|---|---|---|---|---|
| 1 | `cv/cnn-image-classification` | Phân loại ảnh với CNN: AlexNet → VGG → ResNet → MobileNet → EfficientNet | Image Classification with CNNs: AlexNet → VGG → ResNet → MobileNet → EfficientNet | dl/modern-cnn-architectures |
| 2 | `cv/vision-transformer` | Phân loại ảnh với Transformer: Attention, ViT | Image Classification with Transformers: Attention, ViT | cnn-image-classification, dl/transformers |
| 3 | `cv/semantic-segmentation` | Semantic Segmentation: FCN, UNet, FPN, DeepLab, HRNet | Semantic Segmentation: FCN, UNet, FPN, DeepLab, HRNet | cnn-image-classification |
| 4 | `cv/instance-universal-segmentation` | Instance và Universal Segmentation: Mask R-CNN, Mask2Former, SAM | Instance and Universal Segmentation: Mask R-CNN, Mask2Former, SAM | semantic-segmentation |
| 5 | `cv/clip-blip-glip` | Ảnh + văn bản (1): CLIP, BLIP, GLIP | Vision and Language (1): CLIP, BLIP, GLIP | vision-transformer |
| 6 | `cv/llava` | Ảnh + văn bản (2): LLaVA và các biến thể | Vision and Language (2): LLaVA and Its Variants | clip-blip-glip |
| 7 | `cv/vae-gan` | Sinh ảnh (1): VAE, GAN, CycleGAN, Pix2Pix | Image Generation (1): VAE, GAN, CycleGAN, Pix2Pix | dl/modern-cnn-architectures, math/probability-statistics |
| 8 | `cv/diffusion-models` | Sinh ảnh (2): Diffusion, Stable Diffusion, LoRA | Image Generation (2): Diffusion, Stable Diffusion, LoRA | vae-gan |
| 9 | `cv/image-augmentation` | Data augmentation trong CV | Data Augmentation in Computer Vision | cnn-image-classification, ml/data-preprocessing |
| 10 | `cv/self-supervised-learning` | Self-supervised learning với ảnh | Self-Supervised Learning for Images | vision-transformer, image-augmentation |

### Phần 5c: LLM (23)

| # | id | section | title.vi | title.en | Cần biết trước |
|---|---|---|---|---|---|
| 1 | `llm/text-api` | apps | Sử dụng API văn bản | Using Text Generation APIs | python/functions-strings-files |
| 2 | `llm/gradio-streamlit` | apps | Làm giao diện với Gradio/Streamlit | Building UIs with Gradio and Streamlit | text-api |
| 3 | `llm/prompt-engineering` | apps | Prompt Engineering | Prompt Engineering | text-api |
| 4 | `llm/docker-cloud` | apps | Docker và Cloud | Docker and the Cloud | gradio-streamlit |
| 5 | `llm/deploy-custom-model` | apps | Deploy mô hình riêng | Deploying Your Own Model | docker-cloud |
| 6 | `llm/rag-chatbot` | apps | RAG và chatbot hiện đại | RAG and Modern Chatbots | prompt-engineering, nlp/information-retrieval |
| 7 | `llm/web-crawling-mongodb` | apps | Crawl dữ liệu và MongoDB | Web Crawling and MongoDB | python/functions-strings-files |
| 8 | `llm/langchain-llamaindex` | apps | LangChain và LlamaIndex | LangChain and LlamaIndex | rag-chatbot |
| 9 | `llm/agents` | apps | Agents | Agents | langchain-llamaindex |
| 10 | `llm/graph-rag` | apps | Graph RAG | Graph RAG | rag-chatbot |
| 11 | `llm/image-video-api` | apps | API cho hình ảnh và video | Image and Video APIs | text-api |
| 12 | `llm/build-first-llm` | build | Xây dựng LLM đầu tiên | Building Your First LLM | dl/transformers, nlp/tokenization |
| 13 | `llm/gpt-family-finetuning` | build | Họ GPT và fine-tune đa nhiệm | The GPT Family and Multi-Task Fine-Tuning | build-first-llm |
| 14 | `llm/pretraining-data` | build | Chuẩn bị dữ liệu pre-train | Preparing Pre-Training Data | build-first-llm |
| 15 | `llm/rlhf` | build | RLHF | RLHF | gpt-family-finetuning |
| 16 | `llm/dpo` | build | DPO | DPO | rlhf |
| 17 | `llm/evaluation-peft` | build | Đánh giá mô hình và PEFT: LoRA, quantization, distillation, pruning | Model Evaluation and PEFT: LoRA, Quantization, Distillation, Pruning | gpt-family-finetuning |
| 18 | `llm/llama-family` | build | Họ LLaMA: RoPE, huấn luyện song song | The LLaMA Family: RoPE and Parallel Training | build-first-llm |
| 19 | `llm/seq2seq` | build | Mô hình chuỗi sang chuỗi (Seq2Seq) | Sequence-to-Sequence Models (Seq2Seq) | dl/lstm-bilstm, dl/transformers |
| 20 | `llm/deepseek-family` | build | Họ DeepSeek | The DeepSeek Family | llama-family |
| 21 | `llm/debugging-language-models` | build | Debug mô hình ngôn ngữ | Debugging Language Models | build-first-llm |
| 22 | `llm/multimodal` | build | Multimodal | Multimodal LLMs | llama-family, cv/llava |
| 23 | `llm/llm-deployment` | build | Deploy LLM: nhiều GPU, phân tán | Deploying LLMs: Multi-GPU and Distributed Serving | deploy-custom-model, evaluation-peft |

Tổng: 7 + 3 + 14 + 8 + 13 + 10 + 23 = **78**. Mọi prerequisite trong bảng đều đứng trước bài của nó (đã soát tay theo quy tắc 2.3). Test sẽ kiểm tra lại.

Gợi ý `shortTitle` cho tiêu đề dài, dùng ở sidebar (developer thêm ở M0, có thể bỏ nếu người dùng không muốn):

| id | shortTitle.vi | shortTitle.en |
|---|---|---|
| `python/basic-syntax` | Cú pháp cơ bản | Basic Syntax |
| `ml/optimizers` | Thuật toán tối ưu nâng cao | Advanced Optimizers |
| `ml/data-preprocessing` | Xử lý dữ liệu | Data Preprocessing |
| `dl/neural-networks` | Mạng nơ-ron nhân tạo | Neural Networks |
| `dl/training-neural-networks` | Huấn luyện mạng nơ-ron | Training Neural Networks |
| `dl/modern-cnn-architectures` | Kiến trúc CNN hiện đại | Modern CNN Architectures |
| `cv/cnn-image-classification` | Phân loại ảnh với CNN | Image Classification with CNNs |
| `cv/instance-universal-segmentation` | Instance và Universal Segmentation | Instance and Universal Segmentation |
| `llm/evaluation-peft` | Đánh giá mô hình và PEFT | Model Evaluation and PEFT |

## 6. Test bắt buộc

### 6.1. `tests/unit/lib/roadmap.test.ts` (dữ liệu)

1. `validateRoadmap(PARTS, LESSONS)` trả `[]`.
2. Có đúng 7 phần theo thứ tự `PART_IDS`, và số bài từng phần là `python 7, math 3, ml 14, dl 8, nlp 13, cv 10, llm 23`, tổng 78. Khi thêm bài theo kế hoạch, sửa số trong test có chủ đích.
3. Mọi id khớp `LESSON_ID_PATTERN` và không trùng.
4. 5 bài MVP tồn tại đúng id: `ml/ml-overview`, `ml/linear-regression`, `ml/overfitting-underfitting`, `ml/regularization`, `ml/gradient-descent`.
5. Mọi bài `llm` có `section` thuộc `apps | build`; bài phần khác không có `section`.
6. **Test âm (fixture lỗi), mỗi loại lỗi một ca**, kiểm tra `validateRoadmap` báo đúng `kind`: prerequisite không tồn tại, tự trỏ chính mình, prerequisite đứng sau bài, id trùng, id sai định dạng, `en` published khi `vi` planned, phần không liền nhau.
7. `findCycle`: đồ thị A→B→C→A trả đường đi có đủ 3 id và lặp lại id đầu ở cuối; dữ liệu thật trả `null`.
8. `getPrerequisites`, `getDependents`, `getLessonUrl('ml/linear-regression', 'en') === '/en/ml/linear-regression/'`, `getRouteLessonId('vi/ml/linear-regression') === 'ml/linear-regression'`, `getRouteLessonId('vi/index') === undefined`.

### 6.2. `tests/unit/content/roadmap-files.test.ts` (khớp file thật)

Đọc file bằng `node:fs` từ `src/content/docs/`.

1. Với mỗi bài và mỗi ngôn ngữ: `status[locale] === 'published'` **khi và chỉ khi** tồn tại `src/content/docs/<locale>/<id>.mdx`.
2. Mọi file `.md`/`.mdx` trong `src/content/docs/vi/` và `en/` hoặc là bài trong `LESSONS`, hoặc nằm trong `NON_LESSON_PAGES = ['index', 'about', 'dev/components']`. Không có file "mồ côi".
3. Với bài có file: dòng `title:` trong frontmatter bằng đúng `title[locale]` trong `roadmap.ts`.
4. Không có file trong thư mục phần lạ (chỉ 7 tên thư mục phần cộng `dev/`).

### 6.3. `tests/unit/lib/sidebar.test.ts`

1. Dữ liệu thật (`LESSONS`): `buildSidebar()` có đúng các bài có `status.vi === 'published'`, theo thứ tự lộ trình, nhãn là `shortTitle ?? title` (vi làm nhãn, en trong `translations`); mỗi phần có bài là một nhóm, theo thứ tự phần, không nhóm nào rỗng. Kỳ vọng tính từ `LESSONS`, nên test vẫn đúng khi xuất bản thêm bài. Khi mọi bài đều `planned` (fixture), `buildSidebar()` trả `[]`.
2. Fixture có 2 bài published trong `ml`: một nhóm "Học máy" với `translations.en === 'Machine Learning'`, đúng 2 mục theo thứ tự lộ trình, mỗi mục có `slug` không tiền tố ngôn ngữ và có `translations.en`.
3. Bài chỉ có `vi` published vẫn có trong sidebar.
4. Fixture `llm` có bài ở `build` nhưng không có ở `apps`: chỉ có nhóm con `build`.
5. `shortTitle` được ưu tiên hơn `title` khi có.

## 7. Các bước thực hiện

| # | Agent | Việc | Tiêu chí hoàn thành |
|---|---|---|---|
| 1 | `developer` (trong nhiệm vụ M0-5 của [scaffold.md](scaffold.md)) | Viết `src/data/roadmap.ts` theo mục 4.1 và bảng mục 5 | 78 bài; `validateRoadmap()` trả `[]` |
| 2 | `developer` (M0-5) | Viết `src/lib/roadmap.ts`, `src/lib/sidebar.ts` theo mục 4.2, 4.3 | `npm run check` 0 lỗi; không import `astro:*` hay alias |
| 3 | `developer` (M0-7) | Viết test mục 6 | `npm test` qua; đổi thử một prerequisite thành id sai thì test 6.1.1 lỗi |
| 4 | `tester` (M0-10) | Bổ sung test biên, chạy lại | Báo cáo qua/lỗi |

Về sau, khi xuất bản một bài: `lesson-writer` tạo file MDX → đổi `status.vi` thành `published` trong cùng thay đổi. `lesson-translator` tạo file en → đổi `status.en`. Test 6.2 sẽ báo nếu quên.

## 8. Rủi ro và điểm chưa chắc

| # | Điểm | Đề xuất |
|---|---|---|
| 1 | Quan hệ "cần biết trước" ở bảng mục 5 là đề xuất của architect, chưa qua chuyên môn từng bài | `lesson-writer` được sửa `prerequisites` của bài mình viết; test đảm bảo không hỏng cấu trúc |
| 2 | Tiêu đề vi theo PLAN.md khá dài (ví dụ bài DL 4) | Dùng `shortTitle` cho sidebar; tiêu đề đầy đủ vẫn là H1 của trang |
| 3 | `python/colab-kaggle`: CLAUDE.md nói notebook Colab/Kaggle ngoài phạm vi, nhưng PLAN.md vẫn có bài "Làm quen công cụ" | Giữ bài (giới thiệu công cụ, không phải bài tập notebook). Người dùng đã xác nhận |
| 4 | Seaborn không có sẵn trong Pyodide 314.0.7 (có numpy 2.4.6, pandas 3.0.2, matplotlib 3.10.8, scipy 1.18.0, scikit-learn 1.8.0) | Ảnh hưởng bài `python/data-visualization`. Xem [components.md](components.md) mục rủi ro |

### Câu hỏi cho người dùng

Người dùng đã trả lời ngày 22/10/2026:

1. ~~Bảng slug và quan hệ "cần biết trước"~~ → **chốt** bảng ở mục 5. Từ giờ đổi slug phải có lý do rõ ràng.
2. ~~Bài `python/colab-kaggle`~~ → **giữ**, chỉ là bài giới thiệu công cụ, không có bài tập notebook.
3. ~~`shortTitle` cho sidebar~~ → **dùng** `shortTitle` khi tiêu đề dài.
