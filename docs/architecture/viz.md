# Minh họa tương tác (VIZ): quy ước chung và `LinearFitViz`

> Phạm vi: quy ước cho **mọi** minh họa (VIZ) của 78 bài, và đặc tả VIZ đầu tiên: `LinearFitViz` của bài mẫu Hồi quy tuyến tính (mốc M2).
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
| Chỉ nhìn một hình (sơ đồ, đồ thị cố định) | Hình tĩnh: `.astro` + SVG, hoặc dùng component của kit **không** gắn `client:*` (Astro render React thành HTML tĩnh) | 0 |
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
