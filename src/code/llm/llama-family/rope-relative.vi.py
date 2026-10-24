# RoPE: xoay từng cặp chiều liền kề, rồi so với cách cộng vectơ vị trí
import numpy as np


def angles(d, base=10000.0):
    return base ** (-np.arange(0, d, 2) / d)  # d/2 tần số theta_i


def rope(x, pos):
    # xoay cặp (x[2i], x[2i+1]) một góc pos * theta_i
    cos, sin = np.cos(pos * angles(x.size)), np.sin(pos * angles(x.size))
    out = np.empty_like(x)
    out[0::2] = x[0::2] * cos - x[1::2] * sin
    out[1::2] = x[0::2] * sin + x[1::2] * cos
    return out


def add_pos(x, pos):
    # cách của Transformer gốc: cộng vectơ sin/cos của vị trí vào x
    pe = np.empty_like(x)
    pe[0::2] = np.sin(pos * angles(x.size))
    pe[1::2] = np.cos(pos * angles(x.size))
    return x + pe


rng = np.random.default_rng(0)
q, k = rng.normal(size=8), rng.normal(size=8)  # d = 8, tức 4 cặp
print(f"no position: q.k = {q @ k:.6f}")
print("   m     n  m-n     rotate        add")
for m, n in [(5, 2), (105, 102), (1005, 1002), (5, 3), (2, 5)]:
    s_rot = rope(q, m) @ rope(k, n)        # RoPE
    s_add = add_pos(q, m) @ add_pos(k, n)  # vị trí tuyệt đối, cộng vào
    print(f"{m:4d} {n:5d} {m - n:4d} {s_rot:10.6f} {s_add:10.6f}")
# xoay không đổi độ dài vectơ
print(f"|q| = {np.linalg.norm(q):.6f}")
print(f"|rope(q, 1000)| = {np.linalg.norm(rope(q, 1000)):.6f}")
