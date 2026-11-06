# Bảng thuật ngữ Việt – Anh

Dùng thống nhất cho toàn bộ AI Atlas. Gặp thuật ngữ mới thì thêm vào đúng nhóm, giữ thứ tự chữ cái theo cột tiếng Việt.

**Cột "Cách dùng":**
- **Dịch**: viết tiếng Việt, lần đầu kèm tiếng Anh trong ngoặc.
- **Giữ**: giữ nguyên tiếng Anh vì người Việt quen dùng hơn.

**"Mô hình" hay "model":** trong lời văn luôn viết "mô hình". Chỉ giữ chữ "model" khi nó là tên tham số, tên biến hay một phần của code, ví dụ `model="..."`, `LLM_MODEL`. Cụm "mô hình reasoning" giữ chữ "reasoning" (xem nhóm NLP và LLM).

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
| Benchmark | Benchmark | Giữ. Bộ bài kiểm tra chuẩn, công khai, dùng để so các mô hình với nhau |
| Biểu đồ phân tán | Scatter plot | Dịch |
| Dữ liệu mất cân bằng | Imbalanced data | Dịch |
| Dữ liệu tổng hợp | Synthetic data | Dịch. Dữ liệu do mô hình (thường là LLM) sinh ra thay vì thu từ người thật, ví dụ câu hỏi thử để đánh giá truy xuất |
| Đặc trưng | Feature | Dịch |
| Điểm ngoại lai | Outlier | Dịch. Điểm nằm xa hẳn phần còn lại của dữ liệu. Không gọi là "nhiễu". Khác "giá trị ngoại lai" của một phần tử trong ma trận (nhóm Huấn luyện, đánh giá và nén LLM) |
| Huấn luyện | Training | Dịch. Chọn tham số của mô hình để hàm mất mát trên tập huấn luyện nhỏ. Trong scikit-learn là `fit` |
| Mẫu | Sample | Dịch |
| Mô hình | Model | Dịch. Trong lời văn luôn viết "mô hình"; "model" chỉ dùng trong tên tham số, biến, code |
| Người gán nhãn | Labeler | Dịch. Người viết câu trả lời mẫu hoặc so sánh, chấm các câu trả lời để tạo dữ liệu huấn luyện |
| Nhãn | Label | Dịch |
| Nhiễu | Noise | Dịch. Phần biến động của nhãn mà các đặc trưng không giải thích được. Khác "điểm ngoại lai" |
| Rò rỉ dữ liệu | Data leakage | Dịch. Thông tin của tập kiểm tra lọt vào quá trình huấn luyện (mẫu trùng, chọn mô hình hay xử lý dữ liệu bằng tập kiểm tra), làm điểm kiểm tra lạc quan |
| Rò rỉ dữ liệu kiểm tra | Test-set contamination | Dịch, lần đầu kèm "contamination". Trường hợp riêng của rò rỉ dữ liệu: câu hỏi hay đáp án của benchmark đã nằm sẵn trong dữ liệu pre-train |
| Siêu tham số | Hyperparameter | Dịch |
| Suy luận | Inference | Dịch. Dùng mô hình đã huấn luyện để dự đoán hay sinh văn bản, phân biệt với huấn luyện. Chỗ dễ nhầm với "suy luận" theo nghĩa lập luận (reasoning) thì ghi kèm "inference" |
| Tăng cường dữ liệu | Data augmentation | Dịch |
| Tập huấn luyện | Training set | Dịch |
| Tập kiểm định | Validation set | Dịch |
| Tập kiểm tra | Test set | Dịch |
| Tham số | Parameter | Dịch |

## Machine Learning

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Advantage | Advantage | Giữ. Trong học tăng cường: phần thưởng của một hành động (câu trả lời) hơn hay kém mức kỳ vọng bao nhiêu |
| Batch, mini-batch | Batch, mini-batch | Giữ. Nhóm mẫu dùng để tính gradient trong một bước. Batch gradient descent dùng cả $m$ mẫu, mini-batch dùng $B$ mẫu |
| Bình phương tối thiểu | Least squares | Dịch. Không dùng "bình phương nhỏ nhất" |
| Bình phương tối thiểu thông thường | Ordinary least squares (OLS) | Dịch, viết tắt OLS. Tên scikit-learn dùng cho `LinearRegression` |
| Cây quyết định | Decision tree | Dịch |
| Chính sách | Policy | Dịch. Trong học tăng cường: cách tác nhân chọn hành động. Với LLM, chính sách là chính mô hình ngôn ngữ; ký hiệu $\pi_{\boldsymbol{\phi}}$ trong các bài RLHF, DPO |
| Chuẩn hóa đặc trưng | Feature scaling; feature standardization (z-score) | Dịch. Đưa các đặc trưng về cùng thang đo, tham số tính trên tập train. Hay gặp nhất là z-score: trung bình 0, độ lệch chuẩn 1, $z_j = (x_j - \mu_j)/\sigma_j$ (`StandardScaler`). Cách khác: chuẩn hóa min-max. Khác regularization |
| Chuẩn hóa min-max | Min-max scaling | Dịch. Đưa đặc trưng về đoạn $[0, 1]$: $(x - \min)/(\max - \min)$, với min, max lấy trên tập train (`MinMaxScaler`). Bài Gradient Descent viết $\tilde{x}$, $\tilde{w}$, $\tilde{b}$ |
| Co (hệ số) | Shrinkage | Dịch. Regularization kéo độ lớn các hệ số về gần 0 |
| Coordinate descent | Coordinate descent | Giữ. Thuật toán lặp, mỗi lần cập nhật một hệ số; scikit-learn dùng cho Lasso và Elastic Net |
| Cộng tuyến | Collinearity | Dịch. Các đặc trưng phụ thuộc tuyến tính, hoặc gần như vậy, ví dụ diện tích theo m² và theo ft² |
| Cross-entropy | Cross-entropy | Giữ, có thể ghi "entropy chéo". Hàm mất mát cho phân loại và mô hình ngôn ngữ: trung bình của $-\ln$ xác suất mà mô hình gán cho nhãn (token) đúng |
| Cực tiểu toàn cục / cục bộ | Global / local minimum | Dịch. Điểm thấp nhất của cả hàm / điểm thấp nhất trong một vùng lân cận. Hàm lồi chỉ có cực tiểu toàn cục |
| Dừng sớm | Early stopping | Dịch. Giữ lại mô hình ở bước có loss nhỏ nhất trên tập kiểm định (không phải tập kiểm tra), thay vì huấn luyện tới bước cuối |
| Điểm đòn bẩy cao | High-leverage point | Dịch. Điểm có đặc trưng nằm xa phần còn lại, có thể kéo mạnh đường hồi quy |
| Điểm trung bình | Mean point | Dịch. Điểm $(\bar{x}, \bar{y})$. Đường bình phương tối thiểu (có hệ số tự do) luôn đi qua điểm này |
| Độ chệch | Bias | Dịch, lần đầu ghi "độ chệch (bias)". Sai lệch có hệ thống do mô hình quá đơn giản. Khác hệ số tự do $b$: trong bài có cả hai thì luôn gọi $b$ là "hệ số tự do". Khác "thiên lệch" của giám khảo LLM |
| Độ chính xác | Accuracy | Dịch. Tỉ lệ mẫu (câu trả lời) được dự đoán đúng. Không nhầm với precision |
| Độ dốc | Slope | Dịch. Trong hồi quy: chỉ gọi $w$ là độ dốc khi có một đặc trưng. Nhiều đặc trưng thì gọi "trọng số" |
| Độ thưa | Sparsity | Dịch. Tỉ lệ phần tử bằng đúng 0 trong một vectơ hay ma trận (xem "thưa") |
| Đường cong mất mát | Loss curve | Dịch. Đồ thị mất mát theo số bước hoặc số epoch khi huấn luyện |
| Elastic Net | Elastic Net | Giữ. Phạt cả L1 lẫn L2: $\mathcal{L} + \lambda_1\lVert\mathbf{w}\rVert_1 + \lambda_2\lVert\mathbf{w}\rVert_2^2$ |
| Epoch | Epoch | Giữ. Một lượt đi qua toàn bộ tập train. Với mini-batch cỡ $B$, một epoch có $m/B$ bước |
| Fold | Fold | Giữ. Một trong $k$ phần của dữ liệu khi kiểm định chéo |
| Gradient descent | Gradient descent | Giữ, viết tắt GD. Lần đầu có thể ghi "hạ gradient". Cập nhật $\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \eta\nabla\mathcal{L}(\boldsymbol{\theta})$ |
| Gradient descent ngẫu nhiên | Stochastic gradient descent (SGD) | Giữ "SGD". Mỗi bước dùng một mẫu chọn ngẫu nhiên |
| Hàm giá trị | Value function | Dịch. Trong học tăng cường: ước lượng phần thưởng kỳ vọng từ một trạng thái. PPO cần thêm mô hình này, còn gọi là critic |
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
| Tác nhân | Agent | Dịch. Trong học tăng cường: bên chọn hành động và học từ phần thưởng. Khác "agent" của ứng dụng LLM (nhóm Ứng dụng LLM: RAG và agent) |
| Thưa (mô hình, vectơ) | Sparse | Dịch. Có nhiều hệ số bằng đúng 0 |
| Tiêu chí dừng | Stopping criterion | Dịch. Điều kiện để dừng thuật toán lặp: số bước tối đa, gradient đủ nhỏ, mất mát hết giảm |
| Tổ hợp mô hình | Ensemble | Dịch, lần đầu kèm "ensemble". Huấn luyện nhiều mô hình rồi gộp dự đoán của chúng (lấy trung bình, bỏ phiếu), thường tốt hơn từng mô hình riêng |
| Tốc độ học | Learning rate | Dịch |
| Tổng quát hóa | Generalization | Dịch. Khả năng làm tốt trên dữ liệu chưa thấy khi huấn luyện. Ước lượng bằng điểm trên tập kiểm tra |
| Trọng số | Weight | Dịch |
| Variance (của mô hình) | Variance | Giữ trong cụm bias–variance: mức mô hình học được thay đổi khi đổi bộ dữ liệu huấn luyện. Nghĩa thống kê chung thì dịch "phương sai" (nhóm Toán) |
| Weight decay | Weight decay | Giữ. Tên hay dùng cho phạt L2 trên trọng số, nhất là trong mạng nơ-ron |
| Xấp xỉ ngẫu nhiên | Stochastic approximation | Dịch. Phương pháp của Robbins và Monro (1951): tìm nghiệm khi chỉ quan sát được giá trị có nhiễu. Tiền thân của SGD |

