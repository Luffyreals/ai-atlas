import numpy as np

# Sample objective function f(x) = x0^2 + 3*x0*x1 + 2*x1^2
def f(x):
    return x[0]**2 + 3.0 * x[0] * x[1] + 2.0 * x[1]**2

# Analytical gradient derived mathematically
def grad_analytical(x):
    df_dx0 = 2.0 * x[0] + 3.0 * x[1]
    df_dx1 = 3.0 * x[0] + 4.0 * x[1]
    return np.array([df_dx0, df_dx1])

# Numerical gradient using symmetric central differences
def grad_numerical(func, x, eps=1e-5):
    grad = np.zeros_like(x)
    for i in range(len(x)):
        x_plus, x_minus = x.copy(), x.copy()
        x_plus[i] += eps
        x_minus[i] -= eps
        grad[i] = (func(x_plus) - func(x_minus)) / (2.0 * eps)
    return grad

# Verification point for derivative testing
point = np.array([2.0, -1.0])
g_ana = grad_analytical(point)
g_num = grad_numerical(f, point)
diff = np.linalg.norm(g_ana - g_num)

# Print gradient checking results
print(f"Point (x)           : {point}")
print(f"Analytical gradient : {g_ana}")
print(f"Numerical gradient  : {g_num}")
print(f"Absolute difference : {diff:.8e}")
print(f"Gradient check pass?: {diff < 1e-7}")
