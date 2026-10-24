# Hỏi một mô hình vision về một ảnh, gửi ảnh dạng data URL base64.
import base64
import mimetypes
import os
import struct
import zlib

from openai import OpenAI


def demo_png(size):
    # Ảnh thử: nền trắng, hình vuông đỏ ở giữa (giống ô chạy trên trang)
    a, b = size // 4, 3 * size // 4
    raw = b"".join(
        b"\x00" + b"".join(
            b"\xff\x00\x00" if a <= x < b and a <= y < b else b"\xff" * 3
            for x in range(size))
        for y in range(size))

    def chunk(kind, data):
        crc = struct.pack(">I", zlib.crc32(kind + data))
        return struct.pack(">I", len(data)) + kind + data + crc

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
            + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


IMAGE_PATH = "anh-thu.png"  # đổi thành đường dẫn tới ảnh của bạn
if not os.path.exists(IMAGE_PATH):
    with open(IMAGE_PATH, "wb") as f:
        f.write(demo_png(48))

with open(IMAGE_PATH, "rb") as f:
    b64 = base64.b64encode(f.read()).decode("ascii")
mime = mimetypes.guess_type(IMAGE_PATH)[0]  # "image/png", "image/jpeg"...
data_url = f"data:{mime};base64,{b64}"

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]  # phải là mô hình nhìn được ảnh

response = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": "Bạn trả lời ngắn gọn bằng tiếng Việt."},
        {"role": "user", "content": [  # content là danh sách các phần
            {"type": "text",
             "text": "Ảnh có những hình gì, màu gì, nằm ở đâu?"},
            {"type": "image_url", "image_url": {"url": data_url}},
        ]},
    ],
)
print(response.choices[0].message.content)
