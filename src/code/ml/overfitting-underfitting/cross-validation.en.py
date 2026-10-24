import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import KFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

# 24 points made from y = sin(2πx) plus noise: 16 training, 8 test points.
# dataset: sine-train
x_train = np.array([0.03, 0.12, 0.15, 0.23, 0.26, 0.35, 0.41, 0.47, 0.51, 0.6, 0.64, 0.73, 0.77, 0.85, 0.9, 0.98])
y_train = np.array([0.15, 1.06, 0.84, 0.96, 0.83, 0.94, 0.3, -0.09, -0.17, -0.32, -0.68, -0.84, -0.28, -0.82, -0.53, -0.02])
# dataset: sine-test
x_test = np.array([0.06, 0.18, 0.32, 0.43, 0.55, 0.67, 0.8, 0.94])
y_test = np.array([0.33, 0.66, 0.93, 0.43, -0.42, -1.11, -1.18, -0.45])


def poly(d):
    return make_pipeline(PolynomialFeatures(d, include_bias=False),
                         LinearRegression())


# Split the 16 training points into 4 folds of 4. The test set is unused.
cv = KFold(n_splits=4, shuffle=True, random_state=0)
cv_mse = {}
for d in range(1, 11):
    scores = cross_val_score(poly(d), x_train[:, None], y_train, cv=cv,
                             scoring="neg_mean_squared_error")
    cv_mse[d] = -scores.mean()  # the score is minus the MSE: flip the sign
    print(f"degree {d:2d}: CV MSE = {cv_mse[d]:.4f}")

best = min(cv_mse, key=cv_mse.get)
print(f"best degree: {best}")
# Only now refit on the whole training set, then score the test set once.
model = poly(best).fit(x_train[:, None], y_train)
te = mean_squared_error(y_test, model.predict(x_test[:, None]))
print(f"test MSE: {te:.4f}")
