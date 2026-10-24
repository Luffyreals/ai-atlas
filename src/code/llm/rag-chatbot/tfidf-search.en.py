# TF-IDF retrieval over 5 chunks of an employee handbook
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

chunks = {
    "leave": "Full-time employees get 12 days of paid annual leave. "
             "Unused leave days carry over to the first quarter of next year.",
    "remote": "Each week, employees may work remotely for up to two days, "
              "if their team lead agrees in advance.",
    "laptop": "The company gives each new employee a laptop. If it breaks, "
              "tell the IT team to have it repaired or replaced.",
    "salary": "Salary is paid by bank transfer on the 5th of each month. "
              "If the 5th falls on a day off, it is paid on the last "
              "working day before.",
    "insurance": "The company pays health insurance for employees from "
                 "the first month. The card is emailed within two weeks.",
}
names = list(chunks)

# Each row of X is the TF-IDF vector of one chunk, scaled to length 1
vec = TfidfVectorizer()
X = vec.fit_transform(chunks.values())
print("X shape:", X.shape)


def search(label, question, k=3):
    q = vec.transform([question])  # uses the vocabulary of the chunks
    scores = (X @ q.T).toarray().ravel()  # length 1, so dot product = cosine
    top = np.argsort(-scores, kind="stable")[:k]  # the k best chunks
    print(label, " | ".join(f"{names[i]} {scores[i]:.3f}" for i in top))


search("Q1:", "How many days of paid leave do I get per year?")
# One idea, asked two ways: other words, and the words of the "remote" chunk
search("Q2:", "Can I do my job from home?")
search("Q3:", "Can I work remotely?")
