# Dữ liệu điểm tin cậy và cờ cảnh báo: (độ tin cậy, gắn cờ lỗi)
samples = [
    (0.95, False),
    (0.42, False),
    (0.88, True),
    (0.76, False),
    (0.31, True),
    (0.91, False),
]

min_conf = 0.70
valid_samples = []

# Lọc các mẫu hợp lệ bằng toán tử so sánh và logic
for i, (score, is_flagged) in enumerate(samples):
    # Chỉ giữ mẫu có độ tin cậy cao và không bị cảnh báo
    if score >= min_conf and not is_flagged:
        valid_samples.append((i, score))

pass_rate = len(valid_samples) / len(samples) * 100.0

print(f"Total samples: {len(samples)}")
print(f"Valid count: {len(valid_samples)}")
print(f"Pass rate: {pass_rate:.1f}%")
print(f"Accepted indices: {[idx for idx, _ in valid_samples]}")
