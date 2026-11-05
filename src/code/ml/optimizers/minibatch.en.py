import warnings

import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.exceptions import ConvergenceWarning
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

# 20 epochs is deliberately few, so silence the "not converged" warning
warnings.filterwarnings("ignore", category=ConvergenceWarning)

X, y = load_digits(return_X_y=True)  # 8x8 digit images, pixels 0..16
X_train, X_test, y_train, y_test = train_test_split(
    X / 16, y, test_size=0.25, random_state=0)  # scale pixels to [0, 1]

optimizers = {
    "SGD": dict(solver="sgd", momentum=0.0),
    "Momentum": dict(solver="sgd", momentum=0.9, nesterovs_momentum=False),
    "Adam": dict(solver="adam"),  # beta1 = 0.9, beta2 = 0.999 by default
}
for name, options in optimizers.items():
    # same network, same initialisation, same eta = 0.01, 64 images per batch
    model = MLPClassifier(hidden_layer_sizes=(32,), batch_size=64,
                          learning_rate_init=0.01, max_iter=20,
                          random_state=0, **options)
    model.fit(X_train, y_train)
    plt.plot(range(1, 21), model.loss_curve_, marker=".", label=name)
    loss, acc = model.loss_curve_[-1], model.score(X_test, y_test)
    print(f"{name:8s}: loss = {loss:.4f}, test acc = {acc:.3f}")

plt.xlabel("epoch")
plt.ylabel("training loss")
plt.yscale("log")
plt.legend()
plt.show()
