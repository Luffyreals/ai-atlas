# Giao diện chat bằng Streamlit, nối với API kiểu OpenAI, có streaming.
import os

import streamlit as st
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]
SYSTEM = "Bạn là trợ lý thân thiện, trả lời ngắn gọn bằng tiếng Việt."

st.title("Trợ lý AI Atlas")

# Streamlit chạy lại cả file mỗi lần bạn gửi tin. Biến thường bị
# tạo lại từ đầu, còn st.session_state thì sống qua các lần chạy lại.
if "messages" not in st.session_state:
    st.session_state.messages = []

# Màn hình được vẽ lại từ đầu, nên vẽ lại mọi tin nhắn cũ.
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# chat_input trả về None cho tới khi người dùng gửi tin.
if prompt := st.chat_input("Nhập câu hỏi..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        stream = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": SYSTEM}]
            + st.session_state.messages,
            stream=True,
        )
        # write_stream hiện chữ dần, rồi trả về cả câu trả lời.
        reply = st.write_stream(stream)
    # Lưu câu trả lời, nếu không lượt sau mô hình sẽ "quên" nó.
    st.session_state.messages.append({"role": "assistant", "content": reply})
