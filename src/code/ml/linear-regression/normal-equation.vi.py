import numpy as np

# Bảng 10 căn hộ (dữ liệu minh họa, tự tạo cho bài học).
# area: diện tích (m²), rent: giá thuê (triệu đồng/tháng).
# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])

# Ma trận thiết kế X: cột diện tích, thêm một cột toàn số 1 cho hệ số tự do b.
m = len(area)
X = np.column_stack([area, np.ones(m)])

# Phương trình chuẩn: (X^T X) theta = X^T y.
# np.linalg.solve giải thẳng hệ phương trình, không tính ma trận nghịch đảo.
theta = np.linalg.solve(X.T @ X, X.T @ rent)
w, b = theta  # thứ tự khớp với thứ tự cột của X

# MSE: trung bình bình phương phần dư.
y_hat = X @ theta
mse = np.mean((y_hat - rent) ** 2)

print(f"b = {b:.4f}")
print(f"w = {w:.4f}")
print(f"MSE = {mse:.4f}")
