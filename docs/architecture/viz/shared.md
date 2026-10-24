# Phần dùng chung của VIZ: dữ liệu, toán, kit, `viz.css`

> (Trước đây `docs/architecture/viz.md` mục 4.1–4.4. Số mục giữ nguyên như file cũ; mục ở file khác tra trong [mục lục](README.md#mục-lục).)

## 4. Giao diện: phần dùng chung

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
// (kept equal by tests/unit/content/datasets.test.ts). Numbers are chosen by lesson-writer; none are given here.
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

Hình khối theo [components.md](../components.md) mục 4.9.1: góc vuông, không bóng, không gradient, không viền 1px quanh khối.
