import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"
import { RooConfigService, getRooConfigService, disposeRooConfigService } from "../index"
import { getFileWatcherService, disposeFileWatcherService } from "../../file-watcher"

// Mock VS Code API
jest.mock("vscode", () => ({
	workspace: {
		createFileSystemWatcher: jest.fn(),
		workspaceFolders: [
			{
				uri: { fsPath: "/test/workspace" }
			}
		]
	},
	RelativePattern: jest.fn(),
	Uri: {
		file: jest.fn((path: string) => ({ fsPath: path })),
	},
}))

// Mock file system
jest.mock("fs/promises")

describe("Enhanced RooConfigService", () => {
	let service: RooConfigService
	let mockWatcher: any
	let mockFs: jest.Mocked<typeof fs>

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
		
		// Create service instance
		service = new RooConfigService()
	})

	afterEach(() => {
		service.dispose()
		disposeRooConfigService()
		disposeFileWatcherService()
	})

	describe("Configuration Loading with Cache", () => {
		it("should load and cache configuration", async () => {
			const testConfig = {
				global: "global content",
				project: "project content",
				merged: "global content\n\n# Project-specific rules (override global):\n\nproject content"
			}

			// Mock file reads
			mockFs.readFile
				.mockResolvedValueOnce("global content")  // Global file
				.mockResolvedValueOnce("project content") // Project file

			const result = await service.loadConfigurationWithCache("rules/rules.md", "/test/project")

			expect(result).toEqual(testConfig)
			expect(mockFs.readFile).toHaveBeenCalledTimes(2)
		})

		it("should return cached configuration on subsequent calls", async () => {
			// Mock file reads for first call
			mockFs.readFile
				.mockResolvedValueOnce("global content")
				.mockResolvedValueOnce("project content")

			// First call - should read files
			await service.loadConfigurationWithCache("rules/rules.md", "/test/project")
			
			// Second call - should use cache
			const result = await service.loadConfigurationWithCache("rules/rules.md", "/test/project")

			expect(result.merged).toContain("global content")
			expect(mockFs.readFile).toHaveBeenCalledTimes(2) // Only called once
		})

		it("should set up file watching when enabled", async () => {
			mockFs.readFile
				.mockResolvedValueOnce("content")
				.mockResolvedValueOnce(null as any) // No project file

			await service.loadConfigurationWithCache("rules/rules.md", "/test/project", true)

			// Should create watchers for both global and project files
			expect(vscode.workspace.createFileSystemWatcher).toHaveBeenCalledTimes(2)
		})

		it("should not set up duplicate watchers", async () => {
			mockFs.readFile
				.mockResolvedValue("content")

			// Call twice with same parameters
			await service.loadConfigurationWithCache("rules/rules.md", "/test/project", true)
			await service.loadConfigurationWithCache("rules/rules.md", "/test/project", true)

			// Should only create watchers once
			expect(vscode.workspace.createFileSystemWatcher).toHaveBeenCalledTimes(2)
		})
	})

	describe("Hot Reloading", () => {
		it("should invalidate cache when configuration changes", async () => {
			// Setup initial configuration
			mockFs.readFile.mockResolvedValue("initial content")
			await service.loadConfigurationWithCache("rules/rules.md", "/test/project")

			// Simulate file change
			const fileWatcherService = getFileWatcherService()
			fileWatcherService.emit("configChange", {
				configType: "rules",
				path: "/test/project/.roo/rules/rules.md",
				timestamp: Date.now()
			})

			// Mock new content
			mockFs.readFile.mockResolvedValue("updated content")

			// Next call should read files again (cache invalidated)
			const result = await service.loadConfigurationWithCache("rules/rules.md", "/test/project")
			
			expect(result.merged).toContain("updated content")
		})

		it("should emit hotReload events", (done) => {
			service.on("hotReload", (change) => {
				expect(change.configType).toBe("rules")
				expect(change.path).toContain("rules.md")
				done()
			})

			// Simulate configuration change
			const fileWatcherService = getFileWatcherService()
			fileWatcherService.emit("configChange", {
				configType: "rules",
				path: "/test/project/.roo/rules/rules.md",
				timestamp: Date.now()
			})
		})

		it("should emit configurationChanged events for file changes", (done) => {
			service.on("configurationChanged", (event) => {
				expect(event.type).toBe("project")
				expect(event.path).toContain("rules.md")
				done()
			})

			// Setup file watching
			mockFs.readFile.mockResolvedValue("content")
			service.loadConfigurationWithCache("rules/rules.md", "/test/project", true)

			// Simulate file change through watcher callback
			const changeHandler = mockWatcher.onDidChange.mock.calls[0][0]
			changeHandler({ fsPath: "/test/project/.roo/rules/rules.md" })
		})
	})

	describe("Cache Management", () => {
		it("should clear all cached configurations", async () => {
			// Load multiple configurations
			mockFs.readFile.mockResolvedValue("content")
			await service.loadConfigurationWithCache("rules/rules.md", "/test/project1")
			await service.loadConfigurationWithCache("config/settings.json", "/test/project2")

			// Clear cache
			service.clearCache()

			// Next calls should read files again
			await service.loadConfigurationWithCache("rules/rules.md", "/test/project1")
			
			// Should have read files again after cache clear
			expect(mockFs.readFile).toHaveBeenCalledTimes(6) // 2 + 2 + 2 calls
		})

		it("should invalidate specific cache entries", async () => {
			// Load configuration
			mockFs.readFile.mockResolvedValue("content")
			await service.loadConfigurationWithCache("rules/rules.md", "/test/project")

			// Simulate change that should invalidate cache
			const fileWatcherService = getFileWatcherService()
			fileWatcherService.emit("configChange", {
				configType: "rules",
				path: "/test/project/.roo/rules/rules.md",
				timestamp: Date.now()
			})

			// Next call should read files again
			await service.loadConfigurationWithCache("rules/rules.md", "/test/project")
			
			expect(mockFs.readFile).toHaveBeenCalledTimes(4) // 2 initial + 2 after invalidation
		})
	})

	describe("Error Handling", () => {
		it("should handle file read errors gracefully", async () => {
			mockFs.readFile.mockRejectedValue(new Error("File not found"))

			await expect(
				service.loadConfigurationWithCache("rules/rules.md", "/test/project")
			).rejects.toThrow("File not found")
		})

		it("should handle watcher setup errors gracefully", async () => {
			// Mock watcher creation to throw error
			;(vscode.workspace.createFileSystemWatcher as jest.Mock).mockImplementation(() => {
				throw new Error("Watcher creation failed")
			})

			mockFs.readFile.mockResolvedValue("content")

			// Should not throw error even if watcher setup fails
			const result = await service.loadConfigurationWithCache("rules/rules.md", "/test/project", true)
			expect(result.merged).toBe("content")
		})
	})

	describe("Singleton Pattern", () => {
		it("should return the same instance", () => {
			const instance1 = getRooConfigService()
			const instance2 = getRooConfigService()
			
			expect(instance1).toBe(instance2)
		})

		it("should dispose and recreate instance", () => {
			const instance1 = getRooConfigService()
			
			disposeRooConfigService()
			
			const instance2 = getRooConfigService()
			
			expect(instance1).not.toBe(instance2)
		})
	})

	describe("Resource Cleanup", () => {
		it("should dispose all watchers on cleanup", () => {
			// Setup watchers
			mockFs.readFile.mockResolvedValue("content")
			service.loadConfigurationWithCache("rules/rules.md", "/test/project", true)

			// Dispose service
			service.dispose()

			// Should dispose all watchers
			expect(mockWatcher.dispose).toHaveBeenCalled()
		})

		it("should clear cache on disposal", async () => {
			// Load configuration
			mockFs.readFile.mockResolvedValue("content")
			await service.loadConfigurationWithCache("rules/rules.md", "/test/project")

			// Dispose service
			service.dispose()

			// Create new service and load same config
			const newService = new RooConfigService()
			await newService.loadConfigurationWithCache("rules/rules.md", "/test/project")

			// Should read files again (cache was cleared)
			expect(mockFs.readFile).toHaveBeenCalledTimes(4) // 2 + 2 calls

			newService.dispose()
		})

		it("should remove all event listeners on disposal", () => {
			const listener = jest.fn()
			service.on("hotReload", listener)

			service.dispose()

			// Emit event after disposal - listener should not be called
			service.emit("hotReload", {
				configType: "rules",
				path: "/test",
				timestamp: Date.now()
			})

			expect(listener).not.toHaveBeenCalled()
		})
	})

	describe("Integration with File Watcher Service", () => {
		it("should integrate with file watcher service events", (done) => {
			service.on("hotReload", (change) => {
				expect(change.configType).toBe("rules")
				done()
			})

			// Simulate file watcher service event
			const fileWatcherService = getFileWatcherService()
			fileWatcherService.emit("configChange", {
				configType: "rules",
				path: "/test/project/.roo/rules/rules.md",
				timestamp: Date.now()
			})
		})

		it("should handle multiple configuration types", () => {
			const changes: string[] = []
			
			service.on("hotReload", (change) => {
				changes.push(change.configType)
			})

			const fileWatcherService = getFileWatcherService()
			
			// Simulate different types of changes
			fileWatcherService.emit("configChange", {
				configType: "rules",
				path: "/test/.roo/rules/rules.md",
				timestamp: Date.now()
			})
			
			fileWatcherService.emit("configChange", {
				configType: "config",
				path: "/test/.roo/config/settings.json",
				timestamp: Date.now()
			})

			expect(changes).toEqual(["rules", "config"])
		})
	})
})
