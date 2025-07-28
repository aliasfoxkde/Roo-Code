# .roo Directory System Enhancement Design

## Overview

This design document outlines the enhancement of the existing .roo directory system in the Roo Code VS Code Extension. The current system already provides a solid foundation with global/project-local configurations and mode-specific rules. This enhancement focuses on adding missing capabilities while maintaining backward compatibility.

## Architecture

### Current Architecture (Preserved)
```
Global: ~/.roo/
Project: {project-root}/.roo/
├── rules/                    # Generic rules
├── rules-{mode}/            # Mode-specific rules  
├── custom-instructions.md   # Custom instructions
└── temp/                    # Temporary files
```

### Enhanced Architecture
```
Global: ~/.roo/
Project: {project-root}/.roo/
├── config/                  # NEW: Configuration files
│   ├── roo.config.json     # Main configuration
│   ├── typescript.json     # TypeScript settings
│   ├── modes.json          # Mode configurations
│   └── templates/          # Configuration templates
├── rules/                   # Generic rules (existing)
├── rules-{mode}/           # Mode-specific rules (existing)
├── custom-instructions.md  # Custom instructions (existing)
├── temp/                   # Temporary files (existing)
├── schemas/                # NEW: JSON schemas for validation
├── templates/              # NEW: Pre-built configurations
└── .roo-watch              # NEW: File watching configuration
```

## Components and Interfaces

### 1. Enhanced Configuration Service
**Location**: `src/services/roo-config/`

**New Functions**:
```typescript
interface RooConfigService {
  // Existing functions (preserved)
  getGlobalRooDirectory(): string
  getProjectRooDirectoryForCwd(cwd: string): string
  getRooDirectoriesForCwd(cwd: string): string[]
  loadConfiguration(relativePath: string, cwd: string): Promise<any>
  
  // New functions
  loadRooConfig(cwd: string): Promise<RooConfig>
  validateConfiguration(config: any): ValidationResult
  watchConfigurationChanges(cwd: string, callback: (changes: ConfigChange[]) => void): FileWatcher
  getConfigurationSchema(configType: string): JSONSchema
  mergeConfigurations(global: RooConfig, project: RooConfig): RooConfig
}
```

### 2. File Watching Service
**Location**: `src/services/file-watcher/`

```typescript
interface FileWatcherService {
  watchDirectory(path: string, options: WatchOptions): FileWatcher
  watchFile(path: string, callback: (event: FileEvent) => void): FileWatcher
  stopWatching(watcher: FileWatcher): void
  isWatching(path: string): boolean
}
```

### 3. TypeScript Integration Service
**Location**: `src/services/typescript-integration/`

```typescript
interface TypeScriptIntegrationService {
  validateProject(cwd: string): Promise<ValidationResult>
  getCompilerOptions(cwd: string): Promise<CompilerOptions>
  checkForErrors(files: string[]): Promise<Diagnostic[]>
  configureForMode(mode: string, cwd: string): Promise<void>
}
```

### 4. Mode Management Service
**Location**: `src/services/mode-management/`

```typescript
interface ModeManagementService {
  getCurrentMode(cwd: string): Promise<string>
  switchMode(mode: string, cwd: string): Promise<void>
  getAvailableModes(cwd: string): Promise<ModeDefinition[]>
  handleModeSpecificFiles(mode: string, cwd: string): Promise<void>
  isolateTestFiles(cwd: string): Promise<void>
}
```

## Data Models

### Configuration Schema
```typescript
interface RooConfig {
  version: string
  extends?: string[]  // Inherit from other configs
  typescript?: {
    enabled: boolean
    configPath?: string
    validateOnSave: boolean
    compilerOptions?: CompilerOptions
  }
  modes?: {
    development: ModeConfig
    production: ModeConfig
    [key: string]: ModeConfig
  }
  fileWatching?: {
    enabled: boolean
    debounceMs: number
    excludePatterns: string[]
  }
  rules?: {
    inheritance: 'merge' | 'override'
    globalFirst: boolean
  }
}

interface ModeConfig {
  testFilePatterns: string[]
  excludePatterns: string[]
  includePatterns: string[]
  customInstructions?: string
  ruleDirectories?: string[]
}
```

### File Event Schema
```typescript
interface FileEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed'
  path: string
  timestamp: number
  metadata?: any
}

interface ConfigChange {
  configType: string
  path: string
  oldValue?: any
  newValue?: any
  timestamp: number
}
```

## Error Handling

### Configuration Validation
- JSON schema validation for all configuration files
- Graceful fallback to defaults for invalid configurations
- Clear error messages with suggestions for fixes
- Validation warnings for deprecated options

### File Watching Errors
- Automatic retry with exponential backoff for file system errors
- Fallback to polling when native watching fails
- Error logging without breaking extension functionality
- User notification for critical watching failures

### TypeScript Integration Errors
- Non-blocking TypeScript errors (warnings only)
- Fallback to basic functionality when TypeScript unavailable
- Clear error reporting in VS Code problems panel
- Option to disable TypeScript integration

## Testing Strategy

### Unit Tests
- Configuration loading and merging logic
- File watching service functionality
- TypeScript integration service
- Mode management service
- Schema validation

### Integration Tests
- End-to-end configuration loading
- File watching with actual file changes
- TypeScript compilation integration
- Mode switching workflows
- Hot reloading functionality

### Performance Tests
- File watching performance with large projects
- Configuration loading speed
- Memory usage during continuous operation
- TypeScript integration overhead

## Implementation Phases

### Phase 1: Core Infrastructure
1. Enhanced configuration service with schema validation
2. File watching service implementation
3. Configuration merging and inheritance
4. Basic hot reloading functionality

### Phase 2: TypeScript Integration
1. TypeScript service implementation
2. Compile-time validation
3. IDE integration for real-time feedback
4. Custom tsconfig.json support

### Phase 3: Mode Management
1. Enhanced mode switching
2. Development vs production handling
3. Test file isolation
4. Mode-specific configurations

### Phase 4: Advanced Features
1. Configuration templates
2. Startup wizard framework
3. Migration tools
4. Extension points

## Backward Compatibility

### Preserved Functionality
- All existing .roo directory structures continue to work
- Legacy `.roorules` and `.clinerules` files supported
- Current mode system remains functional
- Existing API functions maintained

### Migration Strategy
- Automatic detection of legacy configurations
- Optional migration wizard for new features
- Side-by-side operation during transition
- Clear documentation for migration paths

## Performance Considerations

### File Watching Optimization
- Debounced file change events
- Intelligent filtering of irrelevant changes
- Efficient directory traversal
- Memory-conscious event handling

### Configuration Caching
- In-memory caching of parsed configurations
- Invalidation on file changes
- Lazy loading of unused configurations
- Efficient merging algorithms

### TypeScript Integration
- Incremental compilation support
- Background validation
- Minimal impact on extension startup
- Optional disable for performance-critical scenarios

This design maintains the robust foundation of the existing .roo directory system while adding the missing capabilities identified in the requirements.
