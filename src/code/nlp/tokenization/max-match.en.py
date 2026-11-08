# Vietnamese word segmentation by maximum matching with a small lexicon
# Hand-built dictionary: each word is one or more syllables (data: vi)
DICT = {"học sinh", "sinh học", "máy tính", "bài tập", "giáo viên",
        "học", "sinh", "máy", "tính", "bài", "tập", "giáo", "viên",  # data: vi
        "chấm", "trên"}  # data: vi
MAX_LEN = max(len(w.split()) for w in DICT)  # longest word: 2 syllables


def segment(syl, from_right=False):
    # Greedily take the longest dictionary match from the left or right.
    words = []
    i, j = 0, len(syl)  # remaining span is syl[i:j]
    while i < j:
        for n in range(min(MAX_LEN, j - i), 0, -1):
            piece = syl[j - n:j] if from_right else syl[i:i + n]
            cand = " ".join(piece)
            if n == 1 or cand in DICT:  # a single syllable is always accepted
                if from_right:
                    words.insert(0, cand)
                    j -= n
                else:
                    words.append(cand)
                    i += n
                break
    return words


for sent in ["giáo viên chấm bài tập trên máy tính",  # data: vi
             "học sinh học sinh học"]:  # data: vi
    syl = sent.split()  # Vietnamese writing separates syllables with spaces
    print("left :", " | ".join(segment(syl)))
    print("right:", " | ".join(segment(syl, from_right=True)))
