import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"
import { EventEmitter } from "events"
import { getRooConfigService } from "../roo-config"
import { getTypeScriptIntegrationService } from "../typescript-integration"

/**
 * Mode configuration for different development environments
 */
export interface ModeConfig {
	name: string
	description: string
	testFilePatterns: string[]
	excludePatterns: string[]
	includePatterns: string[]
	customInstructions?: string
	ruleDirectories?: string[]
	typescript?: {
		compilerOptions?: any
		validateOnSave?: boolean
	}
	fileHandling?: {
		isolateTests?: boolean
		moveToTestDir?: boolean
		testDirectory?: string
	}
}

/**
 * Mode definition with metadata
 */
export interface ModeDefinition {
	id: string
	name: string
	description: string
	config: ModeConfig
	isActive: boolean
}

/**
 * File isolation result
 */
export interface FileIsolationResult {
	moved: string[]
	created: string[]
	errors: string[]
}

/**
 * Mode management service for handling development vs production environments
 * Provides test file isolation, mode-specific configurations, and environment switching
 */
export class ModeManagementService extends EventEmitter {
	private configService = getRooConfigService()
	private typeScriptService = getTypeScriptIntegrationService()
	private currentMode: string = 'development'
	private availableModes: Map<string, ModeDefinition> = new Map()

	constructor() {
		super()
		
		// Initialize default modes
		this.initializeDefaultModes()
		
		// Listen for configuration changes
		this.configService.on('hotReload', (change) => {
			if (change.configType === 'modes' || change.configType === 'config') {
				this.reloadModes()
			}
		})
	}

	/**
	 * Get the current active mode
	 */
	public async getCurrentMode(cwd: string): Promise<string> {
		try {
			const config = await this.configService.loadConfigurationWithCache('config/modes.json', cwd)
			const modesConfig = JSON.parse(config.merged || '{}')
			return modesConfig.currentMode || this.currentMode
		} catch (error) {
			return this.currentMode
		}
	}

