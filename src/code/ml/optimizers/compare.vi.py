import numpy as np

c = np.array([1.0, 100.0])  # độ cong theo w1 và w2: thung lũng hẹp


def run(name, eta, scale=1.0, beta1=0.9, beta2=0.999, rho=0.99, eps=1e-8):
    w = np.array([-8.0, 1.5])  # điểm xuất phát
    v, s = np.zeros(2), np.zeros(2)  # moment 1 và moment 2
    for t in range(1, 1001):
        g = scale * c * w  # gradient của scale * 0.5 * (w1^2 + 100 w2^2)
        if name == "GD":
            w = w - eta * g
        elif name == "Momentum":
            v = beta1 * v + g  # vận tốc: cộng dồn gradient cũ
            w = w - eta * v
        elif name == "RMSProp":
            s = rho * s + (1 - rho) * g**2  # trung bình bình phương
            w = w - eta * g / (np.sqrt(s) + eps)
        else:  # Adam
            v = beta1 * v + (1 - beta1) * g
            s = beta2 * s + (1 - beta2) * g**2
            v_hat = v / (1 - beta1**t)  # hiệu chỉnh độ lệch
            s_hat = s / (1 - beta2**t)
            w = w - eta * v_hat / (np.sqrt(s_hat) + eps)
        dist = np.linalg.norm(w)  # khoảng cách tới đáy (0, 0)
        if dist < 0.01 or dist > 1e6:
            break
    status = "diverged" if dist > 1e6 else f"{t:4d} steps"
    return status, scale * 0.5 * np.sum(c * w**2)  # L lúc dừng


settings = [("GD", 0.018), ("Momentum", 0.018),
            ("RMSProp", 0.1), ("Adam", 0.1)]
for scale in [1.0, 10.0]:  # scale = 10: thung lũng dốc gấp 10 lần
    print(f"scale = {scale:.0f}")
    for name, eta in settings:
        status, loss = run(name, eta, scale)
        print(f"  {name:8s} eta = {eta}: {status}, L = {loss:.1e}")
