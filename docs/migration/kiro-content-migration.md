# Kiro Content Migration Plan

This document outlines the migration of content from the legacy `docs/kiro/` directory to the new documentation structure.

## Migration Overview

The `docs/kiro/` directory contains legacy documentation from the Kiro AI assistant system. This content needs to be evaluated, updated, and integrated into the new Roo Code documentation structure.

## Content Audit Results

### Files to Migrate and Update

#### 1. System Prompt Guidelines (`kiro/system-prompt.md`)
**Target Location**: `internal/prompts/system-prompt-guidelines.md`
**Status**: Migrate with updates
**Changes Needed**:
- Update references from "Kiro" to "Roo Code"
- Modernize guidelines for current VS Code extension context
- Remove outdated platform-specific commands
- Focus on extension-specific behavior

#### 2. Specification Workflows (`kiro/spec-*.md`)
**Target Location**: `developer/contributing/specification-workflow.md`
**Status**: Consolidate and update
**Files to Merge**:
- `spec-design-document.md`
- `spec-implementation-plan.md`
- `spec-requirements-clarification.md`
- `spec-task-execution.md`

**Changes Needed**:
- Adapt for VS Code extension development
- Update tool references
- Modernize workflow for current development practices

#### 3. Tool Documentation (`kiro/tool-*.md`)
**Target Location**: `developer/api/legacy-tools.md`
**Status**: Archive with reference
**Files to Archive**:
- `alpaca-edit.md`
- `delete-file.md`
- `execute-bash.md`
- `file-search.md`
- `fs-append.md`
- `fs-write.md`
- `grep-search.md`
- `list-directory.md`
- `read-file.md`
- `read-multiple-files.md`
- `simplified-edit.md`
- `str-replace.md`

**Changes Needed**:
- Document as legacy reference
- Note modern VS Code API equivalents
- Provide migration guidance

### Files to Archive

#### Legacy Tool Documentation
Most tool-specific documentation is outdated and specific to the old Kiro system. These will be moved to `legacy/kiro/` for historical reference.

#### Outdated Workflows
Some workflow documentation is specific to the old system architecture and will be archived rather than migrated.

## Migration Implementation

### Phase 1: Content Extraction and Updating

#### System Prompt Guidelines
```markdown
# Target: internal/prompts/system-prompt-guidelines.md

# Roo Code System Prompt Guidelines

## Identity
You are Roo Code, an AI assistant and VS Code extension built to assist developers.

## Capabilities
- Knowledge about the user's VS Code workspace and project context
- Recommend edits to local files and code
- Provide software development assistance
- Help with infrastructure and configurations
- Guide users on best practices
- Analyze and optimize code
- Assist with debugging and troubleshooting

## Response Style
- Be knowledgeable without being instructive
- Show expertise while remaining approachable
- Be decisive, precise, and clear
- Use supportive, not authoritative tone
- Stay warm and friendly
- Keep responses concise and actionable
```

#### Specification Workflow
```markdown
# Target: developer/contributing/specification-workflow.md

# Specification Development Workflow

## Overview
This workflow guides the development of new features for the Roo Code extension.

## Phases

### 1. Requirements Clarification
- Gather detailed requirements
- Identify user needs and use cases
- Define acceptance criteria
- Document constraints and assumptions

### 2. Design Document Creation
- Develop comprehensive design based on requirements
- Include architecture diagrams
- Define component interfaces
- Specify data models and error handling
- Document design decisions and rationales

### 3. Implementation Planning
- Break down design into implementable tasks
- Define development phases
- Identify dependencies and risks
- Create testing strategy

### 4. Task Execution
- Implement according to plan
- Follow coding standards
- Write tests alongside implementation
- Document as you build
```

### Phase 2: Legacy Tool Reference

#### Legacy Tools Documentation
```markdown
# Target: developer/api/legacy-tools.md

# Legacy Tool Reference

This document provides reference information for legacy Kiro tools and their modern VS Code API equivalents.

## File Operations

### Legacy: fs-write, fs-append
**Modern Equivalent**: VS Code Workspace API
```typescript
import * as vscode from 'vscode'

// Write file
await vscode.workspace.fs.writeFile(uri, content)

// Read file
const content = await vscode.workspace.fs.readFile(uri)
```

### Legacy: delete-file
**Modern Equivalent**: VS Code File System API
```typescript
await vscode.workspace.fs.delete(uri)
```

## Search Operations

### Legacy: file-search, grep-search
**Modern Equivalent**: VS Code Search API
```typescript
const files = await vscode.workspace.findFiles(
  '**/*.ts',
  '**/node_modules/**'
)
```

## Text Editing

### Legacy: str-replace, alpaca-edit
**Modern Equivalent**: VS Code Text Editor API
```typescript
const editor = vscode.window.activeTextEditor
if (editor) {
  await editor.edit(editBuilder => {
    editBuilder.replace(range, newText)
  })
}
```
```

### Phase 3: Archive Structure

