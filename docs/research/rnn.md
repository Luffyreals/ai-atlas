# Mạng nơ-ron hồi tiếp (RNN)

Bài: `dl/rnn` (chỉ bản vi, đợt phần DL). Bài cần biết trước trong roadmap: `dl/training-neural-networks` (cùng xuất bản trong PR phần DL, nên link được; bài này không có khối "Nhắc nhanh"). Hình: `RnnUnrolledFigure` (dl-lessons.md mục 4, chưa có, bài để comment giữ chỗ). Hai ô `PythonRunner` (NumPy) và một ô `LocalCode` (PyTorch).

Ngày tra: **05/11/2026**. Cách tra: WebFetch trang PMLR, d2l.ai, d2l.aivivn.com; tải PDF của [P13] rồi trích chữ bằng `zlib` (máy không có `pdftotext`); tìm kiếm web để kiểm thư mục của [B94] và [E90]. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra.

## Nguồn

- **[P13]** Pascanu, R., Mikolov, T., Bengio, Y. (2013). [*On the difficulty of training recurrent neural networks*](https://proceedings.mlr.press/v28/pascanu13.html). ICML 2013, PMLR 28(3): 1310–1318. arXiv:1211.5063. Đã đọc chữ trích từ PDF: mục 2 (điều kiện tiêu biến/bùng nổ), mục 3.2 (thuật toán cắt chuẩn gradient, cách chọn ngưỡng), thí nghiệm (ngưỡng 1).
- **[B94]** Bengio, Y., Simard, P., Frasconi, P. (1994). [*Learning long-term dependencies with gradient descent is difficult*](https://doi.org/10.1109/72.279181). *IEEE Transactions on Neural Networks* 5(2): 157–166. Chỉ kiểm thư mục và tóm tắt qua tìm kiếm; chưa đọc toàn văn.
- **[GBC16]** Goodfellow, I., Bengio, Y., Courville, A. (2016). [*Deep Learning*, chương 10](https://www.deeplearningbook.org/contents/rnn.html). MIT Press. Trang tồn tại (WebFetch báo vượt giới hạn dung lượng, không đọc được qua công cụ); số mục 10.1, 10.2, 10.7, 10.11 theo kiến thức sẵn có. Sách dùng $\tau$ cho độ dài chuỗi.
- **[D2L]** Zhang, A., Lipton, Z. C., Li, M., Smola, A. J. [*Dive into Deep Learning*, mục 9.7 Backpropagation Through Time](https://d2l.ai/chapter_recurrent-neural-networks/bptt.html). Đã kiểm: chương 9 "Recurrent Neural Networks", mục 9.7.1.2 "Truncating Time Steps", 9.7.1.3 "Randomized Truncation".
- **[D2L-vi]** Bản dịch tiếng Việt [*Đắm mình vào Học Sâu*, chương 8](https://d2l.aivivn.com/chapter_recurrent-neural-networks/index_vn.html) (bản 0.14.4). Đã kiểm mục lục: 8.4 Mạng nơ-ron hồi tiếp, 8.5 có "Gọt Gradient", 8.7 Lan truyền ngược qua thời gian.
- **[E90]** Elman, J. L. (1990). *Finding Structure in Time*. *Cognitive Science* 14(2): 179–211, DOI 10.1207/s15516709cog1402_1. Kiểm thư mục qua tìm kiếm (trang Wiley trả 403). Không dùng trong bài; ghi lại làm nguồn lịch sử của RNN có trạng thái ẩn.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Số mục trong [GBC16] | Không mở được trang qua công cụ. | Giữ 10.1, 10.2, 10.7, 10.11 theo kiến thức sẵn có; `content-reviewer` nên mở trang kiểm lại. |
| Nội dung toàn văn [B94] | Chỉ đọc tóm tắt. | Bài chỉ nói "phụ thuộc càng xa, gradient descent càng khó học", đúng ý tóm tắt. Phần "tổng các số hạng theo khoảng cách" viết như suy ra từ công thức BPTT, không gán cho [B94]. |
| Năm của [D2L] | Bản trên web cập nhật liên tục; bản in Cambridge University Press 2023. | Ghi 2023. |

## Ý chính

- **Điều kiện tiêu biến/bùng nổ [P13, mục 2].** Trường hợp tuyến tính: bán kính phổ $\rho < 1$ đủ để thành phần xa tiêu biến, $\rho > 1$ cần để bùng nổ. Tổng quát cho hàm phi tuyến có $\lVert \mathrm{diag}(\sigma'(\cdot)) \rVert \le \gamma$, dùng giá trị kỳ dị lớn nhất $\lambda_1$: $\lambda_1 < 1/\gamma$ là đủ để tiêu biến; đảo chứng minh ra điều kiện cần $\lambda_1 > 1/\gamma$ cho bùng nổ. $\gamma = 1$ với $\tanh$, $1/4$ với sigmoid. Bài viết theo dạng $\sigma_{\max}(\mathbf{W}_{hh})$ và ngưỡng 1 (tanh), 4 (sigmoid).
- **Cắt chuẩn gradient [P13, Algorithm 1].** Nếu $\lVert \hat{\mathbf{g}} \rVert \ge$ ngưỡng thì $\hat{\mathbf{g}} \leftarrow \frac{\text{ngưỡng}}{\lVert \hat{\mathbf{g}} \rVert}\hat{\mathbf{g}}$. Chọn ngưỡng: xem chuẩn trung bình qua nhiều bước; "từ một nửa tới mười lần" mức đó vẫn hội tụ. Bài ghi ngưỡng là $\tau$ và dùng dấu $>$ (khác biệt ở đúng bằng ngưỡng không ảnh hưởng gì).
- **Clipping kiểu Mikolov [P13, mục 3.1].** Cắt từng phần tử theo giá trị tuyệt đối; [P13] nói hai cách chạy tương tự trong thực tế. Bài chỉ trình bày cắt theo chuẩn (cách của `clip_grad_norm_`).
- **Truncated BPTT [D2L 9.7].** Cắt tổng sau $K$ bước (thông thường) hoặc cắt ngẫu nhiên. Bài trình bày cách thông thường, kiểu chia đoạn và chuyển trạng thái đã `detach()`.

## Thuật ngữ (đề xuất cho glossary, mục Deep Learning)

| Tiếng Việt | Tiếng Anh | Ghi chú |
|---|---|---|
| Lan truyền ngược theo thời gian | Backpropagation through time (BPTT) | Dịch, viết tắt BPTT |
| Truncated BPTT | Truncated BPTT | Giữ |
| Mở rộng theo thời gian | Unrolling (unfolding) | Dịch |
| Chia sẻ trọng số | Weight sharing | Dịch |
| Trọng số hồi tiếp | Recurrent weight | Dịch, ma trận $\mathbf{W}_{hh}$ |
| Dữ liệu chuỗi | Sequential data | Dịch |
| Chuỗi thời gian | Time series | Dịch |
| Ma trận Jacobian | Jacobian matrix | Giữ "Jacobian" |
| Chuẩn phổ; giá trị kỳ dị | Spectral norm; singular value | Dịch |
| Ma trận trực giao | Orthogonal matrix | Dịch |

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc ở scratchpad, Python gọi bằng `-I`. Mỗi file `.en.py` là bản sao y nguyên của `.vi.py` (chưa dịch comment). Ngoài ba file của bài, công thức BPTT ở mục Lý thuyết (Bước 1–3) được kiểm bằng sai phân trung tâm trên một RNN nhỏ ($d_x = 2$, $d_h = 3$, $L = 5$): sai lệch lớn nhất $9.7 \times 10^{-10}$ (script trong scratchpad, không phải file của bài).

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `forward.vi.py`, `forward.en.py` | chạy thật | 2026-11-05 | `C:/Users/Dell/.venvs/ai-atlas-py314` (Python 3.14, NumPy 2.4.6, khớp Pyodide) | 37 dòng, dòng dài nhất 67 ký tự. Output hai bản giống hệt: $\mathbf{h}_1 \dots \mathbf{h}_4$ (cuối `[0.365 0.01 -0.084]`), `y_hat (from h_L) = -0.123`, `L=2 last h = [0.21 -0.089 0.233]` (bằng $\mathbf{h}_2$), `reversed h = [0.146 0.236 -0.409]`, `parameters = 22`. Khớp lời văn |
| `jacobian.vi.py`, `jacobian.en.py` | chạy thật | 2026-11-05 | như trên | 30 dòng, dòng dài nhất 65 ký tự. Output giống hệt: `c=0.5` 5.0e-01 / 9.5e-04 / 8.7e-07 / 7.9e-10 / 7.1e-13; `c=1.0` 1.0e+00 / 7.3e-01 / 4.1e-01 / 2.4e-01 / 1.4e-01; `c=2.0` 1.9e+00 / 3.2e+01 / 7.7e+01 / 1.6e+03 / 6.7e+03 (khoảng cách 1, 10, 20, 30, 40). Khớp lời văn |
| `sine-rnn.vi.py`, `sine-rnn.en.py` | chạy thật | 2026-11-05 | `.venv-dl`: Python 3.14.2, torch 2.15.0+cpu | 53 dòng, dòng dài nhất 70 ký tự. Chạy bốn lần (bản vi ba lần, một lần với `OMP_NUM_THREADS=1`; bản en một lần), output giống hệt: train MSE 0.0779 / 0.0045 / 0.0042 / 0.0042 (epoch 1/5/10/15), max grad norm 1.66 / 0.15 / 0.26 / 0.16, test MSE RNN 0.0038, chép $x_t$ 0.0091. Thời gian 37 s, 40 s, 51 s, 59 s khi máy đang chạy nhiều phiên song song. Kết quả mẫu trong bài lấy từ các lần này; `sampleVaries={false}` |
| thí nghiệm bỏ `h.detach()` (bản sao trong scratchpad) | chạy thật | 2026-11-05 | như trên | Báo `RuntimeError: Trying to backward through the graph a second time ...`. Thêm `retain_graph=True`: báo `RuntimeError: one of the variables needed for gradient computation has been modified by an inplace operation` (tensor `[32, 32]`, tức `weight_hh`). Khớp hộp Lỗi hay gặp thứ hai |
