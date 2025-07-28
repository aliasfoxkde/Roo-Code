# Security & Privacy Standards

Comprehensive security and privacy guidelines for the Roo Code VS Code Extension project.

## Data Protection Principles

### Core Security Standards
- **Never log sensitive user data** - Implement proper data sanitization
- **Use secure communication protocols** - HTTPS/TLS for all external communications
- **Follow GDPR and privacy regulations** - Respect user privacy and data rights
- **Encrypt sensitive data** - Both at rest and in transit
- **Implement proper authentication** - Secure user identity verification

## Input Validation & Sanitization

### Comprehensive Input Validation
```typescript
// ✅ PREFERRED: Robust input validation
class InputValidator {
  static sanitizeString(input: unknown): string {
    if (typeof input !== 'string') {
      throw new SecurityError('INVALID_INPUT_TYPE', 'Input must be a string');
    }
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .trim()
      .slice(0, 1000); // Limit length to prevent DoS
  }

  static validateEmail(email: string): Result<string, ValidationError> {
    const sanitized = this.sanitizeString(email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(sanitized)) {
      return ResultUtils.error(
        new ValidationError('INVALID_EMAIL', 'email', 'Must be a valid email address')
      );
    }
    
    if (sanitized.length > 254) { // RFC 5321 limit
      return ResultUtils.error(
        new ValidationError('EMAIL_TOO_LONG', 'email', 'Email address too long')
      );
    }
    
    return ResultUtils.ok(sanitized);
  }

  static validateFilePath(filePath: string): Result<string, SecurityError> {
    const sanitized = this.sanitizeString(filePath);
    
    // Prevent directory traversal
    if (sanitized.includes('..') || sanitized.includes('~')) {
      return ResultUtils.error(
        new SecurityError('PATH_TRAVERSAL', 'Directory traversal detected')
      );
    }
    
    // Prevent access to system files
    const forbiddenPaths = ['/etc/', '/proc/', '/sys/', 'C:\\Windows\\'];
    if (forbiddenPaths.some(path => sanitized.toLowerCase().includes(path.toLowerCase()))) {
      return ResultUtils.error(
        new SecurityError('FORBIDDEN_PATH', 'Access to system paths not allowed')
      );
    }
    
    return ResultUtils.ok(sanitized);
  }

  static validateUrl(url: string): Result<string, SecurityError> {
    try {
      const parsedUrl = new URL(url);
      
      // Only allow specific protocols
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        return ResultUtils.error(
          new SecurityError('INVALID_PROTOCOL', 'Only HTTP and HTTPS protocols allowed')
        );
      }
      
      // Prevent localhost/internal network access in production
      if (process.env.NODE_ENV === 'production') {
        const hostname = parsedUrl.hostname.toLowerCase();
        const forbiddenHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
        const isPrivateNetwork = hostname.match(/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/);
        
        if (forbiddenHosts.includes(hostname) || isPrivateNetwork) {
          return ResultUtils.error(
            new SecurityError('FORBIDDEN_HOST', 'Access to internal networks not allowed')
          );
        }
      }
      
      return ResultUtils.ok(parsedUrl.toString());
    } catch (error) {
      return ResultUtils.error(
        new SecurityError('INVALID_URL', 'Invalid URL format')
      );
    }
  }
}
```

### SQL Injection Prevention
```typescript
// ✅ PREFERRED: Parameterized queries
class DatabaseService {
  async getUserById(id: string): Promise<Result<User, DatabaseError>> {
    // Validate input
    const validationResult = InputValidator.sanitizeString(id);
    if (!validationResult) {
      return ResultUtils.error(new DatabaseError('INVALID_ID', 'Invalid user ID'));
    }

    try {
      // Use parameterized query to prevent SQL injection
      const query = 'SELECT * FROM users WHERE id = ?';
      const result = await this.db.query(query, [id]);
      
      return ResultUtils.ok(result[0]);
    } catch (error) {
      this.logger.error('Database query failed', { error, userId: id });
      return ResultUtils.error(new DatabaseError('QUERY_FAILED', 'Failed to fetch user'));
    }
  }

  // ❌ AVOID: String concatenation (vulnerable to SQL injection)
  async getUserByIdUnsafe(id: string): Promise<User> {
    const query = `SELECT * FROM users WHERE id = '${id}'`; // DANGEROUS!
    return this.db.query(query);
  }
}
```

## Authentication & Authorization

