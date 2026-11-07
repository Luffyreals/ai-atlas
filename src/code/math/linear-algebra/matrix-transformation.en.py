import numpy as np

# Spatial transformation matrix A (2x2)
A = np.array([[3.0, 1.0], [0.0, 2.0]])

# Initial data vector x
x = np.array([1.0, 2.0])

# Spatial transformation via matrix multiplication A @ x
y = A @ x

# Determinant of A (area scaling factor of space)
det_A = np.linalg.det(A)

# Compute eigenvalues and eigenvectors of A
eigenvalues, eigenvectors = np.linalg.eig(A)

# Extract first eigenvalue and eigenvector pair
lambda0 = eigenvalues[0].real
v0 = eigenvectors[:, 0].real

# Verify definition property: A @ v = lambda * v
Av0 = A @ v0
lambda_v0 = lambda0 * v0

# Print linear algebra verification results
print(f"Transformed vector y: {y}")
print(f"Determinant det(A)  : {det_A:.4f}")
print(f"Eigenvalues         : {eigenvalues.real}")
print(f"A @ v0              : {Av0}")
print(f"lambda0 * v0        : {lambda_v0}")
print(f"Is eigenvector?     : {np.allclose(Av0, lambda_v0)}")
