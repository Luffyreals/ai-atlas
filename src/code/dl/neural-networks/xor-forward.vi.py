import numpy as np


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


# Bốn mẫu XOR, xếp thành CỘT: A0 có 2 hàng (đặc trưng), 4 cột (mẫu).
A0 = np.array([[0, 0, 1, 1],
               [0, 1, 0, 1]])
y = np.array([0, 1, 1, 0])

# Lớp ẩn: 2 nơ-ron. Hàng 1 gần với OR, hàng 2 gần với AND.
W1 = np.array([[6.0, 6.0],
               [6.0, 6.0]])
b1 = np.array([[-3.0],
               [-9.0]])  # vectơ cột, cộng vào mọi cột của Z1
# Lớp ra: 1 nơ-ron, tính "OR và không AND".
W2 = np.array([[10.0, -10.0]])
b2 = np.array([[-5.0]])

# Lan truyền xuôi: z = W a + b, rồi a = g(z), lớp nối lớp.
Z1 = W1 @ A0 + b1
A1 = sigmoid(Z1)
Z2 = W2 @ A1 + b2
A2 = sigmoid(Z2)  # xác suất lớp 1, shape (1, 4)
print("hidden A1:\n", A1.round(3))
print("output A2:", A2.round(3), " target:", y)

# Bỏ hàm kích hoạt (g(z) = z): hai lớp gộp lại thành một lớp tuyến tính.
W = W2 @ W1
b = W2 @ b1 + b2
two_layers = W2 @ (W1 @ A0 + b1) + b2
one_layer = W @ A0 + b
print("linear W =", W, " b =", b.ravel())
print("same output:", np.allclose(two_layers, one_layer))
