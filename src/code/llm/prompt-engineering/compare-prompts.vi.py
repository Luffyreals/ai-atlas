# So sánh prompt zero-shot và few-shot trên cùng một bộ ví dụ nhỏ.
import os
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),  # bỏ trống: dùng OpenAI
    api_key=os.environ["OPENAI_API_KEY"],
)
MODEL = os.environ["LLM_MODEL"]

LABELS = {"tích cực", "tiêu cực", "trung tính"}
CASES = [  # (bình luận, nhãn đúng)
    ("Cà phê ngon, nhân viên dễ thương.", "tích cực"),
    ("Chờ 40 phút mới có đồ uống.", "tiêu cực"),
    ("Quán mở cửa lúc 7 giờ sáng.", "trung tính"),
    ("Giá hơi cao nhưng đáng tiền.", "tích cực"),
    ("Bánh khô, lần sau không quay lại.", "tiêu cực"),
    ("Đồ uống được, chỗ ngồi hơi chật.", "trung tính"),
    ("Tuyệt vời, chắc chắn sẽ giới thiệu bạn bè.", "tích cực"),
    ("Wifi yếu, nhạc to, không làm việc được.", "tiêu cực"),
]
SYSTEM = (
    "Bạn phân loại cảm xúc của bình luận về một quán cà phê.\n"
    "Nhãn: tích cực (khen, hài lòng, kể cả khi có chê nhẹ); "
    "tiêu cực (chê, không hài lòng); "
    "trung tính (chỉ nêu dữ kiện, hoặc khen chê ngang nhau).\n"
    "Bình luận nằm giữa hai thẻ <binh_luan> và </binh_luan>.\n"
    "Chỉ trả lời đúng một nhãn, chữ thường, không giải thích."
)


def wrap(text):
    return f"<binh_luan>{text}</binh_luan>"


SHOTS = [  # Few-shot: ba cặp mẫu, đủ ba nhãn, không trùng với bộ kiểm tra
    {"role": "user", "content": wrap("Nhân viên chào hỏi rất nhiệt tình.")},
    {"role": "assistant", "content": "tích cực"},
    {"role": "user", "content": wrap("Ly nước bị đổ mà không ai lau.")},
    {"role": "assistant", "content": "tiêu cực"},
    {"role": "user", "content": wrap("Quán có bán cả bánh mì.")},
    {"role": "assistant", "content": "trung tính"},
]


def classify(text, shots):
    messages = [{"role": "system", "content": SYSTEM}, *shots,
                {"role": "user", "content": wrap(text)}]
    response = client.chat.completions.create(
        model=MODEL, messages=messages, temperature=0)
    answer = response.choices[0].message.content or ""
    label = answer.strip().lower().rstrip(".!")
    return label if label in LABELS else None  # None: sai định dạng


for name, shots in [("zero-shot", []), ("few-shot", SHOTS)]:
    preds = [classify(text, shots) for text, _ in CASES]
    correct = sum(p == y for p, (_, y) in zip(preds, CASES))
    invalid = sum(p is None for p in preds)
    print(f"{name}: đúng {correct}/{len(CASES)}, sai định dạng {invalid}")
