# Execute Bash Tool Prompt

**Tool ID:** `executeBash`

**Description:**
```
Execute the specified bash command.

# Rules
- Avoid using cli commands for search and discovery like cat, find, grep, ls, and instead use the grepSearch, fileSearch, readFile, and readMultipleFiles tools
- Avoid using cli commands for file writing like mkdir or piping, instead using fsWrite (folders are managed for you)
- NEVER use command lists (&&, ||, ;, etc) as they are not supported. Instead, invoke the tool multiple times in the same turn.
- NEVER use the 'cd' command! If you wish to run a command in a subdirectory of the workspace, provide the relative path in the 'path' parameter.
- USING THE 'cd' command will result in a failure.
```

**Schema:**
- `command`: Bash command to execute
- `path`: Optional Path to run the command in, omit to run in workspace root
