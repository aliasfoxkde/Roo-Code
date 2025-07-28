import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"
import { EventEmitter } from "events"
import { getRooConfigService } from "../roo-config"

/**
 * TypeScript diagnostic information
 */
export interface TypeScriptDiagnostic {
	file: string
	line: number
	column: number
	message: string
	severity: 'error' | 'warning' | 'info'
	code?: number
}

/**
 * TypeScript validation result
 */
export interface ValidationResult {
	success: boolean
	errors: TypeScriptDiagnostic[]
	warnings: TypeScriptDiagnostic[]
	info: TypeScriptDiagnostic[]
}

/**
 * TypeScript compiler options from tsconfig.json
 */
export interface CompilerOptions {
	target?: string
	module?: string
	lib?: string[]
	outDir?: string
	rootDir?: string
	strict?: boolean
	esModuleInterop?: boolean
	skipLibCheck?: boolean
	forceConsistentCasingInFileNames?: boolean
	[key: string]: any
}

/**
 * TypeScript integration configuration
 */
export interface TypeScriptConfig {
	enabled: boolean
	configPath?: string
	validateOnSave: boolean
	compilerOptions?: CompilerOptions
	excludePatterns?: string[]
	includePatterns?: string[]
}

/**
 * TypeScript integration service for the Roo Code extension
 * Provides compile-time validation, error checking, and IDE integration
 */
export class TypeScriptIntegrationService extends EventEmitter {
	private configService = getRooConfigService()
	private diagnosticCollection: vscode.DiagnosticCollection
	private isEnabled = true

	constructor() {
		super()
		
		// Create diagnostic collection for TypeScript errors
		this.diagnosticCollection = vscode.languages.createDiagnosticCollection('roo-typescript')
		
		// Listen for configuration changes
		this.configService.on('hotReload', (change) => {
			if (change.configType === 'config' && change.path.includes('typescript')) {
				this.reloadConfiguration()
			}
		})

		// Listen for document saves to trigger validation
		vscode.workspace.onDidSaveTextDocument((document) => {
			if (this.isTypeScriptFile(document.fileName)) {
				this.validateDocument(document)
			}
		})
	}

	/**
	 * Validate a TypeScript project
	 */
	public async validateProject(cwd: string): Promise<ValidationResult> {
		if (!this.isEnabled) {
			return { success: true, errors: [], warnings: [], info: [] }
		}

		try {
			const config = await this.getTypeScriptConfig(cwd)
			if (!config.enabled) {
				return { success: true, errors: [], warnings: [], info: [] }
			}

			// Get TypeScript files in the project
			const files = await this.getTypeScriptFiles(cwd, config)
			
			// Validate each file
			const allDiagnostics: TypeScriptDiagnostic[] = []
			
			for (const file of files) {
				const diagnostics = await this.validateFile(file)
				allDiagnostics.push(...diagnostics)
			}

			// Categorize diagnostics
			const errors = allDiagnostics.filter(d => d.severity === 'error')
			const warnings = allDiagnostics.filter(d => d.severity === 'warning')
			const info = allDiagnostics.filter(d => d.severity === 'info')

			// Update VS Code diagnostics
			this.updateDiagnostics(allDiagnostics)

			return {
				success: errors.length === 0,
				errors,
				warnings,
				info
			}
		} catch (error) {
			console.error('TypeScript validation failed:', error)
			return {
				success: false,
				errors: [{
					file: cwd,
					line: 0,
					column: 0,
					message: `TypeScript validation failed: ${error}`,
					severity: 'error'
				}],
				warnings: [],
				info: []
			}
		}
	}

	/**
	 * Get TypeScript compiler options for a project
	 */
	public async getCompilerOptions(cwd: string): Promise<CompilerOptions> {
		const config = await this.getTypeScriptConfig(cwd)
		
		// Start with default options
		const defaultOptions: CompilerOptions = {
			target: "ES2020",
			module: "commonjs",
			lib: ["ES2020"],
			strict: true,
			esModuleInterop: true,
			skipLibCheck: true,
			forceConsistentCasingInFileNames: true
		}

		// Load from tsconfig.json if it exists
		const tsconfigPath = config.configPath || path.join(cwd, 'tsconfig.json')
		try {
			const tsconfigContent = await fs.readFile(tsconfigPath, 'utf-8')
			const tsconfig = JSON.parse(tsconfigContent)
			
			return {
				...defaultOptions,
				...tsconfig.compilerOptions,
				...config.compilerOptions
			}
		} catch (error) {
			// Use default options if tsconfig.json doesn't exist or is invalid
			return {
				...defaultOptions,
				...config.compilerOptions
			}
		}
	}

