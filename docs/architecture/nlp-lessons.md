# Phần NLP (5a): khuôn bài, code, hình và phạm vi từng bài

> Phạm vi: 13 bài của phần 5a (`nlp/*`), **chỉ bản vi** (như quyết định 43, 53). Phần này **làm theo khuôn của phần LLM** ([llm-lessons.md](llm-lessons.md)): `LocalCode`, khối "Nhắc nhanh", hình tĩnh theo kit FIG, mục "Minh họa" không bỏ. Tài liệu này chỉ ghi chỗ khác và phạm vi từng bài.
> Quyết định đầu vào: [decisions.md](../decisions.md) 70–76. Viết ngày 05/11/2026.

## 1. Khác với phần LLM

| Chủ đề | Phần LLM | Phần NLP |
|---|---|---|
| Code chạy trên máy | Gọi API (`openai`), đôi khi PyTorch | **`transformers` + PyTorch CPU**, model nhỏ tải từ Hugging Face Hub. Không gọi API, không có key, không có biến môi trường |
| Chỗ đặt code | `src/code/llm/<bài>/` | `src/code/nlp/<bài>/<tên>.vi.py` + `.en.py` là **bản sao y nguyên** (luật `code-pairs` thường: chỉ khác comment). Chuỗi dữ liệu tiếng Việt nằm ở cả hai bản cho tới khi dịch |
| Venv kiểm chứng | `.venv-llm/` | **`.venv-nlp/`** ở gốc worktree (venv tự có `.gitignore` `*`, không commit). Gói ghim ở `scripts/requirements-nlp.txt` |
| Ô `PythonRunner` | Chạy bằng Pyodide thật (`runpyo.mjs`) | Như vậy: Pyodide 314.0.7 thật trong Node |
| Ký hiệu | $L$ độ dài chuỗi, $T$ nhiệt độ | Giữ như phần LLM. Thêm: số chiều ẩn của Transformer $D$, số đầu $H$, số chiều mỗi đầu $d = D/H$ (bài embedding tĩnh dùng $d$ cho số chiều embedding); từ đích $w$, từ ngữ cảnh $c$, kích thước từ vựng $|V|$, văn bản (document) $d_j$ khi cần thì viết rõ bằng lời để khỏi trùng $d$ |

Mọi quy tắc khác của [llm-lessons.md](llm-lessons.md) mục 2.1, 2.2, 2.6, 2.7 giữ nguyên: 9 mục đúng tên heading; câu phiên bản mở mục "Ví dụ code"; mỗi file `.py` là chương trình hoàn chỉnh, ≤ 60 dòng (gợi ý 40), dòng ≤ 79 ký tự; đoạn trích trong MDX ≤ 8 dòng, chép đúng từ file; kết quả mẫu chỉ lấy từ lần chạy thật; tên model nhắc như sự kiện có năm kèm paper.

## 2. Code

### 2.1. Ba chỗ của code

- **`PythonRunner`** (chạy trên trang): Python thuần, `re`, `unicodedata`, `collections`, `numpy`, `scikit-learn`, `pandas`. Mỗi ô chạy dưới khoảng 3 giây trên Pyodide (không tính thời gian tải gói). In số với ít chữ số, `np.set_printoptions(precision=3, suppress=True)` khi in mảng. Có ngẫu nhiên thì `np.random.default_rng(0)`.
- **`LocalCode`** (chạy trên máy người đọc): `transformers` + `torch` CPU. `packages={['transformers', 'torch']}`; `command` mặc định; `hardware` ghi "CPU là đủ" và **dung lượng tải model lần đầu** (đo thật từ thư mục cache). Không đọc biến môi trường.
- Khối code không phải Python (lệnh `sh`, JSON mẫu) viết thẳng trong MDX.

### 2.2. Model của Hugging Face Hub

Chỉ dùng checkpoint nhỏ, có thật, tải về được ngày viết. Mỗi bài ghi id đầy đủ (`tổ-chức/tên`) trong code, kèm paper và năm trong lời văn. Gợi ý (writer đổi được nếu không tải được, ghi lại lý do):

