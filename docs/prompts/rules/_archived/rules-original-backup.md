# Code Quality Rules for Roo Code VS Code Extension

## 1. General Development Principles

### 1.1 Code Standards
- **Language**: Always use valid English and code syntax. NO Chinese characters in code, comments, or documentation
- **Pace**: Write deliberately, line-by-line, allowing for IntelliSense corrections and validation
- **Efficiency**: Identify repetitive tasks and handle programmatically rather than multiple API calls
- **Optimization**: Combine multiple reads into single requests to optimize performance
- **Process Management**: Use "Proceed While Running" for terminal executions that tie up console processes

### 1.2 TypeScript Standards
- Use TypeScript 5.0+ syntax and features
- Strict type checking enabled (`strict: true` in tsconfig.json)
- No `any` types without explicit justification and approval
- Prefer `unknown` over `any` for truly dynamic content
- Use proper generic constraints and conditional types
- Implement proper error types with discriminated unions

### 1.3 Error Handling Standards
- **Consistent Pattern**: Use Result/Either pattern for all operations that can fail
- **No Silent Failures**: Always handle errors explicitly
- **Structured Logging**: Include context and error codes
- **User-Friendly Messages**: Provide actionable guidance in error messages

```typescript
// ✅ PREFERRED: Result pattern
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

async function fetchUserData(id: string): Promise<Result<User, ApiError>> {
  try {
    const response = await api.get(`/users/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: new ApiError('Failed to fetch user', error) };
  }
}

// ❌ AVOID: Inconsistent error handling
async function getUserData(id: string) {
  const response = await api.get(`/users/${id}`); // Can throw
  return response.data;
}
```

## 2. Code Reusability & DRY Principles

### 2.1 Function Design Patterns

#### 2.1.1 Configuration Objects Over Multiple Parameters
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

#### 2.1.2 Higher-Order Functions for Reusability
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

#### 2.1.3 Factory Pattern for Object Creation
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

### 2.2 Generic Utility Functions

#### 2.2.1 Data Transformation Utilities
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

#### 2.2.2 Validation Utilities
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

## 3. Consistency Standards

### 3.1 API Interaction Patterns

#### 3.1.1 Standardized API Client
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

### 3.2 State Management Patterns

#### 3.2.1 Observable State Pattern
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

### 3.3 Component Architecture Standards

#### 3.3.1 Component Props Interface
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

## 4. VS Code Extension Development

### 4.1 Extension API Usage
- Follow VS Code Extension API best practices and lifecycle management
- Properly dispose of resources using `vscode.Disposable`
- Use `ExtensionContext.subscriptions` for automatic cleanup
- Implement proper activation/deactivation hooks
- Handle extension host restarts gracefully

### 4.2 Webview Management
```typescript
// ✅ PREFERRED: Webview factory pattern
interface WebviewConfig {
  viewType: string;
  title: string;
  showOptions: vscode.ViewColumn | vscode.WebviewPanelShowOptions;
  options: vscode.WebviewPanelOptions & vscode.WebviewOptions;
}

class WebviewFactory {
  static createPanel(config: WebviewConfig): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
      config.viewType,
      config.title,
      config.showOptions,
      config.options
    );

    // Standard CSP
    panel.webview.html = this.getWebviewContent(panel.webview, config);
    
    return panel;
  }

  private static getWebviewContent(webview: vscode.Webview, config: WebviewConfig): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};">
        <title>${config.title}</title>
    </head>
    <body>
        <!-- Content -->
    </body>
    </html>`;
  }
}
```

### 4.3 Performance Optimization
- Lazy load extension features using activation events
- Implement proper caching strategies for expensive operations
- Use VS Code's built-in progress indicators for long-running tasks
- Debounce user input events appropriately
- Monitor memory usage and implement cleanup procedures

## 5. Test Coverage & Quality Assurance