## Deep Learning

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Attention nhiều đầu | Multi-head attention | Dịch phần "nhiều đầu", lần đầu kèm "multi-head". Chạy nhiều phép attention song song, mỗi đầu có truy vấn, khóa, giá trị riêng, rồi ghép kết quả |
| Cắt chuẩn gradient | Gradient clipping | Dịch, lần đầu kèm "gradient clipping". Khi chuẩn của vectơ gradient vượt ngưỡng thì co nó lại về đúng ngưỡng, giữ nguyên hướng |
| Chuẩn hóa lớp | Layer normalization | Dịch. Đưa các thành phần của một vectơ về trung bình 0, độ lệch chuẩn 1, rồi co giãn và dịch bằng tham số học được. Ký hiệu $\mathrm{LN}$ |
| Cơ chế chú ý | Attention mechanism | Dịch, thường gọi tắt "attention" |
| Cổng (trong mạng nơ-ron) | Gate | Dịch. Một nhánh tính hệ số nhân từng phần tử, quyết định cho thông tin qua nhiều hay ít, ví dụ trong SwiGLU, LSTM. Khác "cổng" (port) của máy chủ |
| Cross-attention | Cross-attention | Giữ. Attention trong đó truy vấn lấy từ một chuỗi, khóa và giá trị lấy từ chuỗi khác: decoder nhìn đầu ra của encoder, hay token chữ nhìn đặc trưng ảnh |
| Đóng băng (tham số) | Freeze, frozen | Dịch, lần đầu kèm "frozen". Giữ nguyên một phần tham số khi huấn luyện, nên phần đó không cần gradient và trạng thái bộ tối ưu |
| Độ chính xác hỗn hợp | Mixed precision | Dịch, lần đầu kèm "mixed precision". Tính phần lớn phép toán ở 16 bit, giữ bản chính của trọng số ở 32 bit. "Độ chính xác" ở đây là độ chính xác số học, khác accuracy |
| Hàm kích hoạt | Activation function | Dịch. Khác "kích hoạt" (giá trị trung gian của các lớp) |
| Học đối chiếu | Contrastive learning | Dịch. Học biểu diễn bằng cách kéo các cặp khớp nhau (ảnh và chú thích của nó) lại gần, đẩy các cặp không khớp ra xa, như CLIP |
| Kết nối tắt | Residual connection | Dịch. Cộng đầu vào của một khối vào đầu ra của nó, $\mathbf{x} + f(\mathbf{x})$, giúp huấn luyện mạng sâu |
| Kích hoạt | Activation | Dịch. Giá trị trung gian (đầu ra của các lớp) trong lượt lan truyền xuôi, phải giữ lại cho lan truyền ngược nên tốn bộ nhớ khi huấn luyện. Khác "hàm kích hoạt" |
| Lan truyền ngược | Backpropagation | Dịch |
| Lan truyền xuôi | Forward propagation | Dịch |
| Logit | Logit | Giữ. Điểm thô (chưa chuẩn hóa, có thể âm) mà mô hình cho mỗi lớp hay mỗi token, ký hiệu $z_i$. Softmax đổi logit thành xác suất |
| Mạng hồi tiếp | Recurrent Neural Network (RNN) | Dịch, viết tắt RNN |
| Mạng nơ-ron | Neural network | Dịch |
| Mạng tích chập | Convolutional Neural Network (CNN) | Dịch, viết tắt CNN |
| Mạng tích chập đồ thị | Graph convolutional network (GCN) | Dịch, viết tắt GCN. Mỗi nút cập nhật biểu diễn của mình bằng cách gộp biểu diễn của các nút láng giềng; cần huấn luyện |
| Mạng truyền thẳng | Feed-forward network (FFN) | Dịch, viết tắt FFN, còn gọi là khối MLP. Trong khối Transformer: hai lớp tuyến tính với hàm kích hoạt ở giữa, áp riêng cho từng vị trí |
| Phát hiện bất thường (autograd) | Anomaly detection | Dịch. Chế độ của PyTorch (`torch.autograd.set_detect_anomaly`) chỉ ra phép toán sinh NaN khi lan truyền ngược |
| Post-LN / Pre-LN | Post-LN / Pre-LN | Giữ. Vị trí của chuẩn hóa lớp: sau phép cộng của kết nối tắt (Transformer gốc) hay trước mỗi khối con (GPT-2 trở đi, còn gọi pre-norm). Pre-LN dễ huấn luyện hơn |
| RMSNorm | RMSNorm | Giữ. Chuẩn hóa lớp bỏ bước trừ trung bình, chỉ chia cho căn của trung bình bình phương (root mean square); dùng ở Llama |
| Self-attention | Self-attention | Giữ. Attention trong đó mỗi vị trí của một chuỗi nhìn các vị trí của chính chuỗi đó |
| Sigmoid | Sigmoid | Giữ. $\sigma(z) = 1/(1 + e^{-z})$, đưa một số thực về khoảng $(0, 1)$ |
| Softmax | Softmax | Giữ. $\mathrm{softmax}(\mathbf{z})_i = e^{z_i} / \sum_j e^{z_j}$: đổi logit thành phân phối xác suất |
| SwiGLU | SwiGLU | Giữ. Mạng truyền thẳng có cổng: nhân từng phần tử một nhánh qua hàm Swish với một nhánh tuyến tính; dùng ở Llama |
| Trạng thái ẩn | Hidden state | Dịch. Vectơ mà RNN cập nhật sau mỗi token, tóm tắt mọi token đã đọc. Khác "vectơ ẩn" (latent vector) của MLA |
| Trạng thái bộ tối ưu | Optimizer state | Dịch, không viết "trạng thái tối ưu". Các đại lượng bộ tối ưu giữ cho mỗi tham số, ví dụ hai trung bình động của Adam |
| Truy vấn, khóa, giá trị | Query, key, value | Dịch, lần đầu kèm tiếng Anh. Ký hiệu ma trận $\mathbf{Q}$, $\mathbf{K}$, $\mathbf{V}$ |
| Warmup | Learning-rate warmup | Giữ, lần đầu ghi "khởi động tốc độ học". Tăng dần $\eta$ từ gần 0 trong những bước đầu thay vì dùng ngay giá trị lớn |

## NLP và LLM

Khái niệm về mô hình ngôn ngữ, cách sinh văn bản và cách viết prompt.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Beam search | Beam search | Giữ. Khi giải mã, giữ $B$ chuỗi có điểm cao nhất ở mỗi bước thay vì một chuỗi như giải mã tham lam |
| Bigram | Bigram model | Giữ, viết "mô hình bigram". Mô hình đoán token kế tiếp chỉ từ một token ngay trước |
| BLEU | BLEU | Giữ. Điểm đo bản dịch máy khớp bản dịch tham chiếu tới đâu, dựa trên tỉ lệ n-gram trùng nhau, kèm phạt câu quá ngắn |
| Bộ mã hóa ảnh | Vision encoder, image encoder | Dịch. Mạng (thường là ViT) đổi ảnh thành dãy vectơ đặc trưng |
| Bộ tách từ | Tokenizer | Dịch. Đổi văn bản thành dãy số thứ tự của token và ngược lại |
| Chain-of-thought (CoT) | Chain-of-thought | Giữ, viết tắt CoT, lần đầu có thể ghi "chuỗi suy luận". Cho mô hình viết các bước trung gian trước đáp án |
| Chat template | Chat template | Giữ. Quy tắc ghép các lượt hội thoại (vai trò, nội dung, token đặc biệt) thành một chuỗi. Mỗi mô hình chat có template riêng; dùng sai thì chất lượng giảm mà không báo lỗi |
| Chỉ dẫn | Instruction | Dịch. Phần của prompt nói mô hình cần làm gì |
| Cửa sổ ngữ cảnh | Context window | Dịch. Số token tối đa của đầu vào cộng đầu ra trong một lần gọi |
| Dấu phân cách | Delimiter | Dịch. Ký hiệu tách chỉ dẫn khỏi dữ liệu trong prompt, ví dụ `"""` hay thẻ XML |
| Decoder-only | Decoder-only | Giữ, lần đầu ghi "chỉ có decoder". Kiến trúc Transformer chỉ gồm các khối decoder có mặt nạ nhân quả, như GPT |
| Dịch phải | Shift right | Dịch. Đẩy chuỗi đích sang phải một vị trí (thêm token bắt đầu ở đầu) để làm đầu vào của decoder khi dùng teacher forcing |
| Dự đoán token kế tiếp | Next-token prediction | Dịch, giữ chữ "token". Nhiệm vụ học của mô hình ngôn ngữ: ước lượng $p(x_t \mid x_{<t})$ |
| Đa phương thức | Multimodal | Dịch. Nhận hoặc sinh nhiều loại dữ liệu (chữ, ảnh, âm thanh…) |
| Đệm (trái, phải) | Padding (left, right) | Dịch, lần đầu kèm "padding". Token thêm vào để các chuỗi trong batch dài bằng nhau; phải che khỏi attention và loss. Khi sinh theo lô với mô hình decoder-only thì đệm bên trái |
| Độ rộng chùm | Beam width | Dịch. Số chuỗi $B$ mà beam search giữ ở mỗi bước. $B = 1$ chính là giải mã tham lam |
| Embedding | Embedding | Giữ |
| Embedding vị trí | Position embedding | Giữ "embedding", dịch "vị trí". Vectơ cộng vào token để mô hình biết thứ tự |
| Encoder, decoder | Encoder, decoder | Giữ, lần đầu có thể ghi "bộ mã hóa", "bộ giải mã". Encoder đọc chuỗi nguồn thành các vectơ; decoder sinh chuỗi đích từng token |
| EOS | End-of-sequence (EOS) token | Giữ. Token đặc biệt báo hết chuỗi; mô hình không học sinh EOS thì không biết dừng. Token bắt đầu tương ứng là BOS |
| Exposure bias | Exposure bias | Giữ. Lệch giữa huấn luyện (luôn thấy tiền tố đúng nhờ teacher forcing) và lúc sinh (thấy tiền tố do chính mô hình viết, có thể sai) |
| Fine-tune | Fine-tuning | Giữ, có thể ghi "tinh chỉnh" |
| Fusion sớm / fusion muộn | Early fusion / late fusion | Giữ "fusion", lần đầu có thể ghi "trộn sớm" / "trộn muộn". Fusion sớm: đổi mọi phương thức thành token chung ngay từ đầu, một mô hình xử lý tất cả, như Chameleon. Fusion muộn: giữ bộ mã hóa riêng cho từng phương thức rồi mới nối đặc trưng vào mô hình ngôn ngữ, như Flamingo, LLaVA |
| Giải mã tham lam | Greedy decoding | Dịch. Luôn chọn token có xác suất lớn nhất; tương ứng nhiệt độ $T \to 0$ |
| Hallucination | Hallucination | Giữ, lần đầu ghi "bịa thông tin". Mô hình viết ra điều sai hoặc không có trong nguồn với giọng chắc chắn |
| Học trong ngữ cảnh | In-context learning | Dịch. Mô hình làm theo các ví dụ đặt trong prompt mà trọng số không đổi |
| Khử nhiễu | Denoising | Dịch, lần đầu kèm "denoising". Mục tiêu huấn luyện: làm hỏng đầu vào (che hay xóa một số đoạn) rồi bắt mô hình khôi phục phần bị hỏng, như mục tiêu pre-train của T5 |
| Làm trơn cộng k | Add-k smoothing | Dịch, viết "làm trơn cộng $k$". Cộng $k$ vào mọi lần đếm để không có xác suất bằng 0 |
| Mặt nạ nhân quả | Causal mask | Dịch. Chặn để vị trí $t$ chỉ nhìn được các vị trí từ $t$ trở về trước |
| Mô hình chuỗi sang chuỗi | Sequence-to-sequence (Seq2Seq) | Dịch, viết tắt Seq2Seq. Đọc một chuỗi rồi sinh một chuỗi khác, thường gồm encoder và decoder, như dịch máy |
| Mô hình ngôn ngữ | Language model | Dịch. Mô hình cho xác suất của token kế tiếp khi biết các token trước, $p(x_t \mid x_{<t})$ |
| Mô hình ngôn ngữ lớn | Large Language Model (LLM) | Dịch, viết tắt LLM |
| Mô hình reasoning | Reasoning model | Dịch "mô hình", giữ "reasoning". Mô hình được huấn luyện để tự suy luận nhiều bước trước khi trả lời |
| Nhiệt độ | Temperature | Dịch. Ký hiệu $T$: chia logit cho $T$ trước softmax. $T$ nhỏ làm phân phối nhọn, $T$ lớn làm phân phối phẳng |
| Nút thắt | Bottleneck | Dịch. Chỗ hẹp mà mọi thông tin phải đi qua, ví dụ một vectơ cố định tóm tắt cả câu nguồn trong Seq2Seq không có attention. Cũng dùng theo nghĩa chung: phần chậm nhất của hệ thống |
| Patch | Patch | Giữ, lần đầu có thể ghi "ô ảnh". Mảnh vuông $P \times P$ cắt từ ảnh; mỗi patch thành một token ảnh |
| Patch embedding | Patch embedding | Giữ. Phép chiếu tuyến tính đổi mỗi patch thành một vectơ |
| Perplexity | Perplexity | Giữ, ký hiệu $\mathrm{PPL} = \exp(\mathcal{L})$ với $\mathcal{L}$ là cross-entropy. Đọc như số lựa chọn đều nhau mà mô hình đang phân vân ở mỗi bước |
| Phạt độ dài | Length penalty | Dịch. Chia điểm log-xác suất của chuỗi cho một hàm của độ dài, để beam search không thiên về câu ngắn |
| Phương thức | Modality | Dịch. Một loại dữ liệu: chữ, ảnh, âm thanh, video |
| Pre-train | Pre-training | Giữ. Giai đoạn huấn luyện đầu tiên trên lượng lớn văn bản, bằng dự đoán token kế tiếp |
| Prefix LM | Prefix LM | Giữ. Một khối Transformer trong đó phần tiền tố nhìn hai chiều, phần sau dùng mặt nạ nhân quả |
| Projector | Projector | Giữ, lần đầu có thể ghi "lớp chiếu". Mạng nhỏ đổi đặc trưng ảnh sang cùng không gian với embedding chữ của LLM |
| Prompt | Prompt | Giữ. Văn bản đầu vào gửi cho mô hình |
| Prompt chaining | Prompt chaining | Giữ. Chia việc thành nhiều lần gọi, đầu ra của lần trước là đầu vào của lần sau |
| Prompt engineering | Prompt engineering | Giữ. Cách viết và thử prompt để mô hình làm đúng việc |
| Scheduled sampling | Scheduled sampling | Giữ. Khi huấn luyện, thỉnh thoảng thay token đúng bằng token mô hình tự sinh, tỉ lệ tăng dần, để giảm exposure bias |
| Sinh ảnh | Image generation | Dịch. Tạo ảnh từ mô tả bằng chữ |
| Sổ mã | Codebook | Dịch, lần đầu kèm "codebook". Bảng vectơ cố định; mỗi mảnh ảnh được thay bằng số thứ tự của vectơ gần nhất, thành một token rời rạc |
| Tách từ | Tokenization | Dịch |
| Teacher forcing | Teacher forcing | Giữ. Khi huấn luyện decoder, đưa token đúng của bước trước làm đầu vào thay vì token mô hình vừa sinh |
| Tiền tố tác vụ | Task prefix | Dịch. Chuỗi ngắn đặt đầu đầu vào để nói tác vụ, như `translate English to German:` của T5 |
| Token | Token | Giữ |
| Token ảnh | Image token, visual token | Giữ "token", dịch "ảnh". Vectơ (hay số thứ tự) đại diện một patch, đi vào LLM như token chữ |
| Token lớp | Class token | Giữ "token", dịch "lớp", lần đầu kèm "class token". Token học được đặt ở đầu dãy (như `[CLS]` của BERT); trạng thái của nó ở lớp cuối đại diện cho cả đầu vào, ví dụ để phân loại ảnh trong ViT |
| Top-k | Top-k sampling | Giữ. Chỉ lấy mẫu trong $k$ token có xác suất lớn nhất. Khác top-k khi truy xuất |
| Top-p | Top-p (nucleus) sampling | Giữ. Chỉ lấy mẫu trong nhóm token nhỏ nhất có tổng xác suất đạt $p$ |
| Từ vựng | Vocabulary | Dịch. Tập mọi token mà mô hình biết, ký hiệu $\mathcal{V}$, cỡ từ vựng $V$ |
| Vision | Vision | Giữ. Khả năng nhận ảnh làm đầu vào; lần đầu giải thích "mô hình nhìn được ảnh" |
| Zero-shot / one-shot / few-shot | Zero-shot / one-shot / few-shot | Giữ, lần đầu ghi "không ví dụ" / "một ví dụ" / "vài ví dụ" (trong prompt) |

