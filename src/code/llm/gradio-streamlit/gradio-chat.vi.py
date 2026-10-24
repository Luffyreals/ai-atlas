# Giao diện chat bằng Gradio, nối với API kiểu OpenAI, có streaming.
import os

import gradio as gr
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]
SYSTEM = "Bạn là trợ lý thân thiện, trả lời ngắn gọn bằng tiếng Việt."


def to_text(content):
    # Gradio 6 lưu nội dung mỗi tin thành danh sách mảnh
    # {"type": "text", "text": ...}. Ta ghép lại thành một chuỗi.
    if isinstance(content, str):
        return content
    return "".join(p["text"] for p in content if p.get("type") == "text")


def chat(message, history):
    # history: các lượt trước, do Gradio giữ. Tin system ta tự thêm.
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
        if not chunk.choices:  # có nơi gửi mảnh không có choices
            continue
        piece = chunk.choices[0].delta.content
        if piece:  # mảnh có thể là None hoặc chuỗi rỗng
            reply += piece
            yield reply  # trả cả đoạn đã có, Gradio vẽ lại tin nhắn


demo = gr.ChatInterface(
    chat,
    title="Trợ lý AI Atlas",
    examples=["Gradio khác Streamlit ở đâu?", "Kể một chuyện cười ngắn"],
)

if __name__ == "__main__":
    demo.launch()  # mở http://127.0.0.1:7860
