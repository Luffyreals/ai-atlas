import torch
from torch import nn

torch.manual_seed(0)
L, D_H = 12, 32  # sequence length, hidden dimension per direction


def make_batch(n):
    # Random digit sequences. Label at t: is the next digit larger?
    x = torch.randint(0, 10, (n, L))
    y = (x[:, 1:] > x[:, :-1]).long()  # L - 1 labels, last position ignored
    return x, y


class Tagger(nn.Module):
    def __init__(self, bidirectional):
        super().__init__()
        self.emb = nn.Embedding(10, 16)
        self.lstm = nn.LSTM(16, D_H, batch_first=True,
                            bidirectional=bidirectional)
        k = 2 if bidirectional else 1  # BiLSTM concatenates both states
        self.out = nn.Linear(k * D_H, 2)

    def forward(self, x):
        H, _ = self.lstm(self.emb(x))  # H: (n, L, k * D_H)
        return self.out(H)[:, :-1]  # logits for each labeled position


x_test, y_test = make_batch(2000)
for bi in (False, True):
    model = Tagger(bi)
    n_lstm = sum(p.numel() for p in model.lstm.parameters())
    opt = torch.optim.Adam(model.parameters(), lr=0.01)
    for step in range(400):
        x, y = make_batch(64)
        loss = nn.functional.cross_entropy(
            model(x).reshape(-1, 2), y.reshape(-1))
        opt.zero_grad()
        loss.backward()
        opt.step()
    with torch.no_grad():
        acc = (model(x_test).argmax(-1) == y_test).float().mean()
    name = "BiLSTM" if bi else "LSTM  "
    print(f"{name} params {n_lstm:5d}  loss {loss.item():.3f}"
          f"  test acc {acc.item():.3f}")
