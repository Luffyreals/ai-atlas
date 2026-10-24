# RAG và chatbot hiện đại

Bài: `llm/rag-chatbot` (chỉ bản vi, khoảng 13 phút đọc, đợt 3). Cần biết trước theo `roadmap.ts`: `llm/prompt-engineering`, `nlp/information-retrieval`. Quyết định liên quan trong `docs/decisions.md`: 53 (code gọi API là code minh họa, SDK OpenAI-compatible), 54 (VIZ chỉ có `SamplingViz`; bài này dùng hình tĩnh `RagPipelineFigure`), 55 (biến môi trường, `.vi.py`), 56 (viết hết 23 bài rồi duyệt một lần). Theo `llm-lessons.md` mục 2.7, bài này được "Nhắc nhanh" dài tới một đoạn (truy xuất, embedding, cosine) vì `nlp/information-retrieval` chưa xuất bản.

Ngày tra: **24/10/2026**, bằng WebFetch/WebSearch trang arXiv và tài liệu nhà cung cấp, và chạy Python thật cho ô TF-IDF. Thẻ nguồn: [L20], [K20], [RZ09], [OAI-EMB], [GEM-OAI], [GROQ-OAI], [OLL-OAI], [ES23], [SH23], [MB23], [L23], [SR]. Ý không có thẻ là kiến thức chung hoặc gợi ý của `summarizer`. Không ghi giá.

## Nguồn

