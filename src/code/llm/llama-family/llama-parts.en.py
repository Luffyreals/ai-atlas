# Three pieces of a LLaMA block in PyTorch: RMSNorm, SwiGLU, RoPE
import torch
import torch.nn as nn

torch.manual_seed(0)


class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-6):
        super().__init__()
        self.eps = eps
        self.g = nn.Parameter(torch.ones(dim))  # learnable gain

    def forward(self, x):  # no mean subtraction, divide by RMS
        rms = (x.pow(2).mean(-1, keepdim=True) + self.eps).sqrt()
        return x / rms * self.g


class SwiGLU(nn.Module):
    def __init__(self, dim, hidden):
        super().__init__()
        self.w1 = nn.Linear(dim, hidden, bias=False)  # gate, via Swish (silu)
        self.w3 = nn.Linear(dim, hidden, bias=False)  # linear branch
        self.w2 = nn.Linear(hidden, dim, bias=False)  # project back to dim

    def forward(self, x):
        return self.w2(nn.functional.silu(self.w1(x)) * self.w3(x))


def rope(x, base=10000.0):
    # x: (batch, L, heads, d); positions are 0..L-1 along axis 1
    _, L, _, d = x.shape
    theta = base ** (-torch.arange(0, d, 2) / d)       # (d/2,)
    ang = torch.arange(L)[:, None] * theta             # (L, d/2)
    cos, sin = ang.cos()[:, None, :], ang.sin()[:, None, :]
    x1, x2 = x[..., 0::2], x[..., 1::2]                # adjacent pairs
    out = torch.empty_like(x)
    out[..., 0::2] = x1 * cos - x2 * sin
    out[..., 1::2] = x1 * sin + x2 * cos
    return out


D = 48
x = torch.randn(2, 5, D) * 7                 # 2 sequences, L = 5 tokens
norm = RMSNorm(D)
rms = norm(x).pow(2).mean(-1).sqrt()[0].tolist()
print("RMS after norm:", [round(r, 4) for r in rms])
print("norm(3x) == norm(x):", torch.allclose(norm(3 * x), norm(x)))
mlp = nn.Sequential(nn.Linear(D, 4 * D, bias=False), nn.GELU(),
                    nn.Linear(4 * D, D, bias=False))  # two-matrix FFN
ffn = sum(p.numel() for p in mlp.parameters())
glu = sum(p.numel() for p in SwiGLU(D, 2 * 4 * D // 3).parameters())
print(f"params: FFN 4D = {ffn}, SwiGLU 2/3*4D = {glu}")
# same q and same k at every position: score (m, n) depends on m - n
q = torch.randn(1, 1, 1, 8).expand(1, 5, 1, 8)
k = torch.randn(1, 1, 1, 8).expand(1, 5, 1, 8)
scores = rope(q)[0, :, 0] @ rope(k)[0, :, 0].T   # row m, column n
for row in scores.tolist():
    print(" ".join(f"{v:6.2f}" for v in row))
