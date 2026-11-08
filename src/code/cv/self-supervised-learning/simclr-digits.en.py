import torch
from torch import nn
import torch.nn.functional as F
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

torch.manual_seed(0)
X, y = load_digits(return_X_y=True)  # labels y used only for linear probing
X = torch.tensor(X / 16.0, dtype=torch.float32).view(-1, 1, 8, 8)

def augment(x):  # shift up to 1 pixel, add noise, mask a 3x3 square
    n = len(x)
    theta = torch.tensor([[1.0, 0, 0], [0, 1.0, 0]]).repeat(n, 1, 1)
    theta[:, :, 2] = (torch.rand(n, 2) - 0.5) * 0.5
    grid = F.affine_grid(theta, list(x.shape), align_corners=False)
    x = F.grid_sample(x, grid, align_corners=False)
    x = x + 0.1 * torch.randn_like(x)
    r, c = torch.randint(0, 6, (2, n, 1, 1, 1))
    i, j = torch.arange(8).view(8, 1), torch.arange(8).view(1, 8)
    hole = (i >= r) & (i < r + 3) & (j >= c) & (j < c + 3)
    return x.masked_fill(hole, 0.0)

def encoder():  # f: 8x8 image -> 16-dimensional representation h
    return nn.Sequential(nn.Flatten(), nn.Linear(64, 256), nn.ReLU(),
                         nn.Linear(256, 16))

def nt_xent(z, tau=0.5):  # rows i and i + n are two views of the same image
    z = F.normalize(z, dim=1)
    s = (z @ z.T / tau).fill_diagonal_(float("-inf"))
    n = len(z) // 2
    pos = torch.cat([torch.arange(n, 2 * n), torch.arange(n)])
    return F.cross_entropy(s, pos)

random_f, f = encoder(), encoder()
head = nn.Sequential(nn.Linear(16, 64), nn.ReLU(), nn.Linear(64, 32))
opt = torch.optim.Adam([*f.parameters(), *head.parameters()], lr=1e-3)
for epoch in range(40):  # train without labels
    for idx in torch.randperm(len(X)).split(256):
        views = torch.cat([augment(X[idx]), augment(X[idx])])
        loss = nt_xent(head(f(views)))
        opt.zero_grad()
        loss.backward()
        opt.step()
print(f"last NT-Xent loss: {loss.item():.3f}")

# Linear probe: freeze f and train only logistic regression on h
tr, te = train_test_split(range(len(y)), test_size=0.5,
                          random_state=0, stratify=y)
for n_labels in [100, len(tr)]:
    for name, enc in [("random", random_f), ("SimCLR", f)]:
        with torch.no_grad():
            h = enc(X).numpy()
        probe = make_pipeline(StandardScaler(),
                              LogisticRegression(max_iter=2000))
        probe.fit(h[tr[:n_labels]], y[tr[:n_labels]])
        acc = probe.score(h[te], y[te])
        print(f"{n_labels} labels, {name} encoder: {acc:.3f}")
