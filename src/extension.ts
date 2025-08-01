import * as vscode from "vscode"
import * as dotenvx from "@dotenvx/dotenvx"
import * as path from "path"

// Load environment variables from .env file
try {
	// Specify path to .env file in the project root directory
	const envPath = path.join(__dirname, "..", ".env")
	dotenvx.config({ path: envPath })
} catch (e) {
	// Silently handle environment loading errors
	console.warn("Failed to load environment variables:", e)
}

import { CloudService } from "@roo-code/cloud"
import { TelemetryService, PostHogTelemetryClient } from "@roo-code/telemetry"

import "./utils/path" // Necessary to have access to String.prototype.toPosix.
import { createOutputChannelLogger, createDualLogger } from "./utils/outputChannelLogger"

import { Package } from "./shared/package"
import { formatLanguage } from "./shared/language"
import { ContextProxy } from "./core/config/ContextProxy"
import { ClineProvider } from "./core/webview/ClineProvider"
import { DIFF_VIEW_URI_SCHEME } from "./integrations/editor/DiffViewProvider"
import { TerminalRegistry } from "./integrations/terminal/TerminalRegistry"
import { McpServerManager } from "./services/mcp/McpServerManager"
import { CodeIndexManager } from "./services/code-index/manager"
import { MdmService } from "./services/mdm/MdmService"
import { migrateSettings } from "./utils/migrateSettings"
import { autoImportSettings } from "./utils/autoImportSettings"
import { API } from "./extension/api"
import { getFileWatcherService, disposeFileWatcherService } from "./services/file-watcher"
import { getRooConfigService, disposeRooConfigService } from "./services/roo-config"
import { getTypeScriptIntegrationService, disposeTypeScriptIntegrationService } from "./services/typescript-integration"
import { getModeManagementService, disposeModeManagementService } from "./services/mode-management"

import {
	handleUri,
	registerCommands,
	registerCodeActions,
	registerTerminalActions,
	CodeActionProvider,
} from "./activate"
import { initializeI18n } from "./i18n"

/**
 * Built using https://github.com/microsoft/vscode-webview-ui-toolkit
 *
 * Inspired by:
 *  - https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/default/weather-webview
 *  - https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/frameworks/hello-world-react-cra
 */

let outputChannel: vscode.OutputChannel
let extensionContext: vscode.ExtensionContext

