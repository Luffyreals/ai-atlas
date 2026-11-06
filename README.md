# AI Atlas

[![CI](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-f38020?logo=cloudflare&logoColor=white)](https://ai-atlas-7nb.pages.dev/)
[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.vi)

**Tiếng Việt** | [English](docs/README.en.md)

> **Tấm bản đồ kiến thức AI:** từ Python cơ bản đến các mô hình ngôn ngữ lớn (LLMs), giải thích từ trực giác đến toán học, hoàn toàn miễn phí và mã nguồn mở.

🌐 **Trải nghiệm trực tuyến:** [https://ai-atlas-7nb.pages.dev/](https://ai-atlas-7nb.pages.dev/)

---

## 🧭 Giới thiệu

**AI Atlas** là website tài liệu & lộ trình học Trí tuệ Nhân tạo **song ngữ Việt – Anh**, được thiết kế để giải quyết bài toán lớn nhất của người tự học AI: *"Nên học gì trước, học gì sau, và vì sao?"*.

### Điểm nổi bật

- 🗺️ **Lộ trình trực quan:** Sơ đồ toàn bộ kiến thức theo quan hệ phụ thuộc (cần biết trước) – bấm vào bất kỳ chủ đề nào để mở bài học tương ứng.
- 💡 **Từ trực giác đến toán:** Đi từ ví dụ thực tế đời thường, giải thích bản chất trước khi dẫn dắt vào công thức toán học từng bước.
- 🎛️ **Minh họa tương tác & Code trên trình duyệt:** Trực quan hóa thuật toán bằng biểu đồ động; chỉnh sửa và chạy code Python trực tiếp trên trình duyệt nhờ Pyodide mà không cần cài đặt.
- 🌐 **Song ngữ & Riêng tư:** Hỗ trợ đầy đủ tiếng Việt và tiếng Anh; không cần tạo tài khoản hay đăng nhập, tiến độ học được lưu trực tiếp trên trình duyệt của bạn.

---

## 📚 Lộ trình nội dung

Website gồm **78 bài học** được sắp xếp bài bản qua 5 phần:

1. **Python cho AI** (7 bài): Cú pháp, cấu trúc dữ liệu, OOP, NumPy, Pandas, Matplotlib.
2. **Toán cho AI** (3 bài): Đại số tuyến tính, Giải tích, Xác suất thống kê.
3. **Machine Learning** (14 bài): Hồi quy, Phân loại, Phân cụm, Gradient Descent, Đánh giá mô hình.
4. **Deep Learning** (8 bài): Neural Networks, Backpropagation, CNN, RNN, LSTM, Transformers.
5. **Chuyên sâu:**
   - **NLP** (13 bài): Tokenizer, Word Embeddings, BERT, GPT, các bài toán ngôn ngữ.
   - **Computer Vision** (10 bài): Phân loại ảnh, Segmentation, CLIP, Sinh ảnh, Diffusion.
   - **LLM & GenAI** (23 bài): Prompt Engineering, RAG, Agents, Fine-tuning, RLHF/DPO, Deployment.

---

## 🛠️ Công nghệ

- **Framework:** [Astro 7](https://astro.build) + [Starlight](https://starlight.astro.build)
- **Nội dung:** [MDX](https://mdxjs.com) + [KaTeX](https://katex.org) (hiển thị công thức toán)
- **Tương tác:** [React](https://react.dev) + [Pyodide](https://pyodide.org) (chạy Python trên WebAssembly)
- **Tìm kiếm:** [Pagefind](https://pagefind.app) (tĩnh, tìm kiếm nhanh không cần server)
- **Hosting & Deploy:** [Cloudflare Pages](https://ai-atlas-7nb.pages.dev/)

---

## 🚀 Chạy thử trên máy (Local Development)

Yêu cầu: **Node.js 24.15.0** (tối thiểu `>=22.23.4`) và npm.

```sh
# 1. Clone repository
git clone https://github.com/Luffyreals/ai-atlas.git
cd ai-atlas

# 2. Cài đặt dependencies
npm install

# 3. Khởi động môi trường dev
npm run dev
```

Mở trình duyệt tại [http://localhost:4321/vi/](http://localhost:4321/vi/).

### Các lệnh chính

| Lệnh | Mô tả |
|---|---|
| `npm run build` | Build bản production ra `dist/` và kiểm tra liên kết nội bộ |
| `npm run preview` | Xem trước bản build tĩnh trên máy |
| `npm test` | Chạy unit tests (Vitest) |
| `npm run test:e2e` | Chạy kiểm thử end-to-end (Playwright) |
| `npm run check` | Kiểm tra kiểu TypeScript (`astro check`) |

---

## 🤝 Đóng góp & Giấy phép

Mọi đóng góp, báo lỗi nội dung hoặc đề xuất cải tiến đều được hoan nghênh qua [Issues](https://github.com/Luffyreals/ai-atlas/issues) và [Pull Requests](https://github.com/Luffyreals/ai-atlas/pulls). Xem hướng dẫn chi tiết tại [CONTRIBUTING.md](.github/CONTRIBUTING.md).

- **Mã nguồn:** Giấy phép [MIT](LICENSE).
- **Nội dung & Hình ảnh:** Giấy phép [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.vi).
