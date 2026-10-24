# Packing: nối tài liệu, chèn EOS, cắt thành chuỗi L token, rồi tạo mặt nạ
import numpy as np

docs = ["hà nội là thủ đô của việt nam một thành phố hơn nghìn năm tuổi",
        "phở là món ăn nổi tiếng của việt nam",
        "mua ngay giá rẻ bấm vào đây để nhận quà miễn phí"]
L = 12
toks = [d.split() + ["<eos>"] for d in docs]  # mỗi từ là một token
print("lengths:", [len(t) for t in toks])

# Cách 1, padding: mỗi tài liệu cắt riêng, khúc cuối đệm cho đủ L
chunks = sum(-(-len(t) // L) for t in toks)  # chia rồi làm tròn lên
pad = chunks * L - sum(len(t) for t in toks)
print(f"padding: {chunks} sequences, {pad} pad tokens")

# Cách 2, packing: nối mọi tài liệu thành một dòng rồi cắt từng L token
stream = [w for t in toks for w in t]
n = len(stream) // L
print(f"packing: {n} sequences, {len(stream) - n * L} tokens left over")
seq = np.array(stream[L:2 * L])  # chuỗi thứ hai: có ranh giới tài liệu
eos = seq == "<eos>"
doc = np.cumsum(eos) - eos  # số thứ tự tài liệu, tăng sau mỗi EOS
print(seq, doc, sep="\n")

causal = np.tril(np.ones((L, L), dtype=bool))  # mặt nạ nhân quả
mask = causal & (doc[:, None] == doc[None, :])  # thêm: cùng tài liệu
print(f"visible cells: causal = {causal.sum()}, per-doc = {mask.sum()}")
print(mask[4].astype(int))  # hàng của "phở": chỉ nhìn chính nó
