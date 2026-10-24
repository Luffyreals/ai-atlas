# Nhờ LLM đọc một đoạn văn và trả về các bộ ba dưới dạng JSON.
import json
import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]

RELATIONS = ["FOUNDED", "INVESTED_IN", "STUDIED_AT", "BASED_IN"]
SYSTEM = (
    "Bạn trích bộ ba tri thức từ văn bản. Chỉ trả về một đối tượng JSON "
    'dạng {"triples": [{"subject": "...", "relation": "...", '
    '"object": "..."}]}. relation chỉ được là một trong: '
    + ", ".join(RELATIONS)
    + ". Chỉ ghi điều văn bản nói rõ, không suy đoán. Tên công ty, "
    "tổ chức ghi đúng như văn bản, bỏ chức danh như ông, bà, chị."
)
EXAMPLE_IN = "Ông Tùng sáng lập Gió Nam, một công ty ở Huế."
EXAMPLE_OUT = json.dumps({"triples": [
    {"subject": "Tùng", "relation": "FOUNDED", "object": "Gió Nam"},
    {"subject": "Gió Nam", "relation": "BASED_IN", "object": "Huế"},
]}, ensure_ascii=False)
TEXT = (
    "Chị Lan tốt nghiệp ĐH Bách khoa rồi sáng lập Mây Xanh năm 2021. "
    "Công ty đặt trụ sở ở Đà Nẵng và vừa nhận vốn từ Quỹ Sao Mai."
)

response = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": EXAMPLE_IN},  # một ví dụ mẫu
        {"role": "assistant", "content": EXAMPLE_OUT},
        {"role": "user", "content": TEXT},
    ],
    temperature=0,  # trích xuất: cần ổn định
    response_format={"type": "json_object"},  # JSON mode; lỗi 400 thì xóa
)
text = response.choices[0].message.content
try:
    items = json.loads(text)["triples"]
except (json.JSONDecodeError, KeyError, TypeError):
    items = None
if not isinstance(items, list):
    print("Không đọc được JSON:", text)
    items = []
for item in items:  # không tin đầu ra: kiểm từng bộ ba
    if not isinstance(item, dict) or item.get("relation") not in RELATIONS:
        print("Bỏ qua (sai lược đồ):", item)
        continue
    s = " ".join(str(item.get("subject", "")).split())  # bỏ khoảng trắng thừa
    o = " ".join(str(item.get("object", "")).split())
    if s and o:
        print((s, item["relation"], o))
    else:
        print("Bỏ qua (tên rỗng):", item)
