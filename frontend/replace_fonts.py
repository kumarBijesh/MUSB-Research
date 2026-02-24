import os

directory = "src"

replacements = [
    ("text-[10px]", "text-[13px]"),
    ("text-[11px]", "text-[13px]"),
    ("text-[12px]", "text-[13px]"),
    ("text-xs", "text-[13px]")
]

def process_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        original = content
        for old, new in replacements:
            content = content.replace(old, new)
            
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            process_file(os.path.join(root, file))
