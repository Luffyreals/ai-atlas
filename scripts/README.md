# Thư mục Scripts (Tiện ích & Dữ liệu hỗ trợ)

Thư mục này chứa các kịch bản phụ trợ dùng để sinh dữ liệu toán học mẫu, tính toán đường đi tối ưu, sinh ảnh mạng xã hội, và quản lý các gói phụ thuộc Python cho từng chuyên đề.

---

## 📜 Danh sách Kịch bản

| Tệp | Ngôn ngữ | Chức năng |
|---|---|---|
| `make-og-images.mjs` | Node.js | Sinh tự động 2 ảnh xem trước OpenGraph mạng xã hội chuẩn 1200×630 (`/public/og/ai-atlas-vi.png` và `ai-atlas-en.png`). Chạy qua lệnh `npm run og:images`. |
| `gradient-descent-fixture.py` | Python | Tính toán và kiểm chứng bề mặt mất mát (loss surface) và đường đi tối ưu cho minh họa `GradientDescentViz`. |
| `sine-lasso-path.py` | Python | Tính toán đường đi hệ số Lasso (Lasso path) chuẩn xác cho minh họa bài Overfitting & Regularization. |

---

## 📦 Các tệp Requirements (Môi trường Python)

Các tệp này ghim chính xác phiên bản các thư viện Python chuyên sâu dùng để chạy thử và kiểm chứng các khối code `LocalCode` (chạy trên máy cá nhân của người học):

- `requirements-nlp.txt`: Môi trường kiểm chứng cho 13 bài Xử lý Ngôn ngữ Tự nhiên (`transformers`, PyTorch CPU, Hugging Face).
- `requirements-cv.txt`: Môi trường kiểm chứng cho 10 bài Thị giác Máy tính (`torchvision`, PIL, `timm`).
- `requirements-llm.txt`: Môi trường kiểm chứng cho các bài Mô hình Ngôn ngữ Lớn (OpenAI API, LangChain, Tiktoken).
- `requirements-llm-llamaindex.txt`: Môi trường kiểm chứng cho các bài toán RAG nâng cao với LlamaIndex.
