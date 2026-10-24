# Một agent tối thiểu: vòng lặp gọi công cụ, không dùng framework.
import json
import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]
MAX_STEPS = 5  # trần số bước: vòng lặp không bao giờ chạy mãi
NOTES = {"thứ hai": "Đọc paper ReAct.", "thứ ba": "Viết agent đầu tiên."}

def tool(name, description):  # mô tả công cụ bằng JSON Schema
    day = {"type": "string", "enum": list(NOTES)}  # chỉ nhận khóa có thật
    return {"type": "function", "function": {
        "name": name, "description": description,
        "parameters": {"type": "object", "properties": {"day": day},
                       "required": ["day"]}}}

TOOLS = [tool("read_note", "Đọc ghi chú của một ngày trong tuần."),
         tool("delete_note", "Xóa ghi chú của một ngày trong tuần.")]

def run_tool(name, args):
    if name not in ("read_note", "delete_note"):
        return f"Không có công cụ tên {name}."
    day = args.get("day")  # mô hình có thể gửi sai kiểu: kiểm trước khi dùng
    if not isinstance(day, str) or day not in NOTES:
        return "Không có ghi chú ngày này."
    if name == "delete_note":  # hành động nguy hiểm: hỏi người trước
        if input(f"Xóa ghi chú {day}? (y/N) ").strip().lower() != "y":
            return "Người dùng từ chối xóa."
        del NOTES[day]
        return "Đã xóa."
    return NOTES[day]

def agent(question):
    messages = [{"role": "user", "content": question}]
    for step in range(MAX_STEPS):
        reply = client.chat.completions.create(  # không tool_choice
            model=MODEL, messages=messages, tools=TOOLS).choices[0].message
        if not reply.tool_calls:  # không gọi công cụ: đây là câu trả lời
            return reply.content
        messages.append(reply)  # lời gọi của mô hình phải nằm trong lịch sử
        for call in reply.tool_calls:  # có thể nhiều lời gọi trong một lượt
            try:
                args = json.loads(call.function.arguments)
            except json.JSONDecodeError:
                args = None  # chuỗi không phải JSON
            if isinstance(args, dict):
                result = run_tool(call.function.name, args)
            else:  # không phải JSON, hoặc JSON nhưng không phải object
                result = "Lỗi: arguments phải là một JSON object hợp lệ."
            print(f"Bước {step + 1}: {call.function.name} -> {result}")
            messages.append({"role": "tool", "tool_call_id": call.id,
                             "content": result})
    return "Dừng: đã chạm trần số bước."

print(agent("Ghi chú thứ ba của tôi là gì?"))
