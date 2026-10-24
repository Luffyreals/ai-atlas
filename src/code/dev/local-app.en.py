# app.py
# A tiny web app: type a name, press the button, get a greeting.
import streamlit as st

st.title("Hello, Streamlit")
name = st.text_input("Your name")

# Each time you press the button, Streamlit reruns the whole file from the top.
if st.button("Say hello"):
    st.write(f"Hello, {name or 'friend'}!")
