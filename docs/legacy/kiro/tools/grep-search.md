# Grep Search Tool Prompt

**Tool ID:** `grepSearch`

**Description:**
```
Fast text-based regex search that finds exact pattern matches within files or directories using ripgrep.
Search results include line numbers, file paths, and 2 lines of context around each match.

Parameters:
- query (required): The regex pattern to search for. Use Rust regex syntax.
- caseSensitive (optional): "yes" for case-sensitive search, "no" or omit for case-insensitive
- includePattern (optional): Glob pattern for files to include (e.g. '*.ts', 'src/**/*.js'). If omitted, searches all files in workspace
- excludePattern (optional): Glob pattern for files to exclude (e.g. '*.log', 'node_modules/**')
- explanation (optional): Brief description of why this search is being performed

Search Behavior:
- Use includePattern or excludePattern to filter the search scope by file type or specific paths. If no includePattern is specified, the tool will search all files.
- The results are capped at 50 matches and long lines are truncated with "[truncated: line too long]" indicator.
- If total output is too large, truncates with "[truncated: too many matches]" message.

Examples of VALID patterns to use as "query":
- Basic text search: "function", "error", "TODO"
- Word boundaries: "\\bword\\b" (matches 'word' but not 'password')
- Multiple words: "auth.*failed"
- File content with spaces: "not found"
- Line starts with: "^import"
- Line ends with: "};$"
- Numbers: "\\d+\\.\\d+" (finds decimal numbers like 3.14)
- Word followed by another: "function\\s+\\w+" (finds function declarations)

Rules:
1. Keep regex patterns simple. Complex patterns may fail.
2. Use includePattern to narrow search scope for better performance
3. Glob patterns: use standard glob syntax (* for wildcards, ** for recursive)
4. NEVER use bash command "grep" to search but use this search tool instead because it is optimized for your machine.
5. Always escape special regex characters: ( ) [ ] { } + * ? ^ $ | . \\
6. You MUST use \\ to escape any of special regex characters when they appear in your search string.
```

**Schema:**
- `query`: The regex pattern to search for
- `caseSensitive`: Whether the search should be case sensitive (optional)
- `excludePattern`: Glob pattern for files to exclude (optional)
- `explanation`: One sentence explanation as to why this tool is being used, and how it contributes to the goal. (optional)
- `includePattern`: Glob pattern for files to include (e.g. '*.ts' for TypeScript files) (optional)
