# Đồ thị tĩnh trong kit FIG và `RegularizationGeometryFigure`

> (Trước đây `docs/architecture/viz.md` mục 11. Số mục giữ nguyên như file cũ; mục ở file khác tra trong [mục lục](README.md#mục-lục).)

## 11. Đồ thị tĩnh trong kit FIG và `RegularizationGeometryFigure`

> Viết ngày 24/10/2026, cho bài `ml/regularization` (mốc M3). Bổ sung mục 8: hình tĩnh có trục, vùng, đường mức và ký hiệu toán. Mọi quy ước của mục 8 (thư mục, chữ trong `src/data/figures/`, trợ năng, khóa tỉ lệ co 0,95–1,11, màu, 0 JS) giữ nguyên. Người dùng đã đồng ý thêm hình này. Nội dung hình theo comment `FIG: RegularizationGeometryFigure` trong bản vi, đã được `content-reviewer` xác nhận.

### 11.1. Mục tiêu và phạm vi

**Làm:**

- Cách vẽ **đồ thị sơ đồ** (schematic plot): trục có mũi tên, vùng tô, đường mức elip, chấm, nhãn ký hiệu toán. Không có vạch chia hay số trên trục.
- Hình đầu tiên: `RegularizationGeometryFigure`. Hai ô cạnh nhau, Ridge (hình tròn) và Lasso (hình thoi), cùng một hàm mất mát.
- Đủ chung để bài `ml/gradient-descent` dùng lại cho hình đường mức tĩnh, nếu bài đó cần thêm hình ngoài VIZ.

**Không làm:**

- Đồ thị dữ liệu tĩnh có vạch chia và số (ví dụ loss theo epoch). Khi bài đầu tiên cần, xem lại phương án (b) ở 11.2. Hiện chưa cần.
- KaTeX trong SVG. Công thức vẫn ở chú thích và lời văn.
- Bố cục rộng cho hình này (11.4.4).

### 11.2. Cách vẽ: mở rộng kit FIG (phương án a)

| Phương án | Đánh giá |
|---|---|
| **(a) Thêm vào kit FIG một file hàm đổi tọa độ, một component ký hiệu toán và 5 lớp CSS (chọn)** | Dùng lại toàn bộ `FigureFrame`, `FigArrow` (làm trục), `FigText`, tỉ lệ co đã khóa và test chung mục 8.2 h. Phần tử SVG gốc (`circle`, `polygon`, `ellipse`) đã đủ, không cần component cho từng hình dạng. Một tỉ lệ cho cả hai trục nên hình tròn vẫn tròn. Code mới khoảng 120 dòng, 0 gói npm |
| (b) `PlotFrame` của kit VIZ, render lúc build, không hydrate | Có vạch chia, lưới, tiêu đề trục bằng HTML: hình sơ đồ không cần. Vùng vẽ có `aspect-ratio` cố định theo `shape` trong `viz.css`, còn tọa độ theo `%` giãn khác nhau theo hai chiều, nên hình tròn thành elip nếu không thêm shape và CSS mới. Nhãn cạnh điểm phải đặt bằng HTML định vị tuyệt đối, thêm CSS vào `viz.css`. Dùng lớp `atlas-viz-*` và component React, trái mục 8.2 a và `figure-conventions.test.ts` ý 1. Lợi thế duy nhất (chữ HTML đúng cỡ ở mọi chiều rộng) không cần ở đây, vì FIG đã khóa tỉ lệ co |
| (c) SVG xuất từ matplotlib hay công cụ vẽ | Bị loại ở mục 8.1: không đổi màu sáng/tối, chữ không dịch được, mã màu cứng |

Hình sơ đồ (vùng, đường mức, đường đi của gradient descent, hình dạng hàm) dùng (a). Chỉ xem lại (b) khi cần đồ thị dữ liệu có số trên trục.

### 11.3. Ký hiệu toán trong hình: `tspan` nghiêng, chỉ số dưới dời bằng `dy`

| Cách | Đánh giá |
|---|---|
| **`<tspan font-style="italic">w</tspan><tspan font-size="13" dy="4.5">1</tspan>` (chọn)** | Chữ nghiêng thật: Barlow 400 italic đã nạp (`@fontsource/barlow/400-italic.css` trong `astro.config.ts`). `dy` được mọi trình duyệt hỗ trợ. Chỉ số 13 đơn vị, nên vẫn ≥ 12px ở 375px và qua luật cỡ chữ của e2e |
| Ký tự Unicode `w₁` (U+2081) | Ba tập con Barlow đang nạp (latin, latin-ext, vietnamese) **không** chứa U+2080–2089 (đã đọc `unicode-range` trong `node_modules/@fontsource/barlow/400-italic.css`). Chữ số dưới lấy từ font dự phòng, khác nét, và vẽ nhỏ khoảng 60% cỡ chữ, dưới 12px |
| `baseline-shift="sub"` | MDN ghi "Limited availability", không thuộc Baseline, và sắp bị thay bằng `vertical-align` |
| Chữ HTML (hoặc KaTeX) đặt chồng lên SVG theo `%` | Thêm CSS định vị, chữ ra ngoài `role="img"`, và KaTeX trong hình bị cấm (rủi ro 7, mục 8.7) |

**Component `FigMath.astro`** (kit) vẽ một biểu thức ngắn: một ký hiệu nghiêng, chỉ số dưới (tùy chọn), phần đuôi chữ đứng (tùy chọn). Ví dụ $w_1$, $w_2 = 0$.

- Ký hiệu toán không phụ thuộc ngôn ngữ, nên được viết thẳng trong component hình, không qua `src/data/figures/`. Để không có chữ thường nào lọt vào đây, kit **báo lỗi build** khi:
  - `symbol` không phải đúng một chữ Latin hay Hy Lạp;
  - `sub` không phải 1–2 chữ số hay chữ Latin;
  - `after` có ký tự ngoài tập: chữ số, khoảng trắng, `= + − - . , < > ≤ ≥ ( )`.
- Lời có lẫn ký hiệu (ví dụ "Điểm chạm: $w_2 = 0$") tách thành dòng chữ (`FigText`, chữ ở file dữ liệu) và dòng ký hiệu (`FigMath`).
- **Bẫy khoảng trắng:** các `tspan` phải viết liền trên một dòng trong template. Xuống dòng giữa chúng sinh khoảng trắng, thành "w 1". Khoảng cách trước `after` là `dx="3"`, không phải dấu cách.
- Tên truy cập: chữ trong SVG bị `role="img"` ẩn. Mô tả `sr-only` phải đọc ký hiệu bằng lời ("trục w1", "w2 bằng 0").

### 11.4. Giao diện

#### 11.4.1. Đổi tọa độ: `src/lib/figures/plot.ts`

Hàm thuần, chỉ import tương đối (lý do ở mục 8.3). Tọa độ dữ liệu có trục $y$ hướng lên; `viewBox` có $y$ hướng xuống.

```ts
import type { Pt } from './geometry';

/** A plot area in viewBox units. One `unit` for both axes, so a circle stays round. */
export interface PlotBox {
  x: number; // top-left corner
  y: number;
  unit: number; // viewBox units per data unit
  xDomain: readonly [min: number, max: number];
  yDomain: readonly [min: number, max: number];
}

/** An ellipse in data units; majorAngle in degrees, counter-clockwise from the +x axis (y up). */
export interface Ellipse { centre: Pt; semiMajor: number; semiMinor: number; majorAngle: number }

/** Level curves of f(w) = (w − c)ᵀ A (w − c), A = u uᵀ + v vᵀ / axisRatio², u at majorAngle, v ⟂ u. */
export interface Quadratic { centre: Pt; majorAngle: number; axisRatio: number }

export function plotSize(box: PlotBox): { width: number; height: number };
/** Data → viewBox, rounded with round1. Throws when p lies outside the domain (catches typos). */
export function toView(box: PlotBox, p: Pt): Pt;
/** "x,y x,y …" for <polygon> / <polyline>. */
export function pointsAttr(box: PlotBox, points: readonly Pt[]): string;
/** Attributes of <ellipse>; transform is `rotate(${-majorAngle} cx cy)`: the sign flips with the y axis. */
export function ellipseAttrs(box: PlotBox, e: Ellipse): { cx: number; cy: number; rx: number; ry: number; transform: string };
/** The level curve of q through `through`, scaled by `scale` about the centre: semiMajor = scale · √f(through). */
export function levelEllipse(q: Quadratic, through: Pt, scale?: number): Ellipse;
```

#### 11.4.2. `FigMath.astro` (kit)

```ts
interface FigMathProps {
  x: number;
  y: number; // vertical centre, dominant-baseline: central, like FigText
  symbol: string; // 'w': one Latin or Greek letter, italic
  sub?: string; // '1': 1–2 digits or Latin letters; always FIG_FONT.small (13), dy = round1(0.3 × size)
  after?: string; // '= 0': math characters only (11.3), upright, dx = 3
  size?: 'label' | 'small'; // 15 or 13 units; weight 400 (no 600 italic is loaded)
  anchor?: 'start' | 'middle' | 'end';
}
```

HTML ra, viết trên một dòng:

```html
<text class="atlas-fig-math" font-size="15" text-anchor="end" dominant-baseline="central" x="169" y="144.4"><tspan font-style="italic">w</tspan><tspan font-size="13" dy="4.5">1</tspan></text>
```

Có `after` thì thêm `<tspan dy="-4.5" dx="3">= 0</tspan>`. Hàm kiểm tra đầu vào `checkMathLabel(symbol, sub?, after?)` nằm trong `src/lib/figures/geometry.ts` để unit test được.

#### 11.4.3. Lớp mới trong `figures.css`

Không có cặp màu mới: mọi cặp đã đo ở mục 4.9 hoặc 8.2 f.

| Lớp | Thuộc tính | Tương phản tối / sáng |
|---|---|---|
| `.atlas-fig-region` | `fill: var(--atlas-fig-node)` (vùng tô nhạt, trang trí), `stroke: var(--atlas-fig-accent)`, rộng 2 | viền trên `bg`: 7,42 / 6,42 |
| `.atlas-fig-level` | `fill: none`, `stroke: var(--atlas-fig-alt)`, rộng 1.5; `[data-tone='touch']` (elip chạm vùng) rộng 2 | trên `bg`: 9,24 / 11,68 |
| `.atlas-fig-dot` | `fill: var(--atlas-fig-alt)` (tâm elip, nghiệm không phạt) | 9,24 / 11,68 |
| `.atlas-fig-dot[data-tone='touch']` | `fill: var(--atlas-fig-ink)`, quầng `stroke: var(--atlas-fig-bg)` rộng 2.5, `paint-order: stroke` | chấm trên `bg`: 14,00 / 15,61. Quầng cố ý bằng màu nền (1:1), không đo |
| `.atlas-fig-math` | `fill: var(--atlas-fig-ink)`, `font-weight: 400` | trên `bg`: 14,00 / 15,61; trên vùng (`gray-6`): 12,04 / 12,50 |

- Thêm biến `--atlas-fig-bg: var(--sl-color-bg)` trên `.atlas-figure`, và `--atlas-fig-bg: Canvas` trong khối `forced-colors`.
- Trục là `FigArrow` (`muted`): trên `bg` 6,28 / 6,89; đoạn chạy qua vùng tô (`gray-6`) 5,40 / 5,52.
- Không chỉ dùng màu: điểm chạm to hơn (bán kính 5 so với 3,5) và có quầng; elip chạm vùng dày hơn; vùng có viền 2px; mọi ý đều có chữ.
- Hiện `figures.css` nặng 560 byte gzip (đo 24/10/2026, bỏ comment). Dự kiến sau khi thêm khoảng 700, dưới ngưỡng 1 024. **Đo sau G0 (24/10/2026): 643 byte** (63%).

#### 11.4.4. `RegularizationGeometryFigure`: hình học

**Hàm mất mát chung cho hai ô** (cùng tâm, cùng hình dạng elip, chỉ khác mức):

$$
f(\mathbf{w}) = (\mathbf{w} - \mathbf{c})^\top \mathbf{A} (\mathbf{w} - \mathbf{c}), \quad \mathbf{A} = \mathbf{u}\mathbf{u}^\top + \frac{\mathbf{v}\mathbf{v}^\top}{q^2}
$$

- Tâm (nghiệm không phạt) $\mathbf{c} = (1.3,\ 0.8)$: góc phần tư thứ nhất, lệch về phía trục $w_1$.
- Trục lớn $\mathbf{u}$ nghiêng $-70°$ so với trục $w_1$, $\mathbf{v}$ vuông góc với $\mathbf{u}$, tỉ lệ trục nhỏ/trục lớn $q = 0.4$. Khi đó $\mathbf{A} = \begin{pmatrix} 5.6359 & 1.6873 \\ 1.6873 & 1.6141 \end{pmatrix}$, trị riêng 1 và 6.25.
- Vùng cho phép: $w_1^2 + w_2^2 \le 1$ (bán kính 1) và $\lvert w_1\rvert + \lvert w_2\rvert \le 1$ (đỉnh tại $\pm 1$ trên hai trục). Cùng $t = 1$, khớp chú thích. $\lVert\mathbf{c}\rVert_2 = 1.526$ và $\lVert\mathbf{c}\rVert_1 = 2.1$, nên tâm nằm ngoài cả hai vùng.

**Điểm chạm** (tính ngày 24/10/2026 bằng Python và NumPy ngoài repo, script ở cuối mục):

| | Ridge | Lasso |
|---|---|---|
| Điểm chạm | $(0.9116,\ 0.4111)$, góc 24.3° | $(1,\ 0)$, đỉnh trên trục $w_1$ |
| Cách tính | $\mathbf{w} = (\mathbf{A} + \mu\mathbf{I})^{-1}\mathbf{A}\mathbf{c}$ với $\lVert\mathbf{w}\rVert_2 = 1$, chia đôi theo $\mu$: $\mu = 3.1212$ | Điều kiện KKT tại đỉnh: $\mathbf{d} = \mathbf{A}(\mathbf{c} - \mathbf{e}_1) = (3.0406,\ 1.7975)$, cần $d_1 > 0$ và $\lvert d_2\rvert \le d_1$. Ở đây $d_2/d_1 = 0.591$, nên nghiệm là đỉnh, không nằm trên cạnh |
| Kiểm chứng | $-\nabla f$ song song với $\mathbf{w}$ (tích chéo $2 \times 10^{-15}$, tích vô hướng dương). Quét 2 triệu điểm trên đường tròn ra cùng điểm | Quét 4 triệu điểm trên chu vi hình thoi ra đúng $(1, 0)$ |
| Mức $f$ tại điểm chạm | 1.6041 | 2.3502 |
| Elip chạm: bán trục lớn / nhỏ | 1.2665 / 0.5066 | 1.5330 / 0.6132 |
| Hai elip trong (tỉ lệ 1/3, 2/3) | 0.4222 / 0.1689; 0.8444 / 0.3377 | 0.5110 / 0.2044; 1.0220 / 0.4088 |
| Hộp bao elip chạm | $w_1 \in [0.656, 1.944]$, $w_2 \in [-0.403, 2.003]$ | $w_1 \in [0.521, 2.079]$, $w_2 \in [-0.656, 2.256]$ |

Vì sao góc Ridge chỉ 24°: với cùng một hàm mất mát, muốn Lasso chạm **đỉnh** rõ ràng ($d_2/d_1$ xa 1) thì elip phải gần dựng đứng, và khi đó điểm chạm trên đường tròn cũng gần trục $w_1$. Tìm trên lưới (tâm bước 0.05, góc bước 5°, $q$ từ 0.35 tới 0.6): khi $d_2/d_1 \le 0.6$, góc Ridge lớn nhất đạt được khoảng 25°. Bộ số đã chọn cân bằng hai điều đó và dùng số tròn. $w_2 = 0.41$ vẫn rõ trên hình (18 đơn vị `viewBox` trên trục). Muốn góc lớn hơn thì phải dùng hai hàm mất mát khác nhau (câu hỏi 1).

**Bố cục** (chỉ bố cục hẹp, `viewBox="0 0 360 260"`):

| Phần | Tọa độ |
|---|---|
| Tiêu đề ô | `FigText` cỡ `label`, giữa ở $x$ = 88 và 272, $y$ = 12 |
| Ô vẽ | `PlotBox` $x$ = 4 (Ridge) và 188 (Lasso), $y$ = 28, `unit` 44, `xDomain` $[-1.2, 2.6]$, `yDomain` $[-1.2, 2.35]$, nên mỗi ô 167.2 × 156.2 |
| Trục | `FigArrow` từ $(-1.15, 0)$ tới $(2.55, 0)$ và từ $(0, -1.15)$ tới $(0, 2.3)$ |
| Nhãn trục | `FigMath` `w`/`1`: `anchor="end"`, $x$ = đầu mũi tên trục $w_1$, $y$ = trục + 13 (dưới trục). `FigMath` `w`/`2`: `anchor="end"`, $x$ = trục $w_2$ − 6, $y$ = đầu mũi tên + 8 |
| Thứ tự vẽ | vùng → trục → 3 elip (`ellipse.atlas-fig-level`, elip ngoài cùng có `data-tone="touch"`) → chấm tâm (r 3.5) → chấm chạm (r 5, `data-tone="touch"`) → chữ |
| Ghi chú dưới ô | `FigText` cỡ `small` "Điểm chạm:" ở $y$ = 202; dòng 2 ở $y$ = 220: Ridge là `FigText` cỡ `label` "cả hai khác 0", Lasso là `FigMath` `w`, `2`, `= 0` |
| Chú giải | chấm `atlas-fig-dot` r 3.5 tại (12, 246); `FigText` cỡ `small` "Nghiệm không phạt", `anchor="start"`, $x$ = 22, $y$ = 246 |

Tọa độ `viewBox` để `viz-builder` tự soát (sau `round1`):

| | Ridge | Lasso |
|---|---|---|
| Gốc tọa độ | (56.8, 131.4) | (240.8, 131.4) |
| Tâm elip | (114.0, 96.2) | (298.0, 96.2) |
| Điểm chạm | (96.9, 113.3) | (284.8, 131.4) |
| Elip chạm `rx` / `ry` | 55.7 / 22.3 | 67.5 / 27.0 |
| Vùng | `circle` r 44 | `polygon` (284.8,131.4) (240.8,87.4) (196.8,131.4) (240.8,175.4) |
| `transform` của elip | `rotate(70 114 96.2)` | `rotate(70 298 96.2)` |

- Đã kiểm: hộp nhãn $w_1$ (dữ liệu $w_1 \in [2.15, 2.55]$, $w_2 \in [-0.5, -0.1]$) và hộp nhãn $w_2$ nằm ngoài mọi elip (mức $f$ nhỏ nhất trong hộp là 2.80 và 7.59, lớn hơn 2.35). Bản nháp đầu dùng miền $x$ tới 2.35 thì nhãn $w_1$ chồng lên elip Lasso, nên miền $x$ mở tới 2.6.
- Đỉnh elip Lasso ở $y \approx 32$, cách đáy tiêu đề khoảng 10 đơn vị. Ô Lasso kết thúc ở $x$ = 355.2, trong `viewBox`.
- Không có bố cục rộng: hai ô cạnh nhau đã vừa 360. Trên máy tính hình rộng tối đa 400px (mục 8.2 e).

#### 11.4.5. Chữ và số: `src/data/figures/regularization-geometry.ts`

```ts
import type { FigureText } from './types';
import type { Quadratic } from '../../lib/figures/plot';

type Key = 'ridge' | 'lasso' | 'touch' | 'bothNonZero' | 'ols';

export const REGULARIZATION_GEOMETRY = {
  vi: {
    caption: '…', // the caption of the FIG comment in the lesson, word for word
    label: 'Hình học của Ridge và Lasso: elip đồng mức chạm vùng cho phép',
    description: '…', // 2–4 sentences, see below
    labels: { ridge: 'Ridge (L2)', lasso: 'Lasso (L1)', touch: 'Điểm chạm:', bothNonZero: 'cả hai khác 0', ols: 'Nghiệm không phạt' },
  },
  en: { /* draft by viz-builder; lesson-translator reviews it after MVP (decision 43) */ },
} satisfies FigureText<Key>;

/** Numbers of viz/static-plots.md section 11.4.4; the touch points come from the Python check there. */
export const REGULARIZATION_GEOMETRY_PLOT = {
  budget: 1, // circle radius and diamond vertex
  loss: { centre: [1.3, 0.8], majorAngle: -70, axisRatio: 0.4 } satisfies Quadratic,
  ridgeTouch: [0.9116, 0.4111],
  lassoTouch: [1, 0],
  levelScales: [1 / 3, 2 / 3, 1],
  xDomain: [-1.2, 2.6],
  yDomain: [-1.2, 2.35],
  unit: 44,
} as const;
```

- Elip vẽ bằng `levelEllipse(loss, touch, scale)`, nên elip ngoài cùng luôn đi qua đúng điểm chạm. Làm tròn điểm Ridge tới 4 chữ số làm $\lVert\mathbf{w}\rVert_2$ lệch $9 \times 10^{-6}$, mắt không thấy.
- **Mô tả `sr-only`** phải nói đủ: hai ô; trục w1, w2; vùng tròn và vùng thoi quanh gốc; nghiệm không phạt ở góc phần tư thứ nhất, gần trục w1 hơn; elip chạm hình tròn ở điểm có cả hai trọng số dương (khoảng 0.91 và 0.41), chạm hình thoi ở đỉnh trên trục w1, nơi w2 bằng 0.

### 11.5. Test chung: phần mở rộng

Theo quyết định 39: không spec riêng cho hình, không so tọa độ. Đã đọc `figure-conventions.test.ts` và `lessons.spec.ts` (`inspectFigure`, `figureContrast`, test "static figures").

**Tự áp dụng, không sửa:** đếm hình theo thẻ import, `lang`, `figcaption`, `role="img"`, `aria-label`, `aria-describedby`, id không trùng, không JS, cỡ chữ ≥ 12px (đo từng `tspan`, kể cả chỉ số dưới 13 đơn vị), chữ nằm trong `viewBox`, tương phản chữ, sổ đăng ký hình, chữ vi/en đủ key, `lesson-pairs.test.ts`, "trang không cuộn ngang".

**Cần mở rộng:**

| # | File | Việc | Lý do |
|---|---|---|---|
| T1 | `lessons.spec.ts`, `figureContrast` | Thêm vào danh sách nét đo (≥ 3:1 so với nền trang): `.atlas-fig-region` `stroke`, `.atlas-fig-level` `stroke`, `.atlas-fig-dot` `fill`. Không đo quầng (`stroke` của chấm chạm) | Hiện chỉ đo khối và mũi tên; nét mới sẽ lọt |
| T2 | `lessons.spec.ts`, `figureContrast` | Nền của chữ: nếu tâm hộp bao của chữ nằm trong một `.atlas-fig-region` (`isPointInFill`, cùng hệ tọa độ vì vùng không có `transform`) thì nền là `fill` của vùng phủ lên nền trang, như cách làm với khối | Hiện chữ ngoài khối luôn được đo với nền trang. Hình này không có chữ trong vùng, nhưng hình sau có thể có |
| T3 | `lessons.spec.ts`, `inspectFigure` | Ngân sách 10 000 ký tự / 200 phần tử tính **không gồm** cây `.katex` trong chú thích: trừ `outerHTML` của mỗi `.katex` và số phần tử của `.katex, .katex *`. Ghi riêng số của KaTeX vào annotation | Đo 24/10/2026: hai công thức của chú thích ra 4 936 ký tự, 132 phần tử (`katex.renderToString`, `htmlAndMathml`). Bản nháp SVG ra 3 902 ký tự, 48 phần tử. Cộng khung và mô tả là khoảng 10 000 ký tự, 185 phần tử: chạm ngưỡng chỉ vì KaTeX, thứ mục 8.2 d cho phép trong chú thích. Ngân sách vốn để giữ SVG vẽ tay gọn |
| U1 | `figure-conventions.test.ts` ý 1 | Thêm `FigMath` vào danh sách "has the kit" | |
| U2 | `figure-conventions.test.ts`, ý 6 mới | Mọi lớp `atlas-fig-*` dùng trong `src/components/figures/**/*.astro` đều có trong `figures.css` | SVG mặc định tô đen: gõ sai tên lớp thì vùng hay chấm thành khối đen, mất hẳn trong chế độ tối |
| U3 | `figure-geometry.test.ts` | `toView` (bốn góc của một `PlotBox` tính tay; throw khi ra ngoài miền), `pointsAttr`, `ellipseAttrs` (góc $-70°$ ra `rotate(70 …)`), `levelEllipse` (elip đi qua đúng điểm cho trước; `scale` 0.5 cho nửa bán trục), `checkMathLabel` (nhận `w`/`1`/`= 0` và `θ`; từ chối `ab`, sub `123`, after có chữ "and") | Toán của kit |
| U4 | `figure-geometry.test.ts` | Toán của hình (quyết định 39 cho phép unit test cho toán). Với `REGULARIZATION_GEOMETRY_PLOT`: (1) $\lvert\lVert\text{ridgeTouch}\rVert_2 - 1\rvert < 10^{-3}$, cả hai tọa độ ≥ 0.2; (2) $-\nabla f$ tại đó cùng hướng với điểm chạm: sin góc giữa chúng $< 10^{-3}$, tích vô hướng dương; (3) `lassoTouch` là $(1, 0)$ và $\lvert d_2\rvert/d_1 \le 0.9$; (4) tâm ngoài hai vùng, $c_1 > c_2 > 0$; (5) hộp bao của mọi elip nằm trong miền vẽ | Đây là tính chất toán, không phải so tọa độ: đổi số mà sai hình học thì test bắt |

### 11.6. Phụ thuộc

Không thêm gói npm. Dùng `astro`, `katex` (chú thích, đã có), `vitest`, `@playwright/test` 1.64.1. Script kiểm chứng chạy bằng Python và NumPy ngoài repo, không lưu vào `scripts/`.

### 11.7. Các bước thực hiện

Mỗi bước của `viz-builder` kết thúc bằng `npm run build` (không `[WARN]`), `npm run check` (0 lỗi 0 cảnh báo) và `npm test`.

| # | Agent | Việc | Tiêu chí hoàn thành |
|---|---|---|---|
| G0 | `viz-builder` | Kit: `src/lib/figures/plot.ts` (11.4.1), `checkMathLabel` trong `geometry.ts`, `kit/FigMath.astro` (11.4.2), lớp mới và biến `--atlas-fig-bg` trong `figures.css` (11.4.3). Test U1, U2, U3 | `npm test` qua. `figures.css` ≤ 1 024 byte gzip, ghi số đo vào 11.4.3. Hai hình của `ml/ml-overview` không đổi: e2e trên trang đó vẫn qua |
| G1 | `viz-builder` | `RegularizationGeometryFigure.astro`, `regularization-geometry.ts` (khối vi theo comment FIG, khối en nháp, `REGULARIZATION_GEOMETRY_PLOT`), mục trong `FIGURES`. Test U4. **Không sửa bài mdx** ở bước này, nên chạy được song song với `lesson-writer` | U4 qua. `figure-conventions.test.ts` qua với 3 hình. Hình build được (ví dụ tạm import vào một trang nháp không commit); tọa độ trong HTML khớp bảng tự soát ở 11.4.4 (soát tay, không viết test) |
| G1b | `viz-builder` | Sau khi `lesson-writer` sửa xong bài: thay comment `FIG: RegularizationGeometryFigure` bằng import, comment một dòng và thẻ. Xem tay trên `npm run preview` ở 375px và máy tính, sáng và tối (chỉ khi không có agent khác đang build hay chạy e2e) | `dist/vi/ml/regularization/index.html` có đúng 1 `figure#fig-regularization-geometry`, không có `astro-island` bên trong; có 1 `circle.atlas-fig-region`, 1 `polygon.atlas-fig-region`, 6 `ellipse.atlas-fig-level`, 5 `circle.atlas-fig-dot`. Tự đo: chữ nhỏ nhất ≥ 12px ở 375px; "w" và chỉ số không bị tách bởi khoảng trắng; SVG và khung (không tính KaTeX) ≤ 10 000 ký tự và ≤ 200 phần tử |
| G2 | `tester` | T1, T2, T3 trong `lessons.spec.ts` | `npm run test:e2e` qua ở `desktop` và `mobile`, trên `/vi/ml/regularization/`, trang fallback `/en/...` và `ml/ml-overview`. Thử phá (rồi trả lại): cho nét elip bằng màu nền thì T1 fail; gõ sai một lớp `atlas-fig-level` thì U2 fail; hạ cỡ chỉ số dưới xuống 10 đơn vị thì test cỡ chữ fail |
| G3 | `analyst` | Review theo mục 8 và 11 | Báo cáo có số đo: `figures.css` gzip, HTML của hình (có và không có KaTeX), tương phản đo thật, `package.json` không đổi |
| G4 | **người dùng** | Duyệt hình cùng lượt duyệt bản vi của bài (quyết định 36) | Đồng ý, hoặc có danh sách chỗ sửa |

Việc phiên chính lo: báo `lesson-writer` rằng nhãn "Điểm chạm: w2 = 0" được tách thành dòng chữ "Điểm chạm:" và dòng ký hiệu; và rằng mô tả `sr-only` cần nêu các ý ở 11.4.5.

### 11.8. Rủi ro và điểm chưa chắc

| # | Rủi ro | Cách xử lý |
|---|---|---|
| 1 | Điểm chạm Ridge ở góc 24°, $w_2 = 0.41$, có thể trông "gần trục" | Vẫn thấy rõ (18 đơn vị). Chú thích và lời văn nói "cả hai khác 0". Câu hỏi 1 |
| 2 | Mỗi ô chỉ khoảng 160px ở màn 375px, khoảng 185px trên máy tính | Hình sơ đồ, không có số để đọc. Nếu thấy nhỏ khi duyệt: xếp hai ô chồng nhau (cao khoảng 500, vẫn ≤ 540) |
| 3 | `FigMath` dùng weight 400 vì chỉ có 400 italic được nạp. Nếu ai đặt `font-weight: 600` cho `.atlas-fig-math`, trình duyệt tự nghiêng chữ đậm (nghiêng giả) | Ghi trong comment của `figures.css`. Không thêm font |
| 4 | T3 nới ngân sách cho mọi hình có KaTeX trong chú thích | KaTeX vẫn được tính trong DOM của cả bài (quyết định 29). Annotation ghi riêng số của KaTeX để theo dõi |
| 5 | `isPointInFill` (T2) chỉ xét tâm chữ | Đủ: chữ đặt hẳn trong hoặc hẳn ngoài vùng. Chữ vắt ngang mép vùng là bố cục xấu, người duyệt sẽ thấy |

#### Câu hỏi cho người dùng

1. **Hàm mất mát của hai ô.**
   - **(Recommended)** Một hàm chung cho hai ô (cùng tâm, cùng elip). Đúng ý "chỉ khác vùng ràng buộc". Điểm chạm Ridge ở góc 24°.
   - Hai hàm khác nhau: điểm chạm Ridge ở góc khoảng 35–45°, rõ hơn, nhưng người đọc có thể hỏi vì sao elip hai bên khác nhau.

**Các lựa chọn tự quyết, đổi lại được sau G4:** tên `FigMath`, `plot.ts` và các lớp mới; chỉ bố cục hẹp, hai ô cạnh nhau; nghiệm không phạt màu xanh như elip, điểm chạm màu mực có quầng; chú giải chỉ có "Nghiệm không phạt"; ngân sách không tính KaTeX (T3).

**Script kiểm chứng** (Python 3 và NumPy, chạy ngoài repo ngày 24/10/2026):

```python
import numpy as np
c = np.array([1.3, 0.8]); phi = np.radians(-70); q = 0.4
u = np.array([np.cos(phi), np.sin(phi)]); v = np.array([-np.sin(phi), np.cos(phi)])
A = np.outer(u, u) + np.outer(v, v) / q**2
f = lambda w: (w - c) @ A @ (w - c)
lo, hi = 0.0, 1e3                        # Ridge: w = (A + mu I)^-1 A c with |w| = 1
for _ in range(200):
    mu = (lo + hi) / 2; w = np.linalg.solve(A + mu * np.eye(2), A @ c)
    lo, hi = (mu, hi) if np.linalg.norm(w) > 1 else (lo, mu)
n = -2 * A @ (w - c)
print(w, mu, f(w), n[0] * w[1] - n[1] * w[0], n @ w > 0)    # [0.9116 0.4111] 3.1212 1.6041 ~0 True
d = A @ (c - np.array([1.0, 0.0]))       # Lasso: KKT at the vertex (1, 0)
print(d, d[1] / d[0], f(np.array([1.0, 0.0])))               # [3.0406 1.7975] 0.591 2.3502
th = np.linspace(-np.pi, np.pi, 2_000_001); P = np.c_[np.cos(th), np.sin(th)]
print(P[np.einsum('ij,jk,ik->i', P - c, A, P - c).argmin()])  # brute force on the circle: the same point
```
