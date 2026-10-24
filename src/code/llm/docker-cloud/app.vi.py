# Ứng dụng chat Gradio của bài trước, sửa để chạy được trong container.
import os

import gradio as gr
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # không đặt biến: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],  # đưa vào lúc chạy, không dựng
)
MODEL = os.environ["LLM_MODEL"]
SYSTEM = "Bạn là trợ lý thân thiện, trả lời ngắn gọn bằng tiếng Việt."
# Cổng: nền tảng cloud thường báo qua biến PORT. Không có thì dùng 7860.
PORT = int(os.environ.get("PORT", "7860"))


def to_text(content):
    # Gradio 6 lưu nội dung mỗi tin thành danh sách mảnh; ghép thành chuỗi.
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
        if not chunk.choices:  # có nơi gửi mảnh không có choices
            continue
        piece = chunk.choices[0].delta.content
        if piece:  # mảnh có thể là None hoặc chuỗi rỗng
            reply += piece
            yield reply  # trả cả đoạn đã có, Gradio vẽ lại tin nhắn


demo = gr.ChatInterface(chat, title="Trợ lý AI Atlas")

if __name__ == "__main__":
    # Địa chỉ nghe lấy từ biến GRADIO_SERVER_NAME (Dockerfile đặt 0.0.0.0);
    # không có biến đó thì Gradio chỉ nghe 127.0.0.1.
    demo.launch(server_port=PORT)
