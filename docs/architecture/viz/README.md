# Minh họa tương tác (VIZ) và hình tĩnh (FIG): mục lục và quy ước chung

> (Trước đây là phần đầu và mục 1–2 của `docs/architecture/viz.md`. File đó được tách thành thư mục này ngày 24/10/2026 (quyết định 58 trong [decisions.md](../../decisions.md)). Số mục giữ nguyên như file cũ, nên "viz.md mục N.M" trong lịch sử git vẫn tra được qua bảng dưới đây.)

## Mục lục

| Mục cũ trong `viz.md` | File | Nội dung |
|---|---|---|
| Phần đầu, 1, 2 | [README.md](README.md) (file này) | Phạm vi, quyết định đầu vào của M2, quy ước chung cho mọi VIZ (2.1–2.12) |
| 4.1–4.4 | [shared.md](shared.md) | Phần dùng chung: dữ liệu `src/data/datasets/`, toán `src/lib/viz/`, kit, lớp và token của `viz.css` |
| 3, 4.5–4.10, 5, 6, 7 | [linear-fit.md](linear-fit.md) | `LinearFitViz` (bài Hồi quy tuyến tính, M2): cấu trúc file, đặc tả, phụ thuộc, các bước V0–V8, rủi ro |
| 8 | [figures.md](figures.md) | Hình SVG tĩnh (FIG): quy ước chung, kit, hai hình của bài Tổng quan Học máy |
| 9 | [poly-fit.md](poly-fit.md) | `PolyFitViz` và bộ dữ liệu `sine` (bài Overfitting và Underfitting) |
| 10 | [regularization.md](regularization.md) | `RegularizationViz` (bài Ridge, Lasso, Elastic Net) |
| 11 | [static-plots.md](static-plots.md) | Đồ thị tĩnh trong kit FIG, `FigMath` và `RegularizationGeometryFigure` |
| 12 | [gradient-descent.md](gradient-descent.md) | `GradientDescentViz` (bài Gradient Descent) |
| 13 (mới) | [bpe-merge.md](bpe-merge.md) | `BpeMergeViz` (bài Tách từ, `nlp/tokenization`): bảng đếm cặp, chip mảnh, nút `aria-disabled` |

> Phạm vi: quy ước cho **mọi** minh họa (VIZ) của 78 bài, và đặc tả VIZ đầu tiên: `LinearFitViz` của bài mẫu Hồi quy tuyến tính (mốc M2). Quy ước cho **hình SVG tĩnh** (FIG, 0 JS) ở [mục 8](figures.md) (mốc M3). Bộ dữ liệu `sine` và `PolyFitViz` của bài Overfitting và Underfitting ở [mục 9](poly-fit.md) (mốc M3). `RegularizationViz` của bài Ridge, Lasso, Elastic Net ở [mục 10](regularization.md) (mốc M3). Đồ thị sơ đồ tĩnh và ký hiệu toán trong hình FIG ở [mục 11](static-plots.md). `GradientDescentViz` của bài Gradient Descent ở [mục 12](gradient-descent.md) (mốc M3).
> Liên quan: [components.md](../components.md) (mẫu wrapper Astro + island React mục 2.1, `useId` mục 2.9, hình thức và tương phản mục 4.9), [scaffold.md](../scaffold.md) mục 2.6, 4.5 (chuỗi giao diện), [.claude/agents/viz-builder.md](../../../.claude/agents/viz-builder.md).
>
> Viết ngày 23/10/2026. Chỗ ghi "đã kiểm chứng" là đã đọc mã nguồn trong `node_modules` hoặc đo trên `dist/` của bản build cùng ngày, không phải suy đoán.
>
> **Cập nhật cùng ngày, sau V0–V3:** sửa theo code thật của `viz-builder`. Nguồn: mã trong `src/components/viz/`, `src/lib/viz/`, `src/data/datasets/`, `DatasetTable.astro`, các unit test của VIZ, và `dist/` build lúc 11:59 (sau lần sửa code cuối lúc 11:54). Chỗ ghi "đo" là số đo trên các file đó. Riêng chiều cao 947px do `viz-builder` đo trên `npm run preview`, lượt cập nhật này không đo lại.

**Quyết định đầu vào** ([decisions.md](../../decisions.md)):

| # | Quyết định | Áp dụng ở |
|---|---|---|
| 13 | CSS của component bài học gộp vào `customCss`, để bài học không có file CSS chặn render riêng | 2.3 |
| 19 | Dữ liệu ví dụ: bảng nhỏ tự tạo, 8–12 căn hộ, diện tích (m²) → giá thuê (triệu đồng/tháng). Dùng chung cho Trực giác, minh họa và code | 2.5, 4.1, 4.10 |
| 20 | `LinearFitViz`: hai thanh trượt $w$, $b$ vẽ lại đường thẳng, các đoạn phần dư thẳng đứng và số MSE. Nút "Hiện đường tốt nhất" chồng đường bình phương tối thiểu kèm MSE của nó | 4.5–4.9 |
| 22 | Số kỹ thuật dùng dấu chấm thập phân ở mọi chỗ của bài tiếng Việt: bảng, VIZ, code, lời văn khi nhắc lại số | 2.6, 4.10 |
| 24 | VIZ đánh dấu điểm trung bình $(\bar{x}, \bar{y})$, và hạ `b.min` xuống khoảng −10.5, để người đọc giữ được đường thẳng đi qua điểm này khi tăng $w$ ($b = \bar{y} - w\bar{x}$) | 4.1, 4.5–4.9 |
| Giao việc M2-2 | Ý duy nhất của VIZ: **đường tốt nhất là đường có MSE nhỏ nhất**. Số dùng dấu chấm thập phân, khớp code | 2.6, 4.6 |

