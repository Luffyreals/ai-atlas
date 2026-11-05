# Kế hoạch dự án: AI Atlas

> **AI Atlas**: tấm bản đồ kiến thức AI, song ngữ Việt – Anh.

## 1. Mục tiêu

Xây dựng **một website công khai, miễn phí**. Website tổng hợp toàn bộ kiến thức AI từ cơ bản đến nâng cao và sắp xếp thành **lộ trình học** rõ ràng. Trọng tâm là **lý thuyết và giải thích dễ hiểu**, để ai cũng có thể tự học.

- **Người phát triển:** một người (dự án cá nhân).
- **Người dùng:** bất kỳ ai muốn học AI.
- **Mã nguồn:** repo **private** trên GitHub, đặt tại thư mục này.
- **Website:** **public**, ai cũng truy cập được, chạy trên **tên miền riêng**.
- **Ngôn ngữ:** **tiếng Việt và tiếng Anh**. Viết bản tiếng Việt trước, sau đó dịch sang tiếng Anh.
- **Nguồn nội dung:** các phần kiến thức trong [giáo án ai.md](reference/giao-an-ai.md). Bỏ các buổi không phải kiến thức như khai giảng, viết CV, phỏng vấn thử, seminar.

### Ngoài phạm vi
- **Thực hành bằng notebook Colab/Kaggle.** Phần này sẽ tách thành một dự án riêng, làm sau. Website chỉ chừa sẵn chỗ để gắn link khi có.

---

## 2. Công nghệ đề xuất

| Hạng mục | Lựa chọn | Lý do |
|---|---|---|
| Framework web | **Astro + Starlight** | Được thiết kế cho web tài liệu/wiki. Có sẵn sidebar, tìm kiếm, chế độ sáng/tối, giao diện tiếng Việt. Web nhẹ, tải nhanh. |
| Định dạng bài học | **MDX** | Viết chữ nhanh như Markdown, nhưng chèn được hình minh họa tương tác, khung code, quiz ngay giữa bài. |
| Thành phần tương tác | **React** (Astro islands) | Chỉ tải JavaScript ở những phần cần tương tác, nên trang vẫn nhanh. |
| Công thức toán | **KaTeX** (remark-math + rehype-katex) | Hiển thị công thức đẹp và nhanh. |
| Hình minh họa | **SVG / Mermaid**, minh họa tương tác bằng React | Giúp hiểu trực quan: kéo thanh trượt để thấy đường hồi quy thay đổi, xem gradient descent đi xuống từng bước… |
| Ví dụ code chạy được | **Pyodide** (chạy trong Web Worker) | Người học sửa và chạy thử code ví dụ ngay trên trang để kiểm chứng lý thuyết. Không cần server. |
| Tìm kiếm | **Pagefind** (có sẵn trong Starlight) | Tìm kiếm toàn trang, không cần server. |
| Lưu tiến độ học | **localStorage** | Đánh dấu bài đã học. Bản đầu tiên không cần đăng nhập. |
| Song ngữ | **Starlight i18n** | Có sẵn nút chuyển ngôn ngữ. Bài nào chưa dịch thì tự hiển thị bản tiếng Việt kèm thông báo. |
| Hosting | **Cloudflare Pages** | Miễn phí, kết nối được repo private, tự deploy mỗi khi push code. |
| Tên miền | **Cloudflare Registrar** (hoặc nhà đăng ký khác) | Mua tên miền giá gốc, gắn thẳng vào Cloudflare Pages, có HTTPS miễn phí. |

> Lưu ý: muốn dùng GitHub Pages với repo private thì phải có gói GitHub trả phí. Vì vậy dùng Cloudflare Pages, miễn phí.

### Song ngữ
- Đường dẫn: `/vi/...` cho tiếng Việt và `/en/...` cho tiếng Anh. Tiếng Việt là ngôn ngữ mặc định.
- Mỗi bài có 2 file cùng tên trong 2 thư mục `vi/` và `en/`.
- Giao diện (menu, nút bấm, quiz, minh họa) có bản dịch cho cả 2 ngôn ngữ.

