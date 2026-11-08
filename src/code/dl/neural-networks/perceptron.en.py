import numpy as np

# Four inputs of a two-input logic gate: each row is one sample.
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
gates = {
    "AND": np.array([0, 0, 0, 1]),
    "OR": np.array([0, 1, 1, 1]),
    "XOR": np.array([0, 1, 1, 0]),
}


def step(z):
    return (z >= 0).astype(int)  # step function: 1 if z >= 0


def train_perceptron(X, y, eta=1.0, max_epochs=20):
    w, b = np.zeros(X.shape[1]), 0.0  # start from 0
    history = []  # misclassified samples per epoch
    for epoch in range(max_epochs):
        errors = 0
        for x_i, y_i in zip(X, y):
            y_hat = step(w @ x_i + b)
            # Perceptron learning rule: update only on errors.
            w = w + eta * (y_i - y_hat) * x_i
            b = b + eta * (y_i - y_hat)
            errors += int(y_hat != y_i)
        history.append(errors)
        if errors == 0:  # zero errors in one pass: converged
            break
    return w, b, history


for name, y in gates.items():
    w, b, history = train_perceptron(X, y)
    print(f"{name}: epochs = {len(history)}, w = {w}, b = {b}")
    print(f"  errors per epoch: {history}")
    print(f"  predictions: {step(X @ w + b)}, targets: {y}")
