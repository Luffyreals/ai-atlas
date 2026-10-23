# Tổng quan kiến trúc

> Một trang cho người mới vào dự án: website được build và phục vụ thế nào, dữ liệu nằm ở đâu, lỗi bị bắt ở lớp nào.
> Lý do chi tiết của từng quyết định nằm ở bốn tài liệu thiết kế, xem [mục 8](#8-tài-liệu-thiết-kế-chi-tiết).

## 1. Tóm tắt

AI Atlas là website **tĩnh**, build bằng Astro 7 và Starlight.

- Mọi trang được render sẵn thành HTML lúc build. Không có server ứng dụng, không có cơ sở dữ liệu.
- Hai ngôn ngữ: `vi` (mặc định) và `en`. URL dạng `/vi/...` và `/en/...`.
- `src/data/roadmap.ts` là nguồn sự thật duy nhất cho thứ tự bài, tiêu đề, quan hệ "cần biết trước" và sidebar.
- JavaScript trên trình duyệt chỉ dành cho phần tương tác (từ mốc M1: React island, Pyodide).

Công nghệ chính: Astro, Starlight, MDX, React, KaTeX (`remark-math` + `rehype-katex`), `starlight-links-validator`, TypeScript, Vitest, Playwright. Phiên bản được ghim chính xác trong `package.json`.

## 2. Luồng từ mã nguồn đến người đọc

```text
src/data/roadmap.ts ─► src/lib/sidebar.ts ─► astro.config.ts ─┐
src/content/docs/{vi,en}/**/*.mdx   bài học, trang chủ ───────┤
src/content/i18n/{vi,en}.json       chuỗi giao diện ──────────┤
src/pages/404.astro, public/        trang 404, file tĩnh ─────┤
                                                              ▼
                     astro build  (npm run build)
                     ├─ Markdown: unified + remark-math + rehype-katex
                     ├─ Kiểm tra: schema chuỗi i18n, link nội bộ
                     └─ Sinh ra: HTML tĩnh, chỉ mục Pagefind, sitemap
                                                              │
                                                              ▼
                     dist/ ─► Cloudflare Pages ─► trình duyệt
```

**Build.** `npm run build` chạy `astro build` và ghi kết quả vào `dist/`. Starlight tự tạo chỉ mục tìm kiếm Pagefind. `sitemap-index.xml` sinh ra vì `site` đã khai báo trong `astro.config.ts`.

Từ mốc M1, `@astrojs/sitemap` được khai báo tường minh trong `astro.config.ts`, kèm `filter` để bỏ trang nội bộ `/vi/dev/`, `/en/dev/`. Khi đó Starlight không thêm bản sitemap của nó nữa. Chi tiết ở [components.md](components.md) mục 2.10.

**Phục vụ.** Cloudflare Pages phục vụ `dist/` như file tĩnh.

- Mỗi trang là `dist/<đường dẫn>/index.html`. URL luôn có `/` cuối (`trailingSlash: 'always'`).
- Trang gốc `/` chuyển sang `/vi/` bằng hai lớp:
  - `redirects: { '/': '/vi/' }` trong `astro.config.ts` sinh `dist/index.html` dạng meta refresh. Lớp này chạy được trên mọi host tĩnh và khi `npm run preview`.
  - `public/_redirects` có dòng `/  /vi/  302`. Trên Cloudflare Pages, đây là chuyển hướng HTTP thật và được áp dụng trước file tĩnh.
- Đường dẫn không tồn tại trả về `dist/404.html`. Trang này sinh từ `src/pages/404.astro`, có cả tiếng Việt và tiếng Anh. Trang 404 mặc định của Starlight bị tắt (`disable404Route: true`).

**Trình duyệt.** Người đọc nhận HTML tĩnh. Tìm kiếm Pagefind chạy hoàn toàn trong trình duyệt. Starlight lưu chế độ sáng/tối trong `localStorage` và trạng thái sidebar trong `sessionStorage`. Từ mốc M1: tiến độ học lưu trong `localStorage`, Pyodide chỉ tải từ jsDelivr khi người đọc bấm "Chạy".

`site` hiện là giá trị tạm `https://ai-atlas.pages.dev`. Giá trị này dùng cho canonical, `hreflang` và sitemap. Cần sửa thành URL thật sau lần deploy đầu.

## 3. Mô hình nội dung

### 3.1. Trang: `src/content/docs/{vi,en}/`

- `src/content.config.ts` khai báo collection `docs` bằng `docsLoader()` và `docsSchema()` của Starlight.
- Starlight cấu hình `defaultLocale: 'vi'`, hai locale `vi` và `en`, không dùng root locale. Thư mục gốc của `src/content/docs/` chỉ có `vi/` và `en/` (unit test kiểm tra).
- Một bài học có ba cách gọi, luôn khớp nhau:

| Ở đâu | Dạng | Ví dụ |
|---|---|---|
| File | `src/content/docs/<locale>/<phần>/<bài>.mdx` | `src/content/docs/vi/ml/linear-regression.mdx` |
| URL | `/<locale>/<phần>/<bài>/` | `/vi/ml/linear-regression/` |
| Id trong `roadmap.ts` | `<phần>/<bài>` | `ml/linear-regression` |

- Trang không phải bài học: `index.mdx` (trang chủ), `dev/components.mdx` (trang nội bộ để thử hiển thị, có `noindex`, không vào tìm kiếm). `about` dành cho mốc M4.
- Bài đã có bản Việt nhưng chưa dịch: `/en/...` dùng cơ chế fallback của Starlight, hiện nội dung tiếng Việt kèm thông báo chưa dịch.

### 3.2. Chuỗi giao diện: `src/i18n/ui.ts` + `src/content/i18n/`

- `src/i18n/ui.ts` giữ danh sách key theo namespace (`UI_KEYS`). Đây là nguồn sự thật cho tên key.
- Key đầy đủ có dạng `atlas.<namespace>.<key>`, ví dụ `atlas.notFound.title`. Tiền tố `atlas.` tránh trùng key có sẵn của Starlight.
- Bản dịch nằm trong `src/content/i18n/vi.json` và `en.json`.
- Collection `i18n` mở rộng schema của Starlight: mọi key trong `ALL_UI_KEYS` là chuỗi bắt buộc, không rỗng. **Thiếu key ở một file thì build lỗi.**
- Cách dùng trong component Astro: `Astro.locals.t('atlas.notFound.title')`, hoặc lấy cả namespace bằng `getStrings(Astro.locals.t, 'notFound')`. Thêm `{ lng: 'en' }` để lấy ngôn ngữ khác, như trang 404 đang làm.
- Component React không tự dịch. Wrapper Astro lấy chuỗi rồi truyền xuống qua props (từ mốc M1).
- Tiêu đề phần và bài **không** nằm trong file JSON. Chúng là nội dung, nằm trong `roadmap.ts`.

### 3.3. Lộ trình: `src/data/roadmap.ts`

`roadmap.ts` là nguồn sự thật duy nhất cho:

- thứ tự phần và bài (theo vị trí trong mảng, không dùng số `order`);
- tiêu đề vi/en của phần và bài, kèm `shortTitle` khi tiêu đề dài;
- quan hệ "cần biết trước" (`prerequisites`), luôn trỏ tới bài đứng trước;
- trạng thái từng ngôn ngữ: `status: { vi, en }`, mỗi giá trị là `'planned'` hoặc `'published'`.

| File | Vai trò |
|---|---|
| `src/data/roadmap.ts` | Chỉ có kiểu và dữ liệu: `PARTS` (7 phần), `LESSONS` (78 bài) |
| `src/lib/roadmap.ts` | Hàm truy vấn (`getLesson`, `getPrerequisites`, `getLessonUrl`…), `validateRoadmap()`, `findCycle()` |
| `src/lib/sidebar.ts` | `buildSidebar()`: mỗi phần một nhóm, chỉ lấy bài có `status.vi === 'published'`, ẩn phần hoặc mục rỗng |
| `astro.config.ts` | Gọi `buildSidebar()` cho tùy chọn `sidebar` của Starlight |

- Nhãn sidebar lấy tiếng Việt làm mặc định, tiếng Anh nằm trong `translations.en`. Nút Trước/Sau của Starlight đi theo đúng thứ tự lộ trình.
- Ở mốc M0, cả 78 bài đều `planned`, nên sidebar đang rỗng. Đây là hành vi đúng.
- **Ràng buộc:** ba file trên chỉ dùng import tương đối và không import `astro:*`, vì `astro.config.ts` nạp chúng lúc đọc cấu hình.

## 4. Pipeline Markdown

```ts
// astro.config.ts
markdown: {
  // Astro 7 defaults to Sätteri, which does not run remark/rehype plugins.
  processor: unified({
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  }),
},
```

- **Vì sao không dùng mặc định:** từ Astro 7, processor Markdown mặc định là Sätteri (viết bằng Rust). Sätteri **không chạy plugin remark/rehype**. Nếu chỉ thêm `remark-math` và `rehype-katex` theo cách cũ, build vẫn thành công nhưng công thức hiện thô.
- `unified()` lấy từ `@astrojs/markdown-remark`. Đây là cách Astro hướng dẫn chính thức. Các tính năng của Starlight như aside `:::note` vẫn chạy bình thường.
- `remark-math` nhận diện `$...$` và `$$...$$`. `rehype-katex` render thành HTML của KaTeX lúc build, nên trình duyệt không cần chạy KaTeX.
- CSS của KaTeX nạp cho toàn site qua `customCss` (`katex/dist/katex.min.css`). Gói `katex` phải ở 0.16.x để CSS khớp với bản `rehype-katex` dùng khi render. Unit test `deps.test.ts` giữ điều này.
- Lưới an toàn: e2e kiểm tra trang `/vi/dev/components/` có phần tử `.katex` và `.katex-display`.

## 5. Các lớp kiểm tra

| Lớp | Công cụ | Bắt được gì | Lệnh |
|---|---|---|---|
| Kiểu | `astro check` (TypeScript strict) | Lỗi kiểu trong `.ts`, `.tsx`, `.astro`; key i18n không tồn tại | `npm run check` |
| Build | Astro, schema content, `starlight-links-validator` | Thiếu chuỗi i18n; link nội bộ hỏng, link tương đối, bài en link sang `/vi/` | `npm run build` |
| Unit | Vitest, `tests/unit/` | Lộ trình hợp lệ (id, thứ tự, vòng lặp); trạng thái khớp file thật và `title` khớp frontmatter; sidebar; vi/en cùng bộ key và placeholder; phiên bản gói ghim chính xác | `npm test` |
| E2E | Playwright + Chromium, `tests/e2e/` | Chuyển hướng `/`, thuộc tính `lang`, chuyển ngôn ngữ, 404 song ngữ, KaTeX, không cuộn ngang ở 375px, chế độ tối | `npm run test:e2e` |

- E2E chạy trên **bản build**: Playwright tự chạy `npm run build` rồi `npm run preview` ở cổng 4322 (không dùng 4321, cổng của `npm run dev`, xem [scaffold.md](scaffold.md) mục 4.10). Có hai project: `desktop` và `mobile` (viewport 375px).
- Từ mốc M1, test tải Pyodide thật gắn tag `@network`:
  - `npm run test:e2e` bỏ qua các test này (`--grep-invert @network`). CI cũng vậy.
  - `npm run test:e2e:network` chỉ chạy các test này, trên project `desktop`, khi cần kiểm tra bằng tay.
  - Test "mở trang không tải Pyodide" không cần mạng nên vẫn chạy trong CI. Xem [components.md](components.md) mục 2.11.
- CI trên GitHub Actions ([.github/workflows/ci.yml](../../.github/workflows/ci.yml)) chạy các lệnh trên khi push lên `main` và khi mở pull request, trừ khi thay đổi chỉ nằm ở tài liệu (file `.md` ở gốc repo, `docs/`). Build có dòng `[WARN]`, hoặc `astro check` có cảnh báo, thì CI báo lỗi.
- Dependabot ([.github/dependabot.yml](../../.github/dependabot.yml)) đề xuất nâng cấp gói. Cấu hình giữ `katex` ở 0.16.x, `typescript` dưới 7 và `@types/node` cùng major với `.node-version`. Bản major mới của `rehype-katex` không được tự đề xuất: bạn nâng nó cùng `katex` bằng tay.

## 6. Triển khai

Cloudflare Pages kết nối thẳng với repo GitHub:

| Mục | Giá trị |
|---|---|
| Nhánh production | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | để trống (gốc repo) |
| Node | `24.15.0`, đọc từ `.node-version`, thêm biến `NODE_VERSION` cho chắc |

- **Phải ghim Node.** Build image của Cloudflare mặc định dùng Node 22.16.0, thấp hơn mức Astro 7 yêu cầu (`>=22.23.4`).
- Push lên `main` thì deploy bản chính thức. Nhánh khác có URL xem trước riêng.
- Trạng thái: chưa kết nối. Người duy trì tự làm vì cần đăng nhập tài khoản Cloudflare. Hướng dẫn từng bước: [scaffold.md mục 4.11](scaffold.md).

## 7. Mở rộng hệ thống

| Việc | Cần làm |
|---|---|
| Thêm bài | Tạo file MDX ở `vi/` (rồi `en/`), đổi `status` trong `roadmap.ts`. Sidebar tự cập nhật |
| Thêm chuỗi giao diện | Thêm key vào `UI_KEYS` trong `src/i18n/ui.ts`, rồi thêm bản dịch vào `vi.json` và `en.json` |
| Thêm component | Đặt trong `src/components/`, tên PascalCase. Island React nằm trong thư mục con kebab-case, có wrapper `.astro` |
| Thêm gói npm | `npm install -E <gói>@<phiên bản>` để ghim chính xác |

Quy trình đầy đủ cho người đóng góp: [CONTRIBUTING.md](../../CONTRIBUTING.md).

## 8. Tài liệu thiết kế chi tiết

| Tài liệu | Nội dung |
|---|---|
| [scaffold.md](scaffold.md) | Mốc M0: lý do chọn `unified()`, định tuyến song ngữ, sidebar, trang 404, kiểm tra link, cấu hình từng file, Cloudflare Pages, danh sách phụ thuộc |
| [roadmap-data.md](roadmap-data.md) | Schema của `roadmap.ts`, ý nghĩa trạng thái, quy tắc "cần biết trước", hàm tiện ích, bảng slug của 78 bài, test bắt buộc |
| [components.md](components.md) | Mốc M1: `Prerequisites`, `Quiz`, `LessonProgress`, `PythonRunner` và tiến độ trên `RoadmapMap`. Quiz trong frontmatter, Pyodide (hàng đợi, Dừng, giới hạn output), lưu tiến độ, hình thức và tương phản, bảng chuỗi i18n, sitemap, thứ tự task M1 |
| [homepage.md](homepage.md) | Nhận diện (màu, font, logo) và cấu trúc trang chủ |
