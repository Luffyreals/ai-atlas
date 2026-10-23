import time

# Vòng lặp này không bao giờ tự dừng. Bạn bấm Dừng để ngắt nó.
i = 0
while True:
    print("Tick", i)
    i += 1
    time.sleep(0.5)  # nghỉ nửa giây giữa hai dòng
