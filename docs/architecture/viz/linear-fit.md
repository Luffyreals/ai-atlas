# `LinearFitViz` (bài Hồi quy tuyến tính)

> (Trước đây `docs/architecture/viz.md` mục 3, 4.5–4.10, 5, 6, 7. Số mục giữ nguyên như file cũ; mục ở file khác tra trong [mục lục](README.md#mục-lục).) Quyết định đầu vào ở [README.md](README.md).

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

## 4. Giao diện: `LinearFitViz`

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

Đo theo công thức WCAG 2.x, từ giá trị trong `custom.css` và giá trị mặc định của Starlight 0.42.6 (`props.css`; hue mặc định: blue 234, red 339, green 101). Cách đo giống [components.md](../components.md) mục 4.9.7: cặp `text`/`bg` ra 10,10 và 11,11, khớp bảng ở đó.

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
| V5 | `tester` | **E2E:** `tests/e2e/viz.spec.ts` (chung) và `tests/e2e/sample-lesson/linear-fit-viz.spec.ts` | **Chung**, với mọi trang `/vi/<id>/` có `status.vi = 'published'` và `/en/<id>/` (cả trang fallback) có `.atlas-viz`: (1) lúc mở trang, VIZ nằm thấp hơn 1,5 màn hình thì island còn `ssr` và chưa có request tới `component-url` của nó; cuộn tới thì hydrate và có request; (2) chiều cao `.atlas-viz` trước và sau hydrate bằng nhau (±1px); (3) ở 375px, cả sáng và tối, `scrollWidth ≤ 375`, mọi `input` và `button` trong VIZ cao ≥ 44px; (4) tương phản tính từ `getComputedStyle` ở cả hai chế độ: nét và điểm trong `.atlas-viz-plot` (`fill` của `.atlas-viz-point`; `stroke` của `.atlas-viz-primary`, `-reference`, `-error`, `-axis`, `-marker`) so với nền `.atlas-viz-plot` ≥ 3, **bỏ qua** `.atlas-viz-grid-line`, `.atlas-viz-halo` và viền của `.atlas-viz-point` (cố ý bằng màu nền, mục 4.9); chữ trong `.atlas-viz` so với nền gần nhất có màu (khối, hoặc nền nút) ≥ 4,5; (5) Tab đi qua mọi điều khiển theo thứ tự DOM, có viền focus; (6) console không lỗi; (7) JS riêng của mỗi island VIZ ≤ 10 KB gzip (cách tính mục 2.9); thuộc tính `props` ≤ 8 KB. **Riêng `LinearFitViz`:** (8) **trong `.atlas-viz-plot`**: số điểm, số phần dư bằng `rows.length`, có dấu × (2 `line.atlas-viz-marker`) ở điểm trung bình; `ul.atlas-viz-key` có 3 mục, mục thứ hai hiện "(52.4, 10.92)"; số MSE ban đầu khớp (tính bằng `src/lib/viz` + dữ liệu, import tương đối); (9) bàn phím: focus thanh $w$, 3 lần `ArrowRight` thì giá trị tăng 3 bước, `aria-valuetext` và số MSE đổi theo; `End` ra `max`; Tab sang $b$, `Home` ra `min` (−10.5, hiện "−10.50"); Tab sang nút, `Space` bật đường tốt nhất, số MSE của nó bằng `formatNumber(best.mse)`; (10) vùng live chưa đổi ngay sau 5 lần `ArrowRight` liên tiếp, và có `announce` trong vòng 1,5 s; (11) vị trí $y$ của thanh trượt và của nút không đổi khi bật/tắt đường tốt nhất; (12) `javaScriptEnabled: false`: trong `.atlas-viz-plot` thấy đủ điểm, phần dư và dấu ×; số MSE ban đầu, chữ `needsScript`, điều khiển `disabled`; (13) ở 375px các nhãn vạch chia trục $x$ không chồng nhau; (14) trên `/en/…`, nhãn nút và mục `meanPoint` là chuỗi en |
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
