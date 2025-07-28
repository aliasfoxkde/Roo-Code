# .roo Directory System

The `.roo` directory is the heart of Roo Code's configuration system. It provides a powerful, hierarchical way to customize the extension's behavior for your projects.

## Overview

The `.roo` directory system supports:
- **Global configurations** in `~/.roo/`
- **Project-specific configurations** in `{project}/.roo/`
- **Hierarchical inheritance** (project overrides global)
- **Hot reloading** (changes apply immediately)
- **Mode-specific rules** for different development environments

## Directory Structure

### Complete Structure
```
.roo/
├── config/                  # Configuration files
│   ├── roo.config.json     # Main configuration
│   ├── typescript.json     # TypeScript settings
│   ├── modes.json          # Mode configurations
│   └── templates/          # Configuration templates
├── rules/                   # Generic rules
│   ├── coding-standards.md
│   ├── project-guidelines.md
│   └── best-practices.md
├── rules-{mode}/           # Mode-specific rules
│   ├── rules-development/
│   ├── rules-production/
│   └── rules-test/
├── custom-instructions.md  # Custom AI instructions
├── temp/                   # Temporary files
├── schemas/                # JSON schemas for validation
└── templates/              # Pre-built configurations
```

### Minimal Structure
For simple projects, you only need:
```
.roo/
├── rules/
│   └── rules.md           # Your project rules
└── custom-instructions.md # Optional custom instructions
```

## Configuration Hierarchy

### Global vs Project Configuration

1. **Global Configuration** (`~/.roo/`)
   - Applies to all projects
   - Default settings and rules
   - Shared across your entire system

2. **Project Configuration** (`{project}/.roo/`)
   - Specific to the current project
   - Overrides global settings
   - Team-shareable via version control

### Loading Order
1. Global configuration is loaded first
2. Project configuration is loaded second
3. Project settings override global settings
4. Mode-specific rules are applied last

## Configuration Files

### Main Configuration (`config/roo.config.json`)

```json
{
  "version": "1.0",
  "extends": ["@roo-code/base-config"],
  "typescript": {
    "enabled": true,
    "validateOnSave": true,
    "configPath": "./tsconfig.json"
  },
  "modes": {
    "development": {
      "testFilePatterns": ["**/*.test.ts", "**/*.spec.ts"],
      "includePatterns": ["**/*.ts", "**/*.tsx"],
      "excludePatterns": ["**/node_modules/**"]
    },
    "production": {
      "excludePatterns": ["**/*.test.*", "**/*.spec.*", "**/node_modules/**"]
    }
  },
  "fileWatching": {
    "enabled": true,
    "debounceMs": 300,
    "excludePatterns": ["**/*.tmp", "**/node_modules/**"]
  },
  "rules": {
    "inheritance": "merge",
    "globalFirst": true
  }
}
```

### TypeScript Configuration (`config/typescript.json`)

```json
{
  "enabled": true,
  "configPath": "./tsconfig.json",
  "validateOnSave": true,
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**"
  ],
  "includePatterns": [
    "**/*.ts",
    "**/*.tsx"
  ]
}
```

### Mode Configuration (`config/modes.json`)

```json
{
  "currentMode": "development",
  "customModes": {
    "testing": {
      "name": "Testing Mode",
      "description": "Optimized for running tests",
      "testFilePatterns": ["**/*.test.*", "**/*.spec.*"],
      "includePatterns": ["**/*.ts", "**/*.test.*"],
      "typescript": {
        "compilerOptions": {
          "types": ["jest", "node"]
        }
      }
    }
  }
}
```

## Rules System

### Generic Rules (`rules/`)

Place general rules that apply to all modes:

```markdown
# Project Coding Standards

## Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable names

## Architecture
- Follow SOLID principles
- Use dependency injection
- Implement proper error handling

## Testing
- Write unit tests for all functions
- Aim for 80%+ code coverage
- Use descriptive test names
```

### Mode-Specific Rules (`rules-{mode}/`)

Create mode-specific directories for different environments:

**`rules-development/`**
```markdown
# Development Mode Rules

## Development Practices
- Enable source maps for debugging
- Include development dependencies
- Use verbose logging
- Keep test files alongside source code

## Performance
- Development builds prioritize speed over optimization
- Hot reloading is enabled
- Source maps are included
```

