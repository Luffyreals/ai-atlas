import math
import torch
import torch.nn as nn
import torch.nn.functional as F

USE_POS = True  # đổi thành False để thử nghiệm không có vị trí


def sinusoidal(L, d):
    pos = torch.arange(L).unsqueeze(1)
    i = torch.arange(0, d, 2).unsqueeze(0)
    angle = pos / (10000 ** (i / d))
    P = torch.zeros(L, d)
    P[:, 0::2] = torch.sin(angle)
    P[:, 1::2] = torch.cos(angle)
    return P


class SortTransformer(nn.Module):
    def __init__(self, d=64, h=4, num_layers=2):
        super().__init__()
        self.d = d
        self.embed = nn.Embedding(10, d)
        self.register_buffer("pe", sinusoidal(8, d))
        layer = nn.TransformerEncoderLayer(
            d_model=d, nhead=h, dim_feedforward=128,
            norm_first=True, batch_first=True,
        )
        self.encoder = nn.TransformerEncoder(
            layer, num_layers=num_layers, enable_nested_tensor=False
        )
        self.out = nn.Linear(d, 10)

    def forward(self, x):
        h = self.embed(x) * math.sqrt(self.d)
        if USE_POS:
            h = h + self.pe
        return self.out(self.encoder(h))


torch.manual_seed(0)
model = SortTransformer()
opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
for step in range(1001):
    x = torch.randint(0, 10, (64, 8))
    y = torch.sort(x, dim=1).values
    loss = F.cross_entropy(model(x).reshape(-1, 10), y.reshape(-1))
    opt.zero_grad()
    loss.backward()
    opt.step()
    if step % 500 == 0:
        print(f"step {step:4d}: loss = {loss.item():.4f}")

torch.manual_seed(42)
x_test = torch.randint(0, 10, (1000, 8))
y_test = torch.sort(x_test, dim=1).values
model.eval()
with torch.no_grad():
    pred = model(x_test).argmax(dim=-1)
    tok_acc = (pred == y_test).float().mean().item()
    seq_acc = (pred == y_test).all(dim=1).float().mean().item()
print(f"token acc = {tok_acc:.3f}, sequence acc = {seq_acc:.3f}")
