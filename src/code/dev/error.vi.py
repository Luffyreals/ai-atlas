import matplotlib.pyplot as plt

x = [0, 1, 2, 3]
plt.plot(x, [v * v for v in x])  # hình này vẫn hiện dù dòng 6 bị lỗi
total = sum(x)
print(totl)  # gõ nhầm "total" thành "totl": NameError
