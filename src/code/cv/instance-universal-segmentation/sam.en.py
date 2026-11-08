import numpy as np
import torch
from PIL import Image, ImageDraw
from transformers import SamModel, SamProcessor

torch.manual_seed(0)
# Hand-drawn 256 x 256 image: two touching circles and one square
img = Image.new("RGB", (256, 256), (235, 230, 220))
draw = ImageDraw.Draw(img)
draw.ellipse((20, 40, 100, 120), fill=(200, 60, 50))    # circle A
draw.ellipse((100, 40, 180, 120), fill=(200, 60, 50))   # circle B
draw.rectangle((60, 160, 140, 230), fill=(50, 90, 170))  # square C

# Ground-truth masks, redrawn per object on a binary canvas
def true_mask(shape, box):
    m = Image.new("L", (256, 256), 0)
    getattr(ImageDraw.Draw(m), shape)(box, fill=1)
    return np.array(m, dtype=bool)
gt = {"A": true_mask("ellipse", (20, 40, 100, 120)),
      "B": true_mask("ellipse", (100, 40, 180, 120)),
      "C": true_mask("rectangle", (60, 160, 140, 230))}
points = {"A": [60, 80], "B": [140, 80], "C": [100, 195]}  # (x, y)

name = "facebook/sam-vit-base"  # about 375 MB
processor = SamProcessor.from_pretrained(name)
model = SamModel.from_pretrained(name).eval()

# Image encoder (ViT) runs once for the entire image
inputs = processor(img, return_tensors="pt")
with torch.no_grad():
    emb = model.get_image_embeddings(inputs["pixel_values"])
print("image embedding:", tuple(emb.shape))

for key, xy in points.items():
    # Each point prompt only re-runs the lightweight decoder
    p = processor(img, input_points=[[[xy]]], return_tensors="pt")
    with torch.no_grad():
        out = model(image_embeddings=emb,
                    input_points=p["input_points"])
    masks = processor.image_processor.post_process_masks(
        out.pred_masks, p["original_sizes"],
        p["reshaped_input_sizes"])[0][0]  # 3 masks for 1 point
    scores = out.iou_scores[0, 0]
    ious = [(m.numpy() & gt[key]).sum() / (m.numpy() | gt[key]).sum()
            for m in masks]
    print(key, "area:", [int(m.sum()) for m in masks],
          "truth:", int(gt[key].sum()))
    print("  iou_scores:", np.round(scores.numpy(), 3))
    print("  IoU vs truth:", np.round(ious, 3),
          "best:", int(scores.argmax()))
