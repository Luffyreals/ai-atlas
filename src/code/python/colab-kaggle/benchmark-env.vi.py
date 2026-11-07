import time

# Số lượng phần tử cho bài đo benchmark
n = 100_000

# Cách 1: dùng vòng lặp for thông thường
t0 = time.perf_counter()
total_loop = 0
for i in range(n):
    total_loop += i * i
t_loop = time.perf_counter() - t0

# Cách 2: dùng hàm sum dựng sẵn với generator
t0 = time.perf_counter()
total_sum = sum(i * i for i in range(n))
t_sum = time.perf_counter() - t0

# Tỷ lệ tăng tốc giữa hai cách tính
speedup = t_loop / t_sum if t_sum > 0 else 1.0

print(f"Loop sum: {total_loop}")
print(f"Loop time: {t_loop:.5f}s")
print(f"Built-in time: {t_sum:.5f}s")
print(f"Speedup ratio: {speedup:.2f}x")
