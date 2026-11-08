import numpy as np

rng = np.random.default_rng(0)
m, n, n1 = 5, 3, 4  # samples, features, hidden-layer neurons
X = rng.normal(size=(m, n))  # each row is one sample x
y = np.array([0, 1, 1, 0, 1])
W1, b1 = rng.normal(size=(n1, n)), np.zeros(n1)
W2, b2 = rng.normal(size=(1, n1)), np.zeros(1)


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def loss(W1, b1, W2, b2):  # binary cross-entropy, averaged over m samples
    a2 = sigmoid(sigmoid(X @ W1.T + b1) @ W2.T + b2).ravel()
    return -np.mean(y * np.log(a2) + (1 - y) * np.log(1 - a2))


# Backpropagation, one sample at a time, accumulating gradients
grads = [np.zeros_like(p) for p in (W1, b1, W2, b2)]
for x, t in zip(X, y):
    a1 = sigmoid(W1 @ x + b1)  # forward pass
    a2 = sigmoid(W2 @ a1 + b2)
    d2 = a2 - t  # output-layer delta
    d1 = (W2.T @ d2) * a1 * (1 - a1)  # hidden-layer delta
    for g, v in zip(grads, (np.outer(d1, x), d1, np.outer(d2, a1), d2)):
        g += v / m

# Numerical gradient by central difference, one parameter at a time
params, h = [W1, b1, W2, b2], 1e-5  # h: step size
for name, p, g in zip(["W1", "b1", "W2", "b2"], params, grads):
    num = np.zeros_like(p)
    for i in np.ndindex(p.shape):
        old = p[i]
        p[i] = old + h
        up = loss(*params)
        p[i] = old - h
        num[i] = (up - loss(*params)) / (2 * h)
        p[i] = old
    rel = np.linalg.norm(g - num) / (np.linalg.norm(g) + np.linalg.norm(num))
    print(f"{name}: max |grad| = {np.abs(g).max():.4f}, rel err = {rel:.1e}")
