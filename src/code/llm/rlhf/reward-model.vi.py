# RM tuyến tính học từ 6 cặp so sánh (loss Bradley-Terry)
import numpy as np

# Mỗi đáp án: (độ đúng từ 0 tới 1, độ dài tính theo trăm từ)
chosen = np.array([[0.9, 1.2], [0.8, 2.0], [0.7, 1.5],
                   [0.6, 2.5], [0.9, 0.6], [0.5, 1.8]])
rejected = np.array([[0.3, 0.8], [0.6, 1.0], [0.2, 1.4],
                     [0.7, 1.0], [0.4, 0.9], [0.5, 0.7]])
diff = chosen - rejected  # r_w - r_l = w . (phi_w - phi_l)


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def loss_and_grad(w):
    margin = diff @ w  # lề của từng cặp
    p = sigmoid(margin)  # xác suất mô hình đồng ý với người
    loss = -np.mean(np.log(p))
    grad = -np.mean((1 - p)[:, None] * diff, axis=0)
    return loss, grad


w = np.zeros(2)
loss, grad = loss_and_grad(w)
print(f"w = 0: loss {loss:.4f}, grad {np.round(grad, 4)}")

for step in range(1, 101):
    w -= 1.0 * loss_and_grad(w)[1]  # một bước gradient descent, eta = 1
    if step in (1, 10, 100):  # đo SAU khi cập nhật, bằng w mới
        loss = loss_and_grad(w)[0]
        acc = np.mean(diff @ w > 0)
        print(f"step {step:3d}: loss {loss:.4f}, acc {acc:.2f}, "
              f"w {np.round(w, 2)}")

good = np.array([0.9, 0.5])  # đúng, ngắn
bad = np.array([0.3, 3.0])  # sai, dài hơn mọi đáp án từng thấy
print(f"r(good) = {good @ w:.2f}, r(bad) = {bad @ w:.2f}")
print(f"P(bad > good) = {sigmoid(bad @ w - good @ w):.3f}")
