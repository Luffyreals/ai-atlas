import torch
from torch import nn
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

torch.manual_seed(0)

# 1797 ảnh chữ số viết tay 8x8, mỗi điểm ảnh từ 0 tới 16.
X, y = load_digits(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.25, random_state=0, stratify=y)
X_tr = torch.tensor(X_tr / 16, dtype=torch.float32)  # đưa về [0, 1]
X_te = torch.tensor(X_te / 16, dtype=torch.float32)
y_tr = torch.tensor(y_tr)
y_te = torch.tensor(y_te)

# MLP 64 -> 64 -> 10. Lớp ra trả về logit, KHÔNG có softmax:
# nn.CrossEntropyLoss tự áp softmax rồi lấy -log xác suất lớp đúng.
model = nn.Sequential(
    nn.Linear(64, 64),
    nn.ReLU(),
    nn.Linear(64, 10),
)
n_params = sum(p.numel() for p in model.parameters())
print(f"parameters: {n_params}")

loss_fn = nn.CrossEntropyLoss()
opt = torch.optim.SGD(model.parameters(), lr=0.2)  # mini-batch GD

for epoch in range(1, 31):
    perm = torch.randperm(len(X_tr))  # xáo trộn mỗi epoch
    for i in range(0, len(X_tr), 32):  # mini-batch cỡ 32
        idx = perm[i:i + 32]
        logits = model(X_tr[idx])  # lan truyền xuôi
        loss = loss_fn(logits, y_tr[idx])
        opt.zero_grad()
        loss.backward()  # tính gradient: bài sau giải thích
        opt.step()  # w <- w - lr * gradient
    if epoch in (1, 5, 10, 20, 30):
        with torch.no_grad():
            full = loss_fn(model(X_tr), y_tr).item()
        print(f"epoch {epoch:2d}  train loss {full:.4f}")

with torch.no_grad():
    pred = model(X_te).argmax(dim=1)  # lớp có logit lớn nhất
    acc = (pred == y_te).float().mean().item()
print(f"test accuracy: {acc:.4f} ({len(y_te)} images)")
