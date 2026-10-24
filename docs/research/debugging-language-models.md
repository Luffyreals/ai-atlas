# Debug mô hình ngôn ngữ (Debugging Language Models)

Bài: `llm/debugging-language-models` (chỉ bản vi, khoảng 11 phút đọc, đợt 5). Bài cần biết trước: `llm/build-first-llm`. Giáo án (buổi 21): debug quá trình lập trình, xác định lỗi khi training, xác định lỗi khi test. Có một ô `PythonRunner` (NumPy) và một ô `LocalCode` (PyTorch).

Ngày tra: **24/10/2026**. Cách tra: WebFetch blog Karpathy, tài liệu PyTorch 2.14 và Transformers 5.20.2, trang arXiv; tải PDF của Vaswani 2017 và Brown 2020 rồi trích chữ bằng `pdftotext`; chạy thật Python trong scratchpad. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra từ công thức.

## Nguồn

- **[K19]** Karpathy, A. (2019, đăng 25/4/2019). [*A Recipe for Training Neural Networks*](https://karpathy.github.io/2019/04/25/recipe/). Blog cá nhân. Đã đọc toàn trang (qua WebFetch, bản tóm lược của công cụ; người viết nên đọc lại trang gốc trước khi trích).
- **[PT-AD]** Tài liệu PyTorch 2.14, mục *Automatic differentiation package*, phần anomaly detection: [`torch.autograd.detect_anomaly`](https://docs.pytorch.org/docs/2.14/autograd.html). Trang dài; mới đọc 100 000 ký tự đầu, đủ phần cần dùng.
- **[PT-CG]** Tài liệu PyTorch 2.14: [`torch.nn.utils.clip_grad_norm_`](https://docs.pytorch.org/docs/2.14/generated/torch.nn.utils.clip_grad_norm_.html).
- **[PT-CE]** Tài liệu PyTorch 2.14: [`torch.nn.CrossEntropyLoss`](https://docs.pytorch.org/docs/2.14/generated/torch.nn.CrossEntropyLoss.html) (`ignore_index`).
- **[CT]** Tài liệu Hugging Face Transformers, bản 5.20.2: [*Chat templates*](https://huggingface.co/docs/transformers/chat_templating) (cảnh báo token đặc biệt, `add_generation_prompt`, mục "Model training").
- **[GEN]** Tài liệu Hugging Face Transformers, bản 5.20.2: [*Text generation*](https://huggingface.co/docs/transformers/llm_tutorial), mục "Padding side" và "Prompt format".
- **[V17]** Vaswani, A., và cộng sự (2017). [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762). arXiv:1706.03762. Đọc mục 5.3 (lịch trình tốc độ học). Không xác minh hội nghị (xem "Chưa xác minh").
- **[X20]** Xiong, R., Yang, Y., He, D., Zheng, K., Zheng, S., Xing, C., Zhang, H., Lan, Y., Wang, L., Liu, T.-Y. (2020). [*On Layer Normalization in the Transformer Architecture*](https://arxiv.org/abs/2002.04745). ICML 2020 (trang arXiv ghi "Published on ICML 2020"). Mới đọc tóm tắt.
- **[P13]** Pascanu, R., Mikolov, T., Bengio, Y. (2012; bản sửa 2013). [*On the difficulty of training Recurrent Neural Networks*](https://arxiv.org/abs/1211.5063). arXiv:1211.5063. Nguồn gốc của cắt chuẩn gradient (gradient norm clipping) trong ngữ cảnh RNN. Mới đọc tóm tắt; trang arXiv không nêu hội nghị (thường được dẫn là ICML 2013, **chưa xác minh**).
- **[H19]** Holtzman, A., Buys, J., Du, L., Forbes, M., Choi, Y. (2019). [*The Curious Case of Neural Text Degeneration*](https://arxiv.org/abs/1904.09751). ICLR 2020 (trang arXiv ghi "Published in ICLR 2020"). Mới đọc tóm tắt.
- **[B20]** Brown, T. B., và cộng sự (2020). [*Language Models are Few-Shot Learners*](https://arxiv.org/abs/2005.14165). arXiv:2005.14165. Đã đọc đoạn mở đầu mục 4 và đoạn nói về lỗi lọc trùng (xem "Ý chính").

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Hội nghị của [V17], [P13], [B20] | Trang arXiv không nêu. | Ghi "arXiv:..., năm". |
| Nội dung đầy đủ của [K19] | Chỉ đọc qua bản tóm lược của công cụ, không có đoạn trích nguyên văn; hai tiêu đề mục "Neural net training is a leaky abstraction" và "Neural net training fails silently" đã khớp bản tóm lược. | Người viết mở trang gốc, đối chiếu hai ý "loss khởi đầu" và "overfit một batch" trước khi dẫn. Trích nguyên văn tối đa một câu ngắn. |
| Ví dụ cụ thể "đặt loss bằng tổng đầu ra $i$ rồi kiểm gradient" của [K19] | Bản tóm lược chỉ nêu ý chung (dùng gradient kiểm phụ thuộc, bắt rò rỉ tự hồi quy). Chưa thấy chi tiết. | Bài dùng cách kiểm **của bài** (đổi token tương lai, so đầu ra, xem mục "Số tự chạy"); không gán chi tiết cho Karpathy. |
| Cảnh báo `padding_side` mặc định của từng tokenizer | [GEN] chỉ nói LLM cần đệm **trái** khi sinh; không nêu mặc định. | Chỉ viết "khi sinh theo lô với decoder-only, đệm bên trái"; không nói tokenizer nào mặc định bên nào. |
| Hành vi `F.cross_entropy` khi mọi nhãn bị bỏ qua | [PT-CE] không nói kết quả (chỉ nêu mẫu số là tổng trọng số của nhãn không bỏ qua). | Dựa vào **lần chạy thật**: trả `nan` (torch 2.14.1+cpu). Ghi rõ là quan sát, không phải cam kết tài liệu. |
| Giá trị lan truyền NaN khi `inf - inf`, `0 * inf` | Kiến thức chung, chưa tra tài liệu. | Chỉ nói "phép chia cho 0, `log(0)`, `sqrt` tại 0, tràn số mũ là các nguồn hay gặp"; ví dụ `sqrt(0)` đã chạy thật. |
| Sinh code, benchmark, tên mô hình | Không dùng trong bài. | Không dẫn số liệu benchmark. |

## Ý chính

### Khung chung: ba pha, mỗi pha một kiểu lỗi

- **Huấn luyện mạng nơ-ron "hỏng một cách im lặng".** Chương trình không báo lỗi, mô hình vẫn train, chỉ tệ hơn mức đáng ra [K19]. Vì vậy debug LLM là chuyện **chứng minh từng giả định bằng một phép kiểm nhỏ**, không phải đợi lỗi hiện ra. Bài nên mở bằng ý này (lập luận rồi tới ví dụ), có thể trích một câu ngắn "Neural net training fails silently" [K19].
- **Ba pha theo giáo án buổi 21:** (1) lập trình (shape, mask, nhãn, tokenizer); (2) training (loss NaN, learning rate, warmup, clip); (3) test và suy luận (chat template, rò rỉ dữ liệu, lặp từ). Mỗi pha có "triệu chứng, nguyên nhân hay gặp, phép kiểm". Nên trình bày bằng một bảng ba cột trong mục Minh họa (bài LLM không có VIZ, quy tắc `llm-lessons.md` 2.7).
- **Quy trình của [K19] (lấy các ý dùng được):** cố định seed; xem dữ liệu bằng mắt trước; dựng khung chạy đầu-cuối đơn giản nhất; tắt thứ phụ; **kiểm loss khởi đầu**; so với mốc đối chứng; **overfit một batch nhỏ**; xem **chính đầu vào ngay trước khi vào mô hình**; thêm độ phức tạp từng bước. Bài chỉ lấy phần liên quan tới mô hình ngôn ngữ, không kể lại cả quy trình.

### Pha 1: lỗi khi lập trình

- **Shape.** Lỗi hay gặp là nhầm `view`/`reshape` với `transpose`/`permute`: cùng số phần tử nên chạy không báo lỗi nhưng **trộn dữ liệu sai chỗ** [K19 nêu ý này]. Phép kiểm: in shape ở mọi bước; dùng kích thước **khác nhau** cho batch, độ dài, số chiều (ví dụ 4, 16, 32) để lỗi nhầm trục lộ ra, đừng dùng toàn con số trùng nhau.
- **Lệch nhãn (dịch một vị trí).** Logit ở vị trí $t$ dự đoán token $t+1$. Quên dịch thì mô hình chỉ cần chép đầu vào là có loss gần 0, vô nghĩa, và sinh văn bản hỏng (nối `gpt-family-finetuning`). Dấu hiệu: loss rơi về gần 0 **quá nhanh**; dự đoán trùng đầu vào. Lỗi ngược (dịch hai vị trí) khó thấy hơn. Số chạy thật: mô hình "chép đầu vào" có loss 0,0000 khi **không** dịch nhãn và 20,0000 khi dịch đúng (xem "Số tự chạy").
- **Mặt nạ nhân quả sai hoặc thiếu.** Thiếu mặt nạ: vị trí $t$ thấy được token $t+1$, loss huấn luyện thấp "đẹp" bất thường, khi sinh thì vô dụng (nối `build-first-llm`, mục lỗi 6). Phép kiểm **do bài đề xuất**: đổi một token ở vị trí $t+1$, so đầu ra ở các vị trí $\le t$. Có mặt nạ: đầu ra không đổi (chênh lệch đúng 0). Không mặt nạ: đầu ra đổi (đã chạy). [K19] nêu cùng tinh thần: dùng gradient kiểm xem đầu ra chỉ phụ thuộc đúng đầu vào dự định, bắt được rò rỉ tự hồi quy.
- **Mặt nạ nhầm chiều hoặc nhầm quy ước.** Cấm nhìn tương lai, không phải quá khứ. Với `nn.MultiheadAttention`, `attn_mask` kiểu bool có `True` nghĩa là **không được** nhìn; kiểu float thì cộng thẳng vào điểm (đã nêu ở `build-first-llm`). Nên nhắc lại một dòng và link.
- **Tokenizer, BOS/EOS, padding.** Ba lỗi hay gặp:
  - Thiếu hoặc thừa BOS/EOS. **Mask luôn EOS của đáp án** làm mô hình không học cách dừng (từ `gpt-family-finetuning`, điểm hiểu nhầm 7). Thêm token đặc biệt **hai lần** khi `apply_chat_template(tokenize=False)` rồi tách token lại mà không đặt `add_special_tokens=False` [CT].
  - Đệm không mask khỏi loss: vị trí đệm bị tính vào loss (nhãn nên là $-100$, giá trị `ignore_index` mặc định [PT-CE]).
  - **Đệm sai phía:** khi sinh theo lô với decoder-only, phải đệm **bên trái**, vì mô hình không được huấn luyện để viết tiếp từ token đệm [GEN]. Ví dụ trong [GEN]: đệm phải làm đầu ra thành `'1, 2, 33333333333'`, đệm trái cho `'1, 2, 3, 4, 5, 6,'` (đúng như tài liệu, chạy trên Mistral-7B; bài **không** tự chạy, chỉ nêu là ví dụ của tài liệu và ghi mức "đối chiếu"). Khi huấn luyện thì phía đệm thường ít ảnh hưởng nếu mask đúng (kiến thức chung, chưa có nguồn: **không khẳng định** trong bài).
- **Kiểm tra batch có toàn nhãn $-100$ không.** Khi mọi nhãn bị bỏ qua, `F.cross_entropy` trả `nan` (đã chạy thật; tài liệu [PT-CE] nêu mẫu số là tổng trọng số của nhãn không bị bỏ qua, nên mẫu số bằng 0). Nối với điểm hiểu nhầm 10 của `gpt-family-finetuning`.

### Pha 2: lỗi khi huấn luyện

- **Kiểm loss khởi đầu bằng $\ln V$.** Mô hình mới khởi tạo, chưa học gì, đáng ra cho phân phối gần đều, nên loss ban đầu xấp xỉ $\ln V$ (dạng $-\log(1/n_{\text{lớp}})$ của [K19]; `build-first-llm` đã dạy $\ln V$ là mốc "đoán đều"). Nếu thấy loss ban đầu cao hơn nhiều (ví dụ 30 khi $\ln V\approx 10{,}8$), hầu như chắc chắn khởi tạo trọng số lớp cuối hoặc scale logit sai. Số chạy thật: $V=14$, $\ln V=2{,}639$, loss ban đầu 2,951 (lớp cuối khởi tạo mặc định của PyTorch, logit hơi lệch nên cao hơn một chút; "xấp xỉ" nghĩa là cùng bậc, không phải bằng đúng). Loss ban đầu thấp **hơn** $\ln V$ nhiều cũng đáng ngờ (có thể rò rỉ nhãn).
- **Overfit một batch nhỏ.** Lấy 2 đến 4 chuỗi, huấn luyện lặp lại trên đúng batch đó; mô hình phải kéo loss về gần 0 và dự đoán khớp nhãn. Không làm được thì còn lỗi (mặt nạ, nhãn, learning rate, kiến trúc) [K19]. Đây là phép kiểm **rẻ nhất, mạnh nhất**: chạy trong vài giây trên CPU. Số chạy thật: loss 2,951 xuống 0,069 sau 50 bước và khoảng 0,056 sau 200 bước (xem "Số tự chạy"); **không về đúng 0**, nên bài nói "gần 0" thay vì "bằng 0".
- **Nguyên nhân NaN/inf.** Phép chia cho 0, `log(0)`, `sqrt` tại 0 (gradient vô hạn), `exp` tràn số, batch toàn nhãn $-100$, learning rate quá lớn làm tham số phình tới tràn số. Bắt bằng: in `loss` mỗi bước và dừng khi không hữu hạn; `torch.autograd.detect_anomaly()` chỉ ra **phép toán** tạo NaN ở bước ngược, kèm traceback của bước xuôi tạo ra nó [PT-AD]. Chỉ dùng khi debug vì **làm chương trình chậm** [PT-AD]. Số chạy thật: `Function 'SqrtBackward0' returned nan values in its 0th output.`
- **Learning rate quá lớn.** Loss nhảy lên hàng nghìn, hoặc thành NaN. Số chạy thật (cùng mô hình nhỏ, một batch, 60 bước, seed 0): Adam $\eta=10^{-3}$ loss 2,95 xuống 0,96; Adam $\eta=1$ loss lên tới hàng nghìn (6 296 ở bước 12) và không hồi phục; SGD $\eta=10$ cho `nan` từ bước 12; SGD $\eta=1000$ cũng `nan`. Đây là **thí nghiệm của người viết**, không phải kết quả của paper; con số phụ thuộc mô hình, dữ liệu, seed, nên bài chỉ dùng để dạy **hình dạng** hiện tượng. Cách xử lý: giảm $\eta$ (thường theo hệ số 3 đến 10), thêm warmup, thêm clip.
- **Warmup.** Tăng tốc độ học tuyến tính từ nhỏ trong những bước đầu, rồi giảm. [V17] dùng công thức $\eta_t = d_{\text{model}}^{-0{,}5}\cdot\min(t^{-0{,}5},\, t\cdot s^{-1{,}5})$ với $s=4000$ bước warmup (đã đọc trong PDF, mục 5.3). Giải thích vì sao: [X20] chỉ ra, với kiến trúc Transformer gốc (Post-LN, chuẩn hóa lớp đặt giữa các khối residual), gradient của tham số gần đầu ra rất lớn ở thời điểm khởi tạo, nên tốc độ học lớn ngay từ đầu làm huấn luyện bất ổn; đó là lý do warmup giúp; còn Pre-LN (chuẩn hóa đặt trong khối residual) cho gradient dễ chịu và [X20] báo có thể bỏ warmup. Không nói "warmup luôn cần".
- **Gradient clipping.** Cắt chuẩn gradient: nếu $\lVert\mathbf{g}\rVert>c$ thì co $\mathbf{g}$ về chuẩn $c$ giữ nguyên hướng. Gốc: [P13] đề xuất cho gradient bùng nổ ở RNN. API: `torch.nn.utils.clip_grad_norm_(parameters, max_norm, norm_type=2.0, error_if_nonfinite=False, foreach=None)` **sửa gradient tại chỗ** và **trả về chuẩn tổng trước khi cắt** (một Tensor) [PT-CG]; `error_if_nonfinite=True` thì báo lỗi khi chuẩn là `nan`/`inf`. Dùng chuẩn trả về làm **đồng hồ đo**: theo dõi nó, tăng đột ngột thường báo trước sự cố. Lưu ý đặt **sau** `loss.backward()` và **trước** `optimizer.step()`.
- **Clip không cứu lỗi lớn.** Số chạy thật: SGD $\eta=10$ có clip 1,0 không ra `nan` (loss dao động 25 đến 230 ở **lần chạy 60 bước** của bảng bên dưới, khác lần chạy trong bài; lần chạy 201 bước trong bài cho loss 12,46 đến 206,09 ở bước 50 đến 200, xem mục Kiểm chứng code) nhưng cũng **không học được**; Adam $\eta=1$ có clip cũng không học. Clip chỉ chặn tràn số, không thay cho việc chọn $\eta$ hợp lý.
- **Loss huấn luyện giảm, loss kiểm tra tăng.** Là overfitting (nối `ml/overfitting-underfitting`; số 24 câu Kiều ở `build-first-llm`). Không phải "lỗi code". Nhưng cần phân biệt với rò rỉ nhãn (loss huấn luyện thấp quá mức).

### Pha 3: lỗi khi test và suy luận

- **Chat template sai.** Mỗi mô hình có định dạng riêng; dùng sai token điều khiển thì chất lượng "tệ đi rõ rệt" [CT]. Ví dụ [CT]: Mistral-7B-Instruct dùng `[INST]`/`[/INST]`, Zephyr dùng `<|user|>`/`<|assistant|>` dù từ cùng mô hình nền. Khi suy luận phải `add_generation_prompt=True`, không thì mô hình có thể **viết tiếp lời người dùng** thay vì trả lời; khi huấn luyện đặt `False` [CT]. Mô hình không cần token mở lượt (ví dụ Llama theo [CT]) thì cờ này không có tác dụng. Truyền cả câu như một chuỗi thường rồi mong mô hình hiểu cũng cho đầu ra "không như mong đợi" [GEN]. Phép kiểm: **in chuỗi sau khi áp template và nhìn bằng mắt** [K19: "xem chính đầu vào ngay trước khi vào mô hình"].
- **Không mask phần dùng đúng token kết thúc.** EOS của template và EOS của sinh phải khớp, nếu không câu trả lời không dừng (từ `gpt-family-finetuning` và [TRL] ở file đó). Không lặp lại chi tiết, link.
- **Rò rỉ dữ liệu test (test-set contamination).** Dữ liệu kiểm tra lọt vào dữ liệu huấn luyện, điểm đánh giá bị thổi phồng. [B20] gọi là "data contamination", nói rằng với bộ dữ liệu cỡ internet và mô hình đủ lớn để nhớ, việc này nhiều khả năng **thường xuyên xảy ra**. Cách đo của họ: gắn cờ mọi ví dụ kiểm tra có chuỗi trùng 13-gram với dữ liệu huấn luyện, rồi so điểm trên "tập sạch" với điểm trên toàn bộ. Họ cũng kể một lỗi trong bước lọc làm chỉ xóa được **một phần** phần trùng, nhưng vì chi phí huấn luyện nên không huấn luyện lại. Ý rút ra cho bài: (a) lọc trùng phải **kiểm lại**, đừng giả định đã sạch; (b) chia train/test **trước** mọi bước tiền xử lý; (c) dữ liệu nhỏ thì kiểm bằng cách tìm trùng chuỗi. Không nêu con số kết quả của [B20] (không đọc kỹ biểu đồ).
- **Lặp từ khi sinh.** [H19] cho thấy giải mã theo xác suất cao nhất (greedy, beam) sinh văn bản "nhàm và lặp lại một cách lạ lùng" dù mô hình tốt, và chiến lược giải mã **một mình** đã đổi mạnh chất lượng đầu ra; họ đề xuất nucleus sampling (top-$p$). Tóm tắt arXiv viết "maximization-based decoding methods such as beam search lead to degeneration", nên câu trong bài ("các cách giải mã nhắm vào xác suất cao nhất, như beam search") đúng với nguồn; không gán riêng chi tiết cho greedy. [GEN] khuyên `repetition_penalty > 1.0` khi thấy mô hình hay lặp, và nói greedy là mặc định của `generate()`. Trước khi nghi mô hình hỏng, **đổi cách lấy mẫu** (`temperature`, top-$k$, top-$p$; link `llm/text-api`, `SamplingViz`).
- **`max_new_tokens` mặc định thấp.** [GEN]: `generate()` mặc định trả tối đa 20 token nếu không đặt, và mô hình decoder-only trả luôn cả prompt. Lỗi hay gặp: tưởng mô hình cụt lủn.

### Checklist (gợi ý, ghép từ các ý trên)

1. In shape mọi bước, dùng kích thước khác nhau cho từng trục.
2. Nhìn chuỗi token thật sau tokenizer và sau chat template (bằng mắt, có BOS/EOS đúng).
3. Kiểm nhãn: logit $t$ ghép nhãn $t+1$; vị trí đệm là $-100$; EOS đáp án **không** bị mask; batch có ít nhất một nhãn khác $-100$.
4. Kiểm mặt nạ nhân quả bằng "đổi token tương lai" (đầu ra các vị trí trước không đổi).
5. Loss khởi đầu so với $\ln V$.
6. Overfit một batch nhỏ.
7. Theo dõi loss và chuẩn gradient mỗi bước; dừng ngay khi không hữu hạn; có `clip_grad_norm_`, warmup.
8. Luôn nhìn loss kiểm tra, không chỉ loss huấn luyện; chia train/test trước khi tiền xử lý.
9. Khi suy luận: đúng template, `add_generation_prompt=True`, đệm trái cho sinh theo lô, đặt `max_new_tokens`, thử các cách lấy mẫu khác nhau.

## Công thức quan trọng

Ký hiệu theo site: cỡ từ vựng $V$, độ dài chuỗi $L$, tốc độ học $\eta$, tham số $\boldsymbol{\theta}$, hàm mất mát $\mathcal{L}$, gradient $\mathbf{g}=\nabla_{\boldsymbol{\theta}}\mathcal{L}$.

**Loss khởi đầu mong đợi** (đoán đều, đã dạy ở `build-first-llm`):

$$\mathcal{L}_{\text{init}}\approx\ln V$$

Giải thích bằng lời: mô hình chưa học gì gán xác suất gần $1/V$ cho mọi token, nên $-\ln(1/V)=\ln V$. Ví dụ $V=50\,257$ cho $\ln V\approx 10{,}8$ (số học, tính ra từ công thức, kiểm lại khi viết).

**Dịch nhãn:** logit tại vị trí $t$ (của $L-1$ vị trí đầu) ghép với token $s_{t+1}$:

$$\mathcal{L}=-\frac{1}{L-1}\sum_{t=1}^{L-1}\ln p_{\boldsymbol{\theta}}\big(s_{t+1}\mid s_{\le t}\big)$$

**Mặt nạ nhân quả** (công thức đã có ở `build-first-llm`; link, không chép lại): $M_{ij}=0$ nếu $j\le i$, $-\infty$ nếu $j>i$.

**Cắt chuẩn gradient** ([P13]; ký hiệu và cách viết là của `summarizer`, [PT-CG] mô tả hành vi):

$$\mathbf{g}\leftarrow\mathbf{g}\cdot\min\!\left(1,\ \frac{c}{\lVert\mathbf{g}\rVert_2}\right)$$

Với ngưỡng $c$ (`max_norm`). Hướng của $\mathbf{g}$ không đổi; chỉ chuẩn bị giới hạn bởi $c$. Giá trị `clip_grad_norm_` trả về là $\lVert\mathbf{g}\rVert_2$ **trước** khi cắt [PT-CG] (cho $p=2$, mặc định).

**Lịch trình warmup của [V17]** (PDF, công thức (3)):

$$\eta_t=d_{\text{model}}^{-0{,}5}\cdot\min\!\big(t^{-0{,}5},\ t\cdot s^{-1{,}5}\big)$$

$s$ là số bước warmup (4000 trong paper), $d_{\text{model}}$ là cỡ chiều mô hình. Tăng tuyến tính tới bước $s$, rồi giảm tỷ lệ với $t^{-0{,}5}$. Cần giải thích bằng lời: hai nhánh của $\min$ gặp nhau đúng ở $t=s$. (Một dạng đơn giản hơn dùng trong thực hành, như "tăng tuyến tính rồi giảm cosine", là kiến thức chung, chưa có nguồn đọc trong lần tra này; không đưa vào nếu không dẫn được.)

## Số tự chạy (Python, ngày 24/10/2026)

### Ô `PythonRunner` đề xuất: dịch nhãn và mặt nạ nhân quả (NumPy)

Chạy bằng venv Pyodide `C:/Users/Dell/.venvs/ai-atlas-py314` (Python 3.14.5, NumPy 2.4.6), `python -I -X utf8`. File thử nằm ở scratchpad (`dbg/np_demo.py`, 47 dòng), **không** nằm trong repo. Thiết kế: chuỗi `"trăm năm trong cõi người ta"` ($L=27$, $V=14$ ký tự khác nhau, $\ln V=2{,}639$); "mô hình" chép đầu vào (logit đỉnh 20 tại đúng token đầu vào); một đầu attention một chiều $d=8$ với trọng số ngẫu nhiên (`default_rng(0)`).

```text
V = 14  L = 27  ln V = 2.639
no shift  (labels = inputs):  0.0000
shifted   (labels = next):    20.0000
causal = True  max change at positions <= t: 0.00e+00
causal = False  max change at positions <= t: 1.04e-01
```

- Hai dòng loss: không dịch nhãn thì mô hình chép có loss 0, dịch nhãn đúng thì loss 20. Giá trị 20 chỉ là hệ quả của logit đỉnh 20 tôi chọn cho "mô hình chép"; ý dạy là **loss 0 một cách đáng ngờ** khi chưa học gì, không phải con số 20.
- Hai dòng mặt nạ: đổi token ở vị trí $t+1=10$ rồi so đầu ra ở các vị trí $\le t=9$. Có mặt nạ: chênh lệch **đúng 0**. Không mặt nạ: chênh lệch tối đa 0,104 (số này phụ thuộc seed, đừng so; ý là "khác 0").
- Chạy với seed khác chưa thử; số 0,104 thuộc `default_rng(0)`.
- Chỉ in **tiếng Anh ngắn** theo quy ước (mục 2.4 của `llm-lessons.md`). Chuỗi tiếng Việt có dấu trong ví dụ nên chuẩn hóa NFC (đã nêu ở `build-first-llm`); trong thử nghiệm chuỗi đã ở dạng dựng sẵn.

### Ô `LocalCode` đề xuất: overfit một batch và bắt NaN (PyTorch)

Chạy bằng `.venv-llm` (Python 3.14.5, torch 2.14.1+cpu), `torch.manual_seed(0)`, CPU. File thử `dbg/torch_demo.py`, 56 dòng, có **2 dòng dài hơn 79 ký tự** (writer phải rút gọn trước khi đưa vào repo). Mô hình: `Embedding` + vị trí + một `nn.MultiheadAttention` (4 đầu, `attn_mask` bool = `triu(ones, 1)`) + `Linear`; $V=14$, $L=16$, $D=32$; batch `randint` $4\times 16$ (dữ liệu **ngẫu nhiên**, chỉ để thử khả năng ghi nhớ); AdamW $\eta=3\times10^{-3}$, `clip_grad_norm_(…, 1.0)`.

```text
ln V = 2.639  start loss = 2.951
step   0  loss 2.9513  grad norm 1.12
step  50  loss 0.0691  grad norm 0.05
step 100  loss 0.0569  grad norm 0.01
step 150  loss 0.0561  grad norm 0.00
step 200  loss 0.0557  grad norm 0.00
all labels ignored: tensor(nan)
anomaly: Function 'SqrtBackward0' returned nan values in its 0th output.
```

- Thời gian: vài giây trên CPU khi máy rảnh (lần thử đầu rất nhanh; có lúc chậm hơn do máy đang chạy nhiều tiến trình; chưa đo chính xác).
- Loss **không về đúng 0**: 0,056 ở bước 200, và vẫn 0,056 khi đặt `weight_decay=0` (chạy riêng: 0,0557). Thử với $D=64$, batch $2\times16$, 300 bước cũng dừng ở khoảng 0,046. **Đã giải quyết:** ba trong bốn chuỗi cùng bắt đầu bằng token 4 rồi rẽ sang 3, 2, 5, nên ở vị trí đầu không mô hình nào phân biệt được; sàn là $3\ln 3/60 \approx 0{,}0549$ (đã kiểm loss từng vị trí, xem mục Kiểm chứng code). Bài giải thích sàn này và viết "gần 0", **không** viết "về 0".
- Loss khởi đầu 2,951 so với $\ln V=2{,}639$: cùng bậc nhưng cao hơn; đây là cơ hội nói "xấp xỉ" nghĩa là gì và vì sao thấy chênh 10% vẫn ổn, còn chênh gấp chục lần là lỗi.
- Phần `detect_anomaly` dùng `sqrt(0)` cố ý; bài nên giải thích đây là **lỗi cố ý** để thấy công cụ; không phải lỗi của mô hình.
- Vì `LocalCode` chỉ chấp nhận ≤ 60 dòng và 79 ký tự, đề xuất **tách hai file**: (1) overfit một batch + loss khởi đầu + clip; (2) NaN và `detect_anomaly`.

### Thí nghiệm learning rate (không đưa vào bài như code, chỉ lấy số)

Cùng mô hình, cùng batch, 60 bước, seed 0, in loss mỗi 12 bước (bước 0, 12, 24, 36, 48) và loss ở bước cuối. Chạy trên `.venv-llm`:

| Bộ tối ưu | Clip | Loss (bước 0, 12, 24, 36, 48) | Loss cuối |
|---|---|---|---|
| Adam $\eta=10^{-3}$ | không | 2,95; 2,57; 2,20; 1,81; 1,38 | 0,964 |
| Adam $\eta=10^{-3}$ | 1,0 | 2,95; 2,57; 2,19; 1,80; 1,37 | 0,948 |
| Adam $\eta=1$ | không | 2,95; 6 295,87; 8 183,12; 15 044,61; 12 050,03 | 18 591 |
| Adam $\eta=1$ | 1,0 | 2,95; 14 257,13; 11 279,58; 14 366,05; 10 982,50 | 20 603 |
| SGD $\eta=10$ | không | 2,95; `nan`; `nan`; `nan`; `nan` | `nan` |
| SGD $\eta=10$ | 1,0 | 2,95; 32,88; 24,63; 228,98; 77,34 | 29,3 |
| SGD $\eta=1000$ | không | 2,95; `nan`; … | `nan` |
| SGD $\eta=1000$ | 1,0 | 2,95; 2,7 tỷ; 3,0 tỷ; 3,4 tỷ; 1,8 tỷ | 3,1 tỷ |

- Đây là một mẫu seed duy nhất. Dùng để mô tả hình dạng ("lên hàng nghìn", "NaN"), không phải mốc cố định. Nếu bài cần số, nói rõ mô hình và seed.
- Ý: clip chặn **NaN** của SGD $\eta=10$ nhưng loss vẫn dao động lớn; learning rate quá lớn vẫn là lỗi.

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; chỗ có "(gợi ý)" là của `summarizer`.

- **Bác sĩ chẩn đoán theo tầng (gợi ý):** hỏi triệu chứng, rồi xét từng tầng (lập trình, huấn luyện, suy luận), mỗi tầng một phép kiểm rẻ, đừng đoán mò rồi sửa lung tung. Dùng làm mở bài; nối với ý "huấn luyện hỏng một cách im lặng" [K19].
- **Kiểm "nhìn trộm tương lai" như kiểm gian lận thi cử (gợi ý):** đổi đáp án ở câu sau rồi xem điểm câu trước có đổi không. Bài chấm công bằng thì điểm câu trước không phụ thuộc đáp án câu sau. Chính là phép đổi token tương lai ở trên.
- **Overfit một batch như thử xe tại chỗ (gợi ý):** trước khi chạy đường dài, nổ máy tại chỗ. Mô hình không ghi nhớ nổi hai ba câu thì còn hỏng chỗ nào đó trước cả chuyện dữ liệu hay cỡ mô hình.
- **Loss khởi đầu là "đồng hồ về 0" (gợi ý):** mô hình chưa học gì phải cho đúng mức "đoán bừa" $\ln V$. Lệch nhiều so với mốc đó là dấu hiệu sai ngay từ đầu, trước khi tốn một giây huấn luyện.
- **Đệm trái cho sinh theo lô (gợi ý, theo ví dụ của [GEN]):** cho người đọc thấy hai kết quả `'1, 2, 33333333333'` và `'1, 2, 3, 4, 5, 6,'` từ cùng mô hình, chỉ khác phía đệm. Nói rõ đây là ví dụ của tài liệu, mô hình Mistral-7B, bài không chạy lại.
- **Chuẩn gradient như đồng hồ áp suất (gợi ý):** theo dõi giá trị `clip_grad_norm_` trả về; nó nhảy vọt trước khi loss hóa NaN. (Quan sát chung, chưa có nguồn.) **Đã giải quyết:** đã tự đo (SGD `lr=10`, không cắt): chuẩn tăng vọt **cùng lúc** với loss, không báo trước (bước 1: loss 4,75, chuẩn 4,30; bước 2: 389 và 575; bước 3: $5{,}9\times10^{10}$ và $1{,}1\times10^{11}$). Bài viết "cùng lúc với loss, và vẫn đo được khi đã bật clip".

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Tưởng "không báo lỗi" là "đúng".** Huấn luyện thất bại im lặng [K19]; phải có phép kiểm chủ động.
2. **Loss giảm mượt là bằng chứng mô hình đúng.** Loss giảm nhanh bất thường có thể là rò rỉ tương lai (thiếu mặt nạ) hoặc không dịch nhãn.
3. **Dịch nhãn hai lần hoặc không dịch.** Phép kiểm: mô hình "chép đầu vào" không nên có loss thấp khi nhãn đã dịch đúng.
4. **Nhầm `True` của mặt nạ bool.** Với `nn.MultiheadAttention`, `True` là cấm nhìn (đã chạy ở `build-first-llm`). Float thì cộng vào điểm.
5. **Dùng toàn kích thước trùng nhau khi thử** (batch, độ dài, chiều đều 8) làm lỗi nhầm trục không lộ ra.
6. **Mask luôn EOS của đáp án** (không học dừng) và **thêm token đặc biệt hai lần** [CT].
7. **Đệm sai phía khi sinh theo lô** [GEN].
8. **Thêm `add_generation_prompt` khi huấn luyện, hoặc quên thêm khi suy luận** [CT].
9. **Batch toàn nhãn $-100$ cho `nan`.** Quan sát thực tế, [PT-CE] không nêu.
10. **Dùng `detect_anomaly` suốt quá trình huấn luyện** làm chương trình chậm [PT-AD]; chỉ bật khi tìm lỗi.
11. **Tưởng `clip_grad_norm_` trả về chuẩn sau khi cắt.** Nó trả chuẩn **trước** khi cắt [PT-CG].
12. **Tưởng clip thay được việc chọn learning rate.** Số chạy: clip không giúp học với $\eta$ quá lớn (bảng trên).
13. **Tưởng warmup lúc nào cũng cần.** [X20]: phụ thuộc vị trí chuẩn hóa lớp (Post-LN và Pre-LN).
14. **Overfit một batch về đúng 0.** Có thể chỉ gần 0 (số chạy: 0,056); mục đích là xem loss **xuống rất thấp**, không phải bằng 0.
15. **Rò rỉ dữ liệu test do lọc trùng không hết** [B20] (lỗi lọc chỉ xóa một phần), và do chia train/test sau khi xử lý.
16. **Cho rằng lặp từ nghĩa là mô hình hỏng.** Có thể chỉ do cách giải mã (greedy/beam) [H19]; thử đổi lấy mẫu trước.
17. **Quên `max_new_tokens`** nên đầu ra cụt (mặc định tối đa 20 token theo [GEN]).
18. **Xem loss huấn luyện mà bỏ loss kiểm tra** (nối `ml/overfitting-underfitting`).

## Điểm cần phiên chính chốt (câu hỏi cho người dùng)

1. **Có đưa ví dụ chạy `transformers`/tokenizer thật (chat template, padding side) không?** Cần thêm `transformers` vào `scripts/requirements-llm.txt` và tải tokenizer qua mạng. Đề xuất: **không**, chỉ trích ví dụ của tài liệu, ghi mức "đối chiếu", để bài không cần mạng.
2. **Ô `LocalCode` PyTorch:** tách hai file như đề xuất (mỗi file ≤ 60 dòng), hay một file rút gọn.
3. **Tên dữ liệu:** dùng chuỗi ngẫu nhiên (như thử nghiệm) hay một đoạn Kiều (hợp với `build-first-llm`, dễ liên hệ, nhưng loss khởi đầu và độ về 0 khác, **phải chạy lại**).

## Liên quan tới bài nào

- **Cần biết trước:** `llm/build-first-llm` (mô hình ngôn ngữ, cross-entropy và $\ln V$, mặt nạ nhân quả, GPT nhỏ trên 24 câu Kiều).
- **Trước:** `llm/gpt-family-finetuning` (dịch nhãn, nhãn $-100$, EOS, chat template, batch toàn $-100$ cho `nan`); `llm/text-api` (lấy mẫu `temperature`/top-$k$/top-$p$, `SamplingViz`); `ml/gradient-descent` (tốc độ học); `ml/overfitting-underfitting` (loss huấn luyện và kiểm tra); `ml/regularization` (weight decay của AdamW).
- **Sau:** `llm/evaluation-peft` (rò rỉ dữ liệu test khi đánh giá); `llm/rlhf`.
- Hẹn ngoài bài: tokenization (`nlp/tokenization`), Transformer (`dl/transformers`, vị trí chuẩn hóa lớp).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Cắt chuẩn gradient | Gradient clipping | Gloss lần đầu "cắt chuẩn gradient (gradient clipping)", sau đó dùng "gradient clipping" |
| Khởi động tốc độ học | Learning-rate warmup | Giữ "warmup", gloss một lần |
| Rò rỉ dữ liệu | Data leakage | Dịch |
| Nhiễm dữ liệu kiểm tra | Test-set contamination | Dịch "rò rỉ dữ liệu kiểm tra (test-set contamination)" |
| Đệm trái / đệm phải | Left / right padding | Dịch |
| Mẫu trò chuyện | Chat template | Đã đề xuất ở `gpt-family-finetuning` |
| Chỉ số bỏ qua | `ignore_index` | Đã đề xuất ở `gpt-family-finetuning` |
| Loss không hữu hạn | NaN / inf loss | Giữ "NaN", "inf" |
| Phát hiện bất thường (autograd) | Anomaly detection | Dịch, gắn tên hàm `detect_anomaly` |

## Đọc thêm đề xuất

1. **Karpathy (2019)**, [*A Recipe for Training Neural Networks*](https://karpathy.github.io/2019/04/25/recipe/). Đọc toàn bài; mở trang gốc đối chiếu trước khi dẫn.
2. **Tài liệu PyTorch 2.14**, [`detect_anomaly`](https://docs.pytorch.org/docs/2.14/autograd.html) và [`clip_grad_norm_`](https://docs.pytorch.org/docs/2.14/generated/torch.nn.utils.clip_grad_norm_.html). Link tới đúng phiên bản (`llm-lessons.md` 2.7).
3. **Tài liệu Hugging Face Transformers 5.20.2**: [Chat templates](https://huggingface.co/docs/transformers/chat_templating) và [Text generation](https://huggingface.co/docs/transformers/llm_tutorial) (mục "Padding side").
4. **Xiong và cộng sự (2020)**, [arXiv:2002.04745](https://arxiv.org/abs/2002.04745), ICML 2020: vì sao Transformer gốc cần warmup.
5. **Holtzman và cộng sự (2019)**, [arXiv:1904.09751](https://arxiv.org/abs/1904.09751), ICLR 2020: lặp và suy biến văn bản khi giải mã.
6. **Brown và cộng sự (2020)**, [arXiv:2005.14165](https://arxiv.org/abs/2005.14165): mục 4 về rò rỉ dữ liệu kiểm tra.

## Kiểm chứng code

Ghi bởi `lesson-writer` khi viết bài. Thư mục làm việc ở scratchpad, không `py_compile`. Cả hai cặp `.vi.py`/`.en.py` qua `ast.parse(..., feature_version=(3, 10))`, cùng cấu trúc sau khi bỏ comment và nội dung chuỗi; `shift-mask` 40 dòng, `overfit-batch` 60 dòng (thêm dòng comment "chuẩn trước khi cắt" / "norm before clipping" theo review), dòng dài nhất 76 ký tự.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `shift-mask.vi.py`, `shift-mask.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật (`runpyo.mjs`): Python 3.14.2, NumPy 2.4.6 | Chạy tức thì. `V = 14  L = 27  ln V = 2.639`; không dịch nhãn 0.0000; dịch đúng 20.0000; có mặt nạ chênh `0.00e+00`, không mặt nạ `1.04e-01`. Khớp lời văn. Reviewer chạy lại bằng Pyodide thật: cùng kết quả |
| `overfit-batch.vi.py`, `overfit-batch.en.py` | chạy thật | 2026-10-24 | `.venv-llm`: Python 3.14.5, torch 2.14.1+cpu, `torch.manual_seed(0)` | 9 đến 12 giây trên CPU. Ba chuỗi bắt đầu bằng token 4 (`[[4, 3], [4, 2], [11, 12], [4, 5]]`); loss 2.951 xuống 0.0691 (bước 50) và 0.0557 (bước 200), sàn lý thuyết $3\ln 3/60 \approx 0.0549$ (đã kiểm loss từng vị trí: ba vị trí đầu mỗi vị trí khoảng 1.10, còn lại khoảng 0.001); nhãn toàn $-100$ cho `tensor(nan)`; `detect_anomaly` báo `SqrtBackward0`, stderr có traceback trỏ dòng `(torch.sqrt(x) * 0).sum().backward()`. Kết quả mẫu trong bài lấy từ lần này (chỉ stdout). Reviewer chạy lại bằng torch: stdout trùng từng ký tự, loss từng vị trí khớp sàn. Sau khi thêm dòng comment "chuẩn trước khi cắt" / "norm before clipping" (60 dòng), chạy lại cả `.vi.py` và `.en.py` ngày 2026-10-24: stdout hai bản giống nhau và trùng từng ký tự với khối Kết quả mẫu |
| thử thêm trong bài: `overfit-batch` với SGD `lr=10` | chạy thật | 2026-10-24 | `.venv-llm`: Python 3.14.5, torch 2.14.1+cpu | Bỏ cắt (`max_norm=float("inf")`), in mọi bước: chuẩn 1.12, 4.30, 574.62, 111159238656.00; dừng `loss = nan at step 4`. Loss đi cùng chuẩn: bước 1 loss 4.746 (chuẩn 4.30), bước 2 loss 389.1 (574.6), bước 3 loss 5.857e+10 (1.112e+11), nên chuẩn tăng **cùng lúc** với loss, không báo trước. Giữ clip 1.0: loss bước 50/100/150/200 là 64.04, 52.18, 79.28, 36.66; mọi bước từ 50 tới 200 nằm trong 12.465 đến 206.087 (luôn trên mức ban đầu 2.95). Reviewer chạy lại thí nghiệm này: cùng số; lời văn trong bài lấy dải 12 đến hơn 200. Cùng file, AdamW `lr=1`: loss 5138.63 (bước 50), 2858.96 (bước 200), không dùng trong bài |
| ví dụ padding side và chat template của [GEN], [CT] | đối chiếu | 2026-10-24 | Transformers 5.20.2 (đọc tài liệu) | Không chạy (quyết định 61: không cài `transformers`); `'1, 2, 33333333333'` và `'1, 2, 3, 4, 5, 6,'` là của tài liệu, trên Mistral-7B-v0.1. Đã đọc lại trang Text generation bản 5.20.2 ngày 24/10/2026: `generate()` trả về tối đa 20 token theo mặc định, greedy mặc định, `repetition_penalty > 1.0`. Reviewer đối chiếu lại tài liệu HF cùng ngày: khớp |
