# Tiny VAE (MLP) on 8x8 digit images from scikit-learn, runs on CPU
import torch
from torch import nn
from torch.nn import functional as F
from sklearn.datasets import load_digits

torch.manual_seed(0)
X = torch.tensor(load_digits().data / 16.0, dtype=torch.float32)
J = 2  # latent dimension of z


class VAE(nn.Module):
    def __init__(self):
        super().__init__()
        self.enc = nn.Sequential(nn.Linear(64, 128), nn.ReLU())
        self.mu = nn.Linear(128, J)
        self.logvar = nn.Linear(128, J)  # predict log sigma^2 for stability
        self.dec = nn.Sequential(nn.Linear(J, 128), nn.ReLU(),
                                 nn.Linear(128, 64))  # outputs logits

    def forward(self, x):
        h = self.enc(x)
        mu, logvar = self.mu(h), self.logvar(h)
        eps = torch.randn_like(mu)
        z = mu + torch.exp(0.5 * logvar) * eps  # reparameterization
        return self.dec(z), mu, logvar


model = VAE()
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
for epoch in range(1, 61):
    tot_rec = tot_kl = 0.0
    for idx in torch.randperm(len(X)).split(64):
        x = X[idx]
        logits, mu, logvar = model(x)
        # Reconstruction: binary cross-entropy per pixel, summed over 64 pixels
        rec = F.binary_cross_entropy_with_logits(
            logits, x, reduction="sum") / len(x)
        # Closed-form KL against N(0, I), averaged over the batch
        kl = 0.5 * (mu**2 + logvar.exp() - 1 - logvar).sum() / len(x)
        loss = rec + kl  # = -ELBO
        opt.zero_grad()
        loss.backward()
        opt.step()
        tot_rec += rec.item() * len(x)
        tot_kl += kl.item() * len(x)
    if epoch in (1, 5, 10, 20, 40, 60):
        print(f"epoch {epoch:2d}  recon {tot_rec / len(X):6.2f}"
              f"  KL {tot_kl / len(X):5.2f}")

# Sample a new image: draw z from N(0, I) and pass through the decoder
with torch.no_grad():
    img = torch.sigmoid(model.dec(torch.randn(1, J)))[0].view(8, 8)
for row in img:
    print("".join(" .:-=+*#"[int(v * 7.99)] for v in row))
