# Chấm hai prompt trên một bộ ví dụ nhỏ có đáp án.
# Câu trả lời của "mô hình" ở đây là giả lập: viết tay để minh họa
# các kiểu trả lời hay gặp, không phải đầu ra thật của một mô hình.
LABELS = {"tích cực", "tiêu cực", "trung tính"}
gold = ["tích cực", "tiêu cực", "trung tính", "tích cực",
        "tiêu cực", "trung tính", "tích cực", "tiêu cực"]

# Prompt A: mơ hồ, chỉ hỏi "Bình luận này thế nào?"
answers_a = ["Tích cực.",
             "Bình luận này tiêu cực vì khách phải chờ lâu.",
             "trung tính", "Tích cực", "Tiêu cực.",
             "Lẫn lộn: khen đồ uống, chê chỗ ngồi.",
             "Rất tích cực!", "tiêu cực"]
# Prompt B: nêu rõ ba nhãn và "chỉ trả lời đúng một nhãn"
answers_b = ["tích cực", "tiêu cực", "trung tính", "tích cực",
             "tiêu cực", "tiêu cực", "tích cực", "tiêu cực"]


def parse(text):
    """Chuẩn hóa câu trả lời; trả về None nếu không phải một nhãn."""
    label = text.strip().lower().rstrip(".!")
    return label if label in LABELS else None


def score(name, answers):
    preds = [parse(a) for a in answers]
    m = len(gold)
    correct = sum(p == y for p, y in zip(preds, gold))
    invalid = sum(p is None for p in preds)
    # Số thứ tự (đếm từ 1) của các ca bị chấm sai
    wrong = [i + 1 for i in range(m) if preds[i] != gold[i]]
    print(f"{name}: accuracy = {correct / m:.3f}, "
          f"invalid = {invalid}, wrong = {wrong}")


score("A", answers_a)
score("B", answers_b)
print(f"one case = {1 / len(gold):.3f} of accuracy")
