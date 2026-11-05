# Phân tích cảm xúc: nguồn tham khảo

Bài: `src/content/docs/vi/nlp/sentiment-analysis.mdx`. Viết ngày 05/11/2026 (lesson-writer, quyết định 72). Mọi link dưới đây đã mở được ngày viết.

## Nguồn

| Nguồn | Link | Dùng trong bài |
|---|---|---|
| Pang, B., Lee, L., Vaithyanathan, S. (2002). *Thumbs up? Sentiment Classification using Machine Learning Techniques*. EMNLP 2002, tr. 79–86 | https://aclanthology.org/W02-1011/ | Danh sách từ do người chọn: 58%, 64%, 69% (Hình 1, 2). NB/ME/SVM: 72.8–82.9% tùy cấu hình (Hình 3); unigram có mặt: NB 81.0, SVM 82.9; unigram+bigram: NB 80.6, SVM 82.7 (bigram không giúp trên bài phê bình phim dài). Gắn thẻ `NOT_` cho mọi từ từ từ phủ định tới dấu câu đầu tiên. Hiện tượng "thwarted expectations" |
| Wang, S., Manning, C. D. (2012). *Baselines and Bigrams: Simple, Good Sentiment and Topic Classification*. ACL 2012 (short), tr. 90–94 | https://aclanthology.org/P12-2018/ | Tóm tắt: thêm bigram cho lợi ích ổn định ở bài toán cảm xúc; với đoạn ngắn NB tốt hơn SVM |
| Liu, B. (2012). *Sentiment Analysis and Opinion Mining*. Synthesis Lectures on Human Language Technologies, Morgan & Claypool | https://doi.org/10.2200/S00416ED1V01Y201204HLT016 | Ba mức phân tích (văn bản, câu, thực thể/khía cạnh); ý kiến là bộ năm (thực thể, khía cạnh, cảm xúc, người nêu, thời điểm); câu so sánh |
| Socher, R. và cộng sự (2013). *Recursive Deep Models for Semantic Compositionality Over a Sentiment Treebank*. EMNLP 2013, tr. 1631–1642 | https://aclanthology.org/D13-1170/ | SST: nhãn cảm xúc cho 215 154 cụm từ trong cây cú pháp của 11 855 câu; hai nhãn: 80% → 85.4%; phủ định và phạm vi phủ định |
| Pontiki, M. và cộng sự (2014). *SemEval-2014 Task 4: Aspect Based Sentiment Analysis* | https://aclanthology.org/S14-2004/ | ABSA: nhận xét nhà hàng và laptop, khía cạnh và cảm xúc theo khía cạnh |
| Devlin, J. và cộng sự (2019). *BERT*. NAACL 2019 | https://aclanthology.org/N19-1423/ | Fine-tune phân loại câu từ `[CLS]` |
| Sanh, V. và cộng sự (2019). *DistilBERT* | https://arxiv.org/abs/1910.01108 | Mô hình dùng ở ô `LocalCode` |
| Model card `distilbert/distilbert-base-uncased-finetuned-sst-2-english` | https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english | Fine-tune trên SST-2, độ chính xác tập dev 91.3 (bert-base-uncased 92.7); ví dụ thiên lệch theo tên nước ("This film was filmed in COUNTRY": France 0.89, Afghanistan 0.08); Apache-2.0 |
| Nguyen, D. Q., Nguyen, A. T. (2020). *PhoBERT*. Findings of EMNLP 2020 | https://aclanthology.org/2020.findings-emnlp.92/ | PhoBERT, cần tách từ trước (đã trình bày ở bài `nlp/bert`) |
| Nguyen, K. V. và cộng sự (2018). *UIT-VSFC: Vietnamese Students' Feedback Corpus for Sentiment Analysis*. KSE 2018, tr. 19–24 | https://doi.org/10.1109/KSE.2018.8573337 ; thẻ dữ liệu https://huggingface.co/datasets/uitnlp/vietnamese_students_feedback | Bộ dữ liệu tiếng Việt: khoảng 16 nghìn câu phản hồi của sinh viên, ba nhãn (tiêu cực, trung tính, tích cực), chia 11 426 / 1 583 / 3 166. Tập huấn luyện: 5 325 tiêu cực, 458 trung tính, 5 643 tích cực (API thống kê của datasets-server Hugging Face, 05/11/2026). Giấy phép trên thẻ: "Unknown" |
| Jurafsky, D., Martin, J. H. *Speech and Language Processing*, bản nháp 3 (19/08/2026) | https://web.stanford.edu/~jurafsky/slp3/ | Chương 4 (Logistic Regression and Text Classification), Phụ lục B (Naive Bayes Classification), Chương 23 (Lexicons for Sentiment, Affect, and Connotation). Số chương đổi giữa các bản nháp |

VLSP: không đưa vào bài, vì chưa kiểm được link ổn định tới bộ dữ liệu cảm xúc.

## Số tự tính trong bài