### Secure Token Management
```typescript
// ✅ PREFERRED: Secure token handling
class TokenManager {
  private readonly TOKEN_EXPIRY = 3600000; // 1 hour
  private readonly REFRESH_TOKEN_EXPIRY = 604800000; // 7 days

  generateSecureToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  async createAccessToken(userId: string): Promise<Result<TokenPair, AuthError>> {
    try {
      const payload = {
        userId,
        type: 'access',
        iat: Date.now(),
        exp: Date.now() + this.TOKEN_EXPIRY
      };

      const token = await this.signToken(payload);
      const refreshToken = this.generateSecureToken();

      // Store refresh token securely (hashed)
      await this.storeRefreshToken(userId, refreshToken);

      return ResultUtils.ok({
        accessToken: token,
        refreshToken,
        expiresIn: this.TOKEN_EXPIRY
      });
    } catch (error) {
      return ResultUtils.error(new AuthError('TOKEN_CREATION_FAILED', 'Failed to create token'));
    }
  }

  async validateToken(token: string): Promise<Result<TokenPayload, AuthError>> {
    try {
      const payload = await this.verifyToken(token);
      
      // Check expiration
      if (payload.exp < Date.now()) {
        return ResultUtils.error(new AuthError('TOKEN_EXPIRED', 'Token has expired'));
      }

      return ResultUtils.ok(payload);
    } catch (error) {
      return ResultUtils.error(new AuthError('INVALID_TOKEN', 'Token validation failed'));
    }
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Store hashed token in secure storage
    await this.secureStorage.set(`refresh_${userId}`, {
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.REFRESH_TOKEN_EXPIRY
    });
  }
}
```

### Permission-Based Access Control
```typescript
// ✅ PREFERRED: Role-based access control
enum Permission {
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  DELETE_USERS = 'delete:users',
  ADMIN_ACCESS = 'admin:access'
}

class AuthorizationService {
  private rolePermissions = new Map<string, Permission[]>([
    ['user', [Permission.READ_USERS]],
    ['moderator', [Permission.READ_USERS, Permission.WRITE_USERS]],
    ['admin', [Permission.READ_USERS, Permission.WRITE_USERS, Permission.DELETE_USERS, Permission.ADMIN_ACCESS]]
  ]);

  hasPermission(userRole: string, requiredPermission: Permission): boolean {
    const permissions = this.rolePermissions.get(userRole) || [];
    return permissions.includes(requiredPermission);
  }

  requirePermission(permission: Permission) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;

      descriptor.value = async function(...args: any[]) {
        const user = this.getCurrentUser(); // Get from context
        
        if (!user || !this.authService.hasPermission(user.role, permission)) {
          throw new AuthError('INSUFFICIENT_PERMISSIONS', 'Access denied');
        }

        return method.apply(this, args);
      };
    };
  }
}

// Usage
class UserController {
  @requirePermission(Permission.DELETE_USERS)
  async deleteUser(id: string): Promise<Result<void, UserError>> {
    // Implementation
  }
}
```

## Data Privacy & GDPR Compliance

### Personal Data Handling
```typescript
// ✅ PREFERRED: Privacy-compliant data handling
interface PersonalData {
  email: string;
  name: string;
  preferences: UserPreferences;
}

class PrivacyService {
  async anonymizeUserData(userId: string): Promise<Result<void, PrivacyError>> {
    try {
      // Replace personal data with anonymized versions
      const anonymizedData = {
        email: this.hashEmail(userId),
        name: 'Anonymous User',
        preferences: {} // Reset preferences
      };

      await this.userService.updateUser(userId, anonymizedData);
      
      // Log the anonymization for audit trail
      this.auditLogger.log('USER_ANONYMIZED', { userId, timestamp: Date.now() });
      
      return ResultUtils.ok(undefined);
    } catch (error) {
      return ResultUtils.error(new PrivacyError('ANONYMIZATION_FAILED', 'Failed to anonymize user data'));
    }
  }

  async exportUserData(userId: string): Promise<Result<UserDataExport, PrivacyError>> {
    try {
      const userData = await this.userService.getUser(userId);
      if (!userData.success) {
        return ResultUtils.error(new PrivacyError('USER_NOT_FOUND', 'User not found'));
      }

      const exportData: UserDataExport = {
        personalData: {
          email: userData.data.email,
          name: userData.data.name,
          createdAt: userData.data.createdAt
        },
        activityData: await this.getActivityData(userId),
        preferences: userData.data.preferences,
        exportedAt: new Date().toISOString()
      };

      return ResultUtils.ok(exportData);
    } catch (error) {
      return ResultUtils.error(new PrivacyError('EXPORT_FAILED', 'Failed to export user data'));
    }
  }

  async deleteUserData(userId: string): Promise<Result<void, PrivacyError>> {
    try {
      // Delete all user-related data
      await Promise.all([
        this.userService.deleteUser(userId),
        this.activityService.deleteUserActivity(userId),
        this.preferencesService.deleteUserPreferences(userId)
      ]);

      // Log deletion for compliance
      this.auditLogger.log('USER_DATA_DELETED', { userId, timestamp: Date.now() });

      return ResultUtils.ok(undefined);
    } catch (error) {
      return ResultUtils.error(new PrivacyError('DELETION_FAILED', 'Failed to delete user data'));
    }
  }

  private hashEmail(userId: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(userId).digest('hex').substring(0, 8) + '@anonymized.local';
  }
}
```

