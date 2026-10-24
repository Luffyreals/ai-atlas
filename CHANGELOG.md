# Changelog

Mọi thay đổi đáng chú ý của AI Atlas được ghi ở đây. Mỗi mục nhóm theo: **Thêm mới / Thay đổi / Sửa lỗi**. Mục mới nhất ở trên cùng.

## [Chưa phát hành]

### Thêm mới

- Phần LLM, Phần 5c, bản tiếng Việt, nhánh `llm-lessons` (quyết định 53, 54, 59–61 trong [docs/mvp.md](docs/mvp.md), [báo cáo](docs/progress/2026-10-24-llm.md), [thiết kế](docs/architecture/llm-lessons.md)). Chưa commit, bản en làm sau:
  - 23 bài trong `src/content/docs/vi/llm/`, 49 file code minh họa `.vi.py` và 49 `.en.py` trong `src/code/llm/`. Mức kiểm chứng theo từng file `.vi.py`: 35 chạy thật, 14 chạy khô (file gọi API; chưa có `.env.llm` nên chưa có "Kết quả mẫu").
  - `LocalCode`: hiển thị code chạy trên máy người đọc, kèm nhãn và dòng yêu cầu.
  - VIZ `SamplingViz` (temperature, top-k, top-p) cho bài `text-api` và `build-first-llm`.
  - 9 hình SVG tĩnh (pipeline RAG, vòng lặp agent, ba bước RLHF, LoRA, MoE, encoder–decoder, multimodal, các kiểu song song, image và container) và phần mở rộng kit hình (`src/lib/figures/layout.ts`, `FigMath`, `FigNode`, `FigArrow`, `FigText`).
  - Khoảng 280 thuật ngữ mới trong `docs/glossary.md`.
  - `scripts/requirements-llm.txt`, `scripts/requirements-llm-llamaindex.txt` cho môi trường kiểm chứng.
  - Test mới: `SamplingViz`, kit hình, kiểm cặp code LLM; e2e thêm `lessons-meta.spec.ts`, `viz-meta.spec.ts`.
- Spec bản MVP: [docs/mvp.md](docs/mvp.md).
- README tiếng Anh: [README.en.md](README.en.md).
- Mục lục tài liệu: [docs/README.md](docs/README.md), quy ước cho `docs/research/` và `docs/progress/`.
- Template bài học, bảng thuật ngữ Việt – Anh, định nghĩa sub agent trong `.claude/agents/`.
- Thiết kế kỹ thuật: [bộ khung](docs/architecture/scaffold.md), [dữ liệu lộ trình](docs/architecture/roadmap-data.md), [component](docs/architecture/components.md).
- Giấy phép: nội dung CC BY-NC-SA 4.0, code MIT ([LICENSE](LICENSE), [LICENSE-CONTENT.md](LICENSE-CONTENT.md)).
- Skill thiết kế giao diện `design-taste-frontend` (`.agents/skills/`).
- Bộ khung website (mốc M0): Astro 7 + Starlight 0.42, song ngữ vi/en, KaTeX, lộ trình 78 bài trong `src/data/roadmap.ts`, sidebar sinh từ lộ trình, trang 404 song ngữ, kiểm tra link lúc build, Vitest và Playwright.
- CI GitHub Actions (type check, unit test, build không cảnh báo, e2e) và Dependabot ([.github/](.github/)).
- Tài liệu đóng góp: [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), mẫu issue và PR, [tổng quan kiến trúc](docs/architecture/README.md).
- Nhận diện: bảng màu "walnut and tan", font Barlow và Barlow Condensed (tự host), logo con đường rẽ ba, favicon.
- Trang chủ thiết kế lại dạng tấm bản đồ atlas ([homepage.md](docs/architecture/homepage.md)): hero với bản đồ cổ chuyển cảnh, hàng 7 phần kèm ảnh lịch sử, bản đồ 78 bài có chọn điểm đến, một bài học mẫu bằng các mảnh giấy, thuật ngữ hai đầu, thư ngỏ, footer bưu thiếp. 13 ảnh lịch sử có giấy phép mở (11 phạm vi công cộng, 2 CC BY-NC-SA 3.0), có ghi nguồn song ngữ.
- `RoadmapMap` (làm sớm từ M1, chưa có đánh dấu tiến độ), `src/lib/route.ts`, `src/lib/inline-markup.ts`, `src/i18n/format.ts`.
- Mốc M1, component dùng chung cho bài học ([báo cáo](docs/progress/2026-10-23.md)):
  - `Prerequisites`, `LessonProgress` (lưu tiến độ trong localStorage), dấu ✓ và "Đã học x/y" trên `RoadmapMap`.
  - `Quiz`: câu hỏi đặt trong frontmatter, kiểm tra bằng zod, KaTeX render lúc build.
  - `PythonRunner`: chạy Python trong trình duyệt (Pyodide 314.0.7, Web Worker), có hàng đợi, nút Dừng, giới hạn output, trả hình vẽ matplotlib.
  - Trang demo `/dev/components/`, 5 file code mẫu vi/en trong `src/code/dev/`.
  - Sitemap (`@astrojs/sitemap`, lọc `/dev/`), 59 key i18n mới.
  - Test: unit 88 lên 244 (Vitest + jsdom), e2e 47 lên 111, thêm e2e `@network` (`npm run test:e2e:network`).
