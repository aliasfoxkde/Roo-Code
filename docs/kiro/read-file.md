# Read File Tool Prompt

**Tool ID:** `readFile`

**Description:**
```
Tool for reading a single file with optional line range specification. This tool reads the content of one file and can optionally limit the output to specific line ranges.

Example Usage:
- Read entire file: path="file.txt"
- Read specific lines: path="file.txt", start_line=5, end_line=10
- Read from line 5 to end: path="file.txt", start_line=5
- Read first 10 lines: path="file.txt", end_line=10

Rules:
1. Use line ranges to focus on relevant sections of large files only when absolutely necessary. Prefer reading entire files.
2. For reading multiple files, use the readMultipleFiles tool instead
```

**Schema:**
- `path`: Path to file to read, should be relative to workspace root. e.g. 'file.py' or 'src/main.ts'
- `start_line`: Starting line number (optional, default: 1)
- `end_line`: Ending line number (optional, default: -1)
- `explanation`: One sentence explanation as to why this tool is being used, and how it contributes to the goal.
