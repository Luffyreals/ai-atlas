# Trích thông tin từ một đánh giá thành JSON, có thử lại và bắt lỗi.
import json
import os

import openai
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
    max_retries=4,  # SDK tự thử lại lỗi tạm thời, chờ lâu dần (mặc định 2)
    timeout=30,  # giây chờ tối đa cho mỗi lần gọi (mặc định 600)
)
MODEL = os.environ["LLM_MODEL"]

SYSTEM = (
    "Bạn trích thông tin từ đánh giá của khách. Chỉ trả về một đối tượng "
    'JSON có hai khóa: "cam_xuc" (một trong "tích cực", "tiêu cực", '
    '"lẫn lộn") và "khia_canh" (danh sách các khía cạnh được nhắc tới).'
)
review = "Quán đẹp, nhân viên dễ thương, nhưng đồ uống hơi đắt."

try:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": review},
        ],
        temperature=0,  # trích xuất: cần ổn định, không cần sáng tạo
        response_format={"type": "json_object"},  # JSON mode
    )
except openai.RateLimitError:
    print("Lỗi 429: vượt rate limit dù đã thử lại. Chờ rồi chạy lại.")
except openai.APIStatusError as e:
    # 400, 401, 404...: lỗi của yêu cầu, thử lại cũng không ích gì
    print(f"Lỗi {e.status_code}: {e.body}")  # thông điệp của máy chủ
    print("Kiểm tra key, OPENAI_BASE_URL, LLM_MODEL. Lỗi 400: thử xóa "
          "response_format hoặc temperature.")
except openai.APIConnectionError:
    print("Không kết nối được máy chủ, hoặc quá thời gian chờ.")
else:
    text = response.choices[0].message.content
    try:
        data = json.loads(text)  # JSON mode vẫn có thể bị cắt cụt
    except (json.JSONDecodeError, TypeError):  # TypeError: text là None
        print("Không đọc được JSON:", text)
    else:
        print(json.dumps(data, ensure_ascii=False, indent=2))
