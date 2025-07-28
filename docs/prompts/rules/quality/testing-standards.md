# Testing Standards

Comprehensive testing requirements and guidelines for the Roo Code VS Code Extension project.

## Testing Requirements

### Coverage Standards
- **Minimum Coverage**: 80% code coverage for all new features
- **Test Types**: Unit, integration, and end-to-end tests required
- **Framework**: Use Vitest for testing with proper configuration
- **Pre-commit**: All tests must pass before code submission

### Test Execution
Tests run from workspace directory containing `package.json` with vitest dependency:

- **Backend tests**: `cd src && npx vitest run path/to/test-file`
- **UI tests**: `cd webview-ui && npx vitest run src/path/to/test-file`
- **Example**: For `src/tests/user.test.ts`: `cd src && npx vitest run tests/user.test.ts`

Global test functions (`describe`, `test`, `it`) are available via tsconfig.json configuration.

## Test Structure Standards

### Consistent Test Organization
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

### Test Naming Conventions
```typescript
// ✅ PREFERRED: Descriptive test names
describe('UserValidator', () => {
  describe('validateEmail', () => {
    it('should return success for valid email addresses', () => {
      // Test implementation
    });

    it('should return error for email without @ symbol', () => {
      // Test implementation
    });

    it('should return error for empty email', () => {
      // Test implementation
    });

    it('should return error for email with invalid domain', () => {
      // Test implementation
    });
  });
});

// ❌ AVOID: Vague test names
describe('UserValidator', () => {
  it('works', () => {
    // What does "works" mean?
  });

  it('validates email', () => {
    // What validation scenario?
  });
});
```

## Unit Testing Patterns

### Testing Result Pattern
```typescript
// ✅ PREFERRED: Testing Result pattern functions
describe('fetchUserData', () => {
  it('should return success result with user data', async () => {
    // Arrange
    const userId = 'user-123';
    const expectedUser = { id: userId, name: 'John Doe', email: 'john@example.com' };
    mockApiClient.get.mockResolvedValue({ data: expectedUser });

    // Act
    const result = await fetchUserData(userId);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(expectedUser);
    }
  });

  it('should return error result when API throws', async () => {
    // Arrange
    const userId = 'user-123';
    const apiError = new Error('Network error');
    mockApiClient.get.mockRejectedValue(apiError);

    // Act
    const result = await fetchUserData(userId);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ApiError);
      expect(result.error.message).toContain('Failed to fetch user');
    }
  });
});
```

### Testing Error Handling
```typescript
// ✅ PREFERRED: Comprehensive error testing
describe('UserService error handling', () => {
  it('should handle validation errors properly', async () => {
    // Arrange
    const invalidUserData = { email: 'invalid', name: '' };

    // Act
    const result = await userService.createUser(invalidUserData);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(UserServiceError);
      expect(result.error.code).toBe('VALIDATION_FAILED');
    }
  });

  it('should handle network errors gracefully', async () => {
    // Arrange
    const userData = { email: 'test@example.com', name: 'Test User' };
    mockApiClient.request.mockResolvedValue({
      success: false,
      error: new ApiError('NETWORK_ERROR', 0, 'Network request failed', '/users')
    });

    // Act
    const result = await userService.createUser(userData);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CREATE_FAILED');
      expect(result.error.cause).toBeInstanceOf(ApiError);
    }
  });
});
```

### Mock Creation Utilities
```typescript
// ✅ PREFERRED: Reusable mock factories
function createMockApiClient(): jest.Mocked<ApiClient> {
  return {
    request: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  } as jest.Mocked<ApiClient>;
}

function createMockLogger(): jest.Mocked<Logger> {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  } as jest.Mocked<Logger>;
}

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date('2023-01-01'),
    ...overrides
  };
}
```

## Integration Testing

### Service Integration Tests
```typescript
// ✅ PREFERRED: Integration test structure
describe('UserService Integration', () => {
  let userService: UserService;
  let testApiClient: ApiClient;

  beforeEach(() => {
    testApiClient = new ApiClient({
      baseUrl: 'http://localhost:3000/api',
      timeout: 5000,
      headers: { 'Authorization': 'Bearer test-token' }
    });
    userService = new UserService(testApiClient, new Logger());
  });

  it('should create and retrieve user successfully', async () => {
    // Arrange
    const userData = {
      name: 'Integration Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'test-password'
    };

    // Act - Create user
    const createResult = await userService.createUser(userData);
    expect(createResult.success).toBe(true);

    if (!createResult.success) return;

    // Act - Retrieve user
    const getResult = await userService.getUser(createResult.data.id);

    // Assert
    expect(getResult.success).toBe(true);
    if (getResult.success) {
      expect(getResult.data.name).toBe(userData.name);
      expect(getResult.data.email).toBe(userData.email);
    }

    // Cleanup
    await userService.deleteUser(createResult.data.id);
  });
});
```

