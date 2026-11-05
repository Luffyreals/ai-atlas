import torch
from PIL import Image, ImageDraw
from torchvision import tv_tensors
from torchvision.transforms import v2

torch.manual_seed(0)
# Ảnh 128 x 128 tự vẽ: nền xám, hình vuông đỏ (lớp 1), hình tròn xanh (lớp 2)
pil = Image.new("RGB", (128, 128), (128, 128, 128))
draw = ImageDraw.Draw(pil)
draw.rectangle([16, 20, 60, 64], fill=(220, 40, 40))
draw.ellipse([70, 60, 116, 106], fill=(40, 40, 220))
img = v2.functional.pil_to_tensor(pil)          # (3, 128, 128), uint8
mask = torch.zeros(128, 128, dtype=torch.uint8)
mask[20:65, 16:61] = 1
mask[img[2] > 200] = 2                           # pixel xanh dương là lớp 2
img = tv_tensors.Image(img)
mask = tv_tensors.Mask(mask)
box = tv_tensors.BoundingBoxes([[16, 20, 61, 65]], format="XYXY",
                               canvas_size=(128, 128))

train_tf = v2.Compose([
    v2.RandomResizedCrop(96, scale=(0.5, 1.0)),  # cắt ngẫu nhiên rồi co về 96
    v2.RandomHorizontalFlip(p=0.5),
    v2.RandomRotation(15),
    v2.ColorJitter(brightness=0.4, contrast=0.4, saturation=0.4),
    v2.ToDtype(torch.float32, scale=True),       # uint8 0..255 -> 0..1
])


def color_class(x):
    # Đoán lớp của từng pixel từ màu: đỏ trội -> 1, xanh trội -> 2
    r, b = x[0], x[2]
    return (r - b > 0.2).long() + 2 * (b - r > 0.2).long()


def agree(x, m):
    return (color_class(x) == m.long()).float().mean().item()


# Đúng: gọi một lần, ảnh, mask và hộp đi qua cùng một phép biến đổi
out_img, out_mask, out_box = train_tf(img, mask, box)
print("image:", tuple(out_img.shape), out_img.dtype)
print("mask:", tuple(out_mask.shape), out_mask.dtype,
      "values", out_mask.unique().tolist())
print("box before:", box.tolist(), "after:", out_box.round().tolist())
print(f"agreement, one call: {agree(out_img, out_mask):.3f}")

# Sai: gọi hai lần riêng, mỗi lần bốc thăm một phép cắt và xoay khác nhau
img2 = train_tf(img)
mask2 = train_tf(mask)
print(f"agreement, two calls: {agree(img2, mask2):.3f}")