## 1. Mục tiêu và phạm vi

### Làm

- Quy ước chung cho mọi VIZ: khi nào làm, đặt file ở đâu, CSS, dữ liệu, chuỗi song ngữ, trợ năng, SSR, ngân sách, test, checklist hoàn thành.
- Bộ phần dùng chung nhỏ, chỉ gồm những gì `LinearFitViz` cần:
  - `src/components/viz/viz.css`: CSS duy nhất của mọi VIZ;
  - `src/lib/viz/`: toán, tỉ lệ trục, định dạng số (hàm thuần, có unit test);
  - `src/components/viz/kit/`: khung đồ thị, thanh trượt, hai hook.
- Nguồn dữ liệu dùng chung `src/data/datasets/`, component bảng `DatasetTable` (0 JS) và test giữ code Python khớp dữ liệu.
- `LinearFitViz` cho bài `ml/linear-regression`, bản vi và en.

### Không làm

- Kéo trực tiếp đường thẳng hay điểm trên đồ thị. Chỉ có thanh trượt và nút.
- Ô vuông bình phương phần dư, mặt MSE theo $(w, b)$, gradient descent. Các ý này thuộc bài khác, chủ yếu là `ml/gradient-descent`.
- Điểm ngoại lai trong VIZ. Ý này đã có ở ô code thứ ba (quyết định 21).
- Hoạt ảnh. Thư viện biểu đồ (d3, Chart.js…).
- Đặt VIZ lên trang demo `/dev/components/` (mục 2.11).

## 2. Phương án đã chọn (quy ước chung cho mọi VIZ)

### 2.1. Khi nào làm VIZ, làm loại nào

| Người đọc cần | Làm | JS trên trình duyệt |
|---|---|---|
| Đổi một tham số và thấy hệ quả ngay | VIZ tương tác: wrapper `.astro` + island React | island ≤ 10 KB gzip (mục 2.9) |
| Chỉ nhìn một hình (sơ đồ khối, quy trình, cây phân loại) | Hình tĩnh (FIG): `src/components/figures/<Name>Figure.astro`, SVG viết tay, theo quy ước [mục 8](figures.md). **Không** đặt trong `src/components/viz/` | 0 |
| Đọc số liệu | `DatasetTable` hoặc bảng Markdown | 0 |

- **Một VIZ, một ý.** Ý đó viết thành một câu trong comment một dòng, đặt ngay trên thẻ VIZ trong bài (mẫu ở mục 4.10 ý 5).
- Tối đa 1–2 VIZ mỗi bài ([mvp.md](../../mvp.md) mục 3).
- VIZ mới chỉ cần thêm mục đặc tả riêng vào thư mục này khi nó thêm phần mới vào kit, `viz.css` hoặc dữ liệu dùng chung. Còn lại, comment VIZ trong bài cộng checklist mục 2.12 là đủ.

### 2.2. File và cách bài dùng VIZ (a)

Giữ đúng mẫu của `Quiz` và `PythonRunner` ([components.md](../components.md) mục 2.1) và của `viz-builder.md`. Thêm hai lớp: kit và dữ liệu.

| Lớp | Vị trí | Vai trò | Vì sao |
|---|---|---|---|
| Wrapper | `src/components/viz/<Name>.astro` | File duy nhất bài học import. Lấy chuỗi, render KaTeX, tính trước số liệu lúc build, gắn `client:visible` | Tác giả không viết `client:*`. KaTeX không xuống trình duyệt |
| Island | `src/components/viz/<name>/<Name>Island.tsx` (thư mục kebab-case) | Trạng thái và phần vẽ | Mỗi VIZ một chunk JS riêng, chỉ tải trên trang có nó |
| Kit | `src/components/viz/kit/` | Component React và hook dùng chung giữa các VIZ | Không viết lại thanh trượt, khung trục cho từng VIZ. Chỉ thêm khi có VIZ cần |
| Toán thuần | `src/lib/viz/` | Hàm thuần, không DOM, không React | Test bằng Vitest môi trường node, so với số Python tính ra |
| Dữ liệu | `src/data/datasets/<id>.ts` | Bảng số và nhãn vi/en | Một nguồn cho bảng, VIZ và code (mục 2.5) |
| CSS | `src/components/viz/viz.css` | File CSS duy nhất của mọi VIZ | Mục 2.3 |

Cách bài MDX dùng (bản vi và bản en giống nhau):

```mdx
import LinearFitViz from '@components/viz/LinearFitViz.astro';

<LinearFitViz />
```

