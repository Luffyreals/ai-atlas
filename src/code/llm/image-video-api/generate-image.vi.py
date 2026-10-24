# Sinh một ảnh từ prompt bằng images.generate, rồi lưu ra tệp.
import base64
import os

import openai
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
IMAGE_MODEL = os.environ["IMAGE_MODEL"]  # mô hình sinh ảnh, khác LLM_MODEL

prompt = (
    "Tranh màu nước: một chiếc xe đạp dựng cạnh quán cà phê vỉa hè "
    "ở Hà Nội, buổi sáng, nắng dịu."
)
try:
    response = client.images.generate(
        model=IMAGE_MODEL,
        prompt=prompt,
        size="1024x1024",
        n=1,
    )
except openai.BadRequestError as err:
    # Bị kiểm duyệt chặn, hoặc tham số không hợp với mô hình.
    # Gửi lại y nguyên thì kết quả vẫn vậy: hãy sửa prompt.
    print("Yêu cầu bị từ chối:", err.code or err.message)
    raise SystemExit(1)

image = response.data[0]
if image.b64_json:  # ảnh trả về dạng chuỗi base64
    with open("anh-sinh-ra.png", "wb") as f:
        f.write(base64.b64decode(image.b64_json))
    print("Đã lưu anh-sinh-ra.png")
else:  # vài nơi trả URL tạm: tải về ngay, URL sẽ hết hạn
    print("URL của ảnh:", image.url)