### Tên miền
- Đã kiểm tra sơ bộ (10/2026): `aiatlas.com`, `aiatlas.dev`, `aiatlas.org`, `ai-atlas.dev` **đã có người đăng ký**.
- Cần kiểm tra lại tại nhà đăng ký: `aiatlas.io`, `aiatlas.vn`, `aiatlas.edu.vn`, hoặc các biến thể như `aiatlas.app`, `learnaiatlas.com`, `aiatlas.academy`.

---

## 3. Cấu trúc một bài học (template)

Mọi bài đều theo cùng một khung, **ưu tiên giải thích**:

1. **Mục tiêu:** học xong bài này bạn hiểu được gì.
2. **Cần biết trước:** link tới các bài nền tảng.
3. **Trực giác:** giải thích bằng lời và ví dụ đời thường trước khi vào toán.
4. **Lý thuyết:** công thức, chứng minh/diễn giải từng bước, hình minh họa.
5. **Minh họa:** hình hoặc minh họa tương tác giúp "thấy" được khái niệm.
6. **Ví dụ code:** đoạn code ngắn thể hiện lý thuyết, chạy thử được ngay trên trang.
7. **Lỗi hay gặp và hiểu nhầm phổ biến.**
8. **Kiểm tra nhanh:** vài câu hỏi trắc nghiệm để tự kiểm tra mức hiểu.
9. **Tóm tắt và đọc thêm:** ý chính, kèm tài liệu, video, paper gốc.

---

## 4. Các thành phần cần xây dựng

| Thành phần | Chức năng |
|---|---|
| `RoadmapMap` | Sơ đồ lộ trình ở trang chủ. Bấm vào một chủ đề để mở bài. Hiển thị bài đã học. |
| `Prerequisites` | Khối "Cần biết trước" ở đầu bài. |
| `PythonRunner` | Khung code ví dụ có nút chạy. Hiển thị kết quả in ra và biểu đồ matplotlib. |
| `Quiz` | Câu hỏi trắc nghiệm, chấm ngay, có giải thích đáp án. |
| Minh họa tương tác | Các component riêng cho từng khái niệm khó (vẽ theo nhu cầu từng bài). |
| `LessonProgress` | Nút "Đánh dấu đã học", lưu tiến độ. |

---

## 5. Cấu trúc thư mục dự kiến

```
ai-atlas/
├─ src/
│  ├─ content/docs/          # Bài học (MDX)
│  │  ├─ vi/                 # Tiếng Việt
│  │  │  ├─ python/  math/  ml/  dl/
│  │  │  └─ nlp/  cv/  llm/
│  │  └─ en/                 # Tiếng Anh (cùng cấu trúc)
│  ├─ content/i18n/          # Bản dịch chữ trên giao diện
│  ├─ components/            # Các thành phần tương tác (mục 4)
│  ├─ data/roadmap.ts        # Dữ liệu lộ trình: thứ tự, quan hệ "cần biết trước"
│  └─ styles/
├─ public/                   # Hình ảnh, file tĩnh
├─ docs/                     # Tài liệu dự án: spec MVP, template, glossary, thiết kế
│  ├─ PLAN.md                # File kế hoạch này
│  ├─ CHANGELOG.md           # Các thay đổi
│  ├─ README.en.md           # Giới thiệu dự án (tiếng Anh)
│  ├─ LICENSE-CONTENT.md     # Phạm vi hai giấy phép
│  └─ reference/giao-an-ai.md  # Giáo án gốc để tham khảo
├─ .claude/CLAUDE.md         # Hướng dẫn cho Claude
├─ .github/                  # CI, mẫu issue/PR, CONTRIBUTING.md, SECURITY.md
├─ README.md                 # Giới thiệu dự án (tiếng Việt)
└─ LICENSE                   # Giấy phép code (MIT)
```

---

## 6. Danh sách nội dung (78 bài)

### Phần 1: Python (7 bài)
1. Làm quen công cụ: Google Colab, Kaggle
2. Cú pháp cơ bản: biến, nhập/xuất, điều kiện, vòng lặp, toán tử logic
3. Cấu trúc dữ liệu: list, tuple, set, dict
4. Hàm, chuỗi, đọc/ghi file
5. Lập trình hướng đối tượng (OOP)
6. Numpy và Pandas
7. Trực quan hóa dữ liệu: Matplotlib và Seaborn

### Phần 2: Toán cho AI (3 bài)
1. Đại số tuyến tính
2. Giải tích
3. Xác suất thống kê

