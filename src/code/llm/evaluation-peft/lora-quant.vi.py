# Đếm tham số LoRA, rồi đo sai số của lượng tử hóa absmax
import numpy as np


def lora_params(d_in, d_out, r):
    return r * (d_in + d_out)  # A: r x d_in, B: d_out x r


D = 4096  # một ma trận D x D
for r in [1, 8, 64]:
    n = lora_params(D, D, r)
    print(f"r = {r:2d}: {n:6d} of {D * D} ({100 * n / D**2:.2f}%)")
# GPT-3 175B: 96 lớp, LoRA trên W_q và W_v, r = 4, D = 12288
print(f"GPT-3, r = 4: {96 * 2 * lora_params(12288, 12288, 4)}")


def absmax(W, bits):
    q_max = 2 ** (bits - 1) - 1  # 127 với 8 bit, 7 với 4 bit
    s = q_max / np.abs(W).max()  # hệ số co giãn
    # np.clip không cắt gì, chỉ để an toàn
    W_int = np.clip(np.round(s * W), -q_max, q_max)  # số nguyên
    return W_int / s, 1 / (2 * s)  # giải lượng tử, cận sai số


rng = np.random.default_rng(0)
W = rng.normal(0, 1, size=(256, 256)).astype(np.float32)
print(f"max |W| = {np.abs(W).max():.3f}")
for bits in [8, 4]:
    W_hat, bound = absmax(W, bits)
    err = np.abs(W_hat - W)
    rmse = np.sqrt(np.mean(err**2))
    print(f"int{bits}: rmse {rmse:.4f}, max {err.max():.4f}, "
          f"bound {bound:.4f}, zeros {np.mean(W_hat == 0):.1%}")

# Thêm một giá trị ngoại lai bằng 40, đo trên các phần tử còn lại
W[0, 0] = 40.0
for bits in [8, 4]:
    W_hat, bound = absmax(W, bits)
    err = (W_hat - W).ravel()[1:]  # bỏ chính ngoại lai
    rmse = np.sqrt(np.mean(err**2))
    zeros = np.mean(W_hat.ravel()[1:] == 0)
    print(f"outlier, int{bits}: rmse {rmse:.4f}, bound {bound:.4f}, "
          f"zeros {zeros:.1%}")
