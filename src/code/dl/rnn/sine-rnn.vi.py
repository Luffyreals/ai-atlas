import torch
from torch import nn

torch.manual_seed(0)
K = 50  # độ dài mỗi đoạn của truncated BPTT


def make_series(start, n):
    """Sóng sin cộng nhiễu nhỏ, bước thời gian 0.1."""
    t = (start + torch.arange(n + 1)) * 0.1
    s = torch.sin(t) + 0.05 * torch.randn(n + 1)
    # Đầu vào: giá trị hiện tại; nhãn: giá trị kế tiếp
    return s[:-1].view(1, n, 1), s[1:].view(1, n, 1)


class SineRNN(nn.Module):
    def __init__(self, hidden=32):
        super().__init__()
        self.rnn = nn.RNN(1, hidden, batch_first=True)  # tanh
        self.head = nn.Linear(hidden, 1)  # y_hat_t = W_hy h_t + b_y

    def forward(self, x, h=None):
        out, h = self.rnn(x, h)  # out chứa mọi h_t
        return self.head(out), h


x_all, y_all = make_series(0, 2000)
model = SineRNN()
opt = torch.optim.Adam(model.parameters(), lr=0.005)
mse = nn.MSELoss()

for epoch in range(1, 16):
    h, total, n_chunks, max_norm = None, 0.0, 0, 0.0
    for s in range(0, x_all.shape[1], K):
        pred, h = model(x_all[:, s:s + K], h)
        loss = mse(pred, y_all[:, s:s + K])
        opt.zero_grad()
        loss.backward()  # BPTT chỉ trong đoạn K bước này
        norm = nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        opt.step()
        h = h.detach()  # giữ giá trị h, cắt đường gradient
        total, n_chunks = total + loss.item(), n_chunks + 1
        max_norm = max(max_norm, norm.item())
    if epoch in (1, 5, 10, 15):
        print(f"epoch {epoch:2d}  train MSE {total / n_chunks:.4f}"
              f"  max grad norm {max_norm:.2f}")

# Đánh giá trên một đoạn mới, chưa thấy khi huấn luyện
x_test, y_test = make_series(5000, 500)
with torch.no_grad():
    pred, _ = model(x_test)
    print(f"test MSE (RNN)          {mse(pred, y_test).item():.4f}")
    print(f"test MSE (copy x_t)     {mse(x_test, y_test).item():.4f}")
