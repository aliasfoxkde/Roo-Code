# Code Review Checklist

Comprehensive code review guidelines and verification points for the Roo Code VS Code Extension project.

## Pre-Review Setup

### 1. Review Preparation
- [ ] **Pull Request Description**: Clear description of changes and rationale
- [ ] **Linked Issues**: Related issues and tickets linked
- [ ] **Breaking Changes**: Breaking changes clearly identified
- [ ] **Testing Instructions**: Clear instructions for testing changes
- [ ] **Screenshots/Videos**: Visual changes documented with screenshots
- [ ] **Migration Notes**: Database or configuration changes documented
- [ ] **Performance Impact**: Performance implications assessed
- [ ] **Security Considerations**: Security impact evaluated

### 2. Automated Checks
- [ ] **CI/CD Pipeline**: All automated checks passing
- [ ] **Build Success**: Code builds without errors
- [ ] **Test Suite**: All tests passing
- [ ] **Code Coverage**: Coverage requirements met (≥80%)
- [ ] **Linting**: ESLint checks passing
- [ ] **Type Checking**: TypeScript compilation successful
- [ ] **Security Scan**: Security vulnerability scan passed
- [ ] **Performance Tests**: Performance benchmarks met

## Code Quality Review

### 3. Architecture & Design
- [ ] **Design Patterns**: Appropriate design patterns used
- [ ] **SOLID Principles**: Single Responsibility, Open/Closed, etc. followed
- [ ] **Separation of Concerns**: Clear separation between layers/modules
- [ ] **Dependency Injection**: Proper dependency management
- [ ] **Interface Design**: Clean, consistent interfaces
- [ ] **Error Handling**: Consistent Result/Either pattern usage
- [ ] **Resource Management**: Proper resource disposal and cleanup
- [ ] **Performance Considerations**: Efficient algorithms and data structures

### 4. TypeScript Standards
- [ ] **Type Safety**: No `any` types without justification
- [ ] **Generic Constraints**: Proper generic usage and constraints
- [ ] **Type Guards**: Runtime type checking implemented
- [ ] **Interface Consistency**: Consistent interface naming and structure
- [ ] **Utility Types**: Appropriate use of TypeScript utilities
- [ ] **Return Types**: Explicit return types for public functions
- [ ] **Null Safety**: Proper null/undefined handling
- [ ] **Discriminated Unions**: Proper use for complex types

### 5. Code Structure
- [ ] **Function Size**: Functions are focused and reasonably sized (<50 lines)
- [ ] **Class Design**: Classes have single responsibility
- [ ] **Method Complexity**: Methods are not overly complex
- [ ] **Nesting Depth**: Reasonable nesting depth (<4 levels)
- [ ] **Code Duplication**: No unnecessary code duplication
- [ ] **Magic Numbers**: No magic numbers; constants used instead
- [ ] **Variable Naming**: Descriptive, meaningful variable names
- [ ] **Function Naming**: Clear, action-oriented function names

## Functionality Review

### 6. Business Logic
- [ ] **Requirements Implementation**: All requirements correctly implemented
- [ ] **Edge Cases**: Edge cases properly handled
- [ ] **Input Validation**: Comprehensive input validation
- [ ] **Business Rules**: Business rules correctly enforced
- [ ] **Data Integrity**: Data consistency and integrity maintained
- [ ] **Error Scenarios**: Error conditions properly handled
- [ ] **User Experience**: Changes improve or maintain UX
- [ ] **Backward Compatibility**: Backward compatibility preserved

### 7. API Design
- [ ] **RESTful Design**: REST principles followed (if applicable)
- [ ] **Consistent Endpoints**: API endpoints follow established patterns
- [ ] **Request/Response**: Proper request/response structure
- [ ] **Status Codes**: Appropriate HTTP status codes used
- [ ] **Error Responses**: Consistent error response format
- [ ] **Versioning**: API versioning strategy followed
- [ ] **Documentation**: API changes documented
- [ ] **Rate Limiting**: Rate limiting considerations addressed

