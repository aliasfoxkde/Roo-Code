# Development Principles

Core development standards and principles that apply to all development work in the Roo Code VS Code Extension project.

## General Development Principles

### Code Standards
- **Language**: Always use valid English and code syntax. NO Chinese characters in code, comments, or documentation
- **Pace**: Write deliberately, line-by-line, allowing for IntelliSense corrections and validation
- **Efficiency**: Identify repetitive tasks and handle programmatically rather than multiple API calls
- **Optimization**: Combine multiple reads into single requests to optimize performance
- **Process Management**: Use "Proceed While Running" for terminal executions that tie up console processes

### TypeScript Standards
- Use TypeScript 5.0+ syntax and features
- Strict type checking enabled (`strict: true` in tsconfig.json)
- No `any` types without explicit justification and approval
- Prefer `unknown` over `any` for truly dynamic content
- Use proper generic constraints and conditional types
- Implement proper error types with discriminated unions

> **Note**: For detailed TypeScript guidelines, see [TypeScript Standards](typescript-standards.md)

### Error Handling Standards
- **Consistent Pattern**: Use Result/Either pattern for all operations that can fail
- **No Silent Failures**: Always handle errors explicitly
- **Structured Logging**: Include context and error codes
- **User-Friendly Messages**: Provide actionable guidance in error messages

> **Note**: For comprehensive error handling patterns, see [Error Handling](error-handling.md)

## Code Reusability & DRY Principles

### Function Design Patterns

#### Configuration Objects Over Multiple Parameters
```typescript
// ✅ PREFERRED: Configuration object
interface ApiRequestConfig {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

async function makeApiRequest<T>(config: ApiRequestConfig): Promise<Result<T>> {
  const { endpoint, method = 'GET', headers = {}, timeout = 5000, retries = 3 } = config;
  // Implementation
}

// ❌ AVOID: Multiple parameters
async function makeApiRequest(endpoint: string, method: string, headers: any, timeout: number, retries: number) {
  // Hard to maintain and extend
}
```

#### Higher-Order Functions for Reusability
```typescript
// ✅ PREFERRED: Generic retry mechanism
function withRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  maxRetries: number = 3,
  delay: number = 1000
) {
  return async (...args: T): Promise<R> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError!;
  };
}

// Usage
const fetchWithRetry = withRetry(fetchUserData, 3, 1000);
```

#### Factory Pattern for Object Creation
```typescript
// ✅ PREFERRED: Factory pattern
interface CommandConfig {
  id: string;
  title: string;
  category: string;
  handler: () => void;
}

class CommandFactory {
  static createCommand(config: CommandConfig): vscode.Disposable {
    return vscode.commands.registerCommand(config.id, () => {
      try {
        config.handler();
        telemetry.track('command_executed', { commandId: config.id, category: config.category });
      } catch (error) {
        logger.error(`Command ${config.id} failed`, error);
        vscode.window.showErrorMessage(`Failed to execute ${config.title}`);
      }
    });
  }
}
```

### Generic Utility Functions

#### Data Transformation Utilities
```typescript
// ✅ PREFERRED: Generic transformation utilities
function mapAsync<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  return Promise.all(
    items.map((item, index) => mapper(item, index))
  );
}

function groupBy<T, K extends string | number>(
  items: T[],
  keySelector: (item: T) => K
): Record<K, T[]> {
  return items.reduce((groups, item) => {
    const key = keySelector(item);
    (groups[key] = groups[key] || []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
}
```

#### Validation Utilities
```typescript
// ✅ PREFERRED: Composable validation
type ValidationRule<T> = (value: T) => string | null;

function createValidator<T>(...rules: ValidationRule<T>[]) {
  return (value: T): Result<T, string[]> => {
    const errors = rules.map(rule => rule(value)).filter(Boolean) as string[];
    return errors.length === 0 
      ? { success: true, data: value }
      : { success: false, error: errors };
  };
}

// Usage
const validateEmail = createValidator<string>(
  (email) => email.includes('@') ? null : 'Email must contain @',
  (email) => email.length > 5 ? null : 'Email too short'
);
```

## Consistency Standards

### API Interaction Patterns

#### Standardized API Client
```typescript
// ✅ PREFERRED: Consistent API client
interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

class ApiClient {
  constructor(private config: ApiClientConfig) {}

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<Result<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...this.config.headers, ...options.headers },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return { success: false, error: new ApiError(response.statusText, response.status) };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      clearTimeout(timeoutId);
      return { success: false, error: error as Error };
    }
  }
}
```

### State Management Patterns

#### Observable State Pattern
```typescript
// ✅ PREFERRED: Consistent state management
interface StateChange<T> {
  previous: T;
  current: T;
  timestamp: number;
}

class ObservableState<T> {
  private _value: T;
  private _listeners: Array<(change: StateChange<T>) => void> = [];

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  set(newValue: T): void {
    const previous = this._value;
    this._value = newValue;
    
    const change: StateChange<T> = {
      previous,
      current: newValue,
      timestamp: Date.now()
    };

    this._listeners.forEach(listener => listener(change));
  }

  subscribe(listener: (change: StateChange<T>) => void): () => void {
    this._listeners.push(listener);
    return () => {
      const index = this._listeners.indexOf(listener);
      if (index > -1) this._listeners.splice(index, 1);
    };
  }
}
```

### Component Architecture Standards

#### Component Props Interface
```typescript
// ✅ PREFERRED: Consistent component interfaces
interface BaseComponentProps {
  className?: string;
  testId?: string;
  'aria-label'?: string;
}

interface ButtonProps extends BaseComponentProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// ❌ AVOID: Inconsistent prop naming
interface SomeButtonProps {
  type: string; // Should be 'variant'
  isDisabled: boolean; // Should be 'disabled'
  clickHandler: () => void; // Should be 'onClick'
}
```

## Related Documentation

- [TypeScript Standards](typescript-standards.md) - Detailed TypeScript guidelines
- [Error Handling](error-handling.md) - Comprehensive error handling patterns
- [Testing Standards](../quality/testing-standards.md) - Testing requirements and patterns
- [Code Quality & Linting](../quality/code-quality-linting.md) - Quality assurance guidelines

---

*These principles form the foundation of all development work. Ensure familiarity with these patterns before proceeding to specialized guidelines.*
