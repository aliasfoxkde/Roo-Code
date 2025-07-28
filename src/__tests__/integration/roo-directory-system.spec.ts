import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"
import { getRooConfigService, disposeRooConfigService } from "../../services/roo-config"
import { getFileWatcherService, disposeFileWatcherService } from "../../services/file-watcher"
import { getTypeScriptIntegrationService, disposeTypeScriptIntegrationService } from "../../services/typescript-integration"
import { getModeManagementService, disposeModeManagementService } from "../../services/mode-management"

// Mock VS Code API
jest.mock("vscode", () => ({
	workspace: {
		createFileSystemWatcher: jest.fn(),
		workspaceFolders: [
			{
				uri: { fsPath: "/test/workspace" }
			}
		],
		findFiles: jest.fn(),
		openTextDocument: jest.fn(),
	},
	languages: {
		createDiagnosticCollection: jest.fn(() => ({
			set: jest.fn(),
			clear: jest.fn(),
			dispose: jest.fn(),
		})),
		getDiagnostics: jest.fn(() => []),
	},
	window: {
		showInformationMessage: jest.fn(),
		showErrorMessage: jest.fn(),
	},
	RelativePattern: jest.fn(),
	Uri: {
		file: jest.fn((path: string) => ({ fsPath: path })),
	},
	DiagnosticSeverity: {
		Error: 0,
		Warning: 1,
		Information: 2,
	},
	Diagnostic: jest.fn(),
	Range: jest.fn(),
	Position: jest.fn(),
}))

// Mock file system
jest.mock("fs/promises")

