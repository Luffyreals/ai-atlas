# AI Atlas: hướng dẫn cho Claude

## Dự án

AI Atlas là website wiki **song ngữ Việt – Anh**, công khai và miễn phí. Website tổng hợp kiến thức AI, từ Python đến LLM, và sắp xếp thành lộ trình học. Trọng tâm là **lý thuyết và giải thích dễ hiểu**.

- Đây là dự án cá nhân, một người phát triển. Repo private: `Luffyreals/ai-atlas`, nhánh `main`.
- Kế hoạch đầy đủ: [PLAN.md](PLAN.md). Đọc file này khi cần biết phạm vi, danh sách bài hoặc giai đoạn hiện tại.
- Spec bản MVP: [docs/mvp.md](docs/mvp.md). Mục tiêu trước mắt: bộ khung + 5 bài ML đầu, chia thành mốc M0–M4.
- Giáo án gốc: `giáo án ai.md`. **Chỉ để tham khảo, không sửa.**
- **Ngoài phạm vi:** notebook thực hành Colab/Kaggle (sẽ là dự án riêng). Không thêm bài tập Colab vào website.

## Giao tiếp

- Trả lời người dùng bằng **tiếng Việt**.
- Commit message, tên biến, tên file, comment trong code TypeScript: **tiếng Anh**.
- **Hỏi lại trước khi quyết.** Khi yêu cầu còn điểm chưa rõ (phạm vi, đặt tên, quy ước, giấy phép, thiết kế…), hỏi người dùng bằng công cụ hỏi có lựa chọn (AskUserQuestion) **trước** khi giao việc cho agent hoặc chốt thiết kế:
  - Gom câu hỏi lại, tối đa 4 câu mỗi lượt. Mỗi câu 2–4 lựa chọn, phương án đề xuất đặt đầu tiên và ghi "(Recommended)".
  - Mục "Câu hỏi cho người dùng" trong báo cáo của sub agent cũng được gom lại và hỏi theo cách này. Không để câu hỏi nằm lẫn trong đoạn văn.
  - Chỉ tự chọn phương án mặc định khi lựa chọn không chặn việc gì và dễ đổi lại về sau. Khi tự chọn thì nói rõ đã chọn gì.
  - Ghi quyết định vào tài liệu liên quan (`docs/mvp.md` mục 7, `docs/architecture/`, `PLAN.md` mục 8).

## Trạng thái hiện tại

Mốc M0 (bộ khung) xong, trừ deploy: Astro + Starlight theo `docs/architecture/scaffold.md`, song ngữ vi/en, KaTeX, `src/data/roadmap.ts` đủ 78 bài (tất cả `planned`), sidebar sinh từ roadmap, 404 song ngữ, Vitest và Playwright, CI GitHub Actions và Dependabot (`.github/`). Còn thiếu: deploy lên Cloudflare Pages (người dùng tự kết nối).

Mốc M1 (công cụ trình bày) xong phần kỹ thuật, theo `docs/architecture/components.md`:

- `Prerequisites`
- `LessonProgress` (lưu localStorage)
- `Quiz` (câu hỏi trong frontmatter, KaTeX render lúc build)
- `PythonRunner` (Pyodide 314.0.7 trong Web Worker, chỉ tải khi bấm Chạy)
- `RoadmapMap` có dấu ✓ và "Đã học x/y"

Trang demo: `/vi/dev/components/` và `/en/dev/components/` (không vào sitemap). Còn chờ: người dùng duyệt giao diện (M1-10) và chạy thử trên bản deploy.

Nhận diện và trang chủ thiết kế bằng skill `design-taste-frontend`: bảng màu "walnut and tan", font Barlow, logo con đường rẽ ba, trang chủ dạng tấm bản đồ atlas. Xem `docs/architecture/homepage.md`.

Mốc M2 (bài mẫu) xong: bài `ml/linear-regression` có bản vi (người dùng đã duyệt, là bài mẫu) và bản en, VIZ `LinearFitViz` (thiết kế ở `docs/architecture/viz.md`), bảng dữ liệu `DatasetTable`, SEO cho trang fallback (`src/lib/seo.ts`, `src/routeData.ts`), nút "Bắt đầu học" ở trang chủ. Template đã chốt theo bài này.

Mốc M3 (đang làm): 4 bài ML còn lại, **chỉ bản vi**, bản en làm sau MVP (`docs/mvp.md` quyết định 43). Đã xong bản vi (người dùng đã duyệt) của `ml/ml-overview` (2 hình SVG tĩnh, `docs/architecture/viz.md` mục 8) `ml/overfitting-underfitting` (VIZ `PolyFitViz`, bộ dữ liệu `sine`, viz.md mục 9) và `ml/regularization` (VIZ `RegularizationViz`, viz.md mục 10; đồ thị tĩnh L1/L2, viz.md mục 11). Ba VIZ dùng chung `src/components/viz/kit/` (`Swatch`) và `src/lib/viz/axis.ts`. Bài kế tiếp: `ml/gradient-descent`.

## Công nghệ