| Bài | Checkpoint gợi ý | Việc |
|---|---|---|
| `tokenization` | `openai-community/gpt2`, `google-bert/bert-base-multilingual-cased` (chỉ tokenizer, vài MB) | Đếm token câu tiếng Việt và tiếng Anh |
| `bert` | `google-bert/bert-base-multilingual-cased` hoặc `distilbert/distilbert-base-multilingual-cased` | fill-mask |
| `gpt-distributed-training` | không tải model: GPT nhỏ tự viết + `torch.distributed` (backend `gloo`, 2 tiến trình CPU) | DDP |
| `sentiment-analysis` | `distilbert/distilbert-base-uncased-finetuned-sst-2-english` | pipeline phân loại |
| `named-entity-recognition` | `dslim/bert-base-NER` | pipeline `ner`, `aggregation_strategy="simple"` |
| `text-generation-summarization` | `google-t5/t5-small` | tóm tắt (tiền tố `summarize:`) |
| `question-answering` | `distilbert/distilbert-base-cased-distilled-squad` | QA trích xuất |

- **`transformers` 5 đã bỏ một số task của `pipeline`** (danh sách `REMOVED_TASKS`, `MIGRATION_GUIDE_V5.md`), trong đó có `question-answering`. Task nào không còn thì gọi thẳng lớp `AutoModelFor…` và tự xử lý logit; cách này còn cho người đọc thấy đúng các bước của mục Lý thuyết. Đã kiểm ngày 05/11/2026 với `transformers` 5.22.1.
- Model tiếng Việt (PhoBERT, ViT5, …) **chỉ nhắc trong lời văn** kèm paper, không đưa vào code: PhoBERT cần tách từ trước (VnCoreNLP, Java), nặng cho một ô minh họa.
- Đặt `transformers.set_seed(0)` hoặc `torch.manual_seed(0)` khi có lấy mẫu. Không truyền `device` (mặc định CPU).
- Văn bản đầu vào của model tiếng Anh là câu tiếng Anh; lời văn giải thích bằng tiếng Việt.

### 2.3. Kiểm chứng

- `PythonRunner`: `node <scratchpad>/runpyo.mjs <file>` (Pyodide 314.0.7 thật trong Node; script do phiên chính tạo, đường dẫn trong brief của agent). Không chạy bằng CPython rồi coi là đủ.
- `LocalCode`: `.venv-nlp/Scripts/python.exe -I <file>`, thư mục làm việc ở scratchpad. Mức `chạy thật` bắt buộc cho mọi file (không có mức "chạy khô" vì không có key).
- Ghi kết quả ở `docs/research/<bài>.md`, mục `## Kiểm chứng code`, cùng bảng như llm-lessons.md mục 2.5. `lesson-writer` tự tạo file research này (nguồn, ý chính, số tự chạy), không qua `summarizer` (quyết định 72).

## 3. Phạm vi từng bài

Mỗi bài dạy phần của mình, **link sang** bài khác thay vì dạy lại. Cả 13 bài xuất bản cùng một PR, nên link giữa các bài `nlp/*` được phép. Bài phần DL chưa có: chỉ ghi tên, không link; khối "Nhắc nhanh" tóm phần cần dùng (2–6 câu).

