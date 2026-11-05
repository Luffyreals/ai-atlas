# Chi phí L^2 của attention, cửa sổ trượt, và mẹo đổi thứ tự nhân
import numpy as np

# Đếm cặp (i, j) phải tính điểm trong attention nhân quả, một đầu, một lớp
w = 512                                  # cỡ cửa sổ trượt
print("     L    full pairs  window pairs  ratio     GB")
for L in [512, 2048, 8192, 32768, 131072]:
    full = L * (L + 1) // 2              # mọi j <= i
    k = min(L, w)                        # hàng thứ k trở đi đủ w ô
    win = k * (k + 1) // 2 + (L - k) * w
    gb = L * L * 2 / 1e9                 # cả ma trận L x L, 2 byte mỗi số
    print(f"{L:6d} {full:13d} {win:13d} {full / win:6.1f} {gb:7.3f}")


def phi(x):
    # elu(x) + 1: luôn dương, như Katharopoulos và cộng sự (2020)
    return np.where(x > 0, x + 1, np.exp(x))


# Attention tuyến tính (không có mặt nạ): softmax thay bằng phi(q).phi(k)
rng = np.random.default_rng(0)
L, d = 1000, 16
Q, K, V = (rng.normal(size=(L, d)) for _ in range(3))
A = phi(Q) @ phi(K).T                    # ma trận L x L
out1 = (A @ V) / A.sum(axis=1, keepdims=True)
KV = phi(K).T @ V                        # chỉ d x d, không phụ thuộc L
z = phi(K).sum(axis=0)                   # vectơ d chiều
out2 = (phi(Q) @ KV) / (phi(Q) @ z)[:, None]
print("same output:", np.allclose(out1, out2))
print(f"multiplications: {2 * L * L * d:,} vs {2 * L * d * d:,}")
