# Deployment & Release Management

Comprehensive release process, versioning, and maintenance procedures for the Roo Code VS Code Extension project.

## Release Process

### Release Workflow
1. **Pre-release Quality Gates** - All quality checks must pass
2. **Version Bump** - Semantic versioning with changelog update
3. **Build & Package** - Create production-ready extension package
4. **Testing** - Comprehensive testing in staging environment
5. **Release Notes** - Generate detailed release documentation
6. **Deployment** - Publish to VS Code Marketplace
7. **Post-release Monitoring** - Monitor for issues and user feedback

### Semantic Versioning Strategy
```typescript
// ✅ PREFERRED: Semantic versioning implementation
interface Version {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

class VersionManager {
  private currentVersion: Version;

  constructor(versionString: string) {
    this.currentVersion = this.parseVersion(versionString);
  }

  bumpMajor(): Version {
    return {
      major: this.currentVersion.major + 1,
      minor: 0,
      patch: 0
    };
  }

  bumpMinor(): Version {
    return {
      major: this.currentVersion.major,
      minor: this.currentVersion.minor + 1,
      patch: 0
    };
  }

  bumpPatch(): Version {
    return {
      major: this.currentVersion.major,
      minor: this.currentVersion.minor,
      patch: this.currentVersion.patch + 1
    };
  }

  createPrerelease(type: 'alpha' | 'beta' | 'rc', number: number = 1): Version {
    return {
      ...this.currentVersion,
      prerelease: `${type}.${number}`
    };
  }

  toString(version: Version): string {
    let versionString = `${version.major}.${version.minor}.${version.patch}`;
    
    if (version.prerelease) {
      versionString += `-${version.prerelease}`;
    }
    
    if (version.build) {
      versionString += `+${version.build}`;
    }
    
    return versionString;
  }

  private parseVersion(versionString: string): Version {
    const regex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
    const match = versionString.match(regex);
    
    if (!match) {
      throw new Error(`Invalid version string: ${versionString}`);
    }
    
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
      build: match[5]
    };
  }

  determineVersionBump(changes: ChangeType[]): 'major' | 'minor' | 'patch' {
    if (changes.includes('breaking')) {
      return 'major';
    }
    
    if (changes.includes('feature')) {
      return 'minor';
    }
    
    return 'patch';
  }
}

type ChangeType = 'breaking' | 'feature' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore';
```

