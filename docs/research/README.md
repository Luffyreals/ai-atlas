# Tóm tắt tài liệu tham khảo

Mỗi bài học có thể có một file tóm tắt tài liệu ở đây, giúp `lesson-writer` viết nhanh và chính xác hơn. File do `summarizer` viết.

## Quy ước

- **Tên file:** trùng tên bài, ví dụ bài `ml/linear-regression.mdx` → `linear-regression.md`.
- **Ngôn ngữ:** tiếng Việt.
- **Chỉ ghi nguồn có thật:** tác giả, năm, tên, link. Không bịa.
- **Bản quyền:** tóm tắt bằng lời của mình. Mỗi nguồn trích nguyên văn tối đa một câu ngắn, đặt trong ngoặc kép.

## Khung một file

```markdown
# <Tên bài>

## Nguồn
- Tác giả (Năm). [*Tên tài liệu*](https://...). Link gắn vào tên tài liệu, không dùng chữ "Link" (quyết định 31 trong docs/mvp.md). File PDF thì ghi "(PDF)" ngay sau link.

## Ý chính
- 5–10 gạch đầu dòng

## Công thức quan trọng
(KaTeX, theo ký hiệu thống nhất trong CLAUDE.md)

## Ví dụ hoặc trực giác hay
(diễn đạt lại bằng lời của mình)

## Điểm dễ hiểu nhầm

## Liên quan tới bài nào
- `ml/...`
```