### Secure Logging
```typescript
// ✅ PREFERRED: Privacy-aware logging
class SecureLogger {
  private sensitiveFields = ['password', 'token', 'email', 'ssn', 'creditCard'];

  log(level: string, message: string, context: Record<string, any> = {}): void {
    const sanitizedContext = this.sanitizeLogData(context);
    
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: sanitizedContext,
      requestId: this.getRequestId()
    };

    console.log(JSON.stringify(logEntry));
    
    // Send to secure logging service
    this.sendToSecureStorage(logEntry);
  }

  private sanitizeLogData(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };

    for (const [key, value] of Object.entries(sanitized)) {
      if (this.isSensitiveField(key)) {
        sanitized[key] = this.maskSensitiveData(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeLogData(value);
      }
    }

    return sanitized;
  }

  private isSensitiveField(fieldName: string): boolean {
    return this.sensitiveFields.some(sensitive => 
      fieldName.toLowerCase().includes(sensitive.toLowerCase())
    );
  }

  private maskSensitiveData(value: any): string {
    if (typeof value === 'string') {
      if (value.length <= 4) return '***';
      return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
    }
    return '[REDACTED]';
  }
}
```

## VS Code Extension Security

### Webview Security
```typescript
// ✅ PREFERRED: Secure webview implementation
class SecureWebviewFactory {
  static createPanel(config: WebviewConfig): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
      config.viewType,
      config.title,
      config.showOptions,
      {
        enableScripts: true,
        enableCommandUris: false, // Disable command URIs for security
        retainContextWhenHidden: false, // Don't retain context to save memory
        localResourceRoots: [
          vscode.Uri.file(path.join(config.extensionPath, 'webview-ui', 'build'))
        ]
      }
    );

    // Set strict CSP
    panel.webview.html = this.getSecureWebviewContent(panel.webview, config);
    
    return panel;
  }

  private static getSecureWebviewContent(webview: vscode.Webview, config: WebviewConfig): string {
    const nonce = this.generateNonce();
    
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" 
              content="default-src 'none'; 
                       style-src ${webview.cspSource} 'unsafe-inline'; 
                       script-src 'nonce-${nonce}';
                       img-src ${webview.cspSource} data:;
                       font-src ${webview.cspSource};">
        <title>${this.escapeHtml(config.title)}</title>
    </head>
    <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${webview.asWebviewUri(config.scriptUri)}"></script>
    </body>
    </html>`;
  }

  private static generateNonce(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
  }

  private static escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
```

### Secure Communication
```typescript
// ✅ PREFERRED: Secure message handling
class SecureMessageHandler {
  private allowedCommands = new Set(['getUser', 'updateUser', 'deleteUser']);

  handleMessage(message: any): Promise<any> {
    try {
      // Validate message structure
      const validationResult = this.validateMessage(message);
      if (!validationResult.success) {
        throw new SecurityError('INVALID_MESSAGE', validationResult.error);
      }

      // Check command authorization
      if (!this.allowedCommands.has(message.command)) {
        throw new SecurityError('UNAUTHORIZED_COMMAND', 'Command not allowed');
      }

      // Rate limiting
      if (!this.rateLimiter.checkLimit(message.source)) {
        throw new SecurityError('RATE_LIMIT_EXCEEDED', 'Too many requests');
      }

      return this.processCommand(message);
    } catch (error) {
      this.logger.error('Message handling failed', { error, message: this.sanitizeMessage(message) });
      throw error;
    }
  }

  private validateMessage(message: any): Result<any, string> {
    if (!message || typeof message !== 'object') {
      return ResultUtils.error('Message must be an object');
    }

    if (!message.command || typeof message.command !== 'string') {
      return ResultUtils.error('Message must have a command field');
    }

    if (message.command.length > 50) {
      return ResultUtils.error('Command name too long');
    }

    return ResultUtils.ok(message);
  }

  private sanitizeMessage(message: any): any {
    // Remove sensitive data before logging
    const sanitized = { ...message };
    delete sanitized.token;
    delete sanitized.password;
    return sanitized;
  }
}
```

## Best Practices Summary

### Do's
- ✅ Validate and sanitize all inputs
- ✅ Use parameterized queries for database operations
- ✅ Implement proper authentication and authorization
- ✅ Encrypt sensitive data at rest and in transit
- ✅ Follow GDPR and privacy regulations
- ✅ Use secure random number generation
- ✅ Implement rate limiting and DoS protection
- ✅ Log security events for audit trails

### Don'ts
- ❌ Log sensitive user data
- ❌ Use string concatenation for SQL queries
- ❌ Store passwords in plain text
- ❌ Trust user input without validation
- ❌ Expose internal error details to users
- ❌ Use weak encryption algorithms
- ❌ Ignore security headers and CSP
- ❌ Allow unrestricted file access

## Related Documentation

- [Development Principles](../core/development-principles.md) - Core security principles
- [Error Handling](../core/error-handling.md) - Secure error handling patterns
- [Code Quality & Linting](code-quality-linting.md) - Security-focused linting rules
- [VS Code Extension](../architecture/vscode-extension.md) - Extension-specific security

---

*Security and privacy are fundamental requirements that must be considered in every aspect of development.*
