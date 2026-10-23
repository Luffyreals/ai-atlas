import matplotlib.pyplot as plt

x = [0, 1, 2, 3]
plt.plot(x, [v * v for v in x])  # this figure still shows, even though line 6 fails
total = sum(x)
print(totl)  # "total" mistyped as "totl": NameError
