with open('src/components/UniexControlPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";',
    'import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";'
)

with open('src/components/UniexControlPanel.tsx', 'w') as f:
    f.write(content)
