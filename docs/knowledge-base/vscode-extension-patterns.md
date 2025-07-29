# VS Code Extension Development Patterns

This document provides comprehensive analysis of VS Code extension development patterns, focusing on configuration management, file watching, and user experience design derived from successful extensions and official VS Code documentation.

## Overview

VS Code extensions provide powerful ways to enhance the development experience through custom functionality, configuration systems, and workspace integration. This analysis examines proven patterns for building robust, performant, and user-friendly extensions.

## Extension Architecture Patterns

### 1. Activation and Lifecycle Management

#### Extension Activation
```typescript
// package.json activation events
{
  "activationEvents": [
    "onStartupFinished",           // After VS Code startup
    "onLanguage:typescript",       // When TypeScript files opened
    "workspaceContains:.roo",      // When workspace contains .roo directory
    "onCommand:extension.command", // When specific command executed
    "onFileSystem:file"            // When file system scheme accessed
  ]
}

// Extension activation function
export async function activate(context: vscode.ExtensionContext) {
  // Initialize services
  const configManager = new ConfigurationManager(context)
  const fileWatcher = new FileWatcherService(context)
  
  // Register commands
  const commands = [
    vscode.commands.registerCommand('extension.reload', () => configManager.reload()),
    vscode.commands.registerCommand('extension.configure', () => showConfigDialog())
  ]
  
  // Register providers
  const providers = [
    vscode.languages.registerCompletionItemProvider('typescript', completionProvider),
    vscode.workspace.registerFileSystemProvider('custom', fileSystemProvider)
  ]
  
  // Add to subscriptions for cleanup
  context.subscriptions.push(...commands, ...providers)
  
  // Initialize configuration
  await configManager.initialize()
}

export function deactivate() {
  // Cleanup is handled automatically by VS Code via subscriptions
}
```

#### Lifecycle Management Best Practices
- Use `context.subscriptions` for automatic cleanup
- Initialize heavy services lazily when first needed
- Provide graceful degradation if initialization fails
- Cache expensive operations across sessions

### 2. Configuration Management Patterns

#### Workspace Configuration
```typescript
// Reading VS Code settings
const config = vscode.workspace.getConfiguration('myExtension')
const enableFeature = config.get<boolean>('enableFeature', true)
const customPath = config.get<string>('customPath', './default')

// Watching configuration changes
vscode.workspace.onDidChangeConfiguration(event => {
  if (event.affectsConfiguration('myExtension')) {
    // Reload configuration
    this.reloadConfiguration()
  }
})

// Multi-root workspace support
vscode.workspace.workspaceFolders?.forEach(folder => {
  const folderConfig = vscode.workspace.getConfiguration('myExtension', folder.uri)
  // Handle per-folder configuration
})
```

#### File-Based Configuration
```typescript
class ConfigurationManager {
  private configCache = new Map<string, any>()
  private watchers = new Map<string, vscode.FileSystemWatcher>()
  
  async loadConfiguration(configPath: string): Promise<any> {
    // Check cache first
    if (this.configCache.has(configPath)) {
      return this.configCache.get(configPath)
    }
    
    try {
      const uri = vscode.Uri.file(configPath)
      const content = await vscode.workspace.fs.readFile(uri)
      const config = JSON.parse(content.toString())
      
      // Cache the configuration
      this.configCache.set(configPath, config)
      
      // Set up file watching
      this.watchConfiguration(configPath)
      
      return config
    } catch (error) {
      // Handle missing or invalid configuration
      return this.getDefaultConfiguration()
    }
  }
  
  private watchConfiguration(configPath: string) {
    if (this.watchers.has(configPath)) return
    
    const watcher = vscode.workspace.createFileSystemWatcher(configPath)
    
    watcher.onDidChange(() => {
      this.configCache.delete(configPath)
      this.emit('configurationChanged', configPath)
    })
    
    watcher.onDidDelete(() => {
      this.configCache.delete(configPath)
      this.emit('configurationDeleted', configPath)
    })
    
    this.watchers.set(configPath, watcher)
  }
}
```

### 3. File System Integration

#### File Watching Patterns
```typescript
class FileWatcherService {
  private watchers = new Set<vscode.FileSystemWatcher>()
  
  watchDirectory(pattern: string, options: {
    ignoreCreateEvents?: boolean
    ignoreChangeEvents?: boolean
    ignoreDeleteEvents?: boolean
  } = {}) {
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(vscode.workspace.workspaceFolders![0], pattern),
      options.ignoreCreateEvents,
      options.ignoreChangeEvents,
      options.ignoreDeleteEvents
    )
    
    this.watchers.add(watcher)
    return watcher
  }
  
  watchFile(filePath: string) {
    return this.watchDirectory(filePath, {
      ignoreCreateEvents: false,
      ignoreChangeEvents: false,
      ignoreDeleteEvents: false
    })
  }
  
  dispose() {
    this.watchers.forEach(watcher => watcher.dispose())
    this.watchers.clear()
  }
}
```

