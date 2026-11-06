# Tách từ tiếng Việt bằng khớp dài nhất (maximum matching) với từ điển nhỏ
# Từ điển tự viết: mỗi từ là một hay nhiều âm tiết, cách nhau bởi dấu cách
DICT = {"học sinh", "sinh học", "máy tính", "bài tập", "giáo viên",
        "học", "sinh", "máy", "tính", "bài", "tập", "giáo", "viên",
        "chấm", "trên"}
MAX_LEN = max(len(w.split()) for w in DICT)  # từ dài nhất: 2 âm tiết


def segment(syl, from_right=False):
    """Mỗi lần lấy từ dài nhất có trong từ điển, từ trái hoặc từ phải."""
    words = []
    i, j = 0, len(syl)  # phần chưa tách là syl[i:j]
    while i < j:
        for n in range(min(MAX_LEN, j - i), 0, -1):
            piece = syl[j - n:j] if from_right else syl[i:i + n]
            cand = " ".join(piece)
            if n == 1 or cand in DICT:  # 1 âm tiết thì luôn nhận
                if from_right:
                    words.insert(0, cand)
                    j -= n
                else:
                    words.append(cand)
                    i += n
                break
    return words


for sent in ["giáo viên chấm bài tập trên máy tính",
             "học sinh học sinh học"]:
    syl = sent.split()  # chữ viết tiếng Việt đã tách sẵn theo âm tiết
    print("left :", " | ".join(segment(syl)))
    print("right:", " | ".join(segment(syl, from_right=True)))
