import math


class DataBatcher:
    def __init__(self, features: list[list[float]], labels: list[int], batch_size: int = 2):
        self._features = features
        self._labels = labels
        self.batch_size = batch_size

    def __len__(self) -> int:
        return math.ceil(len(self._features) / self.batch_size)

    def get_batch(self, index: int) -> tuple[list[list[float]], list[int]]:
        start = index * self.batch_size
        end = start + self.batch_size
        return self._features[start:end], self._labels[start:end]


# Dữ liệu gồm 5 mẫu với 2 đặc trưng và nhãn nhị phân
data_x = [[1.2, 0.7], [-0.5, 1.4], [2.1, -1.0], [0.3, 0.9], [-1.2, -0.4]]
data_y = [1, 0, 1, 1, 0]

# Khởi tạo batcher với kích thước mỗi mini-batch là 2
batcher = DataBatcher(data_x, data_y, batch_size=2)
print(f"Total batches: {len(batcher)}")

# Lặp qua từng batch để mô phỏng một chu kỳ huấn luyện (epoch)
for i in range(len(batcher)):
    bx, by = batcher.get_batch(i)
    print(f"Batch {i}: {len(bx)} samples, labels = {by}")