- Ví dụ lệch lớp ở Lý thuyết: 90 tích cực, 10 tiêu cực, luôn đoán tích cực. Độ chính xác 0.90; F1 lớp tích cực $= 2 \cdot 0.9 \cdot 1 / 1.9 \approx 0.947$; lớp tiêu cực 0 (precision không xác định, scikit-learn tính là 0 kèm cảnh báo); F1 macro $\approx 0.474$.
- Quiz: 95/5, luôn đoán tích cực: độ chính xác 0.95, F1 tích cực $1.9/1.95 \approx 0.974$, F1 macro $\approx 0.487$.
- Ma trận nhầm lẫn của ô `tfidf-logreg` (hàng là nhãn thật pos, neg; cột là dự đoán pos, neg):
  - unigram `[[5, 1], [4, 1]]`: P(pos) = 5/9 ≈ 0.556, R(pos) = 5/6 ≈ 0.833, F1(pos) ≈ 0.667; P(neg) = 1/2, R(neg) = 0.2, F1(neg) ≈ 0.286; F1 macro ≈ 0.476; độ chính xác 6/11 ≈ 0.545.
  - unigram + bigram `[[6, 0], [1, 4]]`: F1(pos) = 12/13 ≈ 0.923, F1(neg) = 8/9 ≈ 0.889, F1 macro ≈ 0.906; accuracy 10/11 ≈ 0.909.
- Câu bigram đoán sai "cà phê không ngon, quá đắt": tổng $w_j x_j$ = −0.268 ("không ngon" −0.194, "không" −0.115, "quá" −0.059, "ngon quá" −0.059 (bigram vượt qua dấu phẩy), "đắt" −0.043, "ngon" +0.031, "cà", "phê", "cà phê", "phê không" mỗi cái +0.043); hệ số tự do b = +0.414 (unigram: +0.448); z = 0.146 > 0 nên đoán khen. "chẳng ngon gì cả": chỉ "ngon" +0.181 (bigram) / +0.218 (unigram) cộng b. Kiểm trong Pyodide.
- `class_weight="balanced"` (bigram): F1 macro 0.909, ma trận `[[5, 1], [0, 5]]`; sửa được câu "cà phê" nhưng "đồ uống không tệ" thành sai.

## Thiết kế bộ dữ liệu của ô `tfidf-logreg`

- 43 câu huấn luyện (25 tích cực, 18 tiêu cực), 11 câu kiểm tra viết riêng (6, 5), tự viết. Sau review: thay hai câu kiểm tra trùng hoặc là hoán vị từ của câu huấn luyện ("phục vụ nhanh, quán sạch" thành "bánh cuốn ngon, nhân viên vui vẻ"; "phục vụ chậm, đồ ăn tệ" thành "bún chả không ngon, phục vụ chậm"). Đã kiểm bằng code: `set(X_train) & set(X_test)` rỗng, và không câu kiểm tra nào có cùng túi token (sắp xếp) với một câu huấn luyện. Tập kiểm tra có 6/11 câu chứa "không"; bài nói rõ điều này.
- Độ bất ổn (số trong bài): gộp 54 câu, `StratifiedShuffleSplit(n_splits=40, test_size=11, random_state=0)`, `LogisticRegression()` mặc định: bigram hơn unigram 35 lần, bằng 5, kém 0; F1 macro trung bình 0.445 (unigram), 0.616 (bigram). Chạy trong Pyodide.
- Thử trước (chỉ để chọn cách làm, không trích vào bài): `train_test_split` ngẫu nhiên trên một bộ khoảng 50 câu khác, `C=10`: kết quả dao động mạnh theo `random_state`. Vì vậy bài dùng tập kiểm tra cố định viết riêng.
- Câu phủ định "đảo nghĩa" của câu tích cực ("không tệ", "không đắt", "không chậm") chỉ chiếm khoảng 1/5 số câu tích cực, gần với nhận xét thật hơn bản thử đầu (khi nhiều hơn, unigram còn tệ hơn đoán ngẫu nhiên).

## Kiểm chứng code

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `tfidf-logreg.vi.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 (Python 3.14.2, scikit-learn 1.8.0) qua `runpyo.mjs` | Chạy lại sau khi đổi tập kiểm tra: 3.2 s (gói đã có trong cache; lần nạp scikit-learn đầu tiên trong Node khoảng 28 s). unigram: độ chính xác 0.545, F1 macro 0.476, sai 5 câu đều có "không"; unigram + bigram: 0.909, 0.906, sai 1 câu. Ba câu mới: P(pos) 0.52/0.66/0.53 (unigram), 0.52/0.64/0.57 (bigram). 60 dòng, dòng dài nhất 78 ký tự, `ast.parse` (3.10) qua |
| `pipeline.vi.py` | chạy thật | 2026-11-05 | Python 3.14.5, transformers 5.22.1, torch 2.14.1+cpu | Lần đầu 5 phút 10 giây (tải 268 MB, `model.safetensors` 267.8 MB); lần sau 1 phút 17 giây trên máy này (reviewer đo 11 s khi có cache; bài ghi "từ khoảng 10 giây tới một phút tùy máy"). Kết quả mẫu trong bài lấy nguyên văn; hai lần chạy cho cùng output. Pipeline `"sentiment-analysis"` vẫn chạy được ở transformers 5.22.1, không có cảnh báo |
