import matplotlib.pyplot as plt
import numpy as np

c = np.array([1.0, 100.0])  # L = 0.5 * (w1^2 + 100 w2^2), như ô trên


def path(name, eta, steps=100, beta1=0.9, beta2=0.999, rho=0.99):
    w, v, s = np.array([-8.0, 1.5]), np.zeros(2), np.zeros(2)
    points = [w]
    for t in range(1, steps + 1):
        g = c * w
        if name == "GD":
            step = g
        elif name == "Momentum":
            v = beta1 * v + g
            step = v
        elif name == "RMSProp":
            s = rho * s + (1 - rho) * g**2
            step = g / (np.sqrt(s) + 1e-8)
        else:  # Adam, có hiệu chỉnh độ lệch
            v = beta1 * v + (1 - beta1) * g
            s = beta2 * s + (1 - beta2) * g**2
            step = (v / (1 - beta1**t)) / (np.sqrt(s / (1 - beta2**t)) + 1e-8)
        w = w - eta * step
        points.append(w)
    return np.array(points)


fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))
W1, W2 = np.meshgrid(np.linspace(-9, 3, 300), np.linspace(-2, 2, 300))
levels = np.geomspace(0.05, 150, 12)  # các mức của L, cách đều theo log
ax1.contour(W1, W2, 0.5 * (W1**2 + 100 * W2**2), levels, colors="0.8")
for name, eta in [("GD", 0.018), ("Momentum", 0.018),
                  ("RMSProp", 0.1), ("Adam", 0.1)]:
    p = path(name, eta)
    loss = 0.5 * (p[:, 0]**2 + 100 * p[:, 1]**2)  # L tại từng bước
    ax1.plot(p[:, 0], p[:, 1], ".-", ms=3, lw=1, label=name)
    ax2.semilogy(loss, label=name)
    print(f"{name:8s}: L after 100 steps = {loss[-1]:.1e}")
ax1.plot(0, 0, "kx", ms=10)  # đáy
ax1.set(xlabel="w1", ylabel="w2", title="Paths, 100 steps")
ax2.set(xlabel="step", ylabel="loss", title="Loss (log scale)")
ax1.legend(loc="lower left")
plt.show()
