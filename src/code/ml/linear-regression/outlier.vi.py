import matplotlib.pyplot as plt
import numpy as np

# Bảng 10 căn hộ (dữ liệu minh họa, tự tạo cho bài học).
# area: diện tích (m²), rent: giá thuê (triệu đồng/tháng).
# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])


def fit(x, y):
    # np.linalg.lstsq giải bình phương tối thiểu thẳng trên X, không lập X^T X.
    X = np.column_stack([x, np.ones(len(x))])
    w, b = np.linalg.lstsq(X, y)[0]
    return w, b


# Thêm căn 110 m², lớn hơn mọi căn khác, nhưng giá bị gõ nhầm 19.0 thành 9.0.
area_out = np.append(area, 110)
rent_out = np.append(rent, 9.0)

w1, b1 = fit(area, rent)
w2, b2 = fit(area_out, rent_out)
print(f"without outlier: w = {w1:.4f}, b = {b1:.2f}")
print(f"with outlier:    w = {w2:.4f}, b = {b2:.2f}")

# Vẽ hai đường để so sánh.
xs = np.array([20, 115])
plt.scatter(area, rent, label="apartments")
plt.scatter([110], [9.0], color="C3", marker="x", s=80, label="outlier")
plt.plot(xs, w1 * xs + b1, color="C1", label="without outlier")
plt.plot(xs, w2 * xs + b2, color="C3", linestyle="--", label="with outlier")
plt.xlabel("Area (m²)")
plt.ylabel("Rent (million VND/month)")
plt.legend()
plt.show()
