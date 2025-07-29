# Legacy Kiro Documentation

This directory contains preserved documentation from the legacy Kiro AI assistant system that was previously integrated with the Roo Code VS Code Extension.

## Migration Status

This content has been migrated to the new documentation structure as follows:

### Migrated Content
- **System Prompt Guidelines** → [`internal/prompts/system-prompt-guidelines.md`](../../internal/prompts/system-prompt-guidelines.md)
- **Specification Workflow** → [`developer/contributing/specification-workflow.md`](../../developer/contributing/specification-workflow.md)
- **Tool Documentation** → [`developer/api/legacy-tools.md`](../../developer/api/legacy-tools.md)

### Archived Files

#### Specification Documents
- `spec-design-document.md` - Original design document workflow
- `spec-implementation-plan.md` - Implementation planning guidelines
- `spec-requirements-clarification.md` - Requirements gathering process
- `spec-task-execution.md` - Task execution methodology

#### System Configuration
- `system-prompt.md` - Original Kiro system prompt and behavior guidelines

#### Tool Documentation (`tools/` directory)
- `alpaca-edit.md` - Legacy text editing tool
- `delete-file.md` - File deletion operations
- `execute-bash.md` - Shell command execution
- `file-search.md` - File discovery and search
- `fs-append.md` - File append operations
- `fs-write.md` - File writing operations
- `grep-search.md` - Text search within files
- `hook-creation.md` - Git hook creation and management
- `list-directory.md` - Directory listing operations
- `read-file.md` - File reading operations
- `read-multiple-files.md` - Batch file reading
- `simplified-edit.md` - Simplified text editing
- `str-replace.md` - String replacement operations

## Historical Context

The Kiro system was an earlier iteration of AI-assisted development tools that provided:

- **File Operations**: Direct file system manipulation and editing
- **Shell Integration**: Command-line tool execution and automation
- **Workflow Management**: Structured development process guidance
- **Code Analysis**: Text-based code examination and modification

## Evolution to Roo Code

The transition from Kiro to Roo Code represents a significant architectural evolution:

### Key Improvements
1. **VS Code Integration**: Native extension architecture instead of external tools
2. **Modern APIs**: VS Code Workspace API instead of direct file system access
3. **Enhanced Safety**: Sandboxed operations with proper error handling
4. **Better UX**: Integrated development experience within the editor
5. **Team Collaboration**: Shared configurations and team-oriented features

### Technology Migration
- **Legacy File Operations** → **VS Code Workspace API**
- **Shell Commands** → **VS Code Terminal Integration**
- **Text Processing** → **VS Code Text Editor API**
- **Configuration Files** → **Enhanced .roo Directory System**

## Modern Equivalents

For current development, use these modern alternatives:

| Legacy Kiro Tool | Modern Roo Code Equivalent |
|------------------|----------------------------|
| `fs-write`, `fs-append` | VS Code Workspace API (`vscode.workspace.fs`) |
| `delete-file` | VS Code File System API |
| `file-search`, `grep-search` | VS Code Search API (`vscode.workspace.findFiles`) |
| `str-replace`, `alpaca-edit` | VS Code Text Editor API |
| `execute-bash` | VS Code Terminal API |
| `read-file`, `read-multiple-files` | VS Code Document API |

## Reference Usage

This legacy documentation is preserved for:

1. **Historical Reference**: Understanding the evolution of the system
2. **Migration Assistance**: Helping users transition from legacy workflows
3. **Concept Documentation**: Preserving design decisions and rationale
4. **Educational Value**: Learning from previous implementation approaches

## Current Documentation

For up-to-date documentation and current features, please refer to:

- **[Main Documentation](../../README.md)** - Complete documentation hub
- **[User Guides](../../user/)** - End-user documentation
- **[Developer Documentation](../../developer/)** - Technical and API documentation
- **[Configuration Guide](../../user/configuration/roo-directory.md)** - .roo directory system

---

**Migration Date**: January 28, 2024  
**Legacy System**: Kiro AI Assistant  
**Current System**: Roo Code VS Code Extension  
**Status**: Archived for Historical Reference

*This content is preserved for historical reference and migration assistance. For current functionality, please use the modern Roo Code VS Code Extension documentation.*
