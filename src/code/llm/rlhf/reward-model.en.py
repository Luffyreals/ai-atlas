# A linear reward model learned from 6 comparison pairs (Bradley-Terry loss)
import numpy as np

# Each answer: (correctness from 0 to 1, length in hundreds of words)
chosen = np.array([[0.9, 1.2], [0.8, 2.0], [0.7, 1.5],
                   [0.6, 2.5], [0.9, 0.6], [0.5, 1.8]])
rejected = np.array([[0.3, 0.8], [0.6, 1.0], [0.2, 1.4],
                     [0.7, 1.0], [0.4, 0.9], [0.5, 0.7]])
diff = chosen - rejected  # r_w - r_l = w . (phi_w - phi_l)


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def loss_and_grad(w):
    margin = diff @ w  # margin of each pair
    p = sigmoid(margin)  # probability that the model agrees with the human
    loss = -np.mean(np.log(p))
    grad = -np.mean((1 - p)[:, None] * diff, axis=0)
    return loss, grad


w = np.zeros(2)
loss, grad = loss_and_grad(w)
print(f"w = 0: loss {loss:.4f}, grad {np.round(grad, 4)}")

for step in range(1, 101):
    w -= 1.0 * loss_and_grad(w)[1]  # one gradient descent step, eta = 1
    if step in (1, 10, 100):  # measure AFTER the update, with the new w
        loss = loss_and_grad(w)[0]
        acc = np.mean(diff @ w > 0)
        print(f"step {step:3d}: loss {loss:.4f}, acc {acc:.2f}, "
              f"w {np.round(w, 2)}")

good = np.array([0.9, 0.5])  # correct, short
bad = np.array([0.3, 3.0])  # wrong, longer than any answer seen so far
print(f"r(good) = {good @ w:.2f}, r(bad) = {bad @ w:.2f}")
print(f"P(bad > good) = {sigmoid(bad @ w - good @ w):.3f}")
