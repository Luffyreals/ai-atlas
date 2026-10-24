# Graph RAG

Bài: `llm/graph-rag` (chỉ bản vi, khoảng 12 phút đọc, đợt 4). Cần biết trước theo `roadmap.ts`: `llm/rag-chatbot`. Quyết định liên quan trong `docs/mvp.md`: 53 (code gọi API là code minh họa), 54 (GCN ở `graph-rag` chỉ nhắc tên; dùng lại `RagPipelineFigure`), 55 (biến môi trường, `.vi.py`), 56 (viết hết rồi duyệt một lần).

Ngày tra: **24/10/2026**, bằng WebFetch trang arXiv, PyPI, Docker Hub, tài liệu Neo4j, Pyodide, Microsoft GraphRAG. Thẻ nguồn: [E24], [KW17], [NEO-PY], [NEO-DK], [CYP], [PYO], [MS-GR]. Ý không có thẻ là kiến thức chung hoặc gợi ý của `summarizer`. Code của bài đã chạy (xem "Kiểm chứng code"); các dòng "Chưa xác minh" về `networkx`, Neo4j và cú pháp Cypher đã giải quyết.

## Nguồn

- **[E24]** Edge, D., Trinh, H., Cheng, N., Bradley, J., Chao, A., Mody, A., Truitt, S., Metropolitansky, D., Ness, R. O., Larson, J. (2024). [*From Local to Global: A Graph RAG Approach to Query-Focused Summarization*](https://arxiv.org/abs/2404.16130). arXiv:2404.16130 (v1 24/4/2024, v2 19/2/2025). Trang không ghi hội nghị. Đã đọc trang tóm tắt, **chưa đọc toàn bài**.
- **[KW17]** Kipf, T. N., Welling, M. (2017). [*Semi-Supervised Classification with Graph Convolutional Networks*](https://arxiv.org/abs/1609.02907). ICLR 2017 (arXiv:1609.02907, v1 9/9/2016, v4 22/2/2017). Đã đọc trang tóm tắt. Chỉ nhắc tên.
- **[MS-GR]** Microsoft. [*GraphRAG* (tài liệu dự án)](https://microsoft.github.io/graphrag/). Mã nguồn: [microsoft/graphrag](https://github.com/microsoft/graphrag) (giấy phép và tên gói PyPI **chưa kiểm**).
- **[NEO-PY]** Neo4j. [*Python driver manual*](https://neo4j.com/docs/python-manual/current/). PyPI: [`neo4j`](https://pypi.org/project/neo4j/), bản mới nhất **6.4.1**, `requires_python >=3.10`, giấy phép Apache-2.0 (kèm Python-2.0) theo metadata. Ngày phát hành 6.4.1 chưa đọc được.
- **[CYP]** Neo4j. [*Cypher manual: MATCH*](https://neo4j.com/docs/cypher-manual/current/clauses/match/) và [*Variable-length patterns*](https://neo4j.com/docs/cypher-manual/current/patterns/variable-length-patterns/).
- **[NEO-DK]** Docker Hub. [*neo4j* (Official Image)](https://hub.docker.com/_/neo4j).
- **[PYO]** Pyodide. [*Packages built in Pyodide*](https://pyodide.org/en/stable/usage/packages-in-pyodide.html): trang ứng với Pyodide 314.0.7 liệt kê **networkx 3.6.1**.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| ~~`networkx` chạy thật trong Pyodide của site~~ **Đã giải quyết:** bài không dùng `networkx`, ô trên trang viết bằng Python thuần (dict + BFS) và chạy thật trên Pyodide 314.0.7 | Chỉ đọc danh sách [PYO]. Venv Pyodide `C:/Users/Dell/.venvs/ai-atlas-py314` **không cài networkx** (import lỗi); chưa cài thêm vì không được sửa môi trường. Chưa chạy trong Pyodide thật. | `lesson-writer` hoặc reviewer cài `networkx==3.6.1` vào venv đó và chạy thử. Hai điểm cần kiểm: (1) `PythonRunner` có tự nạp gói không (quy ước hiện chỉ liệt kê numpy, pandas, matplotlib, scipy, scikit-learn, và `docs/architecture/` chưa nói networkx); (2) thời gian tải gói. Nếu khó, dùng Python thuần (dict + BFS), dưới 30 dòng. |
| ~~Phương án code Neo4j chạy thật~~ **Đã giải quyết:** `neo4j-graph.{vi,en}.py` chạy thật với driver 6.4.1 trên Neo4j Community 2026.10.1 (xem "Kiểm chứng code") | Docker có (29.8.1), image `neo4j` có Community (`latest`) [NEO-DK]. **Chưa pull, chưa chạy**, chưa thử driver 6.4.1 với server. | Nếu có `LocalCode`, ghi mức "chạy khô" trừ khi reviewer dựng container. Không đưa kết quả mẫu khi chưa chạy thật. |
| Biến thể docker run cho Neo4j (`NEO4J_AUTH`, bộ nhớ, volume, đổi mật khẩu lần đầu) | [NEO-DK] nói cổng 7474 (HTTP) và 7687 (Bolt), mặc định `neo4j/neo4j` và buộc đổi lần đầu, `NEO4J_AUTH=none` tắt xác thực khi phát triển. Trang không nhắc giấy phép Enterprise hay `NEO4J_ACCEPT_LICENSE_AGREEMENT`. | Khuyên dùng tag Community, ghi rõ mật khẩu giữ chỗ `<mật-khẩu>` (không ghi cứng, theo `llm-lessons.md` mục 2.3). Tag phiên bản cụ thể (ví dụ `2026.10.1`, `5.26.32` có trên trang) **đổi nhanh**, không ghi cứng, hoặc ghi kèm "10/2026". |
| ~~Cú pháp độ dài thay đổi trong Cypher~~ **Đã giải quyết:** bài dạy `{1,3}`, nhắc `*1..3`; cả hai chạy thật trên 2026.10.1, cùng kết quả (7 tên) | [CYP] nói `-[:NEXT]->{1,10}` (quantified relationship) là cú pháp mới theo chuẩn GQL; `-[:KNOWS*1..3]->` là cú pháp cũ "vẫn dùng được nhưng không theo GQL". Trang tôi đọc không nêu cú pháp đầy đủ của kiểu cũ, và **chưa chạy cả hai**. | Hỏi lại phiên chính chọn kiểu nào. Gợi ý: dạy kiểu mới `{1,3}`, nhắc một câu về kiểu `*1..3` thường gặp trong tài liệu cũ. Chạy thử với container trước khi đưa vào bài. |
| Tên gói PyPI và giấy phép của GraphRAG (Microsoft) | Trang tài liệu không nêu. | Bài chỉ nói tên dự án và link GitHub; không viết `pip install` hay giấy phép. |
| Chỉ số và số liệu đánh giá trong [E24] | Chỉ đọc tóm tắt (kết quả: cải thiện về "comprehensiveness" và "diversity" so với RAG nền, trên bộ dữ liệu cỡ 1 triệu token). Chưa đọc cách đo, chi phí. | Chỉ nêu định tính, không nêu con số. |
| "Trending" của RAG trên đồ thị (mục cuối giáo án) | Giáo án chỉ có tiêu đề. Không có nguồn đã đọc cho các biến thể khác (LightRAG, HippoRAG...). | Không nêu biến thể nào trong bài; nếu muốn, chỉ nói "có nhiều biến thể" kèm [E24] và [MS-GR]. |
| Độ chính xác khi LLM trích bộ ba, so sánh Graph RAG với RAG vector về chất lượng/chi phí | Không có nguồn đã đọc cho điều chung; [E24] chỉ so trên loại câu hỏi "toàn cục". | Phát biểu như hạn chế thực tế, có chữ "thường" hoặc "gợi ý"; không viết con số. |

## Ý chính

- **Vì sao cần đồ thị (gợi ý, đối chiếu [E24]):** RAG vector tìm đoạn văn giống câu hỏi. Nhưng câu hỏi nhiều bước ("Công ty của người sáng lập X còn đầu tư vào đâu?") cần ghép thông tin từ nhiều đoạn mà không đoạn nào giống câu hỏi. Đồ thị lưu sẵn các mối nối giữa sự kiện, nên bước nhảy từ thực thể này sang thực thể kia là một phép duyệt, không phải một lần đoán bằng độ giống.
- **Đồ thị tri thức:** tập thực thể (nút) và quan hệ (cạnh có hướng, có nhãn). Một sự kiện là một **bộ ba** (subject, predicate, object), ví dụ (An, làm_việc_tại, Công ty A). Hai bộ ba chung một thực thể thì tự nối với nhau.
- **Trích bộ ba bằng LLM (gợi ý):** nhờ mô hình đọc từng đoạn và trả về JSON danh sách bộ ba. Prompt nên: nêu rõ lược đồ (loại thực thể, loại quan hệ cho phép), cho 1–2 ví dụ, yêu cầu **chỉ** JSON. Chương trình phải kiểm JSON hợp lệ (parse lỗi thì thử lại hoặc bỏ qua). Khối JSON mẫu viết thẳng trong MDX (`json`).
- **Chuẩn hóa thực thể:** "Công ty A", "công ty A", "A Corp" là một thực thể hay nhiều? Bước gộp tên (entity resolution) quyết định đồ thị có nối được không. Là chỗ khó nhất khi làm thật (gợi ý, chưa nguồn).
- **Lưu và truy vấn bằng Neo4j [NEO-DK, CYP]:** Neo4j là cơ sở dữ liệu đồ thị; ngôn ngữ truy vấn là Cypher, mô tả mẫu bằng "hình vẽ chữ": nút `(p:Person {name: 'An'})`, cạnh `-[:WORKS_AT]->`. Bài chỉ cho khối `cypher` ở mức minh họa: tạo bộ ba bằng `MERGE`, truy vấn một bước, truy vấn nhiều bước. Chạy Neo4j: một container Docker (cổng 7474 để xem bằng trình duyệt, 7687 cho driver).
- **Driver Python [NEO-PY]:** `GraphDatabase.driver(URI, auth=...)`, `driver.execute_query(cypher, tham_số..., database_=...)`; giá trị truyền qua tham số `$name`, **không** nối chuỗi (tránh tiêm Cypher, và LLM sinh Cypher cũng cần cẩn thận như vậy).
- **Truy vấn nhiều bước (multi-hop):** duyệt n bước từ một thực thể. Với Cypher dùng quantified relationship `{1,3}` [CYP]. Với `networkx`: `nx.DiGraph`, `add_edge(u, v, rel=...)`, `nx.single_source_shortest_path_length(G, nguồn, cutoff=2)` hay `nx.ego_graph(G, nguồn, radius=2)` (tên hàm là kiến thức chung về networkx, **chưa chạy với 3.6.1**).
- **Quy trình Graph RAG ở cấp ứng dụng (gợi ý):** (1) nhận câu hỏi; (2) nhờ LLM nhận ra thực thể trong câu hỏi (hoặc tìm thực thể gần bằng embedding); (3) duyệt đồ thị quanh các thực thể đó vài bước; (4) biến các bộ ba tìm được thành vài câu chữ; (5) ghép vào prompt như RAG thường. Có thể kết hợp với truy xuất vector. Dùng lại `RagPipelineFigure` và nói chỗ nào thay: bước "truy xuất" từ tìm vector thành duyệt đồ thị.
- **GraphRAG của Microsoft [E24, MS-GR]:** mục tiêu là câu hỏi **toàn cục** về cả kho tài liệu ("các chủ đề chính là gì?"), loại câu RAG vector làm kém vì không có đoạn nào chứa câu trả lời. Cách làm: LLM dựng đồ thị thực thể từ văn bản; gom đồ thị thành các **cộng đồng** (cụm thực thể nối chặt, tài liệu dự án nói dùng thuật toán Leiden theo phân cấp); LLM viết bản tóm tắt cho từng cộng đồng, làm sẵn từ lúc indexing; lúc hỏi, mỗi bản tóm tắt cho một câu trả lời từng phần, rồi gộp thành câu trả lời cuối. Tài liệu dự án có hai chế độ: *global search* (dùng tóm tắt cộng đồng) và *local search* (đi quanh một thực thể và các lân cận).
- **So sánh với RAG vector:** vector mạnh ở câu hỏi một chỗ ("X được định nghĩa thế nào?"), dựng nhanh, rẻ. Đồ thị mạnh ở quan hệ, nhiều bước, và (theo [E24]) tóm tắt toàn cục; nhưng indexing tốn nhiều lần gọi LLM, lược đồ và gộp thực thể phải bảo trì. Lập bảng so sánh ở mục "Minh họa" (hợp với bảng ở quy tắc 2.7 của `llm-lessons.md`).
- **GCN chỉ nhắc tên [KW17]:** mạng nơ-ron trên đồ thị, mỗi nút cập nhật vectơ của mình từ vectơ của lân cận, tạo embedding cho nút. Một câu: giáo án có phần này, bài không đi sâu (quyết định 54). Không viết công thức.

## Công thức quan trọng

Bài không có công thức bắt buộc. Nếu cần một công thức nhỏ cho "đồ thị có hướng gồm các bộ ba", dùng ký hiệu tập hợp, không đụng ký hiệu ML:

$$\mathcal{G}=\{(s_i, r_i, o_i)\}_{i=1}^{m},\qquad s_i,o_i\in\mathcal{E},\; r_i\in\mathcal{R}$$

với $\mathcal{E}$ là tập thực thể, $\mathcal{R}$ là tập loại quan hệ, $m$ là số bộ ba (theo ký hiệu site, $m$ là số mẫu). Ghi chú: chữ $\mathcal{G}$ chưa có trong bảng ký hiệu của `CLAUDE.md`; nếu dùng, thêm vào glossary hoặc tránh. Có thể bỏ hẳn công thức, viết bằng lời.

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; "(gợi ý)" là của `summarizer`.

- **Bảng chỉ đường của tàu điện (gợi ý):** RAG vector như tìm trang sách có nhắc ga "Bến Thành". Đồ thị như sơ đồ tuyến: từ ga này qua mấy ga để tới ga kia. Câu hỏi "đi từ A đến D phải đổi ở đâu" cần sơ đồ, không cần trang sách nào nhắc cả hai.
- **Bảng tin điều tra (gợi ý):** ghim ảnh người và địa điểm lên bảng, nối dây đỏ giữa chúng. Bộ ba là một sợi dây có nhãn. LLM là người đi đọc hồ sơ và ghim giúp bạn.
- **Hai câu hỏi cùng một kho (gợi ý):** "Ai là CEO của công ty A?" (một bước, RAG vector đủ) và "Những công ty nào có chung nhà đầu tư với công ty A?" (hai bước qua nút nhà đầu tư). Bài nên cho ví dụ tay bằng 6–8 bộ ba tiếng Việt, tự nghĩ ra, không lấy từ nguồn nào.
- **Đọc cả thư viện (từ [E24], diễn đạt lại):** hỏi "chủ đề chính của cả kho là gì" mà chỉ có top-k đoạn thì như hỏi cả lớp bằng ba bạn ngồi bàn đầu; tóm tắt theo cộng đồng là cho mỗi nhóm bạn phát biểu trước, rồi mới tổng hợp.
- **Ô chạy trên trang (đề xuất):** dựng đồ thị từ khoảng 8 bộ ba cho trước (không gọi LLM), rồi in các thực thể trong tối đa 2 bước từ một nút. Ba dòng kết quả đủ. Đối chiếu: bước 1 trả lời được câu một bước, bước 2 trả lời câu nhiều bước. Chạy thử bằng venv Pyodide sau khi cài `networkx==3.6.1`; phương án dự phòng là Python thuần.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Graph RAG luôn tốt hơn RAG vector.** Không; tùy loại câu hỏi. Câu một chỗ thì vector đủ và rẻ hơn. [E24] chỉ nói tốt hơn trên câu hỏi toàn cục trong điều kiện của họ.
2. **Tin bộ ba do LLM trích.** LLM có thể bịa quan hệ, đặt sai hướng, tách một thực thể thành nhiều. Cần kiểm mẫu và quay về đoạn gốc khi nghi ngờ; nên lưu đoạn nguồn kèm mỗi bộ ba (gợi ý).
3. **Quên chuẩn hóa tên thực thể.** Cùng người mà hai nút khác tên thì đồ thị đứt, truy vấn nhiều bước không tới.
4. **Nhầm hướng cạnh.** (An)-[:LÀM_VIỆC_TẠI]->(Công ty A) khác chiều ngược lại; truy vấn phải khớp hướng, hoặc bỏ mũi tên để bỏ qua hướng.
5. **Duyệt quá nhiều bước.** Số nút tìm được tăng rất nhanh theo số bước, và ngữ cảnh đưa vào prompt phình theo (liên hệ [L23] ở `rag-chatbot`). Đặt giới hạn bước và số bộ ba.
6. **Nối chuỗi vào Cypher.** Dùng tham số `$...` [NEO-PY]; nhất là khi truy vấn do LLM hoặc người dùng tạo.
7. **Đồ thị tri thức (knowledge graph) bị nhầm với đồ thị đồ họa hay "đồ thị" ở nghĩa biểu đồ.** Ở đây "đồ thị" là mạng nút và cạnh (graph), không phải biểu đồ (chart). Nên ghi một câu.
8. **Nhầm Graph RAG (dùng đồ thị để truy xuất) với GCN (mạng nơ-ron trên đồ thị).** Graph RAG không cần huấn luyện mạng nào; GCN thì có. Bài chỉ nhắc GCN.
9. **Nhầm "GraphRAG" (tên dự án, [E24]) với "Graph RAG" (cách làm chung).** Tên giống nhau; viết rõ "GraphRAG của Microsoft".
10. **Tưởng chạy Neo4j là bắt buộc để học.** Phần khái niệm làm được bằng `networkx` trên trang; Neo4j chỉ là một cách lưu đồ thị lâu dài.
11. **Ghi cứng mật khẩu Neo4j hay khóa API.** Dùng chỗ giữ chỗ và biến môi trường như `llm-lessons.md` mục 2.3. Lưu ý `NEO4J_AUTH=none` chỉ cho máy phát triển [NEO-DK].
12. **Cú pháp Cypher cũ và mới.** Tài liệu cũ dùng `*1..3`, tài liệu hiện hành đã có `{1,3}` [CYP]; đọc ví dụ trên mạng mà bị lỗi thì kiểm phiên bản Neo4j.

## Liên quan tới bài nào

Slug lấy từ `src/data/roadmap.ts` (đã mở phiên này).

- **Cần biết trước:** `llm/rag-chatbot` (pipeline RAG, top-k, prompt kèm ngữ cảnh; xem `docs/research/rag-chatbot.md`). Bài này "Nhắc nhanh" ngắn 2–3 câu.
- **`llm/prompt-engineering`:** prompt trích bộ ba ra JSON dùng lại ý "chỉ dẫn rõ, ví dụ mẫu, định dạng đầu ra".
- **`llm/text-api`:** `client`, biến môi trường, kết quả có cấu trúc; nếu bài đó đã nói JSON mode thì link, chưa kiểm.
- **`llm/web-crawling-mongodb`:** nguồn văn bản để dựng đồ thị (không phụ thuộc, chỉ nhắc).
- **`llm/docker-cloud`:** cách chạy container cho Neo4j; link khi đã có.
- **`llm/langchain-llamaindex`:** hai thư viện đều có phần đồ thị tri thức (kiến thức chung, **chưa kiểm**); chỉ nhắc để người đọc biết hướng.
- **Giáo án gốc:** buổi 10 phần LLM (dòng 81 của `giáo án ai.md`): xây đồ thị tri thức từ văn bản, RAG bằng Cypher trên Neo4j, embedding bằng GCN, trending. Chỉ tham khảo.
- **Hình:** dùng lại `RagPipelineFigure` (mục 2.9 của `llm-lessons.md`); mục "Minh họa" thêm bảng so sánh RAG vector và Graph RAG.

## Gợi ý khuôn bài và ô code

- **Ô `PythonRunner` (đề xuất):** `src/code/llm/graph-rag/<tên>.vi.py`, 8 bộ ba cho trước, `networkx`, duyệt 1 và 2 bước. `print` tiếng Anh ngắn hoặc chỉ danh sách tên. Phụ thuộc kiểm `networkx` ở "Chưa xác minh".
- **Ô `LocalCode` (tùy chọn):** trích bộ ba bằng `client.chat.completions.create` (biến `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `LLM_MODEL`), rồi tuỳ chọn ghi vào Neo4j bằng driver `neo4j` (gói `openai`, `neo4j`; gợi ý ghi mức tối thiểu bản `neo4j>=6`, chưa ghim vì chưa chạy). Nếu muốn gọn, chỉ có phần trích bộ ba, còn Neo4j nằm ở khối `cypher` trong MDX.
- **Khối MDX (không phải Python):** `cypher` (MERGE, truy vấn 1 bước, nhiều bước), `json` (đầu ra mẫu của bước trích), `sh` (`docker run` cho Neo4j, giữ chỗ cho mật khẩu). Test `python-syntax` chỉ kiểm khối `python`.
- Mục "Minh họa": `RagPipelineFigure` + bảng so sánh.

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Đồ thị tri thức | Knowledge graph | Dịch, gloss lần đầu |
| Thực thể | Entity | Dịch |
| Quan hệ | Relation / relationship | Dịch |
| Bộ ba (chủ thể – quan hệ – đối tượng) | Triple (subject–predicate–object) | Dịch "bộ ba", giữ tiếng Anh trong ngoặc |
| Nút, cạnh | Node, edge | Dịch |
| Truy vấn nhiều bước | Multi-hop query | Gloss, giữ "multi-hop" |
| Cộng đồng (trong đồ thị) | Community | Dịch, nói rõ nghĩa là cụm nút nối chặt |
| Gộp thực thể | Entity resolution | Gloss |
| Mạng tích chập đồ thị | Graph Convolutional Network (GCN) | Chỉ nhắc tên, giữ "GCN" |
| Cơ sở dữ liệu đồ thị | Graph database | Dịch |
| Graph RAG | Graph RAG | Giữ nguyên |

## Đọc thêm đề xuất

1. [E24] Edge và cộng sự (2024), paper GraphRAG.
2. [MS-GR] Tài liệu dự án GraphRAG của Microsoft (global và local search).
3. [CYP] Cypher manual (MATCH, mẫu đường đi độ dài thay đổi), link đúng bản đã chạy thử khi có.
4. [NEO-PY] Neo4j Python driver manual.
5. [KW17] Kipf và Welling (2017), GCN, cho người muốn biết "embedding cho nút" là gì (không bắt buộc).

## Kiểm chứng code

Do `lesson-writer` chạy ngày 24/10/2026, `content-reviewer` chạy lại cùng ngày (2026-10-24) và xác nhận các mức dưới đây; sau review, `extract-triples` thêm kiểm `triples` là danh sách và dòng "Bỏ qua" cho tên rỗng, đã chạy khô lại với server giả. thư mục làm việc ở scratchpad, Python gọi bằng `-I -X utf8`. Driver `neo4j` cài vào một venv tạm trong scratchpad (Python 3.14.5, `neo4j` 6.4.1 kéo theo `pytz` 2026.5), **không** cài vào `.venv-llm/`. Neo4j chạy bằng image `neo4j:community` (Neo4j Kernel 2026.10.1, Community; `CALL dbms.components()` báo Cypher 5 và 25), container riêng, cổng ngẫu nhiên ở 127.0.0.1, đã xóa sau khi thử; image vẫn giữ trên máy (khoảng 1 GB). Chưa có `.env.llm`, nên code gọi API chưa chạy thật và không có kết quả mẫu.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `multi-hop.vi.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2), chỉ thư viện chuẩn; reviewer chạy lại | `hops <= 1: 3 entities`, `hops <= 2: 5`, `hops <= 3: 7`; 3 đường một bước (Lan, Quỹ Sao Mai, Đà Nẵng) và 2 đường hai bước (tới ĐH Bách khoa, tới Lúa Vàng). Bản đổi `bfs(..., 3)`: thêm đường tới Minh qua ĐH Bách khoa và tới Cần Thơ qua Lúa Vàng. Khớp lời văn. 42 dòng |
| `multi-hop.en.py` | chạy thật | 2026-10-24 | như trên (Pyodide thật) | Cùng số (3, 5, 7), tên tiếng Anh (Blue Cloud, Morning Star Fund…) |
| `extract-triples.vi.py` | chạy khô | 2026-10-24 | `.venv-llm`, Python 3.14.5, openai 3.37.0; server giả kiểu OpenAI (cổng ngẫu nhiên) | Thiếu key: `KeyError: 'OPENAI_API_KEY'`. Server giả trả 4 bộ ba (một có khoảng trắng thừa, một quan hệ `FUNDED`, một chủ thể rỗng): in 2 tuple đã bỏ khoảng trắng thừa, "Bỏ qua (sai lược đồ)" và "Bỏ qua (tên rỗng)". Trả chữ thường, `{"triples": "abc"}` hoặc `[1, 2]`: in "Không đọc được JSON". 60 dòng, dòng dài nhất 78 ký tự |
| `extract-triples.en.py` | chạy khô | 2026-10-24 | như trên (server giả) | Như bản vi ("Skipped (not in the schema)", "Skipped (empty name)", "Could not parse JSON"); 60 dòng, dòng dài nhất 75 ký tự |
| `neo4j-graph.vi.py` | chạy thật | 2026-10-24 | venv tạm, Python 3.14.5, `neo4j` 6.4.1; Neo4j Community 2026.10.1 trong Docker 29.8.1; reviewer chạy lại | In `{'fund': 'Quỹ Sao Mai', 'company': 'Lúa Vàng'}` và `{'n': 7}`, giống nhau ở mọi lần chạy. Kết quả mẫu trong bài lấy từ lần này. Thiếu `NEO4J_PASSWORD`: `KeyError`; sai mật khẩu: `neo4j.exceptions.AuthError`. Mật khẩu 6 ký tự: Neo4j không khởi động ("minimum password length is 8 characters"). Sau review chỉ đổi comment dòng 1 |
| `neo4j-graph.en.py` | chạy thật | 2026-10-24 | như trên (Neo4j thật) | `{'fund': 'Morning Star Fund', 'company': 'Golden Rice'}`, `{'n': 7}` |
| Cả ba cặp | cú pháp | 2026-10-24 | `ast.parse` với `feature_version=(3, 10)`, so cặp vi/en: tokenize, bỏ comment, làm rỗng chuỗi | Cú pháp đúng; phần code vi và en giống hệt, cùng số dòng |
| Bốn khối `cypher` trong bài | chạy thật | 2026-10-24 | `cypher-shell` trong container, sau khi nạp 8 bộ ba; reviewer chạy lại | `MERGE` chạy lại không tạo thêm (vẫn 8 nút, 8 cạnh); một bước: `"Lan"`; hai bước: `"Quỹ Sao Mai", "Lúa Vàng"`; `-[]-{1,3}`: 7 tên. Cú pháp cũ `-[*1..3]-` cũng đếm 7. `MERGE` cả mẫu khi không khớp (quiz 3): tạo thêm nút trùng tên, một nút rỗng và một cạnh. Kiểu động `-[t:$($r)]->` chạy được trên 2026.10.1 |
| Khối `powershell` `docker run` | chạy thật | 2026-10-24 | Docker 29.8.1, PowerShell (reviewer) | Chạy đúng như trong bài (tên container riêng); log có `Started.` |
| Khối `sh` `docker run` | đối chiếu | 2026-10-24 | so với bản PowerShell và lần chạy Git Bash của `lesson-writer` | Chỉ khác cách nối dòng và `$NEO4J_PASSWORD`; mật khẩu giữ chỗ đổi sang nháy đơn sau review |
| Công thức trong bài | chạy thật | 2026-10-24 | render bằng `node_modules/katex`, biên dịch bằng `@mdx-js/mdx` + `remark-math` | 29 công thức (cả quiz), 0 cảnh báo, 0 lỗi; MDX biên dịch được |
