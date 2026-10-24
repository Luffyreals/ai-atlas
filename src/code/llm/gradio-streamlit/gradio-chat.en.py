# A Gradio chat interface on an OpenAI-compatible API, with streaming.
import os

import gradio as gr
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # empty: use OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]
SYSTEM = "You are a friendly assistant. Keep your answers short."


def to_text(content):
    # Gradio 6 stores each message's content as a list of parts
    # {"type": "text", "text": ...}. We join them into one string.
    if isinstance(content, str):
        return content
    return "".join(p["text"] for p in content if p.get("type") == "text")


def chat(message, history):
    # history: the earlier turns, kept by Gradio. We add the system message.
    messages = [{"role": "system", "content": SYSTEM}]
    for turn in history:
        messages.append(
            {"role": turn["role"], "content": to_text(turn["content"])}
        )
    messages.append({"role": "user", "content": message})

    stream = client.chat.completions.create(
        model=MODEL, messages=messages, stream=True
    )
    reply = ""
    for chunk in stream:
        if not chunk.choices:  # some providers send chunks without choices
            continue
        piece = chunk.choices[0].delta.content
        if piece:  # a chunk may carry None or an empty string
            reply += piece
            yield reply  # yield the whole text so far; Gradio redraws it


demo = gr.ChatInterface(
    chat,
    title="AI Atlas assistant",
    examples=["How is Gradio different from Streamlit?", "Tell a short joke"],
)

if __name__ == "__main__":
    demo.launch()  # opens http://127.0.0.1:7860