#### File System Operations
```typescript
// Reading files
async function readFile(path: string): Promise<string> {
  const uri = vscode.Uri.file(path)
  const content = await vscode.workspace.fs.readFile(uri)
  return new TextDecoder().decode(content)
}

// Writing files
async function writeFile(path: string, content: string): Promise<void> {
  const uri = vscode.Uri.file(path)
  const encoded = new TextEncoder().encode(content)
  await vscode.workspace.fs.writeFile(uri, encoded)
}

// Checking file existence
async function fileExists(path: string): Promise<boolean> {
  try {
    const uri = vscode.Uri.file(path)
    await vscode.workspace.fs.stat(uri)
    return true
  } catch {
    return false
  }
}

// Directory operations
async function ensureDirectory(path: string): Promise<void> {
  const uri = vscode.Uri.file(path)
  try {
    await vscode.workspace.fs.createDirectory(uri)
  } catch (error) {
    // Directory might already exist
    if (error.code !== 'FileExists') {
      throw error
    }
  }
}
```

### 4. User Interface Patterns

#### Webview Integration
```typescript
class ConfigurationWebviewProvider implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    }
    
    webviewView.webview.html = this.getHtmlContent()
    
    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'saveConfiguration':
          await this.saveConfiguration(message.config)
          break
        case 'loadConfiguration':
          const config = await this.loadConfiguration()
          webviewView.webview.postMessage({ type: 'configurationLoaded', config })
          break
      }
    })
  }
  
  private getHtmlContent(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Configuration</title>
      </head>
      <body>
        <div id="app"></div>
        <script>
          const vscode = acquireVsCodeApi();
          // Webview JavaScript code
        </script>
      </body>
      </html>
    `
  }
}
```

#### Status Bar Integration
```typescript
class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem
  
  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    )
  }
  
  updateStatus(text: string, tooltip?: string, command?: string) {
    this.statusBarItem.text = text
    this.statusBarItem.tooltip = tooltip
    this.statusBarItem.command = command
    this.statusBarItem.show()
  }
  
  showProgress(message: string) {
    this.statusBarItem.text = `$(sync~spin) ${message}`
    this.statusBarItem.show()
  }
  
  hide() {
    this.statusBarItem.hide()
  }
}
```

#### Quick Pick and Input Patterns
```typescript
// Quick pick for selection
async function showQuickPick<T>(items: Array<vscode.QuickPickItem & { data: T }>): Promise<T | undefined> {
  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select an option',
    matchOnDescription: true,
    matchOnDetail: true
  })
  
  return selected?.data
}

// Input box for text entry
async function showInputBox(prompt: string, defaultValue?: string): Promise<string | undefined> {
  return vscode.window.showInputBox({
    prompt,
    value: defaultValue,
    validateInput: (value) => {
      if (!value.trim()) {
        return 'Value cannot be empty'
      }
      return null
    }
  })
}

// Multi-step input wizard
async function showMultiStepInput(): Promise<any> {
  const state: any = {}
  
  // Step 1: Project type
  const projectTypes = [
    { label: 'React', description: 'React application' },
    { label: 'Node.js', description: 'Node.js server' },
    { label: 'Python', description: 'Python application' }
  ]
  
  const projectType = await vscode.window.showQuickPick(projectTypes, {
    placeHolder: 'Select project type'
  })
  
  if (!projectType) return
  state.projectType = projectType.label
  
  // Step 2: Project name
  const projectName = await vscode.window.showInputBox({
    prompt: 'Enter project name',
    validateInput: (value) => value.trim() ? null : 'Name is required'
  })
  
  if (!projectName) return
  state.projectName = projectName
  
  return state
}
```

### 5. Performance Optimization Patterns

#### Lazy Loading and Caching
```typescript
class LazyService {
  private _instance: ExpensiveService | undefined
  private _cache = new Map<string, any>()
  
  get instance(): ExpensiveService {
    if (!this._instance) {
      this._instance = new ExpensiveService()
    }
    return this._instance
  }
  
  async getCachedData(key: string): Promise<any> {
    if (this._cache.has(key)) {
      return this._cache.get(key)
    }
    
    const data = await this.loadExpensiveData(key)
    this._cache.set(key, data)
    return data
  }
  
  invalidateCache(key?: string) {
    if (key) {
      this._cache.delete(key)
    } else {
      this._cache.clear()
    }
  }
}
```

#### Debouncing and Throttling
```typescript
class DebouncedFileWatcher {
  private debounceMap = new Map<string, NodeJS.Timeout>()
  
  onFileChange(filePath: string, handler: () => void, delay = 300) {
    // Clear existing timeout
    const existingTimeout = this.debounceMap.get(filePath)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      handler()
      this.debounceMap.delete(filePath)
    }, delay)
    
    this.debounceMap.set(filePath, timeout)
  }
  
  dispose() {
    this.debounceMap.forEach(timeout => clearTimeout(timeout))
    this.debounceMap.clear()
  }
}
```

#### Background Processing
```typescript
class BackgroundProcessor {
  private queue: Array<() => Promise<void>> = []
  private processing = false
  
  async enqueue(task: () => Promise<void>) {
    this.queue.push(task)
    
    if (!this.processing) {
      this.processQueue()
    }
  }
  
