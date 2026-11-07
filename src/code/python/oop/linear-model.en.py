class LinearModel:
    def __init__(self, learning_rate: float = 0.05):
        self.lr = learning_rate
        self.w = 0.0
        self.b = 0.0

    def predict(self, x: float) -> float:
        return self.w * x + self.b

    def fit(self, x_data: list[float], y_data: list[float], epochs: int = 50):
        m = len(x_data)
        for _ in range(epochs):
            # Compute MSE gradients for weight w and bias b
            dw = sum(2 * (self.predict(x) - y) * x for x, y in zip(x_data, y_data)) / m
            db = sum(2 * (self.predict(x) - y) for x, y in zip(x_data, y_data)) / m
            self.w -= self.lr * dw
            self.b -= self.lr * db


# Sample training data (underlying relation: y = 2x + 1)
X_train = [1.0, 2.0, 3.0, 4.0]
y_train = [3.0, 5.0, 7.0, 9.0]

# Initialize model and optimize parameters
model = LinearModel(learning_rate=0.05)
model.fit(X_train, y_train, epochs=200)

print(f"Weight w: {model.w:.3f}")
print(f"Bias b: {model.b:.3f}")
print(f"Prediction for x=5: {model.predict(5.0):.3f}")
