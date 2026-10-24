# `RegularizationViz` (bài Ridge, Lasso, Elastic Net)

> (Trước đây `docs/architecture/viz.md` mục 10. Số mục giữ nguyên như file cũ; mục ở file khác tra trong [mục lục](README.md#mục-lục).)

## 10. `RegularizationViz` (bài Ridge, Lasso, Elastic Net)

> Viết ngày 24/10/2026, mốc M3. Mọi quy ước ở mục 2 và phần dùng chung của mục 9 (dữ liệu `sine`, `poly-fit.ts`, `PlotCurve`, `AtPoint`, `PlotFrame shape="short"`) vẫn áp dụng. Mục này chỉ ghi phần mới hoặc phần khác.
>
> **Quyết định đầu vào** ([decisions.md](../../decisions.md)): 37 (VIZ thanh trượt λ, tái dùng kit), 38 (dữ liệu tự sinh trong `src/data/datasets/`), 39 (test gọn: unit test cho toán, dựa vào `viz.spec.ts` chung), 47 (phạm vi bài, công thức, dữ liệu `sine` với bậc 15, VIZ có nút Ridge/Lasso, Lasso tính sẵn bằng Python).
>
> **Đã chạy thật:** venv của mục 2.5 (Python 3.14.5, NumPy 2.4.6, scikit-learn 1.8.0), từ thư mục trống ngoài repo. Số "chính xác" trong mục này là nghiệm tính bằng **số hữu tỉ** (`fractions.Fraction`) trên đúng ma trận đặc trưng mà scikit-learn tạo ra, nên bước giải không có sai số làm tròn. Lasso được kiểm điều kiện tối ưu (KKT) cũng bằng số hữu tỉ. Phép giải Ridge của TypeScript được mô phỏng bằng Python thuần (cùng thứ tự phép tính với `leastSquaresQR`) để đo sai số trước khi viết code.

### 10.1. Mục tiêu và phạm vi

**Ý một câu của VIZ:** tăng $\lambda$ thì hệ số co lại và đường bậc 15 dịu dần: $\lambda$ quá nhỏ là overfitting, $\lambda$ quá lớn là underfitting, $\lambda$ vừa cho MSE test thấp nhất; Lasso còn đưa nhiều hệ số về **đúng 0**, Ridge thì không.

**Làm:**

- Toán thuần `src/lib/viz/regularized-fit.ts`: chuẩn hóa đặc trưng như `StandardScaler`, Ridge bằng QR trên ma trận mở rộng, MSE, đếm hệ số bằng 0, chọn mức $\lambda$ tốt nhất, nhãn vùng, định dạng $\lambda$.
- Script Python `scripts/sine-lasso-path.py` tính **nghiệm Lasso chính xác** cho mọi mức $\lambda$, ghi ra file dữ liệu và fixture.
- VIZ `RegularizationViz`: đồ thị chính (điểm train/test, đường bậc 15), thanh trượt $\lambda$ 17 mức, hai nút Ridge/Lasso, ba dòng số (MSE train, MSE test, số hệ số bằng 0), biểu đồ cột 15 hệ số, dòng trạng thái.
- Thêm vào `viz.css` ba lớp vai trò: cột hệ số, dấu "bằng 0", hàng nút chọn.

**Không làm:**

- Elastic Net trong VIZ (chỉ ở lời văn và ô code 3, quyết định 47).
- Biểu đồ "MSE theo $\lambda$" hình chữ U như của `PolyFitViz`. Chỗ đó dành cho biểu đồ cột hệ số, để VIZ không cao quá. Ô code 1 in MSE theo $\lambda$.
- Nút "Hiện hàm thật", thang log hay symlog, kéo điểm, đổi bậc.
- Hình học L1/L2 (hình thoi, hình tròn). Nếu cần thì làm hình tĩnh FIG theo mục 8, ngoài phạm vi mục này.
- Spec e2e riêng, test island jsdom riêng (quyết định 39).

### 10.2. Phương án đã chọn

#### 10.2.1. Hàm mục tiêu, ánh xạ $\lambda$ ↔ `alpha`, chuẩn hóa

**Mô hình:** đa thức bậc 15 qua pipeline `make_pipeline(PolynomialFeatures(15, include_bias=False), StandardScaler(), model)`. Đặc trưng thứ $k$ là $z_k = (x^k - \mu_k)/\sigma_k$, với $\mu_k$, $\sigma_k$ là trung bình và độ lệch chuẩn (chia cho $m$, như `StandardScaler`) của $x^k$ trên **16 điểm train**. Dự đoán $\hat{y} = b + \sum_{k=1}^{15} w_k z_k$.

**Có chuẩn hóa.** Không chuẩn hóa thì cột $x^{15}$ trên $[0, 1]$ nhỏ hơn cột $x$ hàng nghìn lần, mức phạt đè lên các hệ số rất không đều, và Lasso gần như không hội tụ. Bài (quyết định 47) cũng dạy chuẩn hóa đặc trưng như một bước bắt buộc. Vì vậy **các cột trên biểu đồ là hệ số $w_k$ của đặc trưng đã chuẩn hóa** $z_k$, đúng bằng `model[-1].coef_` trong code bài. Nhãn trục và mô tả của VIZ nói rõ điều này.

**Hàm mục tiêu trong bài** ($\mathcal{L}$ là MSE với hệ số $\frac{1}{m}$ như mọi bài, $m = 16$, $b$ **không** bị phạt):

$$J_{\text{Ridge}}(\mathbf{w}, b) = \frac{1}{m}\sum_{i=1}^{m}\left(\hat{y}^{(i)} - y^{(i)}\right)^2 + \lambda\lVert\mathbf{w}\rVert_2^2, \qquad J_{\text{Lasso}}(\mathbf{w}, b) = \frac{1}{m}\sum_{i=1}^{m}\left(\hat{y}^{(i)} - y^{(i)}\right)^2 + \lambda\lVert\mathbf{w}\rVert_1$$

**Ánh xạ sang scikit-learn 1.8** (đã đọc docstring trong `sklearn/linear_model/_ridge.py` và `_coordinate_descent.py` của venv):

| Mô hình | scikit-learn tối thiểu hóa | Bằng | Viết trong code |
|---|---|---|---|
| `Ridge` | $\lVert\mathbf{y} - \mathbf{X}\mathbf{w}\rVert_2^2 + \alpha\lVert\mathbf{w}\rVert_2^2$ (tổng, không chia $m$) | $m \cdot J_{\text{Ridge}}$ khi $\alpha = m\lambda$ | `Ridge(alpha=len(x_train) * lam)` |
| `Lasso` | $\frac{1}{2m}\lVert\mathbf{y} - \mathbf{X}\mathbf{w}\rVert_2^2 + \alpha\lVert\mathbf{w}\rVert_1$ | $\frac{1}{2} J_{\text{Lasso}}$ khi $\alpha = \lambda/2$ | `Lasso(alpha=lam / 2, max_iter=100_000, tol=1e-6)` |
| `ElasticNet` | $\frac{1}{2m}\lVert\mathbf{y} - \mathbf{X}\mathbf{w}\rVert_2^2 + \alpha\rho\lVert\mathbf{w}\rVert_1 + \frac{\alpha(1-\rho)}{2}\lVert\mathbf{w}\rVert_2^2$ | $\frac{1}{2}\left(\mathcal{L} + \lambda_1\lVert\mathbf{w}\rVert_1 + \lambda_2\lVert\mathbf{w}\rVert_2^2\right)$ khi $\alpha = \frac{\lambda_1}{2} + \lambda_2$, $\rho = \frac{\lambda_1/2}{\alpha}$ | `ElasticNet(alpha=..., l1_ratio=...)` |

Cả ba đều tự trừ trung bình của $\mathbf{X}$ và $\mathbf{y}$ trước khi giải (`fit_intercept=True`), nên $b$ không bị phạt.

**Nghiệm dạng đóng của Ridge** (bài dẫn từ phương trình chuẩn, quyết định 47). Với đặc trưng đã trừ trung bình, đặt gradient bằng 0: $\frac{2}{m}\mathbf{X}^\top(\mathbf{X}\mathbf{w} - \mathbf{y}) + 2\lambda\mathbf{w} = \mathbf{0}$, suy ra

$$\left(\mathbf{X}^\top\mathbf{X} + m\lambda\mathbf{I}\right)\mathbf{w} = \mathbf{X}^\top\mathbf{y}, \qquad b = \bar{y}.$$

Thừa số $m\lambda$ ở đây chính là `alpha` của `Ridge`; lời văn nên nối hai chỗ này lại. Vì các cột $z_k$ có trung bình 0 trên train, $b = \bar{y} = 0.0831$ ở **mọi** mức $\lambda$, cho cả Ridge lẫn Lasso (đã kiểm: `intercept_` in ra `0.0831` ở cả 5 mức của ô code 1). Bài có thể nhắc như một hệ quả của việc không phạt $b$.

#### 10.2.2. Lưới $\lambda$

**Chọn: 17 mức rời rạc, $\lambda \in \{0\} \cup \{10^{-14}, 10^{-13}, \dots, 10^{0}, 10^{1}\}$**, mỗi nấc một bậc mười. Thanh trượt chạy theo **chỉ số** mức (0 tới 16, bước 1), số hiện ra là $\lambda$.

Vì sao xuống tới $10^{-14}$: 15 cột $z_1..z_{15}$ gần như trùng nhau (số điều kiện của ma trận đặc trưng là $6.2 \times 10^{12}$). Phần gây overfitting nằm ở các hướng có giá trị kỳ dị rất nhỏ, nên **một chút phạt đã đủ dập nó**: Ridge với $\lambda = 10^{-10}$ đã có MSE test 0.1063. Muốn thấy overfitting dịu đi từng bước thì lưới phải xuống tới $10^{-14}$. Với Lasso, overfitting kéo dài tới $10^{-7}$.

| Phương án | Đánh giá |
|---|---|
| **A. $\{0\} \cup 10^{-14..1}$, 17 mức (chọn)** | Nằm trong khoảng 13–21 mức. Nhãn là lũy thừa 10, dễ đọc. Mức $\lambda = 0$ chính là bậc 15 của bài trước (MSE test 133.20). Cả Ridge và Lasso đều đi đủ ba vùng. Nhược: mức tốt nhất thật của Ridge ($\approx 3 \times 10^{-4}$, MSE test 0.0845) nằm giữa hai nấc |
| B. Nửa bậc mười ($1, 3, 10, 30, \dots$) từ $10^{-12}$ tới $10$, cộng $\lambda = 0$: 28 mức | Bắt được đáy của Ridge, nhưng 28 nấc trên 311px, dữ liệu Lasso dài gần gấp đôi, nhãn "3 × 10⁻⁵" khó đọc |
| C. $\{0\} \cup 10^{-8..1}$, 11 mức | Gọn, nhưng Ridge chỉ overfit ở đúng một mức ($\lambda = 0$) rồi nhảy thẳng xuống MSE test 0.1026 |

**Một lưới cho cả hai mô hình.** Đổi Ridge ↔ Lasso giữ nguyên mức $\lambda$, để người đọc so hai kiểu phạt ở cùng $\lambda$. Cùng một $\lambda$ không có nghĩa hai kiểu phạt "mạnh như nhau" (một bên bình phương, một bên trị tuyệt đối). Tình cờ là cả hai có MSE test nhỏ nhất ở cùng mức $10^{-3}$.

**Hiển thị $\lambda$** (`formatLambda`): mức 0 hiện `0`; số mũ từ $-3$ trở lên hiện số thập phân (`0.001`, `0.01`, `0.1`, `1`, `10`) để khớp cách viết trong code; số mũ từ $-4$ trở xuống hiện `10⁻⁴` … `10⁻¹⁴` bằng chữ số mũ Unicode, không cần KaTeX. Chuỗi đọc cho trình đọc màn hình dùng mẫu `pow10Spoken` ("10 mũ −14").

**Mức ban đầu: $\lambda = 0$, Ridge.** Người đọc thấy ngay đường bậc 15 vọt khỏi khung của bài trước, 15 cột đều vượt khung, rồi kéo sang phải để "chữa".

#### 10.2.3. Bảng số

MSE hệ số $\frac{1}{m}$, khớp trên 16 điểm train, đo trên 8 điểm test. Số hiện ra theo `formatMse` (4 chữ số thập phân, từ 10 trở lên thì 2). Cột "= 0" là số hệ số Lasso bằng **đúng** 0 (Ridge luôn 0/15 khi $\lambda > 0$). Cột "vượt" là số hệ số có $|w_k| > 10$ (mục 10.2.6).

| $\lambda$ | Ridge train | Ridge test | Ridge vượt | Vùng Ridge | Lasso train | Lasso test | Lasso = 0 | Lasso vượt | Vùng Lasso |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| 0 | 0.0000 | 133.20 | 15 | overfit | 0.0000 | 133.20 | 0 | 15 | overfit |
| $10^{-14}$ | 0.0031 | 1.9411 | 14 | overfit | 0.0002 | 28.18 | 1 | 14 | overfit |
| $10^{-13}$ | 0.0062 | 1.0363 | 15 | overfit | 0.0002 | 24.08 | 1 | 14 | overfit |
| $10^{-12}$ | 0.0102 | 0.5375 | 15 | overfit | 0.0011 | 2.8723 | 2 | 13 | overfit |
| $10^{-11}$ | 0.0174 | 0.1669 | 15 | vừa | 0.0015 | 2.7762 | 2 | 13 | overfit |
| $10^{-10}$ | 0.0226 | 0.1063 | 15 | vừa | 0.0022 | 3.6655 | 3 | 12 | overfit |
| $10^{-9}$ | 0.0238 | 0.1053 | 14 | vừa | 0.0029 | 2.2422 | 4 | 10 | overfit |
| $10^{-8}$ | 0.0244 | 0.1026 | 13 | vừa | 0.0058 | 1.0974 | 5 | 10 | overfit |
| $10^{-7}$ | 0.0261 | 0.0981 | 11 | vừa | 0.0158 | 0.2056 | 5 | 10 | overfit |
| $10^{-6}$ | 0.0269 | 0.0985 | 1 | vừa | 0.0241 | 0.1047 | 7 | 7 | vừa |
| $10^{-5}$ | 0.0272 | 0.0971 | 0 | vừa | 0.0270 | 0.0991 | 9 | 1 | vừa |
| $10^{-4}$ | 0.0294 | 0.0895 | 0 | vừa | 0.0272 | 0.0968 | 9 | 0 | vừa |
| **$10^{-3}$** | 0.0491 | **0.0894** ✓ | 0 | vừa | 0.0314 | **0.0851** ✓ | **10** | 0 | vừa |
| $10^{-2}$ | 0.0777 | 0.1303 | 0 | vừa | 0.0767 | 0.1341 | 11 | 0 | vừa |
| $10^{-1}$ | 0.0999 | 0.1747 | 0 | vừa | 0.1217 | 0.2277 | 12 | 0 | underfit |
| $1$ | 0.1578 | 0.2761 | 0 | underfit | 0.4163 | 0.5982 | 14 | 0 | underfit |
| $10$ | 0.3148 | 0.4750 | 0 | underfit | 0.4165 | 0.5985 | 15 | 0 | underfit |

✓: MSE test nhỏ nhất trên lưới. Ridge ở $10^{-3}$ (0.089359) chỉ hơn $10^{-4}$ (0.089489) $1.3 \times 10^{-4}$, nhưng sai số của TypeScript cỡ $10^{-11}$ (mục 10.2.4), nên thứ tự không đổi.

**Câu chuyện dạy học đứng vững:**

- **$\lambda$ nhỏ là overfitting.** $\lambda = 0$ cho đúng bậc 15 không phạt (MSE test 133.20, khớp mục 9.2.1). Ridge còn overfit tới $10^{-12}$, Lasso tới $10^{-7}$.
- **$\lambda$ vừa cho MSE test thấp nhất.** Ở $10^{-3}$: Ridge 0.0894, Lasso 0.0851, tức **thấp hơn khoảng 1 500 lần** so với bậc 15 không phạt (133.20). So với bậc 3 không phạt (0.0754, mục 9.2.1), Ridge kém hơn 19%, Lasso kém hơn 13%. Ý cho lời văn: regularization đưa bậc 15 về gần bằng việc chọn đúng bậc 3, mà không phải chọn bậc. Trên lưới mịn hơn, Ridge xuống được 0.0845 ở $\lambda \approx 3 \times 10^{-4}$.
- **$\lambda$ lớn là underfitting.** Ridge ở $10$: MSE train 0.3148, gần gấp đôi đường thẳng bậc 1 (0.1663). Lasso từ $\lambda \ge \lambda_{\max} = 1.0005$ thì mọi hệ số bằng 0, đường dự đoán nằm ngang ở $\bar{y}$ (MSE test 0.5985).
- **Lasso có nhiều hệ số bằng đúng 0 ở $\lambda$ vừa.** Ở $10^{-3}$: 10/15 hệ số bằng 0, chỉ giữ $z_1, z_2, z_4, z_9, z_{15}$. Ridge cùng mức: 0/15, hệ số nhỏ nhất là $|w_8| = 0.07$. Với dữ liệu này, số hệ số Lasso bằng 0 không giảm khi $\lambda$ tăng (lý thuyết không bắt buộc vậy).
- Bậc 15 không phạt có hệ số đổi dấu xen kẽ, lớn tới $1.4 \times 10^{10}$; ở $10^{-3}$ hệ số lớn nhất chỉ còn 2.75 (Ridge) và 6.72 (Lasso). Đây là hình ảnh "hệ số co lại" mà biểu đồ cột cho thấy.

**Vùng** (dòng trạng thái, mục 10.2.7), tính từ dữ liệu: Ridge overfit $\{0 .. 10^{-12}\}$, vừa $\{10^{-11} .. 10^{-1}\}$, underfit $\{1, 10\}$. Lasso overfit $\{0 .. 10^{-7}\}$, vừa $\{10^{-6} .. 10^{-2}\}$, underfit $\{10^{-1}, 1, 10\}$.

#### 10.2.4. Tính ở đâu: Ridge trên trình duyệt, Lasso tính sẵn

| Phương án | Đánh giá |
|---|---|
| **A. Ridge: island tính 16 lần (mọi $\lambda > 0$) lúc mount, bằng QR trên ma trận mở rộng. Lasso và mức $\lambda = 0$: tính sẵn bằng Python, island import thẳng file dữ liệu (chọn)** | Ridge đúng là công thức bài dẫn ra. `props` nhỏ. Dữ liệu Lasso khoảng **1.7 KB gzip** trong JS (đã đo trên bản in thử). JS riêng của island ước tính 7 KB gzip, dưới 10 KB |
| B. Tính sẵn cả Ridge | Island không cần toán, nhưng dữ liệu gấp đôi: JS riêng khoảng 8.5 KB, sát ngưỡng 10 KB |
| C. Lasso trên trình duyệt (coordinate descent hoặc homotopy bằng số thực) | Đã thử: coordinate descent của scikit-learn với 1 000 000 vòng, `tol=1e-8` vẫn không hội tụ ở $\lambda \le 10^{-4}$, và ra **sai** số hệ số bằng 0 (ví dụ ở $10^{-5}$: 9 hệ số khác 0, đúng là 6). `lars_path` của scikit-learn dừng ở $\lambda \approx 2 \times 10^{-7}$. Loại |
| D. Truyền Lasso qua `props` | 272 số, Astro bọc mỗi số thành `[0,x]`: khoảng 6.5 KB, cộng phần còn lại thì vượt 8 KB (mục 2.9). Loại |

**Ridge.** Với mỗi $\lambda > 0$: giải bình phương tối thiểu $\begin{bmatrix}\mathbf{Z}_c \\ \sqrt{m\lambda}\,\mathbf{I}\end{bmatrix}\mathbf{w} \approx \begin{bmatrix}\mathbf{y}_c \\ \mathbf{0}\end{bmatrix}$ ($\mathbf{Z}_c$, $\mathbf{y}_c$ đã trừ trung bình trên train) bằng `leastSquaresQR` có sẵn; $b = \bar{y} - \sum_k w_k \bar{z}_k$. Đây đúng là bài toán $J_{\text{Ridge}}$ nhân $m$, và không bình phương số điều kiện như khi giải phương trình chuẩn.

- Số điều kiện của ma trận mở rộng $\le 3.7 \times 10^{7}$ ở $\lambda = 10^{-14}$. Mô phỏng: lệch nghiệm hữu tỉ chính xác **tối đa $4.6 \times 10^{-11}$** (tương đối, trên MSE), chuỗi hiện ra trùng 32/32. Kiểm hạng của `leastSquaresQR` ($10^{-12}$) không bị chạm.
- Chỉ dùng `+ − × ÷`, `Math.sqrt`, `Math.abs`, như `poly-fit.ts` (mục 9.2.2): HTML lúc build và lần render khi hydrate trùng từng bit.
- **So với scikit-learn:** `Ridge` mặc định giải bằng Cholesky trên $\mathbf{X}^\top\mathbf{X} + \alpha\mathbf{I}$ (bình phương số điều kiện), nên ở $10^{-14}$ in ra 1.9377 thay vì 1.9411, ở $10^{-13}$ in 1.0362 thay vì 1.0363; từ $10^{-12}$ trở lên trùng mọi chữ số hiện ra. `Ridge(..., solver='svd')` trùng ở mọi mức. Vì vậy **fixture tham chiếu nghiệm hữu tỉ chính xác**, và chỉ so với `Ridge` mặc định ở $\lambda \ge 10^{-12}$. Không mức nào có `LinAlgWarning`.
- $\lambda = 0$ không đi đường này (ma trận gần suy biến, kiểm hạng sẽ throw): dùng hàng $\lambda = 0$ của file dữ liệu, chung cho Ridge và Lasso.

**Lasso.** Script `scripts/sine-lasso-path.py` tính **đường đi nghiệm chính xác** (homotopy, cùng ý với LARS-Lasso) bằng số hữu tỉ:

1. Tạo $\mathbf{Z}$ bằng đúng pipeline `PolynomialFeatures(15, include_bias=False)` + `StandardScaler` trên `x_train`, đổi từng số thực sang `Fraction`, trừ trung bình chính xác.
2. Bắt đầu từ $\lambda_{\max} = \max_j \left|\frac{2}{m}\mathbf{z}_j^\top\mathbf{y}_c\right|$ (= 1.00045, mọi hệ số bằng 0) rồi đi xuống. Trên mỗi đoạn, với tập hệ số khác 0 $A$ và dấu $\mathbf{s}_A$: $\mathbf{w}_A(\lambda) = \mathbf{G}_{AA}^{-1}\left(\mathbf{c}_A - \frac{m\lambda}{2}\mathbf{s}_A\right)$, với $\mathbf{G} = \mathbf{Z}_c^\top\mathbf{Z}_c$, $\mathbf{c} = \mathbf{Z}_c^\top\mathbf{y}_c$. Điểm gãy kế tiếp là $\lambda$ lớn nhất, nhỏ hơn $\lambda$ hiện tại, mà tại đó một hệ số trong $A$ về 0 hoặc một $\left|\frac{2}{m}\mathbf{z}_j^\top\mathbf{r}\right|$ ngoài $A$ chạm $\lambda$. Mỗi đoạn giải lại từ $\mathbf{G}_{AA}$, nên mẫu số không phình theo số bước. Đã chạy: 148 điểm gãy tới $10^{-15}$, khoảng 5 giây.
3. Với mỗi mức của lưới: lấy tập $A$ và dấu của đoạn chứa nó, giải chính xác, **kiểm KKT bằng số hữu tỉ** (đúng dấu trên $A$; $\left|\frac{2}{m}\mathbf{z}_j^\top\mathbf{r}\right| \le \lambda$ ngoài $A$), assert nếu sai. Cả 16 mức đều qua. $b = \bar{y} - \bar{\mathbf{z}}^\top\mathbf{w}$.
4. $\lambda = 0$: giải $\mathbf{G}\mathbf{w} = \mathbf{c}$ chính xác (bình phương tối thiểu, nội suy 16 điểm).
5. Ghi `src/data/datasets/sine-lasso-path.ts` (số thực dạng `repr`, hệ số bằng 0 ghi đúng `0`) và `tests/unit/fixtures/regularization-python.ts` (MSE chính xác của cả Ridge lẫn Lasso, số hệ số bằng 0).
6. Đối chiếu với scikit-learn, cảnh báo thành lỗi (`warnings.simplefilter("error")`): `Ridge(alpha=16 * lam)` ở $\lambda \ge 10^{-12}$, và `Lasso(alpha=lam / 2, max_iter=100_000, tol=1e-6)` ở $\lambda \in \{10^{-3}, 10^{-2}, 10^{-1}\}$, phải cho cùng chuỗi MSE và cùng số hệ số bằng 0.

Mô phỏng phía TypeScript tính MSE từ hệ số Lasso đã lưu (chuẩn hóa tính lại bằng vòng lặp thường): lệch nghiệm chính xác tối đa $3.5 \times 10^{-8}$ (ở $\lambda = 0$, hệ số tới $10^{10}$), chuỗi hiện ra trùng 34/34. Island tự tính MSE từ hệ số; file chạy không lưu MSE.

#### 10.2.5. Cảnh báo hội tụ của Lasso

- **Trong VIZ:** không có, vì dữ liệu Lasso là nghiệm chính xác (mục 10.2.4).
- **Trong code bài:** `Lasso(alpha=lam / 2, max_iter=100_000, tol=1e-6)`, chỉ với $\lambda \in \{10^{-3}, 10^{-2}, 10^{-1}\}$: không có `ConvergenceWarning`, chuỗi MSE và số hệ số bằng 0 trùng VIZ (số ở 10.4.8). Mỗi lần khớp dưới 30 ms trên máy; trên Pyodide chậm hơn vài lần, vẫn dưới 1 giây.
- **Không dùng trong code:** $\lambda \le 10^{-4}$ (có cảnh báo, và kết quả sai, mục 10.2.4 C); $\lambda = 1$ (sát $\lambda_{\max} = 1.0005$: nghiệm đúng còn một hệ số $-2.3 \times 10^{-4}$, còn coordinate descent với `tol=1e-6` báo 15 hệ số bằng 0).
- Lời văn có một câu: ở $\lambda$ rất nhỏ, coordinate descent hội tụ rất chậm vì các đặc trưng gần như trùng nhau; phần Lasso của minh họa được tính sẵn bằng một cách giải chính xác. Ý này có thể thành một hộp "Lỗi hay gặp" về `ConvergenceWarning`.

#### 10.2.6. Biểu đồ cột hệ số: thang trục $y$

Độ lớn hệ số trải từ $1.4 \times 10^{10}$ ($\lambda = 0$) tới $2 \times 10^{-3}$ (Ridge, $\lambda = 10$).

| Phương án | Đánh giá |
|---|---|
| **A. Tuyến tính cố định $[-10, 10]$, có cắt (chọn)** | Cột vượt khung chạm mép và có tam giác rỗng chỉ ra ngoài, như biểu đồ sai số của `PolyFitViz`. Mọi hệ số từ $10^{-5}$ trở lên nằm trong khung (trừ một hệ số Lasso $-11.1$ ở $10^{-5}$), nên vùng "vừa" đọc được trọn. Thấy được cả ba ý: vượt khung (khổng lồ), co dần, gần như phẳng |
| B. Symlog | Thấy mọi bậc độ lớn, nhưng người mới khó đọc thang log có dấu, và 0.1 với 0.001 vẫn gần như dẹt. Không giải được chuyện "nhỏ nhưng khác 0" |
| C. Đổi thang theo $\lambda$ | Cột lúc nào cũng cao gần như nhau: mất đúng ý "hệ số co lại". Loại |

**Hai dấu bổ sung cho A**, để phân biệt "nhỏ" với "bằng đúng 0" (ý chính của Lasso):

- **Mầm 2px:** mỗi hệ số khác 0 có thêm một đoạn cột cao 2px (px thật, vẽ trong `AtPoint` tại $(k, 0)$), hướng theo dấu. Hệ số 0.002 vẫn hiện một vạch nhỏ. Cột nào cao hơn 2px thì phủ lên mầm.
- **Vòng "0":** hệ số bằng đúng 0 không có cột, chỉ có một vòng rỗng nhỏ ($r = 4$) trên đường 0. Dòng số thứ ba ("Hệ số bằng đúng 0: 10/15") dùng cùng dấu này làm mẫu.

**Đọc được ở 375px:** vùng vẽ rộng khoảng 270px, 15 ô, mỗi ô 18px: cột rộng 10px, khe 8px. `shape="short"` cho cao khoảng 135px (2:1), nửa trên 67px: hệ số 1 cao 7px, hệ số 0.1 dưới 1px (còn mầm 2px). Vạch chia $y$: $-10, -5, 0, 5, 10$ (3 ký tự). Vạch chia $k$: 1, 5, 10, 15.

#### 10.2.7. Dòng trạng thái

Như mục 9.2.5, nhưng phía "phức tạp" là chỉ số mức **nhỏ**. Gọi $i^\ast$ là mức có MSE test nhỏ nhất (bằng nhau thì lấy $\lambda$ lớn hơn), `ZONE_RATIO = 2` (dùng lại từ `poly-fit.ts`):

- **overfitting:** $i < i^\ast$ và MSE test $\ge 2 \cdot$ MSE test$(i^\ast)$;
- **underfitting:** $i > i^\ast$, MSE test $\ge 2 \cdot$ MSE test$(i^\ast)$ **và** MSE train $\ge 2 \cdot$ MSE train$(i^\ast)$ (underfitting là cả hai cùng lớn, như bài trước dạy);
- còn lại: **vừa khớp**. Tại $i^\ast$ thêm dòng ✓ "Mức λ có MSE test nhỏ nhất".

Lý do khác luật underfit của mục 9.2.5 (chỉ xét MSE train): nếu chỉ xét train, ở $\lambda = 10^{-2}$ Lasso bị gọi là underfitting còn Ridge là vừa khớp, dù hai bên có số gần như nhau (0.0767/0.1341 và 0.0777/0.1303). Luật mới cho kết quả ở bảng 10.2.3.

### 10.3. Cấu trúc file

```
scripts/
└─ sine-lasso-path.py                 # new (R0): exact Lasso path (Fraction), writes the two generated files below
src/
├─ data/datasets/
│  ├─ sine.ts                         # R0: + SINE_REGULARIZATION (config); L: + 'ml/regularization' in lessons
│  └─ sine-lasso-path.ts              # new (R0), GENERATED: SINE_LASSO_PATH, one row per λ level
├─ lib/viz/
│  └─ regularized-fit.ts              # new (R0), pure: standardizer, features, ridgeFit, predictPenalized,
│                                     #   penalizedMse, penaltyPath, bestLevel, levelZone, formatLambda
├─ components/viz/
│  ├─ viz.css                         # R1: + .atlas-viz-bar, .atlas-viz-zero, .atlas-viz-choice (10.4.6)
│  ├─ RegularizationViz.astro         # new (R1): wrapper
│  └─ regularization-viz/
│     └─ RegularizationVizIsland.tsx  # new (R1)
├─ i18n/ui.ts, content/i18n/{vi,en}.json   # R1: namespace vizRegularization, 24 keys (10.4.7)
└─ code/ml/regularization/            # lesson-writer: 3 cells .{vi,en}.py with "# dataset: sine-train" / "sine-test"
tests/unit/
├─ regularized-fit.test.ts            # new (R0): math by hand, no real data; scans for forbidden Math calls
├─ regularization-sine.test.ts        # new (R0): config, generated path, fixture, KKT, the story of 10.2.3
└─ fixtures/regularization-python.ts  # new (R0), GENERATED by the same script
tests/e2e/
└─ viz.spec.ts                        # R2 (tester): measureContrast learns line.atlas-viz-bar, circle.atlas-viz-zero
```

`scripts/` là thư mục mới ở gốc repo, chỉ chứa script chạy tay bằng venv mục 2.5, không chạy trong build hay CI. Đầu file ghi lệnh chạy, phiên bản gói, và "chạy lại khi đổi dữ liệu `sine` hoặc nâng Pyodide". Cả hai file sinh ra có dòng đầu `// GENERATED by scripts/sine-lasso-path.py — do not edit by hand.`

### 10.4. Giao diện

#### 10.4.1. Dữ liệu sinh ra: `sine-lasso-path.ts` và fixture

```ts
// src/data/datasets/sine-lasso-path.ts — GENERATED by scripts/sine-lasso-path.py — do not edit by hand.
// Exact Lasso solutions (rational arithmetic, KKT checked) of (1/m) Σ(ŷ − y)² + λ Σ|w_k| for the degree-15
// pipeline PolynomialFeatures(15, include_bias=False) + StandardScaler on SINE_TRAIN (viz/regularization.md section 10.2.4).
// One row per SINE_REGULARIZATION.levels, same order. Row 0 (λ = 0) is plain least squares, shared with Ridge.
// Relative imports only.
export interface CoefRow {
  b: number;
  w: readonly number[]; // w[k − 1] is the coefficient of z_k = (x^k − μ_k) / σ_k, k = 1..15; exact zeros are 0
}
export const SINE_LASSO_PATH: readonly CoefRow[] = [
  /* 17 rows; the row of λ = 10⁻³: */
  // { b: 0.08312500000000093, w: [2.47930947636198, -6.715161231407973, 0, 5.093655408286402, 0, 0, 0, 0,
  //   -1.8788672460142304, 0, 0, 0, 0, 0, 0.6995729155853766] },
];
```

```ts
// tests/unit/fixtures/regularization-python.ts — GENERATED by scripts/sine-lasso-path.py
export const PYTHON_REGULARIZATION = {
  versions: { python: '3.14.5', numpy: '2.4.6', sklearn: '1.8.0' }, date: '…', command: 'python scripts/sine-lasso-path.py',
  train: [/* copy of SINE_TRAIN.rows */], test: [/* copy of SINE_TEST.rows */],
  lambdaMax: 1.0004538579001463,
  levels: [/* { lambda: 0.001, ridge: { mseTrain, mseTest }, lasso: { mseTrain, mseTest, zeros: 10 } }, … 17 */],
} as const;
```

MSE trong fixture là giá trị chính xác (số hữu tỉ đổi sang số thực). Ví dụ ở $10^{-3}$: Ridge `0.049091…` / `0.089359…`, Lasso `0.031437…` / `0.085051…`.

#### 10.4.2. Toán: `src/lib/viz/regularized-fit.ts`

```ts
// src/lib/viz/regularized-fit.ts — pure, relative imports only. Only + − × ÷, Math.sqrt, Math.abs (section 9.2.2).
import type { Row } from '../../data/datasets/types';
import type { CoefRow } from '../../data/datasets/sine-lasso-path';
import type { SliderSpec } from './linear-fit';
import type { FitZone } from './poly-fit';           // + leastSquaresQR, ZONE_RATIO
import type { Domain } from './scale';

export type Penalty = 'ridge' | 'lasso';

/** λ = 0 when exp is null, else λ = 10^exp (the test checks lambda === Number(`1e${exp}`)). */
export interface LambdaLevel { lambda: number; exp: number | null }

export interface RegularizationConfig {
  degree: number;                                         // 15
  levels: readonly LambdaLevel[];                         // 17 levels, λ increasing, levels[0].lambda === 0
  slider: SliderSpec;                                     // { min: 0, max: 16, step: 1, initial: 0 }: an index into levels
  initialPenalty: Penalty;                                // 'ridge'
  xDomain: Domain; yDomain: Domain; xTicks: readonly number[]; yTicks: readonly number[];
  featureDomain: Domain; featureTicks: readonly number[]; // x of the bar chart: k
  coefDomain: Domain; coefTicks: readonly number[];       // y of the bar chart; |w_k| above is "off the chart"
  samples: number;                                        // 201
  digits: { mse: number; mseLarge: number };              // 4, 2 (formatMse)
}

/** Mean and scale (population std, like StandardScaler) of x^1..x^d on the training rows. */
export interface Standardizer { mean: readonly number[]; scale: readonly number[] }
export interface PenalizedFit extends CoefRow { mseTrain: number; mseTest: number; zeros: number }

export function standardizer(train: readonly Row[], degree: number): Standardizer;
/** z_k = (x^k − μ_k) / σ_k, k = 1..d; powers by repeated multiplication (as PolynomialFeatures). */
export function features(x: number, s: Standardizer): number[];
/** λ > 0: least squares of [Z_c; √(mλ) I] w ≈ [y_c; 0] with leastSquaresQR; b = ȳ − Σ w_k z̄_k. Throws on λ ≤ 0. */
export function ridgeFit(train: readonly Row[], lambda: number, s: Standardizer): CoefRow;
export function predictPenalized(coef: CoefRow, x: number, s: Standardizer): number;
/** (1/m) Σ (ŷ − y)²; throws on no rows. */
export function penalizedMse(rows: readonly Row[], coef: CoefRow, s: Standardizer): number;
/** Both paths, one fit per level: Ridge from ridgeFit (level 0 from lasso[0]), Lasso from the generated rows. */
export function penaltyPath(train: readonly Row[], test: readonly Row[], config: RegularizationConfig,
  lasso: readonly CoefRow[]): Record<Penalty, PenalizedFit[]>;
/** Index of the smallest test MSE; the larger λ (higher index) on a tie. */
export function bestLevel(fits: readonly PenalizedFit[]): number;
/** Section 10.2.7. */
export function levelZone(fits: readonly PenalizedFit[], index: number): FitZone;
/** "0" | "0.001" … "10" (exp ≥ −3) | "10⁻⁴" … "10⁻¹⁴" (Unicode superscripts). */
export function formatLambda(level: LambdaLevel): string;
```

Chuỗi đọc to của $\lambda$ ("10 mũ −4") do island ghép: `formatString(strings.pow10Spoken, { exp: formatNumber(exp, 0) })` khi `exp ≤ −4`, `strings.zeroLambda` ở mức 0, còn lại dùng `formatLambda`. Không đưa vào `src/lib` vì cần chuỗi i18n.

#### 10.4.3. Cấu hình: `SINE_REGULARIZATION` (trong `sine.ts`)

```ts
export const SINE_REGULARIZATION: RegularizationConfig = {
  degree: 15,
  levels: [{ lambda: 0, exp: null }, { lambda: 1e-14, exp: -14 }, /* … */ { lambda: 1, exp: 0 }, { lambda: 10, exp: 1 }],
  slider: { min: 0, max: 16, step: 1, initial: 0 },
  initialPenalty: 'ridge',
  xDomain: [0, 1], yDomain: [-2, 2], xTicks: [0, 0.2, 0.4, 0.6, 0.8, 1], yTicks: [-2, -1, 0, 1, 2], // as PolyFitViz
  featureDomain: [0.5, 15.5], featureTicks: [1, 5, 10, 15],
  coefDomain: [-10, 10], coefTicks: [-10, -5, 0, 5, 10],
  samples: 201,
  digits: { mse: 4, mseLarge: 2 },
};
```

**Ràng buộc** (`regularization-sine.test.ts`): `levels[0]` là $\lambda = 0$; $\lambda$ tăng ngặt; `lambda === Number('1e' + exp)`; `slider.max === levels.length − 1`; `SINE_LASSO_PATH.length === levels.length`, mỗi hàng 15 hệ số hữu hạn; `degree === SINE_TRAIN.rows.length − 1`; vạch chia tăng dần và nằm trong miền.

#### 10.4.4. `RegularizationViz`: wrapper và island

```astro
---
// src/components/viz/RegularizationViz.astro — sketch
import RegularizationVizIsland from './regularization-viz/RegularizationVizIsland';
import { SINE_REGULARIZATION, SINE_TEST, SINE_TRAIN } from '@data/datasets/sine';
// + getStrings(…, 'vizRegularization'), getPageLocale, renderInlineMarkup, inlineMarkupLabel, axis() as in PolyFitViz
// description = SINE_TRAIN.description + ' ' + SINE_TEST.description (page locale)
---
<div class="atlas-viz not-content" lang={locale} data-pagefind-ignore>
  <RegularizationVizIsland client:visible={{ rootMargin: '200px' }} train={SINE_TRAIN.rows} test={SINE_TEST.rows}
    config={SINE_REGULARIZATION} axes={…} itemLabels={…} description={…}
    labels={{ lambdaHtml: renderInlineMarkup(strings.lambdaLabel), lambdaText: inlineMarkupLabel(strings.lambdaLabel) }}
    strings={strings} />
  <noscript><p class="atlas-viz-noscript">{tCommon.needsScript}</p></noscript>
</div>
```

```ts
// src/components/viz/regularization-viz/RegularizationVizIsland.tsx
import { SINE_LASSO_PATH } from '../../../data/datasets/sine-lasso-path'; // in the JS chunk, not in props (10.2.4 D)
export interface RegularizationVizIslandProps {
  train: readonly Row[]; test: readonly Row[];
  config: RegularizationConfig;
  axes: { x: AxisText; y: AxisText };
  itemLabels: { train: string; test: string };
  description: string;
  labels: { lambdaHtml: string; lambdaText: string };
  strings: UiStrings<'vizRegularization'>;
}
// State: index = config.slider.initial, penalty = config.initialPenalty, live = ''. hydrated = useHydrated().
// Memo once: s = standardizer(train, degree); paths = penaltyPath(train, test, config, SINE_LASSO_PATH);
//   best = { ridge: bestLevel(paths.ridge), lasso: bestLevel(paths.lasso) }.
// Memo on (penalty, index): curve = toPolyline(sampleCurve(x => predictPenalized(fit, x, s), xDomain, samples), …).
// Every render: fit = paths[penalty][index]; zone = levelZone(paths[penalty], index).
// Live: useSettled(index) → announce; a penalty button announces at once.
```

Không có `truthPoints`, nên wrapper không chạy `Math.sin`.

#### 10.4.5. Hành vi và bố cục

Thứ tự từ trên xuống, giữ nguyên trên điện thoại:

1. **Chú thích** (`figcaption`): `caption`.
2. **Đồ thị chính** (`PlotFrame`, `aria-label` = `plotLabel`, mô tả = `description`): đường bậc 15 (`PlotCurve` lớp `atlas-viz-primary`), 8 điểm test (`circle.atlas-viz-ring`), 16 điểm train (`circle.atlas-viz-point`), như `PolyFitViz`.
3. **Chú giải** (3 mục): ● train, ○ test, ─ `curve`.
4. **Điều khiển** (`role="group"`, `aria-label` = `controls`):
   - `VizSlider`: nhãn `lambdaLabel` (KaTeX), số hiện là `formatLambda`, `aria-valuetext` = `lambdaValueText` với chuỗi đọc to;
   - hàng nút `div.atlas-viz-choice` (`role="group"`, `aria-label` = `penalty`): hai `<button aria-pressed>` lớp `atlas-viz-toggle`, nhãn cố định `ridge`, `lasso`, **không** có ô check (`atlas-viz-toggle-box`), vì đây là chọn một trong hai. Nút đang chọn **tô đầy màu nhấn**: nền `accent`, chữ `black` (chữ đậm 600 có sẵn), tương phản chữ 7.42 (tối) / 6.42 (sáng). Nút chưa chọn giữ như mọi `atlas-viz-toggle` (nền `gray-5`, chữ `white`, 8.75 / 9.21); nền hai trạng thái chênh nhau 4.63 / 3.79, nên không lẫn. Quy tắc chỉ áp dụng trong `.atlas-viz-choice`, không đổi nút bật/tắt của `PolyFitViz` và `LinearFitViz` (review của `analyst`, quyết định 50). Bấm nút đang chọn thì không làm gì.
5. **Dòng số** (`.atlas-viz-readouts`, 3 dòng): MSE train, MSE test (**không có mẫu nét**: không đường nào trên đồ thị ứng với MSE; ô mẫu để trống, `span.atlas-viz-swatch`, để ba dòng thẳng hàng; quyết định 50), rồi `zeros` với mẫu là vòng "0", số dạng `10/15` (ghép bằng `formatNumber`, không phải chuỗi giao diện).
6. **Biểu đồ cột** (`PlotFrame shape="short"`, trục `featureAxis` và `coefAxis`, `aria-label` = `barsLabel`, mô tả = `barsDesc`). Với mỗi $k$, đặt ở $x = k$:
   - $w_k \ne 0$: `line.atlas-viz-bar` từ $y(0)$ tới $y(\operatorname{clamp}(w_k, -10, 10))$, cộng mầm 2px là một `line.atlas-viz-bar` trong `AtPoint` tại $(k, 0)$ (`y2` bằng `-2` hoặc `2`);
   - $|w_k| > 10$: thêm tam giác rỗng `polygon.atlas-viz-ring` trong `AtPoint` ở mép, đỉnh chạm mép, chỉ ra ngoài (`'0,1 6,11 -6,11'` ở mép trên, `'0,-1 6,-11 -6,-11'` ở mép dưới). Nền tam giác là màu vùng vẽ nên che đầu cột;
   - $w_k = 0$: `circle.atlas-viz-zero`, $r = 4$, tại $(k, 0)$.
7. **Chú giải biểu đồ cột** (1 mục, luôn hiện): mẫu tam giác + `overNote` (`{{max}}` = `10`).
8. **Dòng trạng thái**: một `p` (`underfit` / `goodFit` / `overfit`), thêm `p.atlas-viz-near` ✓ `bestLambda` khi `index === best[penalty]`.
9. Phần ẩn: hai mô tả `sr-only`, vùng live.

**Thanh trượt:** đổi mức thì vẽ lại ngay đường cong, cột, dòng số, dòng trạng thái. Sau `SETTLE_MS`, vùng live đọc `announce`. **Nút Ridge/Lasso:** đổi mô hình, giữ mức $\lambda$; vùng live đọc `announce` ngay (`aria-pressed` chỉ báo nút nào đang bật, không báo số).

**Chống xê dịch:** dòng số và chú giải không đổi số dòng; dòng trạng thái ở cuối (mục 2.8). **Trước khi hydrate:** Ridge, $\lambda = 0$, điều khiển có `disabled`, có `<noscript>`.

**Số phần tử trong biểu đồ cột** (test đếm trong `.atlas-viz-plot` thứ hai):

| Trạng thái | `line.atlas-viz-bar` | `polygon.atlas-viz-ring` | `circle.atlas-viz-zero` |
|---|---:|---:|---:|
| Ridge, $\lambda = 0$ (lúc tải) | 30 | 15 | 0 |
| Lasso, $\lambda = 10^{-3}$ | 10 | 0 | 10 |
| Lasso, $\lambda = 10$ | 0 | 0 | 15 |

Các phép thử (3), (4), (6) của `viz.spec.ts` bấm lần lượt mọi nút (Ridge rồi Lasso), nên lượt "toggles on" đo tương phản ở trạng thái Lasso, **nhưng vẫn ở $\lambda = 0$**: Lasso lúc đó có 0 hệ số bằng 0, nên vòng "0" (`circle.atlas-viz-zero`) **không** hiện trong biểu đồ cột (`tester` phát hiện). Vòng chỉ hiện khi kéo $\lambda$ lên (từ $10^{-14}$ đã có 1 vòng; ở $10^{-3}$ có 10). Muốn đo tương phản của vòng thì phép thử phải kéo thanh trượt trước, hoặc đo ở mẫu của dòng `zeros` (luôn hiện). Phép thử Tab (5) đi qua thanh trượt, Ridge, Lasso: không cần sửa test. Đây là lý do chọn hai nút `aria-pressed` thay vì radio (câu hỏi 2).

#### 10.4.6. `viz.css`: phần thêm và tương phản

| Thêm | Khai báo | Dùng cho |
|---|---|---|
| `.atlas-viz-bar` | nét `--atlas-viz-primary`, `stroke-width: 10px`; `16px` trong container query 32rem có sẵn | Cột hệ số và mầm 2px. Cùng màu với đường khớp, vì đó là hệ số của chính đường ấy |
| `.atlas-viz-zero` | `fill: var(--atlas-viz-plot-bg)`, nét `--atlas-viz-ink` 2px | Vòng "bằng đúng 0". Màu mực, khác vòng điểm test (xanh dương) |
| `.atlas-viz-choice` | `display: flex; flex-wrap: wrap; gap: 8px` | Hàng hai nút Ridge/Lasso |
| `.atlas-viz-choice > .atlas-viz-toggle[aria-pressed='true']` | nền và vạch `--sl-color-accent`, chữ `--sl-color-black` | Nút đang chọn (10.4.5). Thêm sau review của `analyst` |

- Ước tính thêm khoảng 150 byte gzip (sau khi bỏ comment): `viz.css` từ 1 670 lên khoảng 1 820 byte, tức 71% ngân sách 2 560.
- **Một cặp màu mới** (nút đang chọn): chữ `black` trên nền `accent`, 7.42 / 6.42, tính từ token trong `custom.css`; cùng cặp với nút chính của trang (`custom.css`, nền `accent`, chữ `black`).
- Còn lại không có cặp màu mới: cột dùng `accent` (7.42 / 6.42 trên nền vùng vẽ, tối / sáng), vòng "0" dùng `white` (14.00 / 15.61), tam giác dùng `blue-high` (9.24 / 11.68). Số đo ở mục 4.9 và 9.4.7.

#### 10.4.7. Chuỗi `vizRegularization` (24 key)

| Key | vi | en |
|---|---|---|
| `caption` | Kéo thanh trượt để đổi λ, bấm Ridge hoặc Lasso để đổi kiểu phạt. Đa thức luôn có bậc 15 và chỉ được khớp trên các điểm train. | Drag the slider to change λ, and press Ridge or Lasso to change the penalty. The polynomial always has degree 15 and is fitted to the training points only. |
| `plotLabel` | Biểu đồ phân tán {{train}} điểm train và {{test}} điểm test, cùng đa thức bậc 15 khớp bằng {{model}} với λ = {{lambda}}. | Scatter plot of {{train}} training points and {{test}} test points, with the degree-15 polynomial fitted by {{model}} at λ = {{lambda}}. |
| `barsLabel` | Biểu đồ cột 15 hệ số của {{model}} với λ = {{lambda}}: {{zeros}} hệ số bằng đúng 0, {{over}} hệ số vượt khung. | Bar chart of the 15 coefficients of {{model}} at λ = {{lambda}}: {{zeros}} exactly zero, {{over}} off the chart. |
| `barsDesc` | Mỗi cột là hệ số wₖ của đặc trưng xᵏ đã chuẩn hóa, k từ 1 đến 15. Cột hướng lên là hệ số dương, hướng xuống là hệ số âm. | Each bar is the coefficient wₖ of the standardized feature xᵏ, for k from 1 to 15. Bars up are positive, bars down are negative. |
| `controls` | Chọn λ và kiểu phạt | Choose λ and the penalty |
| `lambdaLabel` | Hệ số phạt $\lambda$ | Penalty strength $\lambda$ |
| `lambdaValueText` | λ bằng {{value}} | λ equals {{value}} |
| `pow10Spoken` | 10 mũ {{exp}} | 10 to the power {{exp}} |
| `zeroLambda` | 0 (không phạt) | 0 (no penalty) |
| `penalty` | Kiểu phạt | Penalty |
| `ridge` | Ridge (L2) | Ridge (L2) |
| `lasso` | Lasso (L1) | Lasso (L1) |
| `curve` | Đa thức bậc 15 đã khớp | Fitted degree-15 polynomial |
| `trainMse` | MSE train | Training MSE |
| `testMse` | MSE test | Test MSE |
| `zeros` | Hệ số bằng đúng 0 | Coefficients exactly zero |
| `featureAxis` | k (đặc trưng xᵏ đã chuẩn hóa) | k (standardized feature xᵏ) |
| `coefAxis` | Hệ số wₖ | Coefficient wₖ |
| `overNote` | Vượt khung (trị tuyệt đối lớn hơn {{max}}) | Off the chart (absolute value above {{max}}) |
| `underfit` | Underfitting: phạt quá nặng, hệ số bị ép về gần 0, cả MSE train lẫn MSE test đều lớn. | Underfitting: the penalty is too strong; the coefficients are squeezed towards 0 and both training and test MSE are high. |
| `goodFit` | Vừa khớp: MSE test còn thấp. | A good fit: test MSE stays low. |
| `overfit` | Overfitting: phạt quá nhẹ, hệ số rất lớn và đường cong uốn theo cả nhiễu, MSE test lớn. | Overfitting: the penalty is too weak; the coefficients are huge, the curve follows the noise, and test MSE is high. |
| `bestLambda` | Mức λ có MSE test nhỏ nhất trên thanh trượt. | The λ on the slider with the smallest test MSE. |
| `announce` | {{model}}, λ = {{lambda}}: MSE train {{train}}, MSE test {{test}}, {{zeros}} trên {{total}} hệ số bằng 0. {{zone}} | {{model}}, λ = {{lambda}}: training MSE {{train}}, test MSE {{test}}, {{zeros}} of {{total}} coefficients are zero. {{zone}} |

- `{{model}}` là chuỗi `ridge` hoặc `lasso`. `{{lambda}}` ở chữ nhìn thấy là `formatLambda`; ở `announce`, `lambdaValueText` và các `aria-label` là chuỗi đọc to (`zeroLambda` ở mức 0, `pow10Spoken` khi số mũ ≤ −4).
- Chữ "λ" trong chuỗi là ký tự Unicode; chỉ `lambdaLabel` đi qua KaTeX. "wₖ", "xᵏ" dùng ký tự chỉ số Unicode, không KaTeX.

#### 10.4.8. Hợp đồng với `lesson-writer` (bài `ml/regularization`)

1. **Ký hiệu và công thức:** đúng mục 10.2.1. Viết $\lambda\lVert\mathbf{w}\rVert_2^2$ và $\lambda\lVert\mathbf{w}\rVert_1$ với $\mathcal{L}$ là MSE (hệ số $\frac{1}{m}$), $b$ không phạt. Nghiệm Ridge $\left(\mathbf{X}^\top\mathbf{X} + m\lambda\mathbf{I}\right)\mathbf{w} = \mathbf{X}^\top\mathbf{y}$ với đặc trưng đã trừ trung bình. Nói rõ `alpha` của scikit-learn: với `Ridge` là $m\lambda$, với `Lasso` là $\lambda/2$; đây là một "Lỗi hay gặp" tốt. Elastic Net: $\mathcal{L} + \lambda_1\lVert\mathbf{w}\rVert_1 + \lambda_2\lVert\mathbf{w}\rVert_2^2$, ánh xạ ở bảng 10.2.1.
2. **Pipeline trong mọi ô:** `make_pipeline(PolynomialFeatures(15, include_bias=False), StandardScaler(), model)` trên `x_train[:, None]`, hai khối `# dataset: sine-train` / `sine-test` như mục 9.4.1. Thêm `'ml/regularization'` vào `lessons` của `SINE_TRAIN` và `SINE_TEST`. Hệ số đọc bằng `model[-1].coef_`, $b$ bằng `model[-1].intercept_`.
3. **Ba ô code** (đã chạy với cảnh báo thành lỗi; không có cảnh báo nào):
   - **Ô 1, Ridge**, $\lambda \in \{10^{-12}, 10^{-8}, 10^{-3}, 10^{-1}, 10\}$, `Ridge(alpha=len(x_train) * lam)`: MSE train/test `0.0102/0.5375`, `0.0244/0.1026`, `0.0491/0.0894`, `0.0999/0.1747`, `0.3148/0.4750`; $\max_k|w_k|$ = 26594.49, 131.61, 2.75, 0.29, 0.04. Không dùng $\lambda < 10^{-12}$ với solver mặc định (mục 10.2.4).
   - **Ô 2, Lasso**, $\lambda \in \{10^{-3}, 10^{-2}, 10^{-1}\}$, `Lasso(alpha=lam / 2, max_iter=100_000, tol=1e-6)`: `0.0314/0.0851`, 10 hệ số bằng 0, còn lại $k = 1, 2, 4, 9, 15$; `0.0767/0.1341`, 11 hệ số bằng 0, còn lại $k = 1, 2, 6, 7$; `0.1217/0.2277`, 12 hệ số bằng 0, còn lại $k = 1, 2, 15$. Đếm bằng `np.sum(coef == 0)`. Không dùng $\lambda \le 10^{-4}$ và $\lambda = 1$ (mục 10.2.5).
   - **Ô 3, chọn $\lambda$ bằng kiểm định chéo, có Elastic Net.** Đã thử trên lưới bậc mười: `KFold(n_splits=4, shuffle=True, random_state=0)` chọn **Ridge $\lambda = 0.1$** (MSE kiểm định 0.1605, MSE test 0.1747), **không** phải $10^{-3}$. `LeaveOneOut`, `KFold(8)` và các `random_state` khác cũng chọn 0.1. Lý do: fold nào giữ lại điểm ở mép thì đa thức bậc 15 phải ngoại suy, nên kiểm định chéo nghiêng về phạt nặng hơn. Lời văn phải nói thật điều này, không đổi kịch bản để số "đẹp". Với Lasso hay Elastic Net trong kiểm định chéo: ở $\lambda = 10^{-3}$ các fold có `ConvergenceWarning`, nên lưới cho phần L1 bắt đầu từ $10^{-2}$ (hoặc tăng `max_iter`), rồi chạy lại để chắc không còn cảnh báo. Điểm tham khảo: `ElasticNet(alpha=5e-4, l1_ratio=0.5, max_iter=100_000, tol=1e-6)` khớp trên cả tập train cho `0.0375/0.0842`, 5 hệ số bằng 0, không cảnh báo. Số của ô 3 do `lesson-writer` chạy và `content-reviewer` kiểm.
4. **Số trong lời văn** lấy từ bảng 10.2.3 và các ô code. Với $\lambda = 0$ trích "khoảng 133". Dấu chấm thập phân (quyết định 22).
5. **Vì sao $\lambda$ nhỏ tới $10^{-12}$ đã có tác dụng:** các đặc trưng $x, x^2, \dots, x^{15}$ gần như trùng nhau, nên các hệ số khổng lồ của bậc 15 chỉ cần một chút phạt là bị dập. Một câu là đủ. Nếu dùng từ "đa cộng tuyến" (multicollinearity) thì thêm vào glossary.
6. **Một câu về phần Lasso của VIZ** (mục 10.2.5): ở $\lambda$ rất nhỏ coordinate descent hội tụ rất chậm, nên minh họa dùng nghiệm tính sẵn bằng cách giải chính xác.
7. **Chỗ đặt VIZ** (mục Minh họa). Comment giữ chỗ:

   ```mdx
   {/* VIZ: RegularizationViz
       Ý: tăng λ thì hệ số co lại; λ quá nhỏ overfit, quá lớn underfit, λ vừa cho MSE test thấp nhất; Lasso đưa nhiều hệ số về đúng 0.
       Tương tác: thanh trượt λ (0, 10⁻¹⁴ … 10), nút Ridge / Lasso.
       Dữ liệu: sine-train, sine-test; đa thức bậc 15, đặc trưng đã chuẩn hóa.
       Ký hiệu: λ, w_k, MSE train, MSE test (như mục Lý thuyết). */}
   ```

   Ở R1, `viz-builder` thay bằng comment một dòng `{/* VIZ: λ vừa cho MSE test nhỏ nhất; Lasso đưa nhiều hệ số về đúng 0, Ridge chỉ làm chúng nhỏ lại. */}`, rồi tới `<RegularizationViz />`.
8. **Glossary:** "hệ số phạt" (penalty strength, regularization strength); "chuẩn hóa đặc trưng" (feature standardization) nếu chưa có; "thưa" (sparse) nếu bài dùng.

#### 10.4.9. Ngân sách

| Mục | Giới hạn (mục 2.9) | Dự kiến | Đo ở R1 (24/10/2026) |
|---|---|---|---|
| Gói npm mới | 0 | 0 | 0 |
| JS riêng của `RegularizationVizIsland` | ≤ 10 KB gzip | Khoảng 7 KB: island khoảng 4.5 KB, `regularized-fit.ts` khoảng 0.8 KB, `sine-lasso-path.ts` **1.7 KB** (đo trên bản in thử: 3 450 byte, 1 728 byte gzip). `poly-fit.ts`, kit và `format` dùng chung với `PolyFitViz` nên không tính | **5 198 byte gzip**, một file `RegularizationVizIsland.*.js` (đã gồm `regularized-fit.ts` và `sine-lasso-path.ts`), đo bằng cách tính của `viz.spec.ts` |
| `props` | ≤ 8 KB | Khoảng 5.5 KB: 24 chuỗi khoảng 2.5 KB, 24 điểm 0.6 KB, cấu hình khoảng 1.2 KB, KaTeX của "$\lambda$" khoảng 0.4 KB. Không có `truthPoints` | **6 243 byte** (thuộc tính `props` của `astro-island`, bản vi) |
| `viz.css` | ≤ 2 560 byte gzip, bỏ comment | Khoảng 1 820 | **1 713 byte** (67%) |
| Tính toán | | Lúc mount: 16 phép QR cỡ 31 × 15, dưới 1 ms. Mỗi lần kéo hay bấm: 201 × 15 phép nhân-cộng | Không thấy giật khi kéo |
| Chiều cao ở 375px | | Khoảng 1 100–1 150px (`PolyFitViz` đo được 1 081px). Ba dòng số thay vì hai, bỏ nút "Hiện hàm thật", biểu đồ cột thay biểu đồ sai số. Không đổi khi kéo hay bấm | **1 085px** (máy tính, cột 1 280px: 1 224px). Cao thêm 28px khi hiện dòng ✓ `bestLambda` ở cuối, như `PolyFitViz`; phần trên không xê dịch |

### 10.5. Phụ thuộc

Không thêm gói npm. Script và fixture dùng venv mục 2.5 (NumPy, scikit-learn) cộng thư viện chuẩn `fractions`. **Không** cài `mpmath` hay gói nào khác vào venv, để venv vẫn khớp Pyodide.

### 10.6. Các bước thực hiện

Mỗi bước của `viz-builder` kết thúc bằng `npm run build` (không `[WARN]`), `npm run check` (0 lỗi 0 cảnh báo) và `npm test`.

**Thứ tự:** R0 → L → `content-reviewer` (bài thành `published`) → R1 → R2 → R3 → R4. R0 và L không sửa chung file nên **chạy song song được**. Làm R0 trước thì L trích số từ fixture thay vì từ tài liệu này, an toàn hơn.

**Ai tạo file dữ liệu λ/hệ số:** `viz-builder` ở R0 (script, file sinh ra, cấu hình `SINE_REGULARIZATION`). `lesson-writer` không tạo hay sửa các file này; chỉ thêm `'ml/regularization'` vào `lessons` của hai bộ `sine`.

| # | Agent | Việc | Tiêu chí hoàn thành |
|---|---|---|---|
| R0 | `viz-builder` | **Toán, dữ liệu, fixture.** Viết `scripts/sine-lasso-path.py` theo mục 10.2.4 (6 bước), chạy bằng venv, sinh `sine-lasso-path.ts` và `fixtures/regularization-python.ts`. Viết `regularized-fit.ts` (10.4.2), thêm `SINE_REGULARIZATION` vào `sine.ts` (10.4.3). Viết `regularized-fit.test.ts` (không dùng dữ liệu thật) và `regularization-sine.test.ts` | Script in "KKT ok" cho 16 mức, đối chiếu scikit-learn qua, không cảnh báo. **`regularized-fit.test.ts`:** `standardizer` trên 3 điểm tính tay; `features` cho trung bình 0, độ lệch chuẩn 1 trên train; `ridgeFit` trên bài 4 × 2 khớp $(\mathbf{Z}_c^\top\mathbf{Z}_c + m\lambda\mathbf{I})^{-1}\mathbf{Z}_c^\top\mathbf{y}_c$ tính tay tới 1e-12; $\lambda$ rất lớn cho $\lVert\mathbf{w}\rVert < 10^{-6}$; throw khi $\lambda \le 0$; `bestLevel` lấy $\lambda$ lớn hơn khi bằng nhau; `levelZone` ra đủ ba vùng trên bộ số tự chế, kể cả trường hợp "test gấp đôi nhưng train chưa gấp đôi" là vừa khớp; `formatLambda` ra `0`, `0.001`, `10`, `10⁻⁴`, `10⁻¹⁴`; quét nguồn `regularized-fit.ts` không có `**`, `Math.pow`, `Math.hypot`, `Math.exp`, `Math.log`, `Math.sin`, `Math.cos`. **`regularization-sine.test.ts`:** ràng buộc 10.4.3; bản sao `rows` trong fixture bằng dữ liệu `sine`; với cả 17 mức × 2 mô hình, MSE train và MSE test của TS khớp fixture trong $10^{-6} \cdot \max(1, \lvert v\rvert)$ và chuỗi `formatMse` bằng nhau (68/68); số hệ số bằng 0 khớp fixture; Ridge có 0 hệ số bằng 0 ở mọi $\lambda > 0$; KKT dạng số thực cho Lasso ở $\lambda \ge 10^{-6}$, với $g_j = \frac{2}{m}\mathbf{z}_j^\top\mathbf{r}$: $\lvert g_j - \lambda\,\mathrm{sign}(w_j)\rvert \le 10^{-6}\lambda$ khi $w_j \ne 0$, $\lvert g_j\rvert \le (1 + 10^{-6})\lambda$ khi $w_j = 0$ (đo được $1.2 \times 10^{-8}$ và 0.990); dự đoán của hàng $\lambda = 0$ khớp `fitPolynomial(train, 15, xDomain)` của `poly-fit.ts` trên lưới $x = 0, 0.1, \dots, 1$ trong $10^{-3} \cdot \max(1, \lvert v\rvert)$; câu chuyện 10.2.3: `bestLevel` của cả hai là mức $10^{-3}$, vùng đúng như bảng, MSE test ở $\lambda = 0$ ≥ 100, Lasso có 10 hệ số bằng 0 ở mức tốt nhất |
| L | `lesson-writer` | Theo mục 10.4.8: viết bài vi, 3 ô code, comment giữ chỗ VIZ, thêm bài vào `lessons` của hai bộ `sine` | `datasets.test.ts` qua với 6 file `.py`. Output ô 1 và ô 2 khớp 10.4.8 ý 3, chạy bằng venv mục 2.5 với cảnh báo thành lỗi. `content-reviewer` đã duyệt |
| R1 | `viz-builder` | **CSS, chuỗi, VIZ.** Phần thêm của `viz.css` (10.4.6). 24 key `vizRegularization` vào `ui.ts`, `vi.json`, `en.json`. Wrapper và island (10.4.4–10.4.5). Thay comment giữ chỗ bằng import, comment một dòng và `<RegularizationViz />`. Tự xem trên `npm run preview` ở 375px và máy tính, sáng và tối (chỉ chạy khi không có agent khác đang build hay chạy e2e) | `viz-conventions.test.ts`, `i18n.test.ts` qua. `dist/vi/ml/regularization/index.html` có đúng một `.atlas-viz`, island còn `ssr`; biểu đồ cột lúc tải có 30 `line.atlas-viz-bar` và 15 `polygon.atlas-viz-ring`; dòng số hiện `0.0000`, `133.20`, `0/15`. Xem tay: kéo, phím mũi tên, Home/End đều vẽ lại; Lasso ở $10^{-3}$ có 10 vòng "0" và hiện `0.0314`, `0.0851`, `10/15`; đổi Ridge ↔ Lasso giữ $\lambda$, không gì xê dịch; console không lỗi hydrate. Ghi số đo thật vào 10.4.9: JS riêng gzip, `props`, `viz.css` gzip, chiều cao ở 375px. `PolyFitViz` và `LinearFitViz` không đổi |
| R2 | `tester` | **Mở rộng test chung, không viết spec riêng.** Trong `viz.spec.ts`, hàm `measureContrast`: đo `stroke` của `line.atlas-viz-bar` và `circle.atlas-viz-zero` trong vùng vẽ; với mẫu nét, `circle.atlas-viz-zero` đo `stroke` như vòng rỗng. Thêm `line.atlas-viz-bar` vào phép thử (4) "control". Chạy `npm test`, `npm run test:e2e` | `test:e2e` qua ở `desktop` và `mobile` trên `/vi/ml/regularization/`, trên trang fallback `/en/...`, và trên mọi trang VIZ cũ. Thử phá (rồi trả lại): cho `.atlas-viz-bar` bằng màu nền vùng vẽ thì test tương phản fail đúng chỗ |
| R3 | `analyst` | Review theo mục 2, 9 và 10 | Báo cáo có số đo: JS riêng gzip, `props`, `viz.css` gzip, chiều cao ở 375px, tương phản đo thật, `package.json` không đổi, Lighthouse mobile của bài. Chạy lại `scripts/sine-lasso-path.py` và xác nhận hai file sinh ra không đổi (`git diff` rỗng) |
| R4 | **người dùng** | Duyệt VIZ trên bài thật, cả trên điện thoại thật, cùng lượt duyệt bản vi (quyết định 36) | Đồng ý, hoặc có danh sách chỗ sửa |

Bản en của bài làm sau MVP (quyết định 43). Trước đó `/en/...` là trang fallback, nên `viz.spec.ts` kiểm chuỗi en ngay từ R2.

### 10.7. Rủi ro và điểm chưa chắc

| # | Rủi ro | Cách xử lý |
|---|---|---|
| 1 | Người đọc tự sửa ô code để chạy Lasso ở $\lambda \le 10^{-4}$ sẽ gặp `ConvergenceWarning` và số khác VIZ | Lời văn có một câu giải thích (10.4.8 ý 6). Ô code không dùng các mức đó |
| 2 | `Ridge` mặc định của scikit-learn lệch ở $\lambda \le 10^{-13}$ (Cholesky) | Fixture tham chiếu nghiệm chính xác; ô code chỉ dùng $\lambda \ge 10^{-12}$ |
| 3 | $\lambda = 1$ sát $\lambda_{\max} = 1.0005$: VIZ hiện Lasso 14/15 hệ số bằng 0 (một hệ số $-2.3 \times 10^{-4}$, chỉ thấy mầm 2px), còn coordinate descent với `tol` thường báo 15/15 | Đúng về toán. Ô code không dùng $\lambda = 1$. Nếu người dùng thấy rối thì đổi hai mức cuối thành $\{2, 10\}$ hoặc bỏ mức 1 (phải chạy lại script) |
| 4 | Kiểm định chéo chọn $\lambda = 0.1$, khác mức tốt nhất trên tập test ($10^{-3}$) mà VIZ đánh dấu ✓ | Lời văn giải thích: dấu ✓ của VIZ nhìn vào tập test, việc mà thực tế không được làm; kiểm định chéo mới là cách đúng, và ở đây nó thận trọng hơn vì phải ngoại suy ở mép fold |
| 5 | Mức tốt nhất thật của Ridge ($\approx 3 \times 10^{-4}$) nằm giữa hai nấc | Chấp nhận (phương án A ở 10.2.2). Lời văn nhắc nếu muốn |
| 6 | Nâng Pyodide (NumPy, scikit-learn) có thể đổi vài bit của $\mathbf{Z}$; hàng $\lambda = 0$ và Lasso ở $\lambda \le 10^{-12}$ nhạy với điều đó | Script chạy lại trong khoảng 10 giây; R3 kiểm `git diff` rỗng. Dung sai của test đặt theo số đo, và chuỗi hiện ra còn khoảng dư lớn (MSE test ở $\lambda = 0$ là 133.1973, cách mốc làm tròn 0.0023) |
| 7 | Hai nút `aria-pressed` cho lựa chọn một trong hai: ARIA chấp nhận, nhưng radio đúng ngữ nghĩa hơn | Câu hỏi 2. Dùng radio thì phải sửa phép thử Tab (5) và vòng "bấm mọi nút" (3), (4), (6) của `viz.spec.ts` |
| 8 | VIZ cao khoảng 1 100–1 150px, chưa đo | R1 đo. Nếu quá cao: gom chú giải 3 mục vào 1 hàng; biểu đồ cột `aspect-ratio: 5 / 2` trên màn hẹp |
| 9 | `scripts/` là thư mục mới | Chỉ một file, chạy tay. Đổi chỗ dễ (sửa header của hai file sinh ra) |

#### Câu hỏi cho người dùng

1. **Lưới λ của thanh trượt.**
   - **(Recommended)** 17 mức: 0, rồi $10^{-14}, 10^{-13}, \dots, 10$. Cả Ridge và Lasso đi đủ overfit → vừa → underfit; nhãn là lũy thừa 10.
   - 11 mức: 0, rồi $10^{-8} \dots 10$. Gọn hơn, nhưng Ridge chỉ overfit ở đúng mức 0.
   - 28 mức nửa bậc mười ($1, 3, 10, \dots$). Bắt được đáy thật của Ridge, nhưng nhiều nấc, nhãn kiểu "3 × 10⁻⁵".
2. **Nút chuyển Ridge/Lasso.**
   - **(Recommended)** Hai nút bật/tắt (`aria-pressed`), như nút "Hiện đường tốt nhất". Dùng ngay test chung, không sửa `viz.spec.ts`.
   - Nhóm radio. Đúng ngữ nghĩa "chọn một" hơn, phím mũi tên đổi lựa chọn, nhưng phải sửa ba phép thử chung và thêm CSS.
3. **Thang trục của biểu đồ cột.**
   - **(Recommended)** Tuyến tính cố định $[-10, 10]$, cột vượt khung có tam giác; mầm 2px cho hệ số nhỏ khác 0, vòng "0" cho hệ số bằng đúng 0.
   - Symlog: thấy mọi bậc độ lớn, nhưng khó đọc với người mới.

**Các lựa chọn tự quyết, đổi lại được sau R4:**

- Tên `RegularizationViz`, namespace `vizRegularization`, file `regularized-fit.ts`, `sine-lasso-path.ts`, script ở `scripts/sine-lasso-path.py`.
- Mức ban đầu: Ridge, $\lambda = 0$.
- Hiển thị $\lambda$: số thập phân từ 0.001 trở lên, `10⁻ᵏ` từ $10^{-4}$ trở xuống.
- Luật vùng: underfitting cần cả MSE test lẫn MSE train gấp đôi mức tốt nhất (10.2.7).
- Không có nút "Hiện hàm thật", không có biểu đồ MSE theo λ.
- Cột hệ số cùng màu nhấn với đường khớp; vòng "0" màu mực.
