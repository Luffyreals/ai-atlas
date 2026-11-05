# Các thuật toán tối ưu nâng cao: SGD, Momentum, RMSProp, Adam

Bài: `ml/optimizers` (tiền đề: `ml/gradient-descent`). Code chỉ dùng `numpy`, `matplotlib`, `scikit-learn` (`MLPClassifier`, `load_digits`).

Ngày kiểm tra nguồn: **05/11/2026**, bằng WebFetch. Ghi chú do `lesson-writer` viết khi soạn bài.

## Nguồn

**Bài gốc:**

- Polyak, B. T. (1964). [*Some methods of speeding up the convergence of iteration methods*](https://doi.org/10.1016/0041-5553(64)90137-5). *USSR Computational Mathematics and Mathematical Physics* 4(5), 1–17. Xác minh qua Crossref. **Chưa đọc nội dung.** Chỉ dùng cho câu "Momentum do Polyak đề xuất năm 1964, phương pháp viên bi nặng" (hiểu biết chung).
- Sutskever, I., Martens, J., Dahl, G., Hinton, G. (2013). [*On the importance of initialization and momentum in deep learning*](https://proceedings.mlr.press/v28/sutskever13.html). ICML 2013, PMLR 28(3), 1139–1147. Đã đọc trang tóm tắt; tóm tắt không nhắc chữ Nesterov. Bài viết "Sutskever viết Nesterov dưới dạng này và dùng nó cho mạng sâu" (hiểu biết chung về mục 2.1 của bài báo, chưa đọc toàn văn).
- Duchi, J., Hazan, E., Singer, Y. (2011). [*Adaptive Subgradient Methods for Online Learning and Stochastic Optimization*](https://jmlr.org/papers/v12/duchi11a.html). *JMLR* 12, 2121–2159. Đã kiểm trang JMLR.
- Hinton, G., Srivastava, N., Swersky, K. (2012). [*Neural Networks for Machine Learning*, Lecture 6](https://www.cs.toronto.edu/~tijmen/csc321/slides/lecture_slides_lec6.pdf) (PDF). Đã trích chữ từ PDF: bài 6e có tiêu đề "rmsprop: Divide the gradient by a running average of its recent magnitude"; trang 29 ghi "Keep a moving average of the squared gradient for each weight". Công thức nằm trong ảnh, không trích được, nên bài **không** ghi giá trị $\rho$ do Hinton dùng.
- Kingma, D. P., Ba, J. (2015). [*Adam: A Method for Stochastic Optimization*](https://arxiv.org/abs/1412.6980). ICLR 2015, arXiv:1412.6980. Đã đọc trang tóm tắt. Mục 3 là "Initialization bias correction" (hiểu biết chung).
- Loshchilov, I., Hutter, F. (2019). [*Decoupled Weight Decay Regularization*](https://arxiv.org/abs/1711.05101). ICLR 2019. Đã đọc tóm tắt: L2 và weight decay trùng nhau với SGD, khác nhau với Adam; AdamW tách weight decay khỏi bước của Adam.
- Wilson, A. C., Roelofs, R., Stern, M., Srebro, N., Recht, B. (2017). [*The Marginal Value of Adaptive Gradient Methods in Machine Learning*](https://arxiv.org/abs/1705.08292). arXiv:1705.08292. Đã đọc tóm tắt: các phương pháp thích nghi thường tìm nghiệm tổng quát hóa kém hơn SGD.

**Tài liệu thư viện (đã mở):**

- PyTorch 2.15, [`torch.optim.Adam`](https://docs.pytorch.org/docs/2.15/generated/torch.optim.Adam.html): `lr=1e-3`, `betas=(0.9, 0.999)`, `eps=1e-8`, $\varepsilon$ cộng sau căn.
- PyTorch 2.15, [`torch.optim.RMSprop`](https://docs.pytorch.org/docs/2.15/generated/torch.optim.RMSprop.html): `lr=0.01`, `alpha=0.99`, `eps=1e-8`, $\varepsilon$ cộng sau căn.
- scikit-learn 1.8, [`MLPClassifier`](https://scikit-learn.org/1.8/modules/generated/sklearn.neural_network.MLPClassifier.html): `solver='adam'`, `learning_rate_init=0.001`, `momentum=0.9`, `nesterovs_momentum=True`, `beta_1=0.9`, `beta_2=0.999`, `epsilon=1e-8`, `batch_size=min(200, n)`; `loss_curve_` có một phần tử mỗi lần lặp (epoch).

**Đọc thêm:**

- Vũ Hữu Tiệp (2017). [*Machine Learning cơ bản*, Bài 8](https://machinelearningcoban.com/2017/01/16/gradientdescent2/). Có Momentum (mục 1.1) và NAG (mục 1.2), có hình động. Ký hiệu: $\gamma$ là hệ số momentum, $v_t = \gamma v_{t-1} + \eta\nabla J$.
- Zhang, A., Lipton, Z. C., Li, M., Smola, A. J. (2023). [*Dive into Deep Learning*, chương 12](https://d2l.ai/chapter_optimization/). Mục 12.10 (Adam) dùng $\mathbf{v}_t$, $\mathbf{s}_t$, hiệu chỉnh bằng $1 - \beta^t$; ví dụ trong sách dùng $\epsilon = 10^{-6}$.
- Goh, G. (2017). [*Why Momentum Really Works*](https://distill.pub/2017/momentum/). *Distill*. Dùng $z^{k+1} = \beta z^k + \nabla f(w^k)$, $w^{k+1} = w^k - \alpha z^{k+1}$, cùng dạng với bài. Có nói momentum tự tạo dao động.
- Ruder, S. (2016). [*An overview of gradient descent optimization algorithms*](https://arxiv.org/abs/1609.04747).

## Ý chính

- GD thuần: thành dốc ép $\eta < 2/L$, hướng phẳng nhân với $1 - \eta\mu$ gần 1 nên chậm; mini-batch thêm nhiễu; một $\eta$ cho mọi tham số.
- Momentum: vận tốc là tổng gradient cũ có trọng số $\beta^k$. Hướng nhất quán: bước gấp $1/(1-\beta)$; hướng đổi dấu: $1/(1+\beta)$. Vượt quá đáy.
- Dạng EMA $(1-\beta)$ khác dạng tổng bởi hệ số $1/(1-\beta)$ của $\eta$.
- AdaGrad cộng dồn $\mathbf{g}^2$, tốc độ học co về 0. RMSProp dùng EMA. Bước dài cỡ $\eta$, bất biến khi nhân loss với hằng số.
- Adam: EMA của $\mathbf{g}$ và $\mathbf{g}^2$, chia cho $1 - \beta^t$.

## Công thức quan trọng

$$
\hat{\mathbf{v}}_t = \frac{\mathbf{v}_t}{1 - \beta_1^t}, \quad \hat{\mathbf{s}}_t = \frac{\mathbf{s}_t}{1 - \beta_2^t}, \quad \boldsymbol{\theta}_t = \boldsymbol{\theta}_{t-1} - \eta\frac{\hat{\mathbf{v}}_t}{\sqrt{\hat{\mathbf{s}}_t} + \varepsilon}
$$

Không hiệu chỉnh, với gradient không đổi, bước gấp $(1 - \beta_1^t)/\sqrt{1 - \beta_2^t}$ lần $\eta$: 3.16 ở $t = 1$, cực đại khoảng 6.57 ở $t = 12$, 3.24 ở $t = 100$, khoảng 2 ở $t = 290$ (tự tính).

## Số tự chạy (Python 3.14, NumPy 2.5.3, scikit-learn 1.9.1)

Hàm $\mathcal{L} = \frac{1}{2}(w_1^2 + 100 w_2^2)$, xuất phát $(-8, 1.5)$, dừng khi $\lVert\mathbf{w}\rVert < 0.01$:

| Bộ tối ưu | $\eta$ | Số bước | `scale = 10` |
|---|---:|---:|---|
| GD | 0.018 | 369 | phân kỳ |
| Momentum ($\beta = 0.9$) | 0.018 | 111 | phân kỳ |
| RMSProp ($\rho = 0.99$) | 0.1 | 103 | 103 |
| Adam (mặc định) | 0.1 | 193 | 193 |

Momentum với $\kappa = 25$ (thử khi chọn hàm) không nhanh hơn GD (100 so với 93 bước): $\beta = 0.9$ chỉ có lợi rõ khi $\kappa$ lớn. Vì vậy bài chọn $\kappa = 100$.

RMSProp $\rho = 0.99$, $\eta = 0.1$ nếu chạy tiếp sau khi tới đáy thì trôi ra lại (khoảng cách 0.0017 ở bước 500, 0.045 ở bước 1000). Bài không nói chi tiết này; vòng lặp dừng ngay khi vào bán kính 0.01.

`MLPClassifier(hidden_layer_sizes=(32,), batch_size=64, learning_rate_init=0.01, max_iter=20, random_state=0)` trên `load_digits` (chia 75/25, `random_state=0`): SGD loss 1.4786 / acc 0.680; Momentum 0.1815 / 0.947; Adam 0.0321 / 0.971. SGD với $\eta = 0.1$: 0.1783 / 0.953. Adam với $\eta = 0.1$: 0.0277 / 0.936.

## Điểm dễ hiểu nhầm

- "Momentum làm hết zigzag": với $\beta = 0.9$, dao động theo chiều hẹp tắt chậm hơn GD (Goh: tốc độ phụ thuộc $\sqrt{\beta}$ khi nghiệm phức). Lợi thế là đi nhanh dọc thung lũng.
- "Adam luôn nhanh nhất": không đúng trên ví dụ của bài.
- Hiệu chỉnh độ lệch làm bước **ngắn lại** ở đầu (không hiệu chỉnh thì bước quá dài, vì mẫu số lệch về 0 nhiều hơn tử số).
