import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsClassifier

# Bảng 10 căn hộ (dữ liệu minh họa, tự tạo cho bài học).
# area: diện tích (m²), rent: giá thuê (triệu đồng/tháng).
# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])

# Đầu vào X: m = 10 hàng (mẫu), n = 1 cột (đặc trưng).
X = area.reshape(-1, 1)
new = np.array([[40], [65]])  # hai căn mới, chưa có trong bảng

# Hồi quy: nhãn là một con số (giá thuê).
reg = LinearRegression()
reg.fit(X, rent)  # học từ 10 ví dụ
for a, p in zip(new[:, 0], reg.predict(new)):
    print(f"regression: {a} m² -> {p:.2f}")

# Phân loại: cùng đầu vào, nhưng nhãn là "đắt" (từ 10 triệu) hay "rẻ".
label = np.where(rent >= 10, "expensive", "cheap")

# Mô hình này xem 3 căn có diện tích gần nhất, rồi theo số đông.
clf = KNeighborsClassifier(n_neighbors=3)
clf.fit(X, label)  # vẫn hai bước: fit rồi predict
for a, p in zip(new[:, 0], clf.predict(new)):
    print(f"classification: {a} m² -> {p}")
