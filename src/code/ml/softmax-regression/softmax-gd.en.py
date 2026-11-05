import numpy as np
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X, y = load_iris(return_X_y=True)
X = X[:, 2:]  # petal length and petal width (cm)
X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.3, random_state=0, stratify=y)
scaler = StandardScaler().fit(X_tr)  # learn from the training set only
A_tr, A_te = scaler.transform(X_tr), scaler.transform(X_te)
m, K = len(y_tr), 3
Y = np.eye(K)[y_tr]  # one-hot labels: m rows, K columns


def softmax(Z):
    E = np.exp(Z - Z.max(axis=1, keepdims=True))  # subtract each row's max
    return E / E.sum(axis=1, keepdims=True)


# Each column of W is the weight vector w_k of one class.
W, b, eta = np.zeros((2, K)), np.zeros(K), 0.5
for epoch in range(1001):
    P = softmax(A_tr @ W + b)
    if epoch in (0, 1, 10, 100, 1000):
        loss = -np.mean(np.log(P[np.arange(m), y_tr]))
        print(f"epoch {epoch:4d}: loss = {loss:.4f}")
    G = P - Y  # gradient w.r.t. the logits: y_hat - y
    W -= eta * A_tr.T @ G / m
    b -= eta * G.mean(axis=0)

acc = np.mean(np.argmax(A_te @ W + b, axis=1) == y_te)
print(f"GD      test acc = {acc:.4f}")
# With 3 or more classes, LogisticRegression uses softmax by default.
clf = LogisticRegression().fit(A_tr, y_tr)
print(f"sklearn test acc = {clf.score(A_te, y_te):.4f}")
flower = scaler.transform([[4.9, 1.5]])  # petal 4.9 cm x 1.5 cm
print("GD      p =", softmax(flower @ W + b)[0].round(3))
print("sklearn p =", clf.predict_proba(flower)[0].round(3))
