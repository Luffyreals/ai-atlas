import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

# 24 điểm tự sinh từ y = sin(2πx) cộng nhiễu: 16 điểm train, 8 điểm test.
# dataset: sine-train
x_train = np.array([0.03, 0.12, 0.15, 0.23, 0.26, 0.35, 0.41, 0.47, 0.51, 0.6, 0.64, 0.73, 0.77, 0.85, 0.9, 0.98])
y_train = np.array([0.15, 1.06, 0.84, 0.96, 0.83, 0.94, 0.3, -0.09, -0.17, -0.32, -0.68, -0.84, -0.28, -0.82, -0.53, -0.02])
# dataset: sine-test
x_test = np.array([0.06, 0.18, 0.32, 0.43, 0.55, 0.67, 0.8, 0.94])
y_test = np.array([0.33, 0.66, 0.93, 0.43, -0.42, -1.11, -1.18, -0.45])

xs = np.linspace(0, 1, 201)  # lưới x dày để vẽ đường cong cho mượt
plt.scatter(x_train, y_train, color="k", zorder=3, label="train")
plt.scatter(x_test, y_test, facecolors="none", edgecolors="C0",
            zorder=3, label="test")
for d, style, color in [(1, ":", "C1"), (3, "-", "C2"), (15, "--", "C3")]:
    # Biến x thành các cột x, x^2, ..., x^d, rồi hồi quy tuyến tính.
    model = make_pipeline(PolynomialFeatures(d, include_bias=False),
                          LinearRegression())
    model.fit(x_train[:, None], y_train)  # chỉ học từ tập train
    tr = mean_squared_error(y_train, model.predict(x_train[:, None]))
    te = mean_squared_error(y_test, model.predict(x_test[:, None]))
    print(f"degree {d:2d}: MSE train = {tr:.4f}, test = {te:.4f}")
    plt.plot(xs, model.predict(xs[:, None]), style, color=color,
             label=f"degree {d}")

# Đa thức bậc 15 vọt rất xa ở hai mép: cắt trục y cho dễ nhìn.
plt.ylim(-2, 2)
plt.xlabel("x")
plt.ylabel("y")
plt.legend()
plt.show()
