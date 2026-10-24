# A minimal RAG pipeline in LangChain: split, embed, retrieve, LCEL.
import os

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

BASE_URL = os.environ.get("OPENAI_BASE_URL")  # empty: use OpenAI
API_KEY = os.environ["OPENAI_API_KEY"]
llm = ChatOpenAI(
    model=os.environ["LLM_MODEL"], base_url=BASE_URL, api_key=API_KEY
)
embeddings = OpenAIEmbeddings(
    model=os.environ["EMBEDDING_MODEL"],
    base_url=os.environ.get("EMBEDDING_BASE_URL") or BASE_URL,
    api_key=os.environ.get("EMBEDDING_API_KEY") or API_KEY,
    check_embedding_ctx_length=False,  # send text, not token ids
)

# 1. The document, split into chunks
text = (
    "The AI Atlas club meets on Thursday evenings at 7 pm in room 204.\n\n"
    "New members first finish the linear regression lesson.\n\n"
    "At each meeting, one member presents a lesson for about 20 minutes.\n\n"
    "Anyone who misses three meetings in a row gets a reminder email."
)
docs = [Document(page_content=text, metadata={"source": "club-rules.txt"})]
splitter = RecursiveCharacterTextSplitter(chunk_size=80, chunk_overlap=0)
chunks = splitter.split_documents(docs)

# 2. Embed each chunk and keep it in an in-memory vector store
store = InMemoryVectorStore(embeddings)
store.add_documents(chunks)
retriever = store.as_retriever(search_kwargs={"k": 2})

# 3. A prompt with two blanks: {context} and {question}
prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer only from the context. If it is not there, say so."),
    ("human", "Context:\n{context}\n\nQuestion: {question}"),
])


def format_docs(found):
    return "\n\n".join(d.page_content for d in found)


# 4. Join the steps with LCEL: data flows from left to right
chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt | llm | StrOutputParser()
)
question = "What time does the club meet?"
print(f"Chunks: {len(chunks)}")
for d in retriever.invoke(question):
    print("-", d.page_content)
print(chain.invoke(question))
