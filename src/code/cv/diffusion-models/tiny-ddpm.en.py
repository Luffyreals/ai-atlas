import torch
from sklearn.datasets import make_moons
from torch import nn

torch.manual_seed(0)
# Real data: 2000 two-moons points, standardized to zero mean and unit std
x, _ = make_moons(2000, noise=0.05, random_state=0)
data = torch.tensor(x, dtype=torch.float32)
data = (data - data.mean(0)) / data.std(0)

# T = 100 steps, so beta is 10x larger than original DDPM: 1e-3 to 0.2
T = 100
betas = torch.linspace(1e-3, 0.2, T)
alphas = 1 - betas
abar = torch.cumprod(alphas, 0)

# eps_theta(x_t, t): MLP taking (x, y, t / T) and predicting noise (2 numbers)
net = nn.Sequential(nn.Linear(3, 128), nn.ReLU(), nn.Linear(128, 128),
                    nn.ReLU(), nn.Linear(128, 128), nn.ReLU(),
                    nn.Linear(128, 2))
eps_theta = lambda xt, t: net(torch.cat([xt, t[:, None] / T], 1))
opt = torch.optim.Adam(net.parameters(), lr=1e-3)

for step in range(5001):  # DDPM Algorithm 1
    x0 = data[torch.randint(0, len(data), (256,))]
    t = torch.randint(0, T, (256,))  # index 0..T-1 corresponds to step 1..T
    eps = torch.randn_like(x0)
    a = abar[t][:, None]
    xt = a.sqrt() * x0 + (1 - a).sqrt() * eps
    loss = ((eps - eps_theta(xt, t)) ** 2).mean()  # L_simple
    opt.zero_grad()
    loss.backward()
    opt.step()
    if step % 1000 == 0:
        print(f"step {step:4d}  loss {loss.item():.3f}")

with torch.no_grad():  # Algorithm 2: reverse process from pure noise
    noise = torch.randn(1000, 2)
    x = noise.clone()
    for i in reversed(range(T)):
        t = torch.full((1000,), i)
        e = eps_theta(x, t)
        x = (x - betas[i] / (1 - abar[i]).sqrt() * e) / alphas[i].sqrt()
        if i > 0:
            x = x + betas[i].sqrt() * torch.randn_like(x)

# Distance from each point to the nearest real data point
gap = lambda p: torch.cdist(p, data).min(1).values
for name, p in [("noise x_T", noise), ("samples x_0", x)]:
    d = gap(p)
    print(f"{name}: mean dist {d.mean():.3f}, "
          f"within 0.1: {(d < 0.1).float().mean():.0%}")
