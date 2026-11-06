# Xử lý dữ liệu, tăng cường dữ liệu, dữ liệu mất cân bằng

Bài: `ml/data-preprocessing` (tiền đề: `ml/classification-metrics`, `python/numpy-pandas`). Code chỉ dùng `numpy`, `pandas`, `scikit-learn` (Pyodide, scikit-learn 1.8). Số trong bài chạy bằng venv `C:/Users/Dell/.venvs/ai-atlas-py314` (scikit-learn 1.8.0, NumPy 2.4.6, pandas 3.0.2); chạy lại bằng Python máy (scikit-learn 1.9.1) ra cùng số.

Ngày kiểm tra nguồn: **05/11/2026**, bằng WebFetch. Thẻ nguồn: [SK-PIT], [SK-PRE], [SK-IMP], [SK-COMP], [SK-LR], [IMB], [CBHK02], [HG09], [KRPS12], [MLCB11].

## Nguồn

- **[SK-PIT]** scikit-learn developers. [*Common pitfalls and recommended practices*](https://scikit-learn.org/1.8/common_pitfalls.html), mục 11.2 Data leakage. Đã đọc. Có ví dụ `SelectKBest` trên 10 000 đặc trưng ngẫu nhiên: chọn trước khi chia cho accuracy 0.76, chọn sau khi chia cho 0.5. Khuyên dùng `Pipeline`; nêu rằng rò rỉ khi xử lý áp dụng cho gần như mọi bộ biến đổi (`StandardScaler`, `SimpleImputer`, `PCA`).
- **[SK-PRE]** [*Preprocessing data*](https://scikit-learn.org/1.8/modules/preprocessing.html) (mục 7.3). Đã đọc. Mục 7.3.4 nói mã số nguyên bị hiểu là có thứ tự; `OneHotEncoder` với `handle_unknown`. **Không** có câu nào nói cây không cần chuẩn hóa (ý đó là kiến thức chung, bài tự lập luận).
- **[SK-IMP]** [*Imputation of missing values*](https://scikit-learn.org/1.8/modules/impute.html) (mục 7.4). Đã đọc. `SimpleImputer`: mean, median, most_frequent, constant; cột chữ chỉ dùng most_frequent hoặc constant. `MissingIndicator` (mặc định `features='missing-only'`) và `add_indicator=True`.
- **[SK-COMP]** [*Pipelines and composite estimators*](https://scikit-learn.org/1.8/modules/compose.html) (mục 7.1). Đã đọc. `Pipeline`, `ColumnTransformer`, `get_feature_names_out`, `verbose_feature_names_out=False`.
- **[SK-LR]** [*`LogisticRegression`*](https://scikit-learn.org/1.8/modules/generated/sklearn.linear_model.LogisticRegression.html). `class_weight="balanced"`: `n_samples / (n_classes * np.bincount(y))`.
- **[IMB]** imbalanced-learn. [*Over-sampling*](https://imbalanced-learn.org/stable/over_sampling.html). Đã đọc. `RandomOverSampler` (bốc có hoàn lại), SMOTE: $x_{new} = x_i + \lambda(x_{zi} - x_i)$, $\lambda \in [0, 1]$. Gói không có trong `pyodide-lock.json` của dự án.
- **[CBHK02]** Chawla, N. V., Bowyer, K. W., Hall, L. O., Kegelmeyer, W. P. (2002). [*SMOTE: Synthetic Minority Over-sampling Technique*](https://doi.org/10.1613/jair.953). JAIR 16, 321–357. Xác minh qua Crossref. Chưa đọc nội dung.
- **[HG09]** He, H., Garcia, E. A. (2009). [*Learning from Imbalanced Data*](https://doi.org/10.1109/TKDE.2008.239). IEEE TKDE 21(9), 1263–1284. Xác minh qua Crossref. Chưa đọc nội dung.
- **[KRPS12]** Kaufman, S., Rosset, S., Perlich, C., Stitelman, O. (2012). [*Leakage in Data Mining: Formulation, Detection, and Avoidance*](https://doi.org/10.1145/2382577.2382579). ACM TKDD 6(4), 1–21. Xác minh qua Crossref. Chưa đọc nội dung.
- **[MLCB11]** Machine Learning cơ bản (06/02/2017). [*Bài 11: Giới thiệu về Feature Engineering*](https://machinelearningcoban.com/general/2017/02/06/featureengineering/). Đã đọc. Có mục Feature Scaling and Normalization (rescaling, standardization, unit length). Không nói giá trị thiếu hay one-hot. Trang không ghi tên tác giả; blog của Vũ Hữu Tiệp.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| ESL (Hastie, Tibshirani, Friedman), mục 7.10.2 "The Wrong and Right Way to Do Cross-validation" | Trang sách (hastie.su.domains) không kết nối được; chỉ thấy qua nguồn thứ cấp (ghi chú khóa Stats 202 Stanford) | Bài chỉ nhắc tên sách và ý "cách sai và cách đúng", không trích số, không đưa vào Đọc thêm |
| Thang của hàm mục tiêu `LogisticRegression` (tổng hay trung bình) | Trang API không nói | Bài viết $\mathcal{L}$ dạng trung bình có trọng số và chỉ nói tỉ lệ trọng số; không khẳng định cách scale với `C` |

## Ý chính

- Giá trị thiếu: bỏ dòng/cột, hoặc điền (mean, median, mode), có thể thêm cờ thiếu. [SK-IMP]
- Biến phân loại: one-hot cho giá trị không thứ tự; mã thứ tự áp đặt quan hệ không có thật. [SK-PRE]
- Co giãn: z-score, min-max; cần cho KNN, GD, mô hình có phạt; cây không cần (kiến thức chung).
- Mọi bộ xử lý `fit` trên train, `transform` trên test; `Pipeline` trong kiểm định chéo. [SK-PIT, SK-COMP]
- Mất cân bằng: P/R/F1, `stratify`, `class_weight`, oversampling/undersampling/SMOTE, dời ngưỡng; chỉ lấy mẫu lại trên train. [SK-LR, IMB, CBHK02, HG09]

## Số tự chạy (khớp bài)

- Ô 1 (8 căn hộ): trung vị diện tích 45, tầng 6; $\mu$ = 48.25, 7.12; $\sigma$ = 13.13, 4.14 (độ lệch chuẩn tổng thể, `ddof=0`).
- Ô 2 (100 × 5000 nhiễu, `default_rng(0)`, `k=20`, `cv=5`): chọn trước khi chia 0.850, trong pipeline 0.480. Thử seed 1–3: 0.85–0.90 so với 0.44–0.59.
- Ô 3 (`make_classification(2000, n_features=5, n_informative=2, n_redundant=0, weights=[0.95, 0.05], random_state=2)`, chia 70/30 `stratify`, `random_state=0`): xem báo cáo trong bài.

## Liên quan tới bài nào

- `ml/gradient-descent`, `ml/regularization`, `ml/k-nearest-neighbors` (chuẩn hóa); `ml/classification-metrics` (P/R/F1, ngưỡng); `ml/ml-overview` (rò rỉ dữ liệu); `ml/end-to-end-project` (dùng lại pipeline).
