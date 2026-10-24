# Pipeline RAG tối thiểu bằng LangChain: cắt chunk, embedding, truy xuất, LCEL.
import os

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

BASE_URL = os.environ.get("OPENAI_BASE_URL")  # bỏ trống: dùng OpenAI
API_KEY = os.environ["OPENAI_API_KEY"]
llm = ChatOpenAI(
    model=os.environ["LLM_MODEL"], base_url=BASE_URL, api_key=API_KEY
)
embeddings = OpenAIEmbeddings(
    model=os.environ["EMBEDDING_MODEL"],
    base_url=os.environ.get("EMBEDDING_BASE_URL") or BASE_URL,
    api_key=os.environ.get("EMBEDDING_API_KEY") or API_KEY,
    check_embedding_ctx_length=False,  # gửi chữ, không gửi mã token
)

# 1. Tài liệu, rồi cắt thành các chunk
text = (
    "Câu lạc bộ AI Atlas họp tối thứ Năm, từ 19 giờ, ở phòng 204.\n\n"
    "Thành viên mới cần học xong bài hồi quy tuyến tính trước buổi đầu.\n\n"
    "Mỗi buổi họp có một bạn trình bày một bài học trong khoảng 20 phút.\n\n"
    "Ai vắng ba buổi liền sẽ nhận một email nhắc nhở của ban điều hành."
)
docs = [Document(page_content=text, metadata={"source": "noi-quy.txt"})]
splitter = RecursiveCharacterTextSplitter(chunk_size=80, chunk_overlap=0)
chunks = splitter.split_documents(docs)

# 2. Tính embedding từng chunk, lưu vào kho vectơ trong bộ nhớ
store = InMemoryVectorStore(embeddings)
store.add_documents(chunks)
retriever = store.as_retriever(search_kwargs={"k": 2})

# 3. Prompt có hai chỗ trống: {context} và {question}
prompt = ChatPromptTemplate.from_messages([
    ("system", "Chỉ trả lời dựa trên ngữ cảnh. Không có thì nói không biết."),
    ("human", "Ngữ cảnh:\n{context}\n\nCâu hỏi: {question}"),
])


def format_docs(found):
    return "\n\n".join(d.page_content for d in found)


# 4. Nối các khâu bằng LCEL: dữ liệu chảy từ trái sang phải
chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt | llm | StrOutputParser()
)
question = "Câu lạc bộ họp lúc mấy giờ?"
print(f"Số chunk: {len(chunks)}")
for d in retriever.invoke(question):
    print("-", d.page_content)
print(chain.invoke(question))
