# `PolyFitViz` và bộ dữ liệu `sine` (bài Overfitting và Underfitting)

> (Trước đây `docs/architecture/viz.md` mục 9. Số mục giữ nguyên như file cũ; mục ở file khác tra trong [mục lục](README.md#mục-lục).)

## 9. `PolyFitViz` và bộ dữ liệu `sine` (bài Overfitting và Underfitting)

> Viết ngày 23/10/2026, mốc M3. Mọi quy ước ở mục 2 vẫn áp dụng. Mục này chỉ ghi phần mới hoặc phần khác.
>
> **Quyết định đầu vào** ([decisions.md](../../decisions.md)): 37 (VIZ thanh trượt bậc đa thức, sai số train/test, tái dùng kit), 38 (dữ liệu nhỏ tự sinh có seed, trong `src/data/datasets/`), 39 (test gọn: unit test cho toán của VIZ, dựa vào `viz.spec.ts` chung, không spec e2e riêng), 44 (phạm vi bài, 3 ô code, bài Regularization dùng lại dữ liệu).
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
// src/data/datasets/sine.ts — the one copy of the overfitting data (decisions 38, 44; viz/poly-fit.md section 9.2.1).
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
| P0 | `viz-builder` | **Nền, làm trước `lesson-writer`.** Viết `src/lib/viz/poly-fit.ts` (mục 9.4.2). Nới luật đơn vị rỗng trong `datasets.test.ts` và `DatasetTable.astro` (mục 9.4.1). Viết `tests/unit/viz/poly-fit.test.ts`, không dùng dữ liệu thật | `toUnit` ra −1, 0, 1 tại $a$, $(a+b)/2$, $b$. `leastSquaresQR` trên một hệ 3×2 tính tay khớp tới 1e-12. `fitPolynomial` trên 5 điểm của $y = 1 - 2x + 3x^2$ ($x = 0..4$, miền $[0, 4]$), bậc 2: dự đoán lại đúng tới 1e-12; bậc 4 trên 5 điểm: nội suy, phần dư < 1e-12. Throw có thông báo khi số điểm < bậc + 1, và khi hai $x$ trùng làm thiếu hạng. `bestDegree` chọn bậc thấp khi bằng nhau. `fitZone` ra đúng ba vùng trên một bộ số tự chế. `toPolyline` ra đúng chuỗi trên ví dụ nhỏ, chặn ở ±1e5, không có "-0.00". `formatMse(9.99994)` = `'9.9999'`, `formatMse(133.20044)` = `'133.20'`. Quét nguồn `poly-fit.ts`: không có `**`, `Math.pow`, `Math.hypot`, `Math.exp`, `Math.log`, `Math.sin`, `Math.cos`. `datasets.test.ts`: đơn vị rỗng ở mọi ngôn ngữ thì qua, rỗng ở một ngôn ngữ thì báo lỗi |
| L | `lesson-writer` | Theo mục 9.4.9: tạo `sine.ts` và đăng ký, rồi viết bài vi với 3 ô code và comment giữ chỗ VIZ | `datasets.test.ts` qua với `sine-train`, `sine-test`, kể cả các dòng dữ liệu trong 6 file `.py`. Output của các ô code khớp bảng mục 9.2.1, chạy bằng venv mục 2.5. `content-reviewer` đã duyệt |
| P1 | `viz-builder` | **Fixture và cấu hình.** Chạy lệnh ở mục 9.4.1, ghi `tests/unit/fixtures/poly-fit-python.ts` kèm lệnh, phiên bản, ngày. Thêm `SINE_POLY_FIT` vào `sine.ts`. Viết `tests/unit/viz/poly-fit-sine.test.ts` | Bản sao `rows` trong fixture bằng `SINE_TRAIN.rows` và `SINE_TEST.rows`. Với mọi bậc 1–15: MSE train, MSE test, và dự đoán trên lưới (bậc 1, 3, 9, 15) khớp fixture trong dung sai mục 9.2.2; `formatMse` của hai bên bằng nhau (30/30). Bậc 15: phần dư lớn nhất trên train < 1e-8. Bậc ≤ 14: $\lVert \mathbf{V}^\top \mathbf{r} \rVert_\infty < 10^{-10}$. MSE train không tăng theo bậc. `bestDegree` = 3. Ba vùng là {1, 2}, {3..8}, {9..15}. Chuỗi hiện ra: bậc 1 `0.1663`/`0.2732`, bậc 3 `0.0377`/`0.0754`, bậc 15 `0.0000`/`133.20`. Mọi ràng buộc mục 9.4.3 |
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
| 7 | Bài Regularization cần ridge | Thêm một hàm ghép vào $\mathbf{V}$ các hàng $\sqrt{\lambda}\,\mathbf{I}$ (không phạt $c_0$), rồi gọi lại `leastSquaresQR`. Không cần gói mới. Chọn miền $\lambda$ khi thiết kế VIZ đó. Lưu ý: phạt hệ số theo $t$ khác phạt theo $x$ thô của scikit-learn, nên VIZ đó phải chuẩn hóa giống code bài (ví dụ `StandardScaler` trong pipeline). **Đã thiết kế ở [mục 10](regularization.md)** |
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
