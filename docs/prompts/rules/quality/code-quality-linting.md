# Code Quality & Linting Standards

Comprehensive code quality assurance and linting guidelines for the Roo Code VS Code Extension project.

## ESLint Configuration

### Base Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-readonly-parameter-types": "warn",
    "@typescript-eslint/explicit-function-return-type": "error",
    "prefer-const": "error",
    "no-var": "error",
    "no-duplicate-imports": "error",
    "consistent-return": "error"
  }
}
```

### Custom ESLint Rules

#### Enforce Result Pattern
```typescript
// Custom rule to enforce Result pattern
module.exports = {
  rules: {
    'enforce-result-pattern': {
      create(context) {
        return {
          FunctionDeclaration(node) {
            if (node.async && !node.returnType?.typeAnnotation?.typeName?.name?.includes('Result')) {
              context.report({
                node,
                message: 'Async functions must return Result<T> type'
              });
            }
          }
        };
      }
    }
  }
};
```

### Project-Specific Rules
```json
{
  "rules": {
    // TypeScript specific
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    
    // Import organization
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external",
        "internal",
        "parent",
        "sibling",
        "index"
      ],
      "newlines-between": "always"
    }],
    
    // Code style
    "prefer-const": "error",
    "no-var": "error",
    "no-duplicate-imports": "error",
    "consistent-return": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    
    // Security
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    
    // Performance
    "no-loop-func": "error",
    "no-inner-declarations": "error"
  }
}
```

## Quality Gates

### Pre-Commit Requirements
All of the following must pass before code submission:

- ✅ Zero TypeScript compilation errors
- ✅ Zero ESLint warnings
- ✅ All tests passing
- ✅ Code coverage thresholds met (80%+)
- ✅ Security scan passed
- ✅ Performance benchmarks met

### Automated Quality Checks
```typescript
// ✅ PREFERRED: Quality check automation
interface QualityCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

class QualityGateChecker {
  async runAllChecks(): Promise<QualityCheckResult> {
    const results = await Promise.all([
      this.checkTypeScript(),
      this.checkESLint(),
      this.checkTests(),
      this.checkCoverage(),
      this.checkSecurity(),
      this.checkPerformance()
    ]);

    const allPassed = results.every(result => result.passed);
    const allErrors = results.flatMap(result => result.errors);
    const allWarnings = results.flatMap(result => result.warnings);

    return {
      passed: allPassed,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  private async checkTypeScript(): Promise<QualityCheckResult> {
    // Run TypeScript compiler
    const result = await this.runCommand('npx tsc --noEmit');
    return {
      passed: result.exitCode === 0,
      errors: result.exitCode !== 0 ? ['TypeScript compilation failed'] : [],
      warnings: []
    };
  }

  private async checkESLint(): Promise<QualityCheckResult> {
    // Run ESLint
    const result = await this.runCommand('npx eslint . --ext .ts,.tsx');
    return {
      passed: result.exitCode === 0,
      errors: result.exitCode !== 0 ? ['ESLint errors found'] : [],
      warnings: result.warnings || []
    };
  }

  // Additional check methods...
}
```

## Code Style Standards

### Naming Conventions
```typescript
// ✅ PREFERRED: Consistent naming conventions

// Classes: PascalCase
class UserService {}
class ApiClient {}

// Interfaces: PascalCase with descriptive names
interface UserProfile {}
interface ApiRequestConfig {}

// Types: PascalCase
type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;
type UserRole = 'admin' | 'user' | 'guest';

// Functions and variables: camelCase
const getUserById = (id: string) => {};
const isValidEmail = (email: string) => {};

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

// Enums: PascalCase with descriptive values
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending'
}
```

### File Organization
```typescript
// ✅ PREFERRED: Consistent file structure

// 1. Imports (organized by type)
import * as vscode from 'vscode';
import { EventEmitter } from 'events';

import { ApiClient } from '@/services/api';
import { Logger } from '@/utils/logger';

import { UserService } from './user-service';
import { validateUser } from '../validators/user-validator';

import type { User, UserPreferences } from '@/types/user';

// 2. Types and interfaces
interface ComponentState {
  loading: boolean;
  error: string | null;
}

// 3. Constants
const DEFAULT_CONFIG = {
  timeout: 5000,
  retries: 3
};

// 4. Main implementation
export class ComponentManager {
  // Implementation
}

// 5. Helper functions (if any)
function createDefaultState(): ComponentState {
  return { loading: false, error: null };
}
```

### Comment Standards
```typescript
// ✅ PREFERRED: Meaningful comments

/**
 * Fetches user data with retry logic and error handling.
 * 
 * @param id - The unique user identifier
 * @param options - Configuration options for the request
 * @returns Promise resolving to Result containing user data or error
 * 
 * @example
 * ```typescript
 * const result = await fetchUserData('user-123', { timeout: 10000 });
 * if (result.success) {
 *   console.log(result.data.name);
 * }
 * ```
 */
async function fetchUserData(
  id: string,
  options: FetchOptions = {}
): Promise<Result<User, ApiError>> {
  // Validate input parameters
  if (!id || typeof id !== 'string') {
    return ResultUtils.error(new ValidationError('INVALID_ID', 'id', 'User ID must be a non-empty string'));
  }

  // Apply default options
  const config = { ...DEFAULT_FETCH_OPTIONS, ...options };

  try {
    // Make API request with retry logic
    const response = await this.apiClient.request(`/users/${id}`, {
      timeout: config.timeout
    });

    return response;
  } catch (error) {
    // Log error for debugging
    this.logger.error('Failed to fetch user data', {
      userId: id,
      error: error.message
    });

    return ResultUtils.error(
      new ApiError('FETCH_FAILED', 'Failed to fetch user data', error)
    );
  }
}

// ❌ AVOID: Obvious or redundant comments
// Increment counter by 1
counter++;

// Get user name
const name = user.name;
```

## Performance Standards

### Code Performance Guidelines
```typescript
// ✅ PREFERRED: Performance-conscious code

// Use efficient data structures
const userMap = new Map<string, User>(); // O(1) lookup
const userSet = new Set<string>(); // O(1) membership test

// Avoid unnecessary object creation in loops
function processUsers(users: User[]): ProcessedUser[] {
  const results: ProcessedUser[] = [];
  
  for (const user of users) {
    // Reuse objects when possible
    results.push(transformUser(user));
  }
  
  return results;
}

// Use lazy evaluation for expensive operations
class UserAnalytics {
  private _expensiveCalculation?: number;

