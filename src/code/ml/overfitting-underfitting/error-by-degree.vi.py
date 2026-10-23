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

degrees = range(1, 16)
mse_train, mse_test = [], []
print(" d  train   test")
for d in degrees:
    model = make_pipeline(PolynomialFeatures(d, include_bias=False),
                          LinearRegression())
    model.fit(x_train[:, None], y_train)
    tr = mean_squared_error(y_train, model.predict(x_train[:, None]))
    te = mean_squared_error(y_test, model.predict(x_test[:, None]))
    mse_train.append(tr)
    mse_test.append(te)
    print(f"{d:2d} {tr:.4f} {te:.4f}")

plt.plot(degrees, mse_train, "o-", color="k", label="MSE train")
plt.plot(degrees, mse_test, "o--", color="C0", mfc="none",
         label="MSE test")
# MSE test từ bậc 11 lớn hơn 0.4 nên nằm ngoài khung hình.
plt.ylim(0, 0.4)
plt.xlabel("Polynomial degree d")
plt.ylabel("MSE")
plt.legend()
plt.show()
