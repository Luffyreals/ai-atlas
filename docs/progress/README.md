# Báo cáo tiến độ

Mỗi báo cáo là một file `<YYYY-MM-DD>.md`, thường viết cuối mỗi mốc hoặc giai đoạn. File do `summarizer` viết.

## Quy ước

- **Chỉ ghi điều có bằng chứng:** commit, file, kết quả test, số đo. Không suy đoán việc đã xong.
- Thay đổi đáng chú ý cũng ghi vào [CHANGELOG.md](../CHANGELOG.md).
- Sau báo cáo, `team-lead` cập nhật ô `[x]` trong [PLAN.md](../PLAN.md) mục 7.

## Khung một báo cáo

```markdown
# Tiến độ <YYYY-MM-DD>

## Đã xong
(theo mốc trong docs/mvp.md hoặc giai đoạn trong PLAN.md)

## Đang làm

## Tiếp theo
1. ...

## Vướng mắc
(lỗi chưa sửa, câu hỏi chờ quyết định)

## Số liệu
- Bài vi: x/78 · Bài en: y/78
- Component đã có: ...
```
