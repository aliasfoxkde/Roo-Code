# Read Multiple Files Tool Prompt

**Tool ID:** `readMultipleFiles`

**Description:**
```
Tool for reading multiple files with optional line range specification. This tool reads the content of multiple files and can optionally limit the output to specific line ranges.

Example Usage:
- Read multiple files: paths=["file1.txt", "file2.txt"]
- Read specific lines from multiple files: paths=["file1.txt", "file2.txt"], start_line=5, end_line=10
- Read from line 5 to end: paths=["file1.txt", "file2.txt"], start_line=5
- Read first 10 lines: paths=["file1.txt", "file2.txt"], end_line=10

Rules:
1. Reading multiple files at once is preferred over multiple single-file reads
2. Use line ranges to focus on relevant sections of large files only when absolutely necessary. Prefer reading entire files.
3. For reading a single file, use the readFile tool instead
```

**Schema:**
- `paths`: Paths to files to read, should be relative to workspace root. e.g. ['file.py', 'src/main.ts']
- `start_line`: Starting line number (optional, default: 1). A negative index represents a line number starting from the end of the file.
- `end_line`: Ending line number (optional, default: -1). A negative index represents a line number starting from the end of the file.
- `explanation`: One sentence explanation as to why this tool is being used, and how it contributes to the goal.
