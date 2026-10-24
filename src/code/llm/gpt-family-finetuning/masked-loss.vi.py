# Loss chỉ trên phần trả lời: một batch ba tác vụ, nhãn -100
import math

import torch
import torch.nn.functional as F

torch.manual_seed(0)
EOS, V = 256, 257  # mỗi byte (0-255) là một token, thêm một token EOS
PAIRS = [  # (prompt, đáp án): dịch, tóm tắt, sinh code
    ("Dịch sang tiếng Anh: Chào buổi sáng.", "Good morning."),
    ("Tóm tắt: Trời mưa to nên trận bóng chiều nay bị hoãn.",
     "Trận bóng bị hoãn vì mưa."),
    ("Viết hàm Python trả về bình phương của x.",
     "def sq(x):\n    return x * x"),
]


def encode(prompt, answer):
    p = list((prompt + "\n").encode("utf-8"))
    a = list(answer.encode("utf-8")) + [EOS]  # giữ EOS: mô hình học dừng
    return p + a, [-100] * len(p) + a  # nhãn của prompt là -100


rows = [encode(p, a) for p, a in PAIRS]
n = max(len(ids) for ids, _ in rows)
# Đệm cho bằng chuỗi dài nhất: token đệm là EOS, nhãn đệm là -100
ids = torch.tensor([r + [EOS] * (n - len(r)) for r, _ in rows])
labels = torch.tensor([lb + [-100] * (n - len(lb)) for _, lb in rows])

# Mô hình giả, chưa huấn luyện: embedding rồi một lớp tuyến tính
model = torch.nn.Sequential(torch.nn.Embedding(V, 32),
                            torch.nn.Linear(32, V))
logits = model(ids)  # (B, n, V)

# Dịch một vị trí: logit ở vị trí t dự đoán token ở vị trí t + 1
z = logits[:, :-1].reshape(-1, V)
y = labels[:, 1:].reshape(-1)
keep = y != -100
print(f"shape: {tuple(ids.shape)}")
print(f"counted per row: {keep.view(len(PAIRS), -1).sum(1).tolist()}")
print(f"counted: {keep.sum()} / {y.numel()}")

loss = F.cross_entropy(z, y)  # ignore_index=-100 là mặc định
by_hand = F.cross_entropy(z[keep], y[keep])  # tự lọc rồi lấy trung bình
print(f"loss: {loss:.4f}, by hand: {by_hand:.4f}, ln V: {math.log(V):.4f}")

# Sai lầm: che theo giá trị token đệm. EOS thật của đáp án cũng bị che
wrong = labels.masked_fill(ids == EOS, -100)[:, 1:].reshape(-1)
print(f"mask by pad id: {(wrong != -100).sum()} counted")
print(f"all -100: {F.cross_entropy(z, torch.full_like(y, -100))}")
