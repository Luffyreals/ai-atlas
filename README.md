# AI Atlas

[![CI](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-f38020?logo=cloudflare&logoColor=white)](https://ai-atlas-7nb.pages.dev/)
[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**Tiếng Việt** | [English](docs/README.en.md)

> **Tấm bản đồ tri thức Trí tuệ Nhân tạo:** Từ những dòng code Python cơ bản đến các mô hình ngôn ngữ lớn (LLMs) hiện đại nhất, được giải thích tường minh từ trực giác đời thường đến chứng minh toán học, hoàn toàn mở và miễn phí.

🌐 **Website trực tuyến:** [https://ai-atlas-7nb.pages.dev/](https://ai-atlas-7nb.pages.dev/)

---

## 🧭 Giới thiệu

**AI Atlas** là nền tảng tài liệu và lộ trình tự học AI **song ngữ Việt – Anh**, được xây dựng nhằm giải quyết câu hỏi phổ biến nhất của người học AI: *"Nên học gì trước, học gì sau, và bản chất thực sự của thuật toán là gì?"*.

Không đi theo lối mòn đưa công thức toán học khô khan hoặc các đoạn code chạy mẫu thiếu giải thích, AI Atlas dẫn dắt bạn qua từng chủ đề với phương châm: **Hiểu trực giác → Nắm chắc bản chất toán học → Trực quan hóa tương tác → Thực hành code ngay trên trình duyệt**.

### ✨ Điểm nhấn nổi bật

- 🗺️ **Lộ trình trực quan (Dependency Roadmap):** Toàn bộ 78 bài học được liên kết bằng quan hệ tiên quyết (*prerequisites*) chặt chẽ. Bạn luôn biết một kiến thức mới kế thừa từ đâu và dẫn tới đâu.
- 💡 **Trực giác đi trước, công thức theo sau:** Mọi bài học đều bắt đầu từ bài toán thực tế đời thường, giải thích cặn kẽ "vì sao" trước khi đi vào từng bước biến đổi toán học với KaTeX.
- 🎛️ **Minh họa tương tác độc quyền (Interactive VIZ):** Kéo thanh trượt để tự điều chỉnh siêu tham số, xem đường hồi quy xoay chuyển, gradient descent tìm cực trị, hay xem phân phối xác suất sampling của LLM thay đổi theo thời gian thực.
- 🐍 **Chạy Python ngay trên trình duyệt (WebAssembly / Pyodide):** Trải nghiệm code sống động mà không cần cài đặt môi trường. Chỉnh sửa và chạy Python ngay trên trình duyệt với hỗ trợ vẽ biểu đồ Matplotlib.
- 🖥️ **Khối code máy cục bộ (LocalCode):** Đối với các bài toán Deep Learning/LLM cần GPU hoặc API, bài học cung cấp khối lệnh chạy trên máy cá nhân với hướng dẫn biến môi trường và kết quả mẫu từ lần chạy thật.
- 🔒 **Song ngữ & Tôn trọng quyền riêng tư:** Giao diện và bài học hỗ trợ đầy đủ tiếng Việt và tiếng Anh. Không bắt buộc đăng nhập, không cookie theo dõi; toàn bộ tiến độ học được lưu an toàn trong `localStorage` trên máy bạn.
- ⚡ **Tối ưu hiệu năng cao:** Xây dựng trên Astro 7 + Starlight, tối ưu font tải qua Fonts API triệt tiêu độ giật layout (CLS = 0), hỗ trợ tìm kiếm tĩnh tức thì với Pagefind.

---

## 📚 Lộ trình 78 bài học

Lộ trình học tập được thiết kế mạch lạc qua 5 giai đoạn chính:

```
[Phần 1: Python] ──> [Phần 2: Toán cho AI] ──> [Phần 3: Machine Learning]
                                                          │
                                                          ▼
                                              [Phần 4: Deep Learning]
                                                          │
                 ┌────────────────────────────────────────┼────────────────────────────────────────┐
                 ▼                                        ▼                                        ▼
      [Phần 5a: Xử lý Ngôn ngữ (NLP)]         [Phần 5b: Thị giác Máy tính (CV)]          [Phần 5c: Mô hình Ngôn ngữ Lớn (LLM)]
```

### Chi tiết các phần:
1. **Python cho AI** (7 bài): Môi trường Colab/Kaggle, cú pháp cơ bản, cấu trúc dữ liệu, hàm & file, OOP, NumPy & Pandas, trực quan hóa dữ liệu (Matplotlib & Seaborn).
2. **Toán học cho AI** (3 bài): Đại số tuyến tính, Giải tích & Đạo hàm, Xác suất & Thống kê.
3. **Machine Learning** (14 bài): Hồi quy tuyến tính, Overfitting & Underfitting, Regularization (Ridge/Lasso/Elastic Net), Gradient Descent, Thuật toán tối ưu nâng cao (Momentum, RMSProp, Adam), K-Means, K-Nearest Neighbors, Logistic Regression, Softmax Regression, Cây quyết định & Rừng ngẫu nhiên, Xử lý dữ liệu & Imbalance, Dự án ML End-to-End.
4. **Deep Learning** (8 bài): Neural Networks & MLP, Lan truyền ngược & Kỹ thuật huấn luyện (BatchNorm, Dropout), Mạng tích chập (CNN), Các kiến trúc CNN hiện đại (ResNet, MobileNet...), Mạng hồi quy (RNN), GRU, LSTM & BiLSTM, Kiến trúc Transformers.
5. **Chuyên sâu:**
   - **Xử lý Ngôn ngữ Tự nhiên - NLP** (13 bài): Regex, Tokenizer, Chuẩn hóa văn bản, Vector Semantics, Word2Vec/GloVe/FastText, BERT, GPT & Pre-training, Information Retrieval, Sentiment Analysis, NER, Text Generation, Question Answering.
   - **Thị giác Máy tính - Computer Vision** (10 bài): Phân loại ảnh CNN/ViT, Semantic Segmentation (U-Net, DeepLab), Instance Segmentation (Mask R-CNN, SAM), Mô hình Đa phương thức (CLIP, BLIP), LLaVA, Mô hình Sinh (VAE, GAN), Khuếch tán (Diffusion, LoRA), Augmentation & Self-supervised Learning.
   - **Mô hình Ngôn ngữ Lớn - LLM & GenAI** (23 bài): Text APIs, Giao diện tương tác Gradio/Streamlit, Prompt Engineering, Docker & Cloud, Deploy mô hình nguồn mở, RAG & Chatbots, Crawl dữ liệu & Vector DB, LangChain & LlamaIndex, AI Agents, Graph RAG, Multimodal APIs, Huấn luyện LLM từ đầu, Fine-tuning họ GPT & LLaMA, Chuẩn bị dữ liệu Pre-train, Căn chỉnh RLHF & DPO, Đánh giá mô hình & PEFT (LoRA, QLoRA, Quantization), Triển khai mô hình phân tán vLLM.

---

## 🛠️ Ngăn xếp Công nghệ (Tech Stack)

| Thành phần | Công nghệ sử dụng | Mục đích |
|---|---|---|
| **Web Framework** | [Astro 7](https://astro.build) + [Starlight](https://starlight.astro.build) | Nền tảng static-site generator hiệu năng cao, hỗ trợ i18n đa ngôn ngữ chuẩn mực |
| **Định dạng bài viết** | [MDX](https://mdxjs.com) | Kết hợp văn bản Markdown và các React Islands tương tác trực tiếp |
| **Công thức Toán** | [KaTeX](https://katex.org) | Render công thức toán học nhanh, đẹp, chuẩn trợ năng màn hình (A11y) |
| **Tương tác UI** | [React 19](https://react.dev) | Xây dựng các widget tương tác VIZ, Quiz, Runner với độ tải tối ưu |
| **Thực thi Python** | [Pyodide](https://pyodide.org) | Chạy Python 3.10 và các thư viện khoa học dữ liệu trực tiếp trong Web Worker |
| **Tìm kiếm nội dung** | [Pagefind](https://pagefind.app) | Công cụ tìm kiếm tĩnh toàn văn bản, không phụ thuộc server bên ngoài |
| **Kiểm thử tự động** | [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) | Hơn 2.200 unit tests và kiểm thử E2E đa màn hình đảm bảo chất lượng tuyệt đối |
| **Hosting & CDN** | [Cloudflare Pages](https://pages.cloudflare.com) | Phân phối toàn cầu tốc độ cao, bảo mật HTTP headers và HTTPS tự động |

---

## 📂 Cấu trúc Repository

```text
ai-atlas/
├── src/
│   ├── content/docs/
│   │   ├── vi/               # Toàn bộ 78 bài học tiếng Việt
│   │   └── en/               # Các bài học tiếng Anh tương ứng
│   ├── content/i18n/         # Chuỗi ngôn ngữ giao diện (vi.json, en.json)
│   ├── components/           # Component React & Astro (Quiz, PythonRunner, VIZ, Figures)
│   ├── lib/                  # Thư viện tính toán toán học, SEO, Pyodide client, Fonts
│   ├── data/                 # Dữ liệu lộ trình (roadmap.ts), datasets, figures
│   └── styles/               # CSS tokens và typography tối ưu cho Dark/Light mode
├── docs/                     # Tài liệu thiết kế kỹ thuật, kế hoạch, nhật ký quyết định
│   ├── PLAN.md               # Kế hoạch chi tiết và tiến độ lộ trình
│   ├── CHANGELOG.md          # Lịch sử các cập nhật đáng chú ý
│   ├── decisions.md          # Nhật ký các quyết định kỹ thuật đã thống nhất
│   └── architecture/         # Tài liệu thiết kế chi tiết (homepage, VIZ, launch, v.v.)
├── tests/
│   ├── unit/                 # Hơn 2.200 unit tests (Vitest) cho toán học, nội dung, cú pháp
│   └── e2e/                  # Bộ kiểm thử giao diện & luồng người dùng (Playwright)
├── public/                   # Tài nguyên tĩnh, robots.txt, OpenGraph images, Cloudflare _headers
├── astro.config.ts           # Cấu hình Astro, Starlight, Fonts API, và KaTeX
└── package.json              # Quản lý dependencies và scripts điều khiển
```

---

## 🚀 Hướng dẫn Chạy trên máy cá nhân

### Yêu cầu tiên quyết
- **Node.js:** Phiên bản `24.15.0` (được ghim trong `.node-version`, yêu cầu tối thiểu `>=22.23.4`)
- **Trình quản lý gói:** `npm` (đi kèm Node.js)

### Cài đặt và Chạy thử

```sh
# 1. Clone mã nguồn về máy
git clone https://github.com/Luffyreals/ai-atlas.git
cd ai-atlas

# 2. Cài đặt các thư viện cần thiết
npm install

# 3. Khởi động môi trường phát triển (Dev Server)
npm run dev
```

Mở trình duyệt và truy cập: [http://localhost:4321/vi/](http://localhost:4321/vi/)

### Các lệnh quản trị & kiểm thử

| Lệnh | Ý nghĩa |
|---|---|
| `npm run dev` | Khởi động máy chủ phát triển cục bộ với Hot Module Reloading |
| `npm run check` | Kiểm tra toàn bộ kiểu dữ liệu TypeScript (`astro check`) |
| `npm test` | Chạy toàn bộ bộ kiểm thử đơn vị (>2.200 tests với Vitest) |
| `npm run test:watch` | Chạy kiểm thử đơn vị ở chế độ quan sát theo thời gian thực |
| `npm run test:e2e` | Chạy bộ kiểm thử tự động giao diện End-to-End (Playwright) |
| `npm run build` | Đóng gói sản phẩm production ra thư mục `dist/` và kiểm tra liên kết |
| `npm run preview` | Xem trước bản build tĩnh production trên máy cục bộ |
| `npm run og:images` | Sinh lại ảnh xem trước mạng xã hội (OpenGraph images) |

---

## 👤 Tác giả & Liên hệ

- **Tác giả:** **Nguyễn Hoàng Tùng**
- **GitHub:** [@Luffyreals](https://github.com/Luffyreals)
- **Email:** [hoangtungcnh@gmail.com](mailto:hoangtungcnh@gmail.com)
- **Dự án:** [https://ai-atlas-7nb.pages.dev/](https://ai-atlas-7nb.pages.dev/)

Mọi trao đổi về học thuật, phản hồi bài viết, hoặc đề xuất hợp tác xin vui lòng liên hệ qua email hoặc tạo [Issue trên GitHub](https://github.com/Luffyreals/ai-atlas/issues).

---

## 📄 Giấy phép Bản quyền (License)

Dự án áp dụng mô hình giấy phép kép:

- 💻 **Mã nguồn (Source Code):** Phát hành theo giấy phép **[MIT License](LICENSE)**. Bạn được tự do sử dụng, chỉnh sửa và tích hợp vào các dự án cá nhân hoặc thương mại.
- 📖 **Nội dung & Hình ảnh (Content):** Phát hành theo giấy phép **[Creative Commons CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)**. Bạn được chia sẻ và điều chỉnh với điều kiện ghi rõ nguồn gốc tác giả (Attribution), phi thương mại (Non-Commercial), và cùng chia sẻ dưới giấy phép tương tự (Share-Alike).
