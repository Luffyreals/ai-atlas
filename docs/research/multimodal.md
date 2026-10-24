# Multimodal: ảnh vào LLM (Multimodal LLMs)

Bài: `llm/multimodal` (chỉ bản vi, khoảng 12 phút đọc). Bài cần biết trước trong roadmap: `llm/llama-family` và `cv/llava`. Bài `cv/llava` (và `cv/clip-blip-glip`, `cv/vision-transformer`) **chưa xuất bản**, nên theo `docs/architecture/llm-lessons.md` mục 2.7 mục "Nhắc nhanh" được dài tới một đoạn (4 đến 6 câu), nhắc ViT, CLIP và cách nối embedding ảnh vào chuỗi token. Có một ô `PythonRunner` (NumPy), một ô `LocalCode` (PyTorch) và hình `MultimodalFigure` (mục 2.9: ảnh đi qua bộ mã hóa ảnh và lớp chiếu thành token ảnh, nằm chung chuỗi với token chữ).

Ngày tra: **24/10/2026**. Cách tra: tải PDF từ arXiv, trích chữ bằng `pdftotext`, đọc các mục nêu bên dưới; trang model card mở bằng WebFetch; chạy thật Python. Ý không có thẻ nguồn là kiến thức chung hoặc "tự tính" (có ghi rõ). Giáo án gốc buổi 22: "Multimodal: CLIP, ViT, LLAMA 3.2" (chỉ tham khảo).

## Nguồn

