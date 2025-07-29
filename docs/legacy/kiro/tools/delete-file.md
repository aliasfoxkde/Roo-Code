# Delete File Tool Prompt

**Tool ID:** `deleteFile`

**Description:**
```
Deletes a file at the specified path. The operation will fail gracefully if:
    - The file doesn't exist
    - The operation is rejected for security reasons
    - The file cannot be deleted
```

**Schema:**
- `explanation`: One sentence explanation as to why this tool is being used, and how it contributes to the goal.
- `targetFile`: The path of the file to delete, relative to the workspace root.
