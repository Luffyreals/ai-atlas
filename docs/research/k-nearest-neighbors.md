# K-Nearest Neighbors (KNN)

Bài: `ml/k-nearest-neighbors`. Ghi chú nguồn do `lesson-writer` viết khi soạn bản vi (05/11/2026). Code chỉ dùng `numpy`, `matplotlib`, `scikit-learn` (chạy thử với Python 3.14.5, scikit-learn 1.9.1, NumPy 2.5.3).

Ngày kiểm tra nguồn: **05/11/2026**, bằng WebFetch. Thẻ nguồn: [MLCB6], [SK-NN], [ISL], [CH67]. Ý không có thẻ là kiến thức chung.

## Nguồn

**Đã mở và đọc được:**

- **[MLCB6]** Vũ Hữu Tiệp (trang không ghi tên; repo nguồn thuộc tài khoản `tiepvupsu`), 08/01/2017. [*Machine Learning cơ bản*, Bài 6: K-nearest neighbors](https://machinelearningcoban.com/2017/01/08/knn/). Nguồn tiếng Việt chính. Có: khoảng cách trong không gian vectơ, ví dụ Iris (100 train, 50 test), so K = 1 với K = 10 (K nhỏ nhạy với nhiễu), trọng số `weights='distance'` và hàm trọng số tự định nghĩa, KNN cho hồi quy, chuẩn hóa dữ liệu, ưu nhược điểm, cách tăng tốc. **Không** nói tới lời nguyền số chiều, và không có mục chọn K bằng kiểm định chéo.
- **[SK-NN]** scikit-learn developers. [*scikit-learn 1.8 User Guide*, mục 1.6 Nearest Neighbors](https://scikit-learn.org/1.8/modules/neighbors.html). KNN là học "không tổng quát hóa" (non-generalizing) hay dựa trên mẫu (instance-based): chỉ lưu dữ liệu train, phân loại bằng bỏ phiếu đa số của các láng giềng. Chọn $k$ phụ thuộc dữ liệu; $k$ lớn bớt ảnh hưởng của nhiễu nhưng ranh giới kém rõ. `weights='uniform'` (mặc định) hoặc `'distance'` (trọng số tỉ lệ nghịch khoảng cách). Thuật toán `brute`, `kd_tree` (tốt khi số chiều nhỏ, khoảng dưới 20), `ball_tree`, `auto`. Cảnh báo ở mục 1.6.1: nếu láng giềng thứ $k$ và $k+1$ cách đều nhau mà khác nhãn, kết quả phụ thuộc thứ tự dữ liệu train.
- **[ISL]** James, Witten, Hastie, Tibshirani. [*An Introduction to Statistical Learning*](https://www.statlearning.com/). Trang sách liệt kê bản R lần 1 (2013), lần 2 (2021), bản Python (2023), có PDF. Xem "Chưa xác minh".
- **[CH67]** Cover, T. M., Hart, P. E. (1967). *Nearest neighbor pattern classification*, IEEE Transactions on Information Theory 13(1). DOI [10.1109/TIT.1967.1053964](https://doi.org/10.1109/TIT.1967.1053964) chuyển tới IEEE Xplore, tài liệu 1053964. Chỉ xác minh DOI, chưa đọc toàn văn.

**Chưa xác minh hoặc không mở được:**

| Nguồn | Tình trạng | Quyết định |
|---|---|---|
| [ISL] mục 2.2.3 (bộ phân loại KNN, K = 1 và K = 100) và mục 3.5 (so hồi quy tuyến tính với KNN, lời nguyền số chiều) | Theo hiểu biết chung về sách, chưa mở PDF để đối chiếu số mục. | Dẫn ở "Đọc thêm" theo số mục này; `content-reviewer` nên mở PDF bản 2 kiểm lại. |
| Hastie, Tibshirani, Friedman, *The Elements of Statistical Learning*, mục 2.5 (ví dụ khối lập phương con chứa 10% dữ liệu, cạnh $0.1^{1/n}$) | Host `hastie.su.domains` từ chối kết nối (ECONNREFUSED). | Bỏ khỏi "Đọc thêm". Phép tính $0.1^{1/n}$ trong bài là toán sơ cấp, không trích nguồn. |

## Ý chính

- **Ý tưởng:** đoán nhãn điểm mới bằng nhãn của $k$ điểm train gần nó nhất. Phân loại: bỏ phiếu đa số. Hồi quy: trung bình nhãn. [SK-NN, MLCB6]
- **Học lười:** `fit` chỉ lưu dữ liệu (có thể dựng cây KD hay ball tree để tìm nhanh). Chi phí dồn vào lúc dự đoán. [SK-NN]
- **Chọn $k$:** $k$ nhỏ nhạy với nhiễu (ranh giới răng cưa, overfitting); $k$ lớn mượt quá (underfitting). [SK-NN, MLCB6] Chọn bằng kiểm định chéo (kiến thức chung, nối bài Overfitting).
- **Chuẩn hóa:** đặc trưng thang lớn lấn át khoảng cách. [MLCB6]
- **Trọng số theo khoảng cách:** `weights='distance'`, trọng số $1/d$. [SK-NN, MLCB6]
- **Phá hòa trong scikit-learn 1.9 (đọc mã nguồn trên máy):** `KNeighborsClassifier.predict` với `weights='uniform'` lấy `argmax` của `predict_proba` (hoặc `scipy` mode): hòa phiếu thì chọn lớp đứng trước trong `classes_`, tức nhãn nhỏ nhất. Hòa khoảng cách thì theo thứ tự dữ liệu [SK-NN].
- **Lời nguyền số chiều:** dữ liệu rải đều trong khối đơn vị $n$ chiều, khối con chứa 10% dữ liệu có cạnh $0.1^{1/n}$: 0.1 ($n = 1$), 0.316 ($n = 2$), 0.794 ($n = 10$), 0.977 ($n = 100$). "Láng giềng" không còn gần. Kiến thức chung.
