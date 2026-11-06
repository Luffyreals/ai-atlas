# Hỏi đáp (Question Answering)

Bài: `nlp/question-answering` (chỉ bản vi, khoảng 12 phút đọc). Bài cần biết trước trong roadmap: `nlp/bert`, `nlp/information-retrieval` (xuất bản cùng PR, nên không có khối "Nhắc nhanh"). Hình: FIG mới `RetrieverReaderFigure` (comment giữ chỗ). Hai ô `PythonRunner` (chọn span, EM/F1) và một ô `LocalCode` (DistilBERT).

Ngày tra: **05/11/2026**. Cách tra: WebFetch trang arXiv, ar5iv, ACL Anthology, Hugging Face; tải PDF chương 11 của SLP3 rồi trích chữ bằng `pypdf`; đọc mã nguồn `transformers` 5.22.1 trong `.venv-nlp`; chạy thật ba file code. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra.

## Nguồn

- **[R16]** Rajpurkar, P., Zhang, J., Lopyrev, K., Liang, P. (2016). [*SQuAD: 100,000+ Questions for Machine Comprehension of Text*](https://arxiv.org/abs/1606.05250). EMNLP 2016. Đọc trang tóm tắt: hơn 100 000 câu hỏi trên các bài Wikipedia; câu trả lời là đoạn trích; F1 của người 86.8%, hồi quy logistic 51.0%.
- **[R18]** Rajpurkar, P., Jia, R., Liang, P. (2018). [*Know What You Don't Know: Unanswerable Questions for SQuAD*](https://arxiv.org/abs/1806.03822). ACL 2018. Tóm tắt: hơn 50 000 câu không có đáp án do người viết theo kiểu đối kháng; mô hình mạnh 86% F1 trên SQuAD 1.1 chỉ 66% F1 trên SQuAD 2.0.
- **[D19]** Devlin, J., Chang, M.-W., Lee, K., Toutanova, K. (2019). [*BERT*](https://arxiv.org/abs/1810.04805). NAACL 2019. Đọc mục 4.2 và 4.3 (qua ar5iv): chỉ thêm vectơ đầu $S$ và cuối $E$; xác suất đầu là softmax của $S \cdot T_i$ trên các từ của đoạn văn; điểm span $S \cdot T_i + E \cdot T_j$, chọn lớn nhất với $j \ge i$; mục tiêu huấn luyện là tổng log-likelihood của vị trí đầu và cuối đúng. SQuAD 2.0: câu không có đáp án có span ở `[CLS]`; $s_{\text{null}} = S \cdot C + E \cdot C$; trả lời khi span tốt nhất $> s_{\text{null}} + \tau$, $\tau$ chọn trên dev để F1 lớn nhất.
- **[C17]** Chen, D., Fisch, A., Weston, J., Bordes, A. (2017). [*Reading Wikipedia to Answer Open-Domain Questions*](https://arxiv.org/abs/1704.00051). ACL 2017. Retriever: TF-IDF + băm bigram, top-5 bài chứa đáp án cho 77.8% câu SQuAD (bảng 3, toàn Wikipedia, có bigram). Reader (RNN nhiều lớp) trên đoạn đúng: EM 69.5, F1 78.8 dev SQuAD (bảng 4). Cả hệ thống, chỉ huấn luyện trên SQuAD: EM 27.1 (bảng 6).
- **[K20]** Karpukhin, V. và cộng sự (2020). [*Dense Passage Retrieval for Open-Domain Question Answering*](https://arxiv.org/abs/2004.04906). EMNLP 2020. Hai bộ mã hóa BERT, xếp hạng bằng tích vô hướng (đã dùng ở `docs/research/rag-chatbot.md`).
- **[L20]** Lewis, P. và cộng sự (2020). [*Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*](https://arxiv.org/abs/2005.11401). NeurIPS 2020. Bộ sinh là BART, retriever là DPR.
- **[N20]** Nguyen, K. V., Nguyen, D.-V., Nguyen, A. G.-T., Nguyen, N. L.-T. (2020). [*A Vietnamese Dataset for Evaluating Machine Reading Comprehension*](https://aclanthology.org/2020.coling-main.233/). COLING 2020, tr. 2595–2605. UIT-ViQuAD: khoảng 23 000 cặp hỏi–đáp, 5 109 đoạn, 174 bài Wikipedia tiếng Việt.
- **[S19]** Sanh, V., Debut, L., Chaumond, J., Wolf, T. (2019). [*DistilBERT*](https://arxiv.org/abs/1910.01108). Chỉ dùng tên và năm.
- **[HFm]** Trang mô hình [`distilbert/distilbert-base-cased-distilled-squad`](https://huggingface.co/distilbert/distilbert-base-cased-distilled-squad): fine-tune trên SQuAD 1.1 bằng chắt lọc tri thức; EM 79.600, F1 86.996 trên dev SQuAD 1.1 (lời văn của trang ghi 87.1); Apache 2.0; 65.2M tham số.
- **[HFc]** Hugging Face LLM Course, [chương 7 mục 7](https://huggingface.co/learn/llm-course/chapter7/7): `max_length = 384`, `stride = 128`, `truncation="only_second"`; cửa sổ không chứa đáp án gán nhãn (0, 0) trỏ vào `[CLS]`; hậu xử lý `n_best = 20`, `max_answer_length = 30`, điểm span là tổng logit đầu và cuối, lấy span tốt nhất trên mọi cửa sổ.
- **[HFt]** Hugging Face, [hướng dẫn tác vụ Question answering](https://huggingface.co/docs/transformers/tasks/question_answering) (docs v5.22.1). Phần suy luận lấy `start_logits.argmax()` và `end_logits.argmax()` riêng rẽ (chính là lỗi bài cảnh báo; bài không nêu tên nguồn này, chỉ viết "vài hướng dẫn trực tuyến").
- **[HFv5]** [MIGRATION_GUIDE_V5.md](https://github.com/huggingface/transformers/blob/main/MIGRATION_GUIDE_V5.md), mục Pipelines: pipeline `question-answering` (cùng `summarization`, `translation`, `text2text-generation`) đã bị bỏ. Xác nhận trong mã: `transformers/pipelines/__init__.py`, `REMOVED_TASKS`, bản 5.22.1.
- **[SLP]** Jurafsky, D., Martin, J. H. [*Speech and Language Processing*](https://web.stanford.edu/~jurafsky/slp3/), bản thảo 19/8/2026, chương 11 "Information Retrieval and RAG": mục 11.5 Datasets, 11.6 Evaluating Question Answering (đã trích chữ PDF và đọc tiêu đề mục).
- Vịnh Hạ Long được UNESCO ghi danh năm 1994 và lần hai năm 2000 (tiêu chí địa chất); kiểm qua tài liệu UNESCO [whc.unesco.org/document/205800](https://whc.unesco.org/document/205800) theo kết quả tìm kiếm (trang danh sách 672 trả 403). Năm 2023 (16/9, khóa họp 45, quyết định 45COM 8B.3) di sản được mở rộng thành "Vịnh Hạ Long – Quần đảo Cát Bà"; kiểm qua kết quả tìm kiếm (Vietnam News, trang tài liệu UNESCO list/672), chưa mở văn bản quyết định.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Ý nghĩa `doc_stride` trong code BERT gốc | **Đã xác minh** (05/11/2026, [run_squad.py](https://raw.githubusercontent.com/google-research/bert/master/run_squad.py)): `doc_stride` mặc định 128, "how much stride to take between chunks", vòng lặp `start_offset += min(length, doc_stride)`, tức bước nhảy. Ở bộ tách từ Hugging Face, `stride` là số token chung. | Bài nêu cả hai nghĩa (mục cửa sổ trượt và hộp Lỗi hay gặp thứ ba). |
| "Gần 2 000 đảo" trong đoạn văn tiếng Anh tự viết | Số thường dẫn khoảng 1 969 đảo; chưa kiểm trên trang UNESCO. | Đoạn văn là ví dụ tự viết, giữ "nearly 2,000". |

## Ý chính và số tự tính

- Chọn span bằng tổng logit tương đương chọn tích xác suất, vì hai khoản log-sum-exp không phụ thuộc $(i, j)$.
- Logit giả định (ô `span`): $s_{17} = 2.0$, $s_{18} = 3.9$, $s_{24} = 4.2$; $e_{18} = 4.5$, $e_{24} = 3.0$; còn lại $-2$. Argmax riêng: (24, 18). Tốt nhất với $K = 5$: (18, 18) = 8.4; (24, 24) = 7.2; (17, 18) = 6.5. Câu không có đáp án: span tốt nhất 5.0, null 6.2; $\tau = 0$ từ chối, $\tau = -1.5$ trả lời "1994".
- Bước bỏ mạo từ `(a|an|the)` của script SQuAD có tác động lên tiếng Việt (do `content-reviewer` phát hiện): "Long An" → "long", "An Giang" → "giang", "an toàn giao thông" → "toàn giao thông", "A Lưới" → "lưới". Bài khuyên bỏ bước này khi chấm tiếng Việt; ô `em-f1` có tham số `en`.
- Paper BERT (SQuAD 1.1) lấy softmax trên token của đoạn văn; cài đặt Hugging Face (`DistilBertForQuestionAnswering`) lấy cross-entropy trên cả chuỗi, gồm `[CLS]`, và chia đôi tổng hai loss.
- F1 "năm 1994" so với "1994": $P = 1/2$, $R = 1$, $F_1 = 0.667$. Quiz 3: "tỉnh Quảng Ninh" so với "Quảng Ninh": $P = 2/3$, $R = 1$, $F_1 = 0.8$.
- Quiz 1: $s = (0.5, 3.0, 1.0, 0.2, 3.5)$, $e = (0.1, 2.0, 4.0, 0.5, 0.3)$, $K = 3$: tốt nhất (2, 3) = 7.0; (3, 3) = 5.0; (5, 5) = 3.8.
- Quiz 4: trần 0.6; $0.6 \times 0.85 = 0.51$.

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc ở scratchpad. Cả sáu file qua `ast.parse(..., feature_version=(3, 10))`, không dòng nào quá 79 ký tự; mỗi `.en.py` là bản sao y nguyên của `.vi.py`.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `span.vi.py`, `span.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2, NumPy 2.4.6) | 44 dòng, khoảng 0.5–1.1 s. `argmax separately: start=24 2000, end=18 1994`; `best span: (18, 18) '1994' 8.4`; `best span: '1994' 5.0, null 6.2`; `tau=0.0: (no answer)`; `tau=-1.5: 1994`. Khớp lời văn |
| `em-f1.vi.py`, `em-f1.en.py` | chạy thật | 2026-11-05 | như trên | Bản sửa sau review: 44 dòng, 9 ms, thêm tham số `en` (bật bước bỏ mạo từ). EM/F1: `'1994.'` 1/1.000; `'năm 1994'` 0/0.667; `'năm 1994'` (hai đáp án) 1/1.000; `'2000'` 0/0.000; `'The Eiffel Tower'` (en=True) 1/1.000; `'vịnh Hạ Long ở Quảng Ninh'` 0/0.500; `''` 1/1.000; `'Long'` so với "Long An": en=True 1/1.000, en=False 0/0.667. Khớp lời văn |
| `reader.vi.py`, `reader.en.py` | chạy thật | 2026-11-05 | `.venv-nlp`: Python 3.14.5, transformers 5.22.1, tokenizers 0.23.3, torch 2.14.1+cpu; checkpoint `distilbert/distilbert-base-cased-distilled-squad` (snapshot `564e9b58`), cache 261 431 965 byte (`model.safetensors` 260 782 156 byte) | 47 dòng. Lần đầu (có tải) 1 phút 41 giây; các lần sau 55 s và 1 phút 19 s khi máy đang chạy nhiều tiến trình (riêng `import torch, transformers` mất 2 phút 6 giây ở một lần đo lúc máy bận). Output bản vi và bản en giống hệt (cùng md5): Q1 `'1994'` p=0.992 start=170 end=174, span 19.55, `[CLS]` -4.73; Q2 `'Quang Ninh'` p=0.812, 18–28, 25.48, -1.71; Q3 `'2,000 limestone islands and islets'` p=0.228, 75–109, 1.38, -14.37. Kết quả mẫu trong bài lấy từ lần này |
