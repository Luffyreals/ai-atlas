import torch
from torch import nn
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

torch.manual_seed(0)

# 1 797 ảnh chữ số 8x8, giá trị đưa về [0, 1], thêm trục kênh
digits = load_digits()
X = torch.tensor(digits.images / 16.0, dtype=torch.float32).unsqueeze(1)
y = torch.tensor(digits.target)
X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.2, random_state=0, stratify=y)

# Hai khối tích chập: 8x8 -> 4x4 -> 2x2, rồi một lớp phân loại
model = nn.Sequential(
    nn.Conv2d(1, 8, kernel_size=3, padding=1), nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Conv2d(8, 16, kernel_size=3, padding=1), nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Flatten(),
    nn.Linear(16 * 2 * 2, 10),
)
n_params = sum(p.numel() for p in model.parameters())
print("input:", tuple(X_tr.shape), "params:", n_params)
print("feature maps:", tuple(model[:6](X_tr[:1]).shape))

opt = torch.optim.Adam(model.parameters(), lr=0.005)
loss_fn = nn.CrossEntropyLoss()
for epoch in range(1, 31):
    model.train()
    perm = torch.randperm(len(X_tr))
    total = 0.0
    for start in range(0, len(X_tr), 64):
        batch = perm[start:start + 64]
        loss = loss_fn(model(X_tr[batch]), y_tr[batch])
        opt.zero_grad()
        loss.backward()  # lan truyền ngược tới từng ô của kernel
        opt.step()
        total += loss.item() * len(batch)
    if epoch % 10 == 0:
        model.eval()
        with torch.no_grad():
            acc = (model(X_te).argmax(1) == y_te).float().mean()
        print(f"epoch {epoch}  train loss {total / len(X_tr):.3f}  "
              f"test acc {acc.item():.3f}")
