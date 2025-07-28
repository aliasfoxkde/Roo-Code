# String Replace Tool Prompt

**Tool ID:** `strReplace`

**Description:**
```
A tool for replacing text in files. Especially useful for long files where much of the file will remain unchanged.
Parameters:
- path: (required) the path to the file where replacements are requested.
- oldStr (required)
- newStr: (required)

Parameters Rules:
- Each invoke must contain "path", "oldStr", and "newStr".
- "newStr" should contain the edited lines that should replace the "oldStr".

When making edits:
- Ensure the edit results in idiomatic, correct code
- Do not leave the code in a broken state
- Ensure the path exists

CRITICAL REQUIREMENTS FOR USING THIS TOOL:
1. EXACT MATCHING: "oldStr" must match EXACTLY one or more consecutive lines from the file.
2. WHITESPACES: All whitespace must match exactly (spaces, tabs, line endings). This is extra important in indentation-sensitive languages like Python.
The tool will fail if "oldStr" matches multiple locations or doesn't match exactly with the file content.
3. UNIQUENESS: "oldStr" must uniquely identify a single instance in the file:
   - Include sufficient context before and after the change point (2-3 lines recommended)
   - If not unique, the replacement will not be performed
4. REPLACEMENT: "newStr" should contain the edited lines that replace the "oldStr". These strings MUST BE DIFFERENT.
5. PARALLEL TOOL CALLS: When performing multiple independent string replacements, invoke the 'strReplace' tool multiple times simultaneously in the same turn rather than sequentially. Prioritize calling this tool in parallel whenever possible.
```

**Schema:**
- `path`: the path to the file where replacements are requested.
- `oldStr`: Text to be replaced - must match exactly
- `newStr`: Text to replace with - must be different from oldStr
