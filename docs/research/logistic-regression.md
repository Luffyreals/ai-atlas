# Hồi quy Logistic

Bài: `ml/logistic-regression` (tiền đề: `ml/linear-regression`, `ml/gradient-descent`, `math/probability-statistics`). Code chỉ dùng `numpy`, `matplotlib`, `scikit-learn` (Pyodide 314.0.7, scikit-learn 1.8.0); chạy thử bằng venv `C:/Users/Dell/.venvs/ai-atlas-py314` (scikit-learn 1.8.0) và Python hệ thống (scikit-learn 1.9.1), cùng kết quả.

Ngày kiểm tra nguồn: **05/11/2026**, bằng WebFetch, Crossref API và `curl -I`. Thẻ nguồn: [MLCB10], [SK-LM], [SK-LR], [SLP3-4], [CS229], [C58]. Ý không có thẻ là kiến thức chung.

## Nguồn

- **[MLCB10]** Vũ Hữu Tiệp (2017). [*Machine Learning cơ bản*, Bài 10: Logistic Regression](https://machinelearningcoban.com/2017/01/27/logisticregression/). Đã đọc mục lục và ký hiệu: $N$ số mẫu, $\mathbf{x}$ có thêm $x_0 = 1$, đầu ra sigmoid ký hiệu $z_i$, mất mát $J(\mathbf{w})$ là negative log likelihood dạng **tổng** (không chia $N$), gọi là cross entropy. Ví dụ nhỏ: 20 sinh viên, số giờ ôn 0–6, lấy từ Wikipedia. Dữ liệu 18 sinh viên của bài AI Atlas là dữ liệu khác, tự tạo.
- **[SK-LM]** [*scikit-learn 1.8 User Guide*: Linear Models](https://scikit-learn.org/1.8/modules/linear_model.html#logistic-regression), mục 1.1.11. Đã đọc: mục tiêu nhị phân $\frac{1}{S}\sum_i s_i\,\ell_i + \frac{r(w)}{SC}$ với $r(w) = \frac{1}{2}\lVert w\rVert_2^2$ cho L2; "Regularization is applied by default"; `predict_proba` là $\operatorname{expit}(X_i w + w_0)$; ngưỡng mặc định 0.5. (Trang dài, công cụ đọc 100 000 ký tự đầu.)
- **[SK-LR]** [*`LogisticRegression`* 1.8](https://scikit-learn.org/1.8/modules/generated/sklearn.linear_model.LogisticRegression.html). Đã đọc: `C` mặc định 1.0, "`C=np.inf` results in unpenalized logistic regression"; `penalty` deprecated từ 1.8, bỏ ở 1.10, thay bằng `l1_ratio`; `l1_ratio` mặc định 0.0; solver mặc định `lbfgs`; `max_iter=100`. Trang không nói rõ intercept có bị phạt hay không (trừ liblinear).
- **[SLP3-4]** Jurafsky, D., Martin, J. H. [*Speech and Language Processing*, 3rd ed. draft](https://web.stanford.edu/~jurafsky/slp3/), bản nháp 19/08/2026, chương 4 "Logistic Regression and Text Classification" ([4.pdf](https://web.stanford.edu/~jurafsky/slp3/4.pdf), HTTP 200). Chỉ đối chiếu tiêu đề chương và đoạn mở đầu (giới thiệu cross-entropy loss và SGD); chưa đọc kỹ.
- **[CS229]** Ma, T., Ng, A. [*CS229 Lecture Notes*](https://cs229.stanford.edu/main_notes.pdf), bản 23/08/2026. Mục lục có "2 Classification and logistic regression, 2.1 Logistic regression". Chưa đọc nội dung mục.
- **[C58]** Cox, D. R. (1958). [*The Regression Analysis of Binary Sequences*](https://doi.org/10.1111/j.2517-6161.1958.tb00292.x). *JRSS Series B* 20(2), 215–232. Xác minh qua Crossref. Chưa đọc nội dung.

## Ý chính và công thức (theo ký hiệu site)

- $z = \mathbf{w}^\top\mathbf{x} + b$, $\hat{y} = \sigma(z) = 1/(1 + e^{-z}) = P(y = 1 \mid \mathbf{x})$ [SK-LM].
- Log-odds tuyến tính: $\ln\frac{\hat{y}}{1-\hat{y}} = z$; tăng $x_j$ một đơn vị thì odds nhân $e^{w_j}$.
- Ranh giới ở ngưỡng 0.5: $\mathbf{w}^\top\mathbf{x} + b = 0$.
- Log loss $= -\frac{1}{m}\ln\text{Lik}$; gradient $\frac{1}{m}\sum_i(\hat{y}^{(i)} - y^{(i)})x^{(i)}_j$; $\sigma' = \sigma(1-\sigma)$ [MLCB10].
- scikit-learn: $J = \mathcal{L} + \frac{1}{2mC}\lVert\mathbf{w}\rVert_2^2$, tức $\lambda = \frac{1}{2mC}$ so với dạng $\mathcal{L} + \lambda\lVert\mathbf{w}\rVert_2^2$ của bài Regularization [SK-LM]. Ghi chú: brief ghi "$C = 1/\lambda$"; bài dùng quan hệ chính xác $\lambda = 1/(2mC)$.

## Tự kiểm bằng số

- **Intercept không bị phạt (lbfgs):** 18 sinh viên, đổi một nhãn để tỉ lệ lớp 1 là 10/18, `C=1e-8` cho $w \approx 1.5 \times 10^{-7}$, $b = 0.22314$ $= \ln(10/8)$. Vậy $b$ không bị kéo về 0.
- **Cảnh báo thừa ở scikit-learn 1.8.0:** `LogisticRegression(C=np.inf)` in `UserWarning: Setting penalty=None will ignore the C and l1_ratio parameters` (nhánh `if penalty is None: if self.C != 1.0` trong `_logistic.py`). `penalty=None` in `FutureWarning`. Bản 1.9.1 không in gì với `C=np.inf`. Bài dùng `C=1e10` (không cảnh báo, kết quả trùng `C=np.inf` tới mọi chữ số in ra).
- `C=1` trên 18 sinh viên: $w = 1.0018$, $b = -4.7676$, ngưỡng 4.759 giờ.
- $z = -6$: đạo hàm theo $z$ của $(\sigma - 1)^2$ là $-0.004921$, của $-\ln\sigma$ là $-0.997527$.
