import numpy as np

# Ma trận biến đổi không gian A (2x2)
A = np.array([[3.0, 1.0], [0.0, 2.0]])

# Vectơ dữ liệu ban đầu x
x = np.array([1.0, 2.0])

# Biến đổi không gian bằng phép nhân ma trận A @ x
y = A @ x

# Định thức của A (tỉ lệ co giãn diện tích không gian)
det_A = np.linalg.det(A)

# Tìm trị riêng và vectơ riêng của A
eigenvalues, eigenvectors = np.linalg.eig(A)

# Lấy cặp trị riêng và vectơ riêng đầu tiên
lambda0 = eigenvalues[0].real
v0 = eigenvectors[:, 0].real

# Kiểm tra tính chất: A @ v = lambda * v
Av0 = A @ v0
lambda_v0 = lambda0 * v0

# In kết quả kiểm chứng đại số tuyến tính
print(f"Transformed vector y: {y}")
print(f"Determinant det(A)  : {det_A:.4f}")
print(f"Eigenvalues         : {eigenvalues.real}")
print(f"A @ v0              : {Av0}")
print(f"lambda0 * v0        : {lambda_v0}")
print(f"Is eigenvector?     : {np.allclose(Av0, lambda_v0)}")
