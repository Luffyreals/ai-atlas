# Spec bản MVP của AI Atlas

> Bản MVP (Minimum Viable Product) là phiên bản nhỏ nhất **đáng để công khai**. Nó chứng minh cả quy trình (viết bài → minh họa → dịch → deploy) chạy trơn tru, và người học đã dùng được thật.
>
> Tài liệu này là **spec sản phẩm**: làm gì, cho ai, khi nào là xong. Thiết kế kỹ thuật chi tiết nằm ở [docs/architecture/](architecture/).

## 1. Mục tiêu

Sau MVP, một người mới học AI có thể:

1. Mở trang chủ, **thấy toàn bộ lộ trình** 78 bài và biết nên bắt đầu từ đâu.
2. Đọc **5 bài đầu của phần Machine Learning** bằng tiếng Việt. Bản tiếng Anh làm sau MVP, trừ bài mẫu Hồi quy tuyến tính đã có (quyết định 43).
3. Trong mỗi bài: đọc công thức, tương tác với minh họa, **chạy thử code Python ngay trên trang**, làm quiz.
4. Đánh dấu bài đã học. Quay lại lần sau vẫn thấy tiến độ.

Với người phát triển (bạn), MVP chứng minh rằng:

- Bộ khung đủ tốt để thêm bài mới chỉ bằng cách **thêm một file MDX và một dòng trong `roadmap.ts`**.
- Quy trình agent (writer → reviewer → viz → translator) cho ra bài đạt chất lượng.

## 2. Vì sao chọn 5 bài ML đầu tiên

- **Hồi quy tuyến tính** là bài mẫu trong `PLAN.md`. Nó có đủ mọi thứ một bài cần: trực giác, toán, minh họa, code, quiz.
- 5 bài này nối tiếp nhau thành **một mạch hoàn chỉnh**: học máy là gì → mô hình đầu tiên → vì sao mô hình sai → cách sửa → cách tối ưu. Người đọc học xong có cảm giác "đã học được một thứ trọn vẹn".
- Tất cả code chạy được bằng `numpy` và `scikit-learn` trên Pyodide. Không cần GPU.
- Phần Python và Toán thường có nhiều nguồn tiếng Việt tốt. Phần ML là nơi AI Atlas tạo khác biệt rõ nhất.

## 3. Phạm vi

### Có trong MVP

**Nội dung (5 bài tiếng Việt, cộng bản tiếng Anh của bài mẫu; quyết định 43):**

| # | Bài | File | Ghi chú |
|---|---|---|---|
| 1 | Tổng quan về Học máy | `ml/ml-overview.mdx` | Không cần toán nặng |
| 2 | Hồi quy tuyến tính | `ml/linear-regression.mdx` | **Bài mẫu**, viết và duyệt trước |
| 3 | Overfitting và Underfitting | `ml/overfitting-underfitting.mdx` | |
| 4 | Ridge, Lasso, Elastic Net | `ml/regularization.mdx` | |
| 5 | Gradient Descent | `ml/gradient-descent.mdx` | |

**Trang khác:**

- Trang chủ (vi/en): giới thiệu ngắn, sơ đồ lộ trình, nút "Bắt đầu học".
- Trang "Giới thiệu" (vi/en): AI Atlas là gì, ai làm, cách dùng.
- Trang 404 (vi/en).

**Tính năng:**

| Tính năng | Mức MVP |
|---|---|
| Song ngữ vi/en | Đầy đủ: chuyển ngôn ngữ, giao diện dịch 100% |
| Công thức toán (KaTeX) | Đầy đủ |
| `RoadmapMap` | **Bản đơn giản:** lưới các phần, mỗi phần là danh sách bài. Bài chưa viết hiện nhãn "Sắp có", không có link. Bài đã học có dấu ✓. Chưa cần sơ đồ dạng đồ thị. |
| `Prerequisites` | Đầy đủ: đọc từ `roadmap.ts`, bài chưa có thì hiện "Sắp có" |
| `PythonRunner` | Chạy code, hiện kết quả in ra, hiện biểu đồ matplotlib, hiện lỗi dễ hiểu, nút "Khôi phục code gốc". Pyodide chỉ tải khi bấm chạy lần đầu. |
| `Quiz` | Trắc nghiệm một đáp án, chấm ngay, có giải thích |
| `LessonProgress` | Nút đánh dấu đã học, lưu localStorage, không lỗi khi localStorage bị chặn |
| Minh họa tương tác | Mỗi bài tối đa 1–2 minh họa, chỉ làm khi thật sự giúp hiểu |
| Tìm kiếm | Pagefind có sẵn của Starlight |
| Sáng/tối, điện thoại | Đầy đủ |
| Deploy | Cloudflare Pages, tự deploy khi push lên `main` |

### Không có trong MVP (làm sau)

- 73 bài còn lại.
- Sơ đồ lộ trình dạng đồ thị có mũi tên "cần biết trước".
- Trang riêng cho từng bài chưa viết (tránh trang trống, không tốt cho SEO).
- Tên miền riêng: **nên có** nhưng không chặn ra mắt. Tạm dùng `*.pages.dev`.
- Thống kê truy cập, ảnh chia sẻ riêng cho từng bài.
- Đăng nhập, bình luận, đồng bộ tiến độ giữa các máy.
- Notebook Colab/Kaggle (dự án riêng).

