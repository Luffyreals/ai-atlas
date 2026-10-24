# Chuẩn bị dữ liệu pre-train (Preparing Pre-Training Data)

Bài: `llm/pretraining-data` (chỉ bản vi, khoảng 11 phút đọc, đợt 3). Bài cần biết trước: `llm/build-first-llm`. Giáo án gốc (buổi 14) chỉ ghi "cách bố trí dữ liệu hiệu quả" và "công cụ tối ưu bố trí dữ liệu"; bài hiểu là **data layout = làm sạch, khử trùng lặp, trộn nguồn, đóng gói chuỗi**. Dùng 1 ô `PythonRunner` (NumPy và thư viện chuẩn), không cần `LocalCode`.

Ngày tra: **24/10/2026**. Cách tra: WebFetch trang arXiv và JMLR; tải PDF rồi trích chữ bằng `pdftotext` (C4, RefinedWeb, FineWeb, Lee 2022, Pile, Dolma, Llama 3); chạy thật Python (venv Pyodide `ai-atlas-py314`, Python 3.14, NumPy). Ý không có thẻ nguồn là kiến thức chung.

## Nguồn

- **[C4]** Raffel, C., Shazeer, N., Roberts, A., Lee, K., Narang, S., Matena, M., Zhou, Y., Li, W., Liu, P. J. (2020). [*Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer*](https://arxiv.org/abs/1910.10683). *JMLR* 21(140): 1-67 (trang JMLR: <https://jmlr.org/papers/v21/20-074.html>). Đã đọc mục 2.2 (tạo C4).
- **[RW]** Penedo, G., Malartic, Q., Hesslow, D., Cojocaru, R., Cappelli, A., Alobeidli, H., Pannier, B., Almazrouei, E., Launay, J. (2023). [*The RefinedWeb Dataset for Falcon LLM: Outperforming Curated Corpora with Web Data, and Web Data Only*](https://arxiv.org/abs/2306.01116). arXiv:2306.01116 (bản tiền ấn, trang arXiv không nêu hội nghị). Đã đọc mục 3.
- **[FW]** Penedo, G., Kydlíček, H., Ben Allal, L., Lozhkov, A., Mitchell, M., Raffel, C., Von Werra, L., Wolf, T. (2024). [*The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale*](https://arxiv.org/abs/2406.17557). arXiv:2406.17557 (bản tiền ấn, CC BY 4.0). Đã đọc mục 3 và 4.
- **[LEE]** Lee, K., Ippolito, D., Nystrom, A., Zhang, C., Eck, D., Callison-Burch, C., Carlini, N. (2022). [*Deduplicating Training Data Makes Language Models Better*](https://arxiv.org/abs/2107.06499). ACL 2022 (theo trường ghi chú của trang arXiv). Đã đọc mục 4.
- **[PILE]** Gao, L., Biderman, S., Black, S., Golding, L., Hoppe, T., Foster, C., Phang, J., He, H., Thite, A., Nabeshima, N., Presser, S., Leahy, C. (2020). [*The Pile: An 800GB Dataset of Diverse Text for Language Modeling*](https://arxiv.org/abs/2101.00027). arXiv:2101.00027 (nộp 31/12/2020). Đã đọc bảng thành phần.
- **[DOLMA]** Soldaini, L., Kinney, R., Bhagia, A., và cộng sự (36 tác giả) (2024). [*Dolma: an Open Corpus of Three Trillion Tokens for Language Model Pretraining Research*](https://arxiv.org/abs/2402.00159). ACL 2024. Mới đọc tóm tắt, phần lọc và lược qua bảng 1.
- **[BRO]** Broder, A. Z. (1997). [*On the resemblance and containment of documents*](https://www.cs.princeton.edu/courses/archive/spring13/cos598C/broder97resemblance.pdf) (PDF). Trong *Compression and Complexity of Sequences 1997* (Positano, 6/1997), IEEE, tr. 21-29. Thư mục xác minh qua kết quả tìm kiếm; **chưa đọc nội dung bài gốc** (chỉ đọc cách [RW], [LEE] mô tả).
- **[L3]** Llama Team, AI @ Meta (2024). [*The Llama 3 Herd of Models*](https://arxiv.org/abs/2407.21783). arXiv:2407.21783. Chỉ đọc một gạch đầu dòng về mặt nạ chéo tài liệu (mục 3.2 của bài).
- **Công cụ (chỉ nhắc tên):** [datatrove](https://github.com/huggingface/datatrove) của Hugging Face (Apache-2.0; README tự mô tả là thư viện xử lý, lọc và khử trùng lặp văn bản ở quy mô lớn; có ví dụ MinHash và tokenize). Gói Dolma cũng mở mã nguồn công cụ làm dữ liệu [DOLMA].

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Nội dung bài gốc [BRO] | Chưa đọc. Khái niệm shingle, resemblance (Jaccard) và dùng mẫu ngẫu nhiên có kích thước cố định để ước lượng đến từ mô tả của [RW], [LEE] và kết quả tìm kiếm. | Dẫn [BRO] cho ý "ước lượng độ giống bằng chữ ký nhỏ"; không trích số hay chi tiết bên trong. |
| Kỹ thuật **LSH băng (band)** | Công thức $1-(1-s^r)^b$ có trong [LEE] (với $b=20$, $r=450$); [FW] dùng 14 băng × 8 hàm. Không rõ ai đặt ra, **không** gán cho [BRO]. | Gọi là "kỹ thuật LSH băng, dùng ở [LEE], [RW], [FW]". |
| Packing và mặt nạ chéo tài liệu | Chỉ [L3] xác nhận (mô hình 8K ngữ cảnh, "ảnh hưởng nhỏ khi pre-train thường, quan trọng khi pre-train tiếp ở ngữ cảnh rất dài"). Không tra các lab khác. | Bài nói đây là lựa chọn kỹ thuật, có nơi dùng ([L3]), có nơi không; không nói "chuẩn". |
| Số liệu phần trăm loại bỏ của C4, Dolma | C4: không có số trong đoạn đã đọc. Bảng 1 của [DOLMA] bị trích lộn cột, **không dùng**. | Chỉ dùng số đã ghi ở "Ý chính". |
| Vấn đề bản quyền và giấy phép (Books3, sách, code, Wikipedia) | [PILE] có thảo luận chung về dữ liệu có bản quyền; **chưa tra** tình trạng hiện tại của Books3 hay các vụ kiện. Giấy phép dữ liệu của Dolma không rõ trên trang arXiv. | Bài chỉ nói "nguồn nào cũng có điều kiện sử dụng và bản quyền riêng; kiểm tra trước khi dùng" và không nêu vụ việc cụ thể. |
| Thông số lọc cá nhân (PII) ngoài FineWeb | Chỉ [FW] đã đọc: ẩn danh địa chỉ email và IP công khai ở bản phát hành. | Chỉ nêu ví dụ này; không nói "mọi bộ dữ liệu đều làm". |
| Tỉ lệ trộn của các mô hình thương mại | Không công bố hoặc chưa tra. | Chỉ dùng [PILE] làm ví dụ có số liệu. |
| Quan hệ giữa tokenizer và dữ liệu (số token trên byte, từ vựng tiếng Việt) | Chưa tra nguồn. [FW] chỉ nói đếm token theo tokenizer GPT-2; [DOLMA] đếm theo token Llama và từ Unicode. | Chỉ nói "cùng văn bản, tokenizer khác thì số token khác"; không nêu hệ số. |

## Ý chính

- **Quy mô và chất lượng đi cùng nhau.** Common Crawl cho khoảng 20 TB văn bản mỗi tháng, nhưng [C4] nhận xét phần lớn "không phải ngôn ngữ tự nhiên" (menu, thông báo lỗi, văn bản lặp). Vì vậy phần lớn công việc chuẩn bị dữ liệu là bỏ bớt, không phải thu thêm (nhận định của summarizer).
- **Nguồn dữ liệu.** Web (Common Crawl) là phần lớn về khối lượng. Ngoài ra có sách, bài báo khoa học, mã nguồn, Wikipedia, diễn đàn. [PILE] ghép 22 tập con; [DOLMA] (3T token) ghép web, bài báo khoa học, code, sách công cộng, mạng xã hội, bách khoa. Mỗi nguồn dạy một kiểu: sách cho văn dài mạch lạc, code cho cấu trúc, Wikipedia cho tri thức cô đọng.
- **Từ HTML tới văn bản.** Cách trích chữ ảnh hưởng chất lượng. [FW] so hai cách: dùng chữ đã trích sẵn của Common Crawl (WET) và tự trích từ HTML gốc (WARC) bằng thư viện `trafilatura`; tự trích cho kết quả tốt hơn dù tốn kém hơn.
- **Lọc chất lượng kiểu heuristic.** [C4] giữ dòng kết thúc bằng dấu câu, bỏ trang dưới 3 câu, chỉ giữ dòng ít nhất 5 từ, bỏ trang chứa từ trong danh sách từ xấu, bỏ dòng nhắc "Javascript" hoặc chính sách cookie, bỏ trang có "lorem ipsum" hoặc dấu `{`, giữ lại tiếng Anh với xác suất ít nhất 0,99 theo `langdetect`. Luật đơn giản, dễ giải thích, **có tác dụng phụ**: bỏ cả trang tốt không có dấu chấm, và (do dùng `{`) bỏ cả code và tài liệu toán. [DOLMA] cũng dùng luật của C4 và Gopher; [FW] thử từng luật C4 riêng và thấy luật "dấu câu cuối dòng" là luật có tác dụng nhất trong thí nghiệm của họ, nhưng **không dùng** nó vì bỏ khoảng 30% token; dùng mọi luật C4 còn lại cho kết quả tốt hơn mà chỉ bỏ khoảng 7% token.
- **Lọc bằng bộ phân loại.** Dùng mô hình nhỏ chấm điểm "giống văn bản tốt". [FW] dựng bộ phân loại giá trị giáo dục từ nhãn do Llama-3-70B-Instruct sinh ra, giữ phần điểm cao thành FineWeb-Edu (1,3T token trong 15T token của FineWeb), và báo cải thiện trên MMLU, ARC. [RW] và [DOLMA] cân nhắc dùng bộ phân loại nhưng chọn hoặc bổ sung luật; cái giá là bộ phân loại học thiên kiến của dữ liệu "tốt" mẫu (ví dụ ưa văn Wikipedia).
- **Khử trùng lặp exact.** Băm (SHA-256 hay tương tự) văn bản đã chuẩn hóa, giống hash thì giữ một. Nhanh, tiết kiệm, nhưng đổi một dấu phẩy là mất tác dụng. Mức đoạn con: [LEE] dùng mảng hậu tố (suffix array) trên token BPE, bỏ mọi đoạn lặp từ 50 token trở lên (EXACTSUBSTR); [C4] bỏ đoạn 3 câu lặp.
- **Khử trùng lặp gần (near-duplicate).** Mỗi tài liệu thành tập shingle (n-gram từ). Độ giống là Jaccard $|A\cap B|/|A\cup B|$. MinHash cho chữ ký $K$ số mà xác suất hai chữ ký trùng ở một vị trí đúng bằng Jaccard; LSH chia chữ ký thành băng để chỉ so các cặp "có vẻ gần". Cấu hình đã công bố: [RW] 9 000 hash trên 5-gram token GPT-2 (sau NFD, bỏ dấu), 450 băng × 20 hàng theo phụ lục G (mục 3.3 lại ghi "20 buckets of 450 hashes", mâu thuẫn; số 76% ở $s=0{,}75$ và 99,4% ở $s=0{,}8$ chỉ khớp 450 × 20); [FW] 5-gram, 112 hash, 14 băng × 8, nhắm tài liệu giống từ 75% trở lên; [LEE] dùng 9 000 hash và 5-gram từ (tách theo khoảng trắng), cùng cấu hình 450 × 20; sau MinHash còn lọc Jaccard thật > 0,8 rồi edit similarity > 0,8.
- **Vì sao khử trùng lặp quan trọng.** [LEE]: hơn 1% văn bản mô hình sinh ra (không prompt) bị chép nguyên từ dữ liệu train; sau khử trùng lặp, mô hình chép lại bộ nhớ ít hơn khoảng 10 lần; có câu 61 từ lặp hơn 60 000 lần trong C4; trùng giữa tập train và tập validation ở hơn 4% mẫu của các bộ chuẩn. Nghĩa là còn ảnh hưởng đến **độ tin cậy của đánh giá**, không chỉ chất lượng mô hình.
- **Khử trùng lặp toàn cục có thể phản tác dụng.** [FW]: khử trùng lặp MinHash trên cả 96 đợt crawl cho 4T token nhưng mô hình train trên đó không tốt hơn dữ liệu chưa khử trùng lặp nhiều; ở snapshot cũ, phần còn lại sau khử (10%) lại tệ hơn phần bị bỏ (90%). Khử riêng từng crawl thì ra 20T token và ngang RefinedWeb. Bài học: "khử nhiều hơn" không tự động là tốt hơn; phải đo.
- **Dữ liệu cá nhân và độc hại.** [FW] ẩn danh email và IP công khai ở bản phát hành. [DOLMA] lọc ngôn ngữ độc hại (bộ phân loại "hate" và "NSFW" huấn luyện trên Jigsaw Toxic Comments) và PII ở mức tài liệu và đoạn con. [C4] dùng danh sách từ xấu. Mọi cách đều **đánh đổi**: lọc mạnh làm mất cả nội dung vô hại hoặc nội dung của cộng đồng ít người viết; lọc nhẹ để lọt dữ liệu nhạy cảm.
- **Trộn nguồn.** Mỗi nguồn có trọng số, và nguồn nhỏ chất lượng cao có thể được lặp nhiều epoch. [PILE] (825 GiB gốc, khoảng 1 254 GiB hiệu dụng sau lặp epoch): Pile-CC 18,11% (1 epoch), PubMed Central 14,40% (2 epoch), Books3 12,07% (1,5 epoch), ArXiv 8,96% (2 epoch), GitHub 7,59% (1 epoch), Wikipedia (en) 1,53% (3 epoch); "Weight" là tỉ lệ byte trong bản cuối đã lấy mẫu lại. Cần nói rõ: tỉ lệ là lựa chọn của người xây dựng, tối ưu cho mục tiêu của họ, không có tỉ lệ đúng chung.
- **Từ văn bản tới chuỗi huấn luyện (packing).** Mô hình nhận chuỗi độ dài cố định $L$. Thay vì đệm (padding) mỗi tài liệu cho đủ $L$, người ta tách token cả tài liệu, nối chúng thành một dòng dài, giữa các tài liệu chèn token kết thúc (EOS), rồi cắt thành các khúc $L$ token. Không lãng phí padding. Hệ quả: một chuỗi chứa nhiều tài liệu; có hai cách xử lý: để mô hình tự học EOS là ranh giới, hoặc dùng **mặt nạ chéo tài liệu** (block-diagonal causal mask) cấm token nhìn sang tài liệu khác. [L3] dùng mặt nạ này, ghi nhận ít ảnh hưởng khi pre-train thường nhưng quan trọng khi pre-train tiếp ở chuỗi rất dài.
- **Tokenizer liên quan.** Tokenizer quyết định "token" là gì, nên cùng văn bản cho số token khác nhau; số token trong các bộ dữ liệu (15T của FineWeb tính theo tokenizer GPT-2, 3T của Dolma tính theo Llama) chỉ so sánh được khi cùng tokenizer. Tokenizer cũng nên được huấn luyện trên dữ liệu đã làm sạch và có phân bố ngôn ngữ giống dữ liệu train (kiến thức chung, chưa có nguồn). Chi tiết BPE thuộc `nlp/tokenization`.

## Công thức quan trọng

Ký hiệu theo site: tập shingle $A, B$; số hàm băm $K$; số băng $b$, số hàng mỗi băng $r$, $K = b\cdot r$; độ dài chuỗi $L$ (khớp với `build-first-llm`).

**Độ giống Jaccard (resemblance):**

$$J(A,B)=\frac{|A\cap B|}{|A\cup B|}$$

**Tính chất của MinHash.** Với hàm băm $h$ ngẫu nhiên, $\Pr\big[\min h(A)=\min h(B)\big]=J(A,B)$. Dùng $K$ hàm độc lập rồi lấy tỉ lệ vị trí trùng nhau, ta được ước lượng của $J$ với sai số cỡ $1/\sqrt{K}$ (ước lượng thống kê, kiến thức chung). Cần giải thích bằng lời vì sao xác suất đúng bằng $J$: phần tử nhỏ nhất của $A\cup B$ nằm ở $A\cap B$ với xác suất $|A\cap B|/|A\cup B|$ (mọi phần tử đều có cơ hội như nhau để có giá trị băm nhỏ nhất).

**Xác suất một cặp có độ giống $s$ thành "cặp ứng viên" khi chia $b$ băng, mỗi băng $r$ hàng** (dạng ở [LEE]):

$$P(\text{ứng viên})=1-(1-s^{r})^{b}$$

Đồ thị theo $s$ có dạng chữ S, "ngưỡng" khoảng $(1/b)^{1/r}$ (xấp xỉ, kiến thức chung). Kiểm bằng số: $b=16$, $r=4$ cho ngưỡng 0,5; ở $s=0{,}5$ xác suất $=1-(1-0{,}0625)^{16}\approx 0{,}64$; ở $s=0{,}9$ xác suất gần 1. [FW]: $b=14$, $r=8$, nhắm $s\ge 0{,}75$. Nói rõ băng nhiều và hàng ít thì bắt nhiều cặp hơn (nhiều cặp sai hơn), ngược lại thì chặt hơn.

**Mặt nạ chéo tài liệu** (gọi $d(i)$ là số thứ tự tài liệu của vị trí $i$; $d(i)$ tăng sau mỗi EOS, EOS thuộc tài liệu mà nó kết thúc):

$$M_{ij}=\begin{cases}0 & j\le i \ \text{và}\ d(i)=d(j)\\ -\infty & \text{ngược lại}\end{cases}$$

Cộng vào điểm attention như ở `build-first-llm`. Với chuỗi 12 token gồm hai tài liệu dài 8 và 4, số ô được nhìn là $\tfrac{8\cdot9}{2}+\tfrac{4\cdot5}{2}=46$, so với $\tfrac{12\cdot13}{2}=78$ của mặt nạ nhân quả thường (đã kiểm bằng code).

## Số tự chạy (Python, 24/10/2026) — bản nháp đã bị thay

> **Đã lỗi thời.** Đây là số của file thử ban đầu (`dd.py`, `zlib.crc32`, 4 câu sau exact). Code trong bài đã viết lại (SHA-1 60 bit, câu khác, $L = 12$ với 3 tài liệu); số đúng nằm ở mục "Kiểm chứng code" bên dưới. Không dùng bảng này cho lời văn.

Chạy bằng venv Pyodide `ai-atlas-py314` (Python 3.14, NumPy), cùng một file thử `dd.py` trong scratchpad (`C:\Users\Dell\AppData\Local\Temp\claude\C--Users-Dell--claude-spares-spare-oouS1w\79a7891d-1d77-4416-b0df-a18c7072fd07\scratchpad\dd.py`), chạy tức thì. Dữ liệu: 5 câu tiếng Việt viết tay (một cặp trùng hoàn toàn, một cặp gần trùng, hai câu khác nhau hoàn toàn, trong đó một câu kiểu spam quảng cáo). Chuẩn hóa NFC, chữ thường, bỏ dấu câu rồi tách từ theo khoảng trắng; shingle là cặp từ liền nhau; MinHash dùng $K=64$ hàm kiểu $(ax+b)\bmod p$ với $p=2^{61}-1$, `np.random.default_rng(0)`; hash của shingle là `zlib.crc32`; LSH 16 băng × 4 hàng.

| Việc | Kết quả |
|---|---|
| Exact (SHA-256 trên văn bản chuẩn hóa) | Câu 1 trùng hoàn toàn câu 0, còn lại 4 câu |
| Jaccard thật / ước lượng MinHash, cặp gần trùng (câu 0 và 2) | 0,64 / 0,69 |
| Cặp khác nhau (ví dụ câu 0 và 3) | 0,06 / 0,05 |
| Cặp hoàn toàn khác (câu 0 và 4) | 0,00 / 0,00 |
| Cặp ứng viên LSH (16 × 4) | chỉ (0, 2) |
| Packing: 80 token (kể cả 4 EOS), $L=12$ | 6 chuỗi, bỏ thừa 8 token cuối |
| Chuỗi chứa ranh giới (chuỗi 1) | `[12 13 14 15 16 17 18 0 1 2 3 4]`, `doc_id = [0 0 0 0 0 0 0 0 1 1 1 1]` |
| Ô được nhìn: mặt nạ nhân quả thường / có tách tài liệu | 78 / 46 |

- **Lưu ý khi viết bài:**
  - Ước lượng 0,69 so với 0,64 thật cho thấy MinHash là **ước lượng có sai số** ($K=64$). Nên để người đọc đổi $K$ và xem sai số giảm; chạy lại với $K$ mới để lấy số.
  - **Không dùng `hash()` có sẵn của Python** cho shingle: hash chuỗi bị "muối" (salt) theo từng lần chạy, nên chữ ký đổi mỗi lần. Đây là điểm dễ nhầm có thật, dùng `zlib.crc32` hay `hashlib`.
  - `int64` tràn khi nhân $a\cdot x$ ($a$ tới $2^{61}$): phép nhân phải dùng số nguyên Python hoặc tham số nhỏ hơn. Code thử dùng `int(...)`.
  - Tập 5 câu quá nhỏ để thấy LSH "tiết kiệm" so sánh; bài nói thẳng đây là minh họa nguyên lý, và độ lệch ước lượng chỉ là một ví dụ, không phải đo lường.
  - File thử cần được `lesson-writer` viết lại gọn (≤ 40 dòng) và chạy lại trong Pyodide; bài ghi số đúng của lần chạy cuối.

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; chỗ có "(gợi ý)" là của `summarizer`.

- **Thư viện sách bị photo (gợi ý):** exact dedup là tìm hai cuốn sách giống từng chữ; near-dup là tìm hai cuốn chỉ khác lời tựa và vài trang. Nếu thủ thư chỉ so từng cuốn một thì mất rất nhiều thời gian; MinHash là cho mỗi sách một "thẻ tóm tắt" nhỏ để so nhanh, LSH là chỉ so các sách có thẻ giống nhau ở một ngăn.
- **Sàng gạo (gợi ý):** lọc heuristic là sàng thô (bỏ sạn dễ thấy), bộ phân loại là sàng tinh nhưng có thể đem cả hạt gạo ngon đi nếu hạt đó trông khác mẫu. Hai kiểu hay dùng chung.
- **Câu lặp 60 000 lần [LEE]:** một câu 61 từ xuất hiện hơn 60 000 lần trong C4; học thuộc nó thì vô ích, nhưng mô hình mất thời gian học. Dùng trực tiếp như mở bài.
- **Băng và hàng (gợi ý):** hàng là "phải giống nhau ở cả $r$ chỗ cùng lúc" (chặt), băng là "có nhiều cơ hội thử" (lỏng). Hai tham số kéo ngược nhau; kết hợp thành đường cong chữ S tách cặp giống nhiều khỏi cặp giống ít.
- **Ví dụ bất ngờ của [FW]:** khử trùng lặp trên toàn bộ làm mất 90% dữ liệu cũ nhưng phần còn lại lại tệ hơn. Dùng để nói "đo trên mô hình, đừng tin vào con số dữ liệu đã bỏ".
- **Xếp ghế buổi họp (gợi ý) cho packing:** padding là mỗi người chiếm một hàng ghế dù chỉ có một người; packing là xếp người liền nhau, nhưng giữa hai nhóm bạn cần một vách ngăn (EOS), và mặt nạ chéo tài liệu là cấm hai nhóm nghe cuộc trò chuyện của nhau.
- **Cho người đọc tự chạy (đề xuất ô `PythonRunner`):** (1) exact dedup trên vài câu; (2) MinHash với $K$ có thể đổi, in Jaccard thật cạnh ước lượng; (3) packing với EOS và in `doc_id` cùng mặt nạ. Mỗi phần ngắn, cả ô ≤ 40 dòng, chỉ thư viện chuẩn và NumPy.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Nghĩ khử trùng lặp là lọc dữ liệu "bẩn".** Nó xử lý dữ liệu lặp, không xử lý dữ liệu sai hay độc hại. Cùng một tài liệu độc hại, giữ một bản vẫn còn độc hại.
2. **Nghĩ khử nhiều hơn thì luôn tốt hơn** [FW]: khử toàn cục thí nghiệm của họ không cải thiện.
3. **Chỉ khử exact.** Đổi một dấu cách, một ngày tháng hay một dòng quảng cáo thì hash khác hẳn, bản "gần như y hệt" vẫn lọt. Cần near-dup.
4. **Tin MinHash cho kết quả đúng tuyệt đối.** Đó là ước lượng và LSH là sàng: có bỏ sót cặp giống và có cặp "ứng viên" sai; chọn $b,r$ phải so với ngưỡng mong muốn.
5. **Dùng `hash()` của Python làm hash.** Giá trị đổi mỗi lần chạy (salt), nên chữ ký không lặp lại được.
6. **Lọc heuristic quá tay.** Luật "phải có dấu chấm cuối dòng" bỏ thơ, danh sách, code; luật "bỏ trang có `{`" bỏ cả code, LaTeX. Luật của C4 viết cho văn xuôi tiếng Anh; tiếng Việt có cách chấm câu và dấu khác nên phải kiểm chứng trước khi dùng (kiến thức chung, nên có ví dụ trong bài hoặc nói như một cảnh báo).
7. **Nhầm "bộ phân loại chất lượng" với "bộ phân loại đúng sai".** Nó học theo dữ liệu mẫu "tốt", nên thiên kiến theo mẫu.
8. **Quên chuẩn hóa Unicode (NFC) trước khi băm.** Cùng chữ có dấu, hai cách mã hóa, hai hash khác nhau, exact dedup bỏ sót. Nối với `build-first-llm` (lỗi Unicode ở bigram).
9. **Để dữ liệu kiểm tra lọt vào dữ liệu train (test contamination).** [LEE] ghi trùng tập train và validation ở hơn 4% mẫu của các bộ chuẩn; phải khử trùng lặp giữa train và test.
10. **Packing không xử lý ranh giới.** Không có EOS hoặc mặt nạ, token đầu tài liệu sau có thể "nhìn" tài liệu trước; không phải lỗi gây sập, nhưng nên biết lựa chọn. [L3] nói tác động nhỏ ở pre-train thường.
11. **Nhầm số token giữa các bộ dữ liệu.** Mỗi bộ đếm bằng một tokenizer; 15T và 3T không cùng thước đo.
12. **Cho rằng "dữ liệu web công khai nên dùng thoải mái".** Nguồn nào cũng có điều kiện sử dụng; bài chỉ nhắc kiểm tra và không đưa lời khuyên pháp lý.
13. **Tỉ lệ trộn có "đáp án đúng".** Các tỉ lệ ở [PILE] là một lựa chọn; nguồn nhỏ chất lượng cao có thể lặp nhiều epoch, nhưng lặp nhiều quá thì quay về vấn đề bộ nhớ (cần tra nguồn nếu bài muốn nói chi tiết).

## Điểm cần phiên chính chốt (câu hỏi cho người dùng)

1. **Có nhắc Books3 và vấn đề bản quyền không.** Đề xuất: chỉ nhắc chung ở mục "Lỗi hay gặp", không nêu Books3 (chưa tra tình trạng hiện tại).
2. **Mức đi sâu vào mảng hậu tố (suffix array).** Đề xuất: một câu nhắc ([LEE], [RW]), không giải thích thuật toán.
3. **Dữ liệu tiếng Việt.** Chưa có nguồn tra cho bộ dữ liệu pre-train tiếng Việt (không tra trong lần này). Đề xuất: bài không nêu bộ nào; nếu muốn, giao một lượt tra riêng trước khi viết.

## Liên quan tới bài nào

- **Cần biết trước:** `llm/build-first-llm` (token, cross-entropy, mặt nạ nhân quả, loss train và validation, chuẩn hóa NFC).
- **Liên quan:** `nlp/tokenization` (tokenizer và số token); `ml/overfitting-underfitting` (train/test và rò rỉ dữ liệu); `llm/gpt-family-finetuning` (dữ liệu và mục tiêu GPT); `llm/llama-family` (nối [L3] về ngữ cảnh dài); `llm/rlhf` và `llm/text-api` (nối "mô hình được huấn luyện cho khớp văn bản"); `llm/web-crawling-mongodb` hoặc bài thu thập dữ liệu (nguồn dữ liệu, nếu có trong roadmap).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Khử trùng lặp | Deduplication | Dịch, gloss lần đầu; "dedup" khi nói tắt |
| Trùng lặp gần | Near-duplicate | Dịch, gloss |
| Shingle | Shingle | Giữ nguyên, giải thích là "n-gram của từ" |
| Chữ ký MinHash | MinHash signature | Giữ "MinHash" |
| Băm nhạy vị trí (LSH) | Locality-sensitive hashing | Giữ "LSH"; dịch "băm nhạy độ giống" khi giải thích |
| Độ giống Jaccard | Jaccard similarity | Dịch |
| Đóng gói chuỗi | Sequence packing | Dịch, giữ "packing" |
| Token kết thúc | End-of-sequence (EOS) token | Giữ "EOS" |
| Mặt nạ chéo tài liệu | Cross-document attention mask | Dịch |
| Dữ liệu định danh cá nhân | PII (personally identifiable information) | Giữ "PII" |
| Rò rỉ dữ liệu kiểm tra | Test-set contamination | Dịch |
| Bộ phân loại chất lượng | Quality classifier | Dịch |

## Đọc thêm đề xuất

1. **Lee và cộng sự (2022)**, [arXiv:2107.06499](https://arxiv.org/abs/2107.06499). Đã đọc mục 4, phần khử trùng lặp.
2. **Penedo và cộng sự (2024)**, FineWeb, [arXiv:2406.17557](https://arxiv.org/abs/2406.17557). Đã đọc mục 3-4, rất đáng đọc vì ghi thí nghiệm.
3. **Penedo và cộng sự (2023)**, RefinedWeb, [arXiv:2306.01116](https://arxiv.org/abs/2306.01116). Đã đọc mục 3.
4. **Raffel và cộng sự (2020)**, mục 2.2, [arXiv:1910.10683](https://arxiv.org/abs/1910.10683). Danh sách luật của C4.
5. **Soldaini và cộng sự (2024)**, Dolma, [arXiv:2402.00159](https://arxiv.org/abs/2402.00159), và **Gao và cộng sự (2020)**, The Pile, [arXiv:2101.00027](https://arxiv.org/abs/2101.00027).
6. **datatrove**, [GitHub](https://github.com/huggingface/datatrove) (Apache-2.0): thư viện thực hành, chỉ nhắc tên.

## Kiểm chứng code

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `dedup.vi.py`, `dedup.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật (Python 3.14.2, NumPy 2.4.6) qua `runpyo.mjs`; `ast.parse(feature_version=(3, 10))` bằng `.venv-llm` | Hai bản cho output giống hệt. `after exact: [0, 2, 3, 4]`; cặp 0-2: J = 0.81, MinHash = 0.84, ứng viên; 0-3: 0.10/0.11; 2-3: 0.10/0.09; cặp có spam 0.00. Biến thể (chạy thật): `K, r = 256, 4` cho 0.82; `K, r = 64, 16` làm cặp 0-2 không còn là ứng viên; bỏ chuẩn hóa NFC thì câu 1 không bị khử và J(0, 1) = 0.00 (công thức cho cặp 0-2 ở 64, 16: 0.13). content-reviewer chạy lại bản vi và en trên Pyodide 314.0.7 thật, khớp. Khớp lời văn |
| `packing.vi.py`, `packing.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật (Python 3.14.2, NumPy 2.4.6) qua `runpyo.mjs`; `ast.parse(feature_version=(3, 10))` bằng `.venv-llm` | Hai bản cho output giống hệt. Độ dài 16, 10, 13; padding 5 chuỗi, 21 token đệm; packing 3 chuỗi, thừa 3; chuỗi thứ hai `nghìn năm tuổi <eos> phở ...`, `doc = [0 0 0 0 1 ... 1]`; ô được nhìn 78 / 46; hàng 4 chỉ có một số 1. content-reviewer chạy lại bản vi và en trên Pyodide 314.0.7 thật, khớp. Khớp lời văn |
