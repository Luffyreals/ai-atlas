# Giải mã nhãn BIO thành thực thể, rồi chấm điểm mức thực thể và mức token
def spans(tags):
    """Trả về tập (loại, đầu, cuối); cuối không tính, như lát cắt."""
    out, start, typ = set(), None, None
    for i, tag in enumerate(tags + ["O"]):  # "O" cuối để đóng thực thể
        pre, _, ty = tag.partition("-")
        # Đóng thực thể đang mở khi gặp O, B- hoặc I- khác loại
        if start is not None and (pre != "I" or ty != typ):
            out.add((typ, start, i))
            start = None
        # Mở thực thể mới ở B-, hoặc ở I- mồ côi (quy ước của conlleval)
        if pre == "B" or (pre == "I" and start is None):
            start, typ = i, ty
    return out

data = [  # (câu, nhãn đúng, nhãn dự đoán)
    # Câu 1: lệch biên ở đầu thực thể PER
    ("Ông Nguyễn Văn An đến Hà Nội làm việc cho Vietcombank từ tháng 3/2024",
     "O B-PER I-PER I-PER O B-LOC I-LOC O O O B-ORG O O O",
     "O O B-PER I-PER O B-LOC I-LOC O O O B-ORG O O O"),
    ("Chị Mai chuyển từ Bia Hà Nội sang Vinamilk",
     "O B-PER O O B-ORG I-ORG I-ORG O B-ORG",
     "O B-PER O O O B-LOC I-LOC O B-ORG"),
    ("Ông An mở tài khoản ở Ngân hàng Ngoại thương",
     "O B-PER O O O O B-ORG I-ORG I-ORG I-ORG",
     "O B-PER O O O O O I-ORG I-ORG I-ORG"),
    ("Trận Việt Nam Thái Lan diễn ra ở Mỹ Đình",
     "O B-LOC I-LOC B-LOC I-LOC O O O B-LOC I-LOC",
     "O B-LOC I-LOC I-LOC I-LOC O O O O O"),
]
n_gold = n_pred = n_ok = tok_ok = tok_all = all_o = 0
for text, g, p in data:
    words, g, p = text.split(), g.split(), p.split()
    G, P = spans(g), spans(p)
    n_gold, n_pred, n_ok = n_gold + len(G), n_pred + len(P), n_ok + len(G & P)
    tok_ok += sum(a == b for a, b in zip(g, p))
    all_o += g.count("O")
    tok_all += len(g)
    for ty, s, e in sorted(G - P, key=lambda x: x[1]):
        print("missed:", ty, " ".join(words[s:e]))
    for ty, s, e in sorted(P - G, key=lambda x: x[1]):
        print("wrong: ", ty, " ".join(words[s:e]))
prec, rec = n_ok / n_pred, n_ok / n_gold
print(f"gold={n_gold} pred={n_pred} correct={n_ok}")
print(f"entity P={prec:.3f} R={rec:.3f} F1={2*prec*rec/(prec+rec):.3f}")
print(f"token accuracy={tok_ok / tok_all:.3f} ({tok_ok}/{tok_all})")
print(f"all-O token accuracy={all_o / tok_all:.3f}")
