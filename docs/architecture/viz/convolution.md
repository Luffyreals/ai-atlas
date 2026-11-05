# `ConvolutionViz` (bài CNN)

> Viết ngày 05/11/2026, phần Deep Learning. Mọi quy ước chung ở [README.md](README.md) mục 2 vẫn áp dụng (wrapper + island, `viz.css` duy nhất, `formatNumber`, `useHydrated`, vùng live, `client:visible`). Mục này chỉ ghi phần mới hoặc phần khác. Liên quan: [dl-lessons.md](../dl-lessons.md) mục 4.

## 1. Ý một câu

Mỗi ô của bản đồ đặc trưng là **tổng của 9 tích** giữa kernel 3×3 và cửa sổ 3×3 của ảnh nằm ngay dưới nó; cùng một kernel trượt khắp ảnh, và đổi kernel thì đổi thứ bản đồ làm nổi lên (cạnh dọc, cạnh ngang, làm mờ, làm nét).

Comment đặt trên thẻ trong bài (gợi ý): `{/* Một ý: mỗi ô của bản đồ đặc trưng là tổng 9 tích của kernel với cửa sổ 3×3 ngay dưới nó. */}`

## 2. Toán và dữ liệu: `src/lib/viz/convolution.ts`

Nguồn duy nhất của ảnh và kernel (VIZ, test, và sau này test so với file Python của bài):

| Hằng | Giá trị |
|---|---|
| `CONV_IMAGE` | Ảnh xám 8×8: nền 0, hình vuông 4×4 giá trị 9 ở hàng 2–5, cột 2–5 |
| `CONV_KERNELS` | `identity` `[[0,0,0],[0,1,0],[0,0,0]]`; `blur` 1/9 mọi ô (hiện là "1/9", `weightLabel`); `sharpen` `[[0,-1,0],[-1,5,-1],[0,-1,0]]`; `sobelVertical` `[[-1,0,1],[-2,0,2],[-1,0,1]]`; `sobelHorizontal` `[[-1,-2,-1],[0,0,0],[1,2,1]]` |
| `CONV_START` | Kernel Sobel dọc, cửa sổ ở ô (1, 1): tổng 27 (không mở ra ở một cửa sổ toàn số 0) |

Phép tính là **cross-correlation** (không lật kernel, như `torch.nn.functional.conv2d`), "valid" ($p = 0$), stride $s = 1$, chỉ số đếm từ 0 như NumPy:

$$
Y_{i,j} = \sum_{u=0}^{k-1}\sum_{v=0}^{k-1} X_{i+u,\,j+v}\,K_{u,v}, \qquad \text{kích thước ra } (8 - 3 + 1) \times (8 - 3 + 1) = 6 \times 6.
$$

Hàm: `outputSize`, `windowAt`, `productsAt`, `valueAt` (cộng theo hàng, trái sang phải), `crossCorrelate`, `maxAbs`, `signedFill`, `isBright`. Số hiện ra: `formatNumber` với `digits` của kernel (0, riêng làm mờ là 2: "4.00").

Bản đồ đặc trưng của 5 kernel khớp NumPy 2.4.6 (fixture `tests/unit/fixtures/convolution-python.ts`, ghi lệnh đã chạy). Thang màu theo $\max|Y|$: đồng nhất 9, làm mờ 9, làm nét 27, hai Sobel 36.

**Hợp đồng với bài `dl/cnn`:** code NumPy của bài dùng đúng `CONV_IMAGE` và đúng 5 kernel trên (cùng thứ tự hàng). Số trích trong lời văn nên lấy từ bảng fixture, ví dụ Sobel dọc: 36 ở ô (2, 0), −36 ở ô (2, 5), 0 ở hai cột giữa. Nếu bài gọi chỉ số từ 1 thì phải nói rõ, vì VIZ đếm từ 0. Ký hiệu trong VIZ chỉ là chữ ("Ảnh vào", "Kernel", "Bản đồ đặc trưng"), không có công thức KaTeX, nên không thể lệch ký hiệu với bài; khi bài thêm test so file `.py` với `CONV_IMAGE`, đặt dấu `# dataset:` theo khuôn [README.md](README.md) mục 2.5 hoặc so trực tiếp mảng.

