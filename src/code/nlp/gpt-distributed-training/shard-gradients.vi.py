# Data parallel bằng NumPy: trung bình gradient các shard = gradient cả lô
import numpy as np

rng = np.random.default_rng(0)
m, n, N = 32, 3, 4  # số mẫu trong lô, số đặc trưng, số worker
X = rng.normal(size=(m, n))
y = X @ np.array([2.0, -1.0, 0.5]) + 0.1 * rng.normal(size=m)
w = np.zeros(n)  # mọi worker giữ cùng một bản w


def grad(Xs, ys):  # gradient của MSE trung bình trên các mẫu được đưa vào
    return 2 / len(ys) * Xs.T @ (Xs @ w - ys)


g_full = grad(X, y)  # một máy, cả lô 32 mẫu

# 1. Data parallel: mỗi worker 8 mẫu, rồi all-reduce lấy trung bình
shards = np.array_split(np.arange(m), N)
g_dp = np.mean([grad(X[i], y[i]) for i in shards], axis=0)
print(f"data parallel: max diff {np.abs(g_dp - g_full).max():.1e}")

# 2. Tích lũy gradient: một máy, 4 micro-batch nối nhau, cộng dồn g / N
acc = np.zeros(n)
for i in shards:
    acc += grad(X[i], y[i]) / N
print(f"accumulation:  max diff {np.abs(acc - g_full).max():.1e}")

# 3. Shard không đều (20, 4, 4, 4 mẫu): trung bình đơn giản bị lệch
uneven = np.split(np.arange(m), [20, 24, 28])
g_plain = np.mean([grad(X[i], y[i]) for i in uneven], axis=0)
g_weighted = sum(len(i) * grad(X[i], y[i]) for i in uneven) / m
print(f"uneven, plain mean: max diff {np.abs(g_plain - g_full).max():.3f}")
print(f"uneven, weighted:   max diff {np.abs(g_weighted - g_full).max():.1e}")
print(f"|g_full| max {np.abs(g_full).max():.3f}")
