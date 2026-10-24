# Asks a vision model about an image, sent as a base64 data URL.
import base64
import mimetypes
import os
import struct
import zlib

from openai import OpenAI


def demo_png(size):
    # Test image: white background, red square in the middle (as on the page)
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


IMAGE_PATH = "test-image.png"  # change to the path of your own image
if not os.path.exists(IMAGE_PATH):
    with open(IMAGE_PATH, "wb") as f:
        f.write(demo_png(48))

with open(IMAGE_PATH, "rb") as f:
    b64 = base64.b64encode(f.read()).decode("ascii")
mime = mimetypes.guess_type(IMAGE_PATH)[0]  # "image/png", "image/jpeg"...
data_url = f"data:{mime};base64,{b64}"

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # unset: use OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]  # must be a model that can see images

response = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": "You answer briefly, in plain English."},
        {"role": "user", "content": [  # content is a list of parts
            {"type": "text",
             "text": "What shapes and colors are in the image, and where?"},
            {"type": "image_url", "image_url": {"url": data_url}},
        ]},
    ],
)
print(response.choices[0].message.content)
