import numpy as np
import torch
import torch.nn.functional as F
from torch import nn

torch.manual_seed(0)
rng = np.random.default_rng(0)
S, K = 32, 3  # cạnh ảnh; số lớp: 0 nền, 1 hình tròn, 2 hình vuông

def make(n):  # n ảnh xám có nhiễu, mỗi ảnh một hình tròn, một hình vuông
    yy, xx = np.mgrid[0:S, 0:S]
    X = rng.normal(0.2, 0.1, (n, 1, S, S))
    M = np.zeros((n, S, S), dtype=np.int64)
    for i in range(n):
        cy, cx, r = *rng.integers(8, 24, 2), rng.integers(4, 9)
        M[i][(yy - cy) ** 2 + (xx - cx) ** 2 <= r * r] = 1
        y, x, a = *rng.integers(0, 22, 2), rng.integers(6, 11)
        M[i, y:y + a, x:x + a] = 2  # hình vuông đè lên nếu chồng nhau
        X[i, 0][M[i] > 0] += rng.uniform(0.4, 0.8)  # hai hình cùng độ sáng
    return torch.tensor(X, dtype=torch.float32), torch.tensor(M)

def block(i, o):  # hai lớp tích chập 3x3, padding 1 giữ nguyên kích thước
    return nn.Sequential(nn.Conv2d(i, o, 3, padding=1), nn.ReLU(),
                         nn.Conv2d(o, o, 3, padding=1), nn.ReLU())

class TinyUNet(nn.Module):  # 2 tầng: 32x32 -> 16x16 -> 8x8 rồi đi lên
    def __init__(self, skip):
        super().__init__()
        self.skip = float(skip)  # 0.0: thay nhánh nối tắt bằng số 0
        self.e1, self.e2, self.mid = block(1, 16), block(16, 32), block(32, 64)
        self.u2, self.d2 = nn.ConvTranspose2d(64, 32, 2, 2), block(64, 32)
        self.u1, self.d1 = nn.ConvTranspose2d(32, 16, 2, 2), block(32, 16)
        self.head = nn.Conv2d(16, K, 1)  # K điểm cho từng pixel
    def forward(self, x):
        e1 = self.e1(x)                    # (B, 16, 32, 32)
        e2 = self.e2(F.max_pool2d(e1, 2))  # (B, 32, 16, 16)
        m = self.mid(F.max_pool2d(e2, 2))  # (B, 64, 8, 8)
        d2 = self.d2(torch.cat([self.u2(m), e2 * self.skip], 1))
        d1 = self.d1(torch.cat([self.u1(d2), e1 * self.skip], 1))
        return self.head(d1)               # (B, K, 32, 32)

(Xtr, Mtr), (Xte, Mte) = make(512), make(128)  # tập huấn luyện, kiểm tra
for skip in [True, False]:
    torch.manual_seed(0)
    net = TinyUNet(skip)
    opt = torch.optim.Adam(net.parameters(), lr=3e-3)
    for epoch in range(20):
        for b in torch.randperm(512).split(32):
            loss = F.cross_entropy(net(Xtr[b]), Mtr[b])  # TB mọi pixel
            opt.zero_grad()
            loss.backward()
            opt.step()
    with torch.no_grad():
        P = net(Xte).argmax(1)  # lớp đoán cho từng pixel
    iou = [((P == k) & (Mte == k)).sum().item()
           / ((P == k) | (Mte == k)).sum().item() for k in range(K)]
    print(f"skip={skip}: acc {(P == Mte).float().mean():.3f}, IoU "
          f"{np.round(iou, 3)}, mIoU {np.mean(iou):.3f}")
