# Hồi quy tuyến tính

Bài: `ml/linear-regression` (bài mẫu M2). Quyết định đã chốt trong `docs/mvp.md` mục 7, số 18–21: dẫn đầy đủ một đặc trưng, dạng ma trận chỉ nêu phương trình chuẩn; bảng căn hộ tự tạo (diện tích m² → giá thuê); VIZ `LinearFitViz` hai thanh trượt $w$, $b$; 3 ô code, 4 câu quiz.

Ngày kiểm tra tất cả nguồn: **23/10/2026**. Mọi con số trong mục "Số đã chạy thử" do `summarizer` tự chạy, không lấy từ sách.

Ký hiệu thẻ nguồn dùng bên dưới: [ISL], [MML], [CS229], [SK], [NP], [MLCB]. Ý nào không có thẻ nguồn là kiến thức chung hoặc gợi ý của `summarizer`; nếu có số liệu thì đã tự chạy thử.

## Nguồn

Các nguồn dưới đây đều đã mở được ngày 23/10/2026.

- **[ISL]** James, G., Witten, D., Hastie, T., Tibshirani, R. (2013; trang bản quyền ghi bản sửa ở lần in thứ 8, năm 2017). *An Introduction to Statistical Learning, with Applications in R* (**bản 1**), Springer. Chương 3 Linear Regression, các mục 3.1.1, 3.2.1, 3.3.2, 3.3.3. [Trang sách](https://www.statlearning.com/), [PDF bản 1](https://www.statlearning.com/s/ISLR-Seventh-Printing.pdf).
  - Lưu ý phiên bản: trang statlearning.com cho biết đã có bản 2 (2021, PDF sửa tháng 6/2023) và bản Python (2023), nhưng PDF bản 2 nằm ở `hastie.su.domains` và **không mở được** (xem cuối mục). Nội dung chương 3 dưới đây đọc từ **bản 1**. Số mục và số trang có thể khác ở bản 2, nên kiểm lại trước khi trích số mục.
  - Quyền sử dụng: trang chỉ có nút tải PDF, không nêu giấy phép. Chỉ dẫn link, không chép.
- **[MML]** Deisenroth, M. P., Faisal, A. A., Ong, C. S. (2020). *Mathematics for Machine Learning*, Cambridge University Press. Chương 9 Linear Regression, các mục 9.1, 9.2.1, 9.2.2, 9.4. [Trang sách](https://mml-book.github.io/), [PDF](https://mml-book.github.io/book/mml-book.pdf).
  - Bản PDF đọc là bản nháp đề ngày 15/01/2024. Đầu chương ghi bản PDF này "free to view and download for personal use only" và không cho phân phối lại hay dùng trong tác phẩm phái sinh. Vì vậy chỉ dẫn link, tuyệt đối không chép câu chữ hay hình.
- **[CS229]** Ng, A. (2003; đầu trang 2 của PDF ghi CS229 Winter 2003). *CS229 Lecture notes*, phần Supervised learning và Part I Linear Regression (LMS algorithm, The normal equations, Probabilistic interpretation, Locally weighted linear regression). [PDF](https://see.stanford.edu/materials/aimlcs229/cs229-notes1.pdf).
  - Đây là bản sao cũ trên `see.stanford.edu`, vì trang `cs229.stanford.edu` không mở được. Ký hiệu của bản này ($\theta$, $x_0=1$, $m$ mẫu, $n$ đặc trưng, $J(\theta)$ có hệ số $\tfrac12$) có thể khác các bản bài giảng mới hơn.
- **[SK]** scikit-learn developers (© 2007–2026, BSD License, theo chân trang). *scikit-learn 1.8.0 documentation*: User Guide mục 1.1.1 Ordinary Least Squares ([link](https://scikit-learn.org/1.8/modules/linear_model.html)) và trang API [`sklearn.linear_model.LinearRegression`](https://scikit-learn.org/1.8/modules/generated/sklearn.linear_model.LinearRegression.html).
  - Vì sao 1.8 chứ không phải bản mới nhất: Pyodide 314.0.7 của site chạy scikit-learn 1.8.0 (xem `docs/architecture/components.md` mục 2.5). Trang "stable" hiện là **1.9.1**, và mô tả tham số `tol` đã khác: ở 1.8 ghi rằng tham số này không có tác dụng với dữ liệu dày, ở 1.9.1 ghi rằng nó được truyền làm `cond` cho `scipy.linalg.lstsq` với dữ liệu dày. Bài chỉ nên dẫn trang 1.8.
  - Trích: "From the implementation point of view, this is just plain Ordinary Least Squares (scipy.linalg.lstsq) or Non Negative Least Squares (scipy.optimize.nnls) wrapped as a predictor object."
- **[NP]** NumPy Developers (© 2008–2025, theo chân trang). *NumPy v2.4 Manual*: [`numpy.linalg.lstsq`](https://numpy.org/doc/2.4/reference/generated/numpy.linalg.lstsq.html) và [`numpy.linalg.solve`](https://numpy.org/doc/2.4/reference/generated/numpy.linalg.solve.html).
  - Chọn v2.4 vì Pyodide của site có numpy 2.4.6. Đã mở thêm trang stable (v2.5), nội dung các điểm dùng ở đây giống nhau.
  - Trích: "If the rank of a is < N or M <= N, this is an empty array." (nói về `residuals` của `lstsq`).
- **[MLCB]** Tiep Vu (tên tác giả theo metadata của trang; trang không ghi dấu "Vũ Hữu Tiệp"), đăng 28/12/2016. *Machine Learning cơ bản*, Bài 3: Linear Regression. [Link](https://machinelearningcoban.com/2016/12/28/linearregression/).
  - Trích: "còn tính được đạo hàm là còn có hy vọng".

**Nguồn thử nhưng không dùng:**

| Nguồn | Chuyện gì xảy ra | Quyết định |
|---|---|---|
| *The Elements of Statistical Learning* (bản 2), chương 3, tại `hastie.su.domains/ElemStatLearn/` | WebFetch báo `ECONNREFUSED`, curl hết thời gian chờ 20 giây (host 146.190.148.141). Link cũ `web.stanford.edu/~hastie/...` chuyển hướng về cùng host. | **Bỏ**, chưa đọc được nội dung. |
| ISL bản 2, PDF tại `hastie.su.domains/ISLR2/...` | Cùng host với trên, không kết nối được. | **Bỏ** phần PDF bản 2. Giữ trang statlearning.com và PDF bản 1 (mở được). |
| CS229 tại `cs229.stanford.edu/main_notes.pdf` | WebFetch `ECONNREFUSED`, curl hết thời gian chờ. | **Bỏ** link này. Thay bằng bản sao 2003 trên `see.stanford.edu` (mở được), nên gắn nhãn "bản cũ". |

## Ý chính

- **Mô hình.** Hồi quy tuyến tính dự đoán một đại lượng liên tục (giá thuê) bằng tổng có trọng số của các đặc trưng cộng hệ số tự do. Một đặc trưng cho một đường thẳng, nhiều đặc trưng cho một siêu phẳng. [ISL §3.1, §3.2; CS229; MLCB]
- **"Tuyến tính" nghĩa là tuyến tính theo tham số**, không bắt buộc theo đầu vào. Có thể đổi đầu vào thành $x^2$, $\sin x$... rồi vẫn dùng đúng công cụ này. [MML §9.2.1; MLCB §4.1; ISL §3.3.2]
- **Phần dư và hàm mất mát.** Phần dư là chênh lệch giữa giá thật và giá dự đoán. Ta chọn tham số làm tổng (hay trung bình) bình phương phần dư nhỏ nhất. Lý do dùng bình phương trong nguồn tiếng Việt: hàm bình phương khả vi mọi nơi, còn trị tuyệt đối thì không. Hệ số $\tfrac12$ hay $\tfrac1m$ chỉ đổi tỉ lệ của $\mathcal{L}$, không đổi nghiệm. [ISL §3.1.1; CS229 §1; MLCB §2.2 và §2.4; MML §9.2.1]
- **Một đặc trưng có lời giải đóng:** đường tốt nhất luôn đi qua điểm trung bình $(\bar{x}, \bar{y})$, và độ dốc là tỉ số giữa tổng tích độ lệch và tổng bình phương độ lệch của $x$. [ISL công thức 3.4]
- **Nhiều đặc trưng:** gom dữ liệu vào ma trận thiết kế $\mathbf{X}$ (mỗi hàng một mẫu), thêm cột toàn 1 cho hệ số tự do, rồi đạo hàm bằng 0 cho ra **phương trình chuẩn** $\mathbf{X}^\top\mathbf{X}\boldsymbol{\theta}=\mathbf{X}^\top\mathbf{y}$. [CS229 §2; MML §9.2.1; MLCB]
- **Vì sao đạo hàm bằng 0 là đủ:** $\mathcal{L}$ là hàm bậc hai lồi theo tham số, chỉ có một cực tiểu toàn cục, không có cực tiểu địa phương nào khác. [CS229 §1: "Indeed, J is a convex quadratic function."; MML §9.2.1 nói Hessian xác định dương khi $\mathbf{X}$ đủ hạng cột]
- **Khi nào giải được duy nhất:** khi các cột của $\mathbf{X}$ độc lập tuyến tính (đủ hạng), $\mathbf{X}^\top\mathbf{X}$ khả nghịch. Nếu không, nghiệm không duy nhất (có vô số nghiệm); MLCB dùng giả nghịch đảo để chọn ra một nghiệm. [MML §9.2.1, §9.2.2; MLCB §2.4] Khi các cột chỉ *gần* phụ thuộc nhau, ma trận gần suy biến, nghiệm rất nhạy với nhiễu ở nhãn và có phương sai lớn. [SK §1.1.1]
- **Trong code:** `LinearRegression` của scikit-learn thực chất là bình phương tối thiểu bằng `scipy.linalg.lstsq`, bọc thành đối tượng dự đoán; lời giải tính bằng SVD của $\mathbf{X}$, chi phí cỡ $O(m n^2)$ khi $m\ge n$. [SK API Notes; SK §1.1.1.2]. `np.linalg.solve` đòi ma trận vuông đủ hạng, ngược lại phải dùng `np.linalg.lstsq`; `lstsq` trả về nghiệm có chuẩn nhỏ nhất khi có nhiều nghiệm, kèm hạng và các giá trị kỳ dị. [NP]
- **Giới hạn:** giả định quan hệ thẳng, nhạy với điểm ngoại lai và điểm đòn bẩy cao, khó tách ảnh hưởng của các đặc trưng cộng tuyến. [ISL §3.3.3; MLCB §4.2]
- **Cầu nối sang bài sau:** cùng hàm mất mát này cũng tối ưu được bằng gradient descent; vì hàm lồi nên hội tụ về cực tiểu toàn cục nếu tốc độ học không quá lớn. Tác giả MLCB nhắn rằng nghiệm đóng không phải lúc nào cũng có. [CS229 §1; MLCB §4.3]

## Công thức quan trọng

Ký hiệu theo `CLAUDE.md`: $m$ mẫu, $n$ đặc trưng, $w$/$\mathbf{w}$, $b$, $\hat{y}$, $\mathcal{L}$. Chỉ số mẫu viết dưới: $x_i$, $y_i$.

**1. Mô hình**

$$\hat{y} = wx + b \qquad\text{và}\qquad \hat{y} = \mathbf{w}^\top\mathbf{x} + b = \sum_{j=1}^{n} w_j x_j + b$$

**2. Phần dư và MSE**

$$e_i = y_i - \hat{y}_i, \qquad \mathcal{L}(w,b) = \frac{1}{m}\sum_{i=1}^{m}\bigl(wx_i + b - y_i\bigr)^2$$

Dạng $\frac{1}{2m}$, hay $\frac12$ không chia cho $m$, cho cùng $w$, $b$ tối ưu (đã thử trên lưới với $\frac{1}{2m}$). Các nguồn khác nhau ở đây: ISL dùng RSS (tổng, không chia) ở chương 3 và định nghĩa MSE có $\frac1n$ ở chương 2; CS229 và MLCB dùng $\frac12\sum$; MML dùng $\frac{1}{2\sigma^2}\lVert\mathbf{y}-\mathbf{X}\boldsymbol{\theta}\rVert^2$ (từ khả năng cực đại với nhiễu Gauss). Bài nên chọn **một** dạng, nói rõ, và ghi chú "sách khác có thể thêm $\frac12$".

**3. Lời giải một đặc trưng, từng bước (cho phần Lý thuyết)**

Đặt $\bar{x}=\frac1m\sum_i x_i$, $\bar{y}=\frac1m\sum_i y_i$.

Bước 1, đạo hàm riêng theo $b$:

$$\frac{\partial\mathcal{L}}{\partial b}=\frac{2}{m}\sum_i (wx_i+b-y_i)=0 \;\Rightarrow\; w\bar{x}+b-\bar{y}=0 \;\Rightarrow\; \boxed{\,b=\bar{y}-w\bar{x}\,}$$

Bằng lời: trung bình phần dư bằng 0, nên đường thẳng đi qua $(\bar{x},\bar{y})$.

Bước 2, đạo hàm riêng theo $w$:

$$\frac{\partial\mathcal{L}}{\partial w}=\frac{2}{m}\sum_i x_i\,(wx_i+b-y_i)=0$$

Bước 3, thế $b$ vào. Vì $wx_i+b-y_i = w(x_i-\bar{x})-(y_i-\bar{y})$, ta được

$$\sum_i x_i\bigl[w(x_i-\bar{x})-(y_i-\bar{y})\bigr]=0$$

Bước 4, đổi $x_i$ thành $x_i-\bar{x}$. Phần trừ thêm là $\bar{x}\sum_i\bigl[w(x_i-\bar{x})-(y_i-\bar{y})\bigr]$, bằng 0 vì $\sum_i(x_i-\bar{x})=0$ và $\sum_i(y_i-\bar{y})=0$. Nên

$$\sum_i (x_i-\bar{x})\bigl[w(x_i-\bar{x})-(y_i-\bar{y})\bigr]=0$$

Bước 5, rút $w$:

$$\boxed{\,w=\frac{\sum_{i=1}^{m}(x_i-\bar{x})(y_i-\bar{y})}{\sum_{i=1}^{m}(x_i-\bar{x})^2}\,}\qquad\Bigl(=\frac{\sum x_iy_i-m\bar{x}\bar{y}}{\sum x_i^2-m\bar{x}^2}\Bigr)$$

Cần mẫu số khác 0, tức là có ít nhất hai giá trị $x$ khác nhau. Dạng này trùng ISL (3.4). Hai dạng viết của $w$ đã kiểm chứng bằng số.

Hai phương trình ở bước 1–2 cũng nói rằng $\sum_i e_i=0$ và $\sum_i x_ie_i=0$ (phần dư không "nghiêng" theo $x$). Đã thử số: giá trị tuyệt đối của cả hai tổng đều $\le 10^{-12}$.

**4. Dạng ma trận (chỉ nêu, theo quyết định 18)**

Thêm cột 1 vào $\mathbf{X}$, gộp $\boldsymbol{\theta}=[\,w_1,\dots,w_n,\,b\,]^\top$ (cột 1 đặt cuối, khớp với `np.column_stack([x, np.ones(m)])` trong code; CS229 và MLCB đặt hệ số tự do ở đầu với $x_0=1$, chỉ cần chọn một quy ước và giữ khớp giữa công thức và code):

$$\hat{\mathbf{y}}=\mathbf{X}\boldsymbol{\theta},\qquad \mathcal{L}(\boldsymbol{\theta})=\frac1m\lVert\mathbf{y}-\mathbf{X}\boldsymbol{\theta}\rVert^2,\qquad \boxed{\,\mathbf{X}^\top\mathbf{X}\,\boldsymbol{\theta}=\mathbf{X}^\top\mathbf{y}\,}$$

Nếu $\mathbf{X}^\top\mathbf{X}$ khả nghịch thì $\boldsymbol{\theta}=(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}$. Đây là cách *viết* nghiệm, không phải cách *tính* (xem mục "Điểm dễ hiểu nhầm").

Giải thích bằng lời, không đạo hàm ma trận (theo MML §9.4): $\mathbf{X}\boldsymbol{\theta}$ luôn nằm trong không gian do các cột của $\mathbf{X}$ căng ra. Nghiệm tốt nhất là điểm trong không gian đó gần $\mathbf{y}$ nhất, tức hình chiếu vuông góc của $\mathbf{y}$. Khi đó vectơ phần dư vuông góc với từng cột của $\mathbf{X}$: $\mathbf{X}^\top(\mathbf{y}-\mathbf{X}\boldsymbol{\theta})=\mathbf{0}$, và viết lại chính là phương trình chuẩn.

Cầu nối với phần 3: với một đặc trưng,

$$\mathbf{X}^\top\mathbf{X}=\begin{bmatrix}\sum x_i^2 & \sum x_i\\ \sum x_i & m\end{bmatrix},\quad \mathbf{X}^\top\mathbf{y}=\begin{bmatrix}\sum x_iy_i\\ \sum y_i\end{bmatrix},\quad \det(\mathbf{X}^\top\mathbf{X})=m\sum_i(x_i-\bar{x})^2$$

Hai hàng của phương trình chuẩn chính là hai phương trình ở bước 1–2. Định thức $=0$ khi và chỉ khi mọi $x_i$ bằng nhau (đã thử số).

**5. Khi nào $\mathbf{X}^\top\mathbf{X}$ không khả nghịch** (điều kiện: $\operatorname{rank}(\mathbf{X}) < n+1$)

- Mọi $x_i$ bằng nhau (một đặc trưng), hoặc chỉ có một mẫu.
- Hai cột trùng nhau hoặc cột này là bội/tổ hợp của cột kia. Ví dụ ngây thơ: đưa cả diện tích theo m² lẫn theo ft² vào cùng một mô hình.
- Ít mẫu hơn tham số, $m < n+1$ (MML §9.2.1 nêu điều kiện tương đương: số mẫu không ít hơn số tham số, bỏ qua dữ liệu trùng).
- Hệ quả: vô số $\boldsymbol{\theta}$ cho cùng một dự đoán $\hat{\mathbf{y}}$. Dự đoán vẫn ổn, nhưng từng hệ số mất ý nghĩa.

**6. Dùng hàm nào trong code** [NP, SK]

- `np.linalg.solve(X.T @ X, X.T @ y)`: giải hệ $\mathbf{A}\boldsymbol{\theta}=\mathbf{b}$ mà không tính nghịch đảo. MML §9.2.1 cũng nhận xét đây là việc giải một hệ phương trình tuyến tính dạng $\mathbf{A}\boldsymbol{\theta}=\mathbf{b}$. Báo `LinAlgError` nếu ma trận suy biến.
- `np.linalg.lstsq(X, y)`: chạy trực tiếp trên $\mathbf{X}$, không qua $\mathbf{X}^\top\mathbf{X}$; trả về `(nghiệm, tổng bình phương phần dư, hạng, giá trị kỳ dị)`. Với NumPy 2.x không cần ghi `rcond=None` (mặc định đã đổi ở 2.0).
- `LinearRegression().fit(X, y)`: thuộc tính `coef_` ($\mathbf{w}$), `intercept_` ($b$). Nếu `fit_intercept=False` thì `intercept_` bằng 0.0 và dữ liệu phải được căn giữa trước. [SK API]

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình, không chép.

- **Đường thẳng tốt nhất luôn đi qua điểm trung bình** [ISL công thức 3.4, suy ra từ $b=\bar{y}-w\bar{x}$]. Với mỗi $w$ cho trước, $b$ tốt nhất đã được định sẵn, nên đường tương ứng xoay quanh điểm $(\bar{x},\bar{y})$ khi $w$ đổi. Gợi ý cho `LinearFitViz`: (a) đánh dấu điểm $(\bar{x},\bar{y})$ trên đồ thị; (b) nếu muốn, thêm chế độ cho $b$ tự theo $w$, khi đó MSE chỉ còn phụ thuộc một thanh trượt; (c) nút "Hiện đường tốt nhất" vẽ đường đi qua điểm này với độ dốc theo công thức.
- **MSE là cái bát** [ISL Hình 3.2]. ISL vẽ RSS theo hai hệ số thành mặt 3D và đường đồng mức, điểm đỏ ở đáy là nghiệm bình phương tối thiểu. Hai thanh trượt của VIZ chính là đi tìm đáy bằng tay. Gợi ý cho bài gradient descent: trên bảng thử, số điều kiện của $\mathbf{X}^\top\mathbf{X}$ giảm từ 25760,6 xuống 279 khi căn giữa $x$ (đã tính), nghĩa là "cái bát" bớt méo. Đây chỉ là con số tự tính, không đến từ hình nào của ISL.
- **Phần dư là các đoạn thẳng đứng** từ điểm dữ liệu đến đường [ISL Hình 3.1]. Đường tốt nhất là chỗ "thỏa hiệp" làm cho tổng bình phương các đoạn này nhỏ nhất.
- **Bình phương phạt nặng sai số lớn**, nên một điểm xa đường kéo đường về phía nó. Đây là gốc của tính nhạy với ngoại lai, nên đặt ngay sau phần định nghĩa MSE để dẫn dắt sang ô code ngoại lai.
- **Hình học của phương trình chuẩn** [MML §9.4]: $\hat{\mathbf{y}}$ là "cái bóng" của $\mathbf{y}$ trên mặt phẳng do các cột $\mathbf{X}$ căng ra; phần dư là đoạn vuông góc nối $\mathbf{y}$ xuống bóng của nó. Dùng được cho phần "giải thích bằng lời", không cần đạo hàm ma trận.
- **Một ví dụ khác (chiều cao, cân nặng)** [MLCB]: chỉ cần thêm một cặp nhiễu (150 cm, 90 kg) vào bảng 15 người là kết quả lệch hẳn. Bài mình dùng căn hộ nên không cần chép ví dụ này.
- **Cùng đáp số giữa NumPy và scikit-learn:** nghiệm từ công thức, `solve`, `lstsq`, `LinearRegression` trùng nhau tới cỡ $10^{-15}$ trên bảng thử (xem bên dưới). Dùng làm "kiểm tra chéo" ở ô code 2.

## Điểm dễ hiểu nhầm

1. **"Tuyến tính" không có nghĩa là chỉ vẽ được đường thẳng.** Mô hình chỉ cần tuyến tính theo $w$ (ví dụ $y\approx w_1x+w_2x^2+b$). Bài này dùng đường thẳng, nên thêm một câu nói rõ điều đó, rồi hẹn bài `ml/overfitting-underfitting`. [MML §9.2.1, MLCB §4.1, ISL §3.3.2]
2. **$b$ không phải "giá thuê của căn hộ 0 m²".** ISL gọi nó là giá trị kỳ vọng của $Y$ khi $X=0$; điều đó chỉ có nghĩa nếu $x=0$ nằm trong vùng dữ liệu. Với căn hộ 25–80 m², $b$ chỉ là "chỗ đường thẳng cắt trục tung". Trong toán phổ thông gọi là tung độ gốc.
3. **Phần dư $\neq$ sai số thật.** Phần dư là chênh lệch quan sát được so với đường đã vẽ. Sai số $\varepsilon$ trong mô hình là phần ta không biết (nhiễu, đặc trưng thiếu, quan hệ không thẳng). [ISL §3.1.2]
4. **Hệ số $\frac12$ và $\frac1m$ khác nhau giữa các sách.** Giá trị $\mathcal{L}$ đổi, nghiệm không đổi. Đừng để người đọc hoảng khi so với CS229 hay MLCB.
5. **MML mặc định mô hình đi qua gốc tọa độ.** Mô hình cơ bản ở §9.1 là $y=\mathbf{x}^\top\boldsymbol{\theta}+\epsilon$ không có hệ số tự do; muốn có thì thêm đặc trưng hằng số 1 (cách MML làm ở ví dụ đa thức, §9.2.1). Ai đọc MML sẽ thấy công thức không có $b$.
6. **Đừng nói "đạo hàm bằng 0 là đủ" mà không giải thích.** Đạo hàm bằng 0 chỉ chắc là cực tiểu vì $\mathcal{L}$ lồi, bậc hai. [CS229 §1, MML §9.2.1]
7. **$(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}$ là công thức để đọc, không phải để gõ.** Trong code dùng `solve` hoặc `lstsq`. Sự khác biệt có thật nhưng **không lộ ra trên bảng nhỏ của bài**: trên bảng thử, `inv`, `solve`, `lstsq` khớp nhau tới $10^{-15}$. Đừng khẳng định "nghịch đảo cho kết quả sai" trên bảng này. Lý do đúng là: tránh tính nghịch đảo tường minh là thói quen số học tốt; $\mathbf{X}^\top\mathbf{X}$ **bình phương** số điều kiện của $\mathbf{X}$ (đã thử: $\operatorname{cond}(\mathbf{X}^\top\mathbf{X})=\operatorname{cond}(\mathbf{X})^2$); và `lstsq` chạy cả khi ma trận suy biến. Khác biệt chỉ nhìn thấy với dữ liệu điều kiện xấu (ví dụ đa thức bậc 9: lệch tương đối cỡ $10^{-5}$ giữa `solve` trên $\mathbf{X}^\top\mathbf{X}$ và `lstsq`). Các ý "tránh nghịch đảo" và "bình phương số điều kiện" **không có trong nguồn nào đã mở**, chỉ có NumPy docs nói `solve` cần đủ hạng và khuyên dùng `lstsq` khi không đủ.
8. **`solve` không phải lúc nào cũng báo lỗi khi ma trận suy biến.** Cột trùng nhau tuyệt đối thì `solve` ném `LinAlgError: Singular matrix`. Nhưng cột "trùng nhau" chỉ sau đổi đơn vị (m² và ft², tức nhân 10,7639) thì trên máy thử `solve` **trả về số** (hạng thật là 2 trên 3) mà không báo gì; dự đoán vẫn khớp nhưng hệ số vô nghĩa. `lstsq` luôn trả về hạng, nên nhìn vào `rank` là cách phát hiện. Kết quả này phụ thuộc làm tròn nên không nên đưa vào ô code có output cố định. Chưa chạy trên Pyodide.
9. **Nhiều nghiệm thì `lstsq` chọn nghiệm có chuẩn nhỏ nhất, không phải "nghiệm đúng".** Với hai cột trùng, nó chia đều hệ số cho hai cột. Đây là quy ước của thuật toán, không phải tính chất của dữ liệu. [NP] Lưu ý thêm: MLCB viết rằng khi $\mathbf{X}^\top\mathbf{X}$ suy biến thì phương trình chuẩn hoặc vô nghiệm hoặc vô số nghiệm. Thực ra phương trình chuẩn luôn có nghiệm; trường hợp suy biến là vô số nghiệm (kết quả đại số tuyến tính chuẩn, đã thử số trên ba ca suy biến ở mục "Số đã chạy thử"). Chỉ dùng MLCB cho ý chung, không trích câu này.
10. **Ngoại lai: vị trí quan trọng hơn độ lớn.** ISL nói một điểm có $y$ lạ nhưng $x$ bình thường thường ít làm đổi đường, nhưng làm RSE tăng (ví dụ ISL: từ 0,77 lên 1,09) và $R^2$ giảm; điểm có $x$ cực đoan (đòn bẩy cao) mới kéo mạnh đường. Đã thử trên bảng thử: đổi $y$ ở **giữa** dải $x$ thêm 10 chỉ làm $w$ giảm khoảng 7%, đổi $y$ ở **đầu mút** (diện tích lớn nhất) bớt 10 làm $w$ giảm khoảng 52%. Ô code ngoại lai nên đặt điểm lạ ở căn hộ **lớn nhất**, nếu không người đọc sẽ không thấy đường xoay. [ISL §3.3.3 mục 4, 5]
11. **Nhiễu (noise) và ngoại lai (outlier) là hai khái niệm.** MLCB dùng chữ nhiễu để chỉ cả điểm ngoại lai; bài mình nên tách hai khái niệm theo glossary đề xuất.
12. **Ngoại suy.** Đường thẳng cộng cùng một số tiền cho mỗi m² thêm vào mãi mãi, dù dữ liệu chỉ có trong một khoảng. Trên bảng thử: dự đoán 32,8 triệu/tháng cho 150 m² và 64,8 triệu cho 300 m². Điểm này **không có trong nguồn đã mở**, là kiến thức chung; nên để người đọc thấy bằng số thay vì chỉ nói.
13. **Cộng tuyến.** Khi hai đặc trưng cùng tăng giảm với nhau, khó tách ảnh hưởng riêng của từng cái; hệ số sai số lớn và nhảy theo dữ liệu. [ISL §3.3.3 mục 6; SK §1.1.1] Bài mẫu chỉ có một đặc trưng, nên chỉ nhắc một câu, không đào sâu.
14. **Ngoài phạm vi bài** (có trong ISL §3.1.2–3.1.3 và §3.2.2 nhưng thuộc thống kê suy diễn): khoảng tin cậy, p-value, $R^2$, F-statistic. Giáo án gốc buổi 10 chỉ yêu cầu khái niệm, Normal Equation, lập trình NumPy và scikit-learn, giới hạn. Nếu cần nhắc $R^2$ thì chỉ một câu.
15. **Diễn giải xác suất (nhiễu Gauss $\Rightarrow$ bình phương tối thiểu) nên để dành.** CS229 §3 và MML §9.2.1 có, nhưng `ml/linear-regression` chưa có `math/probability-statistics` trong danh sách "cần biết trước" (`src/data/roadmap.ts`), nên không nên giả định người đọc đã học phương sai. Chỉ cần nhắc "vì sao bình phương" bằng lý do khả vi và phạt sai số lớn, hẹn bài `ml/logistic-regression`.

## Liên quan tới bài nào

Slug lấy từ `src/data/roadmap.ts`.

- **Cần biết trước (theo roadmap):** `ml/ml-overview`, `math/linear-algebra` (ma trận, chuyển vị, hạng, nghịch đảo), `math/calculus` (đạo hàm riêng).
- **Bài đứng ngay sau và dựa vào bài này:**
  - `ml/overfitting-underfitting`: đặc trưng đa thức, vì sao mô hình quá linh hoạt thì sai [MML §9.2.2, CS229 §4 có hình minh họa].
  - `ml/gradient-descent`: cùng hàm mất mát, giải bằng lặp thay cho nghiệm đóng; roadmap để `ml/linear-regression` là điều kiện tiên quyết.
  - `ml/logistic-regression`: cần `ml/linear-regression` và `ml/gradient-descent`; chỗ phù hợp để đưa diễn giải xác suất.
  - `ml/regularization`: nằm sau `ml/overfitting-underfitting`. MML §9.2.3–9.2.4 (MAP, chính quy hóa) liên quan, nhưng `summarizer` mới đọc đề mục, chưa tóm tắt nội dung.
- **Nơi bài này mượn:** `python/numpy-pandas` (mảng, `@`, `column_stack`).

## Thuật ngữ đề xuất

Chỉ đề xuất, **chưa sửa** `docs/glossary.md`. Cột "Cách dùng" theo kiểu glossary: Dịch hoặc Giữ.

| Tiếng Việt | Tiếng Anh | Cách dùng | Nhóm glossary | Ghi chú |
|---|---|---|---|---|
| Phần dư | Residual | Dịch | Machine Learning | $e_i=y_i-\hat{y}_i$. Khác "sai số" (error, $\varepsilon$) là phần ta không quan sát được. |
| Bình phương tối thiểu | Least squares | Dịch | Machine Learning | Cũng gặp "bình phương nhỏ nhất"; chọn một và giữ. |
| Bình phương tối thiểu thông thường (OLS) | Ordinary Least Squares (OLS) | Dịch, viết tắt OLS | Machine Learning | Tên trong tài liệu scikit-learn; dùng khi nói về `LinearRegression`. |
| Phương trình chuẩn | Normal equation | Dịch, lần đầu kèm "normal equation" | Machine Learning | Giáo án gốc giữ "Normal Equation"; `docs/mvp.md` đã dùng "phương trình chuẩn". |
| Ma trận thiết kế | Design matrix | Dịch | Toán | Mỗi hàng một mẫu, mỗi cột một đặc trưng, thêm cột toàn 1 cho hệ số tự do. MML cũng gọi "feature matrix". |
| Điểm ngoại lai | Outlier | Dịch | Dữ liệu và mô hình | `docs/mvp.md` đã dùng "điểm ngoại lai". Tách khỏi "nhiễu". |
| Nhiễu | Noise | Dịch | Dữ liệu và mô hình | Biến động ngẫu nhiên trong dữ liệu, không phải điểm bất thường. |
| Sai số bình phương trung bình (MSE) | Mean squared error (MSE) | Dịch, viết tắt MSE | Machine Learning | Bài dùng $\frac1m$; ghi chú biến thể $\frac1{2m}$. |
| Hệ số tự do | Bias (term) / intercept | Dịch, lần đầu ghi "bias, còn gọi là intercept" | Machine Learning | **Sửa dòng đã có** thay vì thêm mới. scikit-learn gọi `intercept_`, ISL gọi intercept; mạng nơ-ron gọi bias. |
| Độ dốc | Slope | Dịch | Machine Learning | Chỉ dùng khi có một đặc trưng ($w$). Nhiều đặc trưng thì gọi "trọng số"; scikit-learn gọi chung là hệ số (`coef_`). |
| Ngoại suy | Extrapolation | Dịch | Machine Learning | Đối lập với "nội suy" (interpolation); giáo án buổi 11 đã có "Nội suy Lagrange". |

Thuật ngữ phụ, thêm nếu bài dùng tới:

| Tiếng Việt | Tiếng Anh | Cách dùng | Nhóm |
|---|---|---|---|
| Hạng (của ma trận) | Rank | Dịch | Toán |
| Ma trận khả nghịch / suy biến | Invertible / singular matrix | Dịch | Toán |
| Giả nghịch đảo | Pseudo-inverse | Dịch | Toán |
| Cộng tuyến | Collinearity | Dịch (scikit-learn dùng "multicollinearity") | Machine Learning |
| Lời giải dạng đóng | Closed-form solution | Dịch | Machine Learning |
| Điểm đòn bẩy cao | High-leverage point | Dịch | Machine Learning |

## Số đã chạy thử

Môi trường: Python 3.14.5, numpy 2.5.4, scikit-learn 1.8.0, scipy 1.18.1 trong venv tạm. Pyodide 314.0.7 của site có numpy 2.4.6 và scikit-learn 1.8.0 (`docs/architecture/components.md`); **chưa chạy trên Pyodide**, nên kết quả có thể lệch ở mức làm tròn.

**Bảng thử** (tự bịa để kiểm chứng, **không phải bảng của bài**; `lesson-writer` được dùng hoặc tự tạo bảng riêng, nhưng nhớ ghi rõ là dữ liệu minh họa):

- Diện tích (m²): `[25, 30, 35, 40, 45, 50, 55, 60, 70, 80]`
- Giá thuê (triệu đồng/tháng): `[6.0, 7.5, 7.8, 9.5, 10.0, 11.8, 12.1, 13.9, 15.2, 18.1]`
- $\bar{x}=49$, $\bar{y}=11.19$, $\sum(x_i-\bar{x})^2=2790$, $\sum(x_i-\bar{x})(y_i-\bar{y})=596.4$.
- **$w\approx0.213763$, $b\approx0.715591$**, tổng bình phương phần dư $\approx1.200484$, **MSE $\approx0.120048$** (nửa MSE $\approx0.060024$).
- Công thức, `solve(XᵀX, Xᵀy)`, `lstsq` và `LinearRegression` trùng nhau (`allclose`). $\mathbf{X}^\top\mathbf{X}=\begin{bmatrix}26800&490\\490&10\end{bmatrix}$, $\det=27900$.
- Ví dụ trong tài liệu NumPy cho `lstsq` ra $(m,c)\approx(1.0,-0.95)$, khớp tài liệu.

**Ngoại lai và ngoại suy trên bảng thử:**

| Tình huống | $w$ | $b$ |
|---|---|---|
| Gốc | 0,2138 | 0,716 |
| Đổi $y$ tại 45 m² từ 10,0 thành 20,0 (giữa dải) | 0,1994 | 2,418 |
| Đổi $y$ tại 80 m² từ 18,1 thành 8,1 (đầu mút) | 0,1027 | 5,160 |
| Thêm điểm (120 m², 8) | 0,0530 | 7,963 |
| Thêm điểm (45 m², 25) | 0,1947 | 2,974 |

Dự đoán của đường gốc: 0 m² cho 0,72; 150 m² cho 32,78; 300 m² cho 64,84 (triệu đồng/tháng).

**Suy biến và số điều kiện:**

| Trường hợp | Kết quả |
|---|---|
| Cột trùng tuyệt đối $[x, x, 1]$ | `solve` ném `LinAlgError: Singular matrix`; `lstsq` hạng 2, hệ số $[0.1069, 0.1069, 0.7156]$ |
| Cột m² và ft² ($\times10.7639$) | hạng thật 2 trên 3; `solve` **không báo lỗi**, trả $[0.2213,-0.0007,0.7156]$; `lstsq` trả $[0.0018, 0.0197, 0.7156]$; cả hai cho cùng tổng bình phương phần dư $\approx1.2005$ |
| Mọi $x$ bằng 40, hoặc chỉ một mẫu | `solve` ném `LinAlgError`; `lstsq` hạng 1; với một mẫu thì `residuals` rỗng (đúng mô tả của tài liệu NumPy) |
| Phương trình chuẩn khi suy biến vẫn có nghiệm | Với ba ca suy biến (m² và ft², cột trùng, mọi $x$ bằng nhau), nghiệm của `lstsq` thỏa $\mathbf{X}^\top\mathbf{X}\boldsymbol{\theta}=\mathbf{X}^\top\mathbf{y}$ với sai lệch $\le1.5\times10^{-11}$ (so với độ lớn $10^3$ đến $10^4$ của vế phải) |
| Căn giữa $x$ | $\operatorname{cond}(\mathbf{X}^\top\mathbf{X})$ trên bảng thử: 25760,6 trước khi căn giữa, 279 sau |
| Bảng thử: $\operatorname{cond}(\mathbf{X})$ và $\operatorname{cond}(\mathbf{X}^\top\mathbf{X})$ | 160,5 và 25760,6 (đúng bình phương) |
| Sai khác tương đối của `solve` và `inv` so với `lstsq` | bảng thử: $5\times10^{-15}$ và $1\times10^{-15}$; năm 2015–2025: $2\times10^{-11}$; đa thức bậc 9 trên $[0,10]$: $4\times10^{-5}$ |

## Đọc thêm đề xuất

Năm nguồn tốt nhất cho người mới, theo thứ tự nên đọc:

1. **Tiep Vu, *Machine Learning cơ bản*, Bài 3: Linear Regression** (tiếng Việt, 2016). [Link](https://machinelearningcoban.com/2016/12/28/linearregression/). Dễ vào nhất, có ví dụ NumPy và scikit-learn, nói rõ giới hạn. Lưu ý ký hiệu khác site mình (dùng $\bar{\mathbf{X}}$ cho dữ liệu đã thêm cột 1, $N$ mẫu) và dùng giả nghịch đảo.
2. **James, Witten, Hastie, Tibshirani, *An Introduction to Statistical Learning*, chương 3** (tiếng Anh; đã đọc bản 1, chưa mở được PDF bản 2 nên chưa kiểm số chương của bản 2). [Link](https://www.statlearning.com/). Đọc §3.1.1 và §3.3.3 (ngoại lai, đòn bẩy, cộng tuyến) cho người mới; phần suy diễn thống kê có thể bỏ qua.
3. **Ng, *CS229 Lecture notes* (bản 2003)**. [PDF](https://see.stanford.edu/materials/aimlcs229/cs229-notes1.pdf). Dành cho người muốn xem dẫn xuất phương trình chuẩn bằng đạo hàm ma trận và diễn giải xác suất. Bản cũ, nên gắn nhãn.
4. **Deisenroth, Faisal, Ong, *Mathematics for Machine Learning*, chương 9**. [Link](https://mml-book.github.io/). Cho người đã học đại số tuyến tính; hay nhất ở §9.4 (hình chiếu vuông góc). Giấy phép chỉ cho xem và tải cá nhân.
5. **Tài liệu cho phần code:** scikit-learn 1.8 [User Guide 1.1.1](https://scikit-learn.org/1.8/modules/linear_model.html) và [`numpy.linalg.lstsq`](https://numpy.org/doc/2.4/reference/generated/numpy.linalg.lstsq.html).