- Mốc M2, bài mẫu ([báo cáo](docs/progress/2026-10-23-m2.md)):
  - Bài Hồi quy tuyến tính, bản vi và en (`ml/linear-regression`), 3 ô code, 4 câu quiz.
  - VIZ `LinearFitViz` (hai thanh trượt $w$, $b$, phần dư, MSE, "Hiện đường tốt nhất"), kit VIZ dùng chung, [viz.md](docs/architecture/viz.md).
  - `DatasetTable` và bảng căn hộ `src/data/datasets/apartments.ts` dùng chung cho bài, VIZ và code.
  - Tên truy cập cho công thức riêng dòng (`rehype-katex-a11y`).
  - SEO cho trang fallback: `noindex`, ra khỏi sitemap, bỏ `hreflang` tới bản chưa có, ra khỏi tìm kiếm Pagefind.
  - Nút "Bắt đầu học" ở hero trang chủ, link trong thư ngỏ.
- Mốc M3 (đang làm), bản tiếng Việt; bản en làm sau MVP (quyết định 43 trong [docs/mvp.md](docs/mvp.md)):
  - Bài Tổng quan về Học máy (`ml/ml-overview`): ba nhóm học máy, quy trình học có giám sát, tách train/test, 2 hình SVG tĩnh.
  - Bài Overfitting và Underfitting (`ml/overfitting-underfitting`): hồi quy đa thức, sai số train/test theo bậc, bias–variance, kiểm định chéo. VIZ `PolyFitViz`.
  - Bài Ridge, Lasso, Elastic Net (`ml/regularization`): hàm mục tiêu, nghiệm Ridge, vì sao L1 cho hệ số bằng 0, chọn λ. VIZ `RegularizationViz` và đồ thị tĩnh L1/L2.
  - Kit hình SVG tĩnh `src/components/figures/`, vẽ được cả sơ đồ khối lẫn đồ thị tĩnh (`docs/architecture/viz.md` mục 8, 11).
  - Bộ dữ liệu `sine` (16 train, 8 test) dùng chung cho hai bài; đường đi Lasso tính sẵn bằng `scripts/sine-lasso-path.py`.
  - Kit VIZ dùng chung: `Swatch`, `axisText()`, `PlotCurve`, `AtPoint`.
  - Nút "Bắt đầu học" và thư ngỏ dẫn tới bài đầu tiên đã có ở từng ngôn ngữ.

### Sửa lỗi

- Trang chủ, sau review độc lập (code, thiết kế, nội dung):
  - **Hiệu năng:** Lighthouse mobile từ 76 lên 91. Ảnh hero phụ không còn tải cùng ảnh LCP.
  - **Trợ năng:** viền focus đổi màu theo từng nền.
  - **Bố cục:** mảnh giấy bài học không còn cắt chữ ở màn laptop; không tràn ngang ở 375px.
  - **Chức năng:** kéo hàng lộ trình bắt đầu trên ảnh; route finder đúng sau khi Back.
  - **Song ngữ và nội dung:** nguồn ảnh song ngữ; sửa giấy phép hai ảnh David Rumsey thành CC BY-NC-SA 3.0; câu chữ khớp hiện trạng; câu kết quả tiếng Anh không sai số nhiều.
  - **SEO:** tiêu đề trang riêng cho vi/en.
- M1, sau review của analyst:
  - radio đáp án chỉ có công thức giờ có tên truy cập (`aria-label` sinh từ TeX); Lighthouse Accessibility trang demo từ 95 lên 100.
  - bỏ điểm dừng Tab thừa (`overflow-y: hidden`); sửa lỗi Tab khi radio có focus trước lúc hydrate.
  - CSS component gộp vào `customCss`, không còn chặn render.
  - lỗi Python được đọc lên bằng dòng sr-only.
  - JSON nhúng được escape `<` (`toScriptJson`).
  - dấu ngã ba trang chủ không còn bị thu từ 96px còn 19px sau khi gộp CSS.
- `formatString` không còn lấy nhầm thuộc tính của `Object.prototype` (ví dụ `{{constructor}}`).

### Thay đổi

- CI e2e (phần LLM): job `verify` build một lần và tải `dist/` lên artifact; e2e chạy 2 shard (`E2E (Playwright, shard 1/2)` và `2/2`) với `E2E_PREBUILT=1`, artifact lỗi `playwright-report-1`, `-2`. Test chỉ đọc DOM chuyển sang `*-meta.spec.ts` và chỉ chạy ở project `desktop`. Nếu có branch protection, phải đổi tên check bắt buộc.
- `docs/lesson-template.mdx`: cập nhật cách dùng `Quiz` và `PythonRunner`.
- Cổng e2e đổi sang 4322 (Astro 7 chỉ cho một `astro preview` mỗi project).
- Đã biết: stdout của `PythonRunner` dùng `write` thay `batched` (lệch spec), vì `batched` làm mất chữ in cuối khi không có `
`.
- README tiếng Việt: thêm phần "Vì sao có AI Atlas", cấu trúc một bài học, trạng thái MVP.
- Gốc repo git chuyển từ `Road Map/` vào `ai-atlas/`.

## 2026-10 — Khởi tạo

### Thêm mới

- Kế hoạch dự án (`PLAN.md`), README, giáo án gốc, `.gitignore`.