## 3. Bố cục

Mọi ô là **HTML** (lưới `div`/`span`), không phải SVG: mỗi ô chứa một con số, và ô của bản đồ đầu ra là phần tử bấm được, có focus. Đây là mở rộng của mục 2.4 ("chữ là HTML") cho trường hợp hình chỉ gồm các ô số.

Thứ tự DOM: chú thích → 5 nút kernel → [ảnh 8×8] → [kernel 3×3, các tích 3×3, dòng tổng] → [nút Ô trước / Ô sau, bản đồ 6×6, chú giải màu] → dòng nhận xét theo kernel → `sr-only`.

- Dưới 36rem (điện thoại): xếp dọc theo đúng thứ tự trên, nên khi bấm Ô sau người đọc thấy phép tính ngay phía trên và bản đồ ngay phía dưới.
- Từ 36rem (container query): hai cột, `grid-auto-flow: dense`: ảnh | bản đồ ở hàng đầu, khối phép tính trải hết hàng dưới. 36rem để mỗi cột ≥ 280px, ô bản đồ ≥ 46px.
- Lưới lớn tối đa 22rem. Ở 375px: ảnh ô ≈ 39px, bản đồ ô ≈ 51px (≥ 44px). Lưới kernel rộng 9rem, lưới tích 16rem (ghi inline, chỉ là kích thước).
- Dòng tổng chỉ ghi "Tổng 9 tích = 27" (một dòng, chiều cao cố định). Không viết cả dãy cộng, vì dài ngắn theo kernel sẽ đẩy bản đồ phía dưới khi bấm.
- Dòng nhận xét: cả 5 câu cùng nằm trong `.atlas-viz-status-stack`, câu không dùng có `data-off`, nên cao bằng câu dài nhất ngay từ đầu.

## 4. Màu và tương phản

| Phần | Cách vẽ |
|---|---|
| Điểm ảnh | Giá trị ≥ nửa giá trị lớn nhất (`isBright`): nền `--atlas-viz-ink`, số màu nền vùng vẽ. Còn lại: nền vùng vẽ, số màu ink. Ảnh này chỉ có 0 và 9 nên tương phản là ink trên nền (14 tối, 15,6 sáng) |
| Ô có dấu (bản đồ, trọng số kernel, tích) | `::before` phủ `--atlas-viz-primary` (dương) hoặc `--atlas-viz-alt` (âm), `opacity` = $0{,}45 \cdot |v| / \text{thang}$ (`signedFill`, biến `--atlas-viz-o` inline). Số 0 không phủ. Số luôn màu ink |
| Tích bằng 0 | Chữ `--atlas-viz-muted` (`[data-zero]`, dùng chung luật với `[data-removed]`), để các tích khác 0 nổi lên |
| Cửa sổ trên ảnh, ô đang chọn trên bản đồ | `.atlas-viz-frame`: viền 3px `--atlas-viz-primary`, quầng 2px màu nền vùng vẽ ở cả trong lẫn ngoài, nên luôn nằm trên nền vùng vẽ dù đè lên ô sáng |

**Vì sao trần 0,45:** đo theo token (`custom.css` và `props.css` của Starlight), chữ ink trên lớp phủ mạnh nhất:

| Độ phủ | Tối: accent / xanh | Sáng: accent / xanh |
|---|---|---|
| 0,45 | 5,32 / **4,66** | 7,68 / 5,84 |
| 0,50 | 4,78 / 4,14 | 7,01 / 5,13 |

Trần 0,45 là mức cao nhất giữ ≥ 4,5:1 ở cả hai chế độ; dấu âm/dương còn được ghi bằng chính con số (dấu trừ U+2212), không chỉ bằng màu. Viền khung (accent trên nền vùng vẽ): 7,42 tối, 6,42 sáng.

**E2E chung** (`tests/e2e/viz.spec.ts`) có thêm hai phần cho lưới ô: đo viền `.atlas-viz-frame` như một nét (≥ 3:1, và bị làm hỏng trong bài kiểm tra đối chứng), và đo lại số của mỗi `.atlas-viz-cell[data-fill]` trên lớp phủ `::before` đã trộn với nền ô (`backgroundOf` không thấy pseudo-element).

