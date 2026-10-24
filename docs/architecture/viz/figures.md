# Hình SVG tĩnh (FIG): quy ước chung

> (Trước đây `docs/architecture/viz.md` mục 8. Số mục giữ nguyên như file cũ; mục ở file khác tra trong [mục lục](README.md#mục-lục).)

## 8. Hình SVG tĩnh (FIG): quy ước chung

> Viết ngày 23/10/2026, cho mốc M3. Hình tĩnh đầu tiên: hai hình của bài `ml/ml-overview`. Mục này độc lập với mục 1–7: VIZ tương tác giữ nguyên mọi quy ước cũ.
>
> **Quyết định đầu vào** ([decisions.md](../../decisions.md)): 37 (bài Tổng quan Học máy chỉ dùng hình SVG tĩnh), 39 (test gọn, dựa vào test chung, không so tọa độ hay chuỗi chính xác), 40 (2 hình: sơ đồ các nhóm học máy, sơ đồ quy trình dữ liệu → huấn luyện → đánh giá có tách train/test).

### 8.1. Mục tiêu và phạm vi

**Làm:** quy ước cho mọi hình chỉ để nhìn (sơ đồ khối, quy trình, cây phân loại, kiến trúc mạng vẽ dạng khối) trong 78 bài: chỗ đặt file, chữ song ngữ, trợ năng, cỡ chữ ở 375px, màu sáng/tối, ngân sách, test chung. Một bộ kit nhỏ (khung, khối, mũi tên, chữ) đủ cho hai hình của `ml/ml-overview`.

**Không làm:**

- Đồ thị dữ liệu tĩnh (điểm, trục, đường cong cố định). **Đã quyết ở mục 11:** đồ thị sơ đồ (vùng, đường mức, không có số trên trục) vẽ bằng kit FIG mở rộng, không dùng `PlotFrame`.
- Ảnh bitmap, file `.svg` rời dùng qua `<img>` hay Markdown `![]()`: ảnh không đọc được biến CSS của trang nên không đổi màu theo sáng/tối, và chữ trong ảnh không dịch được.
- Tự xếp bố cục (dagre, elk, mermaid): thêm gói npm, và hình tự xếp thường xấu ở 375px. Tọa độ viết tay.
- Hoạt ảnh, phóng to khi bấm, chú giải tương tác.
- Ký hiệu toán trong SVG. SVG không chứa được HTML của KaTeX. Ký hiệu để ở chú thích (`caption`, có hỗ trợ `$…$`) hoặc lời văn quanh hình. Ký hiệu ngắn trong hình (như $w_1$) vẽ bằng `FigMath`, mục 11.3.

### 8.2. Phương án đã chọn

**(a) Thư mục và tên file.** Hình tĩnh ở `src/components/figures/`, **không** ở `src/components/viz/`. Đã kiểm chứng trong code:

- `tests/e2e/viz.spec.ts`: hàm `vizCount` (dòng 29–37) đếm mọi thẻ import từ `@components/viz/*.astro`; test "every VIZ written in the file is on the page" đòi số `.atlas-viz` trên trang bằng đúng số đó, và `hydrate()` đòi mỗi `.atlas-viz` có đúng một `astro-island`. Một hình tĩnh trong `viz/` làm các test này fail.
- `tests/unit/viz/viz-conventions.test.ts` quét mọi file dưới `src/components/viz/`: chỉ cho một file CSS là `viz.css`, và mọi `*Island.tsx` phải có wrapper `client:visible`.
- Vì vậy hình tĩnh cũng **không được** dùng lớp `atlas-viz` hay `atlas-viz-*`. Tiền tố của hình tĩnh là `atlas-fig-`, khối gốc là `figure.atlas-figure`.

Tên: component `<Name>Figure.astro` (PascalCase, đuôi `Figure` để phân biệt với VIZ), chữ của nó ở `src/data/figures/<name>.ts` (kebab-case, bỏ đuôi `Figure`). Ví dụ `MlWorkflowFigure.astro` ↔ `ml-workflow.ts`, id `ml-workflow`.

**(b) Mỗi hình một component, dùng chung một kit.**

| Phương án | Đánh giá |
|---|---|
| A. Một `<Figure name="…">` chung, hình mô tả bằng dữ liệu (khối, cạnh) rồi tự vẽ | Phải có bộ xếp bố cục, hoặc vẫn ghi tọa độ trong dữ liệu. Mỗi kiểu hình mới (cây, vòng lặp, khối lồng nhau) lại kéo giãn schema. Khó cho một người bảo trì |
| **B. Mỗi hình một `.astro` viết SVG tay, dùng kit `FigureFrame`, `FigNode`, `FigArrow`, `FigText` (chọn)** | Tự do về hình. Phần lặp lại (khung `figure`, trợ năng, chữ nhiều dòng, đầu mũi tên) nằm ở kit. Hình học là thuộc tính SVG, không có CSS riêng |
| C. File `.svg` vẽ bằng công cụ (Inkscape, Figma), import thành component | Chữ cứng trong file: mỗi ngôn ngữ một file, hình học lặp hai lần. SVG xuất từ công cụ nặng, trùng `id`, mã màu cứng |

Bài MDX dùng (bản vi và en **giống hệt**, không có prop):

```mdx
import MlWorkflowFigure from '@components/figures/MlWorkflowFigure.astro';

{/* FIG: tập kiểm tra không được đưa vào huấn luyện. */}
<MlWorkflowFigure />
```

- Hình đặt ở chỗ nó giúp hiểu nhất (Trực giác, Lý thuyết hay Minh họa), không bắt buộc ở mục Minh họa.
- Mỗi hình chỉ dùng một lần trên một trang, vì id phần tử suy từ id hình.
- Gợi ý: tối đa 3 hình tĩnh mỗi bài.

**(c) Chữ trong hình: file dữ liệu theo hình, mỗi ngôn ngữ một khối, chọn theo ngôn ngữ trang.**

| Phương án | Đánh giá |
|---|---|
| A. Props trong MDX | Bản vi và en phải chép và dịch props, dễ lệch. Chữ dài trong thẻ MDX khó đọc. Trái với yêu cầu "cùng component, chỉ khác locale" |
| B. Key i18n (`fig<Name>` trong `ui.ts`, `vi.json`, `en.json`) | Có sẵn test vi/en. Nhưng đây là **nội dung** của bài, không phải chuỗi giao diện. Khoảng 50 hình × 10 nhãn làm `UI_KEYS` phình ra. Mục 2.6 đã xếp tên trục, đơn vị (nội dung) vào file dữ liệu, không vào i18n |
| **C. `src/data/figures/<name>.ts`, khối `vi` và khối `en` (chọn)** | Giống `src/data/datasets/` và `src/data/home.ts`. Kiểu TS bắt thiếu key ở một ngôn ngữ (`npm run check`). Người dịch dịch nguyên khối `en`. Mỗi ngôn ngữ tự ngắt dòng, vì chữ Việt thường dài hơn |

- Component chọn khối theo `getPageLocale(Astro.locals.starlightRoute)`, như `DatasetTable` và wrapper VIZ. Trên trang fallback `/en/…`, hình hiện tiếng Anh và có `lang="en"`.
- Hình **không** có chuỗi giao diện nào, nên không thêm key vào `ui.ts`.
- Khi tạo hình, `viz-builder` viết khối `vi` (theo chữ `lesson-writer` đưa) và bản nháp `en`. `lesson-translator` rà khối `en` khi dịch bài, như phần `en` của dataset.
- Số trên hình (ví dụ tỉ lệ khi tách train/test) phải khớp code của bài. `content-reviewer` kiểm tra.

**(d) Trợ năng.** HTML ra (phác thảo):

```html
<figure class="atlas-figure not-content" lang="vi" id="fig-ml-workflow" data-wide>
  <svg class="atlas-fig-svg" data-layout="narrow" viewBox="0 0 360 500" role="img"
       aria-label="…label…" aria-describedby="fig-ml-workflow-desc" data-pagefind-ignore>…</svg>
  <svg class="atlas-fig-svg" data-layout="wide" viewBox="0 0 640 240" role="img"
       aria-label="…label…" aria-describedby="fig-ml-workflow-desc" data-pagefind-ignore>…</svg>
  <p class="sr-only" id="fig-ml-workflow-desc" aria-hidden="true">…description…</p>
  <figcaption class="atlas-fig-caption">…caption, có thể có KaTeX…</figcaption>
</figure>
```

- `role="img"`: trình đọc màn hình đọc SVG như một ảnh, không đọc lần lượt từng mẩu `<text>`.
- Tên là `aria-label`, giống VIZ (mục 2.7). Không dùng `<title>`, để không hiện tooltip lặp chữ khi rê chuột.
- `label`: ngắn, gồm loại hình và chủ đề, ví dụ "Sơ đồ quy trình học máy có giám sát".
- `description` (lớp `sr-only` có sẵn trong Starlight): nói **đủ** những gì hình nói, theo thứ tự đọc, 1–4 câu. Đoạn này có `aria-hidden="true"`, để trình đọc màn hình chỉ đọc nó một lần qua `aria-describedby`, không đọc lại như một đoạn văn (`aria-describedby` vẫn lấy được chữ từ phần tử bị ẩn). Vì `role="img"` ẩn chữ trong SVG, đây là bản thay thế duy nhất cho chữ trên hình.
- `figcaption`: chú thích nhìn thấy, đồng thời là tên truy cập của `figure`. Render bằng `renderInlineMarkup`, nên được dùng `$…$`.
- `lang` trên `figure` theo ngôn ngữ trang (lý do như mục 2.2). `not-content` để bỏ style Markdown bên trong.
- `data-pagefind-ignore` chỉ đặt trên `svg`: các mẩu nhãn rời không lọt vào đoạn trích tìm kiếm. Chú thích và mô tả vẫn được tìm.
- Không chỉ dùng màu: khối trọng tâm có viền 2px, khối thuộc nhóm thứ hai có viền đứt, và ý phân biệt luôn có chữ.

**(e) Cỡ chữ và kích thước ở 375px.** SVG có `viewBox` co giãn cả chữ (mục 2.4, phương án A). VIZ tránh việc này bằng chữ HTML. Sơ đồ khối thì chữ phải nằm trong khối, nên ở đây giữ chữ trong SVG và **khóa tỉ lệ co** trong một khoảng hẹp:

| Bố cục | `viewBox` | Hiện khi | Chiều rộng hiển thị | Tỉ lệ co |
|---|---|---|---|---|
| Hẹp (**bắt buộc**) | rộng **360**, cao ≤ 540 | luôn hiện, trừ khi hình có bố cục rộng và khung ≥ 640px | `width: 100%`, `max-width: 400px` | 0,95 (cột 343px ở màn 375px) tới 1,11 |
| Rộng (tùy chọn) | rộng **640**, cao tùy | khung `.atlas-figure` ≥ 640px (container query theo px) | `max-width: 640px` | đúng 1 |

- Cột nội dung ở màn 375px rộng 343px: Starlight đặt `--sl-content-pad-x: 1rem` (đã đọc `dist/style/props.css` và `ContentPanel.astro`). Hình không có khối nền, không có lề riêng.
- Cỡ chữ tính bằng đơn vị `viewBox`, là hằng trong `src/lib/figures/geometry.ts`: nhãn chính **15** (đậm 600), nhãn phụ **13**. Nhỏ nhất ở 375px: 13 × 343/360 ≈ **12,4px**.
- Luật kiểm bằng e2e: **mọi chữ đang hiện ≥ 12px**, ở cả 375px và máy tính.
- Cao dòng bằng 1,3 lần cỡ chữ, vì dấu tiếng Việt có thể chồng hai tầng. Mỗi khối tối đa 3 dòng. Chữ cách viền khối ≥ 8 đơn vị.
- Bố cục hẹp cao ≤ 1,5 lần rộng (≤ 540), để hình cùng chú thích vừa một màn điện thoại.
- Bố cục rộng nên có khi hình là chuỗi ngang từ 4 bước trở lên, để máy tính không hiện một cột dài. Hai bố cục dùng chung chữ, chỉ khác tọa độ.
- Bố cục bị ẩn có `display: none`, nên không vào cây trợ năng và không được vẽ.
- SVG inline có `viewBox` tự có tỉ lệ khung, nên chiều cao biết ngay từ HTML (CLS bằng 0).
- Chữ trong SVG thừa hưởng font Barlow của trang. Trước khi font tải xong, chữ hiện bằng font dự phòng, nên khối phải chừa chỗ (≥ 8 đơn vị mỗi bên).
- Tọa độ viết tay dùng số nguyên. Hàm trong kit làm tròn tới 1 chữ số thập phân.

**(f) Màu.** Một file `src/components/figures/figures.css`, nạp qua `customCss` ngay **trước** `viz.css` (`viz.css` vẫn đứng cuối, vì test hiện có đòi vậy). Lý do giống mục 2.3 phương án D: một file chung, hình không có CSS riêng, không mã màu trong `.astro`. Biến vai trò khai báo trên `.atlas-figure`, chỉ trỏ tới token có sẵn:

| Biến | Trỏ tới | Dùng cho | Tương phản tối / sáng (nguồn) |
|---|---|---|---|
| `--atlas-fig-ink` | `--sl-color-white` | Chữ chính trong khối | trên nền khối `gray-6`: 12,04 / 12,50 (mục 4.9) |
| `--atlas-fig-muted` | `--sl-color-gray-3` | Chữ phụ, viền khối thường, mũi tên | chữ trên `gray-6`: 5,40 / 5,52; nét trên `bg`: 6,28 / 6,89 (mục 4.9) |
| `--atlas-fig-node` | `--sl-color-gray-6` | Nền khối thường | (nền) |
| `--atlas-fig-accent` | `--sl-color-accent` | Viền 2px của khối trọng tâm (ví dụ "có giám sát", tập train) | trên `bg`: 7,42 / 6,42 (mục 4.9) |
| `--atlas-fig-accent-fill` | `--sl-color-accent-low` | Nền khối trọng tâm, chữ dùng `ink` | `white` trên `accent-low`: 9,14 / 12,27 (mục 4.9) |
| `--atlas-fig-alt` | `--sl-color-blue-high` | Viền đứt của nhóm thứ hai (ví dụ tập test) | trên `bg`: 9,24 / 11,68 (mục 4.9) |
| (chú thích) | `--sl-color-text` | `figcaption`, cỡ `--sl-text-sm` | trên `bg`: 10,10 / 11,11 (components.md 4.9.7) |

- Mọi cặp đều đã đo ở mục 4.9 hoặc components.md 4.9.7. Không có cặp màu mới. Chữ đặt ngoài khối (ví dụ nhãn cạnh mũi tên) dùng `ink` hoặc `muted` trên `bg`: 14,00 / 15,61 và 6,28 / 6,89.
- Có khối `@media (forced-colors: active)` trỏ các biến về màu hệ thống (`CanvasText`, `Canvas`, `Highlight`). Đây không phải mã màu, test cho phép.

**(g) Ngân sách.**

| Mục | Giới hạn | Đo bằng |
|---|---|---|
| JS | **0**: không `client:*`, không `<script>`, không React, không `astro-island` trong hình | Unit và e2e |
| Request thêm | **0**: không `<img>`, `<image>`, `<foreignObject>`, `<use>` trỏ ra file khác | E2E |
| `figures.css` | **≤ 1 KB gzip** (1 024 byte), đo file nguồn sau khi bỏ comment như `viz.css` (quyết định 27). Dự kiến 0,5–0,7 KB | Unit |
| HTML một hình (cả hai bố cục) | `outerHTML` của `figure.atlas-figure`, **không tính** cây `.katex` trong chú thích (mục 11.5 T3), **≤ 10 000 ký tự** và **≤ 200 phần tử**. Ước tính hình quy trình khoảng 6 000 ký tự, 110 phần tử | E2E |
| Gói npm mới | **0** | `analyst` xem `package.json` |

Để so: KaTeX sinh 11 869 phần tử trên bài Hồi quy tuyến tính (quyết định 29), nên 200 phần tử mỗi hình không đáng kể.

**(h) Test chung.** Theo quyết định 39: gọn, không so tọa độ hay chuỗi cụ thể. Hình mới tự được kiểm, không viết test riêng cho từng hình.

- **Unit `tests/unit/viz/figure-conventions.test.ts`** (môi trường node):
  1. Dưới `src/components/figures/`: chỉ một file CSS là `figures.css`; không có `.tsx`/`.jsx`; không file nào có `<style>`, `<script>`, import CSS, import `react` hay `client:`; không mã màu, không `--sl-color-` trong `.astro`/`.ts`.
  2. `astro.config.ts` có `./src/components/figures/figures.css` trong `customCss`, và `viz.css` vẫn đứng cuối.
  3. `figures.css` bỏ comment rồi nén ≤ 1 024 byte, và không có mã màu.
  4. Mỗi `<Name>Figure.astro` ở gốc `figures/` có `src/data/figures/<name>.ts` và mục trong `FIGURES`, và ngược lại.
  5. Với mọi hình trong `FIGURES`, ở cả `vi` và `en`: `caption`, `label`, `description` và mọi dòng nhãn không rỗng; hai ngôn ngữ cùng tập key nhãn; mỗi nhãn ≤ 3 dòng; nhãn SVG không có `$` hay `{{`; `description` của vi khác của en (bắt lỗi quên dịch).
  - Hàm `stripCssComments` hiện nằm trong `viz-conventions.test.ts`, chuyển sang `tests/unit/fixtures/css.ts` để hai test dùng chung.
- **Unit `tests/unit/viz/figure-geometry.test.ts`:** `arrowHead`, `lineOffsets`, `round1` với ví dụ tính tay (đầu mũi tên ngang, dọc, chéo; 1–3 dòng căn giữa).
- **E2E trong `tests/e2e/lessons.spec.ts`**, trong vòng lặp có sẵn cho từng trang bài (vi, en kể cả fallback; project `desktop` và `mobile` 375px). Thêm một test `static figures: one per tag, named, described, readable, no JS`, bỏ qua khi bài không có hình:
  1. Số `figure.atlas-figure` bằng số thẻ import từ `@components/figures/` trong file bài. Thêm hàm `figureCount` vào `tests/unit/fixtures/lesson-shape.ts`, cùng kiểu `vizCount`.
  2. Mỗi hình: `lang` bằng ngôn ngữ trang; `figcaption` có chữ; đúng **một** `svg.atlas-fig-svg` đang hiện, có `role="img"`, `aria-label` không rỗng, `aria-describedby` trỏ tới phần tử có chữ; id trên trang không trùng.
  3. Không có `astro-island`, `script`, `img`, `image`, `foreignObject` trong hình. Đạt ngân sách HTML ở (g).
  4. Sau `document.fonts.ready`: mọi `<text>` của SVG đang hiện có cỡ chữ hiển thị (cỡ chữ tính toán × `getScreenCTM().a`) ≥ 12px; hộp bao (`getBBox`) của mỗi `<text>` nằm trong `viewBox`; chữ trong `.atlas-fig-node` nằm trong `rect` của khối đó (sai số 1 đơn vị). Đây là kiểm tra chung "chữ không tràn", không so với tọa độ mong đợi.
  5. Ở sáng và tối: chữ so với nền gần nhất (nền khối hoặc nền trang) ≥ 4,5; viền khối, mũi tên, đầu mũi tên so với nền trang ≥ 3. Phần lõi đo tương phản trong `viz.spec.ts` (`rgba`, `luminance`, `backgroundOf`) chuyển sang `tests/e2e/helpers.ts` để dùng chung.
  - Test "trang không cuộn ngang" và `lesson-pairs.test.ts` (vi và en cùng số thẻ hình, cùng thứ tự) đã có sẵn và tự áp dụng cho hình.

### 8.3. Cấu trúc file

```
src/
├─ components/figures/
│  ├─ figures.css                 # the only CSS of every static figure; customCss, just before viz.css
│  ├─ kit/
│  │  ├─ FigureFrame.astro        # <figure>, one or two <svg role="img">, sr-only description, figcaption
│  │  ├─ FigNode.astro            # box: <g class="atlas-fig-node"> with rect + 1–3 centred lines
│  │  ├─ FigArrow.astro           # straight or bent connector + its head (no <marker>)
│  │  └─ FigText.astro            # free text: lines as <tspan>, anchor start/middle/end
│  ├─ MlFamiliesFigure.astro      # ml/ml-overview: supervised, unsupervised, reinforcement
│  └─ MlWorkflowFigure.astro      # ml/ml-overview: data → split → train → model → evaluate on test
├─ data/figures/
│  ├─ types.ts                    # Lines, FigureStrings<K>, FigureText<K>
│  ├─ index.ts                    # FIGURES registry, FigureId
│  ├─ ml-families.ts
│  └─ ml-workflow.ts
└─ lib/figures/
   └─ geometry.ts                 # pure: NARROW_WIDTH, WIDE_WIDTH, FIG_FONT, LINE_HEIGHT, arrowHead, lineOffsets, round1
tests/unit/
├─ figure-conventions.test.ts  figure-geometry.test.ts
└─ fixtures/css.ts               # stripCssComments, moved out of viz-conventions.test.ts
tests/e2e/
├─ lessons.spec.ts               # + one figure test per lesson page
└─ helpers.ts                    # + contrast core, moved out of viz.spec.ts
```

- `src/data/figures/` và `src/lib/figures/` chỉ dùng import tương đối (lý do ở mục 2.2: Playwright import thẳng các file này).
- Đầu mũi tên là `<polygon>` tính sẵn, không dùng `<marker>`. Lý do: `marker` cần `id` duy nhất trên trang, và cách tô màu theo nét (`context-stroke`) chưa ổn định giữa các trình duyệt.

### 8.4. Giao diện

```ts
// src/data/figures/types.ts — shapes only, relative imports.
import type { Locale } from '../roadmap';

/** One label. A string is one line; an array is one string per line, broken by hand for this language. */
export type Lines = string | readonly string[];

export interface FigureStrings<K extends string> {
  caption: string;          // visible <figcaption>; $…$ rendered with KaTeX at build
  label: string;            // aria-label of the SVG: kind of figure + subject, one short phrase
  description: string;      // sr-only: everything the figure says, in reading order, 1–4 sentences
  labels: Record<K, Lines>; // text drawn in the SVG, at most 3 lines each; no $…$
}

export type FigureText<K extends string> = Record<Locale, FigureStrings<K>>;
```

```ts
// src/data/figures/ml-workflow.ts — sketch; the lesson writer supplies the words.
import type { FigureText } from './types';

type Key = 'data' | 'split' | 'train' | 'test' | 'fit' | 'model' | 'evaluate';

export const ML_WORKFLOW = {
  vi: { caption: '…', label: '…', description: '…', labels: { data: ['Dữ liệu', '10 căn hộ'] /* , … */ } },
  en: { caption: '…', label: '…', description: '…', labels: { data: ['Data', '10 apartments'] /* , … */ } },
} satisfies FigureText<Key>;
```

```ts
// src/lib/figures/geometry.ts — signatures only.
export const NARROW_WIDTH = 360;
export const WIDE_WIDTH = 640;
export const FIG_FONT = { label: 15, small: 13 } as const; // viewBox units
export const LINE_HEIGHT = 1.3;
export type Pt = readonly [x: number, y: number];
/** dy of each line, so that `count` lines are centred on y. */
export function lineOffsets(count: number, fontSize: number): number[];
/** "x1,y1 x2,y2 x3,y3": a head pointing along from → to, tip at `to`. */
export function arrowHead(from: Pt, to: Pt, size?: number): string;
export function round1(value: number): number;
```

```ts
// Props of the kit (src/components/figures/kit/).
// FigureFrame.astro. Slots: "narrow" (required), "wide" (optional).
// Build error when only one of wideHeight / slot "wide" is given, or narrowHeight > 540.
interface FigureFrameProps {
  id: FigureId;                // 'ml-workflow'; element ids: fig-<id>, fig-<id>-desc
  text: FigureStrings<string>; // already picked for the page locale
  narrowHeight: number;        // viewBox 0 0 360 h
  wideHeight?: number;         // viewBox 0 0 640 h
}
// FigNode.astro. accent: 2px accent border + accent-low fill; alt: dashed blue border.
interface FigNodeProps {
  x: number; y: number; width: number; height: number;
  lines: Lines; small?: Lines; tone?: 'plain' | 'accent' | 'alt';
}
// FigArrow.astro: a polyline through `via`, head at `to`.
interface FigArrowProps { from: Pt; to: Pt; via?: readonly Pt[] }
// FigText.astro: free text outside boxes.
interface FigTextProps { x: number; y: number; lines: Lines; size?: 'label' | 'small'; anchor?: 'start' | 'middle' | 'end' }
```

Một hình, phác thảo:

```astro
---
// src/components/figures/MlWorkflowFigure.astro
import { ML_WORKFLOW } from '@data/figures/ml-workflow';
import { getPageLocale } from '@lib/page-locale';
import FigureFrame from './kit/FigureFrame.astro';
import FigNode from './kit/FigNode.astro';
import FigArrow from './kit/FigArrow.astro';

const t = ML_WORKFLOW[getPageLocale(Astro.locals.starlightRoute)];
---

<FigureFrame id="ml-workflow" text={t} narrowHeight={500} wideHeight={240}>
  <Fragment slot="narrow">
    <FigNode x={100} y={8} width={160} height={52} lines={t.labels.data} />
    <FigArrow from={[180, 60]} to={[180, 92]} />
    <!-- … -->
  </Fragment>
  <Fragment slot="wide"><!-- same boxes, left to right --></Fragment>
</FigureFrame>
```

**Lớp trong `figures.css`:**

- `.atlas-figure`: `container-type: inline-size`, các biến vai trò.
- `.atlas-fig-svg`: `display: block`, `width: 100%`, `height: auto`; `[data-layout]` và container query 640px trên `.atlas-figure[data-wide]` để đổi bố cục.
- `.atlas-fig-node` (kèm `[data-tone]`), `.atlas-fig-text`, `.atlas-fig-text-sm`, `.atlas-fig-arrow`, `.atlas-fig-arrow-head`, `.atlas-fig-caption`.
- Khối `forced-colors`.
- Cỡ chữ **không** nằm trong CSS. `FigText` và `FigNode` ghi thuộc tính `font-size` từ `FIG_FONT`, để kit tính được vị trí dòng và e2e đọc được cỡ chữ thật.

**Hai hình của `ml/ml-overview`** (gợi ý bố cục; chữ do `lesson-writer` viết):

| Hình | Ý một câu | Bố cục hẹp | Bố cục rộng |
|---|---|---|---|
| `MlFamiliesFigure` | Học máy chia ba nhóm theo tín hiệu dùng để học: nhãn, không nhãn, phần thưởng | Khối "Học máy" trên cùng, ba thẻ xếp dọc (tên nhóm, học từ gì, ví dụ), thẻ "có giám sát" dùng `accent` | Không cần: ba thẻ xếp dọc vẫn gọn |
| `MlWorkflowFigure` | Tập kiểm tra tách ra từ đầu và chỉ dùng để đánh giá | Dọc: dữ liệu → tách → hai nhánh train (`accent`) và test (`alt`, viền đứt) → huấn luyện → mô hình → đánh giá. Mũi tên từ test chỉ đi vào "đánh giá" | Đã bỏ khi làm F2: bản rộng nặng 11 203 ký tự, vượt ngân sách 10 000 ở (g). Cột nội dung trên màn 1280px rộng 632px, dưới ngưỡng 640, nên bản rộng chỉ hiện từ khoảng 1440px |

### 8.5. Phụ thuộc

Không thêm gói npm. Dùng lại `astro` (component, slot, `Fragment`), `katex` qua `renderInlineMarkup` cho chú thích, `vitest` và `@playwright/test` 1.64.1 cho test, `node:zlib` để đo gzip.

### 8.6. Các bước thực hiện

| # | Agent | Việc | Tiêu chí hoàn thành |
|---|---|---|---|
| F0 | `viz-builder` | Kit `figures/kit/*`, `figures.css` (thêm vào `customCss` ngay trước `viz.css`), `src/lib/figures/geometry.ts`, `src/data/figures/types.ts` và `index.ts` (registry rỗng). Chuyển `stripCssComments` sang `tests/unit/fixtures/css.ts`. Viết `figure-conventions.test.ts` (ý 1–5 ở mục 8.2 h) và `figure-geometry.test.ts` | `npm test` qua, kể cả `viz-conventions.test.ts` sau khi chuyển hàm. `npm run check` 0 lỗi 0 cảnh báo. `npm run build` không `[WARN]`. `figures.css` ≤ 1 024 byte gzip |
| F1 | `lesson-writer` | Bản vi `ml/ml-overview`: ở chỗ đặt mỗi hình, viết comment giữ chỗ `{/* FIG: <Name>Figure … */}` theo khuôn trong template: ý chính, các khối và mũi tên theo thứ tự đọc, nhãn tiếng Việt từng khối (≤ 3 dòng ngắn), chú thích | `content-reviewer` duyệt nội dung hình cùng bài |
| F2 | `viz-builder` | `MlFamiliesFigure`, `MlWorkflowFigure`, `ml-families.ts`, `ml-workflow.ts` (khối vi theo F1, khối en nháp), đăng ký trong `FIGURES`. Thay comment giữ chỗ bằng import, comment một dòng và thẻ. Xem tay trên `npm run preview` ở 375px và máy tính, sáng và tối | Unit ở F0 qua với 2 hình. `dist/vi/ml/ml-overview/index.html` có đúng 2 `figure.atlas-figure`, không có `astro-island` bên trong. Tự đo: chữ nhỏ nhất ≥ 12px ở 375px, không chữ tràn khối, đạt ngân sách HTML ở (g) |
| F3 | `tester` | Test e2e ở mục 8.2 (h) trong `lessons.spec.ts`; `figureCount` trong `lesson-shape.ts`; chuyển lõi đo tương phản sang `helpers.ts`, không đổi hành vi của `viz.spec.ts` | `npm run test:e2e` qua ở `desktop` và `mobile`. Thử phá: một nhãn rất dài, hoặc cỡ chữ hạ xuống 10, thì test fail đúng chỗ (rồi trả lại) |
| F4 | `analyst` | Review theo mục 8.2 | Báo cáo có số đo: `figures.css` (gzip), kích thước HTML mỗi hình, tương phản đo thật, `package.json` không đổi |
| F5 | **người dùng** | Duyệt hai hình trên bài thật, cả trên điện thoại thật, cùng lượt duyệt bản vi | Đồng ý, hoặc có danh sách chỗ sửa |
| F6 | `lesson-translator` | Bản en: cùng import và thẻ hình; rà khối `en` trong `src/data/figures/*.ts`, ngắt dòng lại nếu cần | `lesson-pairs.test.ts` và e2e của F3 qua trên trang en thật |

Việc phiên chính lo:

- Thêm `src/components/figures/`, `src/data/figures/` vào mục "Cấu trúc thư mục" của `CLAUDE.md`.
- Thêm vào `.claude/agents/viz-builder.md` một dòng: hình tĩnh theo `docs/architecture/viz/figures.md` mục 8, chữ của hình nằm ở `src/data/figures/`, không ở `ui.ts`. Hiện agent ghi rằng mọi chữ của minh họa là key i18n.

### 8.7. Rủi ro và điểm chưa chắc

| # | Rủi ro | Cách xử lý |
|---|---|---|
| 1 | Chữ tiếng Anh và tiếng Việt dài khác nhau, tràn khối | Mỗi ngôn ngữ tự ngắt dòng trong file dữ liệu. E2E ý 4 bắt chữ tràn ở cả hai ngôn ngữ |
| 2 | Font dự phòng (trước khi Barlow tải xong) rộng hơn, chữ chạm viền một lúc | Chừa ≥ 8 đơn vị mỗi bên. Không gây CLS vì khung SVG cố định |
| 3 | Màn hẹp hơn 375px (320px, cột 288px): chữ 13 đơn vị chỉ còn khoảng 10,4px | Mục tiêu của dự án là 375px. Chấp nhận, xem lại khi duyệt trên điện thoại thật |
| 4 | Chế độ chỉ phóng to chữ (Firefox "Zoom text only") không phóng chữ trong SVG | Zoom trang thông thường vẫn phóng hình. Mô tả `sr-only` và chú thích là chữ HTML |
| 5 | Chưa thử `forced-colors` (Windows High Contrast) | Có khối `@media (forced-colors: active)` trỏ về màu hệ thống. Kiểm ở M4, cùng rủi ro 11 |
| 6 | Hai bố cục cho một hình tốn công vẽ gấp đôi, và với kit hiện tại một hình dài có hai bố cục khó nằm trong ngân sách 10 000 ký tự. Phần bố cục rộng của kit (`data-wide`, container query) **chưa được kiểm chứng** trên trang thật: hình đầu tiên dùng nó phải có test riêng | Bố cục rộng là tùy chọn, chỉ làm khi hình là chuỗi ngang dài (mục 8.2 e) |
| 7 | Bài sau cần ký hiệu toán trong hình (ví dụ $\hat{y}$ cạnh mũi tên) | **Đã quyết ở mục 11.3:** `FigMath`, chữ nghiêng bằng `tspan`, chỉ số dưới dời bằng `dy`. Dấu mũ, gạch trên ($\hat{y}$, $\bar{x}$) chưa hỗ trợ: thêm vào `FigMath` khi bài đầu tiên cần |

**Các lựa chọn tự quyết, đổi lại được sau F5:** tiền tố `atlas-fig-` và đuôi `Figure`; không đánh số "Hình 1" (nên không cần chuỗi giao diện); hình đặt thẳng trên nền trang, không có khối nền; khối trọng tâm dùng màu nhấn của site, nhóm thứ hai xanh dương viền đứt; `MlFamiliesFigure` chỉ có bố cục hẹp.
