# Legacy Tool Reference

This document provides reference information for legacy Kiro tools and their modern VS Code API equivalents. This serves as a migration guide for developers familiar with the legacy system and as historical documentation for the evolution of the Roo Code extension.

## Overview

The legacy Kiro system provided direct file system manipulation and shell integration through a set of specialized tools. The modern Roo Code VS Code Extension replaces these with native VS Code APIs that provide better integration, security, and user experience.

## File Operations

### Legacy: fs-write, fs-append
**Purpose**: Write or append content to files
**Modern Equivalent**: VS Code Workspace API

```typescript
import * as vscode from 'vscode'

// Write file (replaces fs-write)
const uri = vscode.Uri.file('/path/to/file.txt')
const content = new TextEncoder().encode('file content')
await vscode.workspace.fs.writeFile(uri, content)

// Append to file (replaces fs-append)
const existingContent = await vscode.workspace.fs.readFile(uri)
const newContent = new TextEncoder().encode('additional content')
const combinedContent = new Uint8Array(existingContent.length + newContent.length)
combinedContent.set(existingContent)
combinedContent.set(newContent, existingContent.length)
await vscode.workspace.fs.writeFile(uri, combinedContent)
```

### Legacy: delete-file
**Purpose**: Delete files from the file system
**Modern Equivalent**: VS Code File System API

```typescript
// Delete file
const uri = vscode.Uri.file('/path/to/file.txt')
await vscode.workspace.fs.delete(uri)

// Delete directory recursively
await vscode.workspace.fs.delete(uri, { recursive: true, useTrash: true })
```

### Legacy: read-file, read-multiple-files
**Purpose**: Read file contents
**Modern Equivalent**: VS Code Workspace API

```typescript
// Read single file (replaces read-file)
const uri = vscode.Uri.file('/path/to/file.txt')
const content = await vscode.workspace.fs.readFile(uri)
const text = new TextDecoder().decode(content)

// Read multiple files (replaces read-multiple-files)
const files = ['/path/to/file1.txt', '/path/to/file2.txt']
const contents = await Promise.all(
  files.map(async (filePath) => {
    const uri = vscode.Uri.file(filePath)
    const content = await vscode.workspace.fs.readFile(uri)
    return {
      path: filePath,
      content: new TextDecoder().decode(content)
    }
  })
)
```

## Search Operations

### Legacy: file-search
**Purpose**: Find files matching patterns
**Modern Equivalent**: VS Code Search API

```typescript
// Find files by pattern (replaces file-search)
const files = await vscode.workspace.findFiles(
  '**/*.ts',           // include pattern
  '**/node_modules/**' // exclude pattern
)

// Find files with more complex patterns
const pattern = new vscode.RelativePattern(
  vscode.workspace.workspaceFolders![0],
  '**/*.{ts,js,tsx,jsx}'
)
const jsFiles = await vscode.workspace.findFiles(pattern)
```

### Legacy: grep-search
**Purpose**: Search for text within files
**Modern Equivalent**: VS Code Search API with content filtering

```typescript
// Search for text in files (replaces grep-search)
async function searchInFiles(searchTerm: string, filePattern: string) {
  const files = await vscode.workspace.findFiles(filePattern)
  const results = []
  
  for (const file of files) {
    const content = await vscode.workspace.fs.readFile(file)
    const text = new TextDecoder().decode(content)
    const lines = text.split('\n')
    
    lines.forEach((line, index) => {
      if (line.includes(searchTerm)) {
        results.push({
          file: file.fsPath,
          line: index + 1,
          content: line.trim()
        })
      }
    })
  }
  
  return results
}
```

### Legacy: list-directory
**Purpose**: List directory contents
**Modern Equivalent**: VS Code File System API

```typescript
// List directory contents (replaces list-directory)
const uri = vscode.Uri.file('/path/to/directory')
const entries = await vscode.workspace.fs.readDirectory(uri)

const files = entries
  .filter(([name, type]) => type === vscode.FileType.File)
  .map(([name]) => name)

const directories = entries
  .filter(([name, type]) => type === vscode.FileType.Directory)
  .map(([name]) => name)
```

## Text Editing

### Legacy: str-replace, alpaca-edit, simplified-edit
**Purpose**: Edit text content with replacements
**Modern Equivalent**: VS Code Text Editor API

