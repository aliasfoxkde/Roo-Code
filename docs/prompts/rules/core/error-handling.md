# Error Handling Standards

Comprehensive error handling patterns and standards for the Roo Code VS Code Extension project.

## Core Error Handling Principles

### Consistent Pattern: Result/Either Pattern
- **Use Result/Either pattern** for all operations that can fail
- **No Silent Failures**: Always handle errors explicitly
- **Structured Logging**: Include context and error codes
- **User-Friendly Messages**: Provide actionable guidance in error messages

## Result Pattern Implementation

### Basic Result Type
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

### Advanced Result Utilities
```typescript
// ✅ PREFERRED: Result utility functions
class ResultUtils {
  static ok<T>(data: T): Result<T, never> {
    return { success: true, data };
  }

  static error<E>(error: E): Result<never, E> {
    return { success: false, error };
  }

  static map<T, U, E>(
    result: Result<T, E>,
    mapper: (data: T) => U
  ): Result<U, E> {
    return result.success
      ? ResultUtils.ok(mapper(result.data))
      : result;
  }

  static flatMap<T, U, E>(
    result: Result<T, E>,
    mapper: (data: T) => Result<U, E>
  ): Result<U, E> {
    return result.success ? mapper(result.data) : result;
  }

  static mapError<T, E, F>(
    result: Result<T, E>,
    mapper: (error: E) => F
  ): Result<T, F> {
    return result.success
      ? result
      : ResultUtils.error(mapper(result.error));
  }
}

// Usage example
const processUser = async (id: string): Promise<Result<ProcessedUser, ProcessingError>> => {
  const userResult = await fetchUserData(id);
  
  return ResultUtils.flatMap(userResult, user =>
    ResultUtils.map(validateUser(user), validUser =>
      processValidUser(validUser)
    )
  );
};
```

## Error Type Definitions

### Base Error Classes
```typescript
// ✅ PREFERRED: Structured error hierarchy
abstract class BaseError extends Error {
  abstract readonly type: string;
  abstract readonly code: string;
  
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      type: this.type,
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack
    };
  }
}

// Specific error types
class ValidationError extends BaseError {
  readonly type = 'validation' as const;
  
  constructor(
    public readonly code: string,
    public readonly field: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(`Validation failed for ${field}: ${message}`, undefined, context);
  }
}

class NetworkError extends BaseError {
  readonly type = 'network' as const;
  
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
    cause?: Error,
    context?: Record<string, unknown>
  ) {
    super(`Network error ${status}: ${message}`, cause, context);
  }
}

class BusinessLogicError extends BaseError {
  readonly type = 'business' as const;
  
  constructor(
    public readonly code: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, undefined, context);
  }
}
```

### API Error Handling
```typescript
// ✅ PREFERRED: Comprehensive API error handling
class ApiError extends BaseError {
  readonly type = 'api' as const;
  
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
    public readonly endpoint: string,
    cause?: Error
  ) {
    super(message, cause, { endpoint, status });
  }

  static fromResponse(response: Response, endpoint: string): ApiError {
    const code = `HTTP_${response.status}`;
    const message = `API request failed: ${response.statusText}`;
    return new ApiError(code, response.status, message, endpoint);
  }

  static fromNetworkError(error: Error, endpoint: string): ApiError {
    return new ApiError('NETWORK_ERROR', 0, 'Network request failed', endpoint, error);
  }
}

// Usage in API client
class ApiClient {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<Result<T, ApiError>> {
    try {
      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        return ResultUtils.error(ApiError.fromResponse(response, endpoint));
      }
      
      const data = await response.json();
      return ResultUtils.ok(data);
    } catch (error) {
      return ResultUtils.error(
        ApiError.fromNetworkError(error as Error, endpoint)
      );
    }
  }
}
```

## Error Handling Patterns

### Service Layer Error Handling
```typescript
// ✅ PREFERRED: Service layer with proper error handling
class UserService {
  constructor(
    private apiClient: ApiClient,
    private logger: Logger
  ) {}

  async getUser(id: string): Promise<Result<User, UserServiceError>> {
    this.logger.debug('Fetching user', { userId: id });
    
    const result = await this.apiClient.request<User>(`/users/${id}`);
    
    if (!result.success) {
      this.logger.error('Failed to fetch user', {
        userId: id,
        error: result.error.toJSON()
      });
      
      return ResultUtils.error(
        new UserServiceError(
          'FETCH_FAILED',
          `Failed to fetch user ${id}`,
          { userId: id },
          result.error
        )
      );
    }
    
    this.logger.debug('User fetched successfully', { userId: id });
    return ResultUtils.ok(result.data);
  }

  async createUser(userData: CreateUserRequest): Promise<Result<User, UserServiceError>> {
    // Validate input
    const validationResult = this.validateCreateUserRequest(userData);
    if (!validationResult.success) {
      return ResultUtils.error(
        new UserServiceError(
          'VALIDATION_FAILED',
          'User data validation failed',
          { userData },
          validationResult.error
        )
      );
    }

    // Make API call
    const result = await this.apiClient.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' }
    });

    return ResultUtils.mapError(result, apiError =>
      new UserServiceError(
        'CREATE_FAILED',
        'Failed to create user',
        { userData },
        apiError
      )
    );
  }

  private validateCreateUserRequest(
    userData: CreateUserRequest
  ): Result<CreateUserRequest, ValidationError> {
    const errors: ValidationError[] = [];

    if (!userData.email || !userData.email.includes('@')) {
      errors.push(new ValidationError('INVALID_EMAIL', 'email', 'Must be a valid email'));
    }

    if (!userData.name || userData.name.length < 2) {
      errors.push(new ValidationError('INVALID_NAME', 'name', 'Must be at least 2 characters'));
    }

    return errors.length === 0
      ? ResultUtils.ok(userData)
      : ResultUtils.error(errors[0]); // Return first error for simplicity
  }
}

class UserServiceError extends BaseError {
  readonly type = 'user_service' as const;
  
  constructor(
    public readonly code: string,
    message: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, cause, context);
  }
}
```