// This method is called when your extension is activated.
// Your extension is activated the very first time the command is executed.
export async function activate(context: vscode.ExtensionContext) {
	extensionContext = context
	outputChannel = vscode.window.createOutputChannel(Package.outputChannel)
	context.subscriptions.push(outputChannel)
	outputChannel.appendLine(`${Package.name} extension activated - ${JSON.stringify(Package)}`)

	// Migrate old settings to new
	await migrateSettings(context, outputChannel)

	// Initialize telemetry service.
	const telemetryService = TelemetryService.createInstance()

	try {
		telemetryService.register(new PostHogTelemetryClient())
	} catch (error) {
		console.warn("Failed to register PostHogTelemetryClient:", error)
	}

	// Create logger for cloud services
	const cloudLogger = createDualLogger(createOutputChannelLogger(outputChannel))

	// Initialize Hivemind Cloud service.
	await CloudService.createInstance(context, {
		stateChanged: () => ClineProvider.getVisibleInstance()?.postStateToWebview(),
		log: cloudLogger,
	})

	// Initialize MDM service
	const mdmService = await MdmService.createInstance(cloudLogger)

	// Initialize i18n for internationalization support
	initializeI18n(context.globalState.get("language") ?? formatLanguage(vscode.env.language))

	// Initialize terminal shell execution handlers.
	TerminalRegistry.initialize()

	// Get default commands from configuration.
	const defaultCommands = vscode.workspace.getConfiguration(Package.name).get<string[]>("allowedCommands") || []

	// Initialize global state if not already set.
	if (!context.globalState.get("allowedCommands")) {
		context.globalState.update("allowedCommands", defaultCommands)
	}

	const contextProxy = await ContextProxy.getInstance(context)
	const codeIndexManager = CodeIndexManager.getInstance(context)

	try {
		await codeIndexManager?.initialize(contextProxy)
	} catch (error) {
		outputChannel.appendLine(
			`[CodeIndexManager] Error during background CodeIndexManager configuration/indexing: ${error.message || error}`,
		)
	}

	const provider = new ClineProvider(context, outputChannel, "sidebar", contextProxy, codeIndexManager, mdmService)
	TelemetryService.instance.setProvider(provider)

	if (codeIndexManager) {
		context.subscriptions.push(codeIndexManager)
	}

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ClineProvider.sideBarId, provider, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	)

	// Auto-import configuration if specified in settings
	try {
		await autoImportSettings(outputChannel, {
			providerSettingsManager: provider.providerSettingsManager,
			contextProxy: provider.contextProxy,
			customModesManager: provider.customModesManager,
		})
	} catch (error) {
		outputChannel.appendLine(
			`[AutoImport] Error during auto-import: ${error instanceof Error ? error.message : String(error)}`,
		)
	}

	registerCommands({ context, outputChannel, provider })

	/**
	 * We use the text document content provider API to show the left side for diff
	 * view by creating a virtual document for the original content. This makes it
	 * readonly so users know to edit the right side if they want to keep their changes.
	 *
	 * This API allows you to create readonly documents in VSCode from arbitrary
	 * sources, and works by claiming an uri-scheme for which your provider then
	 * returns text contents. The scheme must be provided when registering a
	 * provider and cannot change afterwards.
	 *
	 * Note how the provider doesn't create uris for virtual documents - its role
	 * is to provide contents given such an uri. In return, content providers are
	 * wired into the open document logic so that providers are always considered.
	 *
	 * https://code.visualstudio.com/api/extension-guides/virtual-documents
	 */
	const diffContentProvider = new (class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri): string {
			return Buffer.from(uri.query, "base64").toString("utf-8")
		}
	})()

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(DIFF_VIEW_URI_SCHEME, diffContentProvider),
	)

	context.subscriptions.push(vscode.window.registerUriHandler({ handleUri }))

	// Register code actions provider.
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider({ pattern: "**/*" }, new CodeActionProvider(), {
			providedCodeActionKinds: CodeActionProvider.providedCodeActionKinds,
		}),
	)

	registerCodeActions(context)
	registerTerminalActions(context)

	// Initialize enhanced .roo directory services
	try {
		// Initialize file watcher service for hot reloading
		const fileWatcherService = getFileWatcherService()

		// Initialize roo config service with caching and hot reloading
		const rooConfigService = getRooConfigService()

		// Initialize TypeScript integration service
		const typeScriptService = getTypeScriptIntegrationService()

		// Initialize mode management service
		const modeManagementService = getModeManagementService()

		// Set up .roo directory watching for the current workspace
		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
			const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath
			const rooDir = path.join(workspaceRoot, '.roo')

			// Watch .roo directory for changes
			fileWatcherService.watchDirectory(rooDir, {
				recursive: true,
				debounceMs: 300,
				includePatterns: ['**/*.md', '**/*.json', '**/*.yaml', '**/*.yml'],
				excludePatterns: ['**/temp/**', '**/*.tmp', '**/*.log']
			})

			outputChannel.appendLine(`✅ Enhanced .roo directory system initialized for ${workspaceRoot}`)
		}

		// Listen for configuration changes and show notifications
		rooConfigService.on('hotReload', (change) => {
			outputChannel.appendLine(`🔄 Configuration hot reloaded: ${change.configType} at ${change.path}`)
		})

		modeManagementService.on('modeChanged', (event) => {
			outputChannel.appendLine(`🔄 Mode switched from ${event.previousMode} to ${event.newMode}`)
		})

	} catch (error) {
		outputChannel.appendLine(`⚠️ Failed to initialize enhanced .roo directory services: ${error}`)
		console.error('Enhanced .roo directory services initialization failed:', error)
	}

	// Allows other extensions to activate once Roo is ready.
	vscode.commands.executeCommand(`${Package.name}.activationCompleted`)

	// Implements the `RooCodeAPI` interface.
	const socketPath = process.env.ROO_CODE_IPC_SOCKET_PATH
	const enableLogging = typeof socketPath === "string"

	// Watch the core files and automatically reload the extension host.
	if (process.env.NODE_ENV === "development") {
		const pattern = "**/*.ts"

		const watchPaths = [
			{ path: context.extensionPath, name: "extension" },
			{ path: path.join(context.extensionPath, "../packages/types"), name: "types" },
			{ path: path.join(context.extensionPath, "../packages/telemetry"), name: "telemetry" },
			{ path: path.join(context.extensionPath, "../packages/cloud"), name: "cloud" },
		]

		console.log(
			`♻️♻️♻️ Core auto-reloading is ENABLED. Watching for changes in: ${watchPaths.map(({ name }) => name).join(", ")}`,
		)

		watchPaths.forEach(({ path: watchPath, name }) => {
			const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(watchPath, pattern))

			watcher.onDidChange((uri) => {
				console.log(`♻️ ${name} file changed: ${uri.fsPath}. Reloading host…`)
				vscode.commands.executeCommand("workbench.action.reloadWindow")
			})

			context.subscriptions.push(watcher)
		})
	}

	return new API(outputChannel, provider, socketPath, enableLogging)
}

// This method is called when your extension is deactivated.
export async function deactivate() {
	outputChannel.appendLine(`${Package.name} extension deactivated`)

	// Clean up enhanced services
	disposeFileWatcherService()
	disposeRooConfigService()
	disposeTypeScriptIntegrationService()
	disposeModeManagementService()

	await McpServerManager.cleanup(extensionContext)
	TelemetryService.instance.shutdown()
	TerminalRegistry.cleanup()
}