## Kiến trúc LLM

Các linh kiện của LLM hiện đại: attention tiết kiệm bộ nhớ, mã hóa vị trí, hỗn hợp chuyên gia.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Cân bằng tải | Load balancing | Dịch. Giữ cho các expert nhận số token gần đều nhau |
| Chia nhỏ expert | Fine-grained expert segmentation | Dịch, giữ "expert". Tách mỗi expert thành nhiều expert nhỏ hơn và chọn nhiều expert hơn cho mỗi token (DeepSeekMoE) |
| Dự đoán nhiều token | Multi-token prediction (MTP) | Dịch, viết tắt MTP. Ở mỗi vị trí, học đoán thêm cả các token xa hơn token kế tiếp |
| Điểm khớp | Affinity score | Dịch. Điểm $s_i$ router cho token với expert $i$ |
| Expert | Expert | Giữ. Một mạng truyền thẳng con trong lớp MoE |
| Expert dùng chung / expert định tuyến | Shared / routed expert | Giữ "expert". Expert dùng chung luôn chạy với mọi token; expert định tuyến chỉ chạy khi router chọn |
| GQA | Grouped-query attention | Giữ viết tắt, lần đầu ghi "attention truy vấn theo nhóm". Chia các đầu truy vấn thành nhóm, mỗi nhóm dùng chung một cặp khóa, giá trị; nằm giữa attention nhiều đầu và MQA |
| KV cache | KV cache | Giữ. Khóa và giá trị của các token trước, tính một lần rồi lưu lại để mỗi bước sinh không phải tính lại |
| MLA | Multi-head latent attention | Giữ. Nén khóa và giá trị của mỗi token thành một vectơ ẩn ngắn; KV cache chỉ lưu vectơ đó |
| MoE | Mixture of experts | Giữ viết tắt, lần đầu ghi "mixture of experts, hỗn hợp chuyên gia". Lớp gồm nhiều expert, router chọn vài expert cho mỗi token |
| MQA | Multi-query attention | Giữ. Mọi đầu truy vấn dùng chung một cặp khóa, giá trị: KV cache nhỏ nhất |
| RoPE | Rotary position embedding | Giữ viết tắt, lần đầu ghi "mã hóa vị trí xoay". Xoay $\mathbf{q}$, $\mathbf{k}$ một góc tỉ lệ với vị trí, để điểm attention chỉ phụ thuộc vị trí qua khoảng cách |
| RoPE tách riêng | Decoupled RoPE | Giữ "RoPE", dịch "tách riêng". Thêm một phần khóa, truy vấn nhỏ riêng để mang RoPE, vì RoPE không ghép được với phép nén của MLA |
| Router | Router | Giữ, lần đầu ghi "bộ định tuyến". Lớp chấm điểm khớp giữa token và các expert rồi chọn vài expert. Khác semantic router của ứng dụng RAG |
| Sụp định tuyến | Routing collapse | Dịch. Router chọn mãi vài expert, các expert khác hầu như không được học |
| Trọng số cổng | Gating value (gate) | Dịch. Hệ số $g_i$ nhân vào đầu ra của expert $i$ trước khi cộng lại |
| Vectơ ẩn | Latent vector | Dịch. Vectơ ngắn mà MLA nén khóa và giá trị vào. Khác "trạng thái ẩn" (hidden state) của RNN |

## Huấn luyện, đánh giá và nén LLM

Dữ liệu pre-train, fine-tune, học từ ưa thích của người, huấn luyện trên nhiều GPU, đánh giá, tinh chỉnh tiết kiệm và nén mô hình.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Adapter | Adapter | Giữ. Khối tham số nhỏ gắn thêm vào mô hình đóng băng; chỉ khối này được huấn luyện |
| Alignment tax | Alignment tax | Giữ. Phần năng lực (điểm benchmark) bị giảm đi sau khi huấn luyện mô hình theo ý người, như sau RLHF |
| All-reduce | All-reduce | Giữ. Phép giao tiếp cộng gộp một tensor trên mọi GPU rồi gửi kết quả về tất cả |
| Băng (LSH) | Band | Dịch. Chữ ký MinHash chia thành $b$ băng, mỗi băng $r$ hàng; hai tài liệu trùng nhau ở ít nhất một băng thì thành cặp ứng viên |
| Bong bóng (pipeline) | Pipeline bubble | Dịch, lần đầu kèm "pipeline bubble". Thời gian GPU ngồi chờ ở đầu và cuối mỗi lô trong song song pipeline |
| Bộ phân loại chất lượng | Quality classifier | Dịch. Mô hình chấm điểm chất lượng của tài liệu để giữ lại phần tốt khi lọc dữ liệu |
| Cặp ứng viên | Candidate pair | Dịch. Cặp tài liệu LSH cho là có thể giống nhau, sẽ được so kỹ |
| Chắt lọc tri thức | Knowledge distillation | Dịch, lần đầu kèm tiếng Anh. Huấn luyện mô hình nhỏ (trò) bắt chước đầu ra của mô hình lớn (thầy) |
| DPO | Direct Preference Optimization | Giữ viết tắt, lần đầu ghi "tối ưu ưa thích trực tiếp". Huấn luyện chính sách thẳng trên các cặp ưa thích bằng một loss kiểu phân loại, không cần mô hình phần thưởng riêng và vòng học tăng cường |
| Đóng gói chuỗi | Sequence packing | Dịch, lần đầu kèm "packing". Nối nhiều tài liệu ngắn (ngăn bằng EOS) thành chuỗi dài cố định để không phí chỗ cho phần đệm |
| Fine-tune có giám sát | Supervised fine-tuning (SFT) | Giữ "fine-tune", viết tắt SFT. Huấn luyện tiếp mô hình đã pre-train trên các cặp prompt và câu trả lời mẫu |
| FSDP, ZeRO | Fully Sharded Data Parallel, Zero Redundancy Optimizer | Giữ. Song song dữ liệu nhưng chia trạng thái bộ tối ưu, gradient và trọng số ra các GPU thay vì mỗi GPU giữ một bản đầy đủ. ZeRO có ba mức (stage 1, 2, 3); FSDP là cách cài đặt của PyTorch |
| Giá trị ngoại lai (trong ma trận) | Outlier | Dịch. Một phần tử có độ lớn vượt xa phần còn lại của ma trận (trọng số hay kích hoạt), làm hệ số co giãn lớn và các giá trị nhỏ bị làm tròn về 0 khi lượng tử hóa. Khác "điểm ngoại lai" (một mẫu dữ liệu) |
| GRPO | Group relative policy optimization | Giữ. Biến thể của PPO không cần hàm giá trị: advantage của mỗi câu trả lời là điểm chuẩn hóa trong nhóm câu trả lời cho cùng prompt, $A_i = (r_i - \text{mean})/\text{std}$ |
| Hệ số co giãn (lượng tử hóa) | Scale | Dịch. Số thực $s$ dùng để đổi qua lại giữa trọng số và số nguyên khi lượng tử hóa: $w \approx s\,q$ |
| Học ngoại tuyến | Offline learning | Dịch, lần đầu kèm "offline". Học từ bộ dữ liệu thu sẵn, không sinh câu trả lời mới trong lúc huấn luyện, như DPO. Ngược lại là trực tuyến (online), như PPO trong RLHF |
| Học tăng cường từ phản hồi của người | Reinforcement learning from human feedback (RLHF) | Dịch, viết tắt RLHF. Ba bước: SFT, học mô hình phần thưởng từ các cặp so sánh, rồi tối ưu chính sách bằng học tăng cường |
| Instruction tuning | Instruction tuning | Giữ, lần đầu ghi "fine-tune theo chỉ dẫn". Fine-tune có giám sát trên nhiều tác vụ viết dưới dạng chỉ dẫn, để mô hình làm theo được chỉ dẫn mới |
| IPO, KTO, ORPO | IPO, KTO, ORPO | Giữ. Các biến thể của DPO |
| Khử trùng lặp | Deduplication | Dịch, lần đầu kèm "deduplication". Bỏ các tài liệu trùng nguyên văn hoặc gần trùng khỏi dữ liệu |
| Lấy mẫu từ chối | Rejection sampling | Dịch. Sinh nhiều câu trả lời, chỉ giữ những câu đạt tiêu chí (ví dụ được chấm đúng) làm dữ liệu SFT |
| Lề | Margin | Dịch. Hiệu điểm giữa câu thắng và câu thua, $\Delta = r_w - r_l$; trong DPO lề là $\beta d$ |
| LLM làm giám khảo | LLM-as-a-judge | Dịch, lần đầu kèm tiếng Anh. Đưa câu hỏi và câu trả lời cho một LLM mạnh chấm điểm hoặc chọn câu tốt hơn |
| Lọc bằng luật | Heuristic filtering | Dịch. Bỏ tài liệu theo các luật đơn giản: quá ngắn, quá nhiều ký tự lạ, dòng lặp lại… |
| Log tỉ số | Log-ratio | Dịch. $\ln\big(\pi_{\boldsymbol{\phi}}(\mathbf{y}) / \pi_{\text{ref}}(\mathbf{y})\big)$, bằng hiệu hai log-prob |
| LoRA | Low-rank adaptation | Giữ, lần đầu ghi "thích nghi hạng thấp". Giữ $\mathbf{W}$ đóng băng, chỉ học thêm $\Delta\mathbf{W} = \mathbf{B}\mathbf{A}$ có hạng $r$ nhỏ |
| Lời trình diễn | Demonstration | Dịch. Câu trả lời mẫu do người viết, dùng làm dữ liệu SFT |
| LSH | Locality-sensitive hashing | Giữ, lần đầu ghi "băm nhạy với độ giống". Băm sao cho các mục giống nhau dễ rơi vào cùng ô, nên chỉ cần so các cặp ứng viên thay vì mọi cặp |
| Luật Goodhart | Goodhart's law | Dịch. Một số đo bị biến thành mục tiêu thì không còn là số đo tốt |
| Lượng tử hóa / giải lượng tử | Quantization / dequantization | Dịch. Lưu mỗi trọng số bằng ít bit hơn (8 bit, 4 bit) qua một hệ số co giãn; giải lượng tử nhân ngược lại để tính. Dùng cả khi tinh chỉnh (QLoRA) lẫn khi chạy mô hình (GGUF) |
| Lý thuyết triển vọng | Prospect theory | Dịch. Lý thuyết của Kahneman và Tversky về cách con người ra quyết định khi có rủi ro; cảm hứng của KTO |
| Mảng hậu tố | Suffix array | Dịch. Mảng vị trí các hậu tố của một chuỗi, xếp theo thứ tự từ điển; giúp tìm nhanh các đoạn lặp nguyên văn |
| Mặt nạ chéo tài liệu | Cross-document attention mask | Dịch. Chặn token nhìn sang tài liệu khác trong cùng một chuỗi đóng gói |
| MFU | Model FLOPs utilization | Giữ, lần đầu có thể ghi "tỉ lệ khai thác tính toán". Tỉ lệ giữa số FLOPs mô hình thực sự dùng mỗi giây và mức tối đa của phần cứng |
| Micro-batch | Micro-batch | Giữ. Phần nhỏ của một lô: nối đuôi nhau qua các giai đoạn của song song pipeline, hoặc lần lượt cộng dồn gradient khi tích lũy gradient |
| MinHash | MinHash | Giữ. Chữ ký ngắn của một tập; tỉ lệ vị trí trùng giữa hai chữ ký ước lượng độ giống Jaccard |
| Mô hình Bradley–Terry | Bradley–Terry model | Dịch "mô hình", giữ tên riêng. $P(\mathbf{y}_w \succ \mathbf{y}_l) = \sigma(r_w - r_l)$: xác suất người chọn câu thắng chỉ phụ thuộc hiệu điểm |
| Mô hình phần thưởng | Reward model (RM) | Dịch, viết tắt RM. Chấm điểm $r$ cho câu trả lời, học từ các cặp mà người đã so sánh |
| Mô hình tham chiếu | Reference model | Dịch. Bản sao đóng băng của mô hình SFT, ký hiệu $\pi_{\text{ref}}$ |
| Mục tiêu phụ, loss phụ | Auxiliary objective, auxiliary loss | Dịch "phụ", giữ "loss". Khoản cộng thêm vào hàm mất mát chính để ép một tính chất, ví dụ loss mô hình ngôn ngữ khi fine-tune GPT-1, hay loss cân bằng tải của MoE |
| Nhãn mềm | Soft targets | Dịch. Phân phối xác suất của mô hình thầy, thay cho một nhãn đúng duy nhất, dùng để huấn luyện mô hình trò |
| PEFT | Parameter-efficient fine-tuning | Giữ, lần đầu ghi "tinh chỉnh tiết kiệm tham số". Tên chung của các cách fine-tune chỉ cập nhật một phần nhỏ tham số |
| Phạt KL | KL penalty | Dịch "phạt", giữ "KL". Trừ $\beta$ nhân độ lệch KL giữa chính sách và mô hình tham chiếu, để chính sách không đi quá xa |
| Phần thưởng ẩn | Implicit reward | Dịch. Trong DPO: $\beta\ln(\pi_{\boldsymbol{\phi}} / \pi_{\text{ref}})$, mô hình ngôn ngữ đóng luôn vai mô hình phần thưởng |
| Phần thưởng theo luật | Rule-based reward | Dịch. Phần thưởng tính bằng luật kiểm được (đáp án đúng, đúng định dạng) thay vì mô hình phần thưởng |
| PII | Personally identifiable information | Giữ, lần đầu ghi "dữ liệu định danh cá nhân". Email, số điện thoại, địa chỉ… cần lọc hoặc che khỏi dữ liệu |
| Reward hacking | Reward hacking | Giữ. Chính sách tìm cách lấy điểm cao từ mô hình phần thưởng mà chất lượng thật không tăng, có khi giảm |
| Shingle | Shingle | Giữ. Một cụm $n$ từ (hay ký tự) liền nhau; tài liệu được xem như tập các shingle để so độ giống |
| Song song dữ liệu, tensor, pipeline, context | Data, tensor, pipeline, context parallelism | Dịch "song song", giữ "tensor", "pipeline", "context". Chia việc huấn luyện ra nhiều GPU: theo lô dữ liệu, theo ma trận trong một lớp, theo chiều sâu (các lớp), theo chuỗi đầu vào |
| Thầy / trò | Teacher / student | Dịch. Mô hình lớn cung cấp đầu ra / mô hình nhỏ học bắt chước, trong chắt lọc tri thức |
| Thiên lệch (của giám khảo) | Bias | Dịch. Xu hướng chấm lệch có hệ thống của giám khảo LLM, ví dụ ưu ái câu đứng ở một vị trí, câu dài hơn. Khác "độ chệch" trong bias–variance và "hệ số tự do" |
| Tỉ lệ thắng | Win rate | Dịch, lần đầu kèm "win rate". Tỉ lệ các lần so cặp mà câu trả lời của mô hình được chọn (bởi người hay giám khảo LLM) là tốt hơn câu đối chứng |
| Tỉa tham số | Pruning | Dịch, lần đầu kèm "pruning". Bỏ (đặt về 0) các trọng số ít quan trọng, làm mô hình thưa |
| Tối ưu quá mức | Overoptimization | Dịch. Tối ưu điểm của mô hình phần thưởng quá lâu làm chất lượng thật giảm; gần nghĩa với reward hacking, một biểu hiện của luật Goodhart |
| Trùng lặp gần | Near-duplicate | Dịch. Hai tài liệu gần như giống nhau, chỉ khác vài chỗ (ngày tháng, quảng cáo…) |

