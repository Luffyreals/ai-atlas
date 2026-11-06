import numpy as np
from sklearn.linear_model import LogisticRegression

# 18 sinh viên (dữ liệu tự tạo): số giờ ôn thi và kết quả (1 = đậu).
hours = np.array([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5,
                  5, 5.5, 6, 6.5, 7, 7.5, 8, 9, 10])
passed = np.array([0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1])


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def log_loss(p, y):  # binary cross-entropy, trung bình trên m mẫu
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))


w, b, eta = 0.0, 0.0, 0.2  # xuất phát từ 0, tốc độ học 0.2
for step in range(100_000):
    p = sigmoid(w * hours + b)  # y^ = P(đậu | số giờ)
    grad_w = np.mean((p - passed) * hours)  # dL/dw
    grad_b = np.mean(p - passed)  # dL/db
    if np.hypot(grad_w, grad_b) < 1e-6:  # gradient đủ nhỏ thì dừng
        break
    w, b = w - eta * grad_w, b - eta * grad_b
print(f"GD stopped after {step} steps")
print(f"GD: w = {w:.3f}, b = {b:.3f}, log loss = {log_loss(p, passed):.4f}")
print(f"threshold -b/w = {-b / w:.3f} h, odds ratio e^w = {np.exp(w):.2f}")
for h in [2, 4, 6, 8]:
    print(f"P(pass | {h} h) = {sigmoid(w * h + b):.3f}")

# scikit-learn: C rất lớn nghĩa là gần như không phạt (xem bài).
model = LogisticRegression(C=1e10).fit(hours.reshape(-1, 1), passed)
w_sk, b_sk = model.coef_[0, 0], model.intercept_[0]
print(f"sklearn: w = {w_sk:.3f}, b = {b_sk:.3f}")
print(f"sklearn P(pass | 4 h) = {model.predict_proba([[4]])[0, 1]:.3f}")
