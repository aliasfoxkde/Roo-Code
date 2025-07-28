# Code Quality Rules for Roo Code VS Code Extension

> **⚠️ IMPORTANT: This file has been restructured into a modular format for better maintainability and discoverability.**
>
> **Please use the new modular structure located in the organized directories below.**

## 🔄 Migration Notice

This comprehensive rules file has been split into focused, modular files organized by category. The new structure provides:

- **Better Navigation**: Find specific rules quickly
- **Improved Maintainability**: Update specific rule categories independently
- **Enhanced Discoverability**: Role-based organization for different team members
- **Reduced Complexity**: Smaller, focused files instead of one large document

## 📁 New Modular Structure

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

## 🚀 Quick Start Guide

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

## 📊 Rule Categories Overview

| Category | Focus Area | Key Files |
|----------|------------|-----------|
| **Core** | Fundamental development standards | Development principles, TypeScript, Error handling |
| **Quality** | Testing and code quality assurance | Testing, Linting, Security |
| **Architecture** | System design and performance | VS Code extensions, UI, Performance |
| **Process** | Project management and workflows | Documentation, Methodology, Deployment |
| **Checklists** | Quick reference and verification | Workflow, Quality gates, Code review |

## 🔗 Navigation Hub

**👉 [Start with the comprehensive README](README.md) for detailed navigation and usage instructions.**

## 📚 Legacy Reference

The original comprehensive rules file has been preserved as `rules-original-backup.md` for reference during the transition period. All content has been migrated to the modular structure above with improvements and additional detail.

---

*This modular structure improves maintainability, discoverability, and developer workflow while preserving all original content and guidelines.*
