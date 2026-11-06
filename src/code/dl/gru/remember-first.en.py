# RNN thường và GRU học nhớ phần tử ĐẦU TIÊN của một chuỗi dài L
import torch
from torch import nn

torch.manual_seed(0)
torch.set_num_threads(1)  # mạng nhỏ: một luồng CPU là đủ nhanh
H, STEPS = 16, 200  # số chiều trạng thái ẩn, số bước huấn luyện
BIAS_Z = 3.0  # hệ số tự do ban đầu của cổng update: z ≈ 0.95 lúc đầu


def batch(n, L):
    x = torch.randint(0, 2, (n, L, 1)).float() * 2 - 1  # các số +1 hoặc -1
    y = (x[:, 0, 0] > 0).long()  # nhãn: phần tử đầu tiên là +1 hay -1
    return x, y


class Net(nn.Module):
    def __init__(self, cell):
        super().__init__()
        self.rnn = cell(1, H, batch_first=True)  # nn.RNN hoặc nn.GRU
        self.out = nn.Linear(H, 2)
        if cell is nn.GRU:  # các khối trong bias_hh xếp theo thứ tự r, z, n
            with torch.no_grad():
                self.rnn.bias_hh_l0[H:2 * H].fill_(BIAS_Z)

    def forward(self, x):
        hs, _ = self.rnn(x)  # trạng thái ẩn ở mọi bước
        return self.out(hs[:, -1])  # chỉ dùng trạng thái cuối, h_L


for cell in [nn.RNN, nn.GRU]:
    n_par = sum(p.numel() for p in cell(1, H).parameters())
    print(f"{cell.__name__}: {n_par} recurrent parameters")

for L in [10, 100]:
    for cell in [nn.RNN, nn.GRU]:
        torch.manual_seed(0)
        model = Net(cell)
        opt = torch.optim.Adam(model.parameters(), lr=1e-2)
        for step in range(STEPS):
            x, y = batch(64, L)
            loss = nn.functional.cross_entropy(model(x), y)
            opt.zero_grad()
            loss.backward()
            opt.step()
        with torch.no_grad():
            x, y = batch(2000, L)  # 2000 chuỗi mới
            acc = (model(x).argmax(1) == y).float().mean()
        print(f"L={L:3d}  {cell.__name__}: loss {loss.item():.3f}"
              f"  test accuracy {acc:.3f}")
