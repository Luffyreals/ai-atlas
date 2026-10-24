# Calls a chat model through an OpenAI-compatible API.
import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # unset: use OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]

response = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": "You answer in short, plain sentences."},
        {"role": "user", "content": "What is RAG? Answer in two sentences."},
    ],
)
print(response.choices[0].message.content)
