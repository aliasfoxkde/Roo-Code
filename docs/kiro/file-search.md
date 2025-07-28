# File Search Tool Prompt

**Tool ID:** `fileSearch`

**Description:**
```
Fast file search based on fuzzy matching against file path. Use if you know part of the file path but don't know where it's located exactly. Response will be capped to 10 results. Make your query more specific if need to filter results further.
```

**Schema:**
- `explanation`: Fuzzy filename to search for
- `query`: The regex pattern to search for
- `excludePattern`: Glob pattern for files to exclude (optional)
- `includeIgnoredFiles`: Whether the search should include .gitignore files, should be the string yes or no (optional)
