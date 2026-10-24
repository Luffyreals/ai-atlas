# The Gradio chat app of the previous lesson, changed to run in a container.
import os

import gradio as gr
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # not set: use OpenAI
    api_key=os.environ["OPENAI_API_KEY"],  # given at run time, not build
)
MODEL = os.environ["LLM_MODEL"]
SYSTEM = "You are a friendly assistant. Keep your answers short."
# Port: cloud platforms usually pass it in PORT. Without it, use 7860.
PORT = int(os.environ.get("PORT", "7860"))


def to_text(content):
    # Gradio 6 stores each message as a list of parts; join them.
    if isinstance(content, str):
        return content
    return "".join(p["text"] for p in content if p.get("type") == "text")


def chat(message, history):
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


demo = gr.ChatInterface(chat, title="AI Atlas assistant")

if __name__ == "__main__":
    # The listen address comes from GRADIO_SERVER_NAME (the Dockerfile sets
    # 0.0.0.0); without it, Gradio only listens on 127.0.0.1.
    demo.launch(server_port=PORT)
