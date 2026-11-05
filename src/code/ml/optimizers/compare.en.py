import numpy as np

c = np.array([1.0, 100.0])  # curvature along w1 and w2: a narrow valley


def run(name, eta, scale=1.0, beta1=0.9, beta2=0.999, rho=0.99, eps=1e-8):
    w = np.array([-8.0, 1.5])  # starting point
    v, s = np.zeros(2), np.zeros(2)  # first and second moment
    for t in range(1, 1001):
        g = scale * c * w  # gradient of scale * 0.5 * (w1^2 + 100 w2^2)
        if name == "GD":
            w = w - eta * g
        elif name == "Momentum":
            v = beta1 * v + g  # velocity: accumulates past gradients
            w = w - eta * v
        elif name == "RMSProp":
            s = rho * s + (1 - rho) * g**2  # mean of squares
            w = w - eta * g / (np.sqrt(s) + eps)
        else:  # Adam
            v = beta1 * v + (1 - beta1) * g
            s = beta2 * s + (1 - beta2) * g**2
            v_hat = v / (1 - beta1**t)  # bias correction
            s_hat = s / (1 - beta2**t)
            w = w - eta * v_hat / (np.sqrt(s_hat) + eps)
        dist = np.linalg.norm(w)  # distance to the minimum (0, 0)
        if dist < 0.01 or dist > 1e6:
            break
    status = "diverged" if dist > 1e6 else f"{t:4d} steps"
    return status, scale * 0.5 * np.sum(c * w**2)  # L when stopping


settings = [("GD", 0.018), ("Momentum", 0.018),
            ("RMSProp", 0.1), ("Adam", 0.1)]
for scale in [1.0, 10.0]:  # scale = 10: valley walls 10 times steeper
    print(f"scale = {scale:.0f}")
    for name, eta in settings:
        status, loss = run(name, eta, scale)
        print(f"  {name:8s} eta = {eta}: {status}, L = {loss:.1e}")
