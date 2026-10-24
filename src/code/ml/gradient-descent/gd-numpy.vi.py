import numpy as np

# Bảng 10 căn hộ (dữ liệu minh họa, tự tạo cho bài học).
# area: diện tích (m²), rent: giá thuê (triệu đồng/tháng).
# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])
m = len(area)

# Chuẩn hóa min-max: diện tích về đoạn [0, 1], giữ nguyên giá thuê.
lo, span = area.min(), area.max() - area.min()  # 25 và 60
x = (area - lo) / span
X = np.column_stack([x, np.ones(m)])  # thêm cột số 1 cho b

eta = 0.3  # tốc độ học
theta = np.zeros(2)  # điểm xuất phát: w~ = 0, b~ = 0
for step in range(10_000):  # tiêu chí dừng 1: số bước tối đa
    grad = 2 / m * X.T @ (X @ theta - rent)  # gradient của MSE
    if np.linalg.norm(grad) < 1e-6:  # tiêu chí dừng 2: gradient rất nhỏ
        break
    theta = theta - eta * grad  # quy tắc cập nhật
w_s, b_s = theta  # w~, b~ trên diện tích đã chuẩn hóa
print(f"stopped after {step} steps")
print(f"scaled: w~ = {w_s:.4f}, b~ = {b_s:.4f}")

# Đổi về đơn vị gốc: w~ (x - 25) / 60 + b~ = w x + b.
w = w_s / span
b = b_s - lo * w
mse = np.mean((w * area + b - rent) ** 2)
print(f"GD:     w = {w:.4f}, b = {b:.4f}, MSE = {mse:.4f}")

# Đối chiếu với phương trình chuẩn của bài trước, trên diện tích thô.
A = np.column_stack([area, np.ones(m)])
w_ne, b_ne = np.linalg.solve(A.T @ A, A.T @ rent)
mse_ne = np.mean((w_ne * area + b_ne - rent) ** 2)
print(f"normal: w = {w_ne:.4f}, b = {b_ne:.4f}, MSE = {mse_ne:.4f}")
