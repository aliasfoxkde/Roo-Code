# Development Methodology

Comprehensive development methodology, quality gates, tools, automation, and development practices for the Roo Code VS Code Extension project.

## Quality Gates & Development Process

### Quality Gate Requirements
All code must pass through the following quality gates before merging:

1. **Code Quality Gate**
   - Zero TypeScript compilation errors
   - Zero ESLint warnings
   - Code coverage ≥ 80%
   - All tests passing

2. **Security Gate**
   - Security vulnerability scan passed
   - No sensitive data in logs
   - Input validation implemented
   - Authentication/authorization verified

3. **Performance Gate**
   - Extension activation time < 200ms
   - Command execution time < 1s
   - Memory usage within acceptable limits
   - No performance regressions

4. **Documentation Gate**
   - Code properly documented
   - ADRs updated for architectural changes
   - README and relevant docs updated
   - API documentation current

### Automated Quality Enforcement
```typescript
// ✅ PREFERRED: Automated quality gate system
interface QualityGateResult {
  gate: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  metrics?: Record<string, number>;
}

class QualityGateSystem {
  async runAllGates(): Promise<QualityGateResult[]> {
    const gates = [
      this.runCodeQualityGate(),
      this.runSecurityGate(),
      this.runPerformanceGate(),
      this.runDocumentationGate()
    ];

    const results = await Promise.all(gates);
    
    // Log summary
    this.logQualityGateSummary(results);
    
    // Fail if any gate fails
    const failedGates = results.filter(result => !result.passed);
    if (failedGates.length > 0) {
      throw new QualityGateError('Quality gates failed', failedGates);
    }

    return results;
  }

  private async runCodeQualityGate(): Promise<QualityGateResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const metrics: Record<string, number> = {};

    try {
      // TypeScript compilation
      const tscResult = await this.runCommand('npx tsc --noEmit');
      if (tscResult.exitCode !== 0) {
        errors.push('TypeScript compilation failed');
      }

      // ESLint
      const eslintResult = await this.runCommand('npx eslint . --ext .ts,.tsx --format json');
      const eslintData = JSON.parse(eslintResult.stdout);
      const errorCount = eslintData.reduce((sum: number, file: any) => sum + file.errorCount, 0);
      const warningCount = eslintData.reduce((sum: number, file: any) => sum + file.warningCount, 0);
      
      if (errorCount > 0) {
        errors.push(`ESLint found ${errorCount} errors`);
      }
      if (warningCount > 0) {
        warnings.push(`ESLint found ${warningCount} warnings`);
      }

      metrics.eslintErrors = errorCount;
      metrics.eslintWarnings = warningCount;

      // Test coverage
      const coverageResult = await this.runCommand('npx vitest run --coverage --reporter=json');
      const coverageData = JSON.parse(coverageResult.stdout);
      const coveragePercent = coverageData.total.lines.pct;
      
      if (coveragePercent < 80) {
        errors.push(`Code coverage ${coveragePercent}% is below 80% threshold`);
      }

      metrics.codeCoverage = coveragePercent;

      return {
        gate: 'Code Quality',
        passed: errors.length === 0,
        errors,
        warnings,
        metrics
      };
    } catch (error) {
      return {
        gate: 'Code Quality',
        passed: false,
        errors: [`Quality gate execution failed: ${error.message}`],
        warnings: []
      };
    }
  }

  private async runSecurityGate(): Promise<QualityGateResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // npm audit
      const auditResult = await this.runCommand('npm audit --audit-level moderate --json');
      const auditData = JSON.parse(auditResult.stdout);
      
      if (auditData.metadata.vulnerabilities.total > 0) {
        errors.push(`Found ${auditData.metadata.vulnerabilities.total} security vulnerabilities`);
      }

      // Check for sensitive data patterns
      const sensitiveDataCheck = await this.checkForSensitiveData();
      if (!sensitiveDataCheck.passed) {
        errors.push(...sensitiveDataCheck.errors);
      }

      return {
        gate: 'Security',
        passed: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        gate: 'Security',
        passed: false,
        errors: [`Security gate execution failed: ${error.message}`],
        warnings: []
      };
    }
  }

  private async runPerformanceGate(): Promise<QualityGateResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const metrics: Record<string, number> = {};

    try {
      // Run performance benchmarks
      const benchmarkResult = await this.runPerformanceBenchmarks();
      
      if (benchmarkResult.activationTime > 200) {
        errors.push(`Extension activation time ${benchmarkResult.activationTime}ms exceeds 200ms limit`);
      }

      if (benchmarkResult.averageCommandTime > 1000) {
        errors.push(`Average command execution time ${benchmarkResult.averageCommandTime}ms exceeds 1000ms limit`);
      }

      metrics.activationTime = benchmarkResult.activationTime;
      metrics.averageCommandTime = benchmarkResult.averageCommandTime;
      metrics.memoryUsage = benchmarkResult.memoryUsage;

      return {
        gate: 'Performance',
        passed: errors.length === 0,
        errors,
        warnings,
        metrics
      };
    } catch (error) {
      return {
        gate: 'Performance',
        passed: false,
        errors: [`Performance gate execution failed: ${error.message}`],
        warnings: []
      };
    }
  }

  private async runDocumentationGate(): Promise<QualityGateResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for required documentation files
      const requiredDocs = [
        'README.md',
        'docs/ARCHITECTURE.md',
        'docs/REQUIREMENTS.md'
      ];

      for (const doc of requiredDocs) {
        if (!await this.fileExists(doc)) {
          errors.push(`Required documentation file missing: ${doc}`);
        }
      }

      // Check for outdated documentation
      const outdatedDocs = await this.checkForOutdatedDocumentation();
      if (outdatedDocs.length > 0) {
        warnings.push(`Potentially outdated documentation: ${outdatedDocs.join(', ')}`);
      }

      return {
        gate: 'Documentation',
        passed: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        gate: 'Documentation',
        passed: false,
        errors: [`Documentation gate execution failed: ${error.message}`],
        warnings: []
      };
    }
  }

  private logQualityGateSummary(results: QualityGateResult[]): void {
    console.log('\n=== Quality Gate Summary ===');
    
    results.forEach(result => {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${result.gate}: ${status}`);
      
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.length}`);
        result.errors.forEach(error => console.log(`    - ${error}`));
      }
      
      if (result.warnings.length > 0) {
        console.log(`  Warnings: ${result.warnings.length}`);
        result.warnings.forEach(warning => console.log(`    - ${warning}`));
      }
      
      if (result.metrics) {
        console.log(`  Metrics:`);
        Object.entries(result.metrics).forEach(([key, value]) => {
          console.log(`    ${key}: ${value}`);
        });
      }
    });
    
    console.log('========================\n');
  }

  // Helper methods
  private async runCommand(command: string): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    // Implementation for running shell commands
    return { exitCode: 0, stdout: '{}', stderr: '' };
  }

  private async checkForSensitiveData(): Promise<{ passed: boolean; errors: string[] }> {
    // Implementation for checking sensitive data patterns
    return { passed: true, errors: [] };
  }

  private async runPerformanceBenchmarks(): Promise<{
    activationTime: number;
    averageCommandTime: number;
    memoryUsage: number;
  }> {
    // Implementation for performance benchmarks
    return { activationTime: 150, averageCommandTime: 500, memoryUsage: 50 };
  }

  private async fileExists(path: string): Promise<boolean> {
    // Implementation for file existence check
    return true;
  }

  private async checkForOutdatedDocumentation(): Promise<string[]> {
    // Implementation for checking outdated docs
    return [];
  }
}

class QualityGateError extends Error {
  constructor(message: string, public failedGates: QualityGateResult[]) {
    super(message);
    this.name = 'QualityGateError';
  }
}
```