- Không viết `client:*` trong MDX. Astro cũng không cho đặt `client:*` lên component `.astro`.
- Prop từ MDX chỉ là số, chuỗi ngắn hoặc boolean (quy tắc của `viz-builder.md`). `LinearFitViz` ở M2 không có prop.
- File trong `src/lib/viz/` và `src/data/datasets/` chỉ dùng **import tương đối**. Lý do: e2e Playwright import thẳng các file này để tính số mong đợi, mà Playwright không biết alias `@lib/*` của Vite. Đây cũng là cách `roadmap.ts` đang làm.
- Gốc của mọi VIZ: `<div class="atlas-viz not-content" lang={locale} data-pagefind-ignore>`.
  - `not-content` bỏ style Markdown của Starlight bên trong, như các component M1.
  - `lang={locale}`: chữ của VIZ theo ngôn ngữ của trang. Trên trang fallback `/en/...`, `<main>` có `lang="vi"` (nội dung là file vi) nhưng chữ VIZ là tiếng Anh, nên phải khai báo lại để trình đọc màn hình đọc đúng giọng (WCAG 3.1.2). Đặt ở wrapper `.astro`, ngoài island. Mọi component bài học khác cũng làm vậy (`components.md` mục 4.1).
  - `data-pagefind-ignore` để số trên trục và nhãn nút không lọt vào đoạn trích kết quả tìm kiếm.
- Island render một `<figure class="atlas-viz-figure">` có `<figcaption class="atlas-viz-caption">`. Mọi phần của VIZ (đồ thị, chú giải, dòng số, điều khiển, dòng trạng thái, phần `sr-only`) là con trực tiếp của `figure`, xếp bằng lưới có `gap` 16px.

### 2.3. CSS: một file `viz.css` dùng chung, VIZ không có CSS riêng (b)

**Số đo hiện tại** (`dist/` ngày 23/10/2026):

- CSS chung của mọi trang (`_astro/middleware.*.css`): 131,0 KB, **26,0 KB gzip**.
- CSS của 5 component M1 cộng vào CSS chung khoảng 2,3 KB gzip (quyết định 13). Riêng `quiz.css` nén một mình là 1,46 KB gzip. Khi gộp vào bundle, phần tăng thêm chỉ khoảng một phần ba con số đó, vì gzip dùng lại các mẫu lặp.

**Giả định:** 78 bài, 0–2 VIZ mỗi bài, chỉ làm khi thật sự giúp hiểu. Ước tính khoảng **60 VIZ**. Một VIZ cỡ `LinearFitViz` cần khoảng 1,2 KB gzip CSS nếu viết riêng, tức khoảng 0,45 KB khi gộp.

| Phương án | Chi phí khi đủ 78 bài | Ưu | Nhược |
|---|---|---|---|
| A. Mỗi VIZ một file CSS, tất cả trong `customCss` | 60 × 0,45 ≈ **+27 KB gzip trên mọi trang**, kể cả trang chủ. CSS chung từ 26 KB lên khoảng 53 KB | Đơn giản. Không có file CSS riêng cho từng trang | Trang không có VIZ cũng phải tải. Performance trang demo đã chỉ 87–90 vì CSS chung (quyết định 17) |
| B. CSS riêng từng trang (wrapper import CSS) | Chỉ trang có VIZ tải, khoảng 0,5 KB | Nhẹ nhất cho trang khác | Đã kiểm chứng: Astro `build.inlineStylesheets: 'auto'` nhét CSS **dưới 4 KB** (`vite.build.assetsInlineLimit` = 4096) thành `<style>` trong HTML, còn từ 4 KB trở lên thành file `<link>` chặn render. CSS mà nhiều VIZ cùng import (kit) bị Vite gom thành chunk chung, đúng lỗi đã gặp ở M1: `inline-markup.*.css` nạp sau và đè CSS trang chủ. Kết quả phụ thuộc ngưỡng 4 KB và cách chia chunk, khác nhau giữa dev và build. CSS nằm trong HTML không được cache giữa các trang |
| C. Chỉ style inline và thuộc tính SVG | 0 KB CSS | Không có file nào | Không viết được `:focus-visible`, `:hover`, `@media (prefers-reduced-motion)`, container query, kiểu của `input[type=range]`. Màu rải trong 60 file: đổi một token (rủi ro 8 của components.md) phải sửa từng VIZ, không kiểm tra tương phản tập trung được |
| **D. Một file `viz.css` dùng chung trong `customCss`, VIZ không có CSS riêng (chọn)** | **Cố định khoảng 0,5–0,8 KB gzip** thêm vào CSS chung, không tăng theo số bài | Giữ đúng lý do của quyết định 13. CSS có ngay ở HTML dựng sẵn, trước khi hydrate. Màu tập trung một chỗ | Mọi trang tải vài trăm byte cho VIZ dù không có VIZ. Cần kỷ luật: chỉ thêm lớp dùng chung được |

**Quy tắc của D:**

- `viz.css` là file CSS **duy nhất** dưới `src/components/viz/`. Wrapper, island và kit không import CSS, không có `<style>`.
- Đường dẫn `'./src/components/viz/viz.css'` đứng cuối danh sách `customCss` trong `astro.config.ts`.
- **Màu chỉ đi qua lớp vai trò** (mục 4.4), ví dụ `.atlas-viz-primary`. Trong `.tsx` và `.astro` của VIZ không có mã màu và không có `var(--sl-color-*)`.
- Phần riêng của một VIZ chỉ là hình học:
  - thuộc tính SVG: `cx`, `x1`, `r`, `stroke-dasharray`…;
  - `style` inline cho vị trí tính ra, ví dụ `left: 40%`, hoặc biến `--atlas-viz-ytick-ch`.
