# Tách từ (Tokenizer)

Bài: `nlp/tokenization` (chỉ bản vi, khoảng 12 phút đọc). Bài cần biết trước trong roadmap: `nlp/regex` (xuất bản cùng đợt, nên không có khối "Nhắc nhanh"). Hình: VIZ mới `BpeMergeViz` (comment giữ chỗ trong bài). Hai ô `PythonRunner` (khớp dài nhất, BPE đồ chơi) và một ô `LocalCode` (`transformers`, chỉ tải tokenizer).

Ngày tra: **05/11/2026**. Cách tra: tải PDF từ ACL Anthology, arXiv, trang của OpenAI, rồi trích chữ bằng `pypdf`; WebFetch trang Hugging Face, trang Google Research; kiểm mã HTTP 200 cho mọi link. Ý không có thẻ nguồn là kiến thức chung hoặc tự chạy.

## Nguồn

- **[SHB16]** Sennrich, R., Haddow, B., Birch, A. (2016). [*Neural Machine Translation of Rare Words with Subword Units*](https://aclanthology.org/P16-1162/). ACL 2016 (arXiv:1508.07909). Đã đọc mục 3.2 và Algorithm 1.
- **[SN12]** Schuster, M., Nakajima, K. (2012). [*Japanese and Korean Voice Search*](https://research.google/pubs/japanese-and-korean-voice-search/). ICASSP 2012, tr. 5149–5152. Chỉ đọc trang thông tin (tác giả, năm, hội nghị); nội dung WordPiece lấy qua [W16] và [K18] chú thích 1–2.
- **[W16]** Wu, Y. và cộng sự (2016). [*Google's Neural Machine Translation System*](https://arxiv.org/abs/1609.08144). arXiv:1609.08144. Đã đọc mục 4.1 (Wordpiece Model).
- **[D19]** Devlin, J., Chang, M.-W., Lee, K., Toutanova, K. (2019). [*BERT*](https://aclanthology.org/N19-1423/). NAACL 2019. Đã đọc đoạn "WordPiece embeddings … 30,000 token vocabulary", `[CLS]`, `[SEP]`.
- **[K18]** Kudo, T. (2018). [*Subword Regularization*](https://aclanthology.org/P18-1007/). ACL 2018. Đã đọc mục 3.2 (Unigram LM, Viterbi, EM, giữ $\eta$% với ví dụ 80, luôn giữ ký tự đơn) và chú thích 1–2 (WordPiece dùng likelihood thay vì tần số).
- **[KR18]** Kudo, T., Richardson, J. (2018). [*SentencePiece*](https://aclanthology.org/D18-2012/). EMNLP 2018 (Demonstrations). Đã đọc tóm tắt và mục 3.1 (lossless tokenization, `▁` U+2581, ví dụ `[Hello] [▁wor] [ld] [.]`).
- **[R19]** Radford, A. và cộng sự (2019). [*Language Models are Unsupervised Multitask Learners*](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf). Báo cáo kỹ thuật OpenAI. Đã đọc mục 2.2 (byte-level BPE, hơn 130 000 code point, 256 byte, không gộp qua loại ký tự trừ dấu cách, ví dụ `dog.` `dog!` `dog?`) và mục 2.3 (từ vựng 50 257).
- **[V18]** Vu, T., Nguyen, D. Q., Nguyen, D. Q., Dras, M., Johnson, M. (2018). [*VnCoreNLP*](https://aclanthology.org/N18-5012/). NAACL 2018 (Demonstrations). Đã đọc tóm tắt và mục 4: tách từ F1 97.90%, 62K từ/giây (kết quả chi tiết ở một bài khác của Nguyen và cộng sự 2018, chưa đọc).
- **[P23]** Petrov, A., La Malfa, E., Torr, P. H. S., Bibi, A. (2023). [*Language Model Tokenizers Introduce Unfairness Between Languages*](https://arxiv.org/abs/2305.15425). NeurIPS 2023. Đã đọc mục 3 (định nghĩa premium) và bảng 1: tiếng Việt 4.54 (GPT-2, RoBERTa, r50k/p50k), 2.45 (`cl100k_base` của ChatGPT, GPT-4), FlanT5 không báo (quá 10% ký tự thành UNK). FLORES-200: 2000 câu Wikipedia dịch sang 200 thứ tiếng.
- **[HF]** Hugging Face, *LLM Course*, chương 6, mục [BPE](https://huggingface.co/learn/llm-course/chapter6/5) và [WordPiece](https://huggingface.co/learn/llm-course/chapter6/6). Đã đọc: điểm của WordPiece = tần số cặp chia cho tích tần số hai phần; khi tách, lấy mảnh dài nhất ở đầu từ, tiền tố `##`, không khớp được thì cả từ thành `[UNK]`.
- **[N18]** Nguyen, D. Q., Nguyen, D. Q., Vu, T., Dras, M., Johnson, M. (2018). [*A Fast and Accurate Vietnamese Word Segmenter*](https://aclanthology.org/L18-1410/). LREC 2018. Đã đọc tóm tắt và bảng 3: RDRsegmenter (phần tách từ của VnCoreNLP) P 97.46, R 98.35, F1 97.90 trên tập kiểm tra của VLSP 2013 (tập kiểm tra của shared task gán nhãn từ loại VLSP 2013), huấn luyện trên treebank tiếng Việt 75k câu.
- **[L2]** Touvron, H. và cộng sự (2023). [*Llama 2*](https://arxiv.org/abs/2307.09288). Đã đọc đoạn Tokenizer: cùng bộ tách từ với Llama 1, BPE cài bằng SentencePiece, tách số thành từng chữ số, dùng byte cho ký tự UTF-8 lạ, từ vựng 32k. Llama 3 (128K token = 100K của tiktoken + 28K thêm) lấy từ `docs/research/llama-family.md` [L3].
- Công cụ: [VnCoreNLP](https://github.com/vncorenlp/VnCoreNLP), [underthesea](https://github.com/undertheseanlp/underthesea), [pyvi](https://github.com/trungtv/pyvi) (đều trả mã 200 ngày tra). PhoBERT: Nguyen, D. Q., Nguyen, A. T. (2020), [Findings of EMNLP 2020](https://aclanthology.org/2020.findings-emnlp.92/), chỉ nhắc rằng nó cần văn bản đã tách từ.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Nội dung [SN12] | Chưa đọc PDF gốc. | Bài chỉ nói WordPiece "gộp theo likelihood", theo [K18] chú thích 2 và [W16]; công thức điểm dẫn là của khóa học [HF]. |
| T5 dùng SentencePiece | Kiến thức chung (JMLR 2020), chưa mở lại bài. LLaMA 1 và 2 đã kiểm qua [L2]; Llama 3 qua [L3]. | Bài viết "T5, LLaMA 1 và 2 dùng SentencePiece (LLaMA dùng BPE của nó). Llama 3 chuyển sang byte-level BPE kiểu tiktoken, từ vựng 128K". |
| Bộ dữ liệu đo F1 97.90% của VnCoreNLP | Đã giải quyết bằng [N18] bảng 3. | Bài ghi "trên tập kiểm tra của VLSP 2013 (Nguyen và cộng sự, 2018)". |
| mBERT học trên Wikipedia của 104 thứ tiếng | Kiến thức chung (README của BERT); bài viết "hơn một trăm thứ tiếng". | Giữ. |

## Ý chính dùng trong bài

- Ba mức cắt: từ (OOV, `[UNK]`), ký tự (chuỗi dài), mảnh từ (giữa).
- Tiếng Việt: dấu cách giữa âm tiết, từ nhiều âm tiết; khớp dài nhất và nhập nhằng chồng lấp; công cụ thật [V18].
- BPE [SHB16]: ký tự + ký hiệu cuối từ, đếm cặp có trọng số tần số, gộp cặp nhiều nhất, không gộp qua ranh giới từ, $|V| = |V_0| + K$, $K$ là siêu tham số duy nhất; tách từ mới bằng cách áp lại phép gộp theo thứ tự.
- WordPiece [W16][D19][HF], Unigram [K18], SentencePiece [KR18], byte-level BPE [R19].
- Token đặc biệt: `[CLS]`, `[SEP]`, `[MASK]`, `[UNK]`, `[PAD]` (BERT); `<|endoftext|>` (GPT-2, mã 50256, tự chạy).
- Chi phí token tiếng Việt: byte UTF-8 (đ, ư, ơ: 2 byte; ọ, ờ, ở: 3 byte, tự chạy), [P23].

## Số tự chạy (05/11/2026)

- BPE đồ chơi (bộ 7 âm tiết, `_` cuối âm tiết): $|V_0| = 13$, 12 phép gộp: n+g 29, ư+ờ 19, ng+_ 14, ườ+ng_ 11, n+h 10, ng+ườ 8, ngườ+i 8, người+_ 8, nh+à 7, nhà+_ 7, t+r 6, tr+ường_ 6. Hòa ở bước 6 (ba cặp 8), 7, 8, 10, 12; quy tắc hòa như `max` của Python trên `Counter` (cặp gặp trước). Thử đổi "thương" lên 20: bước 3–6 gộp thành `thương_`, "trường" thành `t r ường_`.
- Tìm kiếm ngẫu nhiên 20 000 bộ tần số cho 7 âm tiết: không bộ nào có người thắng duy nhất ở cả 10 bước đầu (chuỗi gộp trong một âm tiết luôn có số đếm bằng nhau), nên bài ghi rõ quy tắc hòa.
- Câu hỏi quiz 1 (`nhà` 5, `nhanh` 4, `anh` 3): n+h 16, a+n 7, h+_ 7, h+à 5.
- NFD (không có trong file code, chạy bản sao trong scratchpad): câu tiếng Việt dạng NFD có 44 ký tự, 53 byte; GPT-2 34 token; mBERT 9 token, trong đó 5 `[UNK]` (Học, học, học, ở, trường).
- GPT-2 cắt số: " 2026 12345 1000000" thành `Ġ20 26 Ġ123 45 Ġ100 0000`.

## Thuật ngữ đề xuất

| Tiếng Việt | Tiếng Anh | Ghi chú |
|---|---|---|
| Mảnh từ (subword) | Subword | Giữ "subword" hoặc dịch "mảnh từ". Đơn vị nằm giữa ký tự và từ |
| BPE | Byte pair encoding | Giữ. Học từ vựng bằng cách gộp dần cặp ký hiệu kề nhau hay gặp nhất |
| Byte-level BPE | Byte-level BPE | Giữ. BPE bắt đầu từ 256 byte của UTF-8, không cần `[UNK]` (GPT-2) |
| WordPiece | WordPiece | Giữ. Gộp theo likelihood; mảnh giữa từ có tiền tố `##` (BERT) |
| Unigram LM | Unigram language model (tokenization) | Giữ. Bắt đầu từ từ vựng lớn, bỏ dần mảnh ít có ích; chọn cách tách có xác suất lớn nhất |
| SentencePiece | SentencePiece | Giữ. Thư viện học BPE/Unigram từ câu thô, dấu cách thành `▁` |
| Phép gộp | Merge (rule) | Dịch. Một cặp ký hiệu được nối thành ký hiệu mới, ghi theo thứ tự học |
| Tách sơ bộ | Pre-tokenization | Dịch. Cắt thô ở dấu cách, dấu câu trước mô hình tách |
| Từ ngoài từ vựng | Out-of-vocabulary (OOV) word | Dịch, viết tắt OOV |
| Token đặc biệt | Special token | Dịch, giữ "token". `[CLS]`, `[SEP]`, `[PAD]`, `[MASK]`, `[UNK]`, `<|endoftext|>` |
| Mã token | Token ID | Dịch. Vị trí của token trong từ vựng |
| Âm tiết | Syllable | Dịch |
| Tách từ tiếng Việt | (Vietnamese) word segmentation | Dịch. Gộp âm tiết thành từ; khác "tách từ" (tokenization) |
| Khớp dài nhất | Maximum matching | Dịch. Lấy cụm dài nhất có trong từ điển, từ trái hoặc từ phải |
| Nhập nhằng chồng lấp | Overlapping ambiguity | Dịch. Một âm tiết ghép được với bên trái hoặc bên phải |
| Mức phụ trội token | Tokenization premium | Dịch. Số token của bản dịch chia cho số token bản tiếng Anh (Petrov và cộng sự, 2023) |
| Attention mask | Attention mask | Giữ, lần đầu ghi "mặt nạ attention". 1 ở token thật, 0 ở token đệm |
| Subword regularization | Subword regularization | Giữ. Lấy mẫu cách tách khác nhau khi huấn luyện |

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc ở scratchpad. Cả sáu file qua `ast.parse(..., feature_version=(3, 10))`; mỗi `.en.py` là bản sao y nguyên `.vi.py` (`cmp` không khác byte nào).

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `max-match.vi.py`, `max-match.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2) | 32 dòng, dòng dài nhất 74 ký tự, 8–11 ms. Câu 1 cả hai chiều: `giáo viên \| chấm \| bài tập \| trên \| máy tính`. Câu 2: trái `học sinh \| học sinh \| học`, phải `học \| sinh học \| sinh học`. Khớp lời văn |
| `bpe.vi.py`, `bpe.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2) | 44 dòng, dòng dài nhất 73 ký tự, 12–14 ms. `start vocab: 13`, 12 phép gộp như mục "Số tự chạy", `end vocab: 25`; `trường -> ['trường_']`, `thương -> ['t','h','ư','ơ','ng_']`, `nhường -> ['nh','ường_']`, `nghiêng -> ['ng','h','i','ê','ng_']`. Khớp lời văn, Hãy thử và comment VIZ |
| `count-tokens.vi.py`, `count-tokens.en.py` | chạy thật | 2026-11-05 | `.venv-nlp`: Python 3.14.5, transformers 5.22.1, tokenizers 0.23.3, huggingface_hub 2.4.0 (`-I -X utf8`) | 25 dòng, dòng dài nhất 76 ký tự. Chạy ba lần, output giống hệt; lần đầu 1 phút 54 giây (có tải), sau đó 29–36 giây (phần lớn là import). GPT-2: vi 33, en 7 token; mBERT: vi 9, en 7. Kết quả mẫu trong bài lấy từ lần này. Tải tokenizer: GPT-2 khoảng 2.85 MB (vocab.json, merges.txt, tokenizer.json, config), mBERT khoảng 2.96 MB (vocab.txt, tokenizer.json, config); không tải trọng số |
| `count-tokens.vi.py` không có torch | chạy thật | 2026-11-05 | venv tạm trong scratchpad: Python 3.14.5, chỉ `pip install transformers==5.22.1` (không có torch) | Chạy hết, output như trên. Stderr có một dòng `[transformers] PyTorch was not found. Models won't be available and only tokenizers, configuration and file/data utilities can be used.`; bài ghi rằng cảnh báo này là bình thường. Vì vậy `packages={['transformers']}` trong bài |

Ghi chú Windows: khi chuyển hướng output ra file hoặc pipe, Python dùng mã cp1252 và lỗi `UnicodeEncodeError` với chữ có dấu; in ra cửa sổ dòng lệnh thì không sao. Kiểm chứng dùng `-X utf8`. Bài có hộp Lỗi hay gặp riêng cho chuyện này (`python -X utf8` hoặc `PYTHONUTF8=1`).

## Sửa theo review (05/11/2026)

Theo review của `content-reviewer`: thêm Llama 1/2/3 ở đoạn SentencePiece; giải thích "bảng embedding" lần đầu (link bài Vector Semantics và Embeddings); comment VIZ ghi rõ bảng ở bước 0 và bước k, `Array.from(w)` và NFC; bỏ "(độ hợp lý)"; "siêu tham số chính" thống nhất; "thường không gộp qua dấu cách"; "bền hơn với nhiễu"; F1 97.90% kèm VLSP 2013 [N18]; `hardware` "từ 30 giây tới vài phút"; câu về cảnh báo PyTorch; hộp UnicodeEncodeError trên Windows; thêm Radford và cộng sự (2019) vào Đọc thêm. Không đổi file code, không đổi số.
