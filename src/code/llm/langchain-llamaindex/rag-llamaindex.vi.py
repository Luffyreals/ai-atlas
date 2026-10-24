# Pipeline RAG tối thiểu bằng LlamaIndex: index và query engine.
import os

from llama_index.core import Document, Settings, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai_like import OpenAILike

BASE_URL = os.environ.get("OPENAI_BASE_URL")  # bỏ trống: dùng OpenAI
API_KEY = os.environ["OPENAI_API_KEY"]

# Cấu hình chung. Không đặt thì LlamaIndex gọi mô hình mặc định của OpenAI
Settings.llm = OpenAILike(
    model=os.environ["LLM_MODEL"],
    api_base=BASE_URL,  # LangChain gọi là base_url
    api_key=API_KEY,
    is_chat_model=True,  # gọi /chat/completions
)
Settings.embed_model = OpenAIEmbedding(
    model_name=os.environ["EMBEDDING_MODEL"],  # không dùng model=
    api_base=os.environ.get("EMBEDDING_BASE_URL") or BASE_URL,
    api_key=os.environ.get("EMBEDDING_API_KEY") or API_KEY,
)
# chunk_size đếm bằng token (tính cả metadata), không phải ký tự
Settings.node_parser = SentenceSplitter(chunk_size=64, chunk_overlap=0)

text = (
    "Câu lạc bộ AI Atlas họp tối thứ Năm, từ 19 giờ, ở phòng 204.\n\n"
    "Thành viên mới cần học xong bài hồi quy tuyến tính trước buổi đầu.\n\n"
    "Mỗi buổi họp có một bạn trình bày một bài học trong khoảng 20 phút.\n\n"
    "Ai vắng ba buổi liền sẽ nhận một email nhắc nhở của ban điều hành."
)
doc = Document(text=text, metadata={"source": "noi-quy.txt"})

# Một dòng làm ba việc: cắt chunk, tính embedding, lưu vào chỉ mục
index = VectorStoreIndex.from_documents([doc])
# Query engine gói sẵn: truy xuất, ghép prompt, gọi mô hình
query_engine = index.as_query_engine(similarity_top_k=2)

question = "Câu lạc bộ họp lúc mấy giờ?"
response = query_engine.query(question)
print(f"Số chunk: {len(index.docstore.docs)}")
for node in response.source_nodes:
    print("-", node.text)
print(response)