### Automated Release Pipeline
```typescript
// ✅ PREFERRED: Automated release management
interface ReleaseConfig {
  version: string;
  changelogPath: string;
  packageJsonPath: string;
  buildCommand: string;
  testCommand: string;
  publishCommand: string;
}

class ReleaseManager {
  constructor(
    private config: ReleaseConfig,
    private versionManager: VersionManager,
    private changelogGenerator: ChangelogGenerator
  ) {}

  async executeRelease(releaseType: 'major' | 'minor' | 'patch' | 'prerelease'): Promise<void> {
    try {
      console.log(`Starting ${releaseType} release process...`);
      
      // 1. Pre-release checks
      await this.runPreReleaseChecks();
      
      // 2. Version bump
      const newVersion = await this.bumpVersion(releaseType);
      
      // 3. Generate changelog
      await this.updateChangelog(newVersion);
      
      // 4. Build and test
      await this.buildAndTest();
      
      // 5. Create release package
      await this.createReleasePackage();
      
      // 6. Publish release
      await this.publishRelease(newVersion);
      
      // 7. Post-release tasks
      await this.postReleaseCleanup(newVersion);
      
      console.log(`✅ Release ${newVersion} completed successfully!`);
      
    } catch (error) {
      console.error(`❌ Release failed: ${error.message}`);
      await this.rollbackRelease();
      throw error;
    }
  }

  private async runPreReleaseChecks(): Promise<void> {
    console.log('Running pre-release checks...');
    
    // Check git status
    const gitStatus = await this.runCommand('git status --porcelain');
    if (gitStatus.stdout.trim()) {
      throw new Error('Working directory is not clean. Commit or stash changes before release.');
    }
    
    // Run quality gates
    await this.runCommand('npm run quality-check');
    
    // Check for required files
    const requiredFiles = ['package.json', 'README.md', 'CHANGELOG.md'];
    for (const file of requiredFiles) {
      if (!await this.fileExists(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
    
    console.log('✅ Pre-release checks passed');
  }

  private async bumpVersion(releaseType: string): Promise<string> {
    console.log(`Bumping version (${releaseType})...`);
    
    const currentVersion = await this.getCurrentVersion();
    let newVersion: Version;
    
    switch (releaseType) {
      case 'major':
        newVersion = this.versionManager.bumpMajor();
        break;
      case 'minor':
        newVersion = this.versionManager.bumpMinor();
        break;
      case 'patch':
        newVersion = this.versionManager.bumpPatch();
        break;
      case 'prerelease':
        newVersion = this.versionManager.createPrerelease('beta');
        break;
      default:
        throw new Error(`Invalid release type: ${releaseType}`);
    }
    
    const versionString = this.versionManager.toString(newVersion);
    
    // Update package.json
    await this.updatePackageVersion(versionString);
    
    console.log(`✅ Version bumped to ${versionString}`);
    return versionString;
  }

  private async updateChangelog(version: string): Promise<void> {
    console.log('Updating changelog...');
    
    const changes = await this.getChangesSinceLastRelease();
    const changelogEntry = await this.changelogGenerator.generateEntry(version, changes);
    
    await this.prependToChangelog(changelogEntry);
    
    console.log('✅ Changelog updated');
  }

  private async buildAndTest(): Promise<void> {
    console.log('Building and testing...');
    
    // Clean previous builds
    await this.runCommand('npm run clean');
    
    // Install dependencies
    await this.runCommand('npm ci');
    
    // Run tests
    await this.runCommand(this.config.testCommand);
    
    // Build for production
    await this.runCommand(this.config.buildCommand);
    
    console.log('✅ Build and test completed');
  }

  private async createReleasePackage(): Promise<void> {
    console.log('Creating release package...');
    
    // Package VS Code extension
    await this.runCommand('npx vsce package');
    
    // Verify package integrity
    await this.verifyPackage();
    
    console.log('✅ Release package created');
  }

  private async publishRelease(version: string): Promise<void> {
    console.log('Publishing release...');
    
    // Create git tag
    await this.runCommand(`git tag -a v${version} -m "Release v${version}"`);
    
    // Push to repository
    await this.runCommand('git push origin main --tags');
    
    // Publish to VS Code Marketplace
    await this.runCommand(this.config.publishCommand);
    
    // Create GitHub release
    await this.createGitHubRelease(version);
    
    console.log('✅ Release published');
  }

  private async postReleaseCleanup(version: string): Promise<void> {
    console.log('Running post-release cleanup...');
    
    // Update development version
    const devVersion = this.versionManager.toString(
      this.versionManager.createPrerelease('dev')
    );
    await this.updatePackageVersion(devVersion);
    
    // Commit version update
    await this.runCommand(`git add package.json`);
    await this.runCommand(`git commit -m "chore: bump version to ${devVersion}"`);
    await this.runCommand('git push origin main');
    
    console.log('✅ Post-release cleanup completed');
  }

  private async rollbackRelease(): Promise<void> {
    console.log('Rolling back release...');
    
    // Reset git changes
    await this.runCommand('git reset --hard HEAD');
    
    // Remove any created tags
    const tags = await this.runCommand('git tag --points-at HEAD');
    if (tags.stdout.trim()) {
      await this.runCommand(`git tag -d ${tags.stdout.trim()}`);
    }
    
    console.log('✅ Release rollback completed');
  }

  // Helper methods
  private async runCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    // Implementation for running shell commands
    return { stdout: '', stderr: '' };
  }

  private async fileExists(path: string): Promise<boolean> {
    // Implementation for file existence check
    return true;
  }

  private async getCurrentVersion(): Promise<string> {
    // Implementation to get current version from package.json
    return '1.0.0';
  }

  private async updatePackageVersion(version: string): Promise<void> {
    // Implementation to update package.json version
  }

  private async getChangesSinceLastRelease(): Promise<string[]> {
    // Implementation to get git changes since last release
    return [];
  }

  private async prependToChangelog(entry: string): Promise<void> {
    // Implementation to update changelog
  }

  private async verifyPackage(): Promise<void> {
    // Implementation to verify package integrity
  }

  private async createGitHubRelease(version: string): Promise<void> {
    // Implementation to create GitHub release
  }
}
```

## Changelog Generation

