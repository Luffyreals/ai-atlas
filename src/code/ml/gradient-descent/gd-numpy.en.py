import numpy as np

# The 10-apartment table (made-up data for the lesson).
# area: floor area (m²), rent: monthly rent (million VND).
# dataset: apartments
area = np.array([25, 30, 36, 42, 48, 55, 60, 68, 75, 85])
rent = np.array([6.7, 6.5, 8.8, 8.8, 9.4, 12.2, 12.0, 14.1, 13.9, 16.8])
m = len(area)

# Min-max scaling: area onto [0, 1], rent left as it is.
lo, span = area.min(), area.max() - area.min()  # 25 and 60
x = (area - lo) / span
X = np.column_stack([x, np.ones(m)])  # a column of ones for b

eta = 0.3  # learning rate
theta = np.zeros(2)  # starting point: w~ = 0, b~ = 0
for step in range(10_000):  # stopping criterion 1: a maximum number of steps
    grad = 2 / m * X.T @ (X @ theta - rent)  # gradient of the MSE
    if np.linalg.norm(grad) < 1e-6:  # stopping criterion 2: tiny gradient
        break
    theta = theta - eta * grad  # the update rule
w_s, b_s = theta  # w~, b~ on the scaled area
print(f"stopped after {step} steps")
print(f"scaled: w~ = {w_s:.4f}, b~ = {b_s:.4f}")

# Back to original units: w~ (x - 25) / 60 + b~ = w x + b.
w = w_s / span
b = b_s - lo * w
mse = np.mean((w * area + b - rent) ** 2)
print(f"GD:     w = {w:.4f}, b = {b:.4f}, MSE = {mse:.4f}")

# Compare with the normal equation of the previous lesson, on the raw area.
A = np.column_stack([area, np.ones(m)])
w_ne, b_ne = np.linalg.solve(A.T @ A, A.T @ rent)
mse_ne = np.mean((w_ne * area + b_ne - rent) ** 2)
print(f"normal: w = {w_ne:.4f}, b = {b_ne:.4f}, MSE = {mse_ne:.4f}")