	/**
	 * Switch to a different mode
	 */
	public async switchMode(mode: string, cwd: string): Promise<void> {
		const modeDefinition = this.availableModes.get(mode)
		if (!modeDefinition) {
			throw new Error(`Mode '${mode}' not found`)
		}

		try {
			// Save current mode
			await this.saveCurrentMode(mode, cwd)
			
			// Configure TypeScript for the new mode
			await this.typeScriptService.configureForMode(mode, cwd)
			
			// Handle mode-specific file operations
			await this.handleModeSpecificFiles(mode, cwd)
			
			// Update current mode
			this.currentMode = mode
			
			// Emit mode change event
			this.emit('modeChanged', { 
				previousMode: this.currentMode, 
				newMode: mode, 
				cwd 
			})

			// Show notification
			vscode.window.showInformationMessage(`Switched to ${modeDefinition.name} mode`)
			
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to switch to ${mode} mode: ${error}`)
			throw error
		}
	}

	/**
	 * Get all available modes for a project
	 */
	public async getAvailableModes(cwd: string): Promise<ModeDefinition[]> {
		// Load custom modes from configuration
		await this.loadCustomModes(cwd)
		
		// Return all available modes
		return Array.from(this.availableModes.values())
	}

	/**
	 * Handle mode-specific file operations
	 */
	public async handleModeSpecificFiles(mode: string, cwd: string): Promise<void> {
		const modeDefinition = this.availableModes.get(mode)
		if (!modeDefinition) {
			return
		}

		const config = modeDefinition.config
		
		// Handle test file isolation for production mode
		if (mode === 'production' && config.fileHandling?.isolateTests) {
			await this.isolateTestFiles(cwd)
		}
		
		// Handle development mode - restore test files
		if (mode === 'development') {
			await this.restoreTestFiles(cwd)
		}
	}

	/**
	 * Isolate test files by moving them to a separate directory
	 */
	public async isolateTestFiles(cwd: string): Promise<FileIsolationResult> {
		const result: FileIsolationResult = {
			moved: [],
			created: [],
			errors: []
		}

		try {
			const modeDefinition = this.availableModes.get('production')
			if (!modeDefinition) {
				throw new Error('Production mode not found')
			}

			const testPatterns = modeDefinition.config.testFilePatterns
			const testDirectory = modeDefinition.config.fileHandling?.testDirectory || '.roo/temp/tests'
			const testDirPath = path.join(cwd, testDirectory)

			// Create test directory
			await fs.mkdir(testDirPath, { recursive: true })
			result.created.push(testDirPath)

			// Find test files
			const testFiles = await this.findTestFiles(cwd, testPatterns)
			
			// Move test files
			for (const testFile of testFiles) {
				try {
					const relativePath = path.relative(cwd, testFile)
					const targetPath = path.join(testDirPath, relativePath)
					
					// Create target directory
					await fs.mkdir(path.dirname(targetPath), { recursive: true })
					
					// Move file
					await fs.rename(testFile, targetPath)
					result.moved.push(`${testFile} -> ${targetPath}`)
					
				} catch (error) {
					result.errors.push(`Failed to move ${testFile}: ${error}`)
				}
			}

			this.emit('testFilesIsolated', result)
			
		} catch (error) {
			result.errors.push(`Test isolation failed: ${error}`)
		}

		return result
	}

	/**
	 * Restore test files from isolation directory
	 */
	private async restoreTestFiles(cwd: string): Promise<FileIsolationResult> {
		const result: FileIsolationResult = {
			moved: [],
			created: [],
			errors: []
		}

		try {
			const testDirectory = '.roo/temp/tests'
			const testDirPath = path.join(cwd, testDirectory)

			// Check if test directory exists
			try {
				await fs.access(testDirPath)
			} catch (error) {
				// No test files to restore
				return result
			}

			// Find all files in test directory
			const testFiles = await this.findAllFiles(testDirPath)
			
			// Restore test files
			for (const testFile of testFiles) {
				try {
					const relativePath = path.relative(testDirPath, testFile)
					const targetPath = path.join(cwd, relativePath)
					
					// Create target directory
					await fs.mkdir(path.dirname(targetPath), { recursive: true })
					
					// Move file back
					await fs.rename(testFile, targetPath)
					result.moved.push(`${testFile} -> ${targetPath}`)
					
				} catch (error) {
					result.errors.push(`Failed to restore ${testFile}: ${error}`)
				}
			}

			// Remove empty test directory
			try {
				await fs.rmdir(testDirPath, { recursive: true })
			} catch (error) {
				// Ignore errors when removing directory
			}

			this.emit('testFilesRestored', result)
			
		} catch (error) {
			result.errors.push(`Test restoration failed: ${error}`)
		}

		return result
	}

	/**
	 * Find test files based on patterns
	 */
	private async findTestFiles(cwd: string, patterns: string[]): Promise<string[]> {
		const files: string[] = []
		
		for (const pattern of patterns) {
			try {
				const foundFiles = await vscode.workspace.findFiles(
					new vscode.RelativePattern(cwd, pattern),
					new vscode.RelativePattern(cwd, '**/node_modules/**')
				)
				
				files.push(...foundFiles.map(uri => uri.fsPath))
			} catch (error) {
				console.warn(`Failed to find files with pattern ${pattern}:`, error)
			}
		}

		return files
	}

	/**
	 * Find all files in a directory recursively
	 */
	private async findAllFiles(dirPath: string): Promise<string[]> {
		const files: string[] = []
		
		try {
			const entries = await fs.readdir(dirPath, { withFileTypes: true })
			
			for (const entry of entries) {
				const fullPath = path.join(dirPath, entry.name)
				
				if (entry.isDirectory()) {
					const subFiles = await this.findAllFiles(fullPath)
					files.push(...subFiles)
				} else if (entry.isFile()) {
					files.push(fullPath)
				}
			}
		} catch (error) {
			console.warn(`Failed to read directory ${dirPath}:`, error)
		}

		return files
	}

	/**
	 * Initialize default modes
	 */
	private initializeDefaultModes(): void {
		// Development mode
		this.availableModes.set('development', {
			id: 'development',
			name: 'Development',
			description: 'Development mode with full debugging and test support',
			isActive: true,
			config: {
				name: 'Development',
				description: 'Development environment',
				testFilePatterns: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
				excludePatterns: ['**/node_modules/**', '**/dist/**'],
				includePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
				typescript: {
					compilerOptions: {
						sourceMap: true,
						declaration: false,
						removeComments: false
					},
					validateOnSave: true
				},
				fileHandling: {
					isolateTests: false
				}
			}
		})

		// Production mode
		this.availableModes.set('production', {
			id: 'production',
			name: 'Production',
			description: 'Production mode with optimized builds and test isolation',
			isActive: false,
			config: {
				name: 'Production',
				description: 'Production environment',
				testFilePatterns: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
				excludePatterns: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*'],
				includePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
				typescript: {
					compilerOptions: {
						sourceMap: false,
						declaration: true,
						removeComments: true
					},
					validateOnSave: false
				},
				fileHandling: {
					isolateTests: true,
					moveToTestDir: true,
					testDirectory: '.roo/temp/tests'
				}
			}
		})

		// Test mode
		this.availableModes.set('test', {
			id: 'test',
			name: 'Test',
			description: 'Test mode optimized for running and debugging tests',
			isActive: false,
			config: {
				name: 'Test',
				description: 'Test environment',
				testFilePatterns: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
				excludePatterns: ['**/node_modules/**', '**/dist/**'],
				includePatterns: ['**/*.ts', '**/*.tsx', '**/*.test.*', '**/*.spec.*'],
				typescript: {
					compilerOptions: {
						sourceMap: true,
						declaration: false,
						types: ['jest', 'node']
					},
					validateOnSave: true
				},
				fileHandling: {
					isolateTests: false
				}
			}
		})
	}

	/**
	 * Load custom modes from configuration
	 */
	private async loadCustomModes(cwd: string): Promise<void> {
		try {
			const config = await this.configService.loadConfigurationWithCache('config/modes.json', cwd)
			const modesConfig = JSON.parse(config.merged || '{}')
			
			if (modesConfig.customModes) {
				for (const [id, modeConfig] of Object.entries(modesConfig.customModes)) {
					this.availableModes.set(id, {
						id,
						name: (modeConfig as any).name || id,
						description: (modeConfig as any).description || '',
						isActive: false,
						config: modeConfig as ModeConfig
					})
				}
			}
		} catch (error) {
			// Ignore errors loading custom modes
		}
	}

	/**
	 * Save current mode to configuration
	 */
	private async saveCurrentMode(mode: string, cwd: string): Promise<void> {
		const configPath = path.join(cwd, '.roo', 'config', 'modes.json')
		
		try {
			// Load existing config
			let config: any = {}
			try {
				const existingConfig = await fs.readFile(configPath, 'utf-8')
				config = JSON.parse(existingConfig)
			} catch (error) {
				// Use empty config if file doesn't exist
			}

			// Update current mode
			config.currentMode = mode
			
			// Save config
			await fs.mkdir(path.dirname(configPath), { recursive: true })
			await fs.writeFile(configPath, JSON.stringify(config, null, 2))
			
		} catch (error) {
			console.warn('Failed to save current mode:', error)
		}
	}

	/**
	 * Reload modes from configuration
	 */
	private async reloadModes(): Promise<void> {
		// Clear custom modes and reload defaults
		this.availableModes.clear()
		this.initializeDefaultModes()
		
		this.emit('modesReloaded')
	}

	/**
	 * Dispose the service and clean up resources
	 */
	public dispose(): void {
		this.removeAllListeners()
	}
}

// Singleton instance
let modeManagementService: ModeManagementService | null = null

/**
 * Get the singleton mode management service
 */
export function getModeManagementService(): ModeManagementService {
	if (!modeManagementService) {
		modeManagementService = new ModeManagementService()
	}
	return modeManagementService
}

/**
 * Dispose the mode management service
 */
export function disposeModeManagementService(): void {
	if (modeManagementService) {
		modeManagementService.dispose()
		modeManagementService = null
	}
}
