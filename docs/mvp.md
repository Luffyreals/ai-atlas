# Spec bản MVP của AI Atlas

> Bản MVP (Minimum Viable Product) là phiên bản nhỏ nhất **đáng để công khai**. Nó chứng minh cả quy trình (viết bài → minh họa → dịch → deploy) chạy trơn tru, và người học đã dùng được thật.
>
> **Cập nhật tiến độ:** Toàn bộ các mốc M0–M4 của MVP đã hoàn thành vượt mức cam kết. Dự án hiện đã phát hành 100% bản tiếng Việt (78/78 bài), 100% bản tiếng Anh phần ML (14 bài), trang Giới thiệu song ngữ, hạ tầng SEO OpenGraph và triển khai Cloudflare Pages tại https://ai-atlas-7nb.pages.dev/.
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

Các quyết định đã chốt (số 1–62, theo đợt có ngày) nằm ở [decisions.md](decisions.md). Số giữ nguyên, nên "quyết định N" trong tài liệu này và ở nơi khác tra ở đó.

Còn mở: tên miền (trước M4).
