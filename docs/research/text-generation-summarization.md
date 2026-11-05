# Sinh văn bản và tóm tắt văn bản

Bài: `nlp/text-generation-summarization` (chỉ bản vi, khoảng 12–13 phút đọc). Bài cần biết trước trong roadmap: `nlp/gpt-distributed-training` (xuất bản cùng đợt, được link, nên không có khối "Nhắc nhanh"). Không dạy lại: beam search và phạt độ dài (`llm/seq2seq`), công thức nhiệt độ/top-k/top-p (`llm/text-api`), cách làm hỏng văn bản của T5/BART (`nlp/advanced-transformers`), TF-IDF (`nlp/vector-semantics-embeddings`). Hình dùng lại: VIZ `SamplingViz`. Một ô `PythonRunner` (thư viện chuẩn: tóm tắt trích xuất TF-IDF + ROUGE) và một ô `LocalCode` (`transformers`, T5-small).

Ngày tra: **05/11/2026**. Cách tra: WebFetch trang ACL Anthology, arXiv, Hugging Face; tải PDF rồi trích chữ bằng `pdftotext` (CTRL, TextRank, ROUGE, Maynez, Fan, Holtzman, PEGASUS, BART, T5); đọc mã nguồn `transformers` 5.22.1 trong `.venv-nlp`; chạy thật hai file code. Ý không có thẻ nguồn là kiến thức chung hoặc tự tính.

## Nguồn

