# Huấn luyện mạng nơ-ron: vanishing/exploding gradient, BatchNorm, Dropout

Bài: `dl/training-neural-networks` (chỉ bản vi). Bài cần biết trước trong roadmap: `dl/neural-networks` (cùng đợt, link được), `ml/optimizers` (chưa xuất bản, có "Nhắc nhanh"), `ml/regularization` (có sẵn). VIZ: `GradientFlowViz` (dl-lessons.md mục 4, chưa xây, chỉ có comment giữ chỗ). Hai ô `PythonRunner` (NumPy) và một ô `LocalCode` (PyTorch).

Ngày tra: **05/11/2026**. Cách tra: mở link bằng `curl` (mã 200) và WebFetch trang tóm tắt hoặc trang tài liệu; đọc tài liệu chính thức PyTorch 2.15 cho `BatchNorm1d`, `Dropout`, `Linear`. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra.

## Nguồn

- **[RHW86]** Rumelhart, D. E., Hinton, G. E., Williams, R. J. (1986). [*Learning representations by back-propagating errors*](https://doi.org/10.1038/323533a0). *Nature* 323, 533–536. Bài phổ biến lan truyền ngược cho mạng nhiều lớp. Chỉ kiểm tra link và thông tin xuất bản.
- **[GB10]** Glorot, X., Bengio, Y. (2010). [*Understanding the difficulty of training deep feedforward neural networks*](https://proceedings.mlr.press/v9/glorot10a.html). AISTATS 2010, PMLR 9. Phân tích phương sai qua các lớp, đề xuất khởi tạo chuẩn hóa ("Xavier") $\mathrm{Var}(W) = 2/(n_{\text{in}} + n_{\text{out}})$; chỉ ra sigmoid làm lớp trên bão hòa.
- **[He15]** He, K., Zhang, X., Ren, S., Sun, J. (2015). [*Delving Deep into Rectifiers: Surpassing Human-Level Performance on ImageNet Classification*](https://arxiv.org/abs/1502.01852). arXiv:1502.01852. Khởi tạo cho ReLU/PReLU: $\mathrm{Var}(W) = 2/n_{\text{in}}$, vì ReLU bỏ một nửa phương sai.
- **[IS15]** Ioffe, S., Szegedy, C. (2015). [*Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift*](https://arxiv.org/abs/1502.03167). arXiv:1502.03167. Công thức BN, $\gamma$, $\beta$, dùng thống kê toàn bộ khi suy luận, đặt BN trước phi tuyến, bỏ hệ số tự do.
- **[S18]** Santurkar, S., Tsipras, D., Ilyas, A., Madry, A. (2018). [*How Does Batch Normalization Help Optimization?*](https://arxiv.org/abs/1805.11604). arXiv:1805.11604. Lập luận rằng tác dụng chính của BN là làm mặt mất mát trơn hơn, không phải giảm internal covariate shift. Chỉ đọc trang tóm tắt; bài dùng cho một câu.
- **[S14]** Srivastava, N., Hinton, G., Krizhevsky, A., Sutskever, I., Salakhutdinov, R. (2014). [*Dropout: A Simple Way to Prevent Neural Networks from Overfitting*](https://jmlr.org/papers/v15/srivastava14a.html). *JMLR* 15, 1929–1958. Dropout, co-adaptation, trung bình nhiều mạng con; bài gốc nhân trọng số với xác suất giữ lúc kiểm tra. Bản sớm hơn: Hinton và cộng sự (2012), [arXiv:1207.0580](https://arxiv.org/abs/1207.0580).
- **[PMB13]** Pascanu, R., Mikolov, T., Bengio, Y. (2013). [*On the difficulty of training recurrent neural networks*](https://arxiv.org/abs/1211.5063). arXiv:1211.5063 (ICML 2013). Phân tích vanishing/exploding, đề xuất cắt chuẩn gradient.
- **[LH19]** Loshchilov, I., Hutter, F. (2019). [*Decoupled Weight Decay Regularization*](https://arxiv.org/abs/1711.05101). arXiv:1711.05101 (ICLR 2019). Với Adam, phạt L2 khác weight decay; AdamW tách hai thứ ra.
- **[GBC16]** Goodfellow, I., Bengio, Y., Courville, A. (2016). [*Deep Learning*](https://www.deeplearningbook.org/). MIT Press. Mục 6.5 (back-propagation), chương 7 (regularization: 7.8 early stopping, 7.12 dropout), 8.4 (khởi tạo), 8.7.1 (batch normalization).
- **[D2L]** Zhang, A., Lipton, Z. C., Li, M., Smola, A. J. *Dive into Deep Learning*. Bản tiếng Việt [*Đắm mình vào Học Sâu*](https://d2l.aivivn.com/) (dịch từ bản 0.14.4): 4.6 Dropout, 4.7 Lan truyền xuôi, lan truyền ngược và đồ thị tính toán, 4.8 Ổn định số học và khởi tạo, 7.5 Chuẩn hoá theo batch. Đã mở từng trang để kiểm tra tiêu đề và số mục.
- **[VHT17]** Vũ Hữu Tiệp (2017). [*Machine Learning cơ bản*, Bài 14: Multi-layer Perceptron và Backpropagation](https://machinelearningcoban.com/2017/02/24/mlp/), 24/02/2017. Tiếng Việt, có lan truyền ngược dạng ma trận.
- **[CS231n]** Stanford CS231n, ghi chú [*Neural Networks Part 3*](https://cs231n.github.io/neural-networks-3/), mục Gradient checks. Trang không ghi tác giả và năm. Ngưỡng sai số tương đối: "> 1e-2 usually means the gradient is probably wrong", "1e-7 and less you should be happy"; khuyên dùng sai phân trung tâm, số thực 64 bit, cẩn thận chỗ gãy (kinks), tắt dropout khi kiểm tra.
- **[PT]** Tài liệu PyTorch 2.15: [`BatchNorm1d`](https://docs.pytorch.org/docs/2.15/generated/torch.nn.BatchNorm1d.html) (momentum mặc định 0.1, công thức $\hat{x}_{\text{new}} = (1 - \text{momentum})\hat{x} + \text{momentum}\cdot x_t$, eps $10^{-5}$, phương sai lệch khi chuẩn hóa và không lệch khi lưu trung bình động); [`Dropout`](https://docs.pytorch.org/docs/2.15/generated/torch.nn.Dropout.html) (khi huấn luyện nhân $1/(1-p)$, khi đánh giá là hàm đồng nhất); [`Linear`](https://docs.pytorch.org/docs/2.15/generated/torch.nn.Linear.html) (trọng số và hệ số tự do khởi tạo đều trong $(-\sqrt{k}, \sqrt{k})$, $k = 1/\text{in\_features}$).

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Năm của ghi chú CS231n | Trang không ghi. | Không ghi năm, nói rõ trong bài. |
| Năm của [D2L] bản 0.14.4 | Không thấy năm trên trang tiếng Việt. | Bài không ghi năm cho bản dịch. |
| Lý do BN giúp tối ưu | Còn tranh luận: [IS15] nói internal covariate shift, [S18] nói làm trơn mặt mất mát. | Bài nêu cả hai, dùng chữ "có lẽ". |

## Ý chính

- **Lan truyền ngược:** quy tắc hàm hợp tính từ lớp ra về lớp vào, lưu $\boldsymbol{\delta}^{[l]} = \partial\mathcal{L}/\partial\mathbf{z}^{[l]}$ để dùng lại. $\boldsymbol{\delta}^{[l]} = (\mathbf{W}^{[l+1]\top}\boldsymbol{\delta}^{[l+1]}) \odot g'(\mathbf{z}^{[l]})$, $\partial\mathcal{L}/\partial\mathbf{W}^{[l]} = \boldsymbol{\delta}^{[l]}\mathbf{a}^{[l-1]\top}$ [GBC16][D2L][VHT17]. Sigmoid + cross-entropy nhị phân cho $\delta^{[2]} = a^{[2]} - y$.
- **Kiểm tra gradient:** sai phân trung tâm sai số $O(h^2)$, sai số tương đối, ngưỡng $10^{-7}$ / $10^{-2}$ [CS231n].
- **Tiêu biến / bùng nổ:** $\delta$ ở lớp đầu là tích nhiều thừa số $\mathbf{W}^\top$ và $g'$; $\sigma' \le 1/4$ [GB10][PMB13].
- **Khởi tạo:** phá vỡ đối xứng; giữ phương sai: Xavier [GB10], He [He15].
- **BatchNorm:** chuẩn hóa theo batch, $\gamma$, $\beta$, trung bình động khi suy luận [IS15][PT]; lý do hiệu quả còn tranh luận [S18].
- **Dropout:** tắt ngẫu nhiên với xác suất $p$, inverted dropout chia $1-p$ khi huấn luyện [S14][PT].
- **Weight decay, dừng sớm, cắt chuẩn gradient:** [LH19][GBC16][PMB13].

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc ở scratchpad, gọi Python bằng `-I`. Cả ba file qua `ast.parse(..., feature_version=(3, 10))`; mỗi cặp `.vi.py`/`.en.py` là bản sao y nguyên (chưa dịch).

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `backprop-check.vi.py`, `backprop-check.en.py` | chạy thật | 2026-11-05 | venv khớp Pyodide `C:/Users/Dell/.venvs/ai-atlas-py314` (Python 3.14.5, NumPy 2.4.6) | 42 dòng, dòng dài nhất 77 ký tự. Sai số tương đối: `W1` 1.7e-10, `b1` 7.4e-11, `W2` 1.7e-11, `b2` 3.1e-12. Thử xóa `* a1 * (1 - a1)` (bản sao trong scratchpad): `W1` 7.6e-01, `b1` 7.2e-01, `W2`, `b2` không đổi. Khớp lời văn và câu quiz 4 |
| `grad-depth.vi.py`, `grad-depth.en.py` | chạy thật | 2026-11-05 | như trên | 38 dòng, dòng dài nhất 75 ký tự. $\lVert\boldsymbol{\delta}^{[l]}\rVert$ lớp 1 / lớp 10: sigmoid+Xavier 2.9e-06 / 1.4e+00; ReLU+std 1 8.0e+06 / 1.4e+00; ReLU+He 1.4e+00 / 1.4e+00 (các lớp giữa 1.3–1.5). Khớp lời văn |
| `bn-dropout.vi.py`, `bn-dropout.en.py` | TODO | 2026-11-05 | `.venv-dl` (Python 3.14, torch 2.15.0+cpu, scikit-learn 1.9.1) | TODO |
