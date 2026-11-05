import numpy as np

# Bốn đầu vào của một cổng logic hai đầu vào: mỗi hàng là một mẫu.
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
gates = {
    "AND": np.array([0, 0, 0, 1]),
    "OR": np.array([0, 1, 1, 1]),
    "XOR": np.array([0, 1, 1, 0]),
}


def step(z):
    return (z >= 0).astype(int)  # hàm bậc thang: 1 nếu z >= 0


def train_perceptron(X, y, eta=1.0, max_epochs=20):
    w, b = np.zeros(X.shape[1]), 0.0  # xuất phát từ 0
    history = []  # số mẫu đoán sai trong mỗi epoch
    for epoch in range(max_epochs):
        errors = 0
        for x_i, y_i in zip(X, y):
            y_hat = step(w @ x_i + b)
            # Luật học perceptron: chỉ sửa khi đoán sai.
            w = w + eta * (y_i - y_hat) * x_i
            b = b + eta * (y_i - y_hat)
            errors += int(y_hat != y_i)
        history.append(errors)
        if errors == 0:  # một lượt không sai mẫu nào: đã hội tụ
            break
    return w, b, history


for name, y in gates.items():
    w, b, history = train_perceptron(X, y)
    print(f"{name}: epochs = {len(history)}, w = {w}, b = {b}")
    print(f"  errors per epoch: {history}")
    print(f"  predictions: {step(X @ w + b)}, targets: {y}")
