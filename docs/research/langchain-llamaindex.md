# LangChain và LlamaIndex

Bài: `llm/langchain-llamaindex` (chỉ bản vi, khoảng 11 phút đọc). Cần biết trước: `llm/rag-chatbot`. Bài sau: `llm/agents`. Quyết định liên quan trong `docs/decisions.md`: 53 (SDK OpenAI-compatible, key từ biến môi trường), 54 (code ở `src/code/llm/<bài>/`, hiện bằng `LocalCode`), 56.

Ngày tra: **24/10/2026**, bằng `curl` tới PyPI, WebFetch tài liệu chính thức, và **cài rồi chạy thử** trong venv tạm (Python 3.14.5). Thẻ nguồn: [PYPI], [LC-OV], [LC-MIG], [LC-RAG], [LI-INST], [LI-START], [RUN]. Ý không có thẻ là kiến thức chung.

## Nguồn

- **[PYPI]** Trang PyPI và [JSON API](https://pypi.org/pypi/langchain/json) của từng gói (bảng phiên bản bên dưới). Phụ thuộc đọc từ trường `requires_dist` của đúng bản.
- **[LC-OV]** LangChain. [*LangChain overview*](https://docs.langchain.com/oss/python/langchain/overview). Agent dựng trên LangGraph, hàm `create_agent`.
- **[LC-MIG]** LangChain. [*Migrate to LangChain v1*](https://docs.langchain.com/oss/python/migrate/langchain-v1). Danh sách cái bị chuyển, đổi tên, gỡ.
- **[LC-RAG]** LangChain. [*Retrieval Augmented Generation (RAG) with Deep Agents*](https://docs.langchain.com/oss/python/deepagents/rag) (trang hướng dẫn RAG hiện hành, kiểm lại 24/10/2026: gói `deepagents`, hàm `create_deep_agent`, agent tự quyết khi nào gọi công cụ tìm kiếm; thay trang cũ *Build a RAG agent*). Trang khái niệm [*Retrieval*](https://docs.langchain.com/oss/python/deepagents/retrieval): "In 2-Step RAG, the retrieval step is always executed before the generation step", nêu ví dụ dùng là "FAQs, documentation bots" (đúng kiểu chain của bài). Còn các trang [*Semantic search*](https://docs.langchain.com/oss/python/langchain/knowledge-base), [*ChatOpenAI*](https://docs.langchain.com/oss/python/integrations/chat/openai), [*Install*](https://docs.langchain.com/oss/python/langchain/install): đã mở được (HTTP 200), **chưa đọc kỹ**.
- **[LI-INST]** LlamaIndex. [*Installation*](https://developers.llamaindex.ai/python/framework/getting_started/installation/). Gói `llama-index` là bản gộp, và cách cài chọn lọc bằng `llama-index-core` cộng từng integration.
- **[LI-START]** LlamaIndex. [*Starter example*](https://developers.llamaindex.ai/python/framework/getting_started/starter_example/). Đường dẫn import, `SimpleDirectoryReader`, `VectorStoreIndex`, `as_query_engine`, `Settings`. Các trang [*Understanding RAG*](https://developers.llamaindex.ai/python/framework/understanding/rag/) và [*Query engine*](https://developers.llamaindex.ai/python/framework/module_guides/deploying/query_engine/): HTTP 200, chưa đọc kỹ.
- **[RUN]** Lần chạy thử của chính phiên này (mục "Kiểm chứng code"). Mã nguồn trong venv là nguồn cho tên tham số.

## Phiên bản trên PyPI (24/10/2026)

| Gói | Bản mới nhất | Ngày tải lên | Ghi chú |
|---|---|---|---|
| `langchain` | 1.4.7 | 21/10/2026 | Python >= 3.10 |
| `langchain-core` | 1.7.0 | 22/10/2026 | Có `prompts`, `runnables`, `vectorstores`, `documents` |
| `langchain-openai` | 1.7.2 | 14/10/2026 | Cần `openai>=2.45.0,<4` |
| `langchain-text-splitters` | 1.1.3 | 02/10/2026 | Chứa `RecursiveCharacterTextSplitter` |
| `langchain-community` | 0.4.2 | 22/05/2026 | **Không cần** cho code của bài (xem "Đã đổi tên") |
| `langchain-classic` | 1.0.8 | 10/06/2026 | Nơi chứa chain và retriever cũ; **không cần** |
| `langgraph` | 1.2.16 (venv cài 1.2.17) | 16/10/2026 | Tự được kéo theo bởi `langchain` |
| `llama-index` | 0.14.25 | 21/09/2026 | Gói gộp, **xung đột** với `openai-like` 0.8.1 (xem dưới); còn đòi `llama-index-embeddings-openai<0.7` (bài dùng 0.7.0) |
| `llama-index-core` | 0.14.25 | 21/09/2026 | Lõi |
| `llama-index-llms-openai-like` | 0.8.1 | 01/10/2026 | `OpenAILike`; cần `llama-index-llms-openai>=0.8.0` |
| `llama-index-llms-openai` | 0.8.3 | 12/10/2026 | Được kéo theo bởi gói trên; cần `openai<3` |
| `llama-index-embeddings-openai` | 0.7.0 | 31/08/2026 | `OpenAIEmbedding`; `openai>=1.1.0` |
| `openai` | 3.37.0 | 22/10/2026 | **Không dùng được chung** với hai bộ trên (xem dưới) |

### Hai bẫy phụ thuộc đã gặp thật

1. **`pip install llama-index==0.14.25 llama-index-llms-openai-like==0.8.1` thất bại** (`ResolutionImpossible`): gói gộp đòi `llama-index-llms-openai<0.8`, còn `openai-like` 0.8.1 đòi `>=0.8.0`. Cách qua được: bỏ gói gộp, cài `llama-index-core`, `llama-index-llms-openai-like`, `llama-index-embeddings-openai` (đã chạy được). Cách cài này cũng khớp [LI-INST] ("cài chọn lọc").
2. **`openai` 3.37.0 (bản trong `.venv-llm/`) không cài chung được** với `llama-index-llms-openai` (đòi `openai<3`). `langchain-openai` 1.7.2 thì chấp nhận `openai` 2.x lẫn 3.x. Venv chạy thử dùng `openai` 2.54.0. Hệ quả cho phiên chính: **không thêm hai bộ này vào `.venv-llm/` làm hạ `openai`**; dùng venv riêng, hoặc chấp nhận hạ `openai` xuống 2.x cho cả venv và ghi vào `scripts/requirements-llm.txt`. Câu "chạy thử lần cuối ... `openai` 3.37" của bài này phải đổi thành bản thật đã chạy.

## Ý chính

- **Khi nào không cần framework.** RAG tối thiểu là bốn việc: cắt văn bản thành đoạn, tính embedding, tìm các đoạn gần câu hỏi nhất, ghép vào prompt rồi gọi model. Bài `rag-chatbot` làm bằng `openai` và NumPy, khoảng 40 dòng. Với việc cố định, ít bước, một nhà cung cấp, ít khi cần framework. Framework thêm một tầng trừu tượng và một đống phụ thuộc (đo bằng `pip list`: riêng LangChain kéo theo `langgraph`, `pydantic`, `tiktoken`...).
- **Khi nào nên dùng.** Khi bạn cần nhiều thứ làm sẵn: đọc nhiều định dạng file (PDF, web, thư mục), cắt đoạn thông minh, nhiều kho vector, đổi nhà cung cấp mà ít sửa code, theo dõi từng bước (trace), agent nhiều bước. Đổi lại: phụ thuộc vào API của thư viện, và API đó đổi nhanh (mục "Đã đổi tên").
- **Cùng một khung khái niệm, tên gọi khác nhau.** Tải tài liệu (document loader / reader) → cắt đoạn (text splitter / node parser) → nhúng và lưu (vector store / index) → truy xuất (retriever) → ghép prompt và gọi model (chain / query engine). Bảng đối chiếu ở dưới dùng làm xương sống bài.
- **LangChain: chain bằng LCEL.** Các thành phần là `Runnable`; toán tử `|` nối chúng thành chuỗi (LangChain Expression Language, LCEL). Retriever cũng là `Runnable`, nên viết `retriever | format_docs` là một khâu. Đây là hướng "tự lắp từng khối".
- **LlamaIndex: index và query engine.** Bạn đưa tài liệu vào `VectorStoreIndex`; `as_query_engine()` trả một đối tượng gói sẵn truy xuất + ghép prompt + gọi model. Ít dòng hơn, nhưng prompt nội bộ là tiếng Anh (bằng chứng: `[RUN]`, prompt gửi đi mở bằng "Context information is below."); muốn đổi phải truyền prompt riêng.
- **Cấu hình model qua cấu hình toàn cục (LlamaIndex).** `Settings.llm` và `Settings.embed_model` đặt một lần. **Nếu không đặt**, LlamaIndex dùng mặc định của OpenAI (LLM và embedding OpenAI, cần `OPENAI_API_KEY`) [LI-START]: người đọc dùng Gemini hay Ollama mà quên đặt sẽ gặp lỗi hoặc gọi nhầm nhà cung cấp.
- **OpenAI-compatible.** LangChain: `ChatOpenAI(model=..., base_url=..., api_key=...)` và `OpenAIEmbeddings(...)` (đã chạy thật, `[RUN]`). LlamaIndex: `OpenAILike(model=..., api_base=..., api_key=..., is_chat_model=True)` cho chat và `OpenAIEmbedding(model_name=..., api_base=..., api_key=...)` cho embedding (đã chạy thật). **Tên tham số khác nhau giữa hai thư viện** (`base_url` và `api_base`; `model` và `model_name` cho embedding): điểm hay nhầm.
- **Embedding cần một endpoint embedding.** Không phải nhà cung cấp OpenAI-compatible nào cũng có `/embeddings` (chưa xác minh cho Groq, xem "Chưa xác minh"). Code dùng biến `EMBEDDING_MODEL` theo quy ước của `llm-lessons.md` 2.3. Bài `rag-chatbot` đã phải giải quyết cùng vấn đề này; bài này theo cách bài đó chọn.
- **Phần agent để bài sau.** Cả hai thư viện đều đang đẩy người dùng sang agent: LangChain có `create_agent` (dựng trên LangGraph) [LC-OV], LlamaIndex có `FunctionAgent` trong `llama_index.core.agent.workflow` [LI-START]. Bài này chỉ hẹn tới `llm/agents`.

## Đối chiếu khái niệm

| Việc | LangChain | LlamaIndex | Bài `rag-chatbot` (tự làm) |
|---|---|---|---|
| Tải tài liệu | `Document(page_content, metadata)`; có nhiều loader trong `langchain-community` | `Document(text=...)`, `SimpleDirectoryReader("data").load_data()` [LI-START] | đọc chuỗi hoặc file |
| Cắt đoạn | `RecursiveCharacterTextSplitter` (`langchain-text-splitters`) | `SentenceSplitter` (`llama_index.core.node_parser`) | cắt theo đoạn văn |
| Nhúng + lưu | `OpenAIEmbeddings` + `InMemoryVectorStore` (trong `langchain-core`) | `OpenAIEmbedding` + `VectorStoreIndex` | mảng NumPy |
| Truy xuất | `vector_store.as_retriever(search_kwargs={"k": 2})` | `index.as_query_engine(similarity_top_k=2)` (hoặc `as_retriever`) | cosine + `argsort` |
| Ghép prompt | `ChatPromptTemplate` | prompt nội bộ của query engine | f-string |
| Gọi model | `ChatOpenAI` | `OpenAILike` | `client.chat.completions.create` |
| Nối các bước | `chain = {...} \| prompt \| llm \| StrOutputParser()` | `query_engine.query(...)` | vài dòng Python |

## Đã đổi tên hoặc deprecated gần đây (dễ lỗi thời)

Theo [LC-MIG] (LangChain 1.0) trừ khi ghi khác:

- **Chuyển sang `langchain-classic`:** chain cũ (`LLMChain`, `ConversationChain`), `retrievers` cũ, API `indexes`, `hub`, `CacheBackedEmbeddings`, các re-export của `langchain-community`. Cú pháp cũ `RetrievalQA.from_chain_type(...)` và `from langchain.chains import ...` trong bài blog cũ vì thế **không chạy với `langchain` 1.x** nếu không cài `langchain-classic` và đổi import thành `langchain_classic.*`. (Đã kiểm trong `langchain-classic` 1.0.8: `langchain_classic.chains.RetrievalQA` có, mang `@deprecated(since="0.1.17", removal="2.0.0", alternative="langchain.agents.create_agent")`.)
- **Đổi tên:** `create_react_agent` (`langgraph.prebuilt`) thành `create_agent` (`langchain.agents`); tham số `prompt=` thành `system_prompt=`; Python 3.9 bị bỏ, mọi gói LangChain cần Python >= 3.10.
- **Gói tách nhỏ:** `RecursiveCharacterTextSplitter` nằm ở `langchain_text_splitters`; `Document`, `InMemoryVectorStore`, prompt, parser ở `langchain_core`. Import kiểu `from langchain.text_splitter import ...` trong tài liệu cũ không dùng được (đã chạy khô với `langchain` 1.4.7: `ModuleNotFoundError`).
- **Trang hướng dẫn RAG của LangChain** nay dựng bằng Deep Agents (`deepagents`, `create_deep_agent`): agent tự quyết khi nào gọi công cụ tìm kiếm [LC-RAG], không còn là chain `RetrievalQA`. Trang khái niệm Retrieval vẫn giữ "2-Step RAG" (luôn tìm rồi mới gọi mô hình), ví dụ dùng là bot FAQ và bot tài liệu. Chain LCEL của bài vẫn chạy (chạy khô với server giả) và đúng kiểu RAG hai bước đó.
- **LlamaIndex:** tài liệu hiện hành đã chuyển sang `developers.llamaindex.ai`; agent dùng `FunctionAgent` [LI-START]. Chuyện `ServiceContext` bị bỏ để dùng `Settings` (từ bản 0.10/0.11, 2024) và gói `llama_index.legacy` là **kiến thức chung, chưa xác minh trong phiên này**; nếu bài nhắc thì kiểm [changelog](https://github.com/run-llama/llama_index/blob/main/CHANGELOG.md) trước (link chưa mở).
- **Gói gộp `llama-index`** (0.14.25) tụt sau một bậc so với `llama-index-llms-openai` (0.8.3): xem "Hai bẫy phụ thuộc".

## Code tối thiểu (đã chạy, xem "Kiểm chứng code")

Hai file, mỗi file tự chạy được, dưới 60 dòng. Biến môi trường: `OPENAI_API_KEY`, `OPENAI_BASE_URL` (tùy chọn), `LLM_MODEL`, `EMBEDDING_MODEL`. **Hai khối dưới là bản nháp đầu (3 câu về động vật).** Bản cuối nằm ở `src/code/llm/langchain-llamaindex/`: nội quy câu lạc bộ **4 đoạn** (mỗi đoạn 60–67 ký tự), câu hỏi về giờ họp, đọc thêm `EMBEDDING_BASE_URL`, `EMBEDDING_API_KEY`; `chunk_size` nhỏ là để thấy việc cắt xảy ra.

Gói cho `LocalCode`:

- LangChain: `pip install langchain==1.4.7 langchain-openai==1.7.2 langchain-text-splitters==1.1.3 numpy`. `langchain` 1.4.7 chỉ cần `langchain-core`, `langgraph`, `pydantic`; **không** kéo theo `langchain-text-splitters`, nên phải cài riêng. `numpy` cần cho `InMemoryVectorStore` (bước tìm).
- LlamaIndex: `pip install llama-index-core==0.14.25 llama-index-llms-openai-like==0.8.1 llama-index-embeddings-openai==0.7.0`.

`langchain_core.vectorstores.InMemoryVectorStore` nằm ngay trong `langchain-core`, nên không cần `langchain-community` hay `faiss`.

```python
# RAG tối thiểu bằng LangChain (LCEL): rag_langchain.vi.py
import os

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

BASE_URL = os.environ.get("OPENAI_BASE_URL")
API_KEY = os.environ["OPENAI_API_KEY"]

llm = ChatOpenAI(
    model=os.environ["LLM_MODEL"], base_url=BASE_URL, api_key=API_KEY
)
embeddings = OpenAIEmbeddings(
    model=os.environ["EMBEDDING_MODEL"],
    base_url=BASE_URL,
    api_key=API_KEY,
    check_embedding_ctx_length=False,  # gửi chuỗi chữ, không gửi token id
)

text = (
    "Mèo ngủ khoảng mười hai đến mười sáu giờ mỗi ngày.\n\n"
    "Cá voi xanh là loài động vật lớn nhất từng được biết đến.\n\n"
    "Bạch tuộc có ba trái tim và máu màu xanh."
)
docs = [Document(page_content=text, metadata={"source": "demo"})]
splitter = RecursiveCharacterTextSplitter(chunk_size=80, chunk_overlap=0)
chunks = splitter.split_documents(docs)

store = InMemoryVectorStore(embeddings)
store.add_documents(chunks)
retriever = store.as_retriever(search_kwargs={"k": 2})

prompt = ChatPromptTemplate.from_messages([
    ("system", "Chỉ trả lời dựa trên ngữ cảnh được cho."),
    ("human", "Ngữ cảnh:\n{context}\n\nCâu hỏi: {question}"),
])

def format_docs(found):
    return "\n".join(d.page_content for d in found)

chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
print(len(chunks), "đoạn")
print(chain.invoke("Bạch tuộc có mấy trái tim?"))
```

```python
# RAG tối thiểu bằng LlamaIndex: rag_llamaindex.vi.py
import os

from llama_index.core import Document, Settings, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai_like import OpenAILike

BASE_URL = os.environ.get("OPENAI_BASE_URL")
API_KEY = os.environ["OPENAI_API_KEY"]

Settings.llm = OpenAILike(
    model=os.environ["LLM_MODEL"],
    api_base=BASE_URL,
    api_key=API_KEY,
    is_chat_model=True,
)
Settings.embed_model = OpenAIEmbedding(
    model_name=os.environ["EMBEDDING_MODEL"],
    api_base=BASE_URL,
    api_key=API_KEY,
)
Settings.node_parser = SentenceSplitter(chunk_size=64, chunk_overlap=0)

text = (
    "Mèo ngủ khoảng mười hai đến mười sáu giờ mỗi ngày.\n\n"
    "Cá voi xanh là loài động vật lớn nhất từng được biết đến.\n\n"
    "Bạch tuộc có ba trái tim và máu màu xanh."
)
index = VectorStoreIndex.from_documents([Document(text=text)])
query_engine = index.as_query_engine(similarity_top_k=2)
response = query_engine.query("Bạch tuộc có mấy trái tim?")
print(response)
print(len(response.source_nodes), "đoạn nguồn")
```

Ghi chú về code:

- `check_embedding_ctx_length=False`: mặc định `OpenAIEmbeddings` tách token bằng `tiktoken` rồi gửi **mảng token id**; endpoint không phải OpenAI thường chỉ nhận chuỗi chữ. Đặt `False` thì máy chủ giả nhận đúng chuỗi (`[RUN]`: log máy chủ ghi `str`). Lý do này là suy từ hành vi quan sát và kiểu dữ liệu nhận được; **chưa kiểm với nhà cung cấp thật**.
- LlamaIndex `OpenAILike(..., is_chat_model=True)`: mặc định `is_chat_model=False` (coi là model completion cũ, gọi `/completions`); `context_window` mặc định 3900. Bài đặt `is_chat_model=True` tường minh; `context_window` chỉ cần đổi nếu model có cửa sổ nhỏ hơn.
- Cả hai code `print` tiếng Việt: trên Windows cần `python -X utf8` hoặc `PYTHONUTF8=1` nếu console không phải UTF-8 (lỗi `UnicodeEncodeError` đã gặp thật khi chạy với `-I`, vì `-I` bỏ qua `PYTHONUTF8`; nên `-X utf8` mới đúng). Quy ước `llm-lessons.md` 2.5 gọi Python với `-I`: **reviewer cần thêm `-X utf8` khi chạy file này trên Windows**.
- Dòng cần nói trong bài: `os.environ["EMBEDDING_MODEL"]` bắt buộc (đúng quy ước "<KHẢ_NĂNG>_MODEL").

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **"Phải dùng framework mới làm được RAG."** Sai: bài `rag-chatbot` làm không cần. Framework chỉ gói sẵn các khâu.
2. **Chép code từ bài viết cũ rồi bị lỗi import.** `from langchain.chains import RetrievalQA`, `from langchain.text_splitter import ...`, `langchain_community.vectorstores` có thể không còn hoặc đã chuyển (xem "Đã đổi tên"). Ghim phiên bản và đọc tài liệu đúng bản.
3. **Nhầm tên tham số giữa hai thư viện.** `base_url` (LangChain) và `api_base` (LlamaIndex); `model_name` ở embedding của LlamaIndex.
4. **Quên đặt `Settings.llm`/`Settings.embed_model` ở LlamaIndex**, rồi nó gọi OpenAI mặc định và đòi `OPENAI_API_KEY` thật hoặc báo lỗi xác thực [LI-START].
5. **Dùng `ChatOpenAI` với nhà cung cấp khác mà quên `check_embedding_ctx_length=False` ở embedding.** Có thể nhận lỗi 400 vì gửi token id (suy ra, chưa kiểm với nhà cung cấp thật).
6. **Tưởng `InMemoryVectorStore` lưu lâu dài.** Nó chỉ nằm trong bộ nhớ; thoát chương trình là mất, và phải tính lại embedding mỗi lần chạy (mỗi lần có thể tốn lượt gọi API).
7. **Cài cả hai bộ vào chung một venv với `openai` mới nhất.** Pip báo xung đột (mục "Hai bẫy phụ thuộc"); bài nên khuyên tạo venv riêng hoặc ghim bản.
8. **Không biết prompt nội bộ là tiếng Anh (LlamaIndex).** Câu trả lời vẫn ra tiếng Việt nhưng đôi khi lệch giọng; muốn kiểm soát thì tự đưa prompt. (Quan sát từ prompt gửi đi trong `[RUN]`, chưa so sánh chất lượng thật.)
9. **Framework không làm model "thông minh hơn".** Chất lượng vẫn phụ thuộc cách cắt đoạn, embedding và prompt (nói lại từ `rag-chatbot`).
10. **Cho rằng một thư viện "tốt hơn" thư viện kia.** Hai thư viện chồng lấn nhau và đều đang đổi; bài chỉ nên so sự khác biệt về cách dùng (LangChain: lắp từng khối bằng LCEL; LlamaIndex: index và query engine gói sẵn), không xếp hạng.

## Ví dụ hoặc trực giác hay

- **Bộ đồ nghề và máy đóng gói (gợi ý).** Tự làm RAG như tự lắp bàn bằng đồ nghề: hiểu từng ốc, nhưng mất công. Framework như bộ bàn đóng gói sẵn: nhanh, nhưng khi thiếu một ốc ở phiên bản cũ thì khó biết nằm ở đâu.
- **Cùng một chuỗi, hai cách viết.** LangChain viết đường ống nằm lộ ra: `retriever | format_docs | prompt | llm | parser`; đọc từ trái sang phải thấy dữ liệu đi qua từng khâu. LlamaIndex giấu đường ống sau `query_engine.query(...)`; mở `response.source_nodes` mới thấy đoạn nào được dùng (đã chạy thật: 2 đoạn nguồn).
- **Ba câu hỏi để quyết định:** (1) Quy trình của bạn có cố định, ít bước không? (2) Bạn có cần nhiều loại nguồn dữ liệu hoặc nhiều kho vector không? (3) Bạn chịu được việc cập nhật theo API đổi không? Ba câu "có, không, không" thì tự viết; ngược lại thì xét framework.
- **Chạy thử không cần key (gợi ý cho người viết kiểm chứng).** Máy chủ giả OpenAI-compatible ở cổng cục bộ đủ để kiểm cấu trúc code (đã dùng; xem bên dưới). Nó **không** thay cho chạy thật: kết quả mẫu trong bài chỉ được lấy từ lần chạy với model thật.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Chạy thật với model thật (Gemini/Groq/Ollama) | Phiên này không có `.env.llm`; chỉ chạy với máy chủ giả | Bảng bên dưới ghi mức "chạy khô" (cấu trúc, không có kết quả thật). **Không trích output làm "Kết quả mẫu"** cho tới khi reviewer chạy thật |
| Nhà cung cấp nào có endpoint `/embeddings` kiểu OpenAI (Gemini, Groq, Ollama) | Chưa tra riêng; [text-api](text-api.md) chỉ nói chat | Theo cách bài `rag-chatbot` chọn; nếu bài đó dùng model embedding chạy trên máy thì bài này phải theo |
| ~~`RetrievalQA` và import cũ trong `langchain-classic` 1.0.8~~ | **Đã kiểm** (chạy khô): `langchain_classic.chains.RetrievalQA`, `@deprecated(since="0.1.17", removal="2.0.0", alternative="langchain.agents.create_agent")`; hai import cũ báo `ModuleNotFoundError` | Bài ghi import `langchain_classic.chains` và "đã bị đánh dấu deprecated" |
| ~~`OpenAILike` mặc định (`is_chat_model`, `context_window`)~~ | **Đã kiểm** trong mã nguồn 0.8.1: `is_chat_model=False`, `context_window=3900` | Code đặt `is_chat_model=True` tường minh; bài nói mặc định là completion cũ |
| Lịch sử `ServiceContext` → `Settings`, `llama_index.legacy` | Chưa tra changelog | Không đưa vào bài, hoặc ghi "đã đổi" không kèm số bản |
| Trang `langchain-community` còn dùng cho loader nào | Gói 0.4.2 (05/2026), chưa kiểm loader nào còn hoạt động | Code của bài không dùng; nói loader nằm ở đó theo [LC-MIG] |
| Hạn mức, giá | Không tra (theo quy ước) | Không ghi |

## Kiểm chứng code

Do `lesson-writer` chạy ngày 24/10/2026, thư mục làm việc ở scratchpad, Python 3.14.5 gọi bằng `-I -X utf8`. Hai venv tạm riêng (quyết định 61), không đụng `.venv-llm/`:

- **venv LangChain:** `langchain` 1.4.7, `langchain-core` 1.7.0, `langchain-openai` 1.7.2, `langchain-text-splitters` 1.1.3, `openai` **3.37.0**, `numpy` 2.5.4, `pydantic` 2.14.1 (`pip check`: không lỗi). `langchain` 1.4.7 **không** kéo theo `langchain-text-splitters` (chỉ cần `langchain-core`, `langgraph`, `pydantic`), và `InMemoryVectorStore` cần `numpy` (thiếu thì `ImportError` ở bước tìm), nên cả hai được ghi vào `packages`. `pip install --dry-run` vào `.venv-llm/`: chỉ thêm gói, không hạ gói nào, giữ `openai` 3.37.0.
- **venv LlamaIndex:** `llama-index-core` 0.14.25, `llama-index-llms-openai-like` 0.8.1, `llama-index-llms-openai` 0.8.3, `llama-index-embeddings-openai` 0.7.0, `openai` **2.54.0**, `pydantic` 2.14.1. `pip install --dry-run` vào `.venv-llm/`: sẽ hạ `openai` xuống 2.54.0, nên **không** cài vào đó.

Chưa có `.env.llm` nên chưa chạy thật với nhà cung cấp nào; bài không có kết quả mẫu. Ngoài mức `chạy khô` theo định nghĩa (cổng đóng `127.0.0.1:9`), cả bốn file còn được chạy hết luồng với một **server giả** API kiểu OpenAI (thư viện chuẩn `http.server`, cổng ngẫu nhiên; `/v1/chat/completions` trả "MOCK: " + đầu message cuối, `/v1/embeddings` trả vectơ băm theo từ; ghi lại mọi yêu cầu). Server giả không phải mô hình: thứ hạng chunk và câu trả lời của nó không có ý nghĩa.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `rag-langchain.vi.py` | chạy khô | 2026-10-24 | venv LangChain ở trên | `ast.parse(feature_version=(3, 10))` qua (lại sau khi sửa comment dòng 1 "cắt chunk"); 60 dòng, dòng dài nhất 79 ký tự. Cổng đóng: `openai.APIConnectionError` sau khoảng 12 s. Thiếu `OPENAI_API_KEY`: `KeyError: 'OPENAI_API_KEY'`; thiếu `EMBEDDING_MODEL`: `KeyError: 'EMBEDDING_MODEL'`. Với server giả: chạy hết, in `Số chunk: 4` (phép cắt không gọi API, giống nhau mọi máy), 2 chunk tìm được, câu trả lời của server giả. Server nhận 3 lần `/embeddings` (1 lô 4 chuỗi, 2 lần 1 chuỗi: retriever chạy 2 lần) và 1 lần `/chat/completions` với vai trò `system`, `user`; đầu vào embedding là `str`. Bản sửa `check_embedding_ctx_length=True`: server nhận `list` (dãy mã token) thay vì `str` |
| `rag-langchain.en.py` | chạy khô | 2026-10-24 | như trên | Cấu trúc khớp bản vi sau khi bỏ comment và làm rỗng chuỗi (kiểm lại sau khi sửa comment bản vi). Server giả: `Chunks: 4` |
| `rag-llamaindex.vi.py` | chạy khô | 2026-10-24 | venv LlamaIndex ở trên | `ast.parse` qua (lại sau khi sửa comment dòng 12, 37 "mô hình"); 45 dòng, dòng dài nhất 77 ký tự. Cổng đóng: `openai.APIConnectionError` sau khoảng 84 s (`OpenAIEmbedding` mặc định `max_retries=10`). Thiếu key / `EMBEDDING_MODEL`: `KeyError` nêu tên biến. Với server giả: `Số chunk: 4`, 2 `source_nodes`, prompt gửi đi gồm `system` ("You are an expert Q&A system…") và `user` ("Context information is below." … có dòng `source: noi-quy.txt` trước mỗi chunk). Biến thể: bỏ `is_chat_model=True` thì gọi `client.completions.create` (`/completions`), server giả trả 404; bỏ `Settings.embed_model` hoặc `Settings.llm` thì yêu cầu đi thẳng tới `api.openai.com` (không đọc `OPENAI_BASE_URL`), nhận `AuthenticationError` 401; `OpenAIEmbedding(model="nomic-embed-text")`: `ValueError: 'nomic-embed-text' is not a valid OpenAIEmbeddingModelType`; `text_qa_template=PromptTemplate(...)` (đoạn trích trong bài) thay cả `system` lẫn khung ngữ cảnh, chỉ còn 1 message `user`. `chunk_size` 80 (thay 64): 2 chunk dài 128 và 135 ký tự. Bộ tách token cl100k có sẵn trong `llama_index/core/_static/tiktoken_cache` |
| `rag-llamaindex.en.py` | chạy khô | 2026-10-24 | như trên | Cấu trúc khớp bản vi. Server giả: `Chunks: 1` (văn bản tiếng Anh ngắn hơn 64 token sau khi trừ metadata), khác bản vi `Số chunk: 4`. Phiên chính chọn giữ code; xem "Ghi chú cho người dịch" dưới bảng |
| khối `python` trong bài (3 khối: chain LCEL, hai dòng index/query engine, `PromptTemplate`) | cú pháp | 2026-10-24 | Python 3.14.5 | `ast.parse(feature_version=(3, 10))` qua. Hai khối đầu trích từ file code; khối `PromptTemplate` là **minh họa, không lấy từ file nào**, đã chạy với server giả qua một bản sửa của `rag-llamaindex.vi.py` |
| import cũ trong mục "Những gì đã đổi" | chạy khô | 2026-10-24 | venv LangChain; `langchain-classic` 1.0.8 cài `--no-deps` vào thư mục tạm | `from langchain.chains import RetrievalQA`, `from langchain.text_splitter import ...`: `ModuleNotFoundError`. `from langchain.agents import create_agent`: được. `langchain_classic.chains` có `RetrievalQA`, mang `@deprecated(since="0.1.17", removal="2.0.0", alternative="langchain.agents.create_agent")`. `langgraph.prebuilt.create_react_agent` có thông báo "moved to `langchain.agents`… `create_agent`" |

Content-reviewer chạy lại cùng ngày: bốn file chạy khô và chạy hết luồng với server giả; import cũ chạy khô; ba khối `python` trong bài kiểm cú pháp.

**Số tất định trong lời văn.** `Số chunk: 4` (cả hai ô bản vi) là số tất định: phép cắt chạy cục bộ, không gọi API, nên giống nhau ở mọi máy. Đây là ngoại lệ có chủ đích của hợp đồng `llm-lessons.md` 4.8 mục 7 (chưa chạy thật thì lời văn không trích số từ output): bài nêu con số này mà không có khối "Kết quả mẫu". Thứ hạng chunk và câu trả lời thì không tất định, bài chỉ nói "nên".

**Ghi chú cho người dịch (bản en).** Ô LlamaIndex bản en in `Chunks: 1`, không phải 4: nội quy tiếng Anh tốn ít token hơn, cả bốn đoạn vừa trong `chunk_size=64` sau khi trừ metadata. Phiên chính chọn giữ code giống hệt bản vi. Bản en đừng dịch thẳng câu "nên LlamaIndex cũng cắt ra `Số chunk: 4`" ở đoạn sau ô LlamaIndex; thay bằng một câu riêng giải thích `Chunks: 1` như một ví dụ về chênh lệch token giữa hai ngôn ngữ (cùng nội dung, tiếng Việt tốn nhiều token hơn tiếng Anh), nối với câu hỏi quiz số 4. Ô LangChain bản en vẫn ra `Chunks: 4` (đếm ký tự).

## Liên quan tới bài nào

- **`llm/rag-chatbot`** (cần biết trước): bài này viết lại đúng pipeline đó; dùng chung `RagPipelineFigure` (hình pipeline RAG, `llm-lessons.md` 2.9 cho phép dùng lại), đặt ở mục "Minh họa".
- **`llm/agents`** (bài sau): chỉ hẹn tới. Cả hai thư viện đều có agent (LangChain `create_agent`, LlamaIndex `FunctionAgent`), và LangChain agent dựng trên LangGraph [LC-OV].
- **`llm/text-api`**: khuôn gọi `client`/biến môi trường và bảng nhà cung cấp; bài này link tới đó thay vì chép lại ([text-api](text-api.md)).
- **`llm/graph-rag`**: có thể dùng lại khái niệm retriever/index.
- **Giáo án gốc:** Buổi 8 của phần LLM, "Thực hành Langchain + LLAMA Index" (đã tìm thấy trong `giáo án ai.md`; chỉ tham khảo).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Framework | framework | Giữ nguyên |
| Bộ tải tài liệu | document loader | Gloss lần đầu, giữ tên tiếng Anh |
| Bộ cắt văn bản | text splitter | Gloss lần đầu |
| Đoạn (chunk) | chunk | Đã dùng ở `rag-chatbot`, theo bài đó |
| Bộ truy xuất | retriever | Giữ "retriever" |
| Kho vector | vector store | Giữ nguyên |
| Chỉ mục | index | Dịch "chỉ mục (index)" |
| Bộ máy truy vấn | query engine | Giữ "query engine" |
| Chuỗi (xử lý) | chain | Giữ "chain" |
| LCEL | LangChain Expression Language | Giữ viết tắt, gloss một lần |

## Đọc thêm đề xuất

1. [LangChain overview](https://docs.langchain.com/oss/python/langchain/overview) và [Migrate to v1](https://docs.langchain.com/oss/python/migrate/langchain-v1). Đã đọc (qua WebFetch).
2. [LangChain Retrieval](https://docs.langchain.com/oss/python/langchain/retrieval) và [Semantic search](https://docs.langchain.com/oss/python/langchain/knowledge-base). Mở được, chưa đọc kỹ.
3. [LlamaIndex Starter example](https://developers.llamaindex.ai/python/framework/getting_started/starter_example/) và [Installation](https://developers.llamaindex.ai/python/framework/getting_started/installation/). Đã đọc.
4. Trang PyPI: [llama-index-llms-openai-like](https://pypi.org/project/llama-index-llms-openai-like/) (link tới đúng bản khi ghim).
