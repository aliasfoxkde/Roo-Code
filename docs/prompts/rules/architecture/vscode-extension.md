# VS Code Extension Development

Comprehensive guidelines for VS Code Extension API usage, webview management, and performance optimization.

## Extension API Usage

### Lifecycle Management
- **Follow VS Code Extension API best practices** and lifecycle management
- **Properly dispose of resources** using `vscode.Disposable`
- **Use `ExtensionContext.subscriptions`** for automatic cleanup
- **Implement proper activation/deactivation hooks**
- **Handle extension host restarts gracefully**

### Resource Management
```typescript
// ✅ PREFERRED: Proper resource disposal
class ExtensionManager {
  private disposables: vscode.Disposable[] = [];

  constructor(private context: vscode.ExtensionContext) {}

  registerCommand(commandId: string, handler: (...args: any[]) => any): void {
    const disposable = vscode.commands.registerCommand(commandId, handler);
    this.disposables.push(disposable);
    this.context.subscriptions.push(disposable);
  }

  registerProvider<T>(
    selector: vscode.DocumentSelector,
    provider: T
  ): void {
    let disposable: vscode.Disposable;
    
    if (this.isCompletionProvider(provider)) {
      disposable = vscode.languages.registerCompletionItemProvider(selector, provider);
    } else if (this.isHoverProvider(provider)) {
      disposable = vscode.languages.registerHoverProvider(selector, provider);
    }
    // Add more provider types as needed

    if (disposable) {
      this.disposables.push(disposable);
      this.context.subscriptions.push(disposable);
    }
  }

  dispose(): void {
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables.length = 0;
  }

  private isCompletionProvider(provider: any): provider is vscode.CompletionItemProvider {
    return provider && typeof provider.provideCompletionItems === 'function';
  }

  private isHoverProvider(provider: any): provider is vscode.HoverProvider {
    return provider && typeof provider.provideHover === 'function';
  }
}
```

### Command Registration
```typescript
// ✅ PREFERRED: Structured command registration
interface CommandConfig {
  id: string;
  title: string;
  category: string;
  handler: (...args: any[]) => Promise<any>;
  enablement?: string;
}

class CommandRegistry {
  constructor(
    private extensionManager: ExtensionManager,
    private telemetry: TelemetryService,
    private logger: Logger
  ) {}

  registerCommands(commands: CommandConfig[]): void {
    commands.forEach(config => this.registerCommand(config));
  }

  private registerCommand(config: CommandConfig): void {
    const wrappedHandler = async (...args: any[]) => {
      const startTime = Date.now();
      
      try {
        this.logger.debug(`Executing command: ${config.id}`, { args });
        
        const result = await config.handler(...args);
        
        this.telemetry.track('command_executed', {
          commandId: config.id,
          category: config.category,
          duration: Date.now() - startTime,
          success: true
        });
        
        return result;
      } catch (error) {
        this.logger.error(`Command ${config.id} failed`, { error, args });
        
        this.telemetry.track('command_failed', {
          commandId: config.id,
          category: config.category,
          duration: Date.now() - startTime,
          error: error.message
        });
        
        vscode.window.showErrorMessage(`Failed to execute ${config.title}: ${error.message}`);
        throw error;
      }
    };

    this.extensionManager.registerCommand(config.id, wrappedHandler);
  }
}
```

## Webview Management

