# Decision Tree và Random Forest

Bài: `ml/decision-tree-random-forest`. Code chỉ dùng `numpy`, `scikit-learn` (chạy thử trên máy với Python 3.14.5, scikit-learn 1.9.1; Pyodide có scikit-learn 1.8). Không có VIZ tương tác; một hình tĩnh `DecisionTreeFigure`.

Ngày kiểm tra nguồn: **05/11/2026**, bằng WebFetch. Thẻ nguồn: [SK-TREE], [SK-ENS], [SK-PERM], [MLCB34], [BRE01], [ISL]. Ý không có thẻ là kiến thức chung của `lesson-writer`.

## Nguồn

**Đã mở và đọc được:**

- **[SK-TREE]** scikit-learn developers. [*scikit-learn 1.8 User Guide*: Decision Trees](https://scikit-learn.org/1.8/modules/tree.html), mục 1.10. CART dựng cây nhị phân, chọn cặp (đặc trưng, ngưỡng) cho độ lợi lớn nhất ở mỗi nút; scikit-learn dùng bản CART tối ưu, chưa hỗ trợ biến phân loại. Công thức mục 1.10.7: Gini $\sum_k p_{mk}(1 - p_{mk})$ (bằng $1 - \sum_k p_{mk}^2$), entropy $-\sum_k p_{mk}\log p_{mk}$; hồi quy dùng MSE quanh trung bình của nút, lá dự đoán trung bình. Mục 1.10.9: cắt tỉa theo độ phức tạp $R_\alpha(T) = R(T) + \alpha|\widetilde{T}|$, tham số `ccp_alpha`. Nhược điểm được liệt kê: overfitting (chữa bằng cắt tỉa, `min_samples_leaf`, `max_depth`), không ổn định khi dữ liệu đổi nhỏ (chữa bằng tổ hợp), dự đoán bậc thang nên không ngoại suy được, tìm cây tối ưu là NP-đầy đủ nên dùng thuật toán tham lam. Ưu điểm: cần ít chuẩn bị dữ liệu (không cần chuẩn hóa). Trang không dùng chữ "axis-parallel"; ý ranh giới song song trục là kiến thức chung.
- **[SK-ENS]** scikit-learn developers. [*scikit-learn 1.8 User Guide*: Ensembles](https://scikit-learn.org/1.8/modules/ensemble.html), mục 1.11.2. Mỗi cây học trên mẫu bootstrap (`bootstrap=True` mặc định), mỗi lần chia xét một tập con ngẫu nhiên đặc trưng (`max_features`, gợi ý `"sqrt"` cho phân loại). scikit-learn **lấy trung bình xác suất** dự đoán, không bỏ phiếu cứng như bài gốc của Breiman. `oob_score=True` cho ước lượng trên mẫu ngoài túi. Mục 1.11.2.5: độ quan trọng MDI, các số dương và cộng lại bằng 1; cảnh báo: tính trên tập train, và ưu ái đặc trưng nhiều giá trị khác nhau; gợi ý dùng permutation importance.
- **[SK-PERM]** scikit-learn developers. [*Permutation Importance vs Random Forest Feature Importance (MDI)*](https://scikit-learn.org/1.8/auto_examples/inspection/plot_permutation_importance.html), bản 1.8. Ví dụ cho thấy MDI có thể xếp một cột ngẫu nhiên vô nghĩa lên cao; permutation importance trên tập test xếp đúng hơn. Bài chỉ nhắc `permutation_importance` trong hộp Lỗi hay gặp, không đưa nguồn này vào Đọc thêm (đã đủ 5 nguồn).
- **[MLCB34]** Vũ Hữu Tiệp, 14/01/2018. [*Machine Learning cơ bản*, Bài 34: Decision Trees (1): Iterative Dichotomiser 3](https://machinelearningcoban.com/2018/01/14/id3/). **Nguồn tiếng Việt chính.** Nút gốc, nút trong, nút lá; entropy, độ lợi thông tin; thuật toán ID3 tham lam, ví dụ bảng thời tiết; điều kiện dừng và cắt tỉa. Không nói về Gini. ID3 chia nhiều nhánh theo giá trị của thuộc tính phân loại, khác cây nhị phân của CART (bài ghi rõ điểm này ở mục Đọc thêm). Bài AI Atlas **không** dùng bảng chơi tennis kinh điển; bảng 12 buổi chiều đá bóng là tự tạo.
- **[BRE01]** Breiman, L. (2001). *Random Forests*. Machine Learning 45(1), 5–32. DOI [10.1023/A:1010933404324](https://doi.org/10.1023/A:1010933404324): doi.org chuyển hướng tới link.springer.com (đã kiểm tra), trang Springer đòi đăng nhập nên chưa đọc được tóm tắt. Nội dung dẫn trong bài (chọn ngẫu nhiên đặc trưng ở mỗi lần chia, ước lượng OOB, thêm cây không gây overfitting) là kiến thức chung, khớp với [SK-ENS].
- **[ISL]** James, Witten, Hastie, Tibshirani. [*An Introduction to Statistical Learning*](https://www.statlearning.com/). Trang liệt kê bản R lần 1 (2013), lần 2 (2021), bản Python (2023). Chương 8 của bản 2 là "Tree-Based Methods" (cây, cắt tỉa, bagging, random forest, boosting): theo hiểu biết chung, trang chủ không đánh số chương nên chưa xác minh trực tiếp.

**Chưa xác minh hoặc không mở được:**

| Nguồn | Tình trạng | Quyết định |
|---|---|---|
| Hastie, Tibshirani, Friedman, *The Elements of Statistical Learning*, mục 15.2, công thức phương sai của trung bình $B$ biến có tương quan $\rho$ | `hastie.su.domains` từ chối kết nối (05/11/2026), như các phiên trước. | Bài tự dẫn công thức $\rho\sigma^2 + \frac{1-\rho}{B}\sigma^2$ trong khối `<details>`, không dẫn ESL. |
| Breiman, Friedman, Olshen, Stone (1984), *Classification and Regression Trees* | Sách, không mở. | Bài chỉ nêu tên và năm khi giới thiệu CART, không đưa vào Đọc thêm. |

## Dữ liệu tự tạo

Bảng 12 buổi chiều (mưa 0/1, nhiệt độ °C, gió mạnh 0/1 → đi đá bóng 0/1), số liệu tự tạo, không marker `# dataset:`:

```
rain  = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
temp  = [30, 35, 27, 32, 28, 25, 34, 31, 29, 36, 29, 26]
windy = [0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1]
play  = [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0]
```

Thiết kế để: (1) "mưa" thắng ở gốc theo cả Gini lẫn entropy; (2) nhánh không mưa tách thuần bằng `temp <= 33`; (3) cây giống nhau với mọi `random_state` (đã thử 0–19). Ngưỡng nhiệt độ ở gốc có hai ngưỡng tốt nhất bằng nhau (27.5 và 33, cùng $G_{\text{chia}} = 0.3704$); bài chỉ nói tới 33.

Bảng bootstrap ở mục Minh họa sinh bằng đoạn sau (không phải ô code của bài):

```python
rng = np.random.default_rng(0)
for b in range(3):
    idx = rng.integers(0, 12, 12)                 # rút 12 buổi có hoàn lại
    oob = np.setdiff1d(np.arange(12), idx)        # buổi ngoài túi
    t = DecisionTreeClassifier(random_state=0).fit(X[idx], play[idx])
```

Kết quả: cây 1 gốc `temp <= 33`, OOB 2, 5, 6, 9, 12, đúng 5/5; cây 2 gốc `windy <= 0.5`, OOB 2, 3, 5, 6, 11, đúng 4/5 (sai buổi 6); cây 3 gốc `temp <= 32`, OOB 4, 6, 8, 12, đúng 2/4 (sai buổi 4 và 6). Phiếu OOB của buổi 6: cây 1 "không", cây 2 và 3 "có".

## Ý chính

- Cây là chuỗi câu hỏi $x_j \le t$; lá phân loại dự đoán lớp đa số, lá hồi quy dự đoán trung bình. [SK-TREE, MLCB34]
- Chọn câu hỏi bằng độ giảm của độ vẩn đục có trọng số $\frac{m_L}{m}G_L + \frac{m_R}{m}G_R$; Gini hoặc entropy (độ lợi thông tin). [SK-TREE, MLCB34]
- CART thử mọi đặc trưng và mọi ngưỡng ở điểm giữa hai giá trị liền nhau, theo kiểu tham lam. [SK-TREE]
- Cây sâu thì overfitting và không ổn định; hãm bằng `max_depth`, `min_samples_leaf`, `ccp_alpha`. [SK-TREE]
- Random forest = bagging + chọn ngẫu nhiên đặc trưng ở mỗi lần chia, để các cây ít tương quan. [SK-ENS, BRE01]
- Phương sai của trung bình $B$ biến cùng phương sai $\sigma^2$, tương quan đôi một $\rho$: $\rho\sigma^2 + \frac{1-\rho}{B}\sigma^2$ (tự dẫn trong bài).
- Xác suất một mẫu nằm ngoài một mẫu bootstrap: $(1 - 1/m)^m \approx e^{-1} \approx 0.368$ (kiến thức chung).
- MDI tính trên tập train, thiên về đặc trưng nhiều giá trị; dùng permutation importance trên tập test. [SK-ENS, SK-PERM]
