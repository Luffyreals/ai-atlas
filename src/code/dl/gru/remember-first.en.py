# Vanilla RNN and GRU learning to remember the FIRST element of a length-L sequence
import torch
from torch import nn

torch.manual_seed(0)
torch.set_num_threads(1)  # small net: a single CPU thread is fast enough
H, STEPS = 16, 200  # hidden state dimension, number of training steps
BIAS_Z = 3.0  # initial update-gate bias: z ~ 0.95 at the start


def batch(n, L):
    x = torch.randint(0, 2, (n, L, 1)).float() * 2 - 1  # +1 or -1 values
    y = (x[:, 0, 0] > 0).long()  # label: whether the first element is +1 or -1
    return x, y


class Net(nn.Module):
    def __init__(self, cell):
        super().__init__()
        self.rnn = cell(1, H, batch_first=True)  # nn.RNN or nn.GRU
        self.out = nn.Linear(H, 2)
        if cell is nn.GRU:  # blocks in bias_hh are ordered r, z, n
            with torch.no_grad():
                self.rnn.bias_hh_l0[H:2 * H].fill_(BIAS_Z)

    def forward(self, x):
        hs, _ = self.rnn(x)  # hidden states at all steps
        return self.out(hs[:, -1])  # use only the final state, h_L


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
            x, y = batch(2000, L)  # 2000 fresh sequences
            acc = (model(x).argmax(1) == y).float().mean()
        print(f"L={L:3d}  {cell.__name__}: loss {loss.item():.3f}"
              f"  test accuracy {acc:.3f}")