## Ứng dụng LLM và công cụ

Gọi API, làm giao diện, an toàn của ứng dụng, thu thập và lưu dữ liệu.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Base64 | Base64 | Giữ. Cách mã hóa dữ liệu nhị phân (ví dụ ảnh) thành chuỗi ký tự |
| Biến môi trường | Environment variable | Dịch. Nơi đặt API key và cấu hình ngoài code, ví dụ `OPENAI_API_KEY` |
| Bộ chọn CSS | CSS selector | Dịch. Biểu thức chọn phần tử trong trang HTML, ví dụ `div.title > a` |
| Bộ đánh giá | Evaluation set (eval) | Dịch, lần đầu kèm "eval". Tập ví dụ có đáp án để chấm và so các phiên bản prompt |
| Bóc tách dữ liệu web | Web scraping | Dịch. Lấy dữ liệu có cấu trúc ra khỏi trang web đã tải về |
| Chạy lại (script) | Rerun | Dịch, lần đầu kèm "rerun". Streamlit chạy lại toàn bộ script sau mỗi tương tác |
| Chỉ mục / chỉ mục duy nhất | Index / unique index | Dịch. Giúp tìm nhanh theo một trường; chỉ mục duy nhất còn chặn hai bản ghi trùng giá trị trường đó |
| Chiếm mục tiêu | Goal hijacking | Dịch. Kiểu prompt injection bắt mô hình làm việc khác với việc ứng dụng giao |
| Chuỗi kết nối | Connection string | Dịch. Chuỗi chứa địa chỉ và thông tin đăng nhập cơ sở dữ liệu, ví dụ `mongodb://localhost:27017` |
| Chuỗi mồi | Canary (string) | Dịch, lần đầu kèm "canary". Chuỗi bí mật cài vào prompt để phát hiện prompt bị lộ |
| Collection | Collection | Giữ. Nhóm các document trong MongoDB, tương tự một bảng |
| Con trỏ (truy vấn) | Cursor | Dịch. Đối tượng trả về từ truy vấn, đọc dần từng kết quả |
| Content Credentials | Content Credentials (C2PA) | Giữ. Chuẩn C2PA gắn thông tin nguồn gốc vào ảnh, video |
| Cơ sở dữ liệu tài liệu | Document database | Dịch. Lưu dữ liệu dạng document (giống JSON) thay vì bảng, ví dụ MongoDB |
| Crawl | Web crawling | Giữ "crawl", lần đầu giải thích "thu thập trang web". Tự động tải trang và đi theo đường link |
| Data URL | Data URL | Giữ. Nhúng dữ liệu thẳng vào chuỗi: `data:<MIME>;base64,...` |
| Document | Document | Giữ. Một bản ghi trong MongoDB. Không dịch "văn bản" |
| Đầu ra có cấu trúc | Structured output | Dịch. API ép đầu ra khớp một JSON Schema cho trước. Khác JSON mode |
| Điều khoản dịch vụ | Terms of Service (ToS) | Dịch, viết tắt ToS |
| Endpoint | Endpoint | Giữ. Một địa chỉ cụ thể của API hay server, mỗi endpoint làm một việc, ví dụ Chat Completions, `/health` |
| Generator | Generator | Giữ. Hàm Python dùng `yield` để trả kết quả từng phần |
| Giao diện chat | Chat interface | Dịch |
| Giao thức loại trừ robot | Robots Exclusion Protocol | Dịch, lần đầu kèm tên tiếng Anh. Quy ước tệp `robots.txt` (RFC 9309) |
| Jitter | Jitter | Giữ. Thêm một khoảng ngẫu nhiên vào thời gian chờ để các máy khách không gọi lại cùng lúc |
| JSON mode | JSON mode | Giữ. API bảo đảm đầu ra là JSON hợp lệ nhưng không kiểm theo schema |
| Kiểm duyệt nội dung | Content moderation | Dịch |
| Không giữ trạng thái | Stateless | Dịch, lần đầu kèm "stateless". Máy chủ không nhớ các lần gọi trước; muốn hội thoại thì gửi lại cả lịch sử |
| Làm lộ prompt | Prompt leaking | Dịch, lần đầu kèm "prompt leaking". Bắt mô hình đọc lại system prompt |
| Lịch sử hội thoại | Conversation history | Dịch. Danh sách các lượt đã có; trong code giữ tên `history` hay `messages` |
| Lùi theo cấp số nhân | Exponential backoff | Dịch. Gặp lỗi thì chờ rồi thử lại, mỗi lần chờ lâu gấp đôi lần trước, có trần. Thường đi kèm jitter |
| Mảnh | Chunk | Dịch, lần đầu kèm "chunk". Một phần nhỏ của đầu ra gửi về khi streaming. Khác "chunk tài liệu" của RAG |
| Metadata | Metadata | Giữ, lần đầu có thể giải thích "thông tin kèm theo" (hay "siêu dữ liệu"). Thông tin mô tả dữ liệu: kèm theo tệp (ngày chụp, nguồn gốc ảnh) hay kèm theo chunk (tên tệp, số trang) |
| Nguồn gốc nội dung | Content provenance | Dịch. Thông tin ai tạo, tạo bằng công cụ gì, đã sửa ra sao |
| Phần nội dung | Content part | Dịch. Một phần tử trong `content` của tin nhắn (chữ, ảnh...) |
| Polling | Polling | Giữ, lần đầu giải thích "hỏi lại trạng thái theo chu kỳ" |
| Prompt injection | Prompt injection | Giữ, lần đầu ghi "chèn chỉ dẫn". Đầu vào làm mô hình đổi hành vi ngoài ý người làm ứng dụng |
| Prompt injection gián tiếp | Indirect prompt injection | Giữ "prompt injection", dịch "gián tiếp". Chỉ dẫn nằm trong dữ liệu ứng dụng tự lấy về (trang web, email, tệp) |
| Quyền tối thiểu | Least privilege | Dịch. Chỉ cấp cho ứng dụng đúng những quyền nó cần |
| Rate limit | Rate limit | Giữ. Giới hạn số yêu cầu hay số token trong một khoảng thời gian |
| SDK | Software development kit | Giữ. Bộ thư viện do nhà cung cấp viết sẵn để gọi API, ví dụ thư viện `openai` cho Python |
| Secret | Secret | Giữ. Giá trị bí mật như API key, mật khẩu. Không ghi vào code hay image; đưa vào qua biến môi trường hoặc phần quản lý secret của nền tảng |
| Streaming | Streaming | Giữ. Nhận đầu ra từng mảnh ngay khi được sinh ra |
| System prompt | System prompt | Giữ. Chỉ dẫn chung đặt ở lượt có vai trò `system` |
| Tác vụ bất đồng bộ | Asynchronous job | Dịch, có thể giải thích "gửi rồi chờ lấy kết quả sau" |
| Upsert | Upsert | Giữ. Cập nhật nếu đã có, thêm mới nếu chưa (update + insert) |
| Vai trò | Role | Dịch. Nhãn của mỗi lượt trong `messages`: `system`, `user`, `assistant` |
| Watermark | Watermark | Giữ, lần đầu có thể ghi "dấu in chìm" |
| Webhook | Webhook | Giữ. Máy chủ chủ động gọi tới URL của bạn khi có kết quả |

