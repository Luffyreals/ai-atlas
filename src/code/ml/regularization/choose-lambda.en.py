import numpy as np
from sklearn.linear_model import ElasticNet, Lasso, Ridge
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import KFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

# dataset: sine-train
x_train = np.array([0.03, 0.12, 0.15, 0.23, 0.26, 0.35, 0.41, 0.47, 0.51, 0.6, 0.64, 0.73, 0.77, 0.85, 0.9, 0.98])
y_train = np.array([0.15, 1.06, 0.84, 0.96, 0.83, 0.94, 0.3, -0.09, -0.17, -0.32, -0.68, -0.84, -0.28, -0.82, -0.53, -0.02])
# dataset: sine-test
x_test = np.array([0.06, 0.18, 0.32, 0.43, 0.55, 0.67, 0.8, 0.94])
y_test = np.array([0.33, 0.66, 0.93, 0.43, -0.42, -1.11, -1.18, -0.45])

# Ridge keeps alpha = 16 * lambda even in 12-point folds (as RidgeCV does).
makers = {
    "ridge": lambda lam: Ridge(alpha=len(x_train) * lam),
    "lasso": lambda lam: Lasso(alpha=lam / 2, max_iter=100_000, tol=1e-6),
    # lambda_1 = lambda_2 = lam: alpha = lam/2 + lam, l1_ratio = (lam/2)/alpha
    "enet": lambda lam: ElasticNet(alpha=1.5 * lam, l1_ratio=1 / 3,
                                   max_iter=100_000, tol=1e-6),
}
cv = KFold(n_splits=4, shuffle=True, random_state=0)  # training set only
for name, make in makers.items():
    # Lasso at 0.001 does not converge within the folds: start at 0.01.
    lams = 10.0 ** np.arange(-6, 2) if name == "ridge" else [0.01, 0.1]
    pipes, cv_mse = {}, {}
    for lam in lams:
        pipes[lam] = make_pipeline(PolynomialFeatures(15, include_bias=False),
                                   StandardScaler(), make(lam))
        scores = cross_val_score(pipes[lam], x_train[:, None], y_train,
                                 cv=cv, scoring="neg_mean_squared_error")
        cv_mse[lam] = -scores.mean()
        print(f"{name} lambda = {lam:g}: CV MSE = {cv_mse[lam]:.4f}")
    best = min(cv_mse, key=cv_mse.get)
    # Only then refit on the whole training set and score the test set once.
    model = pipes[best].fit(x_train[:, None], y_train)
    te = mean_squared_error(y_test, model.predict(x_test[:, None]))
    print(f"  best: lambda = {best:g}, test MSE = {te:.4f}, "
          f"zeros = {np.sum(model[-1].coef_ == 0)}")