## Development Tools & Automation

### Required Development Tools
- **Package Manager**: pnpm (preferred) or npm
- **TypeScript**: Version 5.0+ with strict configuration
- **Linting**: ESLint with TypeScript support
- **Testing**: Vitest for unit/integration tests
- **E2E Testing**: Playwright for browser automation
- **Formatting**: Prettier with consistent configuration
- **Version Control**: Git with conventional commits
- **CI/CD**: GitHub Actions or equivalent

### Automation Scripts
```typescript
// ✅ PREFERRED: Development automation scripts
interface AutomationScript {
  name: string;
  description: string;
  command: string;
  dependencies?: string[];
}

const developmentScripts: Record<string, AutomationScript> = {
  'dev': {
    name: 'Development Server',
    description: 'Start development server with hot reload',
    command: 'npm run dev',
    dependencies: ['install']
  },
  
  'build': {
    name: 'Production Build',
    description: 'Build for production with optimizations',
    command: 'npm run build',
    dependencies: ['lint', 'test']
  },
  
  'test': {
    name: 'Run Tests',
    description: 'Execute all tests with coverage',
    command: 'npx vitest run --coverage'
  },
  
  'test:watch': {
    name: 'Watch Tests',
    description: 'Run tests in watch mode',
    command: 'npx vitest'
  },
  
  'lint': {
    name: 'Lint Code',
    description: 'Run ESLint on all TypeScript files',
    command: 'npx eslint . --ext .ts,.tsx'
  },
  
  'lint:fix': {
    name: 'Fix Lint Issues',
    description: 'Automatically fix ESLint issues',
    command: 'npx eslint . --ext .ts,.tsx --fix'
  },
  
  'format': {
    name: 'Format Code',
    description: 'Format code with Prettier',
    command: 'npx prettier --write .'
  },
  
  'quality-check': {
    name: 'Quality Check',
    description: 'Run all quality gates',
    command: 'npm run lint && npm run test && npm run build',
    dependencies: ['lint', 'test', 'build']
  },
  
  'pre-commit': {
    name: 'Pre-commit Hook',
    description: 'Run quality checks before commit',
    command: 'npm run quality-check',
    dependencies: ['quality-check']
  }
};

class AutomationManager {
  async runScript(scriptName: string): Promise<void> {
    const script = developmentScripts[scriptName];
    if (!script) {
      throw new Error(`Script '${scriptName}' not found`);
    }

    console.log(`Running: ${script.name}`);
    console.log(`Description: ${script.description}`);

    // Run dependencies first
    if (script.dependencies) {
      for (const dependency of script.dependencies) {
        await this.runScript(dependency);
      }
    }

    // Execute the script
    await this.executeCommand(script.command);
  }

  private async executeCommand(command: string): Promise<void> {
    // Implementation for executing shell commands
    console.log(`Executing: ${command}`);
  }

  listAvailableScripts(): void {
    console.log('Available Development Scripts:');
    console.log('==============================');
    
    Object.entries(developmentScripts).forEach(([name, script]) => {
      console.log(`${name.padEnd(15)} - ${script.description}`);
    });
  }
}
```

