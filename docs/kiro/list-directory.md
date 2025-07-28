# List Directory Tool Prompt

**Tool ID:** `listDirectory`

**Description:**
```
Tool for listing directory contents. Content is returned in the "long format" similar to `ls -la`.

Example Usage:
1. List the files in the home directory: path="~"
2. Recursively list files in a directory to a max depth of 2: path="/path/to/directory", depth=2
```

**Schema:**
- `path`: Path to directory, the path should be absolute, or otherwise start with ~ for the user's home. e.g. `repo`, `src`.
- `explanation`: One sentence explanation as to why this tool is being used, and how it contributes to the goal.
- `depth`: Depth of a recursive directory listing (optional)
