import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LinearRegression

# Bảng 10 căn hộ (dữ liệu minh họa, tự tạo cho bài học).
# area: diện tích (m²), rent: giá thuê (triệu đồng/tháng).
# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])

# scikit-learn nhận X dạng bảng: m hàng (mẫu), n cột (đặc trưng). Ở đây n = 1.
X = area.reshape(-1, 1)
model = LinearRegression().fit(X, rent)  # tự thêm hệ số tự do b
print(f"sklearn: w = {model.coef_[0]:.4f}, b = {model.intercept_:.4f}")

# Đối chiếu với công thức một đặc trưng ở phần Lý thuyết.
dx = area - area.mean()
dy = rent - rent.mean()
w = np.sum(dx * dy) / np.sum(dx**2)
b = rent.mean() - w * area.mean()
print(f"formula: w = {w:.4f}, b = {b:.4f}")

# Dự đoán hai căn mới: 65 m² (trong vùng dữ liệu) và 300 m² (xa ngoài vùng).
new_area = np.array([[65], [300]])
for a, p in zip(new_area[:, 0], model.predict(new_area)):
    print(f"{a} m² -> {p:.2f}")

# Vẽ dữ liệu và đường tốt nhất, chỉ trong vùng có dữ liệu.
xs = np.array([[20], [90]])
plt.scatter(area, rent, label="apartments")
plt.plot(xs, model.predict(xs), color="C1", label="best line")
plt.xlabel("Area (m²)")
plt.ylabel("Rent (million VND/month)")
plt.legend()
plt.show()