### VS Code Extension Testing
```typescript
// ✅ PREFERRED: VS Code extension testing
describe('Extension Commands', () => {
  let extension: vscode.ExtensionContext;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(async () => {
    mockUserService = createMockUserService();
    extension = await vscode.extensions.getExtension('roo-code.extension')?.activate();
  });

  it('should handle create user command successfully', async () => {
    // Arrange
    const expectedUser = createMockUser();
    mockUserService.createUser.mockResolvedValue({
      success: true,
      data: expectedUser
    });

    // Mock VS Code input
    jest.spyOn(vscode.window, 'showInputBox')
      .mockResolvedValueOnce('test@example.com') // email
      .mockResolvedValueOnce('Test User'); // name

    const showInformationMessageSpy = jest.spyOn(vscode.window, 'showInformationMessage');

    // Act
    await vscode.commands.executeCommand('roo-code.createUser');

    // Assert
    expect(mockUserService.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      password: 'temporary'
    });
    expect(showInformationMessageSpy).toHaveBeenCalledWith(
      'User Test User created successfully!'
    );
  });
});
```

## End-to-End Testing

### Browser Automation with Playwright
```typescript
// ✅ PREFERRED: E2E test structure
import { test, expect } from '@playwright/test';

test.describe('User Management Flow', () => {
  test('should create, edit, and delete user through UI', async ({ page }) => {
    // Navigate to extension
    await page.goto('vscode://extension/roo-code.extension');

    // Create user
    await page.click('[data-testid="create-user-button"]');
    await page.fill('[data-testid="user-email-input"]', 'e2e@example.com');
    await page.fill('[data-testid="user-name-input"]', 'E2E Test User');
    await page.click('[data-testid="submit-button"]');

    // Verify user appears in list
    await expect(page.locator('[data-testid="user-list"]')).toContainText('E2E Test User');

    // Edit user
    await page.click('[data-testid="edit-user-button"]');
    await page.fill('[data-testid="user-name-input"]', 'Updated E2E User');
    await page.click('[data-testid="submit-button"]');

    // Verify update
    await expect(page.locator('[data-testid="user-list"]')).toContainText('Updated E2E User');

    // Delete user
    await page.click('[data-testid="delete-user-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify deletion
    await expect(page.locator('[data-testid="user-list"]')).not.toContainText('Updated E2E User');
  });
});
```

### Console and Routes Testing with Puppeteer
```typescript
// ✅ PREFERRED: Console testing
import puppeteer from 'puppeteer';

describe('Console Error Testing', () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should not have console errors on main page', async () => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });
});
```

## Test Data Management

### Test Fixtures
```typescript
// ✅ PREFERRED: Organized test fixtures
export const testFixtures = {
  users: {
    valid: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date('2023-01-01')
    },
    invalid: {
      missingEmail: { name: 'John Doe' },
      invalidEmail: { name: 'John Doe', email: 'invalid-email' },
      emptyName: { email: 'john@example.com', name: '' }
    }
  },
  apiResponses: {
    userCreated: {
      success: true,
      data: { id: 'user-123', name: 'John Doe', email: 'john@example.com' }
    },
    validationError: {
      success: false,
      error: { type: 'validation', field: 'email', message: 'Invalid email' }
    }
  }
};
```

## Best Practices Summary

### Do's
- ✅ Write tests following AAA pattern (Arrange, Act, Assert)
- ✅ Use descriptive test names that explain the scenario
- ✅ Test both success and error cases
- ✅ Mock external dependencies appropriately
- ✅ Maintain 80%+ code coverage
- ✅ Use test fixtures for consistent data
- ✅ Test Result pattern functions properly

### Don'ts
- ❌ Write tests that depend on external services
- ❌ Use vague or generic test names
- ❌ Test implementation details instead of behavior
- ❌ Skip error case testing
- ❌ Create overly complex test setups
- ❌ Ignore failing tests

## Related Documentation

- [Development Principles](../core/development-principles.md) - Core development standards
- [Error Handling](../core/error-handling.md) - Error handling patterns to test
- [Code Quality & Linting](code-quality-linting.md) - Quality assurance guidelines
- [Development Workflow](../checklists/development-workflow.md) - Testing in development process

---

*Comprehensive testing ensures reliability, maintainability, and confidence in code changes.*