### Phần 3: Machine Learning (14 bài)
1. Tổng quan về Học máy
2. Hồi quy tuyến tính
3. Overfitting và Underfitting
4. Ridge, Lasso, Elastic Net
5. Gradient Descent
6. Các thuật toán tối ưu nâng cao: SGD, Momentum, RMSProp, Adam
7. K-means
8. K-Nearest Neighbors (KNN)
9. Hồi quy Logistic
10. Đánh giá mô hình: Accuracy, Precision, Recall, F1
11. Hồi quy Softmax
12. Decision Tree và Random Forest
13. Xử lý dữ liệu, tăng cường dữ liệu, dữ liệu mất cân bằng
14. Dự án ML từ đầu đến cuối

### Phần 4: Deep Learning (8 bài)
1. Mạng nơ-ron nhân tạo: perceptron, MLP, lan truyền xuôi, hàm kích hoạt
2. Huấn luyện mạng nơ-ron: vanishing/exploding gradient, BatchNorm, Dropout
3. Mạng tích chập (CNN)
4. Các kiến trúc CNN hiện đại: LeNet, AlexNet, VGG, GoogLeNet, ResNet, Xception, SENet, YOLO
5. Mạng nơ-ron hồi tiếp (RNN)
6. GRU
7. LSTM và BiLSTM
8. Transformers

### Phần 5a: Xử lý ngôn ngữ tự nhiên – NLP (13 bài)
1. Biểu thức chính quy (Regex)
2. Tách từ (Tokenizer)
3. Chuẩn hóa văn bản
4. Vector Semantics và Embeddings
5. Word2Vec (CBOW, Skip-gram), GloVe, FastText
6. BERT
7. GPT và huấn luyện phân tán
8. Transformers nâng cao
9. Truy xuất thông tin (Information Retrieval)
10. Phân tích cảm xúc
11. Nhận dạng thực thể (NER)
12. Sinh văn bản và tóm tắt văn bản
13. Hỏi đáp (Question Answering)

### Phần 5b: Thị giác máy tính – CV (10 bài)
1. Phân loại ảnh với CNN: AlexNet → VGG → ResNet → MobileNet → EfficientNet
2. Phân loại ảnh với Transformer: Attention, ViT
3. Semantic Segmentation: FCN, UNet, FPN, DeepLab, HRNet
4. Instance và Universal Segmentation: Mask R-CNN, Mask2Former, SAM
5. Ảnh + văn bản (1): CLIP, BLIP, GLIP
6. Ảnh + văn bản (2): LLaVA và các biến thể
7. Sinh ảnh (1): VAE, GAN, CycleGAN, Pix2Pix
8. Sinh ảnh (2): Diffusion, Stable Diffusion, LoRA
9. Data augmentation trong CV
10. Self-supervised learning với ảnh

### Phần 5c: Mô hình ngôn ngữ lớn – LLM (23 bài)
**Ứng dụng LLM**
1. Sử dụng API văn bản
2. Làm giao diện với Gradio/Streamlit
3. Prompt Engineering
4. Docker và Cloud
5. Deploy mô hình riêng
6. RAG và chatbot hiện đại
7. Crawl dữ liệu và MongoDB
8. LangChain và LlamaIndex
9. Agents
10. Graph RAG
11. API cho hình ảnh và video

**Xây dựng và huấn luyện LLM**

12. Xây dựng LLM đầu tiên
13. Họ GPT và fine-tune đa nhiệm
14. Chuẩn bị dữ liệu pre-train
15. RLHF
16. DPO
17. Đánh giá mô hình và PEFT: LoRA, quantization, distillation, pruning
18. Họ LLaMA: RoPE, huấn luyện song song
19. Mô hình chuỗi sang chuỗi (Seq2Seq)
20. Họ DeepSeek
21. Debug mô hình ngôn ngữ
22. Multimodal
23. Deploy LLM: nhiều GPU, phân tán

> Ghi chú: có thể bổ sung sau một số chủ đề còn thiếu như SVM, PCA, Gradient Boosting (XGBoost/LightGBM), và cập nhật các mô hình mới.

---

## 7. Lộ trình thực hiện

> **Bản MVP** gom Giai đoạn 0–2 và một phần Giai đoạn 3–4 thành 5 mốc (M0–M4): bộ khung, component, bài mẫu, 5 bài ML đầu, ra mắt. Phạm vi và tiêu chí hoàn thành ở [docs/mvp.md](mvp.md).