- VIZ cần thứ `viz.css` chưa có thì thêm vào `viz.css` một lớp **dùng chung được**, đặt tên theo vai trò, không theo tên VIZ.
- **Ngân sách:** file nguồn `viz.css`, **bỏ comment** rồi nén gzip, ≤ 2,5 KB (2 560 byte, quyết định 27). Có test (`viz-conventions.test.ts`). Comment giải thích không tốn ngân sách, vì bản build đã minify và trình duyệt không tải comment. Hàm bỏ comment trong test theo cách tokenizer CSS: `/*` nằm trong chuỗi `'…'`, `"…"` hay trong `url(…)` không phải comment, và có test riêng cho các trường hợp đó. Chạm ngưỡng thì gọi `architect` xem lại, ví dụ tách phần hiếm dùng sang phương án B.
- **Số đo sau `LinearFitViz`:**
  - file nguồn `viz.css`: 7 073 byte, 2 207 byte gzip nếu tính cả comment. **Bỏ comment: 5 917 byte, 1 553 byte gzip**, tức 61% ngân sách 2 560 byte, còn khoảng 1 KB cho các VIZ sau (đo lại ngày 23/10/2026, rủi ro 1);
  - phần của `viz.css` trong CSS chung (đã minify): 4,9 KB, làm CSS chung tăng **0,83 KB gzip**, hơi trên ước tính 0,5–0,8 KB của phương án D;
  - CSS chung (`_astro/middleware.*.css`) nay là 135,8 KB, 27,3 KB gzip.

### 2.4. Cách vẽ: chữ bằng HTML, hình bằng SVG theo phần trăm

Vấn đề: chiều rộng đồ thị đi từ khoảng 311px (màn 375px trừ lề nội dung và lề khối) tới khoảng 680px trên máy tính. SVG có `viewBox` co giãn mọi thứ, kể cả chữ và nét.

| Phương án | Đánh giá |
|---|---|
| A. `viewBox` cố định, chữ nằm trong SVG | Chữ co giãn 2,2 lần. Chữ 12 đơn vị trong `viewBox` rộng 640 chỉ còn 5,8px trên điện thoại. Chỉnh cho vừa điện thoại thì chữ thành 25px trên máy tính |
| B. Đo chiều rộng bằng `ResizeObserver`, đặt `viewBox` bằng số px thật | Chữ chỉ đúng cỡ sau khi hydrate. Trước đó, và khi không có JS, vẫn là bản co giãn, nên chữ nhảy cỡ lúc hydrate. Thêm JS |
| **C. SVG không có `viewBox`, toạ độ theo `%`. Chữ (nhãn trục, số) là HTML đặt quanh SVG (chọn)** | `cx`, `cy`, `x1`…`y2`, `x`, `y`, `width`, `height` nhận phần trăm (SVG 1.1). Nét và bán kính vẫn tính bằng px thật. Chữ là HTML nên luôn đúng `--sl-text-sm`, theo cỡ chữ người đọc chọn, và giống hệt giữa build và trình duyệt. Bố cục không cần JS. Nhược điểm: `path`, `polyline` không nhận `%` (cách xử lý ở dưới) |

Cách làm:

- `.atlas-viz-plot` có `aspect-ratio` trong CSS, nên chiều cao đã biết ngay từ HTML (CLS bằng 0).
  - SVG nằm trong nó: `position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible`.
  - `overflow: visible` để điểm sát mép không bị cắt mất nửa.
- Toạ độ: `pct(toPercentX(x, domain))` cho chuỗi dạng `"42.86%"`. Luôn 2 chữ số thập phân, nên giống hệt giữa build và trình duyệt.
- Nhãn trục, số trên trục, chú giải: HTML. Chúng có `aria-hidden` khi tên của SVG đã nói đủ (mục 2.7).
- **Dấu có kích thước px đặt tại vị trí %** (ví dụ dấu × của điểm trung bình): bọc trong `<svg x="52.40%" y="45.40%" width="1" height="1" overflow="visible">` lồng bên trong. SVG lồng dời gốc toạ độ tới điểm đó, nên các nét bên trong viết bằng px quanh gốc (`x1="-6" y1="-6" x2="6" y2="6"`). `LinearFitViz` làm cách này trong `CrossMark`, hiện nằm ngay trong file island. Đưa vào kit khi VIZ thứ hai cần.
- **Đường cong** (VIZ sau này, ví dụ hàm mất mát):
  - dùng một `<svg viewBox="0 0 1 1" preserveAspectRatio="none">` lồng bên trong;
  - `path` có `vector-effect="non-scaling-stroke"` để nét không méo;
  - điểm và chữ vẫn ở lớp ngoài.
  - Thêm phần này vào kit khi VIZ đầu tiên cần, không làm sẵn.

### 2.5. Nguồn dữ liệu duy nhất cho bài và VIZ (c)

| Phương án | Ưu | Nhược |
|---|---|---|
| A. JSON hoặc CSV, Python đọc file | Một file duy nhất | Pyodide không đọc được file trong repo. Muốn vậy phải thêm prop cho `PythonRunner` để nạp dữ liệu, và dữ liệu biến mất khỏi đoạn code người đọc nhìn thấy |
| B. Sinh dòng dữ liệu Python từ TS lúc build | Một nguồn | `content-reviewer` không chạy thẳng được `python src/code/...py`. Phải sửa `PythonRunner` |
| **C. TS là nguồn. Code Python chép nguyên các số dưới dòng `# dataset: <id>`. Test so từng số (chọn)** | Người đọc thấy dữ liệu ngay trong code. File `.py` chạy thẳng bằng `python`. Sai một số thì test báo đúng file, đúng dòng | Số nằm ở hai nơi. Hai nơi khớp nhau nhờ test, không nhờ cấu trúc |

