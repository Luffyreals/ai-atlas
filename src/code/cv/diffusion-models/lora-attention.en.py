import torch
from torch import nn

torch.manual_seed(0)


class LoRALinear(nn.Module):
    """h = W0 x + (alpha / r) B A x, W0 đóng băng."""

    def __init__(self, base, r=4, alpha=4):
        super().__init__()
        self.base = base.requires_grad_(False)
        self.A = nn.Parameter(torch.randn(r, base.in_features) * 0.01)
        self.B = nn.Parameter(torch.zeros(base.out_features, r))  # B = 0
        self.scale = alpha / r

    def forward(self, x):
        return self.base(x) + self.scale * (x @ self.A.T) @ self.B.T


def attention(d, ctx):
    # Bốn phép chiếu của một lớp attention trong U-Net của Stable Diffusion
    # v1: q từ ảnh (d chiều), k và v từ chữ (ctx chiều), out về lại d chiều
    return nn.ModuleDict({"to_q": nn.Linear(d, d, bias=False),
                          "to_k": nn.Linear(ctx, d, bias=False),
                          "to_v": nn.Linear(ctx, d, bias=False),
                          "to_out": nn.Linear(d, d)})


def count(d, ctx):
    att = attention(d, ctx)
    full = sum(p.numel() for p in att.parameters())
    for name in list(att.keys()):
        att[name] = LoRALinear(att[name])
    lora = sum(p.numel() for p in att.parameters() if p.requires_grad)
    return att, full, lora


att, full, lora = count(320, 768)  # cross-attention ở tầng 320 kênh
print(f"cross-attn d=320: full {full}, LoRA r=4: {lora}")
x = torch.randn(2, 4096, 320)  # 64 x 64 vị trí của latent, 2 ảnh
print("same output at init:",
      torch.equal(att["to_q"](x), att["to_q"].base(x)))

# U-Net SD v1 có 16 khối Transformer, mỗi khối 1 self-attn (ctx = d)
# và 1 cross-attn (ctx = 768). Số kênh d của 16 khối:
widths = [320] * 2 + [640] * 2 + [1280] * 2 + [1280] + \
         [1280] * 3 + [640] * 3 + [320] * 3
total = sum(count(d, d)[2] + count(d, 768)[2] for d in widths)
print(f"LoRA r=4 on all 32 attention layers: {total}")
print(f"share of an 860M U-Net: {total / 860e6:.3%}")
