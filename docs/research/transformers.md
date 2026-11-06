# Tài liệu tham khảo: Transformers (`dl/transformers`)

Do `lesson-writer` viết ngày 05/11/2026, cùng lúc với bản vi của bài. Link đã mở lại bằng WebFetch cùng ngày.

## Nguồn chính

### Vaswani và cộng sự (2017), *Attention Is All You Need*

- Link: <https://arxiv.org/abs/1706.03762> (NIPS 2017; bản arXiv hiện tại v7, 02/08/2023). Tác giả: Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin.
- Đã đọc văn bản PDF (pdftotext). Các điểm bài dùng:
  - Mục 3.2.1: $\mathrm{Attention}(Q, K, V) = \mathrm{softmax}(QK^\top/\sqrt{d_k})V$. Chú thích 4: nếu các thành phần của $q$ và $k$ độc lập, trung bình 0, phương sai 1 thì $q \cdot k$ có trung bình 0, phương sai $d_k$; với $d_k$ lớn, tích vô hướng lớn đẩy softmax vào vùng gradient rất nhỏ.
  - Mục 3.2.2: nhiều đầu, $\mathrm{MultiHead} = \mathrm{Concat}(\mathrm{head}_1, \dots, \mathrm{head}_h)W^O$; $h = 8$, $d_k = d_v = d_{\text{model}}/h = 64$; tổng chi phí gần bằng một đầu đủ chiều.
  - Mục 3.1: $N = 6$ lớp, $\mathrm{LayerNorm}(x + \mathrm{Sublayer}(x))$, $d_{\text{model}} = 512$ (Post-LN).
  - Mục 3.3: $\mathrm{FFN}(x) = \max(0, xW_1 + b_1)W_2 + b_2$, $d_{ff} = 2048$, áp riêng cho từng vị trí.
  - Mục 3.4: embedding nhân $\sqrt{d_{\text{model}}}$.
  - Mục 3.5: $PE_{(pos,2i)} = \sin(pos/10000^{2i/d_{\text{model}}})$, $PE_{(pos,2i+1)} = \cos(\cdot)$; bước sóng từ $2\pi$ tới $10000 \cdot 2\pi$; $PE_{pos+k}$ là hàm tuyến tính của $PE_{pos}$; vị trí học được cho kết quả gần như y hệt (bảng 3 hàng E); chọn sin/cos vì có thể ngoại suy tới chuỗi dài hơn.
  - Bảng 1: self-attention $O(n^2 \cdot d)$ mỗi lớp, $O(1)$ bước nối tiếp, đường đi dài nhất $O(1)$; RNN $O(n \cdot d^2)$, $O(n)$, $O(n)$. Self-attention nhanh hơn RNN khi $n < d$.
  - Mục 3.2.3: mặt nạ trong decoder đặt $-\infty$ vào đầu vào softmax ở các kết nối không hợp lệ.
- Ký hiệu: bài báo viết $d_{\text{model}}$ và $n$; bài viết $d$ và $L$ (dl-lessons.md mục 2).

### Bahdanau, Cho, Bengio (2014), *Neural Machine Translation by Jointly Learning to Align and Translate*

- Link: <https://arxiv.org/abs/1409.0473> (arXiv 2014, ICLR 2015). Bài chỉ nhắc một câu: attention đầu tiên cho dịch máy, gắn vào RNN encoder–decoder; điểm do một mạng nhỏ tính (additive attention). Chi tiết đã có ở `llm/seq2seq`.

### Xiong và cộng sự (2020), *On Layer Normalization in the Transformer Architecture*

- Link: <https://arxiv.org/abs/2002.04745> (ICML 2020). Post-LN có gradient lớn ở gần lớp ra lúc khởi tạo nên cần warmup; Pre-LN có gradient ổn định, huấn luyện được không cần warmup. Bài dùng một câu.

### Tham khảo phụ