Astro + Starlight (có i18n), MDX, React (Astro islands), KaTeX (remark-math + rehype-katex), Pyodide trong Web Worker, Pagefind, Cloudflare Pages, tên miền riêng.

## Cấu trúc thư mục

```
src/content/docs/vi/<phần>/<bài>.mdx   # Bài tiếng Việt (ngôn ngữ mặc định)
src/content/docs/en/<phần>/<bài>.mdx   # Bài tiếng Anh, CÙNG đường dẫn và tên file
src/content/i18n/                      # Chuỗi giao diện vi/en
src/components/                        # Component tương tác (React/Astro)
src/components/home/                   # Các khối của trang chủ (render qua override Hero của Starlight)
src/components/viz/                    # Minh họa tương tác (VIZ) của từng bài, kit dùng chung, viz.css
src/lib/viz/                           # Toán và thang đo của VIZ (thuần TypeScript, có unit test)
src/components/figures/                # Hình SVG tĩnh (FIG) và kit của chúng, figures.css
src/data/figures/                      # Chữ vi/en của từng hình tĩnh, registry FIGURES
src/code/<phần>/<bài>/<tên>.vi.py      # Code ví dụ của bài, mỗi ô một file .vi.py và .en.py
src/data/datasets/                     # Bảng dữ liệu dùng chung cho bài, VIZ và code
src/routeData.ts                       # Route middleware của Starlight (SEO cho trang fallback)
src/data/roadmap.ts                    # Lộ trình: thứ tự bài, quan hệ "cần biết trước"
src/data/home.ts, home-pictures.ts     # Chữ và ảnh (kèm nguồn) của trang chủ, vi và en
src/styles/custom.css                  # Token màu (--sl-color-*, --atlas-*) và font
docs/lesson-template.mdx               # Template bài học chuẩn
docs/glossary.md                       # Bảng thuật ngữ Việt – Anh
docs/architecture/                     # Tài liệu thiết kế kỹ thuật (architect)
docs/research/                         # Tóm tắt tài liệu tham khảo cho từng bài (summarizer)
docs/progress/                         # Báo cáo tiến độ (summarizer)
tests/unit/  tests/e2e/                # Test (tester)
```

Tên thư mục phần: `python`, `math`, `ml`, `dl`, `nlp`, `cv`, `llm`. Tên file bài: tiếng Anh, kebab-case, ví dụ `linear-regression.mdx`.

## Quy tắc nội dung

- **Mọi bài theo đúng template** trong `docs/lesson-template.mdx` (9 mục: Mục tiêu → Cần biết trước → Trực giác → Lý thuyết → Minh họa → Ví dụ code → Lỗi hay gặp → Kiểm tra nhanh → Tóm tắt và đọc thêm).
- **Viết tiếng Việt trước**, sau đó mới dịch sang tiếng Anh. Hai bản phải giống nhau về cấu trúc, công thức, code và component.
- **Thuật ngữ:** theo `docs/glossary.md`. Lần đầu xuất hiện trong bài, ghi kèm tiếng Anh: "hồi quy tuyến tính (linear regression)". Thuật ngữ mà người Việt quen dùng bằng tiếng Anh (overfitting, gradient, embedding…) thì giữ nguyên, không dịch gượng. Gặp thuật ngữ mới thì thêm vào glossary.
- **Giọng văn:** thân thiện, rõ ràng, xưng "bạn". Câu ngắn. Đi từ ví dụ cụ thể đến khái niệm tổng quát. Giải thích "vì sao", không chỉ "là gì".
- **Toán (KaTeX):** `$...$` cho công thức trong dòng, `$$...$$` cho công thức riêng dòng. Ký hiệu thống nhất toàn site:
  - vô hướng: chữ thường nghiêng $x$; vectơ: chữ thường đậm $\mathbf{x}$; ma trận: chữ hoa đậm $\mathbf{X}$
  - trọng số $\mathbf{w}$, hệ số tự do $b$, tham số chung $\boldsymbol{\theta}$; số mẫu $m$, số đặc trưng $n$
  - giá trị dự đoán $\hat{y}$, hàm mất mát $\mathcal{L}$, tốc độ học $\eta$
  - Mỗi biến đổi toán phải giải thích bằng lời, không nhảy bước.
- **Code ví dụ:** Python, ngắn (khoảng 40 dòng trở xuống), chạy được, đặt `seed` khi có ngẫu nhiên. Phần Python, Toán, ML chỉ dùng thư viện Pyodide hỗ trợ: `numpy`, `pandas`, `matplotlib`, `scipy`, `scikit-learn`. Phần DL, NLP, CV, LLM dùng code minh họa (không chạy trên trang) nếu cần PyTorch hoặc GPU.
- **Chính xác:** trước khi đưa code vào bài, chạy thử bằng `python` và kiểm tra kết quả khớp với lời giải thích. Paper và nguồn tham khảo phải có thật: ghi tên tác giả, năm, link. Không bịa nguồn.
- **Bản quyền:** không chép nguyên văn sách, khóa học hay bài viết khác. Hình minh họa tự vẽ (SVG, component) hoặc dùng nguồn có giấy phép phù hợp và ghi nguồn.