- **[H20]** Holtzman, A., Buys, J., Du, L., Forbes, M., Choi, Y. (2020). [*The Curious Case of Neural Text Degeneration*](https://arxiv.org/abs/1904.09751). ICLR 2020. Đã đọc mục 1, 2, 3, 4.1, 5.3, bảng 1.
- **[F18]** Fan, A., Lewis, M., Dauphin, Y. (2018). [*Hierarchical Neural Story Generation*](https://aclanthology.org/P18-1082/). ACL 2018. Đã đọc mục 5 (cách sinh: top-k, $k = 10$).
- **[K19]** Keskar, N. S., McCann, B., Varshney, L. R., Xiong, C., Socher, R. (2019). [*CTRL: A Conditional Transformer Language Model for Controllable Generation*](https://arxiv.org/abs/1909.05858). arXiv:1909.05858. Đã đọc mục 4.1 (penalized sampling).
- **[MT04]** Mihalcea, R., Tarau, P. (2004). [*TextRank: Bringing Order into Text*](https://aclanthology.org/W04-3252/). EMNLP 2004, trang 404–411. Đã đọc mục 2, 4.
- **[L04]** Lin, C.-Y. (2004). [*ROUGE: A Package for Automatic Evaluation of Summaries*](https://aclanthology.org/W04-1013/). Text Summarization Branches Out, trang 74–81. Đã đọc mục 1–3, 6.
- **[Le20]** Lewis, M. và cộng sự (2020). [*BART: Denoising Sequence-to-Sequence Pre-training for Natural Language Generation, Translation, and Comprehension*](https://aclanthology.org/2020.acl-main.703/). ACL 2020, trang 7871–7880. Đọc mục 2.2, 3 (chỉ nhắc, chi tiết ở `advanced-transformers`).
- **[R20]** Raffel, C. và cộng sự (2020). [*Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer*](https://jmlr.org/papers/v21/20-074.html). JMLR 21(140). Đã đọc mục 2.3 (CNN/DM, chỉ pre-train tiếng Anh), 3.7 (multi-task pre-training cho bản cuối), 4 (CNN/DM: cách trích xuất làm tốt), phụ lục D.14.
- **[Z20]** Zhang, J., Zhao, Y., Saleh, M., Liu, P. J. (2020). [*PEGASUS: Pre-training with Extracted Gap-sentences for Abstractive Summarization*](https://arxiv.org/abs/1912.08777). ICML 2020. Đã đọc tóm tắt, mục 3.1, 6.1.
- **[M20]** Maynez, J., Narayan, S., Bohnet, B., McDonald, R. (2020). [*On Faithfulness and Factuality in Abstractive Summarization*](https://aclanthology.org/2020.acl-main.173/). ACL 2020, trang 1906–1919. Đã đọc mục 1, 2.1, 3, bảng 2.
- **[P22]** Phan, L., Tran, H., Nguyen, H., Trinh, T. H. (2022). [*ViT5: Pretrained Text-to-Text Transformer for Vietnamese Language Generation*](https://aclanthology.org/2022.naacl-srw.18/). NAACL 2022 Student Research Workshop, trang 136–142. Chỉ đọc tóm tắt (qua kết quả tìm kiếm và trang ACL).
- **[HF-gen]** Hugging Face. [*Generation strategies*](https://huggingface.co/docs/transformers/v5.22.1/en/generation_strategies), tài liệu Transformers 5.22.1 (đã mở được trang đúng phiên bản).
- **[HF-gc]** Hugging Face. [*Generation*](https://huggingface.co/docs/transformers/v5.22.1/en/main_classes/text_generation), tài liệu Transformers 5.22.1, mục `GenerationConfig` (đã mở được, có `top_k`, `top_p`, `repetition_penalty`, `no_repeat_ngram_size`).
- **[HF-t5]** [Thẻ mô hình `google-t5/t5-small`](https://huggingface.co/google-t5/t5-small): 60 triệu tham số, Apache 2.0.

## Ý chính dùng trong bài

### Giải mã

- [H20] Thí nghiệm: GPT-2 Large (762M), 5 000 đoạn, tối đa 200 token, ngữ cảnh là đoạn đầu (1–40 token) của văn bản WebText giữ lại. Bảng 1, dòng "Repetition %": người 0.28; tham lam 73.66; beam $b=16$ 28.94; stochastic beam 0.32; lấy mẫu thuần 0.22; $t = 0.9$ 0.66; top-k 40: 0.78; top-k 640: 0.28; top-k 40 + $t = 0.7$: 8.86; nucleus $p = 0.95$: 0.36. Định nghĩa lặp (hình 9): cụm ít nhất 2 token lặp ít nhất 3 lần ở cuối đoạn.
- [H20] Xác suất của cụm lặp tăng sau mỗi lần lặp (hình 4: vòng phản hồi dương). "Unreliable tail" làm lấy mẫu thuần rời rạc. "Directed generation" (dịch, data-to-text, tóm tắt): thường dùng beam, lặp và nhạt ít là vấn đề vì đầu ra bị đầu vào ràng buộc.
- [F18] Top-k random sampling, $k = 10$; tốt hơn beam search, vốn cho cụm phổ biến và lặp.
- [K19] $p_i = \exp(x_i/(T \cdot I(i \in g))) / \sum_j \exp(x_j/(T \cdot I(j \in g)))$, $I(c) = \theta$ nếu đúng, 1 nếu không; "greedy sampling and $\theta \approx 1.2$" cân bằng tốt; $\theta = 1$ là không phạt.
- Mã `transformers` 5.22.1, `RepetitionPenaltyLogitsProcessor.__call__`: `torch.where(score < 0, score * penalty, score / penalty)`. Tự tính: $\theta = 1.2$: $2.0 \to 1.667$, $-1.0 \to -1.2$ (chia thì thành $-0.833$). Quiz: $\theta = 1.5$, $-2.0 \to -3.0$ (chia thì $-1.333$).
- `GenerationConfig._get_default_generation_params()` có `"top_k": 50`, nên ô T5 đặt `top_k=0` để chỉ còn top-p.
- `config.task_specific_params["summarization"]` của t5-small: `num_beams=4`, `no_repeat_ngram_size=3`, `length_penalty=2.0`, `min_length=30`, `max_length=200`, `early_stopping=True`, `prefix="summarize: "`.

### Tóm tắt

- [MT04] Cạnh giữa hai câu: số từ chung chia $\log|S_i| + \log|S_j|$; PageRank có trọng số, $d = 0.85$; DUC 2002, 567 bản tin, 100 từ; "competitive with state-of-the-art systems".
- Chấm câu bằng cosine với vectơ tổng của cả bài (ý tưởng giống tóm tắt dựa trên tâm, không trích dẫn riêng trong bài). idf làm trơn như scikit-learn, cùng công thức với `nlp/vector-semantics-embeddings`.
- [Z20] GSG: bỏ câu quan trọng, thay bằng `[MASK1]`, decoder sinh lại; chọn câu theo ROUGE1-F1 giữa câu và phần còn lại (Ind-Orig tốt nhất); so sánh với GSR 30%; tối ưu GSR khác nhau theo bộ dữ liệu (15% CNN/DM, 30% XSum/Reddit, 45% WikiHow); 12 bộ dữ liệu, 1000 ví dụ vượt SOTA trên 6 bộ. Ở bài chỉ nói "trong các thí nghiệm so sánh, bỏ 30%".
- [R20] Bản công bố pre-train đa tác vụ (mục 3.7), trong đó có CNN/DM với tiền tố `summarize:`; chỉ pre-train tiếng Anh; CNN/DM: cách thuần trích xuất làm tốt; đầu vào CNN/DM đã đổi về chữ thường (phụ lục D.14).
- [P22] ViT5: T5 tiếng Việt; SOTA tóm tắt tóm lược trên Vietnews và WikiLingua (theo tóm tắt bài báo).

### ROUGE

- [L04] ROUGE-N gốc là recall (mẫu số là số n-gram của tham chiếu), có lấy $\min$ (count_match). ROUGE-L: $R = \mathrm{LCS}/m$, $P = \mathrm{LCS}/n$, $F = (1+\beta^2)RP/(R+\beta^2P)$; DUC đặt $\beta$ rất lớn nên chỉ còn recall. Mức bản tóm tắt: union LCS. Tương quan tốt với điểm người trên DUC 2001–2003.
- Bài dùng F1 ($\beta = 1$) và coi cả bản tóm tắt là một dãy (giống `rougeL`, không phải `rougeLsum`).

Số tự tính (kiểm bằng các hàm của ô code, `python -X utf8`):

| Bản máy | Tham chiếu | R1 | R2 | RL |
|---|---|---:|---:|---:|
| hôm nay trời đẹp | trời hôm nay rất đẹp | 0.889 | 0.286 | 0.667 |
| chuột đuổi mèo | mèo đuổi chuột | 1.000 | 0.000 | 0.333 |
| mưa lớn ở Huế ba ngày (quiz) | Huế mưa lớn suốt ba ngày | 0.833 | 0.400 | 0.667 |
| tuyến dài 81 km | tuyến dài 18 km | 0.750 | 0.333 | 0.750 |
| Tuyến xe buýt điện đầu tiên mở ở Đà Nẵng | Đà Nẵng mở tuyến xe buýt điện đầu tiên | 0.947 | 0.706 | 0.632 |
| Đà Nẵng khai trương tuyến buýt chạy điện đầu tiên | như trên | 0.737 | 0.353 | 0.737 |
| Đà Nẵng mở tuyến xe buýt điện thứ hai | như trên | 0.778 | 0.750 | 0.778 |
| Đà Nẵng đóng tuyến xe buýt điện đầu tiên | như trên | 0.889 | 0.750 | 0.889 |

Biến thể "trung bình idf" (quiz câu 5, thay dòng điểm trong ô code): chọn câu [1, 3], R1 0.508, R2 0.426, RL 0.508 (cả với idf làm trơn lẫn $\log(N/\mathrm{df})$).

### Ảo giác [M20]

- Nội sinh: tổng hợp sai từ thông tin có trong nguồn; ngoại sinh: thêm thông tin không suy ra được từ nguồn.
- XSum (226 711 bài BBC), 500 bài test, 3 người chấm. Bảng 2: tỉ lệ có ảo giác (I hoặc E) 73.1–79.3% ở các hệ thống; GOLD 76.9% (7.4% nội sinh, 73.1% ngoại sinh). Hơn 90% ảo giác ngoại sinh là sai. Mô hình pre-train vừa ROUGE cao hơn vừa trung thực hơn; thước đo dựa trên entailment tương quan với tính trung thực tốt hơn.
- Các cách giảm ảo giác trong bài (lọc dữ liệu, giải mã thận trọng, kiểm bằng NLI, lai trích xuất rồi viết lại, trích dẫn) là thực hành chung, chỉ ý NLI có nguồn [M20].

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc `scratchpad/tgs/`. Cả bốn file qua `ast.parse(..., feature_version=(3, 10))`; `.en.py` là bản sao y nguyên của `.vi.py`.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `extractive-rouge.vi.py`, `extractive-rouge.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2), chỉ thư viện chuẩn; thêm CPython 3.14 cho cùng kết quả | 60 dòng, dòng dài nhất 77 ký tự, 19 ms. `scores: 0.520 0.473 0.405 0.466 0.431 0.360 0.484`, `picked sentences: [1, 7]`, `tf-idf: R1 0.667  R2 0.557  RL 0.603  (36 words)`, `lead-2: R1 0.492  R2 0.413  RL 0.492  (38 words)`. Khớp lời văn |
| `t5-summarize.vi.py`, `t5-summarize.en.py` | chạy thật | 2026-11-05 | Python 3.14.5, `transformers` 5.22.1, `torch` 2.14.1+cpu, `tokenizers` 0.23.3, `sentencepiece` 0.2.3, `huggingface_hub` 2.4.0; checkpoint `google-t5/t5-small` (snapshot `df1b051c`) | 30 dòng, dòng dài nhất 76 ký tự. Tải lần đầu 244 MB (`model.safetensors` 242 043 056 byte, `tokenizer.json` 1.39 MB, `spiece.model` 0.79 MB). Chạy 4 lần, cùng output: `input tokens: 83`, ba dòng tóm tắt như khối "Kết quả mẫu". Thời gian ở lần chạy của writer: 2 min 6 s tới 7 min 27 s (máy bận; riêng `import transformers` 16 s); `content-reviewer` đo lại 10.3 s khi đã có mô hình trong cache, nên prop `hardware` ghi 10–20 giây, máy bận vài phút. Không dùng pipeline (transformers 5 đã bỏ vài pipeline) |

## Sửa sau review (05/11/2026)

- Thuật ngữ theo glossary: "hallucination" (lần đầu kèm "bịa thông tin"), "hallucination nội sinh/ngoại sinh"; bỏ "ảo giác".
- GOLD của XSum: 76.9% có hallucination, gần hết ngoại sinh (73.1%), nội sinh 7.4% ([M20] bảng 2).
- Top-p "gần người nhất" xét chung perplexity và HUSE ([H20] bảng 1, mục 4.2 và 5), không xét tỉ lệ lặp (lấy mẫu thuần 0.22% < nucleus 0.36%).
- Cấu hình tóm tắt của T5-small nằm trong `config.task_specific_params`, `generate` không tự áp (ô code ra tham lam khi `num_beams=1`).
- Đọc thêm: thêm ViT5 [P22], bỏ TextRank [MT04] (vẫn nhắc trong thân bài); thêm link trang `GenerationConfig` [HF-gc].
