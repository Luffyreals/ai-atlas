import numpy as np
from sklearn.linear_model import Lasso, Ridge
from sklearn.metrics import mean_squared_error
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

# 24 points made from y = sin(2πx) plus noise: 16 training, 8 test points.
# dataset: sine-train
x_train = np.array([0.03, 0.12, 0.15, 0.23, 0.26, 0.35, 0.41, 0.47, 0.51, 0.6, 0.64, 0.73, 0.77, 0.85, 0.9, 0.98])
y_train = np.array([0.15, 1.06, 0.84, 0.96, 0.83, 0.94, 0.3, -0.09, -0.17, -0.32, -0.68, -0.84, -0.28, -0.82, -0.53, -0.02])
# dataset: sine-test
x_test = np.array([0.06, 0.18, 0.32, 0.43, 0.55, 0.67, 0.8, 0.94])
y_test = np.array([0.33, 0.66, 0.93, 0.43, -0.42, -1.11, -1.18, -0.45])


def fit(model):
    # Degree-15 polynomial, standardized features, then a penalized model.
    pipe = make_pipeline(PolynomialFeatures(15, include_bias=False),
                         StandardScaler(), model)
    return pipe.fit(x_train[:, None], y_train)


for lam in [1e-3, 1e-2, 1e-1]:
    # scikit-learn's Lasso puts 1/2 in front of the MSE: alpha = lambda / 2.
    model = fit(Lasso(alpha=lam / 2, max_iter=100_000, tol=1e-6))
    tr = mean_squared_error(y_train, model.predict(x_train[:, None]))
    te = mean_squared_error(y_test, model.predict(x_test[:, None]))
    w = model[-1].coef_
    kept = np.flatnonzero(w) + 1  # the power k of each nonzero weight
    print(f"lambda = {lam:g}: MSE train = {tr:.4f}, test = {te:.4f}")
    print(f"  zeros = {np.sum(w == 0)}/15, kept k = {kept.tolist()}")

# Compare: Ridge at the same lambda = 0.001 sets no weight exactly to 0.
w = fit(Ridge(alpha=len(x_train) * 1e-3))[-1].coef_
print(f"ridge 0.001: zeros = {np.sum(w == 0)}/15, "
      f"min |w| = {np.abs(w).min():.2f}")
