# Tổng quan về Học máy

Bài: `ml/ml-overview`. Phạm vi đã chốt (`docs/mvp.md` mục 7, quyết định 40): nêu ba nhóm có giám sát, không giám sát, tăng cường. Trọng tâm là học có giám sát (hồi quy, phân loại), quy trình dữ liệu → huấn luyện → đánh giá, tách train/test, tổng quát hóa (generalization), trỏ tới `ml/overfitting-underfitting`. Toán chỉ ở mức ký hiệu. 2 ô code (`fit`/`predict` hộp đen, `train_test_split`), 2 hình SVG tĩnh, 4 câu quiz.

Ngày kiểm tra nguồn: **23/10/2026**, bằng WebFetch và curl. Thẻ nguồn: [MIT], [SAM], [MLCB1], [MLCB2], [GG-SUP], [GG-DS], [SK-TTS], [SK-CV], [ISL], [GER].

## Nguồn

**Đã mở và đọc được:**

- **[MIT]** Mitchell, T. M. (1997). [*Machine Learning*](https://www.cs.cmu.edu/~tom/mlbook.html), McGraw-Hill. Trang sách của tác giả mở được, xác nhận tên sách, tác giả, nhà xuất bản, năm. Trang ghi: "Machine Learning is the study of computer algorithms that improve automatically through experience."
  - **Câu định nghĩa T/P/E (chương 1) không nằm trên trang này** và chưa đọc được sách. Chỉ xác nhận gián tiếp qua tìm kiếm: nhiều nguồn phụ cùng gán cho Mitchell 1997, nhưng câu chữ lệch nhau giữa các bản chép. Xem mục "Nguồn gốc các câu định nghĩa".
- **[MLCB1]** Tiep Vu (tên theo metadata trang; trang không ghi tên tác giả), đăng 26/12/2016. [*Machine Learning cơ bản*, Bài 1: Giới thiệu về Machine Learning](https://machinelearningcoban.com/2016/12/26/introduce/). Giới thiệu chung, ví dụ ứng dụng (gợi ý phim, gắn thẻ mặt, AlphaGo), điều kiện cần: đại số tuyến tính, xác suất thống kê, Python. Không có ký hiệu toán.
- **[MLCB2]** Tiep Vu, đăng 27/12/2016. [*Machine Learning cơ bản*, Bài 2: Phân nhóm các thuật toán Machine Learning](https://machinelearningcoban.com/2016/12/27/categories/). **Nguồn tiếng Việt chính cho bài này.** Chia bốn nhóm theo phong cách học: có giám sát (phân loại, hồi quy), không giám sát (phân cụm, luật kết hợp), bán giám sát, tăng cường.
- **[GG-SUP]** Google (không ghi năm trên trang). [*Machine Learning: Supervised Learning*](https://developers.google.com/machine-learning/intro-to-ml/supervised). Mô tả học có giám sát: mẫu có đặc trưng và nhãn, mô hình so dự đoán với nhãn rồi chỉnh để giảm sai lệch, sau đó đánh giá trên dữ liệu có nhãn chưa từng học. Nhấn mạnh kích thước và độ đa dạng dữ liệu ảnh hưởng tới tổng quát hóa. Trang này **không** định nghĩa không giám sát, tăng cường, hồi quy, phân loại.
- **[GG-DS]** Google (không ghi năm). [*Machine Learning Crash Course: Datasets, generalization, and overfitting, Dividing the original dataset*](https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets). Nội dung chính: kiểm thử trên tập riêng; nên chia ba tập train, validation, test; validation và test bị "mòn" khi dùng lặp lại; tập test tốt phải đủ lớn, đại diện, không trùng với train. Trang [Generalization](https://developers.google.com/machine-learning/crash-course/overfitting/generalization) mở được nhưng phần chữ chỉ là video, không có định nghĩa viết. Trang [Overfitting](https://developers.google.com/machine-learning/crash-course/overfitting/overfitting) mở được (HTTP 200) nhưng **chưa đọc nội dung**.
- **[SK-TTS]** scikit-learn developers. [*scikit-learn 1.8 documentation*: `sklearn.model_selection.train_test_split`](https://scikit-learn.org/1.8/modules/generated/sklearn.model_selection.train_test_split.html). Chữ ký: `train_test_split(*arrays, test_size=None, train_size=None, random_state=None, shuffle=True, stratify=None)`. Nếu cả `test_size` và `train_size` là `None` thì test chiếm 25%. `random_state` là số nguyên thì kết quả lặp lại được. `shuffle=True` mặc định; `shuffle=False` dùng cho dữ liệu có thứ tự thời gian và không đi cùng `stratify`. `stratify=y` giữ tỉ lệ lớp ở cả hai phần (hợp với phân loại lệch lớp). Trả về danh sách dài `2 * len(arrays)`, thứ tự `X_train, X_test, y_train, y_test`. Dùng bản 1.8 vì Pyodide của site chạy scikit-learn 1.8.0.
- **[SK-CV]** scikit-learn developers. [*scikit-learn 1.8 documentation*: Cross-validation: evaluating estimator performance](https://scikit-learn.org/1.8/modules/cross_validation.html). Mở đầu nói rằng học một hàm dự đoán rồi kiểm tra trên chính dữ liệu đã học là sai phương pháp: mô hình chỉ cần nhớ lại nhãn đã thấy là được điểm tuyệt đối nhưng không dự đoán được gì trên dữ liệu mới (overfitting), nên phải giữ lại một phần làm tập test.
- **[ISL]** James, G., Witten, D., Hastie, T., Tibshirani, R. [*An Introduction to Statistical Learning*](https://www.statlearning.com/). Trang sách mở được, liệt kê ba bản: bản R lần 1 (2013), bản R lần 2 (2021), bản Python ISLP (2023). PDF bản 1: [ISLR-Seventh-Printing.pdf](https://www.statlearning.com/s/ISLR-Seventh-Printing.pdf) (mở được ngày 23/10/2026 theo `docs/research/linear-regression.md`). **Chưa đọc chương 2 trong phiên này**, nên chưa có ý nào dưới đây gắn thẻ [ISL] từ việc đọc; xem mục ký hiệu. Các PDF bản 2 và ISLP nằm ở `hastie.su.domains`, host này từng không kết nối được (ghi trong `linear-regression.md`); **chưa thử lại**.

**Chưa xác minh hoặc không mở được:**

| Nguồn | Tình trạng | Quyết định |
|---|---|---|
| [SAM] Samuel, A. L. (1959). "Some Studies in Machine Learning Using the Game of Checkers", *IBM Journal of Research and Development*, 3(3), 210–229. [DOI](https://doi.org/10.1147/rd.33.0210) | DOI và trang IEEE Xplore (số 5392560) trả HTTP 202, nhưng WebFetch không đọc được nội dung. Bản PDF scan tại `cs.virginia.edu/~evans/greatworks/samuel1959.pdf` tải được (9,6 MB) nhưng WebFetch báo quá cỡ, `pypdf` không đọc được cấu trúc. **Chưa đọc được toàn văn.** Tên bài, tạp chí, tập, trang: lấy từ kết quả tìm kiếm (không phải từ trang gốc). | Giữ làm nguồn lịch sử, chỉ dẫn link. Không trích. |
| Géron, A. (2022). *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow*, lần 3, O'Reilly, chương 1 "The Machine Learning Landscape" | Tìm kiếm xác nhận sách tồn tại (O'Reilly, tháng 10/2022, ISBN 9781098125967). Trang O'Reilly trả HTTP 403 cho WebFetch. **Không đọc được nội dung chương 1**, chỉ biết tên chương theo trí nhớ, chưa xác minh. | Chỉ liệt kê ở "Đọc thêm" kèm ghi chú chưa kiểm. Không dùng làm nguồn ý chính. |
| `developers.google.com/machine-learning/crash-course/ml-models` và `/overview` | HTTP 404 | Bỏ. Dùng [GG-SUP], [GG-DS]. |

## Nguồn gốc các câu định nghĩa

1. **Câu "field of study that gives computers the ability to learn without being explicitly programmed" thường gán cho Samuel 1959: chưa xác minh được là lời của Samuel.** Tìm kiếm cho thấy nhiều trang giáo dục gắn câu này với bài báo 1959 làm tài liệu tham khảo, nhưng không trang nào cho thấy câu nằm trong bài. Tôi cũng không đọc được toàn văn bài (xem bảng trên). Kết luận an toàn: coi đây là **diễn giải về sau**, thường được trích kèm tên Samuel, và **không đặt trong ngoặc kép như lời của Samuel**. Nếu muốn khẳng định chắc hơn, cần đọc PDF scan (cần công cụ OCR hoặc mở bằng trình đọc PDF). Wikipedia ghi Samuel được xem là người đặt thuật ngữ "machine learning" năm 1959 (nguồn phụ, chưa kiểm).
   - Gợi ý cách viết trong bài: "Arthur Samuel, người viết chương trình chơi cờ đam tự cải thiện qua các ván tự đấu (1959), thường được nhắc đến khi nói về nguồn gốc của thuật ngữ học máy." Không gán câu nào cho ông.
2. **Định nghĩa T/P/E của Mitchell (1997): có thật nhưng chưa đọc sách.** Dạng đã biết rộng rãi: một chương trình học từ kinh nghiệm E đối với lớp tác vụ T và thước đo P nếu hiệu năng trên T, đo bằng P, tăng theo E. Các bản chép khác nhau về chữ nên **không trích nguyên văn**, diễn đạt lại bằng lời và ghi "theo Mitchell (1997)". Câu có thể trích (đã xác minh trên trang sách): "Machine Learning is the study of computer algorithms that improve automatically through experience."

## Ý chính

- **Học máy là gì, bằng lời thường:** cho máy ví dụ thay vì cho luật, để nó tự rút quy luật rồi dùng cho dữ liệu mới. [MIT, MLCB1]
- **Ba nhóm theo phong cách học** (bài chỉ cần ba; bán giám sát nhắc một câu hoặc bỏ). [MLCB2]
  - *Có giám sát:* mỗi mẫu có đầu vào và nhãn; học để dự đoán nhãn cho đầu vào mới.
  - *Không giám sát:* chỉ có đầu vào, tìm cấu trúc (ví dụ gom khách hàng theo hành vi mua).
  - *Tăng cường:* một tác nhân thử hành động, nhận phần thưởng, học cách tối đa hóa phần thưởng (ví dụ AlphaGo, chơi game theo điểm số).
- **Hai bài toán của học có giám sát:** hồi quy khi nhãn là số liên tục (giá thuê từ diện tích); phân loại khi nhãn thuộc một tập hữu hạn (thư rác hay không). Phân biệt dựa vào *kiểu của nhãn*, không dựa vào thuật toán. [MLCB2]
- **Mỗi mẫu = đặc trưng + nhãn.** Mô hình so dự đoán với nhãn thật rồi chỉnh tham số để giảm sai lệch. [GG-SUP]
- **Quy trình:** thu dữ liệu → chia → huấn luyện trên phần train → đánh giá trên phần chưa thấy → (nếu tốt) dùng cho dữ liệu mới. [GG-SUP, SK-CV]
- **Vì sao phải tách train/test:** điểm trên chính dữ liệu đã học không nói gì về dữ liệu mới, vì mô hình có thể chỉ "thuộc lòng". Phần giữ lại chưa từng dùng khi huấn luyện đóng vai dữ liệu mới. [SK-CV, GG-DS]
- **Tổng quát hóa** là khả năng làm tốt trên dữ liệu chưa thấy, và là mục tiêu thực sự; điểm train chỉ là phương tiện. Quy mô và độ đa dạng của dữ liệu ảnh hưởng tới nó. [GG-SUP]
- **Tập test tốt:** đủ lớn, đại diện cho dữ liệu thật, không trùng mẫu với train. Dùng test lặp lại để chọn mô hình thì nó "mòn"; cần thêm tập validation (hẹn bài sau). [GG-DS]
- **Cầu nối:** đường tới `ml/overfitting-underfitting`: train tốt nhưng test tệ là dấu hiệu overfitting. [SK-CV]

## Công thức quan trọng

Chỉ ký hiệu, không dẫn công thức (quyết định 40). Theo `CLAUDE.md`: vectơ đặc trưng $\mathbf{x}\in\mathbb{R}^n$, nhãn $y$, $m$ mẫu, $n$ đặc trưng.

- Tập dữ liệu: $\{(\mathbf{x}_i, y_i)\}_{i=1}^{m}$, trong đó $\mathbf{x}_i$ là vectơ đặc trưng của mẫu thứ $i$ và $y_i$ là nhãn của nó.
- Mô hình là một hàm: $\hat{y} = f(\mathbf{x})$. Hồi quy: $y,\hat{y}$ là số thực. Phân loại: $y$ thuộc một tập lớp hữu hạn.
- Hàm mất mát $\mathcal{L}$ đo mức "sai" của dự đoán so với nhãn; huấn luyện là chọn tham số làm $\mathcal{L}$ nhỏ. Bài này chỉ nói vai trò, không đưa dạng cụ thể (MSE đã ở `ml/linear-regression`).
- Ma trận dữ liệu $\mathbf{X}$ cỡ $m\times n$, mỗi hàng một mẫu. Có thể nhắc, không bắt buộc.
- Gợi ý ký hiệu cho hai phần chia: chỉ số "train", "test" viết dưới, ví dụ $m_{\text{train}}$, $m_{\text{test}}$ hoặc $(\mathbf{X}_{\text{train}}, \mathbf{y}_{\text{train}})$. Tên này của summarizer, **không lấy từ nguồn**.

**Ký hiệu các nguồn dùng so với site** (site: $m$ mẫu, $n$ đặc trưng, chỉ số mẫu viết dưới):

| Nguồn | Số mẫu | Số chiều / đặc trưng | Đầu vào, nhãn | Ghi chú |
|---|---|---|---|---|
| [MLCB2] (đã đọc) | $N$ | không định nghĩa trong trang | $\mathbf{x}_i$, $y_i$; tập $X$, $Y$ viết hoa | Khác site: $N$ thay cho $m$; $X$ ở đây là *tập* đầu vào, còn site dùng $\mathbf{X}$ đậm cho *ma trận* |
| [ISL] (**chưa đọc chương 2**; theo trí nhớ, cần kiểm lại trước khi nói chắc) | $n$ | $p$ | $X$, $Y$ | Nếu đúng thì **đảo vai trò $n$** so với site ($n$ là số mẫu, không phải số đặc trưng). Dễ gây nhầm với người đọc ISL sau này |
| [GG-*] | không dùng ký hiệu toán trên các trang đã đọc | | "features", "label" | |
| [SK-TTS] | tên mảng `X`, `y` | | `X_train, X_test, y_train, y_test` | Khớp với quy ước tên biến trong code của site |
| [MIT] (chưa đọc sách) | | | | Định nghĩa dùng chữ T, P, E, không phải ký hiệu của site; đừng trộn vào $\mathcal{L}$ |

Nên thêm một ghi chú ngắn trong bài: "sách khác có thể dùng $N$ hoặc $n$ cho số mẫu".

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình.

- **Chấm điểm đề đã học thuộc.** Học sinh luyện đúng một đề rồi thi lại chính đề đó thì điểm cao không chứng tỏ hiểu bài. Tập test giống "đề thi chưa từng thấy". Gợi ý dùng ngay ở phần Trực giác. (Ví dụ của summarizer, ý tưởng tương đương [SK-CV].)
- **Cùng bảng căn hộ, đổi nhãn thì đổi bài toán.** Nhãn là giá thuê (số) thì là hồi quy; nhãn là "đắt hay rẻ" thì là phân loại. Hợp với quyết định dùng bảng căn hộ cho ô code. Lưu ý bảng chỉ có 10 dòng: chia 25% cho ra rất ít mẫu test (tuy nhiên `train_test_split` với 10 mẫu và mặc định cho test 3 mẫu, theo quy tắc làm tròn lên của scikit-learn; **chưa chạy thử**, kiểm lại bằng `python` trước khi viết số này vào bài).
- **Hộp đen `fit`/`predict`.** Với người mới, `model.fit(X_train, y_train)` rồi `model.predict(X_test)` là đủ để cảm nhận quy trình trước khi biết bên trong. Hợp ô code 1 theo quyết định 40.
- **Ba ví dụ ứng dụng quen thuộc** từ [MLCB2]: thư rác (phân loại), dự đoán giá nhà (hồi quy), gom khách hàng (phân cụm), chơi cờ vây hoặc game (tăng cường). Dùng làm sơ đồ nhóm cho hình SVG 1.
- **Sơ đồ quy trình (hình SVG 2):** dữ liệu → chia train/test → huấn luyện (chỉ thấy train) → đánh giá (chỉ thấy test) → dữ liệu mới. Mũi tên "cấm" từ test ngược lại vào huấn luyện là điểm nhấn.

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp". Ý có thẻ nguồn lấy từ nguồn đã đọc; không có thẻ là kiến thức chung của summarizer.

1. **Đánh giá trên chính dữ liệu train rồi tin điểm đó.** Mô hình nhớ lại nhãn cũng đạt điểm cao. [SK-CV]
2. **Dùng test để chỉnh mô hình lặp đi lặp lại.** Tập test sẽ "mòn" và điểm cuối không còn đáng tin; cần tập validation riêng. [GG-DS] Bài này chỉ nhắc một câu, hẹn bài sau.
3. **Rò rỉ dữ liệu (data leakage), mức sơ đẳng.** Mẫu trùng nằm ở cả train và test, hoặc xử lý dữ liệu (ví dụ chuẩn hóa) bằng toàn bộ bảng trước khi chia. Nguồn [GG-DS] nói test không nên chứa mẫu trùng train; ý chuẩn hóa trước khi chia là kiến thức chung, **không có trong nguồn đã đọc**, nên chỉ nhắc nếu bài có chỗ.
4. **Quên đặt `random_state`.** Mỗi lần chạy chia một kiểu, kết quả đổi theo, người học tưởng code sai. [SK-TTS] (khớp quy ước "đặt seed" của site).
5. **Trộn ngẫu nhiên dữ liệu chuỗi thời gian.** Với dữ liệu có thứ tự thời gian thì dùng `shuffle=False`. [SK-TTS] Nên chỉ nhắc, không đào sâu.
6. **Phân loại lệch lớp mà không `stratify`:** một phần có thể thiếu hẳn lớp hiếm. [SK-TTS]
7. **Nhầm hồi quy với phân loại vì tên.** "Hồi quy logistic" là phân loại. Phân biệt theo kiểu của nhãn. (Kiến thức chung; hẹn `ml/logistic-regression`.)
8. **Cho rằng điểm train cao là mục tiêu.** Mục tiêu là tổng quát hóa. [GG-SUP]
9. **Cho rằng "nhiều dữ liệu hơn" luôn cứu được mô hình.** Nguồn [GG-SUP] nhấn mạnh cả *độ đa dạng*, không chỉ số lượng; dữ liệu không đại diện thì test cũng không đại diện. [GG-DS]
10. **Học máy = AI = học sâu.** [MLCB1] mô tả học máy là một nhánh của AI, và học sâu là một nhánh của học máy. Giáo án nên có một câu phân biệt để người mới khỏi lẫn.
11. **Nhầm tên nhóm:** "học có giám sát" nghĩa là *có nhãn*, không phải có người ngồi canh. Gán nhãn thường tốn kém và cần chuyên gia (ví dụ ảnh y tế), đó là lý do có nhóm bán giám sát. [MLCB2]
12. **Hiểu lầm về định nghĩa Samuel**: xem mục "Nguồn gốc các câu định nghĩa". Đừng viết "Samuel định nghĩa học máy là...".

## Liên quan tới bài nào

Slug theo `src/data/roadmap.ts` (không đọc lại file này trong phiên này; kiểm lại nếu cần).

- **Bài đứng ngay sau và dựa vào bài này:** `ml/linear-regression` (liệt kê `ml/ml-overview` trong "cần biết trước"). Bài mẫu dùng chính bảng căn hộ.
- **`ml/overfitting-underfitting`:** nơi giải thích vì sao train tốt mà test tệ. Bài tổng quan chỉ trỏ tới.
- **`ml/regularization`, `ml/gradient-descent`, `ml/logistic-regression`:** các bài ML sau; bài tổng quan chỉ nhắc hồi quy và phân loại ở mức khái niệm.
- **Bài về đánh giá mô hình** (validation, cross-validation, metric): chưa kiểm roadmap xem có bài nào; nội dung validation và `cross_val_score` thuộc đó.
- **Bài `math/probability-statistics`:** không cần cho bài này.
- **Nơi bài này mượn:** `python/numpy-pandas` (mảng, `X[:, ...]`, bảng).

## Thuật ngữ đề xuất

Chỉ đề xuất, **chưa sửa** `docs/glossary.md`; kiểm xem đã có trong glossary chưa trước khi thêm.

| Tiếng Việt | Tiếng Anh | Cách dùng | Ghi chú |
|---|---|---|---|
| Học máy | Machine learning | Dịch | |
| Học có giám sát | Supervised learning | Dịch | Có nhãn |
| Học không giám sát | Unsupervised learning | Dịch | |
| Học tăng cường | Reinforcement learning | Dịch | |
| Học bán giám sát | Semi-supervised learning | Dịch, chỉ nhắc nếu cần | [MLCB2] |
| Hồi quy | Regression | Dịch | Nhãn liên tục |
| Phân loại | Classification | Dịch | Nhãn rời rạc |
| Phân cụm | Clustering | Dịch | |
| Đặc trưng | Feature | Dịch | |
| Nhãn | Label | Dịch | |
| Tập huấn luyện, tập kiểm tra | Training set, test set | Dịch, lần đầu ghi "train/test" | Người Việt hay dùng "train/test" |
| Tập validation | Validation set | Giữ | Hẹn bài sau |
| Tổng quát hóa | Generalization | Dịch | |
| Rò rỉ dữ liệu | Data leakage | Dịch | Nếu bài nhắc |
| Tác nhân, phần thưởng | Agent, reward | Dịch | Cho nhóm tăng cường |

## Số đã chạy thử

Không chạy mã nào trong phiên này. Mọi số về `train_test_split` trên bảng 10 căn hộ (kích thước tập test, mẫu rơi vào tập nào với `random_state` cụ thể) **chưa kiểm**; `lesson-writer` cần chạy thử bằng `python` trước khi đưa vào bài.

## Đọc thêm đề xuất

1. **Tiep Vu, *Machine Learning cơ bản*, Bài 2: Phân nhóm các thuật toán Machine Learning** (tiếng Việt, 2016). [Link](https://machinelearningcoban.com/2016/12/27/categories/). Đã đọc.
2. **Google, *Machine Learning Crash Course*, phần Datasets, generalization, and overfitting.** [Link](https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets). Phần chia tập dữ liệu đã đọc.
3. **scikit-learn 1.8, `train_test_split`** [Link](https://scikit-learn.org/1.8/modules/generated/sklearn.model_selection.train_test_split.html) và mục [Cross-validation](https://scikit-learn.org/1.8/modules/cross_validation.html). Đã đọc.
4. **Mitchell (1997), *Machine Learning*.** [Link](https://www.cs.cmu.edu/~tom/mlbook.html). Trang sách mở được; chưa đọc nội dung sách.
5. **ISL** [Link](https://www.statlearning.com/) và **Géron, *Hands-On Machine Learning*, chương 1** (chưa kiểm nội dung): dành cho người đọc muốn sách tiếng Anh; ghi rõ khác ký hiệu ($n$, $p$ trong ISL, chưa xác minh).
