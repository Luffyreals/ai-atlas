# Hội thoại hai lượt. API không nhớ gì giữa hai lần gọi,
# nên mỗi lần ta gửi lại cả danh sách messages.
import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]

messages = [
    {"role": "system",
     "content": "Bạn là trợ giảng, trả lời ngắn gọn bằng tiếng Việt."},
]


def ask(question):
    messages.append({"role": "user", "content": question})
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.3,  # thấp: câu trả lời tập trung, ít bất ngờ
    )
    choice = response.choices[0]
    answer = choice.message.content or ""  # content có thể là None
    # Lưu lời model để lượt sau model "nhớ" được
    messages.append({"role": "assistant", "content": answer})
    usage = response.usage
    print(f"Hỏi: {question}\nĐáp: {answer}")
    print(f"(token vào: {usage.prompt_tokens}, "
          f"token ra: {usage.completion_tokens}, "
          f"finish_reason: {choice.finish_reason})\n")


ask("Token trong mô hình ngôn ngữ là gì? Trả lời trong hai câu.")
# Câu này chỉ hiểu được nhờ lượt trước nằm trong messages
ask("Cho một ví dụ với câu tiếng Việt.")
