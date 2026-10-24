# Bộ nhớ để phục vụ một LLM chỉ có decoder: trọng số + KV cache
GIB = 1024**3

# Số kiến trúc của Llama 3 (bảng 3 của paper), từ vựng V = 128 000
CFG = {
    "8B": dict(layers=32, dim=4096, ffn=14336, heads=32, kv=8),
    "70B": dict(layers=80, dim=8192, ffn=28672, heads=64, kv=8),
}
V = 128_000


def n_params(c):
    dh = c["dim"] // c["heads"]  # số chiều mỗi đầu
    attn = 2 * c["dim"] ** 2 + 2 * c["dim"] * c["kv"] * dh  # Wq, Wo, Wk, Wv
    ffn = 3 * c["dim"] * c["ffn"]  # SwiGLU: 3 ma trận
    return c["layers"] * (attn + ffn) + 2 * V * c["dim"]  # + nhúng, đầu ra


def kv_bytes(c, L, B, s=2):
    dh = c["dim"] // c["heads"]
    return 2 * c["layers"] * c["kv"] * dh * s * L * B  # s byte mỗi số


for name, c in CFG.items():
    p = n_params(c)
    w = [p * s / GIB for s in (2, 1, 0.5)]  # BF16, int8, int4
    print(f"{name}: {p / 1e9:.2f}B params, weights "
          f"{w[0]:.1f} / {w[1]:.1f} / {w[2]:.1f} GiB")
    for L, B in [(8192, 1), (8192, 16), (32768, 16)]:
        kv = kv_bytes(c, L, B) / GIB
        print(f"  KV cache L={L:>5}, B={B:>2}: {kv:6.1f} GiB")

c = CFG["8B"]
mha = dict(c, kv=32)  # giả sử mỗi đầu truy vấn có K, V riêng
print(f"8B, 32 K/V heads, L=8192: {kv_bytes(mha, 8192, 1) / GIB:.1f} GiB")
free = 80e9 - n_params(c) * 2  # GPU 80 GB trừ trọng số BF16
print("8B on 80 GB, max B at L=8192:", int(free // kv_bytes(c, 8192, 1)))
