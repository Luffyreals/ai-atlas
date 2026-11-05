# GAN tí hon (MLP) trên ảnh chữ số 8x8, loss không bão hòa, chạy CPU
import numpy as np
import torch
from torch import nn
from torch.nn import functional as F
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression

torch.manual_seed(0)
digits = load_digits()
X = torch.tensor(digits.data / 8.0 - 1, dtype=torch.float32)  # về [-1, 1]
Z = 16  # số chiều của nhiễu z

G = nn.Sequential(nn.Linear(Z, 128), nn.ReLU(),
                  nn.Linear(128, 64), nn.Tanh())      # bộ sinh
D = nn.Sequential(nn.Linear(64, 128), nn.LeakyReLU(0.2),
                  nn.Linear(128, 1))                  # bộ phân biệt, ra logit
opt_g = torch.optim.Adam(G.parameters(), lr=2e-4, betas=(0.5, 0.999))
opt_d = torch.optim.Adam(D.parameters(), lr=2e-4, betas=(0.5, 0.999))
ones, zeros = torch.ones(64, 1), torch.zeros(64, 1)

for epoch in range(1, 101):
    for idx in torch.randperm(len(X)).split(64, drop_last=True)[:28]:
        real, fake = X[idx], G(torch.randn(64, Z))
        # Bước D: thật -> nhãn 1, giả -> nhãn 0 (detach: không sửa G)
        loss_d = (F.binary_cross_entropy_with_logits(D(real), ones)
                  + F.binary_cross_entropy_with_logits(
                      D(fake.detach()), zeros))
        opt_d.zero_grad()
        loss_d.backward()
        opt_d.step()
        # Bước G, không bão hòa: làm D(G(z)) gần 1, tức max log D(G(z))
        loss_g = F.binary_cross_entropy_with_logits(D(fake), ones)
        opt_g.zero_grad()
        loss_g.backward()
        opt_g.step()
    if epoch in (1, 10, 25, 50, 100):
        with torch.no_grad():
            p_real = torch.sigmoid(D(real)).mean().item()
            p_fake = torch.sigmoid(D(fake)).mean().item()
        print(f"epoch {epoch:3d}  loss D {loss_d.item():.3f}  loss G "
              f"{loss_g.item():.3f}  D(real) {p_real:.2f}"
              f"  D(fake) {p_fake:.2f}")

# Ảnh giả thuộc chữ số nào? Hỏi một bộ phân loại học trên ảnh thật
clf = LogisticRegression(max_iter=2000).fit(X.numpy(), digits.target)
with torch.no_grad():
    samples = G(torch.randn(1000, Z)).numpy()
print("digits among 1000 fakes:",
      np.bincount(clf.predict(samples), minlength=10))