- Devlin và cộng sự (2018), BERT, <https://arxiv.org/abs/1810.04805>: encoder-only. Chỉ nêu tên trong bảng ba họ.
- Radford và cộng sự (2018), GPT-1: decoder-only, vị trí học được. Chỉ nêu tên.
- Ba, Kiros, Hinton (2016), *Layer Normalization*, <https://arxiv.org/abs/1607.06450>: nguồn của chuẩn hóa lớp (không đưa vào Đọc thêm).
- Zhang, Lipton, Li, Smola (2023), *Dive into Deep Learning*, chương 11, <https://d2l.ai/chapter_attention-mechanisms-and-transformers/index.html>.
- Alammar (2018), *The Illustrated Transformer*, <https://jalammar.github.io/illustrated-transformer/> (ngày đăng 27/06/2018).

### Nguồn đã cân nhắc rồi bỏ

- Bản dịch tiếng Việt *Đắm mình vào Học Sâu* (`d2l.aivivn.com`), chương 10 "Cơ chế Tập trung": trang chương còn đúng nội dung, nhưng **trang chủ của tên miền ngày 05/11/2026 trả về nội dung cờ bạc** (có vẻ tên miền bị chiếm). Không đưa link vào bài cho tới khi người dùng kiểm tra lại.

## Thuật ngữ

| Tiếng Việt | Tiếng Anh | Ghi chú |
|---|---|---|
| Attention tích vô hướng có chia tỉ lệ | Scaled dot-product attention | Dịch |
| Chiều mô hình | Model dimension ($d$) | Dịch |
| Chiều khóa | Key dimension ($d_k$) | Dịch |
| Đầu (attention) | Head | Dịch |
| Mã hóa vị trí | Positional encoding | Dịch; sin/cos (sinusoidal), học được (learned) |
| Mặt nạ nhân quả | Causal mask | Đã dùng ở phần LLM |
| Khối Transformer | Transformer block | Đã dùng ở phần LLM |
| Đẳng biến với hoán vị | Permutation equivariance | Dịch, lần đầu kèm tiếng Anh |
| Encoder-only | Encoder-only | Giữ |
| Encoder–decoder | Encoder–decoder | Giữ |

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc ở scratchpad, gọi Python bằng `-I`. Cả tám file qua `ast.parse(..., feature_version=(3, 10))`; mỗi `.en.py` là bản sao y nguyên của `.vi.py`.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `attention.vi.py`, `attention.en.py` | chạy thật | 2026-11-05 | venv `ai-atlas-py314`: Python 3.14.5, NumPy 2.4.6 | 36 dòng, dòng dài nhất 70 ký tự. Ma trận trọng số không mặt nạ (hàng 1: `0.09 0.29 0.18 0.37 0.08`), mọi hàng cộng bằng 1, `output shape: (5, 4)`; có mặt nạ: tam giác dưới, hàng 2 `0.67 0.33`, hàng 5 giống bản không mặt nạ, `row 0 of output equals V[0]: True`. Khớp bảng ở mục Minh họa và lời văn |
| `scaling.vi.py`, `scaling.en.py` | chạy thật | 2026-11-05 | như trên | 19 dòng, dòng dài nhất 73 ký tự. `d_k=4`: var 4.0, raw 0.50, scaled 0.30; `d_k=64`: var 62.9, raw 0.87, scaled 0.32; `d_k=512`: var 506.9, raw 0.95, scaled 0.32 |
| `positional.vi.py`, `positional.en.py` | chạy thật | 2026-11-05 | như trên | 32 dòng, dòng dài nhất 69 ký tự. PE 4 chiều đầu của vị trí 0..2: `[0 1 0 1]`, `[0.84 0.54 0.1 1]`, `[0.91 -0.42 0.2 0.98]`; `no PE change at position 1: 0.000`, `with PE change at position 1: 0.146` |
| `sort-encoder.vi.py`, `sort-encoder.en.py` | chạy thật | 2026-11-07 | `.venv-dl`: Python 3.14.2, torch 2.15.0+cpu | 59 dòng, dòng dài nhất 68 ký tự. USE_POS=True: loss 8.80 -> 0.30, token acc 0.976, seq acc 0.845; USE_POS=False: loss 8.76 -> 1.71, token acc 0.300, seq acc 0.000. Khớp lời văn |
