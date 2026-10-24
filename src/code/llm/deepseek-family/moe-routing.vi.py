# Định tuyến top-K kiểu DeepSeek-V3 và cân bằng tải bằng bias
import numpy as np

rng = np.random.default_rng(0)
B, N, K = 64, 8, 2  # số token trong lô, số expert định tuyến, số expert chọn
logits = rng.normal(size=(B, N))  # u^T e_i của từng token với từng expert
logits[:, 0] += 1.0  # cố ý cho expert 0 được router "chuộng" hơn
s = 1 / (1 + np.exp(-logits))  # điểm khớp bằng sigmoid, như V3


def route(s, bias, k):
    # Chọn top-k theo s + bias, nhưng trọng số cổng lấy từ s gốc
    picked = np.argsort(-(s + bias), axis=1)[:, :k]
    mask = np.zeros_like(s, dtype=bool)
    np.put_along_axis(mask, picked, True, axis=1)
    gate = np.where(mask, s, 0.0)
    return mask, gate / gate.sum(axis=1, keepdims=True)


bias = np.zeros(N)
gamma = 0.01  # tốc độ cập nhật bias (paper dùng 0.001)
for step in range(200):
    mask, gate = route(s, bias, K)
    load = mask.sum(axis=0)  # số token mỗi expert nhận
    if step in (0, 199):
        print(f"step {step:3d} load:", load)
    # Bản đơn giản: quá tải (trên trung bình) thì giảm, thiếu tải thì tăng
    bias -= gamma * np.sign(load - load.mean())

print("bias:", np.round(bias, 2))
print("gates of token 0:", np.round(gate[0][mask[0]], 3))
print("experts per token:", mask.sum(axis=1).min(), mask.sum(axis=1).max())
