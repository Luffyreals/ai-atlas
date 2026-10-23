# Bảng thuật ngữ Việt – Anh

Dùng thống nhất cho toàn bộ AI Atlas. Gặp thuật ngữ mới thì thêm vào đúng nhóm, giữ thứ tự chữ cái theo cột tiếng Việt.

**Cột "Cách dùng":**
- **Dịch**: viết tiếng Việt, lần đầu kèm tiếng Anh trong ngoặc.
- **Giữ**: giữ nguyên tiếng Anh vì người Việt quen dùng hơn.

## Chung

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Trí tuệ nhân tạo | Artificial Intelligence (AI) | Dịch, viết tắt AI |
| Học máy | Machine Learning (ML) | Dịch |
| Học sâu | Deep Learning (DL) | Dịch |
| Học có giám sát | Supervised learning | Dịch |
| Học không giám sát | Unsupervised learning | Dịch |
| Học bán giám sát | Semi-supervised learning | Dịch |
| Học tăng cường | Reinforcement learning | Dịch |
| Học tự giám sát | Self-supervised learning | Dịch |

## Dữ liệu và mô hình

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Biểu đồ phân tán | Scatter plot | Dịch |
| Dữ liệu mất cân bằng | Imbalanced data | Dịch |
| Đặc trưng | Feature | Dịch |
| Điểm ngoại lai | Outlier | Dịch. Điểm nằm xa hẳn phần còn lại của dữ liệu. Không gọi là "nhiễu" |
| Huấn luyện | Training | Dịch. Chọn tham số của mô hình để hàm mất mát trên tập huấn luyện nhỏ. Trong scikit-learn là `fit` |
| Mẫu | Sample | Dịch |
| Mô hình | Model | Dịch |
| Nhãn | Label | Dịch |
| Nhiễu | Noise | Dịch. Phần biến động của nhãn mà các đặc trưng không giải thích được. Khác "điểm ngoại lai" |
| Rò rỉ dữ liệu | Data leakage | Dịch. Thông tin của tập kiểm tra lọt vào quá trình huấn luyện (mẫu trùng, chọn mô hình hay xử lý dữ liệu bằng tập kiểm tra), làm điểm kiểm tra lạc quan |
| Siêu tham số | Hyperparameter | Dịch |
| Tăng cường dữ liệu | Data augmentation | Dịch |
| Tập huấn luyện | Training set | Dịch |
| Tập kiểm định | Validation set | Dịch |
| Tập kiểm tra | Test set | Dịch |
| Tham số | Parameter | Dịch |

## Machine Learning

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Bình phương tối thiểu | Least squares | Dịch. Không dùng "bình phương nhỏ nhất" |
| Bình phương tối thiểu thông thường | Ordinary least squares (OLS) | Dịch, viết tắt OLS. Tên scikit-learn dùng cho `LinearRegression` |
| Cây quyết định | Decision tree | Dịch |
| Cộng tuyến | Collinearity | Dịch. Các đặc trưng phụ thuộc tuyến tính, hoặc gần như vậy, ví dụ diện tích theo m² và theo ft² |
| Điểm đòn bẩy cao | High-leverage point | Dịch. Điểm có đặc trưng nằm xa phần còn lại, có thể kéo mạnh đường hồi quy |
| Điểm trung bình | Mean point | Dịch. Điểm $(\bar{x}, \bar{y})$. Đường bình phương tối thiểu (có hệ số tự do) luôn đi qua điểm này |
| Độ chệch | Bias | Dịch, lần đầu ghi "độ chệch (bias)". Sai lệch có hệ thống do mô hình quá đơn giản. Khác hệ số tự do $b$: trong bài có cả hai thì luôn gọi $b$ là "hệ số tự do" |
| Độ dốc | Slope | Dịch. Trong hồi quy: chỉ gọi $w$ là độ dốc khi có một đặc trưng. Nhiều đặc trưng thì gọi "trọng số" |
| Fold | Fold | Giữ. Một trong $k$ phần của dữ liệu khi kiểm định chéo |
| Gradient descent | Gradient descent | Giữ |
| Hàm mất mát | Loss function | Dịch |
| Hệ số tự do | Bias (term) | Dịch, lần đầu ghi "bias, còn gọi là intercept". Sách thống kê và scikit-learn (`intercept_`) gọi là intercept |
| Hồi quy | Regression | Dịch |
| Hồi quy đa thức | Polynomial regression | Dịch. Hồi quy tuyến tính trên các đặc trưng $x, x^2, \dots, x^d$ |
| Hồi quy Logistic | Logistic regression | Dịch |
| Hồi quy tuyến tính | Linear regression | Dịch |
| K-Nearest Neighbors (KNN) | K-nearest neighbors (KNN) | Giữ, viết tắt KNN. Lần đầu có thể giải thích "k láng giềng gần nhất" |
| Kiểm định chéo | Cross-validation | Dịch. Tách train/kiểm định nhiều lần rồi lấy trung bình điểm |
| Môi trường | Environment | Dịch. Trong học tăng cường: nơi tác nhân hành động và nhận phần thưởng |
| Ngoại suy | Extrapolation | Dịch. Dự đoán ở ngoài khoảng giá trị của dữ liệu huấn luyện |
| Overfitting / Underfitting | Overfitting / Underfitting | Giữ. Lần đầu có thể ghi "quá khớp" / "thiếu khớp" |
| Phân cụm | Clustering | Dịch |
| Phân loại | Classification | Dịch |
| Phần dư | Residual | Dịch. $e^{(i)} = y^{(i)} - \hat{y}^{(i)}$, khác "sai số" (error) chưa quan sát được |
| Phần thưởng | Reward | Dịch. Trong học tăng cường: tín hiệu (dương hoặc âm) tác nhân nhận sau mỗi hành động |
| Phương trình chuẩn | Normal equation | Dịch, lần đầu kèm "normal equation" |
| Regularization | Regularization | Giữ |
| Sai số bình phương trung bình | Mean squared error (MSE) | Dịch, viết tắt MSE. Site dùng hệ số $\frac{1}{m}$ |
| Sự đánh đổi bias–variance | Bias–variance trade-off | Dịch, kèm tiếng Anh. Tăng độ linh hoạt làm độ chệch giảm, variance tăng |
| Tác nhân | Agent | Dịch. Trong học tăng cường: bên chọn hành động và học từ phần thưởng |
| Tốc độ học | Learning rate | Dịch |
| Tổng quát hóa | Generalization | Dịch. Khả năng làm tốt trên dữ liệu chưa thấy khi huấn luyện. Ước lượng bằng điểm trên tập kiểm tra |
| Trọng số | Weight | Dịch |
| Variance (của mô hình) | Variance | Giữ trong cụm bias–variance: mức mô hình học được thay đổi khi đổi bộ dữ liệu huấn luyện. Nghĩa thống kê chung thì dịch "phương sai" (nhóm Toán) |

