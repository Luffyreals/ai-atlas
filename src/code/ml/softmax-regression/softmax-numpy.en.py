import numpy as np


def softmax_naive(z):
    # Naive version: exponentiate each logit directly.
    e = np.exp(z)
    return e / e.sum()


def softmax(z):
    # Subtract the largest logit first: same result, largest exp is e^0 = 1.
    e = np.exp(z - z.max())
    return e / e.sum()


# Three logits of one flower: setosa, versicolor, virginica.
z = np.array([-3.0, 1.8, 1.2])
p = softmax(z)
print("p      =", p.round(4), f" sum = {p.sum():.4f}")

# Add the same constant to every logit: probabilities stay the same.
print("z + 5  =", softmax(z + 5).round(4))

# Large logits: e^1001.8 exceeds the largest float (about 1.8e308).
big = z + 1000
with np.errstate(over="ignore", invalid="ignore"):
    print("naive  =", softmax_naive(big))
print("stable =", softmax(big).round(4))

# K = 2: softmax of (z1, z2) equals the sigmoid of z1 - z2.
z2 = np.array([1.8, 1.2])
sigmoid = 1 / (1 + np.exp(-(z2[0] - z2[1])))
print("K=2    =", softmax(z2).round(4), f" sigmoid = {sigmoid:.4f}")
