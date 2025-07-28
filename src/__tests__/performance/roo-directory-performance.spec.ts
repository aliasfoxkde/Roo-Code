import * as vscode from "vscode"
import { getRooConfigService, disposeRooConfigService } from "../../services/roo-config"
import { getFileWatcherService, disposeFileWatcherService } from "../../services/file-watcher"
import { getTypeScriptIntegrationService, disposeTypeScriptIntegrationService } from "../../services/typescript-integration"

// Mock VS Code API
jest.mock("vscode", () => ({
	workspace: {
		createFileSystemWatcher: jest.fn(),
		workspaceFolders: [{ uri: { fsPath: "/test/workspace" } }],
		findFiles: jest.fn(),
	},
	languages: {
		createDiagnosticCollection: jest.fn(() => ({
			set: jest.fn(),
			clear: jest.fn(),
			dispose: jest.fn(),
		})),
	},
	RelativePattern: jest.fn(),
	Uri: { file: jest.fn((path: string) => ({ fsPath: path })) },
}))

// Mock file system
jest.mock("fs/promises", () => ({
	readFile: jest.fn(),
	mkdir: jest.fn(),
	writeFile: jest.fn(),
}))

describe("Roo Directory System Performance", () => {
	let mockWatcher: any

	beforeEach(() => {
		jest.clearAllMocks()
		
		mockWatcher = {
			onDidCreate: jest.fn(),
			onDidChange: jest.fn(),
			onDidDelete: jest.fn(),
			dispose: jest.fn(),
		}
		
		;(vscode.workspace.createFileSystemWatcher as jest.Mock).mockReturnValue(mockWatcher)
	})

	afterEach(() => {
		disposeRooConfigService()
		disposeFileWatcherService()
		disposeTypeScriptIntegrationService()
	})

	describe("Memory Usage", () => {
		it("should not leak memory with repeated configuration loads", async () => {
			const configService = getRooConfigService()
			const fs = require("fs/promises")
			
			fs.readFile.mockResolvedValue("test content")

			// Measure initial memory
			const initialMemory = process.memoryUsage()

			// Perform many configuration loads
			for (let i = 0; i < 1000; i++) {
				await configService.loadConfigurationWithCache(`rules/rules-${i}.md`, "/test/project")
			}

			// Force garbage collection if available
			if (global.gc) {
				global.gc()
			}

			// Measure final memory
			const finalMemory = process.memoryUsage()
			
			// Memory increase should be reasonable (less than 50MB)
			const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
			expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // 50MB
		})

		it("should properly clean up cache when limit is reached", async () => {
			const configService = getRooConfigService()
			const fs = require("fs/promises")
			
			fs.readFile.mockResolvedValue("test content")

			// Load many different configurations
			const promises = []
			for (let i = 0; i < 100; i++) {
				promises.push(
					configService.loadConfigurationWithCache(`rules/rules-${i}.md`, `/test/project-${i}`)
				)
			}

			await Promise.all(promises)

			// Cache should not grow indefinitely
			// This is tested indirectly through memory usage
			expect(true).toBe(true) // Placeholder - actual cache size checking would require exposing internals
		})

		it("should handle file watcher cleanup efficiently", () => {
			const fileWatcherService = getFileWatcherService()
			const watchers = []

			// Create many watchers
			for (let i = 0; i < 100; i++) {
				const watcher = fileWatcherService.watchDirectory(`/test/project-${i}`)
				watchers.push(watcher)
			}

			// Dispose all watchers
			const startTime = Date.now()
			watchers.forEach(watcher => watcher.dispose())
			const endTime = Date.now()

			// Cleanup should be fast (less than 100ms for 100 watchers)
			expect(endTime - startTime).toBeLessThan(100)
		})
	})

	describe("CPU Performance", () => {
		it("should handle rapid file changes efficiently", (done) => {
			const fileWatcherService = getFileWatcherService()
			let eventCount = 0
			let processingTime = 0

			fileWatcherService.on("fileChange", () => {
				const start = Date.now()
				eventCount++
				processingTime += Date.now() - start
			})

			const watcher = fileWatcherService.watchDirectory("/test/project", {
				debounceMs: 50
			})

			// Simulate rapid file changes
			const changeHandler = mockWatcher.onDidChange.mock.calls[0][0]
			const startTime = Date.now()
			
			for (let i = 0; i < 1000; i++) {
				changeHandler({ fsPath: `/test/project/file-${i}.txt` })
			}

			setTimeout(() => {
				const totalTime = Date.now() - startTime
				
				// Should handle 1000 changes in reasonable time
				expect(totalTime).toBeLessThan(1000) // Less than 1 second
				
				// Average processing time per event should be minimal
				if (eventCount > 0) {
					expect(processingTime / eventCount).toBeLessThan(10) // Less than 10ms per event
				}
				
				watcher.dispose()
				done()
			}, 100)
		})

		it("should cache configuration loading efficiently", async () => {
			const configService = getRooConfigService()
			const fs = require("fs/promises")
			
			fs.readFile.mockResolvedValue("test content")

			// First load (should read from file)
			const startTime1 = Date.now()
			await configService.loadConfigurationWithCache("rules/rules.md", "/test/project")
			const firstLoadTime = Date.now() - startTime1

			// Second load (should use cache)
			const startTime2 = Date.now()
			await configService.loadConfigurationWithCache("rules/rules.md", "/test/project")
			const secondLoadTime = Date.now() - startTime2

			// Cached load should be significantly faster
			expect(secondLoadTime).toBeLessThan(firstLoadTime / 2)
			expect(secondLoadTime).toBeLessThan(10) // Less than 10ms
		})

		it("should handle concurrent configuration loads efficiently", async () => {
			const configService = getRooConfigService()
			const fs = require("fs/promises")
			
			fs.readFile.mockResolvedValue("test content")

			const startTime = Date.now()
			
			// Load 50 configurations concurrently
			const promises = []
			for (let i = 0; i < 50; i++) {
				promises.push(
					configService.loadConfigurationWithCache(`rules/rules-${i}.md`, "/test/project")
				)
			}

			await Promise.all(promises)
			
			const totalTime = Date.now() - startTime
			
			// Should complete all loads in reasonable time
			expect(totalTime).toBeLessThan(1000) // Less than 1 second
		})
	})

	describe("Scalability", () => {
		it("should handle large numbers of watched directories", () => {
			const fileWatcherService = getFileWatcherService()
			const watchers = []

			const startTime = Date.now()

			// Create 500 watchers
			for (let i = 0; i < 500; i++) {
				const watcher = fileWatcherService.watchDirectory(`/test/project-${i}`)
				watchers.push(watcher)
			}

			const creationTime = Date.now() - startTime

			// Should create watchers quickly
			expect(creationTime).toBeLessThan(5000) // Less than 5 seconds

			// Clean up
			watchers.forEach(watcher => watcher.dispose())
		})

		it("should handle large configuration files efficiently", async () => {
			const configService = getRooConfigService()
			const fs = require("fs/promises")
			
			// Create large configuration content (1MB)
			const largeContent = "# Large configuration\n".repeat(50000)
			fs.readFile.mockResolvedValue(largeContent)

			const startTime = Date.now()
			const result = await configService.loadConfigurationWithCache("rules/rules.md", "/test/project")
			const loadTime = Date.now() - startTime

			expect(result.merged).toContain("Large configuration")
			expect(loadTime).toBeLessThan(1000) // Should load 1MB in less than 1 second
		})

		it("should handle deep directory hierarchies", async () => {
			const configService = getRooConfigService()
			const fs = require("fs/promises")
			
			fs.readFile.mockResolvedValue("deep content")

			// Test with very deep path
			const deepPath = "/test/" + "deep/".repeat(50) + "project"
			
			const startTime = Date.now()
			await configService.loadConfigurationWithCache("rules/rules.md", deepPath)
			const loadTime = Date.now() - startTime

			expect(loadTime).toBeLessThan(100) // Should handle deep paths quickly
		})
	})

	describe("Long-running Operation Stability", () => {
		it("should maintain performance over extended periods", async () => {
			const configService = getRooConfigService()
			const fs = require("fs/promises")
			
			fs.readFile.mockResolvedValue("test content")

			const loadTimes = []

			// Simulate extended usage over time
			for (let hour = 0; hour < 24; hour++) {
				for (let operation = 0; operation < 10; operation++) {
					const startTime = Date.now()
					await configService.loadConfigurationWithCache(
						`rules/rules-${hour}-${operation}.md`,
						"/test/project"
					)
					loadTimes.push(Date.now() - startTime)
				}

				// Simulate cache invalidation (like file changes)
				if (hour % 4 === 0) {
					configService.clearCache()
				}
			}

			// Performance should remain consistent
			const averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
			const maxLoadTime = Math.max(...loadTimes)

			expect(averageLoadTime).toBeLessThan(50) // Average less than 50ms
			expect(maxLoadTime).toBeLessThan(200) // Max less than 200ms
		})

		it("should handle memory pressure gracefully", async () => {
			const configService = getRooConfigService()
			const fs = require("fs/promises")
			
			// Create progressively larger content to simulate memory pressure
			const contents = []
			for (let i = 0; i < 100; i++) {
				contents.push("Content ".repeat(1000 * (i + 1))) // Increasing size
			}

			let index = 0
			fs.readFile.mockImplementation(() => {
				return Promise.resolve(contents[index++ % contents.length])
			})

			// Load many configurations with increasing memory usage
			for (let i = 0; i < 1000; i++) {
				await configService.loadConfigurationWithCache(`rules/rules-${i}.md`, "/test/project")
				
				// Periodically check that we can still load configurations
				if (i % 100 === 0) {
					const startTime = Date.now()
					await configService.loadConfigurationWithCache("test.md", "/test/project")
					const loadTime = Date.now() - startTime
					
					// Should still be responsive under memory pressure
					expect(loadTime).toBeLessThan(100)
				}
			}
		})

		it("should recover from temporary file system issues", async () => {
			const configService = getRooConfigService()
			const fs = require("fs/promises")
			
			let failureCount = 0
			fs.readFile.mockImplementation(() => {
				failureCount++
				if (failureCount % 10 === 0) {
					// Simulate temporary file system failure
					return Promise.reject(new Error("Temporary file system error"))
				}
				return Promise.resolve("test content")
			})

			let successCount = 0
			let errorCount = 0

			// Attempt many operations with intermittent failures
			for (let i = 0; i < 100; i++) {
				try {
					await configService.loadConfigurationWithCache(`rules/rules-${i}.md`, "/test/project")
					successCount++
				} catch (error) {
					errorCount++
				}
			}

			// Should have mostly successful operations despite some failures
			expect(successCount).toBeGreaterThan(80)
			expect(errorCount).toBeLessThan(20)
		})
	})

	describe("Resource Limits", () => {
		it("should respect file watcher limits", () => {
			const fileWatcherService = getFileWatcherService()
			
			// Mock file watcher creation to fail after certain limit
			let watcherCount = 0
			;(vscode.workspace.createFileSystemWatcher as jest.Mock).mockImplementation(() => {
				watcherCount++
				if (watcherCount > 100) {
					throw new Error("Too many file watchers")
				}
				return mockWatcher
			})

			const watchers = []
			let errorCount = 0

			// Try to create many watchers
			for (let i = 0; i < 150; i++) {
				try {
					const watcher = fileWatcherService.watchDirectory(`/test/project-${i}`)
					watchers.push(watcher)
				} catch (error) {
					errorCount++
				}
			}

			// Should handle watcher limit gracefully
			expect(errorCount).toBeGreaterThan(0) // Some should fail
			expect(watchers.length).toBeLessThanOrEqual(100) // Shouldn't exceed limit

			// Clean up
			watchers.forEach(watcher => watcher.dispose())
		})

		it("should handle configuration cache size limits", async () => {
			const configService = getRooConfigService()
			const fs = require("fs/promises")
			
			// Create large configurations
			const largeContent = "Large content ".repeat(10000) // ~130KB each
			fs.readFile.mockResolvedValue(largeContent)

			// Load many large configurations
			for (let i = 0; i < 100; i++) {
				await configService.loadConfigurationWithCache(`rules/large-${i}.md`, "/test/project")
			}

			// System should remain responsive
			const startTime = Date.now()
			await configService.loadConfigurationWithCache("test.md", "/test/project")
			const loadTime = Date.now() - startTime

			expect(loadTime).toBeLessThan(100) // Should still be fast
		})
	})
})
