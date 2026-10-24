# Overfitting và Underfitting

Bài: `ml/overfitting-underfitting`. Quyết định liên quan trong `docs/mvp.md` mục 7: số 37 (VIZ thanh trượt bậc đa thức, vẽ đường khớp cùng sai số train/test), số 38 (dữ liệu nhỏ tự sinh có seed). Code chỉ dùng `numpy`, `scikit-learn`, `matplotlib` (Pyodide, scikit-learn 1.8.0).

Ngày kiểm tra nguồn: **23/10/2026**, bằng WebFetch. Thẻ nguồn: [SK-EX], [SK-PF], [SK-MP], [SK-CV], [GG-OF], [MLCB15], [ISL]. Ý không có thẻ là kiến thức chung của `summarizer`.

## Nguồn

**Đã mở và đọc được:**

- **[SK-EX]** scikit-learn developers. [*scikit-learn 1.8: Underfitting vs. Overfitting*](https://scikit-learn.org/1.8/auto_examples/model_selection/plot_underfitting_overfitting.html) (gallery). 30 điểm, $x$ rút đều trên $[0,1)$ rồi sắp xếp, nhãn là $\cos(1.5\pi x)$ cộng nhiễu chuẩn độ lệch 0,1, `np.random.seed(0)`. Thử bậc 1, 4, 15 bằng `Pipeline` gồm `PolynomialFeatures(degree=..., include_bias=False)` và `LinearRegression()`. Đánh giá bằng `cross_val_score(..., scoring="neg_mean_squared_error", cv=10)`. Kết quả trang ghi: bậc 1 MSE ≈ 0,408 (thiếu khớp), bậc 4 ≈ 0,0432 (tốt nhất), bậc 15 ≈ 1,82e+08 (quá khớp, số nổ vì đa thức bậc cao dao động mạnh ở các fold). Các số này **lấy từ trang, chưa tự chạy lại** (máy phiên này không có scikit-learn).
- **[SK-PF]** scikit-learn developers. [*`sklearn.preprocessing.PolynomialFeatures`*](https://scikit-learn.org/1.8/modules/generated/sklearn.preprocessing.PolynomialFeatures.html), bản 1.8. Chữ ký: `PolynomialFeatures(degree=2, *, interaction_only=False, include_bias=True, order='C')`. Với một đặc trưng $a$, `degree=3` cho các cột $1, a, a^2, a^3$; `include_bias=False` bỏ cột 1 (cột này trùng vai trò hệ số tự do mà `LinearRegression` đã có). Ví dụ trên trang: `X=[[2],[3]]` với `degree=2` cho `[[1,2,4],[1,3,9]]`. Mục [Polynomial features](https://scikit-learn.org/1.8/modules/preprocessing.html#polynomial-features) trong User Guide minh họa thêm với hai đặc trưng.
- **[SK-MP]** scikit-learn developers. [*`sklearn.pipeline.make_pipeline`*](https://scikit-learn.org/1.8/modules/generated/sklearn.pipeline.make_pipeline.html), bản 1.8. Chữ ký: `make_pipeline(*steps, memory=None, transform_input=None, verbose=False)`. Là cách viết tắt của `Pipeline`, tên bước tự đặt bằng tên lớp viết thường (`polynomialfeatures`, `linearregression`). Ví dụ gallery dùng `Pipeline` có tên bước; bài có thể dùng `make_pipeline` cho gọn.
- **[SK-CV]** scikit-learn developers. [*scikit-learn 1.8: Cross-validation*](https://scikit-learn.org/1.8/modules/cross_validation.html). Chấm trên dữ liệu đã học là sai phương pháp; giữ riêng tập test; tinh chỉnh siêu tham số bằng tập test thì thông tin "rò" vào mô hình nên cần validation; chia ba tập làm train ít đi và kết quả phụ thuộc một lần chia, nên dùng $k$-fold: lần lượt giữ một fold làm validation, huấn luyện trên $k-1$ fold còn lại, lấy trung bình. `cross_val_score(estimator, X, y, cv=5)` trả một điểm mỗi fold. Số nguyên `cv` dùng `KFold`, hoặc `StratifiedKFold` với bộ phân loại. `scoring` đổi thước đo.
- **[GG-OF]** Google. [*Machine Learning Crash Course: Overfitting*](https://developers.google.com/machine-learning/crash-course/overfitting/overfitting) (không ghi năm). Overfitting: mô hình bám tập train quá sát nên dự đoán kém trên dữ liệu mới. Underfitting: dự đoán kém cả trên train. Hai nguyên nhân: tập train không đại diện cho thực tế, hoặc mô hình quá phức tạp. Đường mất mát train và validation lúc đầu giống nhau, sau đó tách ra: train tiếp tục giảm hoặc đi ngang, validation tăng. Mô hình khớp tốt thì hai đường có hình dạng gần nhau. Trang chỉ nhắc regularization qua loa (có bài riêng cho L2).
- **[MLCB15]** Tiep Vu (tên theo tài khoản GitHub trong bài; trang không ghi tên), đăng 04/03/2017. [*Machine Learning cơ bản*, Bài 15: Overfitting](https://machinelearningcoban.com/2017/03/04/overfitting/). **Nguồn tiếng Việt chính.** Mở đầu nói overfitting không phải một thuật toán mà là hiện tượng. Nêu train error và test error là sai số trung bình trên mỗi điểm. Mô hình tốt khi cả hai thấp; train thấp mà test cao là overfitting; cả hai cao là underfitting. Hay gặp khi mô hình quá phức tạp so với lượng dữ liệu (đa thức bậc cao, mạng nhiều lớp). Đề cập validation (chọn mô hình có validation error nhỏ nhất, tăng dần độ phức tạp và dừng khi validation error bắt đầu tăng), cross-validation ($k$ phần, trường hợp $k$ bằng số mẫu là leave-one-out), rồi regularization: early stopping, L2 (Ridge), L1 (LASSO), Elastic Net, dropout, pruning. Ghi chú trong bài: tham số `C` của sklearn bằng $1/\lambda$.
- **[ISL]** James, G., Witten, D., Hastie, T., Tibshirani, R. [*An Introduction to Statistical Learning*](https://www.statlearning.com/). Trang sách mở được, liệt kê bản R lần 1 (2013), lần 2 (2021), bản Python ISLP (2023). Xem mục "Chưa xác minh".

**Chưa xác minh hoặc không mở được:**

| Nguồn | Tình trạng | Quyết định |
|---|---|---|
| [ISL] chương 2, mục 2.2.2 "The Bias-Variance Trade-Off" | **Đã xác minh** (23/10/2026, phiên chính): mục lục bản PDF 1 có mục 2.2.2 "The Bias-Variance Trade-Off" và chương 5 "Resampling Methods". Nội dung chi tiết chưa đọc. | Mục bias–variance bên dưới vẫn là kiến thức chung, **không gắn thẻ nguồn**. Bài dẫn ISL ở "Đọc thêm" (mục 2.2, chương 5), không nói "ISL viết rằng...". |
| Ký hiệu của ISL ($n$ số mẫu, $p$ số đặc trưng) | Mục lục đã xác minh; ký hiệu chưa đối chiếu trong văn bản. | Ghi theo hiểu biết chung về ISL; `content-reviewer` không báo lỗi. |
| Hastie, Tibshirani, Friedman, *The Elements of Statistical Learning*, chương 2 và 7 (bias–variance) | Host `hastie.su.domains` không kết nối được ở phiên trước; phiên này **không thử lại**. | Bỏ. |
| Số liệu sai số train/test theo bậc cho bộ dữ liệu của bài | Máy phiên này **không có scikit-learn** (`ModuleNotFoundError`), nên chưa chạy được. | `lesson-writer` phải chạy thử bằng `python` trước khi viết số vào bài. Không có số nào trong file này là kết quả tự chạy. |
| Câu trên trang [SK-EX] "the MSE is higher when the model is less likely to generalize" | Công cụ đọc trang cho rằng câu này đảo nghĩa (MSE càng thấp càng tốt). Chưa đối chiếu trực tiếp văn bản gốc. | Đừng trích câu này. |

## Ý chính

- **Hai hiện tượng đối xứng.** Underfitting (thiếu khớp): mô hình quá đơn giản, sai số cao cả trên train lẫn test. Overfitting (quá khớp): mô hình khớp luôn cả nhiễu của tập train, sai số train thấp nhưng test cao. [MLCB15, GG-OF]
- **Overfitting là hiện tượng, không phải thuật toán.** Nó xảy ra với mọi loại mô hình. [MLCB15]
- **Hai nguyên nhân hay gặp:** mô hình quá phức tạp so với lượng dữ liệu, hoặc tập train không đại diện cho dữ liệu thật. [GG-OF, MLCB15]
- **Đọc chẩn đoán bằng hai con số.** Cả hai cao: thiếu khớp. Train thấp, test cao hẳn: quá khớp. Cả hai thấp và gần nhau: tạm ổn. [MLCB15, GG-OF]
- **Đường cong theo độ phức tạp** (đúng thứ bài cần cho VIZ). Khi bậc đa thức tăng, sai số train gần như chỉ giảm (khớp thêm được dữ liệu). Sai số test giảm rồi tăng, tạo hình chữ U. Bậc tốt nằm ở đáy chữ U. Hình chữ U là kiến thức chung; [SK-EX] cho thấy ba điểm (bậc 1, 4, 15) khớp với mô tả này, và [MLCB15] mô tả cách chọn "tăng dần độ phức tạp, dừng khi validation error bắt đầu tăng".
- **Đường cong theo số vòng huấn luyện** là cách vẽ khác: train đi xuống, validation đi xuống rồi tách ra và tăng. [GG-OF] Bài này dùng trục bậc đa thức, nên chỉ nhắc để khỏi nhầm hai loại trục.
- **Bias–variance ở mức trực giác** (kiến thức chung, chưa có nguồn gắn thẻ). Bias là sai lệch có hệ thống do mô hình quá đơn giản để biểu diễn quy luật thật (đường thẳng cho dữ liệu cong). Variance là độ nhạy với mẫu train cụ thể: đổi vài điểm dữ liệu thì đường khớp đổi lớn. Bậc thấp: bias cao, variance thấp. Bậc cao: bias thấp, variance cao. Điểm tốt là cân bằng hai thứ.
- **`PolynomialFeatures` + `LinearRegression`.** Đây là hồi quy tuyến tính trên các đặc trưng $x, x^2, \dots, x^d$: vẫn tuyến tính theo tham số (nối với `ml/linear-regression`). `include_bias=False` vì `LinearRegression` đã có hệ số tự do. `make_pipeline` gói hai bước để `fit`/`predict` một lần, và để `cross_val_score` tự đặt phép biến đổi đúng trong từng fold. [SK-PF, SK-MP, SK-EX]
- **Cách xử lý, theo thứ tự nên nói:** (1) thêm dữ liệu (nhất là đa dạng hơn), (2) giảm độ phức tạp (hạ bậc), (3) regularization (phạt trọng số lớn, chỉ nhắc một câu rồi hẹn `ml/regularization`), (4) chọn độ phức tạp bằng tập kiểm định hoặc kiểm định chéo. [MLCB15, GG-OF, SK-CV]
- **Kiểm định chéo ở mức giới thiệu:** chia $k$ fold, lần lượt giữ một fold để chấm, lấy trung bình; hợp khi ít dữ liệu, vì bộ nhỏ của bài chỉ có vài chục mẫu. `cross_val_score` trả một điểm mỗi fold, nên có cả độ dao động. [SK-CV, SK-EX]
- **Thiếu khớp cũng nên "chữa":** tăng độ phức tạp (thêm bậc hoặc đặc trưng). Không phải lúc nào cũng cần thêm dữ liệu: nếu mô hình quá đơn giản, thêm dữ liệu không cứu được. (Kiến thức chung.)

## Công thức quan trọng

Theo ký hiệu của site. Hồi quy đa thức một biến, bậc $d$:

$$\hat{y} = b + w_1 x + w_2 x^2 + \dots + w_d x^d$$

Giải thích cho bài: đặt $\mathbf{x}_{\text{poly}} = (x, x^2, \dots, x^d)$, thì $\hat{y} = b + \mathbf{w}^\top \mathbf{x}_{\text{poly}}$, đúng dạng hồi quy tuyến tính nhiều đặc trưng với $n = d$ đặc trưng. Lưu ý: ở đây $n$ (số đặc trưng sau biến đổi) bằng bậc $d$, còn đầu vào gốc chỉ có một biến. Nên nói rõ để người đọc không nhầm.

Sai số trên một tập có $m$ mẫu, dùng MSE (đã học ở `ml/linear-regression`):

$$\mathcal{L}(\mathbf{w}, b) = \frac{1}{m}\sum_{i=1}^{m}\left(y_i - \hat{y}_i\right)^2$$

Tên gọi gợi ý (của `summarizer`, **không lấy từ nguồn**): $\mathcal{L}_{\text{train}}$ tính trên $m_{\text{train}}$ mẫu train, $\mathcal{L}_{\text{test}}$ tính trên $m_{\text{test}}$ mẫu test. Dùng cùng công thức, chỉ khác tập mẫu.

Điểm kiểm định chéo $k$-fold (nếu bài viết ra):

$$\text{CV} = \frac{1}{k}\sum_{j=1}^{k}\mathcal{L}_{j}$$

với $\mathcal{L}_{j}$ là sai số trên fold thứ $j$ khi mô hình huấn luyện trên $k-1$ fold còn lại. Công thức này là cách viết lại của `summarizer` theo mô tả [SK-CV, MLCB15].

Regularization (chỉ nhắc, không dẫn): dạng chung $\mathcal{L}_{\text{reg}} = \mathcal{L} + \lambda R(\mathbf{w})$ là cách [MLCB15] viết (ông dùng $J$, $\theta$). Trong site, hẹn bài `ml/regularization`.

**Ký hiệu các nguồn dùng so với site** ($m$ số mẫu, $n$ số đặc trưng, $\mathcal{L}$ mất mát, $\mathbf{w}$ trọng số, $\boldsymbol{\theta}$ tham số chung):

| Nguồn | Số mẫu | Bậc đa thức / số đặc trưng | Mất mát | Khác site thế nào |
|---|---|---|---|---|
| [MLCB15] (đã đọc) | $N$ ($N_{\text{train}}$, $N_{\text{test}}$) | bậc đa thức là $d$ | $J$, regularization $J_{\text{reg}}=J+\lambda R$ | $N$ thay $m$; $J$ thay $\mathcal{L}$; $\theta$ là tham số chung, $\mathbf{w}$ là hệ số, giống site; $d$ là bậc (site có thể dùng $d$ cho bậc nhưng $n$ vẫn là số đặc trưng) |
| [SK-EX], [SK-PF], [SK-CV] | tên mảng `X`, `y`; không ký hiệu toán | `degree` | `scoring="neg_mean_squared_error"` | Điểm số lấy dấu **âm** của MSE (scikit-learn luôn tối đa hóa điểm); phải đổi dấu `-scores.mean()` mới ra MSE. Dễ gây nhầm trong bài |
| [GG-OF] | không có ký hiệu toán ở trang đã đọc | | "loss" | Dùng "loss" thay "sai số" |
| [ISL] (**đã xác minh** mục lục bản PDF 1: 2.2.2 và chương 5) | $n$ | $p$ | MSE | Nếu đúng, **$n$ là số mẫu** (ngược site) và $p$ là số đặc trưng |

Gợi ý: một dòng ghi chú trong bài, "sách khác có thể gọi số mẫu là $N$ hoặc $n$, và hàm mất mát là $J$".

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình.

- **Học thuộc đề so với hiểu bài** (nối từ bài trước, "chấm điểm đề đã học thuộc"). Overfitting giống học sinh thuộc lòng đáp án các đề cũ, kể cả những lỗi in sai. Thiếu khớp giống học sinh chỉ nhớ "bài này khó" mà không học gì. (Ví dụ của `summarizer`.)
- **Đường thẳng, đường cong vừa phải, đường uốn lượn.** Cùng một đám điểm, ba bậc. Bậc 1 không bắt được độ cong. Bậc vừa uốn theo quy luật. Bậc cao chạy xuyên qua từng điểm, giữa hai điểm lại đổ lên đổ xuống. Đó là ba ảnh chính của VIZ, giống ba panel của [SK-EX] (bậc 1, 4, 15).
- **Đường chữ U của sai số test.** Kéo thanh trượt từ bậc 1 lên cao: sai số train đi xuống đều, sai số test đi xuống rồi quay đầu lên. Người đọc tự tìm đáy chữ U. [mô tả của `summarizer`, khớp với kết quả ba điểm của SK-EX]
- **Đổi dữ liệu thì đường khớp bậc cao đổi theo**, còn đường bậc thấp gần như đứng yên. Đây là cách cảm nhận variance mà không cần công thức. Gợi ý nút "Lấy mẫu train khác" cho VIZ (chỉ là gợi ý, quyết định 37 chưa có yêu cầu này).
- **Cảnh báo nhiễu bậc cao ở rìa.** Đa thức bậc cao vọt rất mạnh ngoài vùng có dữ liệu, nên trục $y$ của hình cần cắt (như `plt.ylim` của [SK-EX]) để hình không bị phá vỡ. Điểm của [SK-EX]: MSE bậc 15 lên tới cỡ $10^8$, trong khi MSE bậc 4 cỡ $10^{-2}$.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp". Ý có thẻ lấy từ nguồn đã đọc; ý không thẻ là kiến thức chung.

1. **Cho rằng mô hình phức tạp luôn tốt hơn** vì sai số train nhỏ hơn. Sai số train gần như luôn giảm khi tăng bậc, nên không dùng nó để chọn bậc. [MLCB15, SK-CV]
2. **Chọn bậc bằng tập test** rồi báo điểm test. Điểm này trở nên lạc quan; cần tập kiểm định hoặc kiểm định chéo, tập test chỉ chấm cuối. [SK-CV] (nhắc lại hộp của bài `ml/ml-overview`.)
3. **Chỉ nhìn một lần chia train/test với bộ ít dữ liệu.** Kết quả phụ thuộc lần chia; kiểm định chéo lấy trung bình. [SK-CV] Bài trước đã nhắc, bài này giới thiệu `cross_val_score`.
4. **Quên đổi dấu `neg_mean_squared_error`.** Điểm là âm của MSE; số âm "lớn hơn" (gần 0 hơn) là tốt hơn. [SK-EX: tiêu đề dùng `-scores.mean()`]
5. **Nghĩ rằng overfitting chỉ liên quan tới "nhiều tham số".** [GG-OF, MLCB15] nhắc thêm tập train không đại diện cũng gây ra; mô hình vừa phải mà dữ liệu lệch vẫn kém trên dữ liệu thật.
6. **Cho rằng chỉ cần thêm dữ liệu là hết overfitting.** Giúp được khi dữ liệu thêm cũng đa dạng; không giúp thiếu khớp. [GG-OF nhấn mạnh tính đại diện]
7. **Nhầm hai trục của đường cong.** Sai số theo độ phức tạp (bậc) khác sai số theo số vòng huấn luyện. [GG-OF vẽ loại sau; hình chữ U của bài là loại đầu]
8. **Nghĩ "tuyến tính" nghĩa là chỉ vẽ được đường thẳng**, nên cho rằng bậc 15 không còn là hồi quy tuyến tính. Thực ra mô hình vẫn tuyến tính theo tham số. (Nối từ `ml/linear-regression`; [SK-PF] biến $x$ thành các cột lũy thừa.)
9. **`include_bias=True` rồi `LinearRegression()` giữ hệ số tự do**: hai cột "1" dư thừa, không sai kết quả dự đoán nhưng gây rối khi nhìn hệ số. [SK-PF] mô tả cột 1; hệ quả "dư thừa" là kiến thức chung, nên kiểm bằng code. Gallery dùng `include_bias=False`.
10. **Quên chuẩn hóa đặc trưng khi bậc cao.** $x^{15}$ có cỡ rất khác $x$ khi $x$ không nằm trong $[0,1]$, khiến tính toán không ổn định. Đây là kiến thức chung, **chưa thấy nguồn đã đọc nói**; dữ liệu của bài nằm trong $[0,1]$ nên có thể bỏ qua, chỉ nhắc nếu bài đổi miền.
11. **Không đặt `seed` khi tự sinh dữ liệu** thì mỗi lần chạy ra một hình. [SK-EX dùng `np.random.seed(0)`] Khớp quy ước của site.
12. **Đọc tên "thiếu khớp/quá khớp" thành lỗi lập trình.** Đây là tính chất của mô hình đối với dữ liệu, không phải bug.

## Liên quan tới bài nào

Slug theo `src/data/roadmap.ts` (**không đọc lại file này trong phiên này**; kiểm lại nếu cần).

- **Bài trước:** `ml/ml-overview` (train/test, tổng quát hóa, tập kiểm định chỉ nhắc tên; đã trỏ tới bài này) và `ml/linear-regression` (MSE, "tuyến tính theo tham số").
- **Bài sau:** `ml/regularization` (Ridge/Lasso). Bài này chỉ nhắc regularization là một cách giảm độ phức tạp bằng cách phạt trọng số lớn.
- **Bài về đánh giá mô hình, kiểm định chéo đầy đủ, metric:** chưa kiểm roadmap xem có bài nào; bài này chỉ giới thiệu `cross_val_score`.
- **`ml/gradient-descent`:** không cần cho bài này.
- **`python/numpy-pandas`, `python/matplotlib`:** nơi mượn `np.linspace`, `np.sort`, `plt.plot`.

## Thuật ngữ đề xuất

Chỉ đề xuất, **chưa sửa** `docs/glossary.md`; kiểm xem đã có trước khi thêm.

| Tiếng Việt | Tiếng Anh | Cách dùng | Ghi chú |
|---|---|---|---|
| Quá khớp | Overfitting | Giữ "overfitting" (người Việt quen), ghi "quá khớp" một lần | [MLCB15] dùng "overfitting" |
| Thiếu khớp | Underfitting | Giữ "underfitting", ghi "thiếu khớp" một lần | |
| Độ phức tạp của mô hình | Model complexity | Dịch | Trục của VIZ |
| Độ chệch | Bias | Giữ "bias" (dễ nhầm với hệ số tự do $b$ cũng gọi là bias) | Nên viết "bias (độ chệch)" và nhắc phân biệt với hệ số tự do $b$ |
| Phương sai (của mô hình) | Variance | Giữ "variance" | |
| Sự đánh đổi bias–variance | Bias–variance trade-off | Dịch kèm tiếng Anh | |
| Sai số huấn luyện, sai số kiểm tra | Training error, test error | Dịch, ghi "sai số train/test" | |
| Kiểm định chéo | Cross-validation | Dịch (đã dùng ở bài trước) | |
| Fold | Fold | Giữ | |
| Hồi quy đa thức | Polynomial regression | Dịch | |
| Đặc trưng đa thức | Polynomial features | Dịch | |
| Siêu tham số | Hyperparameter | Dịch; bậc đa thức là một siêu tham số | Kiểm tra glossary |

Cảnh báo trùng tên: "bias" vừa là hệ số tự do $b$ (site gọi là "hệ số tự do"), vừa là độ chệch trong bias–variance. Nên giải thích rõ lần đầu và không dùng "bias" cho $b$ trong bài này.

## Đọc thêm đề xuất

1. **Tiep Vu, *Machine Learning cơ bản*, Bài 15: Overfitting** (tiếng Việt, 2017). [Link](https://machinelearningcoban.com/2017/03/04/overfitting/). Đã đọc.
2. **scikit-learn 1.8, *Underfitting vs. Overfitting*.** [Link](https://scikit-learn.org/1.8/auto_examples/model_selection/plot_underfitting_overfitting.html). Đã đọc. Ví dụ chuẩn để đối chiếu hình và số (nhưng chạy lại trước khi trích số).
3. **Google, *Machine Learning Crash Course: Overfitting*.** [Link](https://developers.google.com/machine-learning/crash-course/overfitting/overfitting). Đã đọc.
4. **scikit-learn 1.8, Cross-validation.** [Link](https://scikit-learn.org/1.8/modules/cross_validation.html). Đã đọc.
5. **James et al., *An Introduction to Statistical Learning*, chương 2 (bias–variance).** [Link](https://www.statlearning.com/). Trang sách mở được; **chưa đọc chương 2**.