	/**
	 * Check for TypeScript errors in specific files
	 */
	public async checkForErrors(files: string[]): Promise<TypeScriptDiagnostic[]> {
		const diagnostics: TypeScriptDiagnostic[] = []
		
		for (const file of files) {
			if (this.isTypeScriptFile(file)) {
				const fileDiagnostics = await this.validateFile(file)
				diagnostics.push(...fileDiagnostics)
			}
		}

		return diagnostics
	}

	/**
	 * Configure TypeScript for a specific mode
	 */
	public async configureForMode(mode: string, cwd: string): Promise<void> {
		const config = await this.getTypeScriptConfig(cwd)
		
		// Mode-specific configurations
		const modeConfigs: Record<string, Partial<CompilerOptions>> = {
			development: {
				sourceMap: true,
				declaration: false,
				removeComments: false
			},
			production: {
				sourceMap: false,
				declaration: true,
				removeComments: true,
				minify: true
			},
			test: {
				sourceMap: true,
				declaration: false,
				types: ["jest", "node"]
			}
		}

		const modeConfig = modeConfigs[mode] || {}
		
		// Update compiler options for the mode
		const updatedConfig = {
			...config,
			compilerOptions: {
				...config.compilerOptions,
				...modeConfig
			}
		}

		// Save the updated configuration
		await this.saveTypeScriptConfig(cwd, updatedConfig)
		
		this.emit('modeConfigured', { mode, config: updatedConfig })
	}

	/**
	 * Validate a single TypeScript document
	 */
	private async validateDocument(document: vscode.TextDocument): Promise<void> {
		if (!this.isEnabled || !this.isTypeScriptFile(document.fileName)) {
			return
		}

		const diagnostics = await this.validateFile(document.fileName)
		
		// Convert to VS Code diagnostics
		const vscDiagnostics = diagnostics.map(d => {
			const range = new vscode.Range(
				new vscode.Position(Math.max(0, d.line - 1), Math.max(0, d.column - 1)),
				new vscode.Position(Math.max(0, d.line - 1), Math.max(0, d.column))
			)
			
			const severity = d.severity === 'error' ? vscode.DiagnosticSeverity.Error :
							d.severity === 'warning' ? vscode.DiagnosticSeverity.Warning :
							vscode.DiagnosticSeverity.Information
			
			return new vscode.Diagnostic(range, d.message, severity)
		})

		this.diagnosticCollection.set(document.uri, vscDiagnostics)
	}

	/**
	 * Validate a single TypeScript file
	 */
	private async validateFile(filePath: string): Promise<TypeScriptDiagnostic[]> {
		// This is a simplified implementation
		// In a real implementation, you would use the TypeScript compiler API
		try {
			// For now, we'll use VS Code's built-in TypeScript diagnostics
			const document = await vscode.workspace.openTextDocument(filePath)
			const diagnostics = vscode.languages.getDiagnostics(document.uri)
			
			return diagnostics.map(d => ({
				file: filePath,
				line: d.range.start.line + 1,
				column: d.range.start.character + 1,
				message: d.message,
				severity: d.severity === vscode.DiagnosticSeverity.Error ? 'error' :
						 d.severity === vscode.DiagnosticSeverity.Warning ? 'warning' : 'info',
				code: typeof d.code === 'number' ? d.code : undefined
			}))
		} catch (error) {
			return [{
				file: filePath,
				line: 0,
				column: 0,
				message: `Failed to validate file: ${error}`,
				severity: 'error'
			}]
		}
	}

