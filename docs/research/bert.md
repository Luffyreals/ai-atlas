# BERT

Bài: `nlp/bert` (chỉ bản vi, khoảng 12 phút đọc). Bài cần biết trước trong roadmap: `nlp/word2vec-glove-fasttext` (xuất bản cùng đợt, được link), `dl/transformers` (chưa xuất bản, nên có "Nhắc nhanh" và link tới `llm/seq2seq`, `llm/build-first-llm`). Hình mới: FIG `AttentionMaskFigure` (nlp-lessons.md mục 4). Một ô `PythonRunner` (NumPy, che token) và một ô `LocalCode` (`transformers`, fill-mask và cosine).

Ngày tra: **05/11/2026**. Cách tra: WebFetch trang ACL Anthology, arXiv, GitHub, tài liệu Hugging Face; tải PDF rồi trích chữ bằng `pdftotext` (BERT, RoBERTa, ALBERT, DistilBERT, ELECTRA, PhoBERT, Sentence-BERT); chạy thật hai file code. Ý không có thẻ nguồn là kiến thức chung hoặc tự tính.

## Nguồn

- **[D19]** Devlin, J., Chang, M.-W., Lee, K., Toutanova, K. (2019). [*BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding*](https://aclanthology.org/N19-1423/). NAACL-HLT 2019, trang 4171–4186 (Best Long Paper); arXiv:1810.04805. Đã đọc mục 3, 4.1, 4.2, 5.1, phụ lục A.1, A.2, C.1, C.2.
- **[V17]** Vaswani, A. và cộng sự (2017). [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762). NIPS 2017. Dùng lại từ `docs/research/seq2seq.md`.
- **[L19]** Liu, Y. và cộng sự (2019). [*RoBERTa: A Robustly Optimized BERT Pretraining Approach*](https://arxiv.org/abs/1907.11692). arXiv:1907.11692. Đã đọc mục 3.2, 4.1, 4.2, 5.
- **[La20]** Lan, Z. và cộng sự (2020). [*ALBERT: A Lite BERT for Self-supervised Learning of Language Representations*](https://arxiv.org/abs/1909.11942). ICLR 2020 (dòng đầu PDF: "Published as a conference paper at ICLR 2020"). Đã đọc mục 1, 3.1, 3.2.
- **[S19]** Sanh, V., Debut, L., Chaumond, J., Wolf, T. (2019). [*DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter*](https://arxiv.org/abs/1910.01108). Workshop EMC² tại NeurIPS 2019. Đã đọc tóm tắt, mục 2, bảng số tham số.
- **[C20]** Clark, K., Luong, M.-T., Le, Q. V., Manning, C. D. (2020). [*ELECTRA: Pre-training Text Encoders as Discriminators Rather Than Generators*](https://arxiv.org/abs/2003.10555). ICLR 2020. Đã đọc tóm tắt và mục 1.
- **[N20]** Nguyen, D. Q., Nguyen, A. T. (2020). [*PhoBERT: Pre-trained language models for Vietnamese*](https://aclanthology.org/2020.findings-emnlp.92/). Findings of EMNLP 2020, trang 1037–1042. Đã đọc cả bài (ngắn).
- **[Co20]** Conneau, A. và cộng sự (2020). [*Unsupervised Cross-lingual Representation Learning at Scale*](https://aclanthology.org/2020.acl-main.747/). ACL 2020, trang 8440–8451. Chỉ đọc trang tóm tắt.
- **[G-mBERT]** Google Research. [*BERT multilingual models*](https://github.com/google-research/bert/blob/master/multilingual.md) (README trong repo `google-research/bert`). Đã đọc phần mô tả mBERT cased.
- **[RG19]** Reimers, N., Gurevych, I. (2019). [*Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks*](https://arxiv.org/abs/1908.10084). EMNLP-IJCNLP 2019. Đã đọc mục 1, 4.1 (bảng 1), 5.
- **[E19]** Ethayarajh, K. (2019). [*How Contextual are Contextualized Word Representations?*](https://arxiv.org/abs/1909.00512). EMNLP 2019. Chỉ đọc trang tóm tắt.
- **[HF]** Hugging Face. [*Pipelines*](https://huggingface.co/docs/transformers/main_classes/pipelines), tài liệu `transformers`, mục `FillMaskPipeline`.

## Ý chính dùng trong bài

### Kiến trúc và đầu vào [D19]

- Ký hiệu của bài báo: $L$ số lớp, $H$ số chiều ẩn, $A$ số đầu. BERT-base: $L=12$, $H=768$, $A=12$, 110M tham số; BERT-large: $L=24$, $H=1024$, $A=16$, 340M. FFN $4H$. Bài dùng $D$, $H$ (số đầu), $d = D/H$ theo phần LLM.
- WordPiece, từ vựng 30 000 (tệp `bert-base-uncased` thật có 30 522). `[CLS]` luôn đứng đầu; vectơ cuối của nó là $C$, đại diện cho cả chuỗi. Cặp câu ngăn bằng `[SEP]` và một embedding học được cho A/B. Đầu vào = tổng embedding token + đoạn + vị trí.
- Pre-train trên BooksCorpus (800M từ) và Wikipedia tiếng Anh (2 500M từ). Độ dài tối đa 512; 90% số bước chạy với độ dài 128. GELU. Loss = trung bình MLM + trung bình NSP.
- Bài báo gọi phiên bản chỉ nhìn trái là "Transformer decoder", bản hai chiều là "Transformer encoder" (mục 3).

### MLM [D19]

- 15% vị trí WordPiece được chọn ngẫu nhiên; trong đó 80% `[MASK]`, 10% token ngẫu nhiên, 10% giữ nguyên. $T_i$ dùng để đoán token gốc bằng cross-entropy. Chỉ đoán token bị che, không dựng lại cả đầu vào.
- Lý do: `[MASK]` không xuất hiện khi fine-tune, tạo độ lệch giữa pre-train và fine-tune. Phụ lục A.1: mô hình không biết từ nào bị hỏi hay bị thay, nên phải giữ biểu diễn ngữ cảnh cho mọi token; nhánh giữ nguyên "kéo" biểu diễn về từ thật; token ngẫu nhiên chỉ 1.5% (10% của 15%), không hại.
- Phụ lục C.1: MLM hội tụ chậm hơn mô hình trái sang phải một chút nhưng vượt về độ chính xác gần như ngay.
- Bảng 8 (phụ lục C.2), dev: 80/10/10: MNLI 84.2, NER fine-tune 95.4, NER feature-based 94.9. 100% `[MASK]`: 84.3, 94.9, 94.0. 80/0/20: 84.1, 95.2, 94.6. 80/20/0: 84.4, 95.2, 94.7. 0/20/80: 83.7, 94.8, 94.6. 0/0/100: 83.6, 94.9, 94.6. Kết luận của tác giả: fine-tune rất bền với chiến lược che; 100% `[MASK]` có vấn đề với cách trích đặc trưng; chỉ dùng RND kém hơn.
- Ghi chú cài đặt: [D19] chỉ ghi "che 15% token WordPiece của mỗi chuỗi một cách ngẫu nhiên". Theo hiểu biết của writer (chưa mở lại mã nguồn), `create_pretraining_data.py` của Google chọn đúng khoảng `round(15%)` vị trí mỗi chuỗi, còn `DataCollatorForLanguageModeling` của `transformers` chọn từng token với xác suất 0.15 (đã kiểm trong `transformers` 5.22.1, `data/data_collator.py`: `torch.bernoulli` trên ma trận xác suất `mlm_probability=0.15`, rồi `mask_replace_prob=0.8`, `random_replace_prob=0.1`; nhãn ngoài vị trí được chọn đặt `-100` để không tính loss). Ô code của bài làm theo cách thứ hai và lời văn chỉ nói "giống cách thư viện `transformers` làm". Reviewer nên kiểm câu này.

### NSP [D19], [L19], [La20]

- 50% B là đoạn đi sau A (`IsNext`), 50% ngẫu nhiên (`NotNext`); phân loại từ $C$.
- Bảng 5 [D19], dev (MNLI-m / QNLI / MRPC / SST-2 / SQuAD F1): BERT-base 84.4 / 88.4 / 86.7 / 92.7 / 88.5; No NSP 83.9 / 84.9 / 86.5 / 92.6 / 87.9; LTR & No NSP 82.1 / 84.3 / 77.5 / 92.1 / 77.8; + BiLSTM 82.1 / 84.1 / 75.7 / 91.6 / 84.9.
- [L19] mục 4.2: bỏ NSP với FULL-SENTENCES / DOC-SENTENCES "matches or slightly improves"; tác giả cho rằng bản gốc có thể chỉ bỏ loss mà vẫn giữ định dạng SEGMENT-PAIR. RoBERTa: che động, FULL-SENTENCES không NSP, lô lớn, BPE theo byte lớn hơn, hơn 160 GB văn bản.
- [La20] mục 3.1 (phần SOP): NSP dễ học nhờ đoán chủ đề, trùng với MLM; SOP lấy hai đoạn liền nhau, ví dụ âm là đảo thứ tự.

### Fine-tune [D19]

- Phân loại: chỉ thêm $W \in \mathbb{R}^{K \times H}$, loss $\log(\mathrm{softmax}(CW^\top))$.
- NER: dùng biểu diễn của sub-token đầu làm đầu vào cho lớp phân loại token.
- SQuAD: câu hỏi là A, đoạn văn là B; thêm $S, E \in \mathbb{R}^H$; $P_i = e^{S \cdot T_i} / \sum_j e^{S \cdot T_j}$ trên các từ của đoạn văn; điểm span $S \cdot T_i + E \cdot T_j$, $j \ge i$. Bài viết $\mathbf{w}_{\text{start}}$, $\mathbf{w}_{\text{end}}$ cho khớp bài `nlp/question-answering`.
- Kết quả tóm tắt: GLUE 80.5 (+7.7), MultiNLI 86.7%, SQuAD v1.1 F1 93.2 (test), SQuAD v2.0 F1 83.1.

### Biến thể

- [La20] bảng 2 (dev, 125k bước, cột Avg / Speedup so với BERT-large): BERT-large 334M 85.2 / 1.0; ALBERT-base 12M 80.1 / 5.6x; ALBERT-large 18M 82.4 / 1.7x; xlarge 60M 85.5 / 0.6x; xxlarge 235M 88.7 / 0.3x. Mục 6: xxlarge ít tham số hơn BERT-large nhưng tốn tính toán hơn. Lưu ý: review gợi ý "phải tới xxlarge mới vượt", nhưng bảng cho thấy xlarge đã nhỉnh hơn (85.5 so với 85.2); bài ghi theo bảng.
- [La20]: phân rã embedding $V \times E$ rồi $E \times H$; dùng chung tham số mọi lớp; SOP. Bảng 1: BERT-base 108M, BERT-large 334M, ALBERT-base 12M, ALBERT-large 18M, xlarge 60M, xxlarge 235M (đoạn văn mục 3.2 ghi 233M).
- [S19]: học sinh có kiến trúc như BERT, bỏ token-type embedding và pooler, số lớp giảm một nửa; 66M tham số (bảng: ELMo 180, BERT-base 110, DistilBERT 66); nhỏ hơn 40%, nhanh hơn 60%, giữ 97% khả năng hiểu ngôn ngữ.
- [C20]: replaced token detection: generator nhỏ (một MLM) thay token, discriminator đoán từng token gốc hay bị thay; học từ mọi token thay vì khoảng 15%; bỏ được độ lệch do `[MASK]`.

### Tiếng Việt và đa ngôn ngữ

- [N20]: base và large dùng kiến trúc BERT-base/large, quy trình pre-train theo RoBERTa (fairseq); 20 GB (Wikipedia ~1 GB + tin tức ~19 GB); tách từ và câu bằng RDRSegmenter của VnCoreNLP (~145M câu, ~3B từ); fastBPE, từ vựng 64K; độ dài tối đa 256 subword. 135M (base) và 370M (large) tham số, so với 250M / 560M của XLM-R. XLM-R có 137 GB tiếng Việt, gấp khoảng 7 lần. Đánh giá: POS, phân tích phụ thuộc, NER, NLI; vượt XLM-R. Lý do tách từ: dấu cách tiếng Việt ngăn âm tiết, 85% loại từ có từ hai âm tiết trở lên (dẫn Thang và cộng sự 2008).
- [G-mBERT]: mBERT cased: 104 ngôn ngữ, Wikipedia, 12 lớp, 768, 12 đầu, README ghi "110M", từ vựng WordPiece chung khoảng 110k. Tệp `config.json` của `google-bert/bert-base-multilingual-cased` ghi `vocab_size` 119 547.
- [Co20]: XLM-R, 100 ngôn ngữ, hơn 2 TB CommonCrawl đã lọc (theo [N20]: 2.5 TB); hơn mBERT 14.6 điểm XNLI trung bình, 13 điểm F1 MLQA, 2.4 điểm F1 NER.

### Lỗi hay gặp

- [RG19] bảng 1: trên STS, trung bình embedding BERT đạt trung bình 54.81, vectơ `[CLS]` 29.19, cả hai kém trung bình GloVe. Mục 5: với SentEval (có bộ phân loại logistic phía trên) thì ổn hơn, nhưng không dùng được với cosine.
- [E19]: biểu diễn ngữ cảnh không đẳng hướng (anisotropic) ở mọi lớp; dùng cho lưu ý "so các cosine với nhau".
- Token che: BERT/mBERT `[MASK]`; RoBERTa, XLM-R, PhoBERT `<mask>` (theo tokenizer kiểu fairseq; [HF] ghi `<mask>` cho mô hình kiểu RoBERTa).

## Số tự tính

- Số tham số BERT-base với từ vựng 30 522, $D=768$, FFN 3072, 512 vị trí, 2 đoạn: embedding $23\,440\,896 + 393\,216 + 1\,536 + 1\,536$ (LN) $= 23\,837\,184$; một khối $4(768^2+768) + (768 \cdot 3072 + 3072) + (3072 \cdot 768 + 768) + 4 \cdot 768 = 7\,087\,872$; 12 khối $85\,054\,464$; pooler $590\,592$. Tổng $109\,482\,240$.
- BERT-large cùng cách đếm: khoảng $335.1$ triệu (bài báo ghi 340M, [La20] ghi 334M). Bài ghi cả ba số.
- mBERT: $119\,547 \times 768 = 91\,812\,096$ tham số embedding token; tổng khoảng $177\,853\,440$ (cùng cách đếm, đổi từ vựng). README của Google ghi 110M; bài ghi số tự đếm và nói rõ là tự đếm từ tệp cấu hình.
- Tỉ lệ trên mọi token: $0.15 \times 0.8 = 0.12$, $0.15 \times 0.1 = 0.015$.
- Quiz 1: $10\,000 \times 0.15 = 1\,500$; $1\,500 \times 0.8 = 1\,200$.

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc `scratchpad/bert/`. Cả bốn file qua `ast.parse(..., feature_version=(3, 10))`. `.en.py` là bản sao y nguyên của `.vi.py` (so bằng `cmp`).

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `masking.vi.py`, `masking.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2, NumPy 2.4.6) | 39 dòng, dòng dài nhất 77 ký tự. 0.5–1.5 s (một lần 6.6 s khi máy bận). Câu mẫu: 3 trên 24 token được chọn: vị trí 3 `là -> [MASK]`, 11 `có -> năm`, 18 `và -> [MASK]`. 2000 câu × 126 token: `picked: 0.1507`, `[MASK] 0.797  random 0.101  keep 0.102`. Khớp lời văn |
| `fill-mask.vi.py`, `fill-mask.en.py` | chạy thật | 2026-11-05 | `.venv-nlp`: Python 3.14.5, `transformers` 5.22.1, torch 2.14.1+cpu, tokenizers 0.23.3, huggingface_hub 2.4.0; checkpoint `google-bert/bert-base-multilingual-cased`, chạy với `-I -X utf8` | Bản sau review (thêm hai dòng mốc): 40 dòng, dòng dài nhất 79 ký tự. Tải lần đầu khoảng 717 MB (`model.safetensors` 714 290 682 byte, `tokenizer.json` 1.96 MB, `vocab.txt` 1.0 MB). Khi đã có cache: 17.6 s (bản đầu 66 s lúc máy bận). Output: "thủ" 0.935, "coffee" 0.664, hạng hai "drink" 0.093, hình dạng `(8, 768)`, `(10, 768)`, `(12, 768)`, cosine 0.729 / 0.562 / 0.539, `cos(bay, ve)` 0.542, `mean cos, any token pair` 0.325 (mọi cặp token câu 1 × câu 3, kể cả `[CLS]`, `[SEP]`, dấu chấm). Số của ba dòng cosine cũ giống lần chạy trước. Kết quả mẫu trong bài lấy từ lần này. Luồng lỗi có hai báo cáo nạp: `BertForMaskedLM` với `UNEXPECTED` `bert.pooler.*`, `cls.seq_relationship.*`; `BertModel` với `UNEXPECTED` `cls.predictions.*` (đầu MLM) và `cls.seq_relationship.*`. Không phải lỗi |