### Automated Changelog Creation
```typescript
// ✅ PREFERRED: Automated changelog generation
interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    breaking: string[];
    features: string[];
    fixes: string[];
    improvements: string[];
    documentation: string[];
  };
}

class ChangelogGenerator {
  async generateEntry(version: string, commits: GitCommit[]): Promise<string> {
    const entry: ChangelogEntry = {
      version,
      date: new Date().toISOString().split('T')[0],
      changes: {
        breaking: [],
        features: [],
        fixes: [],
        improvements: [],
        documentation: []
      }
    };

    // Categorize commits
    commits.forEach(commit => {
      const category = this.categorizeCommit(commit);
      const description = this.formatCommitDescription(commit);
      
      switch (category) {
        case 'breaking':
          entry.changes.breaking.push(description);
          break;
        case 'feat':
          entry.changes.features.push(description);
          break;
        case 'fix':
          entry.changes.fixes.push(description);
          break;
        case 'perf':
        case 'refactor':
          entry.changes.improvements.push(description);
          break;
        case 'docs':
          entry.changes.documentation.push(description);
          break;
      }
    });

    return this.formatChangelogEntry(entry);
  }

  private categorizeCommit(commit: GitCommit): string {
    const message = commit.message.toLowerCase();
    
    if (message.includes('breaking change') || message.includes('!:')) {
      return 'breaking';
    }
    
    if (message.startsWith('feat')) {
      return 'feat';
    }
    
    if (message.startsWith('fix')) {
      return 'fix';
    }
    
    if (message.startsWith('perf')) {
      return 'perf';
    }
    
    if (message.startsWith('refactor')) {
      return 'refactor';
    }
    
    if (message.startsWith('docs')) {
      return 'docs';
    }
    
    return 'other';
  }

  private formatCommitDescription(commit: GitCommit): string {
    // Remove conventional commit prefix and format
    const description = commit.message
      .replace(/^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?!?:\s*/, '')
      .trim();
    
    return description.charAt(0).toUpperCase() + description.slice(1);
  }

  private formatChangelogEntry(entry: ChangelogEntry): string {
    let changelog = `## [${entry.version}] - ${entry.date}\n\n`;

    if (entry.changes.breaking.length > 0) {
      changelog += '### ⚠️ BREAKING CHANGES\n\n';
      entry.changes.breaking.forEach(change => {
        changelog += `- ${change}\n`;
      });
      changelog += '\n';
    }

    if (entry.changes.features.length > 0) {
      changelog += '### ✨ Features\n\n';
      entry.changes.features.forEach(change => {
        changelog += `- ${change}\n`;
      });
      changelog += '\n';
    }

    if (entry.changes.fixes.length > 0) {
      changelog += '### 🐛 Bug Fixes\n\n';
      entry.changes.fixes.forEach(change => {
        changelog += `- ${change}\n`;
      });
      changelog += '\n';
    }

    if (entry.changes.improvements.length > 0) {
      changelog += '### 🚀 Improvements\n\n';
      entry.changes.improvements.forEach(change => {
        changelog += `- ${change}\n`;
      });
      changelog += '\n';
    }

    if (entry.changes.documentation.length > 0) {
      changelog += '### 📚 Documentation\n\n';
      entry.changes.documentation.forEach(change => {
        changelog += `- ${change}\n`;
      });
      changelog += '\n';
    }

    return changelog;
  }
}

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}
```

## Maintenance Procedures

### Post-Release Monitoring
```typescript
// ✅ PREFERRED: Post-release monitoring system
interface ReleaseMetrics {
  version: string;
  releaseDate: string;
  downloads: number;
  ratings: {
    average: number;
    count: number;
  };
  issues: {
    total: number;
    critical: number;
    resolved: number;
  };
  performance: {
    activationTime: number;
    crashRate: number;
    memoryUsage: number;
  };
}

class ReleaseMonitor {
  async monitorRelease(version: string): Promise<ReleaseMetrics> {
    const metrics: ReleaseMetrics = {
      version,
      releaseDate: new Date().toISOString(),
      downloads: await this.getDownloadCount(version),
      ratings: await this.getRatings(version),
      issues: await this.getIssueMetrics(version),
      performance: await this.getPerformanceMetrics(version)
    };

    // Check for critical issues
    await this.checkForCriticalIssues(metrics);
    
    // Generate monitoring report
    await this.generateMonitoringReport(metrics);
    
    return metrics;
  }

