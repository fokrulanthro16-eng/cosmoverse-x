with open("main.js", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("if (d) speakAI(Scanning . Surface gravity is . );", "if (d) speakAI('Scanning ' + d.name + '. Surface gravity is ' + d.surfaceGravity + '. ' + d.physicsAlert);")

with open("main.js", "w", encoding="utf-8") as f:
    f.write(text)
print("Line 1062 fixed")
