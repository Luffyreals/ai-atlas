# Char-level bigram, first 24 lines of Kieu (Wikisource, CC BY-SA 4.0)
import unicodedata

import numpy as np
# data: vi
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
# NFC normalisation, lower case, one verse line per text line
text = unicodedata.normalize("NFC", POEM).lower().replace(" / ", "\n")
chars = sorted(set(text))  # vocabulary: the distinct characters
V = len(chars)
ids = np.array([chars.index(c) for c in text])
cut = text.index("hoa cười")  # data: vi; lines 1-20 to train, 21-24 to test
train, test = ids[:cut], ids[cut - 1:]

# C[i, j]: how often char j comes right after char i. Smoothing: add k
k = 0.1
C = np.zeros((V, V))
np.add.at(C, (train[:-1], train[1:]), 1)
P = (C + k) / (C + k).sum(axis=1, keepdims=True)  # each row sums to 1
print(f"V = {V}, uniform: loss = {np.log(V):.3f}, ppl = {V}")
for name, s in [("train", train), ("test", test)]:
    loss = -np.mean(np.log(P[s[:-1], s[1:]]))  # cross-entropy, in nats
    print(f"{name}: loss = {loss:.3f}, ppl = {np.exp(loss):.2f}")
print(f"P(u | q) = {P[chars.index('q'), chars.index('u')]:.3f}")

rng = np.random.default_rng(0)
for T in [1.0, 0.5]:  # temperature: softmax(log P / T) = P^(1/T), renormalised
    Q = P ** (1 / T)
    Q /= Q.sum(axis=1, keepdims=True)
    i, out = chars.index("\n"), ""
    while out.count("\n") < 2:  # generate two lines
        i = rng.choice(V, p=Q[i])
        out += chars[i]
    print(f"--- T = {T}\n{out}", end="")