## Ứng dụng LLM: RAG và agent

Truy xuất tài liệu, đồ thị tri thức, agent và công cụ.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Agent (LLM) | Agent | Giữ. Ứng dụng trong đó LLM tự quyết bước kế tiếp và gọi công cụ nào, lặp tới khi xong việc. Khác "tác nhân" trong học tăng cường (nhóm Machine Learning) |
| BFS | Breadth-first search | Giữ, lần đầu ghi "tìm kiếm theo chiều rộng". Duyệt đồ thị theo từng lớp: mọi láng giềng trước, rồi láng giềng của láng giềng |
| Bộ ba | Triple (subject–predicate–object) | Dịch. Một sự kiện trong đồ thị tri thức: (chủ thể, quan hệ, đối tượng) |
| Bộ nhớ tham số / phi tham số | Parametric / non-parametric memory | Dịch. Kiến thức nằm trong trọng số của mô hình / nằm trong kho tài liệu truy xuất được |
| Chia chunk | Chunking | Dịch "chia", giữ "chunk". Cắt tài liệu thành các chunk tài liệu trước khi lập chỉ mục |
| Chunk tài liệu | (Document) chunk | Giữ "chunk", có thể gọi gọn là "đoạn". Một phần tài liệu được cắt ra để lập chỉ mục và truy xuất trong RAG. Khác "mảnh" (chunk) của streaming |
| Công cụ | Tool | Dịch. Hàm mà ứng dụng cho mô hình gọi (tìm kiếm, đọc tệp, chạy code), mô tả bằng tên, chú thích và JSON Schema của đối số |
| Cộng đồng (đồ thị) | Community | Dịch. Nhóm nút nối với nhau dày hơn hẳn với phần còn lại; GraphRAG tóm tắt từng cộng đồng |
| Cơ sở dữ liệu đồ thị | Graph database | Dịch. Lưu và truy vấn dữ liệu dạng nút và cạnh, ví dụ Neo4j |
| Dense retrieval | Dense retrieval | Giữ. Truy xuất bằng so khớp embedding thay vì khớp từ khóa |
| Đồ thị tri thức | Knowledge graph | Dịch. "Đồ thị" ở đây là graph (nút và cạnh), không phải biểu đồ |
| Gọi công cụ | Tool calling, function calling | Dịch, lần đầu kèm tiếng Anh. Mô hình trả về tên công cụ và đối số (dạng JSON) thay vì câu trả lời; chương trình chạy công cụ rồi gửi kết quả lại |
| Gối đầu | Overlap | Dịch. Phần chữ chung giữa hai chunk liền nhau, để ý nằm ở ranh giới không bị cắt đôi |
| Gộp thực thể | Entity resolution | Dịch. Nhận ra nhiều tên cùng chỉ một thực thể và gộp thành một nút |
| Graph RAG | Graph RAG | Giữ. RAG truy xuất trên đồ thị tri thức. Viết liền "GraphRAG" là tên một cách làm cụ thể của Microsoft (tóm tắt cộng đồng) |
| Hit rate | Hit rate | Giữ, lần đầu có thể ghi "tỉ lệ trúng". Tỉ lệ câu hỏi có chunk nguồn nằm trong top-$k$ kết quả truy xuất |
| JSON Schema | JSON Schema | Giữ. Chuẩn mô tả cấu trúc của một JSON (trường nào, kiểu gì, bắt buộc hay không); dùng cho đối số của công cụ và đầu ra có cấu trúc |
| Kho vectơ | Vector store | Dịch. Nơi lưu embedding của các chunk và tìm nhanh các vectơ gần nhất |
| Lập chỉ mục | Indexing | Dịch. Bước chuẩn bị của RAG: chia chunk, tính embedding, lưu vào kho vectơ |
| Lược đồ | Schema | Dịch. Quy định các loại thực thể và quan hệ được phép trong đồ thị tri thức. "JSON Schema" thì giữ nguyên |
| MCP | Model Context Protocol | Giữ. Giao thức mở để ứng dụng LLM kết nối với các máy chủ cung cấp công cụ và dữ liệu theo một chuẩn chung |
| Multi-agent | Multi-agent | Giữ, lần đầu có thể ghi "đa agent". Nhiều agent, mỗi agent một vai, phối hợp với nhau |
| Nút, cạnh | Node, edge | Dịch. Trong đồ thị tri thức, thực thể là nút, quan hệ là cạnh |
| Quan hệ | Relation | Dịch. Mối liên hệ giữa hai thực thể, ví dụ "làm việc tại" |
| Quan sát | Observation | Dịch. Kết quả của công cụ gửi lại cho mô hình trong vòng lặp agent |
| RAG | Retrieval-Augmented Generation | Giữ, lần đầu ghi "sinh văn bản có truy xuất bổ trợ". Tìm tài liệu liên quan rồi đưa vào prompt để mô hình trả lời dựa trên đó |
| ReAct | ReAct (Reasoning and Acting) | Giữ. Mô hình xen kẽ suy nghĩ, hành động (gọi công cụ) và quan sát |
| Reflection | Reflection | Giữ, lần đầu có thể ghi "tự kiểm lại". Gọi mô hình thêm một lần để kiểm câu trả lời vừa viết rồi sửa |
| Sandbox | Sandbox | Giữ, lần đầu ghi "môi trường cô lập". Nơi chạy code do agent sinh ra, tách khỏi máy chứa dữ liệu thật |
| Semantic router | Semantic router | Giữ, lần đầu có thể ghi "bộ định tuyến ngữ nghĩa". Chọn đường xử lý cho câu hỏi theo nghĩa, bằng độ tương tự embedding so với một ngưỡng. Khác router của MoE |
| Thực thể | Entity | Dịch. Người, nơi chốn, tổ chức, sự vật… được nêu trong văn bản |
| Top-k (truy xuất) | Top-k retrieval | Giữ. Lấy $k$ chunk giống câu hỏi nhất. Khác top-k khi lấy mẫu token |
| Trích nguồn | Citation | Dịch. Ghi rõ câu trả lời dựa trên chunk hay tài liệu nào |
| Truy xuất | Retrieval | Dịch. Tìm trong kho các tài liệu liên quan tới câu hỏi. "Truy xuất thông tin" (information retrieval) là tên lĩnh vực |
| Viết lại câu hỏi | Query rewriting | Dịch. Nhờ mô hình viết lại câu hỏi (thêm ngữ cảnh hội thoại, bỏ chữ thừa) trước khi truy xuất |
| Vòng lặp agent | Agent loop | Dịch "vòng lặp", giữ "agent". Gọi mô hình, chạy công cụ nó chọn, gửi quan sát lại, lặp tới khi mô hình trả lời hoặc chạm giới hạn số bước |
| Workflow | Workflow | Giữ. Chuỗi bước do người viết code định sẵn (ví dụ RAG luôn tìm rồi luôn trả lời). Khác agent, nơi mô hình tự chọn bước |

## Triển khai LLM

Đóng gói bằng Docker, phục vụ mô hình và đo hiệu năng.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Bảng khối | Block table | Dịch. Trong PagedAttention: bảng ghi khối thứ mấy của KV cache một chuỗi nằm ở khối bộ nhớ nào |
| Base image | Base image | Giữ. Image làm nền mà Dockerfile xây tiếp lên (dòng `FROM`) |
| Bộ nhớ đệm (dựng) | Build cache | Dịch, lần đầu kèm "build cache". Docker lưu kết quả từng lớp; dựng lại thì dùng lại các lớp không đổi |
| Container | Container | Giữ. Tiến trình chạy từ một image, cô lập với máy chủ |
| Continuous batching | Continuous batching | Giữ. Ghép yêu cầu vào lô theo từng bước sinh: chuỗi nào xong thì rời lô, yêu cầu mới vào ngay, không chờ cả lô xong |
| Cổng (mạng) | Port | Dịch, lần đầu kèm "port". Số hiệu mà server lắng nghe, ví dụ 8000. Khác "cổng" (gate) trong mạng nơ-ron |
| Decode | Decode | Giữ, lần đầu có thể ghi "giai đoạn sinh". Sinh từng token một sau prefill, mỗi bước dùng lại KV cache |
| Dockerfile | Dockerfile | Giữ. Tệp liệt kê các bước dựng image |
| Độ trễ | Latency | Dịch. Thời gian từ lúc gửi yêu cầu tới lúc nhận kết quả; thường báo bằng phân vị p50, p95 |
| Health check | Health check | Giữ. Endpoint nhẹ (ví dụ `/health`) để kiểm tra server còn sống và sẵn sàng |
| Hợp đồng container | Container contract | Dịch. Những điều nền tảng cloud đòi ở container, ví dụ lắng nghe ở cổng ghi trong biến `PORT` |
| Image | Image | Giữ. Bản đóng gói chỉ đọc gồm code, thư viện và hệ điều hành tối thiểu; chạy image thì được container. Không dịch "ảnh" |
| Khởi động lạnh | Cold start | Dịch, lần đầu kèm "cold start". Khi phục vụ: vài yêu cầu đầu chậm hơn vì bộ đệm còn trống, kết nối mới mở; bỏ qua khi đo. Ở DeepSeek-R1: dữ liệu khởi động lạnh là vài nghìn mẫu SFT trước khi chạy học tăng cường |
| Kiểm tra đầu vào | Input validation | Dịch. Từ chối sớm yêu cầu sai kiểu, thiếu trường hay quá dài trước khi gọi mô hình |
| Lớp (của image) | Layer | Dịch. Mỗi lệnh trong Dockerfile tạo một lớp; image là các lớp xếp chồng. Khác "lớp" của mạng nơ-ron |
| Ngữ cảnh dựng | Build context | Dịch, lần đầu kèm "build context". Thư mục Docker được phép đọc khi dựng (dấu `.` trong `docker build .`), loại bớt bằng `.dockerignore` |
| PagedAttention | PagedAttention | Giữ. Chia KV cache thành các khối cố định không cần nằm liền nhau, như bộ nhớ phân trang; ý chính của vLLM |
| Phục vụ mô hình | Model serving | Dịch. Chạy mô hình sau một server để nhận yêu cầu và trả kết quả |
| Prefill | Prefill | Giữ, lần đầu có thể ghi "giai đoạn nạp lời nhắc". Xử lý mọi token của prompt cùng lúc, tạo KV cache và token đầu tiên |
| Registry | Registry | Giữ. Kho lưu và phân phối image, ví dụ Docker Hub |
| Speculative decoding | Speculative decoding | Giữ, lần đầu có thể ghi "giải mã suy đoán". Mô hình nhỏ đoán trước vài token, mô hình lớn kiểm tra song song trong một lượt; phân phối đầu ra không đổi |
| Thông lượng | Throughput | Dịch. Lượng việc xong trong một đơn vị thời gian: số yêu cầu mỗi giây ($R = m/\Delta t$) khi đo server, hay tổng số token mỗi giây khi phục vụ LLM. Thường đánh đổi với độ trễ |
| TPOT | Time per output token | Giữ. Thời gian trung bình để sinh mỗi token sau token đầu |
| TTFT | Time to first token | Giữ. Thời gian từ lúc gửi yêu cầu tới khi nhận token đầu tiên; phần lớn là prefill |

## NLP

