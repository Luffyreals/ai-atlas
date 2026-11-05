# Các quyết định đã chốt

> (Trước đây là `docs/mvp.md` mục 7. Tách ra ngày 24/10/2026, quyết định 58. Số, ngày và nội dung giữ nguyên.) Spec bản MVP: [mvp.md](mvp.md). Việc còn mở ghi ở cuối mục 7 của mvp.md.

Đã quyết ngày 22/10/2026:

1. **Gốc repo git:** đã chuyển `.git` vào `ai-atlas/`.
2. **Giấy phép:** nội dung **CC BY-NC-SA 4.0**, code **MIT**. Xem [LICENSE](../LICENSE) và [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
3. **Tên miền:** chưa chọn, quyết trước M4. MVP chạy trên `ai-atlas.pages.dev`.
4. **Bài chưa viết:** không tạo trang trống. Lộ trình hiện đủ 78 bài, bài chưa viết chỉ có nhãn "Sắp có".
5. **Lộ trình:** chốt bảng slug ở [roadmap-data.md](architecture/roadmap-data.md) mục 5. Giữ bài `python/colab-kaggle` ở dạng bài giới thiệu công cụ. Sidebar dùng `shortTitle` khi tiêu đề dài.
6. **Cách viết bài:** link nội bộ viết tuyệt đối (`/vi/...`, `/en/...`). Comment trong code ví dụ viết theo ngôn ngữ của bài (`<tên>.vi.py`, `<tên>.en.py`). Quiz đặt trong frontmatter. Mỗi ô code chạy độc lập.
7. **Trang gốc `/`:** luôn chuyển sang `/vi/`.

Đã quyết ngày 23/10/2026 (mốc M1):

8. **Duyệt giao diện component:** duyệt trên trang demo `/vi/dev/components/` sau khi developer làm xong, không duyệt bản mô tả trước.
9. **E2E tải Pyodide thật (`@network`):** tách thành script `test:e2e:network`, chạy tay khi cần, không chạy trong CI. Test "mở trang không tải Pyodide" vẫn chạy trong CI.
10. **Code chạy lâu:** không tự ngắt. Có nút Dừng, và sau khoảng 10 giây thì hiện gợi ý bấm Dừng.
11. **Trang demo `/dev/components/`:** giữ trên bản deploy để thử trên điện thoại thật, giữ `noindex` và lọc khỏi `sitemap.xml`.
12. **Tên truy cập của công thức trong quiz:** tự sinh `aria-label` từ chữ thường cộng mã TeX. Tác giả không phải viết lời đọc.
13. **CSS của component bài học:** gộp vào `customCss` của Starlight. Mọi trang thêm khoảng 2,3 KB gzip, nhưng bài học không còn file CSS chặn render riêng.
14. **Mốc Lighthouse trang chủ:** tiêu chí M1 đổi thành "không thấp hơn bản trước M1, đo cùng lúc trên cùng máy". Mốc 91 cũ không tái hiện được (bản trước M1 đo lại ngày 23/10/2026 ra 74–79). Việc cải thiện LCP ảnh hero để lại cho M4.
15. **Lỗi Python với trình đọc màn hình:** vùng trạng thái có thêm một dòng ẩn (`sr-only`) báo code có lỗi. Giao diện nhìn thấy không đổi.
16. **Điểm dừng Tab thừa khi radio có focus trước lúc quiz hydrate:** sửa ngay ở M1.
17. **Performance trang demo 87–90:** chấp nhận cho M1. Phần còn lại do CSS chung (Starlight, KaTeX, font), không do component M1. Tối ưu ở M4 cùng với LCP trang chủ, đo trên bài học thật.

Đã quyết ngày 23/10/2026 (mốc M2, bài mẫu Hồi quy tuyến tính):

18. **Mức toán:** dẫn đầy đủ trường hợp một đặc trưng (đạo hàm riêng theo $w$, $b$, từng bước). Dạng ma trận chỉ nêu phương trình chuẩn $\mathbf{X}^\top\mathbf{X}\boldsymbol{\theta} = \mathbf{X}^\top\mathbf{y}$ và giải thích bằng lời, không chứng minh đạo hàm ma trận.
19. **Dữ liệu ví dụ:** bảng nhỏ tự tạo, 8–12 căn hộ, diện tích (m²) → giá thuê (triệu đồng/tháng). Dùng chung một bảng cho phần Trực giác, minh họa và code.
20. **Minh họa:** một VIZ tương tác `LinearFitViz`. Hai thanh trượt $w$ và $b$ vẽ lại đường thẳng, các đoạn phần dư và số MSE. Có nút "Hiện đường tốt nhất".
21. **Độ dài bài mẫu:** vừa. Khoảng 10–12 phút đọc, 3 ô code (phương trình chuẩn bằng NumPy, scikit-learn, điểm ngoại lai), 4 câu quiz.
22. **Dấu thập phân trong bài tiếng Việt:** số kỹ thuật dùng dấu chấm. Gồm bảng dữ liệu, VIZ, code, và lời văn khi nhắc lại các số đó (ví dụ $w \approx 0.21$), để khớp output Python. Số đời thường trong lời văn viết bình thường. Áp dụng cho mọi bài.
23. **Độ dài bài Hồi quy tuyến tính sau review:** cắt khoảng 600–700 từ mà không bỏ ý nào, đưa từ khoảng 14–16 phút đọc về khoảng 12–13 phút. Gộp đoạn "nghiệm không duy nhất" với hộp "Lỗi hay gặp" thứ ba; rút gọn đoạn số điều kiện, mục Giới hạn và phần giải thích của quiz.
24. **`LinearFitViz` đánh dấu điểm trung bình $(\bar{x}, \bar{y})$**, và hạ `b.min` xuống khoảng −10.5. Mục đích: người đọc giữ được đường thẳng đi qua điểm trung bình khi tăng $w$, khớp với kết quả $b = \bar{y} - w\bar{x}$.
25. **Tên truy cập cho công thức riêng dòng:** một bước rehype lúc build gắn `role="group"` và `aria-label` (chữ "Công thức" / "Formula" cộng mã TeX) cho mọi `.katex-display`. Không thêm JS. Áp dụng cho mọi bài.
26. **Nút "Bắt đầu học" ở hero trang chủ:** làm ngay ở M2, dẫn tới bài đã mở. Chữ "Hồi quy tuyến tính" trong thư ngỏ cũng thành link.
27. **Ngân sách `viz.css`:** giữ ngưỡng 2,5 KB gzip, nhưng đo sau khi bỏ comment.
28. **Độ dài bài Hồi quy tuyến tính:** giữ nguyên sau lượt cắt. Thân bài khoảng 12.7 phút đọc, tính cả quiz khoảng 14.3 phút.
29. **Performance của bài học thấp hơn trang demo (87 so với 90, Lighthouse mobile):** chấp nhận cho M2. Nguyên nhân là DOM do KaTeX sinh ra (64% HTML của bài), không phải VIZ: bỏ VIZ vẫn 86. Ở M4 thử KaTeX `output: 'mathml'`, đo được 89 và DOM giảm từ 11 869 còn 5 259 phần tử. Trước khi đổi phải kiểm tra hiển thị trên Chrome, Firefox và Safari.
30. **Trang fallback (bài chưa dịch, hiện bản vi trên URL `/en/`):** loại khỏi sitemap, thêm `noindex`, bỏ `hreflang="en"` cho tới khi bài có bản en. Người đọc vẫn mở được trang. Áp dụng cho mọi bài.
31. **Mục "Đọc thêm":** gắn link vào tên tài liệu, không dùng chữ "Link" hay "PDF" làm chữ của link.
32. **Bản vi bài Hồi quy tuyến tính đã được người dùng duyệt (23/10/2026), không cần sửa.** Bài thành bài mẫu. Template cập nhật theo bài này trước khi dịch sang en.

Đã quyết ngày 23/10/2026 (đánh giá cuối M2):

33. **Trang fallback ra khỏi tìm kiếm Pagefind:** trang fallback có `pagefind: false` (route middleware `src/routeData.ts`), để chữ tiếng Việt không lọt vào chỉ mục tìm kiếm tiếng Anh. Bổ sung cho quyết định 30.
34. **Mọi trang không phải bài học phải có đủ bản vi và en**, kiểm bằng test trong `roadmap-files.test.ts`. Nhờ vậy `src/lib/seo.ts` chỉ cần xét bài học khi quyết định trang nào chưa dịch.
35. **Sửa nhỏ bài Hồi quy tuyến tính sau review vi/en:** "cùng dự đoán **trên tập huấn luyện**" khi $\mathbf{X}^\top\mathbf{X}$ suy biến; `LinearRegression` "cũng giải trực tiếp trên $\mathbf{X}$" thay vì "như `np.linalg.lstsq`"; ghi tiếng Anh lần đầu cho "tham số", "độ lệch", "nghiệm có độ dài nhỏ nhất"; thêm 3 thuật ngữ vào glossary.

Đã quyết ngày 23/10/2026 (mốc M3):

36. **Nhịp làm:** từng bài theo thứ tự lộ trình, bắt đầu từ Tổng quan Học máy. Xong bản vi thì dừng chờ người dùng duyệt, rồi mới dịch sang en.
37. **Minh họa:** VIZ tương tác cho 3 bài, tái dùng kit VIZ có sẵn. Overfitting: thanh trượt bậc đa thức, sai số train/test. Regularization: thanh trượt λ, hệ số co lại. Gradient Descent: chạy từng bước, đổi tốc độ học. Bài Tổng quan Học máy chỉ dùng hình SVG tĩnh.
38. **Dữ liệu ví dụ:** dùng lại bảng 10 căn hộ khi hợp (Gradient Descent giải lại đúng bài toán của Hồi quy tuyến tính). Overfitting và Regularization dùng dữ liệu nhỏ tự sinh, có seed, đặt trong `src/data/datasets/`.
39. **Test cho bài mới:** gọn hơn M2. Dựa vào test chung cho mọi bài (`lessons.spec.ts`, `lesson-pairs.test.ts`, `viz.spec.ts`), cộng unit test cho toán của từng VIZ. Không viết spec e2e riêng cho từng bài, không so tọa độ hay chuỗi chính xác.
40. **Bài Tổng quan Học máy (`ml/ml-overview`):**
    - **Phạm vi:** nêu ba nhóm có giám sát, không giám sát và tăng cường. Trọng tâm là học có giám sát (hồi quy, phân loại), quy trình dữ liệu → huấn luyện → đánh giá, tách train/test, khái niệm tổng quát hóa, trỏ tới bài Overfitting.
    - **Toán:** chỉ giới thiệu ký hiệu chung ($\mathbf{x}$, $y$, $\hat{y} = f(\mathbf{x})$, $m$, $n$, $\mathcal{L}$), không dẫn công thức.
    - **Code và quiz:** 2 ô code trên bảng căn hộ (`fit`/`predict` dạng hộp đen, `train_test_split`). Khoảng 8–10 phút đọc, 4 câu quiz.
    - **Hình:** 2 hình SVG tĩnh, gồm sơ đồ các nhóm học máy và sơ đồ quy trình.
41. ~~**Thư ngỏ trang chủ:** giữ nguyên tới khi bài Tổng quan có bản en.~~ Thay bằng quyết định 43.
42. **Tự chọn khi làm bài Tổng quan** (đổi lại được khi người dùng duyệt):
    - Ô code 2 dùng `random_state` 4, 8, 2 thay cho 0, 1, 2. Lý do: ở seed 0 và 1, KNN với k = 1 gặp hai láng giềng cách đều, nên kết quả tùy vào cách scikit-learn phá hòa.
    - `MlWorkflowFigure` chỉ có bố cục hẹp. Bố cục rộng vượt ngân sách 10 000 ký tự.
    - Đoạn mô tả `sr-only` của hình có `aria-hidden="true"`, để trình đọc màn hình chỉ đọc một lần qua `aria-describedby`.

Đã quyết ngày 23/10/2026 (sau khi duyệt bản vi bài Tổng quan):

43. **Bản tiếng Anh của các bài M3 làm sau MVP.** MVP gồm 5 bài tiếng Việt; chỉ bài mẫu Hồi quy tuyến tính có bản en. Bản vi bài Tổng quan Học máy đã được người dùng duyệt, bước tiếp là bài Overfitting và Underfitting. Hệ quả:
    - Trang `/en/` của bài chưa dịch là trang fallback: `noindex`, không vào sitemap, không vào tìm kiếm (quyết định 30, 33).
    - Nút "Bắt đầu học" theo từng ngôn ngữ: `/vi/` dẫn tới bài đầu tiên có bản vi (Tổng quan), `/en/` dẫn tới bài đầu tiên có bản en (Hồi quy tuyến tính). Xem `getFirstOpenLesson(locale)`.
    - Thư ngỏ: bản vi link tới Tổng quan, bản en giữ Hồi quy tuyến tính.
    - Bước `lesson-translator` và `content-reviewer` (khớp vi/en) của mỗi bài M3 chuyển sang sau MVP.
44. **Bài Overfitting và Underfitting (`ml/overfitting-underfitting`):**
    - **Phạm vi:** hai hiện tượng qua hồi quy đa thức, đường cong sai số train/test theo bậc, bias–variance ở mức trực giác, tập kiểm định và kiểm định chéo ở mức giới thiệu. Regularization chỉ nhắc tên, để dành cho bài sau.
    - **Toán:** viết mô hình đa thức $\hat{y} = w_1x + w_2x^2 + \dots + w_dx^d + b$ và MSE, giải thích vì sao nó vẫn tuyến tính theo tham số. Không dẫn công thức phân rã bias–variance.
    - **Dữ liệu:** đường cong sin cộng nhiễu, khoảng 20 điểm, tự sinh có seed, đặt trong `src/data/datasets/`. Dùng chung cho lời văn, VIZ và code; bài Regularization dùng lại.
    - **Độ dài:** khoảng 10–12 phút đọc, 3 ô code (khớp bậc 1, 3, 15 và vẽ; sai số train/test theo bậc; `cross_val_score` để chọn bậc), 4 câu quiz, 1 VIZ thanh trượt bậc (quyết định 37).
45. **Dữ liệu và VIZ bài Overfitting** (thiết kế ở `docs/architecture/viz/poly-fit.md` mục 9):
    - **Dữ liệu:** 24 điểm thay vì khoảng 20, gồm 16 điểm train và 8 điểm test. Bậc 15 có 16 hệ số, nên cần ít nhất 16 điểm train thì mới có nghiệm duy nhất và trình duyệt mới tính ra đúng số của scikit-learn.
    - **Bậc của VIZ:** từ 1 tới 15.
    - **`PolyFitViz`:** có thêm biểu đồ nhỏ "MSE theo bậc" (hình chữ U). Trên điện thoại VIZ cao thêm khoảng 220px.

46. **Bản vi bài Overfitting và Underfitting đã được người dùng duyệt (23/10/2026).** Gồm các lựa chọn tự quyết khi làm bài:
    - quiz câu 2 thu phạm vi về bậc 1–12;
    - chưa gộp phần trùng lặp giữa `PolyFitViz` và `LinearFitViz` (mẫu nét, hàm `axis()`).
47. **Bài Ridge, Lasso, Elastic Net (`ml/regularization`):**
    - **Phạm vi:** Ridge và Lasso đi kỹ: hàm mục tiêu, vì sao hệ số co lại, vì sao L1 cho hệ số đúng bằng 0, chuẩn hóa đặc trưng, chọn λ bằng kiểm định chéo. Elastic Net chỉ một mục ngắn.
    - **Toán:** viết $\mathcal{L} + \lambda\lVert\mathbf{w}\rVert_2^2$ và $\mathcal{L} + \lambda\lVert\mathbf{w}\rVert_1$. Dẫn nghiệm dạng đóng của Ridge từ phương trình chuẩn. Lasso giải thích bằng hình học và ví dụ một biến, không dẫn thuật toán.
    - **Dữ liệu:** dùng lại bộ `sine`, với đa thức bậc 15.
    - **VIZ:** thanh trượt λ. Hiện đường bậc 15, MSE train/test và cột 15 hệ số; có nút chuyển Ridge/Lasso. Phần Lasso tính sẵn bằng Python lúc viết bài.
    - **Độ dài:** khoảng 10–12 phút đọc, 4 câu quiz, 3 ô code: Ridge với vài giá trị λ; Lasso và số hệ số bằng 0; chọn λ bằng kiểm định chéo, có Elastic Net.
48. **VIZ bài Regularization** (thiết kế ở `docs/architecture/viz/regularization.md` mục 10):
    - **Thanh trượt λ:** 17 mức, gồm 0 và 10⁻¹⁴ … 10, mỗi nấc một bậc mười.
    - **Chuyển Ridge/Lasso:** hai nút có `aria-pressed`.
    - **Biểu đồ cột hệ số:** thang tuyến tính [−10, 10]. Cột vượt khung có tam giác ở mép. Hệ số bằng đúng 0 có vòng "0".
    - **Bài phải nói rõ:**
      - Ở λ tốt nhất, Ridge (0.0894) và Lasso (0.0851) vẫn kém việc chọn thẳng bậc 3 (0.0754).
      - Kiểm định chéo chọn λ = 0.1 cho Ridge, khác mức tốt nhất trên tập test. Lý do: đa thức bậc 15 phải ngoại suy tới các điểm mép bị giữ lại.
49. **Hình L1/L2 của bài Regularization** (người dùng đồng ý thêm hình; thiết kế ở `docs/architecture/viz/static-plots.md` mục 11): mở rộng kit hình tĩnh để vẽ được đồ thị tĩnh. Hai ô cạnh nhau dùng **chung một hàm mất mát**, để thấy chỉ có vùng ràng buộc khác nhau. Điểm chạm của Ridge chỉ lệch trục 24°. Phiên chính tự chọn cách này, đổi được khi người dùng duyệt.
50. **Sau review RegularizationViz:**
    - Nút Ridge/Lasso đang chọn dùng nền accent, chữ đậm màu.
    - Gộp ngay phần lặp giữa ba VIZ vào kit: `Swatch`, `DotSwatch`, hàm dựng trục `axis()`. Mục đích là để VIZ của bài Gradient Descent dùng luôn.

51. **Bản vi bài Ridge, Lasso, Elastic Net đã được người dùng duyệt (24/10/2026).** Duyệt cùng các lựa chọn phiên chính đã tự chọn: hai trục hình L1/L2 ghi ký hiệu $w_1$, $w_2$; `alpha` cố định qua các fold khi kiểm định chéo (có câu giải thích trong bài).

52. **Bài Gradient Descent (`ml/gradient-descent`):**
    - **Phạm vi:** đi kỹ batch GD:
      - quy tắc cập nhật;
      - tốc độ học (chậm, vừa, dao động, phân kỳ);
      - chuẩn hóa đặc trưng;
      - tiêu chí dừng.

      SGD và mini-batch chỉ là một mục ngắn. Momentum và Adam chỉ nhắc tên, để dành cho bài `ml/optimizers`.
    - **Toán:** dùng lại đạo hàm riêng đã dẫn ở bài Hồi quy tuyến tính, viết lại dạng vectơ. Giải thích vì sao đi ngược gradient là đi xuống dốc. Nêu ngưỡng $\eta < 2/L$ qua ví dụ một chiều, không chứng minh tổng quát.
    - **Dữ liệu:** bảng 10 căn hộ, giải lại đúng bài toán của bài Hồi quy tuyến tính (quyết định 38).
    - **VIZ:** đường mức của MSE theo $(w, b)$ trên dữ liệu đã chuẩn hóa, cùng đường đi của GD. Có các nút Bước / Chạy / Đặt lại, và thanh trượt $\eta$ có các mức chậm, vừa, dao động, phân kỳ. Kèm biểu đồ nhỏ MSE theo số bước.
    - **Độ dài:** khoảng 10–12 phút đọc, 4 câu quiz. 3 ô code:
      - GD tự viết bằng NumPy, so với phương trình chuẩn;
      - thử vài giá trị $\eta$, vẽ MSE theo bước, có và không chuẩn hóa;
      - SGD/mini-batch, có `SGDRegressor`.

53. **Phần LLM (24/10/2026):** người dùng chọn viết **cả 23 bài** của phần 5c, **chỉ bản vi** (bản en làm sau, như quyết định 43). Làm song song với bài Gradient Descent (M3), vì bài đó do một phiên khác làm trên worktree riêng.
    - Code gọi API LLM là **code minh họa**, không chạy trên trang (Pyodide không gọi được API và không có PyTorch/GPU). Dùng **SDK OpenAI-compatible** (thư viện `openai`, đổi `base_url` để dùng OpenAI, Gemini, Groq, Ollama...). Không ghi cứng API key trong code: đọc từ biến môi trường.
54. **Khuôn bài LLM (24/10/2026), theo kế hoạch của team-lead:**
    - **Code minh họa:** đặt ở `src/code/llm/<bài>/<tên>.vi.py` (kèm `.en.py`), hiển thị qua một component nhỏ có nhãn "Chạy trên máy bạn" và dòng yêu cầu (gói cần cài, biến môi trường). Code không phải Python (Dockerfile, YAML, shell, Cypher) viết thẳng trong MDX.
    - **Kiểm chứng:** người dùng tự đặt `OPENAI_API_KEY`/`OPENAI_BASE_URL` (gói miễn phí Gemini hoặc Groq) để reviewer chạy thật code gọi API. Code PyTorch chạy ở quy mô nhỏ trong một venv riêng có torch CPU.
    - **VIZ:** chỉ `SamplingViz` (temperature, top-k, top-p; dùng ở `text-api` và `build-first-llm`), cùng 9 hình SVG tĩnh: pipeline RAG, vòng lặp agent, ba bước RLHF, LoRA, MoE, encoder–decoder, multimodal, các kiểu song song, image và container.
    - **Nhịp duyệt:** người dùng duyệt khuôn code trên trang demo, rồi bài `text-api`, rồi bài `build-first-llm`. Sau đó duyệt theo đợt, mỗi đợt tối đa 4 bài.
    - **Phiên chính tự chọn (dễ đổi lại):**
      - Bài `build` có một ô NumPy chạy được trên trang khi phần lõi toán đủ nhỏ.
      - Không chọn nhà cung cấp mặc định: code chỉ đọc biến môi trường; bài `text-api` có bảng nhà cung cấp, ghi "kiểm tra lần cuối 10/2026".
      - Khối "Nhắc nhanh" được nới tới khoảng một đoạn ở `build-first-llm`, `rag-chatbot`, `multimodal`.
      - Bài không có hình vẫn giữ mục Minh họa, dùng bảng, hội thoại mẫu hoặc kết quả mẫu.
      - Video ở bài `image-video-api` chỉ ở mức khái niệm. GCN ở `graph-rag` chỉ nhắc tên. `evaluation-peft` được dài tới khoảng 15 phút.


55. **VIZ bài Gradient Descent** (thiết kế ở `docs/architecture/viz/gradient-descent.md` mục 12; người dùng chốt ngày 24/10/2026; số 53, 54 đã dùng cho phần LLM ở nhánh khác):
    - **Chuẩn hóa:** chỉ chuẩn hóa diện tích, theo min-max: $\tilde{x} = (x - 25)/60$. Giữ $y$ gốc. Đường mức là elip với $\kappa = 15.3$, đủ để thấy chậm, zigzag, dao động và phân kỳ. Z-score làm đường mức thành vòng tròn, GD tới đáy sau 1 bước, nên không dùng.
    - **Biểu đồ MSE theo bước:** trục MSE theo thang log.
    - **Ký hiệu:** tham số trên dữ liệu đã chuẩn hóa viết $\tilde{w}$, $\tilde{b}$. Có công thức đổi về $w$, $b$ gốc.
    - **Bản nháp:** do phiên LLM viết (dùng z-score), sẽ viết lại theo spec mục 12.

56. **Bài Gradient Descent không dừng chờ duyệt bản vi** (người dùng chọn, 24/10/2026). Làm hết quy trình, rồi commit và push thẳng vào PR #1 (nhánh `m3-ml-lessons`). Người dùng duyệt trên PR.

57. **Bản vi bài Gradient Descent đã được người dùng duyệt trên PR #1 (24/10/2026).** M3 xong phần bản vi.

58. **Tái cấu trúc repo (24/10/2026).** Làm phần tài liệu và phần test; chưa đụng code và thư mục gốc. Chỉ dời và tách file, giữ nguyên nội dung. Làm trong worktree, nhánh `m4-restructure`, có PR riêng.
    - `docs/architecture/viz.md` tách thành `docs/architecture/viz/` (giữ số mục cũ); quyết định chuyển từ `docs/mvp.md` mục 7 sang file này.
    - `tests/unit/` chia thành `lib/`, `viz/`, `components/`, `content/`. Hai spec e2e riêng của bài mẫu vào `tests/e2e/sample-lesson/`, không gộp vào spec chung.
    - Bốn cặp test e2e trùng một phần giữa bài mẫu và spec chung được giữ nguyên, vì mỗi bản có phần kiểm thêm.

59. **Hạ tầng bài LLM (24/10/2026), theo `docs/architecture/llm-lessons.md`:**
    - **CI e2e:** làm ngay, trước bài `text-api`. Test không phụ thuộc kích thước màn hình chỉ chạy ở project desktop. Chia 2 shard dùng chung một bản build. Mục tiêu ≤ 12 phút.
    - **Prompt trong code minh họa:** tiếng Việt trong `.vi.py`, tiếng Anh trong `.en.py`. Test `code-pairs` bỏ qua nội dung chuỗi, chỉ áp dụng cho `src/code/llm/`.
    - **API key cho reviewer:** người dùng tự tạo file `.env.llm` ở gốc dự án (đã bị `.gitignore` chặn qua `.env.*`). Agent chỉ nạp biến vào môi trường của từng lệnh, không in nội dung ra.
    - **Kết quả mẫu:** có, dưới code gọi API. Chỉ lấy từ lần chạy thật, kèm ghi chú "mỗi lần chạy một khác".
    - Phần làm trên nhánh `llm-lessons`, worktree `../ai-atlas-llm` (quy tắc mỗi phiên một worktree).
60. **Nhịp làm phần LLM và bài `build-first-llm` (24/10/2026):**
    - Người dùng chọn **chạy hết 23 bài rồi duyệt một lần ở cuối**, thay cho nhịp duyệt ở quyết định 54. Mỗi bài vẫn qua `content-reviewer` và được sửa. Mỗi đợt vẫn qua check/test/build. Có báo cáo cho từng đợt.
    - **Các cấp ứng dụng LLM:** chia 4 cấp, ghi rõ đây là cách chia của bài:
      1. dùng LLM có sẵn qua API;
      2. prompt, RAG, agent trên LLM có sẵn;
      3. fine-tune hoặc huấn luyện tiếp;
      4. pre-train từ đầu.
    - **Dữ liệu:** dùng 24 câu đầu Truyện Kiều. Bigram NumPy chạy trên trang. Code GPT minh họa dùng cùng dữ liệu và cho thấy overfit (loss kiểm tra tăng), để giải thích vì sao LLM cần nhiều dữ liệu.
    - **Ký hiệu:** độ dài chuỗi là $L$, nhiệt độ là $T$, dùng chung cho cả phần LLM. GPT-2 chỉ được nhắc như một sự kiện năm 2019, không tải trọng số.
61. **Các lựa chọn phiên chính tự chốt khi viết phần LLM (24/10/2026).** Đều không chặn việc và dễ đổi lại. Người dùng sẽ duyệt ở lần duyệt cuối.
    - **Kiểm chứng:** ô `PythonRunner` phải chạy bằng Pyodide thật (`node_modules/pyodide` chạy trong Node), không chạy bằng CPython trên Windows. Lý do: zlib-ng của Windows nén ra kết quả khác zlib gốc của Pyodide, nên số liệu lệch.
    - **Code LlamaIndex** chạy thử trong venv riêng có `openai` 2.x, vì `llama-index-llms-openai` đòi `openai<3`. `.venv-llm` vẫn giữ `openai` 3.37.0.
    - **Embedding:** dùng biến `EMBEDDING_MODEL`. Hai biến `EMBEDDING_BASE_URL` và `EMBEDDING_API_KEY` là tùy chọn, dùng khi nhà cung cấp chat không có embeddings.
    - **`text-api`:**
      - bỏ `max_tokens` khỏi code chat;
      - thêm cảnh báo về mô hình suy luận vào bảng nhà cung cấp;
      - thêm cột Embeddings và JSON mode vào bảng;
      - bỏ ô `stream`, thay bằng một đoạn trích;
      - rút gọn phần công thức backoff.
    - **`image-video-api`:** ảnh thử 48×48, nén zlib mức 9. Ảnh ra 118 byte ở cả CPython lẫn Pyodide.
    - **`graph-rag`:** dạy cú pháp Cypher mới `{1,3}`, nhắc cú pháp cũ `*1..3`. Ô chạy trên trang dùng Python thuần (dict và BFS).
    - **`llama-family`:**
      - RoPE ghép hai chiều liền kề như RoFormer;
      - `ParallelismFigure` vẽ 3 kiểu, còn ZeRO và FSDP giải thích bằng bảng;
      - có bảng so sánh Llama 1/2/3;
      - các số tự tính được ghi rõ là "tự tính".
    - **`pretraining-data`:** chỉ nhắc chung chuyện bản quyền; suffix array chỉ một câu; không nói về dữ liệu tiếng Việt.
    - **`gpt-family-finetuning`, `debugging-language-models`:** không cài `transformers`. Chat template và tokenizer chỉ nhắc trong lời văn.
    - **Prompt trong code demo** ở `src/code/dev/local-*`: viết tiếng Anh ở cả hai bản.
    - **Khối "Nhắc nhanh":** bài nào đã có bài cần biết trước được xuất bản thì rút khối này còn 2 câu.

62. **VIZ, hình tĩnh và sửa sau analyst của phần LLM (24/10/2026).** Phiên chính tự chốt; người dùng đồng ý giữ cả. Người dùng tự đọc 23 bài trên `npm run dev` rồi gửi nhận xét, chưa commit cho tới khi người dùng bảo; 5 bài dài hơn mục tiêu để nguyên, xem khi duyệt; CLS do font làm thành việc riêng trên `main`. Chi tiết ở `docs/architecture/llm-lessons.md` mục 2.9.1–2.9.3 và 4.6.8.
    - **`SamplingViz`:** top-p chạy trên phân phối sau top-k đã chuẩn hóa lại (như `transformers`); có nhãn "tắt" khi k = 10 hoặc p = 1; đổi thanh trượt thì xóa cả bộ đếm lẫn token vừa lấy; bấm Đặt lại thì vùng live báo ngay (`resetDone`).
    - **Hình tĩnh:** chỉ bố cục hẹp 360 đơn vị; `graph-rag` dùng lại hình RAG vector kèm câu dẫn; nhãn "phạt KL" trên mũi tên tham chiếu → chính sách; router của `MoeFigure` để kiểu thường; `EncoderDecoderFigure` giữ khoảng trống để K, V đi ngang; khung GPU của `ParallelismFigure` viền thường, all-reduce là đường nối không đầu; `deploy-custom-model` dùng `ContainerImageFigure stack="api"`.
    - **Sửa sau analyst:** ô tiêu đề góc của bảng không để trống (14 bảng, thêm vào template); `LocalCode` báo lỗi khi `command`/`hardware` rỗng và khi code dùng `getenv` hay `from os import environ`; CI giữ artifact `dist` 3 ngày. Để riêng: CLS do nạp font của cả site (`llama-family`, `deepseek-family` 0,106–0,117).

63. **Gọn thư mục gốc repo (24/10/2026).** Người dùng chọn qua câu hỏi. Chỉ dời file và sửa link, giữ nguyên nội dung. Làm ở nhánh `repo-layout`, có PR riêng.
    - `CONTRIBUTING.md`, `SECURITY.md` → `.github/` (GitHub vẫn nhận và hiện ở sidebar).
    - `PLAN.md`, `CHANGELOG.md`, `README.en.md`, `LICENSE-CONTENT.md` → `docs/`. `giáo án ai.md` → `docs/reference/giao-an-ai.md` (tên ASCII).
    - `CLAUDE.md` → `.claude/CLAUDE.md` (Claude Code đọc được ở vị trí này).
    - Giữ ở gốc: `README.md`, `LICENSE`, file cấu hình (`package.json`, `astro.config.ts`, `tsconfig.json`, `playwright.config.ts`, `vitest.config.ts`) để công cụ và IDE tự nhận; `skills-lock.json` và `.agents/` do CLI của skill quản lý.
    - CI e2e chia **3 shard** (trước là 2) và `timeout-minutes: 30` (trước là 20): shard chậm hơn của 2 shard đã chạm giới hạn 20 phút và bị hủy hai lần trên PR #4, không có test nào lỗi.

85. **Hạ tầng phần Thị giác máy tính (5b) (05/11/2026).** Phiên CV tự chốt theo phương án đề xuất (người dùng giao: không hỏi lại). Thiết kế ở `docs/architecture/cv-lessons.md`. Số 64–69 dành cho M4, 70–84 cho phần NLP ở nhánh khác.
    - Viết cả 10 bài, chỉ bản vi, theo đúng khuôn bài LLM (`llm-lessons.md` mục 2.7): mục "Minh họa" không bỏ, mục "Ví dụ code" mở bằng câu phiên bản.
    - Code ở `src/code/cv/<bài>/`; NumPy/SciPy/scikit-learn/matplotlib chạy trên trang bằng `PythonRunner` (kiểm bằng Pyodide 314.0.7 thật trong Node); PyTorch, torchvision, transformers dùng `LocalCode`.
    - Venv `.venv-cv/` trong worktree (không commit), gói ghim ở `scripts/requirements-cv.txt` (torch 2.15.0+cpu, torchvision 0.29.2+cpu, transformers 5.22.1).
86. **Hai VIZ cho phần CV:** `ConvolutionViz` (bài `cnn-image-classification`: kernel $3 \times 3$ trượt trên chữ số $8 \times 8$) và `DiffusionNoiseViz` (bài `diffusion-models`: thanh trượt $t$ của quá trình thêm nhiễu, lịch tuyến tính DDPM). Các bài khác dùng 7 hình tĩnh mới (`cv-lessons.md` mục 4); `llava` dùng lại `MultimodalFigure`; `image-augmentation` dùng ảnh ra của ô `PythonRunner`.
87. **Ảnh trong phần CV:** không ảnh chụp. Dùng mảng NumPy tự tạo, `sklearn.datasets.load_digits` (đi kèm scikit-learn, không tải mạng, chạy được trên Pyodide) hoặc ảnh vẽ bằng PIL. Code của bài không tải bộ dữ liệu lớn (CIFAR, ImageNet, COCO).
88. **Mô hình huấn luyện sẵn trong `LocalCode`:** được tải từ Hugging Face khi tổng dung lượng ≤ 2 GB và chạy được trên CPU; lời văn ghi dung lượng tải. Tên checkpoint được ghi trong code (một tệp trọng số cố định có paper), khác quy tắc "không tên model trong code" của phần LLM (vốn dành cho dịch vụ API). Mô hình lớn hơn (LLaVA 7B, Stable Diffusion) chỉ giải thích bằng lời và hình.
89. **"Nhắc nhanh" của phần CV:** dài tới một đoạn ở `cnn-image-classification`, `vision-transformer`, `vae-gan` (bài nền phần DL/Toán chưa có, nặng kiến thức); 2–3 câu ở `image-augmentation`; 2 câu ở các bài chỉ cần bài `cv/*` (theo quyết định 61).
90. **Ký hiệu phần CV** (`cv-lessons.md` mục 2): ảnh $\mathbf{X} \in \mathbb{R}^{H \times W \times C}$, kernel $\mathbf{K}$ cỡ $k$, stride $s$, padding $p$; patch $P$, số patch $N$, số chiều $D$; diffusion dùng $T$ cho số bước (bài ghi rõ là khác nhiệt độ $T$ của phần LLM); nhiệt độ của CLIP và NT-Xent là $\tau$.
91. **Test mở rộng cho `cv/`:** `python-syntax` quét khối ` ```python ` trong bài `cv/`; mọi `.vi.py` của bài `cv/` đã xuất bản phải có dòng trong mục `## Kiểm chứng code` của `docs/research/<bài>.md`.