### 5.1 Testing Requirements
- **Coverage**: Minimum 80% code coverage for all new features
- **Test Types**: Unit, integration, and end-to-end tests required
- **Framework**: Use Vitest for testing with proper configuration
- **Pre-commit**: All tests must pass before code submission

### 5.2 Test Execution
- Tests run from workspace directory containing `package.json` with vitest dependency
- **Backend tests**: `cd src && npx vitest run path/to/test-file`
- **UI tests**: `cd webview-ui && npx vitest run src/path/to/test-file`
- **Example**: For `src/tests/user.test.ts`: `cd src && npx vitest run tests/user.test.ts`
- Global test functions (`describe`, `test`, `it`) available via tsconfig.json

### 5.3 Test Structure Standards
```typescript
// ✅ PREFERRED: Consistent test structure
describe('UserService', () => {
  let userService: UserService;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
    userService = new UserService(mockApiClient);
  });

  describe('getUserById', () => {
    it('should return user when API call succeeds', async () => {
      // Arrange
      const userId = '123';
      const expectedUser = { id: userId, name: 'John Doe' };
      mockApiClient.request.mockResolvedValue({ success: true, data: expectedUser });

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(expectedUser);
      }
      expect(mockApiClient.request).toHaveBeenCalledWith(`/users/${userId}`);
    });

    it('should return error when API call fails', async () => {
      // Arrange
      const userId = '123';
      const apiError = new ApiError('User not found', 404);
      mockApiClient.request.mockResolvedValue({ success: false, error: apiError });

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual(apiError);
      }
    });
  });
});
```

## 6. Code Quality & Linting

### 6.1 ESLint Configuration
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

### 6.2 Custom ESLint Rules
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

## 7. Styling & UI Guidelines

### 7.1 CSS Standards
- **Primary**: Use Tailwind CSS classes over inline styles
- **Variables**: Add VSCode CSS variables to `webview-ui/src/index.css` before use
- **Example**: `<div className="text-md text-vscode-descriptionForeground mb-2" />`
- **Responsive**: Implement mobile-first responsive design
- **Accessibility**: Follow WCAG 2.1 AA standards

### 7.2 Component Architecture
```typescript
// ✅ PREFERRED: Consistent component structure
interface ComponentProps extends BaseComponentProps {
  // Specific props
}

export const Component: React.FC<ComponentProps> = ({
  className,
  testId,
  'aria-label': ariaLabel,
  ...props
}) => {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = useCallback(() => {
    // Implementation
  }, []);

  // Render
  return (
    <div 
      className={cn('base-classes', className)}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {/* Content */}
    </div>
  );
};
```

## 8. Security & Privacy

### 8.1 Data Protection
- Never log sensitive user data
- Implement proper data sanitization
- Use secure communication protocols
- Follow GDPR and privacy regulations
- Encrypt sensitive data at rest and in transit

### 8.2 Extension Security
```typescript
// ✅ PREFERRED: Input validation
function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .trim()
    .slice(0, 1000); // Limit length
}
```

## 9. Performance & Monitoring

### 9.1 Performance Standards
- Extension activation time < 200ms
- Command execution time < 1s for common operations
- Memory usage monitoring and leak prevention
- Implement proper caching strategies
- Use lazy loading for heavy resources

### 9.2 Telemetry & Analytics
```typescript
// ✅ PREFERRED: Structured telemetry
interface TelemetryEvent {
  name: string;
  properties: Record<string, string | number | boolean>;
  timestamp: number;
}

class TelemetryService {
  track(eventName: string, properties: Record<string, any> = {}): void {
    const event: TelemetryEvent = {
      name: eventName,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now()
    };
    
    // Send to telemetry service
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, string | number | boolean> {
    // Remove sensitive data, ensure proper types
    return Object.entries(properties).reduce((acc, [key, value]) => {
      if (this.isSensitive(key)) return acc;
      
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        acc[key] = value;
      }
      
      return acc;
    }, {} as Record<string, string | number | boolean>);
  }
}
```