### VS Code Extension Error Handling
```typescript
// ✅ PREFERRED: VS Code extension error handling
class ExtensionCommandHandler {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}

  async handleCreateUser(): Promise<void> {
    try {
      const userInput = await vscode.window.showInputBox({
        prompt: 'Enter user email',
        validateInput: (value) => {
          if (!value || !value.includes('@')) {
            return 'Please enter a valid email address';
          }
          return null;
        }
      });

      if (!userInput) {
        return; // User cancelled
      }

      const nameInput = await vscode.window.showInputBox({
        prompt: 'Enter user name',
        validateInput: (value) => {
          if (!value || value.length < 2) {
            return 'Name must be at least 2 characters';
          }
          return null;
        }
      });

      if (!nameInput) {
        return; // User cancelled
      }

      const result = await this.userService.createUser({
        email: userInput,
        name: nameInput,
        password: 'temporary' // In real app, handle this securely
      });

      if (result.success) {
        vscode.window.showInformationMessage(
          `User ${result.data.name} created successfully!`
        );
      } else {
        this.handleUserServiceError(result.error);
      }
    } catch (error) {
      this.logger.error('Unexpected error in createUser command', { error });
      vscode.window.showErrorMessage(
        'An unexpected error occurred. Please try again.'
      );
    }
  }

  private handleUserServiceError(error: UserServiceError): void {
    this.logger.error('User service error', { error: error.toJSON() });

    switch (error.code) {
      case 'VALIDATION_FAILED':
        vscode.window.showErrorMessage(
          `Validation error: ${error.message}`
        );
        break;
      case 'CREATE_FAILED':
        if (error.cause instanceof ApiError && error.cause.status === 409) {
          vscode.window.showErrorMessage(
            'A user with this email already exists.'
          );
        } else {
          vscode.window.showErrorMessage(
            'Failed to create user. Please check your connection and try again.'
          );
        }
        break;
      default:
        vscode.window.showErrorMessage(
          'An error occurred while creating the user.'
        );
    }
  }
}
```

## Error Logging and Monitoring

### Structured Logging
```typescript
// ✅ PREFERRED: Structured error logging
interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  [key: string]: unknown;
}

class Logger {
  error(message: string, context: LogContext & { error?: Error | BaseError }): void {
    const logEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context,
      error: context.error ? this.serializeError(context.error) : undefined
    };

    console.error(JSON.stringify(logEntry));
    
    // Send to monitoring service
    this.sendToMonitoring(logEntry);
  }

  private serializeError(error: Error | BaseError): object {
    if (error instanceof BaseError) {
      return error.toJSON();
    }
    
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  private sendToMonitoring(logEntry: object): void {
    // Implementation for sending to monitoring service
    // e.g., Sentry, DataDog, etc.
  }
}
```

## Best Practices Summary

### Do's
- ✅ Use Result pattern for all operations that can fail
- ✅ Create specific error types with proper inheritance
- ✅ Include context and error codes in all errors
- ✅ Log errors with structured data
- ✅ Provide user-friendly error messages
- ✅ Handle errors at appropriate boundaries
- ✅ Use type-safe error handling patterns

### Don'ts
- ❌ Throw errors without proper handling
- ❌ Use generic Error class for business logic errors
- ❌ Ignore or swallow errors silently
- ❌ Expose internal error details to users
- ❌ Use error handling for control flow
- ❌ Create overly complex error hierarchies

## Related Documentation

- [Development Principles](development-principles.md) - Core development standards
- [TypeScript Standards](typescript-standards.md) - TypeScript-specific guidelines
- [Testing Standards](../quality/testing-standards.md) - Error handling in tests
- [Code Quality & Linting](../quality/code-quality-linting.md) - Linting rules for error handling

---

*Consistent error handling improves reliability, debuggability, and user experience across the entire application.*
