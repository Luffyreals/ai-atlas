# Gọi thử server rồi đo độ trễ p50, p95 và thông lượng của /predict.
# Server phải đang chạy (uvicorn app:app ...).
import math
import sys
import time

import httpx

URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
M = 200  # số yêu cầu đem đo
FLOWER = {"sepal_length": 5.9, "sepal_width": 3.0,
          "petal_length": 5.1, "petal_width": 1.8}

with httpx.Client(base_url=URL, timeout=10) as client:
    print("health:", client.get("/health").json())
    print("predict:", client.post("/predict", json=FLOWER).json())
    bad = client.post("/predict", json={**FLOWER, "petal_width": -1})
    print("sai đầu vào:", bad.status_code, bad.json()["detail"][0]["msg"])

    for _ in range(20):  # vài yêu cầu khởi động, không tính
        client.post("/predict", json=FLOWER)

    times = []
    start = time.perf_counter()
    for _ in range(M):
        t0 = time.perf_counter()
        client.post("/predict", json=FLOWER).raise_for_status()
        times.append(time.perf_counter() - t0)
    elapsed = time.perf_counter() - start

times.sort()


def percentile(q):
    # Thứ hạng k = ceil(q * M), đếm từ 1, nên chỉ số Python là k - 1.
    return times[math.ceil(q * M) - 1]


print(f"p50 = {percentile(0.50) * 1000:.2f} ms")
print(f"p95 = {percentile(0.95) * 1000:.2f} ms")
print(f"trung bình = {sum(times) / M * 1000:.2f} ms")
print(f"thông lượng = {M / elapsed:.0f} yêu cầu/giây")