### Giai đoạn 0: Khởi tạo dự án
- [x] Đặt tên dự án: **AI Atlas**
- [x] Viết README (tiếng Việt và tiếng Anh)
- [x] Viết spec bản MVP ([docs/mvp.md](mvp.md))
- [x] `git init`, tạo repo **private** trên GitHub (`ai-atlas`)
- [x] Khởi tạo Astro + Starlight, cấu hình 2 ngôn ngữ (vi mặc định, en)
- [x] CI GitHub Actions (check, test, build, e2e) và Dependabot
- [ ] Kết nối Cloudflare Pages, tự deploy khi push
- [ ] Mua tên miền và gắn vào Cloudflare Pages

**Kết quả:** một website trống đã chạy online.

### Giai đoạn 1: Xây nền tảng
- [x] Cài KaTeX, tùy chỉnh giao diện (nhận diện và trang chủ, xem [docs/architecture/homepage.md](architecture/homepage.md))
- [x] `PythonRunner` (Pyodide 314.0.7 trong Web Worker, chỉ tải khi bấm Chạy; có matplotlib, nút Dừng, hàng đợi)
- [x] `Quiz` (câu hỏi trong frontmatter, KaTeX lúc build), `Prerequisites`
- [x] Lưu tiến độ (`LessonProgress`, localStorage, không lỗi khi bị chặn)
- [x] `RoadmapMap` cho trang chủ, đọc từ `roadmap.ts`, có dấu ✓ bài đã học và dòng "Đã học x/y"
- [x] Tạo khung sidebar từ `roadmap.ts` cho toàn bộ 78 bài. Không tạo trang trống: bài chưa viết chỉ có nhãn "Sắp có" trên lộ trình.
- [x] Trang demo `/vi/dev/components/` và `/en/dev/components/` dùng đủ các component (thiết kế: [docs/architecture/components.md](architecture/components.md))
- [ ] Người dùng duyệt giao diện trên trang demo, cả máy tính lẫn điện thoại thật (M1-10)

**Kết quả:** website có đủ khung lộ trình và đủ công cụ trình bày.

> **Trạng thái mốc M1 (23/10/2026):** xong phần kỹ thuật. `npm run check` 0 lỗi 0 cảnh báo, `npm test` 244/244, `npm run build` 0 `[WARN]`, `npm run test:e2e` 111 qua (3 bỏ qua có chủ ý), `npm run test:e2e:network` 11/11. Lighthouse mobile trang demo: Accessibility 100, Performance 87–90 (chấp nhận theo [quyết định 17](decisions.md), tối ưu ở M4). Còn chờ: người dùng duyệt (M1-10) và tiêu chí "mọi component chạy trên bản deploy" (cần kết nối Cloudflare Pages, Giai đoạn 0).
>
> **Bước tiếp theo (M2, Giai đoạn 2):** bài mẫu Hồi quy tuyến tính, theo thứ tự ở [docs/mvp.md](mvp.md) mục 5: `summarizer` tóm tắt tài liệu vào `docs/research/` → `lesson-writer` (vi) → `content-reviewer` → sửa → `viz-builder` → `tester` → `analyst` → **người dùng duyệt bản vi và template** → chỉnh bài và `docs/lesson-template.mdx` → `lesson-translator` (en) → `content-reviewer` (khớp vi/en) → `tester` → `analyst` (Lighthouse trên bài thật). File bài và `status` của `ml/linear-regression` trong `roadmap.ts` phải đổi **trong cùng một lần**, vì test `roadmap-files` bắt buộc như vậy: `lesson-writer` đổi `status.vi`, `lesson-translator` đổi `status.en`.

### Giai đoạn 2: Bài mẫu
- [x] Viết hoàn chỉnh **1 bài mẫu: Hồi quy tuyến tính**. Bài có đủ trực giác, toán từng bước, minh họa tương tác, code ví dụ và quiz.
- [x] Bạn duyệt, chỉnh template cho đến khi ưng ý

