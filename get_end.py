with open('src/components/UniexControlPanel.tsx', 'r') as f:
    content = f.read()

idx = content.find('{activeTab === "settings" && (')
print("Found at:", idx)

# Find the end of settings tab
brackets = 0
for i in range(idx, len(content)):
    if content[i] == '{':
        brackets += 1
    elif content[i] == '}':
        brackets -= 1
    
    if brackets == 0 and i > idx:
        print("End at:", i)
        print("Surrounding code:")
        print(content[i-50:i+150])
        break
