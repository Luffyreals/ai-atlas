# AI Atlas

<!-- The CI badge only renders for viewers with access to the repository while it is private. -->
[![CI](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/Luffyreals/ai-atlas/actions/workflows/ci.yml)

**Tiếng Việt** | [English](docs/README.en.md)

> Tấm bản đồ kiến thức AI: từ Python cơ bản đến các mô hình ngôn ngữ lớn, giải thích dễ hiểu, miễn phí cho tất cả mọi người.

AI Atlas là một website wiki **song ngữ Việt – Anh**. Website tổng hợp kiến thức Trí tuệ nhân tạo và sắp xếp thành **một lộ trình học rõ ràng**: nên học gì trước, học gì sau, và vì sao.

## Vì sao có AI Atlas

Tài liệu AI hiện nay rất nhiều, nhưng người mới thường gặp ba vấn đề:

- **Không biết bắt đầu từ đâu.** Kiến thức nằm rải rác, không có thứ tự.
- **Gặp công thức mà không hiểu vì sao.** Nhiều tài liệu đưa toán ra trước khi người đọc hiểu vấn đề.
- **Thiếu tài liệu tiếng Việt chất lượng.** Phần lớn tài liệu tốt chỉ có tiếng Anh.

AI Atlas giải quyết bằng cách sắp mọi bài vào một lộ trình có quan hệ "cần biết trước", và giải thích mỗi khái niệm **từ trực giác đến toán**.

## Điểm nổi bật

- **Lộ trình trực quan:** sơ đồ toàn bộ kiến thức. Bấm vào chủ đề nào thì mở bài đó.
- **Từ trực giác đến toán:** mỗi bài đi từ ví dụ đời thường, đến công thức từng bước, rồi đến hình minh họa.
- **Minh họa tương tác:** kéo, thả, thay đổi tham số để "thấy" khái niệm hoạt động ra sao.
- **Code chạy ngay trên trình duyệt:** sửa và chạy code Python ví dụ, không cần cài đặt.
- **Song ngữ:** mọi bài đều có bản tiếng Việt và tiếng Anh.
- **Miễn phí, không cần đăng nhập:** tiến độ học được lưu ngay trên trình duyệt của bạn.

## Một bài học gồm những gì

Mọi bài theo cùng một khung, để bạn luôn biết mình đang ở đâu:

1. **Mục tiêu:** học xong bạn làm được gì.
2. **Cần biết trước:** link tới các bài nền tảng.
3. **Trực giác:** hiểu vấn đề bằng ví dụ, chưa dùng công thức.
4. **Lý thuyết:** công thức và giải thích từng bước.
5. **Minh họa:** hình hoặc minh họa tương tác.
6. **Ví dụ code:** chạy thử ngay trên trang.
7. **Lỗi hay gặp:** những hiểu nhầm phổ biến.
8. **Kiểm tra nhanh:** vài câu trắc nghiệm.
9. **Tóm tắt và đọc thêm:** ý chính và tài liệu gốc.

## Nội dung

| Phần | Chủ đề chính | Số bài |
|---|---|---|
| 1. Python | Cú pháp, cấu trúc dữ liệu, OOP, Numpy, Pandas, Matplotlib | 7 |
| 2. Toán cho AI | Đại số tuyến tính, giải tích, xác suất thống kê | 3 |
| 3. Machine Learning | Hồi quy, phân loại, phân cụm, tối ưu, đánh giá mô hình | 14 |
| 4. Deep Learning | Mạng nơ-ron, CNN, RNN, LSTM, Transformers | 8 |
| 5a. NLP | Tokenizer, embeddings, BERT, GPT, các bài toán ngôn ngữ | 13 |
| 5b. Computer Vision | Phân loại ảnh, segmentation, CLIP, sinh ảnh, diffusion | 10 |
| 5c. LLM | Prompt, RAG, Agents, fine-tune, RLHF/DPO, deploy | 23 |

Sau phần 4, bạn có thể chọn đi tiếp nhánh **NLP**, **Computer Vision** hoặc **LLM**.

## Trạng thái

🚧 **Đang xây dựng bản MVP:** bộ khung website và 5 bài đầu của phần Machine Learning, đủ hai ngôn ngữ.

| Mốc | Nội dung | Trạng thái |
|---|---|---|
| M0. Bộ khung | Astro + Starlight, song ngữ vi/en, KaTeX, lộ trình 78 bài, unit test và e2e, deploy lên Cloudflare Pages | Gần xong: còn deploy lên Cloudflare Pages |
| M1. Công cụ trình bày | Danh sách bài cần biết trước, quiz, đánh dấu đã học, chạy Python trên trang, sơ đồ lộ trình | Đang làm: đã có sơ đồ lộ trình và trang chủ thiết kế xong |
| M2. Bài mẫu | Bài Hồi quy tuyến tính, chốt template bài học | Chưa bắt đầu |
| M3. Mạch ML đầu tiên | 4 bài Machine Learning còn lại, đủ vi và en | Chưa bắt đầu |
| M4. Ra mắt | SEO, trang Giới thiệu, kiểm tra trên điện thoại, tên miền riêng | Chưa bắt đầu |

| Tài liệu | Nội dung |
|---|---|
| [docs/mvp.md](docs/mvp.md) | Spec bản MVP: phạm vi, tiêu chí hoàn thành, các mốc |
| [PLAN.md](docs/PLAN.md) | Kế hoạch tổng thể và tiến độ các giai đoạn |
| [CHANGELOG.md](docs/CHANGELOG.md) | Các thay đổi đã thực hiện |
| [docs/](docs/README.md) | Tài liệu cho người viết bài và phát triển |
| [docs/architecture/](docs/architecture/README.md) | Tổng quan kiến trúc kỹ thuật |

## Công nghệ

- [Astro](https://astro.build) + [Starlight](https://starlight.astro.build): framework cho website tài liệu
- [MDX](https://mdxjs.com): định dạng viết bài học
- [React](https://react.dev): các thành phần tương tác
- [KaTeX](https://katex.org): hiển thị công thức toán
- [Pyodide](https://pyodide.org): chạy Python ngay trên trình duyệt
- [Pagefind](https://pagefind.app): tìm kiếm không cần server
- [Cloudflare Pages](https://pages.cloudflare.com): hosting

Website hoàn toàn tĩnh: không có server, không có cơ sở dữ liệu, không cần đăng nhập.

## Chạy trên máy

Bạn cần **Node.js 24.15.0** (ghim trong [.node-version](.node-version), tối thiểu `>=22.23.4`) và npm.

```sh
git clone https://github.com/Luffyreals/ai-atlas.git
cd ai-atlas
npm install                      # cài gói theo phiên bản đã ghim
npx playwright install chromium  # trình duyệt cho e2e, chỉ cần một lần trên máy mới
npm run dev                      # mở http://localhost:4321/vi/
```

Các lệnh khác:

| Lệnh | Việc |
|---|---|
| `npm run build` | Build ra `dist/`, kiểm tra link nội bộ và chuỗi i18n |
| `npm run preview` | Xem bản build trong `dist/` |
| `npm run check` | Kiểm tra kiểu TypeScript (`astro check`) |
| `npm test` | Unit test (Vitest) |
| `npm run test:e2e` | E2E (Playwright), tự build rồi chạy preview |

Danh sách đầy đủ và các lưu ý: [CONTRIBUTING.md](.github/CONTRIBUTING.md#các-lệnh).

## Cấu trúc dự án

```text
ai-atlas/
├─ src/       # mã nguồn website: bài học vi/en, chuỗi giao diện, lộ trình (roadmap.ts), component
├─ public/    # file tĩnh: favicon, _redirects cho Cloudflare Pages
├─ tests/     # unit test (Vitest) và e2e (Playwright)
├─ docs/      # tài liệu cho người viết bài và người phát triển
├─ .github/   # CI, Dependabot, mẫu issue và pull request
├─ .claude/   # sub agent của dự án cho Claude Code
└─ .agents/   # skill thiết kế giao diện (bên thứ ba)
```

File cấu hình nằm ở gốc repo: `astro.config.ts`, `package.json`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.node-version`.

## Đóng góp

Dự án hiện do một người duy trì. Mọi góp ý và báo lỗi đều được hoan nghênh.

- Cài đặt, quy ước commit, quy trình viết bài và định nghĩa hoàn thành: [CONTRIBUTING.md](.github/CONTRIBUTING.md).
- Báo lỗi website, lỗi nội dung bài học hoặc đề xuất bài mới: dùng các mẫu issue có sẵn.
- Lỗi bảo mật: **không** mở issue công khai, xem [SECURITY.md](.github/SECURITY.md).

## Giấy phép

- **Nội dung** (bài học, hình minh họa): [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.vi). Bạn được chia sẻ và chỉnh sửa nếu ghi nguồn, không dùng cho mục đích thương mại, và giữ cùng giấy phép.
- **Code** (mã nguồn website, code ví dụ): [MIT](LICENSE).

Chi tiết phạm vi từng giấy phép: [LICENSE-CONTENT.md](docs/LICENSE-CONTENT.md).
