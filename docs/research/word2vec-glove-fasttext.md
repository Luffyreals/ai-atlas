# Word2Vec (CBOW, Skip-gram), GloVe, FastText

Bài: `nlp/word2vec-glove-fasttext` (chỉ bản vi, khoảng 12 phút đọc). Bài cần biết trước trong roadmap: `nlp/vector-semantics-embeddings` (xuất bản cùng PR), `dl/neural-networks` (chưa có, nên bài có khối "Nhắc nhanh"). Hình: FIG mới `Word2VecFigure` (comment giữ chỗ). Hai ô `PythonRunner`, không có `LocalCode`.

Ngày tra: **05/11/2026**. Cách tra: WebFetch trang arXiv, ACL Anthology, NeurIPS proceedings, fasttext.cc, trang SLP3; tải PDF rồi trích chữ bằng `pdftotext` (Mikolov 2013a, 2013b, GloVe, FastText, Levy & Goldberg, SLP3 chương 5). Ý không có thẻ nguồn là kiến thức chung hoặc tự tính.

## Nguồn

- **[M13a]** Mikolov, T., Chen, K., Corrado, G., Dean, J. (2013). [*Efficient Estimation of Word Representations in Vector Space*](https://arxiv.org/abs/1301.3781). arXiv:1301.3781 (v1 16/1/2013, v3 7/9/2013). Đã đọc mục 3 (CBOW, skip-gram), 4 (bộ câu hỏi tương tự, Bảng 6).
- **[M13b]** Mikolov, T., Sutskever, I., Chen, K., Corrado, G., Dean, J. (2013). [*Distributed Representations of Words and Phrases and their Compositionality*](https://arxiv.org/abs/1310.4546). arXiv:1310.4546; trang arXiv không ghi hội nghị, thường dẫn là NIPS 2013 (NeurIPS). Đã đọc mục 2, 2.2, 2.3, 3.
- **[P14]** Pennington, J., Socher, R., Manning, C. D. (2014). [*GloVe: Global Vectors for Word Representation*](https://aclanthology.org/D14-1162/). EMNLP 2014, Doha, tr. 1532–1543. Đã đọc mục 3 (Bảng 1, phương trình 8–9) và đoạn dùng $W + \tilde{W}$.
- **[B17]** Bojanowski, P., Grave, E., Joulin, A., Mikolov, T. (2017). [*Enriching Word Vectors with Subword Information*](https://arxiv.org/abs/1607.04606). TACL (trang arXiv ghi "accepted to TACL"); arXiv v1 15/7/2016. Đã đọc mục 3.1, 3.2, 4.
- **[LG14]** Levy, O., Goldberg, Y. (2014). [*Neural Word Embedding as Implicit Matrix Factorization*](https://proceedings.neurips.cc/paper/2014/hash/b78666971ceae55a8e87efb7cbfd9ad4-Abstract.html). NIPS 2014 (NeurIPS 27), tr. 2177–2185. Đã đọc mục 3.1 (phương trình 7) và 4.1 (SPPMI).
- **[BO16]** Bolukbasi, T., Chang, K.-W., Zou, J., Saligrama, V., Kalai, A. (2016). [*Man is to Computer Programmer as Woman is to Homemaker? Debiasing Word Embeddings*](https://proceedings.neurips.cc/paper/2016/hash/a486cd07e4ac3d270571622f4f316ec5-Abstract.html). NIPS 2016; arXiv:1607.06520. Mới đọc tóm tắt.
- **[G18]** Grave, E., Bojanowski, P., Gupta, P., Joulin, A., Mikolov, T. (2018). [*Learning Word Vectors for 157 Languages*](https://aclanthology.org/L18-1550/). LREC 2018 (ACL Anthology L18-1550; arXiv [1802.06893](https://arxiv.org/abs/1802.06893)). Trang tải: [fasttext.cc/docs/en/crawl-vectors.html](https://fasttext.cc/docs/en/crawl-vectors.html): CBOW có trọng số vị trí, 300 chiều, n-gram ký tự dài 5, cửa sổ 5, 10 mẫu âm; có tiếng Việt `cc.vi.300.bin` / `.vec`; giấy phép CC BY-SA 3.0. Trang ghi: "UETsegmenter for Vietnamese" (văn bản tiếng Việt được tách từ trước khi học).
- **[LGD15]** Levy, O., Goldberg, Y., Dagan, I. (2015). [*Improving Distributional Similarity with Lessons Learned from Word Embeddings*](https://aclanthology.org/Q15-1016/). TACL 3. Dùng cho ý: mẫu âm mũ 3/4 tương ứng làm trơn phân phối ngữ cảnh $P_{0.75}(c)$ trong PMI. Mới mở trang tóm tắt; nội dung làm trơn khớp bài `vector-semantics-embeddings`.
- **[GG19]** Gonen, H., Goldberg, Y. (2019). [*Lipstick on a Pig: Debiasing Methods Cover up Systematic Gender Biases in Word Embeddings But do not Remove Them*](https://aclanthology.org/N19-1061/). NAACL 2019. Mới mở trang tóm tắt; ý "che bớt, không xóa" lấy từ tiêu đề và SLP3 mục 5.8.
- **[SLP3]** Jurafsky, D., Martin, J. H. *Speech and Language Processing*, bản nháp 19/8/2026, [chương 5 "Embeddings"](https://web.stanford.edu/~jurafsky/slp3/5.pdf). Bản nháp này đánh số lại: chương embedding là **5**, không còn là 6 như các bản trước. Đã đọc mục 5.5–5.8.

## Ý chính dùng trong bài

- Skip-gram gốc dùng softmax trên cả từ vựng; [M13b] nói chi phí tỉ lệ với $W$ (cỡ từ vựng), "often large ($10^5$–$10^7$ terms)", nên "impractical". Softmax phân cấp chỉ cần khoảng $\log_2 W$ nút.
- [M13b] mục 3: dữ liệu tin tức nội bộ của Google, một tỉ từ, bỏ từ gặp dưới 5 lần, từ vựng 692K.
- Negative sampling [M13b] mục 2.2: phân biệt từ đích với $k$ mẫu từ phân phối nhiễu bằng hồi quy logistic; $k$ từ 5 tới 20 cho dữ liệu nhỏ, 2 tới 5 cho dữ liệu lớn; phân phối nhiễu tốt nhất là unigram mũ 3/4.
- Subsampling [M13b] mục 2.3: bỏ mỗi lần xuất hiện với xác suất $1 - \sqrt{t/f(w_i)}$, $t$ khoảng $10^{-5}$; tăng tốc nhiều lần và cải thiện vectơ từ hiếm.
- Phép tương tự [M13b] mục 3: tìm $x$ gần nhất theo cosine với vec("Berlin") − vec("Germany") + vec("France"), "we discard the input words from the search".
- CBOW [M13a] mục 3.1: vectơ ngữ cảnh được lấy trung bình ("their vectors are averaged"), tốt nhất với 4 từ trước và 4 từ sau. Skip-gram mục 3.2: với $C$ là khoảng cách tối đa, chọn ngẫu nhiên $R$ trong $[1, C]$ cho mỗi từ, nên từ xa được dùng ít hơn.
- [M13a] Bảng 6 (1000 chiều, 6 tỉ từ, DistBelief): CBOW 57.3% nghĩa / 68.9% ngữ pháp / 63.7% tổng; skip-gram 66.1% / 65.1% / 65.6%.
- [M13a] nhắc ví dụ vector("King") − vector("Man") + vector("Woman") gần vector("Queen"), dẫn Mikolov, Yih, Zweig (2013).
- GloVe [P14]: $J = \sum f(X_{ij})(w_i^\top \tilde{w}_j + b_i + \tilde{b}_j - \log X_{ij})^2$; $f(x) = (x/x_{\max})^\alpha$ nếu $x < x_{\max}$, ngược lại 1; $x_{\max} = 100$, $\alpha = 3/4$; $f(0) = 0$. Ô 0 chiếm 75–95% của $X$. Bảng 1: tỉ số $P(k|\text{ice})/P(k|\text{steam})$ = 8.9 (solid), $8.5 \times 10^{-2}$ (gas), 1.36 (water), 0.96 (fashion). Vectơ cuối là $W + \tilde{W}$.
- FastText [B17]: thêm `<` `>`; n-gram từ 3 tới 6; thêm chính từ làm chuỗi đặc biệt; từ = tổng vectơ n-gram; băm FNV-1a vào $K = 2 \cdot 10^6$ ô; từ chưa gặp = tổng vectơ n-gram. Mở đầu lấy ví dụ tiếng Phần Lan (15 cách cho danh từ); đánh giá trên tiếng Ả Rập, Séc, Đức, Anh, Pháp, Tây Ban Nha, Ý, Romania, Nga.
- Mã nguồn `fasttext` ([`src/dictionary.cc`](https://github.com/facebookresearch/fastText/blob/main/src/dictionary.cc), hàm `Dictionary::hash`, đã đọc ngày 05/11/2026): hàm băm ép từng byte sang `int8` trước khi XOR, nên với byte ≥ 128 (chữ có dấu) kết quả khác FNV-1a "sạch" trong ô code. Vì vậy comment trong code ghi "FastText dùng một biến thể". Thư viện lấy trung bình vectơ n-gram thay cho tổng.
- [LG14]: SGNS tối ưu khi $w \cdot c = \mathrm{PMI}(w, c) - \log k$ (giả thiết số chiều đủ lớn, mẫu âm theo unigram **thường**; $\log$ là logarit tự nhiên); đề xuất SPPMI $= \max(\mathrm{PMI} - \log k, 0)$; SVD trên SPPMI. Với mẫu âm mũ 3/4, $P(c)$ thay bằng phân phối làm trơn [LGD15]. Bài dùng $\ln$; bài `vector-semantics-embeddings` dùng $\log_2$ và đã nói hai bài khác cơ số.
- Ký hiệu trong bài (theo review): tần suất tương đối $P(w)$ và ngưỡng $\tau$ cho subsampling (bài báo viết $f(w_i)$ và $t$, nhưng $f$ để dành cho trọng số GloVe); hàm mất mát GloVe $\mathcal{L}_{\text{GloVe}}$ (bài báo gọi $J$).
- [BO16]: vectơ word2vec học trên Google News mang định kiến giới; thiên lệch nằm gần một hướng; đề xuất cách chiếu bớt.
- [SLP3] mục 5.7: phép tương tự thường trả về một từ đầu vào hoặc biến thể nên phải loại; chỉ tốt với vài loại quan hệ. Mục 5.8: debias giảm nhưng không xóa thiên lệch (Gonen và Goldberg 2019), vấn đề còn mở.

## Số tự tính

| Số | Cách tính | Dùng ở |
|---|---|---|
| ≈ 115 000 | $692\,000 / (5 + 1)$ | so softmax với SGNS |
| ≈ 106 | $500^{3/4} = 105.7$ | ví dụ mũ 3/4 |
| 96.8% | $1 - \sqrt{10^{-5}/0.01}$ | subsampling từ chiếm 1% |
| 0 | $1 - \sqrt{10^{-5}/10^{-5}}$ | subsampling từ tần suất $10^{-5}$ |
| 0.03, 0.18, 1 | $f(1)$, $f(10)$, $f(100)$ với $x_{\max} = 100$, $\alpha = 3/4$ | hàm trọng số GloVe |
| 2.77 | $4 \ln 2$ | loss ban đầu, $k = 3$ |
| 1/6 | $\sigma(-\ln 5)$ | quiz câu 2 |
| `<ng` | n-gram chung của "người" (NFC) và "nguoi" bằng hàm `ngrams` của bài; "người" dạng NFD thì chung `<ng`, `<ngu`, `ngu`. Bài tách hai ý: không dấu là chuỗi khác hẳn; NFC và NFD của cùng chữ cho n-gram khác nhau | đoạn tiếng Việt của FastText |
| ≈ 0.27 | $6/22$ | cosine kỳ vọng ở ô FastText |

## Kiểm chứng code

Do `lesson-writer` chạy ngày 2026-11-05, thư mục làm việc ở scratchpad. Cả bốn file qua `ast.parse(..., feature_version=(3, 10))`; mỗi cặp `.vi.py`/`.en.py` giống hệt nhau (`cmp`).

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `skipgram-ns.vi.py`, `skipgram-ns.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2, NumPy 2.4.6) | 56 dòng, dòng dài nhất 75 ký tự, 0.48–1.2 s. Sau review chỉ đổi comment dòng 1 ("kho văn bản"), chạy lại cùng ngày, output y hệt. 180 câu, 40 từ, 2604 cặp. Loss 2.751 / 1.671 / 1.238 / 1.164 / 1.132 (epoch 0/3/6/9/12); `cos(mèo, phở) = 0.28`; `mèo -> vịt 0.99, gà 0.98, chó 0.97`; `phở -> cơm 0.99, cháo 0.99, bún 0.96`; `trà -> bia 0.96, nước 0.96, sữa 0.95`. Khớp lời văn. Với seed 1 và 2 (CPython, cùng code), hàng xóm gần nhất vẫn cùng nhóm |
| `fasttext-ngrams.vi.py`, `fasttext-ngrams.en.py` | chạy thật | 2026-11-05 | như trên | 37 dòng, dòng dài nhất 72 ký tự, 0.55–0.8 s. `['<nh', 'nhà', 'hà>', '<nhà', 'nhà>', '<nhà>']`; `22 n-grams for nhà_văn`; shared/cos: nhà_thơ 6 / 0.35, nhà_báo 6 / 0.27, văn_học 1 / 0.05, con_mèo 0 / -0.00. Khớp lời văn |