```typescript
// String replacement in active editor (replaces str-replace)
const editor = vscode.window.activeTextEditor
if (editor) {
  const document = editor.document
  const text = document.getText()
  const newText = text.replace(/oldPattern/g, 'newText')
  
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(text.length)
  )
  
  await editor.edit(editBuilder => {
    editBuilder.replace(fullRange, newText)
  })
}

// Targeted text replacement (replaces alpaca-edit)
async function replaceTextInRange(
  editor: vscode.TextEditor,
  startLine: number,
  endLine: number,
  newText: string
) {
  const range = new vscode.Range(
    new vscode.Position(startLine, 0),
    new vscode.Position(endLine, 0)
  )
  
  await editor.edit(editBuilder => {
    editBuilder.replace(range, newText)
  })
}
```

## Shell Integration

### Legacy: execute-bash
**Purpose**: Execute shell commands
**Modern Equivalent**: VS Code Terminal API

```typescript
// Execute commands in terminal (replaces execute-bash)
const terminal = vscode.window.createTerminal('Roo Code')
terminal.sendText('npm install')
terminal.show()

// Execute and capture output
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function executeCommand(command: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(command)
    return stdout
  } catch (error) {
    throw new Error(`Command failed: ${error}`)
  }
}
```

## Git Integration

### Legacy: hook-creation
**Purpose**: Create and manage Git hooks
**Modern Equivalent**: VS Code Git API and File System API

```typescript
// Create Git hooks (replaces hook-creation)
async function createGitHook(hookName: string, hookContent: string) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
  if (!workspaceFolder) return
  
  const hookPath = vscode.Uri.joinPath(
    workspaceFolder.uri,
    '.git',
    'hooks',
    hookName
  )
  
  const content = new TextEncoder().encode(hookContent)
  await vscode.workspace.fs.writeFile(hookPath, content)
  
  // Make hook executable (Unix systems)
  if (process.platform !== 'win32') {
    const { exec } = require('child_process')
    exec(`chmod +x "${hookPath.fsPath}"`)
  }
}
```

## Migration Guidelines

### From Legacy to Modern APIs

1. **Replace Direct File Operations**
   - Use `vscode.workspace.fs` instead of direct file system access
   - Leverage VS Code's file watching and change detection
   - Respect VS Code's file system abstraction

2. **Integrate with Editor State**
   - Use `vscode.window.activeTextEditor` for current file operations
   - Respect user's cursor position and selections
   - Integrate with VS Code's undo/redo system

3. **Improve Error Handling**
   - Use VS Code's notification system for user feedback
   - Implement proper error recovery and user guidance
   - Leverage VS Code's problem reporting system

4. **Enhance User Experience**
   - Use VS Code's progress indicators for long operations
   - Implement cancellation support for user operations
   - Provide contextual commands and menus

### Best Practices for Migration

1. **Gradual Migration**
   - Migrate one tool at a time
   - Maintain backward compatibility during transition
   - Test thoroughly with real-world scenarios

2. **Security Improvements**
   - Use VS Code's permission system
   - Validate all user inputs
   - Implement proper sandboxing

3. **Performance Optimization**
   - Use VS Code's efficient APIs
   - Implement proper caching and memoization
   - Minimize file system operations

4. **Integration Benefits**
   - Leverage VS Code's theming and styling
   - Integrate with existing VS Code workflows
   - Use VS Code's configuration system

## Deprecated Patterns

### Avoid These Legacy Patterns

```typescript
// ❌ Direct file system access
import * as fs from 'fs'
fs.writeFileSync('/path/to/file', content)

// ✅ Use VS Code APIs
await vscode.workspace.fs.writeFile(uri, encodedContent)

// ❌ Synchronous operations
const content = fs.readFileSync('/path/to/file', 'utf8')

// ✅ Asynchronous with proper error handling
try {
  const content = await vscode.workspace.fs.readFile(uri)
  const text = new TextDecoder().decode(content)
} catch (error) {
  vscode.window.showErrorMessage(`Failed to read file: ${error.message}`)
}
```

## Support and Resources

### Documentation
- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code Workspace API](https://code.visualstudio.com/api/references/vscode-api#workspace)
- [VS Code File System API](https://code.visualstudio.com/api/references/vscode-api#FileSystem)

### Migration Support
- Review legacy tool documentation in [`docs/legacy/kiro/tools/`](../../legacy/kiro/tools/)
- Consult the [specification workflow](../contributing/specification-workflow.md) for complex migrations
- Use the [development guidelines](../contributing/) for implementation standards

---

**Version**: 1.0  
**Last Updated**: January 28, 2024  
**Migrated From**: Legacy Kiro tool documentation  
**Status**: Reference Documentation

*This reference helps developers transition from legacy Kiro tools to modern VS Code APIs while maintaining functionality and improving user experience.*
