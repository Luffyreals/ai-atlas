from typing import List


def clean_text(
    raw_text: str,
    lowercase: bool = True,
    remove_punct: bool = True,
) -> List[str]:
    # Chuẩn hóa khoảng trắng đầu cuối
    text = raw_text.strip()
    if lowercase:
        text = text.lower()

    # Loại bỏ các dấu câu phổ biến
    if remove_punct:
        for char in [".", ",", "!", "?", ";"]:
            text = text.replace(char, "")

    # Tách chuỗi thành danh sách các token
    tokens = text.split()
    return tokens


# Thử nghiệm hàm tiền xử lý với dữ liệu văn bản thô
sample = "  AI and Deep Learning: Transforming the Future!  "
cleaned = clean_text(sample)

print(f"Raw string length: {len(sample)}")
print(f"Cleaned tokens: {cleaned}")
print(f"Token count: {len(cleaned)}")
print(f"Joined text: {' '.join(cleaned)}")
