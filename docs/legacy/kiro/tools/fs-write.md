# File System Write Tool Prompt

**Tool ID:** `fsWrite`

**Description:**
```
A tool for creating files, will override the file at `path` if it already exists as a file, and otherwise create a new file. If the content is larger than 50 lines, use create with part of the content and then use `fsAppend` to add more content.
```

**Schema:**
- `path`: Path to file or directory, e.g. `file.py` or `repo`.
- `text`: Contents to write into the file.
