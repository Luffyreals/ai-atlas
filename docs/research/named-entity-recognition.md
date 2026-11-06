# Nhận dạng thực thể (NER): tài liệu tham khảo

Bài: `src/content/docs/vi/nlp/named-entity-recognition.mdx`. Do `lesson-writer` soạn ngày 05/11/2026 (quyết định 72: không qua `summarizer`).

## Nguồn (đã mở được link ngày 05/11/2026)

1. **Tjong Kim Sang, E. F., De Meulder, F. (2003).** *Introduction to the CoNLL-2003 Shared Task: Language-Independent Named Entity Recognition.* CoNLL 2003, tr. 142–147. https://aclanthology.org/W03-0419/
   - Bốn loại: persons (PER), organizations (ORG), locations (LOC), miscellaneous (MISC).
   - Lược đồ nhãn của tệp gốc là IOB1: mọi từ trong thực thể mang `I-XXX`; `B-XXX` chỉ dùng khi hai thực thể cùng loại đứng sát nhau. Bài báo ghi lược đồ này "originally put forward by Ramshaw and Marcus (1995)".
   - Thực thể không lồng, không chồng; thực thể lồng thì "usually only the top level entity has been annotated".
   - Chấm điểm: precision, recall, $F_{\beta=1}$; "A named entity is correct only if it is an exact match".
   - Hệ thống tốt nhất tiếng Anh (Florian và cộng sự): F 88.76 trên test.
2. **Ramshaw, L., Marcus, M. (1995).** *Text Chunking using Transformation-Based Learning.* Third Workshop on Very Large Corpora. https://aclanthology.org/W95-0107/ — nguồn của ý tưởng nhãn I/O/B (cho tách cụm danh từ). Chỉ nhắc trong lời văn, không đưa vào "Đọc thêm".
3. **Lafferty, J., McCallum, A., Pereira, F. (2001).** *Conditional Random Fields: Probabilistic Models for Segmenting and Labeling Sequence Data.* ICML 2001, tr. 282–289. https://repository.upenn.edu/cis_papers/159 — CRF tổng quát với hàm đặc trưng; bài viết dùng dạng "điểm tại chỗ + ma trận chuyển" (dạng của Lample và cộng sự), ghi rõ là trường hợp riêng.
4. **Lample, G., Ballesteros, M., Subramanian, S., Kawakami, K., Dyer, C. (2016).** *Neural Architectures for Named Entity Recognition.* NAACL 2016, tr. 260–270. https://aclanthology.org/N16-1030/
   - LSTM-CRF đạt F1 90.94 trên CoNLL-2003 tiếng Anh, không dùng gazetteer.
   - Động cơ của lớp CRF: "hard constraints (e.g., I-PER cannot follow B-LOC)".
   - Dùng IOBES nhưng "did not observe a significant improvement over the IOB tagging scheme".
5. **Devlin, J., Chang, M.-W., Lee, K., Toutanova, K. (2019).** *BERT.* NAACL 2019. https://aclanthology.org/N19-1423/ (PDF arXiv:1810.04805)
   - Mục 5.3: NER như bài toán gán nhãn, "do not use a CRF layer", "use the representation of the first sub-token as the input to the token-level classifier".
   - Bảng 7: fine-tune BERT-large test F1 92.8, BERT-base 92.4.
6. **Nguyễn Thị Minh Huyền, Ngô Thế Quyền, Vũ Xuân Lương, Trần Mai Vũ, Nguyễn Thị Thu Hiền.** *VLSP Shared Task: Named Entity Recognition.* Journal of Computer Science and Cybernetics 34(4), tr. 283–294. https://vjs.ac.vn/jcc/article/view/13161 — số báo ghi năm 2018, trang web ghi ngày đăng 30/01/2019; bài viết ghi 2018 theo số báo. Mô tả hai cuộc thi 2016 (có nhãn hình thái–cú pháp) và 2018 (dữ liệu lớn hơn, nhiều miền).
   - Đã sửa theo review của `content-reviewer` (05/11/2026). Câu trong bài: "VLSP 2016 (dữ liệu dạng cột kiểu CoNLL, đã tách từ) và VLSP 2018 (văn bản thô gắn thẻ XML, có thực thể lồng nhau), loại chính PER, LOC, ORG cùng một loại MISC nhỏ". Căn cứ: tóm tắt JCC 13161 (2016 có nhãn hình thái–cú pháp; 2018 văn bản nhiều miền, không có nhãn đó) và Pham Quang Nhat Minh (2018), *A Feature-Based Model for Nested Named-Entity Recognition at VLSP-2018 NER Evaluation Campaign*, https://arxiv.org/abs/1803.08463 (tóm tắt xác nhận dữ liệu 2018 có thực thể lồng nhau). Chi tiết "thẻ XML" và "MISC nhỏ" lấy theo đọc của reviewer; `lesson-writer` chỉ tự mở được trang tóm tắt, chưa đọc toàn văn.
