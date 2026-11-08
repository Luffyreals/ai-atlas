import torch
from torch import nn

torch.manual_seed(0)


class LoRALinear(nn.Module):
    """h = W0 x + (alpha / r) B A x, W0 đóng băng."""  # data: vi

    def __init__(self, base, r=4, alpha=4):
        super().__init__()
        self.base = base.requires_grad_(False)
        self.A = nn.Parameter(torch.randn(r, base.in_features) * 0.01)
        self.B = nn.Parameter(torch.zeros(base.out_features, r))  # B = 0
        self.scale = alpha / r

    def forward(self, x):
        return self.base(x) + self.scale * (x @ self.A.T) @ self.B.T


def attention(d, ctx):
    # Four projections of an attention layer in Stable Diffusion v1 U-Net:
    # q from image (d dims), k and v from text (ctx dims), out back to d dims
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


att, full, lora = count(320, 768)  # cross-attention at a 320-channel stage
print(f"cross-attn d=320: full {full}, LoRA r=4: {lora}")
x = torch.randn(2, 4096, 320)  # 64 x 64 latent positions, batch of 2 images
print("same output at init:",
      torch.equal(att["to_q"](x), att["to_q"].base(x)))

# SD v1 U-Net has 16 Transformer blocks, each with 1 self-attn (ctx = d)
# and 1 cross-attn (ctx = 768). Channel widths d across the 16 blocks:
widths = [320] * 2 + [640] * 2 + [1280] * 2 + [1280] + \
         [1280] * 3 + [640] * 3 + [320] * 3
total = sum(count(d, d)[2] + count(d, 768)[2] for d in widths)
print(f"LoRA r=4 on all 32 attention layers: {total}")
print(f"share of an 860M U-Net: {total / 860e6:.3%}")
