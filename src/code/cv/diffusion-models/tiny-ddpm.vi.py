import torch
from sklearn.datasets import make_moons
from torch import nn

torch.manual_seed(0)
# Dữ liệu thật: 2000 điểm hình hai nửa vầng trăng, chuẩn hóa về trung bình 0
x, _ = make_moons(2000, noise=0.05, random_state=0)
data = torch.tensor(x, dtype=torch.float32)
data = (data - data.mean(0)) / data.std(0)

# T = 100 bước nên beta lớn hơn DDPM gốc 10 lần: 1e-3 tới 0.2
T = 100
betas = torch.linspace(1e-3, 0.2, T)
alphas = 1 - betas
abar = torch.cumprod(alphas, 0)

# eps_theta(x_t, t): MLP nhận (x, y, t / T), trả về nhiễu dự đoán (2 số)
net = nn.Sequential(nn.Linear(3, 128), nn.ReLU(), nn.Linear(128, 128),
                    nn.ReLU(), nn.Linear(128, 128), nn.ReLU(),
                    nn.Linear(128, 2))
eps_theta = lambda xt, t: net(torch.cat([xt, t[:, None] / T], 1))
opt = torch.optim.Adam(net.parameters(), lr=1e-3)

for step in range(5001):  # Thuật toán 1 của DDPM
    x0 = data[torch.randint(0, len(data), (256,))]
    t = torch.randint(0, T, (256,))  # chỉ số 0..T-1 ứng với bước 1..T
    eps = torch.randn_like(x0)
    a = abar[t][:, None]
    xt = a.sqrt() * x0 + (1 - a).sqrt() * eps
    loss = ((eps - eps_theta(xt, t)) ** 2).mean()  # L_simple
    opt.zero_grad()
    loss.backward()
    opt.step()
    if step % 1000 == 0:
        print(f"step {step:4d}  loss {loss.item():.3f}")

with torch.no_grad():  # Thuật toán 2: đi ngược từ nhiễu thuần
    noise = torch.randn(1000, 2)
    x = noise.clone()
    for i in reversed(range(T)):
        t = torch.full((1000,), i)
        e = eps_theta(x, t)
        x = (x - betas[i] / (1 - abar[i]).sqrt() * e) / alphas[i].sqrt()
        if i > 0:
            x = x + betas[i].sqrt() * torch.randn_like(x)

# Khoảng cách từ mỗi điểm tới điểm thật gần nhất
gap = lambda p: torch.cdist(p, data).min(1).values
for name, p in [("noise x_T", noise), ("samples x_0", x)]:
    d = gap(p)
    print(f"{name}: mean dist {d.mean():.3f}, "
          f"within 0.1: {(d < 0.1).float().mean():.0%}")