Thuật ngữ của Phần 5a (13 bài NLP, quyết định 70–75). Bài NLP dùng $V$ cho tập từ vựng và $|V|$ cho cỡ (theo Jurafsky & Martin); phần LLM giữ $\mathcal{V}$ và $V$. "Truy xuất dày" và "dense retrieval" là cùng một khái niệm (xem nhóm RAG).

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| ALiBi | Attention with Linear Biases | Giữ. Cộng −m_h(i − j) vào điểm attention, độ dốc cố định theo đầu |
| AP, MAP | (Mean) average precision | Giữ |
| Attention cửa sổ trượt | Sliding window attention | Dịch. Mỗi token chỉ nhìn w token gần nhất |
| Attention toàn cục | Global attention | Dịch. Vài token nhìn mọi token (Longformer, BigBird) |
| Attention tuyến tính | Linear attention | Dịch. Thay softmax bằng φ(q)ᵀφ(k), chi phí tuyến tính theo L |
| Bi-encoder | Bi-encoder | Giữ. Mã hóa truy vấn và văn bản riêng rẽ |
| BIO (IOB2), IOB1, BIOES | BIO / IOB2, IOB1, BIOES tagging | Giữ tên lược đồ |
| Biểu thức chính quy | Regular expression (regex) | Dịch, viết tắt regex |
| BM25 | BM25 (Okapi BM25) | Giữ. idf nhân phần tần suất có bão hòa ($k_1$) và chuẩn hóa độ dài ($b$) |
| BPE | Byte pair encoding | Giữ. Gộp dần cặp ký hiệu kề nhau hay gặp nhất |
| Byte-level BPE | Byte-level BPE | Giữ. Bắt đầu từ 256 byte, không cần `[UNK]` |
| CBOW | Continuous bag-of-words | Giữ viết tắt. Đoán từ giữa từ trung bình vectơ ngữ cảnh |
| Che động | Dynamic masking | Dịch. Chọn lại vị trí che mỗi lần (RoBERTa) |
| Chiến lược giải mã | Decoding strategy | Dịch. Quy tắc chọn token từ phân phối của mô hình |
| Chuẩn hóa Unicode; dạng chuẩn | Unicode normalization; normalization form (NFC, NFD, NFKC, NFKD) | Dịch, giữ tên NFC… |
| Chuẩn hóa văn bản | Text normalization | Dịch. Đưa các cách viết của cùng một thứ về một dạng. Khác "chuẩn hóa đặc trưng" |
| Chuỗi thô | Raw string | Dịch. `r"..."` |
| Chỉ mục ngược | Inverted index | Dịch. Từ → danh sách văn bản chứa từ |
| Code point | Code point | Giữ. Số Unicode của một ký tự, viết U+XXXX |
| Cross-encoder | Cross-encoder | Giữ. Đọc truy vấn và văn bản cùng lúc; dùng để xếp lại |
| Cửa sổ (đồng xuất hiện) | Window | Dịch. Khoảng ±s từ quanh từ đích khi đếm đồng xuất hiện. Khác "cửa sổ ngữ cảnh" (context window) của LLM |
| Dãy con chung dài nhất | Longest common subsequence (LCS) | Dịch |
| Dấu tổ hợp | Combining mark | Dịch |
| Dự đoán câu kế tiếp | Next sentence prediction (NSP) | Dịch |
| Dự đoán thứ tự câu | Sentence-order prediction (SOP) | Dịch. ALBERT dùng thay NSP |
| Embedding tĩnh, embedding theo ngữ cảnh | Static, contextual embedding | Giữ "embedding" |
| Embedding đoạn | Segment embedding | Giữ "embedding", dịch "đoạn". Báo token thuộc câu A hay B |
| Encoder-only, decoder-only | Encoder-only, decoder-only | Giữ, lần đầu ghi "chỉ có encoder"/"chỉ có decoder" |
| F1 macro | Macro-averaged F1 | Giữ. Trung bình không trọng số F1 của từng lớp |
| FlashAttention | FlashAttention | Giữ. Attention chính xác, tính theo khối, không ghi ma trận L×L ra bộ nhớ chính |
| Gazetteer | Gazetteer | Giữ, lần đầu ghi "từ điển tên" |
| Giả thuyết phân bố | Distributional hypothesis | Dịch |
| Gán nhãn chuỗi | Sequence labeling | Dịch. Mỗi phần tử của chuỗi nhận một nhãn |
| Gán nhãn token | Token classification | Dịch. Một bộ phân loại trên vectơ của mỗi token |
| Huấn luyện phân tán | Distributed training | Dịch |
| Kho văn bản | Corpus | Dịch, lần đầu kèm "corpus" |
| Khớp dài nhất | Maximum matching | Dịch |
| Ký tự dựng sẵn | Precomposed character | Dịch |
| Ký tự tổ hợp | Combining character | Dịch. Dấu đứng riêng sau chữ cái ở dạng NFD |
| Lemmatization; dạng từ điển | Lemmatization; lemma | Giữ "lemmatization", lemma dịch "dạng từ điển" |
| Liên kết thực thể | Entity linking | Dịch |
| Lookaround | Lookahead, lookbehind | Giữ "lookaround", dịch "nhìn trước", "nhìn sau" |
| Loss scaling | Loss scaling | Giữ |
| LSA | Latent semantic analysis | Giữ, lần đầu ghi "phân tích ngữ nghĩa tiềm ẩn" |
| Làm hỏng đoạn | Span corruption | Dịch. Mục tiêu của T5 |
| Luật lũy thừa | Power law | Dịch. Quan hệ $y \propto x^{a}$; scaling laws có dạng này |
| Lô hiệu dụng | Effective batch size | Dịch. Micro-batch × số bước tích lũy × số GPU |
| Lũy đẳng | Idempotent | Dịch. $f(f(a)) = f(a)$ |
| Lượng từ | Quantifier | Dịch. `*`, `+`, `?`, `{m,n}` |
| Lệch lớp | Class imbalance | Dịch |
| Lớp ký tự | Character class | Dịch. `[0-9]`, `\w` |
| Ma trận nhầm lẫn | Confusion matrix | Dịch. Hàng là nhãn thật, cột là nhãn dự đoán |
| Ma trận từ–ngữ cảnh, ma trận đồng xuất hiện | Word-context matrix, co-occurrence matrix | Dịch. Ô đếm số lần c nằm trong cửa sổ ±s quanh w |
| Ma trận từ–văn bản | Term-document matrix | Dịch |
| MRR | Mean reciprocal rank | Giữ |
| Mô hình ngôn ngữ có che | Masked language model (MLM) | Dịch, viết tắt MLM. Che khoảng 15% token rồi đoán lại từ ngữ cảnh hai phía |
| Mô hình ngôn ngữ nhân quả | Causal language model | Dịch. Học $p(x_t \mid x_{<t})$, mỗi dự đoán chỉ dựa vào quá khứ, như GPT |
| Mẫu (regex) | Pattern | Dịch. Chuỗi mô tả tập các chuỗi cần khớp. Khác "Mẫu (Sample)" của phần dữ liệu |
| Mỉa mai | Sarcasm | Dịch |
| Mức thực thể, mức token | Entity-level, token-level | Dịch. Cách tính precision/recall/F1 |
| N-gram ký tự | Character n-gram | Dịch "ký tự". Đơn vị của FastText |
| Naive Bayes | Naive Bayes | Giữ |
| nDCG | Normalized discounted cumulative gain | Giữ |
| Negative sampling, mẫu âm | Negative sampling, negative sample | Giữ "negative sampling", dịch "mẫu âm". SGNS: skip-gram with negative sampling |
| Neo | Anchor | Dịch. `^`, `$` |
| Ngôn ngữ chính quy | Regular language | Dịch |
| Ngôn ngữ đơn lập | Isolating language | Dịch |
| Ngữ nghĩa vectơ | Vector semantics | Dịch. Biểu diễn nghĩa của từ bằng một điểm trong không gian vectơ |
| Nhóm bắt / nhóm không bắt | Capturing / non-capturing group | Dịch |
| Nhận dạng thực thể có tên | Named entity recognition (NER) | Dịch, viết tắt NER |
| Nhập nhằng chồng lấp | Overlapping ambiguity | Dịch |
| Phân tích cảm xúc | Sentiment analysis | Dịch. Phân loại văn bản theo thái độ của người viết |
| Phân tích cảm xúc theo khía cạnh | Aspect-based sentiment analysis (ABSA) | Dịch, viết tắt ABSA |
| Phép gộp | Merge (rule) | Dịch |
| Phép tương tự | (Word) analogy | Dịch |
| Phạt lặp | Repetition penalty | Dịch |
| PMI, PPMI | Pointwise mutual information, positive PMI | Giữ viết tắt, lần đầu ghi "thông tin tương hỗ điểm" |
| Posting list | Posting list | Giữ. Danh sách (văn bản, tf) của một từ |
| Precision, recall, F1 | Precision, recall, F1 | Giữ |
| Precision@k, recall@k | Precision@k, recall@k | Giữ |
| Quay lui thảm họa | Catastrophic backtracking | Dịch |
| Ranh giới từ | Word boundary | Dịch. `\b` |
| Reciprocal Rank Fusion | Reciprocal Rank Fusion (RRF) | Giữ |
| ReDoS | Regular expression denial of service | Giữ |
| Reduce-scatter, all-gather | Reduce-scatter, all-gather | Giữ. Hai pha của ring all-reduce |
| Ring all-reduce | Ring all-reduce | Giữ. Mỗi worker gửi khoảng $\frac{2(N-1)}{N}$ lần kích thước gradient |
| ROUGE | ROUGE (ROUGE-N, ROUGE-L) | Giữ. Đếm n-gram trùng hoặc LCS giữa bản máy và bản tham chiếu |
| Sao Kleene | Kleene star | Dịch |
| Scaling laws | Scaling laws | Giữ |
| SentencePiece | SentencePiece | Giữ. Học từ câu thô, dấu cách thành `▁` |
| Shard | Shard | Giữ. Phần lô mà một worker xử lý trong song song dữ liệu |
| Sinh câu bị bỏ | Gap sentences generation (GSG) | Dịch. Mục tiêu pre-train của PEGASUS |
| Skip-gram | Skip-gram | Giữ. Đoán từng từ ngữ cảnh từ từ giữa |
| Softmax phân cấp | Hierarchical softmax | Dịch |
| Stemming | Stemming | Giữ. Cắt hậu tố theo luật (Porter) |
| Stopword | Stopword | Giữ |
| Subsampling | Subsampling of frequent words | Giữ |
| Subword | Subword | Giữ, lần đầu có thể ghi "mảnh từ" |
| SVD rút gọn | Truncated SVD | Giữ "SVD", lần đầu ghi "phân tích giá trị suy biến" |
| TF-IDF | Term frequency–inverse document frequency | Giữ. Tần suất từ nhân với nghịch đảo tần suất văn bản |
| Tham chiếu ngược | Backreference | Dịch. `\1` |
| Tham lam / lười | Greedy / lazy (non-greedy) | Dịch |
| Thực thể có tên | Named entity | Dịch |
| Token giữ chỗ | Placeholder token | Dịch. `<url>`, `<num>` |
| Token đánh dấu | Sentinel token | Dịch, giữ "token". Token riêng cho mỗi đoạn bị bỏ trong span corruption |
| Token đặc biệt | Special token | Dịch, giữ "token" |
| Trung thực (với nguồn) | Faithfulness | Dịch |
| Truy vấn | Query | Dịch |
| Truy xuất ad hoc | Ad hoc retrieval | Dịch. Kho văn bản cố định, mỗi lần hỏi là một truy vấn mới |
| Truy xuất lai | Hybrid retrieval | Dịch. Ghép thưa và dày |
| Truy xuất thưa, truy xuất dày | Sparse retrieval, dense retrieval | Dịch |
| Trường ngẫu nhiên có điều kiện | Conditional random field (CRF) | Dịch, viết tắt CRF |
| Tách sơ bộ | Pre-tokenization | Dịch |
| Tách từ tiếng Việt | (Vietnamese) word segmentation | Dịch. Khác "tách từ" (tokenization): gom âm tiết thành từ |
| Tìm láng giềng gần đúng | Approximate nearest neighbor (ANN) | Dịch |
| Tích lũy gradient | Gradient accumulation | Dịch |
| Tóm tắt trích xuất | Extractive summarization | Dịch. Chọn câu nguyên văn của nguồn |
| Tóm tắt tóm lược | Abstractive summarization | Dịch. Viết lại bằng câu mới |
| Từ chưa gặp | Out-of-vocabulary (OOV) word | Dịch |
| Từ điển cảm xúc | Sentiment lexicon | Dịch. Bảng gán điểm cảm xúc cho từng từ |
| Từ đích, từ ngữ cảnh | Target word, context word | Dịch. Ký hiệu $w$, $c$ |
| Unigram LM | Unigram language model | Giữ. Bỏ dần mảnh từ một từ vựng lớn |
| Vectơ dày | Dense vector | Dịch. Ngược với vectơ thưa |
| Vectơ one-hot | One-hot vector | Giữ "one-hot". Dài $|V|$, chỉ một số 1 |
| Văn bản thoái hóa | Neural text degeneration | Dịch. Văn bản nhạt, lặp vòng hoặc rời rạc |
| Vị trí tương đối | Relative position | Dịch. Đưa khoảng cách j − i vào điểm attention |
| WordPiece | WordPiece | Giữ. Gộp theo likelihood, tiền tố `##` |
| Worker | Worker | Giữ. Một tiến trình hoặc GPU tham gia huấn luyện |
| Xếp lại | Re-ranking | Dịch |
| Âm tiết | Syllable | Dịch |
| Ôtômat hữu hạn | Finite automaton | Dịch |
| Điền đoạn | Text infilling | Dịch. Mục tiêu của BART |
| Độ liên quan | Relevance | Dịch. Văn bản có giúp người hỏi không, khác với có chung chữ |

