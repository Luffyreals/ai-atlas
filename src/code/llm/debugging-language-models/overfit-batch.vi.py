# Debug một mô hình ngôn ngữ nhỏ: loss khởi đầu, overfit một batch, NaN
import math

import torch
import torch.nn as nn
import torch.nn.functional as F

torch.manual_seed(0)
V, L, D = 14, 16, 32  # cỡ từ vựng, độ dài chuỗi, số chiều


class Tiny(nn.Module):  # embedding, một lớp attention có mặt nạ, đầu ra
    def __init__(self):
        super().__init__()
        self.emb, self.pos = nn.Embedding(V, D), nn.Embedding(L, D)
        self.att = nn.MultiheadAttention(D, 4, batch_first=True)
        self.out = nn.Linear(D, V)

    def forward(self, x):
        n = x.size(1)
        h = self.emb(x) + self.pos(torch.arange(n))
        mask = torch.triu(torch.ones(n, n), 1).bool()  # True: cấm nhìn
        a, _ = self.att(h, h, h, attn_mask=mask, need_weights=False)
        return self.out(h + a)


def loss_fn(model, batch):  # dịch nhãn: đọc token 0..L-2, đoán 1..L-1
    logits = model(batch[:, :-1])
    return F.cross_entropy(logits.reshape(-1, V), batch[:, 1:].reshape(-1))


batch = torch.randint(0, V, (4, L))  # 4 chuỗi ngẫu nhiên: chỉ để thử nhớ
model = Tiny()
print("first two tokens:", batch[:, :2].tolist())
print(f"ln V = {math.log(V):.3f}  start loss = {loss_fn(model, batch):.3f}")

opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
for step in range(201):  # học đi học lại đúng một batch
    opt.zero_grad()
    loss = loss_fn(model, batch)
    if not torch.isfinite(loss):  # dừng ngay khi gặp NaN hoặc inf
        raise RuntimeError(f"loss = {loss.item()} at step {step}")
    loss.backward()
    # chuẩn trước khi cắt
    norm = nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    opt.step()
    if step % 50 == 0:
        print(f"step {step:3d}  loss {loss:.4f}  grad norm {norm:.2f}")

# Lỗi 1: mọi nhãn là -100 (ví dụ đáp án bị cắt mất), mẫu số bằng 0
bad = torch.full((4 * (L - 1),), -100)
print("all labels -100:", F.cross_entropy(torch.randn(4 * (L - 1), V), bad))

# Lỗi 2, cố ý: sqrt tại 0 có đạo hàm vô cùng, 0 * inf = nan
x = torch.zeros(3, requires_grad=True)
try:
    with torch.autograd.detect_anomaly():  # chậm: chỉ bật khi tìm lỗi
        (torch.sqrt(x) * 0).sum().backward()
except RuntimeError as err:
    print("anomaly:", str(err).splitlines()[0])
