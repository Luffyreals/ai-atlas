import numpy as np
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

# 24 điểm tự sinh từ y = sin(2πx) cộng nhiễu: 16 điểm train, 8 điểm test.
# dataset: sine-train
x_train = np.array([0.03, 0.12, 0.15, 0.23, 0.26, 0.35, 0.41, 0.47, 0.51, 0.6, 0.64, 0.73, 0.77, 0.85, 0.9, 0.98])
y_train = np.array([0.15, 1.06, 0.84, 0.96, 0.83, 0.94, 0.3, -0.09, -0.17, -0.32, -0.68, -0.84, -0.28, -0.82, -0.53, -0.02])
# dataset: sine-test
x_test = np.array([0.06, 0.18, 0.32, 0.43, 0.55, 0.67, 0.8, 0.94])
y_test = np.array([0.33, 0.66, 0.93, 0.43, -0.42, -1.11, -1.18, -0.45])

m = len(x_train)  # 16 điểm train
for lam in [1e-12, 1e-8, 1e-3, 1e-1, 10]:
    # Ridge của scikit-learn không chia tổng bình phương cho m,
    # nên phải đặt alpha = m * lambda để khớp hàm mục tiêu của bài.
    model = make_pipeline(PolynomialFeatures(15, include_bias=False),
                          StandardScaler(), Ridge(alpha=m * lam))
    model.fit(x_train[:, None], y_train)  # chỉ học từ tập train
    tr = mean_squared_error(y_train, model.predict(x_train[:, None]))
    te = mean_squared_error(y_test, model.predict(x_test[:, None]))
    w = model[-1].coef_  # 15 trọng số của các đặc trưng đã chuẩn hóa
    b = model[-1].intercept_  # hệ số tự do, không bị phạt
    print(f"lambda = {lam:g}: MSE train = {tr:.4f}, test = {te:.4f}, "
          f"max |w| = {np.abs(w).max():.2f}, b = {b:.4f}")
