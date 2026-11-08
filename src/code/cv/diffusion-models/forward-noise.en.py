import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_digits

# Image x_0: first digit (a 0), scaled from [0, 16] to [-1, 1] as in DDPM
x0 = load_digits().images[0] / 8.0 - 1.0

# DDPM linear schedule: beta_1 = 1e-4 to beta_T = 0.02, T = 1000
T = 1000
betas = np.linspace(1e-4, 0.02, T)
alpha_bar = np.cumprod(1.0 - betas)  # alpha_bar[t - 1] corresponds to step t

rng = np.random.default_rng(0)
eps = rng.standard_normal(x0.shape)  # one shared noise array across all t

ts = [0, 100, 250, 500, 1000]
fig, axes = plt.subplots(1, len(ts), figsize=(10, 2.4))
for ax, t in zip(axes, ts):
    ab = 1.0 if t == 0 else alpha_bar[t - 1]  # t = 0: original image
    xt = np.sqrt(ab) * x0 + np.sqrt(1 - ab) * eps  # closed form
    print(f"t={t:4d}  sqrt(ab)={np.sqrt(ab):.4f}  "
          f"sqrt(1-ab)={np.sqrt(1 - ab):.4f}")
    ax.imshow(xt, cmap="gray", vmin=-2.5, vmax=2.5)
    ax.set_title(f"t = {t}")
    ax.axis("off")
plt.show()

# Verify closed form: add noise step by step, 20000 trials, for pixel x0 = 1
x = np.ones(20000)
for b in betas[:500]:
    x = np.sqrt(1 - b) * x + np.sqrt(b) * rng.standard_normal(x.size)
print(f"step by step, t=500: mean={x.mean():.4f}  std={x.std():.4f}")
print(f"closed form,  t=500: mean={np.sqrt(alpha_bar[499]):.4f}  "
      f"std={np.sqrt(1 - alpha_bar[499]):.4f}")
