import numpy as np

# The 10 apartments (example data, made up for the lesson).
# area: floor area (m²), rent: rent (million VND/month).
# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])

# Design matrix X: the area column, plus a column of ones for the bias b.
m = len(area)
X = np.column_stack([area, np.ones(m)])

# Normal equation: (X^T X) theta = X^T y.
# np.linalg.solve solves the system directly, without computing an inverse.
theta = np.linalg.solve(X.T @ X, X.T @ rent)
w, b = theta  # same order as the columns of X

# MSE: the mean of the squared residuals.
y_hat = X @ theta
mse = np.mean((y_hat - rent) ** 2)

print(f"b = {b:.4f}")
print(f"w = {w:.4f}")
print(f"MSE = {mse:.4f}")