### 8. Data Handling
- [ ] **Data Validation**: All data properly validated
- [ ] **Data Sanitization**: Input data sanitized appropriately
- [ ] **Database Queries**: Efficient and secure database queries
- [ ] **Transaction Management**: Proper transaction handling
- [ ] **Data Migration**: Database migrations properly implemented
- [ ] **Caching Strategy**: Appropriate caching implemented
- [ ] **Data Privacy**: Privacy requirements met
- [ ] **Data Retention**: Retention policies followed

## Security Review

### 9. Security Fundamentals
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **SQL Injection**: Parameterized queries used
- [ ] **XSS Prevention**: Output encoding implemented
- [ ] **CSRF Protection**: CSRF tokens used where needed
- [ ] **Authentication**: Proper authentication mechanisms
- [ ] **Authorization**: Appropriate access controls
- [ ] **Session Management**: Secure session handling
- [ ] **Password Security**: Secure password practices

### 10. Data Security
- [ ] **Encryption**: Sensitive data encrypted
- [ ] **HTTPS**: All communications over HTTPS
- [ ] **Secure Headers**: Security headers configured
- [ ] **Sensitive Data**: No sensitive data in logs/client
- [ ] **API Keys**: API keys properly secured
- [ ] **Environment Variables**: Secrets in environment variables
- [ ] **Data Exposure**: No unnecessary data exposure
- [ ] **Audit Logging**: Security events logged

### 11. VS Code Extension Security
- [ ] **Webview Security**: Secure CSP implementation
- [ ] **Command Security**: Commands properly validated
- [ ] **File Access**: File system access properly restricted
- [ ] **Network Requests**: Network requests validated
- [ ] **Extension Permissions**: Minimal required permissions
- [ ] **User Data**: User data handled securely
- [ ] **Third-Party Libraries**: Dependencies security reviewed
- [ ] **Activation Events**: Secure activation event handling

## Performance Review

### 12. Performance Optimization
- [ ] **Algorithm Efficiency**: Efficient algorithms used
- [ ] **Data Structures**: Appropriate data structures chosen
- [ ] **Memory Usage**: Memory usage optimized
- [ ] **CPU Usage**: CPU-intensive operations optimized
- [ ] **I/O Operations**: Efficient I/O handling
- [ ] **Caching**: Effective caching strategy
- [ ] **Lazy Loading**: Heavy resources loaded on demand
- [ ] **Bundle Size**: Code bundle size minimized

### 13. VS Code Extension Performance
- [ ] **Activation Time**: Extension activation optimized (<200ms)
- [ ] **Command Performance**: Commands execute quickly (<1s)
- [ ] **Memory Leaks**: No memory leaks introduced
- [ ] **Resource Cleanup**: Proper disposal of resources
- [ ] **Event Listeners**: Event listeners properly managed
- [ ] **Webview Performance**: Webview performance optimized
- [ ] **File Watching**: Efficient file system watching
- [ ] **Background Tasks**: Background tasks optimized

### 14. Scalability Considerations
- [ ] **Load Handling**: Code handles expected load
- [ ] **Concurrent Access**: Proper concurrency handling
- [ ] **Resource Limits**: Resource usage within limits
- [ ] **Graceful Degradation**: Graceful handling of failures
- [ ] **Monitoring**: Performance monitoring in place
- [ ] **Bottleneck Identification**: Potential bottlenecks identified
- [ ] **Horizontal Scaling**: Scaling considerations addressed
- [ ] **Database Performance**: Database queries optimized

## Testing Review

### 15. Test Coverage
- [ ] **Unit Tests**: Comprehensive unit test coverage
- [ ] **Integration Tests**: Integration scenarios tested
- [ ] **Edge Cases**: Edge cases covered in tests
- [ ] **Error Scenarios**: Error conditions tested
- [ ] **Mock Strategy**: Appropriate mocking used
- [ ] **Test Data**: Consistent test data management
- [ ] **Async Testing**: Async operations properly tested
- [ ] **Performance Tests**: Performance requirements tested