> **Trạng thái mốc M2 (23/10/2026):** xong. Bài `ml/linear-regression` có bản vi (người dùng đã duyệt, [quyết định 32](decisions.md)) và bản en, VIZ `LinearFitViz`, bảng dữ liệu `DatasetTable`, SEO cho trang fallback (quyết định 30, 33, 34), nút "Bắt đầu học" ở trang chủ. Template đã chốt theo bài này. Báo cáo: [docs/progress/2026-10-23-m2.md](progress/2026-10-23-m2.md).
>
> **Bước tiếp theo (M3):** 4 bài ML còn lại của MVP, bản vi, theo template đã chốt. Bản en làm sau MVP ([quyết định 43](decisions.md)). Đã xong bản vi cả 4 bài: Tổng quan Học máy, Overfitting và Underfitting, Ridge/Lasso/Elastic Net, Gradient Descent (bài cuối chờ duyệt trên PR #1, quyết định 56). Vẫn còn tồn: deploy lên Cloudflare Pages (Giai đoạn 0) và người dùng duyệt giao diện component (M1-10).

**Kết quả:** bài chuẩn dùng làm mẫu cho mọi bài sau.

### Giai đoạn 3: Viết nội dung theo thứ tự lộ trình
- [ ] Python (7 bài)
- [ ] Toán (3 bài)
- [ ] Machine Learning (14 bài)
- [ ] Deep Learning (8 bài)
- [ ] NLP, CV, LLM (46 bài)
  - [x] NLP (Phần 5a, 13 bài): xong bản vi, **chờ người dùng duyệt** trên PR riêng; bản en làm sau ([quyết định 70–75](decisions.md), thiết kế [docs/architecture/nlp-lessons.md](architecture/nlp-lessons.md))
  - [x] LLM (Phần 5c, 23 bài): xong bản vi, **chờ người dùng duyệt**; bản en làm sau ([quyết định 53](decisions.md))

> **Trạng thái phần LLM (24/10/2026, nhánh `llm-lessons`, worktree `ai-atlas-llm`, chưa commit):** 23 bài vi theo biến thể template LLM ([quyết định 53, 54, 59–61](decisions.md), thiết kế [docs/architecture/llm-lessons.md](architecture/llm-lessons.md)). Có component `LocalCode` (code minh họa chạy trên máy người đọc), VIZ `SamplingViz` (bài `text-api`, `build-first-llm`), 9 hình tĩnh trên 14 bài, e2e chia 2 shard trong CI, khoảng 280 thuật ngữ mới trong glossary. Cổng kiểm tra: `npm run check` 0 lỗi 0 cảnh báo, `npm test` 1307/1307, `npm run build` 0 `[WARN]`, `npm run test:e2e` 1029 qua (201 bỏ qua có điều kiện), 0 lỗi. Báo cáo: [docs/progress/2026-10-24-llm.md](progress/2026-10-24-llm.md).
>
> **Còn tồn:** người dùng duyệt 23 bài và các câu hỏi về hình; file `.env.llm` chưa có nên ô gọi API mới chạy khô, chưa có kết quả mẫu; link `ml/gradient-descent` trong bài `debugging-language-models` chờ gộp nhánh Gradient Descent; bản en 23 bài.

Mỗi phần viết xong bản tiếng Việt thì deploy luôn, rồi dịch sang tiếng Anh. Website dùng được ngay, không cần đợi xong hết.

### Giai đoạn 4: Hoàn thiện
- [ ] SEO: tiêu đề, mô tả, ảnh chia sẻ, sitemap
- [ ] Kiểm tra giao diện trên điện thoại và tốc độ tải
- [ ] Thống kê lượt truy cập (Cloudflare Web Analytics)

---

## 8. Việc cần quyết định

1. ~~Tên dự án~~ → **AI Atlas**, repo `ai-atlas`.
2. ~~Ngôn ngữ~~ → **tiếng Việt và tiếng Anh**.
3. ~~Tên miền riêng~~ → **có**. Còn cần chọn và mua tên miền cụ thể (xem mục 2), trước mốc M4.
4. ~~Giấy phép~~ → nội dung **CC BY-NC-SA 4.0**, code **MIT** (xem [LICENSE-CONTENT.md](LICENSE-CONTENT.md)).
5. ~~Trang trống cho bài chưa viết~~ → **không tạo**. Lộ trình hiện đủ 78 bài, bài chưa viết có nhãn "Sắp có".

Các quyết định kỹ thuật và cách viết bài khác: [docs/decisions.md](decisions.md).