## 5. Điều khiển và trợ năng

- 5 nút kernel: `.atlas-viz-choice` > `button.atlas-viz-toggle[aria-pressed]`, trong `role="group"` có `aria-label`.
- Bản đồ: `role="grid"` > `role="row"` (`display: contents`) > `role="gridcell"`, `aria-selected` ở ô đang chọn, `aria-label` "Hàng i, cột j: giá trị". **Một điểm Tab** (roving tabindex: ô chọn `tabIndex=0`, còn lại `-1`, chỉ sau khi hydrate). Phím: mũi tên (dừng ở mép), Home/End (đầu/cuối hàng), Ctrl+Home/End (ô đầu/cuối). Focus đi theo ô. Bấm chuột hoặc chạm một ô cũng dời cửa sổ.
- Nút Ô trước / Ô sau: đi theo thứ tự đọc, vòng lại ở hai đầu.
- Ảnh và lưới kernel: `role="img"` với nhãn (ảnh: cửa sổ đang phủ hàng nào, cột nào; mô tả `sr-only` nói hình vuông nằm đâu. Kernel: các trọng số theo hàng).
- Vùng live: đọc ngay khi bấm nút kernel hoặc Ô trước / Ô sau ("Kernel Sobel dọc, ô (1, 1): tổng 27."). Đi bằng phím trong lưới thì không đọc, vì focus đã đọc nhãn của ô. Lúc tải trang không đọc gì.
- Không có hoạt ảnh tự chạy.

## 6. File và chuỗi

| File | Vai trò |
|---|---|
| `src/components/viz/ConvolutionViz.astro` | Wrapper, không prop. Chuỗi `vizConvolution`, `client:visible={{ rootMargin: '200px' }}` |
| `src/components/viz/convolution-viz/ConvolutionVizIsland.tsx` | Island |
| `src/lib/viz/convolution.ts` | Toán, ảnh, kernel |
| `src/components/viz/viz.css` | Thêm `.atlas-viz-panels`, `.atlas-viz-panel`, `.atlas-viz-calc`, `.atlas-viz-cells`, `.atlas-viz-cell` (+ `[data-fill]`, `[data-bright]`), `.atlas-viz-frame`, `[data-zero]`, container query 36rem. `viz.css` sau khi thêm: 2 380 byte gzip bỏ comment (93% của 2 560) |
| `tests/unit/viz/convolution.test.ts` | Toán bằng tay, so NumPy, `signedFill` |
| `tests/unit/components/convolution-viz-island.test.tsx` | Island (jsdom): số, phím, nút, live, SSR rồi hydrate |
| `tests/unit/fixtures/convolution-python.ts` | Bản đồ đặc trưng từ NumPy |

Namespace `vizConvolution` (27 key): `caption`, `kernelsLabel`, 5 tên kernel (`identity`, `blur`, `sharpen`, `sobelVertical`, `sobelHorizontal`), `imageTitle`, `imageLabel`, `imageDesc`, `kernelTitle`, `kernelLabel`, `productsTitle`, `product`, `sum`, `mapTitle`, `mapLabel`, `cellLabel`, `legend`, `prev`, `next`, 5 câu nhận xét (`<kernel>Note`), `announce`.

Bài dùng:

```mdx
import ConvolutionViz from '@components/viz/ConvolutionViz.astro';

<ConvolutionViz />
```

## 7. Điểm chưa chắc

- Ngân sách `viz.css` còn khoảng 180 byte gzip. VIZ sau cần thêm CSS thì gọi `architect` xem lại (README mục 2.3).
- Ảnh vẽ ink theo ngưỡng nửa giá trị lớn nhất, đủ cho ảnh 0/9. Nếu đổi sang ảnh nhiều mức xám thì cần thang xám thật (và đo lại tương phản chữ).
- Lời văn của bài phải nói rõ chỉ số đếm từ 0 nếu nhắc tới ô (i, j), cho khớp VIZ.
