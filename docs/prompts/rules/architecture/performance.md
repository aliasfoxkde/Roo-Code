# Performance Standards

Comprehensive performance requirements, monitoring, and optimization strategies for the Roo Code VS Code Extension project.

## Performance Requirements

### Core Performance Standards
- **Extension activation time** < 200ms
- **Command execution time** < 1s for common operations
- **Memory usage monitoring** and leak prevention
- **Implement proper caching strategies**
- **Use lazy loading** for heavy resources

### Benchmarks and Metrics
```typescript
// ✅ PREFERRED: Performance monitoring
interface PerformanceMetrics {
  activationTime: number;
  commandExecutionTimes: Map<string, number[]>;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cacheHitRatio: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    activationTime: 0,
    commandExecutionTimes: new Map(),
    memoryUsage: { heapUsed: 0, heapTotal: 0, external: 0 },
    cacheHitRatio: 0
  };

  measureActivationTime(): void {
    const start = performance.now();
    
    // Extension activation logic
    
    this.metrics.activationTime = performance.now() - start;
    
    if (this.metrics.activationTime > 200) {
      console.warn(`Extension activation took ${this.metrics.activationTime}ms (target: <200ms)`);
    }
  }

  measureCommandExecution<T>(
    commandId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    return this.withTiming(commandId, operation);
  }

  private async withTiming<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - start;
      
      this.recordExecutionTime(operationName, duration);
      
      if (duration > 1000) {
        console.warn(`${operationName} took ${duration}ms (target: <1000ms)`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordExecutionTime(operationName, duration);
      throw error;
    }
  }

  private recordExecutionTime(operationName: string, duration: number): void {
    if (!this.metrics.commandExecutionTimes.has(operationName)) {
      this.metrics.commandExecutionTimes.set(operationName, []);
    }
    
    const times = this.metrics.commandExecutionTimes.get(operationName)!;
    times.push(duration);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }

  getAverageExecutionTime(commandId: string): number {
    const times = this.metrics.commandExecutionTimes.get(commandId) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  monitorMemoryUsage(): void {
    const usage = process.memoryUsage();
    this.metrics.memoryUsage = {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external
    };

    // Alert if memory usage is high
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    if (heapUsedMB > 100) {
      console.warn(`High memory usage: ${heapUsedMB.toFixed(2)}MB`);
    }
  }
}
```

## Caching Strategies

### Intelligent Caching System
```typescript
// ✅ PREFERRED: Multi-level caching
interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'lfu';
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];
  private accessCount = new Map<string, number>();

  constructor(private config: CacheConfig) {}

  async get(key: string, factory?: () => Promise<T>): Promise<T | undefined> {
    const entry = this.cache.get(key);
    
    if (entry && !this.isExpired(entry)) {
      this.recordAccess(key);
      return entry.value;
    }

    if (factory) {
      const value = await factory();
      this.set(key, value);
      return value;
    }

    return undefined;
  }

  set(key: string, value: T): void {
    // Remove expired entries first
    this.cleanup();
    
    // Evict if at capacity
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.ttl
    };

    this.cache.set(key, entry);
    this.recordAccess(key);
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private recordAccess(key: string): void {
    // Update access order for LRU
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);

    // Update access count for LFU
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
  }

  private evict(): void {
    let keyToEvict: string;

    switch (this.config.strategy) {
      case 'lru':
        keyToEvict = this.accessOrder[0];
        break;
      case 'fifo':
        keyToEvict = this.cache.keys().next().value;
        break;
      case 'lfu':
        keyToEvict = this.getLeastFrequentlyUsed();
        break;
      default:
        keyToEvict = this.cache.keys().next().value;
    }

    this.delete(keyToEvict);
  }

  private getLeastFrequentlyUsed(): string {
    let minCount = Infinity;
    let leastUsedKey = '';

    for (const [key, count] of this.accessCount.entries()) {
      if (count < minCount) {
        minCount = count;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  private delete(key: string): void {
    this.cache.delete(key);
    this.accessCount.delete(key);
    
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.delete(key);
      }
    }
  }

  getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRatio: this.calculateHitRatio(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private calculateHitRatio(): number {
    // Implementation depends on tracking hits/misses
    return 0.85; // Placeholder
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    return this.cache.size * 1024; // Placeholder
  }
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hitRatio: number;
  memoryUsage: number;
}
```

