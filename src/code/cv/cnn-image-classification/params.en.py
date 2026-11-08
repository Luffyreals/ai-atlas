# Count parameters and multiply-adds (ignoring bias for brevity)


def dense(h, w, c_in, c_out):
    # Fully connected layer: every output connects to every input
    return (h * w * c_in) * (h * w * c_out)


def conv(k, c_in, c_out):
    # Standard conv: c_out kernels, each k x k x c_in
    return k * k * c_in * c_out


def separable(k, c_in, c_out):
    # Depthwise (one k x k kernel per channel) + 1x1 pointwise
    return k * k * c_in + c_in * c_out


# 1) 32x32x3 image to 16 feature maps of the same size
print(f"dense 32x32x3 -> 32x32x16: {dense(32, 32, 3, 16):,}")
print(f"conv 3x3, 3 -> 16:         {conv(3, 3, 16):,}")

# 2) One MobileNet layer: 14x14 feature map, 512 in and out channels
hw = 14 * 14
std, sep = conv(3, 512, 512), separable(3, 512, 512)
print(f"standard:  {std:,} params, {std * hw / 1e6:.1f}M mult-adds")
print(f"separable: {sep:,} params, {sep * hw / 1e6:.1f}M mult-adds")
print(f"ratio: {sep / std:.4f} vs 1/N + 1/k^2 = {1 / 512 + 1 / 9:.4f}")

# 3) Three stacked 3x3 layers vs one 7x7 layer, C in and out channels
C = 64
print(f"three 3x3: {3 * conv(3, C, C):,}  one 7x7: {conv(7, C, C):,}")
rf = 1
for layer in range(1, 4):
    rf += 3 - 1  # each 3x3 stride-1 layer widens the receptive field by 2
    print(f"after {layer} conv 3x3: receptive field {rf}x{rf}")
