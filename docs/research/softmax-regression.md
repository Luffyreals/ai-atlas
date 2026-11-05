# Hồi quy Softmax

Bài: `ml/softmax-regression` (tiền đề: `ml/logistic-regression`). Code chỉ dùng `numpy`, `scikit-learn`, `matplotlib` (Pyodide, scikit-learn 1.8; chạy thử trên máy bằng Python 3.14.5, NumPy 2.5.3, scikit-learn 1.9.1, Matplotlib 3.11.2). Dữ liệu: `load_iris`, hai cột cánh hoa (`X[:, 2:]`), `train_test_split(test_size=0.3, random_state=0, stratify=y)`.

Ngày kiểm tra nguồn: **05/11/2026**, bằng WebFetch và Crossref API (`lesson-writer`). Thẻ nguồn: [MLCB13], [D2L41], [SK-LM], [F36], [B90]. Ý không có thẻ là kiến thức chung.

## Nguồn

**Đã mở và đọc được:**

- **[MLCB13]** Vũ Hữu Tiệp (2017). [*Machine Learning cơ bản*, Bài 13: Softmax Regression](https://machinelearningcoban.com/2017/02/17/softmax/). Đi từ one-vs-rest (đầu ra tính độc lập nên không cộng lại bằng 1) tới softmax; mục 2.4 về ổn định số (trừ giá trị lớn nhất), có hàm `softmax_stable`; cross-entropy; code NumPy. Ký hiệu: $C$ lớp, $N$ mẫu, $d$ chiều, thêm số 1 vào $\mathbf{x}$ để gộp hệ số tự do, $\mathbf{W}$ có $C$ cột.
- **[D2L41]** Zhang, A., Lipton, Z. C., Li, M., Smola, A. J. (2023). [*Dive into Deep Learning*, mục 4.1: Softmax Regression](https://d2l.ai/chapter_linear-classification/softmax-regression.html) (bản 1.0.3). One-hot (nhãn không có thứ tự), softmax, cross-entropy qua likelihood và lý thuyết thông tin, gradient theo logit bằng softmax trừ nhãn, ghi chú về nhiệt độ. Trang không ghi tên tác giả; tên lấy từ bìa sách (hiểu biết chung).
- **[SK-LM]** scikit-learn developers. [*scikit-learn 1.8 User Guide*: 1.1.11.2 Multinomial Case](https://scikit-learn.org/1.8/modules/linear_model.html#multinomial-case). Mở rộng nhị phân sang $K$ lớp; dùng $K$ vectơ trọng số dù $K - 1$ là đủ ("overparameterize"), để giữ đối xứng giữa các lớp, quan trọng khi có regularization; không phạt thì nghiệm có thể không duy nhất. `lbfgs` là bộ giải mặc định; mọi bộ giải trừ `liblinear` hỗ trợ multinomial. (Trang dài, công cụ đọc 100 000 ký tự đầu.)
- Docstring `LogisticRegression` trên máy (scikit-learn 1.9.1): "For multiclass problems (whenever `n_classes >= 3`), all solvers except 'liblinear' optimize the (penalized) multinomial loss." Chữ ký không còn `multi_class`; `penalty` deprecated từ 1.8 (dùng `C`, `l1_ratio`). Bài chỉ dùng `LogisticRegression()` mặc định, chạy được cả 1.7–1.9.

**Chỉ xác minh thông tin thư mục (Crossref API), chưa đọc nội dung:**

- **[F36]** Fisher, R. A. (1936). [*The Use of Multiple Measurements in Taxonomic Problems*](https://doi.org/10.1111/j.1469-1809.1936.tb02137.x). *Annals of Eugenics* 7(2), 179–188.
- **[B90]** Bridle, J. S. (1990). [*Probabilistic Interpretation of Feedforward Classification Network Outputs, with Relationships to Statistical Pattern Recognition*](https://doi.org/10.1007/978-3-642-76153-9_28). Trong *Neurocomputing* (Springer), 227–236.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| [B90] là nơi đặt tên "softmax" | Hiểu biết chung, chưa đọc bài (Springer chuyển hướng sang trang đăng nhập) | Trong bài viết "thường được dẫn là nơi đặt tên", không khẳng định hơn |
| Phiên bản scikit-learn bỏ hẳn `multi_class` | Chỉ thấy chữ ký 1.9.1 không còn tham số này | Bài viết "đã bị bỏ ở các bản scikit-learn mới", không nêu số phiên bản |

## Số tự chạy (dùng trong mục Trực giác, không có trong ô code)

Ba bộ phân loại one-vs-rest: `make_pipeline(StandardScaler(), LogisticRegression()).fit(X_tr, y_tr == k)` với $k = 0, 1, 2$, cùng cách chia như bài.

- Bông hoa cánh 4.9 cm × 1.5 cm: xác suất "có" là 0.008 (setosa), 0.425 (versicolor), 0.350 (virginica), tổng 0.783.
- Trên cả 150 bông: tổng ba xác suất từ 0.405 (bông 3.6 × 1.3) tới 1.539 (bông 6.7 × 2.0).
- Mô hình softmax `LogisticRegression()` cho cùng bông hoa logit $(-2.954, 1.804, 1.151)$; bài làm tròn thành $(-3.0, 1.8, 1.2)$.
- Điểm ba ranh giới gặp nhau (đơn vị cm): khoảng $(-0.75, 3.05)$, ngoài khung hình của ô code thứ ba.
- GD tự viết chạy tới epoch 5000: loss 0.0891 (epoch 2000: 0.0921), trọng số lớn nhất theo trị tuyệt đối 5.11 (epoch 1000) → 6.43 (epoch 5000).

## Ý chính dùng trong bài

- One-vs-rest và nhược điểm xác suất không cộng lại bằng 1 [MLCB13].
- Softmax, bất biến khi cộng hằng số, trừ max để ổn định số [MLCB13, D2L41].
- One-hot, cross-entropy, gradient theo logit $\hat{\mathbf{y}} - \mathbf{y}$ [D2L41]; bài dẫn qua dạng $\ell = -z_c + \ln\sum_k e^{z_k}$.
- $K$ vectơ trọng số, nghiệm không duy nhất khi không phạt [SK-LM].
