import numpy as np


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


# Four XOR samples, stacked as COLUMNS: A0 has 2 rows (features), 4 columns.
A0 = np.array([[0, 0, 1, 1],
               [0, 1, 0, 1]])
y = np.array([0, 1, 1, 0])

# Hidden layer: 2 neurons. Row 1 approximates OR, row 2 approximates AND.
W1 = np.array([[6.0, 6.0],
               [6.0, 6.0]])
b1 = np.array([[-3.0],
               [-9.0]])  # column vector, added to every column of Z1
# Output layer: 1 neuron, computes "OR and not AND".
W2 = np.array([[10.0, -10.0]])
b2 = np.array([[-5.0]])

# Forward propagation: z = W a + b, then a = g(z), layer by layer.
Z1 = W1 @ A0 + b1
A1 = sigmoid(Z1)
Z2 = W2 @ A1 + b2
A2 = sigmoid(Z2)  # class 1 probability, shape (1, 4)
print("hidden A1:\n", A1.round(3))
print("output A2:", A2.round(3), " target:", y)

# Without activation (g(z) = z): two layers collapse into one linear layer.
W = W2 @ W1
b = W2 @ b1 + b2
two_layers = W2 @ (W1 @ A0 + b1) + b2
one_layer = W @ A0 + b
print("linear W =", W, " b =", b.ravel())
print("same output:", np.allclose(two_layers, one_layer))