## Toán

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Bậc (của đa thức) | Degree | Dịch. Số mũ lớn nhất, ký hiệu $d$ |
| Bất đẳng thức Gibbs | Gibbs' inequality | Dịch "bất đẳng thức", giữ tên riêng. $D_{\mathrm{KL}}(p \parallel q) \ge 0$, dấu bằng khi và chỉ khi $p = q$ (dùng trong bài DPO) |
| Chuẩn (của vectơ, ma trận) | Norm | Dịch. Ví dụ "chuẩn 2" (2-norm). Với vectơ, chuẩn 2 là độ dài $\lVert\mathbf{v}\rVert$ |
| Chuẩn L1, chuẩn L2 | L1 norm, L2 norm | Dịch. $\lVert\mathbf{w}\rVert_1 = \sum_j \lvert w_j\rvert$; chuẩn L2 cũng là "chuẩn 2" (2-norm) ở dòng trên, tức độ dài vectơ |
| Chuyển vị | Transpose | Dịch |
| Đạo hàm | Derivative | Dịch |
| Đạo hàm bậc hai | Second derivative | Dịch. Đạo hàm của đạo hàm, cho biết đồ thị cong cỡ nào. Nhiều biến thì gom thành ma trận Hessian |
| Đạo hàm riêng | Partial derivative | Dịch |
| Đa thức | Polynomial | Dịch |
| Định thức | Determinant | Dịch |
| Độ giống Jaccard | Jaccard similarity | Dịch. $J(A, B) = \lvert A \cap B\rvert / \lvert A \cup B\rvert$: phần chung chia phần hợp của hai tập |
| Độ lệch (so với trung bình) | Deviation | Dịch. Ví dụ $x^{(i)} - \bar{x}$. Không nhầm với bias |
| Độ lệch KL | Kullback–Leibler divergence | Dịch, giữ "KL". $D_{\mathrm{KL}}(p \parallel q) = \sum_x p(x)\ln\frac{p(x)}{q(x)}$: không âm, bằng 0 khi hai phân phối trùng nhau, không đối xứng. Khác "độ lệch so với trung bình" |
| Độ tương tự cosine | Cosine similarity | Dịch. $\cos(\mathbf{u}, \mathbf{v}) = \mathbf{u}^\top\mathbf{v} / (\lVert\mathbf{u}\rVert\,\lVert\mathbf{v}\rVert)$, từ $-1$ tới $1$ |
| Độc lập tuyến tính | Linearly independent | Dịch |
| Độ cong | Curvature | Dịch. Với hàm một biến là đạo hàm bậc hai. Ký hiệu $L$ trong ngưỡng $\eta < 2/L$ của gradient descent |
| Đường mức | Contour line | Dịch. Tập các điểm có cùng giá trị hàm, ví dụ cùng MSE trên mặt phẳng $(w, b)$ |
| Gradient | Gradient | Giữ. Vectơ các đạo hàm riêng, ký hiệu $\nabla\mathcal{L}$. Chỉ hướng đi lên dốc nhất |
| Hàm lồi | Convex function | Dịch. Đồ thị hình cái bát, mọi đáy cục bộ đều là đáy toàn cục. MSE của hồi quy tuyến tính là hàm lồi |
| Hạng (của ma trận) | Rank | Dịch |
| Hằng số chuẩn hóa | Normalizing constant, partition function | Dịch, có thể ghi "hàm phân hoạch" (partition function). Số chia để tổng xác suất bằng 1, ví dụ $Z(\mathbf{x})$ trong DPO |
| Hình chiếu vuông góc | Orthogonal projection | Dịch |
| Kỳ vọng | Expectation | Dịch |
| Likelihood | Likelihood | Giữ. Xác suất mô hình gán cho dữ liệu quan sát được, xem như hàm của tham số $\boldsymbol{\theta}$ |
| Ma trận | Matrix | Dịch |
| Ma trận đơn vị | Identity matrix | Dịch. Ký hiệu $\mathbf{I}$: số 1 trên đường chéo, 0 ở mọi chỗ khác |
| Ma trận Hessian | Hessian matrix | Giữ "Hessian". Ma trận các đạo hàm riêng bậc hai. Với MSE là $\frac{2}{m}\mathbf{X}^\top\mathbf{X}$ |
| Ma trận khả nghịch / suy biến | Invertible / singular matrix | Dịch |
| Ma trận nghịch đảo | Inverse matrix | Dịch |
| Ma trận thiết kế | Design matrix | Dịch. Mỗi hàng một mẫu, mỗi cột một đặc trưng, thêm cột toàn số 1 cho hệ số tự do |
| Nghiệm dạng đóng | Closed-form solution | Dịch. Nghiệm viết được bằng một công thức hữu hạn, ví dụ phương trình chuẩn hay nghiệm của Ridge |
| Nghiệm có độ dài nhỏ nhất | Minimum-norm solution | Dịch. Nghiệm mà `np.linalg.lstsq` trả về khi có vô số nghiệm |
| Phân phối xác suất | Probability distribution | Dịch |
| Phân vị | Percentile, quantile | Dịch. Phân vị mức $q$ là giá trị mà khoảng tỉ lệ $q$ số liệu nhỏ hơn hoặc bằng nó; p50 là trung vị |
| Phụ thuộc tuyến tính | Linearly dependent | Dịch |
| Phương sai | Variance | Dịch |
| Quy tắc hàm hợp | Chain rule | Dịch. Đạo hàm của hàm hợp. Khác "quy tắc nhân xác suất" |
| Quy tắc nhân xác suất | Chain rule of probability | Dịch. $p(x_1, \dots, x_m) = \prod_{t=1}^{m} p(x_t \mid x_{<t})$. Khác "quy tắc hàm hợp" của giải tích |
| Số điều kiện | Condition number | Dịch. Ký hiệu $\kappa$. Với Hessian của hàm bậc hai: $\kappa = L/\mu$, tỉ số độ cong lớn nhất và nhỏ nhất; $\kappa$ lớn thì bát dẹt, gradient descent chậm |
| Tỉ số odds | Odds ratio | Dịch "tỉ số", giữ "odds". Odds của xác suất $p$ là $p/(1-p)$; tỉ số odds chia odds của hai trường hợp (dùng trong ORPO) |
| Tích vô hướng | Dot product | Dịch |
| Tiếp tuyến | Tangent line | Dịch. Đường thẳng chạm đồ thị tại một điểm, có độ dốc bằng đạo hàm tại đó |
| Trị riêng | Eigenvalue | Dịch |
| Vectơ | Vector | Dịch |
| Vectơ riêng | Eigenvector | Dịch. Hướng mà ma trận chỉ co giãn, không xoay: $\mathbf{H}\mathbf{v} = \lambda\mathbf{v}$ |

## Thị giác máy tính