## 4. Yêu cầu chất lượng (tiêu chí hoàn thành)

MVP chỉ được coi là xong khi **tất cả** mục dưới đây đều đạt và có bằng chứng (kết quả test, số đo, link).

**Kỹ thuật**

- [ ] `npm run build` thành công, không cảnh báo.
- [ ] `npm run check` không lỗi kiểu.
- [ ] Unit test và e2e test đều qua.
- [ ] Không có link nội bộ hỏng.
- [ ] Mỗi bài trong `roadmap.ts` có trạng thái `published` đều có file thật ở cả `vi/` và `en/`.
- [ ] Quan hệ "cần biết trước" không trỏ tới bài không tồn tại trong `roadmap.ts` và không tạo vòng lặp.

**Hiệu năng và trải nghiệm**

- [ ] Lighthouse trên một trang bài học (điện thoại): Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
- [ ] Mở trang bài học **không tải Pyodide**. Pyodide chỉ tải khi bấm "Chạy".
- [ ] Màn hình 375px không bị cuộn ngang. Chế độ sáng và tối đều đọc rõ.
- [ ] Dùng được bằng bàn phím: chạy code, làm quiz, đánh dấu đã học.

**Nội dung**

- [ ] 5 bài đều qua `content-reviewer`, không còn lỗi mức "Nghiêm trọng" hay "Nên sửa".
- [ ] Mọi code ví dụ đã chạy thật, kết quả khớp lời giải thích.
- [ ] Bài đã có bản en thì bản en khớp bản vi: cùng số heading, công thức, khối code, component. Bài chưa dịch hiện trang fallback (quyết định 30, 33).
- [ ] Mọi nguồn tham khảo có thật, link mở được.

**Ra mắt**

- [ ] Website chạy online, truy cập được từ điện thoại.
- [ ] Mỗi trang có `title`, `description`, `hreflang` vi/en. Có `sitemap.xml`.
- [ ] Chân trang ghi giấy phép nội dung (CC BY-NC-SA 4.0) kèm link tới trang giấy phép của Creative Commons. Repo là private nên không link tới file trong repo.

## 5. Các mốc

Mỗi mốc kết thúc bằng một bản deploy dùng được.

| Mốc | Nội dung | Kết quả | Tương ứng `PLAN.md` |
|---|---|---|---|
| **M0. Bộ khung** | Khởi tạo Astro + Starlight, i18n vi/en, KaTeX, `roadmap.ts` đủ 78 bài, trang chủ tạm, cài Vitest + Playwright, deploy lên Cloudflare Pages | Website trống chạy online | Giai đoạn 0 |
| **M1. Công cụ trình bày** | `Prerequisites`, `Quiz`, `LessonProgress`, `PythonRunner`, `RoadmapMap` bản đơn giản. Một trang demo dùng đủ component. | Mọi component có test và chạy trên bản deploy | Giai đoạn 1 |
| **M2. Bài mẫu** | Bài Hồi quy tuyến tính bản vi → review → minh họa → **bạn duyệt** → chỉnh template → bản en | Bài chuẩn, template chốt | Giai đoạn 2 |
| **M3. Mạch ML đầu tiên** | 4 bài còn lại, bản vi (en sau MVP, quyết định 43) | 5 bài tiếng Việt | Một phần Giai đoạn 3 |
| **M4. Ra mắt** | SEO cơ bản, trang Giới thiệu, 404, Lighthouse, kiểm tra điện thoại, gắn tên miền (nếu đã mua) | **MVP công khai** | Một phần Giai đoạn 4 |

M2 có một bước **chờ bạn duyệt**. Mọi bài sau đều theo template đã chốt ở bước này, nên đừng bỏ qua.

## 6. Rủi ro

| Rủi ro | Ảnh hưởng | Cách giảm |
|---|---|---|
| Pyodide nặng (khoảng 10MB), tải chậm trên điện thoại | Người học bỏ đi trước khi code chạy | Chỉ tải khi bấm, chạy trong Web Worker, hiện trạng thái "Đang tải Python…", tải từ CDN có cache |
| Mỗi bài tốn nhiều công (toán + minh họa + dịch) | MVP kéo dài | Giới hạn 1–2 minh họa mỗi bài; minh họa tĩnh bằng SVG khi đủ |
| Template chưa ổn, phải sửa lại nhiều bài | Tốn công gấp đôi | Chốt template ở M2 trước khi viết bài khác |
| Bản en lệch bản vi khi bản vi được sửa | Hai ngôn ngữ dạy khác nhau | `lesson-translator` đồng bộ theo `git diff`; test đếm heading/công thức |

## 7. Cần bạn quyết định

Đã quyết ngày 22/10/2026:

1. **Gốc repo git:** đã chuyển `.git` vào `ai-atlas/`.
2. **Giấy phép:** nội dung **CC BY-NC-SA 4.0**, code **MIT**. Xem [LICENSE](../LICENSE) và [LICENSE-CONTENT.md](../LICENSE-CONTENT.md).
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

Còn mở: tên miền (trước M4).
