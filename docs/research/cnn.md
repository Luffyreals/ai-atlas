# Mạng tích chập (CNN)

Bài: `dl/cnn` (chỉ bản vi). Bài cần biết trước trong roadmap: `dl/training-neural-networks` (cùng xuất bản trong PR phần DL). VIZ: `ConvolutionViz` (dl-lessons.md mục 4). Hai ô `PythonRunner` (NumPy và Python thuần) và một ô `LocalCode` (PyTorch, `load_digits`).

Ngày tra: **05/11/2026**. Cách tra: WebFetch trang arXiv, trang tài liệu PyTorch, ghi chú CS231n, mục lục bản dịch tiếng Việt của D2L; chạy thật ba file code. Ý không có thẻ nguồn là kiến thức chung hoặc suy ra.

## Nguồn

- **[D2L]** Zhang, A., Lipton, Z. C., Li, M., Smola, A. J. (2020), bản dịch của nhóm Dịch thuật Việt Nam. [*Đắm mình vào Học Sâu*, chương 6: Mạng Nơ-ron Tích chập](https://d2l.aivivn.com/chapter_convolutional-neural-networks/index_vn.html). Đã xác minh mục lục: 6.1 Từ tầng kết nối dày đặc đến phép tích chập, 6.2 Phép tích chập cho ảnh, 6.3 Đệm và sải bước, 6.4 Đa kênh đầu vào và đầu ra, 6.5 Gộp, 6.6 LeNet. Cùng thứ tự với bài.
- **[GBC16]** Goodfellow, I., Bengio, Y., Courville, A. (2016). [*Deep Learning*, chương 9](https://www.deeplearningbook.org/contents/convnets.html). Trang tồn tại nhưng WebFetch không đọc được nội dung (trang HTML dài). Các ý dùng trong bài (9.1: thư viện tính cross-correlation mà gọi là tích chập; 9.2: tương tác thưa, chia sẻ tham số, đẳng biến; 9.3: pooling cho bất biến gần đúng với dịch nhỏ) là nội dung quen thuộc của chương này, **chưa đối chiếu lại câu chữ lần này**.
- **[DV16]** Dumoulin, V., Visin, F. (2016). [*A guide to convolution arithmetic for deep learning*](https://arxiv.org/abs/1603.07285). arXiv:1603.07285 (nộp 3/2016, sửa 1/2018). Công thức kích thước đầu ra theo padding, stride.
- **[CS231n]** Stanford CS231n. [*Convolutional Networks*](https://cs231n.github.io/convolutional-networks/). Đã đọc: công thức $(W - F + 2P)/S + 1$; kết nối cục bộ (mỗi nơ-ron nối một vùng nhỏ theo không gian nhưng đủ cả chiều sâu); chia sẻ tham số (giả định mẫu hình hữu ích ở chỗ này cũng hữu ích ở chỗ khác, có thể sai với ảnh mặt người đã căn giữa); ví dụ lớp đầu AlexNet 34 944 tham số khi chia sẻ, 105 705 600 trọng số khi không.
- **[PT]** PyTorch. [`torch.nn.Conv2d`](https://docs.pytorch.org/docs/2.15/generated/torch.nn.Conv2d.html), bản 2.15. Trang ghi rõ toán tử là "valid 2D cross-correlation"; $H_{\text{out}} = \lfloor (H_{\text{in}} + 2p - d(k - 1) - 1)/s \rfloor + 1$, với dilation $d = 1$ thì trùng công thức của bài.
- **[AW19]** Azulay, A., Weiss, Y. (2019). [*Why do deep convolutional networks generalize so poorly to small image transformations?*](https://arxiv.org/abs/1805.12177). *JMLR* 20(184) (theo trang arXiv). CNN không thật sự bất biến với dịch hay co giãn nhỏ vì kiến trúc bỏ qua định lý lấy mẫu; tăng cường dữ liệu chỉ bù một phần.
- **[L17]** Luo, W., Li, Y., Urtasun, R., Zemel, R. (2017). [*Understanding the Effective Receptive Field in Deep Convolutional Neural Networks*](https://arxiv.org/abs/1701.04128). arXiv:1701.04128. Trường tiếp nhận hiệu dụng có dạng Gauss và chỉ chiếm một phần trường tiếp nhận lý thuyết. Không dùng trong bài (để dành nếu cần mở rộng mục trường tiếp nhận).

## Ý chính dùng trong bài

- Tích chập trong học sâu là cross-correlation, không lật kernel [PT][GBC16]. Với tham số học được thì không khác biệt; khác khi so với `scipy.signal.convolve2d` (kiểm bằng code: Sobel dọc qua `convolve2d` ra hàng 2 là `[-36 -36 0 0 36 36]`, qua `correlate2d` ra `[36 36 0 0 -36 -36]`).
- Kích thước đầu ra $\lfloor (n + 2p - k)/s \rfloor + 1$ [DV16][CS231n][PT].
- Số tham số một lớp $(k^2 C_{\text{vào}} + 1) C_{\text{ra}}$; kết nối cục bộ và chia sẻ trọng số [CS231n][D2L].
- Đẳng biến với phép dịch; pooling cho bất biến gần đúng [GBC16]; bất biến không trọn vẹn trong thực tế [AW19]. Ô PyTorch của bài cho thấy điều này bằng số: dịch ảnh kiểm tra 1 điểm ảnh làm độ chính xác của CNN tụt từ 0.976 xuống 0.650.
- Trường tiếp nhận: $r \leftarrow r + (k - 1) j$, $j \leftarrow j s$ (suy ra, kiến thức chung).

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc ở scratchpad. Cả ba file qua `ast.parse(..., feature_version=(3, 10))`; mỗi `.en.py` là bản sao y nguyên của `.vi.py` (chưa dịch comment).

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `conv2d.vi.py`, `conv2d.en.py` | chạy thật | 2026-11-05 | venv khớp Pyodide `ai-atlas-py314`: Python 3.14.5, NumPy 2.4.6 | 41 dòng, dòng dài nhất 71 ký tự. Bản đồ Sobel dọc 6×6: hai cột trái 9/27/36/36/27/9, hai cột giữa 0, hai cột phải đối dấu; `stride 2: (3, 3)`; sau ReLU và max-pool 2×2: `[[27 0 0] [36 0 0] [27 0 0]]`. Khớp lời văn và VIZ |
| `params.vi.py`, `params.en.py` | chạy thật | 2026-11-05 | như trên (chỉ Python thuần) | 36 dòng, dòng dài nhất 75 ký tự. `MLP params: 101,770`; kích thước 26×26×8 → 13×13×8 → 11×11×16 → 5×5×16; `CNN params: 5,258`; `dense 784 -> 26*26*8: 4,245,280`; `conv 1->8, 3x3: 80`. Khớp lời văn |
| `cnn-digits.vi.py`, `cnn-digits.en.py` | chạy thật | 2026-11-05 | `.venv-dl`: Python 3.14, torch 2.15.0+cpu, scikit-learn 1.9.1 | 49 dòng, dòng dài nhất 68 ký tự. Chạy ba lần, output giống hệt: `CNN:  6090 params  test acc 0.976  shifted 0.650`, `MLP:  4810 params  test acc 0.957  shifted 0.461`. Thời gian 107 s và 124 s khi máy đang chạy nhiều phiên torch song song; 42 s với `OMP_NUM_THREADS=1` (output như nhau). Kết quả mẫu trong bài lấy từ các lần này. Thử thêm (bản sao trong scratchpad, không phải file của bài): thay pooling cuối bằng `AdaptiveMaxPool2d(1)` cho CNN 5130 tham số, 0.976, shifted 0.674 (số MLP đổi theo vì dòng số ngẫu nhiên khác), nên bài không gợi ý thử này |
| thí nghiệm dịch 1 điểm ảnh (`shift.py` trong scratchpad) | chạy thật | 2026-11-05 | venv `ai-atlas-py314` | Dịch hình vuông 1 cột sang phải: bản đồ Sobel dịch đúng 1 cột; sau ReLU và max-pool 2×2 thành `[[27 27 0] [36 36 0] [27 27 0]]`; số lớn nhất toàn bản đồ vẫn 36. Khớp mục "Vì sao CNN tốt hơn MLP". Không phải file của bài |
| bộ lọc của VIZ (`explore.py` trong scratchpad) | chạy thật | 2026-11-05 | venv `ai-atlas-py314` | Đồng nhất: phần 6×6 giữa ảnh; làm mờ: 9 ở bốn ô giữa, 1 ở bốn góc; làm nét: lớn nhất 27 (góc hình vuông), giữa 9, viền ngoài $-9$, cạnh 18; Sobel ngang: hai hàng trên dương (lớn nhất 36), hai hàng giữa 0, hai hàng dưới âm. Khớp danh sách "Hãy thử" |
