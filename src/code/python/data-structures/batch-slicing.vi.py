# Tập dữ liệu gồm 10 mẫu huấn luyện ghép đôi (đặc trưng, nhãn)
features = [1.2, 2.5, 3.1, 4.8, 5.0, 6.3, 7.7, 8.4, 9.1, 10.5]
labels = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1]
dataset = list(zip(features, labels))

batch_size = 4
num_samples = len(dataset)
batches = []

# Chia tập dữ liệu thành các lô nhỏ bằng kỹ thuật cắt lát slicing
for i in range(0, num_samples, batch_size):
    batch = dataset[i : i + batch_size]
    batches.append(batch)

print(f"Total samples: {num_samples}")
print(f"Batch size: {batch_size}")
print(f"Number of batches: {len(batches)}")
for b_idx, batch in enumerate(batches):
    print(f"Batch {b_idx}: length = {len(batch)}, first = {batch[0]}")
