# File System Append Tool Prompt

**Tool ID:** `fsAppend`

**Description:**
```
A tool for editing files, by adding content to the end of an existing file, automatically adding a newline if the file doesn't end with one. The file must exist.
```

**Schema:**
- `path`: Path to file, e.g. `file.py` or `tst/my/file.test.ts`.
- `text`: Contents to append to the end of the file.
