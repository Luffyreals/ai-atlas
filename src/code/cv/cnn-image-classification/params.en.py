# Đếm tham số và phép nhân-cộng (bỏ qua bias cho gọn)


def dense(h, w, c_in, c_out):
    # Lớp kết nối đầy đủ: mỗi điểm ra nối với mọi điểm vào
    return (h * w * c_in) * (h * w * c_out)


def conv(k, c_in, c_out):
    # Tích chập thường: c_out kernel, mỗi kernel k x k x c_in
    return k * k * c_in * c_out


def separable(k, c_in, c_out):
    # Depthwise (một kernel k x k mỗi kênh) + pointwise 1x1
    return k * k * c_in + c_in * c_out


# 1) Ảnh 32x32x3 ra 16 bản đồ đặc trưng cùng cỡ
print(f"dense 32x32x3 -> 32x32x16: {dense(32, 32, 3, 16):,}")
print(f"conv 3x3, 3 -> 16:         {conv(3, 3, 16):,}")

# 2) Một lớp của MobileNet: bản đồ 14x14, 512 kênh vào và ra
hw = 14 * 14
std, sep = conv(3, 512, 512), separable(3, 512, 512)
print(f"standard:  {std:,} params, {std * hw / 1e6:.1f}M mult-adds")
print(f"separable: {sep:,} params, {sep * hw / 1e6:.1f}M mult-adds")
print(f"ratio: {sep / std:.4f} vs 1/N + 1/k^2 = {1 / 512 + 1 / 9:.4f}")

# 3) Ba lớp 3x3 xếp chồng so với một lớp 7x7, C kênh vào và ra
C = 64
print(f"three 3x3: {3 * conv(3, C, C):,}  one 7x7: {conv(7, C, C):,}")
rf = 1
for layer in range(1, 4):
    rf += 3 - 1  # mỗi lớp 3x3, stride 1, nới trường nhìn thêm 2
    print(f"after {layer} conv 3x3: receptive field {rf}x{rf}")
