import os

OUTPUT_FILE = "estrutura.txt"

IGNORED_DIRS = {
    "node_modules",
    ".git",
    "bin",
    "obj",
    ".idea",
    ".vscode",
    "__pycache__",
    "dist",
    "build"
}

def should_ignore(path):
    parts = path.split(os.sep)
    return any(part in IGNORED_DIRS for part in parts)

def build_tree(start_path, prefix=""):
    lines = []

    try:
        entries = sorted(os.listdir(start_path))
    except PermissionError:
        return lines

    for i, entry in enumerate(entries):
        full_path = os.path.join(start_path, entry)

        if should_ignore(full_path):
            continue

        is_last = i == len(entries) - 1
        connector = "└── " if is_last else "├── "

        line = prefix + connector + entry
        lines.append(line)

        if os.path.isdir(full_path):
            new_prefix = prefix + ("    " if is_last else "│   ")
            lines.extend(build_tree(full_path, new_prefix))

    return lines

if __name__ == "__main__":
    root_folder = "."
    tree_lines = build_tree(root_folder)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(tree_lines))

    print(f"Estrutura salva em {OUTPUT_FILE}")