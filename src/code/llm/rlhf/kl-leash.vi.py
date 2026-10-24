# Sợi dây KL: chính sách tối ưu của E[r] - beta * KL(pi || pi_ref)
import numpy as np

# Một prompt, ba đáp án: A cụt lủn, B đúng và gọn, C dài dòng, sai một ý
pi_ref = np.array([0.6, 0.3, 0.1])  # xác suất của mô hình SFT
r = np.array([0.0, 1.0, 3.0])  # điểm của RM (thích câu dài)
q = np.array([0.0, 1.0, 0.3])  # chất lượng thật, đời thực không biết
rng = np.random.default_rng(0)
trials = rng.dirichlet(np.ones(3), size=20000)  # phân phối ngẫu nhiên


def kl(p):
    return np.sum(p * np.log(p / pi_ref), axis=-1)


def row(label, p):
    cols = list(p) + [kl(p), p @ r, p @ q]
    print(f"{label:>4} " + " ".join(f"{x:6.3f}" for x in cols))


print("beta   pi(A)  pi(B)  pi(C)     KL   E[r]   E[q]")
row("ref", pi_ref)
for beta in (10, 3, 1.5, 1, 0.5, 0.3):
    # nghiệm tối ưu: pi_ref nhân e^(r/beta), rồi chuẩn hóa tổng về 1
    pi = pi_ref * np.exp(r / beta)
    pi /= pi.sum()
    best = pi @ r - beta * kl(pi)
    # kiểm: không phân phối ngẫu nhiên nào có mục tiêu lớn hơn
    assert np.all(trials @ r - beta * kl(trials) <= best + 1e-12)
    row(beta, pi)