**`rules-production/`**
```markdown
# Production Mode Rules

## Production Practices
- Optimize for performance and size
- Remove development dependencies
- Minimize logging
- Isolate test files

## Security
- Remove debug information
- Validate all inputs
- Use environment variables for secrets
```

## Custom Instructions

The `custom-instructions.md` file allows you to customize AI behavior:

```markdown
# Custom Instructions

## Project Context
This is a TypeScript React application with the following characteristics:
- Uses functional components with hooks
- Implements Redux for state management
- Follows Material-UI design system
- Uses Jest and React Testing Library for testing

## Coding Preferences
- Prefer arrow functions over function declarations
- Use const assertions for better type inference
- Implement proper error boundaries
- Use custom hooks for reusable logic

## Communication Style
- Provide detailed explanations for complex concepts
- Include code examples in responses
- Suggest best practices and alternatives
- Focus on maintainable, readable code
```

## Hot Reloading

The `.roo` directory system supports hot reloading:

### Automatic Detection
- File changes are detected automatically
- Configuration is reloaded without restarting VS Code
- Changes apply immediately to new operations

### Supported Files
- All `.md` files in `rules/` directories
- All `.json` files in `config/` directory
- `custom-instructions.md`
- `AGENTS.md` (community standard)

### Debouncing
- Changes are debounced to prevent excessive reloading
- Default debounce time is 300ms
- Configurable via `fileWatching.debounceMs`

## Best Practices

### Organization
1. **Keep rules focused** - One concept per file
2. **Use descriptive names** - Clear file and directory names
3. **Document changes** - Include comments in configuration files
4. **Version control** - Commit `.roo` directory with your project

### Performance
1. **Avoid large files** - Split large rule files into smaller ones
2. **Use exclude patterns** - Exclude unnecessary files from watching
3. **Optimize patterns** - Use specific patterns instead of broad ones

### Team Collaboration
1. **Share project configs** - Include `.roo` in version control
2. **Document conventions** - Explain project-specific rules
3. **Use global configs** - Share common settings across projects
4. **Regular reviews** - Review and update configurations regularly

## Examples

### React Project
```
.roo/
├── config/
│   └── roo.config.json     # React-specific settings
├── rules/
│   ├── react-patterns.md  # React best practices
│   ├── component-rules.md # Component guidelines
│   └── testing-rules.md   # Testing standards
└── custom-instructions.md # React project context
```

### Node.js API
```
.roo/
├── config/
│   ├── roo.config.json
│   └── typescript.json
├── rules/
│   ├── api-design.md      # API design principles
│   ├── security-rules.md  # Security guidelines
│   └── database-rules.md  # Database best practices
└── rules-production/
    └── deployment.md      # Production deployment rules
```

### Monorepo
```
.roo/                      # Root configuration
├── config/
│   └── roo.config.json   # Monorepo settings
└── rules/
    └── monorepo-rules.md # Shared rules

packages/
├── frontend/
│   └── .roo/             # Frontend-specific config
│       └── rules/
│           └── ui-rules.md
└── backend/
    └── .roo/             # Backend-specific config
        └── rules/
            └── api-rules.md
```

## Migration

### From Legacy Files
If you have existing `.roorules` or `.clinerules` files:

1. Create `.roo/rules/` directory
2. Move content to `.roo/rules/rules.md`
3. Update format if needed
4. Test the new configuration

### From Other Systems
When migrating from other configuration systems:

1. Analyze existing configurations
2. Map settings to `.roo` structure
3. Test incrementally
4. Document changes for team

## Troubleshooting

### Configuration Not Loading
1. Check file permissions
2. Verify JSON syntax in config files
3. Check VS Code Output panel for errors
4. Ensure `.roo` directory is in the correct location

### Hot Reloading Not Working
1. Verify `fileWatching.enabled` is true
2. Check exclude patterns aren't too broad
3. Restart VS Code if issues persist
4. Check file system permissions

### Rules Not Applying
1. Verify file paths and names
2. Check mode-specific rule directories
3. Ensure proper inheritance settings
4. Test with simple rules first

---

**Next**: [Global Settings](global-settings.md) | [Mode Configuration](mode-configuration.md)  
**Related**: [TypeScript Integration](typescript-integration.md) | [Hot Reloading](../features/hot-reloading.md)