| # | Bài | Trọng tâm | Không dạy lại (link tới) | Code | Minh họa |
|---|---|---|---|---|---|
| 1 | `regex` | Ký tự, lớp ký tự, lượng từ, neo, nhóm, tham lam/lười, lookaround ngắn; mô-đun `re` (`findall`, `sub`, `compile`, cờ); `\w` với chữ có dấu; trích số điện thoại, email, ngày từ văn bản tiếng Việt; giới hạn của regex | | 2 `PythonRunner` | Bảng: một mẫu tách thành từng phần và chuỗi nó khớp |
| 2 | `tokenization` | Tách theo từ, ký tự, subword; tiếng Việt: âm tiết và từ, tách từ kiểu khớp dài nhất; BPE (Sennrich 2016), WordPiece, Unigram (Kudo 2018), SentencePiece, byte-level BPE; chi phí token của tiếng Việt | | `PythonRunner` BPE đồ chơi; `PythonRunner` khớp dài nhất; `LocalCode` đếm token bằng tokenizer thật | **VIZ `BpeMergeViz`** |
| 3 | `text-normalization` | Unicode NFC/NFD, dấu thanh kiểu cũ/mới ("hoà"/"hòa"), chữ hoa thường, khoảng trắng, URL/số; stemming và lemmatization (tiếng Anh), stopword; khi nào **không** nên chuẩn hóa (mô hình subword, phân tích cảm xúc) | regex, tokenization | 2 `PythonRunner` | Bảng trước/sau từng bước |
| 4 | `vector-semantics-embeddings` | Giả thuyết phân bố; ma trận từ–văn bản, từ–ngữ cảnh; TF-IDF; PMI/PPMI; cosine; vectơ thưa và dày; SVD (LSA) | | 2 `PythonRunner` (PPMI + cosine + SVD; TF-IDF bằng scikit-learn) | Bảng ma trận đồng xuất hiện nhỏ |
| 5 | `word2vec-glove-fasttext` | Skip-gram, CBOW, negative sampling; GloVe; FastText (n-gram ký tự, từ chưa gặp); phép tương tự, thiên lệch | cosine, PPMI (bài 4) | `PythonRunner` skip-gram + negative sampling bằng NumPy; `PythonRunner` n-gram ký tự FastText | **FIG `Word2VecFigure`** (CBOW và skip-gram) |
| 6 | `bert` | Encoder-only, attention hai chiều; MLM (15%, 80/10/10), NSP; `[CLS]`, `[SEP]`, segment embedding; fine-tune (đầu phân loại, gán nhãn token, span); RoBERTa, ALBERT, DistilBERT, PhoBERT | self-attention (Nhắc nhanh), WordPiece (bài 2) | `PythonRunner` che token 80/10/10; `LocalCode` fill-mask | **FIG `AttentionMaskFigure`** (hai chiều và nhân quả) |
| 7 | `gpt-distributed-training` | GPT decoder-only, mô hình ngôn ngữ nhân quả, GPT-1/2/3; huấn luyện phân tán: data parallel (all-reduce), gradient accumulation, mixed precision, tensor/pipeline parallel, ZeRO/FSDP ở mức khái niệm | `llm/build-first-llm`, `llm/llama-family` (ZeRO, FSDP chi tiết), `llm/gpt-family-finetuning` | `PythonRunner` NumPy: trung bình gradient các shard bằng gradient cả lô; tích lũy gradient; `LocalCode` DDP 2 tiến trình CPU (`gloo`) | Dùng lại **`ParallelismFigure`** |
| 8 | `advanced-transformers` | Bản đồ họ Transformer (encoder-only, decoder-only, encoder–decoder: T5, BART); mã hóa vị trí (sin, học được, RoPE, ALiBi); Pre-LN/Post-LN; attention hiệu quả (cửa sổ trượt, Longformer, attention tuyến tính, FlashAttention, KV cache, MQA/GQA) ở mức ý tưởng | `llm/llama-family` (RoPE, RMSNorm, SwiGLU, GQA chi tiết), `llm/seq2seq` | `PythonRunner` mặt nạ cửa sổ trượt + bias ALiBi + đếm chi phí $L^2$ | Dùng lại **`EncoderDecoderFigure`** hoặc bảng so sánh |
| 9 | `information-retrieval` | Chỉ mục ngược; xếp hạng TF-IDF, BM25; đánh giá (precision@k, recall@k, MRR, MAP, nDCG); truy xuất dày (bi-encoder, DPR), cross-encoder xếp lại, lai | `llm/rag-chatbot` | `PythonRunner` chỉ mục ngược + BM25; `PythonRunner` các độ đo | Bảng chỉ mục ngược |
| 10 | `sentiment-analysis` | Mức văn bản/câu/khía cạnh; từ điển cảm xúc; Naive Bayes, hồi quy logistic trên TF-IDF; phủ định; fine-tune BERT; đánh giá khi lệch lớp (F1 macro) | `ml/classification-metrics` (chưa có: Nhắc nhanh) | `PythonRunner` TF-IDF + LogisticRegression trên bộ nhận xét tiếng Việt tự viết; `LocalCode` pipeline | Bảng ma trận nhầm lẫn |
| 11 | `named-entity-recognition` | Loại thực thể; gán nhãn chuỗi; BIO/IOB2; CRF ở mức ý tưởng; BERT gán nhãn token, căn nhãn với subword (`-100`); F1 mức thực thể | bert | `PythonRunner` giải mã BIO thành span + F1 mức thực thể; `LocalCode` pipeline `ner` | Bảng câu với nhãn BIO từng token |
| 12 | `text-generation-summarization` | Giải mã: tham lam, beam (link seq2seq), lấy mẫu, nhiệt độ, top-k, top-p, phạt lặp; tóm tắt trích xuất (chấm câu, TextRank ý tưởng) và tóm lược (BART, T5, PEGASUS); ROUGE; ảo giác, tính trung thực | `llm/seq2seq` (beam), `llm/text-api` (tham số) | `PythonRunner` tóm tắt trích xuất + ROUGE-1/2/L; `LocalCode` T5 tóm tắt | Dùng lại **`SamplingViz`** |
| 13 | `question-answering` | Các loại QA; QA trích xuất (SQuAD, logit đầu/cuối, span dài nhất, không có đáp án ở SQuAD 2.0); miền mở: retriever–reader (DrQA, DPR), sinh có truy xuất; EM, F1 | information-retrieval, `llm/rag-chatbot` | `PythonRunner` chọn span tốt nhất + EM/F1; `LocalCode` pipeline QA | **FIG `RetrieverReaderFigure`** |