### Secure Webview Factory
```typescript
// ✅ PREFERRED: Webview factory pattern
interface WebviewConfig {
  viewType: string;
  title: string;
  showOptions: vscode.ViewColumn | vscode.WebviewPanelShowOptions;
  options: vscode.WebviewPanelOptions & vscode.WebviewOptions;
  extensionPath: string;
}

class WebviewFactory {
  static createPanel(config: WebviewConfig): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
      config.viewType,
      config.title,
      config.showOptions,
      {
        enableScripts: true,
        enableCommandUris: false, // Security: disable command URIs
        retainContextWhenHidden: false, // Performance: don't retain context
        localResourceRoots: [
          vscode.Uri.file(path.join(config.extensionPath, 'webview-ui', 'build'))
        ],
        ...config.options
      }
    );

    // Set secure CSP and HTML content
    panel.webview.html = this.getWebviewContent(panel.webview, config);
    
    return panel;
  }

  private static getWebviewContent(webview: vscode.Webview, config: WebviewConfig): string {
    const nonce = this.generateNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(config.extensionPath, 'webview-ui', 'build', 'index.js'))
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(config.extensionPath, 'webview-ui', 'build', 'index.css'))
    );

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.escapeHtml(config.title)}</title>
        <link href="${styleUri}" rel="stylesheet">
    </head>
    <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
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

## Performance Optimization

### Lazy Loading and Activation Events
```typescript
// ✅ PREFERRED: Lazy loading with activation events
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  // Only register essential commands immediately
  const essentialCommands = [
    'roo-code.showWelcome',
    'roo-code.openSettings'
  ];

  const commandRegistry = new CommandRegistry(
    new ExtensionManager(context),
    new TelemetryService(),
    new Logger()
  );

  // Register essential commands
  commandRegistry.registerCommands(getEssentialCommands());

  // Lazy load heavy features
  context.subscriptions.push(
    vscode.commands.registerCommand('roo-code.startCoding', async () => {
      const { CodingFeature } = await import('./features/coding');
      const codingFeature = new CodingFeature(context);
      await codingFeature.activate();
    })
  );

  // Register activation events for specific file types
  vscode.workspace.onDidOpenTextDocument(async (document) => {
    if (document.languageId === 'typescript') {
      const { TypeScriptFeature } = await import('./features/typescript');
      const tsFeature = new TypeScriptFeature(context);
      await tsFeature.activate();
    }
  });
}
```

### Caching Strategies
```typescript
// ✅ PREFERRED: Intelligent caching
class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 300000; // 5 minutes

  async get<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const entry = this.cache.get(key);
    
    if (entry && !this.isExpired(entry)) {
      return entry.value as T;
    }

    // Cache miss or expired - fetch new value
    const value = await factory();
    this.set(key, value, ttl);
    
    return value;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.DEFAULT_TTL);
    this.cache.set(key, { value, expiresAt });
  }

  clear(): void {
    this.cache.clear();
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  // Periodic cleanup of expired entries
  startCleanupTimer(): void {
    setInterval(() => {
      for (const [key, entry] of this.cache.entries()) {
        if (this.isExpired(entry)) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }
}

interface CacheEntry {
  value: any;
  expiresAt: number;
}
```

### Progress Indicators
```typescript
// ✅ PREFERRED: User-friendly progress indicators
class ProgressManager {
  static async withProgress<T>(
    title: string,
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: false
      },
      task
    );
  }

  static async withCancellableProgress<T>(
    title: string,
    task: (
      progress: vscode.Progress<{ message?: string; increment?: number }>,
      token: vscode.CancellationToken
    ) => Promise<T>
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: true
      },
      task
    );
  }
}

// Usage example
async function processLargeDataset(): Promise<void> {
  await ProgressManager.withProgress('Processing data...', async (progress) => {
    const items = await fetchDataItems();
    const total = items.length;

    for (let i = 0; i < items.length; i++) {
      await processItem(items[i]);
      
      progress.report({
        message: `Processing item ${i + 1} of ${total}`,
        increment: (100 / total)
      });
    }
  });
}
```

## Best Practices Summary

### Do's
- ✅ Use proper resource disposal with `vscode.Disposable`
- ✅ Implement lazy loading for heavy features
- ✅ Use secure CSP for webviews
- ✅ Provide progress indicators for long operations
- ✅ Cache expensive operations appropriately
- ✅ Handle extension host restarts gracefully
- ✅ Use type-safe communication patterns

### Don'ts
- ❌ Forget to dispose of resources
- ❌ Load all features at activation
- ❌ Use insecure webview configurations
- ❌ Block the UI thread with long operations
- ❌ Ignore memory usage and leaks
- ❌ Use synchronous file operations
- ❌ Enable command URIs in webviews

## Related Documentation

- [Performance Standards](performance.md) - General performance guidelines
- [Security & Privacy](../quality/security-privacy.md) - Security considerations for extensions
- [Development Principles](../core/development-principles.md) - Core development standards
- [UI & Styling](ui-styling.md) - UI guidelines for webviews

---

*VS Code extensions require careful attention to lifecycle management, security, and performance to provide a great user experience.*
