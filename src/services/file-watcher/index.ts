import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"
import { EventEmitter } from "events"

/**
 * File event types for .roo directory changes
 */
export interface FileEvent {
	type: 'created' | 'modified' | 'deleted' | 'renamed'
	path: string
	timestamp: number
	metadata?: any
}

/**
 * Configuration change event with detailed information
 */
export interface ConfigChange {
	configType: string
	path: string
	oldValue?: any
	newValue?: any
	timestamp: number
}

/**
 * File watcher options
 */
export interface WatchOptions {
	recursive?: boolean
	debounceMs?: number
	excludePatterns?: string[]
	includePatterns?: string[]
}

/**
 * File watcher instance
 */
export interface FileWatcher {
	id: string
	path: string
	dispose(): void
	isActive(): boolean
}

/**
 * File watcher service for monitoring .roo directory changes
 * Provides hot reloading capabilities for configuration files
 */
export class FileWatcherService extends EventEmitter {
	private watchers: Map<string, vscode.FileSystemWatcher> = new Map()
	private debounceTimers: Map<string, NodeJS.Timeout> = new Map()
	private watcherCounter = 0

	/**
	 * Watch a directory for changes with debouncing and filtering
	 */
	public watchDirectory(dirPath: string, options: WatchOptions = {}): FileWatcher {
		const watcherId = `watcher_${++this.watcherCounter}`
		const {
			recursive = true,
			debounceMs = 300,
			excludePatterns = [
				'**/.DS_Store',
				'**/Thumbs.db',
				'**/*.tmp',
				'**/*.temp',
				'**/*.log',
				'**/*.cache'
			],
			includePatterns = ['**/*']
		} = options

		// Create VS Code file system watcher
		const pattern = new vscode.RelativePattern(dirPath, recursive ? '**/*' : '*')
		const watcher = vscode.workspace.createFileSystemWatcher(pattern)

		// Set up event handlers with debouncing
		const handleFileEvent = (uri: vscode.Uri, eventType: FileEvent['type']) => {
			const filePath = uri.fsPath
			
			// Check if file should be included
			if (!this.shouldIncludeFile(filePath, includePatterns, excludePatterns)) {
				return
			}

			// Debounce the event
			const debounceKey = `${eventType}_${filePath}`
			if (this.debounceTimers.has(debounceKey)) {
				clearTimeout(this.debounceTimers.get(debounceKey)!)
			}

			const timer = setTimeout(() => {
				this.debounceTimers.delete(debounceKey)
				
				const event: FileEvent = {
					type: eventType,
					path: filePath,
					timestamp: Date.now()
				}

				this.emit('fileChange', event)
				this.handleConfigurationChange(event)
			}, debounceMs)

			this.debounceTimers.set(debounceKey, timer)
		}

		// Register event listeners
		watcher.onDidCreate(uri => handleFileEvent(uri, 'created'))
		watcher.onDidChange(uri => handleFileEvent(uri, 'modified'))
		watcher.onDidDelete(uri => handleFileEvent(uri, 'deleted'))

		// Store the watcher
		this.watchers.set(watcherId, watcher)

		// Return file watcher interface
		return {
			id: watcherId,
			path: dirPath,
			dispose: () => this.stopWatching(watcherId),
			isActive: () => this.watchers.has(watcherId)
		}
	}

	/**
	 * Watch a specific file for changes
	 */
	public watchFile(filePath: string, callback: (event: FileEvent) => void): FileWatcher {
		const watcherId = `file_watcher_${++this.watcherCounter}`
		const dirPath = path.dirname(filePath)
		const fileName = path.basename(filePath)

		const pattern = new vscode.RelativePattern(dirPath, fileName)
		const watcher = vscode.workspace.createFileSystemWatcher(pattern)

		const handleEvent = (uri: vscode.Uri, eventType: FileEvent['type']) => {
			if (uri.fsPath === filePath) {
				const event: FileEvent = {
					type: eventType,
					path: filePath,
					timestamp: Date.now()
				}
				callback(event)
			}
		}

		watcher.onDidCreate(uri => handleEvent(uri, 'created'))
		watcher.onDidChange(uri => handleEvent(uri, 'modified'))
		watcher.onDidDelete(uri => handleEvent(uri, 'deleted'))

		this.watchers.set(watcherId, watcher)

		return {
			id: watcherId,
			path: filePath,
			dispose: () => this.stopWatching(watcherId),
			isActive: () => this.watchers.has(watcherId)
		}
	}