#### Legacy Directory Structure
```
docs/legacy/
├── kiro/                           # Preserved legacy content
│   ├── README.md                   # Migration notice
│   ├── system-prompt.md           # Original system prompt
│   ├── spec-design-document.md    # Original spec workflow
│   ├── spec-implementation-plan.md
│   ├── spec-requirements-clarification.md
│   ├── spec-task-execution.md
│   └── tools/                     # Tool documentation
│       ├── alpaca-edit.md
│       ├── delete-file.md
│       ├── execute-bash.md
│       ├── file-search.md
│       ├── fs-append.md
│       ├── fs-write.md
│       ├── grep-search.md
│       ├── list-directory.md
│       ├── read-file.md
│       ├── read-multiple-files.md
│       ├── simplified-edit.md
│       └── str-replace.md
└── migration-notes.md             # Migration documentation
```

## Implementation Steps

### Step 1: Create Target Directories
```bash
mkdir -p docs/internal/prompts
mkdir -p docs/developer/contributing
mkdir -p docs/developer/api
mkdir -p docs/legacy/kiro/tools
```

### Step 2: Migrate System Prompt Guidelines
1. Extract relevant guidelines from `kiro/system-prompt.md`
2. Update references and context for Roo Code
3. Create `internal/prompts/system-prompt-guidelines.md`

### Step 3: Consolidate Specification Workflow
1. Merge spec-related files into single workflow document
2. Update for VS Code extension development context
3. Create `developer/contributing/specification-workflow.md`

### Step 4: Create Legacy Tool Reference
1. Document modern VS Code API equivalents
2. Provide migration guidance
3. Create `developer/api/legacy-tools.md`

### Step 5: Archive Original Content
1. Move all original files to `legacy/kiro/`
2. Create migration notice in `legacy/kiro/README.md`
3. Update any existing links to point to new locations

### Step 6: Update Navigation
1. Update main documentation navigation
2. Add links to migrated content
3. Add deprecation notices where appropriate

## Migration Script

```bash
#!/bin/bash

# Create target directories
mkdir -p docs/internal/prompts
mkdir -p docs/developer/contributing
mkdir -p docs/developer/api
mkdir -p docs/legacy/kiro/tools

# Move tool documentation to legacy
mv docs/kiro/alpaca-edit.md docs/legacy/kiro/tools/
mv docs/kiro/delete-file.md docs/legacy/kiro/tools/
mv docs/kiro/execute-bash.md docs/legacy/kiro/tools/
mv docs/kiro/file-search.md docs/legacy/kiro/tools/
mv docs/kiro/fs-append.md docs/legacy/kiro/tools/
mv docs/kiro/fs-write.md docs/legacy/kiro/tools/
mv docs/kiro/grep-search.md docs/legacy/kiro/tools/
mv docs/kiro/list-directory.md docs/legacy/kiro/tools/
mv docs/kiro/read-file.md docs/legacy/kiro/tools/
mv docs/kiro/read-multiple-files.md docs/legacy/kiro/tools/
mv docs/kiro/simplified-edit.md docs/legacy/kiro/tools/
mv docs/kiro/str-replace.md docs/legacy/kiro/tools/

# Move specification files to legacy
mv docs/kiro/spec-*.md docs/legacy/kiro/

# Move system prompt to legacy
mv docs/kiro/system-prompt.md docs/legacy/kiro/

# Create migration notice
cat > docs/legacy/kiro/README.md << 'EOF'
# Legacy Kiro Documentation

This directory contains preserved documentation from the legacy Kiro AI assistant system.

## Migration Status

This content has been migrated to the new documentation structure:

- **System Prompt Guidelines** → `internal/prompts/system-prompt-guidelines.md`
- **Specification Workflow** → `developer/contributing/specification-workflow.md`
- **Tool Documentation** → `developer/api/legacy-tools.md`

## Historical Reference

The original files are preserved here for historical reference and to assist with understanding the evolution of the system.

For current documentation, please refer to the main documentation structure.
EOF

# Remove empty kiro directory
rmdir docs/kiro 2>/dev/null || echo "Kiro directory not empty, manual cleanup needed"

echo "Migration completed. Please review and update the migrated content."
```

## Validation

After migration:

1. **Content Review**: Ensure all migrated content is accurate and up-to-date
2. **Link Validation**: Check that all internal links work correctly
3. **Navigation Update**: Verify navigation reflects new structure
4. **Search Functionality**: Test that content is discoverable
5. **Team Review**: Have team members review migrated content

## Timeline

- **Week 1**: Content audit and migration planning
- **Week 2**: Migrate and update system prompt guidelines
- **Week 3**: Consolidate specification workflow documentation
- **Week 4**: Create legacy tool reference and archive original content

## Success Criteria

- All useful content migrated to appropriate locations
- Legacy content properly archived with migration notices
- Updated content reflects current Roo Code context
- Navigation and links updated throughout documentation
- No broken links or missing content

---

**Related**: [Documentation Architecture](../design/documentation-architecture-design.md) | [Contributing Guidelines](../developer/contributing/)