## 4. VIZ và FIG

| Tên | Loại | Bài | Ý chính |
|---|---|---|---|
| `BpeMergeViz` | VIZ mới | `tokenization` | Bấm từng bước: đếm cặp ký hiệu kề nhau trên một bộ từ nhỏ có tần số, gộp cặp nhiều nhất, xem từ vựng lớn dần và các từ bị chia lại |
| `SamplingViz` | VIZ dùng lại | `text-generation-summarization` | Như phần LLM |
| `Word2VecFigure` | FIG mới | `word2vec-glove-fasttext` | CBOW: ngữ cảnh → từ giữa; skip-gram: từ giữa → từng từ ngữ cảnh |
| `AttentionMaskFigure` | FIG mới | `bert` | Hai lưới mặt nạ: encoder (mọi ô) và decoder (tam giác dưới) trên cùng một câu ngắn |
| `RetrieverReaderFigure` | FIG mới | `question-answering` | Câu hỏi → retriever lấy top-k đoạn từ kho → reader chấm span → câu trả lời kèm điểm |
| `ParallelismFigure` | FIG dùng lại | `gpt-distributed-training` | Như phần LLM |
| `EncoderDecoderFigure` | FIG dùng lại | `advanced-transformers` (nếu hợp) | Như phần LLM |

Writer chỉ để comment giữ chỗ `{/* VIZ: … */}` / `{/* FIG: … */}` cho hình **mới**; hình **dùng lại** thì import và dùng luôn. `viz-builder` làm hình mới **lần lượt** (cùng sửa `src/data/figures/index.ts`).

## 5. Luật cho `lesson-writer` chạy song song

Như llm-lessons.md mục 2.8: chỉ tạo/sửa `src/content/docs/vi/nlp/<bài>.mdx`, `src/code/nlp/<bài>/*`, `docs/research/<bài>.md`. Không sửa `roadmap.ts`, glossary, component, file của bài khác; không chạy lệnh `npm`. Báo cáo có: thuật ngữ mới (cột theo glossary), gói Python cần thêm, link tới bài `nlp/*` khác đã dùng.

## 6. Lô FIG NLP (05/11/2026): `Word2VecFigure`, `AttentionMaskFigure`, `RetrieverReaderFigure`

**File:**

