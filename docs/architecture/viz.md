# Minh họa tương tác (VIZ): quy ước chung và `LinearFitViz`

> Phạm vi: quy ước cho **mọi** minh họa (VIZ) của 78 bài, và đặc tả VIZ đầu tiên: `LinearFitViz` của bài mẫu Hồi quy tuyến tính (mốc M2). Quy ước cho **hình SVG tĩnh** (FIG, 0 JS) ở [mục 8](#8-hình-svg-tĩnh-fig-quy-ước-chung) (mốc M3). Bộ dữ liệu `sine` và `PolyFitViz` của bài Overfitting và Underfitting ở [mục 9](#9-polyfitviz-và-bộ-dữ-liệu-sine-bài-overfitting-và-underfitting) (mốc M3).
> Liên quan: [components.md](components.md) (mẫu wrapper Astro + island React mục 2.1, `useId` mục 2.9, hình thức và tương phản mục 4.9), [scaffold.md](scaffold.md) mục 2.6, 4.5 (chuỗi giao diện), [.claude/agents/viz-builder.md](../../.claude/agents/viz-builder.md).
>
> Viết ngày 23/10/2026. Chỗ ghi "đã kiểm chứng" là đã đọc mã nguồn trong `node_modules` hoặc đo trên `dist/` của bản build cùng ngày, không phải suy đoán.
>
> **Cập nhật cùng ngày, sau V0–V3:** sửa theo code thật của `viz-builder`. Nguồn: mã trong `src/components/viz/`, `src/lib/viz/`, `src/data/datasets/`, `DatasetTable.astro`, các unit test của VIZ, và `dist/` build lúc 11:59 (sau lần sửa code cuối lúc 11:54). Chỗ ghi "đo" là số đo trên các file đó. Riêng chiều cao 947px do `viz-builder` đo trên `npm run preview`, lượt cập nhật này không đo lại.

**Quyết định đầu vào** ([mvp.md](../mvp.md) mục 7):

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
| Chỉ nhìn một hình (sơ đồ khối, quy trình, cây phân loại) | Hình tĩnh (FIG): `src/components/figures/<Name>Figure.astro`, SVG viết tay, theo quy ước [mục 8](#8-hình-svg-tĩnh-fig-quy-ước-chung). **Không** đặt trong `src/components/viz/` | 0 |
| Đọc số liệu | `DatasetTable` hoặc bảng Markdown | 0 |

- **Một VIZ, một ý.** Ý đó viết thành một câu trong comment một dòng, đặt ngay trên thẻ VIZ trong bài (mẫu ở mục 4.10 ý 5).
- Tối đa 1–2 VIZ mỗi bài ([mvp.md](../mvp.md) mục 3).
- VIZ mới chỉ cần thêm mục đặc tả riêng vào file này khi nó thêm phần mới vào kit, `viz.css` hoặc dữ liệu dùng chung. Còn lại, comment VIZ trong bài cộng checklist mục 2.12 là đủ.

### 2.2. File và cách bài dùng VIZ (a)

Giữ đúng mẫu của `Quiz` và `PythonRunner` ([components.md](components.md) mục 2.1) và của `viz-builder.md`. Thêm hai lớp: kit và dữ liệu.

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
| Code Python | Chép số theo định dạng cố định ngay dưới `# dataset: apartments` | `tests/unit/datasets.test.ts` đọc từng file `.py` |
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

**Hàm đọc `.py`:** `checkPythonDatasets(file, source, datasets)` là hàm thuần, nằm ngay trong `tests/unit/datasets.test.ts` (không export, không nằm trong `src/`). Hàm nhận chuỗi nguồn và trả `{ markers, errors }`, mỗi lỗi dạng `"<file>:<dòng>: <lỗi>"`. Test chạy hàm trên chuỗi trong bộ nhớ trước, rồi mới chạy trên từng file thật dưới `src/code/`. Khi một test khác cần hàm này, mới chuyển nó ra file riêng.

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
- **Nút bật/tắt:** `<button aria-pressed>` với nhãn cố định, như `LessonProgress` ([components.md](components.md) mục 4.5).
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
- **Id:** dùng `useId()` ([components.md](components.md) mục 2.9).
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
| `tests/unit/viz-math.test.ts` | `viz-builder` | node | `linear-fit.ts`, `scale.ts`, `format.ts` với ví dụ tính tay. Không phụ thuộc dữ liệu thật |
| `tests/unit/datasets.test.ts` | `viz-builder` | node | Mọi dataset trong `DATASETS` hợp lệ. Code Python khớp dữ liệu (mục 2.5). Chứa luôn hàm đọc `.py` `checkPythonDatasets` |
| `tests/unit/linear-fit-apartments.test.ts` | `viz-builder` | node | Cấu hình `APARTMENTS_LINEAR_FIT` hợp lệ. Số tính bằng TS khớp fixture Python, kể cả điểm trung bình. Số hiện ra khớp số bài trích |
| `tests/unit/viz-conventions.test.ts` | `viz-builder` | node | Quy tắc file và CSS mục 2.3, ngân sách `viz.css`, không mã màu, dùng `client:visible` |
| `tests/unit/linear-fit-viz-island.test.tsx` | `tester` | jsdom | Thanh trượt, nút, vùng live, SSR rồi hydrate không lỗi, không viết cứng chữ |
| `tests/e2e/viz.spec.ts` | `tester` | Chromium | **Chung cho mọi VIZ** trên mọi trang bài đã xuất bản: hydrate khi cuộn tới, 375px, sáng/tối, tương phản, bàn phím, ngân sách JS, chiều cao không đổi khi hydrate |
| `tests/e2e/linear-fit-viz.spec.ts` | `tester` | Chromium | Hành vi riêng của `LinearFitViz` trên `/vi/ml/linear-regression/` và `/en/ml/linear-regression/`, kể cả khi tắt JS |

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

## 3. Cấu trúc file

Trạng thái: các file đánh dấu `done` đã có (V0–V3). Các file `todo` thuộc V4–V5 của `tester`.

```
src/
├─ components/
│  ├─ DatasetTable.astro                 # done: dataset as a Markdown-styled table, 0 JS, one inline style (caption)
│  └─ viz/
│     ├─ viz.css                         # done: the only CSS of every VIZ, last in Starlight's customCss
│     ├─ LinearFitViz.astro              # done: wrapper (the file lessons import)
│     ├─ linear-fit-viz/
│     │  └─ LinearFitVizIsland.tsx       # done: React island: state, SVG marks (incl. CrossMark ×), controls
│     └─ kit/                            # done: shared by VIZ; grows only when a VIZ needs it
│        ├─ PlotFrame.tsx                # axes, ticks, grid (HTML text + % SVG), role="img"
│        ├─ VizSlider.tsx                # label + range input + value, aria-valuetext
│        ├─ use-settled.ts               # value after it stays put SETTLE_MS (live region)
│        └─ use-hydrated.ts              # false at build and while hydrating, then true
├─ data/datasets/
│  ├─ types.ts                           # done: XYDataset, DatasetColumn, Row
│  ├─ index.ts                           # done: DATASETS registry ({ apartments }), DatasetId
│  └─ apartments.ts                      # done: APARTMENTS (10 rows) + APARTMENTS_LINEAR_FIT (section 4.5)
├─ lib/viz/
│  ├─ linear-fit.ts                      # done, pure: Point, predict, residuals, mse, meanPoint, fitLeastSquares,
│  │                                     #   isNearBest, snapToStep, NEAR_BEST_RATIO
│  ├─ scale.ts                           # done, pure: toPercentX/Y, pct, clamp, clipLineToBox
│  └─ format.ts                          # done, pure: MINUS, formatNumber, decimalsOf, lineParts
├─ i18n/ui.ts                            # done: namespace vizLinearFit, 18 keys (section 4.8)
├─ content/i18n/{vi,en}.json             # done: atlas.vizLinearFit.* keys
└─ code/ml/linear-regression/            # lesson code; data lines under "# dataset: apartments"
   └─ normal-equation, sklearn-fit, outlier .{vi,en}.py
astro.config.ts                          # done: './src/components/viz/viz.css' at the end of customCss
tests/unit/
├─ viz-math.test.ts  linear-fit-apartments.test.ts  viz-conventions.test.ts   # done
├─ datasets.test.ts                      # done; holds the .py reader checkPythonDatasets (section 2.5)
├─ linear-fit-viz-island.test.tsx        # todo: jsdom (tester, V4)
└─ fixtures/linear-fit-python.ts         # done: numbers from Python, with the command that made them
tests/e2e/
├─ viz.spec.ts                           # todo (V5): every .atlas-viz on every published lesson page
└─ linear-fit-viz.spec.ts                # todo (V5): LinearFitViz behaviour, vi + en, JS off
```

`DatasetTable.astro` nằm ngay dưới `src/components/`, không nằm trong `viz/`, vì nó không phải minh họa và không có JS. Nó không có lớp `not-content`, nên tự nhận style bảng có sẵn của Starlight (`.sl-markdown-content table`, đã đọc `markdown.css`).

- Không có file CSS riêng. Chỗ duy nhất có style là `<caption style="text-align: start">`. Trình duyệt mặc định căn giữa `caption`, còn chữ còn lại của trang căn đầu dòng. Khai báo này không có màu, nên không phạm quy tắc màu ở mục 2.3.
- Ô số có `align="right"` ở cả `th` và `td`. Tiêu đề cột là `th scope="col"`, dạng "Diện tích (m²)".
- `dataset` không có trong `DATASETS` thì build lỗi, thông báo có id trang và danh sách id hợp lệ.

## 4. Giao diện

### 4.1. Dữ liệu: `src/data/datasets/`

```ts
// src/data/datasets/types.ts — shapes only. Relative imports: Playwright e2e imports these files too.
import type { LessonId, Localized } from '../roadmap';

export type Row = readonly [x: number, y: number];

export interface DatasetColumn {
  name: Localized;   // axis title and table header, e.g. { vi: 'Diện tích', en: 'Floor area' }
  unit: Localized;   // e.g. { vi: 'm²', en: 'm²' }
  digits: number;    // decimals in the table; every value must already have at most this many
  python: string;    // variable name in the lesson code, e.g. 'area'; a valid Python identifier
}

export interface XYDataset {
  id: string;                    // registry key, and the "# dataset: <id>" marker in src/code/
  lessons: readonly LessonId[];  // lessons whose code must carry this data (section 2.5)
  caption: Localized;            // DatasetTable caption; says so when the numbers are made up
  itemLabel: Localized;          // what one point is, for the legend: { vi: 'Một căn hộ', en: 'One apartment' }
  description: Localized;        // 1–2 sentences for screen readers: what the cloud of points shows
  x: DatasetColumn;
  y: DatasetColumn;
  rows: readonly Row[];          // table order; the Python arrays list the same numbers in the same order
}
```

```ts
// src/data/datasets/index.ts
import { APARTMENTS } from './apartments';
import type { XYDataset } from './types';

export const DATASETS = { apartments: APARTMENTS } as const satisfies Record<string, XYDataset>;
export type DatasetId = keyof typeof DATASETS;
```

Khuôn dưới đây là bản trước khi có số. Bản thật trong `apartments.ts` có 10 dòng, từ `[25, 6.7]` tới `[85, 16.8]`. Cấu hình VIZ đã chọn ở mục 4.5.

```ts
// src/data/datasets/apartments.ts — the one copy of the apartment table (decision 19).
// Used by DatasetTable (Intuition), LinearFitViz (Illustration) and src/code/ml/linear-regression/*.py
// (kept equal by tests/unit/datasets.test.ts). Numbers are chosen by lesson-writer; none are given here.
import type { XYDataset } from './types';
import type { LinearFitConfig } from '../../lib/viz/linear-fit';

export const APARTMENTS = {
  id: 'apartments',
  lessons: ['ml/linear-regression'],
  caption: { vi: '…', en: '…' },        // must say the numbers are made up for the lesson
  itemLabel: { vi: 'Một căn hộ', en: 'One apartment' },
  description: { vi: '…', en: '…' },
  x: { name: { vi: 'Diện tích', en: 'Floor area' }, unit: { vi: 'm²', en: 'm²' }, digits: 0, python: 'area' },
  y: {
    name: { vi: 'Giá thuê', en: 'Rent' },
    unit: { vi: 'triệu đồng/tháng', en: 'million VND/month' },
    digits: 1,
    python: 'rent',
  },
  rows: [/* [area, rent], 8–12 rows */],
} as const satisfies XYDataset;

// Chosen by viz-builder once the rows exist (task V1); constraints below, final values in section 4.5.
export const APARTMENTS_LINEAR_FIT: LinearFitConfig = { /* … */ };
```

**Ràng buộc của `APARTMENTS_LINEAR_FIT`** (`linear-fit-apartments.test.ts` kiểm tra hết; `best` là `fitLeastSquares(rows)`, `mean` là `meanPoint(rows)`):

| Ràng buộc | Vì sao |
|---|---|
| `rows.length` từ 8 đến 12. Mọi giá trị hữu hạn và có không quá `digits` chữ số thập phân | Quyết định 19. Bảng không làm tròn ngầm |
| `xDomain[0] === 0` | $b$ là chỗ đường thẳng cắt trục tung, người đọc **thấy** được |
| Mọi điểm nằm trong miền, cách mép ít nhất 2% bề rộng miền | Điểm không nằm sát mép |
| `yDomain` chứa `best.b` và `b.initial` | Thấy được chỗ cắt trục tung của cả hai đường |
| Với cả `w` và `b`: `min ≤ initial ≤ max`; `(max − min) / step` và `(initial − min) / step` là số nguyên (sai số 1e-9) | Thanh trượt có lưới đều, giá trị đầu nằm trên lưới |
| `best.w`, `best.b` nằm trong khoảng của thanh trượt, cách mỗi đầu ít nhất 2 bước | Người đọc kéo tới được đường tốt nhất |
| `mean` nằm trong miền $x$ và miền $y$ | Dấu × của điểm trung bình nằm trong vùng vẽ (quyết định 24) |
| Với **mọi** $w$ trên lưới thanh trượt: $b = \bar{y} - w\bar{x}$ nằm trong `[b.min, b.max]`, và cách điểm lưới gần nhất của $b$ không quá nửa bước | Ở mọi độ dốc, người đọc đặt được đường thẳng đi qua (gần) điểm trung bình (quyết định 24) |
| `mse(initial) ≥ 2 × best.mse` | Lúc đầu còn nhiều chỗ để cải thiện |
| MSE tại mọi điểm của lưới thanh trượt ≥ `best.mse`. MSE nhỏ nhất trên lưới ≤ `best.mse × NEAR_BEST_RATIO`, và khi làm tròn theo `digits.mse` không nhỏ hơn số của đường tốt nhất | Dòng "Rất gần đường tốt nhất" đạt được. Số của bạn không bao giờ hiện nhỏ hơn số của đường tốt nhất |
| Vạch chia tăng dần, nằm trong miền, có cả hai đầu miền | |
| `digits.w ≥ decimalsOf(w.step)`, `digits.b ≥ decimalsOf(b.step)`. `digits.mse`, `digits.meanX`, `digits.meanY` là số nguyên ≥ 0 | Số hiện ra đúng bằng giá trị thanh trượt |
| `formatNumber(mean.x, digits.meanX)` và `formatNumber(mean.y, digits.meanY)` bằng đúng giá trị (sai số 1e-9), không làm tròn | Điểm trung bình hiện đúng như bài viết: (52.4, 10.92) |
| Số hiện ra bằng số bài trích: `0.1695`, `2.04`, MSE `0.3615`, MSE ban đầu `10.5020`, `(52.4, 10.92)` | Bài, VIZ và output code nói cùng một số. Đổi dữ liệu hay `digits` thì test này báo phải sửa lời văn |

`yDomain` không cần chứa `b.min`. Khi $b < 0$, phần đường nằm dưới $y = 0$ bị cắt ở mép vùng vẽ (`clipLineToBox`), phần dư bị kẹp ở mép (mục 4.6).

Gợi ý (không bắt buộc): bắt đầu từ đường nằm ngang $w = 0$, với $b$ gần giá thuê trung bình. Người đọc nghiêng dần đường lên và thấy MSE giảm. Cấu hình đã chọn làm đúng như vậy (mục 4.5).

### 4.2. Toán và tỉ lệ trục: `src/lib/viz/`

```ts
// src/lib/viz/linear-fit.ts — pure, no DOM, relative imports only
import type { Row } from '../../data/datasets/types';

export interface Line { w: number; b: number }
export interface BestFit extends Line { mse: number }
export interface Point { x: number; y: number }
export interface SliderSpec { min: number; max: number; step: number; initial: number }
export interface LinearFitConfig {
  w: SliderSpec;
  b: SliderSpec;
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  xTicks: readonly number[];
  yTicks: readonly number[];
  // Fixed decimals of every shown number; meanX, meanY for the mean point (x̄, ȳ).
  digits: { w: number; b: number; mse: number; meanX: number; meanY: number };
}

/** "Very close to the best line" when mse <= best.mse * NEAR_BEST_RATIO. */
export const NEAR_BEST_RATIO = 1.05;

export function predict(line: Line, x: number): number;              // w * x + b
export function residuals(rows: readonly Row[], line: Line): number[]; // y - ŷ, same sign as the lesson
export function mse(rows: readonly Row[], line: Line): number;         // (1/m) Σ (ŷ - y)²; throws on no rows
/** The mean point (x̄, ȳ); the least-squares line always passes through it. Throws on no rows. */
export function meanPoint(rows: readonly Row[]): Point;
/** Closed form for one feature: w = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)², b = ȳ - w x̄ (x̄, ȳ from meanPoint).
 *  Throws (clear message) on fewer than 2 rows or when every x is the same. */
export function fitLeastSquares(rows: readonly Row[]): BestFit;
export function isNearBest(value: number, best: number): boolean;
/** Snaps to the slider grid, then to the decimals of step and min: range inputs may report
 *  0.30000000000000004. Not a finite number → spec.initial. */
export function snapToStep(value: number, spec: SliderSpec): number;
```

```ts
// src/lib/viz/scale.ts — pure
import type { Line } from './linear-fit';

export type Domain = readonly [min: number, max: number];
export interface Segment { x1: number; y1: number; x2: number; y2: number } // data units

export function toPercentX(x: number, domain: Domain): number; // 0 at min, 100 at max
export function toPercentY(y: number, domain: Domain): number; // 100 at min (bottom), 0 at max: SVG y grows down
/** Two decimals and '%', e.g. "42.86%": the same string at build time and in every browser. */
export function pct(value: number): string;
export function clamp(value: number, domain: Domain): number;
/** The part of y = w x + b inside the box, or null when the line misses it. */
export function clipLineToBox(line: Line, x: Domain, y: Domain): Segment | null;
```

```ts
// src/lib/viz/format.ts — pure. Same output in vi and en (section 2.6).
export const MINUS = '−'; // U+2212
/** toFixed with a decimal point, U+2212 for negatives, never "−0.00". Throws on a non-finite value. */
export function formatNumber(value: number, digits: number): string;
/** 0.005 → 3, 0.1 → 1, 1 → 0. */
export function decimalsOf(step: number): number;
/** Pieces of "ŷ = 0.1695x + 2.04": the island wraps them around the KaTeX symbols. */
export function lineParts(line: Line, digits: { w: number; b: number }): { w: string; sign: '+' | '−'; b: string };
```

### 4.3. Kit: `src/components/viz/kit/`

```tsx
// src/components/viz/kit/PlotFrame.tsx — no state; also renders without client:* for a static VIZ.
export interface PlotFrameProps {
  xDomain: Domain;
  yDomain: Domain;
  xTicks: readonly number[];   // formatted with formatNumber, decimals = max decimalsOf(tick)
  yTicks: readonly number[];
  xTitle: string;              // "Diện tích (m²)": name + " (" + unit + ")"
  yTitle: string;
  label: string;               // aria-label of the <svg role="img">
  describedBy?: string;        // id of an sr-only description
  children: React.ReactNode;   // SVG marks, positioned with pct(toPercentX(...)) / pct(toPercentY(...))
}
// Layout (CSS grid on .atlas-viz-chart, areas 't t' / 'y p' / '. x' / '. u'):
//   .atlas-viz-axis-title.atlas-viz-ytitle (y title on top, horizontal, no rotated text)
//   .atlas-viz-yticks | .atlas-viz-plot > svg.atlas-viz-svg[role=img]
//   .atlas-viz-xticks, then .atlas-viz-axis-title.atlas-viz-xtitle (aligned to the end)
// Tick labels and titles are HTML with aria-hidden="true". Inside the SVG: a grid line at every tick except
// the domain minimum (the axis is drawn there), then the x axis (bottom) and the y axis (left), then children.
// The y tick column width comes from the longest label: style={{ '--atlas-viz-ytick-ch': n }}.
```

```tsx
// src/components/viz/kit/VizSlider.tsx
export interface VizSliderProps {
  id: string;            // from useId()
  labelHtml: string;     // renderInlineMarkup output (trusted: build time, repo content)
  ariaLabel: string;     // inlineMarkupLabel output (decision 12)
  spec: SliderSpec;
  value: number;
  display: string;       // formatted value next to the label, aria-hidden (aria-valuetext says it)
  valueText: string;     // aria-valuetext
  disabled: boolean;     // !useHydrated()
  onChange: (value: number) => void; // already snapped with snapToStep
}
// DOM: div (no class: one cell of the .atlas-viz-controls grid, so the label row sits right on its input)
//        div.atlas-viz-control-head: <label for={id}> (KaTeX HTML) + span.atlas-viz-num[aria-hidden] (display)
//        input#id.atlas-viz-slider[type=range][aria-label][aria-valuetext]
```

```ts
// src/components/viz/kit/use-settled.ts
export const SETTLE_MS = 600;
/** `value` once it has stayed the same for `delay` ms; undefined until the first change after mount.
 *  Compared with Object.is: pass a primitive (LinearFitViz passes the string `${w} ${b}`), not a fresh object. */
export function useSettled<T>(value: T, delay?: number): T | undefined;

// src/components/viz/kit/use-hydrated.ts
/** false at build time and during hydration, true right after (useSyncExternalStore). */
export function useHydrated(): boolean;
```

### 4.4. `viz.css`: lớp và token vai trò

Mọi lớp có tiền tố `atlas-viz-`. Màu gắn với **vai trò** qua biến khai báo trên `.atlas-viz` (không khai báo trên `:root`). Biến chỉ trỏ tới token có sẵn, không có mã màu nào.

| Biến vai trò | Trỏ tới | Dùng cho |
|---|---|---|
| `--atlas-viz-plot-bg` | `--sl-color-bg` | Nền vùng vẽ. Vùng vẽ nằm trong khối `--sl-color-gray-6`, là bậc thứ hai như đáp án trong Quiz |
| `--atlas-viz-ink` | `--sl-color-white` | Điểm dữ liệu, nét chính trung tính |
| `--atlas-viz-primary` | `--sl-color-accent` | Thứ người đọc điều khiển (đường của bạn) |
| `--atlas-viz-reference` | `--sl-color-blue-high` | Thứ tính sẵn để so sánh (đường tốt nhất) |
| `--atlas-viz-error` | `--sl-color-red-high` | Sai số, phần dư, mất mát |
| `--atlas-viz-muted` | `--sl-color-gray-3` | Trục, vạch chia, chữ phụ |
| `--atlas-viz-grid` | `--sl-color-gray-5` | Lưới, chỉ để trang trí |

Bảng dưới khớp `viz.css` sau V2–V3 (đã đọc file).

| Lớp | Việc |
|---|---|
| `.atlas-viz` | Khối: nền `--sl-color-gray-6`, chữ `--sl-color-text`, `padding: 16px` (20px khi màn từ 50rem, `@media`), `container-type: inline-size`, khai báo các biến ở trên |
| `.atlas-viz-figure` | `<figure>` của island: lưới một cột, `gap: 16px`, `margin: 0` |
| `.atlas-viz-caption` | `figcaption`, chữ base, `--sl-color-text` |
| `.atlas-viz-chart` | Lưới của `PlotFrame`: cột vạch chia $y$ rộng `--atlas-viz-ytick-ch` × 1ch + 8px, cột vùng vẽ; `padding-inline-end: 2ch` để nhãn vạch chia cuối không đẩy trang |
| `.atlas-viz-plot`, `.atlas-viz-svg` | Vùng vẽ nền `--atlas-viz-plot-bg`, `aspect-ratio` 4/3, 3/2 khi khung ≥ 32rem (container query); SVG phủ kín, `overflow: visible` |
| `.atlas-viz-axis-title`, `.atlas-viz-xticks`, `.atlas-viz-yticks` | Chữ sm, `--atlas-viz-muted`, `tabular-nums`. Nhãn vạch chia là `span` đặt tuyệt đối theo `%`. Hàng vạch chia $x$ cao 2em |
| `.atlas-viz-ytitle` | Tên trục $y$, nằm ngang ở hàng trên cùng, `margin-bottom: 12px` |
| `.atlas-viz-xtitle` | Tên trục $x$, hàng dưới cùng, căn cuối dòng |
| `.atlas-viz-grid-line`, `.atlas-viz-axis` | Nét 1px, `shape-rendering: crispEdges` |
| `.atlas-viz-point` | `fill: --atlas-viz-ink`, viền 2px màu `--atlas-viz-plot-bg` để tách điểm khỏi đường đi qua nó. Trong mẫu chú giải thì bỏ viền |
| `.atlas-viz-primary` | Nét liền 3px |
| `.atlas-viz-reference` | Nét đứt 3px, `stroke-dasharray: 8 6` |
| `.atlas-viz-error` | Nét liền 2px |
| `.atlas-viz-marker` | Dấu tính sẵn để người đọc tìm (điểm trung bình, sau này có thể là điểm cực tiểu): nét `--atlas-viz-ink` 3px |
| `.atlas-viz-halo` | Nền dưới `.atlas-viz-marker`: nét `--atlas-viz-plot-bg` 7px, để dấu × vẫn đọc được khi có đường chạy qua. Chỉ trang trí, không đo tương phản |
| `.atlas-viz-key` | Chú giải: `ul` không dấu đầu dòng, `flex-wrap`, chữ sm `--atlas-viz-muted` |
| `.atlas-viz-swatch` | Mẫu nét: SVG rộng 24px, cao `1lh` (dự phòng `1.75em`), vẽ bằng đúng lớp vai trò của nét trên đồ thị |
| `.atlas-viz-readouts` | Hai dòng số trên cùng một lưới 3 cột (mẫu nét 24px, chữ, số MSE), nên hai số MSE thẳng hàng trên dưới. Chữ `--sl-color-white` |
| `.atlas-viz-readout` | Một dòng số, `display: contents` để ba phần của nó vào thẳng lưới của `.atlas-viz-readouts` |
| `.atlas-viz-readout-text` | Tên dòng và phương trình, `flex-wrap` để xuống hàng trên màn hẹp |
| `.atlas-viz-num` | Số: `tabular-nums`, `white-space: nowrap`. Số MSE ở cột cuối căn cuối dòng |
| `.atlas-viz-controls` | Nhóm thanh trượt (`role="group"`), lưới `gap: 8px`. Mỗi `VizSlider` là một `div` không lớp trong lưới này (dòng nhãn + `input`). Test chọn từng thanh trượt bằng vai trò `slider` và tên |
| `.atlas-viz-control-head` | Dòng nhãn: nhãn bên trái, số (`--sl-color-white`) bên phải, `flex-wrap` |
| `.atlas-viz-slider` | `width: 100%`, `height: 44px`, `margin: 0`, `accent-color: var(--sl-color-accent)` |
| `.atlas-viz :focus-visible` | Viền focus chung (mục 2.7) |
| `.atlas-viz-toggle`, `.atlas-viz-toggle-box` | Nút bật/tắt (mục 4.7). Thanh 4px khi bật là `border-inline-start`, khi tắt vẫn có nhưng trong suốt, nên chữ không xê dịch |
| `.atlas-viz-status` | Dòng trạng thái, giữ chỗ đúng 1 dòng: `min-height: 1lh` (dự phòng `1.75em`) |
| `.atlas-viz-near` | Dòng `nearBest`: `.atlas-check` + chữ `--sl-color-green-high`, đậm 600 |
| `.atlas-viz-noscript` | Như `.atlas-quiz-noscript`: thanh 4px `--sl-color-orange-high` ở đầu dòng, chữ `--sl-color-text` |
| `[data-off]` trong VIZ | `visibility: hidden`: giữ chỗ cho phần đang tắt |

Hình khối theo [components.md](components.md) mục 4.9.1: góc vuông, không bóng, không gradient, không viền 1px quanh khối.

### 4.5. `LinearFitViz`: wrapper và island

```astro
---
// src/components/viz/LinearFitViz.astro — sketch, not the full implementation
import LinearFitVizIsland, { type AxisText } from './linear-fit-viz/LinearFitVizIsland';
import { APARTMENTS, APARTMENTS_LINEAR_FIT } from '@data/datasets/apartments';
import type { DatasetColumn } from '@data/datasets/types';
import { getStrings } from '@i18n/ui';
import { inlineMarkupLabel, renderInlineMarkup } from '@lib/inline-markup';
import { getPageLocale } from '@lib/page-locale';
import { fitLeastSquares, meanPoint } from '@lib/viz/linear-fit';

const route = Astro.locals.starlightRoute;
const locale = getPageLocale(route); // src/lib/page-locale.ts, shared by every wrapper
const strings = getStrings(Astro.locals.t, 'vizLinearFit');
const tCommon = getStrings(Astro.locals.t, 'common');
const { x, y } = APARTMENTS;
const best = fitLeastSquares(APARTMENTS.rows); // build time; bad data fails the build
const axis = (column: DatasetColumn): AxisText => ({
  name: column.name[locale],
  unit: column.unit[locale],
  title: `${column.name[locale]} (${column.unit[locale]})`,
});
---

<div class="atlas-viz not-content" lang={locale} data-pagefind-ignore>
  <LinearFitVizIsland
    client:visible={{ rootMargin: '200px' }}
    rows={APARTMENTS.rows}
    config={APARTMENTS_LINEAR_FIT}
    best={best}
    mean={meanPoint(APARTMENTS.rows)}
    axes={{ x: axis(x), y: axis(y) }}
    itemLabel={APARTMENTS.itemLabel[locale]}
    description={APARTMENTS.description[locale]}
    labels={{
      wHtml: renderInlineMarkup(strings.wLabel), wText: inlineMarkupLabel(strings.wLabel),
      bHtml: renderInlineMarkup(strings.bLabel), bText: inlineMarkupLabel(strings.bLabel),
    }}
    symbols={{ yHat: renderInlineMarkup(String.raw`$\hat{y}$`), x: renderInlineMarkup('$x$') }}
    strings={strings}
  />
  <noscript><p class="atlas-viz-noscript">{tCommon.needsScript}</p></noscript>
</div>
```

```ts
// src/components/viz/linear-fit-viz/LinearFitVizIsland.tsx
export interface AxisText {
  name: string;  // "Diện tích": in the plot's accessible name (plotLabel {{x}}, {{y}})
  unit: string;  // "m²": in aria-valuetext
  title: string; // "Diện tích (m²)": the visible axis title
}
export interface LinearFitVizIslandProps {
  rows: readonly Row[];
  config: LinearFitConfig;
  best: BestFit;                              // fitLeastSquares(rows), computed by the wrapper
  mean: Point;                                // meanPoint(rows): the best line passes through it (decision 24)
  axes: { x: AxisText; y: AxisText };
  itemLabel: string;
  description: string;
  labels: { wHtml: string; wText: string; bHtml: string; bText: string };
  symbols: { yHat: string; x: string };       // KaTeX HTML, build time
  strings: UiStrings<'vizLinearFit'>;
}
export default function LinearFitVizIsland(props: LinearFitVizIslandProps): React.JSX.Element;

// State: w = config.w.initial, b = config.b.initial, showBest = false, live = ''. hydrated = useHydrated().
// Derived every render: yourMse = mse(rows, { w, b }), near = isNearBest(yourMse, best.mse).
// Live region: settled = useSettled(`${w} ${b}`); a ref keeps the last position spoken, so a reading
// cancelled by "Show the best line" never follows it.
// Ids: const uid = useId() → `${uid}-w`, `${uid}-b`, `${uid}-desc` (components.md 2.9).
// Local helpers in the same file: LineMark (clipped line), Equation, CrossMark (× at a % position), Swatch.
```

```ts
// tests/unit/fixtures/linear-fit-python.ts — written by viz-builder in task V1 (shape; real numbers in 4.5.1)
// Python 3.14.5 + NumPy 2.4.6 (the NumPy version Pyodide 314.0.7 ships), <date>, run from an empty folder
// with the venv of section 2.5. Command (x, y = the two columns of `rows`; W0, B0 = initial w, b):
//   python -I -c "import numpy as np; x=np.array([...]); y=np.array([...]); W0, B0 = ...;
//     w,b=np.polyfit(x,y,1); print(repr(float(w)), repr(float(b)),
//     repr(float(np.mean((w*x+b-y)**2))), repr(float(np.mean((W0*x+B0-y)**2))))"
// The fixture also records the same line by np.linalg.solve, the one-feature formula and np.linalg.lstsq
// (they differ in the last digits only), and x.mean(), y.mean().
export const PYTHON_LINEAR_FIT = {
  rows: [/* copy of APARTMENTS.rows the numbers were computed from */],
  best: { w: 0, b: 0, mse: 0 },
  initial: { w: 0, b: 0, mse: 0 },
  mean: { x: 0, y: 0 },                  // x.mean(), y.mean()
} as const;
```

#### 4.5.1. Cấu hình đã chọn: `APARTMENTS_LINEAR_FIT` (V1)

```ts
// src/data/datasets/apartments.ts (excerpt)
export const APARTMENTS_LINEAR_FIT: LinearFitConfig = {
  w: { min: 0, max: 0.4, step: 0.005, initial: 0 },
  b: { min: -10.5, max: 12, step: 0.1, initial: 10.9 },
  xDomain: [0, 100],
  yDomain: [0, 20],
  xTicks: [0, 20, 40, 60, 80, 100],
  yTicks: [0, 5, 10, 15, 20],
  digits: { w: 4, b: 2, mse: 4, meanX: 1, meanY: 2 },
};
```

Số tham chiếu (fixture, Python 3.14.5 + NumPy 2.4.6): đường tốt nhất $w = 0.16947…$, $b = 2.03942…$, MSE $0.36147…$; điểm trung bình $(\bar{x}, \bar{y}) = (52.4, 10.92)$. Lượt cập nhật này đã chạy lại phép tính lưới bằng NumPy trong venv và ra cùng số.

| Lựa chọn | Lý do |
|---|---|
| $w$ từ 0 tới 0.4, bước 0.005 (81 giá trị) | Bắt đầu từ đường nằm ngang. $w^\ast \approx 0.1695$ nằm khoảng giữa, cách hai đầu nhiều bước |
| $b$ ban đầu 10.9, $w$ ban đầu 0 | Đường ngang gần giá thuê trung bình (10.92), là "đường A" trong phần Trực giác của bài. MSE ban đầu 10.5020, gấp 29 lần MSE nhỏ nhất |
| $b_{min} = -10.5$ (quyết định 24) | Đường qua điểm trung bình cần $b = \bar{y} - w\bar{x} = 10.92 - 52.4w$. Ở đầu phải của thanh trượt, $w = 0.4$, giá trị này là $-10.04$. Vậy $b_{min}$ phải $\le -10.04$ để người đọc giữ được đường qua điểm trung bình ở **mọi** $w$. Chọn $-10.5$: số tròn, có dư, và $(b_{max} - b_{min}) / 0.1 = 225$, $(10.9 - b_{min}) / 0.1 = 214$ là số nguyên, đúng ràng buộc lưới |
| $b_{max} = 12$, bước 0.1 (226 giá trị) | Ở $w = 0$, đường qua điểm trung bình cần $b = 10.92 \le 12$ |
| Miền $x$ 0–100, $y$ 0–20 | $x$ bắt đầu từ 0 để thấy $b$ là chỗ cắt trục tung. Mọi điểm cách mép ≥ 2% bề rộng miền. $y$ chứa $b^\ast = 2.04$ và $b$ ban đầu 10.9. Khi $b < 0$, đường bị cắt ở mép dưới |
| `digits` $w$: 4, $b$: 2, MSE: 4, $\bar{x}$: 1, $\bar{y}$: 2 | Đường tốt nhất hiện "$\hat{y}$ = 0.1695$x$ + 2.04", MSE 0.3615, đúng số bài và output ô code phương trình chuẩn. Điểm trung bình hiện (52.4, 10.92), đúng giá trị, không làm tròn |
| Điểm lưới gần nhất | $w = 0.17$, $b = 2.0$: MSE 0.36172, gấp 1.0007 lần MSE nhỏ nhất, nên dòng "Rất gần đường tốt nhất" đạt được. Làm tròn 4 chữ số ra 0.3617, không nhỏ hơn 0.3615 |

### 4.6. `LinearFitViz`: hành vi

**Trên đồ thị**, vẽ từ dưới lên (cái sau đè cái trước):

1. Lưới và trục (`PlotFrame`).
2. Phần dư: với mỗi điểm $(x^{(i)}, y^{(i)})$, một đoạn **thẳng đứng** từ điểm tới $\hat{y}^{(i)} = w x^{(i)} + b$. Đầu mút được kẹp vào miền $y$. Đoạn luôn có, kể cả khi dài 0, nên số đoạn luôn bằng số điểm.
3. Đường tốt nhất. Luôn có trong DOM, có `data-off` khi đang tắt.
4. Đường của bạn: phần của $y = wx + b$ nằm trong khung (`clipLineToBox`). Không có phần nào trong khung thì không vẽ đường, còn phần dư vẫn kéo tới mép khung.
5. Dấu × của điểm trung bình $(\bar{x}, \bar{y})$ (quyết định 24): hai nét chéo dài 12px, `.atlas-viz-marker` đè lên `.atlas-viz-halo`, đặt bằng SVG lồng (mục 2.4). Luôn hiện, không phụ thuộc nút. Nó nằm trên các đường, để người đọc thấy rõ đường của mình có đi qua nó hay không.
6. Điểm dữ liệu, trên cùng.

Trong `.atlas-viz-plot` vì vậy có: N `circle.atlas-viz-point`, N `line.atlas-viz-error` (N = `rows.length`), 1 `line.atlas-viz-reference`, 1 `line.atlas-viz-primary` (khi đường còn cắt khung), 2 `line.atlas-viz-halo` và 2 `line.atlas-viz-marker`. **Chú giải và dòng số dùng cùng các lớp này cho mẫu nét**, nên đếm trên cả `.atlas-viz` sẽ ra nhiều hơn: `circle.atlas-viz-point` và `line.atlas-viz-error` mỗi loại thêm 1, `line.atlas-viz-primary` và `line.atlas-viz-reference` mỗi loại thêm 1, `line.atlas-viz-marker` thêm 2.

**Thanh trượt $w$ và $b$:**

- Mỗi lần giá trị đổi (`input`): giá trị được `snapToStep`, rồi đường, phần dư và dòng "Đường của bạn" vẽ lại **ngay**.
- Vùng live chờ `useSettled` (600 ms) rồi mới đọc `announce`. Nếu đang rất gần đường tốt nhất thì nối thêm `nearBest` vào sau.
- `aria-valuetext`: `wValueText` hoặc `bValueText`, với `{{value}}` đã định dạng.

**Nút "Hiện đường tốt nhất"** (`aria-pressed`, nhãn cố định):

- Bật:
  - đường tốt nhất trên đồ thị hết `data-off`;
  - dòng số của nó (`.atlas-viz-readout` thứ hai, đang giữ chỗ bằng `data-off`) hiện ra. Mẫu nét đứt ở đầu dòng này là chú giải của đường tốt nhất. Chú giải tĩnh `.atlas-viz-key` **không** có mục cho đường tốt nhất;
  - dòng trạng thái có `bestNote`;
  - vùng live đọc ngay `announceBest`, đồng thời hủy lần đọc `announce` đang chờ.
- Tắt: ẩn lại các phần trên. Không đọc thêm gì: trình đọc màn hình đã báo trạng thái "không nhấn". Vùng live được xóa về rỗng (`setLive('')`), để lần bật sau đổi chữ và được đọc lại, kể cả khi `announceBest` giống hệt lần trước.
- Đường tốt nhất **không** có phần dư riêng. Phần dư luôn thuộc đường của bạn.

**Điểm trung bình** (quyết định 24):

- Dấu × luôn hiện. Chú giải tĩnh có mục `meanPoint`, ví dụ "Điểm trung bình (52.4, 10.92)".
- Mô tả `sr-only` của SVG là `description` của dataset, nối thêm `meanNote`.
- Không có tương tác riêng. Gợi ý trong bài: tăng $w$ rồi chỉnh $b$ cho đường đi qua dấu ×. Nhờ `b.min = −10.5`, việc này làm được ở mọi $w$ trên thanh trượt (mục 4.5.1).

**Dòng trạng thái**, nằm dưới nút:

- `nearBest`, có dấu ✓ (`p.atlas-viz-near`), khi `yourMse ≤ best.mse × 1.05`;
- `bestNote`, khi đang bật đường tốt nhất;
- có thể hiện cả hai dòng;
- hai dòng này chỉ có trong DOM khi hiện (render có điều kiện, không dùng `data-off`). Khối giữ chỗ đúng 1 dòng (`min-height: 1lh`). Khi hiện cả hai dòng, khối cao thêm 1 dòng, nhưng chỉ đẩy phần nằm dưới nút.

Câu `bestNote` đúng về toán: MSE là hàm lồi theo $(w, b)$, nên nghiệm bình phương tối thiểu là cực tiểu toàn cục. Làm tròn cũng giữ thứ tự, nên số MSE hiện ra của bạn không bao giờ nhỏ hơn số của đường tốt nhất.

**Trước khi hydrate và khi không có JS:**

- đồ thị ở trạng thái ban đầu;
- thanh trượt và nút có `disabled`;
- có `<noscript>`.

### 4.7. `LinearFitViz`: bố cục và hình thức

Thứ tự từ trên xuống. Trên điện thoại vẫn giữ thứ tự này, các dòng tự xuống hàng (`flex-wrap`).

1. **Chú thích** (`figcaption`): `caption`.
2. **Đồ thị** (`PlotFrame`): tên trục $y$ nằm ngang ở trên, vạch chia, vùng vẽ, vạch chia $x$, tên trục $x$.
3. **Chú giải tĩnh** (`ul.atlas-viz-key`, 3 mục `li`), tự xuống hàng, chữ sm:
   - ● `itemLabel`;
   - × `meanPoint`, với `{{x}}`, `{{y}}` là $\bar{x}$, $\bar{y}$ đã định dạng: "Điểm trung bình (52.4, 10.92)";
   - ┃ `residual`.
4. **Dòng số** (`.atlas-viz-readouts`), hai `.atlas-viz-readout` đặt thẳng hàng để **so MSE trên dưới**:
   - mẫu nét liền + `yourLine` + phương trình + `mseValue`. Lúc đầu: "$\hat{y}$ = 0.0000$x$ + 10.90", MSE = 10.5020;
   - mẫu nét đứt + `bestLine` + "$\hat{y}$ = 0.1695$x$ + 2.04" + "MSE = 0.3615". Dòng này có `data-off` khi đang tắt.
   - Tên dòng và phương trình nằm chung `.atlas-viz-readout-text`, tự xuống hàng trên màn hẹp. Số MSE ở cột riêng bên phải.
   - Ký hiệu $\hat{y}$, $x$ là HTML KaTeX từ `symbols`. Số là chữ thường, `.atlas-viz-num`.
5. **Thanh trượt** (`role="group"`, `aria-label` = `controls`). Mỗi thanh có:
   - dòng nhãn: nhãn KaTeX bên trái, số bên phải (`aria-hidden`);
   - dòng dưới: `input[type=range]` rộng hết khối.
6. **Nút** `showBest`:
   - nút phụ: nền `--sl-color-gray-5`, chữ `--sl-color-white`, `min-height: 44px`, chữ đậm 600;
   - đầu nút là ô vuông 20px (nền `--sl-color-bg`, viền 2px `--sl-color-gray-3`), cách làm giống LessonProgress;
   - khi bật: nền `--sl-color-accent-low`, thanh 4px `--sl-color-accent` ở cạnh đầu dòng; ô vuông nền `--sl-color-accent` có `.atlas-check` màu `--sl-color-black`;
   - hover nâng 1px, bỏ khi `prefers-reduced-motion`;
   - `disabled`: nền `--sl-color-gray-5`, chữ `--sl-color-gray-3`, `cursor: not-allowed`.
7. **Dòng trạng thái**:
   - `nearBest`: `.atlas-check` + chữ `--sl-color-green-high`, đậm 600;
   - `bestNote`: chữ `--sl-color-text`.
8. Phần ẩn (`sr-only`): mô tả (`description` + " " + `meanNote`), vùng live.

Lý do của thứ tự này:

- Bật đường tốt nhất chỉ làm hiện phần đã giữ chỗ phía trên, và đẩy phần nằm dưới nút. Thanh trượt và nút **không nhảy** dưới ngón tay.
- Chiều cao ở 375px: bản thiết kế ước tính khoảng 660px, **`viz-builder` đo thật khoảng 947px** trên `npm run preview`. Màn điện thoại phổ biến không hiện cùng lúc cả đồ thị lẫn thanh trượt. Xem rủi ro 6. Người dùng xem trên điện thoại thật ở bước V7. Tới lúc đó vẫn giữ chỗ cho dòng đường tốt nhất.

**Nét trên đồ thị:**

| Thứ | Lớp | Hình |
|---|---|---|
| Điểm | `.atlas-viz-point` | Tròn `r = 6`, viền 2px màu nền vùng vẽ |
| Đường của bạn | `.atlas-viz-primary` | Liền, 3px |
| Đường tốt nhất | `.atlas-viz-reference` | Đứt `8 6`, 3px |
| Phần dư | `.atlas-viz-error` | Liền, 2px, thẳng đứng |
| Điểm trung bình | `.atlas-viz-marker` trên `.atlas-viz-halo` | Dấu × rộng 12px, nét 3px màu `--atlas-viz-ink`, nền 7px màu nền vùng vẽ |
| Trục | `.atlas-viz-axis` | Liền, 1px |
| Lưới | `.atlas-viz-grid-line` | Liền, 1px |

Điểm dữ liệu (tròn, đặc) và điểm trung bình (×, rỗng ở giữa) cùng màu `--atlas-viz-ink`, nhưng khác nhau về hình. Chú giải ghi chữ cho cả hai.

**Vì sao đường tốt nhất màu xanh dương, không phải xanh lá:**

- Màu nhấn của site là nâu hoặc tan. Màu nâu và xanh lá dễ lẫn với người mù màu đỏ–lục. Ở chế độ sáng, `accent` và `green-high` có độ sáng gần như bằng nhau (tỉ lệ 1,05).
- Xanh dương khác nâu theo trục lam–vàng, trục mà những người này vẫn phân biệt được.
- Phần dư màu đỏ, nghĩa là "sai số", cùng nghĩa với lỗi trong Quiz và PythonRunner.

### 4.8. Chuỗi `vizLinearFit`

```ts
// src/i18n/ui.ts (excerpt)
vizLinearFit: [
  'caption', 'plotLabel', 'controls', 'wLabel', 'bLabel', 'wValueText', 'bValueText',
  'yourLine', 'bestLine', 'residual', 'mseValue', 'showBest', 'nearBest', 'bestNote',
  'announce', 'announceBest', 'meanPoint', 'meanNote',
],
```

18 key. Chuỗi trong bảng chép từ `src/content/i18n/{vi,en}.json` sau V3.

| Key | vi | en | Ghi chú |
|---|---|---|---|
| `caption` | Kéo hai thanh trượt để đặt đường thẳng. Bạn thử tìm đường có MSE nhỏ nhất. | Drag the two sliders to place a line. Try to find the line with the smallest MSE. | `figcaption`, nhìn thấy |
| `plotLabel` | Biểu đồ phân tán {{count}} điểm dữ liệu, {{y}} theo {{x}}, cùng đường thẳng bạn chọn. | Scatter plot of {{count}} data points, {{y}} against {{x}}, with the line you chose. | `aria-label` của SVG. `{{x}}`, `{{y}}` là tên trục, không có đơn vị |
| `controls` | Điều chỉnh đường thẳng | Adjust the line | Tên nhóm thanh trượt |
| `wLabel` | Trọng số $w$ (độ dốc) | Weight $w$ (slope) | KaTeX lúc build. Glossary: trọng số = weight |
| `bLabel` | Hệ số tự do $b$ | Bias $b$ | Glossary: hệ số tự do = bias |
| `wValueText` | {{value}} {{yUnit}} cho mỗi {{xUnit}} | {{value}} {{yUnit}} per {{xUnit}} | `aria-valuetext` |
| `bValueText` | {{value}} {{yUnit}} | {{value}} {{yUnit}} | `aria-valuetext` |
| `yourLine` | Đường của bạn | Your line | |
| `bestLine` | Đường tốt nhất (bình phương tối thiểu) | Best line (least squares) | |
| `residual` | Phần dư: đoạn thẳng đứng từ một điểm tới đường của bạn | Residual: the vertical segment from a point to your line | |
| `mseValue` | MSE = {{value}} | MSE = {{value}} | Hai bản giống nhau là có chủ ý |
| `showBest` | Hiện đường tốt nhất | Show the best line | Nút bật/tắt, nhãn cố định |
| `nearBest` | Rất gần đường tốt nhất. | Very close to the best line. | |
| `bestNote` | Không đường thẳng nào có MSE nhỏ hơn {{mse}}. | No straight line has a smaller MSE than {{mse}}. | Ý chính của VIZ, hiện khi bật đường tốt nhất |
| `announce` | MSE của đường bạn chọn: {{mse}}. | MSE of your line: {{mse}}. | Vùng live, sau khi dừng kéo 600 ms |
| `announceBest` | Đường tốt nhất: w = {{w}}, b = {{b}}, MSE = {{mse}}. | Best line: w = {{w}}, b = {{b}}, MSE = {{mse}}. | Vùng live, đọc ngay khi bật |
| `meanPoint` | Điểm trung bình ({{x}}, {{y}}) | Mean point ({{x}}, {{y}}) | Mục thứ hai của chú giải tĩnh, cạnh mẫu dấu × (quyết định 24) |
| `meanNote` | Dấu hình chữ X đánh dấu điểm trung bình ({{x}}, {{y}}). Đường tốt nhất luôn đi qua điểm này. | An X-shaped mark shows the mean point ({{x}}, {{y}}). The best line always passes through it. | Nối vào sau `description` trong mô tả `sr-only` của SVG |

- Mọi `{{…}}` chứa số nhận chuỗi từ `formatNumber`, với `digits` của cấu hình.
- `{{count}}` là `rows.length`.
- **Cùng tên biến, khác nghĩa:** trong `plotLabel`, `{{x}}` và `{{y}}` là **tên trục** (`AxisText.name`, không có đơn vị). Trong `meanPoint` và `meanNote`, chúng là **số** $\bar{x}$, $\bar{y}$ (`formatNumber` với `digits.meanX`, `digits.meanY`).
- Các thuật ngữ "phần dư", "bình phương tối thiểu", "độ dốc", "biểu đồ phân tán", "trọng số", "hệ số tự do" nay đã có trong `docs/glossary.md`, và chuỗi ở trên khớp glossary.

### 4.9. Tương phản

Đo theo công thức WCAG 2.x, từ giá trị trong `custom.css` và giá trị mặc định của Starlight 0.42.6 (`props.css`; hue mặc định: blue 234, red 339, green 101). Cách đo giống [components.md](components.md) mục 4.9.7: cặp `text`/`bg` ra 10,10 và 11,11, khớp bảng ở đó.

**Nét và điểm trên nền vùng vẽ** (`--sl-color-bg`, cần ≥ 3:1):

| Thứ | Token | Tối | Sáng |
|---|---|---|---|
| Điểm | `white` | 14,00 | 15,61 |
| Dấu × điểm trung bình (`.atlas-viz-marker`) | `white` | 14,00 | 15,61 |
| Đường của bạn | `accent` | 7,42 | 6,42 |
| Đường tốt nhất | `blue-high` | 9,24 | 11,68 |
| Phần dư | `red-high` | 10,28 | 8,21 |
| Trục | `gray-3` | 6,28 | 6,89 |
| Lưới (trang trí, không yêu cầu) | `gray-5` | 1,60 | 1,69 |

Dấu × không thêm cặp màu mới: nét của nó là `--atlas-viz-ink` (`white`), cùng cặp với điểm. Hai thứ **cố ý bằng màu nền vùng vẽ** (tỉ lệ 1:1), là viền 2px của `.atlas-viz-point` và `.atlas-viz-halo`. Chúng chỉ để tách dấu khỏi đường chạy qua, nên không đo. E2E (V5 ý 4) phải bỏ chúng ra khi đo, cùng với `.atlas-viz-grid-line`.

**Chữ và chi tiết trên nền khối** (`--sl-color-gray-6`; chữ cần ≥ 4,5:1, nét ≥ 3:1):

| Thứ | Token | Tối | Sáng |
|---|---|---|---|
| Chú thích, nhãn thanh trượt, `bestNote` | `text` | 8,68 | 8,90 |
| Dòng số, tên dòng, số cạnh nhãn thanh trượt | `white` | 12,04 | 12,50 |
| Mẫu điểm và mẫu dấu × trong chú giải (không có quầng) | `white` | 12,04 | 12,50 |
| Nhãn trục, vạch chia, chữ của chú giải tĩnh (kể cả `meanPoint`) | `gray-3` | 5,40 | 5,52 |
| `nearBest` | `green-high` | 10,80 | 4,92 |
| Mẫu nét trong chú giải: của bạn / tốt nhất / phần dư | `accent` / `blue-high` / `red-high` | 6,37 / 7,95 / 8,84 | 5,14 / 9,36 / 6,58 |
| Viền focus trong khối | `accent` | 6,37 | 5,14 |

**Nút** (cùng số với components.md 4.9.7):

| Trạng thái | Cặp | Tối | Sáng |
|---|---|---|---|
| Tắt | `white` / `gray-5` | 8,75 | 9,21 |
| Bật | `white` / `accent-low` | 9,14 | 12,27 |
| Thanh 4px khi bật | `accent` / `accent-low` | 4,84 | 5,05 |
| ✓ trong ô vuông | `black` / `accent` | 7,42 | 6,42 |
| `disabled` (miễn theo WCAG 1.4.3) | `gray-3` / `gray-5` | 3,92 | 4,06 |

**Giữa các nét với nhau** WCAG không yêu cầu, và ở đây tương phản thấp:

| Cặp | Tối | Sáng |
|---|---|---|
| `accent` / `blue-high` | 1,25 | 1,82 |
| `accent` / `red-high` | 1,39 | 1,28 |
| `red-high` / `blue-high` | 1,11 | 1,42 |

Vì vậy ba loại nét phân biệt bằng hình (liền 3px, đứt 3px, mỏng 2px thẳng đứng) và bằng chú giải chữ, không chỉ bằng màu (mục 2.7).

### 4.10. Hợp đồng với `lesson-writer` (bài `ml/linear-regression`)

Trạng thái: ý 1–4 đã xong (10 căn hộ, 3 ô code có dấu `# dataset: apartments`). Ý 5 xem ghi chú ở đó.

1. **Dữ liệu.** Điền `rows`, `caption`, `description` trong `src/data/datasets/apartments.ts`, theo khuôn mục 4.1, và đăng ký trong `index.ts`.
   - 8–12 dòng. Diện tích là số nguyên (m²). Giá thuê có tối đa 1 chữ số thập phân (triệu đồng/tháng).
   - `caption` nói rõ số liệu là tự tạo để minh họa.
   - Nên chọn dữ liệu có:
     - $b^\ast > 0$ (giống một khoản phí cố định), để trục tung bắt đầu từ 0;
     - các điểm không nằm thẳng hàng, để phần dư nhìn thấy được;
     - không có điểm ngoại lai. Điểm ngoại lai để dành cho ô code thứ ba.
   - Điền cả `vi` lẫn `en` cho các trường ngắn này. `lesson-translator` rà lại bản `en` khi dịch.
2. **Bảng ở phần Trực giác:** `<DatasetTable dataset="apartments" />`. Không gõ tay bảng.
   - Ô số căn phải, giống cột `---:` của bảng Markdown: dùng thuộc tính `align`, Starlight có tôn trọng.
3. **Ký hiệu trong Lý thuyết** phải khớp VIZ:
   - mô hình $\hat{y} = wx + b$, một đặc trưng, nên $w$ là số vô hướng;
   - phần dư $e^{(i)} = y^{(i)} - \hat{y}^{(i)}$;
   - $\text{MSE} = \frac{1}{m}\sum_{i=1}^{m}\left(\hat{y}^{(i)} - y^{(i)}\right)^2$, với hệ số $\frac{1}{m}$, không phải $\frac{1}{2m}$. Lý do: con số khớp `mean_squared_error` của scikit-learn và số trong VIZ.
4. **Code:** mọi ô code có dữ liệu đều theo định dạng mục 2.5: dòng `# dataset: apartments` rồi hai dòng `area = np.array([...])`, `rent = np.array([...])`.
5. **Chỗ đặt VIZ:** trong mục "Minh họa". Mẫu chung cho mọi bài, có hai giai đoạn:

   - **Trước khi có VIZ** (`lesson-writer` viết): comment giữ chỗ nhiều dòng, để `viz-builder` biết phải làm gì.

     ```mdx
     {/* VIZ: LinearFitViz
         Ý: đường tốt nhất là đường có MSE nhỏ nhất.
         Tương tác: kéo thanh trượt w và b; bấm "Hiện đường tốt nhất".
         Dữ liệu: apartments.
         Ký hiệu: x, y, ŷ = wx + b, w, b, phần dư, MSE (như mục Lý thuyết). */}
     ```

   - **Khi đã có VIZ** (`viz-builder` thay ở V3): bỏ comment giữ chỗ, thêm import và thẻ VIZ. Giữ lại **ý chính** trong một comment **một dòng**, đặt ngay trên thẻ:

     ```mdx
     {/* VIZ: đường tốt nhất là đường có MSE nhỏ nhất. */}
     <LinearFitViz />
     ```

     `lesson-translator` chép nguyên dòng này sang bản en (comment trong MDX không hiện ra trang).
   - **Ghi chú:** `src/content/docs/vi/ml/linear-regression.mdx` đã có import, `<LinearFitViz />` và comment một dòng `{/* VIZ: đường tốt nhất là đường có MSE nhỏ nhất. */}` ngay trên thẻ.

6. **Số trong lời văn** lấy từ bảng, VIZ hay code (ví dụ "đường tốt nhất có $w \approx$ …") phải khớp fixture Python. `content-reviewer` kiểm tra. Dấu thập phân: dấu chấm cho mọi số kỹ thuật (quyết định 22).

## 5. Phụ thuộc

**Không thêm gói npm nào.** Dùng lại:

| Gói | Phiên bản đang ghim | Dùng cho |
|---|---|---|
| `react`, `react-dom` | 19.3.1 | Island, `useId`, `useSyncExternalStore` |
| `@astrojs/react` | 7.1.1 | Island, `client:visible` có `rootMargin` (Astro 7.4.2) |
| `katex` | 0.16.47 | `renderInlineMarkup` lúc build (nhãn thanh trượt, $\hat{y}$, $x$) |
| `jsdom`, `@testing-library/react`, `@testing-library/user-event` | 30.1.3, 16.3.3, 14.6.8 | Test island |
| `@playwright/test` | 1.64.1 | E2E |

- Python cho fixture: Python 3.14.5 + NumPy 2.4.6 trong venv `C:/Users/Dell/.venvs/ai-atlas-py314`. Gói trong venv ghim đúng phiên bản của Pyodide 314.0.7 (bảng ở mục 2.5). Chỉ dùng lúc viết fixture và khi chạy thử code bài, không dùng trong CI. Không phải NumPy 2.5.3 của Python mặc định trên máy.
- Lệnh chạy fixture dùng `python -I` và chạy từ một thư mục trống, để không nạp nhầm file `.py` trong repo.
- `node:zlib` (có sẵn trong Node) để đo gzip trong test.

## 6. Các bước thực hiện

Mỗi nhiệm vụ của `viz-builder` kết thúc bằng `npm run build` (không `[WARN]`), `npm run check` (0 lỗi 0 cảnh báo) và `npm test`.

**Thứ tự:**

- V0 làm **trước** `lesson-writer`, để `lesson-writer` điền dữ liệu vào đúng khuôn và test đồng bộ chạy ngay từ đầu.
- V1 → V3 làm sau khi bản vi đã có. Gộp V1–V3 trong một lần gọi `viz-builder` được.
- Nếu `lesson-writer` đã chạy trước V0 và viết dữ liệu thẳng trong `.py`: trong V0, `viz-builder` chép số từ `.py` sang `apartments.ts`, thêm dòng `# dataset: apartments` vào các file `.py`, rồi để `content-reviewer` xác nhận.

| # | Agent | Việc | Tiêu chí hoàn thành |
|---|---|---|---|
| V0 | `viz-builder` | **Xong.** **Nền dữ liệu và toán, chưa cần số thật.** `src/data/datasets/types.ts`, `index.ts` (lúc đầu `DATASETS = {}`, nay `{ apartments }`), `src/lib/viz/linear-fit.ts`, `scale.ts`, `format.ts` (mục 4.1, 4.2). `src/components/DatasetTable.astro`. Viết `viz-math.test.ts` và `datasets.test.ts`. Phần đọc `.py` tách thành hàm thuần `checkPythonDatasets`, đặt ngay trong `datasets.test.ts`, để test được bằng chuỗi trong bộ nhớ | `npm test` qua với các ca: `mse([[1,1],[2,2],[3,3]], {w:0,b:0})` = 14/3; `fitLeastSquares` trên các điểm của $y = 2x + 1$ ra $w = 2$, $b = 1$ (sai số < 1e-12); 1 dòng hoặc mọi $x$ bằng nhau thì throw kèm thông báo; `clipLineToBox` đúng 5 ca (nằm trong, cắt cạnh trên, cắt cạnh dưới, cắt cả hai, trượt ngoài thì `null`); `formatNumber(-0.5, 2)` = `'−0.50'`, `formatNumber(-0.0001, 2)` = `'0.00'`, `formatNumber(0.15, 3)` = `'0.150'`; `decimalsOf(0.005)` = 3; `snapToStep(0.30000000000000004, …)` = 0.3. Hàm đọc `.py`: chuỗi đúng khuôn thì qua; lệch một số, thiếu một dòng, sai tên biến, dấu trỏ tới id lạ thì đều báo lỗi có tên file và số dòng. `datasets.test.ts` qua khi registry rỗng |
| — | `lesson-writer` | Ngoài tài liệu này: viết bài vi theo mục 4.10. Bài vi đã có, `status.vi = 'published'` | `datasets.test.ts` qua với `apartments`. `content-reviewer` đã duyệt |
| V1 | `viz-builder` | **Xong.** **Fixture và cấu hình.** Chạy Python trong venv của mục 2.5 (lệnh ở mục 4.5), ghi `tests/unit/fixtures/linear-fit-python.ts`. Chọn `APARTMENTS_LINEAR_FIT` (kết quả ở mục 4.5.1). Viết `linear-fit-apartments.test.ts` | Fixture ghi lệnh, phiên bản Python và NumPy, ngày, và $\bar{x}$, $\bar{y}$. Test: `rows` và giá trị đầu $w$, $b$ của fixture bằng `APARTMENTS.rows` và cấu hình; `fitLeastSquares` khớp fixture (`toBeCloseTo(…, 9)`); `mse(initial)` khớp fixture; `meanPoint` khớp fixture và đường tốt nhất đi qua nó; $\sum e^{(i)}$ và $\sum x^{(i)} e^{(i)}$ tại nghiệm gần 0 (< 1e-9 nhân độ lớn dữ liệu); mọi ràng buộc ở bảng mục 4.1 đều qua, kể cả ràng buộc của quyết định 24; MSE tại mọi điểm của lưới thanh trượt ≥ `best.mse` |
| V2 | `viz-builder` | **Xong.** **Phần dùng chung.** `viz.css` (mục 4.4), thêm vào cuối `customCss`. Kit: `PlotFrame`, `VizSlider`, `use-settled`, `use-hydrated` (mục 4.3). Thêm 18 key mục 4.8 vào `ui.ts`, `vi.json`, `en.json` (16 key ban đầu, cộng `meanPoint` và `meanNote` của quyết định 24). Viết `viz-conventions.test.ts` | Build không `[WARN]`. `viz-conventions.test.ts`: (1) dưới `src/components/viz/` chỉ có một file `.css` là `viz.css`; không file `.astro`/`.tsx` nào có `<style>` hay import `.css`; (2) `astro.config.ts` có `./src/components/viz/viz.css` trong `customCss`; (3) `gzipSync(viz.css)` ≤ 2560 byte; (4) không có `#[0-9a-f]{3,8}`, `rgb(`, `hsl(`, `--sl-color-` trong `.tsx`/`.astro` dưới `viz/`; (5) mỗi `*Island.tsx` dưới `viz/` có wrapper `.astro` cùng tên, wrapper có `client:visible`, không có `client:load`/`client:idle`. `i18n.test.ts` vẫn qua |
| V3 | `viz-builder` | **Xong.** **`LinearFitViz`.** `LinearFitViz.astro`, `linear-fit-viz/LinearFitVizIsland.tsx` (mục 4.5–4.7). Thay comment giữ chỗ trong bài vi bằng import và `<LinearFitViz />`, giữ ý chính trong comment một dòng ngay trên thẻ (mục 4.10 ý 5; bài hiện **chưa có** dòng này). Tự xem trên `npm run preview` (chỉ chạy khi không có agent khác đang chạy build hay e2e) | Trong `dist/vi/ml/linear-regression/index.html` có đúng một `.atlas-viz`, island còn `ssr`; **trong `.atlas-viz-plot`** có đúng N `circle.atlas-viz-point` và N `line.atlas-viz-error` (N = `rows.length`; đếm trên cả `.atlas-viz` ra N + 1, vì chú giải dùng cùng lớp); có dấu × ở điểm trung bình; số MSE ban đầu bằng `formatNumber(fixture.initial.mse)`. Xem tay: kéo chuột và bàn phím đều vẽ lại; bật/tắt đường tốt nhất; console không lỗi hydrate; 375px không cuộn ngang ở sáng và tối. File `dist/_astro/LinearFitVizIsland.*.js` ≤ 10 KB gzip. Đo lại khi cập nhật tài liệu: 10 điểm và 10 phần dư trong `.atlas-viz-plot`, MSE "10.5020", island 3,0 KB gzip (mục 2.9) |
| V4 | `tester` | **Test island (jsdom):** `linear-fit-viz-island.test.tsx`. Props lấy từ `APARTMENTS`, `APARTMENTS_LINEAR_FIT`, `fitLeastSquares`, `meanPoint` (import tương đối) | **Đếm điểm, phần dư, đường trong `.atlas-viz-plot`**, không đếm trên cả island: chú giải và dòng số dùng cùng lớp cho mẫu nét (mục 4.6). (a) `renderToString` ra HTML có `disabled` ở 2 thanh trượt và nút. Gắn HTML đó rồi `hydrateRoot`: `onRecoverableError` không được gọi; sau `act` thì điều khiển hết `disabled`. (b) Ban đầu: giá trị, `aria-valuetext` có đơn vị, số MSE, N `line.atlas-viz-error` trong `.atlas-viz-plot`, `aria-pressed="false"`; `line.atlas-viz-reference` trong `.atlas-viz-plot` và `.atlas-viz-readout` thứ hai đều có `data-off`. `ul.atlas-viz-key` có đúng 3 `li`, mục thứ hai là `meanPoint` với `{{x}}`, `{{y}}` = `formatNumber(mean.x, digits.meanX)`, `formatNumber(mean.y, digits.meanY)`. Trong `.atlas-viz-plot` có đúng 2 `line.atlas-viz-marker` và 2 `line.atlas-viz-halo`, SVG lồng bao chúng có `x` = `pct(toPercentX(mean.x))`, `y` = `pct(toPercentY(mean.y))`. Mô tả `sr-only` (phần tử có id trong `aria-describedby` của SVG) chứa `description` rồi `meanNote`. (c) `fireEvent.change` thanh $w$ thì đường và số MSE đổi ngay; vùng live vẫn rỗng ở 599 ms và có `announce` ở 600 ms (`vi.useFakeTimers`). (d) 5 lần đổi trong 600 ms chỉ cho **một** lần đổi chữ ở vùng live (đếm bằng `MutationObserver`), và chữ đó ứng với giá trị cuối. (e) Giá trị `'0.30000000000000004'` hiện là `formatNumber(0.3, digits.w)`, tức `0.3000` với cấu hình hiện tại. (f) Bấm nút: `aria-pressed="true"`, đường tốt nhất trong `.atlas-viz-plot` hết `data-off`, dòng số hết `data-off`, có `bestNote`, vùng live có `announceBest` **ngay**, không chờ timer. Bấm lần nữa thì ẩn lại, vùng live về rỗng. Bật, tắt, bật lại: vùng live đổi chữ 3 lần (đọc, rỗng, đọc), có đúng 2 lần đọc `announceBest`. (g) Đặt thanh trượt về điểm lưới gần nghiệm nhất ($w = 0.17$, $b = 2.0$) thì hiện `p.atlas-viz-near` có `nearBest`. (h) Không viết cứng chữ: truyền `strings` có mọi giá trị dạng `⟦key⟧` (giữ placeholder); mọi nút chữ nhìn thấy phải chứa `⟦`, hoặc đến từ props (tên trục, `itemLabel`, `description`, KaTeX), hoặc chỉ gồm số và ký hiệu `[0-9.=+−%() ]`. (i) Hai island trên một trang không trùng `id` |
| V5 | `tester` | **E2E:** `tests/e2e/viz.spec.ts` (chung) và `tests/e2e/linear-fit-viz.spec.ts` | **Chung**, với mọi trang `/vi/<id>/` có `status.vi = 'published'` và `/en/<id>/` (cả trang fallback) có `.atlas-viz`: (1) lúc mở trang, VIZ nằm thấp hơn 1,5 màn hình thì island còn `ssr` và chưa có request tới `component-url` của nó; cuộn tới thì hydrate và có request; (2) chiều cao `.atlas-viz` trước và sau hydrate bằng nhau (±1px); (3) ở 375px, cả sáng và tối, `scrollWidth ≤ 375`, mọi `input` và `button` trong VIZ cao ≥ 44px; (4) tương phản tính từ `getComputedStyle` ở cả hai chế độ: nét và điểm trong `.atlas-viz-plot` (`fill` của `.atlas-viz-point`; `stroke` của `.atlas-viz-primary`, `-reference`, `-error`, `-axis`, `-marker`) so với nền `.atlas-viz-plot` ≥ 3, **bỏ qua** `.atlas-viz-grid-line`, `.atlas-viz-halo` và viền của `.atlas-viz-point` (cố ý bằng màu nền, mục 4.9); chữ trong `.atlas-viz` so với nền gần nhất có màu (khối, hoặc nền nút) ≥ 4,5; (5) Tab đi qua mọi điều khiển theo thứ tự DOM, có viền focus; (6) console không lỗi; (7) JS riêng của mỗi island VIZ ≤ 10 KB gzip (cách tính mục 2.9); thuộc tính `props` ≤ 8 KB. **Riêng `LinearFitViz`:** (8) **trong `.atlas-viz-plot`**: số điểm, số phần dư bằng `rows.length`, có dấu × (2 `line.atlas-viz-marker`) ở điểm trung bình; `ul.atlas-viz-key` có 3 mục, mục thứ hai hiện "(52.4, 10.92)"; số MSE ban đầu khớp (tính bằng `src/lib/viz` + dữ liệu, import tương đối); (9) bàn phím: focus thanh $w$, 3 lần `ArrowRight` thì giá trị tăng 3 bước, `aria-valuetext` và số MSE đổi theo; `End` ra `max`; Tab sang $b$, `Home` ra `min` (−10.5, hiện "−10.50"); Tab sang nút, `Space` bật đường tốt nhất, số MSE của nó bằng `formatNumber(best.mse)`; (10) vùng live chưa đổi ngay sau 5 lần `ArrowRight` liên tiếp, và có `announce` trong vòng 1,5 s; (11) vị trí $y$ của thanh trượt và của nút không đổi khi bật/tắt đường tốt nhất; (12) `javaScriptEnabled: false`: trong `.atlas-viz-plot` thấy đủ điểm, phần dư và dấu ×; số MSE ban đầu, chữ `needsScript`, điều khiển `disabled`; (13) ở 375px các nhãn vạch chia trục $x$ không chồng nhau; (14) trên `/en/…`, nhãn nút và mục `meanPoint` là chuỗi en |
| V6 | `analyst` | Review VIZ: code, trợ năng, hiệu năng, khớp quy ước mục 2 | Báo cáo có số đo: JS riêng của island (gzip), phần CSS chung tăng thêm (gzip), Lighthouse mobile của `/vi/ml/linear-regression/` (Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95, hoặc giải thích phần thiếu không do VIZ), tương phản đo thật khớp mục 4.9, `package.json` không đổi |
| V7 | **người dùng** | Duyệt VIZ trên bài thật, cả máy tính lẫn điện thoại thật, cùng lúc với bước duyệt bản vi của M2 | Đồng ý, hoặc có danh sách chỗ sửa cho `viz-builder` |
| V8 | `lesson-translator` | Khi dịch bản en: thêm import và `<LinearFitViz />`, `<DatasetTable dataset="apartments" />`; rà phần `en` trong `apartments.ts` | Test V5 chạy trên trang en thật (không còn là fallback) và vẫn qua |

Việc ngoài phạm vi tài liệu này, phiên chính lo:

- Thêm `src/components/viz/`, `src/data/datasets/` vào mục "Cấu trúc thư mục" của `CLAUDE.md`.
- Khi chốt template ở M2: đưa mẫu comment VIZ (mục 4.10 ý 5, cả hai giai đoạn) và `<DatasetTable />` vào `docs/lesson-template.mdx`.
- ~~Thêm comment một dòng `{/* VIZ: đường tốt nhất là đường có MSE nhỏ nhất. */}` ngay trên `<LinearFitViz />` trong bài vi (mục 4.10 ý 5).~~ Đã có.
- ~~Dòng đầu của `docs/architecture/README.md` vẫn ghi "bốn tài liệu thiết kế".~~ Đã sửa thành "năm".

## 7. Rủi ro và điểm chưa chắc

| # | Rủi ro | Ảnh hưởng | Cách xử lý |
|---|---|---|---|
| 1 | `viz.css` phình dần qua nhiều VIZ. **Đo sau VIZ đầu tiên:** file nguồn bỏ comment 1 553/2 560 byte gzip (61%), còn khoảng 1 KB cho các VIZ sau. Thuộc tính `props` của island 7 026 ký tự trên giới hạn 8 KB (86%) | CSS chung của mọi trang tăng. VIZ thứ hai cần thêm lớp mới (ví dụ đường cong, mục 2.4) gần như chắc chắn làm test ngân sách fail | Test ngân sách 2,5 KB gzip, đo file nguồn **sau khi bỏ comment** (quyết định 27, đã trả lời câu hỏi 1). Phần thật sự xuống trình duyệt (đã minify) là 1,43 KB gzip nếu nén riêng, hay +0,83 KB trong CSS chung. `props`: chỉ là giới hạn mềm, xét lại khi VIZ sau vượt |
| 2 | Thanh trượt `disabled` trước khi hydrate: người dùng bàn phím Tab quá nhanh sẽ bỏ qua chúng | Phải Shift+Tab quay lại | `rootMargin: '200px'` hydrate sớm. Island nhỏ nên bật gần như ngay khi tới. Chấp nhận phần còn lại |
| 3 | `path`/`polyline` không nhận `%` | VIZ có đường cong phải làm khác | SVG lồng có `viewBox` + `non-scaling-stroke` (mục 2.4), thêm vào kit khi cần |
| 4 | Trình đọc màn hình đọc "ŷ" khác nhau, hoặc đọc lặp số ở dòng số và ở vùng live khi duyệt | Hơi thừa | Vùng live dùng `w = …, b = …`, không dùng phương trình. Chấp nhận phần lặp khi duyệt. Kiểm tra với NVDA khi duyệt V7 nếu có điều kiện |
| 5 | Màu `--sl-hue-*` có thể đổi khi chỉnh bảng màu (rủi ro 8 của components.md) | Tương phản đổi theo | Màu tập trung ở `viz.css`. E2E (V5 ý 4) đo lại từ màu thật ở cả hai chế độ |
| 6 | Ở 375px, VIZ cao **khoảng 947px** (`viz-builder` đo trên `npm run preview`), không phải 660px như ước tính ban đầu. Theo CSS, phần lớn đến từ: đồ thị kèm tên trục và vạch chia (khoảng 290px), hai thanh trượt (khoảng 150px), hai dòng số mỗi dòng xuống 2 hàng (khoảng 115px), chú giải 3 mục với câu `residual` dài (khoảng 100px), cộng chú thích, nút, dòng trạng thái, 6 khoảng `gap` 16px và lề khối 32px. Các số con là ước tính từ CSS, chưa đo | Trên hầu hết điện thoại, người đọc không thấy cùng lúc đồ thị và thanh trượt. Khi kéo $b$ phải cuộn lên xem đường | **Tạm giữ nguyên**, kể cả chỗ giữ sẵn cho dòng đường tốt nhất (mục 2.8), tới khi người dùng xem trên điện thoại thật ở V7. Nếu V7 thấy quá cao, các cách theo thứ tự ít đổi nhất: (a) rút ngắn `residual` thành "Phần dư" và để định nghĩa trong bài; (b) gộp dòng số vào một hàng trên màn hẹp, bỏ tên dòng, chỉ giữ mẫu nét; (c) đồ thị `aspect-ratio: 1` trên màn hẹp; (d) chuyển dòng số xuống dưới nút. Cách (d) làm dòng đường tốt nhất nằm dưới nút, nên bỏ được chỗ giữ sẵn mà nút vẫn không nhảy |
| 7 | Venv của fixture phải đi theo phiên bản Pyodide. Venv `C:/Users/Dell/.venvs/ai-atlas-py314` hiện khớp Pyodide 314.0.7 (NumPy 2.4.6, pandas 3.0.2, scikit-learn 1.8.0, SciPy 1.18.0, Matplotlib 3.10.8). Python của venv là 3.14.5, còn Pyodide chạy 3.14.2 | Nâng `pyodide` trong `package.json` mà quên venv thì fixture và việc chạy thử code bài lệch với trình duyệt. Không có test nào kiểm tra venv. Lệch bản vá Python gần như không đổi kết quả số | Khi nâng Pyodide: đọc `node_modules/pyodide/pyodide-lock.json`, cài lại venv đúng các phiên bản đó, chạy lại lệnh trong fixture. Rủi ro cũ "máy chưa có scikit-learn" đã hết nhờ venv này |
| 8 | Test đọc `.py` theo khuôn chặt (một dòng một mảng) | Tác giả viết khác khuôn thì test fail | Thông báo lỗi chỉ ra đúng file, đúng dòng và khuôn đúng. Khuôn ghi trong mục 2.5 và 4.10 |
| 9 | Trang en dạng fallback trước khi dịch: VIZ hiện chuỗi en giữa bài tiếng Việt | Hơi lạ với người đọc en | Đúng cơ chế fallback của Starlight (đã đọc mã nguồn). Hết khi có bản en (V8) |
| 10 | Kiểu thanh trượt gốc của trình duyệt khác nhau giữa Chrome, Safari, Firefox | Khác chút về hình | Chỉ dùng `accent-color` (Safari từ 15.4), không tự vẽ thumb. Ít CSS, dễ dùng |
| 11 | Chưa kiểm tra chế độ `forced-colors` (Windows High Contrast) | Có thể mất màu nét | Hình dạng nét vẫn khác nhau. Xét ở M4 cùng các việc trợ năng khác |

### Câu hỏi cho người dùng

Câu hỏi cũ về dấu thập phân đã được trả lời: dấu chấm cho mọi số kỹ thuật (quyết định 22). `DatasetTable` in dấu chấm qua `formatNumber`.

Câu hỏi mới sau V0–V3. Không chặn V4–V5, nhưng cần trả lời trước VIZ thứ hai:

1. **Đã trả lời (quyết định 27): đo sau khi bỏ comment, giữ ngưỡng 2,5 KB.** Câu hỏi gốc: ngân sách `viz.css` đã dùng 86% sau VIZ đầu tiên (2 207/2 560 byte gzip, đo file nguồn kể cả comment). Xử lý thế nào?
   - **(Recommended)** Đổi cách đo: bỏ comment rồi mới nén, giữ ngưỡng 2,5 KB. Lý do: phần xuống trình duyệt mới là thứ cần giới hạn. Đo theo cách này, `viz.css` hiện là 1 553 byte gzip (61%), còn khoảng 1 KB cho các VIZ sau, và comment giải thích không bị phạt.
   - Giữ cách đo, nâng ngưỡng lên 3,5 KB gzip.
   - Giữ nguyên cả hai. VIZ sau phải rút comment hoặc tách CSS hiếm dùng sang phương án B (mục 2.3).
2. **Chiều cao 947px ở 375px** đã được hoãn tới V7 theo ý người dùng. Không hỏi lại lúc này. Các cách xử lý nếu cần ở rủi ro 6.

Các lựa chọn tự quyết trong lượt này. Tất cả đổi lại được sau khi duyệt trên bài thật (V7):

1. Có component `DatasetTable` (0 JS) để bảng ở phần Trực giác lấy cùng nguồn với VIZ (mục 2.5).
2. Đường tốt nhất màu xanh dương nét đứt, phần dư màu đỏ, đường của bạn màu nhấn của site (mục 4.7).
3. Có dòng "Rất gần đường tốt nhất" khi MSE của bạn ≤ 1,05 lần MSE nhỏ nhất (mục 4.6).
4. Không đặt VIZ lên trang demo. Kiểm tra trên trang bài thật (mục 2.11).
5. Nút "Hiện đường tốt nhất" là nút bật/tắt có `aria-pressed` và nhãn cố định, giống `LessonProgress` (mục 2.7).

Lựa chọn `viz-builder` tự quyết ở V1–V3, ghi lại ở đây. Cũng đổi được sau V7:

6. $w$ và MSE hiện 4 chữ số thập phân, $b$ hiện 2, để khớp số trong bài (mục 4.5.1).
7. Dấu × của điểm trung bình cùng màu với điểm dữ liệu (`--atlas-viz-ink`), có quầng màu nền vùng vẽ, nằm trên các đường (mục 4.6). Không thêm màu vai trò mới.
8. Chú giải tĩnh không có mục cho đường của bạn hay đường tốt nhất. Mẫu nét ở đầu mỗi dòng số làm việc đó (mục 4.6, 4.7).

## 8. Hình SVG tĩnh (FIG): quy ước chung

> Viết ngày 23/10/2026, cho mốc M3. Hình tĩnh đầu tiên: hai hình của bài `ml/ml-overview`. Mục này độc lập với mục 1–7: VIZ tương tác giữ nguyên mọi quy ước cũ.
>
> **Quyết định đầu vào** ([mvp.md](../mvp.md) mục 7): 37 (bài Tổng quan Học máy chỉ dùng hình SVG tĩnh), 39 (test gọn, dựa vào test chung, không so tọa độ hay chuỗi chính xác), 40 (2 hình: sơ đồ các nhóm học máy, sơ đồ quy trình dữ liệu → huấn luyện → đánh giá có tách train/test).

### 8.1. Mục tiêu và phạm vi

**Làm:** quy ước cho mọi hình chỉ để nhìn (sơ đồ khối, quy trình, cây phân loại, kiến trúc mạng vẽ dạng khối) trong 78 bài: chỗ đặt file, chữ song ngữ, trợ năng, cỡ chữ ở 375px, màu sáng/tối, ngân sách, test chung. Một bộ kit nhỏ (khung, khối, mũi tên, chữ) đủ cho hai hình của `ml/ml-overview`.

**Không làm:**

- Đồ thị dữ liệu tĩnh (điểm, trục, đường cong cố định). Khi bài đầu tiên cần, `architect` quyết định có dùng lại `PlotFrame` của kit VIZ render lúc build hay không. Hiện chưa cần.
- Ảnh bitmap, file `.svg` rời dùng qua `<img>` hay Markdown `![]()`: ảnh không đọc được biến CSS của trang nên không đổi màu theo sáng/tối, và chữ trong ảnh không dịch được.
- Tự xếp bố cục (dagre, elk, mermaid): thêm gói npm, và hình tự xếp thường xấu ở 375px. Tọa độ viết tay.
- Hoạt ảnh, phóng to khi bấm, chú giải tương tác.
- Ký hiệu toán trong SVG. SVG không chứa được HTML của KaTeX. Ký hiệu để ở chú thích (`caption`, có hỗ trợ `$…$`) hoặc lời văn quanh hình. Khi một hình thật sự cần ký hiệu trong khối, thêm cách làm vào mục này lúc đó (rủi ro 7, mục 8.7).

### 8.2. Phương án đã chọn

**(a) Thư mục và tên file.** Hình tĩnh ở `src/components/figures/`, **không** ở `src/components/viz/`. Đã kiểm chứng trong code:

- `tests/e2e/viz.spec.ts`: hàm `vizCount` (dòng 29–37) đếm mọi thẻ import từ `@components/viz/*.astro`; test "every VIZ written in the file is on the page" đòi số `.atlas-viz` trên trang bằng đúng số đó, và `hydrate()` đòi mỗi `.atlas-viz` có đúng một `astro-island`. Một hình tĩnh trong `viz/` làm các test này fail.
- `tests/unit/viz-conventions.test.ts` quét mọi file dưới `src/components/viz/`: chỉ cho một file CSS là `viz.css`, và mọi `*Island.tsx` phải có wrapper `client:visible`.
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
| HTML một hình (cả hai bố cục) | `outerHTML` của `figure.atlas-figure` **≤ 10 000 ký tự** và **≤ 200 phần tử**. Ước tính hình quy trình khoảng 6 000 ký tự, 110 phần tử | E2E |
| Gói npm mới | **0** | `analyst` xem `package.json` |

Để so: KaTeX sinh 11 869 phần tử trên bài Hồi quy tuyến tính (quyết định 29), nên 200 phần tử mỗi hình không đáng kể.

**(h) Test chung.** Theo quyết định 39: gọn, không so tọa độ hay chuỗi cụ thể. Hình mới tự được kiểm, không viết test riêng cho từng hình.

- **Unit `tests/unit/figure-conventions.test.ts`** (môi trường node):
  1. Dưới `src/components/figures/`: chỉ một file CSS là `figures.css`; không có `.tsx`/`.jsx`; không file nào có `<style>`, `<script>`, import CSS, import `react` hay `client:`; không mã màu, không `--sl-color-` trong `.astro`/`.ts`.
  2. `astro.config.ts` có `./src/components/figures/figures.css` trong `customCss`, và `viz.css` vẫn đứng cuối.
  3. `figures.css` bỏ comment rồi nén ≤ 1 024 byte, và không có mã màu.
  4. Mỗi `<Name>Figure.astro` ở gốc `figures/` có `src/data/figures/<name>.ts` và mục trong `FIGURES`, và ngược lại.
  5. Với mọi hình trong `FIGURES`, ở cả `vi` và `en`: `caption`, `label`, `description` và mọi dòng nhãn không rỗng; hai ngôn ngữ cùng tập key nhãn; mỗi nhãn ≤ 3 dòng; nhãn SVG không có `$` hay `{{`; `description` của vi khác của en (bắt lỗi quên dịch).
  - Hàm `stripCssComments` hiện nằm trong `viz-conventions.test.ts`, chuyển sang `tests/unit/fixtures/css.ts` để hai test dùng chung.
- **Unit `tests/unit/figure-geometry.test.ts`:** `arrowHead`, `lineOffsets`, `round1` với ví dụ tính tay (đầu mũi tên ngang, dọc, chéo; 1–3 dòng căn giữa).
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
- Thêm vào `.claude/agents/viz-builder.md` một dòng: hình tĩnh theo `docs/architecture/viz.md` mục 8, chữ của hình nằm ở `src/data/figures/`, không ở `ui.ts`. Hiện agent ghi rằng mọi chữ của minh họa là key i18n.

### 8.7. Rủi ro và điểm chưa chắc

| # | Rủi ro | Cách xử lý |
|---|---|---|
| 1 | Chữ tiếng Anh và tiếng Việt dài khác nhau, tràn khối | Mỗi ngôn ngữ tự ngắt dòng trong file dữ liệu. E2E ý 4 bắt chữ tràn ở cả hai ngôn ngữ |
| 2 | Font dự phòng (trước khi Barlow tải xong) rộng hơn, chữ chạm viền một lúc | Chừa ≥ 8 đơn vị mỗi bên. Không gây CLS vì khung SVG cố định |
| 3 | Màn hẹp hơn 375px (320px, cột 288px): chữ 13 đơn vị chỉ còn khoảng 10,4px | Mục tiêu của dự án là 375px. Chấp nhận, xem lại khi duyệt trên điện thoại thật |
| 4 | Chế độ chỉ phóng to chữ (Firefox "Zoom text only") không phóng chữ trong SVG | Zoom trang thông thường vẫn phóng hình. Mô tả `sr-only` và chú thích là chữ HTML |
| 5 | Chưa thử `forced-colors` (Windows High Contrast) | Có khối `@media (forced-colors: active)` trỏ về màu hệ thống. Kiểm ở M4, cùng rủi ro 11 |
| 6 | Hai bố cục cho một hình tốn công vẽ gấp đôi, và với kit hiện tại một hình dài có hai bố cục khó nằm trong ngân sách 10 000 ký tự. Phần bố cục rộng của kit (`data-wide`, container query) **chưa được kiểm chứng** trên trang thật: hình đầu tiên dùng nó phải có test riêng | Bố cục rộng là tùy chọn, chỉ làm khi hình là chuỗi ngang dài (mục 8.2 e) |
| 7 | Bài sau cần ký hiệu toán trong hình (ví dụ $\hat{y}$ cạnh mũi tên) | Hiện để ở chú thích và lời văn. Khi cần, thêm cách làm vào mục này: chữ nghiêng bằng `tspan`, hoặc chữ HTML đặt chồng theo `%` như mục 2.4 |

**Các lựa chọn tự quyết, đổi lại được sau F5:** tiền tố `atlas-fig-` và đuôi `Figure`; không đánh số "Hình 1" (nên không cần chuỗi giao diện); hình đặt thẳng trên nền trang, không có khối nền; khối trọng tâm dùng màu nhấn của site, nhóm thứ hai xanh dương viền đứt; `MlFamiliesFigure` chỉ có bố cục hẹp.

## 9. `PolyFitViz` và bộ dữ liệu `sine` (bài Overfitting và Underfitting)

> Viết ngày 23/10/2026, mốc M3. Mọi quy ước ở mục 2 vẫn áp dụng. Mục này chỉ ghi phần mới hoặc phần khác.
>
> **Quyết định đầu vào** ([mvp.md](../mvp.md) mục 7): 37 (VIZ thanh trượt bậc đa thức, sai số train/test, tái dùng kit), 38 (dữ liệu nhỏ tự sinh có seed, trong `src/data/datasets/`), 39 (test gọn: unit test cho toán của VIZ, dựa vào `viz.spec.ts` chung, không spec e2e riêng), 44 (phạm vi bài, 3 ô code, bài Regularization dùng lại dữ liệu).
>
> **Đã chạy thật:** mọi số trong mục này chạy bằng venv của mục 2.5 (Python 3.14.5, NumPy 2.4.6, scikit-learn 1.8.0, đúng phiên bản của Pyodide 314.0.7), lệnh `python -I`, từ một thư mục trống ngoài repo. Phép giải QR của TypeScript được mô phỏng bằng Python thuần (chỉ số thực IEEE, cùng thứ tự phép tính) để đo sai số trước khi viết code.

### 9.1. Mục tiêu và phạm vi

**Làm:**

- Bộ dữ liệu `sine-train` (16 điểm) và `sine-test` (8 điểm): một nguồn duy nhất cho lời văn, VIZ và 3 ô code. Bài `ml/regularization` dùng lại.
- Toán thuần `src/lib/viz/poly-fit.ts`: khớp đa thức bậc 1–15 ổn định về số, MSE, chọn bậc, lấy mẫu đường cong.
- VIZ `PolyFitViz`. **Ý một câu:** tăng bậc thì MSE train luôn giảm, còn MSE test giảm rồi tăng lại, nên bậc vừa phải mới dự đoán tốt nhất trên dữ liệu mới.
- Thêm vào kit những phần mục 2.4 đã hẹn "làm khi VIZ đầu tiên cần": đường cong (`PlotCurve`), dấu px tại vị trí % (`AtPoint`), khung đồ thị thấp (prop `shape` của `PlotFrame`). Thêm vài lớp vai trò vào `viz.css`.

**Không làm:**

- Thanh trượt $\lambda$ (VIZ của bài Regularization). `poly-fit.ts` chừa sẵn đường mở rộng (mục 9.7, rủi ro 7).
- Kiểm định chéo trong VIZ. Ô code thứ ba lo việc này.
- Đổi nhiễu, đổi số điểm, chia lại train/test, kéo điểm. Thang log.
- Spec e2e riêng và test island jsdom riêng (quyết định 39).

### 9.2. Phương án đã chọn

#### 9.2.1. Dữ liệu

| Tham số | Giá trị | Lý do |
|---|---|---|
| Hàm thật | $y = \sin(2\pi x)$ | Một chu kỳ trọn: đường thẳng không theo được, bậc 3 đã đủ dạng. Đây là ví dụ kinh điển của Bishop, *Pattern Recognition and Machine Learning* (2006), mục 1.1. Bài chỉ mượn ý, không chép |
| Khoảng $x$ | $[0, 1]$. $x_i = (i + u_i)/24$, $u_i \sim U(0.15, 0.85)$, $i = 0..23$ | Rải đều có rung. Không có khoảng trống lớn, vì khoảng trống làm đa thức bậc cao vọt lên ngay giữa dữ liệu. Không có hai điểm trùng sau khi làm tròn |
| Số điểm | **24 = 16 train + 8 test** | Đa thức bậc 15 có 16 hệ số ($w_1..w_{15}$ và $b$), nên cần ít nhất 16 điểm train để nghiệm duy nhất. Với đúng 16 điểm, bậc 15 đi qua mọi điểm train (MSE train bằng 0): đúng hình ảnh overfitting kinh điển. Nếu ít điểm hơn, bậc cao có vô số nghiệm; scikit-learn chọn nghiệm có chuẩn nhỏ nhất, nghiệm này phụ thuộc cách co giãn đặc trưng, nên TypeScript không tái hiện được. Quyết định 44 ghi "khoảng 20": 24 là số gần nhất thỏa ràng buộc này mà vẫn có 8 điểm test (câu hỏi 2, mục 9.7) |
| Nhiễu | Gauss, $\sigma = 0.2$ | Đủ để thấy bậc cao "học nhiễu", không đủ để che dạng sóng |
| Seed | `np.random.default_rng(236)` | Quét seed 0–399 theo tiêu chí ở dưới. Seed 236 cho đường chữ U rõ nhất: MSE test tăng đều sau bậc tốt nhất |
| Làm tròn | $x$ và $y$: 2 chữ số thập phân | **Số đã làm tròn là dữ liệu chuẩn.** Công thức sinh chỉ để ghi nguồn gốc. Python trong bài chép số, không sinh lại bằng RNG |
| Chia train/test | Cố định: điểm thứ $i$ (xếp theo $x$ tăng) vào test khi $i \bmod 3 = 1$ | Điểm test rải đều và nằm **trong** khoảng $x$ của train: điểm đầu (0.03) và điểm cuối (0.98) đều là train. Nhờ vậy bài không lẫn overfitting với ngoại suy. Chia ngẫu nhiên có thể đẩy một điểm test ra mép, khi đó MSE test ở bậc cao lên hàng triệu |

Tiêu chí quét seed (seed 236 đạt hết):

- bậc có MSE test nhỏ nhất nằm trong 3–5;
- MSE test bậc 1 ≥ 3 lần mức nhỏ nhất;
- MSE test bậc 15 từ 20 tới 3 000 lần mức nhỏ nhất;
- MSE train không tăng theo bậc, và MSE train ≤ MSE test ở mọi bậc (để người mới không bị rối);
- MSE test tăng dần từ bậc tốt nhất + 2 trở đi;
- $|y| \le 1.6$.

Nguồn gốc (ghi trong comment của `sine.ts`, không chạy lại trong bài):

```python
rng = np.random.default_rng(236)
x = (np.arange(24) + rng.uniform(0.15, 0.85, 24)) / 24
y = np.sin(2 * np.pi * x) + rng.normal(0, 0.2, 24)
x, y = np.round(x, 2), np.round(y, 2)
test = np.arange(24) % 3 == 1          # 8 test points, 16 training points
```

Số liệu chốt, chép nguyên vào `sine.ts` (mục 9.4.1) và vào code Python:

| | Giá trị |
|---|---|
| `x_train` | 0.03, 0.12, 0.15, 0.23, 0.26, 0.35, 0.41, 0.47, 0.51, 0.6, 0.64, 0.73, 0.77, 0.85, 0.9, 0.98 |
| `y_train` | 0.15, 1.06, 0.84, 0.96, 0.83, 0.94, 0.3, −0.09, −0.17, −0.32, −0.68, −0.84, −0.28, −0.82, −0.53, −0.02 |
| `x_test` | 0.06, 0.18, 0.32, 0.43, 0.55, 0.67, 0.8, 0.94 |
| `y_test` | 0.33, 0.66, 0.93, 0.43, −0.42, −1.11, −1.18, −0.45 |

Độ lệch lớn nhất so với hàm thật là 0.71, ở điểm train $(0.77, -0.28)$. Đây là điểm mà đa thức bậc cao "đuổi theo", lời văn có thể chỉ vào nó.

**Bảng MSE theo bậc** (`make_pipeline(PolynomialFeatures(d, include_bias=False), LinearRegression())` khớp trên 16 điểm train, MSE hệ số $\frac{1}{m}$):

| Bậc $d$ | MSE train | MSE test | VIZ hiện (train / test) | Trạng thái (mục 9.2.5) |
|---:|---:|---:|---|---|
| 1 | 0.1663 | 0.2732 | 0.1663 / 0.2732 | underfitting |
| 2 | 0.1624 | 0.2766 | 0.1624 / 0.2766 | underfitting |
| **3** | **0.0377** | **0.0754** | 0.0377 / 0.0754 | vừa khớp, **MSE test nhỏ nhất** |
| 4 | 0.0308 | 0.0896 | 0.0308 / 0.0896 | vừa khớp |
| 5 | 0.0301 | 0.0969 | 0.0301 / 0.0969 | vừa khớp |
| 6 | 0.0287 | 0.0982 | 0.0287 / 0.0982 | vừa khớp |
| 7 | 0.0247 | 0.1027 | 0.0247 / 0.1027 | vừa khớp |
| 8 | 0.0216 | 0.1215 | 0.0216 / 0.1215 | vừa khớp |
| 9 | 0.0206 | 0.1656 | 0.0206 / 0.1656 | overfitting |
| 10 | 0.0189 | 0.3286 | 0.0189 / 0.3286 | overfitting |
| 11 | 0.0077 | 0.6439 | 0.0077 / 0.6439 △ | overfitting |
| 12 | 0.0013 | 3.5439 | 0.0013 / 3.5439 △ | overfitting |
| 13 | 0.0009 | 4.2848 | 0.0009 / 4.2848 △ | overfitting |
| 14 | 0.0002 | 30.0702 | 0.0002 / 30.07 △ | overfitting |
| 15 | 0.0000 | 133.1963 | 0.0000 / 133.20 △ | overfitting |

△: nằm ngoài khung của biểu đồ sai số (MSE > 0.4, mục 9.2.4).

Ghi chú cho lời văn:

- Bậc 1 underfitting rõ: MSE train gấp 4.4 lần bậc 3, MSE test gấp 3.6 lần.
- Bậc 2 không khá hơn bậc 1 (0.2766 so với 0.2732). Một chu kỳ sin đối xứng tâm quanh điểm $(0.5, 0)$, nên thêm $x^2$ gần như không giúp gì. Lời văn có thể nhắc, không bắt buộc.
- Bậc 15: MSE train in ra `0.0000` khi định dạng `:.4f`. Giá trị thô của scikit-learn là khoảng `1e-11`, tức sai số làm tròn, bản chất là 0. Code phải in bằng `:.4f`, không `print(mse)` trần.
- MSE test bậc 14 và 15 chỉ khớp tới 2 chữ số thập phân giữa các cách tính (mục 9.2.2). Ví dụ: chỉ cần bỏ `include_bias=False` là bậc 15 in ra `133.2004` thay cho `133.1963`; giá trị tính bằng phép giải ổn định là 133.1961. Lời văn trích "khoảng 133", không trích 4 chữ số thập phân.
- Kiểm định chéo (ô code 3) trên 16 điểm train, `KFold(n_splits=4, shuffle=True, random_state=0)`, bậc 1–10: chọn **bậc 3**, MSE trung bình 0.0784. `KFold(5, …, random_state=0)` cũng chọn 3, còn `LeaveOneOut` chọn 4. Khớp lại bậc 3 trên cả tập train thì MSE test là 0.0754, trùng bảng trên.

#### 9.2.2. Độ ổn định số khi khớp bậc 15

Ma trận Vandermonde $\mathbf{V}$ (các cột $1, t, t^2, \dots, t^d$) trên 16 điểm, sau khi chuẩn hóa $x$ về $t \in [-1, 1]$, có số điều kiện $8.6 \times 10^6$ ở bậc 15. Trên $x \in [0, 1]$ chưa chuẩn hóa thì tệ hơn nhiều.

| Phương án | Sai số đo được ở bậc 15 (so với `np.linalg.lstsq` trên $t$) | Đánh giá |
|---|---|---|
| A. Phương trình chuẩn $\mathbf{V}^\top\mathbf{V}\mathbf{c} = \mathbf{V}^\top\mathbf{y}$, giải bằng Cholesky | 1.4e-3 (cả MSE lẫn giá trị trên lưới) | Bình phương số điều kiện (khoảng 7e13). Vượt dung sai, có thể đổi chữ số hiện ra. Loại |
| **B. Chuẩn hóa $t = 2x - 1$, QR Householder trên $\mathbf{V}$, rồi thế ngược (chọn)** | **9e-11** | Ổn định, khoảng 40 dòng TS, không gói npm. Chạy được cả lúc build lẫn trên trình duyệt |
| C. Tính sẵn hệ số bằng Python, lưu cứng 135 số | 0 | Hai nơi phải đồng bộ bằng tay. Thêm khoảng 3.5 KB vào `props` hoặc JS. Bài Regularization lại phải lưu thêm một bộ cho mỗi $\lambda$. Loại |

**Quy tắc của B:**

- Chuẩn hóa theo **miền vẽ** `xDomain` = [0, 1], không theo min/max của dữ liệu: $t = (2x - (a + b))/(b - a)$. Đa thức theo $t$ và đa thức theo $x$ là cùng một tập hàm, nên dự đoán giống hệt về toán, chỉ khác sai số làm tròn.
- Householder chọn dấu $\alpha = -\operatorname{sign}(r_{kk})\,\lVert \cdot \rVert$ để tránh triệt tiêu. Báo lỗi (throw, kèm thông báo rõ) khi số hàng < số cột, hoặc khi $|r_{kk}| \le 10^{-12} \max_j |r_{jj}|$ (thiếu hạng, ví dụ hai điểm train trùng $x$).
- **Chỉ dùng** `+ − × ÷`, `Math.sqrt`, `Math.abs`. **Không** dùng `**`, `Math.pow`, `Math.hypot`, `Math.exp`, `Math.sin` trong `poly-fit.ts`. Lũy thừa tính bằng nhân lặp. IEEE 754 bắt buộc các phép trên làm tròn đúng, nên kết quả **giống từng bit** giữa Node lúc build và mọi trình duyệt. Nhờ vậy HTML dựng sẵn và lần render khi hydrate trùng nhau (mục 2.8). Unit test quét file để giữ quy tắc này.
- `Math.sin` của hàm thật chỉ chạy **lúc build**, trong wrapper (mục 9.2.3), không chạy trong island.

**So với scikit-learn** (fixture, mục 9.4.1). Sai số chủ yếu đến từ phía scikit-learn: bài dùng `PolynomialFeatures` trên $x$ thô, số điều kiện lớn hơn, nên ở bậc 15 lệch tham chiếu khoảng 1.2e-5 (tương đối, cả MSE lẫn giá trị trên lưới). QR trên $t$ chỉ lệch 9e-11. Nếu bỏ `include_bias=False`, scikit-learn lệch tới khoảng 4e-5.

- **Dung sai giữa TS và fixture:** $|\Delta| \le 5 \times 10^{-4} \cdot \max(1, |v_{py}|)$. Áp dụng cho MSE train, MSE test, và giá trị dự đoán trên lưới $x = 0, 0.1, \dots, 1$ ở các bậc 1, 3, 9, 15. Mức đo được lớn nhất là 1.2e-5, tức dư khoảng 40 lần.
- **Điều người đọc thấy phải giống hệt:** chuỗi `formatMse` của số TS bằng chuỗi `formatMse` của số Python, cho đủ 30 giá trị. Mô phỏng đã cho 30/30 trùng.
- **Định dạng MSE** (`formatMse`): dưới 10 thì 4 chữ số thập phân, từ 10 trở lên thì 2. Lý do: ở bậc 14–15, chữ số thứ 3–4 sau dấu chấm khác nhau giữa các cách tính, còn 2 chữ số đầu thì không. Độ rộng chuỗi gần như không đổi (`0.2732`, `30.07`, `133.20`).

**Đường cong vọt ra ngoài khung.** Đa thức bậc 15 đạt khoảng −471 tới 115 trên $[0, 1]$, trong khi miền $y$ là $[-2, 2]$. Bậc 9 đã ra khỏi khung ở mép (−3.0).

- Đường cong là `polyline` trong một SVG lồng `viewBox="0 0 100 100" preserveAspectRatio="none" overflow="hidden"` phủ kín vùng vẽ (`PlotCurve`, mục 9.4.4). Nét có `vector-effect="non-scaling-stroke"`. Trình duyệt tự cắt ở mép, nên đường cong "đi ra khỏi khung" đúng như thật.
- **Không kẹp** giá trị $y$ về mép. Kẹp sẽ vẽ những đoạn nằm ngang chạy dọc mép, là hình sai. Chỉ chặn ở ±1e5 đơn vị `viewBox` để tránh số vô lý. Với dữ liệu này, giá trị lớn nhất khoảng 1.2e4 đơn vị, không bao giờ chạm mức chặn.
- Điểm dữ liệu nằm ở SVG ngoài (`overflow: visible`) và luôn ở trong khung, nên không bị cắt.
- Lấy mẫu đường cong đã khớp: **201 điểm** trên `xDomain` (bước 0.005, tức khoảng 1.5–3.4px). Lấy mẫu hàm thật: **61 điểm**, vì đường sin trơn.

#### 9.2.3. Tính ở đâu

| Phương án | Đánh giá |
|---|---|
| **A. Island tính cả 15 lần khớp một lần (`useMemo`) từ `rows`. HTML dựng sẵn chạy cùng code đó lúc build (chọn)** | `props` nhỏ (chỉ 24 điểm). JS thêm khoảng 0.6 KB gzip cho QR. Lúc mount: 15 phép QR cỡ ≤ 16×16, dưới 1 ms. Mỗi lần kéo chỉ chọn lần khớp có sẵn và tính 201 giá trị Horner. Dữ liệu sai thì build lỗi, vì render lúc build throw |
| B. Wrapper khớp lúc build, truyền 135 hệ số qua `props` | Island nhẹ hơn khoảng 0.6 KB, nhưng `props` thêm khoảng 3.5 KB (Astro bọc mỗi số thành `[0,x]`), sát ngưỡng 8 KB (mục 2.9) |

Riêng đường hàm thật: wrapper tính sẵn chuỗi `points` lúc build (`Math.sin` chỉ chạy ở đó), khoảng 0.75 KB trong `props`.

#### 9.2.4. Hình thức: thêm biểu đồ sai số theo bậc

| Phương án | Đánh giá |
|---|---|
| A. Chỉ hai số MSE train, MSE test | Gọn hơn khoảng 220px trên điện thoại. Nhưng người đọc phải tự nhớ số cũ khi kéo mới thấy "giảm rồi tăng", mà đó lại chính là ý của VIZ |
| **B. Thêm một biểu đồ thấp: MSE train và MSE test theo bậc, vạch dọc ở bậc đang chọn (chọn)** | Thấy ngay hình chữ U, và thấy mình đang đứng ở đâu trên đó. Dùng lại `PlotFrame`. Đổi lại VIZ cao hơn (rủi ro 1). Xem câu hỏi 1, mục 9.7 |

**Trục $y$ của biểu đồ sai số:** tuyến tính $[0, 0.4]$, có cắt. Không dùng thang log.

- Thang log khó với người mới, và không vẽ được MSE train bằng 0 ở bậc 15.
- Với $[0, 0.4]$: mọi MSE train, và MSE test bậc 1–10, nằm trong khung. Đáy chữ U (0.075–0.12) thấy rõ.
- Bậc 11–15 có MSE test > 0.4. Ở đó vẽ **tam giác rỗng hướng lên** sát mép trên thay cho vòng tròn, kèm một dòng chú giải "vượt khung". Đường nối vẫn vẽ và tự bị cắt ở mép trên. Số chính xác luôn có ở dòng số.

#### 9.2.5. Dòng trạng thái underfitting / overfitting

Nhãn trạng thái **tính từ dữ liệu**, không ghi tay. Gọi $d^\ast$ là bậc có MSE test nhỏ nhất (lấy bậc thấp hơn nếu bằng nhau), `ZONE_RATIO = 2`:

- **underfitting**: $d < d^\ast$ và MSE train$(d) \ge 2 \cdot$ MSE train$(d^\ast)$;
- **overfitting**: $d > d^\ast$ và MSE test$(d) \ge 2 \cdot$ MSE test$(d^\ast)$;
- còn lại: **vừa khớp**.

Với dữ liệu này: 1–2 underfitting, 3–8 vừa khớp, 9–15 overfitting (bảng ở 9.2.1). Tại $d^\ast = 3$ có thêm dòng ✓ "Bậc có MSE test nhỏ nhất". Đây là mốc gần đúng để dẫn dắt, không phải định nghĩa, và lời văn nên nói vậy.

### 9.3. Cấu trúc file

```
src/
├─ data/datasets/
│  ├─ sine.ts                         # new (lesson-writer, step L): SINE_TRAIN, SINE_TEST, SINE_TRUTH; SINE_POLY_FIT added in P1
│  └─ index.ts                        # + 'sine-train', 'sine-test'
├─ lib/viz/
│  └─ poly-fit.ts                     # new (P0), pure: toUnit, leastSquaresQR, fitPolynomial, evalPolynomial, polyMse,
│                                     #   fitDegrees, bestDegree, fitZone, sampleCurve, toPolyline, formatMse
├─ components/
│  ├─ DatasetTable.astro              # P0: header without "( )" when the unit is empty
│  └─ viz/
│     ├─ viz.css                      # P2: + role var --atlas-viz-alt and a few role classes (9.4.7)
│     ├─ PolyFitViz.astro             # new (P3): wrapper
│     ├─ poly-fit-viz/
│     │  └─ PolyFitVizIsland.tsx      # new (P3)
│     ├─ LinearFitViz.astro           # P2: imports AxisText from kit/types.ts (no behaviour change)
│     ├─ linear-fit-viz/LinearFitVizIsland.tsx   # P2: same import change
│     └─ kit/
│        ├─ PlotFrame.tsx             # P2: + optional prop shape ('default' | 'short')
│        ├─ PlotCurve.tsx             # new (P2): polyline in a nested viewBox svg, clipped to the plot
│        ├─ AtPoint.tsx               # new (P2): px-sized mark at a % position (nested svg 1×1, overflow visible)
│        └─ types.ts                  # new (P2): AxisText (moved from LinearFitVizIsland.tsx)
├─ i18n/ui.ts, content/i18n/{vi,en}.json   # P2: namespace vizPolyFit, 20 keys (9.4.8)
└─ code/ml/overfitting-underfitting/  # lesson-writer: 3 cells .{vi,en}.py, data under "# dataset: sine-train" / "sine-test"
tests/unit/
├─ datasets.test.ts                   # P0: a unit may be '' when it is '' in every locale
├─ poly-fit.test.ts                   # new (P0): math by hand examples, no real data; scans for forbidden Math calls
├─ poly-fit-sine.test.ts              # new (P1): data invariants, Python fixture, SINE_POLY_FIT, the numbers of 9.2.1
└─ fixtures/poly-fit-python.ts        # new (P1): numbers from scikit-learn, with the command that made them
tests/e2e/
└─ viz.spec.ts                        # P4 (tester): the contrast check learns polyline, polygon, ring, cursor (9.4.7)
```

Không bắt buộc chuyển `CrossMark` của `LinearFitViz` sang `AtPoint` ở lượt này. Đổi khi có dịp sửa `LinearFitViz`.

### 9.4. Giao diện

#### 9.4.1. Dữ liệu: `src/data/datasets/sine.ts`

```ts
// src/data/datasets/sine.ts — the one copy of the overfitting data (decisions 38, 44; viz.md section 9.2.1).
// Made with NumPy 2.4.6: rng = np.random.default_rng(236); x = (np.arange(24) + rng.uniform(0.15, 0.85, 24)) / 24;
// y = np.sin(2 * np.pi * x) + rng.normal(0, 0.2, 24); both rounded to 2 decimals; every third point
// (i % 3 == 1, by increasing x) is a test point. The rounded numbers below ARE the data: no code regenerates them.
// Relative imports only: Playwright e2e imports this file too.
import type { XYDataset } from './types';

const X = { name: { vi: 'x', en: 'x' }, unit: { vi: '', en: '' }, digits: 2 } as const;
const Y = { name: { vi: 'y', en: 'y' }, unit: { vi: '', en: '' }, digits: 2 } as const;

export const SINE_TRAIN = {
  id: 'sine-train',
  lessons: ['ml/overfitting-underfitting'], // + 'ml/regularization' when that lesson is written
  caption: {
    vi: '16 điểm train, tự sinh từ đường sin y = sin(2πx) cộng nhiễu. Không phải số liệu thật.',
    en: '16 training points, generated from the sine curve y = sin(2πx) plus noise. Not real data.',
  },
  itemLabel: { vi: 'Điểm train', en: 'Training point' },
  description: {
    vi: '16 điểm train, x từ 0.03 tới 0.98, đi theo một vòng sóng: lên gần 1 khi x từ 0.1 tới 0.35, ' +
      'xuống gần −1 khi x từ 0.7 tới 0.85, rồi về gần 0. Các điểm lệch khỏi dạng sóng vì có nhiễu.',
    en: '16 training points, x from 0.03 to 0.98, follow one wave: up near 1 for x from 0.1 to 0.35, ' +
      'down near −1 for x from 0.7 to 0.85, then back near 0. The points stray from the wave because of noise.',
  },
  x: { ...X, python: 'x_train' },
  y: { ...Y, python: 'y_train' },
  rows: [
    [0.03, 0.15], [0.12, 1.06], [0.15, 0.84], [0.23, 0.96], [0.26, 0.83], [0.35, 0.94], [0.41, 0.3], [0.47, -0.09],
    [0.51, -0.17], [0.6, -0.32], [0.64, -0.68], [0.73, -0.84], [0.77, -0.28], [0.85, -0.82], [0.9, -0.53], [0.98, -0.02],
  ],
} as const satisfies XYDataset;

export const SINE_TEST = {
  id: 'sine-test',
  lessons: ['ml/overfitting-underfitting'],
  caption: {
    vi: '8 điểm test, sinh cùng cách với tập train và không dùng khi khớp.',
    en: '8 test points, generated like the training set and never used for fitting.',
  },
  itemLabel: { vi: 'Điểm test', en: 'Test point' },
  description: {
    vi: '8 điểm test nằm xen giữa các điểm train, theo cùng dạng sóng.',
    en: '8 test points sit between the training points and follow the same wave.',
  },
  x: { ...X, python: 'x_test' },
  y: { ...Y, python: 'y_test' },
  rows: [[0.06, 0.33], [0.18, 0.66], [0.32, 0.93], [0.43, 0.43], [0.55, -0.42], [0.67, -1.11], [0.8, -1.18], [0.94, -0.45]],
} as const satisfies XYDataset;

/** The noise-free curve. f runs at build time only (PolyFitViz.astro), never in the island (section 9.2.2). */
export const SINE_TRUTH = {
  f: (x: number): number => Math.sin(2 * Math.PI * x),
  sigma: 0.2,
  description: {
    vi: 'Dữ liệu được sinh từ đường sin y = sin(2πx) cộng nhiễu ngẫu nhiên.',
    en: 'The data come from the sine curve y = sin(2πx) plus random noise.',
  },
} as const;

// Added by viz-builder in P1 (section 9.4.3): export const SINE_POLY_FIT: PolyFitConfig = { … };
```

`index.ts`: `DATASETS = { apartments: APARTMENTS, 'sine-train': SINE_TRAIN, 'sine-test': SINE_TEST }`. Dùng hai bộ riêng thay vì một bộ có cột "tập", vì khuôn `# dataset:` và hàm `checkPythonDatasets` dùng được ngay, không phải sửa, và mỗi bộ tự có tên biến Python.

**Đơn vị rỗng.** $x$, $y$ ở đây không có đơn vị. P0 nới hai chỗ:

- `datasets.test.ts`: `unit` được rỗng khi rỗng ở **mọi** ngôn ngữ. Rỗng ở một ngôn ngữ vẫn báo lỗi.
- `DatasetTable`: tiêu đề cột chỉ là `name` khi `unit` rỗng, không in "x ()".

Wrapper `PolyFitViz` dựng tên trục theo cùng luật.

**Trong code Python** (khuôn mục 2.5), mỗi ô có hai khối, mỗi mảng một dòng:

```python
# dataset: sine-train
x_train = np.array([0.03, 0.12, 0.15, 0.23, 0.26, 0.35, 0.41, 0.47, 0.51, 0.6, 0.64, 0.73, 0.77, 0.85, 0.9, 0.98])
y_train = np.array([0.15, 1.06, 0.84, 0.96, 0.83, 0.94, 0.3, -0.09, -0.17, -0.32, -0.68, -0.84, -0.28, -0.82, -0.53, -0.02])
# dataset: sine-test
x_test = np.array([0.06, 0.18, 0.32, 0.43, 0.55, 0.67, 0.8, 0.94])
y_test = np.array([0.33, 0.66, 0.93, 0.43, -0.42, -1.11, -1.18, -0.45])
```

Dòng dài khoảng 120 ký tự, khối code tự cuộn ngang trên điện thoại. Chấp nhận được, vì đây là dữ liệu, không phải code cần đọc kỹ.

**Fixture Python** `tests/unit/fixtures/poly-fit-python.ts` (P1). Lệnh chạy từ thư mục trống, bằng venv mục 2.5:

```python
# python -I fixture.py  →  numbers for tests/unit/fixtures/poly-fit-python.ts
import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
x_train = np.array([...]); y_train = np.array([...]); x_test = np.array([...]); y_test = np.array([...])  # as above
grid = np.linspace(0, 1, 11)
for d in range(1, 16):
    m = make_pipeline(PolynomialFeatures(d, include_bias=False), LinearRegression()).fit(x_train[:, None], y_train)
    tr = np.mean((m.predict(x_train[:, None]) - y_train) ** 2)
    te = np.mean((m.predict(x_test[:, None]) - y_test) ** 2)
    print(d, repr(float(tr)), repr(float(te)), m.predict(grid[:, None]).tolist() if d in (1, 3, 9, 15) else [])
```

```ts
export const PYTHON_POLY_FIT = {
  train: [/* copy of SINE_TRAIN.rows */],
  test: [/* copy of SINE_TEST.rows */],
  mse: [/* { degree: 1, train: 0.16631950392817857, test: 0.27320046663099196 }, … 15 entries */],
  grid: { x: [0, 0.1, /* … */ 1], pred: { 1: [/* 11 numbers */], 3: [], 9: [], 15: [] } },
} as const;
```

Đã chạy thử lệnh trên: bậc 1 ra `0.16631950392817857`, `0.27320046663099196`; bậc 15 ra `1.0175002343048952e-11`, `133.1963072184929`, và dự đoán tại $x = 0$ là −471.1182.

#### 9.4.2. Toán: `src/lib/viz/poly-fit.ts`

```ts
// src/lib/viz/poly-fit.ts — pure, relative imports only. Only + − × ÷, Math.sqrt, Math.abs (section 9.2.2).
import type { Row } from '../../data/datasets/types';
import type { Point, SliderSpec } from './linear-fit';
import type { Domain } from './scale';

export const LARGE_MSE = 10; // from here formatMse shows digits.mseLarge decimals
export const ZONE_RATIO = 2; // section 9.2.5
export type FitZone = 'underfit' | 'good' | 'overfit';

export interface DegreeFit {
  degree: number;
  coef: readonly number[]; // c_0..c_d of ŷ = Σ c_k t^k, t = toUnit(x, domain)
  mseTrain: number;
  mseTest: number;
}

export interface PolyFitConfig {
  degree: SliderSpec;                                   // the slider
  xDomain: Domain; yDomain: Domain;                     // main plot; xDomain is also the scaling domain of the fit
  xTicks: readonly number[]; yTicks: readonly number[];
  degreeDomain: Domain; degreeTicks: readonly number[]; // x of the error chart
  mseDomain: Domain; mseTicks: readonly number[];       // y of the error chart; values above are "off the chart"
  samples: number;                                      // points of the fitted curve over xDomain
  truthSamples: number;                                 // points of the true curve (wrapper, build time)
  digits: { mse: number; mseLarge: number };
}

/** t = (2x − (a + b)) / (b − a): the domain [a, b] onto [−1, 1]. */
export function toUnit(x: number, domain: Domain): number;
/** Householder QR, then back substitution. A is m × n with m ≥ n. Throws on m < n or a rank-deficient A
 *  (|r_kk| ≤ 1e-12 · max |r_jj|), with a message naming the sizes. */
export function leastSquaresQR(A: readonly (readonly number[])[], y: readonly number[]): number[];
/** Throws when rows.length < degree + 1. */
export function fitPolynomial(rows: readonly Row[], degree: number, domain: Domain): number[];
/** Horner in t. */
export function evalPolynomial(coef: readonly number[], x: number, domain: Domain): number;
/** (1/m) Σ (ŷ − y)²; throws on no rows. */
export function polyMse(rows: readonly Row[], coef: readonly number[], domain: Domain): number;
/** One fit per slider degree (spec.min..spec.max), on train; MSE on train and on test. */
export function fitDegrees(train: readonly Row[], test: readonly Row[], spec: SliderSpec, domain: Domain): DegreeFit[];
/** Degree with the smallest test MSE; the lowest degree on a tie. */
export function bestDegree(fits: readonly DegreeFit[]): number;
export function fitZone(fits: readonly DegreeFit[], degree: number): FitZone;
/** n points of f, evenly spaced over the domain, both ends included (n ≥ 2). */
export function sampleCurve(f: (x: number) => number, domain: Domain, n: number): Point[];
/** "x,y x,y …" in viewBox 0 0 100 100 units (y down), toFixed(2), "-0.00" → "0.00", y held within ±1e5. */
export function toPolyline(points: readonly Point[], x: Domain, y: Domain): string;
/** formatNumber(value, value < LARGE_MSE ? digits.mse : digits.mseLarge). */
export function formatMse(value: number, digits: PolyFitConfig['digits']): string;
```

#### 9.4.3. Cấu hình đã chọn: `SINE_POLY_FIT`

```ts
export const SINE_POLY_FIT: PolyFitConfig = {
  degree: { min: 1, max: 15, step: 1, initial: 1 },
  xDomain: [0, 1], yDomain: [-2, 2],
  xTicks: [0, 0.2, 0.4, 0.6, 0.8, 1], yTicks: [-2, -1, 0, 1, 2],
  degreeDomain: [0.5, 15.5], degreeTicks: [1, 5, 10, 15],
  mseDomain: [0, 0.4], mseTicks: [0, 0.1, 0.2, 0.3, 0.4],
  samples: 201, truthSamples: 61,
  digits: { mse: 4, mseLarge: 2 },
};
```

| Lựa chọn | Lý do |
|---|---|
| Bậc ban đầu 1 | Bắt đầu từ underfitting. Kéo lên, người đọc thấy MSE test giảm mạnh ở bậc 3 rồi tăng dần |
| `degree.max` = 15 = số điểm train − 1 | Bậc cao nhất còn nghiệm duy nhất (mục 9.2.1). Test bắt buộc `max ≤ train.length − 1` |
| `yDomain` $[-2, 2]$ | Mọi điểm (−1.18 tới 1.06) nằm trong khung. Đường bậc 8 còn trong khung (thấp nhất −1.7), bậc 9 bắt đầu ra ngoài (−3.0): khớp với mốc overfitting từ bậc 9 |
| `degreeDomain` $[0.5, 15.5]$ | Điểm bậc 1 và bậc 15 không nằm sát trục. Vạch chia 1, 5, 10, 15 không chồng nhau ở 375px. Đây là ngoại lệ, có lý do, của luật "vạch chia có cả hai đầu miền" (mục 4.1) |
| `mseDomain` $[0, 0.4]$ | Mục 9.2.4: 10 bậc đầu nằm trong khung, bậc 11–15 thành tam giác |

**Ràng buộc** (`poly-fit-sine.test.ts` kiểm tra hết):

- `SINE_TRAIN.rows` có 16 dòng, `SINE_TEST.rows` có 8 dòng. Trong mỗi bộ, $x$ tăng ngặt. Hai bộ không trùng $x$ nào.
- $\min x$ và $\max x$ của cả 24 điểm đều thuộc train (test không ngoại suy).
- $|y - \sin(2\pi x)| \le 4\sigma = 0.8$ ở mọi điểm (đo được: lớn nhất 0.71).
- Mọi điểm nằm trong `xDomain` × `yDomain`.
- Thanh trượt: `min = 1`, `step = 1`, `min ≤ initial ≤ max ≤ train.length − 1`.
- Vạch chia tăng dần và nằm trong miền.
- `samples ≥ 101`, `truthSamples ≥ 31`.
- Mọi MSE train, và MSE test bậc 1–10, nằm trong `mseDomain`.

#### 9.4.4. Kit: phần thêm

```tsx
// kit/types.ts — moved from LinearFitVizIsland.tsx, unchanged
export interface AxisText { name: string; unit: string; title: string } // title = name when unit is ''

// kit/PlotFrame.tsx — one new optional prop; everything else as in section 4.3
shape?: 'default' | 'short'; // 'short' → data-shape="short" on .atlas-viz-chart: a low plot (9.4.7)

// kit/PlotCurve.tsx — a curve in data space, clipped to the plot box (section 2.4, "Đường cong")
export interface PlotCurveProps {
  points: string;    // toPolyline(...) output
  className: string; // a role class: atlas-viz-primary | atlas-viz-series | atlas-viz-series-alt | atlas-viz-guide
  off?: boolean;     // data-off on the nested svg: hidden, keeps its place
}
// DOM: <svg x="0" y="0" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
//        overflow="hidden" data-off?><polyline class points vector-effect="non-scaling-stroke" /></svg>

// kit/AtPoint.tsx — px-sized marks at a % position (the CrossMark trick of section 2.4, now shared)
export interface AtPointProps { x: string; y: string; children: React.ReactNode } // pct() strings
// DOM: <svg x y width="1" height="1" overflow="visible">{children}</svg>
```

#### 9.4.5. `PolyFitViz`: wrapper và island

```astro
---
// src/components/viz/PolyFitViz.astro — sketch, not the full implementation
import PolyFitVizIsland from './poly-fit-viz/PolyFitVizIsland';
import type { AxisText } from './kit/types';
import { SINE_POLY_FIT, SINE_TEST, SINE_TRAIN, SINE_TRUTH } from '@data/datasets/sine';
import { sampleCurve, toPolyline } from '@lib/viz/poly-fit';
// + getStrings, getPageLocale, renderInlineMarkup, inlineMarkupLabel, as in LinearFitViz.astro

const config = SINE_POLY_FIT;
const truthPoints = toPolyline(
  sampleCurve(SINE_TRUTH.f, config.xDomain, config.truthSamples), config.xDomain, config.yDomain);
// description = SINE_TRAIN.description + ' ' + SINE_TEST.description + ' ' + SINE_TRUTH.description (page locale)
---
<div class="atlas-viz not-content" lang={locale} data-pagefind-ignore>
  <PolyFitVizIsland client:visible={{ rootMargin: '200px' }} train={SINE_TRAIN.rows} test={SINE_TEST.rows}
    config={config} truthPoints={truthPoints} axes={…} itemLabels={…} description={…} labels={…} strings={strings} />
  <noscript><p class="atlas-viz-noscript">{tCommon.needsScript}</p></noscript>
</div>
```

```ts
// src/components/viz/poly-fit-viz/PolyFitVizIsland.tsx
export interface PolyFitVizIslandProps {
  train: readonly Row[];
  test: readonly Row[];
  config: PolyFitConfig;
  truthPoints: string;                                // toPolyline of the true curve, built by the wrapper
  axes: { x: AxisText; y: AxisText };                 // 'x', 'y': title = name (no unit)
  itemLabels: { train: string; test: string };        // SINE_TRAIN / SINE_TEST .itemLabel[locale]
  description: string;                                // sr-only description of the main plot
  labels: { degreeHtml: string; degreeText: string }; // KaTeX HTML and accessible name of degreeLabel
  strings: UiStrings<'vizPolyFit'>;
}
// State: degree = config.degree.initial, showTruth = false, live = ''. hydrated = useHydrated().
// Memo once: fits = fitDegrees(train, test, config.degree, config.xDomain); best = bestDegree(fits).
// Memo on degree: curve = toPolyline(sampleCurve(x => evalPolynomial(fit.coef, x, xDomain), xDomain, samples), …).
// Every render: fit = fits[degree − min], zone = fitZone(fits, degree).
// Live region: settled = useSettled(degree) → announce (9.4.6).
```

#### 9.4.6. Hành vi và bố cục

Thứ tự từ trên xuống, giữ nguyên trên điện thoại:

1. **Chú thích** (`figcaption`): `caption`.
2. **Đồ thị chính** (`PlotFrame`, `aria-label` = `plotLabel`, mô tả `sr-only` = `description`). Vẽ từ dưới lên:
   - hàm thật: `PlotCurve` lớp `atlas-viz-guide`, có `off` khi chưa bật;
   - đa thức đã khớp: `PlotCurve` lớp `atlas-viz-primary`;
   - 8 điểm test: `circle.atlas-viz-ring`, `r = 6`;
   - 16 điểm train: `circle.atlas-viz-point`, `r = 6`, nằm trên cùng.
3. **Chú giải** (`ul.atlas-viz-key`, 4 mục): ● `itemLabels.train`; ○ `itemLabels.test`; ─ `curve`; ┄ `truth`. Mục thứ tư có `data-off` khi chưa bật hàm thật, để giữ chỗ.
4. **Điều khiển** (`role="group"`, `aria-label` = `controls`):
   - `VizSlider` cho bậc: nhãn `degreeLabel`, số hiện là bậc (`formatNumber(d, 0)`), `aria-valuetext` = `degreeValueText`;
   - nút bật/tắt `showTruth` (`aria-pressed`, nhãn cố định), giống nút của `LinearFitViz`.
5. **Dòng số** (`.atlas-viz-readouts`, 2 dòng thẳng hàng):
   - mẫu nét liền kèm chấm đặc, `trainMse`, rồi số;
   - mẫu nét đứt kèm vòng rỗng, `testMse`, rồi số.

   Số dùng `formatMse`. Mẫu nét ở đây cũng là chú giải cho biểu đồ sai số.
6. **Biểu đồ sai số** (`PlotFrame shape="short"`, tên trục `degreeAxis` và `mseAxis`, `aria-label` = `errorLabel`, mô tả `sr-only` = `errorDesc`). Vẽ từ dưới lên:
   - vạch dọc ở bậc đang chọn: `line.atlas-viz-cursor`;
   - đường MSE train: `PlotCurve` lớp `atlas-viz-series`;
   - đường MSE test: `PlotCurve` lớp `atlas-viz-series atlas-viz-series-alt`;
   - 15 chấm MSE train: `circle.atlas-viz-point`, `r = 4`;
   - MSE test ≤ `mseDomain[1]`: `circle.atlas-viz-ring`, `r = 4`. Lớn hơn: tam giác rỗng hướng lên, `polygon.atlas-viz-ring` trong `AtPoint` ở mép trên, đỉnh chạm mép (`points="0,1 6,11 -6,11"`).
7. **Chú giải vượt khung** (`ul.atlas-viz-key`, 1 mục): mẫu tam giác + `overNote`.
8. **Dòng trạng thái** (`.atlas-viz-status`):
   - luôn có một `p`: `underfit`, `goodFit` hoặc `overfit`;
   - khi $d = d^\ast$, thêm `p.atlas-viz-near` có ✓ và `bestDegree`.
9. Phần ẩn: hai mô tả `sr-only`, vùng live.

**Thanh trượt:** mỗi lần đổi giá trị thì vẽ lại ngay đường khớp, vạch dọc, dòng số và dòng trạng thái. Sau `SETTLE_MS` thì vùng live đọc `announce`. `{{zone}}` là chữ trạng thái, nối thêm `bestDegree` khi $d = d^\ast$.

**Nút "Hiện hàm thật":** bật thì bỏ `data-off` ở đường hàm thật và ở mục chú giải thứ tư. Không đọc gì thêm, vì `aria-pressed` đã báo trạng thái.

**Chống xê dịch:** mọi thứ nút làm hiện ra đều đã giữ chỗ. Dòng trạng thái nằm cuối khối, nên khi nó đổi số dòng chỉ đẩy phần nằm dưới (mục 2.8).

**Trước khi hydrate:** hình ở bậc 1, thanh trượt và nút có `disabled`, có `<noscript>`.

**Số phần tử trong mỗi `.atlas-viz-plot`** (test đếm ở đây, không đếm trên cả khối, vì chú giải dùng cùng lớp):

- đồ thị chính: 16 `circle.atlas-viz-point`, 8 `circle.atlas-viz-ring`, 2 `polyline`;
- biểu đồ sai số, với dữ liệu này: 15 `circle.atlas-viz-point`, 10 `circle.atlas-viz-ring`, 5 `polygon.atlas-viz-ring`, 2 `polyline`, 1 `line.atlas-viz-cursor`.

#### 9.4.7. `viz.css`: phần thêm và tương phản

| Thêm | Khai báo | Dùng cho |
|---|---|---|
| Biến `--atlas-viz-alt` trên `.atlas-viz` | `var(--sl-color-blue-high)` | Nhóm dữ liệu thứ hai (tập test). Cùng token với `--atlas-fig-alt` của hình tĩnh, nơi tập test cũng màu xanh dương (mục 8.2 f) |
| `.atlas-viz-plot polyline` | `fill: none` | Mọi đường cong |
| `.atlas-viz-ring` | `fill: var(--atlas-viz-plot-bg)`, nét `--atlas-viz-alt` 2px | Điểm test (vòng rỗng), tam giác vượt khung |
| `.atlas-viz-series` | nét `--atlas-viz-ink` 2px | Đường MSE train |
| `.atlas-viz-series-alt` | nét `--atlas-viz-alt`, `stroke-dasharray: 6 4` | Đường MSE test |
| `.atlas-viz-guide` | nét `--atlas-viz-muted` 2px, `stroke-dasharray: 2 4` | Hàm thật. Chấm chấm, màu xám: đường để đối chiếu, không nổi hơn đường khớp |
| `.atlas-viz-cursor` | nét `--atlas-viz-primary` 2px | Vạch bậc đang chọn, cùng màu với đường khớp |
| `.atlas-viz-chart[data-shape='short'] .atlas-viz-plot` | `aspect-ratio: 2 / 1`; `3 / 1` trong container query 32rem có sẵn | Biểu đồ sai số thấp |

- Ước tính thêm khoảng 250 byte gzip (sau khi bỏ comment). `viz.css` từ 1 553 lên khoảng 1 800 byte, tức khoảng 70% ngân sách 2 560.
- Mỗi loại nét khác nhau cả về hình: chấm đặc, vòng rỗng, tam giác; nét liền 3px, liền 2px, đứt `6 4`, chấm `2 4`.

**Tương phản: không có cặp màu mới.** Mọi cặp đã đo ở mục 4.9:

| Thứ | Token | Trên nền vùng vẽ (tối / sáng) | Mẫu nét trên nền khối (tối / sáng) |
|---|---|---|---|
| Vòng, tam giác, đường MSE test | `blue-high` | 9.24 / 11.68 | 7.95 / 9.36 |
| Chấm, đường MSE train | `white` | 14.00 / 15.61 | 12.04 / 12.50 |
| Đường khớp, vạch bậc | `accent` | 7.42 / 6.42 | 6.37 / 5.14 |
| Hàm thật | `gray-3` | 6.28 / 6.89 | 5.40 / 5.52 |

Phần nền của vòng rỗng cố ý bằng màu nền vùng vẽ, nên không đo, giống viền của `.atlas-viz-point` (mục 4.9).

#### 9.4.8. Chuỗi `vizPolyFit` (20 key)

| Key | vi | en |
|---|---|---|
| `caption` | Kéo thanh trượt để đổi bậc của đa thức. Đa thức chỉ được khớp trên các điểm train, còn các điểm test dùng để chấm điểm. | Drag the slider to change the degree of the polynomial. It is fitted to the training points only; the test points are kept for scoring. |
| `plotLabel` | Biểu đồ phân tán {{train}} điểm train và {{test}} điểm test, cùng đa thức bậc {{degree}} khớp trên tập train. | Scatter plot of {{train}} training points and {{test}} test points, with the degree-{{degree}} polynomial fitted to the training set. |
| `errorLabel` | Biểu đồ MSE train và MSE test theo bậc đa thức, từ {{min}} đến {{max}}. Bậc đang chọn: {{degree}}. | Training and test MSE by polynomial degree, from {{min}} to {{max}}. Chosen degree: {{degree}}. |
| `errorDesc` | MSE train giảm dần từ {{trainFirst}} ở bậc {{min}} xuống {{trainLast}} ở bậc {{max}}. MSE test nhỏ nhất ở bậc {{best}} ({{testBest}}), rồi tăng tới {{testLast}} ở bậc {{max}}. | Training MSE falls from {{trainFirst}} at degree {{min}} to {{trainLast}} at degree {{max}}. Test MSE is smallest at degree {{best}} ({{testBest}}), then rises to {{testLast}} at degree {{max}}. |
| `controls` | Chọn bậc đa thức | Choose the polynomial degree |
| `degreeLabel` | Bậc đa thức $d$ | Polynomial degree $d$ |
| `degreeValueText` | Bậc {{value}} | Degree {{value}} |
| `curve` | Đa thức đã khớp | Fitted polynomial |
| `truth` | Hàm thật (không có nhiễu) | True function (no noise) |
| `showTruth` | Hiện hàm thật | Show the true function |
| `trainMse` | MSE train | Training MSE |
| `testMse` | MSE test | Test MSE |
| `degreeAxis` | Bậc đa thức | Polynomial degree |
| `mseAxis` | MSE | MSE |
| `overNote` | MSE test vượt khung (lớn hơn {{max}}) | Test MSE off the chart (above {{max}}) |
| `underfit` | Underfitting: đa thức quá đơn giản, cả MSE train lẫn MSE test đều lớn. | Underfitting: the polynomial is too simple; training and test MSE are both high. |
| `goodFit` | Vừa khớp: MSE test còn thấp. | A good fit: test MSE stays low. |
| `overfit` | Overfitting: MSE train nhỏ nhưng MSE test lớn, đường cong uốn theo cả nhiễu. | Overfitting: training MSE is small but test MSE is high; the curve bends to follow the noise. |
| `bestDegree` | Bậc có MSE test nhỏ nhất. | The degree with the smallest test MSE. |
| `announce` | Bậc {{degree}}: MSE train {{train}}, MSE test {{test}}. {{zone}} | Degree {{degree}}: training MSE {{train}}, test MSE {{test}}. {{zone}} |

- Số trong `{{…}}`: bậc dùng `formatNumber(d, 0)`, MSE dùng `formatMse`. `{{max}}` của `overNote` là `formatNumber(mseDomain[1], 1)`, tức "0.4".
- Với dữ liệu này, `errorDesc` đọc thành: "… từ 0.1663 ở bậc 1 xuống 0.0000 ở bậc 15. MSE test nhỏ nhất ở bậc 3 (0.0754), rồi tăng tới 133.20 ở bậc 15." Chữ "giảm dần" đúng, vì test bắt buộc MSE train không tăng theo bậc.
- "MSE train", "MSE test", "điểm train", "điểm test" theo cách gọi đã dùng trong bài `ml/ml-overview`. "Overfitting" và "Underfitting" giữ nguyên tiếng Anh theo glossary.

#### 9.4.9. Hợp đồng với `lesson-writer` (bài `ml/overfitting-underfitting`)

1. **Tạo dữ liệu trước khi viết bài** (bước L, sau P0): tạo `src/data/datasets/sine.ts` đúng như mục 9.4.1 (chưa có `SINE_POLY_FIT`), rồi đăng ký hai bộ trong `index.ts`. Được sửa câu chữ của `caption`, `description`, `itemLabel` cho hợp giọng bài. **Không** sửa số. `npm test` và `npm run check` phải qua.
2. **Ký hiệu:** $\hat{y} = w_1x + w_2x^2 + \dots + w_dx^d + b$, $d$ là bậc, MSE với hệ số $\frac{1}{m}$. $x$ và $y$ không có đơn vị.
3. **Ba ô code** (`src/code/ml/overfitting-underfitting/`). Ô nào cũng có hai khối `# dataset:` như mục 9.4.1, và dùng `make_pipeline(PolynomialFeatures(d, include_bias=False), LinearRegression())` trên `x_train[:, None]`. Giữ `include_bias=False`: cột hằng số trùng vai trò với $b$ của `LinearRegression`, và bảng số mục 9.2.1 tính theo cách này:
   - **ô 1:** khớp bậc 1, 3, 15 và vẽ cùng các điểm train/test, `plt.ylim(-2, 2)` như VIZ;
   - **ô 2:** vòng lặp bậc 1–15, in `f"{d:2d} {tr:.4f} {te:.4f}"`, vẽ hai đường. Gợi ý `plt.ylim(0, 0.4)` như VIZ, kèm một câu nói về phần vượt khung;
   - **ô 3:** `cross_val_score(..., cv=KFold(n_splits=4, shuffle=True, random_state=0), scoring='neg_mean_squared_error')` trên tập train, bậc 1–10. Kết quả phải là bậc 3. Sau đó khớp bậc 3 trên cả tập train và in MSE test 0.0754.
4. **Số trong lời văn** lấy từ bảng mục 9.2.1. Với bậc 14–15 chỉ trích tới 2 chữ số thập phân ("khoảng 133"). Dùng dấu chấm thập phân (quyết định 22).
5. **Giải thích cách chia:** một câu nói vì sao bài chia cố định "cứ 3 điểm lấy 1 làm test", thay cho chia ngẫu nhiên như bài Tổng quan: để điểm test nằm trong khoảng của train, tránh ngoại suy (thuật ngữ đã có trong glossary).
6. **Chỗ đặt VIZ** (mục Minh họa). Comment giữ chỗ:

   ```mdx
   {/* VIZ: PolyFitViz
       Ý: tăng bậc thì MSE train luôn giảm, còn MSE test giảm rồi tăng; bậc vừa phải dự đoán tốt nhất.
       Tương tác: thanh trượt bậc d từ 1 đến 15; nút "Hiện hàm thật".
       Dữ liệu: sine-train, sine-test.
       Ký hiệu: x, y, d, MSE train, MSE test (như mục Lý thuyết). */}
   ```

   Ở P3, `viz-builder` thay bằng comment một dòng `{/* VIZ: bậc vừa phải cho MSE test nhỏ nhất; thấp quá là underfitting, cao quá là overfitting. */}`, rồi tới `<PolyFitViz />`.
7. **`DatasetTable`:** không bắt buộc. Nếu dùng thì đặt hai bảng trong `<details>`, vì 24 dòng làm bài dài.
8. **Glossary:** thêm "đa thức" (polynomial), "bậc" (degree), "hồi quy đa thức" (polynomial regression) nếu bài dùng.

#### 9.4.10. Ngân sách

| Mục | Giới hạn (mục 2.9) | Dự kiến | Đo thật (P3, 23/10/2026) |
|---|---|---|---|
| Gói npm mới | 0 | 0 | 0 |
| JS riêng của `PolyFitVizIsland` (gồm `poly-fit.ts`) | ≤ 10 KB gzip | 4–5 KB | **3 716 byte** gzip (chỉ file island; `VizSlider`, `format` dùng chung với `LinearFitViz`), đo theo cách của `viz.spec.ts` (7) |
| `props` | ≤ 8 KB | Khoảng 5 KB: 20 chuỗi khoảng 1.7 KB, 24 điểm khoảng 0.6 KB, `truthPoints` khoảng 0.75 KB, KaTeX của "$d$" khoảng 0.4 KB, cấu hình khoảng 0.5 KB | **5 324** ký tự (vi), **5 509** (trang `/en/` fallback) |
| `viz.css` | ≤ 2 560 byte gzip, bỏ comment | Khoảng 1 800 | **1 670** byte |
| Tính toán | | Lúc mount: 15 phép QR, dưới 1 ms. Mỗi lần kéo: 201 × 16 phép nhân-cộng. Không cần throttle | Kéo không giật (Chromium, xem tay) |
| HTML dựng sẵn | | Hai `polyline` của đồ thị chính, khoảng 3 KB | 3 118 ký tự (726 hàm thật, 2 392 đường bậc 1) |
| Chiều cao VIZ | | 1 050–1 100px ở 375px (rủi ro 1) | **1 081px** ở 375px, 1 192px ở 1280px. Không đổi khi kéo bậc hay bật hàm thật |

### 9.5. Phụ thuộc

Không thêm gói npm. Dùng lại các gói ở mục 5. Fixture dùng venv mục 2.5, có cả scikit-learn 1.8.0 (đã có trong venv), vì fixture so với đúng cách bài khớp đa thức.

### 9.6. Các bước thực hiện

Mỗi bước của `viz-builder` kết thúc bằng `npm run build` (không `[WARN]`), `npm run check` (0 lỗi 0 cảnh báo) và `npm test`.

**Thứ tự:** P0 → L → `content-reviewer` (bài thành `published`) → P1–P3 (gộp một lần gọi được) → P4 → P5 → P6.

| # | Agent | Việc | Tiêu chí hoàn thành |
|---|---|---|---|
| P0 | `viz-builder` | **Nền, làm trước `lesson-writer`.** Viết `src/lib/viz/poly-fit.ts` (mục 9.4.2). Nới luật đơn vị rỗng trong `datasets.test.ts` và `DatasetTable.astro` (mục 9.4.1). Viết `tests/unit/poly-fit.test.ts`, không dùng dữ liệu thật | `toUnit` ra −1, 0, 1 tại $a$, $(a+b)/2$, $b$. `leastSquaresQR` trên một hệ 3×2 tính tay khớp tới 1e-12. `fitPolynomial` trên 5 điểm của $y = 1 - 2x + 3x^2$ ($x = 0..4$, miền $[0, 4]$), bậc 2: dự đoán lại đúng tới 1e-12; bậc 4 trên 5 điểm: nội suy, phần dư < 1e-12. Throw có thông báo khi số điểm < bậc + 1, và khi hai $x$ trùng làm thiếu hạng. `bestDegree` chọn bậc thấp khi bằng nhau. `fitZone` ra đúng ba vùng trên một bộ số tự chế. `toPolyline` ra đúng chuỗi trên ví dụ nhỏ, chặn ở ±1e5, không có "-0.00". `formatMse(9.99994)` = `'9.9999'`, `formatMse(133.20044)` = `'133.20'`. Quét nguồn `poly-fit.ts`: không có `**`, `Math.pow`, `Math.hypot`, `Math.exp`, `Math.log`, `Math.sin`, `Math.cos`. `datasets.test.ts`: đơn vị rỗng ở mọi ngôn ngữ thì qua, rỗng ở một ngôn ngữ thì báo lỗi |
| L | `lesson-writer` | Theo mục 9.4.9: tạo `sine.ts` và đăng ký, rồi viết bài vi với 3 ô code và comment giữ chỗ VIZ | `datasets.test.ts` qua với `sine-train`, `sine-test`, kể cả các dòng dữ liệu trong 6 file `.py`. Output của các ô code khớp bảng mục 9.2.1, chạy bằng venv mục 2.5. `content-reviewer` đã duyệt |
| P1 | `viz-builder` | **Fixture và cấu hình.** Chạy lệnh ở mục 9.4.1, ghi `tests/unit/fixtures/poly-fit-python.ts` kèm lệnh, phiên bản, ngày. Thêm `SINE_POLY_FIT` vào `sine.ts`. Viết `tests/unit/poly-fit-sine.test.ts` | Bản sao `rows` trong fixture bằng `SINE_TRAIN.rows` và `SINE_TEST.rows`. Với mọi bậc 1–15: MSE train, MSE test, và dự đoán trên lưới (bậc 1, 3, 9, 15) khớp fixture trong dung sai mục 9.2.2; `formatMse` của hai bên bằng nhau (30/30). Bậc 15: phần dư lớn nhất trên train < 1e-8. Bậc ≤ 14: $\lVert \mathbf{V}^\top \mathbf{r} \rVert_\infty < 10^{-10}$. MSE train không tăng theo bậc. `bestDegree` = 3. Ba vùng là {1, 2}, {3..8}, {9..15}. Chuỗi hiện ra: bậc 1 `0.1663`/`0.2732`, bậc 3 `0.0377`/`0.0754`, bậc 15 `0.0000`/`133.20`. Mọi ràng buộc mục 9.4.3 |
| P2 | `viz-builder` | **Kit, CSS, chuỗi.** `kit/types.ts` (chuyển `AxisText`, sửa 2 import của `LinearFitViz`), `PlotCurve`, `AtPoint`, prop `shape` của `PlotFrame`. Phần thêm của `viz.css` (mục 9.4.7). 20 key `vizPolyFit` vào `ui.ts`, `vi.json`, `en.json` | `viz-conventions.test.ts` qua (ngân sách CSS, không mã màu). `i18n.test.ts` qua. Hành vi và kích thước của `LinearFitViz` không đổi: `linear-fit-viz.spec.ts` và `linear-fit-viz-island.test.tsx` vẫn qua |
| P3 | `viz-builder` | **`PolyFitViz`.** Wrapper và island (mục 9.4.5–9.4.6). Thay comment giữ chỗ trong bài vi bằng import, comment một dòng và `<PolyFitViz />`. Tự xem trên `npm run preview` ở 375px và máy tính, sáng và tối (chỉ chạy khi không có agent khác đang build hay chạy e2e) | `dist/vi/ml/overfitting-underfitting/index.html` có đúng một `.atlas-viz`, island còn `ssr`. Số phần tử trong hai `.atlas-viz-plot` đúng như mục 9.4.6 ở bậc 1. Dòng số hiện `0.1663` và `0.2732`. Xem tay: kéo chuột và dùng bàn phím đều vẽ lại; ở bậc 15 đường cong ra khỏi khung mà không có đoạn nằm ngang chạy dọc mép; bật/tắt hàm thật không làm gì xê dịch; console không lỗi hydrate. Ghi số đo thật vào mục 9.4.10: JS riêng gzip, độ dài `props`, `viz.css` gzip, chiều cao VIZ ở 375px |
| P4 | `tester` | **Mở rộng test chung, không viết spec riêng.** Trong `viz.spec.ts`, hàm `measureContrast`: đo `stroke` của `circle.atlas-viz-ring`, `polygon.atlas-viz-ring`, `polyline.atlas-viz-primary`, `polyline.atlas-viz-series`, `polyline.atlas-viz-guide`, `line.atlas-viz-cursor` trong vùng vẽ. Với mẫu nét: `circle` có lớp `atlas-viz-ring` thì đo `stroke` chứ không đo `fill`, và đo cả `polyline`, `polygon`. Chạy `npm test`, `npm run test:e2e` | `test:e2e` qua ở `desktop` và `mobile` trên `/vi/ml/overfitting-underfitting/`, trên trang fallback `/en/...`, và trên mọi trang VIZ cũ. Thử phá (rồi trả lại): cho nét `.atlas-viz-ring` bằng màu nền vùng vẽ thì test tương phản fail đúng chỗ |
| P5 | `analyst` | Review theo mục 2 và mục 9 | Báo cáo có số đo: JS riêng gzip, `props`, `viz.css` gzip, chiều cao ở 375px, tương phản đo thật, `package.json` không đổi, Lighthouse mobile của bài (hoặc giải thích phần thiếu không do VIZ) |
| P6 | **người dùng** | Duyệt VIZ trên bài thật, cả trên điện thoại thật, cùng lượt duyệt bản vi (quyết định 36) | Đồng ý, hoặc có danh sách chỗ sửa |

Bản en của bài làm sau MVP (quyết định 43). Trước đó, `/en/...` là trang fallback: VIZ hiện chuỗi en, nên `viz.spec.ts` kiểm chuỗi en ngay từ P4.

### 9.7. Rủi ro và điểm chưa chắc

| # | Rủi ro | Cách xử lý |
|---|---|---|
| 1 | VIZ cao: ước tính **khoảng 1 050–1 100px ở 375px** (chưa đo), cao hơn `LinearFitViz` (947px), vì có thêm biểu đồ sai số (khoảng 220px) | Thanh trượt nằm ngay dưới đồ thị chính và chú giải, nên khi kéo vẫn thấy đường cong. P3 đo thật. Nếu quá cao, theo thứ tự ít đổi nhất: gom chú giải 4 mục thành 1 hàng; biểu đồ sai số `aspect-ratio: 5 / 2` trên màn hẹp; bỏ biểu đồ sai số (câu hỏi 1) |
| 2 | Nâng scikit-learn hoặc NumPy theo Pyodide có thể đổi vài chữ số cuối của MSE bậc 14–15 | Dung sai, và luật 2 chữ số khi ≥ 10 (mục 9.2.2). Khi nâng Pyodide, chạy lại lệnh fixture (rủi ro 7 mục 7) |
| 3 | Lời hứa "giống từng bit giữa build và trình duyệt" chỉ đúng khi `poly-fit.ts` không dùng hàm toán ngoài `+ − × ÷ sqrt abs` | Unit test quét nguồn (P0). Hàm thật dùng `Math.sin` nhưng chỉ chạy lúc build |
| 4 | `vector-effect="non-scaling-stroke"` cùng `stroke-dasharray` trong SVG có `preserveAspectRatio="none"`: theo SVG 2, nét đứt tính theo px màn hình, nhưng chưa thử trên Safari | P3 xem trên Chrome và Firefox. P6 xem trên điện thoại thật (thường là Safari). Nếu méo thì đổi đường MSE test sang nét liền mỏng, vẫn phân biệt được nhờ vòng rỗng |
| 5 | `props` ước tính khoảng 5 KB, chưa đo | `viz.spec.ts` (7) bắt khi vượt 8 KB. Cách giảm: bỏ `truthPoints` và để island tự tính `Math.sin`, đánh đổi quy tắc giống từng bit (mục 9.2.2) |
| 6 | Dòng trạng thái gán nhãn theo luật hệ số 2 (mục 9.2.5). Bậc 8 hiện "vừa khớp" dù đường cong đã uốn mạnh ở mép | Lời văn nói rõ đây là mốc gần đúng. Đổi `ZONE_RATIO` thì test P1 báo phải sửa bảng mục 9.2.1 |
| 7 | Bài Regularization cần ridge | Thêm một hàm ghép vào $\mathbf{V}$ các hàng $\sqrt{\lambda}\,\mathbf{I}$ (không phạt $c_0$), rồi gọi lại `leastSquaresQR`. Không cần gói mới. Chọn miền $\lambda$ khi thiết kế VIZ đó. Lưu ý: phạt hệ số theo $t$ khác phạt theo $x$ thô của scikit-learn, nên VIZ đó phải chuẩn hóa giống code bài (ví dụ `StandardScaler` trong pipeline) |
| 8 | Dữ liệu trừu tượng ($x$, $y$ không đơn vị), khác bài trước dùng căn hộ | Có chủ ý: bài cần biết hàm thật để nói về bias–variance. Lời văn nói rõ "dữ liệu tự sinh" |

#### Câu hỏi cho người dùng

1. **VIZ có biểu đồ nhỏ "MSE theo bậc" không?** Quyết định 37 để ngỏ.
   - **(Recommended)** Có: thấy ngay hình chữ U và vị trí bậc đang chọn. VIZ cao thêm khoảng 220px trên điện thoại.
   - Không: chỉ hai số MSE train và MSE test. Gọn hơn, nhưng người đọc phải tự nhớ số khi kéo. Ô code thứ hai vẫn vẽ đường sai số.
2. **Số điểm dữ liệu.** Quyết định 44 ghi "khoảng 20".
   - **(Recommended)** 24 điểm (16 train + 8 test), bậc 1–15. Bậc 15 đi qua đúng mọi điểm train, như ví dụ kinh điển. Số liệu đã chạy và chốt ở mục 9.2.1.
   - 20 điểm (14 train + 6 test), bậc 1–13. Sát chữ "20" hơn, nhưng ít điểm test, và phải quét lại seed, chạy lại toàn bộ bảng số.

**Các lựa chọn tự quyết, đổi lại được sau P6:**

- Hàm thật $\sin(2\pi x)$ trên $[0, 1]$, seed 236, $\sigma = 0.2$.
- Chia cố định, cứ 3 điểm lấy 1 điểm test.
- Hai bộ dữ liệu `sine-train`, `sine-test` thay vì một bộ có cột "tập".
- Có nút "Hiện hàm thật" (đường chấm chấm màu xám).
- Có dòng trạng thái underfitting / vừa khớp / overfitting, tính theo luật hệ số 2.
- Bậc ban đầu là 1.
- Trục sai số tuyến tính $[0, 0.4]$, phần vượt khung vẽ bằng tam giác.
- MSE hiện 4 chữ số thập phân, từ 10 trở lên hiện 2.
- Không viết test island jsdom riêng (quyết định 39).