### 16. Test Quality
- [ ] **Test Structure**: Tests follow AAA pattern
- [ ] **Test Names**: Descriptive test names
- [ ] **Test Independence**: Tests are independent
- [ ] **Test Maintainability**: Tests are maintainable
- [ ] **Test Documentation**: Complex tests documented
- [ ] **Test Reliability**: Tests are reliable and stable
- [ ] **Test Performance**: Tests run efficiently
- [ ] **Test Coverage Metrics**: Coverage targets met

## Documentation Review

### 17. Code Documentation
- [ ] **JSDoc Comments**: Public APIs documented
- [ ] **Complex Logic**: Complex code explained
- [ ] **Type Documentation**: Types and interfaces documented
- [ ] **Parameter Documentation**: Parameters documented
- [ ] **Return Values**: Return values documented
- [ ] **Error Documentation**: Possible errors documented
- [ ] **Examples**: Usage examples provided
- [ ] **Inline Comments**: Necessary inline comments added

### 18. Project Documentation
- [ ] **README Updates**: README updated for changes
- [ ] **API Documentation**: API changes documented
- [ ] **Architecture Updates**: Architecture docs updated
- [ ] **User Guide**: User documentation updated
- [ ] **Migration Guide**: Breaking changes documented
- [ ] **Changelog**: Changelog entry prepared
- [ ] **ADR Updates**: Architectural decisions recorded
- [ ] **Troubleshooting**: Known issues documented

## Review Process

### 19. Review Execution
- [ ] **Code Understanding**: Reviewer understands the changes
- [ ] **Context Review**: Business context understood
- [ ] **Alternative Approaches**: Alternative solutions considered
- [ ] **Impact Assessment**: Full impact of changes assessed
- [ ] **Risk Evaluation**: Risks identified and mitigated
- [ ] **Feedback Quality**: Constructive feedback provided
- [ ] **Learning Opportunities**: Knowledge sharing opportunities identified
- [ ] **Follow-up Actions**: Next steps clearly defined

### 20. Review Completion
- [ ] **All Issues Addressed**: All review comments addressed
- [ ] **Re-review Completed**: Changes re-reviewed if significant
- [ ] **Approval Given**: Explicit approval provided
- [ ] **Merge Readiness**: Code ready for merge
- [ ] **Deployment Notes**: Deployment considerations noted
- [ ] **Monitoring Plan**: Post-deployment monitoring planned
- [ ] **Rollback Plan**: Rollback strategy defined
- [ ] **Knowledge Transfer**: Knowledge shared with team

---

## Review Guidelines

### Reviewer Responsibilities
- **Thorough Review**: Review all aspects of the code change
- **Constructive Feedback**: Provide helpful, actionable feedback
- **Knowledge Sharing**: Share expertise and best practices
- **Risk Assessment**: Identify potential risks and issues
- **Standards Enforcement**: Ensure coding standards are followed
- **Learning Support**: Help team members learn and grow

### Author Responsibilities
- **Clear Description**: Provide clear PR description and context
- **Self-Review**: Review own code before requesting review
- **Test Coverage**: Ensure adequate test coverage
- **Documentation**: Update relevant documentation
- **Response to Feedback**: Address all review feedback promptly
- **Code Quality**: Ensure code meets quality standards

### Review Types

#### 🔍 **Detailed Review** (Required for)
- New features
- Breaking changes
- Security-related changes
- Performance-critical changes
- Complex business logic
- Architecture changes

#### ⚡ **Quick Review** (Acceptable for)
- Bug fixes
- Documentation updates
- Minor refactoring
- Test additions
- Configuration changes
- Dependency updates

### Review Checklist Summary

```markdown
## Quick Review Checklist
- [ ] Functionality works as intended
- [ ] Code follows established patterns
- [ ] Security considerations addressed
- [ ] Performance impact acceptable
- [ ] Tests cover new functionality
- [ ] Documentation updated
- [ ] No obvious issues or risks
```

## Related Documentation

- [Development Workflow](development-workflow.md) - Development process overview
- [Quality Checklist](quality-checklist.md) - Comprehensive quality verification
- [Development Methodology](../process/development-methodology.md) - Code review process
- [Code Quality & Linting](../quality/code-quality-linting.md) - Quality standards

---

*Thorough code reviews ensure code quality, knowledge sharing, and risk mitigation across the development team.*
