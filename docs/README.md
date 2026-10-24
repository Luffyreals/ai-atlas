# Tài liệu dự án

Thư mục này chứa tài liệu cho **người viết bài** và **người phát triển** AI Atlas. Đây không phải nội dung của website (nội dung nằm ở `src/content/docs/`).

## Mục lục

| File / thư mục | Nội dung | Ai viết |
|---|---|---|
| [mvp.md](mvp.md) | Spec bản MVP: phạm vi, tiêu chí hoàn thành, các mốc | Bạn + Claude |
| [decisions.md](decisions.md) | Các quyết định đã chốt, đánh số theo đợt có ngày (trước đây là mvp.md mục 7) | Bạn + Claude |
| [lesson-template.mdx](lesson-template.mdx) | Template chuẩn cho mọi bài học (9 mục) | Chốt ở mốc M2 |
| [glossary.md](glossary.md) | Bảng thuật ngữ Việt – Anh | `lesson-writer` bổ sung khi gặp thuật ngữ mới |
| [architecture/README.md](architecture/README.md) | Tổng quan kiến trúc một trang: luồng build và phục vụ, mô hình nội dung, các lớp kiểm tra. Bắt đầu từ đây nếu bạn mới vào dự án | `architect` |
| [architecture/](architecture/README.md#8-tài-liệu-thiết-kế-chi-tiết) | Thiết kế kỹ thuật chi tiết: [bộ khung](architecture/scaffold.md), [dữ liệu lộ trình](architecture/roadmap-data.md), [component](architecture/components.md), [trang chủ](architecture/homepage.md), [minh họa VIZ và hình tĩnh](architecture/viz/README.md) | `architect` |
| [research/](research/README.md) | Tóm tắt tài liệu tham khảo cho từng bài | `summarizer` |
| [progress/](progress/README.md) | Báo cáo tiến độ theo ngày | `summarizer` |

Ở gốc repo:

| File | Nội dung |
|---|---|
| [PLAN.md](../PLAN.md) | Kế hoạch tổng thể và tiến độ các giai đoạn |
| [CLAUDE.md](../CLAUDE.md) | Quy tắc nội dung, quy ước code, sub agent và các lệnh |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Hướng dẫn đóng góp: cài đặt, nhánh và commit, quy trình, định nghĩa hoàn thành |
| [SECURITY.md](../SECURITY.md) | Chính sách bảo mật và cách báo lỗ hổng |

## Quy trình thêm một bài học

1. **(Tùy chọn) Tóm tắt tài liệu:** `summarizer` ghi `docs/research/<tên-bài>.md`.
2. **Viết bản tiếng Việt:** `lesson-writer` tạo `src/content/docs/vi/<phần>/<tên-bài>.mdx` theo template, đánh dấu chỗ cần minh họa bằng `{/* VIZ: ... */}`. Trong cùng thay đổi, đổi `status.vi` của bài trong `src/data/roadmap.ts` thành `'published'` (unit test yêu cầu trạng thái khớp file có thật).
3. **Review:** `content-reviewer` kiểm tra kỹ thuật, toán, chạy thử code. Sửa đến khi hết lỗi "Nghiêm trọng" và "Nên sửa".
4. **Minh họa:** `viz-builder` làm component cho từng chỗ `VIZ`.
5. **Dịch:** `lesson-translator` tạo bản `src/content/docs/en/...` cùng đường dẫn, và đổi `status.en` thành `'published'`.
6. **Review lần hai:** `content-reviewer` kiểm tra bản en khớp bản vi.
7. **Commit:** ví dụ `Add linear regression lesson (vi, en)`.

## Quy trình thêm một tính năng

`architect` (thiết kế trong `architecture/`) → `developer` (code) → `tester` (test) → `analyst` (review) → sửa nếu có lỗi → commit.
