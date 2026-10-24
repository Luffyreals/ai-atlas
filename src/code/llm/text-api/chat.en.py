# A two-turn conversation. The API remembers nothing between two calls,
# so every call sends the whole messages list again.
import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # empty: use OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]

messages = [
    {"role": "system",
     "content": "You are a teaching assistant. Answer briefly in English."},
]


def ask(question):
    messages.append({"role": "user", "content": question})
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.3,  # low: focused answers, few surprises
    )
    choice = response.choices[0]
    answer = choice.message.content or ""  # content may be None
    # Keep the model's reply so it can "remember" it next turn
    messages.append({"role": "assistant", "content": answer})
    usage = response.usage
    print(f"Q: {question}\nA: {answer}")
    print(f"(input tokens: {usage.prompt_tokens}, "
          f"output tokens: {usage.completion_tokens}, "
          f"finish_reason: {choice.finish_reason})\n")


ask("What is a token in a language model? Answer in two sentences.")
# This question only makes sense because the last turn is in messages
ask("Give an example with an English sentence.")
