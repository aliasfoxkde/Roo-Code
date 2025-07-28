# Code Quality Rules for Roo Code VS Code Extension

This directory contains the comprehensive coding standards and development guidelines for the Roo Code VS Code Extension project. The rules are organized into focused, modular files for better maintainability and discoverability.

## Quick Navigation

### 🏗️ Core Development Standards
Essential principles and standards that apply to all development work.

- **[Development Principles](core/development-principles.md)** - General development principles, code standards, and DRY principles
- **[TypeScript Standards](core/typescript-standards.md)** - TypeScript-specific rules, type safety, and modern syntax requirements
- **[Error Handling](core/error-handling.md)** - Consistent error handling patterns and Result/Either pattern implementation

### 🔍 Quality Assurance
Standards for maintaining high code quality and comprehensive testing.

- **[Testing Standards](quality/testing-standards.md)** - Test coverage requirements, testing frameworks, and test structure guidelines
- **[Code Quality & Linting](quality/code-quality-linting.md)** - ESLint configuration, quality gates, and automated checking
- **[Security & Privacy](quality/security-privacy.md)** - Security standards, data protection, and privacy guidelines

### 🏛️ Architecture & Design
Guidelines for system architecture, UI design, and performance optimization.

- **[VS Code Extension](architecture/vscode-extension.md)** - VS Code Extension API usage, webview management, and performance optimization
- **[UI & Styling](architecture/ui-styling.md)** - CSS standards, component architecture, and design system guidelines
- **[Performance Standards](architecture/performance.md)** - Performance requirements, monitoring, and optimization strategies

### 📋 Process & Management
Project management, documentation, and development methodology guidelines.

- **[Documentation Management](process/documentation-management.md)** - Documentation structure, project workflow, and ADR guidelines
- **[Development Methodology](process/development-methodology.md)** - Quality gates, tools, automation, and development practices
- **[Deployment & Release](process/deployment-release.md)** - Release process, versioning, and maintenance procedures

### ✅ Checklists & Workflows
Quick reference checklists for common development tasks.

- **[Development Workflow](checklists/development-workflow.md)** - Step-by-step development approach and required deliverables
- **[Quality Checklist](checklists/quality-checklist.md)** - Comprehensive quality assurance checklist
- **[Code Review Checklist](checklists/code-review-checklist.md)** - Code review guidelines and verification points

## How to Use This Documentation

### For New Team Members
1. Start with [Development Principles](core/development-principles.md) for foundational concepts
2. Review [TypeScript Standards](core/typescript-standards.md) for language-specific requirements
3. Familiarize yourself with [Testing Standards](quality/testing-standards.md)
4. Use the [Development Workflow](checklists/development-workflow.md) as your daily guide

### For Experienced Developers
- Use the navigation above to quickly access specific rule categories
- Reference the checklists for quality assurance and code reviews
- Consult architecture guidelines when making design decisions

### For Code Reviews
- Use the [Code Review Checklist](checklists/code-review-checklist.md) systematically
- Reference specific rule files when providing feedback
- Ensure all [Quality Checklist](checklists/quality-checklist.md) items are verified

## Rule Categories Overview

| Category | Focus Area | Key Files |
|----------|------------|-----------|
| **Core** | Fundamental development standards | Development principles, TypeScript, Error handling |
| **Quality** | Testing and code quality assurance | Testing, Linting, Security |
| **Architecture** | System design and performance | VS Code extensions, UI, Performance |
| **Process** | Project management and workflows | Documentation, Methodology, Deployment |
| **Checklists** | Quick reference and verification | Workflow, Quality gates, Code review |

## Contributing to These Rules

When updating or adding rules:

1. **Identify the correct category** - Place rules in the most appropriate file
2. **Maintain consistency** - Follow the established format and style
3. **Update cross-references** - Ensure links between files remain accurate
4. **Test examples** - Verify all code examples are functional and current
5. **Update this README** - Add new files or sections to the navigation

## Legacy Reference

The original comprehensive rules file has been preserved as `rules.md` for reference during the transition period. All content has been migrated to the modular structure above.

---

*This modular structure improves maintainability, discoverability, and developer workflow while preserving all original content and guidelines.*