  private async processQueue() {
    this.processing = true
    
    while (this.queue.length > 0) {
      const task = this.queue.shift()!
      
      try {
        await task()
      } catch (error) {
        console.error('Background task failed:', error)
      }
      
      // Yield control to prevent blocking
      await new Promise(resolve => setImmediate(resolve))
    }
    
    this.processing = false
  }
}
```

### 6. Error Handling and Logging

#### Centralized Error Handling
```typescript
class ErrorHandler {
  static handle(error: Error, context?: string) {
    const message = context ? `${context}: ${error.message}` : error.message
    
    // Log to output channel
    this.outputChannel.appendLine(`[ERROR] ${message}`)
    this.outputChannel.appendLine(error.stack || '')
    
    // Show user-friendly message
    vscode.window.showErrorMessage(
      `Extension error: ${message}`,
      'Show Details',
      'Report Issue'
    ).then(selection => {
      if (selection === 'Show Details') {
        this.outputChannel.show()
      } else if (selection === 'Report Issue') {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/repo/issues'))
      }
    })
  }
  
  private static outputChannel = vscode.window.createOutputChannel('Extension Name')
}
```

#### Logging Service
```typescript
enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

class Logger {
  private outputChannel: vscode.OutputChannel
  private logLevel: LogLevel
  
  constructor(name: string, logLevel = LogLevel.Info) {
    this.outputChannel = vscode.window.createOutputChannel(name)
    this.logLevel = logLevel
  }
  
  debug(message: string, ...args: any[]) {
    this.log(LogLevel.Debug, message, ...args)
  }
  
  info(message: string, ...args: any[]) {
    this.log(LogLevel.Info, message, ...args)
  }
  
  warn(message: string, ...args: any[]) {
    this.log(LogLevel.Warn, message, ...args)
  }
  
  error(message: string, error?: Error) {
    this.log(LogLevel.Error, message, error?.stack)
  }
  
  private log(level: LogLevel, message: string, ...args: any[]) {
    if (level < this.logLevel) return
    
    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level].toUpperCase()
    const formattedMessage = `[${timestamp}] [${levelName}] ${message}`
    
    if (args.length > 0) {
      this.outputChannel.appendLine(`${formattedMessage} ${JSON.stringify(args)}`)
    } else {
      this.outputChannel.appendLine(formattedMessage)
    }
  }
  
  show() {
    this.outputChannel.show()
  }
}
```

## Configuration System Best Practices

### 1. Hierarchical Configuration
- Support workspace, folder, and user-level settings
- Implement proper inheritance and override mechanisms
- Provide clear precedence rules

### 2. Schema Validation
- Use JSON Schema for configuration validation
- Provide helpful error messages for invalid configurations
- Support configuration migration between versions

### 3. Hot Reloading
- Watch configuration files for changes
- Implement debounced reloading to prevent excessive updates
- Provide user feedback when configuration is reloaded

### 4. Default Values
- Provide sensible defaults for all configuration options
- Make the extension work out-of-the-box without configuration
- Document all configuration options clearly

## Testing Patterns

### Unit Testing
```typescript
// Extension test setup
import * as vscode from 'vscode'
import * as assert from 'assert'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')
  
  test('Configuration loading', async () => {
    const config = await loadConfiguration()
    assert.strictEqual(config.enabled, true)
  })
  
  test('File watching', (done) => {
    const watcher = new FileWatcherService()
    watcher.on('fileChanged', (path) => {
      assert.ok(path.endsWith('.test'))
      done()
    })
    
    // Trigger file change
    writeTestFile()
  })
})
```

### Integration Testing
```typescript
// Test with real VS Code workspace
suite('Integration Tests', () => {
  let workspaceUri: vscode.Uri
  
  suiteSetup(async () => {
    // Create test workspace
    workspaceUri = vscode.Uri.file('/tmp/test-workspace')
    await vscode.workspace.fs.createDirectory(workspaceUri)
  })
  
  test('End-to-end configuration flow', async () => {
    // Create configuration file
    const configUri = vscode.Uri.joinPath(workspaceUri, '.roo', 'config.json')
    await vscode.workspace.fs.writeFile(configUri, Buffer.from('{"test": true}'))
    
    // Load and verify configuration
    const config = await loadConfiguration(workspaceUri.fsPath)
    assert.strictEqual(config.test, true)
  })
})
```

## Lessons for Roo Code Extension

### 1. Architecture Principles
- Use event-driven architecture for loose coupling
- Implement proper service lifecycle management
- Design for extensibility and modularity

### 2. Configuration Management
- Support both VS Code settings and file-based configuration
- Implement hierarchical configuration with clear precedence
- Provide hot reloading with debouncing

### 3. Performance Considerations
- Use lazy loading for expensive operations
- Implement efficient caching strategies
- Debounce file system events

### 4. User Experience
- Provide immediate feedback for user actions
- Implement progressive disclosure of features
- Use consistent VS Code UI patterns

---

**Sources:**
- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [GitHub Desktop Analysis](https://github.com/desktop/desktop)

**Last Updated**: January 28, 2024  
**Research Scope**: VS Code extension development, configuration management, file watching  
**Status**: Comprehensive analysis for Roo Code development