7. **Nguyen, D. Q., Nguyen, A. T. (2020).** *PhoBERT: Pre-trained language models for Vietnamese.* Findings of EMNLP 2020, tr. 1037–1042. https://aclanthology.org/2020.findings-emnlp.92/ — chỉ nhắc: mô hình tiếng Việt làm việc trên văn bản đã tách từ.
8. **Jurafsky, D., Martin, J. H.** *Speech and Language Processing*, ấn bản 3 (bản nháp, đợt phát hành 19/08/2026). https://web.stanford.edu/~jurafsky/slp3/ — chương 18 "Sequence Labeling for Parts of Speech and Named Entities".
9. **Hugging Face.** *Token classification* (tài liệu `transformers` v5.22.1). https://huggingface.co/docs/transformers/tasks/token_classification — căn nhãn: `word_ids()`, `-100` cho `[CLS]`/`[SEP]` "so they're ignored by the PyTorch loss function", "Only labeling the first token of a given word. Assign -100 to other subtokens"; chấm bằng `seqeval`.
10. **Model card `dslim/bert-base-NER`.** https://huggingface.co/dslim/bert-base-NER — `bert-base-cased` fine-tune trên CoNLL-2003 tiếng Anh; 9 nhãn (O, B-/I- của PER, ORG, LOC, MISC); tập huấn luyện 14,987 câu, 203,621 token, khoảng 23,500 thực thể; test F1 91.3 trong bảng (metadata ghi 0.926, hai số mâu thuẫn, bài không trích); cảnh báo "sometimes tags subword tokens as entities"; giấy phép MIT.
11. **seqeval** (README). https://github.com/chakki-works/seqeval — chế độ mặc định "compatible with conlleval"; chế độ `mode='strict', scheme=IOB2` khác. Ví dụ README: đúng `B-NP I-NP O`, đoán `I-NP I-NP O` được F1 1.00 ở mặc định, 0.00 ở strict. Đây là căn cứ cho quy ước "I- mồ côi mở thực thể mới" của bài.

## Sửa sau review (05/11/2026)

