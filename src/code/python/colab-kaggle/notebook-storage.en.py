import os
import tempfile

# Simulate working directory in a notebook environment
work_dir = tempfile.mkdtemp()
data_file = os.path.join(work_dir, "dataset.csv")

# Create a sample dataset file
with open(data_file, "w", encoding="utf-8") as f:
    f.write("id,feature,label\n")
    f.write("1,0.85,1\n")
    f.write("2,0.12,0\n")

# List files and inspect storage size
files = os.listdir(work_dir)
file_size = os.path.getsize(data_file)

print(f"Directory: {os.path.basename(work_dir)}")
print(f"Found files: {files}")
print(f"File size: {file_size} bytes")

# Clean up temporary storage after processing
os.remove(data_file)
os.rmdir(work_dir)
print("Storage cleaned up successfully")
