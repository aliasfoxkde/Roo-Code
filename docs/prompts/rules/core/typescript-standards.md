# TypeScript Standards

Comprehensive TypeScript guidelines and standards for the Roo Code VS Code Extension project.

## Core TypeScript Requirements

### Version and Configuration
- **Version**: Use TypeScript 5.0+ syntax and features
- **Strict Mode**: Strict type checking enabled (`strict: true` in tsconfig.json)
- **Configuration**: Ensure proper tsconfig.json setup with strict rules

### Type Safety Standards

#### No `any` Types
```typescript
// ❌ AVOID: Using any without justification
function processData(data: any): any {
  return data.someProperty;
}

// ✅ PREFERRED: Proper typing
interface DataStructure {
  someProperty: string;
  otherProperty: number;
}

function processData(data: DataStructure): string {
  return data.someProperty;
}

// ✅ ACCEPTABLE: When truly dynamic, use unknown
function processUnknownData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'someProperty' in data) {
    return String((data as { someProperty: unknown }).someProperty);
  }
  throw new Error('Invalid data structure');
}
```

#### Prefer `unknown` Over `any`
```typescript
// ✅ PREFERRED: Use unknown for truly dynamic content
function parseJsonSafely(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Type guard for safe usage
function isUserData(data: unknown): data is { name: string; email: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'email' in data &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).email === 'string'
  );
}
```

### Advanced TypeScript Features

#### Generic Constraints
```typescript
// ✅ PREFERRED: Proper generic constraints
interface Identifiable {
  id: string;
}

function updateEntity<T extends Identifiable>(
  entities: T[],
  id: string,
  updates: Partial<Omit<T, 'id'>>
): T[] {
  return entities.map(entity =>
    entity.id === id ? { ...entity, ...updates } : entity
  );
}

// Usage with proper type inference
interface User extends Identifiable {
  name: string;
  email: string;
}

const users: User[] = [
  { id: '1', name: 'John', email: 'john@example.com' }
];

const updatedUsers = updateEntity(users, '1', { name: 'Jane' });
```

#### Conditional Types
```typescript
// ✅ PREFERRED: Conditional types for complex scenarios
type ApiResponse<T> = T extends string
  ? { message: T }
  : T extends number
  ? { count: T }
  : { data: T };

// Usage
type StringResponse = ApiResponse<string>; // { message: string }
type NumberResponse = ApiResponse<number>; // { count: number }
type ObjectResponse = ApiResponse<User>; // { data: User }
```

#### Discriminated Unions for Error Types
```typescript
// ✅ PREFERRED: Discriminated unions for error handling
interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult<E = Error> {
  success: false;
  error: E;
}

type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;

// Specific error types
interface ValidationError {
  type: 'validation';
  field: string;
  message: string;
}

interface NetworkError {
  type: 'network';
  status: number;
  message: string;
}

type ApiError = ValidationError | NetworkError;

// Usage with type guards
function handleApiResult(result: Result<User, ApiError>): void {
  if (result.success) {
    // TypeScript knows result.data is User
    console.log(`Welcome, ${result.data.name}!`);
  } else {
    // TypeScript knows result.error is ApiError
    switch (result.error.type) {
      case 'validation':
        console.error(`Validation error in ${result.error.field}: ${result.error.message}`);
        break;
      case 'network':
        console.error(`Network error ${result.error.status}: ${result.error.message}`);
        break;
    }
  }
}
```

### Interface and Type Design

#### Consistent Interface Naming
```typescript
// ✅ PREFERRED: Clear, descriptive interface names
interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

// ✅ PREFERRED: Use type for unions and computed types
type Theme = 'light' | 'dark';
type UserRole = 'admin' | 'user' | 'guest';
type UserWithRole = UserProfile & { role: UserRole };
```

