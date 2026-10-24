# Call the server, then measure p50, p95 latency and throughput of /predict.
# The server must be running (uvicorn app:app ...).
import math
import sys
import time

import httpx

URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
M = 200  # number of measured requests
FLOWER = {"sepal_length": 5.9, "sepal_width": 3.0,
          "petal_length": 5.1, "petal_width": 1.8}

with httpx.Client(base_url=URL, timeout=10) as client:
    print("health:", client.get("/health").json())
    print("predict:", client.post("/predict", json=FLOWER).json())
    bad = client.post("/predict", json={**FLOWER, "petal_width": -1})
    print("bad input:", bad.status_code, bad.json()["detail"][0]["msg"])

    for _ in range(20):  # a few warm-up requests, not counted
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
    # Rank k = ceil(q * M), counted from 1, so the Python index is k - 1.
    return times[math.ceil(q * M) - 1]


print(f"p50 = {percentile(0.50) * 1000:.2f} ms")
print(f"p95 = {percentile(0.95) * 1000:.2f} ms")
print(f"mean = {sum(times) / M * 1000:.2f} ms")
print(f"throughput = {M / elapsed:.0f} requests/s")