- VLSP: viết lại câu như trên.
- I- mồ côi định nghĩa lại: `I-X` không đứng ngay sau `B-X` hay `I-X` (đầu câu, sau `O`, sau nhãn khác loại), khớp hàm `spans`; "dữ liệu đúng không có I- sau O" giới hạn vào IOB2. Explanation quiz 1: strict bỏ cả I-ORG ở từ 6, chỉ còn LOC ở từ 5.
- Ô BERT: model card không nói cách huấn luyện, nên bài viết "nhiều khả năng" huấn luyện theo mảnh đầu như bài báo BERT.
- Ký hiệu: $\mathbf{h}_i \in \mathbb{R}^{D}$, $\mathbf{W} \in \mathbb{R}^{K' \times D}$ (D là số chiều ẩn của phần NLP); nói rõ $i$ ở mục BERT chạy trên subword.
- Thêm: HMM/MEMM (giả định độc lập, label bias) trước CRF; thuật toán forward cho mẫu số; "part-of-speech tagging"; ô chỉ in 11 token không phải O đầu tiên; `first` và `simple` cùng biên và loại, khác điểm.

## Ý chính dùng trong bài

- NER là gán nhãn chuỗi; BIO (IOB2) với $2K+1$ nhãn; IOB1 của tệp CoNLL gốc; BIOES.
- Giải mã BIO theo quy ước conlleval: B- mở; I- cùng loại nối; O hoặc I- khác loại đóng; I- mồ côi mở thực thể mới.
- CRF chuỗi tuyến tính: $s(\mathbf{x},\mathbf{y}) = \sum_i \psi_i(y_i) + \sum_i A_{y_{i-1},y_i}$, softmax trên mọi dãy, Viterbi, cấm chuyển bằng $-\infty$.
- BERT: lớp tuyến tính trên mỗi $\mathbf{h}_i$, cross-entropy trên tập vị trí có nhãn $\mathcal{M}$; nhãn ở subword đầu, `-100` (mặc định `ignore_index` của `torch.nn.CrossEntropyLoss`) cho phần còn lại.
- F1 mức thực thể, $F_1 = 2N_{\text{ok}}/(N_{\text{pred}}+N_{\text{gold}})$.

## Số tự tính

- Ô `bio-eval`: 11 thực thể thật, 9 dự đoán, 5 khớp. $P = 5/9 = 0.556$, $R = 5/11 = 0.455$, $F_1 = 10/20 = 0.500$. Độ chính xác mức token 34/43 = 0.791. Đoán toàn `O`: 21/43 = 0.488.
- Câu 1 riêng: 12/14 token đúng (0.857); 2/3 thực thể đúng.
- Bộ tách từ của `dslim/bert-base-NER` cắt "Nguyen Thi Lan works for Vietcombank" thành 16 token (kể cả `[CLS]`, `[SEP]`): `Ng ##uy ##en T ##hi La ##n works for V ##iet ##comb ##an ##k`; `word_ids` = `None 0 0 0 1 1 2 2 3 4 5 5 5 5 5 None`. Chạy thật trong `.venv-nlp` (chỉ tải tokenizer).
- Quiz 1: `spans("O I-ORG I-ORG O B-LOC I-ORG")` = `{(ORG,1,3), (LOC,4,5), (ORG,5,6)}` (đánh số từ 0), chạy bằng hàm của bài.
- Quiz 2: $P = 6/8$, $R = 6/10$, $F_1 = 12/18 \approx 0.667$.
- Điểm `simple` của "Sundar Pichai": trung bình (1.000, 0.581, 1.000, 0.997, 0.595) ≈ 0.835, in ra 0.834 (làm tròn từ số chưa làm tròn).

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc ở scratchpad. Cả bốn file qua `ast.parse(..., feature_version=(3, 10))`; mỗi cặp `.vi.py`/`.en.py` hiện là bản sao y nguyên (cùng số dòng).

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `bio-eval.vi.py`, `bio-eval.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2), Python thuần | 46 dòng, dòng dài nhất 78 ký tự, 13–497 ms. Output: missed/wrong theo 4 câu; `gold=11 pred=9 correct=5`; `entity P=0.556 R=0.455 F1=0.500`; `token accuracy=0.791 (34/43)`; `all-O token accuracy=0.488`. Hai bản cho output giống hệt. Khớp lời văn |
| `ner-pipeline.vi.py`, `ner-pipeline.en.py` | chạy thật | 2026-11-05 | `.venv-nlp`: Python 3.14.5, `transformers` 5.22.1, `torch` 2.14.1+cpu, `tokenizers` 0.23.3, `huggingface_hub` 2.4.0; checkpoint `dslim/bert-base-NER` (revision `d1a3e8f13f8c3566299d95fcfc9a8d2382a9affc`) | 19 dòng, dòng dài nhất 69 ký tự. Tải lần đầu: `model.safetensors` 433,292,294 byte (khoảng 433 MB; `du` báo 414M), cả thư mục cache khoảng 414 MiB. Lần đầu 2 phút 48 giây (gồm tải), các lần sau khoảng 57 giây (máy đang chạy nhiều tiến trình). Chạy bản vi ba lần (một lần với bản 9 token đầu), hai lần cuối output stdout giống hệt; khối "Kết quả mẫu" chép từ lần đó. stderr có thanh tiến trình nạp trọng số và báo cáo `bert.pooler.dense.{bias,weight} UNEXPECTED` (bài có nhắc). Bản en là bản sao byte-giống-byte, không chạy lại riêng |