#### Utility Types Usage
```typescript
// ✅ PREFERRED: Leverage TypeScript utility types
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

interface UpdateUserRequest extends Partial<Omit<CreateUserRequest, 'password'>> {
  id: string;
}

// ✅ PREFERRED: Pick and Omit for focused interfaces
type UserPublicInfo = Pick<UserProfile, 'id' | 'name'>;
type UserPrivateInfo = Omit<UserProfile, 'id'>;
```

### Function and Method Typing

#### Explicit Return Types
```typescript
// ✅ PREFERRED: Explicit return types for public functions
async function fetchUser(id: string): Promise<Result<User, ApiError>> {
  try {
    const response = await api.get(`/users/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: mapToApiError(error) };
  }
}

// ✅ PREFERRED: Explicit return types for complex functions
function createUserValidator(): (user: unknown) => Result<User, ValidationError[]> {
  return (user: unknown) => {
    const errors: ValidationError[] = [];
    
    if (!isValidUser(user)) {
      errors.push({
        type: 'validation',
        field: 'user',
        message: 'Invalid user structure'
      });
    }
    
    return errors.length === 0
      ? { success: true, data: user as User }
      : { success: false, error: errors };
  };
}
```

#### Type Guards
```typescript
// ✅ PREFERRED: Comprehensive type guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value &&
    isString((value as any).id) &&
    isString((value as any).name) &&
    isString((value as any).email)
  );
}

// ✅ PREFERRED: Generic type guard factory
function hasProperty<T extends string>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> {
  return typeof obj === 'object' && obj !== null && prop in obj;
}
```

### Module and Import Standards

#### Consistent Import Organization
```typescript
// ✅ PREFERRED: Organized imports
// 1. Node modules
import * as vscode from 'vscode';
import { EventEmitter } from 'events';

// 2. Internal modules (absolute paths)
import { ApiClient } from '@/services/api';
import { Logger } from '@/utils/logger';

// 3. Relative imports
import { UserService } from './user-service';
import { validateUser } from '../validators/user-validator';

// 4. Type-only imports
import type { User, UserPreferences } from '@/types/user';
import type { ApiResponse } from './types';
```

#### Export Standards
```typescript
// ✅ PREFERRED: Named exports for better tree-shaking
export { UserService } from './user-service';
export { ApiClient } from './api-client';
export type { User, UserPreferences } from './types';

// ✅ PREFERRED: Default exports only for main module entry points
export default class MainExtension {
  // Implementation
}
```

### Error Handling with TypeScript

#### Typed Error Classes
```typescript
// ✅ PREFERRED: Typed error classes
abstract class BaseError extends Error {
  abstract readonly type: string;
  
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends BaseError {
  readonly type = 'validation' as const;
  
  constructor(
    public readonly field: string,
    message: string,
    cause?: Error
  ) {
    super(`Validation failed for ${field}: ${message}`, cause);
  }
}

class NetworkError extends BaseError {
  readonly type = 'network' as const;
  
  constructor(
    public readonly status: number,
    message: string,
    cause?: Error
  ) {
    super(`Network error ${status}: ${message}`, cause);
  }
}
```

## Best Practices Summary

### Do's
- ✅ Use strict TypeScript configuration
- ✅ Prefer `unknown` over `any` for dynamic content
- ✅ Implement proper generic constraints
- ✅ Use discriminated unions for complex types
- ✅ Write explicit return types for public functions
- ✅ Create comprehensive type guards
- ✅ Organize imports consistently

### Don'ts
- ❌ Use `any` without explicit justification
- ❌ Ignore TypeScript errors or warnings
- ❌ Use type assertions without proper validation
- ❌ Create overly complex generic types
- ❌ Mix interfaces and types inconsistently

## Related Documentation

- [Development Principles](development-principles.md) - Core development standards
- [Error Handling](error-handling.md) - Error handling patterns and Result types
- [Code Quality & Linting](../quality/code-quality-linting.md) - ESLint rules for TypeScript
- [Testing Standards](../quality/testing-standards.md) - TypeScript testing patterns

---

*These TypeScript standards ensure type safety, maintainability, and consistency across the codebase.*
