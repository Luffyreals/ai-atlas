# Đóng góp cho AI Atlas

Cảm ơn bạn đã quan tâm tới AI Atlas. Tài liệu này giúp bạn cài đặt dự án, viết bài hoặc sửa code, và biết khi nào một thay đổi được coi là xong.

**Ai nên đọc:** hiện dự án do một người duy trì ([@Luffyreals](https://github.com/Luffyreals)) và repo đang để private. Tài liệu này viết cho người duy trì, cho các agent Claude trong `.claude/agents/`, và cho người đóng góp sau này khi repo mở rộng.

Quy tắc nội dung và quy ước code đầy đủ nằm ở [CLAUDE.md](../.claude/CLAUDE.md) và thư mục [docs/](../docs/README.md). Tài liệu này chỉ nhắc phần cốt lõi rồi trỏ tới đó. Khi có mâu thuẫn, hai nơi đó được ưu tiên.

## Mục lục

1. [Trước khi bắt đầu](#trước-khi-bắt-đầu)
2. [Yêu cầu](#yêu-cầu)
3. [Cài đặt](#cài-đặt)
4. [Các lệnh](#các-lệnh)
5. [Nhánh, commit và pull request](#nhánh-commit-và-pull-request)
6. [Hai quy trình chuẩn](#hai-quy-trình-chuẩn)
7. [Quy tắc viết bài](#quy-tắc-viết-bài)
8. [Quy tắc code](#quy-tắc-code)
9. [Định nghĩa hoàn thành](#định-nghĩa-hoàn-thành)
10. [Giấy phép](#giấy-phép)

## Trước khi bắt đầu

- **Thay đổi nhỏ** (lỗi chính tả, link hỏng, sửa một câu): bạn mở pull request luôn.
- **Thay đổi lớn** (bài mới, component mới, đổi cấu trúc): bạn mở issue trước để thống nhất hướng làm.
- Repo có sẵn ba mẫu issue: **báo lỗi website**, **báo lỗi nội dung bài học**, **đề xuất bài học hoặc cải thiện**. Lỗi bảo mật thì **không** mở issue, xem [SECURITY.md](SECURITY.md).
- Kế hoạch và phạm vi hiện tại: [PLAN.md](../docs/PLAN.md) và [docs/mvp.md](../docs/mvp.md). Notebook thực hành Colab/Kaggle nằm **ngoài phạm vi** website.

## Yêu cầu

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| Node.js | **24.15.0** (ghim trong [.node-version](../.node-version)) | Tối thiểu `>=22.23.4` (trường `engines` trong `package.json`). Cloudflare Pages cũng dùng 24.15.0. Trình quản lý phiên bản như `fnm` đọc thẳng `.node-version` |
| npm | Đi kèm Node | Dự án dùng `package-lock.json`, không dùng yarn hay pnpm |
| Git | Bản mới bất kỳ | |
| Chromium cho Playwright | Theo `@playwright/test` | Cài một lần trên máy mới: `npx playwright install chromium` |
| Python | Nên dùng 3.14 | Chỉ cần khi viết bài: chạy thử code ví dụ trước khi đưa vào bài. Pyodide mà trang dùng (từ mốc M1) cũng chạy Python 3.14 |

Để chạy thử code ví dụ của phần Python, Toán và ML, bạn cần các thư viện mà Pyodide hỗ trợ: `numpy`, `pandas`, `matplotlib`, `scipy`, `scikit-learn`.

## Cài đặt

```sh
git clone https://github.com/Luffyreals/ai-atlas.git
cd ai-atlas
node -v                          # phải là 24.15.0 (hoặc >=22.23.4)
npm install                      # cài gói theo phiên bản đã ghim
npx playwright install chromium  # chỉ cần một lần trên máy mới
npm run dev                      # mở http://localhost:4321/vi/
```

Muốn cài đúng từng gói theo `package-lock.json` (giống môi trường build), bạn dùng `npm ci` thay cho `npm install`.

## Các lệnh

Mọi lệnh chạy ở thư mục gốc repo. Bảng này khớp với `scripts` trong `package.json` và mục "Lệnh" trong [CLAUDE.md](../.claude/CLAUDE.md).

| Lệnh | Việc |
|---|---|
| `npm install` | Cài gói (phiên bản đã ghim chính xác) |
| `npx playwright install chromium` | Tải trình duyệt cho e2e, chỉ cần một lần trên máy mới |
| `npm run dev` | Chạy server phát triển tại `http://localhost:4321/vi/` |
| `npm run build` | Build ra `dist/`, kiểm tra link nội bộ và chuỗi i18n. Không được có dòng `[WARN]` |
| `npm run preview` | Xem bản build trong `dist/` |
| `npm run check` | Kiểm tra kiểu TypeScript (`astro check`), phải 0 lỗi 0 cảnh báo |
| `npm test` | Unit test (Vitest) trong `tests/unit/` |
| `npm run test:watch` | Unit test ở chế độ theo dõi: tự chạy lại khi bạn lưu file |
| `npm run test:e2e` | E2E (Playwright): tự build rồi chạy preview, project `desktop` và `mobile` (375px) |
| `npm run astro -- <lệnh>` | Gọi Astro CLI, ví dụ `npm run astro -- info` |

Vài điều nên biết:

- **Tắt `npm run dev` trước khi chạy `npm run test:e2e`.** Khi không chạy trong CI, Playwright dùng lại server đang mở ở cổng 4321. Nếu đó là server dev, bạn sẽ test bản dev thay vì bản build.
- **URL luôn có dấu `/` cuối**, ví dụ `/vi/ml/linear-regression/`. Site dùng `trailingSlash: 'always'`, nên `npm run preview` trả 404 cho URL thiếu `/`.
- **Thêm gói mới luôn dùng cờ `-E`** (ghim chính xác), ví dụ `npm install -E <gói>@<phiên bản>`. Unit test `deps.test.ts` báo lỗi nếu có `^` hoặc `~`. Gói `katex` phải ở 0.16.x để khớp `rehype-katex`.

## Nhánh, commit và pull request

### Nhánh

- `main` là nhánh chính và luôn phải build được. Khi đã kết nối Cloudflare Pages, mỗi lần push lên `main` sẽ deploy bản chính thức. Nhánh khác có URL xem trước riêng.
- Người duy trì có thể commit thẳng lên `main` với thay đổi nhỏ. Thay đổi lớn và mọi đóng góp từ người khác đi qua nhánh riêng và pull request.
- Tên nhánh: tiếng Anh, kebab-case, có tiền tố theo loại việc.

| Tiền tố | Dùng cho | Ví dụ |
|---|---|---|
| `lesson/` | Bài học mới hoặc viết lại bài | `lesson/ml-linear-regression` |
| `feat/` | Tính năng, component | `feat/python-runner` |
| `fix/` | Sửa lỗi | `fix/sidebar-llm-sections` |
| `docs/` | Tài liệu trong repo | `docs/contributing` |

### Commit

- Viết **tiếng Anh**, câu mệnh lệnh, ngắn gọn. Viết hoa chữ đầu, không có dấu chấm cuối, dòng đầu khoảng 72 ký tự trở xuống.
- Với bài học, ghi ngôn ngữ trong ngoặc ở cuối.
- Mỗi commit là một thay đổi trọn vẹn. Cần giải thích "vì sao" thì viết thêm ở thân commit.

```text
Add linear regression lesson (vi)
Add linear regression lesson (vi, en)
Fix sidebar label for LLM sections
Update glossary with regularization terms
```

Agent Claude chỉ commit hoặc push khi người duy trì yêu cầu.

### Pull request

- Repo có sẵn [mẫu pull request](pull_request_template.md). Bạn điền đủ phần tóm tắt, loại thay đổi và danh sách kiểm tra.
- Mỗi PR nên làm một việc. Ví dụ bản tiếng Việt và bản tiếng Anh của một bài có thể đi chung một PR, nhưng hai bài khác nhau thì tách ra.
- Ghi số issue liên quan, ví dụ `Closes #12`.
- CI trên GitHub Actions ([.github/workflows/ci.yml](workflows/ci.yml)) chạy `check`, `test`, `build` (có `[WARN]` là lỗi) rồi e2e cho mỗi PR. PR chỉ sửa tài liệu (file `.md` ở gốc repo, `docs/`) thì CI không chạy, nên bạn tự kiểm tra link.

## Hai quy trình chuẩn

Dự án dùng các sub agent trong `.claude/agents/`. Mỗi bước ứng với một agent. Nếu bạn làm bằng tay, hãy đi đúng các bước đó theo thứ tự. Mô tả vai trò từng agent ở mục "Sub agent của dự án" trong [CLAUDE.md](../.claude/CLAUDE.md).

**Tính năng kỹ thuật**

```text
architect → developer → tester → analyst → sửa (nếu có lỗi) → commit
```

**Bài học**

```text
(summarizer) → lesson-writer → content-reviewer → sửa → viz-builder (nếu có VIZ) → lesson-translator → content-reviewer
```

Việc của từng bước, kể cả lúc đổi trạng thái bài trong `src/data/roadmap.ts`: [docs/README.md](../docs/README.md#quy-trình-thêm-một-bài-học).

## Quy tắc viết bài

Phần này chỉ giữ các quy tắc hay bị quên. Quy tắc đầy đủ (giọng văn, thuật ngữ, ký hiệu toán, code ví dụ, nguồn và bản quyền) ở mục "Quy tắc nội dung" trong [CLAUDE.md](../.claude/CLAUDE.md).

- **Khung bài:** mọi bài theo [docs/lesson-template.mdx](../docs/lesson-template.mdx), đủ 9 mục. Template sẽ cập nhật ở mốc M1 ([components.md mục 4.7](../docs/architecture/components.md)) và chốt ở mốc M2.
- **Vị trí file:** bản Việt ở `src/content/docs/vi/<phần>/<bài>.mdx`, bản Anh ở `src/content/docs/en/<phần>/<bài>.mdx`, **cùng đường dẫn và tên file**. Tên file tiếng Anh, kebab-case. Trường `title` trong frontmatter phải trùng tiêu đề của bài trong `src/data/roadmap.ts` (unit test kiểm tra).
- **Viết tiếng Việt trước**, rồi mới dịch sang tiếng Anh. Hai bản giống nhau về cấu trúc, công thức, code và component. Thuật ngữ theo [docs/glossary.md](../docs/glossary.md).
- **Link nội bộ tuyệt đối**, có `/` cuối: `/vi/ml/linear-regression/`, bản tiếng Anh dùng `/en/...`. Build lỗi nếu link hỏng, link tương đối, hoặc bài tiếng Anh link sang `/vi/...`.
- **Chính xác:** chạy thử mọi code ví dụ bằng `python` trước khi đưa vào bài. Nguồn tham khảo phải có thật (tác giả, năm, link).
- **Quiz và code chạy trên trang** (từ mốc M1): cách viết ở [components.md mục 2.2 và 2.3](../docs/architecture/components.md). Phần này sẽ được tóm tắt ở đây khi M1 xong.

**Lộ trình: `src/data/roadmap.ts`**

- Thêm, đổi tên hoặc xóa bài thì cập nhật `roadmap.ts`. Sidebar tự sinh từ file này.
- Tạo file bản Việt thì đổi `status.vi` thành `'published'` **trong cùng thay đổi**. Tạo file bản Anh thì đổi `status.en` thành `'published'`.
- Bài `'planned'` **không được có file**. Bản en không được `'published'` khi bản vi còn `'planned'`. Unit test bắt cả hai trường hợp.
- Thiết kế dữ liệu: [docs/architecture/roadmap-data.md](../docs/architecture/roadmap-data.md).

## Quy tắc code

Tóm tắt từ mục "Quy ước code" trong [CLAUDE.md](../.claude/CLAUDE.md). Tổng quan kỹ thuật: [docs/architecture/README.md](../docs/architecture/README.md).

- TypeScript cho component và dữ liệu. Tên component dạng PascalCase. Tên biến, tên file, comment trong code viết tiếng Anh.
- **Không viết cứng chữ hiển thị trong component.** Thêm key vào `src/i18n/ui.ts`, rồi thêm bản dịch vào cả `src/content/i18n/vi.json` và `en.json`. Thiếu key ở một trong hai file thì build lỗi.
- Màu dùng biến CSS `--sl-color-*` của Starlight để hỗ trợ sáng và tối. Giao diện phải dùng tốt ở màn hình 375px.
- Component tương tác chỉ tải khi người đọc cuộn tới (`client:visible`). Từ mốc M1, wrapper Astro tự gắn chỉ thị này, nên trong bài MDX bạn không viết `client:*`.
- `src/data/roadmap.ts`, `src/lib/roadmap.ts`, `src/lib/sidebar.ts` chỉ dùng import tương đối và không import `astro:*`, vì `astro.config.ts` nạp chúng.
- Thiết kế giao diện dùng skill `design-taste-frontend`. Khi skill mâu thuẫn với quy ước ở trên, quy ước của dự án được ưu tiên.

## Định nghĩa hoàn thành

Một thay đổi chỉ được coi là xong khi đạt mọi mục áp dụng được dưới đây.

**Mọi thay đổi**

- [ ] `npm run build` thành công, không có dòng `[WARN]`.
- [ ] `npm run check`: 0 lỗi, 0 cảnh báo.
- [ ] `npm test` qua hết.
- [ ] `npm run test:e2e` qua trên cả `desktop` và `mobile`.
- [ ] Không có chữ giao diện viết cứng. Mọi chuỗi mới có đủ bản vi và en.
- [ ] Thay đổi đáng chú ý đã ghi vào [CHANGELOG.md](../docs/CHANGELOG.md), mục "Chưa phát hành".

**Thêm bài học**

- [ ] Bài theo đủ 9 mục của template.
- [ ] `content-reviewer` không còn lỗi "Nghiêm trọng" hay "Nên sửa".
- [ ] Mọi code ví dụ đã chạy thật, kết quả khớp lời giải thích.
- [ ] Bản en khớp bản vi: cùng heading, công thức, khối code, component.
- [ ] `src/data/roadmap.ts` đã đổi trạng thái đúng ngôn ngữ.
- [ ] Thuật ngữ mới đã thêm vào [docs/glossary.md](../docs/glossary.md).
- [ ] Nguồn tham khảo có thật, link mở được.

## Giấy phép

AI Atlas dùng hai giấy phép:

- **Nội dung** (bài học trong `src/content/docs/`, hình minh họa trong `public/`): [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.vi).
- **Code** (mã nguồn website, component, code ví dụ trong `src/code/`): [MIT](../LICENSE).

Khi gửi đóng góp, bạn đồng ý để phần đóng góp được phát hành theo giấy phép tương ứng ở trên. Phạm vi chi tiết và các phần không thuộc hai giấy phép: [LICENSE-CONTENT.md](../docs/LICENSE-CONTENT.md).