  get expensiveValue(): number {
    if (this._expensiveCalculation === undefined) {
      this._expensiveCalculation = this.performExpensiveCalculation();
    }
    return this._expensiveCalculation;
  }

  private performExpensiveCalculation(): number {
    // Expensive computation here
    return 42;
  }
}

// Debounce user input
function createDebouncedHandler<T extends any[]>(
  fn: (...args: T) => void,
  delay: number
): (...args: T) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

### Memory Management
```typescript
// ✅ PREFERRED: Proper resource cleanup

class ResourceManager {
  private disposables: vscode.Disposable[] = [];
  private eventListeners: Map<string, Function> = new Map();

  addDisposable(disposable: vscode.Disposable): void {
    this.disposables.push(disposable);
  }

  addEventListener(event: string, listener: Function): void {
    this.eventListeners.set(event, listener);
    // Add actual event listener
  }

  dispose(): void {
    // Clean up all disposables
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables.length = 0;

    // Remove event listeners
    this.eventListeners.forEach((listener, event) => {
      // Remove actual event listener
    });
    this.eventListeners.clear();
  }
}
```

## Security Standards

### Input Validation
```typescript
// ✅ PREFERRED: Comprehensive input validation

function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') {
    throw new ValidationError('INVALID_TYPE', 'input', 'Input must be a string');
  }
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
    .slice(0, 1000); // Limit length
}

function validateEmail(email: string): Result<string, ValidationError> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return ResultUtils.error(
      new ValidationError('INVALID_EMAIL', 'email', 'Must be a valid email address')
    );
  }
  
  return ResultUtils.ok(email);
}
```

### Secure Coding Practices
```typescript
// ✅ PREFERRED: Secure coding patterns

// Never log sensitive data
function logUserAction(userId: string, action: string, metadata?: object): void {
  const sanitizedMetadata = metadata ? this.sanitizeLogData(metadata) : {};
  
  this.logger.info('User action performed', {
    userId: this.hashUserId(userId), // Hash PII
    action,
    metadata: sanitizedMetadata,
    timestamp: Date.now()
  });
}

// Use secure random generation
function generateSecureToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// Validate and sanitize file paths
function validateFilePath(filePath: string): Result<string, SecurityError> {
  // Prevent directory traversal
  if (filePath.includes('..') || filePath.includes('~')) {
    return ResultUtils.error(
      new SecurityError('INVALID_PATH', 'Path traversal detected')
    );
  }
  
  // Ensure path is within allowed directory
  const allowedDir = '/safe/directory';
  const resolvedPath = path.resolve(filePath);
  
  if (!resolvedPath.startsWith(allowedDir)) {
    return ResultUtils.error(
      new SecurityError('UNAUTHORIZED_PATH', 'Path outside allowed directory')
    );
  }
  
  return ResultUtils.ok(resolvedPath);
}
```

## Tools and Automation

### Development Tools
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with consistent configuration
- **Type Checking**: TypeScript compiler with strict mode
- **Testing**: Vitest for unit/integration tests
- **E2E Testing**: Playwright for browser automation
- **Console Testing**: Puppeteer for console and routes testing

### CI/CD Pipeline
```yaml
# ✅ PREFERRED: Comprehensive CI/CD quality checks
name: Quality Assurance
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Type check
        run: npx tsc --noEmit
        
      - name: Lint
        run: npx eslint . --ext .ts,.tsx
        
      - name: Test
        run: npx vitest run --coverage
        
      - name: Security audit
        run: npm audit --audit-level moderate
        
      - name: Performance benchmarks
        run: npm run benchmark
```

## Best Practices Summary

### Do's
- ✅ Use strict ESLint configuration with TypeScript rules
- ✅ Maintain zero warnings and errors
- ✅ Write performance-conscious code
- ✅ Implement proper input validation
- ✅ Use automated quality gates
- ✅ Follow consistent naming conventions
- ✅ Clean up resources properly

### Don'ts
- ❌ Disable linting rules without justification
- ❌ Ignore TypeScript errors or warnings
- ❌ Skip security considerations
- ❌ Write performance-degrading code
- ❌ Use `any` types without explicit approval
- ❌ Commit code that fails quality checks

## Related Documentation

- [TypeScript Standards](../core/typescript-standards.md) - TypeScript-specific guidelines
- [Testing Standards](testing-standards.md) - Testing requirements and patterns
- [Development Workflow](../checklists/development-workflow.md) - Quality checks in development process
- [Code Review Checklist](../checklists/code-review-checklist.md) - Quality verification in reviews

---

*Consistent code quality standards ensure maintainability, security, and performance across the entire codebase.*
