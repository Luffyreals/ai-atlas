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
| Batch, mini-batch | Batch, mini-batch | Giữ. Nhóm mẫu dùng để tính gradient trong một bước. Batch gradient descent dùng cả $m$ mẫu, mini-batch dùng $B$ mẫu |
| Bình phương tối thiểu | Least squares | Dịch. Không dùng "bình phương nhỏ nhất" |
| Bình phương tối thiểu thông thường | Ordinary least squares (OLS) | Dịch, viết tắt OLS. Tên scikit-learn dùng cho `LinearRegression` |
| Cây quyết định | Decision tree | Dịch |
| Chuẩn hóa đặc trưng | Feature scaling; feature standardization (z-score) | Dịch. Đưa các đặc trưng về cùng thang đo, tham số tính trên tập train. Hay gặp nhất là z-score: trung bình 0, độ lệch chuẩn 1, $z_j = (x_j - \mu_j)/\sigma_j$ (`StandardScaler`). Cách khác: chuẩn hóa min-max. Khác regularization |
| Chuẩn hóa min-max | Min-max scaling | Dịch. Đưa đặc trưng về đoạn $[0, 1]$: $(x - \min)/(\max - \min)$, với min, max lấy trên tập train (`MinMaxScaler`). Bài Gradient Descent viết $\tilde{x}$, $\tilde{w}$, $\tilde{b}$ |
| Co (hệ số) | Shrinkage | Dịch. Regularization kéo độ lớn các hệ số về gần 0 |
| Coordinate descent | Coordinate descent | Giữ. Thuật toán lặp, mỗi lần cập nhật một hệ số; scikit-learn dùng cho Lasso và Elastic Net |
| Cộng tuyến | Collinearity | Dịch. Các đặc trưng phụ thuộc tuyến tính, hoặc gần như vậy, ví dụ diện tích theo m² và theo ft² |
| Cực tiểu toàn cục / cục bộ | Global / local minimum | Dịch. Điểm thấp nhất của cả hàm / điểm thấp nhất trong một vùng lân cận. Hàm lồi chỉ có cực tiểu toàn cục |
| Điểm đòn bẩy cao | High-leverage point | Dịch. Điểm có đặc trưng nằm xa phần còn lại, có thể kéo mạnh đường hồi quy |
| Điểm trung bình | Mean point | Dịch. Điểm $(\bar{x}, \bar{y})$. Đường bình phương tối thiểu (có hệ số tự do) luôn đi qua điểm này |
| Độ chệch | Bias | Dịch, lần đầu ghi "độ chệch (bias)". Sai lệch có hệ thống do mô hình quá đơn giản. Khác hệ số tự do $b$: trong bài có cả hai thì luôn gọi $b$ là "hệ số tự do" |
| Độ dốc | Slope | Dịch. Trong hồi quy: chỉ gọi $w$ là độ dốc khi có một đặc trưng. Nhiều đặc trưng thì gọi "trọng số" |
| Đường cong mất mát | Loss curve | Dịch. Đồ thị mất mát theo số bước hoặc số epoch khi huấn luyện |
| Elastic Net | Elastic Net | Giữ. Phạt cả L1 lẫn L2: $\mathcal{L} + \lambda_1\lVert\mathbf{w}\rVert_1 + \lambda_2\lVert\mathbf{w}\rVert_2^2$ |
| Epoch | Epoch | Giữ. Một lượt đi qua toàn bộ tập train. Với mini-batch cỡ $B$, một epoch có $m/B$ bước |
| Fold | Fold | Giữ. Một trong $k$ phần của dữ liệu khi kiểm định chéo |
| Gradient descent | Gradient descent | Giữ, viết tắt GD. Lần đầu có thể ghi "hạ gradient". Cập nhật $\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \eta\nabla\mathcal{L}(\boldsymbol{\theta})$ |
| Gradient descent ngẫu nhiên | Stochastic gradient descent (SGD) | Giữ "SGD". Mỗi bước dùng một mẫu chọn ngẫu nhiên |
| Hàm mất mát | Loss function | Dịch |
| Hàm mục tiêu | Objective function | Dịch. Hàm được làm nhỏ khi huấn luyện, ví dụ hàm mất mát cộng khoản phạt ($J$ trong bài Regularization) |
| Hệ số phạt | Penalty strength, regularization strength | Dịch. Ký hiệu $\lambda$: độ mạnh của khoản phạt, một siêu tham số. Khác "hệ số" $w_k$ của mô hình. scikit-learn gọi là `alpha`, với thang khác nhau giữa các lớp |
| Hệ số tự do | Bias (term) | Dịch, lần đầu ghi "bias, còn gọi là intercept". Sách thống kê và scikit-learn (`intercept_`) gọi là intercept |
| Hồi quy | Regression | Dịch |
| Hồi quy đa thức | Polynomial regression | Dịch. Hồi quy tuyến tính trên các đặc trưng $x, x^2, \dots, x^d$ |
| Hồi quy Logistic | Logistic regression | Dịch |
| Hồi quy tuyến tính | Linear regression | Dịch |
| Hội tụ / phân kỳ | Convergence / divergence | Dịch. Thuật toán lặp tiến dần tới nghiệm / càng lúc càng xa nghiệm |
| K-Nearest Neighbors (KNN) | K-nearest neighbors (KNN) | Giữ, viết tắt KNN. Lần đầu có thể giải thích "k láng giềng gần nhất" |
| Kiểm định chéo | Cross-validation | Dịch. Tách train/kiểm định nhiều lần rồi lấy trung bình điểm |
| Lasso | Lasso | Giữ. Hồi quy tuyến tính có phạt L1, $\lambda\lVert\mathbf{w}\rVert_1$ |
| Lịch tốc độ học | Learning rate schedule | Dịch. Cách thay đổi $\eta$ theo số bước, thường là giảm dần (ví dụ `invscaling` của scikit-learn) |
| Môi trường | Environment | Dịch. Trong học tăng cường: nơi tác nhân hành động và nhận phần thưởng |
| Ngoại suy | Extrapolation | Dịch. Dự đoán ở ngoài khoảng giá trị của dữ liệu huấn luyện |
| Overfitting / Underfitting | Overfitting / Underfitting | Giữ. Lần đầu có thể ghi "quá khớp" / "thiếu khớp" |
| Phân cụm | Clustering | Dịch |
| Phân loại | Classification | Dịch |
| Phần dư | Residual | Dịch. $e^{(i)} = y^{(i)} - \hat{y}^{(i)}$, khác "sai số" (error) chưa quan sát được |
| Phần thưởng | Reward | Dịch. Trong học tăng cường: tín hiệu (dương hoặc âm) tác nhân nhận sau mỗi hành động |
| Phương trình chuẩn | Normal equation | Dịch, lần đầu kèm "normal equation" |
| Regularization | Regularization | Giữ |
| Ridge | Ridge regression | Giữ, có thể viết "hồi quy Ridge". Hồi quy tuyến tính có phạt L2, $\lambda\lVert\mathbf{w}\rVert_2^2$ |
| Sai số bình phương trung bình | Mean squared error (MSE) | Dịch, viết tắt MSE. Site dùng hệ số $\frac{1}{m}$ |
| Soft-thresholding | Soft-thresholding | Giữ. Trừ bớt một lượng cố định khỏi độ lớn của một số rồi cắt ở 0; cho hệ số đúng 0 của Lasso |
| Sự đánh đổi bias–variance | Bias–variance trade-off | Dịch, kèm tiếng Anh. Tăng độ linh hoạt làm độ chệch giảm, variance tăng |
| Tác nhân | Agent | Dịch. Trong học tăng cường: bên chọn hành động và học từ phần thưởng |
| Thưa (mô hình, vectơ) | Sparse | Dịch. Có nhiều hệ số bằng đúng 0 |
| Tiêu chí dừng | Stopping criterion | Dịch. Điều kiện để dừng thuật toán lặp: số bước tối đa, gradient đủ nhỏ, mất mát hết giảm |
| Tốc độ học | Learning rate | Dịch |
| Tổng quát hóa | Generalization | Dịch. Khả năng làm tốt trên dữ liệu chưa thấy khi huấn luyện. Ước lượng bằng điểm trên tập kiểm tra |
| Trọng số | Weight | Dịch |
| Variance (của mô hình) | Variance | Giữ trong cụm bias–variance: mức mô hình học được thay đổi khi đổi bộ dữ liệu huấn luyện. Nghĩa thống kê chung thì dịch "phương sai" (nhóm Toán) |
| Weight decay | Weight decay | Giữ. Tên hay dùng cho phạt L2 trên trọng số, nhất là trong mạng nơ-ron |
| Xấp xỉ ngẫu nhiên | Stochastic approximation | Dịch. Phương pháp của Robbins và Monro (1951): tìm nghiệm khi chỉ quan sát được giá trị có nhiễu. Tiền thân của SGD |

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
| Chuẩn L1, chuẩn L2 | L1 norm, L2 norm | Dịch. $\lVert\mathbf{w}\rVert_1 = \sum_j \lvert w_j\rvert$; chuẩn L2 cũng là "chuẩn 2" (2-norm) ở dòng trên, tức độ dài vectơ |
| Chuyển vị | Transpose | Dịch |
| Đạo hàm | Derivative | Dịch |
| Đạo hàm bậc hai | Second derivative | Dịch. Đạo hàm của đạo hàm, cho biết đồ thị cong cỡ nào. Nhiều biến thì gom thành ma trận Hessian |
| Đạo hàm riêng | Partial derivative | Dịch |
| Đa thức | Polynomial | Dịch |
| Định thức | Determinant | Dịch |
| Độ lệch (so với trung bình) | Deviation | Dịch. Ví dụ $x^{(i)} - \bar{x}$. Không nhầm với bias |
| Độc lập tuyến tính | Linearly independent | Dịch |
| Độ cong | Curvature | Dịch. Với hàm một biến là đạo hàm bậc hai. Ký hiệu $L$ trong ngưỡng $\eta < 2/L$ của gradient descent |
| Đường mức | Contour line | Dịch. Tập các điểm có cùng giá trị hàm, ví dụ cùng MSE trên mặt phẳng $(w, b)$ |
| Gradient | Gradient | Giữ. Vectơ các đạo hàm riêng, ký hiệu $\nabla\mathcal{L}$. Chỉ hướng đi lên dốc nhất |
| Hàm lồi | Convex function | Dịch. Đồ thị hình cái bát, mọi đáy cục bộ đều là đáy toàn cục. MSE của hồi quy tuyến tính là hàm lồi |
| Hạng (của ma trận) | Rank | Dịch |
| Hình chiếu vuông góc | Orthogonal projection | Dịch |
| Kỳ vọng | Expectation | Dịch |
| Ma trận | Matrix | Dịch |
| Ma trận đơn vị | Identity matrix | Dịch. Ký hiệu $\mathbf{I}$: số 1 trên đường chéo, 0 ở mọi chỗ khác |
| Ma trận Hessian | Hessian matrix | Giữ "Hessian". Ma trận các đạo hàm riêng bậc hai. Với MSE là $\frac{2}{m}\mathbf{X}^\top\mathbf{X}$ |
| Ma trận khả nghịch / suy biến | Invertible / singular matrix | Dịch |
| Ma trận nghịch đảo | Inverse matrix | Dịch |
| Ma trận thiết kế | Design matrix | Dịch. Mỗi hàng một mẫu, mỗi cột một đặc trưng, thêm cột toàn số 1 cho hệ số tự do |
| Nghiệm dạng đóng | Closed-form solution | Dịch. Nghiệm viết được bằng một công thức hữu hạn, ví dụ phương trình chuẩn hay nghiệm của Ridge |
| Nghiệm có độ dài nhỏ nhất | Minimum-norm solution | Dịch. Nghiệm mà `np.linalg.lstsq` trả về khi có vô số nghiệm |
| Phân phối xác suất | Probability distribution | Dịch |
| Phụ thuộc tuyến tính | Linearly dependent | Dịch |
| Phương sai | Variance | Dịch |
| Quy tắc hàm hợp | Chain rule | Dịch |
| Số điều kiện | Condition number | Dịch. Ký hiệu $\kappa$. Với Hessian của hàm bậc hai: $\kappa = L/\mu$, tỉ số độ cong lớn nhất và nhỏ nhất; $\kappa$ lớn thì bát dẹt, gradient descent chậm |
| Tích vô hướng | Dot product | Dịch |
| Tiếp tuyến | Tangent line | Dịch. Đường thẳng chạm đồ thị tại một điểm, có độ dốc bằng đạo hàm tại đó |
| Trị riêng | Eigenvalue | Dịch |
| Vectơ | Vector | Dịch |
| Vectơ riêng | Eigenvector | Dịch. Hướng mà ma trận chỉ co giãn, không xoay: $\mathbf{H}\mathbf{v} = \lambda\mathbf{v}$ |
