# Ring all-reduce: N workers sum gradients, sending only to right neighbor
import numpy as np

rng = np.random.default_rng(0)
N, size = 4, 12  # num workers, elements per gradient
grads = [rng.integers(0, 10, size) for _ in range(N)]
target = np.sum(grads, axis=0)  # expected all-reduce result
buf = [np.array_split(g.copy(), N) for g in grads]  # N chunks per worker


def ring_step(chunk_of, add):  # every worker i sends one chunk to i + 1
    msgs = [(i, chunk_of(i), buf[i][chunk_of(i)].copy()) for i in range(N)]
    for i, c, data in msgs:  # send simultaneously, add after receiving
        j = (i + 1) % N
        buf[j][c] = buf[j][c] + data if add else data
    return len(msgs[0][2])  # number of elements worker 0 just sent


sent = 0
for s in range(N - 1):  # phase 1, reduce-scatter: accumulate around ring
    sent += ring_step(lambda i: (i - s) % N, add=True)
print("worker 0, chunk 1:", buf[0][1], "target:", target[3:6])
for s in range(N - 1):  # phase 2, all-gather: pass fully summed chunks
    sent += ring_step(lambda i: (i + 1 - s) % N, add=False)

ok = all(np.array_equal(np.concatenate(b), target) for b in buf)
print(f"every worker has the sum: {ok}")
print(f"worker 0 sent {sent} numbers = {sent / size:.2f} x size")
for k in [2, 4, 8, 64]:  # fraction of data sent with k workers
    print(f"N = {k:2d}: 2(N-1)/N = {2 * (k - 1) / k:.2f}")