## Development Practices

### Code Review Process
```typescript
// ✅ PREFERRED: Structured code review process
interface CodeReviewChecklist {
  functionality: ReviewItem[];
  codeQuality: ReviewItem[];
  security: ReviewItem[];
  performance: ReviewItem[];
  documentation: ReviewItem[];
}

interface ReviewItem {
  description: string;
  required: boolean;
  checked: boolean;
}

const codeReviewChecklist: CodeReviewChecklist = {
  functionality: [
    { description: 'Code implements requirements correctly', required: true, checked: false },
    { description: 'Edge cases are handled appropriately', required: true, checked: false },
    { description: 'Error handling is comprehensive', required: true, checked: false },
    { description: 'Tests cover new functionality', required: true, checked: false }
  ],
  
  codeQuality: [
    { description: 'Code follows established patterns', required: true, checked: false },
    { description: 'Functions are focused and single-purpose', required: true, checked: false },
    { description: 'Variable and function names are descriptive', required: true, checked: false },
    { description: 'Code is properly commented where needed', required: false, checked: false }
  ],
  
  security: [
    { description: 'Input validation is implemented', required: true, checked: false },
    { description: 'No sensitive data in logs', required: true, checked: false },
    { description: 'Authentication/authorization verified', required: true, checked: false },
    { description: 'SQL injection prevention implemented', required: true, checked: false }
  ],
  
  performance: [
    { description: 'No obvious performance bottlenecks', required: true, checked: false },
    { description: 'Efficient algorithms and data structures used', required: true, checked: false },
    { description: 'Memory usage is reasonable', required: true, checked: false },
    { description: 'Caching implemented where appropriate', required: false, checked: false }
  ],
  
  documentation: [
    { description: 'Public APIs are documented', required: true, checked: false },
    { description: 'Complex logic is explained', required: true, checked: false },
    { description: 'README updated if needed', required: false, checked: false },
    { description: 'ADRs updated for architectural changes', required: true, checked: false }
  ]
};

class CodeReviewManager {
  generateReviewChecklist(): string {
    let checklist = '# Code Review Checklist\n\n';
    
    Object.entries(codeReviewChecklist).forEach(([category, items]) => {
      checklist += `## ${this.capitalizeFirst(category)}\n\n`;
      
      items.forEach(item => {
        const checkbox = item.checked ? '[x]' : '[ ]';
        const required = item.required ? ' (Required)' : ' (Optional)';
        checklist += `${checkbox} ${item.description}${required}\n`;
      });
      
      checklist += '\n';
    });
    
    return checklist;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
```

### Continuous Integration Pipeline
```yaml
# ✅ PREFERRED: Comprehensive CI/CD pipeline
name: Continuous Integration

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Code Quality Gate
      run: |
        npx tsc --noEmit
        npx eslint . --ext .ts,.tsx
        npx vitest run --coverage
    
    - name: Security Gate
      run: |
        npm audit --audit-level moderate
        # Add custom security checks
    
    - name: Performance Gate
      run: |
        npm run benchmark
        # Add performance regression tests
    
    - name: Documentation Gate
      run: |
        # Check for required documentation
        # Validate documentation freshness
    
    - name: Build
      run: npm run build
    
    - name: Upload Coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## Best Practices Summary

### Do's
- ✅ Implement comprehensive quality gates
- ✅ Use automated tools for consistency
- ✅ Follow structured code review process
- ✅ Maintain high test coverage (≥80%)
- ✅ Document architectural decisions
- ✅ Use conventional commit messages
- ✅ Automate repetitive tasks

### Don'ts
- ❌ Skip quality gate checks
- ❌ Merge code without proper review
- ❌ Ignore test failures or low coverage
- ❌ Make architectural changes without ADRs
- ❌ Use inconsistent development tools
- ❌ Deploy without passing all gates

## Related Documentation

- [Documentation Management](documentation-management.md) - Documentation standards and ADRs
- [Deployment & Release](deployment-release.md) - Release process and versioning
- [Code Quality & Linting](../quality/code-quality-linting.md) - Quality assurance guidelines
- [Development Workflow](../checklists/development-workflow.md) - Step-by-step development process

---

*A robust development methodology ensures consistent quality, security, and maintainability across all development activities.*
