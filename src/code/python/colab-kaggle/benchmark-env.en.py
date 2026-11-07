import time

# Number of elements for the benchmark
n = 100_000

# Method 1: standard for loop
t0 = time.perf_counter()
total_loop = 0
for i in range(n):
    total_loop += i * i
t_loop = time.perf_counter() - t0

# Method 2: built-in sum with generator
t0 = time.perf_counter()
total_sum = sum(i * i for i in range(n))
t_sum = time.perf_counter() - t0

# Speedup ratio between the two approaches
speedup = t_loop / t_sum if t_sum > 0 else 1.0

print(f"Loop sum: {total_loop}")
print(f"Loop time: {t_loop:.5f}s")
print(f"Built-in time: {t_sum:.5f}s")
print(f"Speedup ratio: {speedup:.2f}x")
