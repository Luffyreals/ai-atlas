import time

# This loop never ends on its own. Press Stop to break it.
i = 0
while True:
    print("Tick", i)
    i += 1
    time.sleep(0.5)  # wait half a second between two lines
