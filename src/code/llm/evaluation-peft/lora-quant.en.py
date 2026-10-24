# Count LoRA parameters, then measure the error of absmax quantization
import numpy as np


def lora_params(d_in, d_out, r):
    return r * (d_in + d_out)  # A: r x d_in, B: d_out x r


D = 4096  # one D x D matrix
for r in [1, 8, 64]:
    n = lora_params(D, D, r)
    print(f"r = {r:2d}: {n:6d} of {D * D} ({100 * n / D**2:.2f}%)")
# GPT-3 175B: 96 layers, LoRA on W_q and W_v, r = 4, D = 12288
print(f"GPT-3, r = 4: {96 * 2 * lora_params(12288, 12288, 4)}")


def absmax(W, bits):
    q_max = 2 ** (bits - 1) - 1  # 127 for 8 bits, 7 for 4 bits
    s = q_max / np.abs(W).max()  # scale
    # np.clip never clips here, just a guard
    W_int = np.clip(np.round(s * W), -q_max, q_max)  # integers
    return W_int / s, 1 / (2 * s)  # dequantized, error bound


rng = np.random.default_rng(0)
W = rng.normal(0, 1, size=(256, 256)).astype(np.float32)
print(f"max |W| = {np.abs(W).max():.3f}")
for bits in [8, 4]:
    W_hat, bound = absmax(W, bits)
    err = np.abs(W_hat - W)
    rmse = np.sqrt(np.mean(err**2))
    print(f"int{bits}: rmse {rmse:.4f}, max {err.max():.4f}, "
          f"bound {bound:.4f}, zeros {np.mean(W_hat == 0):.1%}")

# Add one outlier equal to 40, measure on the other elements
W[0, 0] = 40.0
for bits in [8, 4]:
    W_hat, bound = absmax(W, bits)
    err = (W_hat - W).ravel()[1:]  # leave out the outlier itself
    rmse = np.sqrt(np.mean(err**2))
    zeros = np.mean(W_hat.ravel()[1:] == 0)
    print(f"outlier, int{bits}: rmse {rmse:.4f}, bound {bound:.4f}, "
          f"zeros {zeros:.1%}")
