# Kế hoạch dự án: AI Atlas

> **AI Atlas**: tấm bản đồ kiến thức AI, song ngữ Việt – Anh.

## 1. Mục tiêu

Xây dựng **một website công khai, miễn phí**. Website tổng hợp toàn bộ kiến thức AI từ cơ bản đến nâng cao và sắp xếp thành **lộ trình học** rõ ràng. Trọng tâm là **lý thuyết và giải thích dễ hiểu**, để ai cũng có thể tự học.

- **Người phát triển:** một người (dự án cá nhân).
- **Người dùng:** bất kỳ ai muốn học AI.
- **Mã nguồn:** repo **private** trên GitHub, đặt tại thư mục này.
- **Website:** **public**, ai cũng truy cập được, chạy trên **tên miền riêng**.
- **Ngôn ngữ:** **tiếng Việt và tiếng Anh**. Viết bản tiếng Việt trước, sau đó dịch sang tiếng Anh.
- **Nguồn nội dung:** các phần kiến thức trong [giáo án ai.md](giáo%20án%20ai.md). Bỏ các buổi không phải kiến thức như khai giảng, viết CV, phỏng vấn thử, seminar.

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
Road Map/
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
├─ giáo án ai.md             # Giáo án gốc để tham khảo
├─ README.md / README.en.md  # Giới thiệu dự án
└─ PLAN.md                   # File kế hoạch này
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

### Giai đoạn 0: Khởi tạo dự án
- [x] Đặt tên dự án: **AI Atlas**
- [x] Viết README (Việt + Anh)
- [x] `git init`, tạo repo **private** trên GitHub (`ai-atlas`)
- [ ] Khởi tạo Astro + Starlight, cấu hình 2 ngôn ngữ (vi mặc định, en)
- [ ] Kết nối Cloudflare Pages, tự deploy khi push
- [ ] Mua tên miền và gắn vào Cloudflare Pages

**Kết quả:** một website trống đã chạy online.

### Giai đoạn 1: Xây nền tảng
- [ ] Cài KaTeX, tùy chỉnh giao diện
- [ ] `PythonRunner` (Pyodide)
- [ ] `Quiz`, `Prerequisites`
- [ ] Lưu tiến độ (`LessonProgress`)
- [ ] `RoadmapMap` cho trang chủ, đọc từ `roadmap.ts`
- [ ] Tạo khung sidebar và trang trống cho toàn bộ 78 bài

**Kết quả:** website có đủ khung lộ trình và đủ công cụ trình bày.

### Giai đoạn 2: Bài mẫu
- [ ] Viết hoàn chỉnh **1 bài mẫu: Hồi quy tuyến tính**. Bài có đủ trực giác, toán từng bước, minh họa tương tác, code ví dụ và quiz.
- [ ] Bạn duyệt, chỉnh template cho đến khi ưng ý

**Kết quả:** bài chuẩn dùng làm mẫu cho mọi bài sau.

### Giai đoạn 3: Viết nội dung theo thứ tự lộ trình
- [ ] Python (7 bài)
- [ ] Toán (3 bài)
- [ ] Machine Learning (14 bài)
- [ ] Deep Learning (8 bài)
- [ ] NLP, CV, LLM (46 bài)

Mỗi phần viết xong bản tiếng Việt thì deploy luôn, rồi dịch sang tiếng Anh. Website dùng được ngay, không cần đợi xong hết.

### Giai đoạn 4: Hoàn thiện
- [ ] SEO: tiêu đề, mô tả, ảnh chia sẻ, sitemap
- [ ] Kiểm tra giao diện trên điện thoại và tốc độ tải
- [ ] Thống kê lượt truy cập (Cloudflare Web Analytics)

---

## 8. Việc cần quyết định

1. ~~Tên dự án~~ → **AI Atlas**, repo `ai-atlas`.
2. ~~Ngôn ngữ~~ → **tiếng Việt và tiếng Anh**.
3. ~~Tên miền riêng~~ → **có**. Còn cần chọn và mua tên miền cụ thể (xem mục 2).