describe("Roo Directory System Integration", () => {
	let mockFs: jest.Mocked<typeof fs>
	let mockWatcher: any

	beforeEach(() => {
		// Reset mocks
		jest.clearAllMocks()
		
		// Setup file system mock
		mockFs = fs as jest.Mocked<typeof fs>
		
		// Create mock watcher
		mockWatcher = {
			onDidCreate: jest.fn(),
			onDidChange: jest.fn(),
			onDidDelete: jest.fn(),
			dispose: jest.fn(),
		}
		
		// Mock createFileSystemWatcher
		;(vscode.workspace.createFileSystemWatcher as jest.Mock).mockReturnValue(mockWatcher)
	})

	afterEach(() => {
		// Clean up all services
		disposeRooConfigService()
		disposeFileWatcherService()
		disposeTypeScriptIntegrationService()
		disposeModeManagementService()
	})

	describe("Complete System Integration", () => {
		it("should initialize all services successfully", () => {
			const configService = getRooConfigService()
			const fileWatcherService = getFileWatcherService()
			const typeScriptService = getTypeScriptIntegrationService()
			const modeService = getModeManagementService()

			expect(configService).toBeDefined()
			expect(fileWatcherService).toBeDefined()
			expect(typeScriptService).toBeDefined()
			expect(modeService).toBeDefined()
		})

		it("should handle end-to-end configuration loading and hot reloading", async () => {
			const configService = getRooConfigService()
			const fileWatcherService = getFileWatcherService()

			// Mock configuration files
			mockFs.readFile
				.mockResolvedValueOnce("# Global Rules\nUse TypeScript")
				.mockResolvedValueOnce("# Project Rules\nFollow project standards")

			// Load configuration
			const config = await configService.loadConfigurationWithCache(
				"rules/rules.md",
				"/test/project",
				true
			)

			expect(config.merged).toContain("Global Rules")
			expect(config.merged).toContain("Project Rules")

			// Test hot reloading
			let hotReloadTriggered = false
			configService.on("hotReload", () => {
				hotReloadTriggered = true
			})

			// Simulate file change
			fileWatcherService.emit("configChange", {
				configType: "rules",
				path: "/test/project/.roo/rules/rules.md",
				timestamp: Date.now()
			})

			expect(hotReloadTriggered).toBe(true)
		})

		it("should integrate TypeScript validation with configuration", async () => {
			const typeScriptService = getTypeScriptIntegrationService()
			const configService = getRooConfigService()

			// Mock TypeScript configuration
			mockFs.readFile.mockResolvedValue(JSON.stringify({
				enabled: true,
				validateOnSave: true,
				compilerOptions: {
					strict: true
				}
			}))

			// Mock VS Code workspace methods
			;(vscode.workspace.findFiles as jest.Mock).mockResolvedValue([
				{ fsPath: "/test/project/src/index.ts" }
			])
			;(vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue({
				fileName: "/test/project/src/index.ts"
			})

			const result = await typeScriptService.validateProject("/test/project")

			expect(result.success).toBe(true)
			expect(result.errors).toEqual([])
		})

		it("should handle mode switching with TypeScript integration", async () => {
			const modeService = getModeManagementService()
			const typeScriptService = getTypeScriptIntegrationService()

			// Mock mode configuration
			mockFs.readFile.mockResolvedValue(JSON.stringify({
				currentMode: "development"
			}))
			mockFs.mkdir.mockResolvedValue(undefined)
			mockFs.writeFile.mockResolvedValue(undefined)

			// Switch to production mode
			await modeService.switchMode("production", "/test/project")

			// Verify TypeScript was configured for production mode
			const compilerOptions = await typeScriptService.getCompilerOptions("/test/project")
			expect(compilerOptions).toBeDefined()
		})
	})

	describe("Error Handling and Recovery", () => {
		it("should handle service initialization failures gracefully", () => {
			// Mock file watcher creation to fail
			;(vscode.workspace.createFileSystemWatcher as jest.Mock).mockImplementation(() => {
				throw new Error("File watcher creation failed")
			})

			// Services should still initialize
			expect(() => {
				getRooConfigService()
				getFileWatcherService()
				getTypeScriptIntegrationService()
				getModeManagementService()
			}).not.toThrow()
		})

		it("should recover from configuration file errors", async () => {
			const configService = getRooConfigService()

			// Mock file read to fail initially
			mockFs.readFile
				.mockRejectedValueOnce(new Error("File not found"))
				.mockResolvedValueOnce("# Recovered content")

			// First call should fail
			await expect(
				configService.loadConfigurationWithCache("rules/rules.md", "/test/project")
			).rejects.toThrow("File not found")

			// Second call should succeed
			const result = await configService.loadConfigurationWithCache("rules/rules.md", "/test/project")
			expect(result.merged).toBe("# Recovered content")
		})

		it("should handle TypeScript service errors gracefully", async () => {
			const typeScriptService = getTypeScriptIntegrationService()

			// Mock VS Code methods to fail
			;(vscode.workspace.findFiles as jest.Mock).mockRejectedValue(new Error("Find files failed"))

			const result = await typeScriptService.validateProject("/test/project")

			expect(result.success).toBe(false)
			expect(result.errors).toHaveLength(1)
			expect(result.errors[0].message).toContain("TypeScript validation failed")
		})
	})

	describe("Performance and Resource Management", () => {
		it("should handle multiple concurrent configuration loads", async () => {
			const configService = getRooConfigService()

			// Mock file reads
			mockFs.readFile.mockResolvedValue("content")

			// Load multiple configurations concurrently
			const promises = [
				configService.loadConfigurationWithCache("rules/rules.md", "/test/project1"),
				configService.loadConfigurationWithCache("config/settings.json", "/test/project1"),
				configService.loadConfigurationWithCache("rules/rules.md", "/test/project2"),
			]

			const results = await Promise.all(promises)

			expect(results).toHaveLength(3)
			results.forEach(result => {
				expect(result.merged).toBe("content")
			})
		})

		it("should properly dispose all resources", () => {
			// Initialize all services
			const configService = getRooConfigService()
			const fileWatcherService = getFileWatcherService()
			const typeScriptService = getTypeScriptIntegrationService()
			const modeService = getModeManagementService()

			// Add event listeners
			const listeners = [
				jest.fn(),
				jest.fn(),
				jest.fn(),
				jest.fn()
			]

			configService.on("hotReload", listeners[0])
			fileWatcherService.on("fileChange", listeners[1])
			typeScriptService.on("configurationReloaded", listeners[2])
			modeService.on("modeChanged", listeners[3])

			// Dispose all services
			disposeRooConfigService()
			disposeFileWatcherService()
			disposeTypeScriptIntegrationService()
			disposeModeManagementService()

			// Emit events - listeners should not be called
			configService.emit("hotReload", { configType: "test", path: "/test", timestamp: Date.now() })
			fileWatcherService.emit("fileChange", { type: "modified", path: "/test", timestamp: Date.now() })
			typeScriptService.emit("configurationReloaded")
			modeService.emit("modeChanged", { previousMode: "dev", newMode: "prod", cwd: "/test" })

			listeners.forEach(listener => {
				expect(listener).not.toHaveBeenCalled()
			})
		})

		it("should handle high-frequency file changes efficiently", (done) => {
			const fileWatcherService = getFileWatcherService()
			let eventCount = 0

			fileWatcherService.on("fileChange", () => {
				eventCount++
			})

			// Watch a directory
			const watcher = fileWatcherService.watchDirectory("/test/project", {
				debounceMs: 100
			})

			// Simulate rapid file changes
			const changeHandler = mockWatcher.onDidChange.mock.calls[0][0]
			for (let i = 0; i < 10; i++) {
				changeHandler({ fsPath: "/test/project/file.txt" })
			}

			// After debounce period, should only have one event
			setTimeout(() => {
				expect(eventCount).toBe(1)
				watcher.dispose()
				done()
			}, 150)
		})
	})

	describe("Real-world Scenarios", () => {
		it("should handle a complete project setup workflow", async () => {
			const configService = getRooConfigService()
			const modeService = getModeManagementService()
			const typeScriptService = getTypeScriptIntegrationService()

			// Mock project files
			mockFs.readFile
				.mockResolvedValueOnce("# Project rules")  // rules.md
				.mockResolvedValueOnce(JSON.stringify({    // modes.json
					currentMode: "development"
				}))
				.mockResolvedValueOnce(JSON.stringify({    // typescript.json
					enabled: true,
					validateOnSave: true
				}))

			mockFs.mkdir.mockResolvedValue(undefined)
			mockFs.writeFile.mockResolvedValue(undefined)

			// Load initial configuration
			const config = await configService.loadConfigurationWithCache("rules/rules.md", "/test/project")
			expect(config.merged).toBe("# Project rules")

			// Get current mode
			const currentMode = await modeService.getCurrentMode("/test/project")
			expect(currentMode).toBe("development")

			// Switch to production mode
			await modeService.switchMode("production", "/test/project")

			// Validate TypeScript project
			;(vscode.workspace.findFiles as jest.Mock).mockResolvedValue([])
			const validation = await typeScriptService.validateProject("/test/project")
			expect(validation.success).toBe(true)
		})

		it("should handle team collaboration scenario", async () => {
			const configService = getRooConfigService()
			const fileWatcherService = getFileWatcherService()

			// Mock global and project configurations
			mockFs.readFile
				.mockResolvedValueOnce("# Global team standards")
				.mockResolvedValueOnce("# Project-specific rules")

			// Load configuration
			const config = await configService.loadConfigurationWithCache(
				"rules/rules.md",
				"/test/project",
				true
			)

			expect(config.merged).toContain("Global team standards")
			expect(config.merged).toContain("Project-specific rules")

			// Simulate team member updating project rules
			let configUpdated = false
			configService.on("hotReload", () => {
				configUpdated = true
			})

			fileWatcherService.emit("configChange", {
				configType: "rules",
				path: "/test/project/.roo/rules/rules.md",
				timestamp: Date.now()
			})

			expect(configUpdated).toBe(true)
		})

		it("should handle monorepo scenario", async () => {
			const configService = getRooConfigService()

			// Mock root and package configurations
			mockFs.readFile
				.mockResolvedValueOnce("# Monorepo root rules")
				.mockResolvedValueOnce("# Frontend package rules")

			// Load root configuration
			const rootConfig = await configService.loadConfigurationWithCache(
				"rules/rules.md",
				"/test/monorepo"
			)

			// Load package configuration
			const packageConfig = await configService.loadConfigurationWithCache(
				"rules/rules.md",
				"/test/monorepo/packages/frontend"
			)

			expect(rootConfig.merged).toContain("Monorepo root rules")
			expect(packageConfig.merged).toContain("Frontend package rules")
		})
	})
})