- Hình: `src/components/figures/{Word2Vec,AttentionMask,RetrieverReader}Figure.astro`; chữ vi/en: `src/data/figures/{word2-vec,attention-mask,retriever-reader}.ts`; đăng ký trong `FIGURES`. `word2-vec.ts` xuất thêm `WORD2VEC_CENTRE = 4`, `WORD2VEC_WINDOW = 2` (khớp `win = 2` của `skipgram-ns.vi.py`); `attention-mask.ts` xuất `ATTENTION_MASK_COMPARED = [1, 2]` (hàng "chim", cột "bay").
- **Id `word2-vec`, không phải `word2vec`:** hàm `kebab` của `figure-conventions.test.ts` tách "2V" thành "2-v", nên tên file chữ và id phải theo. Phần tử trên trang là `#fig-word2-vec`.
- Bài đã thay comment FIG (chỉ bản vi): `word2vec-glove-fasttext`, `bert`, `question-answering`. Theo mẫu bài ML/LLM: một dòng import, comment một dòng `{/* FIG: … */}` và thẻ. Câu dẫn trước hình giữ nguyên.
- Kit, mở rộng cho lô này:
  - `FigArrow tone="accent"`: nét 2px màu nhấn, đầu mũi tên màu nhấn, khi chính mũi tên là ý chính (bốn lần đoán riêng của skip-gram). CSS mới: `.atlas-fig-arrow[data-tone='accent']`, `.atlas-fig-arrow-head[data-tone='accent']`. Cặp màu `accent` trên nền trang đã đo (viz/figures.md 8.2 f: 7,42 / 6,42). Vẫn là `.atlas-fig-arrow` / `.atlas-fig-arrow-head`, nên `figureContrast` đo được. `figures.css` (bỏ comment, gzip): **759 byte** (74% của 1 024), trước lô này 752.
  - `src/lib/figures/layout.ts`: `gridLines(x, y, cell, n)`, mọi đường của lưới n × n trong **một** polyline (viền rồi các cột kiểu rắn bò, rồi các hàng); `upperCrosses(x, y, cell, n)`, dấu × (hai đường chéo) ở mọi ô trên đường chéo chính, **mỗi hàng một polyline** (zigzag sang phải, đổi hàng trên mép phải của lưới, zigzag về). Một polyline cho cả 10 ô thì bút phải đi dọc cạnh của một ô bị che để sang hàng sau, và ở hàng 1 đó là cạnh dưới của chính ô đang so. Test: `tests/unit/viz/figure-kit-nlp.test.ts` (ví dụ tính tay; đủ mọi cạnh của lưới 2–6; đủ và chỉ các đường chéo của ô bị che; không đi dọc cạnh ô bị che nào ngoài viền lưới; luật CSS `accent`).
  - Lô này **không** thêm loại nét nào cho e2e: lưới, dấu ×, khung "cửa sổ ±2" và vòng quanh ô đang so đều là `FigArrow head={false}`.

**Quyết định tự chọn (đổi lại được khi người dùng duyệt):**

