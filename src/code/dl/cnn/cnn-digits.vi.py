import torch
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from torch import nn

torch.manual_seed(0)
# 1797 ảnh chữ số 8x8, giá trị 0..16; chia về 0..1
X, y = load_digits(return_X_y=True)
X = torch.tensor(X / 16.0, dtype=torch.float32).reshape(-1, 1, 8, 8)
y = torch.tensor(y)
X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.3, random_state=0, stratify=y)

cnn = nn.Sequential(                       # ảnh vào: 1 x 8 x 8
    nn.Conv2d(1, 16, 3, padding=1), nn.ReLU(),
    nn.MaxPool2d(2),                       # 16 x 4 x 4
    nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(),
    nn.MaxPool2d(2),                       # 32 x 2 x 2
    nn.Flatten(), nn.Linear(32 * 2 * 2, 10))
mlp = nn.Sequential(                       # trải phẳng 64 điểm ảnh
    nn.Flatten(), nn.Linear(64, 64), nn.ReLU(), nn.Linear(64, 10))


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(1) == y).float().mean().item()


def train(model, epochs=15):
    opt = torch.optim.Adam(model.parameters(), lr=0.01)
    loss_fn = nn.CrossEntropyLoss()
    for _ in range(epochs):
        perm = torch.randperm(len(X_tr))
        for i in range(0, len(X_tr), 64):  # mini-batch 64 ảnh
            idx = perm[i:i + 64]
            opt.zero_grad()
            loss_fn(model(X_tr[idx]), y_tr[idx]).backward()
            opt.step()


# Ảnh kiểm tra dịch sang phải 1 điểm ảnh (cột trái thành 0)
X_shift = torch.roll(X_te, shifts=1, dims=3)
X_shift[..., 0] = 0
for name, model in [("CNN", cnn), ("MLP", mlp)]:
    train(model)
    n_par = sum(p.numel() for p in model.parameters())
    print(f"{name}: {n_par:5d} params  "
          f"test acc {accuracy(model, X_te, y_te):.3f}  "
          f"shifted {accuracy(model, X_shift, y_te):.3f}")