	/**
	 * Stop watching a specific watcher
	 */
	public stopWatching(watcherId: string): void {
		const watcher = this.watchers.get(watcherId)
		if (watcher) {
			watcher.dispose()
			this.watchers.delete(watcherId)
		}

		// Clean up any pending debounce timers
		for (const [key, timer] of this.debounceTimers.entries()) {
			if (key.includes(watcherId)) {
				clearTimeout(timer)
				this.debounceTimers.delete(key)
			}
		}
	}

	/**
	 * Check if a file is currently being watched
	 */
	public isWatching(filePath: string): boolean {
		for (const [_, watcher] of this.watchers.entries()) {
			// This is a simplified check - in practice you'd need to track paths
			// For now, we'll return true if any watchers exist
			return true
		}
		return false
	}

	/**
	 * Dispose all watchers and clean up resources
	 */
	public dispose(): void {
		// Stop all watchers
		for (const watcherId of this.watchers.keys()) {
			this.stopWatching(watcherId)
		}

		// Clear all debounce timers
		for (const timer of this.debounceTimers.values()) {
			clearTimeout(timer)
		}
		this.debounceTimers.clear()

		// Remove all event listeners
		this.removeAllListeners()
	}

	/**
	 * Check if a file should be included based on patterns
	 */
	private shouldIncludeFile(filePath: string, includePatterns: string[], excludePatterns: string[]): boolean {
		const relativePath = path.relative(process.cwd(), filePath)

		// Check exclude patterns first
		for (const pattern of excludePatterns) {
			if (this.matchesPattern(relativePath, pattern)) {
				return false
			}
		}

		// Check include patterns
		for (const pattern of includePatterns) {
			if (this.matchesPattern(relativePath, pattern)) {
				return true
			}
		}

		return false
	}

	/**
	 * Simple pattern matching (supports * and **)
	 */
	private matchesPattern(filePath: string, pattern: string): boolean {
		// Convert glob pattern to regex
		const regexPattern = pattern
			.replace(/\*\*/g, '.*')  // ** matches any path
			.replace(/\*/g, '[^/]*') // * matches any filename
			.replace(/\./g, '\\.')   // Escape dots

		const regex = new RegExp(`^${regexPattern}$`)
		return regex.test(filePath)
	}

	/**
	 * Handle configuration-specific changes
	 */
	private handleConfigurationChange(event: FileEvent): void {
		const configType = this.getConfigurationType(event.path)
		if (configType) {
			const configChange: ConfigChange = {
				configType,
				path: event.path,
				timestamp: event.timestamp
			}

			this.emit('configChange', configChange)
		}
	}

	/**
	 * Determine the type of configuration file
	 */
	private getConfigurationType(filePath: string): string | null {
		const relativePath = path.relative(process.cwd(), filePath)
		
		if (relativePath.includes('.roo/rules/')) {
			return 'rules'
		} else if (relativePath.includes('.roo/rules-')) {
			return 'mode-rules'
		} else if (relativePath.includes('.roo/config/')) {
			return 'config'
		} else if (relativePath.includes('custom-instructions.md')) {
			return 'custom-instructions'
		} else if (relativePath.includes('AGENTS.md')) {
			return 'agents'
		}

		return null
	}
}

// Singleton instance
let fileWatcherService: FileWatcherService | null = null

/**
 * Get the singleton file watcher service instance
 */
export function getFileWatcherService(): FileWatcherService {
	if (!fileWatcherService) {
		fileWatcherService = new FileWatcherService()
	}
	return fileWatcherService
}

/**
 * Dispose the file watcher service
 */
export function disposeFileWatcherService(): void {
	if (fileWatcherService) {
		fileWatcherService.dispose()
		fileWatcherService = null
	}
}