## Deep Learning

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Cơ chế chú ý | Attention mechanism | Dịch, thường gọi tắt "attention" |
| Hàm kích hoạt | Activation function | Dịch |
| Lan truyền ngược | Backpropagation | Dịch |
| Lan truyền xuôi | Forward propagation | Dịch |
| Mạng hồi tiếp | Recurrent Neural Network (RNN) | Dịch, viết tắt RNN |
| Mạng nơ-ron | Neural network | Dịch |
| Mạng tích chập | Convolutional Neural Network (CNN) | Dịch, viết tắt CNN |

## NLP và LLM

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Embedding | Embedding | Giữ |
| Fine-tune | Fine-tuning | Giữ, có thể ghi "tinh chỉnh" |
| Mô hình ngôn ngữ lớn | Large Language Model (LLM) | Dịch, viết tắt LLM |
| Tách từ | Tokenization | Dịch |
| Token | Token | Giữ |

## Toán

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Bậc (của đa thức) | Degree | Dịch. Số mũ lớn nhất, ký hiệu $d$ |
| Chuẩn (của vectơ, ma trận) | Norm | Dịch. Ví dụ "chuẩn 2" (2-norm). Với vectơ, chuẩn 2 là độ dài $\lVert\mathbf{v}\rVert$ |
| Chuyển vị | Transpose | Dịch |
| Đạo hàm | Derivative | Dịch |
| Đạo hàm riêng | Partial derivative | Dịch |
| Đa thức | Polynomial | Dịch |
| Định thức | Determinant | Dịch |
| Độ lệch (so với trung bình) | Deviation | Dịch. Ví dụ $x^{(i)} - \bar{x}$. Không nhầm với bias |
| Độc lập tuyến tính | Linearly independent | Dịch |
| Hạng (của ma trận) | Rank | Dịch |
| Hình chiếu vuông góc | Orthogonal projection | Dịch |
| Kỳ vọng | Expectation | Dịch |
| Ma trận | Matrix | Dịch |
| Ma trận khả nghịch / suy biến | Invertible / singular matrix | Dịch |
| Ma trận nghịch đảo | Inverse matrix | Dịch |
| Ma trận thiết kế | Design matrix | Dịch. Mỗi hàng một mẫu, mỗi cột một đặc trưng, thêm cột toàn số 1 cho hệ số tự do |
| Nghiệm có độ dài nhỏ nhất | Minimum-norm solution | Dịch. Nghiệm mà `np.linalg.lstsq` trả về khi có vô số nghiệm |
| Phân phối xác suất | Probability distribution | Dịch |
| Phụ thuộc tuyến tính | Linearly dependent | Dịch |
| Phương sai | Variance | Dịch |
| Quy tắc hàm hợp | Chain rule | Dịch |
| Số điều kiện | Condition number | Dịch |
| Tích vô hướng | Dot product | Dịch |
| Vectơ | Vector | Dịch |
