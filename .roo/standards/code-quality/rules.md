---
title: "Code Quality Rules"
category: "Development Standards"
subcategory: "Code Quality"
tags: ["testing", "linting", "styling", "code-quality"]
last_updated: "2025-07-29"
applicability: "All projects"
confidence: "High"
---

# Code Quality Rules

## 1. Test Coverage

### Principles
- All code changes must have comprehensive test coverage
- Tests must pass before any code is submitted
- Testing frameworks and configurations are standardized

### Implementation
- Before attempting completion, always make sure that any code changes have test coverage
- Ensure all tests pass before submitting changes
- The vitest framework is used for testing; the `describe`, `test`, `it`, etc functions are defined by default in `tsconfig.json` and therefore don't need to be imported
- Tests must be run from the same directory as the `package.json` file that specifies `vitest` in `devDependencies`
- Run tests with: `npx vitest run <relative-path-from-workspace-root>`
- Do NOT run tests from project root - this causes "vitest: command not found" error
- Tests must be run from inside the correct workspace:
  - Backend tests: `cd src && npx vitest run path/to/test-file` (don't include `src/` in path)
  - UI tests: `cd webview-ui && npx vitest run src/path/to/test-file`

### Examples
- For `src/tests/user.test.ts`, run `cd src && npx vitest run tests/user.test.ts` NOT `npx vitest run src/tests/user.test.ts`

### Related Rules
- See also: [Rule Testing Guidelines](../testing/guidelines.md)
- See also: Development Workflow rules

## 2. Lint Rules

### Principles
- All code must pass strict linting rules automatically enforced by the system
- Linting provides consistent code quality and prevents common errors
- No warnings are allowed - all lint issues must be resolved as errors

### Implementation
- Linting rules are automatically applied during code analysis and cannot be bypassed
- Common linting configurations include:
  - ESLint with @typescript-eslint/recommended and prettier configurations
  - Strict TypeScript compiler options (noImplicitAny, strictNullChecks, etc.)
  - Accessibility linting for UI components
  - Security linting rules for potential vulnerabilities

### Related Rules
- See also: Security Practices rules
- See also: Accessibility Guidelines rules

## 3. Styling Guidelines

### Principles
- Consistent styling improves code readability and maintainability
- Use established frameworks and conventions

### Implementation
- Use Tailwind CSS classes instead of inline style objects for new markup
- VSCode CSS variables must be added to webview-ui/src/index.css before using them in Tailwind classes
- Example: `<div className="text-md text-vscode-descriptionForeground mb-2" />` instead of style objects

### Related Rules
- See also: Project Structure rules
