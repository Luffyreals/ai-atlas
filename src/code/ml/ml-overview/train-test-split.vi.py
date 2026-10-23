import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor

# Bảng 10 căn hộ (dữ liệu minh họa, tự tạo cho bài học).
# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])
X = area.reshape(-1, 1)

# Giữ lại 30% (3 căn) làm tập test. Mô hình không được thấy chúng.
X_train, X_test, y_train, y_test = train_test_split(
    X, rent, test_size=0.3, random_state=4)
print(f"test: {X_test[:, 0]} m²")

line = LinearRegression()
# Mô hình "học thuộc": đoán bằng giá của căn train có diện tích gần nhất.
memo = KNeighborsRegressor(n_neighbors=1)
for name, model in [("line", line), ("memorize", memo)]:
    model.fit(X_train, y_train)  # chỉ học từ tập train
    mse_train = mean_squared_error(y_train, model.predict(X_train))
    mse_test = mean_squared_error(y_test, model.predict(X_test))
    print(f"{name}: MSE train = {mse_train:.4f}, test = {mse_test:.4f}")

# Tập test chỉ có 3 căn: chia kiểu khác là điểm số đổi theo.
for seed in [8, 2]:
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, rent, test_size=0.3, random_state=seed)
    mse = [mean_squared_error(y_te, m.fit(X_tr, y_tr).predict(X_te))
           for m in (line, memo)]
    print(f"seed {seed}: test {X_te[:, 0]}, "
          f"line {mse[0]:.4f}, memorize {mse[1]:.4f}")
