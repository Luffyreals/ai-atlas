import torch
from PIL import Image, ImageDraw
from transformers import CLIPModel, CLIPProcessor

torch.manual_seed(0)
NAME = "openai/clip-vit-base-patch32"  # lần đầu tải 0.6 tới 1.2 GB
model = CLIPModel.from_pretrained(NAME).eval()
processor = CLIPProcessor.from_pretrained(NAME)


def draw(shape, color, n=1):
    # Ảnh 224 x 224 nền trắng, n hình cùng loại xếp thành hàng ngang
    img = Image.new("RGB", (224, 224), "white")
    d = ImageDraw.Draw(img)
    step = 180 // n
    size = step * 3 // 4
    for k in range(n):
        x0, y0 = 22 + k * step + (step - size) // 2, 112 - size // 2
        x1, y1 = x0 + size, y0 + size
        if shape == "circle":
            d.ellipse((x0, y0, x1, y1), fill=color)
        elif shape == "square":
            d.rectangle((x0, y0, x1, y1), fill=color)
        else:
            d.polygon([((x0 + x1) // 2, y0), (x1, y1), (x0, y1)],
                      fill=color)
    return img


def zero_shot(images, labels):
    prompts = [f"a photo of {label}" for label in labels]
    inputs = processor(text=prompts, images=images,
                       return_tensors="pt", padding=True)
    with torch.no_grad():
        out = model(**inputs)
    # logits = cosine / tau; softmax theo hàng: mỗi ảnh một phân phối
    return out.logits_per_image.softmax(dim=1)


print(f"1/tau = {model.logit_scale.exp().item():.1f}")
shapes = [("circle", "red"), ("square", "blue"), ("triangle", "yellow")]
labels = ["a red circle", "a blue circle", "a red square",
          "a blue square", "a yellow triangle"]
probs = zero_shot([draw(s, c) for s, c in shapes], labels)
for (s, c), row in zip(shapes, probs):
    cells = " ".join(f"{p:.3f}" for p in row.tolist())
    print(f"{c} {s}: {cells} -> {labels[row.argmax()]}")

# Đếm: ảnh có 3 hình tròn đỏ, hỏi có mấy hình
counts = ["one red circle", "two red circles", "three red circles",
          "four red circles"]
row = zero_shot([draw("circle", "red", n=3)], counts)[0]
cells = " ".join(f"{p:.3f}" for p in row.tolist())
print(f"3 circles: {cells} -> {counts[row.argmax()]}")