- **[L20]** Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W., Rocktäschel, T., Riedel, S., Kiela, D. (2020). [*Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*](https://arxiv.org/abs/2005.11401). NeurIPS 2020 (arXiv:2005.11401, v1 22/5/2020, v4 12/4/2021). Đã đọc trang tóm tắt, **chưa đọc toàn bài**.
- **[K20]** Karpukhin, V., Oğuz, B., Min, S., Lewis, P., Wu, L., Edunov, S., Chen, D., Yih, W. (2020). [*Dense Passage Retrieval for Open-Domain Question Answering*](https://arxiv.org/abs/2004.04906). EMNLP 2020 (arXiv:2004.04906, v1 10/4/2020, v3 30/9/2020). Đã đọc trang tóm tắt.
- **[RZ09]** Robertson, S., Zaragoza, H. (2009). [*The Probabilistic Relevance Framework: BM25 and Beyond*](https://nowpublishers.com/article/Details/INR-019). Foundations and Trends in Information Retrieval, tập 3, số 4, tr. 333-389, DOI 10.1561/1500000019. Xác minh thư mục và tóm tắt qua tìm kiếm, chưa đọc nội dung.
- **[OAI-EMB]** OpenAI. [*Embeddings*](https://developers.openai.com/api/docs/guides/embeddings) (hướng dẫn chính thức).
- **[GEM-OAI]** Google. [*OpenAI compatibility*](https://ai.google.dev/gemini-api/docs/openai), mục Embeddings.
- **[GROQ-OAI]** Groq. [*OpenAI Compatibility*](https://console.groq.com/docs/openai).
- **[OLL-OAI]** Ollama. [*OpenAI compatibility*](https://docs.ollama.com/api/openai-compatibility).
- **[ES23]** Es, S., James, J., Espinosa-Anke, L., Schockaert, S. (2024). [*RAGAs: Automated Evaluation of Retrieval Augmented Generation*](https://aclanthology.org/2024.eacl-demo.16). Proceedings of the 18th Conference of the EACL: System Demonstrations (EACL 2024), tr. 150–158 (đã mở trang ACL Anthology 24/10/2026). Bản arXiv: [2309.15217](https://arxiv.org/abs/2309.15217) (v1 26/9/2023, v2 28/4/2025). Bài ghi "EACL 2024 (System Demonstrations)" và link ACL Anthology.
- **[SH23]** Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., Yao, S. (2023). [*Reflexion: Language Agents with Verbal Reinforcement Learning*](https://arxiv.org/abs/2303.11366). arXiv:2303.11366. Trang không ghi hội nghị (bản NeurIPS 2023 có thể có nhưng **chưa xác minh**; ghi arXiv).
- **[MB23]** Madaan, A., Tandon, N., Gupta, P., Hallinan, S., Gao, L., Wiegreffe, S., Alon, U., Dziri, N., Prabhumoye, S., Yang, Y., Gupta, S., Majumder, B. P., Hermann, K., Welleck, S., Yazdanbakhsh, A., Clark, P. (2023). [*Self-Refine: Iterative Refinement with Self-Feedback*](https://arxiv.org/abs/2303.17651). NeurIPS 2023 ([trang proceedings](https://proceedings.neurips.cc/paper_files/paper/2023/hash/91edff07232fb1b55a505a9e9f6c0ff3-Abstract.html), theo `content-reviewer`); arXiv:2303.17651. Bài chỉ dẫn trong lời văn (link arXiv), không có trong Đọc thêm.
- **[L23]** Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., Liang, P. (2023). [*Lost in the Middle: How Language Models Use Long Contexts*](https://arxiv.org/abs/2307.03172). TACL (arXiv:2307.03172, 7/2023).
- **[SR]** Aurelio Labs. [*semantic-router*](https://github.com/aurelio-labs/semantic-router) (GitHub, giấy phép MIT). Thư viện, không phải paper. Dùng làm ví dụ cho "semantic router". Bản 0.x dùng ngưỡng `score_threshold`; bản 1.x (10/2026) mặc định luôn chọn tuyến gần nhất, muốn có "không tuyến nào" phải hiệu chỉnh ngưỡng trên câu hỏi có nhãn (theo `content-reviewer`).
- **Vector store, chỉ nhắc làm ví dụ (chưa mở trang kiểm):** [FAISS](https://github.com/facebookresearch/faiss) (Meta), [Chroma](https://github.com/chroma-core/chroma). Bài chỉ nêu tên, không so sánh tính năng. Nếu muốn dẫn paper FAISS: Johnson, J., Douze, M., Jégou, H. (2017), arXiv:1702.08734, **chưa kiểm** trong phiên này.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| **Groq có endpoint embeddings không** | Trang chính thức [GROQ-OAI] đã đọc **không nhắc** embeddings (chỉ có chat/Responses, text completions, audio). Tìm kiếm cho kết quả mâu thuẫn: vài trang bên thứ ba nói có `POST /openai/v1/embeddings` (một mẫu SDK dùng `nomic-embed-text-v1.5`), một tài liệu khác nói không có, và một câu trả lời cũ trên diễn đàn Groq nói chưa có kế hoạch. Chưa mở được `console.groq.com/docs/models`. | Bài ghi Groq là "chưa kiểm được trên tài liệu chính thức". Hướng đi an toàn cho người dùng Groq: dùng nhà cung cấp khác (Gemini, OpenAI, Ollama) cho embedding, hoặc embedding trên máy. `reviewer` kiểm bằng `GET /openai/v1/models` với key thật nếu có. |
| Tên model embedding của Gemini | [GEM-OAI] ví dụ dùng `gemini-embedding-2-preview` (đa phương thức) và nhắc `gemini-embedding-001` (chỉ văn bản). Tên đổi nhanh, và hậu tố `preview` có thể đổi. | Bài **không** ghi tên cụ thể trong code; đọc từ `EMBEDDING_MODEL`. Có thể nhắc tên kèm "10/2026". |
| Ollama: model embedding nào, ví dụ code | [OLL-OAI] **không có ví dụ** và không nêu tên model embedding. Chỉ liệt kê `model`, `input` (chuỗi hoặc mảng chuỗi), `encoding_format`, `dimensions` là được hỗ trợ; `user` thì không. | Không nêu tên model Ollama. Nói "model embedding đã `ollama pull`" và để người dùng tự chọn. |
| Embedding của Gemini và Ollama có chuẩn hóa độ dài 1 không | Chỉ [OAI-EMB] nói vector OpenAI có độ dài 1. Hai nơi kia chưa kiểm. | Code chuẩn hóa vector rồi mới lấy tích vô hướng, hoặc dùng công thức cosine đầy đủ; không dựa vào giả định "đã chuẩn hóa". |
| Số liệu chunk size, overlap, `k` "tốt nhất" | Không có nguồn tin cậy đã đọc. | Nêu như điểm xuất phát và nói phải thử trên dữ liệu của bạn; không viết con số "chuẩn". |
| "Semantic router" và "reflection" trong giáo án gốc nghĩa là gì chính xác | Giáo án chỉ có tiêu đề ("Generating Synthetic Dataset cho RAG, Semantic Router, Reflection"). Không có thuật ngữ chuẩn duy nhất. | Bài định nghĩa cách dùng của mình (xem Ý chính) và dẫn [SR], [SH23], [MB23] là ví dụ, ghi rõ không phải chuẩn. |
| Sinh dữ liệu tổng hợp để đánh giá RAG | Chỉ có [ES23] (đánh giá không cần nhãn người). [ES23] không nêu cụ thể "sinh câu hỏi từ đoạn văn"; trang tóm tắt cũng không liệt kê tên các chỉ số. | Phần "sinh câu hỏi từ chính đoạn văn" là kỹ thuật phổ biến nhưng **chưa có nguồn đã đọc**; bài viết như quy trình gợi ý, dẫn [ES23] là "một khung đánh giá liên quan". Không ghi tên chỉ số của Ragas nếu chưa đọc bài. |
| Tính chất thật của BM25 (công thức, $k_1$, $b$) | Chưa đọc nội dung [RZ09]. | Chỉ nhắc BM25 là một hàm chấm điểm từ khóa kiểu TF-IDF cải tiến, không viết công thức. |

## Ý chính

- **Vì sao cần RAG [L20, kiến thức chung]:** mô hình chỉ biết điều nó học lúc huấn luyện; dữ liệu riêng của bạn hoặc tin mới thì không có. Cách đơn giản nhất: lúc hỏi, tìm vài đoạn văn liên quan trong kho tài liệu và dán vào prompt, bảo mô hình trả lời dựa trên đó. Lewis và cộng sự gọi kho tài liệu là "bộ nhớ ngoài tham số" (non-parametric), còn trọng số mô hình là bộ nhớ tham số. Bản gốc huấn luyện chung bộ truy xuất và bộ sinh; ở dạng bạn dùng với API chỉ ghép prompt, không huấn luyện gì. Bài nói rõ chỗ khác nhau này.
- **Hai giai đoạn:** *indexing* (làm một lần hoặc khi tài liệu đổi) và *truy vấn* (mỗi câu hỏi). Khớp với `RagPipelineFigure` (mục 2.9 của `llm-lessons.md`): câu hỏi dùng để truy xuất đoạn văn, đoạn văn ghép vào prompt, rồi gọi mô hình.
- **Indexing, bước 1, chunking:** cắt tài liệu thành đoạn vừa đủ. Đoạn quá dài thì chứa nhiều ý, điểm tương đồng bị loãng và tốn token; quá ngắn thì mất ngữ cảnh. Các cách cắt: theo số ký tự/token cố định, theo đoạn hoặc tiêu đề, có phần gối đầu (overlap) giữa hai đoạn để khỏi cắt đôi một ý. Không có kích thước "đúng" (xem "Chưa xác minh").
- **Indexing, bước 2, embedding [OAI-EMB]:** biến mỗi đoạn thành một vector số, sao cho đoạn có nghĩa gần nhau thì vector gần nhau. Qua SDK `openai`: `client.embeddings.create(model=..., input=[...])`, vector ở `response.data[i].embedding`. `input` nhận một chuỗi hoặc danh sách chuỗi (gửi một lô). Giới hạn đầu vào 8 192 token với ba model OpenAI [OAI-EMB]. Tham số `dimensions` (OpenAI, Ollama) rút ngắn vector; OpenAI khuyên dùng tham số này thay vì tự cắt, vì cắt tay thì phải chuẩn hóa lại [OAI-EMB].
- **Indexing, bước 3, vector store:** nơi lưu vector và tìm các vector gần nhất. Kho nhỏ thì một mảng NumPy là đủ (tích vô hướng với mọi vector). Kho lớn cần chỉ mục gần đúng; ví dụ FAISS, Chroma. Bài chỉ nêu tên và link.
- **Truy vấn:** embed câu hỏi bằng **cùng model** với lúc indexing, tính cosine với từng đoạn, lấy **top-k** đoạn cao nhất. $k$ là siêu tham số: ít thì thiếu thông tin, nhiều thì tốn token và gây nhiễu. [L23] cho thấy mô hình dùng ngữ cảnh dài kém hơn khi thông tin nằm giữa; đây là lý do không nhồi quá nhiều đoạn và nên đặt đoạn quan trọng nhất ở đầu hoặc cuối (bài dùng thận trọng: kết quả của paper là trên các tác vụ cụ thể, không phải luật).
- **Prompt kèm ngữ cảnh và trích nguồn:** prompt gồm chỉ dẫn (chỉ trả lời dựa trên các đoạn dưới đây, nếu không có thì nói "không biết"), các đoạn đánh số `[1]`, `[2]`... kèm tên tài liệu, rồi câu hỏi. Yêu cầu mô hình ghi số đoạn khi trả lời để người dùng kiểm. Lưu ý trích nguồn do mô hình viết có thể sai; chương trình nên kiểm số đoạn có thật trong danh sách đã đưa vào (gợi ý).
- **Dữ liệu tổng hợp để đánh giá:** để biết RAG tốt hay không cần bộ (câu hỏi, đoạn đúng, đáp án). Nhờ LLM sinh câu hỏi từ từng đoạn thì có ngay cặp (câu hỏi, đoạn nguồn); sau đó đo xem truy xuất có đưa đoạn nguồn vào top-k không (tỷ lệ trúng, hit rate). Cảnh báo: câu hỏi LLM sinh thường dễ và dùng chung từ ngữ với đoạn nguồn, nên điểm lạc quan hơn câu hỏi thật của người dùng. [ES23] là một khung đánh giá RAG không cần nhãn người, bài dẫn như đọc thêm.
- **Semantic router [SR]:** thay vì cho mọi câu hỏi chạy qua RAG, định tuyến theo ý nghĩa. Mỗi tuyến (ví dụ "hỏi tài liệu", "chào hỏi", "ngoài phạm vi") có vài câu mẫu; câu hỏi mới được embed và so cosine với câu mẫu của từng tuyến; chọn tuyến gần nhất, và có ngưỡng: dưới ngưỡng thì không tuyến nào. [SR] dựa trên ý tưởng này: bản 0.x dùng ngưỡng trên điểm tương đồng (`score_threshold`); bản 1.x (10/2026) mặc định luôn chọn tuyến gần nhất, muốn có "không tuyến nào" thì phải hiệu chỉnh ngưỡng trên câu hỏi có nhãn. Ngưỡng cụ thể (ví dụ $0.4$, $0.7$ trong bài) chỉ là số minh họa. Rẻ và nhanh hơn hỏi LLM chọn tuyến, vì chỉ cần một lần embed.
- **Reflection (tự kiểm lại):** sau khi có câu trả lời, gọi mô hình lần nữa để kiểm: câu trả lời có dựa trên ngữ cảnh không, có thiếu gì không; nếu không đạt thì sửa hoặc truy xuất lại với câu hỏi viết lại. Là hướng chung của [MB23] (cùng một mô hình sinh, phê bình, rồi sửa) và [SH23] (agent viết nhận xét bằng lời, lưu lại cho lần thử sau, không cập nhật trọng số). Hai paper không nói về RAG; bài dùng chúng làm nguồn cho ý tưởng, không nói "RAG phải có reflection". Đánh đổi: mỗi vòng thêm một lần gọi API (độ trễ, chi phí).
- **Chatbot nhiều lượt (gợi ý):** câu hỏi nối tiếp ("còn cái thứ hai thì sao?") không tự đủ nghĩa để truy xuất. Cách thường dùng: nhờ mô hình viết lại câu hỏi thành câu đầy đủ dựa trên lịch sử trước khi embed. Nhắc lại với bài `text-api`: API không giữ trạng thái, bạn gửi lại `messages` mỗi lần.
- **TF-IDF, BM25 và dense [K20, RZ09]:** truy xuất bằng từ khóa (TF-IDF, BM25) chỉ khớp khi hai bên **dùng chung từ**; dense (embedding) khớp theo nghĩa. [K20] báo cáo mô hình dense vượt BM25 (Lucene) khoảng 9 đến 19 điểm phần trăm tuyệt đối về độ chính xác top-20 trên nhiều bộ dữ liệu hỏi đáp mở, **trong điều kiện của paper** (tiếng Anh, huấn luyện trên bộ hỏi đáp); không suy ra tiếng Việt hay mọi dữ liệu đều vậy. Thực tế nhiều hệ thống kết hợp cả hai (gợi ý, chưa nguồn).

## Công thức quan trọng

Ký hiệu: hai vector $\mathbf{a},\mathbf{b}\in\mathbb{R}^d$ ($d$ là số chiều embedding); câu hỏi $\mathbf{q}$, đoạn $\mathbf{d}_i$.

**Độ tương tự cosine:**

$$\cos(\mathbf{a},\mathbf{b})=\frac{\mathbf{a}\cdot\mathbf{b}}{\lVert\mathbf{a}\rVert\,\lVert\mathbf{b}\rVert}$$

Là cosin của góc giữa hai vectơ: chỉ so **hướng**, không so độ dài. Từ $-1$ đến $1$. Nếu cả hai đã có độ dài 1 thì cosine bằng tích vô hướng $\mathbf{a}\cdot\mathbf{b}$ (OpenAI nói vector của họ đã chuẩn hóa, [OAI-EMB]).

**Truy xuất top-$k$:**

$$\text{top-}k(\mathbf{q})=\operatorname*{arg\,top\text{-}k}_{i=1,\dots,m}\ \cos(\mathbf{q},\mathbf{d}_i)$$

với $m$ là số đoạn (theo ký hiệu site, $m$ là số mẫu). Nghĩa: chấm điểm cả $m$ đoạn rồi giữ $k$ đoạn có điểm cao nhất.

**TF-IDF (ô code, cách scikit-learn làm; chưa viết ra công thức đầy đủ, vì các biến thể khác nhau):** mỗi từ có trọng số lớn nếu xuất hiện nhiều trong đoạn đó nhưng hiếm trong cả kho. Vector của đoạn được chuẩn hóa $L^2$ (mặc định `norm='l2'`, đã kiểm), nên tích vô hướng của hai vector TF-IDF chính là cosine. Đây là điểm nối giữa phần "Nhắc nhanh" và ô code.

### Số tự chạy (kiểm bằng Python, 24/10/2026)

File tạm: `C:\Users\Dell\AppData\Local\Temp\claude\C--Users-Dell--claude-spares-spare-oouS1w\79a7891d-1d77-4416-b0df-a18c7072fd07\scratchpad\rag_tfidf.py`. Chạy bằng venv Pyodide `C:/Users/Dell/.venvs/ai-atlas-py314` (scikit-learn 1.8.0, numpy 2.4.6, đúng bản Pyodide 314.0.7) với `-X utf8` (console Windows mặc định không in được tiếng Việt; trong Pyodide thì không ảnh hưởng). Cũng chạy được ở `.venv-llm` (scikit-learn 1.9.1) với cùng thứ hạng. **Chỉ chạy ở scratchpad; chưa đặt vào `src/code/`** (việc của `lesson-writer`).

Cấu hình: 5 đoạn tiếng Việt ngắn (hồi quy tuyến tính, gradient descent, RAG, overfitting, vector store), `TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)`, điểm = `(X @ q.T)`, in top 3. Ma trận `X` có hình (5, 147).

| Câu hỏi | Top 1 | Top 2 | Top 3 |
|---|---|---|---|
| "Làm sao để mô hình trả lời dựa trên đoạn văn tìm được?" | đoạn RAG, **0,659** | đoạn vector store, 0,151 | đoạn overfitting, 0,093 |
| "Cách lưu trữ tri thức ngoài mô hình là gì?" (không dùng chung từ nào có nghĩa với đoạn đúng) | đoạn **overfitting**, 0,178 | đoạn RAG, 0,170 | đoạn vector store, 0,095 |

- Câu 1: chỉ dùng unigram (bỏ `ngram_range`) cho 0,706 / 0,225 / 0,116, cùng thứ hạng.
- Câu 2 là **ví dụ trực giác hay**: câu hỏi và đoạn đúng cùng nói về một ý nhưng dùng từ khác nhau, nên TF-IDF xếp đoạn sai (overfitting, chỉ trùng "mô hình") lên đầu. Đây chính là lý do cần embedding. Con số này chỉ đúng với 5 đoạn và câu hỏi cụ thể ở trên, không phải kết luận chung. Nếu `lesson-writer` đổi văn bản, chạy lại và dùng số mới.
- Tokenizer mặc định của scikit-learn tách theo khoảng trắng và ký tự chữ, nên chạy được với tiếng Việt có dấu; mỗi tiếng là một "từ". Dùng bigram giúp bắt cụm hai tiếng. Chưa dùng bộ tách từ tiếng Việt (ngoài Pyodide).

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; "(gợi ý)" là của `summarizer`.

- **Thi mở sách (gợi ý):** mô hình thuần túy giống thí sinh thi đóng sách; RAG cho phép lật sách. Bước tìm đúng trang (truy xuất) quan trọng ngang việc đọc hiểu; lật nhầm trang thì thí sinh giỏi mấy cũng trả lời sai, tự tin.
- **Thủ thư (gợi ý):** indexing là xếp sách lên kệ và làm thẻ mục lục; truy vấn là hỏi thủ thư, thủ thư đưa 3 cuốn gần nhất. Embedding là cách thủ thư xếp sách theo chủ đề thay vì theo bảng chữ cái.
- **Cosine như hai mũi tên (gợi ý):** hai đoạn văn dài ngắn khác nhau nhưng cùng chủ đề thì mũi tên chỉ cùng hướng; cosine chỉ nhìn hướng nên độ dài văn bản không làm sai điểm. Rất hợp để giải thích vì sao dùng cosine thay vì khoảng cách.
- **Cắt ảnh để dán vào bài (gợi ý):** chunking giống cắt ảnh để dán vào báo: cắt quá nhỏ thì không ai hiểu mảnh đó là gì, cắt quá lớn thì tìm mãi không thấy phần cần. Gối đầu giống để lề thừa ở mép cắt.
- **Ví dụ 5 đoạn ở trên:** hai câu hỏi, một trúng (0,659) một trượt vì khác từ. Dẫn từ "dùng chung từ" sang "dùng chung nghĩa".
- **Semantic router như lễ tân (gợi ý):** lễ tân nghe câu bạn hỏi rồi chỉ về đúng phòng; nghe không rõ (dưới ngưỡng) thì nói "xin lỗi tôi không rõ" thay vì chỉ bừa.
- **Reflection như đọc lại bài trước khi nộp (gợi ý):** mỗi vòng đọc lại tốn thời gian, nhưng bắt được lỗi dễ thấy (bịa số, quên nguồn).

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Tưởng RAG hết bịa (hallucination).** RAG giảm bịa nhưng không loại bỏ: truy xuất sai đoạn thì mô hình trả lời sai một cách tự tin; mô hình vẫn có thể thêm ý ngoài ngữ cảnh. Cần chỉ dẫn "chỉ dùng các đoạn dưới đây" và cách đánh giá.
2. **Embedding câu hỏi và đoạn bằng hai model khác nhau.** Vector ở hai không gian khác nhau, cosine vô nghĩa. Phải dùng cùng model; đổi model embedding thì phải embed lại toàn bộ kho. Số chiều cũng phải khớp (nếu dùng `dimensions`, dùng cùng giá trị ở cả hai phía).
3. **Hiểu RAG là "fine-tune mô hình bằng tài liệu".** Không; không đổi trọng số nào. Tài liệu chỉ được đưa vào prompt lúc hỏi [L20 dạng gốc có huấn luyện, nhưng cách dùng qua API thì không].
4. **Chunk quá lớn hoặc quá nhỏ, không có overlap.** Một ý bị cắt đôi, cả hai nửa đều không còn trả lời được câu hỏi.
5. **$k$ lớn hơn là tốt hơn.** Thêm đoạn nhiễu làm tốn token và có thể làm mô hình lạc đề; [L23] cho thấy thông tin giữa ngữ cảnh dài dễ bị bỏ qua.
6. **Cosine cao nghĩa là đúng.** Cosine chỉ là độ gần trong không gian embedding. Ngay cả đoạn xếp hạng 1 cũng có thể không chứa đáp án; cần ngưỡng và cho phép trả lời "không có trong tài liệu".
7. **TF-IDF/BM25 "lỗi thời" nên bỏ.** Nó vẫn nhanh, rẻ, giải thích được, và tốt khi câu hỏi chứa tên riêng, mã sản phẩm (gợi ý, chưa nguồn). [K20] chỉ nói dense thắng BM25 trong các thí nghiệm của họ.
8. **Giả định mọi nhà cung cấp "OpenAI-compatible" đều có embeddings.** OpenAI, Gemini [GEM-OAI], Ollama [OLL-OAI] có; Groq chưa xác minh (xem trên). Gửi `client.embeddings.create` tới nơi không có sẽ trả lỗi (thường 404, **chưa thử**).
9. **Nhầm tên model chat với model embedding.** `LLM_MODEL` và `EMBEDDING_MODEL` là hai model khác nhau; đưa tên model chat vào `embeddings.create` sẽ lỗi (suy ra từ API, chưa thử thật).
10. **Tin trích nguồn do mô hình viết.** Mô hình có thể ghi `[3]` cho đoạn không hề chứa ý đó. Nên kiểm trong code rằng số đoạn có thật, và cho người dùng mở xem đoạn gốc.
11. **Không chuẩn hóa vector khi tính tích vô hướng.** Nếu vector chưa độ dài 1 (hoặc chưa kiểm), tích vô hướng không bằng cosine; xếp hạng có thể sai lệch vì đoạn có vector dài chiếm ưu thế.
12. **Câu hỏi nối tiếp không được viết lại.** Embed "còn cái thứ hai thì sao?" không tìm được gì.
13. **Dữ liệu tổng hợp cho điểm quá đẹp.** Câu hỏi LLM sinh từ đoạn gần như trùng từ với đoạn, nên hit rate cao hơn thực tế. Nên trộn một ít câu hỏi thật.
14. **Reflection vô hạn.** Mỗi vòng thêm chi phí và độ trễ; đặt số vòng tối đa (ví dụ 1 đến 2).
15. **Ghi cứng khóa, tên model.** Như bài `text-api`: biến môi trường (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `LLM_MODEL`, và `EMBEDDING_MODEL` theo mục 2.3 của `llm-lessons.md`). Không `os.getenv` (build sẽ lỗi, mục 2.3).

## Liên quan tới bài nào

Slug lấy từ `src/data/roadmap.ts` (đã mở phiên này).

- **Cần biết trước:** `llm/prompt-engineering` (viết prompt, chỉ dẫn "chỉ dựa trên ngữ cảnh"; **cùng đợt 2**, đã có `docs/research/prompt-engineering.md`) và `nlp/information-retrieval` (chưa xuất bản; vì vậy bài này phải có "Nhắc nhanh" dài về truy xuất, embedding, cosine). `nlp/information-retrieval` cần `nlp/vector-semantics-embeddings`.
- **`llm/text-api`:** cú pháp `client`, `messages`, biến môi trường; `embeddings.create` thuộc cùng SDK. Link tới bảng nhà cung cấp ở đó, không chép lại. Bảng đó chưa có cột embeddings; nên thêm hoặc ghi ngắn trong bài này (việc của phiên chính, vì `text-api` không thuộc đợt này).
- **Bài sau dùng lại:** `llm/langchain-llamaindex` (cài RAG bằng thư viện; dùng lại `RagPipelineFigure`), `llm/graph-rag` (RAG trên đồ thị; cùng hình), `llm/agents` (tool calling; reflection liên quan), `llm/web-crawling-mongodb` (nguồn dữ liệu cho kho tài liệu; cùng đợt 2, không link).
- **Giáo án gốc:** buổi 6 phần LLM (dòng 77 của `giáo án ai.md`): "RAG và xây dựng hệ thống Chatbot hiện đại: Generating Synthetic Dataset cho RAG, Semantic Router, Reflection". Chỉ tham khảo.
- **Hình:** `RagPipelineFigure` (mục 2.9). Hai pha (indexing, truy vấn) nên là hai hàng hoặc hai nhóm trong hình; chữ vi/en ở `src/data/figures/rag-pipeline.ts`.

## Gợi ý khuôn bài và ô code

- **Ô `PythonRunner` (chạy trên trang):** truy xuất TF-IDF bằng scikit-learn trên 5 đoạn văn tiếng Việt như trên. Ngắn (khoảng 20 dòng), chạy dưới 2 giây trên Pyodide (chưa đo trong Pyodide thật; dùng venv Pyodide ở trên là đủ theo `viz/README.md` mục 2.5), `print` bằng tiếng Anh ngắn hoặc chỉ số theo mục 2.4. Hai câu hỏi (trúng và trượt) làm cầu nối sang embedding.
- **Ô `LocalCode` (chạy trên máy):** `embeddings.create` rồi cosine bằng NumPy rồi `chat.completions.create` với prompt kèm ngữ cảnh và trích nguồn; biến `EMBEDDING_MODEL` thêm vào ba biến cố định. Một chương trình tự chạy, ≤ 60 dòng, ≤ 79 ký tự mỗi dòng. Gói `openai`, `numpy`. **Cần mức "chạy thật" nếu có kết quả mẫu**; khi chưa có key embeddings thì chỉ "chạy khô" và không đưa kết quả mẫu. Gợi ý nhỏ cho reviewer: nếu nhà cung cấp chat của người dùng không có embeddings, cần hai bộ biến (khác `OPENAI_BASE_URL` giữa chat và embedding), việc này `llm-lessons.md` mục 2.3 chưa nói; hỏi phiên chính.
- Mục "Minh họa": `RagPipelineFigure` (bắt buộc có mục theo mục 2.7).
- Semantic router và reflection: mô tả bằng lời và bảng; nếu muốn có code, một đoạn ngắn trong MDX (≤ 8 dòng).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Sinh có truy xuất bổ trợ (RAG) | Retrieval-Augmented Generation | Giữ "RAG", gloss lần đầu |
| Truy xuất | Retrieval | Dịch "truy xuất" |
| Chia đoạn | Chunking | Gloss "chia tài liệu thành đoạn", sau đó giữ "chunk" |
| Embedding | Embedding | Giữ nguyên (đã quen) |
| Kho vector | Vector store | Gloss; giữ "vector store" khi nói tên công cụ |
| Độ tương tự cosine | Cosine similarity | Dịch |
| Top-k | Top-k | Giữ; khác với top-k của lấy mẫu token ở `text-api`, nói rõ một câu |
| Bộ định tuyến ngữ nghĩa | Semantic router | Gloss, giữ tiếng Anh |
| Phản tư (tự kiểm lại) | Reflection | Gloss "mô hình tự kiểm lại câu trả lời", giữ "reflection" |
| Dữ liệu tổng hợp | Synthetic data | Dịch |
| Trích nguồn | Citation / attribution | Dịch |
| Ảo giác / bịa | Hallucination | Giữ "hallucination", gloss "bịa thông tin" |
| Tỷ lệ trúng | Hit rate | Dịch, nói rõ định nghĩa |

## Đọc thêm đề xuất

1. [L20] Lewis và cộng sự (2020), paper RAG gốc.
2. [K20] Karpukhin và cộng sự (2020), DPR, để hiểu vì sao dense có thể hơn từ khóa.
3. [OAI-EMB] Hướng dẫn Embeddings của OpenAI.
4. [L23] Liu và cộng sự (2023), *Lost in the Middle*, về vị trí đoạn trong ngữ cảnh.
5. [ES23] Es và cộng sự (2023), Ragas, về đánh giá RAG.
6. [RZ09] Robertson và Zaragoza (2009), BM25, cho người muốn hiểu cách chấm điểm từ khóa (sách, không bắt buộc).

## Kiểm chứng code

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `tfidf-search.vi.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật (`runpyo.mjs`: Python 3.14.2, NumPy 2.4.6, scikit-learn 1.8.0) | `X shape: (5, 72)`; Q1 `leave 0.733 \| salary 0.196 \| remote 0.055`; Q2 `leave 0.301 \| remote 0.141 \| salary 0.092`; Q3 `remote 0.440 \| leave 0.217 \| salary 0.170`. Khớp lời văn. Chạy lại sau khi đổi comment "đoạn" → "chunk": cùng số. CPython 3.14.5 + scikit-learn 1.9.1 (`.venv-llm`) cho cùng số |
| `tfidf-search.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật (`runpyo.mjs`) | Số cho người dịch dùng: `X shape: (5, 68)`; Q1 `leave 0.684 \| salary 0.144 \| remote 0.077`; Q2 `insurance 0.256 \| leave 0.000 \| remote 0.000` (xếp nhầm `insurance` vì chung chữ "from"); Q3 `remote 0.373 \| leave 0.000 \| laptop 0.000` |
| `rag.vi.py` | chạy khô | 2026-10-24 | `.venv-llm`, Python 3.14.5, openai 3.37.0, NumPy 2.5.4 | Chưa có `.env.llm`, không có kết quả mẫu. Thiếu `OPENAI_API_KEY` → `KeyError: 'OPENAI_API_KEY'`; thiếu `EMBEDDING_MODEL` → `KeyError: 'EMBEDDING_MODEL'`; cổng đóng → `openai.APIConnectionError` ở lần embed đầu tiên. Server giả hai cổng (cổng ngẫu nhiên): không đặt `EMBEDDING_*` thì embeddings đi cổng chat với key chat; đặt `EMBEDDING_BASE_URL`, `EMBEDDING_API_KEY` thì embeddings đi cổng riêng với key riêng, chat vẫn ở cổng chat. Regex trích nguồn mới bắt cả `[1, 2]`, `[2,3]`, `[ 4 ]`: câu trả lời giả `Có [1], xem [1, 2] và [2,3], cả [ 4 ].` cho `Số đoạn không có thật: [3, 4]` |
| `rag.en.py` | chạy khô | 2026-10-24 | như trên | Như `rag.vi.py` (server giả hai cổng, fallback `EMBEDDING_*` đúng, `Made-up chunk numbers: [3, 4]`) |
