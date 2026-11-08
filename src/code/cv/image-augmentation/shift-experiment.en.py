import numpy as np
from scipy import ndimage
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

rng = np.random.default_rng(0)
digits = load_digits()
X = digits.images / 16
X_tr, X_te, y_tr, y_te = train_test_split(
    X, digits.target, train_size=300, stratify=digits.target,
    random_state=0)


def random_shift(imgs):
    # Shift each image randomly by up to 1 px per axis, filling blanks with 0
    moves = rng.integers(-1, 2, size=(len(imgs), 2))
    return np.stack([ndimage.shift(im, mv, order=0, cval=0)
                     for im, mv in zip(imgs, moves)])


# Second test set: the same test images, each shifted randomly
X_te_shift = random_shift(X_te)

# Augmentation on the training set only: add 4 random shifts per image
X_aug = np.concatenate([X_tr] + [random_shift(X_tr) for _ in range(4)])
y_aug = np.tile(y_tr, 5)

for name, Xa, ya in [("no aug", X_tr, y_tr), ("shift aug", X_aug, y_aug)]:
    # Small MLP: one hidden layer of 64 neurons, same seed for both runs
    clf = MLPClassifier((64,), max_iter=1000, random_state=0)
    clf.fit(Xa.reshape(len(Xa), -1), ya)
    acc = clf.score(X_te.reshape(len(X_te), -1), y_te)
    acc_s = clf.score(X_te_shift.reshape(len(X_te), -1), y_te)
    print(f"{name:9s} train {len(Xa):4d}: test {acc:.3f}, "
          f"shifted test {acc_s:.3f}")