Một bộ dữ liệu có bốn chỗ dùng, cả bốn bám vào `src/data/datasets/<id>.ts`:

| Chỗ dùng | Cách lấy | Gì bảo đảm khớp |
|---|---|---|
| Bảng ở phần Trực giác | `<DatasetTable dataset="apartments" />` | Cùng một mảng, không gõ lại |
| VIZ | Wrapper import `APARTMENTS` | Cùng một mảng |
| Code Python | Chép số theo định dạng cố định ngay dưới `# dataset: apartments` | `tests/unit/content/datasets.test.ts` đọc từng file `.py` |
| Số nhắc trong lời văn ("$w \approx$ …") | `content-reviewer` so với fixture Python | `tests/unit/fixtures/linear-fit-python.ts` |

**Định dạng trong code Python** (đây là khuôn, không phải dữ liệu):

```python
import numpy as np

# dataset: apartments
area = np.array([...])  # column 0 of APARTMENTS.rows, same values, same order
rent = np.array([...])  # column 1
```

Quy tắc mà `datasets.test.ts` kiểm tra:

- Dòng đánh dấu đúng là `# dataset: <id>`.
  - Đây là comment nên `code-pairs.test.ts` bỏ qua nó. Test phải kiểm tra **từng** file, cả `.vi.py` lẫn `.en.py`.
- Hai dòng code kế tiếp sau dấu là `<x.python> = np.array([…])` rồi `<y.python> = np.array([…])`.
  - Mỗi mảng nằm trên một dòng. Trong ngoặc chỉ có số (nguyên hoặc thực, có thể âm), cách nhau bằng dấu phẩy. Comment cuối dòng được phép.
- Mỗi số đọc bằng `Number()` phải **bằng đúng** (`===`) giá trị tương ứng trong `rows`: cùng thứ tự, cùng số phần tử. Vì vậy `12.0` và `12` đều khớp với `12`.
- Dòng nào trông giống dấu (`#dataset: x`, `# Dataset: x`) cũng bị kiểm tra, và báo lỗi nếu viết sai khuôn, để không bị bỏ qua trong im lặng.
- Muốn đổi dữ liệu trong một ô (ví dụ thêm điểm ngoại lai, quyết định 21) thì sửa ở dòng sau, ví dụ `np.append(...)`. Không sửa hai dòng đã đánh dấu.
- Với mỗi bài trong trường `lessons` của dataset mà `status.vi = 'published'`: thư mục `src/code/<id bài>/` phải có ít nhất một `.vi.py` mang dấu. Mỗi ô code tự tạo dữ liệu (quyết định 6), nên thường ô nào cũng có dấu.
- Dòng `# dataset:` trỏ tới id không có trong `DATASETS` thì test fail.

**Hàm đọc `.py`:** `checkPythonDatasets(file, source, datasets)` là hàm thuần, nằm ngay trong `tests/unit/content/datasets.test.ts` (không export, không nằm trong `src/`). Hàm nhận chuỗi nguồn và trả `{ markers, errors }`, mỗi lỗi dạng `"<file>:<dòng>: <lỗi>"`. Test chạy hàm trên chuỗi trong bộ nhớ trước, rồi mới chạy trên từng file thật dưới `src/code/`. Khi một test khác cần hàm này, mới chuyển nó ra file riêng.

**Fixture Python.**

- `viz-builder` chạy `python` + NumPy (`np.polyfit`) trên đúng `rows`, rồi chép kết quả vào `tests/unit/fixtures/linear-fit-python.ts`. Fixture ghi lại lệnh đã chạy, phiên bản và ngày (mẫu ở mục 4.5).
- Fixture giữ một bản sao `rows`. Test so bản sao này với `APARTMENTS.rows` trước tiên. Nếu dữ liệu đổi, test báo "dữ liệu đã đổi, chạy lại lệnh trong fixture" thay vì một lỗi lệch số khó hiểu.
- **Python dùng cho fixture và để chạy thử code bài:** venv `C:/Users/Dell/.venvs/ai-atlas-py314`, Python 3.14.5. Gói trong venv ghim đúng phiên bản của Pyodide 314.0.7. Đã kiểm chứng bằng `node_modules/pyodide/pyodide-lock.json`:

  | Gói | venv | Pyodide 314.0.7 |
  |---|---|---|
  | NumPy | 2.4.6 | 2.4.6 |
  | pandas | 3.0.2 | 3.0.2 |
  | scikit-learn | 1.8.0 | 1.8.0 |
  | SciPy | 1.18.0 | 1.18.0 |
  | Matplotlib | 3.10.8 | 3.10.8 |
  | Python | 3.14.5 | 3.14.2 (chỉ khác bản vá) |

  Fixture chỉ dùng NumPy. Python mặc định của máy (lần kiểm tra đầu thấy NumPy 2.5.3, chưa có scikit-learn) **không** dùng cho fixture, vì phiên bản lệch với Pyodide.