### File System Caching
```typescript
// ✅ PREFERRED: Efficient file system operations
class FileSystemCache {
  private fileCache = new AdvancedCache<string>({
    ttl: 300000, // 5 minutes
    maxSize: 1000,
    strategy: 'lru'
  });

  private directoryCache = new AdvancedCache<string[]>({
    ttl: 60000, // 1 minute
    maxSize: 500,
    strategy: 'lru'
  });

  async readFile(filePath: string): Promise<string> {
    return this.fileCache.get(filePath, async () => {
      const content = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
      return Buffer.from(content).toString('utf8');
    }) || '';
  }

  async readDirectory(dirPath: string): Promise<string[]> {
    return this.directoryCache.get(dirPath, async () => {
      const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dirPath));
      return entries.map(([name]) => name);
    }) || [];
  }

  invalidateFile(filePath: string): void {
    this.fileCache.delete(filePath);
    
    // Invalidate parent directory cache
    const parentDir = path.dirname(filePath);
    this.directoryCache.delete(parentDir);
  }

  watchFileChanges(): void {
    const watcher = vscode.workspace.createFileSystemWatcher('**/*');
    
    watcher.onDidChange(uri => this.invalidateFile(uri.fsPath));
    watcher.onDidCreate(uri => this.invalidateFile(uri.fsPath));
    watcher.onDidDelete(uri => this.invalidateFile(uri.fsPath));
  }
}
```

## Memory Management

### Resource Cleanup
```typescript
// ✅ PREFERRED: Comprehensive resource management
class ResourceManager {
  private disposables: vscode.Disposable[] = [];
  private timers: NodeJS.Timeout[] = [];
  private intervals: NodeJS.Timeout[] = [];
  private eventListeners: Map<string, Function[]> = new Map();

  addDisposable(disposable: vscode.Disposable): void {
    this.disposables.push(disposable);
  }

  addTimer(timer: NodeJS.Timeout): void {
    this.timers.push(timer);
  }

  addInterval(interval: NodeJS.Timeout): void {
    this.intervals.push(interval);
  }

  addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  dispose(): void {
    // Dispose VS Code disposables
    this.disposables.forEach(disposable => {
      try {
        disposable.dispose();
      } catch (error) {
        console.error('Error disposing resource:', error);
      }
    });
    this.disposables.length = 0;

    // Clear timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.length = 0;

    // Clear intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.length = 0;

    // Remove event listeners
    this.eventListeners.clear();
  }

  getResourceCount(): ResourceCount {
    return {
      disposables: this.disposables.length,
      timers: this.timers.length,
      intervals: this.intervals.length,
      eventListeners: Array.from(this.eventListeners.values())
        .reduce((total, listeners) => total + listeners.length, 0)
    };
  }
}

interface ResourceCount {
  disposables: number;
  timers: number;
  intervals: number;
  eventListeners: number;
}
```

### Memory Leak Detection
```typescript
// ✅ PREFERRED: Memory leak monitoring
class MemoryLeakDetector {
  private baselineMemory: NodeJS.MemoryUsage;
  private checkInterval: NodeJS.Timeout;

  constructor() {
    this.baselineMemory = process.memoryUsage();
    this.startMonitoring();
  }

  private startMonitoring(): void {
    this.checkInterval = setInterval(() => {
      this.checkForLeaks();
    }, 30000); // Check every 30 seconds
  }

  private checkForLeaks(): void {
    const currentMemory = process.memoryUsage();
    const heapGrowth = currentMemory.heapUsed - this.baselineMemory.heapUsed;
    const heapGrowthMB = heapGrowth / 1024 / 1024;

    if (heapGrowthMB > 50) { // Alert if heap grew by more than 50MB
      console.warn(`Potential memory leak detected: heap grew by ${heapGrowthMB.toFixed(2)}MB`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        
        // Check again after GC
        const afterGC = process.memoryUsage();
        const remainingGrowth = (afterGC.heapUsed - this.baselineMemory.heapUsed) / 1024 / 1024;
        
        if (remainingGrowth > 25) {
          console.error(`Memory leak confirmed: ${remainingGrowth.toFixed(2)}MB after GC`);
        }
      }
    }
  }

  updateBaseline(): void {
    this.baselineMemory = process.memoryUsage();
  }

  dispose(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}
```

