# Đánh giá mô hình: Accuracy, Precision, Recall, F1

Bài: `ml/classification-metrics` (tiền đề: `ml/logistic-regression`). Code chỉ dùng `numpy`, `scikit-learn`, `matplotlib` (Pyodide, scikit-learn 1.8; chạy thử trên máy bằng Python 3.14, scikit-learn 1.9.1).

Ngày kiểm tra nguồn: **05/11/2026**, bằng WebFetch (`lesson-writer`). Thẻ nguồn: [MLCB33], [GG-APR], [GG-ROC], [SK-ME], [SK-TH], [F06], [SR15]. Ý không có thẻ là kiến thức chung.

## Nguồn

**Đã mở và đọc được:**

- **[MLCB33]** Vũ Hữu Tiệp. [*Machine Learning cơ bản*, Bài 33: Các phương pháp đánh giá một hệ thống phân lớp](https://machinelearningcoban.com/2017/08/31/evaluation/). URL ghi 31/08/2017, trang hiện ghi ngày 03/01/2018. Mục lục: Accuracy, Confusion matrix, True/False Positive/Negative, ROC, AUC, Precision và Recall, PR curve và Average precision, F1, micro/macro cho nhiều lớp. Giữ nguyên tiếng Anh cho TP/FP, precision, recall; dịch accuracy là "độ chính xác"; FPR là "tỉ lệ báo động nhầm", FNR là "tỉ lệ bỏ sót".
- **[GG-APR]** Google. [*Machine Learning Crash Course*: Classification: Accuracy, recall, precision, and related metrics](https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall) (không ghi ngày cập nhật). Accuracy gây hiểu lầm với dữ liệu mất cân bằng; recall khi FN đắt hơn FP; precision khi dự đoán dương phải đáng tin; precision và recall thường đánh đổi khi đổi ngưỡng; F1 là trung bình điều hòa, nghiêng về số nhỏ hơn.
- **[GG-ROC]** Google. [*Machine Learning Crash Course*: ROC and AUC](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc). AUC là xác suất mô hình xếp một mẫu dương ngẫu nhiên trên một mẫu âm ngẫu nhiên; ngẫu nhiên là 0.5. Khi dữ liệu mất cân bằng, đường PR có thể so mô hình tốt hơn.
- **[SK-ME]** scikit-learn developers. [*scikit-learn 1.8 User Guide*: 3.4 Metrics and scoring](https://scikit-learn.org/1.8/modules/model_evaluation.html). Mục 3.4.4: `average='macro'` (trung bình không trọng số), `'weighted'` (theo support), `'micro'` (cộng tử và mẫu rồi chia); "micro" trên bài nhiều lớp đủ nhãn cho precision, recall, F bằng accuracy; `zero_division` khi chỉ số không xác định. (Trang dài, công cụ đọc 100 000 ký tự đầu.)
- **[SK-TH]** scikit-learn developers. [*scikit-learn 1.8 User Guide*: 3.3 Tuning the decision threshold for class prediction](https://scikit-learn.org/1.8/modules/classification_threshold.html). `predict` dự đoán dương khi $P(y \mid X) > 0.5$; ngưỡng này "hầu như chắc chắn không lý tưởng" cho đa số bài toán; ví dụ phát hiện khối u nên đặt ngưỡng thấp hơn 0.5. `TunedThresholdClassifierCV` chọn ngưỡng bằng kiểm định chéo (mặc định 5-fold phân tầng); trang nhấn mạnh không dùng cùng dữ liệu để huấn luyện và để chọn ngưỡng.
- **[F06]** Fawcett, T. (2006). [*An introduction to ROC analysis*](https://doi.org/10.1016/j.patrec.2005.10.010). *Pattern Recognition Letters* 27(8), 861–874. Tên, tác giả, tập, số, trang đối chiếu qua Crossref API (sciencedirect trả 403). Chưa đọc nội dung.
- **[SR15]** Saito, T., Rehmsmeier, M. (2015). [*The Precision-Recall Plot Is More Informative than the ROC Plot When Evaluating Binary Classifiers on Imbalanced Datasets*](https://doi.org/10.1371/journal.pone.0118432). *PLOS ONE* 10(3), e0118432. Kết luận: với dữ liệu mất cân bằng, đường PR phản ánh độ tin cậy của bộ phân loại tốt hơn ROC.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Fawcett (2006) dùng "tp rate", "fp rate" | Xác nhận qua kết quả tìm kiếm (bản PDF trên trang môn học www2.cs.uh.edu): bài viết chữ thường tp rate, fp rate để phân biệt với số đếm TP, FP; tp rate còn gọi là hit rate, recall. Chưa đọc bản chính thức | Giữ câu chú thích trong "Đọc thêm" |

## Ý chính dùng trong bài

- Accuracy so với mô hình cơ sở "luôn đoán lớp đa số" [GG-APR, MLCB33].
- Precision, recall, F1 (trung bình điều hòa), $F_\beta$ [GG-APR, SK-ME].
- Ngưỡng 0.5 không bắt buộc; chọn ngưỡng trên dữ liệu không dùng để huấn luyện [SK-TH].
- AUC theo nghĩa xếp hạng [GG-ROC]; PR hợp hơn ROC khi mất cân bằng [SR15, GG-ROC].
- Macro, micro, weighted; micro bằng accuracy khi mỗi mẫu một nhãn [SK-ME, MLCB33].
