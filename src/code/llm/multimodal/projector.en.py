# LLaVA-style patch embedding, projector and LLM sequence, small enough for CPU
import torch
from torch import nn

torch.manual_seed(0)
B, C, H, W, P = 2, 3, 224, 224, 14  # 2 images, 3 channels, 224x224, patch 14
D_v, D, L_text = 64, 128, 10        # image token dim, LLM dim, text tokens

# Two "pre-trained" parts, frozen as in LLaVA stage 1
patch_embed = nn.Conv2d(C, D_v, kernel_size=P, stride=P)  # toy encoder
text_embed = nn.Embedding(1000, D)  # stands in for the LLM embedding table
patch_embed.requires_grad_(False)
text_embed.requires_grad_(False)

# 1. Patch embedding: Conv2d with kernel = stride = P
img = torch.randn(B, C, H, W)
z = patch_embed(img).flatten(2).transpose(1, 2)    # (B, N, D_v)
print("image tokens:", tuple(z.shape))

# Same result when cutting patches (unfold) and multiplying by one matrix E
cols = nn.functional.unfold(img, kernel_size=P, stride=P).transpose(1, 2)
E = patch_embed.weight.flatten(1)                  # (D_v, C*P*P)
same = cols @ E.T + patch_embed.bias
print("conv == unfold + matmul:", torch.allclose(z, same, atol=1e-4))

# 2. Projector: two-layer MLP D_v -> D -> D (GELU is this lesson's choice)
projector = nn.Sequential(nn.Linear(D_v, D), nn.GELU(), nn.Linear(D, D))
h_v = projector(z)                                 # (B, N, D)

# 3. Image tokens go before the text token embeddings: one sequence for the LLM
ids = torch.randint(0, 1000, (B, L_text))
seq = torch.cat([h_v, text_embed(ids)], dim=1)
print("sequence for the LLM:", tuple(seq.shape))

# Dummy loss, only to see where the gradient reaches
seq.pow(2).mean().backward()
print("grad in projector:", projector[0].weight.grad is not None)
print("grad in patch_embed:", patch_embed.weight.grad is not None)
for name, m in [("patch_embed", patch_embed), ("projector", projector),
                ("text_embed", text_embed)]:
    n = sum(p.numel() for p in m.parameters())
    k = sum(p.numel() for p in m.parameters() if p.requires_grad)
    print(f"{name}: {n} params, {k} trainable")
