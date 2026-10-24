# Xây dựng LLM đầu tiên (Building Your First LLM)

Bài: `llm/build-first-llm` (chỉ bản vi, khoảng 13 phút đọc, đợt 1, duyệt riêng). Bài cần biết trước trong roadmap: `dl/transformers`, `nlp/tokenization` (chưa xuất bản, nên "Nhắc nhanh" nới tới một đoạn, quyết định 54). Dùng lại `SamplingViz` của `llm/text-api`. Có một ô `PythonRunner` (NumPy, bigram ký tự) và một ô `LocalCode` (GPT nhỏ bằng PyTorch).

Ngày tra: **24/10/2026**. Cách tra: WebFetch trang arXiv, JMLR, GitHub, Wikisource; tải PDF của Radford 2018 và 2019 rồi trích chữ bằng `pdftotext`; chạy thật Python trong scratchpad. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra từ công thức.

## Nguồn

- **[R18]** Radford, A., Narasimhan, K., Salimans, T., Sutskever, I. (2018). [*Improving Language Understanding by Generative Pre-Training*](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf) (PDF). OpenAI, báo cáo kỹ thuật (không phải bài hội nghị). Đã đọc phần mục tiêu huấn luyện và phần thiết lập.
- **[R19]** Radford, A., Wu, J., Child, R., Luan, D., Amodei, D., Sutskever, I. (2019). [*Language Models are Unsupervised Multitask Learners*](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) (PDF). OpenAI, báo cáo kỹ thuật (bài này là báo cáo GPT-2). Đã đọc mục 1, 2.1, 2.2, 2.3.
- **[V17]** Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., Polosukhin, I. (2017). [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762). arXiv:1706.03762 (nộp 6/2017; trang arXiv hiện ở v7, 8/2023). Trang arXiv chỉ ghi arXiv; **không xác minh được** tên hội nghị trong lần tra này (xem "Chưa xác minh"). Mới đọc tóm tắt, chưa đọc kỹ cả bài.
- **[B03]** Bengio, Y., Ducharme, R., Vincent, P., Jauvin, C. (2003). [*A Neural Probabilistic Language Model*](https://www.jmlr.org/papers/v3/bengio03a.html). *Journal of Machine Learning Research* 3 (Feb): 1137-1155. Mới đọc trang tóm tắt.
- **[S48]** Shannon, C. E. (1948). [*A Mathematical Theory of Communication*](https://people.csail.mit.edu/dmoshkov/courses/codes/shannon1948.pdf) (PDF, bản chép lại có sửa lỗi nhỏ của bản gốc). *Bell System Technical Journal* 27: 379-423, 623-656. Thư mục đã đối chiếu qua kết quả tìm kiếm (DOI `10.1002/j.1538-7305.1948.tb01338.x`). **Chưa đọc nội dung** (công cụ không trích được chữ), nên chỉ dùng cho một câu lịch sử rất chung, xem "Chưa xác minh".
- **[NGPT]** Karpathy, A. [*nanoGPT*](https://github.com/karpathy/nanoGPT) (GitHub). Giấy phép **MIT**. Trang repo ghi (cập nhật 11/2025): "nanoGPT (this repo) is now very old and deprecated but I will leave it up for posterity", và khuyên dùng dự án mới `nanochat`. Mô tả: viết lại của minGPT, `model.py` và `train.py` mỗi file khoảng 300 dòng; ví dụ `shakespeare_char` huấn luyện GPT mức ký tự (README nêu bản GPU: ngữ cảnh 256 ký tự, 6 lớp, 6 đầu, 384 chiều; bản CPU thu nhỏ: 4 lớp, 4 đầu, 128 chiều, ngữ cảnh 64, khoảng 3 phút, loss khoảng 1,88). Là nguồn cảm hứng cho bài; **không chép code** (code trong bài tự viết).
- **[KIEU]** Nguyễn Du. [*Truyện Kiều*](https://vi.wikisource.org/wiki/Truyện_Kiều) (Wikisource tiếng Việt). Văn bản quốc ngữ, trang ghi "Đã hiệu đính và sửa lỗi". Footer trang ghi tác phẩm "đã thuộc phạm vi công cộng trên toàn thế giới vì tác giả đã mất hơn 100 năm trước". Xem mục "Văn bản Truyện Kiều" bên dưới.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Hội nghị của [V17] | Trang arXiv không nêu. Thường được dẫn là NIPS 2017, nhưng chưa xác minh trong lần tra này. | Ghi "arXiv:1706.03762, 2017"; chỉ ghi NeurIPS nếu có người xác minh. |
| Nội dung [S48] về xấp xỉ tiếng Anh bằng chuỗi Markov mức ký tự | Chưa đọc được. | Bài chỉ cần nói "ý tưởng mô hình hóa ngôn ngữ bằng xác suất của ký tự kế tiếp đã có từ rất sớm", dẫn [S48] cho thư mục; không mô tả ví dụ cụ thể trong paper. Hoặc bỏ nguồn này. |
| Video "Let's build GPT" của Karpathy | Chưa tra. | Không dẫn. Nếu muốn dẫn, tra trước. |
| Kích thước ngữ cảnh và số đầu attention của [R18] | Đã đọc: 12 lớp, trạng thái 768 chiều, huấn luyện trên chuỗi 512 token, BooksCorpus. Số đầu attention trong dòng bị ngắt khi trích; **chưa xác nhận** là 12. | Chỉ ghi "12 lớp, 768 chiều, ngữ cảnh 512 token, decoder-only"; không ghi số đầu. |
| Ba cấp ứng dụng LLM trong giáo án ("Levels of language model applications") | Giáo án chỉ có tiêu đề, không nêu định nghĩa các cấp. Chưa có nguồn công khai thống nhất. | **Phiên chính cần chốt với người dùng** cách chia cấp (xem "Điểm cần phiên chính chốt"). Đề xuất bên dưới là của `summarizer`, chưa có nguồn. |
| Bản quyền lớp hiệu đính của [KIEU] | Footer nói giấy phép CC BY-SA 4.0 áp cho trang (có thể kèm điều khoản khác); chỉ nói chung, không nêu riêng cho lớp phiên âm. | Dùng 24 câu đầu, ghi nguồn Wikisource. Nếu chọn bản dài hơn, kiểm lại giấy phép. |
| Thời lượng chạy PyTorch trên máy người đọc | Chỉ đo trên máy phát triển. | Ghi "khoảng vài phút trên CPU" kèm máy đã đo. |

## Ý chính

- **Mô hình ngôn ngữ = dự đoán token kế tiếp.** Cho chuỗi $x_1,\dots,x_{t-1}$, mô hình cho ra phân phối xác suất trên mọi token có thể đứng ở vị trí $t$. Xác suất cả câu là tích các xác suất có điều kiện (quy tắc nhân xác suất) [R19 mục 2, phương trình 1]. Mọi LLM, từ bigram đồ chơi tới GPT, khác nhau ở cách tính phân phối này, không ở bài toán.
- **Huấn luyện = cực đại hóa log-likelihood = cực tiểu cross-entropy** trung bình trên token [R18 phương trình 1]. Cross-entropy cho biết mô hình "ngạc nhiên" bao nhiêu khi thấy token thật. **Perplexity** là $\exp$ của cross-entropy, đọc như "số lựa chọn đều nhau tương đương mà mô hình đang phân vân". Mô hình đoán bừa trên $V$ token có perplexity đúng bằng $V$ (kiểm bằng Python, bên dưới).
- **Token là đơn vị, không nhất thiết là từ.** Bài dùng **ký tự** làm token để khỏi cần bộ tách từ (từ vựng khoảng 70 ký tự thay vì hàng chục nghìn). GPT-2 dùng BPE mức byte với từ vựng 50 257 [R19 mục 2.2]. Hẹn `nlp/tokenization` cho phần BPE.
- **Cấp độ 1: bigram (đếm).** Phân phối của ký tự kế tiếp chỉ phụ thuộc **một** ký tự đứng trước; "huấn luyện" chỉ là đếm các cặp rồi chuẩn hóa từng hàng. Không có tham số học bằng gradient. Ghi nhớ giới hạn: ngữ cảnh một ký tự, nên văn sinh ra giống "văn mô phỏng âm" chứ không có nghĩa. Đây là họ hàng của mô hình n-gram mà [B03] dùng làm đối chứng (ở mức từ).
- **Cấp độ 2: mô hình thần kinh.** [B03] là một trong các bài đầu cho thấy mô hình thần kinh với vectơ biểu diễn của từ vượt n-gram, vì từ giống nhau có vectơ gần nhau nên khái quát hóa sang tổ hợp chưa gặp. Dùng làm một câu lịch sử, không cần giải thích chi tiết kiến trúc.
- **Cấp độ 3: GPT = Transformer chỉ có decoder.** Chuỗi token được nhúng (embedding) cộng thêm thông tin vị trí, đi qua nhiều khối: self-attention có **mặt nạ nhân quả** (causal mask), rồi mạng nơ-ron truyền thẳng, mỗi cái có kết nối tắt và chuẩn hóa. Lớp cuối cho **logit** trên từ vựng. [R18]: decoder-only 12 lớp, 768 chiều, ngữ cảnh 512 token, "masked self-attention" ([V17] là gốc của khối attention, dùng cả encoder lẫn decoder).
- **Mặt nạ nhân quả là điều kiện để dùng được cho sinh văn bản.** Token ở vị trí $t$ chỉ được nhìn các vị trí $\le t$. Nhờ vậy một lần chạy qua chuỗi dài $T$ tính được $T$ dự đoán song song (vị trí $t$ dự đoán token $t+1$), và khi sinh thì không "nhìn trước" đáp án.
- **Sinh văn bản = lặp: dự đoán, lấy mẫu, nối vào chuỗi, dự đoán tiếp.** Bước lấy mẫu dùng đúng `temperature`, top-k, top-p đã dạy ở `llm/text-api`; bài này dùng lại `SamplingViz` và nối với logit thật của mô hình ký tự. Không viết lại công thức, link về bài kia.
- **Các cấp ứng dụng (đề xuất, chưa có nguồn):** (1) dùng LLM có sẵn qua API (bài `text-api`); (2) tinh chỉnh prompt, RAG, agent trên LLM có sẵn; (3) fine-tune hoặc huấn luyện tiếp; (4) pre-train từ đầu. Mỗi cấp tốn thêm dữ liệu, tính toán và kiến thức. Xếp thứ tự các bài còn lại của phần LLM theo cấp này.
- **Bài toán nhỏ để học, không phải để dùng.** GPT ký tự trên vài trăm dòng thơ chỉ để thấy vòng lặp huấn luyện và sinh văn bản; chất lượng văn không phải mục tiêu. Karpathy làm tương tự với Shakespeare ký tự [NGPT].

## Công thức quan trọng

Ký hiệu theo site: token $x_t$, độ dài chuỗi $T$, cỡ từ vựng $V$, logit $\mathbf{z}\in\mathbb{R}^V$, tham số $\boldsymbol{\theta}$, hàm mất mát $\mathcal{L}$.

**Xác suất của một chuỗi** (quy tắc nhân; [R19 pt. (1)] viết dạng tương tự):

$$p(x_1,\dots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_1,\dots,x_{t-1})$$

**Softmax cho phân phối token kế tiếp** (đã có ở `text-api`, nhiệt độ $T$ ở đó khác với độ dài chuỗi $T$ ở đây: **đổi ký hiệu độ dài thành $L$** khi viết bài để khỏi trùng, xem "Điểm dễ hiểu nhầm"):

$$p_i=\frac{\exp(z_i)}{\sum_{j=1}^{V}\exp(z_j)}$$

**Hàm mất mát cross-entropy trung bình trên $N$ cặp (ngữ cảnh, token thật)** (đối ứng với cực đại hóa $\mathcal{L}_1$ ở [R18 pt. (1)], đổi dấu và chia trung bình):

$$\mathcal{L}(\boldsymbol{\theta})=-\frac{1}{N}\sum_{n=1}^{N}\log p_{\boldsymbol{\theta}}\big(x^{(n)}\mid \text{ngữ cảnh}^{(n)}\big)$$

Đơn vị là **nat** nếu dùng $\ln$ (NumPy và PyTorch mặc định), **bit** nếu dùng $\log_2$. Bài dùng $\ln$ và nói rõ.

**Perplexity:**

$$\mathrm{PPL}=\exp\big(\mathcal{L}\big)$$

- Đoán đều trên $V$ token: $p=1/V$, nên $\mathcal{L}=\ln V$ và $\mathrm{PPL}=V$. Đây là mốc đối chiếu "chưa học gì".
- Mô hình luôn chắc chắn và đúng: $\mathcal{L}=0$, $\mathrm{PPL}=1$.
- Chỉ so được giữa các mô hình **cùng cách tách token và cùng tập kiểm tra**: perplexity mức ký tự và mức từ không so trực tiếp.

**Bigram từ bảng đếm** ($C_{ij}$ là số lần ký tự $j$ đứng sau ký tự $i$; làm trơn cộng $k$):

$$p(j\mid i)=\frac{C_{ij}+k}{\sum_{j'}\left(C_{ij'}+k\right)}$$

Cộng $k>0$ để cặp chưa từng thấy không có xác suất 0 (nếu không, $\log 0=-\infty$ và perplexity vô hạn).

**Self-attention có mặt nạ nhân quả** (một đầu; $\mathbf{Q},\mathbf{K},\mathbf{V}\in\mathbb{R}^{L\times d}$ là ma trận truy vấn, khóa, giá trị; công thức của [V17], mặt nạ do `summarizer` viết lại):

$$\mathrm{Attn}(\mathbf{Q},\mathbf{K},\mathbf{V})=\mathrm{softmax}\!\left(\frac{\mathbf{Q}\mathbf{K}^{\top}}{\sqrt{d}}+\mathbf{M}\right)\mathbf{V},\qquad M_{ij}=\begin{cases}0 & j\le i\\ -\infty & j>i\end{cases}$$

$\mathbf{M}$ cộng $-\infty$ vào các vị trí "nhìn tương lai" nên sau softmax chúng có trọng số 0. Cần giải thích bằng lời: vì sao chia $\sqrt{d}$ (giữ độ lớn tích vô hướng không phình khi $d$ tăng; [V17] có giải thích, chưa đọc kỹ), và vì sao hàng $i$ vẫn cộng lại bằng 1.

## Số tự chạy (Python, ngày 24/10/2026)

> **Ghi chú (2026-10-24, sau review):** các số trong mục này là của **bản nháp** (791 ký tự, $k = 1$, chia 85/15, 500 bước), không phải của file trong bài. Số đúng của bài nằm ở mục "Kiểm chứng code" (790 ký tự, $k = 0{,}1$, câu 1–20 huấn luyện, câu 21–24 kiểm tra, 301 bước). Con số 3 254 câu của toàn bộ Truyện Kiều (mục "Văn bản Truyện Kiều") nay đã kiểm: đếm từ bản `action=raw` của trang Wikisource.

Văn bản: **24 câu đầu** của [KIEU] (câu 1-24, đã đối chiếu bằng hai lần lấy từ Wikisource; thông qua WebFetch nên người viết phải so lại với trang trước khi đưa vào file `.py`). Chuẩn hóa Unicode NFC, chuyển chữ thường. Chạy bằng venv Pyodide `ai-atlas-py314` (chỉ NumPy).

| Đại lượng | Giá trị |
|---|---|
| Số ký tự (kể cả xuống dòng và khoảng trắng) | 791 |
| Cỡ từ vựng $V$ (ký tự khác nhau) | 73 |
| Cross-entropy của mô hình đoán đều, $\ln V$ | 4,290 nat (PPL = 73) |
| Bigram, $k=1$, **đo trên chính dữ liệu huấn luyện** | $\mathcal{L}=2{,}900$, PPL 18,17 |
| Bigram, huấn luyện 20 câu đầu, kiểm tra 4 câu cuối, $k=1$ | $\mathcal{L}=3{,}229$, PPL 25,24 |
| Như trên, $k=0{,}1$ | $\mathcal{L}=2{,}681$, PPL 14,60 |

- Lưu ý khi viết bài: số trên tập huấn luyện đẹp hơn số trên tập kiểm tra; đây là ví dụ sống cho "đo trên dữ liệu chưa thấy" (nối `ml/overfitting-underfitting`). $k$ cũng đổi kết quả đáng kể ở dữ liệu nhỏ; bài nên chọn một giá trị, nói rõ, và không nói $k$ nào "đúng".
- Tập 24 câu quá nhỏ để các số trên **ổn định**: đổi cách chia train/test hay $k$ là đổi số. Chỉ dùng chúng để dạy cách đọc, không so với paper.
- Lấy mẫu từ bigram bằng `np.random.default_rng(0)` chạy được, nhưng **chưa ghi lại văn sinh ra**: lệnh in bị lỗi mã hóa trên Windows với `python -I` (không phải lỗi của code). `lesson-writer` chạy lại và ghi kết quả thật trong bài; không bịa văn mẫu.

### GPT nhỏ bằng PyTorch (kiểm bằng `.venv-llm`, torch CPU, 24 câu trên)

Cấu hình đã chạy: ký tự, ngữ cảnh 32, nhúng 64 chiều, 2 khối, 4 đầu, `nn.MultiheadAttention` với `attn_mask` bool (`True` = cấm nhìn), AdamW tốc độ học $3\times10^{-3}$, batch 32, 500 bước, `torch.manual_seed(0)`, **111 433 tham số**, thời gian **76 giây** trên máy phát triển. Chia 85% huấn luyện, 15% kiểm tra:

| Bước | loss huấn luyện | loss kiểm tra |
|---|---|---|
| 0 | 4,663 | 4,335 |
| 100 | 0,769 | 3,883 |
| 200 | 0,213 | 6,294 |
| 500 | 0,123 | 8,516 |

**Kết luận quan trọng: với chỉ 24 câu, GPT nhớ thuộc lòng dữ liệu huấn luyện (loss huấn luyện về gần 0) và loss kiểm tra tăng vọt.** Cả hai khớp với lý thuyết nhưng **không dùng được làm ví dụ "mô hình học được tiếng Việt"**. Xem mục tiếp.

## Văn bản Truyện Kiều

- **Phạm vi công cộng:** Nguyễn Du mất năm 1820 (kiến thức chung, chưa tra lại trong lần này), tác phẩm ở phạm vi công cộng; footer Wikisource xác nhận. Phần Wikisource là bản quốc ngữ đã hiệu đính, có thể khác bản khác ở một số chữ; ghi nguồn là Wikisource và ngày lấy.
- **Dữ liệu:** quy mô khuyến nghị cho GPT ký tự có ý nghĩa là **toàn bộ tác phẩm** (3 254 câu là con số thường được nêu, **chưa kiểm** trong lần tra này; khoảng một trăm nghìn ký tự), không phải 24 câu. Theo quy ước `LocalCode`, file `.py` phải tự chạy và ≤ 60 dòng, nên cần **một file dữ liệu văn bản** riêng (ví dụ ở `src/data/` hoặc `src/code/llm/build-first-llm/`) mà cả `PythonRunner` và `LocalCode` đọc. Cách đưa file vào Pyodide chưa được `PythonRunner` hỗ trợ (cần kiểm tra); nếu không đưa được thì ô chạy trên trang dùng đoạn trích ngắn (24 câu, như trên), còn ô PyTorch đọc file đầy đủ.
- Đã chạy thử trên 24 câu: không có ký tự lạ ngoài chữ Việt, dấu câu và xuống dòng. Chuẩn hóa NFC bắt buộc, vì tiếng Việt có thể gõ dạng tổ hợp (chữ + dấu rời) hoặc dạng dựng sẵn; hai dạng cho ra hai "ký tự" khác nhau và làm sai cỡ từ vựng.

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; chỗ có "(gợi ý)" là của `summarizer`.

- **Trò "đoán chữ kế tiếp" (gợi ý):** che chữ cuối của câu thơ "Trăm năm trong cõi người ...", hỏi người đọc chữ nào kế tiếp. Người đọc thuộc thơ điền ngay "ta"; người chưa thuộc đoán theo ngữ pháp. Bigram chỉ nhìn **một ký tự** trước đó; GPT nhìn cả câu. Dùng trực tiếp làm mở bài.
- **Bigram là bảng tra, GPT là hàm (gợi ý):** bigram có một hàng xác suất cho mỗi ký tự trước (73 hàng); bảng này in được ra và đọc được (ví dụ sau chữ "q" gần như luôn là "u"). GPT không có bảng như vậy, nó tính phân phối từ cả chuỗi bằng các ma trận trọng số.
- **Perplexity như số lựa chọn (gợi ý):** PPL 18 nghĩa là, trung bình, mô hình phân vân như thể chọn đều giữa khoảng 18 ký tự, so với 73 lúc chưa học gì. Số nhỏ hơn thì tốt hơn, nhưng chỉ so được trên cùng dữ liệu và cùng cách tách token.
- **Mặt nạ nhân quả như tờ giấy che (gợi ý):** khi đoán chữ thứ $t+1$, mô hình chỉ được nhìn phần câu đã viết; mặt nạ là tờ giấy che phần sau. Khi huấn luyện, có đáp án sẵn nên một lượt qua cả câu kiểm tra được mọi vị trí cùng lúc, mỗi vị trí với tờ che của riêng nó (ma trận tam giác dưới).
- **Huấn luyện thấy loss giảm rồi tăng ở tập kiểm tra (gợi ý):** số trong mục "Số tự chạy" (3,88 rồi 8,52) là minh họa thật cho overfitting, nhờ dữ liệu quá ít. Nếu bài dùng đoạn ngắn cho code trên máy, **nên cho người đọc thấy chính hiện tượng này** (và nói cách xử lý: thêm dữ liệu, dừng sớm). Nếu dùng toàn bộ Kiều thì số khác; phải chạy lại.
- **Sinh văn bản từng bước (gợi ý):** hiện từng vòng lặp: ngữ cảnh hiện tại, bảng xác suất 10 ký tự cao nhất, chọn một, nối vào. Phần "chọn một" nối trực tiếp tới `SamplingViz`. Nên cho người đọc đặt $T$ thấp và cao trên cùng mô hình để thấy văn lặp (nhàm) hay lộn xộn.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Nhầm "LLM biết sự thật" với "LLM dự đoán token kế tiếp".** Mô hình được huấn luyện cho khớp với văn bản, không được huấn luyện cho đúng. Bài chỉ cần nói một câu và hẹn các bài sau (RLHF, RAG).
2. **Nhầm perplexity giữa các mô hình khác cách tách token.** PPL ký tự và PPL từ không so trực tiếp. Cũng không so được giữa hai tập kiểm tra khác nhau.
3. **Nhìn loss huấn luyện mà không nhìn loss kiểm tra.** Số trong "Số tự chạy" là ví dụ: loss huấn luyện giảm tới 0,12 trong khi loss kiểm tra tăng tới 8,5.
4. **Quên làm trơn ở bigram.** Cặp chưa thấy có xác suất 0, $\log 0=-\infty$, perplexity vô hạn. Làm trơn cộng $k$ là cách đơn giản nhất.
5. **Quên chuẩn hóa Unicode.** Tiếng Việt có hai dạng mã hóa cho cùng một chữ có dấu; không chuẩn hóa NFC thì từ vựng ký tự phình ra và bigram đếm sai.
6. **Quên mặt nạ nhân quả.** Mô hình thấy trước đáp án, loss huấn luyện thấp "đẹp" bất thường, nhưng khi sinh văn bản thì vô dụng. Gợi ý bài tập kiểm tra: đổi một token ở vị trí $t+1$ và kiểm tra logit ở vị trí $\le t$ không đổi.
7. **Nhầm chiều của mặt nạ** (cấm nhìn tương lai, không phải cấm nhìn quá khứ). Với `nn.MultiheadAttention`, `attn_mask` kiểu `bool` có `True` nghĩa là **không được** nhìn (đã chạy thật với `torch.triu(..., 1)`); kiểu `float` thì cộng thẳng vào điểm. Hai quy ước ngược nhau về ý nghĩa của giá trị, dễ nhầm.
8. **Trộn ký hiệu $T$.** Ở `text-api`, $T$ là temperature; độ dài chuỗi dùng $L$ (đề xuất) để không trùng. Nếu bài giữ $T$ cho độ dài thì phải đổi nhiệt độ sang ký hiệu khác trong bài này; **cần thống nhất giữa hai bài**.
9. **Tưởng GPT ký tự trên một đoạn thơ ngắn sinh ra thơ hay.** Nó chỉ nhớ lại hoặc ghép chữ. Cần nói rõ mục tiêu là hiểu vòng lặp, không phải chất lượng văn.
10. **Nghĩ lấy mẫu làm mô hình "thông minh hơn".** Temperature, top-k, top-p chỉ đổi cách chọn từ một phân phối cho trước; mô hình không đổi (nối `text-api`).
11. **Nhầm decoder-only với "không có attention".** GPT vẫn có self-attention; chỉ bỏ encoder và cross-attention của Transformer gốc [V17]. Chi tiết encoder-decoder thuộc bài `seq2seq`.

## Điểm cần phiên chính chốt (câu hỏi cho người dùng)

1. **Cách chia "các cấp ứng dụng mô hình ngôn ngữ"** (giáo án không định nghĩa). Đề xuất: 4 cấp ở "Ý chính".
2. **Quy mô dữ liệu Kiều:** 24 câu (đủ cho bigram, quá ít cho GPT) hay toàn bộ (cần file dữ liệu và kiểm tra việc nạp file vào Pyodide và giấy phép lớp hiệu đính).
3. **Ký hiệu độ dài chuỗi:** $L$ (đề xuất) hay $T$, và bài `text-api` đã dùng $T$ cho nhiệt độ.
4. **Tên model GPT-2 trong code:** bài chỉ nhắc GPT-2 như sự kiện năm 2019 [R19], không tải trọng số.

## Liên quan tới bài nào

- **Cần biết trước:** `dl/transformers` (self-attention, khối Transformer), `nlp/tokenization` (BPE). Cả hai chưa xuất bản; "Nhắc nhanh" phải tự đứng được.
- **Trước:** `llm/text-api` (softmax có nhiệt độ, top-k, top-p, `SamplingViz`); `ml/overfitting-underfitting` (loss huấn luyện và kiểm tra); `ml/gradient-descent` (vòng lặp huấn luyện); `ml/regularization` (weight decay của AdamW, nếu nhắc).
- **Sau (đều có `build-first-llm` làm bài cần biết trước):** `llm/gpt-family-finetuning` (từ GPT-1/2 tới fine-tune), `llm/pretraining-data` (dữ liệu pre-train), `llm/llama-family` (RoPE, song song hóa), `llm/debugging-language-models`.

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Mô hình ngôn ngữ | Language model | Dịch, gloss lần đầu |
| Dự đoán token kế tiếp | Next-token prediction | Dịch, giữ "token" |
| Entropy chéo | Cross-entropy | Giữ "cross-entropy"; "entropy chéo" khi cần |
| Độ rối (perplexity) | Perplexity | Giữ "perplexity" |
| Mặt nạ nhân quả | Causal mask | Dịch; gloss "chặn nhìn tương lai" |
| Chỉ có decoder | Decoder-only | Giữ "decoder-only" |
| Làm trơn (cộng $k$) | (Add-$k$) smoothing | Dịch |
| Mô hình bigram | Bigram model | Giữ "bigram" |
| Pre-train | Pre-training | Giữ nguyên |

## Đọc thêm đề xuất

1. **Radford và cộng sự (2018)**, GPT-1: [PDF](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf). Đã đọc phần mục tiêu và thiết lập.
2. **Radford và cộng sự (2019)**, GPT-2: [PDF](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf). Đã đọc mục 1-2.
3. **Vaswani và cộng sự (2017)**, [arXiv:1706.03762](https://arxiv.org/abs/1706.03762). Chỉ đọc tóm tắt.
4. **Bengio và cộng sự (2003)**, [JMLR 3](https://www.jmlr.org/papers/v3/bengio03a.html). Chỉ đọc tóm tắt.
5. **Karpathy, nanoGPT** (MIT, đã ngừng cập nhật, 11/2025): [GitHub](https://github.com/karpathy/nanoGPT), kèm lưu ý repo đã "deprecated" và dự án mới `nanochat`.

## Kiểm chứng code

Do `lesson-writer` chạy ngày 24/10/2026, thư mục làm việc ở scratchpad, Python gọi bằng `-I -X utf8` (cờ `-X utf8` thay cho `PYTHONIOENCODING`, vì `-I` bỏ qua biến `PYTHON*`). Không có `__pycache__` trong `src/code/`.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `bigram.vi.py`, `bigram.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật (Python 3.14.2, NumPy 2.4.6), chạy bằng `runpyo.mjs` | Chạy lại sau khi sửa comment dòng 1 (thêm "Wikisource, CC BY-SA 4.0"). V = 73; đoán đều 4.290 (ppl 73); train 2.076 (ppl 7.98); test 2.720 (ppl 15.18); P(u \| q) = 0.301; văn sinh ra ở T = 1 và 0.5 khớp lời văn ("ồĩầyộẳ", "trời", "trông", "lặn", một dòng dài hơn 100 ký tự). Hai bản vi/en cho output giống hệt. Đếm thêm trên Pyodide: 790 ký tự, 659 vị trí dự đoán ở tập huấn luyện, 130 cặp ở tập kiểm tra, trong đó **26 cặp chưa gặp** khi huấn luyện; hàng "q" 3 lần đếm (cả 3 là "u"), hàng "ĩ" 2. Lần kiểm trước đó bằng venv CPython cho cùng số. 45 dòng, dòng dài nhất ≤ 79 ký tự |
| `tiny-gpt.vi.py`, `tiny-gpt.en.py` | chạy thật | 2026-10-24 | `.venv-llm`: Python 3.14.5, torch 2.14.1+cpu | Chỉ đổi comment dòng 1, nhưng vẫn chạy lại: bản vi hai lần và bản en một lần, ba output **trùng từng byte** (`cmp`) và trùng khối "Kết quả mẫu" trong bài (vì vậy `sampleVaries={false}`). 111 561 tham số. Loss test 4.173 → 2.613 (bước 50) → 5.341 (bước 300), loss lô train (tính trước `opt.step()`) 4.467 → 0.183; sinh lại gần nguyên văn câu 1–2. 60 dòng, dòng dài nhất ≤ 79 ký tự |
| (thử nghiệm) tiny-gpt trên toàn bộ Truyện Kiều | chạy thật | 2026-10-24 | `.venv-llm`, như trên | Không phải file của bài. 3 254 câu Wikisource, 104 203 ký tự, 98 ký tự khác nhau; chia 90/10; 1 000 bước, in mỗi 100 bước; 1 phút 49 giây. Loss test 4.368 → 1.732, loss lô train 1.676 ở bước 1 000; văn sinh ra không có trong văn bản gốc (đã kiểm từng cụm). Số dùng trong đoạn "Bạn có thể tự thấy tác dụng của dữ liệu" |

`ast.parse` cả bốn file: không lỗi. Cặp vi/en khác nhau chỉ ở comment, cùng số dòng. Công thức trong bài render bằng `node_modules/katex`: 208 công thức, 0 lỗi, 0 cảnh báo.

Văn bản 24 câu: lấy bằng `action=raw` của trang Wikisource ngày 24/10/2026, đối chiếu từng ký tự với chuỗi `POEM` trong hai file (đã ở dạng NFC). Bản Wikisource có dấu phẩy giữa câu và ghi "bực trung", "Một người một vẻ".
