import numpy as np


def softmax_naive(z):
    # Cách ngây thơ: lấy mũ thẳng từng logit.
    e = np.exp(z)
    return e / e.sum()


def softmax(z):
    # Trừ logit lớn nhất trước: kết quả không đổi, mũ lớn nhất là e^0 = 1.
    e = np.exp(z - z.max())
    return e / e.sum()


# Ba logit của một bông hoa: setosa, versicolor, virginica.
z = np.array([-3.0, 1.8, 1.2])
p = softmax(z)
print("p      =", p.round(4), f" sum = {p.sum():.4f}")

# Cộng cùng một hằng số vào mọi logit: xác suất giữ nguyên.
print("z + 5  =", softmax(z + 5).round(4))

# Logit lớn: e^1001.8 vượt quá số thực lớn nhất (khoảng 1.8e308).
big = z + 1000
with np.errstate(over="ignore", invalid="ignore"):
    print("naive  =", softmax_naive(big))
print("stable =", softmax(big).round(4))

# K = 2: softmax của (z1, z2) bằng sigmoid của z1 - z2.
z2 = np.array([1.8, 1.2])
sigmoid = 1 / (1 + np.exp(-(z2[0] - z2[1])))
print("K=2    =", softmax(z2).round(4), f" sigmoid = {sigmoid:.4f}")
