# Debugging a tiny language model: initial loss, overfit one batch, NaN
import math

import torch
import torch.nn as nn
import torch.nn.functional as F

torch.manual_seed(0)
V, L, D = 14, 16, 32  # vocabulary size, sequence length, width


class Tiny(nn.Module):  # embedding, one masked attention layer, output
    def __init__(self):
        super().__init__()
        self.emb, self.pos = nn.Embedding(V, D), nn.Embedding(L, D)
        self.att = nn.MultiheadAttention(D, 4, batch_first=True)
        self.out = nn.Linear(D, V)

    def forward(self, x):
        n = x.size(1)
        h = self.emb(x) + self.pos(torch.arange(n))
        mask = torch.triu(torch.ones(n, n), 1).bool()  # True: blocked
        a, _ = self.att(h, h, h, attn_mask=mask, need_weights=False)
        return self.out(h + a)


def loss_fn(model, batch):  # shifted labels: read 0..L-2, predict 1..L-1
    logits = model(batch[:, :-1])
    return F.cross_entropy(logits.reshape(-1, V), batch[:, 1:].reshape(-1))


batch = torch.randint(0, V, (4, L))  # 4 random sequences: memory test
model = Tiny()
print("first two tokens:", batch[:, :2].tolist())
print(f"ln V = {math.log(V):.3f}  start loss = {loss_fn(model, batch):.3f}")

opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
for step in range(201):  # train on the same batch again and again
    opt.zero_grad()
    loss = loss_fn(model, batch)
    if not torch.isfinite(loss):  # stop at the first NaN or inf
        raise RuntimeError(f"loss = {loss.item()} at step {step}")
    loss.backward()
    # norm before clipping
    norm = nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    opt.step()
    if step % 50 == 0:
        print(f"step {step:3d}  loss {loss:.4f}  grad norm {norm:.2f}")

# Bug 1: every label is -100 (say the answer was cut off): 0 denominator
bad = torch.full((4 * (L - 1),), -100)
print("all labels -100:", F.cross_entropy(torch.randn(4 * (L - 1), V), bad))

# Bug 2, on purpose: sqrt at 0 has an infinite derivative, 0 * inf = nan
x = torch.zeros(3, requires_grad=True)
try:
    with torch.autograd.detect_anomaly():  # slow: only when debugging
        (torch.sqrt(x) * 0).sum().backward()
except RuntimeError as err:
    print("anomaly:", str(err).splitlines()[0])