### 2.6. Chuỗi giao diện và định dạng số (d)

- **Mỗi VIZ một namespace** tên `viz<Name>` (camelCase), ví dụ `vizLinearFit`.
  - Key có trong `UI_KEYS` (`src/i18n/ui.ts`) và trong cả `vi.json`, `en.json` dưới dạng `atlas.vizLinearFit.<key>`. Schema i18n bắt build lỗi khi thiếu.
  - Wrapper gọi `getStrings(Astro.locals.t, 'vizLinearFit')` rồi truyền xuống island.
  - Island không tự dịch, không nhận `lang`. Không cần `lang` vì số trong VIZ không định dạng theo ngôn ngữ.
- **Những thứ không phải chuỗi giao diện:**
  - Tên trục, đơn vị, tên một điểm ("Một căn hộ") và câu mô tả dữ liệu là **nội dung**. Chúng nằm trong file dataset, dạng `{ vi, en }`, giống tiêu đề bài trong `roadmap.ts`.
  - Ký hiệu toán ($\hat{y}$, $x$) do wrapper render bằng KaTeX từ hằng trong code (`String.raw`), không đặt trong i18n.
- **Chuỗi có `$…$`** được render lúc build bằng `renderInlineMarkup`. Tên truy cập lấy bằng `inlineMarkupLabel` (quyết định 12). Trong JSON, dấu `\` viết thành `\\` theo luật của JSON. Không có bẫy ký tự điều khiển, vì chuỗi không đi qua prop trong MDX.
- **Biến trong chuỗi** dùng `{{name}}`, thay bằng `formatString`. Tập biến của vi và en phải giống nhau (`i18n.test.ts` đã kiểm tra).
- **Số:** dùng `formatNumber(value, digits)` trong `src/lib/viz/format.ts`.
  - Dấu chấm thập phân ở cả vi và en, giống `print()` của Python.
  - Số âm dùng dấu trừ U+2212 "−", giống cách KaTeX hiển thị công thức trong bài. Không bao giờ ra "−0.00".
  - Không tách hàng nghìn.
  - Số chữ số thập phân cố định theo cấu hình (`digits`). Nhờ vậy, cộng với `font-variant-numeric: tabular-nums`, độ rộng của số không đổi khi kéo.
  - Không dùng `Intl.NumberFormat`. `toFixed` cho cùng một chuỗi ở Node lúc build và ở mọi trình duyệt, nên không lệch khi hydrate.
- Khác với `PythonRunner`: `runner.done` dùng `Intl` và ra "1,2 giây". Đó là thời gian nằm trong câu văn giao diện. Còn VIZ hiện số liệu của mô hình, nên phải khớp với code.

### 2.7. Trợ năng (e)

Bắt buộc cho mọi VIZ:

- **Điều khiển là phần tử HTML thật:** `input[type=range]`, `button`, `input[type=checkbox|radio]`. Không tự làm thanh trượt bằng `div`. Phím mũi tên, PageUp/PageDown, Home/End là của trình duyệt, không tự viết.
- **Thanh trượt:**
  - Có `<label for>` nhìn thấy được, có thể chứa KaTeX.
  - Có `aria-label` = `inlineMarkupLabel(nhãn)`. Lý do: Chrome bỏ MathML khi tính tên truy cập (quyết định 12). Chuỗi này khớp chữ nhìn thấy, đạt WCAG 2.5.3.
  - Có `aria-valuetext` = số đã định dạng + đơn vị, ví dụ "0.1500 triệu đồng/tháng cho mỗi m²".
  - Số hiện cạnh nhãn là `<span aria-hidden="true">`. **Không dùng `<output>`**, vì `<output>` có vai trò `status` và sẽ bị đọc mỗi lần giá trị đổi.
- **Nút bật/tắt:** `<button aria-pressed>` với nhãn cố định, như `LessonProgress` ([components.md](../components.md) mục 4.5).
- **Thông báo cho trình đọc màn hình:**
  - Mỗi VIZ có một vùng `aria-live="polite"` ẩn (`sr-only`). Vùng này có sẵn trong HTML từ đầu, để trống.
  - Khi kéo thanh trượt: chỉ đặt chữ vào vùng này sau khi giá trị đứng yên `SETTLE_MS = 600` ms (hook `useSettled`). Kéo liên tục, hay giữ phím mũi tên, chỉ cho **một** lần đọc.
  - Bấm nút: đọc ngay.
  - Lúc mới tải trang: không đọc gì.
  - Các con số nhìn thấy (MSE…) không nằm trong vùng live.
- **Hình:**
  - `<svg role="img" aria-label=… aria-describedby=…>`.
  - Tên ngắn: loại đồ thị, số điểm, hai trục.
  - Mô tả (`sr-only`, lấy từ `description` của dataset): dữ liệu cho thấy điều gì. VIZ có dấu riêng trên đồ thị thì nối thêm một câu nói dấu đó là gì (ở `LinearFitViz`: `meanNote`, mục 4.8).
  - Nhãn trục và vạch chia có `aria-hidden`.
  - Bảng `DatasetTable` trong bài là cách đọc đủ số liệu.
- **Không chỉ dùng màu:** mỗi loại nét khác nhau cả về hình (liền hay đứt, dày hay mỏng, đứng hay xiên), và có chú giải bằng chữ.
- **Tương phản**, đo theo token ở cả chế độ tối và sáng:
  - nét, điểm, trục ≥ 3:1 so với nền vùng vẽ;
  - chữ ≥ 4,5:1.
  - Số đo của `LinearFitViz` ở mục 4.9. E2E đo lại từ màu thật trên trang.
- **Vùng chạm** ≥ 44px. Thanh trượt cao 44px, nút có `min-height: 44px`.
- **Focus:** viền chung `outline: 2px solid var(--sl-color-accent); outline-offset: 2px`.
- **Id:** dùng `useId()` ([components.md](../components.md) mục 2.9).
- Không có hoạt ảnh bắt buộc. Nếu có thì phải có nhánh `prefers-reduced-motion: reduce`.

### 2.8. SSR, không có JS, chống CLS (f)

- **SSR ra đúng trạng thái ban đầu.** Lần render đầu ở trình duyệt phải giống hệt lúc build:
  - không đọc `window`, `localStorage` hay kích thước màn hình trong lúc render;
  - số làm tròn bằng `toFixed`, toạ độ bằng `pct()`.
- **Không có JS**, hoặc trước khi hydrate: người đọc vẫn thấy đủ đồ thị tĩnh ở trạng thái ban đầu (điểm, đường, phần dư, số MSE).
  - Điều khiển có `disabled` cho tới khi hydrate.
  - Có `<noscript>` với `common.needsScript`, giống Quiz.
- **`useHydrated()`** = `useSyncExternalStore(noop, () => true, () => false)`. Hook trả `false` lúc build và trong lần hydrate, rồi `true` ngay sau đó. Không cần effect.
- **Kích thước cố định bằng CSS:**
  - `.atlas-viz-plot { aspect-ratio: 4 / 3 }`, và `3 / 2` khi khung VIZ rộng từ 32rem (container query trên `.atlas-viz`);
  - dòng số có số chữ số cố định, kèm `tabular-nums`;
  - dòng trạng thái giữ chỗ đúng 1 dòng: `min-height: 1lh`, khai báo trước `min-height: 1.75em` làm dự phòng cho trình duyệt chưa hiểu `lh`. Mẫu nét trong chú giải và dòng số cũng cao `1lh` (dự phòng `1.75em`).
- **Phần chỉ hiện sau khi bấm** (ví dụ đường tốt nhất) luôn có trong DOM. Khi tắt thì `visibility: hidden` để giữ chỗ. Phần hiện thêm do thao tác chỉ được đẩy nội dung **nằm dưới** điều khiển vừa dùng.
- **`client:visible={{ rootMargin: '200px' }}`:** island hydrate khi VIZ còn cách màn hình 200px. Nhờ vậy điều khiển đã bật khi người đọc cuộn tới.
  - Đã kiểm chứng: `node_modules/astro/dist/runtime/client/visible.js` (Astro 7.4.2) truyền `rootMargin` cho `IntersectionObserver`.
  - Kiểu `'client:visible'?: ClientVisibleOptions | boolean` có trong `dist/types/public/elements.d.ts`.

### 2.9. Ngân sách (g)

| Mục | Giới hạn | Đo bằng |
|---|---|---|
| Gói npm mới | **0**. Không d3. Hàm tỉ lệ trục chỉ khoảng 20 dòng | `analyst` xem `git diff package.json` |
| JS riêng của island | **≤ 10 KB gzip**. Dự kiến 3–4 KB (để so: `QuizIsland` 1,4 KB, `PythonRunnerIsland` 3,5 KB) | E2E đọc `dist/` (cách tính ở dưới) |
| React | Không tốn thêm. Bài nào cũng có `Quiz`, nên React (`client.*.js`, 65,7 KB gzip) đã có trên trang | |
| CSS | `viz.css` ≤ 2,5 KB gzip, đo sau khi bỏ comment (quyết định 27), chung cho mọi VIZ. Hiện 1 553 byte (61%) | Unit test |
| Props nằm trong HTML | ≤ 8 KB mỗi VIZ (độ dài thuộc tính `props` của `astro-island`) | E2E |
| Tính toán mỗi lần kéo | $O(m)$ với $m \le 12$. Không cần throttle hay `requestAnimationFrame` | |
| Hydrate | `client:visible` (mục 2.8) | E2E |

**"JS riêng"** gồm file `dist/_astro/<Name>Island.*.js` cộng các chunk mà nó import tĩnh và **không** island nào khác (`QuizIsland`, `PythonRunnerIsland`, island VIZ khác) cùng import. Không tính chunk renderer React dùng chung (`client.*.js`, `jsx-runtime.*.js`, `react.*.js`). Nén bằng `zlib.gzipSync` của Node.

**Số đo của `LinearFitViz`** (`dist/` lúc 11:59):

| Mục | Đo được | Giới hạn |
|---|---|---|
| `LinearFitVizIsland.*.js` | 8,9 KB, **3,0 KB gzip** | 10 KB gzip |
| Chunk nó import | `react.*.js`, `jsx-runtime.*.js` (không tính), `format.*.js` (dùng chung với `QuizIsland`, `PythonRunnerIsland`, không tính) | |
| Thuộc tính `props` trong HTML | **7 026 ký tự**, tức 86% giới hạn | 8 KB |

`props` gần chạm ngưỡng vì island nhận đủ 18 chuỗi và HTML KaTeX của nhãn thanh trượt và ký hiệu. VIZ sau có nhiều chữ hơn sẽ vượt (rủi ro 1).

### 2.10. Test (h)

| File | Người viết | Môi trường | Kiểm tra |
|---|---|---|---|
| `tests/unit/viz/viz-math.test.ts` | `viz-builder` | node | `linear-fit.ts`, `scale.ts`, `format.ts` với ví dụ tính tay. Không phụ thuộc dữ liệu thật |
| `tests/unit/content/datasets.test.ts` | `viz-builder` | node | Mọi dataset trong `DATASETS` hợp lệ. Code Python khớp dữ liệu (mục 2.5). Chứa luôn hàm đọc `.py` `checkPythonDatasets` |
| `tests/unit/viz/linear-fit-apartments.test.ts` | `viz-builder` | node | Cấu hình `APARTMENTS_LINEAR_FIT` hợp lệ. Số tính bằng TS khớp fixture Python, kể cả điểm trung bình. Số hiện ra khớp số bài trích |
| `tests/unit/viz/viz-conventions.test.ts` | `viz-builder` | node | Quy tắc file và CSS mục 2.3, ngân sách `viz.css`, không mã màu, dùng `client:visible` |
| `tests/unit/components/linear-fit-viz-island.test.tsx` | `tester` | jsdom | Thanh trượt, nút, vùng live, SSR rồi hydrate không lỗi, không viết cứng chữ |
| `tests/e2e/viz.spec.ts` | `tester` | Chromium | **Chung cho mọi VIZ** trên mọi trang bài đã xuất bản: hydrate khi cuộn tới, 375px, sáng/tối, tương phản, bàn phím, ngân sách JS, chiều cao không đổi khi hydrate |
| `tests/e2e/sample-lesson/linear-fit-viz.spec.ts` | `tester` | Chromium | Hành vi riêng của `LinearFitViz` trên `/vi/ml/linear-regression/` và `/en/ml/linear-regression/`, kể cả khi tắt JS |

Tiêu chí chi tiết từng file ở mục 6. Test chung `viz.spec.ts` lấy danh sách trang từ `roadmap.ts`. Bài nào có `.atlas-viz` thì tự được kiểm tra, không cần viết thêm test cho từng VIZ mới.

### 2.11. Có đặt VIZ lên trang demo `/dev/components/` không (i)

**Không.** Lý do:

1. Trang demo dành cho component dùng chung của M1. VIZ gắn với một bài. Với 60 VIZ, trang demo sẽ phình to, chậm, và Performance của nó đã sát ngưỡng (87–90, quyết định 17).
2. E2E của trang demo đếm cố định 7 island (`ISLANDS = 7` trong `components.spec.ts`). Thêm VIZ thì phải sửa test M1 đang qua.
3. Theo quy trình bài học, bản vi đã `published` trước khi `viz-builder` làm. Vì vậy VIZ được làm và kiểm tra ngay trên trang bài thật, đúng ngữ cảnh: chữ, KaTeX và khoảng cách xung quanh.
4. Bản en dùng được trước khi dịch.
   - Đã đọc `node_modules/@astrojs/starlight/dist/utils/routing/index.js`: trang fallback `/en/...` có `locale: 'en'` và nội dung của bản vi.
   - Vì vậy VIZ trên trang đó hiện chuỗi en giữa bài tiếng Việt. Nhờ đó chuỗi en được test sớm.

Ngoại lệ trong tương lai: một phần của kit không gắn với bài nào cần thử riêng. Khi đó mới tạo trang `/dev/viz/` (`noindex`, ngoài sitemap như quyết định 11). Hiện chưa cần.

### 2.12. Checklist "xong" cho mọi VIZ

`viz-builder` tự kiểm tra trước khi báo xong. `tester` và `analyst` dùng lại danh sách này:

- [ ] Một ý, ghi trong comment một dòng đặt ngay trên thẻ VIZ trong bài (mẫu ở mục 4.10 ý 5). Ký hiệu và công thức khớp bài.
- [ ] Wrapper `.astro` + island trong thư mục kebab-case. MDX không có `client:*`.
- [ ] Không có file CSS riêng, không mã màu. Màu chỉ qua lớp vai trò của `viz.css`.
- [ ] Mọi chữ giao diện có trong namespace `viz<Name>` ở cả vi và en. Nội dung (tên trục, đơn vị) nằm trong dataset.
- [ ] Số dùng `formatNumber`. Dữ liệu dùng chung lấy từ `src/data/datasets/`, code Python có dấu `# dataset:`.
- [ ] Điều khiển là phần tử HTML thật, cao ≥ 44px, có tên truy cập, có `aria-valuetext` (thanh trượt).
- [ ] Có vùng live, chỉ đọc sau khi dừng kéo. SVG có `role="img"`, tên và mô tả.
- [ ] Không có JS vẫn thấy hình tĩnh. Hydrate không làm đổi chiều cao. Không lỗi hydrate trong console.
- [ ] 375px không cuộn ngang ở cả sáng và tối. Tương phản đạt mục 2.7.
- [ ] JS riêng ≤ 10 KB gzip. `viz.css` ≤ 2,5 KB gzip. Không gói npm mới.
- [ ] `npm run build` không `[WARN]`, `npm run check` 0 lỗi 0 cảnh báo, `npm test` qua.
