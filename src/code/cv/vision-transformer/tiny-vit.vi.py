# ViT tí hon và CNN nhỏ học phân loại chữ số 8x8 của load_digits.
import torch
from torch import nn
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

torch.manual_seed(0)
X, y = load_digits(return_X_y=True)
X = torch.tensor(X / 16.0, dtype=torch.float32).view(-1, 1, 8, 8)
y = torch.tensor(y)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=0)


class TinyViT(nn.Module):
    def __init__(self, P=2, D=32, depth=2, heads=4):
        super().__init__()
        N = (8 // P) ** 2                       # số patch
        # Conv2d kernel = stride = P: cắt patch rồi chiếu tuyến tính
        self.embed = nn.Conv2d(1, D, kernel_size=P, stride=P)
        self.cls = nn.Parameter(torch.zeros(1, 1, D))
        self.pos = nn.Parameter(torch.randn(1, N + 1, D) * 0.02)
        layer = nn.TransformerEncoderLayer(
            D, heads, dim_feedforward=2 * D, dropout=0.0,
            activation="gelu", batch_first=True, norm_first=True)
        self.encoder = nn.TransformerEncoder(
            layer, depth, enable_nested_tensor=False)
        self.head = nn.Sequential(nn.LayerNorm(D), nn.Linear(D, 10))

    def forward(self, x):
        z = self.embed(x).flatten(2).transpose(1, 2)    # (B, N, D)
        z = torch.cat([self.cls.expand(len(z), -1, -1), z], dim=1)
        z = self.encoder(z + self.pos)
        return self.head(z[:, 0])               # chỉ đọc token [CLS]


cnn = nn.Sequential(                            # CNN nhỏ để so sánh
    nn.Conv2d(1, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
    nn.Conv2d(32, 48, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
    nn.Flatten(), nn.Linear(48 * 2 * 2, 10))


def train_eval(model, epochs=60):
    opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
    for _ in range(epochs):
        model.train()
        for idx in torch.randperm(len(Xtr)).split(64):
            loss = nn.functional.cross_entropy(model(Xtr[idx]), ytr[idx])
            opt.zero_grad()
            loss.backward()
            opt.step()
    model.eval()
    with torch.no_grad():
        return (model(Xte).argmax(1) == yte).float().mean().item()


for name, model in [("ViT", TinyViT()), ("CNN", cnn)]:
    n = sum(p.numel() for p in model.parameters())
    print(f"{name}: {n} params, test acc {train_eval(model):.3f}")
