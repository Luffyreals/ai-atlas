# Turns PNG bytes into a base64 data URL, as when sending an image to an API.
import base64
import struct
import zlib


def demo_png(size):
    # Test image: white background, red square in the middle. Stdlib only.
    a, b = size // 4, 3 * size // 4
    raw = b"".join(
        b"\x00" + b"".join(  # every PNG row starts with 1 filter byte
            b"\xff\x00\x00" if a <= x < b and a <= y < b else b"\xff" * 3
            for x in range(size))
        for y in range(size))

    def chunk(kind, data):
        crc = struct.pack(">I", zlib.crc32(kind + data))
        return struct.pack(">I", len(data)) + kind + data + crc

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
            + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


png = demo_png(48)
b64 = base64.b64encode(png).decode("ascii")  # 3 bytes -> 4 characters
data_url = f"data:image/png;base64,{b64}"

print(f"PNG bytes:      {len(png)}")
print(f"base64 chars:   {len(b64)}")
print(f"ratio:          {len(b64) / len(png):.3f}")
print(f"data URL start: {data_url[:40]}...")

# Decoding back must give the original bytes
print("round trip ok: ", base64.b64decode(b64) == png)
