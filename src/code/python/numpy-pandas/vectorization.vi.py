import numpy as np

# Tạo ma trận đặc trưng X (4 mẫu, 2 đặc trưng) và nhãn y_true
X = np.array([[1.0, 2.0], [2.0, 1.0], [3.0, 4.0], [4.0, 3.0]])
y_true = np.array([5.0, 4.0, 11.0, 10.0])

# Khởi tạo vector trọng số w và hệ số chệch bias b
w = np.array([2.0, 1.0])
b = 0.5

# 1. Nhân ma trận vector hóa: y_hat = X @ w + b (kết hợp broadcasting)
y_hat = X @ w + b

# 2. Tính sai số toàn bộ tập dữ liệu trong một phép toán
errors = y_hat - y_true
mse = np.mean(errors ** 2)

print(f"Matrix X shape: {X.shape}")
print(f"Predictions y_hat: {y_hat}")
print(f"Sample errors: {np.round(errors, 3)}")
print(f"Mean Squared Error: {mse:.4f}")
