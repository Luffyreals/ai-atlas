# Advantage của GRPO: chuẩn hóa phần thưởng trong một nhóm G câu trả lời
import numpy as np


def advantages(r, eps=1e-8):
    r = np.asarray(r, dtype=float)
    # eps để không chia cho 0 khi cả nhóm cùng điểm (paper không nói tới)
    return (r - r.mean()) / (r.std() + eps)


# G = 8 câu trả lời cho cùng một câu hỏi; 1 là đúng, 0 là sai
group = [1, 0, 0, 1, 0, 0, 0, 1]
a = advantages(group)
print("rewards   :", group)
print("advantages:", np.round(a, 3))
print("mean, std :", round(a.mean(), 6), round(a.std(), 3))

# Câu đúng càng hiếm trong nhóm thì advantage của nó càng lớn
for n_ok in (1, 3, 7):
    r = [1] * n_ok + [0] * (8 - n_ok)
    a_ok, a_bad = advantages(r)[[0, -1]]
    print(f"{n_ok} of 8 ok : right {a_ok:+.3f}, wrong {a_bad:+.3f}")

# Cả nhóm cùng điểm: không có tín hiệu học
print("all wrong :", np.round(advantages([0] * 8), 3))

# Nhân mọi phần thưởng với 10: advantage không đổi
scaled = advantages([10 * x for x in group])
print("scaled x10 same:", np.allclose(a, scaled))
