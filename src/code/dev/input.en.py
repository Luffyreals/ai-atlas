# Each call to input() reads one line of the input box.
name = input()
age = int(input())  # input() always returns a string, so turn it into an integer

print("Hello,", name)
print("Next year you will be", age + 1)
