# GPT và huấn luyện phân tán

Bài: `nlp/gpt-distributed-training` (chỉ bản vi). Bài cần biết trước trong roadmap: `dl/transformers` (chưa xuất bản, nên có "Nhắc nhanh" về self-attention, mặt nạ nhân quả, khối decoder). Phạm vi theo `docs/architecture/nlp-lessons.md` mục 3 dòng 7 và quyết định 74: GPT và data parallel dạy kỹ; tensor/pipeline parallel và ZeRO/FSDP chỉ ở mức khái niệm, link tới `llm/llama-family`. Lịch sử GPT-1/2/3 chỉ tóm thành bảng, link tới `llm/gpt-family-finetuning`; cài đặt GPT link tới `llm/build-first-llm`.

Hai ô `PythonRunner` (NumPy), một ô `LocalCode` (PyTorch, `torch.distributed`, backend `gloo`, 2 tiến trình CPU). Hình dùng lại: `ParallelismFigure`. Không có VIZ/FIG mới; mục Minh họa thêm một bảng so sánh các cách chia, mục Lý thuyết có bảng từng bước ring all-reduce với 3 GPU.

Ngày tra: **05/11/2026**. Ý không có thẻ nguồn là kiến thức chung hoặc tự tính.

## Nguồn

- **[GPT1]** Radford, A., Narasimhan, K., Salimans, T., Sutskever, I. (2018). [*Improving Language Understanding by Generative Pre-Training*](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf). Số liệu (BooksCorpus hơn 7 000 sách, 12 khối, $D = 768$, ngữ cảnh 512) lấy lại từ bài `llm/gpt-family-finetuning` và `docs/research/gpt-family-finetuning.md`, đã kiểm ở đợt LLM.
- **[GPT2]** Radford, A. và cộng sự (2019). [*Language Models are Unsupervised Multitask Learners*](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf). 1.5 tỉ tham số, WebText khoảng 40 GB, ngữ cảnh 1 024 (như trên).
- **[GPT3]** Brown, T. B. và cộng sự (2020). [*Language Models are Few-Shot Learners*](https://arxiv.org/abs/2005.14165). 175 tỉ tham số, 300 tỉ token, ngữ cảnh 2 048; mục 2.3: kết hợp song song trong từng phép nhân ma trận và giữa các lớp để không tràn bộ nhớ; phụ lục D: sức tính $3.14 \times 10^{23}$ FLOP cho bản 175B. **Đã mở PDF** (trích chữ bằng PyMuPDF): mục 2.3 "we use a mixture of model parallelism within each matrix multiply and model parallelism across the layers of the network. All models were trained on V100 GPU's"; Bảng D.1 dòng GPT-3 175B: 3.14E+23 FLOP, 300 tỉ token, hệ số 6.
- **[KAPLAN]** Kaplan, J. và cộng sự (2020). [*Scaling Laws for Neural Language Models*](https://arxiv.org/abs/2001.08361). Loss theo luật lũy thừa của số tham số, dữ liệu, sức tính; ước lượng $C \approx 6NBS$ (khoảng $6N$ phép tính mỗi token); bài báo viết $N$ cho số tham số. Chưa mở lại trong phiên này.
- **[CHIN]** Hoffmann, J. và cộng sự (2022). [*Training Compute-Optimal Large Language Models*](https://arxiv.org/abs/2203.15556). Tăng đều tham số và token; Chinchilla 70B, 1.4 nghìn tỉ token, vượt Gopher 280B cùng sức tính. Chưa mở lại trong phiên này.
- **[ZERO]** Rajbhandari, S. và cộng sự (2020). [*ZeRO*](https://arxiv.org/abs/1910.02054). Cách đếm 2 + 2 + 12 = 16 byte mỗi tham số; lấy lại từ bài `llm/llama-family`.
- **[HVD]** Sergeev, A., Del Balso, M. (2018). [*Horovod*](https://arxiv.org/abs/1802.05799), arXiv:1802.05799. **Đã mở PDF**, mục 3 "Leveraging a different type of algorithm": "each of N nodes communicates with two of its peers 2∗(N−1) times… In the first N−1 iterations, received values are added… In the second N−1 iterations, received values replace…", và "Patarasuk and Yuan in [9] suggest that this algorithm is bandwidth-optimal".
- **[PY]** Patarasuk, P., Yuan, X. (2009). *Bandwidth optimal all-reduce algorithms for clusters of workstations*, J. Parallel Distrib. Comput. 69(2). Chỉ biết qua trích dẫn của [HVD]; **chưa đọc bài gốc**, không đưa vào Đọc thêm.
- **[GIB]** Gibiansky, A. (2017). *Bringing HPC Techniques to Deep Learning*, blog Baidu Research (andrew.gibiansky.com). Đưa ring all-reduce vào học sâu; [HVD] mục 3 kể lại việc này. Chỉ nhắc trong lời văn ("Baidu (Gibiansky, 2017)"), không đưa vào Đọc thêm; **chưa mở bài gốc**.
- **[LI]** Li, S. và cộng sự (2020). [*PyTorch Distributed: Experiences on Accelerating Data Parallel Training*](https://arxiv.org/abs/2006.15704), VLDB 2020. Đã mở trang arXiv (tên, tác giả, "To appear in VLDB 2020"). Ý bucket, chồng all-reduce lên lan truyền ngược, `no_sync` khớp tài liệu [DDP].
- **[DDP]** PyTorch 2.14. [*Distributed Data Parallel*](https://docs.pytorch.org/docs/2.14/notes/ddp.html). Đã mở: hàm khởi tạo "broadcasts state_dict() from the process with rank 0"; all-reduce theo bucket tính "mean of gradients across all processes"; bucket được all-reduce bất đồng bộ trong lúc lan truyền ngược.
- **[DATA]** PyTorch 2.14. [*torch.utils.data*](https://docs.pytorch.org/docs/2.14/data.html), `DistributedSampler`. Đã mở: `drop_last=False` thì "add extra indices to make the data evenly divisible"; phải gọi `set_epoch()` đầu mỗi epoch, không thì "the same ordering will be always used".
- **[MP]** Micikevicius, P. và cộng sự (2017). [*Mixed Precision Training*](https://arxiv.org/abs/1710.03740), ICLR 2018. Mục 3 (theo review 05/11/2026): ba kỹ thuật là (1) bản trọng số chính FP32 và cập nhật ở FP32, (2) loss scaling, (3) cộng dồn tích FP16 vào FP32. Tính xuôi/ngược ở 16 bit là bối cảnh, không phải một "cách chữa". Bài báo dùng hệ số cố định; loss scaling động chỉ được gợi ý ở phần kết luận. Bài đã sửa theo đó.
- **[GOYAL]** Goyal, P. và cộng sự (2017). *Accurate, Large Minibatch SGD: Training ImageNet in 1 Hour*, [arXiv:1706.02677](https://arxiv.org/abs/1706.02677). Quy tắc tăng tốc độ học tuyến tính theo cỡ lô, warmup, ResNet-50 lô 8 192. Chỉ nhắc trong hộp Lỗi hay gặp, không đưa vào Đọc thêm; chưa mở lại.
- **[SHOEYBI]**, **[GPIPE]**: Megatron-LM (arXiv:1909.08053), GPipe (arXiv:1811.06965); chỉ nhắc tên, chi tiết ở `llm/llama-family`.

## Ý chính dùng trong bài

- GPT: mô hình ngôn ngữ nhân quả, nhãn là đầu vào dịch một vị trí, loss ở mọi vị trí nhờ mặt nạ (như `llm/build-first-llm`).
- Phép dẫn data parallel: $\nabla\mathcal{L} = \frac{1}{m}\sum_k \sum_{i \in S_k}\nabla\ell_i = \sum_k \frac{B_k}{m}\mathbf{g}_k$, bằng $\frac{1}{N}\sum_k\mathbf{g}_k$ khi $B_k = m/N$.
- Ring all-reduce: reduce-scatter $N-1$ bước + all-gather $N-1$ bước, mỗi bước một mảnh $G/N$, tổng $\frac{2(N-1)}{N}G$ mỗi worker [HVD] (bài viết $G$ cho kích thước gradient, vì $S_k$ đã là tập mẫu của shard $k$).
- Tích lũy gradient = cùng phép trung bình làm lần lượt; `backward()` cộng dồn `.grad`; `no_sync` [LI, DDP].
- FP16: max 65 504, số dương nhỏ nhất (subnormal) khoảng $6 \times 10^{-8}$, eps khoảng 0.000977 (kiểm bằng `np.finfo(np.float16)`); `np.float16(1e-8) == 0`, `np.float16(1e-8 * 1024) ≈ 1.025e-05`, `np.float16(1) + np.float16(1e-4) == 1` (tự chạy, CPython + NumPy). BF16: 8 bit mũ, 7 bit phần định trị.

## Số tự tính

| Đại lượng | Giá trị |
|---|---|
| Bộ nhớ GPT-2 1.5B, 16 byte/tham số | 24 GB |
| Bộ nhớ GPT-3 175B | 2.8 TB, hơn 35 GPU 80 GB |
| Thời gian GPT-3 trên một A100 ở 312 TFLOPS (đỉnh 16 bit, NVIDIA) | $3.14\times10^{23} / 3.12\times10^{14} \approx 1.0\times10^9$ s ≈ 31.9 năm |
| $6\Psi T$ cho GPT-3 | $6 \times 175\times10^9 \times 300\times10^9 \approx 3.15\times10^{23}$ |
| Token mỗi tham số: Chinchilla / GPT-3 | 20 / 1.7 |
| Ring all-reduce, gradient GPT-2 bf16 3 GB, 64 GPU, 12.5 GB/s | gửi $1.97 \times 3 \approx 5.9$ GB, khoảng 0.47 s |
| Máy trung tâm, cùng cấu hình | nhận $63 \times 3 = 189$ GB, khoảng 15 s |
| Quiz: 7B × 16 byte; ZeRO-3 trên 8 GPU | 112 GB; 14 GB |
| Quiz: ring 2 GB, $N = 8$ / $N = 64$ | 3.5 GB / 3.94 GB |

## Kiểm chứng code

Do `lesson-writer` chạy ngày 05/11/2026, thư mục làm việc ở scratchpad. Cả sáu file qua `ast.parse(..., feature_version=(3, 10))`, dòng ≤ 79 ký tự (đếm ký tự, không đếm byte). Mỗi `.en.py` là bản sao y nguyên của `.vi.py`; bản en cho output giống bản vi.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `shard-gradients.vi.py`, `shard-gradients.en.py` | chạy thật | 2026-11-05 | Pyodide 314.0.7 thật (`runpyo.mjs`, Python 3.14.2, NumPy 2.4.6) | 34 dòng, khoảng 0.5–1 s. `data parallel: max diff 4.4e-16`; `accumulation: max diff 4.4e-16`; `uneven, plain mean: max diff 0.629`; `uneven, weighted: max diff 8.9e-16`; `|g_full| max 4.940`. Khớp lời văn |
| `ring-allreduce.vi.py`, `ring-allreduce.en.py` | chạy thật | 2026-11-05 | như trên | 30 dòng, 0.5 s (một lần 3.3 s khi máy bận). `worker 0, chunk 1: [13 20 12] target: [13 20 12]`; `every worker has the sum: True`; `worker 0 sent 18 numbers = 1.50 x size`; tỉ lệ 1.00, 1.50, 1.75, 1.97 cho N = 2, 4, 8, 64. Khớp lời văn |
| `ddp.vi.py`, `ddp.en.py` | chạy thật | 2026-11-05 | `.venv-nlp`: Python 3.14.5, torch 2.14.1+cpu, Windows 11; backend `gloo`, `init_method="tcp://127.0.0.1:29500"` | 60 dòng, 47 s tới 1 phút 14 s (mỗi tiến trình nạp `torch` khoảng 11 s). Chạy 3 lần bản vi, 1 lần bản en: số giống hệt mọi lần, chỉ thứ tự dòng giữa hai rank đổi; khối "Kết quả mẫu" chép từ một lần chạy bản vi. 39 ký tự khác nhau, 130 ký tự, 114 đoạn, 57 đoạn/rank, 15 751 tham số, 120 bước cập nhật. Loss rank 0: 1.692, 0.611, 0.276; rank 1: 1.615, 0.649, 0.261; `max |rank0 - rank1| = 0.0e+00`. Stderr có 2 dòng cảnh báo `[c10d] The client socket has failed to connect to [<tên máy>]:29500 (system error: 10049 ...)`, vô hại, bài có nhắc. Không cần `USE_LIBUV=0` |
| (thử nghiệm) `ddp.vi.py` bỏ `DDP(...)` | chạy thật | 2026-11-05 | như trên | Không phải file của bài. Loss epoch 30: rank 0 0.466, rank 1 0.509; `max |rank0 - rank1| = 5.3e+00`. Số dùng trong đoạn "Thử đổi dòng tạo mô hình" |
| (thử nghiệm) `ddp.vi.py` bỏ `if __name__ == "__main__":` | chạy thật | 2026-11-05 | như trên | Không phải file của bài. Tiến trình con báo `RuntimeError` (bootstrapping). Kiểm câu trong bài |

**Sửa sau review (05/11/2026):** chỉ sửa lời văn và quiz của MDX (Micikevicius, Horovod/Baidu, `DistributedSampler`, tốc độ học khi tăng lô, warmup, $S 	o G$, `aligned`, BF16 2–3 chữ số, bảng Minh họa, chú thích tiếng Anh lần đầu). Không đổi file code nào, nên không chạy lại; các số trong bảng trên vẫn đúng.
