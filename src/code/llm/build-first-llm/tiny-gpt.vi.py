# GPT nhỏ (decoder-only), 24 câu Kiều như ô bigram (Wikisource, CC BY-SA 4.0)
import unicodedata
import torch
from torch import nn

POEM = """Trăm năm trong cõi người ta, / Chữ tài chữ mệnh khéo là ghét nhau.
Trải qua một cuộc bể dâu, / Những điều trông thấy mà đau đớn lòng.
Lạ gì bỉ sắc tư phong, / Trời xanh quen thói má hồng đánh ghen.
Cảo thơm lần giở trước đèn, / Phong tình cổ lục còn truyền sử xanh.
Rằng năm Gia Tĩnh triều Minh, / Bốn phương phẳng lặng, hai kinh vững vàng.
Có nhà viên ngoại họ Vương, / Gia tư nghĩ cũng thường thường bực trung.
Một trai con thứ rốt lòng, / Vương Quan là chữ, nối dòng nho gia.
Đầu lòng hai ả tố nga, / Thúy Kiều là chị, em là Thúy Vân.
Mai cốt cách, tuyết tinh thần, / Một người một vẻ, mười phân vẹn mười.
Vân xem trang trọng khác vời, / Khuôn trăng đầy đặn, nét ngài nở nang.
Hoa cười ngọc thốt đoan trang, / Mây thua nước tóc, tuyết nhường màu da.
Kiều càng sắc sảo, mặn mà, / So bề tài, sắc, lại là phần hơn."""
text = unicodedata.normalize("NFC", POEM).lower().replace(" / ", "\n")
chars = sorted(set(text))
V, L, D, H = len(chars), 32, 64, 4  # từ vựng, ngữ cảnh, số chiều, số đầu
ids = torch.tensor([chars.index(c) for c in text])
cut = text.index("hoa cười")  # câu 1-20 để huấn luyện, 21-24 để kiểm tra
train, test = ids[:cut].unfold(0, L + 1, 1), ids[cut - 1:].unfold(0, L + 1, 1)
MASK = torch.triu(torch.ones(L, L, dtype=torch.bool), 1)  # True: cấm nhìn


class GPT(nn.Module):
    def __init__(self):
        super().__init__()
        self.tok, self.pos = nn.Embedding(V, D), nn.Embedding(L, D)
        blk = nn.TransformerEncoderLayer(D, H, 4 * D, dropout=0.0,  # khối GPT
                                         batch_first=True, norm_first=True)
        self.blocks = nn.TransformerEncoder(blk, 2, enable_nested_tensor=False)
        self.ln, self.head = nn.LayerNorm(D), nn.Linear(D, V)

    def forward(self, x):  # x: (B, n) chỉ số ký tự -> (B, n, V) logit
        h = self.tok(x) + self.pos(torch.arange(n := x.shape[1]))
        return self.head(self.ln(self.blocks(h, mask=MASK[:n, :n])))

    def loss(self, w):  # w: (B, L + 1). Dự đoán ký tự 2..L+1 từ 1..L
        z = self(w[:, :-1]).mT  # (B, V, L): cross_entropy cần lớp ở chiều 1
        return nn.functional.cross_entropy(z, w[:, 1:])


torch.manual_seed(0)
model = GPT()
opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
for step in range(301):
    loss = model.loss(train[torch.randint(len(train), (32,))])  # lô 32 đoạn
    opt.zero_grad()
    loss.backward()
    opt.step()
    if step % 50 == 0:
        print(f"step {step}: train {loss:.3f}, test {model.loss(test):.3f}")

x = torch.tensor([[chars.index(c) for c in "trăm năm"]])
for _ in range(60):  # sinh văn bản: dự đoán, lấy mẫu với T = 0.8, nối vào
    p = torch.softmax(model(x[:, -L:])[0, -1].detach() / 0.8, -1)
    x = torch.cat([x, torch.multinomial(p, 1)[None]], dim=1)
print("".join(chars[i] for i in x[0]))