	/**
	 * Get TypeScript configuration from .roo directory
	 */
	private async getTypeScriptConfig(cwd: string): Promise<TypeScriptConfig> {
		try {
			const config = await this.configService.loadConfigurationWithCache('config/typescript.json', cwd)
			return JSON.parse(config.merged || '{}')
		} catch (error) {
			// Return default configuration
			return {
				enabled: true,
				validateOnSave: true,
				excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**'],
				includePatterns: ['**/*.ts', '**/*.tsx']
			}
		}
	}

	/**
	 * Save TypeScript configuration to .roo directory
	 */
	private async saveTypeScriptConfig(cwd: string, config: TypeScriptConfig): Promise<void> {
		const configPath = path.join(cwd, '.roo', 'config', 'typescript.json')
		await fs.mkdir(path.dirname(configPath), { recursive: true })
		await fs.writeFile(configPath, JSON.stringify(config, null, 2))
	}

	/**
	 * Get TypeScript files in a project
	 */
	private async getTypeScriptFiles(cwd: string, config: TypeScriptConfig): Promise<string[]> {
		const files: string[] = []
		const includePatterns = config.includePatterns || ['**/*.ts', '**/*.tsx']
		const excludePatterns = config.excludePatterns || ['**/node_modules/**']

		// Use VS Code's file search
		for (const pattern of includePatterns) {
			const foundFiles = await vscode.workspace.findFiles(
				new vscode.RelativePattern(cwd, pattern),
				new vscode.RelativePattern(cwd, `{${excludePatterns.join(',')}}`)
			)
			
			files.push(...foundFiles.map(uri => uri.fsPath))
		}

		return files
	}

	/**
	 * Check if a file is a TypeScript file
	 */
	private isTypeScriptFile(filePath: string): boolean {
		return /\.(ts|tsx)$/.test(filePath)
	}

	/**
	 * Update VS Code diagnostics
	 */
	private updateDiagnostics(diagnostics: TypeScriptDiagnostic[]): void {
		// Group diagnostics by file
		const diagnosticsByFile = new Map<string, vscode.Diagnostic[]>()
		
		for (const diagnostic of diagnostics) {
			if (!diagnosticsByFile.has(diagnostic.file)) {
				diagnosticsByFile.set(diagnostic.file, [])
			}
			
			const range = new vscode.Range(
				new vscode.Position(Math.max(0, diagnostic.line - 1), Math.max(0, diagnostic.column - 1)),
				new vscode.Position(Math.max(0, diagnostic.line - 1), Math.max(0, diagnostic.column))
			)
			
			const severity = diagnostic.severity === 'error' ? vscode.DiagnosticSeverity.Error :
							diagnostic.severity === 'warning' ? vscode.DiagnosticSeverity.Warning :
							vscode.DiagnosticSeverity.Information
			
			const vscDiagnostic = new vscode.Diagnostic(range, diagnostic.message, severity)
			diagnosticsByFile.get(diagnostic.file)!.push(vscDiagnostic)
		}

		// Update diagnostics for each file
		for (const [filePath, fileDiagnostics] of diagnosticsByFile.entries()) {
			const uri = vscode.Uri.file(filePath)
			this.diagnosticCollection.set(uri, fileDiagnostics)
		}
	}

	/**
	 * Reload configuration
	 */
	private async reloadConfiguration(): Promise<void> {
		// Clear cache and reload
		this.configService.clearCache()
		this.emit('configurationReloaded')
	}

	/**
	 * Enable or disable TypeScript integration
	 */
	public setEnabled(enabled: boolean): void {
		this.isEnabled = enabled
		if (!enabled) {
			this.diagnosticCollection.clear()
		}
	}

	/**
	 * Dispose the service and clean up resources
	 */
	public dispose(): void {
		this.diagnosticCollection.dispose()
		this.removeAllListeners()
	}
}

// Singleton instance
let typeScriptService: TypeScriptIntegrationService | null = null

/**
 * Get the singleton TypeScript integration service
 */
export function getTypeScriptIntegrationService(): TypeScriptIntegrationService {
	if (!typeScriptService) {
		typeScriptService = new TypeScriptIntegrationService()
	}
	return typeScriptService
}

/**
 * Dispose the TypeScript integration service
 */
export function disposeTypeScriptIntegrationService(): void {
	if (typeScriptService) {
		typeScriptService.dispose()
		typeScriptService = null
	}
}
