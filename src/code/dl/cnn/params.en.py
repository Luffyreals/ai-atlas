# Đếm tham số: MLP và CNN cho cùng một ảnh xám 28x28, 10 lớp


def out_size(n, k, p=0, s=1):
    """Kích thước đầu ra: floor((n + 2p - k) / s) + 1."""
    return (n + 2 * p - k) // s + 1


def dense(n_in, n_out):
    return n_in * n_out + n_out           # trọng số + hệ số tự do


def conv(c_in, c_out, k):
    return k * k * c_in * c_out + c_out   # mỗi kernel k x k x c_in, 1 bias


# MLP: trải phẳng 784 điểm ảnh -> 128 -> 10
mlp = dense(28 * 28, 128) + dense(128, 10)
print(f"MLP params: {mlp:,}")

# CNN: conv 3x3 (1->8) -> pool 2 -> conv 3x3 (8->16) -> pool 2 -> dense
n = 28
total = 0
for c_in, c_out in [(1, 8), (8, 16)]:
    total += conv(c_in, c_out, 3)
    n = out_size(n, k=3)                 # tích chập "valid"
    print(f"conv {c_in}->{c_out}: {n}x{n}x{c_out}", end="")
    n = out_size(n, k=2, s=2)            # max-pooling 2x2, bước 2
    print(f" -> pool: {n}x{n}x{c_out}")
total += dense(n * n * 16, 10)
print(f"CNN params: {total:,}")

# Chỉ riêng lớp đầu: kết nối đầy đủ cần bao nhiêu tham số
# để ra cùng số giá trị như conv 1->8 (26x26x8)?
print(f"dense 784 -> 26*26*8: {dense(784, 26 * 26 * 8):,}")
print(f"conv 1->8, 3x3:       {conv(1, 8, 3):,}")
