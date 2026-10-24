# Lấy mẫu token kế tiếp: softmax có nhiệt độ, rồi top-k hoặc top-p.
import numpy as np

# Ngữ cảnh: "Hôm nay trời rất ___". Mười token ứng viên, logit giảm dần.
tokens = ["đẹp", "nóng", "lạnh", "mát", "nắng",
          "oi", "trong", "xanh", "ẩm", "tối"]
# logits: next-token
z = np.array([3.0, 2.6, 2.0, 1.5, 1.1, 0.6, 0.1, -0.4, -1.0, -1.6])


def softmax_t(z, T):
    a = z / T
    e = np.exp(a - a.max())  # trừ max để exp không bị tràn số
    return e / e.sum()


def keep_and_renormalize(p, keep):
    q = np.zeros_like(p)
    q[keep] = p[keep]  # token bị loại có xác suất 0
    return q / q.sum()  # chuẩn hóa lại cho tổng bằng 1


def top_k(p, k):
    order = np.argsort(p)[::-1]  # chỉ số theo xác suất giảm dần
    return keep_and_renormalize(p, order[:k])


def top_p(p, threshold):
    order = np.argsort(p)[::-1]
    cum = np.cumsum(p[order])
    n = np.searchsorted(cum, threshold) + 1  # tập nhỏ nhất có tổng >= p
    return keep_and_renormalize(p, order[:n])


for T in [0.5, 1.0, 1.5]:
    p = softmax_t(z, T)
    kept = np.count_nonzero(top_p(p, 0.9))
    print(f"T = {T}: top 3 = {np.round(p[:3], 3)}, top-p 0.9 keeps {kept}")

print("top-k 3, T = 1:", np.round(top_k(softmax_t(z, 1.0), 3)[:4], 3))
p = top_p(softmax_t(z, 1.0), 0.9)
rng = np.random.default_rng(0)
counts = np.bincount(rng.choice(10, size=1000, p=p), minlength=10)
for i, tok in enumerate(tokens):
    print(f"{tok:>6}: p = {p[i]:.3f}, drawn {counts[i]}")
