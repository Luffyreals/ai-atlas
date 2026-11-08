# Sentiment classification: TF-IDF (unigram, then + bigram) + logreg
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score

# Hand-written restaurant reviews, separated by ";" (data: vi)
TRAIN_POS = """đồ ăn ngon, phục vụ nhanh; món nào cũng ngon; giá rẻ mà ngon
quán sạch, giá rẻ; nhân viên vui vẻ, phục vụ nhanh; phở ngon, đậm đà
đồ ăn không tệ; cà phê không tệ, giá rẻ; phục vụ nhanh, quán sạch
giá không đắt; quán sạch sẽ, thoáng mát; sẽ quay lại
chắc chắn sẽ quay lại lần nữa; cơm ngon, giá không đắt
trà sữa ngon, giao nhanh; bún bò ngon, quán sạch
rất hài lòng, sẽ quay lại; bánh mì ngon, giá rẻ
không gian sạch, nhân viên vui vẻ; lẩu ngon, phục vụ không chậm
nhà vệ sinh sạch, phục vụ nhanh; rất ngon, rất đáng tiền
hài lòng với đồ ăn; cơm tấm ngon tuyệt; giao nhanh, đồ ăn còn nóng"""
# 18 negative training reviews (data: vi)
TRAIN_NEG = """đồ ăn không ngon, phục vụ chậm; không ngon chút nào
phở không ngon, giá đắt; đồ ăn tệ, giá đắt; quán bẩn, bàn dính dầu
phục vụ chậm, nhân viên cau có; quán không sạch; đồ ăn tệ, phục vụ chậm
sẽ không quay lại; không hài lòng, sẽ không quay lại
giao chậm, đồ ăn nguội; trà sữa không ngon, quá ngọt
nhà vệ sinh không sạch; cơm không ngon, phục vụ chậm
rất tệ, không đáng tiền; bánh mì không ngon, giá đắt
nhân viên không vui vẻ; lẩu tệ, quán bẩn"""
# Separate test set, no overlap with the training sentences (data: vi)
TEST_POS = """bún chả ngon, giá rẻ; bánh cuốn ngon, nhân viên vui vẻ
đồ uống không tệ; giá không đắt, sẽ quay lại; nhân viên vui vẻ
rất hài lòng với lẩu"""
# 5 negative test reviews (data: vi)
TEST_NEG = """món này không ngon; quán không sạch, giá đắt
bún chả không ngon, phục vụ chậm; cà phê không ngon, quá đắt
giao chậm, quán bẩn"""
NEW = ["đồ ăn ngon nhưng phục vụ chậm", "chẳng ngon gì cả",  # data: vi
       "ngon đến mức không muốn quay lại"]  # data: vi

def load(pos, neg):
    pos = [s.strip() for s in pos.replace("\n", ";").split(";")]
    neg = [s.strip() for s in neg.replace("\n", ";").split(";")]
    return pos + neg, ["pos"] * len(pos) + ["neg"] * len(neg)

X_train, y_train = load(TRAIN_POS, TRAIN_NEG)
X_test, y_test = load(TEST_POS, TEST_NEG)
print(f"train {len(X_train)}, test {len(X_test)}")
for n in (1, 2):
    vec = TfidfVectorizer(ngram_range=(1, n))  # n = 2: add bigrams
    clf = LogisticRegression().fit(vec.fit_transform(X_train), y_train)
    pred = clf.predict(vec.transform(X_test))
    acc = accuracy_score(y_test, pred)
    f1 = f1_score(y_test, pred, average="macro")
    print(f"\nngram_range=(1, {n}): accuracy {acc:.3f}, F1 macro {f1:.3f}")
    print(confusion_matrix(y_test, pred, labels=["pos", "neg"]))
    print("wrong:", [s for s, t, p in zip(X_test, y_test, pred) if t != p])
    # classes_ is ['neg', 'pos']: positive weights push toward "pos"
    names, order = vec.get_feature_names_out(), np.argsort(clf.coef_[0])
    print("top neg:", ", ".join(names[order[:5]]))
    print("top pos:", ", ".join(names[order[::-1][:5]]))
    for s, p in zip(NEW, clf.predict_proba(vec.transform(NEW))[:, 1]):
        print(f"P(pos) = {p:.2f}  {s}")
