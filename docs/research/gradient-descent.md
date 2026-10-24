# Gradient Descent (hạ gradient)

Bài: `ml/gradient-descent` (tiền đề: `ml/linear-regression`; bài sau: `ml/optimizers`). Quyết định liên quan trong `docs/decisions.md`: số 37 (VIZ chạy từng bước, đổi tốc độ học), số 38 (giải lại đúng bài toán 10 căn hộ của bài Hồi quy tuyến tính, `src/data/datasets/apartments.ts`). Code chỉ dùng `numpy`, `scikit-learn`, `matplotlib` (Pyodide, scikit-learn 1.8).

Ngày kiểm tra nguồn: **24/10/2026**, bằng WebFetch/WebSearch. Thẻ nguồn: [C47], [L12], [RM51], [SK-SGDR], [SK-SGD], [MLCB-7], [MLCB-8], [G-GD], [G-HP], [R16]. Mục "Số tự chạy" ghi kết quả `summarizer` tự tính. Ý không có thẻ là kiến thức chung hoặc suy ra đại số.

## Nguồn

**Nguồn gốc lịch sử:**

- **[C47]** Cauchy, A. (1847). *Méthode générale pour la résolution des systèmes d'équations simultanées*. *Comptes rendus hebdomadaires des séances de l'Académie des sciences* 25, 536-538 (in lại trong *Œuvres complètes*, série I, tập 10, bài 383, tr. 399-402). **Đã đọc toàn văn** qua [bản dịch tiếng Anh của R. J. Pulskamp (PDF)](https://gtfp.cs.rhul.ac.uk/pulskamp/Cauchy/Orbits/1847%20CR%20536%28383%29.pdf) (đầu bản dịch ghi đúng tạp chí, tập, trang). Không tìm được liên kết Gallica trực tiếp tới trang này, nên không dẫn Gallica.
- **[L12]** Lemaréchal, C. (2012). [*Cauchy and the Gradient Method*](https://doi.org/10.4171/dms/6/27). *Documenta Mathematica*, Extra Volume: Optimization Stories (ISMP 2012), 251-254. DOI `10.4171/DMS/6/27`. Trang [ems.press](https://ems.press/books/dms/251/4938) khớp tên, tác giả, trang, DOI; không có tóm tắt. Bản mirror emis.univie.ac.at trả 503. **Chưa đọc nội dung.** Chỉ dùng như "bài lịch sử để đọc thêm".
- **[RM51]** Robbins, H., Monro, S. (1951). [*A Stochastic Approximation Method*](https://doi.org/10.1214/aoms/1177729586). *The Annals of Mathematical Statistics* 22(3), 400-407. DOI `10.1214/aoms/1177729586`. Xác minh qua Crossref API. **Chưa đọc nội dung bài.**

**scikit-learn 1.8 (đã mở và đọc):**

- **[SK-SGDR]** [*`SGDRegressor`*](https://scikit-learn.org/1.8/modules/generated/sklearn.linear_model.SGDRegressor.html). Chữ ký và mặc định đã chép lại ở "Điểm dễ hiểu nhầm".
- **[SK-SGD]** [*Stochastic Gradient Descent*](https://scikit-learn.org/1.8/modules/sgd.html) (User Guide, mục 1.5): lịch tốc độ học, tiêu chí dừng, mẹo dùng.

**Tiếng Việt:**

- **[MLCB-7]** Tiep Vu (2017). [*Machine Learning cơ bản*, Bài 7: Gradient Descent (phần 1/2)](https://machinelearningcoban.com/2017/01/12/gradientdescent/). Đăng 12/01/2017.
- **[MLCB-8]** Tiep Vu (2017). [*Machine Learning cơ bản*, Bài 8: Gradient Descent (phần 2/2)](https://machinelearningcoban.com/2017/01/16/gradientdescent2/). Đăng 16/01/2017.

**Khóa học:**

- **[G-GD]** Google for Developers. [*Linear regression: Gradient descent*](https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent) (Machine Learning Crash Course).
- **[G-HP]** Google for Developers. [*Linear regression: Hyperparameters*](https://developers.google.com/machine-learning/crash-course/linear-regression/hyperparameters) (Machine Learning Crash Course).

**Đọc thêm:**

- **[R16]** Ruder, S. (2016, bản sửa 2017). [*An overview of gradient descent optimization algorithms*](https://arxiv.org/abs/1609.04747). arXiv:1609.04747. Chỉ đọc trang tóm tắt: bài tổng quan về các biến thể GD và các bộ tối ưu phổ biến (hợp cho `ml/optimizers`).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Điều kiện $\eta<2/L$ cho hàm bậc hai | **Không có nguồn đã đọc nào nêu đúng điều kiện này.** Tìm được: Tibshirani (CMU, convex optimization, `grad-descent.pdf`; PDF nén, công cụ không đọc được), Cornell CS4787 bài 9 (lỗi chứng chỉ, không mở được). Kết quả tìm kiếm chỉ cho biết các ghi chú đó dùng $t\le1/L$ và bước tối ưu $2/(L+\mu)$ (Cornell, 2D bậc hai: co mỗi bước theo $(\kappa-1)/(\kappa+1)$). Đây là tóm tắt của trang kết quả tìm kiếm, **chưa đọc văn bản**. | Chứng minh một dòng trong bài (xem "Công thức quan trọng") và đã **tự kiểm bằng số** trên 10 căn hộ. Không viết "sách X chứng minh rằng...". |
| Bottou (2010), *Large-Scale Machine Learning with Stochastic Gradient Descent*; Goodfellow, Bengio, Courville, *Deep Learning* mục 4.3 | Không mở được (trang deeplearningbook.org trả nội dung rỗng với công cụ). Không kiểm DOI/URL Bottou. | Không dẫn. |
| Google MLCC có nhắc "learning rate" ở trang Gradient descent | **Không**: trang đó gọi "small amount" và đặt cố định 0,01. Thuật ngữ "learning rate" ở trang [G-HP]. | Dẫn đúng trang cho đúng ý. |
| "Robbins-Monro là nguồn gốc của SGD" | Bài gốc là phương pháp xấp xỉ ngẫu nhiên (tìm nghiệm khi chỉ quan sát nhiễu). Việc coi nó là tiền thân của SGD là hiểu biết chung, chưa đọc bài. | Viết "tiền thân của", không viết "phát minh ra SGD". |
| "Cauchy phát minh gradient descent" | [C47] đọc được: Cauchy dùng để **giải hệ phương trình** bằng cách giảm $u=\sum(\text{vế trái})^2$, động cơ là tính quỹ đạo thiên thể. Ông chưa nói "tối thiểu hàm mất mát" theo nghĩa học máy. | Viết đúng như trên, kèm "ý tưởng". |
| Số liệu theo scikit-learn **1.8** | Máy phiên này cài scikit-learn **1.9.1**, numpy 2.5.3 (không phải bản trong Pyodide). | Số dưới đây ổn định về định tính. `lesson-writer` phải chạy lại trước khi viết số vào bài. |
| Hành vi `SGDRegressor.partial_fit` cho mini-batch | Trang [SK-SGDR] có nhắc `partial_fit` ở mô tả `max_iter` nhưng ta chưa đọc trang đó; [SK-SGD] nói rõ không nhắc mini-batch. | Không dùng `SGDRegressor` để minh họa mini-batch. Tự viết vòng lặp bằng numpy. |

## Ý chính

- **Ý tưởng:** từ điểm hiện tại, đi một bước ngắn ngược hướng dốc nhất rồi lặp lại. Bài trước giải bằng cách cho đạo hàm bằng 0; bài này tìm đáy bát bằng cách đi dần xuống, và cách này dùng được cả khi không có phương trình chuẩn.
- **Lịch sử [C47]:** Cauchy muốn giải hệ phương trình nhiều ẩn mà khử ẩn không làm được. Ông ghép các phương trình thành một hàm không âm $u$, rồi cho $u$ giảm: tại điểm hiện tại, dịch mỗi biến một đoạn ngược dấu đạo hàm riêng của nó; khi bước đủ nhỏ thì $u$ giảm. Ông còn gợi ý một độ dài bước theo công thức (6) của bài, và nhắc áp dụng cho bài toán xác định quỹ đạo. Đây chính là quy tắc cập nhật ngày nay, dù ông chưa dùng chữ "gradient".
- **Quy tắc cập nhật:** $\boldsymbol{\theta}\leftarrow\boldsymbol{\theta}-\eta\nabla\mathcal{L}(\boldsymbol{\theta})$. Hướng ngược gradient là hướng giảm nhanh nhất cục bộ; $\eta$ quyết định bước dài bao nhiêu. [MLCB-7]
- **Tốc độ học $\eta$:** quá nhỏ thì hội tụ quá chậm; quá lớn thì bước nhảy qua đáy, dao động quanh đáy hoặc càng lúc càng xa (phân kỳ). Giá trị tốt phụ thuộc bài toán và dữ liệu, thường phải thử. [MLCB-7, G-HP] [G-HP] có một câu đáng dùng làm bẫy: nhân đôi tốc độ học có thể làm huấn luyện **chậm hơn** vì trọng số dao động.
- **Hàm bậc hai và MSE là hàm lồi:** bề mặt hình cái bát, không có cực tiểu cục bộ giả, nên GD tới đúng đáy với $\eta$ đủ nhỏ. [G-GD] nói thẳng mô hình tuyến tính có mặt mất mát lồi nên GD tới cực tiểu toàn cục. (Điều này không đúng cho mạng nơ-ron; để dành cho phần DL.)
- **Chuẩn hóa đặc trưng quyết định tốc độ:** khi các đặc trưng khác thang đo, đường mức là elip dẹt, GD đi zigzag và chậm; khi chuẩn hóa, đường mức tròn hơn và hội tụ nhanh. [SK-SGD] viết SGD "nhạy với thang đo đặc trưng" và khuyên chuẩn hóa. Số liệu trên 10 căn hộ ở mục "Số tự chạy".
- **Batch, stochastic, mini-batch:**
  - Batch GD: mỗi bước dùng cả $m$ mẫu; gradient chính xác, tốn kém khi dữ liệu lớn. [MLCB-8]
  - SGD (stochastic): mỗi bước một mẫu ngẫu nhiên; một epoch có $m$ bước; đường đi nhiễu nhưng thường qua vài epoch đã gần nghiệm, hợp với dữ liệu lớn và học trực tuyến. [MLCB-8, G-HP]
  - Mini-batch: mỗi bước một nhóm nhỏ (tác giả [MLCB-8] nói thường 50 đến 100 mẫu); cân bằng nhiễu và chi phí, là lựa chọn mặc định của học sâu. [MLCB-8, G-HP]
  - Epoch là một lượt qua toàn bộ tập train; nên xáo trộn dữ liệu mỗi epoch. [MLCB-8, SK-SGD]
- **Tiêu chí dừng:** (1) số vòng lặp tối đa; (2) gradient đủ nhỏ; (3) mất mát giảm ít hơn một ngưỡng; (4) với SGD, so tham số sau mỗi vài bước. [MLCB-8] Ví dụ trong [MLCB-7] dừng khi chuẩn gradient (chia số chiều) nhỏ hơn $10^{-3}$, tối đa 100 vòng. [G-GD] định nghĩa hội tụ là lúc tăng thêm vòng lặp không còn giảm mất mát đáng kể, nhìn thấy trên đường cong mất mát phẳng dần. Mất mát cực tiểu thường lớn hơn 0; mất mát bằng 0 thường là dấu hiệu overfitting. [G-GD] Mẹo (2) và (3) có thể dừng sớm ở vùng phẳng như điểm yên ngựa. [MLCB-8]
- **`SGDRegressor`:** xem mục dưới.
- **Mối nối sang `ml/optimizers`:** [MLCB-8] gồm momentum và Nesterov (NAG) ngay trong bài GD; [R16] tổng quan Adagrad, RMSprop, Adam. Bài này chỉ nhắc tên, không giải thích.

## Công thức quan trọng

Theo ký hiệu site: $m$ số mẫu, $n$ số đặc trưng, $\mathbf{w}$, $b$, $\boldsymbol{\theta}$, $\mathcal{L}$, $\eta$, $\hat{y}$. Với bài của site: $\boldsymbol{\theta}=[\mathbf{w};\,b]$, $\mathbf{X}$ có cột số 1, $\mathcal{L}(\boldsymbol{\theta})=\frac1m\lVert\mathbf{X}\boldsymbol{\theta}-\mathbf{y}\rVert^2$ (khớp bài Hồi quy tuyến tính, đã đọc).

**Quy tắc cập nhật** [MLCB-7, ý của C47]:

$$\boldsymbol{\theta}_{t+1}=\boldsymbol{\theta}_t-\eta\,\nabla\mathcal{L}(\boldsymbol{\theta}_t)$$

**Gradient của MSE** (đạo hàm riêng bài trước đã dẫn, $\frac{2}{m}\sum\ldots$):

$$\frac{\partial\mathcal{L}}{\partial w}=\frac{2}{m}\sum_{i=1}^{m}x^{(i)}\bigl(wx^{(i)}+b-y^{(i)}\bigr),\qquad \frac{\partial\mathcal{L}}{\partial b}=\frac{2}{m}\sum_{i=1}^{m}\bigl(wx^{(i)}+b-y^{(i)}\bigr)$$

$$\nabla\mathcal{L}(\boldsymbol{\theta})=\frac{2}{m}\mathbf{X}^\top(\mathbf{X}\boldsymbol{\theta}-\mathbf{y})$$

**Điều kiện hội tụ cho hàm bậc hai** (suy ra đại số, tự kiểm bằng số; không có nguồn đã đọc). Hessian của MSE là hằng số $\mathbf{H}=\frac{2}{m}\mathbf{X}^\top\mathbf{X}$. Gọi $\boldsymbol{\theta}^\star$ là đáy bát (nghiệm phương trình chuẩn). Vì $\nabla\mathcal{L}(\boldsymbol{\theta})=\mathbf{H}(\boldsymbol{\theta}-\boldsymbol{\theta}^\star)$, bước cập nhật cho

$$\boldsymbol{\theta}_{t+1}-\boldsymbol{\theta}^\star=(\mathbf{I}-\eta\mathbf{H})(\boldsymbol{\theta}_t-\boldsymbol{\theta}^\star)$$

Theo mỗi hướng riêng của $\mathbf{H}$ (trị riêng $\lambda$), sai lệch bị nhân với $1-\eta\lambda$ mỗi bước. Hội tụ khi mọi $|1-\eta\lambda|<1$, tức

$$0<\eta<\frac{2}{L},\qquad L=\lambda_{\max}(\mathbf{H})$$

Ở $\eta=2/L$ chính xác thì sai lệch theo hướng dốc nhất đổi dấu mỗi bước mà không nhỏ đi (dao động đều); lớn hơn thì phân kỳ. Tốc độ bị hướng **phẳng nhất** kìm lại: hệ số co theo hướng đó là $1-\eta\lambda_{\min}$. Bước cố định tốt nhất là $\eta=\frac{2}{\lambda_{\min}+\lambda_{\max}}$, hệ số co mỗi bước $\frac{\kappa-1}{\kappa+1}$ với $\kappa=\lambda_{\max}/\lambda_{\min}$ (số điều kiện, condition number). Công thức bước tối ưu và hệ số co **khớp với tóm tắt trang kết quả tìm kiếm của Cornell CS4787**, chưa đọc văn bản gốc.

**Hệ số 2 phụ thuộc cách định nghĩa $\mathcal{L}$:**

| Định nghĩa | Hessian | Giới hạn $\eta$ |
|---|---|---|
| $\mathcal{L}=\frac1m\lVert\mathbf{X}\boldsymbol{\theta}-\mathbf{y}\rVert^2$ (MSE, bài này) | $\frac{2}{m}\mathbf{X}^\top\mathbf{X}$ | $\eta<2/L$ với $L=\lambda_{\max}(\frac2m\mathbf{X}^\top\mathbf{X})$ |
| $\mathcal{L}=\frac{1}{2m}\lVert\mathbf{X}\boldsymbol{\theta}-\mathbf{y}\rVert^2$ ([MLCB-7], cũng là $E$ của [SK-SGD]) | $\frac{1}{m}\mathbf{X}^\top\mathbf{X}$ | $L$ giảm một nửa nên giới hạn $\eta$ **gấp đôi** |

Cùng một tập dữ liệu, $\eta$ an toàn với định nghĩa này không an toàn với định nghĩa kia. Nên bài chỉ rõ đang dùng MSE $\frac1m$ nên gradient có hệ số $\frac2m$.

**Nghiệm sau khi chuẩn hóa ngược** (nối bài trước; kiểm bằng số): nếu huấn luyện trên $z=(x-\bar{x})/s$ được $w_z,b_z$ thì $w=w_z/s$, $b=b_z-w\bar{x}$.

**Lịch tốc độ học của scikit-learn** [SK-SGD, SK-SGDR], $t$ là bước thứ $t$ (tính theo **mẫu**, tổng $m\cdot$epoch, không phải epoch):

| `learning_rate` | Công thức |
|---|---|
| `'constant'` | $\eta_t=\eta_0$ |
| `'invscaling'` (**mặc định của `SGDRegressor`**) | $\eta_t=\eta_0/t^{\text{power\_t}}$, mặc định `eta0=0.01`, `power_t=0.25` |
| `'optimal'` | $\eta_t=1/(\alpha(t_0+t))$ |
| `'adaptive'` | giữ $\eta_0$; khi tiêu chí dừng chạm thì chia 5, dừng khi $\eta<10^{-6}$ |

(Bản 1.8 có thêm `'pa1'`, `'pa2'`, chỉ dùng với `epsilon_insensitive`.)

**Mục tiêu mà `SGDRegressor` thực sự tối thiểu hóa** [SK-SGD, đã đọc], không phải MSE của bài:

$$E(\mathbf{w},b)=\frac1m\sum_i L\bigl(y^{(i)},f(\mathbf{x}^{(i)})\bigr)+\alpha R(\mathbf{w}),\quad L=\tfrac12\bigl(y-f(\mathbf{x})\bigr)^2$$

Tức mất mát là $\frac12$ bình phương sai số (giống $\frac1{2m}$). **Tự kiểm bằng số**: với `penalty='l2'`, $R(\mathbf{w})=\frac12\lVert\mathbf{w}\rVert^2$ (hệ số $\frac12$ mà trang đã đọc không ghi rõ, nhưng kết quả chạy khớp), và $b$ không bị phạt.

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình.

- **Đi xuống núi trong sương mù:** bạn chỉ cảm nhận được độ dốc dưới chân, nên bước ngắn theo hướng dốc xuống. Bước quá ngắn thì mất cả ngày; quá dài thì nhảy sang sườn đối diện. Đây là trực giác phổ biến, hợp với VIZ.
- **Chi tiết hay của Cauchy [C47]:** ông không chỉ giảm $u$ mà còn nêu một độ dài bước cho trường hợp $u$ gần $0$ (tức gần nghiệm của hệ), tức đã nghĩ tới chuyện "bước nên dài bao nhiêu" từ 1847. Hợp cho hộp lịch sử ngắn. (Công thức (6) của ông là cho bài toán $u=0$, không phải bước mặc định của GD ngày nay.)
- **Bài toán 10 căn hộ làm bài mẫu:** mất mát là cái bát theo $(w,b)$. Khi $x$ là diện tích thô (25 đến 85), $w$ và $b$ ở hai thang rất khác nhau: bát rất dài và hẹp, bước đủ nhỏ cho hướng dốc thì quá nhỏ cho hướng phẳng. Sau khi chuẩn hóa bát gần tròn. Trong VIZ, hai nút "dữ liệu thô / chuẩn hóa" cùng thanh trượt $\eta$ cho thấy rõ cả ba chế độ: chậm, đẹp, phân kỳ. (Gợi ý của `summarizer`.)
- **Bát tròn thì một bước tới đáy** (xem số dưới): với dữ liệu chuẩn hóa và cột số 1, Hessian là $2\mathbf{I}$, nên $\eta=0{,}5$ rơi đúng đáy sau một bước. Dùng làm điểm "à ha": đường mức tròn nghĩa là hướng gradient chỉ thẳng tới đáy. Nó chỉ đúng riêng trường hợp này (một đặc trưng đã chuẩn hóa), đừng nói như quy luật chung.
- **Đường cong mất mát theo vòng lặp** [G-GD]: trục ngang số vòng lặp, trục dọc mất mát; phẳng dần là hội tụ, dao động quanh nhỏ là bình thường. Dùng làm hình tĩnh bên cạnh VIZ.

### Số tự chạy (scikit-learn 1.9.1, numpy 2.5.3, không phải bản Pyodide; chỉ để định hướng)

Bộ `apartments.ts` ($m=10$), $\mathcal{L}=$ MSE $\frac1m$, GD từ $\boldsymbol{\theta}=\mathbf{0}$. Nghiệm phương trình chuẩn: $w=0{,}16948$, $b=2{,}03943$, MSE nhỏ nhất $0{,}36148$ (khớp bài trước). MSE tại $\boldsymbol{\theta}=\mathbf{0}$ là $129{,}748$.

**Hessian $\frac2m\mathbf{X}^\top\mathbf{X}$ theo ba cách xử lý đặc trưng:**

| Đặc trưng | Trị riêng nhỏ, lớn | $\kappa$ | $2/L$ | Số bước tới "MSE cách đáy $<10^{-3}$" |
|---|---|---|---|---|
| Thô ($x$ từ 25 đến 85, cột 1) | $0{,}228$; $6\,199$ | $\approx 27\,200$ | $3{,}23\times10^{-4}$ | $\approx 42\,300$ với $\eta=0{,}99\cdot2/L$; $135\,156$ với $\eta=10^{-4}$ |
| Chỉ căn giữa $x-\bar{x}$ | $2$; $706$ | $353$ | $2{,}83\times10^{-3}$ | $1\,040$ với $\eta=0{,}99\cdot2/L$ |
| Chuẩn hóa $z=(x-\bar{x})/s$ | $2$; $2$ | $1$ | $1{,}0$ | **1 bước** với $\eta=0{,}5$; $\eta=0{,}1$ cần 42 bước tới cách đáy $<10^{-6}$ |

(Số bước của hàng "thô" với $\eta=0{,}99\cdot2/L$ là $42\,317$ cho ngưỡng $10^{-3}$; để hội tụ gradient về $<10^{-9}$ cần $\approx 274\,000$ bước. Hai ngưỡng khác nhau, đừng lẫn.)

**Kiểm điều kiện $\eta<2/L$:** trên dữ liệu thô, $\eta=0{,}99\cdot2/L=3{,}19\times10^{-4}$ hội tụ, $\eta=1{,}01\cdot2/L$ phân kỳ (tham số lên cỡ $10^{12}$). $\eta=10^{-3}$ và $5\times10^{-4}$ cũng phân kỳ. Trên dữ liệu chuẩn hóa, $\eta=1{,}0$ dao động giữa $\boldsymbol{\theta}=\mathbf{0}$ và nghiệm gấp đôi, không hội tụ; $\eta=1{,}01$ phân kỳ. Đã khớp lý thuyết.

**Chuẩn hóa ngược:** nghiệm trên $z$ là $w_z=3{,}18436$, $b_z=10{,}92=\bar{y}$; đổi về $x$ được $w=0{,}16948$, $b=2{,}03943$. ($\bar{x}=52{,}4$, $s=18{,}789$.)

**Ví dụ MSE theo bước, dữ liệu chuẩn hóa, $\eta=0{,}1$:** $129{,}75\to83{,}17\to53{,}36\to34{,}28\to22{,}07\to14{,}25$ (mỗi bước nhân phần dư $0{,}8$ theo từng hướng, nên mất mát vượt đáy nhân $0{,}64$; $\eta=1{,}05$: $129{,}75\to156{,}92\to189{,}80\to229{,}58\ldots$ tăng dần).

**`SGDRegressor` trên 10 căn hộ** (`random_state=0`):

| Cấu hình | Hệ số $w_z$ (đích $3{,}1844$) | Ghi chú |
|---|---|---|
| Mặc định, trên $z$ | $3{,}119$ (5 seed: $3{,}118$ đến $3{,}119$); `intercept_` $10{,}696$ (đích $10{,}92$); MSE $0{,}416$ (đích $0{,}3615$) | `n_iter_=193`, dừng vì tiêu chí `tol`, không phải vì chạm đáy. Nghiệm gần chứ không đúng |
| `penalty=None`, trên $z$ | $3{,}1193$ | Gần như trùng mặc định: $\alpha=10^{-4}$ phạt quá nhẹ để thấy |
| `penalty=None`, `learning_rate='constant'`, `eta0=0.05`, `tol=1e-6`, `max_iter=10000` | $3{,}1830$; `intercept_` $10{,}907$ | `n_iter_=23`: đúng gần hơn nhiều |
| Mặc định, **trên $x$ thô** | $w\approx3\times10^{10}$, `intercept_` $\approx8\times10^{9}$ | **Phân kỳ trong im lặng**: `n_iter_=6`, **không có cảnh báo** |

Với `learning_rate='invscaling'` mặc định, sau $t=1931$ bước (ca mặc định ở trên), $\eta_t=0{,}01/1931^{0{,}25}\approx0{,}0015$: tốc độ học đã tự nhỏ đi rất nhiều nên dừng sớm gần đáy chứ không tới đáy.

Thử $\alpha$ thật lớn để thấy phạt `l2`: `alpha=0.1` cho $w_z\approx2{,}895$ và `alpha=1` cho $w_z\approx1{,}593$; khớp công thức $w_z^{\text{OLS}}/(1+\alpha)$ ($3{,}1844/1{,}1=2{,}8949$) vì chuẩn hóa $z$ có phương sai 1. `intercept_` $\approx10{,}92$ (không bị phạt).

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Không chuẩn hóa đặc trưng.** Hội tụ chậm (khoảng $10^4$ đến $10^5$ bước trên bảng căn hộ) hoặc phân kỳ. `SGDRegressor` trên $x$ thô phân kỳ trong im lặng (đã chạy: $w\approx3\times10^{10}$, không `ConvergenceWarning`). [SK-SGD] khuyên chuẩn hóa; [SK-SGDR] ví dụ dùng `make_pipeline(StandardScaler(), SGDRegressor(...))`.
2. **`SGDRegressor` mặc định có phạt L2.** Chữ ký [SK-SGDR]: `penalty='l2'`, `alpha=0.0001`, `loss='squared_error'`. Khác `LinearRegression` (không phạt). Ở $\alpha=10^{-4}$ phạt rất nhẹ (khác nhau $\approx3\times10^{-4}$ trên hệ số), nhưng $\alpha$ lớn hơn sẽ co hệ số đáng kể. Muốn so sánh đúng với bài trước phải đặt `penalty=None`.
3. **`SGDRegressor` mặc định không tới đúng đáy.** Mặc định `learning_rate='invscaling'` (η giảm theo $t^{-0{,}25}$), `tol=1e-3`, `n_iter_no_change=5`; dừng khi mất mát không cải thiện hơn `tol` trong 5 epoch liên tiếp. Kết quả sai lệch cỡ 2% hệ số trên bảng này (MSE $0{,}416$ so với $0{,}3615$). Dùng `eta0` lớn hơn, `learning_rate='constant'` hoặc giảm `tol` nếu muốn chính xác.
4. **Mục tiêu của `SGDRegressor` không phải MSE của bài.** Mất mát là $\frac12(y-\hat{y})^2$ và phạt là $\frac\alpha2\lVert\mathbf{w}\rVert^2$. So `eta0` và $\alpha$ với tự viết phải cẩn thận hệ số 2.
5. **Nhầm hệ số 2 trong giới hạn $\eta$.** $\eta<2/L$ với $L$ là trị riêng lớn nhất của **Hessian**, mà Hessian là $\frac2m\mathbf{X}^\top\mathbf{X}$ (MSE) hoặc $\frac1m\mathbf{X}^\top\mathbf{X}$ (nếu có $\frac12$). Xem bảng ở trên.
6. **Cho rằng mất mát luôn giảm mỗi bước.** Đúng cho GD đủ nhỏ trên hàm lồi mượt. Với $\eta\in(1/L,2/L)$ mất mát vẫn giảm dần trên hàm bậc hai nhưng tham số dao động quanh đáy theo hướng dốc; SGD thì mất mát tăng giảm lên xuống do nhiễu dù đang đi đúng. (Mệnh đề thứ nhất là suy ra đại số: hệ số $1-\eta\lambda$ âm khi $\eta\lambda>1$.)
7. **Nhầm epoch, bước, batch.** Một epoch là một lượt cả tập; số bước mỗi epoch là $m/\text{batch}$. [G-HP] ví dụ 1000 mẫu, batch 100 thì 10 bước mỗi epoch. Với `SGDRegressor`, $t$ trong lịch tốc độ đếm theo mẫu.
8. **Dừng khi mất mát đổi ít là đã tới đáy.** Có thể đang ở vùng phẳng (điểm yên ngựa trong bài toán không lồi); với `tol` của scikit-learn ở trên cũng dừng sớm. [MLCB-8]
9. **Tưởng GD tìm cực tiểu toàn cục.** Đúng cho MSE tuyến tính (lồi) [G-GD]; không đúng nói chung. [MLCB-7] có ví dụ hàm hai cực tiểu, kết quả phụ thuộc điểm xuất phát.
10. **Tưởng $\eta$ lớn hơn luôn nhanh hơn.** Chỉ đúng đến một mức; qua $1/L$ trở đi hệ số co theo hướng dốc bắt đầu đổi dấu, qua $2/L$ thì phân kỳ. [G-HP] nhắc nhân đôi tốc độ học có thể chậm hơn.
11. **Gradient sai.** [MLCB-7] khuyên kiểm bằng đạo hàm số (sai phân trung tâm, sai số $O(\varepsilon^2)$; một phía là $O(\varepsilon)$). Hợp làm một dòng ngắn: so `grad` tay với `grad` của `np.linalg.lstsq` hoặc sai phân.
12. **Hiểu "gradient descent" là tên một mô hình.** Nó là cách tìm tham số, không phải mô hình; mô hình vẫn là hồi quy tuyến tính. Kết quả cuối giống nghiệm phương trình chuẩn (khi hội tụ); GD đáng giá khi $n$ lớn, hoặc không có nghiệm dạng đóng (mạng nơ-ron).

## Ký hiệu từng nguồn so với site

| Nguồn | Số mẫu | Số đặc trưng | Mất mát | Trọng số | Tốc độ học | Khác site |
|---|---|---|---|---|---|---|
| Site | $m$ | $n$ | $\mathcal{L}$ (MSE, $\frac1m$) | $\mathbf{w}$, $b$, $\boldsymbol{\theta}$ | $\eta$ | |
| [MLCB-7] | $N$ | `d` (chiều) | $\mathcal{L}(\mathbf{w})=\frac{1}{2N}\lVert\mathbf{y}-\bar{\mathbf{X}}\mathbf{w}\rVert^2$, tổng quát $f$ | $\mathbf{w}$, tổng quát $\boldsymbol{\theta}$ | $\eta$ | $N$ thay $m$; có $\frac1{2N}$; $\bar{\mathbf{X}}$ là $\mathbf{X}$ thêm cột 1 |
| [MLCB-8] | $N$; cỡ mini-batch $n$ | | $J(\boldsymbol{\theta})$ | $\boldsymbol{\theta}$ ($\mathbf{w}$ trong ví dụ) | $\eta$; momentum $\gamma$, $\mathbf{v}_t$ | **$n$ là cỡ batch, ngược nghĩa với site** ($n$ = số đặc trưng); $J$ thay $\mathcal{L}$ |
| [G-GD, G-HP] | $M$ ($N$ ở trang hyperparameters) | | MSE, không đặt tên | $w$, $b$ | "learning rate" không ký hiệu ở trang đã đọc | $f_{w,b}(x)=w\cdot x+b$; $M$ in hoa |
| [SK-SGD, SK-SGDR] | $n$ (số mẫu, ở ghi chú `max_iter`) | | $E(w,b)$, $L$ cho từng mẫu | $w$, $b$ | $\eta^{(t)}$, `eta0` | $n$ là số mẫu (ngược site); $\alpha$ là hệ số phạt; mất mát có $\frac12$ |
| [C47] | không có (hàm $u$ của nhiều biến) | | $u$ | $x,y,z,\ldots$ | $\theta$ (bước, "đại lượng dương") | Dùng $\theta$ cho **độ dài bước**, không phải tham số; dễ nhầm với $\boldsymbol{\theta}$ của site |
| [R16] | (chưa kiểm) | | (chưa kiểm) | (chưa kiểm) | (chưa kiểm) | Chỉ đọc tóm tắt |

Gợi ý một dòng ghi chú cho bài: "Nhiều sách viết $\theta$ cho tham số và $J$ cho hàm mất mát; có sách dùng $\frac{1}{2m}$ để số 2 mất đi khi lấy đạo hàm. Nên khi so công thức, hãy xem họ chia cho $m$ hay $2m$, và $n$ có phải số đặc trưng không."

## Liên quan tới bài nào

Slug theo `src/data/roadmap.ts` (chưa mở lại phiên này; theo mô tả của agent gọi và bài `regularization.md` đã dẫn).

- **Bài trước:** `ml/linear-regression` (MSE, đạo hàm riêng theo $w$, $b$; nghiệm phương trình chuẩn $\mathbf{X}^\top\mathbf{X}\boldsymbol{\theta}=\mathbf{X}^\top\mathbf{y}$; dùng bảng 10 căn hộ). Bài này tái dùng đúng gradient đó, dưới dạng ma trận $\frac{2}{m}\mathbf{X}^\top(\mathbf{X}\boldsymbol{\theta}-\mathbf{y})$.
- **`ml/regularization`:** phạt L2 thêm $2\lambda\mathbf{w}$ vào gradient (weight decay; kiến thức chung, nối trực tiếp với mặc định `penalty='l2'` của `SGDRegressor` ở trên). Lưu ý bài đó dùng $\lambda$ và `Ridge(alpha=...)` có thang khác `SGDRegressor(alpha=...)` (xem `docs/research/regularization.md`).
- **Bài sau:** `ml/optimizers` (momentum, Nesterov, Adagrad, RMSprop, Adam; tham khảo [MLCB-8], [R16]). Bài này chỉ nhắc tên, hẹn bài đó.
- **`ml/data-preprocessing` (nếu có):** chuẩn hóa đặc trưng; bài này chỉ nhắc ngắn lý do chuẩn hóa cho hội tụ.
- **Phần DL (`dl/...`):** SGD, mini-batch, epoch, lan truyền ngược. Bài này nên giới thiệu từ vựng (epoch, batch) để bài DL dùng lại.

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Hạ gradient / thuật toán gradient descent | Gradient descent | Giữ "gradient descent" (viết tắt GD); "hạ gradient" chỉ gloss lần đầu |
| Tốc độ học | Learning rate | Dịch, ký hiệu $\eta$ |
| Gradient | Gradient | Giữ nguyên |
| Hội tụ / phân kỳ | Convergence / divergence | Dịch |
| Epoch | Epoch | Giữ nguyên, gloss "một lượt qua toàn bộ tập train" |
| Batch / mini-batch | Batch / mini-batch | Giữ nguyên |
| Gradient descent ngẫu nhiên | Stochastic gradient descent (SGD) | Giữ "SGD" |
| Số điều kiện | Condition number | Dịch, ký hiệu $\kappa$ |
| Đường mức | Contour line / level set | Dịch |
| Hessian | Hessian | Giữ nguyên |
| Tiêu chí dừng | Stopping criterion | Dịch |
| Siêu tham số | Hyperparameter | Đã có (kiểm glossary) |
| Phân kỳ im lặng | (không phải thuật ngữ) | Cách nói trong bài, ý là mô hình vượt tầm mà không báo lỗi |

## Đọc thêm đề xuất

1. **Tiep Vu, *Machine Learning cơ bản*, Bài 7 và Bài 8** (Gradient Descent, hai phần). [Bài 7](https://machinelearningcoban.com/2017/01/12/gradientdescent/), [Bài 8](https://machinelearningcoban.com/2017/01/16/gradientdescent2/). Đã đọc.
2. **Google, *Machine Learning Crash Course*, Linear regression: Gradient descent và Hyperparameters.** [Gradient descent](https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent), [Hyperparameters](https://developers.google.com/machine-learning/crash-course/linear-regression/hyperparameters). Đã đọc.
3. **scikit-learn 1.8, *Stochastic Gradient Descent*.** [Link](https://scikit-learn.org/1.8/modules/sgd.html). Đã đọc.
4. **Ruder (2016), *An overview of gradient descent optimization algorithms*.** [arXiv:1609.04747](https://arxiv.org/abs/1609.04747). Chỉ đọc tóm tắt; cho `ml/optimizers`.
5. **Lemaréchal (2012), *Cauchy and the Gradient Method*.** [DOI](https://doi.org/10.4171/dms/6/27). Chỉ xác minh thư mục.
6. Bài gốc [C47] (bản dịch Pulskamp, PDF) và [RM51] cho người muốn tìm hiểu sâu.
