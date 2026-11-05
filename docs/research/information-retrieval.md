# Truy xuất thông tin (Information Retrieval)

Bài: `nlp/information-retrieval` (chỉ bản vi, khoảng 12 phút đọc). Bài cần biết trước trong roadmap: `nlp/vector-semantics-embeddings` (xuất bản cùng PR, nên chỉ nhắc một câu rồi link, không có khối "Nhắc nhanh"). Không dạy lại: `llm/rag-chatbot` (cosine, kho vectơ, hit rate). Hai ô `PythonRunner`, không có `LocalCode`. Minh họa: bảng chỉ mục ngược lấy từ ô code thứ nhất.

Ngày tra: **05/11/2026**. Cách tra: WebFetch/WebSearch trang nhà xuất bản và arXiv; tải PDF rồi trích chữ bằng `pypdf` (R&Z 2009, Cormack 2009, DPR, Nogueira & Cho). Ý không có thẻ nguồn là kiến thức chung hoặc tự tính.

## Nguồn

- **[MRS08]** Manning, C. D., Raghavan, P., Schütze, H. (2008). [*Introduction to Information Retrieval*](https://nlp.stanford.edu/IR-book/). Cambridge University Press, bản HTML/PDF miễn phí. Ngày tra, trang Stanford từ chối kết nối HTTPS từ máy (ECONNREFUSED); WebSearch xác nhận trang mục "Okapi BM25: a non-binary model" ở `nlp.stanford.edu/IR-book/html/htmledition/okapi-bm25-a-non-binary-model-1.html`. Dùng cho: chỉ mục ngược, posting list, giao posting list bằng hai con trỏ, truy xuất Boolean (chương 1), TF-IDF (chương 6), đánh giá (chương 8), BM25 (chương 11).
- **[JM]** Jurafsky, D., Martin, J. H. [*Speech and Language Processing*](https://web.stanford.edu/~jurafsky/slp3/), bản nháp lần 3 ngày 19/8/2026. Đã mở trang: chương 11 tên "Information Retrieval and RAG".
- **[RZ09]** Robertson, S., Zaragoza, H. (2009). [*The Probabilistic Relevance Framework: BM25 and Beyond*](https://www.nowpublishers.com/article/Details/INR-019). Foundations and Trends in IR 3(4): 333–389, DOI 10.1561/1500000019. Đã đọc bản PDF của tác giả (`staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf`), mục 3.1–3.5.
- **[JK02]** Järvelin, K., Kekäläinen, J. (2002). *Cumulated Gain-Based Evaluation of IR Techniques*. ACM TOIS 20(4): 422–446, DOI [10.1145/582415.582418](https://doi.org/10.1145/582415.582418). Xác nhận thông tin qua WebSearch (DBLP, kho Tampere); chưa đọc toàn văn.
- **[K20]** Karpukhin, V. và cộng sự (2020). [*Dense Passage Retrieval for Open-Domain Question Answering*](https://arxiv.org/abs/2004.04906). EMNLP 2020. Đã đọc PDF: mục 3 (bi-encoder), 3.2 (negatives), 5.1 (kết quả).
- **[NC19]** Nogueira, R., Cho, K. (2019). [*Passage Re-ranking with BERT*](https://arxiv.org/abs/1901.04085). arXiv:1901.04085 (v5 4/2020). Đã đọc PDF mục 2–3.
- **[CCB09]** Cormack, G. V., Clarke, C. L. A., Büttcher, S. (2009). *Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods*. SIGIR 2009, tr. 758–759, DOI [10.1145/1571941.1572114](https://doi.org/10.1145/1571941.1572114). Đã đọc PDF của tác giả (`cormack.uwaterloo.ca/cormacksigir09-rrf.pdf`).
- **[JDJ19]** Johnson, J., Douze, M., Jégou, H. (2019). [*Billion-scale similarity search with GPUs*](https://arxiv.org/abs/1702.08734). arXiv nộp 2/2017; bản tạp chí IEEE Transactions on Big Data 2019 (theo trích dẫn thường gặp, trang arXiv không ghi). DPR dẫn bản "Johnson et al., 2017". Bài chỉ nhắc một câu.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Số mục BM25 trong [MRS08] | Bản nháp 2007 ghi 11.4.2; bản in có thể là 11.4.3. Không mở được trang Stanford | Bài ghi "chương 11 (mục Okapi BM25)", không ghi số mục |
| Năm và nơi đăng [JDJ19] | arXiv không ghi tạp chí | Bài ghi "arXiv 2017, bản tạp chí IEEE Transactions on Big Data 2019", link arXiv |
| Lucene dùng idf có `1 +` và bỏ $(k_1 + 1)$ ở tử | Kiến thức chung (lớp `BM25Similarity`; bỏ $(k_1+1)$ từ khoảng bản 8), chưa mở mã nguồn ngày tra | Bài viết "Nhiều thư viện, như Lucene (lõi của Elasticsearch), thêm $1 +$" và "Lucene là một ví dụ, nó tính phần tần suất không nhân $(k_1 + 1)$ ở tử" (không ghi số phiên bản) |
| BM25 ra đời từ Okapi ở City University, thập niên 1990 | Kiến thức chung; [RZ09] mục 3.5.1 nhắc "the original BM25 [46]" | Giữ câu ở mức chung |
| Biến thể chiết khấu gốc của nDCG | [JK02] chia cho $\log_b i$ từ vị trí $b$ trở đi, $b$ là tham số (thường 2, nên hai vị trí đầu không bị chiết khấu); reviewer xác nhận ngày 05/11/2026 | Bài ghi đúng như vậy, và nói $\log_2(i+1)$ là dạng thông dụng về sau |

## Ý chính dùng trong bài

- **BM25 [RZ09].** Mục 3.4.2: bão hòa, đóng góp của một từ không vượt một giới hạn dù tf lớn. Mục 3.4.5: $B = (1 - b) + b \cdot dl/avdl$, $0 \le b \le 1$; $b = 1$ chuẩn hóa hoàn toàn, $b = 0$ tắt; độ dài có thể đo bằng nhiều cách mà kết quả gần nhau. Công thức (3.15): $\frac{tf}{k_1 B + tf} w^{RSJ}$. Mục 3.5: khuyến nghị $0.5 < b < 0.8$ và $1.2 < k_1 < 2$; mô hình không cho cách chọn tham số. Mục 3.5.1: biến thể thêm $(k_1 + 1)$ ở tử không đổi thứ hạng, chỉ để một lần xuất hiện có cùng trọng số với RSJ. Công thức (3.3): $w^{IDF} = \log \frac{N - n_i + 0.5}{n_i + 0.5}$ (khi không có thông tin liên quan).
- **RRF [CCB09].** $\mathrm{RRFscore}(d) = \sum_{r \in R} \frac{1}{k + r(d)}$, "k = 60 was fixed during a pilot investigation"; bảng 1: MAP gần như phẳng với $k$ từ 10 tới 100, "the choice was not critical". Bài đổi tên hằng số thành $c$ để khỏi trùng $k$ của top-$k$.
- **DPR [K20].** Hai bộ mã hóa BERT-base (uncased), vectơ `[CLS]`, $d = 768$, điểm là tích vô hướng; lập chỉ mục bằng FAISS. Negatives: in-batch (gold passage của câu hỏi khác) cộng một đoạn BM25 không chứa câu trả lời. Tóm tắt: hơn BM25 "9%-19% absolute" top-20. Mục 5.1: "With the exception of SQuAD, DPR performs consistently better than BM25"; lý do: người chấm viết câu hỏi sau khi nhìn đoạn văn nên trùng chữ nhiều, và dữ liệu chỉ từ hơn 500 bài Wikipedia. BM25 của họ dùng Lucene với $b = 0.4$, $k_1 = 0.9$.
- **Cross-encoder [NC19].** Truy vấn là câu A, đoạn văn là câu B, vectơ `[CLS]` qua một lớp để ra xác suất liên quan; BERT-large; xếp lại top-1000 của BM25 trên MS MARCO; tóm tắt: hơn kết quả tốt nhất trước đó 27% (tương đối) về MRR@10.

## Số tự tính

Kho 10 câu FAQ (bản trong `bm25.vi.py`), $N = 10$, độ dài lần lượt 14, 14, 16, 12, 11, 13, 13, 14, 11, 13, $\mathrm{avgdl} = 13.1$, từ vựng 84 từ. $k_1 = 1.2$, $b = 0.75$.

| Mục | Giá trị |
|---|---|
| idf (dạng $1 +$) với $n = 1, 2, 3, 5, 6$ | 1.992, 1.482, 1.145, 0.693, 0.526 |
| idf dạng [RZ09] với $n = 6$ ("hàng") | $\ln(4.5/6.5) = -0.368$ |
| Phần tần suất khi $B = 1$, tf = 1, 2, 3, 5, 10, 100 | 1.000, 1.375, 1.571, 1.774, 1.964, 2.174 |
| "hàng" ở văn bản 6 (tf 3, dài 13) | $B = 0.9943$, phần tf 1.574, điểm 0.828 |
| "hàng" ở văn bản 3 (tf 2, dài 12) / văn bản 2 (tf 2, dài 16) | 0.741 / 0.681 |
| Văn bản 5 với "bt200 có giảm giá không" | 1.9987 + 1.4862 + 1.9987 = 5.484 |
| Quiz 1 ($b = 0$): tf 1 → 10 | 1.000 → 1.964 |
| Danh sách B (7, 4, 6, 1, 3), mức liên quan 7:2, 1:1, 4:1 | P@3 0.667, R@3 0.667, R@5 1, RR 1, AP 0.917, DCG@5 3.062, IDCG@5 3.131, nDCG@5 0.978 |
| Danh sách A (6, 3, 2, 4, 8) | P@3 0, R@5 0.333, RR 0.25, AP 0.083, nDCG@5 0.138 |
| RRF ($c = 60$) của A và B | 6: 0.0323, 4: 0.0318, 3: 0.0315, 7: 0.0164, 2: 0.0159, 1: 0.0156, 8: 0.0154 |
| Quiz 3 (MRR) | $(1 + 1/3 + 0)/3 = 0.444$ |

Ghi chú: TF-IDF cosine trong ô 1 viết lại cách mặc định của `TfidfVectorizer` (`smooth_idf=True`, `sublinear_tf=False`, chuẩn L2) bằng Python thuần. Bản đầu dùng scikit-learn cho cùng số (0.533, 0.464; 0.441, 0.111, 0.104), nhưng chỉ riêng `import sklearn` mất 24–29 s trong `runpyo.mjs`, nên đổi sang Python thuần (dưới 20 ms).

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc ở scratchpad. Cả bốn file qua `ast.parse(..., feature_version=(3, 10))`; `.en.py` là bản sao y nguyên của `.vi.py`. Sau review: đổi tên biến `d` thành `doc` ở cả hai ô (lời văn tránh chữ $d$ cho văn bản), chạy lại, output không đổi.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `bm25.vi.py`, `bm25.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2), chỉ thư viện chuẩn | 59 dòng, dòng dài nhất 77 ký tự, chạy 16–29 ms. `N = 10, avgdl = 13.1`; posting list "hàng" `{0: 1, 2: 2, 3: 2, 4: 1, 6: 3, 8: 1}`; BM25: q1 `[(7, 6.82), (1, 6.26)]`, q2 `[(5, 5.48), (9, 1.49), (8, 1.23)]`, q3 `[(6, 0.83), (3, 0.74), (2, 0.68)]`; TF-IDF cùng thứ tự. Khớp lời văn và bảng Minh họa |
| `metrics.vi.py`, `metrics.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2), chỉ thư viện chuẩn | 46 dòng, dòng dài nhất 74 ký tự, chạy 12–126 ms. A: P@3 0.000, R@3 0.000, R@5 0.333, RR 0.250, AP 0.083, nDCG@5 0.138; B: 0.667, 0.667, 1.000, 1.000, 0.917, 0.978. Khớp phép tính tay ở mục Đánh giá |
