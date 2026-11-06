# LSTM và BiLSTM

Bài: `dl/lstm-bilstm` (chỉ bản vi). Bài cần biết trước trong roadmap: `dl/gru` (xuất bản cùng PR, link được). Hình: `LstmCellFigure` (dl-lessons.md mục 4), chưa có, bài để comment giữ chỗ. Một ô `PythonRunner` (NumPy, một bước LSTM và đếm tham số) và một ô `LocalCode` (PyTorch, LSTM một chiều và BiLSTM).

Ngày tra: **05/11/2026**. Cách tra: WebFetch trang arXiv, PMLR, d2l.ai, tài liệu PyTorch 2.15; tải PDF của [J15] rồi trích chữ bằng `pdftotext`; các DOI kiểm bằng cách xem chuyển hướng tới trang nhà xuất bản (đúng tập, đúng trang). Ý không có thẻ nguồn là kiến thức chung hoặc suy ra.

## Nguồn

- **[HS97]** Hochreiter, S., Schmidhuber, J. (1997). [*Long Short-Term Memory*](https://doi.org/10.1162/neco.1997.9.8.1735). *Neural Computation* 9(8): 1735–1780. DOI chuyển tới `direct.mit.edu/neco/article/9/8/1735-1780`. Bản gốc chưa có cổng quên; ô có tự nối trọng số 1, gọi là constant error carousel. Chưa đọc toàn văn; chi tiết "không có cổng quên" khớp [G00], [J15] và [O15].
- **[G00]** Gers, F. A., Schmidhuber, J., Cummins, F. (2000). [*Learning to Forget: Continual Prediction with LSTM*](https://doi.org/10.1162/089976600300015015). *Neural Computation* 12(10): 2451–2471. DOI chuyển tới `direct.mit.edu/neco/article/12/10/2451-2471`. Thêm cổng quên để ô tự xóa trên luồng dữ liệu liên tục. Theo [J15], bài này đã có ý khởi tạo bias cổng quên dương.
- **[SP97]** Schuster, M., Paliwal, K. K. (1997). [*Bidirectional Recurrent Neural Networks*](https://doi.org/10.1109/78.650093). *IEEE Transactions on Signal Processing* 45(11): 2673–2681 (số trang theo danh mục tham khảo của [W16]). DOI chuyển tới `ieeexplore.ieee.org/document/650093`. RNN hai chiều.
- **[GS05]** Graves, A., Schmidhuber, J. (2005). [*Framewise Phoneme Classification with Bidirectional LSTM and Other Neural Network Architectures*](https://doi.org/10.1016/j.neunet.2005.06.042). *Neural Networks* 18(5–6). DOI chuyển tới Elsevier (pii S0893608005001206). BiLSTM.
- **[C14]** Chung, J., Gulcehre, C., Cho, K., Bengio, Y. (2014). [*Empirical Evaluation of Gated Recurrent Neural Networks on Sequence Modeling*](https://arxiv.org/abs/1412.3555). arXiv:1412.3555. Tóm tắt: GRU "comparable to LSTM" trên dữ liệu nhạc đa âm và tín hiệu tiếng nói.
- **[J15]** Jozefowicz, R., Zaremba, W., Sutskever, I. (2015). [*An Empirical Exploration of Recurrent Network Architectures*](https://proceedings.mlr.press/v37/jozefowicz15.html). ICML 2015, PMLR 37: 2342–2350. Đã đọc toàn văn (PDF). Ý dùng trong bài:
  - Thử hơn mười nghìn kiến trúc; không tìm được kiến trúc thắng LSTM và GRU ở mọi điều kiện.
  - Mục 2.2: khởi tạo nhỏ ngẫu nhiên làm cổng quên khoảng 0.5, tức tiêu biến hệ số 0.5 mỗi bước; khởi tạo $b_f$ bằng 1 hoặc 2 khắc phục; "ý này đã có trong Gers et al. (2000)".
  - GRU hơn LSTM ở hầu hết bài trừ mô hình ngôn ngữ (khởi tạo thông thường); LSTM với bias 1 gần bằng GRU; LSTM tốt nhất trên PTB khi có dropout.
  - Cổng quên quan trọng nhất, cổng vào thứ hai, cổng ra ít quan trọng nhất.
- **[Gr17]** Greff, K., Srivastava, R. K., Koutník, J., Steunebrink, B. R., Schmidhuber, J. (2017). [*LSTM: A Search Space Odyssey*](https://arxiv.org/abs/1503.04069). *IEEE TNNLS* 28(10): 2222–2232. Tóm tắt: tám biến thể, 5400 lần chạy; không biến thể nào hơn đáng kể LSTM chuẩn; cổng quên và hàm kích hoạt đầu ra là hai thành phần quan trọng nhất.
- **[O15]** Olah, C. (2015). [*Understanding LSTM Networks*](https://colah.github.io/posts/2015-08-Understanding-LSTMs/). Blog, 27/8/2015. Hình ảnh "conveyor belt" cho trạng thái ô; có GRU, peephole.
- **[D2L]** Zhang, A., Lipton, Z. C., Li, M., Smola, A. J. [*Dive into Deep Learning*](https://d2l.ai/chapter_recurrent-modern/lstm.html), chương 10: 10.1 LSTM, 10.3 RNN sâu, 10.4 RNN hai chiều. Ký hiệu $\mathbf{I}_t, \mathbf{F}_t, \mathbf{O}_t$, $\tilde{\mathbf{C}}_t$ ("input node").
- **[PT]** PyTorch 2.15, [`torch.nn.LSTM`](https://docs.pytorch.org/docs/2.15/generated/torch.nn.LSTM.html). Hai bias mỗi nhánh (`b_i*`, `b_h*`); thứ tự cổng trong `weight_ih_l[k]` là i, f, g, o; đầu ra hai chiều có chiều cuối $2H$; "h_n is not equivalent to the last element of output" khi hai chiều (phần tử cuối chứa trạng thái cuối của chiều xuôi và trạng thái đầu của chiều ngược); khởi tạo đều trong $[-\sqrt{k}, \sqrt{k}]$, $k = 1/H$.
- **[H15]** Huang, Z., Xu, W., Yu, K. (2015). [*Bidirectional LSTM-CRF Models for Sequence Tagging*](https://arxiv.org/abs/1508.01991). arXiv:1508.01991. Dùng cho một câu về NER. Mới biết qua tên và tóm tắt.
- **[S14]**, **[W16]**: xem [seq2seq.md](seq2seq.md). LSTM 4 tầng ([S14]). [W16] (arXiv:1609.08144): tóm tắt ghi "8 encoder and 8 decoder layers"; hình 1 và mục 3.2 (đã trích bằng `pdftotext` ngày 05/11/2026): tầng dưới cùng của encoder hai chiều, 7 tầng còn lại một chiều.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| [H15] | Chỉ biết qua tóm tắt | Chỉ dùng một câu "ghép BiLSTM với CRF cho gán nhãn" |
| [HS97] toàn văn | Chưa đọc | Chỉ nói những điều có trong [J15], [G00], [O15] |

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc ở scratchpad, gọi Python bằng `-I`. Mỗi `.en.py` là bản sao y nguyên của `.vi.py`.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `lstm-step.vi.py`, `lstm-step.en.py` | chạy thật | 2026-11-05 | venv khớp Pyodide `C:/Users/Dell/.venvs/ai-atlas-py314` (Python 3.14.5, NumPy 2.4.6) | 47 dòng, dòng dài nhất 71 ký tự. Bản vi và en cho output giống hệt: `f` bước 1 `[0.77 0.74 0.69 0.73]`, các bước sau trong khoảng 0.48–0.88; `c` thành phần đầu 0.13, 0.49, 0.19, −0.53, −0.87; `h_L = [-0.447 -0.373 0.123 -0.013]`; `prod f = [0.134 0.208 0.271 0.103]`; `params: 128  formula 4*RNN: 128`; `RNN: 32  GRU: 96  PyTorch LSTM: 144`. Khớp lời văn |
| `bilstm-tagging.vi.py`, `bilstm-tagging.en.py` | chạy thật | 2026-11-05 | `.venv-dl`: Python 3.14.2, torch 2.15.0+cpu | 45 dòng, dòng dài nhất 73 ký tự. Chạy bản vi một lần và bản en một lần với `OMP_NUM_THREADS=1`, output giống hệt: `LSTM   params  6400  loss 0.497  test acc 0.753`; `BiLSTM params 12800  loss 0.000  test acc 1.000`. Thời gian 41 s và 32 s trong lúc máy đang chạy nhiều phiên song song. Hai lần chạy với số luồng mặc định cùng lúc đó mất khoảng 7 phút mỗi lần (tranh chấp luồng) nên bị dừng; bài ghi gợi ý `OMP_NUM_THREADS=1`. Kết quả mẫu trong bài lấy từ lần chạy bản vi |
| Trần 0.75 của LSTM một chiều | suy ra | 2026-11-05 | tính tay | Với $x_t = v$ đều trên 0–9, đoán tốt nhất đúng $\max((9-v)/10, (v+1)/10)$; trung bình $7.5/10 = 0.75$. Khớp 0.753 đo được |