## Quy ước code

- TypeScript cho component và dữ liệu. Component đặt tên PascalCase.
- Mọi chữ hiển thị trên giao diện phải có **cả vi và en**. Không viết cứng chữ trong component.
- Màu sắc dùng biến CSS của Starlight (`--sl-color-*`) để hỗ trợ sáng/tối. Giao diện phải dùng tốt trên điện thoại.
- Component tương tác dùng `client:visible` để chỉ tải khi người đọc cuộn tới.
- Thiết kế giao diện (trang chủ, trang giới thiệu, component): dùng skill `design-taste-frontend`. Bản gốc ở `.agents/skills/design-taste-frontend/`, nối vào `.claude/skills/` bằng junction (không commit, cách tạo lại ghi trong `.gitignore`). Sub agent không gọi được skill thì đọc thẳng `SKILL.md`. Khi skill mâu thuẫn với quy ước ở đây (biến `--sl-color-*`, song ngữ, nhẹ trang), quy ước ở đây được ưu tiên.
- Thêm, đổi tên hoặc xóa bài thì **cập nhật `src/data/roadmap.ts`** và sidebar.

## Sub agent của dự án

Định nghĩa trong `.claude/agents/`:

**Điều phối và kỹ thuật**

| Agent | Dùng khi |
|---|---|
| `team-lead` | Yêu cầu lớn nhiều bước: chia việc, giao agent, đặt tiêu chí hoàn thành, cập nhật tiến độ `PLAN.md` |
| `architect` | Lên kế hoạch và thiết kế bộ khung, quyết định kiến trúc. Viết vào `docs/architecture/` |
| `developer` | Viết hoặc sửa code website: cấu hình, component, tính năng, sửa lỗi |
| `tester` | Viết và chạy test, kiểm tra build, link, song ngữ, giao diện. Chỉ sửa file test |
| `analyst` | Review code, đo chất lượng (hiệu năng, trợ năng, SEO), phân tích nguyên nhân lỗi. Không sửa file |
| `summarizer` | Tóm tắt tiến độ, changelog, hoặc tóm tắt tài liệu tham khảo vào `docs/research/` |

**Nội dung**

| Agent | Dùng khi |
|---|---|
| `lesson-writer` | Soạn bài học tiếng Việt mới, hoặc viết lại một bài |
| `lesson-translator` | Dịch bài từ tiếng Việt sang tiếng Anh, hoặc đồng bộ bản en sau khi bản vi thay đổi |
| `content-reviewer` | Kiểm tra bài: độ chính xác kỹ thuật, toán, chạy thử code, đúng template, khớp vi/en. Chỉ báo lỗi, không sửa |
| `viz-builder` | Xây component minh họa tương tác cho một khái niệm |

**Sub agent không gọi được sub agent khác.** Phiên Claude chính là người điều phối. Với yêu cầu lớn: gọi `team-lead` lấy kế hoạch giao việc, rồi phiên chính gọi lần lượt từng agent theo kế hoạch đó. Các nhiệm vụ không phụ thuộc nhau và không sửa chung file thì gọi song song.

**Quy trình chuẩn:**

- **Tính năng kỹ thuật:** `architect` → `developer` → `tester` → `analyst` → sửa (nếu có lỗi) → commit
- **Bài học:** (`summarizer` tóm tắt tài liệu) → `lesson-writer` → `content-reviewer` → sửa → `viz-builder` (nếu có `VIZ`) → `lesson-translator` → `content-reviewer` (kiểm tra khớp vi/en)
- **Cuối mỗi giai đoạn:** `summarizer` viết báo cáo tiến độ, `team-lead` cập nhật `PLAN.md`

## Git

- Commit message tiếng Anh, câu mệnh lệnh ngắn gọn, ví dụ: `Add linear regression lesson (vi)`.
- Chỉ commit hoặc push khi người dùng yêu cầu.

## Lệnh

Cần Node `>=22.23.4` (máy phát triển và Cloudflare Pages dùng 24.15.0, ghim trong `.node-version`).

| Lệnh | Việc |
|---|---|
| `npm install` | Cài gói (phiên bản đã ghim chính xác) |
| `npx playwright install chromium` | Tải trình duyệt cho e2e, chỉ cần một lần trên máy mới |
| `npm run dev` | Chạy server phát triển tại `http://localhost:4321/vi/` |
| `npm run build` | Build ra `dist/`, kiểm tra link nội bộ và chuỗi i18n. Không được có dòng `[WARN]` |
| `npm run preview` | Xem bản build trong `dist/` |
| `npm run check` | Kiểm tra kiểu TypeScript (`astro check`), phải 0 lỗi 0 cảnh báo |
| `npm test` | Unit test (Vitest) trong `tests/unit/` |
| `npm run test:e2e` | E2E (Playwright): tự build rồi chạy preview ở cổng 4322, project `desktop` và `mobile` (375px), bỏ qua các test `@network` |
| `npm run test:e2e:network` | E2E cần mạng (tag `@network`, chỉ project `desktop`): tải Pyodide thật từ CDN và chạy code mẫu. Không chạy trong `test:e2e` |