- Cả ba hình chỉ có bố cục hẹp (cùng lý do llm-lessons.md 2.9.1: cột nội dung 632px ở 1280px).
- `Word2VecFigure`: CBOW trên, skip-gram dưới **ở mọi màn**, không chỉ trên điện thoại (hai cột bốn ô chữ 15 đơn vị không vừa 360). Câu bảy ô bằng nhau: "phở" `accent`, bốn từ trong cửa sổ để thường, "tôi", "ăn" dùng `off` (viền chấm, chữ mờ) và có chữ "ngoài cửa sổ" bên dưới; cửa sổ là một ngoặc dưới câu ghi "cửa sổ ±2". CBOW: trọng tâm là khối "trung bình 4 vectơ" (`accent`), mũi tên xuống "phở" ghi "1 lần đoán". Skip-gram: bốn mũi tên `accent` (tone mới), chữ "4 lần đoán riêng" bên trái "phở". **Dòng phụ bỏ ký hiệu "→"** của đặc tả ("ngữ cảnh → từ giữa"), viết "ngữ cảnh đoán từ giữa" / "từ giữa đoán từng ngữ cảnh": U+2192 không có trong tập con latin của Barlow, trình duyệt sẽ vẽ bằng font khác. Câu dẫn của bài nói hai kiến trúc "cạnh nhau", trong hình chúng xếp trên dưới; phiên chính hoặc writer có thể sửa thành "trên cùng một hình".
- `AttentionMaskFigure`: hai lưới **xếp trên dưới ở mọi màn**; ô 34 đơn vị, tên token cỡ 13. BERT trên, GPT dưới. **Không tô cả lưới theo nhóm** (đặc tả: lưới trái `accent`, lưới phải nhóm thứ hai): màu nhấn dành cho ô đang so, để mắt tìm ra ngay ô đó. Ô được nhìn: khối thường tô nền (`FigNode bare`); ô bị che: giữ màu trang và có dấu × (hai đường chéo), không chỉ khác màu. Ô đang so: `FigNode tone="accent" bare` (viền 2px, nền `accent-low`) cộng một **vòng `accent` 2px cách ngoài 3 đơn vị**: viền 2px đơn lẻ khó thấy ở chế độ tối. Ở lưới GPT ô này vừa có vòng vừa có dấu ×. Ghi chú trục ("Hàng: token đang tính", "Cột: token được nhìn", "25 / 25 ô được nhìn") đứng bên phải lưới BERT; chú giải ba mục (được nhìn, bị che, ô đang so) bên phải lưới GPT. Không xoay chữ (nhãn trục dọc), vì hộp bao của chữ xoay làm e2e "chữ trong `viewBox`" khó đoán.
- `RetrieverReaderFigure`: theo đúng bố cục hẹp của đặc tả. "Kho đoạn văn" là ba tờ chồng (hai tờ `bare` phía sau, lệch 4 đơn vị), mũi tên ngắn phải → trái vào Retriever. Top-k là ba tờ "Đoạn 1–3" chồng lệch 12/28 đơn vị; mỗi tờ có mũi tên riêng chạy sang phải rồi xuống Reader theo làn riêng (tờ trên cùng ở làn ngoài cùng, nên không mũi tên nào cắt nhau). Retriever và Reader `accent`; Reader rộng gấp gần hai lần Retriever để nổi nhất. Mũi tên Câu hỏi → Reader là `FigArrow tone="alt"` (đứt, xanh) dọc mép trái `x = 20`. Không vẽ đoạn trích tô sáng trong khối "Câu trả lời": dòng phụ "đoạn trích + điểm" nói đủ, và không có số cụ thể (đặc tả).
- Bản en nháp **giữ token tiếng Việt** của hai câu ví dụ (dữ liệu của bài, như code `.en.py` là bản sao), có dịch nghĩa trong mô tả `sr-only`. `lesson-translator` quyết khi dịch bài.

**Số đo (05/11/2026, chưa phải bản build):** render bằng Astro Container API (cùng HTML với bản build, không chạy `astro build`), rồi đo trong Chromium ở 375px với `figures.css`, Barlow và CSS KaTeX thật, màu theo token của `custom.css`. Phiên chính cần xác nhận bằng e2e trên bản build.

| Hình | `viewBox` hẹp | HTML (không tính KaTeX) | Phần tử | Chữ nhỏ nhất ở 375px | Lề chữ trong khối nhỏ nhất |
|---|---|---|---|---|---|
| `Word2VecFigure` | 360 × 462 | 6 701 (vi), 6 833 (en) ký tự | 111 | 12,39px | 6,8 |
| `AttentionMaskFigure` | 360 × 466 | 6 737 (vi), 6 876 (en) ký tự | 107 | 12,39px | (không có chữ trong khối) |
| `RetrieverReaderFigure` | 360 × 452 | 4 485 (vi), 4 686 (en) ký tự | 68–69 | 12,39px | 8,4 |

- Không chữ nào tràn khối hay ra ngoài `viewBox`, không chữ rời nào đè lên khối hay lên chữ rời khác (vi và en, sáng và tối); khung không rộng quá 375px.
- **Cặp màu chưa đo:** dấu × (`muted`) vẽ trên nền `accent-low` của ô đang so ở lưới GPT. `figureContrast` đo mọi nét so với nền trang, nên không thấy cặp này. Trên ảnh chụp, dấu × vẫn rõ ở cả hai chế độ.
