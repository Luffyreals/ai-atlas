import os
import tempfile

# Mô phỏng thư mục làm việc trong môi trường notebook
work_dir = tempfile.mkdtemp()
data_file = os.path.join(work_dir, "dataset.csv")

# Tạo một tệp dữ liệu mẫu
with open(data_file, "w", encoding="utf-8") as f:
    f.write("id,feature,label\n")
    f.write("1,0.85,1\n")
    f.write("2,0.12,0\n")

# Liệt kê tệp và đo dung lượng lưu trữ
files = os.listdir(work_dir)
file_size = os.path.getsize(data_file)

print(f"Directory: {os.path.basename(work_dir)}")
print(f"Found files: {files}")
print(f"File size: {file_size} bytes")

# Dọn dẹp dữ liệu tạm sau khi xử lý xong
os.remove(data_file)
os.rmdir(work_dir)
print("Storage cleaned up successfully")
