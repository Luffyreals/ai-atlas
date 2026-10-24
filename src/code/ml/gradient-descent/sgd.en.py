import numpy as np
from sklearn.linear_model import SGDRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import MinMaxScaler

# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])
m, lo, span = len(area), area.min(), area.max() - area.min()
X = np.column_stack([(area - lo) / span, np.ones(m)])  # min-max, ones


def minibatch_gd(batch_size, eta=0.1, epochs=100, seed=0):
    rng = np.random.default_rng(seed)
    theta = np.zeros(2)
    for _ in range(epochs):  # each epoch: shuffle, cut into m // batch_size
        for idx in np.array_split(rng.permutation(m), m // batch_size):
            Xb, yb = X[idx], rent[idx]
            theta = theta - eta * 2 / len(idx) * Xb.T @ (Xb @ theta - yb)
    w = theta[0] / span  # back to original units
    return np.mean((X @ theta - rent) ** 2), w, theta[1] - lo * w


for size in [10, 2, 1]:  # 10 = m: batch GD; 1: SGD
    mse, w, b = minibatch_gd(size)
    print(f"batch {size:2d}: MSE = {mse:.4f}, w = {w:.4f}, b = {b:.2f}")

A = area.reshape(-1, 1)  # scikit-learn needs a 2-D table
sgd = SGDRegressor(random_state=0).fit(A, rent)  # defaults, raw area
mse = np.mean((sgd.predict(A) - rent) ** 2)
print(f"default, raw area: MSE = {mse:.1e}, n_iter_ = {sgd.n_iter_}")

sgd = SGDRegressor(penalty=None, learning_rate="constant", eta0=0.05,
                   max_iter=1000, tol=None, random_state=0)
scaler = MinMaxScaler()
model = make_pipeline(scaler, sgd).fit(A, rent)
w = sgd.coef_[0] * scaler.scale_[0]  # back to original units
b = sgd.intercept_[0] + sgd.coef_[0] * scaler.min_[0]
mse = np.mean((model.predict(A) - rent) ** 2)
print(f"min-max + constant: MSE = {mse:.4f}, w = {w:.4f}, b = {b:.2f}")
