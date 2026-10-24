# Giải mã tham lam và beam search trên một bảng xác suất giả lập (số tự đặt)
import numpy as np

# P[trước][kế] = p(token kế | token trước), như thể decoder đã đọc câu nguồn
P = {
    "<s>": {"con": 0.5, "đàn": 0.4, "<eos>": 0.1},
    "con": {"mèo": 0.34, "chó": 0.33, "chim": 0.33},
    "đàn": {"chim": 0.9, "mèo": 0.1},
    "mèo": {"<eos>": 1.0},
    "chó": {"<eos>": 1.0},
    "chim": {"<eos>": 0.52, "bay": 0.48},
    "bay": {"<eos>": 1.0},
}


def lp(n, alpha):  # phạt độ dài của Wu và cộng sự (2016)
    return ((5 + n) / 6) ** alpha


def beam_search(width, alpha=0.0, max_len=6):
    beams, done = [(0.0, ["<s>"])], []  # (tổng log-xác suất, chuỗi)
    for _ in range(max_len):
        cand = [(score + np.log(p), seq + [tok])  # nối mọi token có thể
                for score, seq in beams
                for tok, p in P[seq[-1]].items()]
        cand.sort(key=lambda c: -c[0])
        beams = []
        for score, seq in cand[:width]:  # chỉ giữ width ứng viên tốt nhất
            (done if seq[-1] == "<eos>" else beams).append((score, seq))
        if not beams:
            break
    # chọn theo điểm đã chia lp; độ dài n tính cả <eos>, không tính <s>
    score, seq = max(done, key=lambda c: c[0] / lp(len(c[1]) - 1, alpha))
    return " ".join(seq[1:-1]), score, score / lp(len(seq) - 1, alpha)


for width, alpha in [(1, 0.0), (2, 0.0), (2, 0.6)]:
    text, score, s = beam_search(width, alpha)
    print(f"B={width} alpha={alpha}: '{text}' p={np.exp(score):.3f} s={s:.3f}")
