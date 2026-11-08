# Data parallelism in NumPy: mean of shard gradients = full-batch gradient
import numpy as np

rng = np.random.default_rng(0)
m, n, N = 32, 3, 4  # batch size, num features, num workers
X = rng.normal(size=(m, n))
y = X @ np.array([2.0, -1.0, 0.5]) + 0.1 * rng.normal(size=m)
w = np.zeros(n)  # every worker holds the same copy of w


def grad(Xs, ys):  # gradient of mean MSE on the given samples
    return 2 / len(ys) * Xs.T @ (Xs @ w - ys)


g_full = grad(X, y)  # single machine, full batch of 32 samples

# 1. Data parallel: 8 samples per worker, then all-reduce mean
shards = np.array_split(np.arange(m), N)
g_dp = np.mean([grad(X[i], y[i]) for i in shards], axis=0)
print(f"data parallel: max diff {np.abs(g_dp - g_full).max():.1e}")

# 2. Gradient accumulation: 1 machine, 4 sequential micro-batches, sum g / N
acc = np.zeros(n)
for i in shards:
    acc += grad(X[i], y[i]) / N
print(f"accumulation:  max diff {np.abs(acc - g_full).max():.1e}")

# 3. Uneven shards (20, 4, 4, 4 samples): plain mean is biased
uneven = np.split(np.arange(m), [20, 24, 28])
g_plain = np.mean([grad(X[i], y[i]) for i in uneven], axis=0)
g_weighted = sum(len(i) * grad(X[i], y[i]) for i in uneven) / m
print(f"uneven, plain mean: max diff {np.abs(g_plain - g_full).max():.3f}")
print(f"uneven, weighted:   max diff {np.abs(g_weighted - g_full).max():.1e}")
print(f"|g_full| max {np.abs(g_full).max():.3f}")
