from torchvision import models

# weights=None: build architecture only, random weights, no download
names = ["alexnet", "vgg16", "resnet18", "resnet50", "mobilenet_v2",
         "mobilenet_v3_small", "efficientnet_b0"]
for name in names:
    model = models.get_model(name, weights=None)
    n = sum(p.numel() for p in model.parameters())
    print(f"{name:20s} {n / 1e6:6.1f}M params")
