# A minimal RAG pipeline in LlamaIndex: an index and a query engine.
import os

from llama_index.core import Document, Settings, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai_like import OpenAILike

BASE_URL = os.environ.get("OPENAI_BASE_URL")  # empty: use OpenAI
API_KEY = os.environ["OPENAI_API_KEY"]

# Global settings. Without them, LlamaIndex calls OpenAI's default models
Settings.llm = OpenAILike(
    model=os.environ["LLM_MODEL"],
    api_base=BASE_URL,  # LangChain calls this base_url
    api_key=API_KEY,
    is_chat_model=True,  # call /chat/completions
)
Settings.embed_model = OpenAIEmbedding(
    model_name=os.environ["EMBEDDING_MODEL"],  # not model=
    api_base=os.environ.get("EMBEDDING_BASE_URL") or BASE_URL,
    api_key=os.environ.get("EMBEDDING_API_KEY") or API_KEY,
)
# chunk_size counts tokens (metadata included), not characters
Settings.node_parser = SentenceSplitter(chunk_size=64, chunk_overlap=0)

text = (
    "The AI Atlas club meets on Thursday evenings at 7 pm in room 204.\n\n"
    "New members first finish the linear regression lesson.\n\n"
    "At each meeting, one member presents a lesson for about 20 minutes.\n\n"
    "Anyone who misses three meetings in a row gets a reminder email."
)
doc = Document(text=text, metadata={"source": "club-rules.txt"})

# One line does three jobs: split, embed, store in the index
index = VectorStoreIndex.from_documents([doc])
# The query engine bundles retrieval, the prompt and the model call
query_engine = index.as_query_engine(similarity_top_k=2)

question = "What time does the club meet?"
response = query_engine.query(question)
print(f"Chunks: {len(index.docstore.docs)}")
for node in response.source_nodes:
    print("-", node.text)
print(response)
