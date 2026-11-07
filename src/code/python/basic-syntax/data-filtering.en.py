# Confidence score and flagged status: (confidence, is_flagged)
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

# Filter valid samples using comparison and logical operators
for i, (score, is_flagged) in enumerate(samples):
    # Keep high confidence samples that are not flagged
    if score >= min_conf and not is_flagged:
        valid_samples.append((i, score))

pass_rate = len(valid_samples) / len(samples) * 100.0

print(f"Total samples: {len(samples)}")
print(f"Valid count: {len(valid_samples)}")
print(f"Pass rate: {pass_rate:.1f}%")
print(f"Accepted indices: {[idx for idx, _ in valid_samples]}")
