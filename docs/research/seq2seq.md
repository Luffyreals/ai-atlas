# Mô hình chuỗi sang chuỗi (Seq2Seq)

Bài: `llm/seq2seq` (chỉ bản vi, khoảng 11 phút đọc, đợt 7). Bài cần biết trước trong roadmap: `dl/lstm-bilstm`, `dl/transformers` (chưa xuất bản, nên "Nhắc nhanh" phải tự đứng được; chỉ link tới bài đã xuất bản). Hình: `EncoderDecoderFigure` (llm-lessons.md mục 2.9). Một ô `PythonRunner` (NumPy, beam search) và một ô `LocalCode` (PyTorch).

Ngày tra: **24/10/2026**. Cách tra: WebFetch trang arXiv, JMLR; tải PDF từ arXiv rồi trích chữ bằng `pdftotext`; chạy thật hai file code. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra.

## Nguồn

- **[S14]** Sutskever, I., Vinyals, O., Le, Q. V. (2014). [*Sequence to Sequence Learning with Neural Networks*](https://arxiv.org/abs/1409.3215). arXiv:1409.3215 (nộp 9/2014, v3 12/2014). Đã đọc cả phần mô hình, giải mã, kết quả.
- **[C14]** Cho, K., van Merriënboer, B., Gulcehre, C., Bahdanau, D., Bougares, F., Schwenk, H., Bengio, Y. (2014). [*Learning Phrase Representations using RNN Encoder-Decoder for Statistical Machine Translation*](https://arxiv.org/abs/1406.1078). EMNLP 2014 (theo trang arXiv). Mới đọc trang tóm tắt.
- **[B15]** Bahdanau, D., Cho, K., Bengio, Y. (2015). [*Neural Machine Translation by Jointly Learning to Align and Translate*](https://arxiv.org/abs/1409.0473). ICLR 2015 (trình bày miệng, theo trang arXiv); arXiv nộp 9/2014. Đã đọc mục mô hình (phương trình 4–6), kết quả theo độ dài câu, mục giải mã.
- **[V17]** Vaswani, A. và cộng sự (2017). [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762). 31st NIPS 2017, Long Beach (dòng đầu PDF ghi rõ; **giải quyết mục "Chưa xác minh" của `build-first-llm.md`**). Đã đọc mục 3.1, 3.2.3, 6.1.
- **[W16]** Wu, Y. và cộng sự (2016). [*Google's Neural Machine Translation System: Bridging the Gap between Human and Machine Translation*](https://arxiv.org/abs/1609.08144). arXiv:1609.08144. Đã đọc mục beam search (phương trình 14).
- **[R20]** Raffel, C., Shazeer, N., Roberts, A., Lee, K., Narang, S., Matena, M., Zhou, Y., Li, W., Liu, P. J. (2020). [*Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer*](https://jmlr.org/papers/v21/20-074.html). *JMLR* 21(140): 1-67. Đã đọc mục 2.4, 3.1, 3.2.
- **[RZ15]** Ranzato, M., Chopra, S., Auli, M., Zaremba, W. (2016). [*Sequence Level Training with Recurrent Neural Networks*](https://arxiv.org/abs/1511.06732). ICLR 2016 (PDF ghi "Published as a conference paper at ICLR 2016"; arXiv nộp 11/2015). Đã đọc phần mở đầu: nguồn của thuật ngữ **exposure bias**.
- **[BV15]** Bengio, S., Vinyals, O., Jaitly, N., Shazeer, N. (2015). [*Scheduled Sampling for Sequence Prediction with Recurrent Neural Networks*](https://arxiv.org/abs/1506.03099). arXiv:1506.03099. Chỉ đọc trang tóm tắt; dùng cho một câu.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Hội nghị của [S14] | Trang arXiv không nêu. Thường dẫn là NIPS 2014. | Ghi "arXiv:1409.3215, 2014". |
| Hội nghị của [BV15] | Trang arXiv không nêu. | Ghi "arXiv, 2015". |
| Nguồn gốc teacher forcing | [R20] dẫn Williams và Zipser (1989), *Neural Computation* (thư mục lấy từ danh mục tham khảo của [R20]); **chưa đọc bài gốc**. | Bài chỉ cần giải thích khái niệm; nếu dẫn thì ghi "theo [R20]". |
| "GRU" trong [C14] | Trang tóm tắt không nhắc. Bài chưa đọc nội dung. | Không nói [C14] giới thiệu GRU trừ khi đọc lại bài. |
| Số BLEU Transformer EN-FR | [V17] tự mâu thuẫn: tóm tắt và bảng ghi 41,8, đoạn văn mục 6.1 ghi 41,0. | Chỉ dùng số EN-DE (28,4), hoặc không ghi số BLEU. |
| Số tham số, độ sâu của T5 (ngoài mô hình cơ sở) | Chỉ đọc cấu hình cơ sở: 12 lớp mỗi bên, $d_{\text{model}}=768$, khoảng 220 triệu tham số. | Chỉ ghi cấu hình cơ sở nếu cần. |

## Ý chính

- **Bài toán:** ánh xạ một chuỗi vào sang chuỗi ra có độ dài khác và không cần thẳng hàng từng vị trí: dịch máy, tóm tắt, hỏi đáp sinh. Mạng truyền thẳng thông thường cần đầu vào và đầu ra cỡ cố định nên không dùng được [S14]. Mô hình hóa: $p(y_1,\dots,y_{L_y}\mid\mathbf{x})=\prod_i p(y_i\mid y_{<i},\mathbf{x})$. Đây là mô hình ngôn ngữ có **điều kiện** theo chuỗi nguồn, nối thẳng với `build-first-llm`.
- **Encoder-decoder bằng RNN [S14][C14]:** một mạng (LSTM trong [S14]) đọc cả câu nguồn, nén thành **một vectơ cỡ cố định**; mạng thứ hai sinh câu đích từng token từ vectơ đó, dừng khi sinh token kết thúc `<EOS>`. Hai mạng huấn luyện chung, cực đại hóa xác suất câu đích cho trước câu nguồn. [S14]: LSTM 4 lớp, 1000 ô mỗi lớp; BLEU 34,8 trên WMT'14 Anh-Pháp, hệ thống dịch dựa trên cụm từ đối chứng đạt 33,3.
- **Mẹo đảo câu nguồn [S14]:** đảo thứ tự từ ở câu nguồn (không đảo câu đích) làm perplexity kiểm tra giảm từ 5,8 xuống 4,7 và BLEU tăng từ 25,9 lên 30,6. Tác giả cho rằng đảo tạo nhiều phụ thuộc ngắn giữa nguồn và đích, giúp tối ưu dễ hơn, và thừa nhận chưa giải thích đầy đủ. Có thể kể như giai thoại về độ khó của việc nhớ chuỗi dài qua một vectơ.
- **Nút thắt vectơ cố định [B15]:** nhóm tác giả đặt giả thuyết rằng ép cả câu vào một vectơ là điểm nghẽn, và đo được mô hình encoder-decoder cơ bản tụt mạnh khi câu dài, còn mô hình có attention gần như không tụt. Đây là cách tách "giả thuyết" khỏi "bằng chứng" cho bài.
- **Attention của Bahdanau [B15]:** encoder hai chiều cho mỗi từ nguồn một "chú thích" (annotation) $\mathbf{h}_j$. Mỗi bước sinh, decoder tính điểm khớp giữa trạng thái hiện tại và từng $\mathbf{h}_j$, softmax thành trọng số, rồi lấy tổng có trọng số làm ngữ cảnh riêng cho bước đó. Nói bằng lời: "mỗi từ đích tự chọn nhìn vào phần nào của câu nguồn", không còn một vectơ dùng chung. Bản đồ trọng số cho thấy sự thẳng hàng từ nguồn sang đích rất giống trực giác của người dịch. Chỉ cần ở mức trực giác, kèm ba công thức.
- **Transformer encoder-decoder [V17]:** 6 lớp encoder và 6 lớp decoder. Lớp encoder: self-attention nhiều đầu rồi mạng truyền thẳng theo vị trí, mỗi cái có kết nối tắt và chuẩn hóa lớp. Lớp decoder có **ba** khối con: self-attention có mặt nạ (không nhìn vị trí sau, cộng với việc dịch chuỗi đầu ra một vị trí sang phải để dự đoán vị trí $i$ chỉ dùng token trước $i$), **cross-attention** (truy vấn từ lớp decoder trước, khóa và giá trị từ đầu ra encoder, nên mọi vị trí decoder nhìn được mọi vị trí câu nguồn), rồi mạng truyền thẳng. Cấu hình cơ sở: $d_{\text{model}}=512$, 8 đầu, $d_{\text{ff}}=2048$ (đọc trong [V17] mục 3.2.2 và 3.3, từ bản PDF). Bài chỉ cần cái tên các khối và nguồn của $\mathbf{Q},\mathbf{K},\mathbf{V}$.
- **Cross-attention là phiên bản Transformer của attention Bahdanau:** [V17] viết rõ nó "mimics" cơ chế encoder-decoder attention của các mô hình seq2seq trước [S14][B15]. Khác biệt chính: thay RNN tuần tự bằng tính song song trên cả chuỗi (cả khi huấn luyện), và attention nhiều đầu.
- **Teacher forcing:** khi huấn luyện, đầu vào của decoder là chuỗi đích **thật** dịch sang phải (bắt đầu bằng `<BOS>`), không phải token mô hình tự sinh. Nhờ mặt nạ, một lượt chạy tính được mọi vị trí song song. [R20] mục 2.4 gọi đúng cách này khi huấn luyện bằng cực đại hóa likelihood (dẫn Williams và Zipser 1989).
- **Exposure bias [RZ15]:** lúc huấn luyện mô hình chỉ thấy phân phối dữ liệu thật; lúc sinh nó phải ăn token do chính nó dự đoán, nên một lỗi nhỏ có thể làm lệch các bước sau ("errors accumulate"). [BV15] đề xuất scheduled sampling: dần dần thay token thật bằng token mô hình tự sinh khi huấn luyện. Chỉ cần nhắc tên và hướng xử lý, không dạy chi tiết.
- **T5 text-to-text [R20]:** mọi tác vụ (dịch, tóm tắt, phân loại) đều thành "văn bản vào, văn bản ra"; chỉ khác **tiền tố tác vụ** gắn đầu đầu vào. Ví dụ trong paper: đầu vào dạng "translate English to German: That is good." cho đầu ra "Das ist gut." Mô hình dùng encoder-decoder Transformer chuẩn của [V17], huấn luyện bằng cực đại hóa likelihood, và [R20] mục 3.2 cho thấy, với mục tiêu khử nhiễu (denoising), bản tốt nhất là **encoder-decoder thường (không chia sẻ tham số)**: điểm cao nhất trên mọi tác vụ, hơn các biến thể decoder-only cùng chi phí tính toán (dù có gấp đôi số tham số).
- **Beam search:** thay vì chọn token xác suất cao nhất mỗi bước (tham lam, greedy), giữ $B$ giả thuyết một phần tốt nhất, mở rộng mỗi cái bằng mọi token rồi cắt về $B$ cái điểm cao nhất (log-xác suất). Giả thuyết gặp `<EOS>` được tách ra khỏi chùm [S14][B15]. Chỉ là xấp xỉ: không đảm bảo ra chuỗi xác suất cao nhất toàn cục. [S14]: ngay $B=1$ đã khá tốt, $B=2$ lấy phần lớn lợi ích; [V17] dùng $B=4$ và $\alpha=0{,}6$; [W16] thường giữ 8-12 giả thuyết (câu về 4 hoặc 2 giả thuyết bị cắt trong bản trích, chưa đọc đủ).
- **Length penalty [W16]:** cộng log-xác suất tiêu thụ thêm một số âm mỗi token, nên beam search thô thiên về câu ngắn. Cách xử lý: chia điểm cho một hàm của độ dài.
- **So với decoder-only:** [R20] mục 3.2 mô tả encoder dùng mặt nạ "fully-visible" (mỗi vị trí nhìn cả đầu vào), decoder dùng mặt nạ nhân quả. Decoder-only (GPT, họ LLaMA) bỏ encoder và cross-attention: đầu vào và đầu ra nằm chung một chuỗi, tất cả đều nhân quả. Prefix LM là trung gian: phần tiền tố nhìn đầy đủ, phần còn lại nhân quả. Hôm nay phần lớn LLM đối thoại là decoder-only (kiến thức chung; không ghi "phổ biến nhất" trong bài, theo llm-lessons.md mục 2.6); bài chỉ nói seq2seq vẫn là cách tự nhiên cho dịch và tóm tắt, và T5 là ví dụ hiện đại.

## Công thức quan trọng

Ký hiệu: chuỗi nguồn $\mathbf{x}=(x_1,\dots,x_{L_x})$, đích $\mathbf{y}=(y_1,\dots,y_{L_y})$ (độ dài dùng $L$, quyết định 60), tham số $\boldsymbol{\theta}$, mất mát $\mathcal{L}$, nhiệt độ $T$ (không dùng $T$ cho độ dài).

**Mô hình có điều kiện** ([S14] mô tả dạng này):

$$p(\mathbf{y}\mid\mathbf{x})=\prod_{i=1}^{L_y}p\big(y_i\mid y_1,\dots,y_{i-1},\mathbf{x}\big)$$

**Huấn luyện bằng teacher forcing** (cross-entropy trên mọi vị trí, với token trước **lấy từ đáp án thật**):

$$\mathcal{L}(\boldsymbol{\theta})=-\sum_{i=1}^{L_y}\ln p_{\boldsymbol{\theta}}\big(y_i\mid y_1,\dots,y_{i-1},\mathbf{x}\big)$$

Khi sinh, các $y_{<i}$ ở vế phải là **token mô hình tự chọn**: đó là chỗ lệch gọi là exposure bias.

**Attention của Bahdanau** (viết lại từ [B15] phương trình 5–6 và định nghĩa $e_{ij}$; $\mathbf{s}_{i-1}$ trạng thái decoder, $\mathbf{h}_j$ chú thích của từ nguồn $j$, $a$ là mạng nhỏ học cùng mô hình):

$$e_{ij}=a(\mathbf{s}_{i-1},\mathbf{h}_j),\qquad \alpha_{ij}=\frac{\exp(e_{ij})}{\sum_{k=1}^{L_x}\exp(e_{ik})},\qquad \mathbf{c}_i=\sum_{j=1}^{L_x}\alpha_{ij}\mathbf{h}_j$$

Giải thích: $e_{ij}$ đo "từ đích $i$ nên chú ý từ nguồn $j$ bao nhiêu"; softmax làm các trọng số dương và cộng lại bằng 1; $\mathbf{c}_i$ là bản "trung bình có trọng số" của câu nguồn dành riêng cho bước $i$. [B15] gọi đó là kỳ vọng của chú thích dưới phân phối căn chỉnh $\alpha_{ij}$.

**Cross-attention** (công thức attention của [V17]; khác self-attention ở **nguồn** của ba ma trận; $\mathbf{H}_{\text{enc}}\in\mathbb{R}^{L_x\times d}$ là đầu ra encoder, $\mathbf{S}\in\mathbb{R}^{L_y\times d}$ là trạng thái decoder):

$$\mathbf{Q}=\mathbf{S}\mathbf{W}^{Q},\quad \mathbf{K}=\mathbf{H}_{\text{enc}}\mathbf{W}^{K},\quad \mathbf{V}=\mathbf{H}_{\text{enc}}\mathbf{W}^{V},\qquad \mathrm{Attn}=\mathrm{softmax}\!\left(\frac{\mathbf{Q}\mathbf{K}^{\top}}{\sqrt{d}}\right)\mathbf{V}$$

- Ma trận điểm có kích thước $L_y\times L_x$: mỗi hàng là một vị trí đích, mỗi cột một vị trí nguồn. **Không có mặt nạ nhân quả** ở đây vì cả câu nguồn đã biết trước; chỉ self-attention của decoder mới có mặt nạ (mặt nạ $\mathbf{M}$ đã dạy ở `build-first-llm`, có thể link).
- Lưu ý: đây là một đầu; [V17] dùng nhiều đầu, chiếu về $d_k=d_{\text{model}}/h$.

**Điểm số beam search** (log-xác suất của giả thuyết $\mathbf{y}$):

$$\mathrm{score}(\mathbf{y})=\sum_{i=1}^{L_y}\ln p(y_i\mid y_{<i},\mathbf{x})$$

**Chuẩn hóa theo độ dài** (dạng của [W16] phương trình 14, bỏ phần coverage penalty; $|\mathbf{y}|$ là số token, tính cả `<EOS>` trong code bên dưới):

$$s(\mathbf{y},\mathbf{x})=\frac{\ln p(\mathbf{y}\mid\mathbf{x})}{\mathrm{lp}(\mathbf{y})},\qquad \mathrm{lp}(\mathbf{y})=\frac{(5+|\mathbf{y}|)^{\alpha}}{(5+1)^{\alpha}}$$

- $\alpha=0$: $\mathrm{lp}=1$, quay về beam search thô. $\alpha$ tăng thì phạt câu ngắn mạnh hơn. Khoảng $\alpha\in[0{,}6;\,0{,}7]$ mà [W16] nhắc thuộc **cách chuẩn hóa trước đó** (chia cho $|Y|^{\alpha}$), không phải công thức cuối; với công thức cuối (phương trình 14, có coverage penalty), [W16] dùng $\alpha=0{,}2$ và $\beta=0{,}2$. $\alpha$ phải **chỉnh trên tập kiểm định**, không có giá trị "đúng" chung. [V17] chọn 0,6.
- Cần giải thích vì sao: mỗi token cộng thêm một số $\le 0$ vào tổng log-xác suất, nên câu càng dài tổng càng âm, nên beam search thô luôn lợi cho câu ngắn.
- Phần coverage penalty của [W16] dùng trọng số attention; bài chỉ nhắc tên, không dạy.

## Số tự chạy (ngày 24/10/2026)

### Beam search NumPy, trên Pyodide thật

Chạy bằng `runpyo.mjs` (Pyodide 314.0.7 trong Node, NumPy tải từ CDN). File `beam.py` nằm ở scratchpad, 41 dòng, dòng dài nhất ≤ 79 ký tự. **Không nằm trong repo**: `lesson-writer` viết lại vào `src/code/llm/seq2seq/`, và chạy lại. Bảng xác suất giả lập, **tự đặt, không phải số của mô hình thật**:

| Trạng thái trước | Phân phối token kế tiếp |
|---|---|
| `<s>` | the 0,5; a 0,4; `<eos>` 0,1 |
| the | cat 0,34; dog 0,33; bird 0,33 |
| a | bird 0,9; cat 0,1 |
| cat, dog, flies | `<eos>` 1,0 |
| bird | `<eos>` 0,52; flies 0,48 |

**Bản nháp đã thay, giữ lại để tham khảo.** Bảng và phần "Đọc" dưới đây là của bản nháp tiếng Anh với `alpha=1`. Code trong repo (`src/code/llm/seq2seq/beam.vi.py`) dùng token tiếng Việt và $\alpha=0{,}6$; số hiện hành: `s` của "đàn chim" là $-1{,}410$ (tự tính), của "đàn chim bay" là $-1{,}376$ (xem mục Kiểm chứng code).

Kết quả bản nháp (tên tham số: `width` là $B$, `alpha` là $\alpha$ trong $\mathrm{lp}$):

| Cấu hình | Câu ra | Xác suất cả câu |
|---|---|---|
| `width=1` (greedy), $\alpha=0$ | the cat | 0,170 |
| `width=2`, $\alpha=0$ | a bird | 0,187 |
| `width=2`, $\alpha=1$ | a bird flies | 0,173 |

Đọc: greedy chọn "the" (0,5 > 0,4) rồi dính vào nhánh phẳng, tích 0,17; beam giữ cả "a" nên tìm ra câu xác suất cao hơn (0,187). Dòng thứ ba: chuẩn hóa theo độ dài đổi người thắng từ câu ngắn sang câu dài **dù xác suất thô thấp hơn** (0,173 < 0,187). Đúng với tính toán tay: $\ln 0{,}187/(8/6)\approx-1{,}256$ và $\ln 0{,}173/(9/6)\approx-1{,}171$. Cần nói rõ đây là bảng giả để thấy cơ chế, không phải dịch thật. Ba ô code in ra, mỗi dòng một cấu hình. Biến thể `alpha=1` chọn để minh họa; $\alpha$ của paper khác (0,6 [V17]).

Lưu ý code: vòng beam search bỏ giả thuyết kết thúc ra `done` rồi chọn theo điểm đã chuẩn hóa, như [S14]; cách này không đảm bảo tối ưu theo điểm đã chuẩn hóa vì việc cắt chùm dùng log-xác suất thô. Nên viết một câu thừa nhận.

### Encoder-decoder Transformer nhỏ bằng PyTorch (`.venv-llm`, Python 3.14.5, torch 2.14.1+cpu)

File `tiny_s2s.py` ở scratchpad (52 dòng; **hai dòng dài hơn 79 ký tự** cần gấp lại: dòng `self.tf = nn.Transformer(...)` và dòng `loss = ...cross_entropy(...)`). Tác vụ: **đảo chuỗi 6 chữ số** (ký hiệu id 2..11, `<BOS>`=0, `<EOS>`=1, từ vựng 12), dữ liệu sinh ngẫu nhiên mỗi bước. Cấu hình: `nn.Transformer(d_model=64, nhead=4, 2 lớp encoder, 2 lớp decoder, dim_feedforward=128, dropout=0, batch_first=True)`, nhúng token và nhúng vị trí học được, mặt nạ nhân quả bằng `generate_square_subsequent_mask`, AdamW, tốc độ học $3\times10^{-3}$, batch 64, 301 bước, `torch.manual_seed(0)`. Teacher forcing: đầu vào decoder là `[BOS] + đáp án`, nhãn là `đáp án + [EOS]`.

| Bước | Loss huấn luyện |
|---|---|
| 0 | 2,608 |
| 100 | 0,003 |
| 200 | 0,001 |
| 300 | 0,001 |

Sau huấn luyện, trên 500 chuỗi mới: **khớp hoàn toàn khi teacher forcing 1,000; khi sinh tham lam tự hồi quy 1,000**. Thí dụ: nguồn `[11, 9, 11, 8, 2, 11]` ra `[11, 2, 8, 11, 9, 11]`. Thời gian: **46,7 giây** cho cả file trên máy phát triển (tính cả khởi động Python và nạp torch); đúng ngân sách "vài phút".

**Thí nghiệm bỏ mặt nạ (chạy riêng, không phải file của bài):** đổi `CAUSAL = False` (tương đương `tgt_mask=None`, `tgt_is_causal=False`), giữ mọi thứ khác, 301 bước. Kết quả: loss huấn luyện vẫn về 0,001, **khớp khi teacher forcing 1,000, nhưng khi sinh tham lam chỉ còn khoảng 0,02** (0,020 và 0,022 ở hai lần chạy, lệch theo số luồng CPU); đầu ra mẫu sinh `<EOS>` ngay token đầu. Số 0,032 của bản nháp 201 bước không dùng nữa. Đây là minh họa thật cho hai điều: (1) mặt nạ là thứ ngăn decoder "chép đáp án" ở token kế tiếp; (2) loss huấn luyện thấp không đủ, phải đo bằng cách **sinh tự do**. Rất hợp mục "Lỗi hay gặp"; có thể cho thành một câu hỏi `Quiz`.

- Tác vụ đảo chuỗi quá dễ để thấy exposure bias (greedy 1,000 bằng teacher forcing): **không dùng để khẳng định exposure bias xảy ra**. Bài chỉ nói hiện tượng này có trong paper [RZ15] và xuất hiện rõ ở chuỗi dài, dữ liệu khó. Thí nghiệm bỏ mặt nạ là ví dụ gần nhất mà ta đã kiểm chứng về việc khoảng cách giữa "đo bằng teacher forcing" và "đo bằng sinh tự do".
- Cảnh báo cho `lesson-writer`: `generate_square_subsequent_mask` trả mặt nạ kiểu float có $-\infty$ (cộng thẳng vào điểm); nếu tự dựng mặt nạ bool thì `True` nghĩa là cấm nhìn (chưa chạy riêng với `nn.Transformer`; xem "Điểm dễ hiểu nhầm" số 7 của `build-first-llm.md`, đã chạy với `nn.MultiheadAttention`). Không có cảnh báo (warning) nào khi chạy với `tgt_is_causal=True`.

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; chỗ có "(gợi ý)" là của `summarizer`.

- **Phiên dịch viên và tờ ghi chú (gợi ý):** RNN seq2seq cũ như người dịch nghe cả câu rồi chỉ được viết **một** mẩu giấy nhỏ, sau đó quay mặt đi và dịch từ mẩu giấy. Câu càng dài càng khó nhét hết vào mẩu. Attention cho phép người đó **giữ nguyên bản gốc trên bàn** và liếc lại đúng chỗ khi dịch từng từ. Cross-attention là cùng cách, trên Transformer.
- **Bản đồ căn chỉnh [B15]:** bản đồ nhiệt trọng số $\alpha_{ij}$ gần như là một đường chéo, trừ chỗ hai ngôn ngữ đảo trật tự (tính từ và danh từ Anh-Pháp). Có thể dựng lại bằng một bảng nhỏ ở bài (không chép hình paper). Ở nội dung: mỗi hàng của $\alpha$ cộng lại bằng 1.
- **Ba nguồn của $\mathbf{Q},\mathbf{K},\mathbf{V}$ (gợi ý, nội dung của `EncoderDecoderFigure`):** encoder self-attention: cả ba từ câu nguồn. Decoder self-attention: cả ba từ câu đích đã sinh, có mặt nạ. Cross-attention: $\mathbf{Q}$ từ câu đích, $\mathbf{K},\mathbf{V}$ từ câu nguồn. Bảng 3 hàng 3 cột, nối hình với [V17] mục 3.2.3.
- **Greedy mắc kẹt ở bước đầu (gợi ý, từ số tự chạy):** vì "the" có xác suất cao hơn "a" một chút, greedy đi nhánh phẳng. Ví dụ trên bảng giả; có thể hỏi người đọc tự tính hai tích trước khi chạy code.
- **Vì sao câu ngắn "thắng" (gợi ý):** mỗi token thêm một xác suất $\le 1$, nên tích càng nhiều thừa số càng nhỏ. Giống bài thi nhiều câu: có thể đúng mỗi câu 90% mà vẫn trượt cả bài nếu bài dài.
- **T5 như một giao diện (gợi ý):** thay vì viết một đầu ra riêng cho từng tác vụ, chỉ đổi dòng đầu vào; "tiền tố tác vụ" là cách nói với mô hình việc cần làm. Nối với `prompt-engineering`: đây là tiền thân của prompt chỉ dẫn.
- **Mặt nạ tắt cho thấy "loss thấp mà vô dụng" (từ số tự chạy):** đã nêu ở trên; nên đặt cạnh mục "Lỗi hay gặp" số 1.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Nhầm self-attention với cross-attention.** Khác ở nguồn: self-attention cả ba từ cùng một chuỗi; cross-attention truy vấn từ decoder, khóa và giá trị từ encoder [V17 mục 3.2.3].
2. **Tưởng cross-attention cũng cần mặt nạ nhân quả.** Không: câu nguồn đã biết hết. Chỉ self-attention của decoder có mặt nạ.
3. **Quên dịch chuỗi đích sang phải (shift right) khi teacher forcing.** Nếu đầu vào và nhãn trùng nhau thì mô hình học sao chép; cần `<BOS>` ở đầu vào và `<EOS>` ở cuối nhãn.
4. **Bỏ mặt nạ của decoder và tin loss huấn luyện.** Đã đo: loss 0,001, teacher forcing 1,000, nhưng sinh tự do chỉ khoảng 0,02.
5. **Tưởng teacher forcing là lỗi.** Nó nhanh, song song và ổn định; vấn đề là sự lệch với lúc sinh (exposure bias), không phải bản thân phương pháp [RZ15][R20].
6. **Tưởng exposure bias luôn nặng.** Thí nghiệm đảo chuỗi nhỏ không thấy nó (1,000 và 1,000). Đây là một mối lo thực, không phải quy luật.
7. **Nghĩ beam search luôn tốt hơn greedy, hoặc luôn tìm ra tối ưu.** Chỉ là xấp xỉ [B15]; beam rộng còn có thể ra câu ngắn, chung chung (nên chuẩn hóa độ dài). Với tác vụ mở như trò chuyện, lấy mẫu (`SamplingViz`) thường dùng hơn; **đây là điều suy ra, bài không nên khẳng định cứng**.
8. **Quên chuẩn hóa độ dài.** Beam search thô chuộng câu ngắn: ví dụ giả ở trên.
9. **Nghĩ $\alpha$ có giá trị chuẩn.** Phải chỉnh trên tập kiểm định; 0,6 là số của [V17] cho một tác vụ dịch cụ thể.
10. **Nhầm "Seq2Seq" với "RNN".** Seq2Seq là cách ghép (bài toán và khung encoder-decoder); bên trong có thể là RNN [S14], RNN có attention [B15] hoặc Transformer [V17][R20].
11. **Nghĩ vectơ nút thắt biến mất khi có attention.** Encoder vẫn tạo mọi $\mathbf{h}_j$; điều đổi là decoder không bị buộc chỉ dùng một vectơ.
12. **Nhầm decoder-only với "không có attention".** GPT vẫn có self-attention; chỉ bỏ encoder và cross-attention (nối `build-first-llm`, lỗi số 11).
13. **Ký hiệu $T$:** độ dài dùng $L_x$, $L_y$; $T$ chỉ là nhiệt độ (quyết định 60). Paper [B15] dùng $T_x$ cho độ dài; **đổi ký hiệu khi viết lại công thức**.

## Điểm cần phiên chính chốt

Không chặn việc; để tự chọn mặc định:

1. **Cách đo "độ dài" trong lp:** đề xuất tính cả `<EOS>` (như code đã chạy). [W16] không nói rõ trong đoạn đã đọc. Ghi rõ trong bài.
2. **Có đưa thí nghiệm bỏ mặt nạ vào bài không** (đề xuất: có, trong "Lỗi hay gặp" hoặc dưới ô PyTorch bằng một đoạn văn, vì số đo thật; không thêm file thứ hai). Nếu chỉ một file, bài chỉ trích số và nói rõ cách tái tạo (đổi hai tham số).
3. **Bảng xác suất giả:** giữ như trên hay dùng một ví dụ dịch Anh–Việt giả lập (tên token tiếng Việt). Đề xuất: giữ tiếng Anh, vì code in ra chữ ASCII ngắn (llm-lessons.md mục 2.4).

## Liên quan tới bài nào

- **Cần biết trước:** `dl/lstm-bilstm` (RNN, LSTM, encoder hai chiều), `dl/transformers` (self-attention, khối Transformer). Cả hai chưa xuất bản; "Nhắc nhanh" phải tự đứng được (2–3 câu theo mục 2.7, vì `seq2seq` không nằm trong ba bài được nới).
- **Trước:** `llm/build-first-llm` (mô hình ngôn ngữ, mặt nạ nhân quả, decoder-only; cross-entropy; tên công thức attention); `llm/text-api` (lấy mẫu và `SamplingViz`, để so với beam search).
- **Liên quan:** `llm/llama-family`, `llm/gpt-family-finetuning` (decoder-only); `llm/prompt-engineering` (tiền tố tác vụ của T5 là tiền thân của prompt chỉ dẫn); `llm/multimodal` (cũng có ý tưởng "nhìn lại" đầu vào qua attention).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Mô hình chuỗi sang chuỗi | Sequence-to-sequence (Seq2Seq) | Dịch, gloss lần đầu |
| Bộ mã hóa, bộ giải mã | Encoder, decoder | Giữ "encoder", "decoder" |
| Nút thắt vectơ cố định | Fixed-length vector bottleneck | Dịch |
| Cross-attention (attention chéo) | Cross-attention (encoder-decoder attention) | Giữ "cross-attention" |
| Ép buộc bằng đáp án (teacher forcing) | Teacher forcing | Giữ "teacher forcing" |
| Độ lệch phơi nhiễm (exposure bias) | Exposure bias | Giữ "exposure bias" |
| Beam search (tìm kiếm chùm) | Beam search | Giữ "beam search" |
| Phạt độ dài | Length penalty | Dịch |
| Tham lam | Greedy (decoding) | Dịch, "greedy" |
| Tiền tố tác vụ | Task prefix | Dịch |

## Đọc thêm đề xuất

1. **Sutskever và cộng sự (2014)**, [arXiv:1409.3215](https://arxiv.org/abs/1409.3215): bài gốc của khung seq2seq bằng LSTM.
2. **Bahdanau, Cho, Bengio (2015)**, [arXiv:1409.0473](https://arxiv.org/abs/1409.0473): attention đầu tiên, có bản đồ căn chỉnh.
3. **Vaswani và cộng sự (2017)**, [arXiv:1706.03762](https://arxiv.org/abs/1706.03762): Transformer encoder-decoder.
4. **Raffel và cộng sự (2020)**, [JMLR 21(140)](https://jmlr.org/papers/v21/20-074.html): T5.
5. **Wu và cộng sự (2016)**, [arXiv:1609.08144](https://arxiv.org/abs/1609.08144): beam search có chuẩn hóa độ dài (mục 7).

## Kiểm chứng code

Do `lesson-writer` chạy ngày 24/10/2026, thư mục làm việc ở scratchpad. Cả bốn file qua `ast.parse(..., feature_version=(3, 10))`; mỗi cặp `.vi.py`/`.en.py` cùng số dòng và giống nhau sau khi bỏ comment và nội dung chuỗi.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `beam.vi.py`, `beam.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2, NumPy 2.4.6) | 39 dòng, dòng dài nhất 79 ký tự. Ba dòng: `B=1 alpha=0.0: 'con mèo' p=0.170 s=-1.772`; `B=2 alpha=0.0: 'đàn chim' p=0.187 s=-1.676`; `B=2 alpha=0.6: 'đàn chim bay' p=0.173 s=-1.376` (bản en: the cat / a bird / a bird flies, cùng số). Khớp lời văn |
| `tiny-transformer.vi.py`, `tiny-transformer.en.py` | chạy thật | 2026-10-24 | `.venv-llm`: Python 3.14.5, torch 2.14.1+cpu | 60 dòng, dòng dài nhất 77 ký tự. Chạy bản vi hai lần, bản en ba lần, output giống hệt: loss 2.608 / 0.003 / 0.001 / 0.001 (bước 0/100/200/300); khớp hoàn toàn teacher forcing 1.000, greedy 1.000; `src: 9 7 9 6 0 9`, `out: 9 0 6 9 7 9 <EOS>`. Thời gian 25 s và 39 s; hai lần 5 phút 40 giây và 5 phút 2 giây khi máy đang chạy nhiều tiến trình song song; 19 s với `OMP_NUM_THREADS=1` (output như nhau). Kết quả mẫu trong bài lấy từ lần này |
| thí nghiệm `CAUSAL = False` (bản sao trong scratchpad) | chạy thật | 2026-10-24 | như trên, 301 bước | Lần của `lesson-writer`: loss 2.621 / 0.002 / 0.001 / 0.001; teacher forcing 1.000, greedy 0.020; `out: <EOS> 0 6 9 7 9 <EOS>`, 43 s. Lần chạy lại của `content-reviewer`: greedy 0.022 (teacher forcing vẫn 1.000). Số lệch theo số luồng CPU, nên hộp Lỗi hay gặp đầu tiên và câu quiz 2 ghi "khoảng 0.02". Không phải file của bài |
| số liệu Wu và cộng sự (2016), mục 7 | đối chiếu | 2026-10-24 | PDF arXiv:1609.08144, do `content-reviewer` đọc | Công thức cuối (phương trình 14) dùng $\alpha = 0.2$, $\beta = 0.2$; khoảng $\alpha \in [0.6; 0.7]$ thuộc cách chia cho $\lvert Y \rvert^{\alpha}$ trước đó. Khớp câu "Wu và cộng sự dùng $\alpha = 0.2$ cùng coverage penalty" trong bài |
| số liệu Raffel và cộng sự (2020), mục 3.2 | đối chiếu | 2026-10-24 | JMLR 21(140), do `content-reviewer` đọc | Với mục tiêu khử nhiễu, encoder–decoder thường (không chia sẻ tham số) tốt nhất trên mọi tác vụ, hơn decoder-only cùng chi phí tính toán dù có gấp đôi số tham số. Khớp lời văn đã sửa |

Kiểm lại của `content-reviewer` (2026-10-24): `beam.vi.py` và `beam.en.py` chạy thật trên Pyodide (`runpyo.mjs`), output khớp bảng trên; `tiny-transformer.vi.py` và `tiny-transformer.en.py` chạy thật với torch trong `.venv-llm`, `OMP_NUM_THREADS=1`, output khớp khối "Kết quả mẫu" của bài.
