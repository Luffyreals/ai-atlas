# A Streamlit chat interface on an OpenAI-compatible API, with streaming.
import os

import streamlit as st
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # empty: use OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]
SYSTEM = "You are a friendly assistant. Keep your answers short."

st.title("AI Atlas assistant")

# Streamlit reruns the whole file every time you send a message. Plain
# variables start over, but st.session_state survives across reruns.
if "messages" not in st.session_state:
    st.session_state.messages = []

# The screen is redrawn from scratch, so redraw every earlier message.
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# chat_input returns None until the user sends a message.
if prompt := st.chat_input("Ask a question..."):
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
        # write_stream shows the text as it arrives, then returns all of it.
        reply = st.write_stream(stream)
    # Save the reply, or the model "forgets" it on the next turn.
    st.session_state.messages.append({"role": "assistant", "content": reply})
