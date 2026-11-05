# Dự án ML từ đầu đến cuối

Bài: `ml/end-to-end-project` (tiền đề: `ml/regularization`, `ml/decision-tree-random-forest`, `ml/data-preprocessing`). Bài tổng kết Phần 3. Code chỉ dùng `pandas`, `scikit-learn` (Pyodide, scikit-learn 1.8). Dữ liệu: `load_diabetes(scaled=False)`, có sẵn trong scikit-learn, không cần mạng.

Ngày kiểm tra nguồn: **05/11/2026**, bằng WebFetch và `curl` (mã HTTP), Crossref API cho DOI. Thẻ nguồn: [G22], [G-CL], [SK-TOY], [SK-PIT], [SK-GS], [SK-MP], [K12], [E04]. Ý không có thẻ là kiến thức chung.

## Nguồn

- **[G22]** Géron, A. (2022). *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow*, bản 3, O'Reilly. Chương 2: End-to-End Machine Learning Project. Trang O'Reilly trả 403 với `curl`; dùng [notebook chương 2](https://github.com/ageron/handson-ml3/blob/main/02_end_to_end_machine_learning_project.ipynb) (200) làm link. Chưa đọc lại nội dung chương trong phiên này.
- **[G-CL]** [`ml-project-checklist.md`](https://github.com/ageron/handson-ml3/blob/main/ml-project-checklist.md) trong repo handson-ml3 (đã mở). 8 mục lớn: đặt bài toán, lấy dữ liệu, khám phá, chuẩn bị dữ liệu, thử nhiều mô hình và lập danh sách ngắn, tinh chỉnh, trình bày giải pháp, triển khai/giám sát/bảo trì. Bài dùng 8 bước của riêng mình (gộp "trình bày" vào bước 7, tách "phân tích lỗi và chấm test" thành một bước), không chép câu chữ.
- **[SK-TOY]** [scikit-learn 1.8: Toy datasets](https://scikit-learn.org/1.8/datasets/toy_dataset.html), mục Diabetes (đã mở): 442 bệnh nhân, 10 đặc trưng (`age`, `sex`, `bmi`, `bp`, `s1` tc, `s2` ldl, `s3` hdl, `s4` tch, `s5` ltg "possibly log of serum triglycerides level", `s6` glu), nhãn là "a quantitative measure of disease progression one year after baseline". Mặc định các cột đã căn giữa và chia theo độ lệch chuẩn nhân $\sqrt{m}$; `scaled=False` trả về đơn vị gốc. Tài liệu không nói mã 1/2 của `sex` là nam hay nữ.
- **[SK-PIT]** [scikit-learn 1.8: Common pitfalls and recommended practices](https://scikit-learn.org/1.8/common_pitfalls.html) (200): rò rỉ dữ liệu khi tiền xử lý hoặc chọn đặc trưng ngoài pipeline.
- **[SK-GS]** [scikit-learn 1.8 User Guide: Tuning the hyper-parameters of an estimator](https://scikit-learn.org/1.8/modules/grid_search.html) (200): `GridSearchCV`, `RandomizedSearchCV`, tên `<bước>__<tham số>`.
- **[SK-MP]** [scikit-learn 1.8: Model persistence](https://scikit-learn.org/1.8/model_persistence.html) (đã mở): ONNX, skops.io, pickle, joblib, cloudpickle. pickle/joblib có thể chạy code tùy ý khi nạp, chỉ nạp file tin cậy. Không phương pháp nào chính thức hỗ trợ nạp bằng phiên bản scikit-learn khác; nên ghim phiên bản và lưu kèm siêu dữ liệu (dữ liệu, code, phiên bản, điểm kiểm định chéo).
- **[K12]** Kaufman, S., Rosset, S., Perlich, C., Stitelman, O. (2012). *Leakage in Data Mining: Formulation, Detection, and Avoidance*. *ACM TKDD* 6(4). DOI [`10.1145/2382577.2382579`](https://doi.org/10.1145/2382577.2382579), xác minh tác giả, tạp chí, tập, số qua Crossref (Crossref ghi tiêu đề ngắn "Leakage in data mining"; trang ACM trả 403). Chưa đọc nội dung.
- **[E04]** Efron, B., Hastie, T., Johnstone, I., Tibshirani, R. (2004). *Least Angle Regression*. *Annals of Statistics* 32(2), 407–499. DOI [`10.1214/009053604000000067`](https://doi.org/10.1214/009053604000000067), xác minh qua Crossref. Nguồn của bộ dữ liệu.
- Bergstra, J., Bengio, Y. (2012). *Random Search for Hyper-Parameter Optimization*. *JMLR* 13, 281–305. Chỉ nhắc tên trong bài (random search thường hiệu quả hơn grid search khi ít siêu tham số quan trọng); kiến thức chung, chưa mở bài trong phiên này.

## Số tự chạy

Venv `C:/Users/Dell/.venvs/ai-atlas-py314` (scikit-learn 1.8.0, pandas 3.0.2, NumPy 2.4.6, như Pyodide 314.0.7). Chia `test_size=0.2`, `stratify=pd.qcut(y, 5, labels=False)`, `random_state=0`; `KFold(5, shuffle=True, random_state=0)`.

- Train 353, test 89; số người test ở 5 nhóm nhãn: 18, 18, 18, 17, 18.
- Tương quan với nhãn trên train: `bmi` 0.57, `s5` 0.55, `bp` 0.44, `s4` 0.42, `s6` 0.37, `s1` 0.20, `age` 0.19, `s2` 0.16, `sex` 0.03, `s3` −0.38. Nhãn train: trung bình 152.1, trung vị 141, từ 25 tới 346.
- MAE kiểm định chéo: `DummyRegressor(median)` 65.6 ± 4.3; `Ridge(1.0)` 45.8 ± 3.4; `RandomForestRegressor(50, min_samples_leaf=5)` 49.3 ± 3.6 (MAE trên chính tập train 32.3). Thử thêm (không đưa vào bài): rừng 100 cây lá 10 là 48.9, 50 cây lá 1 là 50.9.
- `GridSearchCV` `alpha` ∈ {0.1, 1, 3, 10, 30, 100}: 45.95, 45.83, 45.72, **45.66**, 45.82, 46.92. MAE từng fold ở `alpha = 10`: 44.3, 40.5, 45.5, 50.7, 47.3.
- Sai số trung bình ngoài fold $\hat{y} - y$ theo 4 nhóm nhãn train: +44.2, +23.5, −17.5, −52.9.
- MAE test 39.9. Với `alpha = 10` cố định, `random_state` của bước chia từ 0 tới 4: 39.9, 48.8, 45.9, 50.9, 37.8. Mốc cơ sở trên test (không đưa vào bài): 64.5.
- Ba lỗi test lớn nhất: bệnh nhân 92 ($y = 48$, $\hat{y} = 191$, bmi 26.8), 304 (253, 123, 22.8), 382 (132, 253, 32.0).
