# Patch embedding, projector và chuỗi cho LLM kiểu LLaVA, cỡ nhỏ chạy CPU
import torch
from torch import nn

torch.manual_seed(0)
B, C, H, W, P = 2, 3, 224, 224, 14  # 2 ảnh, 3 kênh, 224x224, patch 14x14
D_v, D, L_text = 64, 128, 10        # chiều token ảnh, chiều LLM, số token chữ

# Hai phần "đã huấn luyện sẵn", đóng băng như giai đoạn 1 của LLaVA
patch_embed = nn.Conv2d(C, D_v, kernel_size=P, stride=P)  # thay bộ mã hóa
text_embed = nn.Embedding(1000, D)  # thay bảng embedding của LLM
patch_embed.requires_grad_(False)
text_embed.requires_grad_(False)

# 1. Patch embedding: Conv2d với kernel = stride = P
img = torch.randn(B, C, H, W)
z = patch_embed(img).flatten(2).transpose(1, 2)    # (B, N, D_v)
print("image tokens:", tuple(z.shape))

# Cùng kết quả khi cắt patch (unfold) rồi nhân một ma trận E
cols = nn.functional.unfold(img, kernel_size=P, stride=P).transpose(1, 2)
E = patch_embed.weight.flatten(1)                  # (D_v, C*P*P)
same = cols @ E.T + patch_embed.bias
print("conv == unfold + matmul:", torch.allclose(z, same, atol=1e-4))

# 2. Projector: MLP hai lớp D_v -> D -> D (GELU là lựa chọn của bài)
projector = nn.Sequential(nn.Linear(D_v, D), nn.GELU(), nn.Linear(D, D))
h_v = projector(z)                                 # (B, N, D)

# 3. Token ảnh đứng trước embedding của token chữ: một chuỗi cho LLM
ids = torch.randint(0, 1000, (B, L_text))
seq = torch.cat([h_v, text_embed(ids)], dim=1)
print("sequence for the LLM:", tuple(seq.shape))

# Loss giả, chỉ để xem gradient đi tới đâu
seq.pow(2).mean().backward()
print("grad in projector:", projector[0].weight.grad is not None)
print("grad in patch_embed:", patch_embed.weight.grad is not None)
for name, m in [("patch_embed", patch_embed), ("projector", projector),
                ("text_embed", text_embed)]:
    n = sum(p.numel() for p in m.parameters())
    k = sum(p.numel() for p in m.parameters() if p.requires_grad)
    print(f"{name}: {n} params, {k} trainable")
