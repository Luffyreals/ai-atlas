import numpy as np

# Feature matrix X (4 samples, 2 features) and target labels y_true
X = np.array([[1.0, 2.0], [2.0, 1.0], [3.0, 4.0], [4.0, 3.0]])
y_true = np.array([5.0, 4.0, 11.0, 10.0])

# Weight vector w and scalar bias b
w = np.array([2.0, 1.0])
b = 0.5

# 1. Vectorized matrix multiplication: y_hat = X @ w + b (with broadcasting)
y_hat = X @ w + b

# 2. Compute mean squared error over the entire batch in one step
errors = y_hat - y_true
mse = np.mean(errors ** 2)

print(f"Matrix X shape: {X.shape}")
print(f"Predictions y_hat: {y_hat}")
print(f"Sample errors: {np.round(errors, 3)}")
print(f"Mean Squared Error: {mse:.4f}")
