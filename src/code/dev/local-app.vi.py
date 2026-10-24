# app.py
# Một ứng dụng web nhỏ: nhập tên, bấm nút, nhận lời chào.
import streamlit as st

st.title("Hello, Streamlit")
name = st.text_input("Your name")

# Mỗi lần bạn bấm nút, Streamlit chạy lại cả file từ trên xuống.
if st.button("Say hello"):
    st.write(f"Hello, {name or 'friend'}!")