Khái niệm của phần CV (5b): tích chập, phân vùng ảnh, ảnh và văn bản, sinh ảnh, học tự giám sát. "Receptive field" thống nhất là "trường tiếp nhận".

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| AnyRes | AnyRes (any resolution) | Giữ. Cắt ảnh lớn thành lưới $a \times b$ mảnh cộng một ảnh thu nhỏ; $N = (ab+1)T$ |
| ASPP | Atrous Spatial Pyramid Pooling | Giữ. Nhiều nhánh tích chập giãn với rate khác nhau chạy song song (DeepLab) |
| Autoencoder | Autoencoder | Giữ. Bộ mã hóa nén, bộ giải mã dựng lại |
| Backbone | Backbone | Giữ, lần đầu có thể ghi "mạng xương sống" |
| Bài toán phụ | Pretext task | Dịch, lần đầu kèm "pretext task". Bài toán tự đặt ra, nhãn sinh từ chính dữ liệu, chỉ để học biểu diễn |
| Bản đồ đặc trưng | Feature map | Dịch. Đầu ra của một kernel; số bản đồ là số kênh ra |
| Bất biến | Invariant, invariance | Dịch. $f(T(\mathbf{X})) = f(\mathbf{X})$: biến đổi đầu vào không đổi dự đoán (phân loại) |
| Biến ẩn | Latent variable | Dịch. $\mathbf{z}$ mô tả ảnh bằng vài con số |
| Cặp dương, mẫu âm | Positive pair, negative example | Dịch. Hai góc nhìn của cùng một ảnh; góc nhìn của ảnh khác |
| Cắt co giãn ngẫu nhiên | Random resized crop | Dịch, lần đầu kèm tiếng Anh |
| Câu nhắc định dạng câu trả lời | Response formatting prompt | Dịch. Câu thêm sau câu hỏi kiểu VQA để mô hình biết khi nào trả lời ngắn |
| Chia sẻ trọng số | Weight sharing | Dịch |
| Chuẩn hóa theo lô | Batch normalization | Dịch, lần đầu kèm tiếng Anh |
| Classifier-free guidance | Classifier-free guidance | Giữ. Trộn dự đoán có và không có điều kiện: $\boldsymbol\epsilon_\varnothing + s(\boldsymbol\epsilon_{\mathbf{c}} - \boldsymbol\epsilon_\varnothing)$ |
| Co giãn kết hợp | Compound scaling | Dịch. EfficientNet: $d = \alpha^\phi$, $w = \beta^\phi$, $r = \gamma^\phi$ |
| Cutout, mixup, CutMix | Cutout, mixup, CutMix | Giữ (tên kỹ thuật) |
| Cửa sổ dịch chuyển | Shifted window | Dịch. Swin tính attention trong cửa sổ $M \times M$ và dời lưới cửa sổ $\lfloor M/2 \rfloor$ ở khối kế tiếp |
| Dịch ảnh sang ảnh | Image-to-image translation | Dịch |
| Đẳng biến hoán vị | Permutation equivariance | Dịch. Đổi chỗ các token vào thì đầu ra chỉ đổi chỗ theo; tính chất của self-attention không có embedding vị trí |
| Đẳng biến tịnh tiến | Translation equivariance | Dịch. Dịch đầu vào thì đầu ra dịch theo; có sẵn ở tích chập |
| Điểm gợi ý | Point prompt | Dịch |
| Đồng biến | Equivariant, equivariance | Dịch. $f(T(\mathbf{X})) = T(f(\mathbf{X}))$: đầu ra đổi theo đúng phép đó (segmentation, detection) |
| Động cơ dữ liệu | Data engine | Dịch |
| ELBO | Evidence lower bound | Giữ, lần đầu ghi "cận dưới". $\mathbb{E}_q[\log p_\theta(\mathbf{x}\mid\mathbf{z})] - D_{\mathrm{KL}}(q_\phi \parallel p(\mathbf{z}))$ |
| Encoder động lượng | Momentum encoder | Giữ "encoder", dịch "động lượng". Bản sao của encoder, trọng số là EMA của encoder chính |
| Fusion sâu | Deep fusion | Giữ "fusion". Trộn đặc trưng ảnh và chữ qua cross-attention trong các lớp mã hóa (GLIP) |
| GAN | Generative adversarial network | Giữ viết tắt |
| GAN có điều kiện | Conditional GAN (cGAN) | Dịch "có điều kiện" |
| Ghép đôi | Bipartite matching | Dịch. Mỗi vật thật ghép với đúng một dự đoán |
| Góc nhìn | View | Dịch, lần đầu kèm "view". Một bản augmentation của ảnh trong học đối chiếu |
| Gộp nhiều prompt | Prompt ensembling | Dịch, kèm tiếng Anh. Lấy trung bình embedding của nhiều mẫu câu cho cùng một nhãn |
| Gộp patch | Patch merging | Dịch. Ghép mỗi nhóm $2 \times 2$ patch thành một, giảm số token và tăng số kênh (Swin) |
| Hallucination đối tượng | Object hallucination | Giữ "hallucination". Nói tới vật không có trong ảnh |
| Hệ số guidance | Guidance scale | Dịch. Số $s$ trong classifier-free guidance |
| Hiện tượng ô bàn cờ | Checkerboard artifacts | Dịch. Hoa văn do chồng lấn không đều khi kernel không chia hết cho stride |
| Học chuyển giao | Transfer learning | Dịch, lần đầu kèm tiếng Anh |
| Hộp bao | Bounding box | Dịch, lần đầu kèm tiếng Anh. Hình chữ nhật $[x_1, y_1, x_2, y_2]$ quanh vật; không dùng "khung bao" |
| InfoNCE | InfoNCE | Giữ. Cross-entropy chọn một mẫu đúng giữa nhiều mẫu sai trong lô; CLIP dùng bản đối xứng theo hàng và cột |
| Instance segmentation | Instance segmentation | Giữ, lần đầu ghi "phân vùng từng đối tượng". Mỗi vật đếm được một mask, kèm lớp và điểm |
| IoU, mIoU | Intersection over Union, mean IoU | Giữ. $\text{IoU}_k = \text{TP}_k/(\text{TP}_k+\text{FP}_k+\text{FN}_k)$; mIoU là trung bình đều các lớp |
| ITC, ITM | Image-text contrastive, image-text matching | Giữ viết tắt. Đối chiếu ảnh–chữ; phân loại nhị phân "khớp hay không" |
| Kernel | Kernel (filter) | Giữ, lần đầu có thể ghi "bộ lọc". Ký hiệu $\mathbf{K}$, cỡ $k \times k$ |
| Kênh | Channel | Dịch. $C$, $C_{\text{in}}$, $C_{\text{out}}$ |
| Khoảng cách attention | Attention distance | Dịch. Khoảng cách trung bình trên ảnh mà một đầu attention gom thông tin |
| Không gian embedding chung | Joint embedding space | Dịch. Không gian mà ảnh và chữ cùng nghĩa nằm gần nhau, như của CLIP |
| Kim tự tháp đặc trưng | Feature pyramid | Dịch. Các bản đồ đặc trưng nhiều độ phân giải, đều mang nghĩa |
| Latent diffusion | Latent diffusion | Giữ. Chạy diffusion trên latent của một autoencoder thay vì trên điểm ảnh, như Stable Diffusion |
| Lịch nhiễu | Noise schedule | Dịch. Dãy $\beta_1, \dots, \beta_T$; DDPM dùng lịch tuyến tính $10^{-4} \to 0.02$ với $T = 1000$. Ở phần CV, $T$ là số bước, khác nhiệt độ $T$ của phần LLM |
| Linear probe | Linear probe, linear evaluation | Giữ. Đóng băng bộ mã hóa, chỉ học một bộ phân loại tuyến tính trên đặc trưng |
| Loss không bão hòa | Non-saturating loss | Dịch. $G$ làm lớn $\log D(G(\mathbf{z}))$ |
| Lỗi top-5 | Top-5 error | Dịch "lỗi", giữ "top-5" |
| Lớp kết nối đầy đủ | Fully connected layer | Dịch |
| Mạng toàn tích chập | Fully convolutional network (FCN) | Dịch, viết tắt FCN. Chỉ có tích chập, nhận ảnh cỡ bất kỳ |
| Masked attention | Masked attention | Giữ. Cross-attention chỉ trong mask của lớp trước, ngoài vùng là $-\infty$ |
| Mất mát nhất quán chu trình | Cycle consistency loss | Dịch. $\lVert F(G(\mathbf{x})) - \mathbf{x}\rVert_1 + \lVert G(F(\mathbf{y})) - \mathbf{y}\rVert_1$ |
| Mẫu âm khó | Hard negative | Dịch, lần đầu kèm tiếng Anh. Mẫu sai nhưng điểm tương đồng cao, bị đẩy mạnh nhất |
| Mẹo tham số hóa lại | Reparameterization trick | Dịch. $\mathbf{z} = \boldsymbol\mu + \boldsymbol\sigma \odot \boldsymbol\epsilon$ để gradient đi qua bước lấy mẫu |
| Mode collapse | Mode collapse | Giữ, lần đầu ghi "sụp mode" |
| Monte Carlo | Monte Carlo | Giữ. Ước lượng kỳ vọng bằng trung bình trên nhiều mẫu |
| Mô hình hóa ảnh bị che | Masked image modeling | Dịch, lần đầu kèm tiếng Anh. Che một phần ảnh rồi đoán lại, như MAE |
| Mô hình khuếch tán | Diffusion model | Dịch, lần đầu kèm "diffusion model"; hay gọi tắt "diffusion". Thêm nhiễu Gauss qua $T$ bước rồi học đi ngược |
| Mô hình sinh | Generative model | Dịch. Học phân phối của dữ liệu để lấy mẫu ra mẫu mới |
| Nhãn giả | Pseudo label | Dịch. Nhãn do mô hình "thầy" tự gán cho dữ liệu chưa có nhãn |
| Nhánh co, nhánh giãn | Contracting path, expansive path | Dịch. Hai nhánh của UNet (encoder, decoder) |
| NMS | Non-maximum suppression | Giữ, lần đầu ghi "triệt tiêu điểm không cực đại" |
| Nối ngang | Lateral connection | Dịch. Trong FPN: tích chập $1\times1$ rồi cộng vào nhánh từ trên xuống |
| Nội suy song tuyến tính, láng giềng gần nhất | Bilinear, nearest-neighbor interpolation | Dịch |
| Nối tắt (UNet) | Skip connection | Dịch. Đưa bản đồ của nhánh co sang nhánh giãn cùng tầng; UNet nối kênh, FCN và FPN cộng. Khác "kết nối tắt" (residual) |
| Output stride | Output stride | Giữ. Tỉ lệ cạnh ảnh vào trên cạnh bản đồ đầu ra |
| Panoptic segmentation | Panoptic segmentation | Giữ, lần đầu ghi "phân vùng toàn cảnh". Mỗi pixel một cặp (lớp, mã đối tượng) |
| PatchGAN | PatchGAN | Giữ. Bộ phân biệt chấm từng mảnh $N \times N$ |
| Phát hiện vật thể | Object detection | Dịch. Tìm vị trí (khung bao) và nhãn của từng vật |
| Phân loại ảnh | Image classification | Dịch |
| Phân loại mask | Mask classification | Dịch. Dự đoán tập mask, mỗi mask một nhãn |
| Phân loại zero-shot | Zero-shot classification | Giữ "zero-shot". Phân loại theo nhãn viết bằng chữ, không cần ảnh có nhãn |
| Phân phối chuẩn nhiều chiều | Multivariate normal | Dịch. $\mathcal{N}(\boldsymbol\mu, \mathrm{diag}(\boldsymbol\sigma^2))$ |
| Phân vùng ngữ nghĩa | Semantic segmentation | Thường giữ "semantic segmentation". Gán một lớp cho từng pixel, không tách từng vật |
| Phân vùng theo gợi ý | Promptable segmentation | Dịch. Bài toán của SAM |
| Phép biến đổi hình học | Geometric transformation | Dịch. Dời chỗ pixel: lật, cắt, xoay, co giãn; phải áp cả lên mask, hộp bao |
| Phép biến đổi quang học | Photometric transformation | Dịch. Đổi giá trị pixel: độ sáng, tương phản, màu, nhiễu, làm mờ; mask, hộp giữ nguyên |
| Pixel accuracy | Pixel accuracy | Giữ. Tỉ lệ pixel đoán đúng; bị lớp lớn chi phối |
| Pooling | Pooling | Giữ, lần đầu có thể ghi "gộp". Max pooling $2 \times 2$, stride 2 thu nhỏ một nửa mỗi chiều |
| POPE | Polling-based Object Probing Evaluation | Giữ tên. Đo bịa bằng câu hỏi có/không về vật trong ảnh |
| PQ | Panoptic quality | Giữ. Ghép đoạn ở IoU > 0.5, $\text{PQ} = \text{SQ} \times \text{RQ}$ |
| Projection head | Projection head | Giữ. MLP nhỏ sau encoder, loss tính trên đầu ra của nó, bỏ đi sau khi học. Khác projector của LLM đa phương thức |
| Q-Former | Querying Transformer | Giữ. Cầu nối của BLIP-2: các truy vấn học được rút đặc trưng từ bộ mã hóa ảnh đóng băng |
| Quá trình thuận | Forward process | Dịch. Chuỗi thêm nhiễu cố định, không có gì để học; dạng đóng $\mathbf{x}_t = \sqrt{\bar\alpha_t}\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\boldsymbol\epsilon$ |
| RandAugment, AutoAugment | RandAugment, AutoAugment | Giữ. RandAugment có hai tham số $N$ (số phép), $M$ (độ mạnh) |
| RoI | Region of interest | Giữ, lần đầu ghi "vùng quan tâm" |
| RoIAlign, RoIPool | RoIAlign, RoIPool | Giữ. RoIAlign không làm tròn tọa độ, dùng nội suy song tuyến tính |
| RPN | Region proposal network | Giữ, lần đầu ghi "mạng đề xuất vùng" |
| SQ, RQ | Segmentation quality, recognition quality | Giữ. SQ là IoU trung bình của các cặp ghép được, RQ là F1 |
| Stop-gradient | Stop-gradient | Giữ. Coi một nhánh là hằng số khi lan truyền ngược |
| Stride, padding | Stride, padding | Giữ, lần đầu ghi "bước nhảy", "đệm". Ký hiệu $s$, $p$ |
| Sụp đổ biểu diễn | Representation collapse | Dịch, lần đầu kèm "collapse". Mọi ảnh cho cùng một vectơ: loss thấp mà biểu diễn vô dụng |
| Suy giảm (mạng sâu) | Degradation problem | Dịch. Mạng sâu hơn có lỗi huấn luyện cao hơn; khác overfitting |
| Tái tạo | Reconstruction | Dịch. Số hạng $\mathbb{E}_q[\log p_\theta(\mathbf{x}\mid\mathbf{z})]$ |
| Tấn công bằng chữ | Typographic attack | Dịch, kèm tiếng Anh. Dán chữ lên ảnh để đổi nhãn mà CLIP đoán |
| Test-time augmentation | Test-time augmentation (TTA) | Giữ, viết tắt TTA. Lấy trung bình dự đoán trên vài bản biến đổi của ảnh test |
| Thiên kiến quy nạp | Inductive bias | Dịch, lần đầu kèm tiếng Anh. Giả định có sẵn trong kiến trúc trước khi thấy dữ liệu, ví dụ tính cục bộ và đẳng biến tịnh tiến của CNN |
| Thing, stuff | Thing, stuff | Giữ. Thing là lớp đếm được, stuff là vùng không đếm được |
| Tích chập | Convolution | Dịch. Trượt kernel trên ảnh, mỗi vị trí cộng tổng tích thành một số. Thư viện học sâu thực ra làm tương quan chéo (không lật kernel) |
| Tích chập chuyển vị | Transposed convolution | Dịch; có bài gọi là "deconvolution". Phóng lên bằng kernel học được |
| Tích chập giãn | Dilated (atrous) convolution | Dịch, lần đầu kèm cả hai tên tiếng Anh. Rate $r$; $k_\text{eff} = k + (k-1)(r-1)$ |
| Tích chập tách theo chiều sâu | Depthwise separable convolution | Dịch, lần đầu kèm tiếng Anh. Gồm depthwise (mỗi kênh một kernel) và pointwise $1 \times 1$ |
| Tiên nghiệm | Prior | Dịch. $p(\mathbf{z}) = \mathcal{N}(\mathbf{0}, \mathbf{I})$ |
| Token chắt lọc | Distillation token | Dịch, lần đầu kèm tiếng Anh. Token thêm vào của DeiT, học theo nhãn do mô hình thầy dự đoán |
| Token xuống dòng | Newline token (image newline) | Dịch. Token học được đặt sau mỗi hàng đặc trưng ảnh để LLM biết chỗ ngắt hàng |
| Truy vấn vật thể | Object query | Dịch. Mỗi truy vấn trả về một vật hoặc "không có vật" |
| Trường tiếp nhận | Receptive field | Dịch. Vùng đầu vào ảnh hưởng tới một ô ra |
| Tự chắt lọc | Self-distillation | Dịch. Chắt lọc tri thức mà thầy là bản EMA của chính trò, như DINO |
| Tương quan chéo | Cross-correlation | Dịch |
| U-Net | U-Net | Giữ. Mạng encoder–decoder đối xứng có nối tắt; dùng cho segmentation và làm mạng khử nhiễu của diffusion |
| VAE | Variational autoencoder | Giữ viết tắt |
| Visual instruction tuning | Visual instruction tuning | Giữ, lần đầu ghi "fine-tune theo chỉ dẫn có ảnh". Instruction tuning trên mẫu (ảnh, chỉ dẫn, câu trả lời) |
