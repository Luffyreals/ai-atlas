# `GradientDescentViz` (bài Gradient Descent)

> (Trước đây `docs/architecture/viz.md` mục 12. Số mục giữ nguyên như file cũ; mục ở file khác tra trong [mục lục](README.md#mục-lục).)

## 12. `GradientDescentViz` (bài Gradient Descent)

> Viết ngày 24/10/2026, mốc M3. Mọi quy ước ở mục 2 và phần dùng chung của mục 9, 10 vẫn áp dụng: kit `PlotFrame`, `PlotCurve`, `AtPoint`, `Swatch`, `DotSwatch`, `VizSlider`, `useSettled`, `useHydrated`, `axisText()`, `formatMse`, `toPolyline`, hàng nút `.atlas-viz-choice`. Mục này chỉ ghi phần mới hoặc phần khác.
>
> **Quyết định đầu vào** ([decisions.md](../../decisions.md)): 37 (VIZ chạy từng bước, đổi tốc độ học, tái dùng kit), 38 (bảng 10 căn hộ, giải lại đúng bài toán của Hồi quy tuyến tính), 39 (test gọn: unit test cho toán, dựa vào `viz.spec.ts` chung), 50 (kit đã gộp để VIZ này dùng luôn), 52 (phạm vi bài; VIZ đường mức, Bước / Chạy / Đặt lại, thanh trượt $\eta$, biểu đồ MSE theo bước; 3 ô code).
>
> **Đã chạy thật:** venv mục 2.5 (Python 3.14.5, NumPy 2.4.6, scikit-learn 1.8.0), `python -I`, thư mục trống ngoài repo. Số "chính xác" là đường đi GD tính bằng **số hữu tỉ** (`fractions.Fraction`) trên đúng các số thực $\tilde{x}_i$ mà NumPy và TypeScript tạo ra. Vòng lặp TypeScript được mô phỏng bằng Python thuần (cùng thứ tự phép tính) để đo sai số trước khi viết code. Ba ô code chạy với `-W error`: không có cảnh báo nào.

### 12.1. Mục tiêu và phạm vi

**Ý một câu của VIZ:** mỗi bước đi ngược gradient trên "cái bát" MSE; $\eta$ nhỏ thì đi chậm, $\eta$ vừa thì tới đáy nhanh, $\eta$ gần $2/L$ thì nhảy qua lại hai bên thung lũng, $\eta$ lớn hơn $2/L$ thì văng ra ngoài (phân kỳ).

**Làm:**

- Toán thuần `src/lib/viz/gradient-descent.ts`: chuẩn hóa min-max, gradient, Hessian và $L$, đường đi GD, đường mức elip, đổi tham số về đơn vị gốc, kết cục của một mức $\eta$.
- `detLog10` trong `scale.ts`: log chỉ bằng `+ − × ÷ sqrt` (mục 12.2.6).
- Kit: `PlotFrame` thêm `shape="equal"` và `yTickLabels`; chuyển `CrossMark` của `LinearFitViz` vào kit.
- VIZ `GradientDescentViz`: bản đồ đường mức theo $(\tilde{w}, \tilde{b})$ có đường đi, thanh trượt $\eta$ 5 mức, ba nút Bước / Đặt lại / Chạy-Dừng, dòng số, biểu đồ MSE theo bước (thang log), dòng trạng thái.
- Script `scripts/gradient-descent-fixture.py` sinh fixture chính xác.

**Không làm:**

- SGD, mini-batch, momentum trong VIZ. Ô code 3 và bài `ml/optimizers` lo.
- So sánh "có / không chuẩn hóa" trong VIZ: bát của dữ liệu thô có $\kappa \approx 27\,200$, elip dẹt tới mức không vẽ được (mục 12.2.1). Ô code 2 lo việc này.
- Kéo điểm bắt đầu, nhập $\eta$ tùy ý, tiêu chí dừng theo $\lVert\nabla\mathcal{L}\rVert$ trong VIZ (ô code 1 lo).
- Mặt 3D. Spec e2e riêng, test island jsdom riêng (quyết định 39).

### 12.2. Phương án đã chọn

#### 12.2.1. Hàm mục tiêu, gradient, chuẩn hóa

**Hàm mất mát** đúng như bài Hồi quy tuyến tính (đã đọc `linear-regression.mdx`, dòng 137–189): MSE với hệ số $\frac{1}{m}$, **không** có $\frac{1}{2}$. Gradient vì vậy có hệ số $\frac{2}{m}$, trùng hai đạo hàm riêng bài đó đã dẫn:

$$
\frac{\partial\mathcal{L}}{\partial w} = \frac{2}{m}\sum_{i=1}^{m}x^{(i)}\left(\hat{y}^{(i)} - y^{(i)}\right), \qquad
\frac{\partial\mathcal{L}}{\partial b} = \frac{2}{m}\sum_{i=1}^{m}\left(\hat{y}^{(i)} - y^{(i)}\right), \qquad
\nabla\mathcal{L}(\boldsymbol{\theta}) = \frac{2}{m}\mathbf{X}^\top\left(\mathbf{X}\boldsymbol{\theta} - \mathbf{y}\right)
$$

Quy tắc cập nhật: $\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \eta\nabla\mathcal{L}(\boldsymbol{\theta})$. Hessian là ma trận hằng $\mathbf{H} = \frac{2}{m}\mathbf{X}^\top\mathbf{X}$. Gọi $L$ là trị riêng lớn nhất, $\mu$ là trị riêng nhỏ nhất, $\kappa = L/\mu$.

**Vấn đề:** chuẩn hóa z-score (trừ trung bình, chia độ lệch chuẩn) làm hai cột $[z, 1]$ trực giao, nên $\mathbf{H} = 2\mathbf{I}$. Đường mức thành vòng tròn, $\eta = 0.5$ tới đáy sau đúng 1 bước, không có zigzag. Dữ liệu thô thì ngược lại: elip quá dẹt. Cần một cách chuẩn hóa cho $\kappa$ khoảng 5–30.

| Cách đổi $x$ | $L$ | $2/L$ | $\kappa$ | Đánh giá |
|---|---:|---:|---:|---|
| Thô (m²) | 6 199.37 | $3.226 \times 10^{-4}$ | 27 215 | Elip không vẽ được. Dùng ở ô code 2 để so |
| $x/10$ (chục m²) | 63.75 | 0.0314 | 288 | Vẫn quá dẹt: hơn 1 000 bước mới gần đáy |
| $x/\sigma$ (chia độ lệch chuẩn, không trừ trung bình) | 19.35 | 0.1034 | 94 | Dẹt, nghiêng gắt |
| $x/100$ | 2.565 | 0.780 | 46.6 | Được, nhưng hơi dẹt, và $\tilde{w}$ khó hiểu |
| **Min-max: $\tilde{x} = \dfrac{x - 25}{85 - 25} = \dfrac{x - 25}{60}$ (chọn)** | **2.4533** | **0.8152** | **15.34** | Elip nghiêng vừa phải, thấy đủ bốn hành vi. Tham số có nghĩa đời thường (dưới đây). Có sẵn trong scikit-learn (`MinMaxScaler`) |
| z-score | 2 | 1 | 1 | Vòng tròn, không có zigzag (ở trên) |

**Chỉ chuẩn hóa $x$, giữ nguyên $y$.** Đổi $y$ không làm đổi hình dạng bát (Hessian không phụ thuộc $y$), lại làm MSE khác số của bài trước. Giữ $y$ thô thì MSE trong VIZ **chính là** MSE của bài Hồi quy tuyến tính, cùng đơn vị (triệu đồng/tháng)², đáy 0.3615.

**Ký hiệu** (câu hỏi 3): $\tilde{x}$ là diện tích đã chuẩn hóa, mô hình $\hat{y} = \tilde{w}\tilde{x} + \tilde{b}$. Nghĩa: $\tilde{b}$ là giá dự đoán cho căn nhỏ nhất (25 m²); $\tilde{w}$ là chênh lệch giá dự đoán giữa căn lớn nhất (85 m²) và căn nhỏ nhất. Đổi về đơn vị gốc (thay $\tilde{x} = (x - 25)/60$ vào rồi gom hệ số):

$$
w = \frac{\tilde{w}}{60}, \qquad b = \tilde{b} - 25w.
$$

| | $\tilde{w}$ | $\tilde{b}$ | $w$ | $b$ | MSE |
|---|---:|---:|---:|---:|---:|
| Nghiệm chính xác (số hữu tỉ) | 10.168592794 | 6.276342624 | 0.169476547 | 2.039428960 | 0.361479266 |
| Hiển thị | 10.17 | 6.28 | 0.1695 | 2.04 | 0.3615 |

Khớp $w \approx 0.16948$, $b \approx 2.0394$, MSE $\approx 0.36148$ của bài Hồi quy tuyến tính.

#### 12.2.2. $L$, ngưỡng $2/L$ và phép suy ra một chiều cho lời văn

Trên $\tilde{x}$: $\mathbf{H} = \begin{pmatrix} 0.61322 & 0.91333 \\ 0.91333 & 2 \end{pmatrix}$. Hàng 1 là $\frac{2}{m}\sum\tilde{x}_i^2$ và $\frac{2}{m}\sum\tilde{x}_i$; hàng 2 là $\frac{2}{m}\sum\tilde{x}_i$ và 2. Trị riêng tính bằng công thức của ma trận $2 \times 2$, chỉ cần `sqrt`:

| Đại lượng | Giá trị | Ý nghĩa |
|---|---:|---|
| $L = \lambda_{\max}(\mathbf{H})$ | 2.453331 | Độ cong theo hướng dốc nhất. Vectơ riêng $\approx (0.445, 0.896)$: chủ yếu là $\tilde{b}$, tức "nâng hạ cả đường" |
| $\mu = \lambda_{\min}(\mathbf{H})$ | 0.159891 | Độ cong dọc đáy thung lũng. Vectơ riêng $\approx (0.896, -0.445)$: xoay đường quanh điểm trung bình |
| $1/L$ | 0.4076 | Trên mức này bắt đầu nhảy qua đáy theo hướng dốc |
| $2/L$ | **0.8152** | Ngưỡng phân kỳ |
| $\eta^\ast = 2/(L + \mu)$ | 0.7653 | Tối ưu theo lý thuyết (tốc độ xấu nhất nhỏ nhất), hệ số co $(\kappa - 1)/(\kappa + 1) = 0.8776$ mỗi bước |
| $\kappa$ | 15.34 | Elip có tỉ lệ trục $\sqrt{\kappa} \approx 3.9$ |

**Phép suy ra một chiều** (quyết định 52: nêu ngưỡng qua ví dụ một chiều, không chứng minh tổng quát). Hàm bậc hai một biến $f(w) = \frac{L}{2}(w - w^\ast)^2 + c$ có $f'(w) = L(w - w^\ast)$ và $f'' = L$. Một bước GD cho:

$$
w_{k+1} - w^\ast = (w_k - w^\ast) - \eta L (w_k - w^\ast) = (1 - \eta L)(w_k - w^\ast)
\quad\Rightarrow\quad w_k - w^\ast = (1 - \eta L)^k (w_0 - w^\ast).
$$

Sau mỗi bước, khoảng cách tới đáy nhân với $q = 1 - \eta L$, nên:

| $\eta$ | $q$ | Hành vi |
|---|---|---|
| $0 < \eta < 1/L$ | $0 < q < 1$ | Đi một phía, chậm dần đều |
| $\eta = 1/L$ | $0$ | Tới đáy sau 1 bước |
| $1/L < \eta < 2/L$ | $-1 < q < 0$ | Nhảy qua đáy, lần sau ngắn hơn lần trước: dao động tắt dần |
| $\eta = 2/L$ | $-1$ | Nhảy qua lại mãi, không tới gần hơn |
| $\eta > 2/L$ | $q < -1$ | Mỗi lần nhảy xa hơn: phân kỳ |

Vậy GD hội tụ khi và chỉ khi $0 < \eta < 2/L$. Ví dụ số với $f(w) = w^2$ ($L = 2$, $2/L = 1$), $w_0 = 1$, đã chạy:

| $\eta$ | $w_0 \dots w_5$ |
|---|---|
| 0.1 | 1, 0.8, 0.64, 0.512, 0.4096, 0.3277 |
| 0.5 | 1, 0, 0, 0, 0, 0 |
| 0.9 | 1, −0.8, 0.64, −0.512, 0.4096, −0.3277 |
| 1.1 | 1, −1.2, 1.44, −1.728, 2.0736, −2.4883 |

Với MSE hai tham số, lời văn chỉ cần nói: theo mỗi hướng riêng của bát, GD cư xử như ví dụ một chiều với độ cong của hướng đó. Hướng cong nhất ($L$) quyết định ngưỡng $2/L$. Hướng phẳng nhất ($\mu$) quyết định tốc độ ($q = 1 - \eta\mu$). $\kappa$ lớn (bát dẹt) thì không có $\eta$ nào nhanh cho cả hai hướng. Đó là lý do chuẩn hóa giúp hội tụ nhanh: dữ liệu thô có $\kappa = 27\,215$, min-max 15.3, z-score 1.

**Nguồn cho lời văn** (đề xuất, **chưa đọc lại trong phiên này**; `summarizer` xác minh và ghi vào `docs/research/gradient-descent.md` trước khi bài trích):

- Goh, G. (2017). *Why Momentum Really Works*. Distill. https://distill.pub/2017/momentum/ (phân tích GD trên hàm bậc hai theo từng trị riêng, điều kiện $0 < \eta\lambda_i < 2$).
- Nocedal, J., Wright, S. J. (2006). *Numerical Optimization*, 2nd ed., Springer, chương 3 (tốc độ hội tụ của steepest descent trên hàm bậc hai, số điều kiện).
- Goodfellow, I., Bengio, Y., Courville, A. (2016). *Deep Learning*, MIT Press, mục 4.3 (Hessian, số điều kiện, tốc độ học). https://www.deeplearningbook.org/

#### 12.2.3. Các mức $\eta$, điểm bắt đầu, số bước

**Điểm bắt đầu cố định: $(\tilde{w}, \tilde{b}) = (0, 0)$**, MSE 129.75. Đây là cách khởi tạo thông thường (`np.zeros(2)` trong ô code 1). Từ đây, vectơ tới đáy có thành phần lớn theo **cả hai** hướng riêng (10.15 theo hướng dốc, 6.32 dọc đáy thung lũng). Nhờ vậy đường đi cong rõ khi $\eta$ nhỏ và zigzag rõ khi $\eta$ lớn. Đã thử và bỏ hai điểm khác: $(0, 10.9)$ (đường A của bài trước, MSE 10.50) nằm ngay trên đáy thung lũng nên gần như không có zigzag; $(20, 0)$ cho zigzag yếu.

**Số bước tới "gần đáy"** (MSE $\le 1.01 \times 0.36148$, tức trong 1% của mức nhỏ nhất), từ $(0, 0)$, tính bằng số hữu tỉ:

| $\eta$ | 0.02 | 0.05 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.75 | 0.765 | 0.78 | 0.8 | 0.81 | ≥ 0.82 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Số bước | 1 059 | 423 | 211 | 105 | 69 | 52 | 41 | 34 | **29** | 32 | 40 | 58 | 138 | 406 | phân kỳ |

Từ điểm bắt đầu này, $\eta = 0.7$ nhanh hơn $\eta^\ast = 0.765$. $\eta^\ast$ tối ưu cho trường hợp xấu nhất, không cho một điểm bắt đầu cụ thể. Lời văn không cần nhắc.

**Chọn 5 mức, tối đa 100 bước.** 100 là số tròn, đủ để mức "vừa" tới đáy còn mức "chậm" thì chưa:

| # | $\eta$ | $\eta L$ | $q_{\text{dốc}} = 1 - \eta L$ | $q_{\text{đáy}} = 1 - \eta\mu$ | Tới 1% ở bước | MSE ở bước 1–5 | MSE bước 10 / 20 / 50 | Kết thúc: bước, MSE, $(\tilde{w}, \tilde{b})$, $\hat{y}$ gốc | Vai trò |
|---|---:|---:|---:|---:|---:|---|---|---|---|
| 0 | 0.05 | 0.123 | 0.8773 | 0.9920 | (423) | 100.64, 78.22, 60.95, 47.65, 37.40 | 12.29 / 3.3486 / 1.7918 | 100, **1.0023**, (7.63, 7.54), $0.1272x + 4.35$ | chậm: hết 100 bước vẫn còn xa đáy |
| 1 | **0.3** (ban đầu) | 0.736 | 0.2640 | 0.9520 | **69** | 12.05, 3.5960, 2.7802, 2.5180, 2.3136 | 1.5554 / 0.8082 / 0.3849 | 100, 0.3617, (10.13, 6.30), $0.1688x + 2.08$ | vừa: xuống thung lũng rồi men theo đáy |
| 2 | 0.7 | 1.717 | −0.7173 | 0.8881 | **29** | 67.81, 35.76, 19.12, 10.44, 5.8876 | 0.8228 / 0.3894 / 0.3615 | 100, 0.3615, (10.17, 6.28), $0.1695x + 2.04$ | gần tối ưu: nhảy qua đáy vài lần rồi tới |
| 3 | 0.8 | 1.963 | −0.9627 | 0.8721 | (138) | 119.74, 110.59, 102.20, 94.51, 87.43 | 59.53 / 27.92 / 3.1704 | 100, **0.4240**, (10.07, 6.07), $0.1678x + 1.88$ | dao động: gần $2/L$, zigzag mạnh, tắt rất chậm |
| 4 | 0.85 | 2.085 | −1.0853 | 0.8641 | — | 151.40, 177.24, 207.95, 244.32 | — | **4** (ra khỏi khung), 244.32, (0.76, −4.76) | phân kỳ: $\eta > 2/L$ |

Số trong ngoặc là số bước cần, lớn hơn 100 nên VIZ không tới. Đường đi phân kỳ: bước 1 ở $(10.17, 18.56)$, bước 2 ở $(0.63, -2.33)$, bước 3 ở $(12.28, 19.70)$, bước 4 ở $(0.76, -4.76)$, dưới mép $\tilde{b} = -4$.

**Thanh trượt** chạy theo chỉ số mức (0–4, bước 1). Số hiện ra là $\eta$ với 2 chữ số: `0.05`, `0.30`, `0.70`, `0.80`, `0.85`. Không hiện chữ "chậm / vừa / …" cạnh số: người đọc tự thấy hành vi, rồi dòng trạng thái gọi tên sau khi chạy.

**Khi phân kỳ:** đường đi dừng ở bước **đầu tiên nằm ngoài khung** $(\tilde{w}, \tilde{b})$ (`exitStep`). Đoạn cuối vẫn vẽ và tự bị cắt ở mép (`PlotCurve`); chấm của điểm ngoài khung không vẽ. Chạy dừng tại đó, dòng trạng thái báo phân kỳ. Nhờ vậy MSE không bao giờ vượt khung biểu đồ (244.32 < 1 000), và không có số khổng lồ.

#### 12.2.4. Tính ở đâu và độ khớp

**Island tính cả 5 đường đi một lần lúc mount** (`useMemo`). HTML dựng sẵn chạy cùng code đó lúc build. Mỗi đường tối đa 100 bước × 10 hàng: dưới 0.1 ms. Không truyền đường đi qua `props`.

- Chỉ `+ − × ÷`, `Math.sqrt`, `Math.abs` (như `poly-fit.ts`, mục 9.2.2), nên lúc build và lúc hydrate trùng từng bit. Unit test quét nguồn.
- $\tilde{x}_i = (x_i - 25)/60$ là một phép trừ chính xác và một phép chia làm tròn đúng, nên **giống từng bit** với `(area - area.min()) / (area.max() - area.min())` của NumPy (đã kiểm).
- Vòng lặp: với mỗi hàng, `r = w * x + b - y; sw += x * r; sb += r`; rồi `gw = (2 / m) * sw`, `gb = (2 / m) * sb`, `w = w - eta * gw`, `b = b - eta * gb`. MSE lấy bằng `mse()` có sẵn trong `linear-fit.ts`. NumPy cộng theo thứ tự khác (BLAS), nên hai bên chỉ khớp tới sai số làm tròn.
- **Đo được** (5 mức, mọi bước): lệch tương đối so với nghiệm hữu tỉ tối đa $2.7 \times 10^{-14}$, cả TS mô phỏng lẫn NumPy. So **2 045 chuỗi hiển thị** ở mọi bước (MSE theo `formatMse`, $\tilde{w}$ và $\tilde{b}$ 2 chữ số, $w$ 4 chữ số, $b$ 2 chữ số): bản chính xác, TS và NumPy trùng **2 045/2 045**. Khoảng cách nhỏ nhất từ một MSE tới mốc làm tròn là $3.3 \times 10^{-8}$ (tương đối), gấp hơn $10^6$ lần sai số.
- **Đáy** lấy bằng `fitLeastSquares` có sẵn, chạy trên các hàng đã chuẩn hóa: $\tilde{w}^\ast$, $\tilde{b}^\ast$ và MSE nhỏ nhất.

#### 12.2.5. Đường mức: elip tính từ Hessian, vẽ bằng `PlotCurve`

MSE là hàm bậc hai đúng nghĩa: $\mathcal{L}(\boldsymbol{\theta}) = \mathcal{L}^\ast + (\boldsymbol{\theta} - \boldsymbol{\theta}^\ast)^\top\mathbf{A}(\boldsymbol{\theta} - \boldsymbol{\theta}^\ast)$ với $\mathbf{A} = \frac{1}{2}\mathbf{H}$. Đường mức $\mathcal{L} = \ell$ là elip. Tham số hóa không cần lượng giác:

1. Cholesky $\mathbf{A} = \mathbf{R}^\top\mathbf{R}$, $\mathbf{R} = \begin{pmatrix} r_{11} & r_{12} \\ 0 & r_{22} \end{pmatrix}$, với $r_{11} = \sqrt{a}$, $r_{12} = c/r_{11}$, $r_{22} = \sqrt{1 - r_{12}^2}$, $a = \frac{1}{m}\sum\tilde{x}_i^2$, $c = \frac{1}{m}\sum\tilde{x}_i$.
2. Điểm trên vòng tròn đơn vị bằng **tham số hữu tỉ** $u = \left(\frac{1 - t^2}{1 + t^2}, \frac{2t}{1 + t^2}\right)$, $t = -1 + 2j/24$, $j = 0..24$ (nửa phải). Nửa trái lấy $(-u_1, u_2)$ theo thứ tự ngược lại. Tổng 49 điểm, khép kín, khe góc lớn nhất 9.5°.
3. Với $s = \sqrt{\ell - \mathcal{L}^\ast}$, thế ngược $\mathbf{R}\mathbf{d} = s\,u$: $d_2 = s u_2 / r_{22}$, $d_1 = (s u_1 - r_{12}d_2)/r_{11}$. Điểm là $\boldsymbol{\theta}^\ast + \mathbf{d}$.
4. `toPolyline` rồi `PlotCurve` lớp `atlas-viz-level`. Phần ngoài khung tự bị cắt.

| Phương án | Đánh giá |
|---|---|
| **A. Elip tính từ Hessian, polyline 49 điểm qua `PlotCurve` (chọn)** | Dùng lại `PlotCurve`, `toPolyline`, cắt ở mép. Chỉ `+ − × ÷ sqrt`. HTML khoảng 5.3 KB cho 9 mức (khoảng 1.5–2 KB gzip) |
| B. `levelEllipse` / `ellipseAttrs` của `src/lib/figures/plot.ts` | Viết cho `viewBox` một tỉ lệ chung và `<ellipse transform="rotate(…)">`: cần góc (lượng giác, không giống từng bit), trong khi VIZ vẽ theo `%`. Không hợp. Chỉ dùng lại ý "elip từ dạng toàn phương" |
| C. `<circle r="1" transform="matrix(…)">` trong SVG lồng có `viewBox` theo dữ liệu | HTML nhỏ nhất (khoảng 1 KB). Nhưng `vector-effect` cộng `transform` cộng `preserveAspectRatio="none"` chưa thử trên Safari (giống rủi ro 4 của mục 9.7). Để dành nếu HTML thành vấn đề |
| D. Lưới giá trị và marching squares | Nhiều code, nặng. Không cần, vì MSE là bậc hai đúng |

**9 mức MSE: 0.5, 1, 2, 5, 10, 20, 50, 100, 200.** Dãy 1–2–5 cách đều trên thang log, khớp vạch của biểu đồ MSE. Bán trục của mức $\ell$ là $\sqrt{(\ell - 0.3615)/\lambda_i(\mathbf{A})}$: mức 0.5 là 0.34 × 1.32, mức 200 là 12.8 × 50 (chỉ thấy ở hai góc). Không ghi số trên đường mức (rối ở 375px). Biểu đồ MSE và dòng số đã cho số.

**Khung: $\tilde{w} \in [-10, 22]$, $\tilde{b} \in [-4, 20]$, tỉ lệ 32 : 24 = 4 : 3, cùng một đơn vị cho hai trục.** Vạch chia mỗi 5 đơn vị: $\tilde{w}$ là −10, −5, 0, 5, 10, 15, 20; $\tilde{b}$ là 0, 5, 10, 15, 20.

- Mọi đường đi không phân kỳ nằm trọn trong khung: $\tilde{w} \in [0, 11.99]$, $\tilde{b} \in [-0.01, 17.47]$, mức 0.8 đi xa nhất. Mức 0.85 thấy 3 bước trong khung, bước 4 ra ngoài.
- **Cùng đơn vị** để bước GD trông **vuông góc với đường mức**, đúng như lời văn sẽ nói. Muốn vậy vùng vẽ phải giữ 4 : 3 ở mọi chiều rộng. Vì thế thêm `shape="equal"` cho `PlotFrame` (mục 12.4.3): `aspect-ratio: 4 / 3` kể cả khi khung VIZ rộng (thay cho 3 / 2).
- **Ở 375px:** vùng vẽ khoảng 270 × 203px, 8.4px mỗi đơn vị. Bước đầu của mức 0.05 dài khoảng 3 đơn vị (25px); các bước cuối dưới 1px, chấm chồng lên nhau, đúng ý "đi chậm dần". Elip nhỏ nhất (mức 0.5) khoảng 6 × 22px quanh dấu ×. Nhãn "−10" có 3 ký tự, các nhãn cách nhau 42px.
- Trên máy tính (cột khoảng 680px), vùng vẽ cao khoảng 500px. Chấp nhận (rủi ro 2).

#### 12.2.6. Biểu đồ MSE theo bước: thang log

MSE đi từ 129.75 xuống 0.3615, tức giảm 360 lần. Với thang tuyến tính $[0, 140]$, 1.0023 (mức chậm, chưa tới) và 0.3617 (mức vừa) trông như nhau, mất đúng ý "chậm". **Chọn thang log** (câu hỏi 2), như `plt.yscale('log')` của ô code 2:

- Trục $y$ là $\log_{10}$ MSE trên miền $[-1, 3]$. Vạch $-1..3$ hiện nhãn `0.1`, `1`, `10`, `100`, `1000` (prop mới `yTickLabels` của `PlotFrame`). Tên trục là `MSE (thang log)`. Mô tả `sr-only` nói "mỗi vạch lớn gấp 10 lần vạch ngay dưới".
- Trục $x$: bước $[0, 100]$, vạch 0, 25, 50, 75, 100.
- Vẽ ba thứ: đường tham chiếu ở MSE nhỏ nhất ($\log_{10} 0.3615 = -0.442$, `line.atlas-viz-reference`, nét đứt xanh như "đường tốt nhất" của `LinearFitViz`); đường MSE từ bước 0 tới bước hiện tại (`PlotCurve` lớp `atlas-viz-series`); chấm ở bước hiện tại (`circle.atlas-viz-point`, $r = 4$).
- Mọi mức đều nằm trong khung: lớn nhất 244.32 (mức 0.85 trước khi dừng), nhỏ nhất 0.3615.
- **`detLog10(v)`** trong `scale.ts`. Lý do: `Math.log10` không bắt buộc làm tròn đúng, nên có thể lệch giữa Node và trình duyệt. Cách tính chỉ dùng `+ − × ÷ sqrt`:
  1. đưa $v$ về $[1, 10)$ bằng nhân hoặc chia 10, đếm số mũ $e$; nếu $v \ge \sqrt{10}$ thì chia thêm 10 một lần và tăng $e$ (thêm ở D0, xem dưới);
  2. lấy căn bậc hai 4 lần: $r = v^{1/16} \in [0.93, 1.075)$;
  3. $s = (r - 1)/(r + 1)$, $\ln r = 2(s + s^3/3 + s^5/5 + s^7/7 + s^9/9)$;
  4. kết quả là $e + 16\ln r / \ln 10$, với hằng `LN10 = 2.302585092994046`.

  Throw khi $v \le 0$ hoặc không hữu hạn. **Đo ở D0:** không có bước dời $\sqrt{10}$, sai số lên tới $3.3 \times 10^{-13}$ khi $v$ gần 10, và $10^k$ với $k < -22$ không ra đúng $k$. Có bước đó: sai số khoảng $2 \times 10^{-15}$ và đúng tuyệt đối tại mọi $10^k$, $k = -300..308$.

#### 12.2.7. Nút Bước / Đặt lại / Chạy, hoạt ảnh, trợ năng

**Ba nút** `<button type="button" class="atlas-viz-toggle">`, **không** có `aria-pressed`, đặt trong `div.atlas-viz-choice` (hàng flex có sẵn), theo thứ tự **Bước, Đặt lại, Chạy/Dừng**. Nút Chạy/Dừng đứng cuối, để khi nhãn đổi độ rộng nó không đẩy nút khác.

| Thao tác | Kết quả | Vùng live (đọc ngay) |
|---|---|---|
| Bước | Dừng hoạt ảnh nếu đang chạy, đi thêm 1 bước. Ở bước cuối (100, hoặc `exitStep`) thì không làm gì | `announceStep` ("Bước 3: MSE 2.7802."), hoặc `atEnd` khi đã ở cuối |
| Đặt lại | Dừng hoạt ảnh, về bước 0 | `resetDone` |
| Chạy | Chạy hoạt ảnh từ bước hiện tại tới cuối. Nếu đã ở cuối thì về bước 0 rồi chạy. Nhãn thành "Dừng" | `running` |
| Dừng | Dừng hoạt ảnh tại bước hiện tại. Nhãn thành "Chạy" | `stopped` ("Đã dừng ở bước 41: MSE …") |
| Hoạt ảnh tự chạy tới cuối | Nhãn về "Chạy" | Câu của dòng trạng thái (mục 12.2.8) |
| Đổi $\eta$ | Dừng hoạt ảnh, về bước 0, đường đi trống | Sau `SETTLE_MS`: `announceEta` |

- **Không nút nào bị `disabled` sau khi hydrate.** `viz.spec.ts` (hàm `hydrate`) chờ tới khi không còn điều khiển nào `disabled`, và các phép thử (3), (4), (6) bấm mọi nút. Nút bị khóa sẽ làm test treo. Nút không có việc gì để làm thì không làm gì và báo qua vùng live. Cũng không dùng `aria-disabled`, vì Playwright coi nút đó là không bấm được.
- **Hoạt ảnh bằng `requestAnimationFrame`.** Mỗi khung hình kiểm tra `now − last ≥ STEP_MS` (60 ms) thì tăng **đúng 1 bước**: 100 bước mất khoảng 6 giây. Không dùng `setInterval`: rAF tự dừng khi tab ẩn, khớp nhịp vẽ, và không dồn nhiều bước sau khi tab hiện lại. Effect phụ thuộc `running`, dọn bằng `cancelAnimationFrame` khi dừng, đổi $\eta$, Đặt lại và unmount.
- **`prefers-reduced-motion: reduce`:** đọc `window.matchMedia(…).matches` **lúc bấm**, không lúc render (mục 2.8). Khi đó Chạy nhảy thẳng tới bước cuối, không hoạt ảnh, rồi đọc câu kết quả. Bước và Đặt lại không đổi.
- **Vùng live không đọc từng bước** của hoạt ảnh: chỉ đọc lúc bắt đầu (`running`) và lúc kết thúc hoặc dừng. Bấm Bước liên tục thì mỗi lần chữ được thay, trình đọc màn hình đọc câu mới nhất.
- **Bàn phím:** nút HTML thật (Enter, Space). Tab đi qua thanh trượt rồi ba nút theo thứ tự DOM. Focus vẫn ở nút Chạy/Dừng khi nhãn đổi. Thanh trượt dùng phím của trình duyệt.
- **Trước khi hydrate:** bước 0, mức 0.3, điều khiển `disabled`, có `<noscript>`. Hình tĩnh có đủ 9 đường mức, điểm bắt đầu và dấu ×; biểu đồ MSE có một chấm và đường tham chiếu.

#### 12.2.8. Dòng trạng thái

Kết cục của một mức tính từ dữ liệu (`gdOutcome`), không ghi tay:

- `diverged`: đường đi ra khỏi khung ở bước `exitStep`;
- `reached`: có bước đầu tiên `reachStep` với MSE $\le 1.01 \cdot$ MSE nhỏ nhất (`REACH_RATIO`);
- còn lại là `unfinished`, kèm `zigzag` = ($\eta L > 1$).

Dòng trạng thái là một `p`, giữ chỗ 1 dòng:

| Lúc | Chữ |
|---|---|
| Bước 0 | `hint` |
| Từ `reachStep` trở đi | `reached` ("Ở bước 69, MSE đã nằm trong 1% của mức nhỏ nhất.") |
| Tới `exitStep` | `diverged` (có `{{limit}}` = 0.815) |
| Tới bước 100, kết cục `unfinished` | `notYet`, nối thêm `zigzagNote` (mức 0.8) hoặc `slowNote` (mức 0.05) |
| Giữa chừng | trống (vẫn giữ chỗ) |

Năm mức ra năm câu khác nhau: 0.05 chưa tới, đi chậm; 0.3 tới ở bước 69; 0.7 tới ở bước 29; 0.8 chưa tới, zigzag; 0.85 phân kỳ ở bước 4.

### 12.3. Cấu trúc file

```
scripts/
└─ gradient-descent-fixture.py         # new (D0): exact GD paths (Fraction), writes the fixture below
src/
├─ data/datasets/
│  └─ apartments.ts                    # D0: + APARTMENTS_GD (config); L: + 'ml/gradient-descent' in lessons
├─ lib/viz/
│  ├─ gradient-descent.ts              # new (D0), pure: minMaxOf, scaleRows, toOriginal, gradient, hessian,
│  │                                   #   gdPath, gdOutcome, unitCircle, contour
│  └─ scale.ts                         # D0: + detLog10
├─ components/viz/
│  ├─ viz.css                          # D1: + equal shape, .atlas-viz-level, .atlas-viz-path, .atlas-viz-step (12.4.6)
│  ├─ GradientDescentViz.astro         # new (D1): wrapper
│  ├─ gradient-descent-viz/
│  │  └─ GradientDescentVizIsland.tsx  # new (D1)
│  ├─ linear-fit-viz/LinearFitVizIsland.tsx   # D0: imports CrossMark from the kit (no behaviour change)
│  └─ kit/
│     ├─ PlotFrame.tsx                 # D0: shape 'equal', optional yTickLabels
│     └─ CrossMark.tsx                 # new (D0): moved from LinearFitVizIsland, drawn with AtPoint
├─ i18n/ui.ts, content/i18n/{vi,en}.json   # D1: namespace vizGradientDescent, 39 keys (12.4.7)
└─ code/ml/gradient-descent/           # lesson-writer: 3 cells .{vi,en}.py with "# dataset: apartments"
tests/unit/
├─ gradient-descent.test.ts            # new (D0): math by hand, no real data; scans for forbidden Math calls
├─ gradient-descent-apartments.test.ts # new (D0): config, fixture, the story of 12.2.3
└─ fixtures/gradient-descent-python.ts # new (D0), GENERATED by the script
tests/e2e/
└─ viz.spec.ts                         # D2 (tester): measureContrast learns the new marks
```

### 12.4. Giao diện

#### 12.4.1. Toán: `src/lib/viz/gradient-descent.ts`

```ts
// Pure, relative imports only. Only + − × ÷, Math.sqrt, Math.abs (section 9.2.2).
import type { Row } from '../../data/datasets/types';
import type { Line, Point, SliderSpec } from './linear-fit';
import type { Domain } from './scale';

export const REACH_RATIO = 1.01;

/** x̃ = (x − min) / range, range = max − min over the rows (min-max scaling, section 12.2.1). */
export interface MinMax { min: number; range: number }
/** Parameters of ŷ = w̃ x̃ + b̃ on the scaled feature. */
export interface Params { w: number; b: number }

export interface GradientDescentConfig {
  start: Params;                                  // { w: 0, b: 0 }
  levels: readonly number[];                      // η: [0.05, 0.3, 0.7, 0.8, 0.85], increasing
  slider: SliderSpec;                             // { min: 0, max: 4, step: 1, initial: 1 }: an index into levels
  maxSteps: number;                               // 100
  wDomain: Domain; bDomain: Domain;               // [-10, 22], [-4, 20]: 4 : 3, same unit (shape 'equal')
  wTicks: readonly number[]; bTicks: readonly number[];
  contourLevels: readonly number[];               // MSE: [0.5, 1, 2, 5, 10, 20, 50, 100, 200]
  contourHalf: number;                            // 24: points per half circle = contourHalf + 1
  stepTicks: readonly number[];                   // [0, 25, 50, 75, 100]; the step domain is [0, maxSteps]
  logMseDomain: Domain;                           // [-1, 3]
  logMseTicks: readonly number[];                 // [-1, 0, 1, 2, 3], shown as 0.1 … 1000
  digits: { eta: number; params: number; w: number; b: number; mse: number; mseLarge: number; limit: number };
}                                                 // { 2, 2, 4, 2, 4, 2, 3 }

export function minMaxOf(rows: readonly Row[]): MinMax;            // throws when every x is the same
export function scaleRows(rows: readonly Row[], s: MinMax): Row[]; // [(x − min) / range, y]
/** w = w̃ / range, b = b̃ − w · min (back to the lesson's ŷ = w x + b). */
export function toOriginal(p: Params, s: MinMax): Line;
/** (2/m) Σ x̃ r and (2/m) Σ r with r = w̃ x̃ + b̃ − y, summed in row order (section 12.2.4). */
export function gradient(rows: readonly Row[], p: Params): Params;
/** H = (2/m) [Σx̃², Σx̃; Σx̃, m] and its eigenvalues (closed form for 2 × 2, sqrt only). */
export function hessian(rows: readonly Row[]): { h11: number; h12: number; h22: number; L: number; mu: number };

export interface GdPath {
  eta: number;
  points: Params[];          // points[0] = start; at most maxSteps + 1; ends at exitStep when it leaves the box
  mse: number[];             // mse[k] of points[k], by mse() of linear-fit.ts on the scaled rows
  reachStep: number | null;  // first k with mse[k] ≤ REACH_RATIO · best
  exitStep: number | null;   // first k with points[k] outside wDomain × bDomain
}
export function gdPath(rows: readonly Row[], eta: number, best: number, config: GradientDescentConfig): GdPath;

export type GdOutcome =
  | { kind: 'reached'; step: number }
  | { kind: 'diverged'; step: number }
  | { kind: 'unfinished'; zigzag: boolean }; // zigzag: η L > 1
export function gdOutcome(path: GdPath, L: number): GdOutcome;

/** Closed unit circle by the rational parametrisation ((1 − t²)/(1 + t²), 2t/(1 + t²)); 2·half + 1 points. */
export function unitCircle(half: number): Point[];
/** The level curve MSE = level around the least-squares point (Cholesky of H/2, section 12.2.5). Throws when level ≤ best. */
export function contour(rows: readonly Row[], best: Params & { mse: number }, level: number, circle: readonly Point[]): Point[];
```

Trong `scale.ts`: `export function detLog10(v: number): number;` (mục 12.2.6).

#### 12.4.2. Cấu hình: `APARTMENTS_GD` (trong `apartments.ts`)

```ts
export const APARTMENTS_GD: GradientDescentConfig = {
  start: { w: 0, b: 0 },
  levels: [0.05, 0.3, 0.7, 0.8, 0.85],
  slider: { min: 0, max: 4, step: 1, initial: 1 },
  maxSteps: 100,
  wDomain: [-10, 22], bDomain: [-4, 20],
  wTicks: [-10, -5, 0, 5, 10, 15, 20], bTicks: [0, 5, 10, 15, 20],
  contourLevels: [0.5, 1, 2, 5, 10, 20, 50, 100, 200],
  contourHalf: 24,
  stepTicks: [0, 25, 50, 75, 100],
  logMseDomain: [-1, 3], logMseTicks: [-1, 0, 1, 2, 3],
  digits: { eta: 2, params: 2, w: 4, b: 2, mse: 4, mseLarge: 2, limit: 3 },
};
```

**Ràng buộc** (`gradient-descent-apartments.test.ts`):

- `levels` tăng ngặt, `slider.max === levels.length − 1`;
- khung đúng 4 : 3: `(w1 − w0) * 3 === (b1 − b0) * 4`;
- `start` nằm trong khung, mọi vạch chia nằm trong miền;
- `contourLevels` tăng dần và đều lớn hơn MSE nhỏ nhất;
- `minMaxOf(APARTMENTS.rows)` là `{ min: 25, range: 60 }`.

#### 12.4.3. Kit: phần thêm

```tsx
// kit/PlotFrame.tsx — two optional props; everything else unchanged
shape?: 'default' | 'short' | 'equal';  // 'equal': 4 : 3 at every width, for axes in the same unit (12.2.5)
yTickLabels?: readonly string[];        // shown instead of formatNumber(tick); same length as yTicks (a log axis)

// kit/CrossMark.tsx — moved from LinearFitVizIsland.tsx, now drawn with AtPoint; same DOM as before
export interface CrossMarkProps { x: string; y: string; halo?: boolean } // pct() strings
```

`LinearFitViz` chỉ đổi import. HTML của nó phải giữ nguyên (so `dist/` trước và sau).

#### 12.4.4. `GradientDescentViz`: wrapper và island

```astro
---
// src/components/viz/GradientDescentViz.astro — sketch
import GradientDescentVizIsland from './gradient-descent-viz/GradientDescentVizIsland';
import { APARTMENTS, APARTMENTS_GD } from '@data/datasets/apartments';
// + getStrings(…, 'vizGradientDescent'), getPageLocale, renderInlineMarkup, inlineMarkupLabel
---
<div class="atlas-viz not-content" lang={locale} data-pagefind-ignore>
  <GradientDescentVizIsland client:visible={{ rootMargin: '200px' }} rows={APARTMENTS.rows} config={APARTMENTS_GD}
    labels={{ etaHtml: renderInlineMarkup(strings.etaLabel), etaText: inlineMarkupLabel(strings.etaLabel) }}
    strings={strings} />
  <noscript><p class="atlas-viz-noscript">{tCommon.needsScript}</p></noscript>
</div>
```

```ts
// src/components/viz/gradient-descent-viz/GradientDescentVizIsland.tsx
export interface GradientDescentVizIslandProps {
  rows: readonly Row[];                          // APARTMENTS.rows, raw (m², million VND/month)
  config: GradientDescentConfig;
  labels: { etaHtml: string; etaText: string };  // KaTeX of "η" only; w̃, b̃, ŷ are Unicode in the strings
  strings: UiStrings<'vizGradientDescent'>;
}
// Memo once: s = minMaxOf(rows); scaled = scaleRows(rows, s); best = fitLeastSquares(scaled); h = hessian(scaled);
//   circle = unitCircle(config.contourHalf); contours = contourLevels.map(l => toPolyline(contour(…), wDomain, bDomain));
//   paths = levels.map(eta => gdPath(scaled, eta, best.mse, config)); outcomes = paths.map(p => gdOutcome(p, h.L)).
// State: level = slider.initial, step = 0, running = false, live = ''. hydrated = useHydrated().
// Every render: path = paths[level]; shown = path.points.slice(0, step + 1); p = shown[step]; line = toOriginal(p, s).
// Effect on running: requestAnimationFrame loop, one step per STEP_MS = 60; stops at path.points.length − 1.
// Live: useSettled(level) → announceEta; buttons speak at once; the end of a run speaks the status sentence.
```

Không truyền tên trục, đơn vị hay mô tả của dataset. Trục là $\tilde{w}$, $\tilde{b}$ (chuỗi giao diện), mô tả do chuỗi `mapDesc` ghép số.

#### 12.4.5. Hành vi và bố cục

Thứ tự từ trên xuống, giữ nguyên trên điện thoại:

1. **Chú thích** (`figcaption`): `caption`, có `{{limit}}` = 0.815.
2. **Bản đồ đường mức** (`PlotFrame shape="equal"`, trục `wAxis`, `bAxis`, `aria-label` = `mapLabel`, mô tả = `mapDesc`). Vẽ từ dưới lên:
   - 9 đường mức: `PlotCurve` lớp `atlas-viz-level`;
   - đường đi từ bước 0 tới bước hiện tại: `PlotCurve` lớp `atlas-viz-path`. Luôn có trong DOM; ở bước 0 là polyline một điểm;
   - chấm các bước $1..k-1$ còn trong khung: `circle.atlas-viz-step`, $r = 3$;
   - dấu × ở đáy: `CrossMark` có quầng;
   - điểm bắt đầu: `circle.atlas-viz-ring`, $r = 6$;
   - vị trí hiện tại (khi $k \ge 1$ và còn trong khung): `circle.atlas-viz-point`, $r = 6$, nằm trên cùng.
3. **Chú giải** (`ul.atlas-viz-key`, 5 mục): ─ `levels` (mẫu `atlas-viz-level`); ─● `path` (mẫu `atlas-viz-path` có chấm `step`); ○ `start`; ● `current`; × `best`.
4. **Điều khiển** (`role="group"`, `aria-label` = `controls`): `VizSlider` cho $\eta$ (`display` = `formatNumber(η, 2)`, `aria-valuetext` = `etaValueText`), rồi `div.atlas-viz-choice` với ba nút (mục 12.2.7).
5. **Dòng số** (`.atlas-viz-readouts`, 4 dòng):
   - `stepsDone`: "41 / 100", ô mẫu trống;
   - `mse`: mẫu `atlas-viz-series`, số theo `formatMse`;
   - `params`: "(10.17, 6.28)", mẫu `DotSwatch` `atlas-viz-point`;
   - `original`: "ŷ = 0.1695x + 2.04", ô mẫu trống, ghép bằng `lineParts`.
6. **Biểu đồ MSE** (`PlotFrame shape="short"`, trục `stepAxis`, `mseAxis`, `yTickLabels` = `['0.1', '1', '10', '100', '1000']`, `aria-label` = `chartLabel`, mô tả = `chartDesc`): `line.atlas-viz-reference` ở MSE nhỏ nhất, `PlotCurve` lớp `atlas-viz-series`, `circle.atlas-viz-point` $r = 4$ ở bước hiện tại.
7. **Chú giải biểu đồ** (1 mục): mẫu `atlas-viz-reference` + `bestLine`.
8. **Dòng trạng thái** (mục 12.2.8).
9. Phần ẩn: hai mô tả `sr-only`, vùng live.

**Số phần tử lúc tải** (mức 0.3, bước 0), đếm trong từng `.atlas-viz-plot`:

| Vùng vẽ | `polyline.atlas-viz-level` | `polyline.atlas-viz-path` | `circle.atlas-viz-step` | `circle.atlas-viz-ring` | `circle.atlas-viz-point` | `line.atlas-viz-marker` | `polyline.atlas-viz-series` | `line.atlas-viz-reference` |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Bản đồ | 9 | 1 | 0 | 1 | 0 | 2 | 0 | 0 |
| Biểu đồ MSE | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 1 |

Ở bước 100 của mức 0.3, bản đồ có 99 `circle.atlas-viz-step` và 1 `circle.atlas-viz-point`. Mức 0.85 ở bước 4 có 3 `circle.atlas-viz-step` (bước 1–3) và không có `circle.atlas-viz-point` trên bản đồ, vì bước 4 đã ra ngoài khung.

**Chống xê dịch:** dòng số có độ rộng cố định (`tabular-nums`) và số dòng không đổi. Dòng trạng thái ở cuối. Nhãn Chạy/Dừng đổi độ rộng, nhưng nút đó đứng cuối hàng.

#### 12.4.6. `viz.css`: phần thêm và tương phản

| Thêm | Khai báo | Dùng cho |
|---|---|---|
| `.atlas-viz-chart[data-shape='equal'] .atlas-viz-plot` | `aspect-ratio: 4 / 3` | Thắng `aspect-ratio: 3 / 2` của container query nhờ độ đặc hiệu cao hơn, không cần lặp trong `@container` |
| `.atlas-viz-level` | nét `--atlas-viz-level` (biến vai trò mới, `--sl-color-gray-4`), `stroke-width: 1.5px` | Đường mức: xám, liền, mảnh, không nổi hơn đường đi. Ban đầu dùng `--atlas-viz-muted` (`gray-3`), nhưng analyst đo được accent so với `gray-3` chỉ 1.18 (tối) / 1.07 (sáng): đường đi lẫn vào đường mức. Đổi sang `gray-4` (quyết định của phiên chính sau review D1) |
| `.atlas-viz-path` | nét `--atlas-viz-primary`, `stroke-width: 2px` | Đường đi GD. Mảnh hơn `atlas-viz-primary` (3px), vì zigzag dày |
| `.atlas-viz-step` | `fill: var(--atlas-viz-primary)` | Chấm mỗi bước, cùng màu đường đi |

- Ước tính thêm khoảng 120 byte gzip (đã bỏ comment). `viz.css` từ 1 732 (đo 24/10/2026) lên khoảng 1 850 byte, tức 72% ngân sách 2 560.
- **Một cặp màu mới: đường mức `gray-4`.** Tương phản (tối / sáng): đường mức trên nền vùng vẽ 3.37 / 3.72 (đạt ≥ 3); đường đi (`accent`) so với đường mức 2.20 / 1.72. Hai nét còn khác nhau về hình (mức 1.5px không chấm, đường đi 2px có chấm), nên không cần cặp này đạt 3. Trên nền khung VIZ (`gray-6`), `gray-4` chỉ đạt 2.90 (tối) / 2.98 (sáng) (`viz.spec.ts` bắt được ở mẫu chú giải), nên mẫu "Đường mức" vẽ trên một ô nền vùng vẽ: `Swatch onPlot`, lớp `.atlas-viz-swatch-plot`. Các màu còn lại trên nền vùng vẽ: `accent` 7.42 / 6.42, `gray-3` 6.28 / 6.89, `white` 14.00 / 15.61, `blue-high` 9.24 / 11.68 (mục 4.9 và 9.4.7).
- Mỗi loại nét khác nhau cả về hình: đường mức xám 1.5px không chấm; đường đi màu nhấn 2px có chấm; điểm bắt đầu là vòng rỗng; vị trí hiện tại là chấm đặc to có viền; đáy là dấu ×; đường tham chiếu nét đứt.

#### 12.4.7. Chuỗi `vizGradientDescent` (39 key)

Key thứ 39, `lineFormula`, thêm sau review D1 để island không viết cứng "ŷ" và "x": vi và en đều là `ŷ = {{w}}x {{sign}} {{b}}`, điền bằng `lineParts`.

| Key | vi | en |
|---|---|---|
| `caption` | Mỗi bước đi ngược hướng gradient của MSE. Chọn tốc độ học η rồi bấm Bước hoặc Chạy. Diện tích đã chuẩn hóa về [0, 1], nên hai trục là w̃ và b̃. Với dữ liệu này, 2/L ≈ {{limit}}. | Each step goes against the gradient of the MSE. Pick a learning rate η, then press Step or Run. Floor area is scaled to [0, 1], so the axes are w̃ and b̃. For this data, 2/L ≈ {{limit}}. |
| `mapLabel` | Bản đồ đường mức của MSE theo w̃ và b̃, cùng đường đi của gradient descent với η = {{eta}} sau {{step}} bước. | Contour map of the MSE over w̃ and b̃, with the gradient descent path for η = {{eta}} after {{step}} steps. |
| `mapDesc` | Các đường mức là những elip dẹt, nghiêng, cùng tâm ở đáy ({{w}}, {{b}}), nơi MSE nhỏ nhất bằng {{best}}. Đường đi bắt đầu ở (0, 0), nơi MSE bằng {{start}}. | The contours are long, tilted ellipses around the bottom ({{w}}, {{b}}), where the MSE is smallest, {{best}}. The path starts at (0, 0), where the MSE is {{start}}. |
| `wAxis` | w̃ | w̃ |
| `bAxis` | b̃ | b̃ |
| `levels` | Đường mức của MSE | MSE contour |
| `path` | Đường đi của gradient descent | Gradient descent path |
| `start` | Điểm bắt đầu (0, 0) | Start (0, 0) |
| `current` | Vị trí hiện tại | Current position |
| `best` | Đáy (phương trình chuẩn) | Bottom (normal equation) |
| `controls` | Chọn tốc độ học và chạy | Choose the learning rate and run |
| `etaLabel` | Tốc độ học $\eta$ | Learning rate $\eta$ |
| `etaValueText` | η bằng {{value}} | η equals {{value}} |
| `step` | Bước | Step |
| `reset` | Đặt lại | Reset |
| `run` | Chạy | Run |
| `stop` | Dừng | Stop |
| `stepsDone` | Số bước | Steps |
| `mse` | MSE | MSE |
| `params` | (w̃, b̃) | (w̃, b̃) |
| `original` | Đổi về đơn vị gốc | In the original units |
| `stepAxis` | Số bước | Steps |
| `mseAxis` | MSE (thang log) | MSE (log scale) |
| `chartLabel` | Biểu đồ MSE theo số bước, trục MSE theo thang log. Sau {{step}} bước, MSE bằng {{mse}}. | MSE by step, on a log scale. After {{step}} steps, the MSE is {{mse}}. |
| `chartDesc` | Đường đứt là MSE nhỏ nhất, {{best}}. Mỗi vạch trên trục MSE lớn gấp 10 lần vạch ngay dưới nó. | The dashed line is the smallest MSE, {{best}}. Each mark on the MSE axis is 10 times the one below it. |
| `bestLine` | MSE nhỏ nhất ({{best}}) | Smallest MSE ({{best}}) |
| `hint` | Bấm Bước để đi một bước, hoặc Chạy để đi tối đa {{max}} bước. | Press Step for one step, or Run for up to {{max}} steps. |
| `reached` | Ở bước {{step}}, MSE đã nằm trong 1% của mức nhỏ nhất. | At step {{step}}, the MSE is within 1% of the smallest. |
| `notYet` | Sau {{max}} bước, MSE vẫn còn {{mse}}, chưa tới gần đáy. | After {{max}} steps, the MSE is still {{mse}}, not near the bottom yet. |
| `slowNote` | η nhỏ nên mỗi bước rất ngắn. | η is small, so every step is short. |
| `zigzagNote` | η gần ngưỡng 2/L ≈ {{limit}} nên đường đi nhảy qua lại hai bên thung lũng. | η is close to 2/L ≈ {{limit}}, so the path jumps back and forth across the valley. |
| `diverged` | Phân kỳ: η lớn hơn 2/L ≈ {{limit}}, MSE tăng sau mỗi bước, và đường đi văng ra khỏi khung ở bước {{step}}. | Diverging: η is above 2/L ≈ {{limit}}; the MSE grows with every step, and the path leaves the map at step {{step}}. |
| `announceStep` | Bước {{step}}: MSE {{mse}}. | Step {{step}}: MSE {{mse}}. |
| `announceEta` | η = {{eta}}. Đã về điểm bắt đầu. | η = {{eta}}. Back at the start. |
| `running` | Đang chạy. | Running. |
| `stopped` | Đã dừng ở bước {{step}}: MSE {{mse}}. | Stopped at step {{step}}: MSE {{mse}}. |
| `atEnd` | Đã ở bước cuối. Bấm Chạy để chạy lại từ đầu. | This is the last step. Press Run to start again. |
| `resetDone` | Đã về điểm bắt đầu. | Back at the start. |

- Định dạng số: $\eta$ là `formatNumber(·, 2)`; bước là `formatNumber(·, 0)`; MSE là `formatMse`; $\tilde{w}$, $\tilde{b}$ 2 chữ số; $w$ 4 và $b$ 2 chữ số (`lineParts`); `{{limit}}` = `formatNumber(2 / L, 3)` = `0.815`.
- "w̃", "b̃" là chữ cộng U+0303 (dấu ngã kết hợp). Tập con `vietnamese` của Barlow có U+0303 (đã đọc `unicode-range` trong `@fontsource/barlow/400.css`). "ŷ" (U+0177) có trong `latin-ext`. "η" không có trong Barlow, nên rơi về font dự phòng, như "λ" của mục 10. Chỉ `etaLabel` đi qua KaTeX.
- "Gradient descent" giữ tiếng Anh theo glossary; "tốc độ học" theo CLAUDE.md.

#### 12.4.8. Hợp đồng với `lesson-writer` (bài `ml/gradient-descent`)

1. **Ký hiệu và công thức:**
   - MSE hệ số $\frac{1}{m}$, gradient $\frac{2}{m}\mathbf{X}^\top(\mathbf{X}\boldsymbol{\theta} - \mathbf{y})$; nhắc lại hai đạo hàm riêng của bài trước.
   - Cập nhật $\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \eta\nabla\mathcal{L}$. $L$ là trị riêng lớn nhất của Hessian $\frac{2}{m}\mathbf{X}^\top\mathbf{X}$.
   - Chuẩn hóa min-max $\tilde{x} = (x - 25)/60$, mô hình $\hat{y} = \tilde{w}\tilde{x} + \tilde{b}$, đổi về $w = \tilde{w}/60$, $b = \tilde{b} - 25w$ (mục 12.2.1). Nêu nghĩa của $\tilde{b}$ và $\tilde{w}$.
   - Nhắc z-score (`StandardScaler`) là cách chuẩn hóa phổ biến khác, làm bát tròn hẳn.
2. **Ngưỡng $2/L$:** theo phép suy ra một chiều và bảng $f(w) = w^2$ ở mục 12.2.2, rồi một đoạn nối sang hai chiều. Số dùng: $L = 2.4533$, $2/L \approx 0.815$, $\kappa \approx 15$ (min-max), so với $\kappa \approx 27\,200$ và $2/L \approx 3.2 \times 10^{-4}$ (dữ liệu thô). Nguồn chỉ trích sau khi `summarizer` xác minh (mục 12.2.2).
3. **Dữ liệu:** dấu `# dataset: apartments` như bài trước. Thêm `'ml/gradient-descent'` vào `APARTMENTS.lessons`.
4. **Ba ô code** (`src/code/ml/gradient-descent/`), đã chạy với `-W error`, không có cảnh báo:
   - **Ô 1, GD tự viết so với phương trình chuẩn.** `x = (area - area.min()) / (area.max() - area.min())`, `X = np.column_stack([x, np.ones(m)])`, `theta = np.zeros(2)`, $\eta = 0.3$. Vòng lặp tối đa 10 000 bước, dừng khi `np.linalg.norm(grad) < 1e-6` (tiêu chí dừng). Kết quả in ra:
     - dừng sau **282** bước;
     - $\tilde{w}$ = **10.1686**, $\tilde{b}$ = **6.2763**;
     - đổi về $w$ = **0.1695**, $b$ = **2.0394**, MSE **0.3615**;
     - phương trình chuẩn trên dữ liệu thô: 0.1695, 2.0394, 0.3615.

     Chuẩn gradient ở bước 281 là $1.013 \times 10^{-6}$, ở bước 282 là $0.964 \times 10^{-6}$: số bước không nhạy với sai số làm tròn.
   - **Ô 2, vài $\eta$, có và không chuẩn hóa, vẽ MSE theo bước** (`plt.yscale('log')`, như VIZ). In MSE sau 100 bước bằng `f"{v:.4f}" if v < 1e4 else f"{v:.3e}"`.
     - Đã chuẩn hóa, $\eta$ = 0.05, 0.3, 0.7, 0.8, 0.85: **1.0023, 0.3617, 0.3615, 0.4240, 1.635e+09**.
     - Dữ liệu thô ($2/L = 3.226 \times 10^{-4}$): $\eta = 3 \times 10^{-4}$ sau 100 bước **0.8273**, sau 10 000 bước **0.4819**. Cần 35 650 bước mới vào 1% của đáy, so với 69 bước khi đã chuẩn hóa với $\eta = 0.3$. $\eta = 3.3 \times 10^{-4}$ sau 100 bước: **9.987e+05**.
     - Chạy $\eta$ phân kỳ **chỉ 100 bước**. Chạy lâu hơn thì tràn số và NumPy báo `RuntimeWarning`.
   - **Ô 3, SGD / mini-batch và `SGDRegressor`.**
     - (a) NumPy, hàm `minibatch_gd(batch_size, eta=0.1, epochs=100, seed=0)`, với `rng = np.random.default_rng(seed)`. Mỗi epoch lấy `rng.permutation(m)` rồi chia bằng `np.array_split(…, m // batch_size)`. Kết quả (MSE, $w$, $b$): batch 10 (tức GD, 100 cập nhật) **0.4885, 0.1507, 3.07**; batch 2 (500 cập nhật) **0.3632, 0.1696, 2.08**; batch 1 (SGD, 1 000 cập nhật) **0.3766, 0.1698, 2.15**. Batch 1 cập nhật nhiều hơn nhưng nhiễu hơn.
     - (b) `SGDRegressor(random_state=0)` mặc định trên `area` thô **phân kỳ mà không báo gì**: MSE **3.6e+24** (in bằng `:.1e`), `n_iter_` = 6. Giá trị mặc định (đã đọc `get_params()`): `penalty='l2'`, `alpha=0.0001`, `learning_rate='invscaling'`, `eta0=0.01`, `tol=1e-3`.
     - (c) `make_pipeline(MinMaxScaler(), SGDRegressor(penalty=None, learning_rate='constant', eta0=0.05, max_iter=1000, tol=None, random_state=0))`: MSE **0.3615**, $w$ **0.1692**, $b$ **2.05**, `n_iter_` = 1000. Không có `ConvergenceWarning`, vì `tol=None` thì không kiểm tra hội tụ. Đổi hệ số: `w = coef_[0] * scaler.scale_[0]`, `b = intercept_[0] + coef_[0] * scaler.min_[0]`. $b$ lệch 0.01 so với 2.04 vì $\eta$ cố định làm SGD nhảy quanh đáy: bài cần một câu về việc này.
     - Đối chiếu cho "Lỗi hay gặp": tham số mặc định với `MinMaxScaler` dừng sớm ở MSE 1.3669; với `StandardScaler` dừng sớm ở 0.4160. Cả hai do `tol=1e-3`.
5. **Số trong lời văn** lấy từ bảng 12.2.3 và các ô code. Dùng dấu chấm thập phân (quyết định 22).
6. **Chỗ đặt VIZ** (mục Minh họa). Comment giữ chỗ:

   ```mdx
   {/* VIZ: GradientDescentViz
       Ý: η nhỏ đi chậm, η vừa tới đáy nhanh, η gần 2/L nhảy qua lại, η > 2/L phân kỳ.
       Tương tác: thanh trượt η (0.05, 0.30, 0.70, 0.80, 0.85); nút Bước, Đặt lại, Chạy/Dừng.
       Dữ liệu: apartments, diện tích chuẩn hóa min-max; bắt đầu từ (0, 0); tối đa 100 bước.
       Ký hiệu: w̃, b̃, η, L, MSE (như mục Lý thuyết). */}
   ```

   Ở D1, `viz-builder` thay bằng `{/* VIZ: mỗi bước đi ngược gradient; η quyết định đi chậm, tới nhanh, nhảy qua lại hay văng ra ngoài. */}` rồi `<GradientDescentViz />`. Lời dẫn gợi ý thứ tự thử 0.30 → 0.05 → 0.70 → 0.80 → 0.85, kèm số ở bảng 12.2.3.
7. **Glossary:** tốc độ học (learning rate), chuẩn hóa min-max (min-max scaling), đường mức (contour line, level curve), số điều kiện (condition number) nếu dùng, epoch, mini-batch, phân kỳ (diverge), hội tụ (converge), tiêu chí dừng (stopping criterion).

#### 12.4.9. Ngân sách

| Mục | Giới hạn (mục 2.9) | Dự kiến | Đo ở D1 (24/10/2026, trang tạm) |
|---|---|---|---|
| Gói npm mới | 0 | 0 | 0 |
| JS riêng của `GradientDescentVizIsland` | ≤ 10 KB gzip | Khoảng 5–6 KB: island khoảng 4.5 KB (hoạt ảnh, 3 nút, 2 đồ thị), `gradient-descent.ts` khoảng 0.8 KB. `linear-fit.ts`, `poly-fit.ts` (`toPolyline`, `formatMse`) và kit dùng chung với VIZ khác, nên không tính | 3 528 byte gzip (9 246 thô), đã gồm `gradient-descent.ts`; kit, `format`, `poly-fit` ở các chunk dùng chung |
| `props` | ≤ 8 KB | Khoảng 5.5 KB: 38 chuỗi khoảng 4 KB, KaTeX của "η" khoảng 0.4 KB, 10 hàng 0.2 KB, cấu hình khoảng 0.6 KB | 5 409 byte (thuộc tính `props` trong HTML, đã escape) |
| `viz.css` | ≤ 2 560 byte gzip, bỏ comment | Khoảng 1 850 (72%) | 1 791 byte (70%) |
| HTML dựng sẵn | | 9 đường mức khoảng 5.3 KB (49 điểm × 9), cộng khung; khoảng 2 KB gzip | Cả khối `.atlas-viz` (hai đồ thị, chú giải, điều khiển, dòng số, `props`): 27 980 byte, 8 511 gzip |
| Tính toán | | Lúc mount: 5 đường đi × 100 bước × 10 hàng và 9 elip × 49 điểm, dưới 1 ms. Mỗi khung hình khi chạy: vẽ lại một polyline tới 101 điểm và tới 99 chấm | Chạy 100 bước ở mức 0.30: 6.1 giây khi trình duyệt vẽ đủ 60 khung/giây (Chromium headless). Khi rớt khung thì chậm hơn (7.4 giây ở 49 khung/giây), vì mỗi khung tăng tối đa 1 bước, không dồn bước |
| Chiều cao ở 375px | | Khoảng 1 150–1 250px (`PolyFitViz` 1 081px): bản đồ 4 : 3, chú giải 5 mục, 3 nút, 4 dòng số, biểu đồ MSE, dòng trạng thái 2–3 dòng. Không đổi khi chạy, trừ dòng trạng thái ở cuối | 1 197px, bản đồ 267 × 200, không cuộn ngang. Máy tính 1280px: 1 355px, bản đồ 548 × 411 |

### 12.5. Phụ thuộc

Không thêm gói npm. Script và fixture dùng venv mục 2.5 (NumPy) và thư viện chuẩn `fractions`. Không cài gì thêm vào venv.

### 12.6. Các bước thực hiện

Mỗi bước của `viz-builder` kết thúc bằng `npm run build` (không `[WARN]`), `npm run check` (0 lỗi 0 cảnh báo) và `npm test`.

**Thứ tự:** D0 → L → `content-reviewer` (bài thành `published`) → D1 → D2 → D3 → D4. D0 và L cùng sửa `apartments.ts` (hai chỗ khác nhau: D0 thêm `APARTMENTS_GD`, L thêm một id vào `lessons`), nên gọi lần lượt, không song song. Làm D0 trước còn có lợi: L trích số từ fixture thay vì từ tài liệu này.

| # | Agent | Việc | Tiêu chí hoàn thành |
|---|---|---|---|
| D0 | `viz-builder` | **Toán, kit, fixture.** Viết `gradient-descent.ts` (12.4.1), `detLog10` trong `scale.ts`, `APARTMENTS_GD` (12.4.2). Kit: `shape="equal"` và `yTickLabels` cho `PlotFrame`; chuyển `CrossMark` vào kit. Viết `scripts/gradient-descent-fixture.py`: đường đi chính xác bằng `Fraction` cho 5 mức (tới 100 bước hoặc tới khi ra khỏi khung), đáy, $L$, $\mu$; ghi `tests/unit/fixtures/gradient-descent-python.ts` (lệnh, phiên bản, ngày, bản sao `rows`, MSE từng bước, `reachStep`, `exitStep`, điểm cuối), và tự đối chiếu với NumPy. Viết `gradient-descent.test.ts` và `gradient-descent-apartments.test.ts` | **`gradient-descent.test.ts`** (không dùng dữ liệu thật): `minMaxOf`, `scaleRows`, `toOriginal` trên 3 điểm tính tay, và `toOriginal` đúng là phép đổi ngược; `gradient` khớp tính tay trên 2 điểm và bằng 0 tại nghiệm `fitLeastSquares`; `hessian` trên một bộ dữ liệu z-score tự chế cho $\mathbf{H} = 2\mathbf{I}$, $L = \mu = 2$, và $L \ge \mu > 0$ trên bộ khác; `gdPath` trên $y = 2\tilde{x} + 1$ hội tụ khi $\eta < 2/L$, có `exitStep` khi $\eta > 2/L$, và tới đáy sau 1 bước khi $\eta = 1/L$ trên dữ liệu z-score; `unitCircle(24)` có 49 điểm, $\lvert u\rvert = 1$ trong $10^{-15}$, điểm đầu trùng điểm cuối; `contour` cho MSE bằng `level` trong $10^{-12}$ (tương đối) tại mọi điểm, throw khi `level ≤ best`; `detLog10` lệch `Math.log10` dưới $10^{-12}$ trên 1 000 giá trị từ $10^{-3}$ tới $10^{9}$, đúng tuyệt đối tại $10^k$, throw khi $v \le 0$; quét nguồn `gradient-descent.ts` và thân `detLog10`: không có `**`, `Math.pow`, `Math.hypot`, `Math.exp`, `Math.log*`, `Math.sin`, `Math.cos`, `Math.atan*`. **`gradient-descent-apartments.test.ts`:** ràng buộc 12.4.2; bản sao `rows` trong fixture bằng `APARTMENTS.rows`; đáy khớp fixture, đổi về ra `0.1695`, `2.04`, `0.3615`; $L$, $\mu$ khớp trong $10^{-12}$, `formatNumber(2 / L, 3)` = `0.815`; với 5 mức và mọi bước: MSE khớp trong $10^{-12} \cdot \max(1, \lvert v\rvert)$, chuỗi `formatMse` bằng nhau, chuỗi $\tilde{w}$, $\tilde{b}$, $w$, $b$ bằng nhau; `reachStep` = [null, 69, 29, null, null], `exitStep` = [null, null, null, null, 4]; `gdOutcome` ra đúng 5 kết cục ở 12.2.8; đường đi của 4 mức đầu nằm trong khung. **`LinearFitViz`:** HTML trong `dist/` không đổi, `linear-fit-viz.spec.ts` vẫn qua |
| L | `lesson-writer` | Theo mục 12.4.8: viết bài vi, 3 ô code, comment giữ chỗ VIZ, thêm bài vào `APARTMENTS.lessons` | `datasets.test.ts` qua với 6 file `.py`. Output ô 1–3 khớp 12.4.8 ý 4, chạy bằng venv mục 2.5 với `-W error`. `content-reviewer` đã duyệt |
| D1 | `viz-builder` | **CSS, chuỗi, VIZ.** Phần thêm của `viz.css` (12.4.6). 38 key `vizGradientDescent` vào `ui.ts`, `vi.json`, `en.json`. Wrapper và island (12.4.4–12.4.5; hành vi 12.2.7–12.2.8). Thay comment giữ chỗ. Tự xem trên `npm run preview` ở 375px và máy tính, sáng và tối, và khi bật `prefers-reduced-motion` (DevTools). Chỉ chạy khi không có agent khác đang build hay chạy e2e | `viz-conventions.test.ts`, `i18n.test.ts` qua. `dist/vi/ml/gradient-descent/index.html` có đúng một `.atlas-viz`, island còn `ssr`; số phần tử đúng bảng 12.4.5; dòng số hiện `0 / 100`, `129.75`, `(0.00, 0.00)`, `ŷ = 0.0000x + 0.00`; caption có `0.815`. Xem tay: mức 0.30 bấm Chạy tới bước 100 trong khoảng 6 giây, dòng trạng thái báo bước 69; mức 0.85 dừng ở bước 4 và báo phân kỳ; mức 0.80 hết 100 bước còn `0.4240`; Bước, Đặt lại, Dừng giữa chừng đúng bảng 12.2.7; đổi η thì về bước 0; khi bật reduced motion, Chạy nhảy thẳng tới cuối; không gì xê dịch trừ dòng trạng thái; console không có lỗi hydrate. Ghi số đo thật vào 12.4.9 |
| D2 | `tester` | **Mở rộng test chung, không viết spec riêng.** Trong `measureContrast`: đo `stroke` của `polyline.atlas-viz-level` và `polyline.atlas-viz-path`, `fill` của `circle.atlas-viz-step`. Thêm `polyline.atlas-viz-path` vào phép thử (4) "control". Kiểm tra các phép thử (3), (4), (6) không treo khi nút Chạy đang chạy hoạt ảnh. Chạy `npm test`, `npm run test:e2e` | `test:e2e` qua ở `desktop` và `mobile` trên `/vi/ml/gradient-descent/`, trên trang fallback `/en/...`, và trên mọi trang VIZ cũ. Thử phá (rồi trả lại): cho `.atlas-viz-level` bằng màu nền vùng vẽ thì test tương phản fail đúng chỗ |
| D3 | `analyst` | Review theo mục 2, 9, 10 và 12 | Báo cáo có số đo: JS riêng gzip, `props`, `viz.css` gzip, HTML của VIZ, chiều cao ở 375px, tương phản đo thật, `package.json` không đổi, Lighthouse mobile của bài. Chạy lại script fixture: `git diff` rỗng |
| D4 | **người dùng** | Duyệt VIZ trên bài thật, cả trên điện thoại thật, cùng lượt duyệt bản vi (quyết định 36) | Đồng ý, hoặc có danh sách chỗ sửa |

Bản en của bài làm sau MVP (quyết định 43). `/en/...` là trang fallback, nên `viz.spec.ts` kiểm chuỗi en ngay từ D2.

### 12.7. Rủi ro và điểm chưa chắc

| # | Rủi ro | Cách xử lý |
|---|---|---|
| 1 | VIZ dùng min-max, trong khi nhiều tài liệu (và hướng dẫn của `SGDRegressor`) khuyên z-score. Người đọc có thể hỏi vì sao | Lời văn nói thẳng: z-score làm bát tròn hẳn ($\kappa = 1$), tốt cho tính toán, nhưng hình sẽ không còn thung lũng để quan sát; min-max vẫn rút $\kappa$ từ 27 215 xuống 15. Câu hỏi 1 |
| 2 | Bản đồ 4 : 3 cao khoảng 500px trên máy tính; VIZ cao khoảng 1 200px trên điện thoại | Thanh trượt và nút nằm ngay dưới bản đồ và chú giải. Nếu thấy quá cao khi duyệt: gom chú giải 5 mục vào 1 hàng; giới hạn `max-width` của bản đồ trên màn rộng (thêm một dòng CSS) |
| 3 | Thang log của biểu đồ MSE lạ với người mới | Tên trục ghi "thang log"; mô tả và lời văn giải thích; ô code 2 vẽ cùng kiểu. Câu hỏi 2 |
| 4 | Chạy 100 bước mất khoảng 6 giây; mức 0.05 trông như "không làm gì" ở nửa sau | Có chủ ý: chậm chính là bài học. Dòng số vẫn đổi. `STEP_MS` dễ đổi |
| 5 | HTML của 9 đường mức khoảng 5.3 KB | Chấp nhận. Nếu `analyst` thấy nặng: giảm còn 7 mức, hoặc 18 điểm mỗi nửa, hoặc phương án C ở 12.2.5 |
| 6 | Ô 3 dùng RNG và `SGDRegressor`; Pyodide (WebAssembly) có thể lệch chữ số cuối so với venv | Số in tối đa 4 chữ số; số khổng lồ in `:.1e`. `content-reviewer` chạy thử trên bản build (PythonRunner) một lần |
| 7 | Nguồn cho điều kiện $\eta < 2/L$ chưa được đọc trong phiên này | `summarizer` xác minh trước khi bài trích. Bài vẫn đứng được nhờ phép suy ra một chiều tự đủ |
| 8 | Nút không bao giờ `disabled`: người đọc bấm Bước ở bước cuối mà không thấy gì đổi | Vùng live và dòng trạng thái báo. Chạy ở bước cuối thì tự chạy lại từ đầu |
| 9 | "w̃" dùng dấu ngã kết hợp; vị trí dấu có thể lệch nếu rơi về font dự phòng | Barlow có U+0303 (tập `vietnamese`). D1 xem tay. Nếu xấu thì đổi ký hiệu (câu hỏi 3) |

#### Câu hỏi cho người dùng

1. **Chuẩn hóa dùng cho VIZ.**
   - **(Recommended)** Min-max: diện tích về $[0, 1]$. Bát elip vừa phải ($\kappa \approx 15$), thấy đủ đi chậm, zigzag, dao động, phân kỳ. $\tilde{b}$ là giá căn 25 m², $\tilde{w}$ là chênh lệch giá giữa căn 85 m² và căn 25 m².
   - z-score (`StandardScaler`): bát tròn, $\eta = 0.5$ tới đáy sau 1 bước, không có zigzag; "dao động" chỉ còn là nhảy qua lại trên một đường thẳng.
   - Chia diện tích cho 100: elip dẹt hơn ($\kappa \approx 47$), tham số khó hiểu hơn.
2. **Trục MSE của biểu đồ nhỏ.**
   - **(Recommended)** Thang log (0.1, 1, 10, 100, 1000): thấy rõ mức chậm chưa tới đáy, khớp ô code 2.
   - Tuyến tính $[0, 140]$: quen hơn, nhưng mọi mức hội tụ trông như đã chạm đáy sau vài bước.
3. **Ký hiệu cho tham số trên dữ liệu đã chuẩn hóa.**
   - **(Recommended)** $\tilde{x}$, $\tilde{w}$, $\tilde{b}$; giữ $w$, $b$ cho đơn vị gốc như bài trước.
   - Dùng $w$, $b$ cho cả hai, kèm ghi chú "trên dữ liệu đã chuẩn hóa". Dễ lẫn với $w = 0.1695$ của bài trước.

**Các lựa chọn tự quyết, đổi lại được sau D4:**

- Tên `GradientDescentViz`, namespace `vizGradientDescent`, file `gradient-descent.ts`, script `scripts/gradient-descent-fixture.py`.
- 5 mức $\eta$: 0.05, 0.3, 0.7, 0.8, 0.85; ban đầu 0.3; bắt đầu từ $(0, 0)$; tối đa 100 bước; "gần đáy" nghĩa là trong 1% của MSE nhỏ nhất.
- Khung $\tilde{w} \in [-10, 22]$, $\tilde{b} \in [-4, 20]$, cùng đơn vị; 9 đường mức từ 0.5 tới 200; khi phân kỳ thì dừng ở bước đầu tiên ra khỏi khung.
- Hoạt ảnh bằng `requestAnimationFrame`, 60 ms một bước; đổi $\eta$ thì về bước 0; bấm Chạy ở bước cuối thì chạy lại từ đầu; ba nút không bao giờ `disabled`.
- Không hiện tên mức ("chậm", "vừa"…) cạnh thanh trượt.
- Ô code 1 dùng $\eta = 0.3$ và dừng khi $\lVert\nabla\mathcal{L}\rVert < 10^{-6}$; ô 3 dùng `MinMaxScaler` cho khớp VIZ.

**Script kiểm chứng** (venv mục 2.5, chạy ngoài repo ngày 24/10/2026). Đây là bản rút gọn; bản đầy đủ thành `scripts/gradient-descent-fixture.py` ở D0:

```python
import numpy as np
from fractions import Fraction as F
area = [25, 30, 36, 42, 48, 55, 60, 68, 75, 85]
rent = [6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8]
m = 10; xs = [(a - 25) / 60 for a in area]            # bit-equal to NumPy's (area - min) / (max - min)
X, Y = [F(v) for v in xs], [F(v) for v in rent]
mse = lambda w, b: sum((w * x + b - y) ** 2 for x, y in zip(X, Y)) / m
def path(eta, n=100, box=((-10, 22), (-4, 20))):
    w = b = F(0); P = [(w, b)]; eta = F(eta)
    for _ in range(n):
        r = [w * x + b - y for x, y in zip(X, Y)]
        w, b = w - eta * F(2, m) * sum(x * e for x, e in zip(X, r)), b - eta * F(2, m) * sum(r)
        w, b = w.limit_denominator(10**40), b.limit_denominator(10**40); P.append((w, b))
        if not (box[0][0] <= w <= box[0][1] and box[1][0] <= b <= box[1][1]): break
    return P
Sxx, Sx, Sy = sum(x * x for x in X), sum(X), sum(Y); Sxy = sum(x * y for x, y in zip(X, Y))
wO = (m * Sxy - Sx * Sy) / (m * Sxx - Sx * Sx); bO = (Sy - wO * Sx) / m; best = mse(wO, bO)
print(float(wO), float(bO), float(best), float(wO / 60), float(bO - wO * 25 / 60))
H = 2 * np.array([[sum(v * v for v in xs), sum(xs)], [sum(xs), m]]) / m
L = np.linalg.eigvalsh(H)[1]; print(L, 2 / L)                         # 2.4533 0.8152
for eta in [0.05, 0.3, 0.7, 0.8, 0.85]:
    M = [mse(w, b) for w, b in path(eta)]
    reach = next((k for k, v in enumerate(M) if v <= F(101, 100) * best), None)
    print(eta, len(M) - 1, reach, float(M[-1]))
# 0.05: 100 None 1.0023… · 0.3: 100 69 0.3617… · 0.7: 100 29 0.3615… · 0.8: 100 None 0.4240… · 0.85: 4 None 244.32…
```