- **[VIT]** Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., Zhai, X., Unterthiner, T., Dehghani, M., Minderer, M., Heigold, G., Gelly, S., Uszkoreit, J., Houlsby, N. (2021). [*An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale*](https://arxiv.org/abs/2010.11929). arXiv:2010.11929 (v1 22/10/2020; bản đã đọc: v2, 3/6/2021, đăng ở ICLR 2021). Đã đọc mục 3.1 (cách chia patch, công thức số patch, token lớp, embedding vị trí).
- **[CLIP]** Radford, A., Kim, J. W., Hallacy, C., Ramesh, A., Goh, G., Agarwal, S., Sastry, G., Askell, A., Mishkin, P., Clark, J., Krueger, G., Sutskever, I. (2021). [*Learning Transferable Visual Models From Natural Language Supervision*](https://arxiv.org/abs/2103.00020). arXiv:2103.00020 (v1 26/2/2021). Đã đọc tóm tắt, mục 2.3 và đoạn giả mã hàm mất mát.
- **[LLAVA]** Liu, H., Li, C., Wu, Q., Lee, Y. J. (2023). [*Visual Instruction Tuning*](https://arxiv.org/abs/2304.08485). arXiv:2304.08485 (v1 17/4/2023; bản đã đọc: v2, 11/12/2023; đăng ở NeurIPS 2023 theo trí nhớ, chưa tra). Đã đọc mục kiến trúc (công thức 1) và mục huấn luyện hai giai đoạn, phụ lục thiết lập huấn luyện.
- **[LLAVA15]** Liu, H., Li, C., Li, Y., Lee, Y. J. (2023). [*Improved Baselines with Visual Instruction Tuning*](https://arxiv.org/abs/2310.03744). arXiv:2310.03744 (v1 5/10/2023; bản đã đọc: v2, 15/5/2024, CVPR 2024). Đã đọc tóm tắt, mục bàn về bộ nối MLP và độ phân giải, bảng 1 và 3 (lướt).
- **[L3]** Grattafiori, A., Dubey, A., Jauhri, A., và cộng sự (Llama Team, AI @ Meta) (2024). [*The Llama 3 Herd of Models*](https://arxiv.org/abs/2407.21783). arXiv:2407.21783 (cùng bản với `llama-family`). Đã đọc mục 1 (phần adapter ảnh) và **mục 7 "Vision Experiments"** (mở đầu, 7.1, **7.2 "Model Architecture"**: bộ mã hóa pre-train ở $224 \times 224$, khi huấn luyện adapter ảnh được co về tối đa bốn mảnh $336 \times 336$; 7.4 "Pre-training": bộ mã hóa không đóng băng, mô hình chữ giữ đóng băng). Quan trọng: đây là các **thí nghiệm**, paper ghi mô hình đa phương thức "chưa sẵn sàng phát hành" tại thời điểm viết.
- **[L32B]** Meta (25/9/2024). [*Llama 3.2: Revolutionizing edge AI and vision with open, customizable models*](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/). Blog Meta AI, mở bằng WebFetch ngày 24/10/2026. Xác nhận cho **bản phát hành**: adapter là chuỗi lớp cross-attention đưa biểu diễn của bộ mã hóa ảnh vào LLM; huấn luyện adapter trên cặp ảnh và chữ; khi huấn luyện adapter có cập nhật bộ mã hóa ảnh nhưng cố ý không cập nhật tham số LLM; khả năng chữ giữ nguyên, "drop-in replacement for Llama 3.1". Không nêu số lớp, vị trí chèn hay tên bộ mã hóa.
- **[L32]** Meta. [*Llama 3.2 Vision: model card*](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md) (repo `meta-llama/llama-models`). Đã mở và đọc. Nêu: dựng trên Llama 3.1 chỉ có chữ; bộ adapter ảnh làm bằng các lớp cross-attention đưa biểu diễn của bộ mã hóa ảnh vào LLM; hai cỡ 11B và 90B; phát hành 25/9/2024.
- **[CHAM]** Chameleon Team (Meta) (2024). [*Chameleon: Mixed-Modal Early-Fusion Foundation Models*](https://arxiv.org/abs/2405.09818). arXiv:2405.09818 (v1 16/5/2024; bản đã đọc: v2, 21/3/2025). Đã đọc tóm tắt, mục 2.1 (tokenize ảnh) và phần thảo luận so với late fusion.

## Chưa xác minh

| Mục | Tình trạng | Quyết định |
|---|---|---|
| Kiến trúc **thật** của bản Llama 3.2 phát hành | Đã xác minh một phần: model card [L32] và blog [L32B] xác nhận adapter cross-attention, cập nhật bộ mã hóa ảnh, **LLM giữ nguyên** ("drop-in replacement for Llama 3.1"). Chưa xác minh: "cross-attention sau mỗi lớp self-attention thứ tư", ViT-H/14, 630M tham số... vẫn chỉ là **thí nghiệm trong [L3]**. | Bài tách ba nguồn: thí nghiệm [L3], model card [L32], blog [L32B]. "LLM giữ nguyên" ghi cho cả thí nghiệm lẫn bản phát hành; số lớp và bộ mã hóa ghi là chi tiết thí nghiệm. |
| Số token ảnh của LLaVA 1 | [LLAVA] ghi lưới đặc trưng của CLIP ViT-L/14, ảnh đầu vào cỡ 224 (theo [LLAVA15] bảng so sánh là $224^2$) không nằm trong đoạn đã đọc kỹ; token lớp có bị bỏ không, chưa xác minh. | Chỉ nói "tính theo công thức: $224/14=16$, $16\times16=256$ patch". Ghi "tự tính". |
| 576 token ở LLaVA-1.5 | [LLAVA15] nói CLIP-ViT-L-336px; con số 576 không được ghi trong đoạn đã đọc. | $336/14=24$, $24^2=576$: tự tính từ công thức [VIT]. Ghi "tự tính". |
| Số token mỗi ảnh của Llama 3.2 Vision | Cross-attention **không** chèn token ảnh vào chuỗi nên không có "số token ảnh trong chuỗi". Số patch bộ mã hóa là 256 theo [L3] (thí nghiệm). Cỡ ảnh thật của 3.2 không tra. | Không ghi số cho 3.2. |
| Flamingo (Alayrac et al. 2022) | [L3] dẫn làm gốc của cross-attention; **chưa mở** bài này. Tôi nhớ arXiv:2204.14198. | Chỉ nhắc "Alayrac và cộng sự 2022 theo [L3]". Không đưa link nếu không có người tra. |
| "Fusion sớm / muộn" là thuật ngữ chuẩn | Không có định nghĩa duy nhất. [CHAM] tự gọi mình early-fusion, tức mọi modality thành token chung từ đầu, và đối lập với "late-fusion" kiểu Flamingo (mỗi modality có bộ mã hóa riêng). Ở LLaVA, cách gọi tùy tác giả. | Bài ghi "ở mức khái niệm, cách chia của bài", không nói LLaVA "thuộc" nhóm nào một cách tuyệt đối. |
| Tên hội nghị của [LLAVA] | Chỉ xác minh arXiv. | Ghi "arXiv:2304.08485, 2023". |
| Kết quả benchmark (Llama 3.2, LLaVA) | Không dùng. | Không ghi bảng điểm (quy tắc mục 2.6: số benchmark kèm paper và năm, tránh bảng xếp hạng). |

## Ý chính

Mạch bài đề xuất: một LLM chỉ đọc **chuỗi vectơ**. Muốn nó "thấy" ảnh, ta biến ảnh thành một dãy vectơ có cùng chiều với embedding của token chữ. Khác nhau giữa các mô hình chủ yếu là **ghép dãy đó vào đâu** và **huấn luyện phần nào**.

- **ViT: ảnh thành "từ" [VIT].** Cắt ảnh thành các ô vuông cùng cỡ ($P\times P$ điểm ảnh), trải phẳng từng ô, nhân với **một** ma trận học được cho ra một vectơ $D$ chiều ("patch embedding"). Mỗi patch đối xử như một token trong NLP. Thêm một token lớp học được (như `[class]` của BERT) và embedding vị trí 1D học được (tác giả thử embedding 2D và không thấy khác biệt đáng kể, phụ lục D.4), rồi đưa vào Transformer encoder chuẩn. Cấu trúc đặc thù của ảnh chỉ dùng "rất ít": ở bước cắt patch và khi chỉnh embedding vị trí cho ảnh có độ phân giải khác. Điểm cần nhớ cho bài: **cấu trúc 2D không được mã hóa sẵn**, mô hình học quan hệ không gian giữa các patch.
- **CLIP: gắn ảnh với chữ [CLIP].** Hai bộ mã hóa (ảnh, chữ), mỗi bộ có một phép chiếu vào cùng một không gian embedding, vectơ được chuẩn hóa độ dài 1. Với một lô $N$ cặp (ảnh, chú thích), mô hình học đoán **cặp nào trong $N\times N$ ghép đôi có thật**: kéo cặp đúng lại gần, đẩy $N^2-N$ cặp sai ra xa (hàm mất mát cross-entropy đối xứng, có tham số nhiệt độ học được). Huấn luyện trên 400 triệu cặp ảnh–chữ lấy từ Internet. Hệ quả: phân loại ảnh **zero-shot** bằng cách so ảnh với câu mô tả tên lớp. Bộ mã hóa ảnh của CLIP có thể là ResNet hoặc ViT (họ huấn luyện ViT-B/32, B/16, L/14). LLaVA lấy đúng bộ mã hóa ảnh ViT-L/14 này.
- **Mẫu chung: bộ mã hóa ảnh → projector → LLM.** (1) Bộ mã hóa ảnh (thường ViT của CLIP) cho một dãy đặc trưng patch. (2) **Projector** đổi chiều của đặc trưng ảnh sang đúng chiều embedding của LLM. (3) Chuỗi "token ảnh" đứng cùng token chữ của câu hỏi, LLM sinh câu trả lời bằng chữ như bình thường. Ở LLaVA, bộ mã hóa ảnh đóng băng, projector và (giai đoạn 2) LLM được huấn luyện.
- **LLaVA [LLAVA]: nối bằng một lớp tuyến tính.** $\mathbf{H}_v=\mathbf{W}\mathbf{Z}_v$, với $\mathbf{Z}_v$ là đặc trưng lưới từ CLIP ViT-L/14, $\mathbf{W}$ là ma trận học được, $\mathbf{H}_v$ cùng chiều với embedding từ của LLM (Vicuna). Chọn lớp đơn giản có chủ đích: để thử nhanh.
- **Huấn luyện hai giai đoạn của LLaVA [LLAVA].** *Giai đoạn 1, căn chỉnh đặc trưng:* khoảng 595K cặp ảnh–chú thích (lọc từ CC3M), chuyển thành hội thoại một lượt "mô tả ảnh ngắn gọn", **chỉ huấn luyện $\mathbf{W}$**, bộ mã hóa ảnh và LLM đóng băng. Tác giả mô tả đây là "huấn luyện một bộ tokenizer ảnh tương thích với LLM đóng băng". *Giai đoạn 2, tinh chỉnh toàn bộ:* bộ mã hóa ảnh vẫn đóng băng, cập nhật cả $\mathbf{W}$ **và** trọng số LLM, trên LLaVA-Instruct-158K (hội thoại, mô tả chi tiết, suy luận do **GPT-4 chỉ-chữ** sinh từ chú thích ảnh) rồi, cho từng ứng dụng, thêm ScienceQA. Thời gian trong paper: giai đoạn 1 khoảng 4 giờ, giai đoạn 2 khoảng 10 giờ trên 8 GPU A100. Nối với bài `llm/rlhf` và `llm/evaluation-peft`: giai đoạn 1 giống ý "chỉ huấn luyện phần nhỏ", giai đoạn 2 là instruction tuning.
- **LLaVA-1.5 [LLAVA15]: ba thay đổi nhỏ, hiệu quả lớn.** Thay lớp tuyến tính bằng **MLP hai lớp**; dùng CLIP-ViT-L-336px (ảnh $336\times336$); thêm dữ liệu VQA học thuật và câu lệnh định dạng câu trả lời. Paper nhấn mạnh hiệu quả dữ liệu: huấn luyện khoảng một ngày trên một máy 8 A100, dùng dữ liệu công khai (khoảng 1,2M mẫu cho bản 13B theo tóm tắt). Bài dùng ý "projector vẫn rất nhỏ nhưng quan trọng" và dùng MLP hai lớp trong code PyTorch.
- **Llama 3 / 3.2 Vision: cross-attention thay vì nối chuỗi [L3, L32].** Mô hình ngôn ngữ **giữ nguyên, đóng băng**; thêm các lớp **cross-attention** mà truy vấn (query) đến từ token chữ, còn khóa và giá trị (key, value) đến từ biểu diễn của bộ mã hóa ảnh. [L3] (thí nghiệm): bộ mã hóa ảnh là ViT-H/14 (630M tham số, 2,5 tỷ cặp ảnh–chữ, 5 epoch; sau khi thêm lớp thành khoảng 850M), ảnh $224\times224$ chia $16\times16=256$ patch, lấy đặc trưng nhiều tầng (tầng 4, 8, 16, 24, 31 và tầng cuối) cho vectơ 7680 chiều mỗi patch; cross-attention chèn **sau mỗi lớp self-attention thứ tư** của LLM, cũng dùng GQA; riêng bản 405B các lớp này thêm khoảng 100B tham số. Khi huấn luyện adapter, cập nhật bộ mã hóa ảnh và adapter nhưng **cố ý không cập nhật LLM**. Model card [L32]: Llama 3.2-Vision gồm 11B và 90B, dựng trên Llama 3.1, chỉ hỗ trợ **tiếng Anh** cho ảnh + chữ; pretrain trên 6 tỷ cặp ảnh–chữ; phát hành 25/9/2024.
- **Vì sao Meta chọn cách này [L3 mục 7].** Bốn lý do paper nêu: (1) phát triển phần nhìn và phần ngôn ngữ **song song**; (2) tránh rắc rối của huấn luyện chung (tokenize dữ liệu hình, độ khó "perplexity" khác nhau giữa các modality, tranh chấp giữa các modality); (3) **khả năng chỉ-chữ không bị ảnh hưởng** vì LLM đóng băng; (4) không phải cho ảnh độ phân giải đầy đủ chạy qua các FFN của LLM nên suy luận hiệu quả hơn. Đây là so sánh trực tiếp với cách nối chuỗi của LLaVA, rất hợp để làm bảng.
- **Fusion sớm: Chameleon [CHAM].** Ảnh được **lượng tử hóa thành token rời rạc**: ảnh $512\times512$ thành 1024 token lấy từ sổ mã (codebook) 8192 mục, cùng một Transformer xử lý token chữ và token ảnh trong **một từ vựng chung** (65 536 mục, gồm 8192 token ảnh), huấn luyện từ đầu với mục tiêu dự đoán token kế tiếp. Nhờ vậy sinh được cả ảnh và chữ, xen kẽ tùy ý. Cái giá theo tác giả: huấn luyện ổn định khó (paper dành nhiều chỗ cho việc này); tác giả thừa nhận bộ tokenizer yếu ở ảnh chứa nhiều chữ (OCR). Tương phản với fusion muộn: mỗi modality có bộ mã hóa riêng (ViT/CLIP) và chỉ gặp nhau ở projector hoặc cross-attention.
- **Số token ảnh là chi phí thật.** LLaVA kiểu nối chuỗi: mỗi ảnh chiếm $N$ vị trí trong ngữ cảnh, và chi phí attention tăng theo $N^2$ (nối `build-first-llm`). Tăng độ phân giải hay giảm cỡ patch làm $N$ tăng theo bình phương. Cross-attention (Llama 3.2) không chiếm chỗ trong chuỗi chữ. Chameleon: 1024 token mỗi ảnh $512\times512$.

## Công thức quan trọng

Ký hiệu theo site và quyết định 60: độ dài chuỗi $L$, số chiều mỗi đầu attention $d$, ma trận chữ hoa đậm. Ảnh có chiều cao $H$, chiều rộng $W$, số kênh $C$ (ký hiệu $C$ theo [VIT]); cỡ patch $P$; số patch $N$; chiều của token ảnh trước và sau projector $D_v$ và $D$ (như bài).

**Số patch** [VIT mục 3.1]:

$$N=\frac{H}{P}\cdot\frac{W}{P}=\frac{HW}{P^2}$$

($H$ và $W$ chia hết cho $P$; nếu không thì phải cắt hoặc đệm.) $N$ cũng là độ dài chuỗi mà Transformer của ViT nhận (chưa tính token lớp).

**Patch embedding** (trải phẳng, rồi một phép chiếu tuyến tính chung cho mọi patch):

$$\mathbf{x}_p\in\mathbb{R}^{P^2C},\qquad \mathbf{z}_i=\mathbf{x}_{p,i}\,\mathbf{E},\quad \mathbf{E}\in\mathbb{R}^{(P^2C)\times D}$$

Giải thích bằng lời: mỗi patch có $P^2C$ số; $\mathbf{E}$ biến chúng thành vectơ $D$ chiều. Cùng một $\mathbf{E}$ dùng cho mọi vị trí, giống như bảng embedding từ dùng chung cho mọi vị trí của câu. Kèm embedding vị trí để biết patch nằm ở đâu.

**Projector (LLaVA)** [LLAVA] pt. (1), dạng tuyến tính; [LLAVA15] thay bằng MLP hai lớp. Ký hiệu như bài: đặc trưng ảnh $D_v$ chiều, embedding của LLM $D$ chiều. Viết theo hàng vectơ cho khớp với code: $\mathbf{H}_v=\mathbf{Z}_v\mathbf{W}$, $\mathbf{W}\in\mathbb{R}^{D_v\times D}$ (paper viết $\mathbf{H}_v=\mathbf{W}\mathbf{Z}_v$ theo cột, cùng ý). Dạng MLP:

$$\mathbf{H}_v=\mathrm{GELU}(\mathbf{Z}_v\mathbf{W}_1+\mathbf{b}_1)\,\mathbf{W}_2+\mathbf{b}_2$$

([LLAVA15] chỉ nói "MLP hai lớp"; code chính thức của LLaVA dùng `mlp2x_gelu`, tức Linear → GELU → Linear, trong `llava/model/multimodal_projector/builder.py`. Code của bài dùng đúng cấu trúc này.) Chuỗi đưa vào LLM: $[\mathbf{H}_v;\ \mathbf{E}_{\text{text}}]$ có độ dài $L=N+L_{\text{text}}$ (số hàng: $N$ token ảnh và $L_{\text{text}}$ token chữ).

**CLIP, hàm mất mát đối xứng** [CLIP, giả mã]. $\mathbf{I}_e,\mathbf{T}_e\in\mathbb{R}^{N_b\times d_e}$ là embedding đã chuẩn hóa của $N_b$ ảnh và $N_b$ chú thích (dùng $N_b$ cho cỡ lô, để $N$ cho số patch):

$$\mathbf{S}=e^{t}\,\mathbf{I}_e\mathbf{T}_e^{\top},\qquad \mathcal{L}=\tfrac12\Big(\mathrm{CE}(\mathbf{S},\text{nhãn }i)+\mathrm{CE}(\mathbf{S}^{\top},\text{nhãn }i)\Big)$$

Ma trận $\mathbf{S}$ cỡ $N_b\times N_b$ gồm độ giống cosine nhân hệ số $e^t$ ($t$ học được); đáp án đúng là đường chéo (ảnh $i$ khớp chú thích $i$). Một CE xét theo hàng ("trong các chú thích, cái nào của ảnh này?"), một theo cột ("trong các ảnh, cái nào của chú thích này?"). Nên cho một ví dụ số $N_b=3$ nếu cần.

**Bảng số patch (tự tính từ $N=(H/P)(W/P)$, đã chạy bằng Pyodide)**

| Ảnh $H\times W$ | $P$ | $N$ | Ghi chú |
|---|---|---|---|
| $224\times224$ | 16 | 196 | ViT-B/16 kiểu "16×16 words" (tên bài [VIT]; con số 196 là tự tính) |
| $224\times224$ | 14 | 256 | Khớp [L3]: $16\times16=256$ patch, patch $14\times14$ |
| $336\times336$ | 14 | 576 | CLIP-ViT-L-336px của LLaVA-1.5 (tự tính) |
| $448\times448$ | 14 | 1024 | Tự tính, cùng số token với ảnh $512\times512$ của Chameleon |
| $512\times512$ | 16 | 1024 | Chameleon: 1024 token mỗi ảnh $512\times512$ [CHAM] (tokenizer VQ, **không** phải patch ViT; trùng số, khác cơ chế) |

Chú ý: ở dòng $512\times512$ chỉ đúng khi nói "cùng số 1024"; hệ số thu nhỏ 16 của tokenizer Chameleon là suy ra, [CHAM] đoạn đã đọc không ghi.

## Số tự chạy (ngày 24/10/2026)

### Ô `PythonRunner` đề xuất (NumPy, cắt patch + chiếu tuyến tính, đếm token)

Chạy bằng **Pyodide thật** (`runpyo.mjs`, NumPy trong Pyodide), tức thì, 25 dòng. Ý: ảnh ngẫu nhiên $32\times32\times3$ (`default_rng(0)`), $P=8$, $D=64$; cắt bằng `reshape(H//P, P, W//P, P, C).transpose(0, 2, 1, 3, 4).reshape(-1, P*P*C)`; $\mathbf{E}$ cỡ $192\times64$ lấy từ `rng.normal(0, 0.02, ...)`. Kết quả thật:

```
patches: (16, 192) expected: 16
first patch = top-left block: True
tokens: (16, 64)
224x224, P=16: 196 tokens
224x224, P=14: 256 tokens
336x336, P=14: 576 tokens
512x512, P=16: 1024 tokens
448x448, P=14: 1024 tokens
halve P on 32x32: 64 tokens, 4x more
```

Đọc: số patch khớp công thức $(32/8)^2=16$; patch đầu bằng khối góc trên-trái; mỗi token là một vectơ 64 chiều; **giảm nửa cỡ patch thì số token gấp 4**. Không có số ngẫu nhiên nào được in nên bài không phụ thuộc phiên bản NumPy. `lesson-writer` chép vào `src/code/llm/multimodal/` rồi chạy lại. Bản đã chạy: `scratchpad/mmcode/patch_np.py` (đường dẫn đầy đủ ở cuối file).

### Ô `LocalCode` đề xuất (PyTorch: patch embedding + projector)

`.venv-llm`: Python 3.14.5, torch 2.14.1+cpu; `torch.manual_seed(0)`; khoảng 8 giây (phần lớn nạp torch); 30 dòng. Làm ba việc: (1) patch embedding bằng `nn.Conv2d(kernel_size=P, stride=P)` trên ảnh $224\times224$ với $P=14$, chiều $d_{vis}=64$ (chiều nhỏ để chạy CPU); (2) kiểm **conv tương đương cắt patch (`nn.functional.unfold`) + nhân ma trận**; (3) projector `Linear -> GELU -> Linear` ($64\to128\to128$) rồi nối với embedding 10 token chữ. Kết quả thật:

```
patch tokens: (2, 256, 64) N = 256
conv == unfold+linear: True
sequence for the LLM: (2, 266, 128)
projector params: 24832
```

Tự kiểm: $64\cdot128+128+128\cdot128+128=24\,832$. Đọc: 256 token ảnh + 10 token chữ = chuỗi 266 cho LLM. Ý để bài nêu: chiều ẩn nhỏ cho chạy nhanh, LLM thật có chiều hàng nghìn và projector chỉ là phần rất nhỏ so với LLM. Không dùng tên model hay tải trọng số, không cần mạng. Bản đã chạy: `scratchpad/mmcode/patch_torch.py`. Chưa chạy `.en.py` (bài chỉ bản vi). Không có gói mới cho `scripts/requirements-llm.txt` (chỉ `torch`).

## Ví dụ hoặc trực giác hay

Diễn đạt lại bằng lời của mình; "(gợi ý)" là của `summarizer`.

- **Ảnh như bức tranh ghép (gợi ý).** Cắt một bức ảnh thành lưới ô vuông, mỗi ô thành một "từ". Câu văn của ảnh là dãy ô đọc từ trái sang phải, trên xuống dưới. Từ đó, Transformer xử lý ảnh y như xử lý câu. Ô NumPy cho người đọc tự đếm.
- **Projector như phiên dịch viên (gợi ý).** Bộ mã hóa ảnh "nói" một thứ tiếng (vectơ $D_v$ chiều), LLM "nghe" thứ tiếng khác ($D$ chiều, nghĩa của embedding từ). Projector nhỏ, học nhanh, là người phiên dịch. Giai đoạn 1 của LLaVA chính là huấn luyện người phiên dịch này, hai bên không đổi: nên "hai giai đoạn" dễ hiểu.
- **CLIP như trò ghép thẻ (gợi ý).** Trộn một chồng ảnh và một chồng chú thích; nhiệm vụ là ghép đúng từng cặp. Làm đủ nhiều lần thì ảnh và câu mô tả "sống" ở cùng chỗ trong không gian vectơ. Vì sao là bước đầu tốt cho LLM: đặc trưng ảnh đã mang nghĩa gần với chữ.
- **Hai cách đưa ảnh cho người đọc (gợi ý, nối với `MultimodalFigure`).** Cách nối chuỗi (LLaVA, Chameleon): dán ảnh vào cuốn sách cùng các trang chữ, người đọc đọc tuần tự và ảnh chiếm trang. Cách cross-attention (Llama 3.2): đặt ảnh ở bàn bên cạnh, mỗi vài đoạn người đọc liếc sang nhìn. Cuốn sách không dày thêm; nhưng cần thêm "mắt" (lớp cross-attention) để liếc. Hình có thể có hai nửa: nửa trên token ảnh nằm trong chuỗi, nửa dưới mũi tên cross-attention. Quyết định hình đầy đủ ở `architect`/`viz-builder`; mục 2.9 chỉ yêu cầu hình ảnh qua bộ mã hóa và projector thành token nằm chung chuỗi.
- **Số token là tiền (gợi ý).** Đổi ảnh $224\to448$ (cùng $P=14$): $N$ từ 256 lên 1024, gấp 4; attention trên chuỗi dài gấp 4 thì chi phí tính gấp khoảng 16 (tự suy, chỉ cho phần ảnh; LLM đọc cả chữ). Nối với KV cache ở `llama-family`.
- **Cái giá của "đóng băng LLM" (gợi ý).** [L3] nói rõ lợi: khả năng chỉ-chữ giữ nguyên. Cái giá: phải thêm khoảng 100B tham số cross-attention ở 405B, bản phát hành chỉ có 11B và 90B và hỗ trợ ảnh chỉ bằng tiếng Anh [L32].

## Điểm dễ hiểu nhầm

Dùng cho mục "Lỗi hay gặp".

1. **Nghĩ LLM "nhìn" ảnh như người.** LLM nhận một dãy vectơ do bộ mã hóa ảnh tạo; bộ mã hóa ảnh quyết định thông tin còn lại. [L3] nói bộ mã hóa huấn luyện kiểu đối chiếu (CLIP) **không giữ tốt thông tin vị trí chi tiết**, nên phải lấy thêm đặc trưng nhiều tầng; [CHAM] nói tokenizer yếu với ảnh nhiều chữ. Không nói mô hình "hiểu" ảnh một cách tuyệt đối.
2. **Nhầm CLIP với mô hình sinh.** CLIP chỉ học **ghép ảnh với chữ**, không sinh chữ hay ảnh. Cần projector và LLM để có câu trả lời.
3. **Nhầm patch với điểm ảnh.** Một patch là cả ô $P\times P$ điểm ảnh, trải phẳng thành $P^2C$ số. Token ảnh không phải một pixel.
4. **Nhầm "cỡ patch" với "số patch".** $P$ nhỏ thì $N$ **lớn** (gấp 4 khi $P$ giảm nửa).
5. **Nghĩ projector "dịch" ảnh ra chữ.** Projector chỉ đổi **chiều và không gian** của vectơ; không ra từ nào. Token ảnh không phải một từ trong từ vựng (trừ Chameleon, token ảnh lấy từ sổ mã rời rạc, vẫn không phải chữ).
6. **Nghĩ mọi mô hình đa phương thức đều "nối token ảnh vào chuỗi".** Llama 3.2 Vision dùng cross-attention, ảnh không nằm trong chuỗi chữ [L3, L32].
7. **Nghĩ Llama 3.2 Vision là một Llama mới huấn luyện lại.** Theo [L32] nó dựng trên Llama 3.1 chỉ-chữ; bộ adapter ảnh huấn luyện riêng [L3 mục 7: LLM không cập nhật khi huấn luyện adapter; chú ý đây là mô tả của bản thí nghiệm]. Bản phát hành có thể khác chi tiết (xem "Chưa xác minh").
8. **Nghĩ Llama 3.2 Vision nhận ảnh đa ngôn ngữ.** Model card ghi ảnh + chữ chỉ hỗ trợ **tiếng Anh** [L32]; chữ thuần có tám ngôn ngữ. Bài tiếng Việt nên nói điều này, người đọc Việt hay hỏi.
9. **Nhầm Llama 3 (paper) với Llama 3.2.** Paper [L3] báo cáo thí nghiệm "chưa sẵn sàng phát hành"; Llama 3.2 phát hành sau (25/9/2024) [L32]. Nhắc nguồn đúng cho từng ý.
10. **Nghĩ LLaVA tinh chỉnh bộ mã hóa ảnh.** [LLAVA]: bộ mã hóa ảnh **luôn đóng băng**; giai đoạn 1 chỉ $\mathbf{W}$, giai đoạn 2 thêm LLM. (Ngược lại, adapter Llama 3 cập nhật bộ mã hóa ảnh và không cập nhật LLM [L3].) Đây là cặp đối lập dễ lẫn, nên có trong bảng so sánh.
11. **Nghĩ dữ liệu của LLaVA là do người gán nhãn.** Dữ liệu hội thoại 158K do GPT-4 (chỉ nhận chữ, từ chú thích ảnh) sinh ra [LLAVA]: có thể mang lỗi của chú thích gốc và của GPT-4.
12. **Nghĩ ảnh càng to càng tốt.** Số token tăng theo bình phương, chi phí tăng theo; [LLAVA15] phải tăng độ phân giải có kiểm soát (336px là mức tối đa của CLIP khi đó).
13. **Trộn $N$ (số patch) với $N_b$ (cỡ lô CLIP) và với $T$.** $T$ trong phần LLM là nhiệt độ. Bài dùng $N$ cho số patch, $L$ cho độ dài chuỗi, $N_b$ nếu cần cỡ lô.

## Điểm cần phiên chính chốt (câu hỏi cho người dùng)

1. **Có đưa Chameleon (fusion sớm, token rời rạc) vào bảng so sánh và hình hay chỉ nhắc một đoạn?** Đề xuất: chỉ một đoạn lời và một dòng trong bảng ba cách (LLaVA nối chuỗi, Llama 3.2 cross-attention, Chameleon token chung). Hình `MultimodalFigure` vẽ cách nối chuỗi như mục 2.9.
2. **`MultimodalFigure` có thêm nửa cross-attention không?** Đề xuất: không, hình giữ một ý (ảnh thành token nằm chung chuỗi); cross-attention bằng bảng và lời.
3. **Bài `cv/llava` chưa có: bài có link tới nó không?** Theo quy tắc mục 4.13 (link chỉ tới bài đã xuất bản) thì chỉ ghi tên, không link. Đề xuất: ghi tên.
4. **Kích hoạt trong projector (GELU) là gợi ý của code, [LLAVA15] chưa tra hàm kích hoạt:** giữ GELU và ghi "một lựa chọn phổ biến"? Đề xuất giữ.

## Liên quan tới bài nào

- **Cần biết trước:** `llm/llama-family` (Llama làm LLM nền, GQA, RoPE) và `cv/llava` (chưa xuất bản, nên "Nhắc nhanh" dài một đoạn). Gián tiếp `cv/vision-transformer`, `cv/clip-blip-glip`, `dl/transformers` (self-attention, cross-attention), `nlp/word-embeddings` (embedding và độ giống cosine).
- **Trước:** `llm/llama-family`, `llm/deepseek-family` (cùng đợt 6 theo `llm-lessons.md`; không phụ thuộc nhau).
- **Sau:** `llm/llm-deployment` (số token ảnh và KV cache là chi phí khi phục vụ mô hình đa phương thức), `llm/image-video-api` (gọi API đưa ảnh vào bằng `image_url`, phần "ảnh vào" ở phía nhà cung cấp), `llm/evaluation-peft` (projector và LoRA là phần nhỏ được huấn luyện).

## Thuật ngữ đề xuất

Chỉ đề xuất, chưa sửa `docs/glossary.md`; kiểm xem đã có chưa.

| Tiếng Việt | Tiếng Anh | Cách dùng |
|---|---|---|
| Đa phương thức | Multimodal | Dịch "đa phương thức", giữ "multimodal" khi là tên mô hình |
| Bộ mã hóa ảnh | Vision encoder / image encoder | Dịch |
| Lớp chiếu (projector) | Projector | Gloss lần đầu "lớp chiếu (projector)", sau đó "projector" |
| Ô ảnh (patch) | Patch | Giữ "patch", gloss "ô ảnh" lần đầu |
| Token ảnh | Image token / visual token | Dịch |
| Học đối chiếu | Contrastive learning | Dịch, gloss |
| Zero-shot | Zero-shot | Giữ nguyên |
| Fusion sớm / muộn | Early / late fusion | Giữ "fusion", gloss "trộn sớm / trộn muộn" lần đầu |
| Tinh chỉnh theo hướng dẫn (hình ảnh) | (Visual) instruction tuning | Gloss lần đầu |
| Cross-attention | Cross-attention | Giữ nguyên (đã có ở phần DL) |
| Sổ mã | Codebook | Dịch, gloss (chỉ ở đoạn Chameleon) |

## Đọc thêm đề xuất

Đều đã mở và đọc phần liên quan.

1. **Dosovitskiy và cộng sự (2021)**, [An Image is Worth 16x16 Words, arXiv:2010.11929](https://arxiv.org/abs/2010.11929): mục 3.1 ngắn, có công thức số patch.
2. **Radford và cộng sự (2021)**, [CLIP, arXiv:2103.00020](https://arxiv.org/abs/2103.00020): hình 1 và giả mã mục 2.3 đủ hiểu hàm mất mát.
3. **Liu và cộng sự (2023)**, [Visual Instruction Tuning (LLaVA), arXiv:2304.08485](https://arxiv.org/abs/2304.08485) và [Improved Baselines (LLaVA-1.5), arXiv:2310.03744](https://arxiv.org/abs/2310.03744).
4. **Llama Team (2024)**, [The Llama 3 Herd of Models, arXiv:2407.21783](https://arxiv.org/abs/2407.21783): mục 7 "Vision Experiments".
5. **Meta (2024)**, [Llama 3.2 Vision model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md) và **Chameleon Team (2024)**, [Chameleon, arXiv:2405.09818](https://arxiv.org/abs/2405.09818).

## Kiểm chứng code

Code của bài do `lesson-writer` chạy ngày 24/10/2026, thư mục làm việc ở scratchpad; `content-reviewer` chạy lại cùng ngày (2026-10-24). Lần sửa bài theo review không đổi code. Hai dòng cuối là bản thử của `summarizer`, không phải code trong bài.

| File | Mức | Ngày | Môi trường | Kết quả |
|---|---|---|---|---|
| `patchify.vi.py`, `patchify.en.py` | chạy thật | 2026-10-24 | Pyodide 314.0.7 thật trong Node (`runpyo.mjs`), Python 3.14.2, NumPy 2.4.6 | Ô `PythonRunner`. Hai bản cho output trùng từng byte. `patches: (16, 192)`; patch 0 là ô trên trái, patch 1 là ô kế bên phải (`True`, `True`); `tokens: (16, 64) E params: 12288`; `same token at two places: True`; bảng N: 196 (224, P=16), 784 (224, P=8), 256 (224, P=14), 576 (336, P=14), 1024 (448, P=14). Không in số ngẫu nhiên nào. Khớp lời văn. `ast.parse(..., feature_version=(3, 10))` qua; 36 dòng, dòng dài nhất 77 ký tự. `content-reviewer` chạy lại ngày 2026-10-24: bản vi và en chạy thật trên Pyodide, output khớp lời văn |
| `projector.vi.py`, `projector.en.py` | chạy thật | 2026-10-24 | `.venv-llm`, Python 3.14.5, torch 2.14.1+cpu, `torch.manual_seed(0)`, chạy với `-I` | Ô `LocalCode`, `sampleVaries={false}`. Hai bản và hai lần chạy cho output trùng từng byte (tất định). Khoảng 3 giây khi máy rảnh (lần đầu tới khoảng 50 giây khi máy bận, phần lớn là nạp torch). `image tokens: (2, 256, 64)`; `conv == unfold + matmul: True`; `sequence for the LLM: (2, 266, 128)`; gradient chỉ ở projector; tham số: patch_embed 37696 (0 học), projector 24832 (24832 học), text_embed 128000 (0 học). Kết quả mẫu trong bài chép từ lần này. `ast.parse(..., feature_version=(3, 10))` qua; 43 dòng, dòng dài nhất 79 ký tự. Projector là Linear → GELU → Linear, cùng cấu trúc `mlp2x_gelu` của code chính thức LLaVA. `content-reviewer` chạy lại ngày 2026-10-24: bản vi và en chạy thật với torch, output trùng từng byte |
| (thử nghiệm) `scratchpad/mmcode/patch_np.py` | chạy thật | 2026-10-24 | Pyodide thật qua `runpyo.mjs` (NumPy của Pyodide) | Chạy tức thì; 16 patch, tokens `(16, 64)`; bảng số patch như trên |
| (thử nghiệm) `scratchpad/mmcode/patch_torch.py` | chạy thật | 2026-10-24 | `.venv-llm`: Python 3.14.5, torch 2.14.1+cpu, chạy với `-I` | Khoảng 8 giây; `(2, 256, 64)`; conv bằng unfold+linear `True`; chuỗi `(2, 266, 128)`; 24 832 tham số |

Đường dẫn đầy đủ: `C:\Users\Dell\AppData\Local\Temp\claude\C--Users-Dell--claude-spares-spare-oouS1w\79a7891d-1d77-4416-b0df-a18c7072fd07\scratchpad\mmcode\`. PDF và bản chữ trích ở `...\scratchpad\mm\`. Thư mục này nằm ngoài dự án và có thể bị xóa; `lesson-writer` viết lại mã vào `src/code/llm/multimodal/` và chạy lại trước khi đưa số vào bài.
