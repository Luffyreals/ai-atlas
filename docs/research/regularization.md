# Regularization: Ridge, Lasso, Elastic Net

Bài: `ml/regularization` (tiền đề: `ml/overfitting-underfitting`). Quyết định liên quan trong `docs/mvp.md` mục 7: số 37 (VIZ thanh trượt $\lambda$, các hệ số co lại), số 38 và 44 (dùng lại bộ `src/data/datasets/sine.ts`: 16 điểm train, 8 điểm test). Code chỉ dùng `numpy`, `scikit-learn`, `matplotlib` (Pyodide, scikit-learn 1.8).

Ngày kiểm tra nguồn: **24/10/2026**, bằng WebFetch. Thẻ nguồn: [HK70], [T96], [ZH05], [SK-LM], [SK-R], [SK-L], [SK-EN], [SK-RCV], [SK-LCV], [SK-SS], [MLCB15]. Mục "Số tự chạy" ghi kết quả `summarizer` tự tính. Ý không có thẻ là kiến thức chung.

## Nguồn

**Bài gốc (tên, tạp chí, DOI đã đối chiếu):**

- **[HK70]** Hoerl, A. E., Kennard, R. W. (1970). [*Ridge Regression: Biased Estimation for Nonorthogonal Problems*](https://doi.org/10.1080/00401706.1970.10488634). *Technometrics* 12(1), 55-67. DOI `10.1080/00401706.1970.10488634`. Xác minh qua Crossref API (trang tandfonline trả 403). Chưa đọc nội dung bài.
- **[T96]** Tibshirani, R. (1996). [*Regression Shrinkage and Selection Via the Lasso*](https://doi.org/10.1111/j.2517-6161.1996.tb02080.x). *Journal of the Royal Statistical Society: Series B* 58(1), 267-288. Trang academic.oup.com khớp tên, tập, trang, DOI. Chưa đọc nội dung bài.
- **[ZH05]** Zou, H., Hastie, T. (2005). [*Regularization and Variable Selection Via the Elastic Net*](https://doi.org/10.1111/j.1467-9868.2005.00503.x). *Journal of the Royal Statistical Society Series B* 67(2), 301-320. Trang nhà xuất bản khớp, có ghi một bản đính chính ở tập 67 số 5 (11/2005), trang 768. Chưa đọc nội dung bài.

**scikit-learn 1.8 (đã mở và đọc):**

- **[SK-LM]** [*Linear Models*](https://scikit-learn.org/1.8/modules/linear_model.html) (User Guide). Có công thức mục tiêu của ba mô hình, mục coordinate descent của Lasso, mục RidgeCV/LassoCV. (Trang dài 105.926 ký tự, công cụ chỉ đọc 100.000 ký tự đầu.)
- **[SK-R]** [*`Ridge`*](https://scikit-learn.org/1.8/modules/generated/sklearn.linear_model.Ridge.html). **[SK-L]** [*`Lasso`*](https://scikit-learn.org/1.8/modules/generated/sklearn.linear_model.Lasso.html). **[SK-EN]** [*`ElasticNet`*](https://scikit-learn.org/1.8/modules/generated/sklearn.linear_model.ElasticNet.html).
- **[SK-RCV]** [*`RidgeCV`*](https://scikit-learn.org/1.8/modules/generated/sklearn.linear_model.RidgeCV.html). **[SK-LCV]** [*`LassoCV`*](https://scikit-learn.org/1.8/modules/generated/sklearn.linear_model.LassoCV.html).
- **[SK-SS]** [*`StandardScaler`*](https://scikit-learn.org/1.8/modules/generated/sklearn.preprocessing.StandardScaler.html).

**Tiếng Việt:**

- **[MLCB15]** Tiep Vu (2017). [*Machine Learning cơ bản*, Bài 15: Overfitting](https://machinelearningcoban.com/2017/03/04/overfitting/). Mục regularization ở đây có L2 (weight decay), L1, Elastic Net. Ngắn: Elastic Net chỉ một câu, không nói chuẩn hóa đặc trưng. Chưa thấy bài riêng về Ridge/Lasso của tác giả này; chưa tìm kỹ.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| ISL chương 6.2 (Ridge, Lasso, "Selecting the Tuning Parameter") | PDF bản 1 (`ISLR-Seventh-Printing.pdf`) vượt giới hạn 10 MB của WebFetch, **không đọc được**. Mục lục chương 6 chưa đối chiếu. | Không viết "ISL viết rằng...". Chỉ gợi ý "Đọc thêm: ISL chương 6 (Linear Model Selection and Regularization)". Số mục 6.2 là hiểu biết chung; mở PDF bằng công cụ khác để kiểm. |
| Nội dung bài gốc [HK70], [T96], [ZH05] | Chỉ xác minh thông tin thư mục. | Không gắn ý chính nào cho bài gốc ngoài việc "ai đề xuất". |
| Việc intercept không bị phạt | Trang [SK-LM] **không nói rõ**. [SK-R] chỉ nói khi `fit_intercept=False` thì `X`, `y` phải đã căn giữa. | Đã tự kiểm bằng số (xem "Số tự chạy"). Trong bài ghi "scikit-learn không phạt intercept" và dẫn kết quả chạy, không dẫn trang tài liệu. |
| Elastic Net bản gốc của [ZH05] có nhân hệ số $(1+\lambda_2)$ cho "elastic net" so với "naive elastic net", và dùng $\lambda_1,\lambda_2$ | Nhớ từ hiểu biết chung, chưa mở bài. | Chỉ nói scikit-learn dùng $\alpha$ và `l1_ratio`; không đối chiếu ký hiệu bài gốc. |
| Trực giác hình thoi/hình tròn | Không có nguồn đã đọc nào mô tả (ISL có hình này, chưa mở được). | Là kiến thức chung; soft-thresholding thì có trong [SK-LM]. |
| Sách/khóa tiếng Việt khác về Ridge/Lasso | Chưa tìm. | Chỉ dùng [MLCB15]. |
| Số liệu theo scikit-learn **1.8** | Máy phiên này cài được scikit-learn **1.9.1** (không phải 1.8). | Số dưới đây là định tính. `lesson-writer` phải chạy lại trên môi trường gần Pyodide trước khi viết số vào bài. |

## Ý chính

- **Ý tưởng:** thêm vào hàm mất mát một "tiền phạt" cho trọng số lớn, nên mô hình phải cân giữa khớp dữ liệu và giữ trọng số nhỏ. Đa thức bậc cao overfit vì hệ số phình rất to để uốn theo nhiễu; phạt trọng số kìm điều đó. Đây là cách (3) bài trước đã hẹn.
- **Ridge (L2)** [HK70]: phạt tổng bình phương trọng số. Co mọi hệ số về gần 0 nhưng hiếm khi bằng đúng 0. Có nghiệm dạng đóng. [SK-R]
- **Lasso (L1)** [T96]: phạt tổng giá trị tuyệt đối. Nhiều hệ số về **đúng 0**, nên vừa co vừa chọn đặc trưng. Không có nghiệm dạng đóng; scikit-learn giải bằng coordinate descent (cập nhật từng hệ số một, mỗi bước là soft-thresholding). [SK-LM, SK-L]
- **Elastic Net** [ZH05]: trộn hai phạt, với `l1_ratio` $\in[0,1]$ chỉnh tỉ lệ; `l1_ratio=1` là Lasso, `0` là L2 thuần. Hữu ích khi nhiều đặc trưng tương quan mạnh (Lasso hay chọn một cái, bỏ cái còn lại; điều này là hiểu biết chung, chưa có nguồn đã đọc). [SK-EN]
- **Siêu tham số** $\alpha$ (site gọi $\lambda$) càng lớn thì phạt càng mạnh, mô hình càng đơn giản. $\alpha=0$ là bình phương tối thiểu thường; tài liệu khuyên dùng `LinearRegression` thay vì $\alpha=0$ do vấn đề số học. [SK-R, SK-L, SK-EN]
- **Đánh đổi bias–variance:** $\alpha$ tăng thì bias tăng, variance giảm (nối bài trước). Sai số test theo $\alpha$ có dạng chữ U ngược chiều trục "độ phức tạp": $\alpha$ nhỏ là quá khớp, $\alpha$ lớn là thiếu khớp.
- **Phải chuẩn hóa đặc trưng trước khi phạt.** Phạt đối xử mọi trọng số như nhau, nên đặc trưng có thang đo khác nhau bị phạt không công bằng. [SK-SS] nói thẳng rằng bộ phạt L1 và L2 của mô hình tuyến tính giả định đặc trưng căn giữa quanh 0 và phương sai cùng cỡ. Dùng `make_pipeline(PolynomialFeatures(...), StandardScaler(), Ridge(...))`.
- **Chọn $\alpha$ bằng kiểm định chéo.** `RidgeCV` (mặc định `alphas=(0.1, 1.0, 10.0)`, `cv=None` là leave-one-out hiệu quả, $\alpha$ phải dương); `LassoCV` (mặc định 5-fold, sinh lưới $\alpha$ tự động; thuộc tính `alpha_`). [SK-RCV, SK-LCV, SK-LM] Với ít dữ liệu, có thể dùng `GridSearchCV` trên pipeline.
- **Lưu ý API 1.8:** trong chữ ký `LassoCV`, `n_alphas` và `alphas=None` bị deprecated từ 1.7 (bỏ ở 1.9); truyền `alphas=<số nguyên hoặc mảng>`. [SK-LCV] Bài nên dùng `alphas=` tường minh để khỏi cảnh báo.
- **Trọng số phạt, không phạt intercept:** xem phần ký hiệu.

## Công thức quan trọng

Theo ký hiệu site: $m$ số mẫu, $n$ số đặc trưng, $\mathbf{w}$, $b$, $\mathcal{L}$, $\lambda$. Gọi $\mathrm{RSS}=\lVert\mathbf{y}-\mathbf{X}\mathbf{w}-b\rVert_2^2$ (với dữ liệu đã căn giữa, bỏ $b$).

**Mục tiêu scikit-learn** (đã chép từ [SK-LM, SK-R, SK-L, SK-EN], đổi ký hiệu $X w\to\mathbf{X}\mathbf{w}$):

$$\text{Ridge:}\quad \lVert\mathbf{y}-\mathbf{X}\mathbf{w}\rVert_2^2 + \alpha\lVert\mathbf{w}\rVert_2^2$$

$$\text{Lasso:}\quad \frac{1}{2m}\lVert\mathbf{y}-\mathbf{X}\mathbf{w}\rVert_2^2 + \alpha\lVert\mathbf{w}\rVert_1$$

$$\text{ElasticNet:}\quad \frac{1}{2m}\lVert\mathbf{y}-\mathbf{X}\mathbf{w}\rVert_2^2 + \alpha\rho\lVert\mathbf{w}\rVert_1 + \frac{\alpha(1-\rho)}{2}\lVert\mathbf{w}\rVert_2^2,\quad \rho=\texttt{l1\_ratio}$$

**Điểm bẫy:** Ridge **không** chia cho $m$ và **không** có $\tfrac12$, còn Lasso và ElasticNet có $\frac{1}{2m}$. Cùng tên $\alpha$ nhưng hai thang khác nhau. Nếu bài viết một dạng chung $\mathcal{L}+\lambda R(\mathbf{w})$ với $\mathcal{L}$ là MSE ($\tfrac1m$), phải nói rõ ánh xạ sang $\alpha$:

| Dạng trong bài (ví dụ) | Ridge của sklearn | Lasso của sklearn |
|---|---|---|
| $\mathrm{RSS}+\lambda\lVert\mathbf{w}\rVert^2$ | $\alpha=\lambda$ | không dùng |
| $\tfrac1m\mathrm{RSS}+\lambda\lVert\mathbf{w}\rVert^2$ | $\alpha=m\lambda$ | không dùng |
| $\mathrm{RSS}+\lambda\lVert\mathbf{w}\rVert_1$ | không dùng | $\alpha=\lambda/(2m)$ |
| $\tfrac1m\mathrm{RSS}+\lambda\lVert\mathbf{w}\rVert_1$ | không dùng | $\alpha=\lambda/2$ |

(Bốn dòng là suy ra đại số của `summarizer` từ công thức [SK-LM]. Tài liệu cũng nói $\alpha$ tương ứng $1/(2C)$ ở `LogisticRegression` và `LinearSVC`, và với SVM là $1/C$ hoặc $1/(m\cdot C)$ tùy mô hình. [SK-R, SK-L, SK-LM] [MLCB15] ghi $C=1/\lambda$ của sklearn cho bài phân loại.) **Gợi ý cho bài:** vì code dùng `Ridge(alpha=...)`, chọn mục tiêu $\mathrm{RSS}+\lambda\lVert\mathbf{w}\rVert^2$ cho Ridge (khớp $\alpha=\lambda$) và nói rõ "Lasso của scikit-learn chia thêm $2m$". Thanh trượt VIZ nên gắn nhãn đúng đại lượng mà code dùng.

**Ridge nghiệm dạng đóng** (dữ liệu đã căn giữa, không có $b$; nối bài `ml/linear-regression`):

$$\hat{\mathbf{w}}=(\mathbf{X}^\top\mathbf{X}+\lambda\mathbf{I})^{-1}\mathbf{X}^\top\mathbf{y}$$

Ý nghĩa: cộng $\lambda$ vào đường chéo làm ma trận luôn khả nghịch, kể cả khi các cột gần phụ thuộc nhau (đa thức bậc cao). Đây là kiến thức chung; [SK-R] chỉ nói solver `'cholesky'` dùng nghiệm dạng đóng. Đã tự kiểm bằng số.

**Soft-thresholding** (công thức cập nhật trong coordinate descent, từ [SK-LM]): với $S(z,\alpha)=\operatorname{sign}(z)\max(0,|z|-\alpha)$, một hệ số được đặt $w_j=S(\cdot,\alpha)/\lVert\mathbf{x}_j\rVert_2^2$. Nghĩa: kéo giá trị về 0 một đoạn $\alpha$; nếu $|z|\le\alpha$ thì **đúng 0**. Hệ quả: tăng $\alpha$ thì ngày càng nhiều hệ số bị "cắt" về 0.

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình.

- **Vì sao L1 ra đúng 0 (hình học, kiến thức chung):** viết bài toán dưới dạng "tối thiểu hóa sai số với ràng buộc $\lVert\mathbf{w}\rVert\le t$". Với hai trọng số, vùng cho phép của L2 là hình tròn, của L1 là hình thoi có bốn **đỉnh nằm trên các trục**. Đường đồng mức của sai số (hình elip) mở rộng dần tới khi chạm vùng cho phép. Với hình tròn, điểm chạm thường nằm ở chỗ cả hai tọa độ khác 0. Với hình thoi, elip rất dễ chạm đúng ở một đỉnh, nơi một tọa độ bằng 0. Nên L1 chọn đặc trưng.
- **Cách giải thích thứ hai, bằng soft-thresholding** [SK-LM]: mỗi lần cập nhật, L1 trừ một lượng cố định rồi cắt ở 0; còn L2 chỉ nhân hệ số với một số nhỏ hơn 1 (nên co dần nhưng không chạm 0). Cách này hợp với người đọc không thích hình học. Nhận xét "L2 nhân với hệ số nhỏ hơn 1" là kiến thức chung.
- **Thanh trượt $\lambda$ cho VIZ** (trực giác): $\lambda$ rất nhỏ thì đường bậc cao uốn lượn như bài trước, hệ số cực lớn. Tăng dần: đường mượt, hệ số co lại. Quá lớn: đường gần nằm ngang (thiếu khớp), mọi hệ số về 0 trừ hệ số tự do. Hình phụ: biểu đồ các hệ số theo $\log\lambda$ (đường co dần với Ridge; từng đường rơi xuống 0 với Lasso). Đây là gợi ý của `summarizer`, quyết định 37 chưa chốt chi tiết.
- **Ví dụ ngân sách:** có một "ngân sách" tổng độ lớn của trọng số; càng ít ngân sách, mô hình càng phải chọn cái quan trọng nhất. (Ví dụ của `summarizer`.)

### Số tự chạy (scikit-learn 1.9.1, không phải 1.8; chỉ để định hướng)

Bộ `sine.ts` (16 train, 8 test), `PolynomialFeatures(degree=9, include_bias=False)`, MSE train/test:

| Mô hình | MSE train | MSE test | Ghi chú |
|---|---|---|---|
| Hồi quy thường, không chuẩn hóa | 0,022 | 0,113 | $\max|w|\approx 14\,477$ |
| Hồi quy thường, có `StandardScaler` | 0,022 | 0,112 | $\max|w|\approx 3\,466$ |
| Ridge $\alpha=10^{-3}$, có scaler | 0,032 | 0,084 | $\max|w|\approx 7{,}7$ |
| Ridge $\alpha=1$, có scaler | 0,094 | 0,169 | quá tay: thiếu khớp |
| Lasso $\alpha=10^{-2}$, có scaler | 0,085 | 0,149 | 7/9 hệ số bằng 0 |
| ElasticNet $\alpha=10^{-2}$, `l1_ratio=0.5` | 0,084 | 0,147 | 3/9 hệ số bằng 0 |

Ridge giảm sai số test từ 0,11 xuống khoảng 0,08 ở $\alpha$ nhỏ, đúng "chữ U" mong đợi. `RidgeCV` chọn $\alpha\approx2{,}4\times10^{-5}$ (lưới `logspace(-6,2,30)`, LOO); `LassoCV` (5-fold) chọn $\alpha\approx7{,}2\times10^{-3}$, 6/9 hệ số bằng 0. Lưu ý: bộ chỉ 16 điểm train, nên $\alpha$ chọn ra không ổn định.

Đã kiểm: nghiệm dạng đóng $(\mathbf{Z}^\top\mathbf{Z}+\lambda\mathbf{I})^{-1}\mathbf{Z}^\top(\mathbf{y}-\bar{y})$ khớp `Ridge(lambda).coef_`, và `intercept_` bằng đúng $\bar{y}$ (khi $\mathbf{Z}$ đã chuẩn hóa), tức là **intercept không bị phạt**.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Quên chuẩn hóa.** Hệ số của đặc trưng thang nhỏ bị phạt oan; đặc biệt đặc trưng đa thức ($x, x^2,\dots,x^9$ có độ lớn rất khác nhau). [SK-SS] Chuẩn hóa **trong pipeline** để mỗi fold của CV tự tính trung bình và độ lệch chuẩn từ phần train (tránh rò rỉ; kiến thức chung, nối `cross_val_score` ở bài trước). Dù vậy, hồi quy thường trên bộ này không đổi nhiều khi chuẩn hóa (0,022 → 0,022); tác động lớn khi có phạt.
2. **Nhầm $\alpha$ với $\lambda$ trong sách.** Cùng một "độ mạnh" nhưng hệ số khác ($\tfrac1m$, $\tfrac12$); và Ridge khác Lasso về thang. [SK-LM] Xem bảng ánh xạ.
3. **Phạt cả intercept** (nhầm). scikit-learn không phạt (đã kiểm bằng số); [MLCB15] cũng nói weight decay hiếm khi áp cho bias. Lưu ý: "bias" ở đây là hệ số tự do $b$, khác bias trong bias–variance.
4. **Nghĩ Lasso luôn tốt hơn vì ra thưa.** Khi đặc trưng tương quan mạnh, Lasso chọn một cái khá tùy ý. Dữ liệu đa thức của bài chính là trường hợp các cột tương quan cao, nên Lasso chọn đặc trưng ở đây khó giải thích. (Kiến thức chung; kết quả chạy: Lasso $\alpha=10^{-2}$ sai số test 0,149, kém Ridge 0,084 ở bộ này.)
5. **Cho $\alpha=0$ vào `Ridge`/`Lasso`.** Tài liệu khuyên dùng `LinearRegression`; `RidgeCV` với LOO yêu cầu $\alpha$ dương. [SK-R, SK-L, SK-RCV]
6. **Chọn $\alpha$ bằng tập test.** Cùng lỗi như chọn bậc ở bài trước; dùng kiểm định chéo (`RidgeCV`, `LassoCV`). [SK-LM]
7. **Cho rằng Ridge tự chọn đặc trưng.** Ridge co nhưng không loại hẳn; chỉ L1 mới cho 0.
8. **Lasso không hội tụ, cảnh báo `ConvergenceWarning`.** Phổ biến với $\alpha$ rất nhỏ hoặc đặc trưng chưa chuẩn hóa; tăng `max_iter` hoặc chuẩn hóa. (Hiểu biết chung, đã gặp khi chạy thử với `max_iter` mặc định? **Chưa kiểm**, nên nói nhẹ.)
9. **Hiểu `l1_ratio=0` là Ridge hoàn toàn.** [SK-EN] nói là phạt L2 thuần, nhưng cũng cảnh báo `l1_ratio <= 0.01` không ổn định trừ khi tự cho dãy $\alpha$. Với Ridge thuần dùng `Ridge`. Ngoài ra thang $\alpha$ của ElasticNet và Ridge khác nhau (mục tiêu ElasticNet có $\frac{1}{2m}$), nên không so $\alpha$ trực tiếp.
10. **Đọc `C` như $\alpha$.** `LogisticRegression` dùng $C$ (nghịch đảo). [SK-LM, MLCB15]
11. **Nhầm trục:** Ridge/Lasso chỉ đổi độ lớn hệ số, không đổi bậc đa thức. Bậc vẫn là 9; chỉ "độ cong hiệu dụng" giảm.

## Ký hiệu từng nguồn so với site

| Nguồn | Số mẫu | Số đặc trưng | Mất mát | Trọng số | Độ mạnh phạt | Khác site |
|---|---|---|---|---|---|---|
| Site | $m$ | $n$ | $\mathcal{L}$ | $\mathbf{w}$, $b$ | $\lambda$ | |
| [SK-LM, SK-R, SK-L, SK-EN] | `n_samples` | `n_features` | không đặt tên; hạng "$\lVert y-Xw\rVert_2^2$" | $w$ (không đậm) | $\alpha$; $\rho$ = `l1_ratio` | Không ký hiệu $b$ (intercept tách riêng, `intercept_`). $\alpha$ khác thang với $\lambda$ như trên |
| [MLCB15] | $N$ | $d$ (bậc) | $J(\theta)$, $J_{\text{reg}}=J+\lambda R$ | $\boldsymbol\theta$/$\mathbf{w}$ | $\lambda$ | $N$ thay $m$, $J$ thay $\mathcal{L}$ |
| ISL (**chưa kiểm văn bản**) | $n$ | $p$ | RSS | $\beta$ | $\lambda$ | Theo hiểu biết chung: $n$ là số mẫu (ngược site), $\beta$ thay $\mathbf{w}$, thường chia RSS không chia $m$ |
| [ZH05], [T96] | chưa kiểm | chưa kiểm | chưa kiểm | $\beta$ (hiểu biết chung) | $\lambda_1,\lambda_2$ ([ZH05]); $t$ hoặc $\lambda$ ([T96]) | Chưa đối chiếu |

Gợi ý một dòng ghi chú cho bài: "Sách thống kê hay viết $\beta$ cho trọng số, $\lambda$ cho độ mạnh phạt; scikit-learn gọi là `alpha` và thang hệ số có thể khác."

## Liên quan tới bài nào

Slug theo `src/data/roadmap.ts` (đã đọc dòng 198-221).

- **Bài trước:** `ml/overfitting-underfitting` (đa thức bậc cao, bộ sine, `make_pipeline`, `cross_val_score`; đã hẹn bài này) và `ml/linear-regression` (MSE, nghiệm dạng đóng $(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}$).
- **Bài sau dùng bài này:** `ml/gradient-descent` có thể nhắc weight decay là thêm $2\lambda\mathbf{w}$ vào gradient (kiến thức chung); và các bài cần `ml/regularization` làm tiền đề (dòng 275, 291 trong roadmap: `ml/optimizers`, `dl/...`): trực tiếp ở phần weight decay/AdamW. Chưa mở các bài đó để kiểm.
- **`ml/data-preprocessing`:** bài chuẩn hóa/`StandardScaler`; bài này chỉ nhắc ngắn và hẹn bài đó. Kiểm lại thứ tự (roadmap dòng 275 cho thấy nó là tiền đề của một bài khác, chưa xác nhận vị trí so với bài này).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Điều chuẩn hóa / phạt trọng số | Regularization | Giữ "regularization", gloss "phạt trọng số lớn"; tránh nhầm với "chuẩn hóa" (standardization) của đặc trưng |
| Chuẩn hóa đặc trưng | Feature standardization / scaling | Dịch; tách biệt rõ với regularization |
| Hồi quy Ridge, hồi quy Lasso, Elastic Net | Ridge/Lasso/Elastic Net regression | Giữ tên riêng |
| Chuẩn L1, chuẩn L2 | L1 norm, L2 norm | Dịch, ghi kèm |
| Thưa | Sparse / sparsity | "Mô hình thưa" |
| Co (hệ số) | Shrinkage | "Co hệ số về 0" |
| Giảm trọng số | Weight decay | Giữ "weight decay" |
| Kiểm định chéo | Cross-validation | Đã có |
| Soft-thresholding | Soft-thresholding | Giữ |

Lưu ý trùng chữ: "chuẩn hóa" dễ gây nhầm giữa normalization/standardization/regularization; bài nên dùng "chuẩn hóa đặc trưng (StandardScaler)" và "regularization" nhất quán.

## Đọc thêm đề xuất

1. **scikit-learn 1.8, *Linear Models* (Ridge, Lasso, Elastic Net).** [Link](https://scikit-learn.org/1.8/modules/linear_model.html). Đã đọc.
2. **Tiep Vu, *Machine Learning cơ bản*, Bài 15** (mục regularization). [Link](https://machinelearningcoban.com/2017/03/04/overfitting/). Đã đọc.
3. **James et al., *An Introduction to Statistical Learning*, chương 6.** [Link](https://www.statlearning.com/). Chưa mở chương 6.
4. Ba bài gốc [HK70], [T96], [ZH05] cho người muốn tìm hiểu sâu. Chỉ xác minh thư mục.