## 10. Documentation & Project Management

### 10.1 New Project Workflow
1. **Enhancement**: Use prompt_enhancer tool for requirement analysis
2. **Research**: Conduct deep research with Chain of Thought reasoning
3. **Planning**: Create `./docs/PLAN.md` for user review
4. **Refinement**: Question constraints and refine requirements
5. **Approval**: Get user approval before proceeding
6. **PRD**: Create `./docs/PRD.md` (Product Requirements Document)

### 10.2 Documentation Structure
```
./README.md (summary, navigation, usage)
./docs/
├── ARCHITECTURE.md
├── CHANGELOG.md
├── REQUIREMENTS.md
├── ROADMAP.md
├── SESSION.md
├── STANDARDS.md
├── SYSTEM.md
├── TASKS.md
├── ADR/ (Architectural Decision Records)
│   ├── 001-error-handling-pattern.md
│   ├── 002-state-management-approach.md
│   └── 003-api-client-design.md
└── tasks/
    ├── PHASE1_TASKS.md
    ├── PHASE2_TASKS.md
    └── ...
```

### 10.3 Architectural Decision Records (ADRs)
```markdown
# ADR-001: Error Handling Pattern

## Status
Accepted

## Context
We need a consistent way to handle errors across the application.

## Decision
Use Result<T, E> pattern for all operations that can fail.

## Consequences
- Explicit error handling
- Type-safe error propagation
- Consistent API across modules
- Requires training for developers unfamiliar with the pattern
```

## 11. Development Methodology

### 11.1 Quality Gates
- Zero TypeScript compilation errors
- Zero ESLint warnings
- All tests passing
- Code coverage thresholds met
- Security scan passed
- Performance benchmarks met

### 11.2 Tools & Automation
- **Testing**: Vitest for unit/integration tests
- **E2E**: Playwright for browser automation
- **Console Testing**: Puppeteer for console and routes testing
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with consistent configuration
- **CI/CD**: Automated testing and deployment pipelines

## 12. Deployment & Release Management

### 12.1 Release Process
- Semantic versioning (SemVer) for all releases
- Automated changelog generation
- Pre-release testing in staging environment
- Gradual rollout with feature flags
- Rollback procedures for failed deployments

### 12.2 Monitoring & Maintenance
- Monitor extension performance in production
- Track user feedback and feature requests
- Regular dependency updates and security patches
- Performance profiling and optimization
- User experience analytics and improvements

## REQUIRED APPROACH

### Development Workflow
1. Create numbered task list for each issue category
2. Fix ONE issue at a time, testing after each change
3. Ensure all TypeScript types are correct with no `any` usage
4. Test each component in isolation before integration
5. Verify layout persistence works correctly
6. Run ESLint and fix all warnings
7. Validate accessibility compliance
8. Check performance impact

### DELIVERABLES
- Provide detailed task list first
- Show incremental fixes with code snippets
- Test and verify each fix works before proceeding
- Ensure zero TypeScript/ESLint/Console errors
- Confirm all components render and function correctly
- Document all changes and their rationale
- Include performance impact assessment

### Quality Checklist
- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Accessibility validated
- [ ] Documentation updated
- [ ] Change log updated
- [ ] ADR created for architectural decisions
- [ ] Code follows established patterns
- [ ] No duplicate implementations

### Code Review Checklist
- [ ] Follows Result/Either pattern for error handling
- [ ] Uses configuration objects over multiple parameters
- [ ] Implements proper TypeScript types (no `any`)
- [ ] Includes comprehensive tests
- [ ] Follows naming conventions
- [ ] Uses established utility functions
- [ ] Proper resource disposal in VS Code extensions
- [ ] Consistent component architecture
- [ ] Security considerations addressed
- [ ] Performance impact assessed

Start by creating the detailed task list, then proceed with the first critical issue.