  private async checkForCriticalIssues(metrics: ReleaseMetrics): Promise<void> {
    const criticalThresholds = {
      crashRate: 0.05, // 5%
      criticalIssues: 5,
      ratingDrop: 0.5
    };

    const alerts: string[] = [];

    if (metrics.performance.crashRate > criticalThresholds.crashRate) {
      alerts.push(`High crash rate: ${(metrics.performance.crashRate * 100).toFixed(2)}%`);
    }

    if (metrics.issues.critical > criticalThresholds.criticalIssues) {
      alerts.push(`High number of critical issues: ${metrics.issues.critical}`);
    }

    if (metrics.ratings.average < 3.5) {
      alerts.push(`Low rating: ${metrics.ratings.average}/5`);
    }

    if (alerts.length > 0) {
      await this.sendCriticalAlert(metrics.version, alerts);
    }
  }

  private async sendCriticalAlert(version: string, alerts: string[]): Promise<void> {
    console.error(`🚨 CRITICAL ALERT for version ${version}:`);
    alerts.forEach(alert => console.error(`  - ${alert}`));
    
    // Send notifications to team
    // Implementation for sending alerts
  }

  private async generateMonitoringReport(metrics: ReleaseMetrics): Promise<void> {
    const report = `# Release Monitoring Report - ${metrics.version}

## Overview
- **Release Date**: ${metrics.releaseDate}
- **Downloads**: ${metrics.downloads.toLocaleString()}
- **Average Rating**: ${metrics.ratings.average}/5 (${metrics.ratings.count} reviews)

## Issues
- **Total Issues**: ${metrics.issues.total}
- **Critical Issues**: ${metrics.issues.critical}
- **Resolved Issues**: ${metrics.issues.resolved}
- **Resolution Rate**: ${((metrics.issues.resolved / metrics.issues.total) * 100).toFixed(1)}%

## Performance
- **Activation Time**: ${metrics.performance.activationTime}ms
- **Crash Rate**: ${(metrics.performance.crashRate * 100).toFixed(2)}%
- **Memory Usage**: ${metrics.performance.memoryUsage}MB

## Recommendations
${this.generateRecommendations(metrics)}
`;

    await this.saveReport(`release-monitoring-${metrics.version}.md`, report);
  }

  private generateRecommendations(metrics: ReleaseMetrics): string {
    const recommendations: string[] = [];

    if (metrics.performance.activationTime > 200) {
      recommendations.push('- Consider optimizing extension activation time');
    }

    if (metrics.issues.critical > 0) {
      recommendations.push('- Prioritize fixing critical issues in next patch release');
    }

    if (metrics.ratings.average < 4.0) {
      recommendations.push('- Investigate user feedback and address common complaints');
    }

    return recommendations.length > 0 ? recommendations.join('\n') : '- No immediate action required';
  }

  // Helper methods
  private async getDownloadCount(version: string): Promise<number> {
    // Implementation to get download metrics
    return 1000;
  }

  private async getRatings(version: string): Promise<{ average: number; count: number }> {
    // Implementation to get rating metrics
    return { average: 4.2, count: 50 };
  }

  private async getIssueMetrics(version: string): Promise<{ total: number; critical: number; resolved: number }> {
    // Implementation to get issue metrics
    return { total: 10, critical: 1, resolved: 8 };
  }

  private async getPerformanceMetrics(version: string): Promise<{ activationTime: number; crashRate: number; memoryUsage: number }> {
    // Implementation to get performance metrics
    return { activationTime: 150, crashRate: 0.02, memoryUsage: 45 };
  }

  private async saveReport(filename: string, content: string): Promise<void> {
    // Implementation to save monitoring report
  }
}
```

## Best Practices Summary

### Do's
- ✅ Follow semantic versioning strictly
- ✅ Run comprehensive quality gates before release
- ✅ Generate detailed changelogs automatically
- ✅ Monitor releases for critical issues
- ✅ Maintain rollback procedures
- ✅ Use automated release pipelines
- ✅ Document release procedures thoroughly

### Don'ts
- ❌ Release without passing all quality gates
- ❌ Skip version bumping or changelog updates
- ❌ Deploy directly to production without staging
- ❌ Ignore post-release monitoring
- ❌ Release without proper testing
- ❌ Use manual release processes for critical steps

## Related Documentation

- [Development Methodology](development-methodology.md) - Quality gates and development process
- [Documentation Management](documentation-management.md) - Release documentation requirements
- [Code Quality & Linting](../quality/code-quality-linting.md) - Pre-release quality checks
- [Quality Checklist](../checklists/quality-checklist.md) - Release quality verification

---

*Robust deployment and release management ensures reliable, high-quality releases with proper monitoring and rollback capabilities.*