## Optimization Techniques

### Debouncing and Throttling
```typescript
// ✅ PREFERRED: Performance optimization utilities
function debounce<T extends any[]>(
  func: (...args: T) => void,
  delay: number
): (...args: T) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

function throttle<T extends any[]>(
  func: (...args: T) => void,
  limit: number
): (...args: T) => void {
  let inThrottle: boolean;
  
  return (...args: T) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage examples
class PerformantEventHandler {
  private debouncedSave = debounce(this.saveDocument.bind(this), 500);
  private throttledScroll = throttle(this.handleScroll.bind(this), 16); // ~60fps

  setupEventListeners(): void {
    vscode.workspace.onDidChangeTextDocument(this.debouncedSave);
    // Scroll event would be throttled
  }

  private saveDocument(): void {
    // Save logic
  }

  private handleScroll(): void {
    // Scroll handling logic
  }
}
```

### Lazy Loading Implementation
```typescript
// ✅ PREFERRED: Lazy loading for heavy features
class LazyFeatureLoader {
  private loadedFeatures = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();

  async loadFeature<T>(
    featureName: string,
    loader: () => Promise<T>
  ): Promise<T> {
    if (this.loadedFeatures.has(featureName)) {
      return this.getLoadedFeature(featureName);
    }

    if (this.loadingPromises.has(featureName)) {
      return this.loadingPromises.get(featureName)!;
    }

    const loadingPromise = this.loadFeatureInternal(featureName, loader);
    this.loadingPromises.set(featureName, loadingPromise);

    return loadingPromise;
  }

  private async loadFeatureInternal<T>(
    featureName: string,
    loader: () => Promise<T>
  ): Promise<T> {
    try {
      const startTime = performance.now();
      const feature = await loader();
      const loadTime = performance.now() - startTime;

      console.log(`Feature '${featureName}' loaded in ${loadTime.toFixed(2)}ms`);
      
      this.loadedFeatures.add(featureName);
      this.loadingPromises.delete(featureName);
      
      return feature;
    } catch (error) {
      this.loadingPromises.delete(featureName);
      throw error;
    }
  }

  private getLoadedFeature<T>(featureName: string): T {
    // Implementation to retrieve already loaded feature
    throw new Error('Feature retrieval not implemented');
  }
}

// Usage
const featureLoader = new LazyFeatureLoader();

async function activateCodeAnalysis(): Promise<void> {
  const codeAnalysis = await featureLoader.loadFeature(
    'codeAnalysis',
    () => import('./features/code-analysis')
  );
  
  codeAnalysis.activate();
}
```

## Best Practices Summary

### Do's
- ✅ Monitor extension activation time (<200ms)
- ✅ Measure command execution performance (<1s)
- ✅ Implement intelligent caching strategies
- ✅ Use lazy loading for heavy features
- ✅ Properly dispose of all resources
- ✅ Monitor memory usage and detect leaks
- ✅ Debounce/throttle frequent operations
- ✅ Use efficient data structures

### Don'ts
- ❌ Load all features at extension activation
- ❌ Ignore memory usage and resource cleanup
- ❌ Use synchronous file operations
- ❌ Create unnecessary object instances in loops
- ❌ Skip performance monitoring
- ❌ Use inefficient algorithms for large datasets
- ❌ Forget to clear timers and intervals

## Related Documentation

- [VS Code Extension](vscode-extension.md) - Extension-specific performance considerations
- [Development Principles](../core/development-principles.md) - Performance-conscious coding principles
- [Code Quality & Linting](../quality/code-quality-linting.md) - Performance-related linting rules
- [Testing Standards](../quality/testing-standards.md) - Performance testing strategies

---

*Performance optimization is crucial for providing a responsive and efficient user experience in VS Code extensions.*
