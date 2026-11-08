# Image token budget for LLaVA-style models, computed in pure Python.


def crop_tokens(side, patch):
    # One square crop of side `side`, patch size `patch`: g x g tokens
    g = side // patch
    return g * g, g


def anyres(rows, cols, side=336, patch=14, newline=True):
    # A rows x cols grid of crops, plus one thumbnail for the full view
    t, g = crop_tokens(side, patch)
    n = (rows * cols + 1) * t
    if newline:
        n += rows * g  # one "newline" token after each feature row
    return n


print("one image")
for side, patch in [(224, 14), (336, 14), (384, 14)]:
    print(f"  {side}px, P={patch}: {crop_tokens(side, patch)[0]} tokens")

print("AnyRes on 336px crops (rows x cols)")
print("  grid  pixels      no-newline  with-newline")
for r, c in [(1, 1), (1, 2), (2, 1), (2, 2), (1, 3), (3, 1)]:
    px = f"{336 * c}x{336 * r}"
    print(f"  {r}x{c}   {px:<10}  {anyres(r, c, newline=False):>10}"
          f"  {anyres(r, c):>12}")

print("check vs LLaVA-OneVision processor (384px crops)")
for r, c in [(1, 1), (1, 2), (2, 2), (2, 3)]:
    print(f"  {r}x{c}: {anyres(r, c, side=384)}")

window, text = 4096, 500  # context window and tokens reserved for text
print(f"images that fit in {window} tokens (text {text})")
for name, n in [("336px single", 576), ("AnyRes 2x2", anyres(2, 2))]:
    print(f"  {name}: {n} tokens each -> fits {(window - text) // n}")
