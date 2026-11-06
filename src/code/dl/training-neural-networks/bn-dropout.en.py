import torch
import torch.nn as nn
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

torch.manual_seed(0)
X, y = load_digits(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.5, random_state=0, stratify=y
)
mean, std = X_train.mean(), X_train.std() + 1e-8
X_tr = torch.tensor((X_train - mean) / std, dtype=torch.float32)
y_tr = torch.tensor(y_train, dtype=torch.long)
X_te = torch.tensor((X_test - mean) / std, dtype=torch.float32)
y_te = torch.tensor(y_test, dtype=torch.long)


def make_mlp(use_bn_dropout=False):
    layers = []
    dims = [64, 128, 128, 128, 10]
    for i in range(len(dims) - 1):
        layers.append(nn.Linear(dims[i], dims[i + 1]))
        if i < len(dims) - 2:
            if use_bn_dropout:
                layers.append(nn.BatchNorm1d(dims[i + 1]))
            layers.append(nn.ReLU())
            if use_bn_dropout:
                layers.append(nn.Dropout(0.5))
    return nn.Sequential(*layers)


for name, use_reg in [("Base MLP", False), ("BN + Dropout", True)]:
    torch.manual_seed(0)
    model = make_mlp(use_reg)
    opt = torch.optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = nn.CrossEntropyLoss()
    for epoch in range(40):
        model.train()
        loss = loss_fn(model(X_tr), y_tr)
        opt.zero_grad()
        loss.backward()
        opt.step()

    model.eval()
    with torch.no_grad():
        acc = (model(X_te).argmax(dim=1) == y_te).float().mean().item()
    print(f"{name} (eval): test acc = {acc:.3f}")

    if use_reg:
        model.train()  # deliberately forget eval
        accs = []
        for _ in range(3):
            with torch.no_grad():
                acc_m = (model(X_te).argmax(dim=1) == y_te).float().mean().item()
                accs.append(f"{acc_m:.3f}")
        print(f"{name} (quen eval): test acc = {accs}")
