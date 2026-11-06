# Ring all-reduce: N worker cộng gradient, chỉ gửi cho hàng xóm bên phải
import numpy as np

rng = np.random.default_rng(0)
N, size = 4, 12  # số worker, số phần tử của mỗi gradient
grads = [rng.integers(0, 10, size) for _ in range(N)]
target = np.sum(grads, axis=0)  # kết quả all-reduce cần có
buf = [np.array_split(g.copy(), N) for g in grads]  # mỗi worker: N mảnh


def ring_step(chunk_of, add):  # mọi worker i gửi một mảnh sang i + 1
    msgs = [(i, chunk_of(i), buf[i][chunk_of(i)].copy()) for i in range(N)]
    for i, c, data in msgs:  # gửi cùng lúc, nhận xong mới cộng
        j = (i + 1) % N
        buf[j][c] = buf[j][c] + data if add else data
    return len(msgs[0][2])  # số phần tử worker 0 vừa gửi


sent = 0
for s in range(N - 1):  # pha 1, reduce-scatter: cộng dồn quanh vòng
    sent += ring_step(lambda i: (i - s) % N, add=True)
print("worker 0, chunk 1:", buf[0][1], "target:", target[3:6])
for s in range(N - 1):  # pha 2, all-gather: chuyền các mảnh đã đủ tổng
    sent += ring_step(lambda i: (i + 1 - s) % N, add=False)

ok = all(np.array_equal(np.concatenate(b), target) for b in buf)
print(f"every worker has the sum: {ok}")
print(f"worker 0 sent {sent} numbers = {sent / size:.2f} x size")
for k in [2, 4, 8, 64]:  # tỉ lệ dữ liệu gửi đi khi có k worker
    print(f"N = {k:2d}: 2(N-1)/N = {2 * (k - 1) / k:.2f}")
