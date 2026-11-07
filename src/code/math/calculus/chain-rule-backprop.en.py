# Initial input values, target label, and parameters
x = 2.0
y = 7.0
w = 1.5
b = 0.5

# Forward pass: L = (w * x + b - y)^2
y_hat = w * x + b
loss = (y_hat - y) ** 2

# Backward pass step-by-step using Chain Rule
dL_dyhat = 2.0 * (y_hat - y)
dyhat_dw = x
dyhat_db = 1.0

# Combine gradients via chain rule: dL/dw = (dL/dy_hat) * (dy_hat/dw)
dL_dw = dL_dyhat * dyhat_dw
dL_db = dL_dyhat * dyhat_db

# Direct analytical gradients for verification comparison
direct_dL_dw = 2.0 * (w * x + b - y) * x
direct_dL_db = 2.0 * (w * x + b - y)

# Print comparison between backpropagation and direct derivatives
print(f"Prediction (y_hat) : {y_hat:.4f}")
print(f"Loss (L)           : {loss:.4f}")
print(f"dL/dw (chain rule) : {dL_dw:.4f}")
print(f"dL/dw (direct)     : {direct_dL_dw:.4f}")
print(f"dL/db (chain rule) : {dL_db:.4f}")
print(f"dL/db (direct)     : {direct_dL_db:.4f}")
