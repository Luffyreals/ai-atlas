import matplotlib.pyplot as plt
import numpy as np

# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])
m = len(area)
x = (area - area.min()) / (area.max() - area.min())  # min-max


# Run GD from (0, 0). Return the MSE at steps 0, 1, ..., steps.
def mse_curve(feature, eta, steps):
    X = np.column_stack([feature, np.ones(m)])
    theta = np.zeros(2)
    curve = [np.mean((X @ theta - rent) ** 2)]
    for _ in range(steps):
        theta = theta - eta * 2 / m * X.T @ (X @ theta - rent)
        curve.append(np.mean((X @ theta - rent) ** 2))
    return curve


runs = [("raw", area, [3e-4, 3.3e-4]),  # left: raw area (m²)
        ("scaled", x, [0.05, 0.3, 0.7, 0.8, 0.85])]  # right: min-max
fig, axes = plt.subplots(1, 2, figsize=(9, 3.6), sharey=True)
for ax, (name, feature, etas) in zip(axes, runs):
    for eta in etas:
        curve = mse_curve(feature, eta, 100)
        ax.plot(curve, label=f"eta = {eta:g}")
        v = curve[-1]  # MSE after 100 steps; huge values print as 1.234e+05
        text = f"{v:.4f}" if v < 1e4 else f"{v:.3e}"
        print(f"{name}, eta = {eta:g}: {text}")
    ax.axhline(0.3615, color="k", ls=":")  # the smallest MSE
    ax.set(title=name, xlabel="Step", yscale="log", ylim=(0.1, 1e3))
    ax.legend()
axes[0].set_ylabel("MSE (log scale)")
fig.tight_layout()
long_run = mse_curve(area, 3e-4, 10_000)  # raw area, 10,000 steps
print(f"raw, eta = 0.0003, 10000 steps: {long_run[-1]:.4f}")
plt.show()
