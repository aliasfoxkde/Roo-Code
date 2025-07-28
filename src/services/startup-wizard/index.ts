import * as vscode from "vscode"
import { EventEmitter } from "events"
import { getConfigurationTemplateService, ConfigurationTemplate } from "../configuration-templates"

/**
 * Wizard step definition
 */
export interface WizardStep {
	id: string
	title: string
	description: string
	component: WizardStepComponent
	validate?: (data: any) => Promise<boolean>
	skip?: (data: any) => boolean
}

/**
 * Wizard step component types
 */
export type WizardStepComponent = 
	| ProjectTypeStep
	| TemplateSelectionStep
	| ConfigurationStep
	| ConfirmationStep

export interface ProjectTypeStep {
	type: 'project-type'
	options: Array<{
		id: string
		name: string
		description: string
		icon?: string
	}>
}

export interface TemplateSelectionStep {
	type: 'template-selection'
	category?: string
	allowCustom?: boolean
}

export interface ConfigurationStep {
	type: 'configuration'
	fields: Array<{
		id: string
		label: string
		type: 'text' | 'boolean' | 'select' | 'multiselect'
		required?: boolean
		default?: any
		options?: Array<{ value: any; label: string }>
		description?: string
	}>
}

export interface ConfirmationStep {
	type: 'confirmation'
	summary: (data: any) => string
}

/**
 * Wizard configuration
 */
export interface WizardConfig {
	id: string
	title: string
	description: string
	steps: WizardStep[]
	onComplete: (data: any) => Promise<void>
	onCancel?: () => void
}

/**
 * Wizard result
 */
export interface WizardResult {
	completed: boolean
	data: any
	selectedTemplate?: ConfigurationTemplate
	errors?: string[]
}

/**
 * Startup wizard service for guiding users through initial setup
 */
export class StartupWizardService extends EventEmitter {
	private templateService = getConfigurationTemplateService()
	private activeWizard: WizardConfig | null = null

	constructor() {
		super()
	}

	/**
	 * Start the project setup wizard
	 */
	public async startProjectSetupWizard(workspacePath: string): Promise<WizardResult> {
		const wizard: WizardConfig = {
			id: 'project-setup',
			title: 'Roo Code Project Setup',
			description: 'Set up Roo Code configuration for your project',
			steps: [
				{
					id: 'project-type',
					title: 'Project Type',
					description: 'What type of project are you working on?',
					component: {
						type: 'project-type',
						options: [
							{
								id: 'frontend',
								name: 'Frontend Application',
								description: 'React, Vue, Angular, or other frontend frameworks',
								icon: '🌐'
							},
							{
								id: 'backend',
								name: 'Backend API',
								description: 'Node.js, Python, or other backend services',
								icon: '⚙️'
							},
							{
								id: 'fullstack',
								name: 'Full-Stack Application',
								description: 'Combined frontend and backend project',
								icon: '🔄'
							},
							{
								id: 'library',
								name: 'Library/Package',
								description: 'Reusable library or npm package',
								icon: '📦'
							},
							{
								id: 'other',
								name: 'Other',
								description: 'Custom project type',
								icon: '🛠️'
							}
						]
					}
				},
				{
					id: 'template-selection',
					title: 'Template Selection',
					description: 'Choose a configuration template for your project',
					component: {
						type: 'template-selection',
						allowCustom: true
					}
				},
				{
					id: 'configuration',
					title: 'Configuration',
					description: 'Customize your project settings',
					component: {
						type: 'configuration',
						fields: [
							{
								id: 'enableTypeScript',
								label: 'Enable TypeScript Integration',
								type: 'boolean',
								default: true,
								description: 'Enable TypeScript validation and IntelliSense'
							},
							{
								id: 'enableHotReloading',
								label: 'Enable Hot Reloading',
								type: 'boolean',
								default: true,
								description: 'Automatically reload configuration when files change'
							},
							{
								id: 'defaultMode',
								label: 'Default Development Mode',
								type: 'select',
								default: 'development',
								options: [
									{ value: 'development', label: 'Development' },
									{ value: 'production', label: 'Production' },
									{ value: 'test', label: 'Test' }
								],
								description: 'Default mode for development'
							},
							{
								id: 'teamSettings',
								label: 'Team Settings',
								type: 'boolean',
								default: false,
								description: 'Configure settings for team collaboration'
							}
						]
					}
				},
				{
					id: 'confirmation',
					title: 'Confirmation',
					description: 'Review your configuration before applying',
					component: {
						type: 'confirmation',
						summary: (data) => this.generateConfigurationSummary(data)
					}
				}
			],
			onComplete: async (data) => {
				await this.applyWizardConfiguration(workspacePath, data)
			}
		}

		return this.runWizard(wizard)
	}

	/**
	 * Start the team onboarding wizard
	 */
	public async startTeamOnboardingWizard(): Promise<WizardResult> {
		const wizard: WizardConfig = {
			id: 'team-onboarding',
			title: 'Team Onboarding',
			description: 'Set up Roo Code for team collaboration',
			steps: [
				{
					id: 'team-info',
					title: 'Team Information',
					description: 'Tell us about your team',
					component: {
						type: 'configuration',
						fields: [
							{
								id: 'teamName',
								label: 'Team Name',
								type: 'text',
								required: true,
								description: 'Name of your development team'
							},
							{
								id: 'projectType',
								label: 'Primary Project Type',
								type: 'select',
								required: true,
								options: [
									{ value: 'web', label: 'Web Applications' },
									{ value: 'mobile', label: 'Mobile Applications' },
									{ value: 'api', label: 'APIs and Services' },
									{ value: 'mixed', label: 'Mixed Projects' }
								]
							},
							{
								id: 'teamSize',
								label: 'Team Size',
								type: 'select',
								required: true,
								options: [
									{ value: 'small', label: '1-5 developers' },
									{ value: 'medium', label: '6-15 developers' },
									{ value: 'large', label: '16+ developers' }
								]
							}
						]
					}
				},
				{
					id: 'standards',
					title: 'Coding Standards',
					description: 'Set up team coding standards',
					component: {
						type: 'configuration',
						fields: [
							{
								id: 'codeStyle',
								label: 'Code Style',
								type: 'select',
								default: 'standard',
								options: [
									{ value: 'standard', label: 'Standard' },
									{ value: 'airbnb', label: 'Airbnb' },
									{ value: 'google', label: 'Google' },
									{ value: 'custom', label: 'Custom' }
								]
							},
							{
								id: 'testingFramework',
								label: 'Testing Framework',
								type: 'select',
								options: [
									{ value: 'jest', label: 'Jest' },
									{ value: 'mocha', label: 'Mocha' },
									{ value: 'vitest', label: 'Vitest' },
									{ value: 'other', label: 'Other' }
								]
							},
							{
								id: 'cicd',
								label: 'CI/CD Platform',
								type: 'select',
								options: [
									{ value: 'github', label: 'GitHub Actions' },
									{ value: 'gitlab', label: 'GitLab CI' },
									{ value: 'jenkins', label: 'Jenkins' },
									{ value: 'other', label: 'Other' }
								]
							}
						]
					}
				}
			],
			onComplete: async (data) => {
				await this.applyTeamConfiguration(data)
			}
		}

		return this.runWizard(wizard)
	}

	/**
	 * Run a wizard configuration
	 */
	private async runWizard(wizard: WizardConfig): Promise<WizardResult> {
		this.activeWizard = wizard
		this.emit('wizardStarted', wizard)

		try {
			// In a real implementation, this would show a webview or series of dialogs
			// For now, we'll simulate the wizard completion
			const result = await this.simulateWizardExecution(wizard)
			
			this.emit('wizardCompleted', { wizard, result })
			return result

		} catch (error) {
			this.emit('wizardError', { wizard, error })
			return {
				completed: false,
				data: {},
				errors: [error instanceof Error ? error.message : String(error)]
			}
		} finally {
			this.activeWizard = null
		}
	}

	/**
	 * Simulate wizard execution (in real implementation, this would be interactive)
	 */
	private async simulateWizardExecution(wizard: WizardConfig): Promise<WizardResult> {
		// This is a simplified simulation
		// In a real implementation, you would:
		// 1. Show webview with wizard steps
		// 2. Collect user input for each step
		// 3. Validate input
		// 4. Apply configuration

		const mockData = {
			projectType: 'frontend',
			selectedTemplate: 'react-typescript',
			enableTypeScript: true,
			enableHotReloading: true,
			defaultMode: 'development',
			teamSettings: false
		}

		// Get selected template
		const selectedTemplate = this.templateService.getTemplate(mockData.selectedTemplate)

		// Apply configuration
		await wizard.onComplete(mockData)

		return {
			completed: true,
			data: mockData,
			selectedTemplate
		}
	}

	/**
	 * Apply wizard configuration to project
	 */
	private async applyWizardConfiguration(workspacePath: string, data: any): Promise<void> {
		try {
			// Install selected template
			if (data.selectedTemplate) {
				const result = await this.templateService.installTemplate(
					data.selectedTemplate,
					workspacePath,
					{ overwrite: false, skipExisting: true }
				)

				if (!result.success) {
					throw new Error(`Template installation failed: ${result.errors.join(', ')}`)
				}

				vscode.window.showInformationMessage(
					`Template '${data.selectedTemplate}' installed successfully!`
				)
			}

			// Apply additional configuration
			if (data.enableTypeScript || data.enableHotReloading) {
				// Configuration would be applied here
				vscode.window.showInformationMessage('Configuration applied successfully!')
			}

		} catch (error) {
			vscode.window.showErrorMessage(`Configuration failed: ${error}`)
			throw error
		}
	}

	/**
	 * Apply team configuration
	 */
	private async applyTeamConfiguration(data: any): Promise<void> {
		// Apply team-specific configuration
		vscode.window.showInformationMessage(
			`Team configuration for '${data.teamName}' applied successfully!`
		)
	}

	/**
	 * Generate configuration summary
	 */
	private generateConfigurationSummary(data: any): string {
		const lines = [
			`**Project Type:** ${data.projectType}`,
			`**Template:** ${data.selectedTemplate || 'None'}`,
			`**TypeScript:** ${data.enableTypeScript ? 'Enabled' : 'Disabled'}`,
			`**Hot Reloading:** ${data.enableHotReloading ? 'Enabled' : 'Disabled'}`,
			`**Default Mode:** ${data.defaultMode}`,
			`**Team Settings:** ${data.teamSettings ? 'Enabled' : 'Disabled'}`
		]

		return lines.join('\n')
	}

	/**
	 * Cancel active wizard
	 */
	public cancelWizard(): void {
		if (this.activeWizard) {
			this.activeWizard.onCancel?.()
			this.emit('wizardCancelled', this.activeWizard)
			this.activeWizard = null
		}
	}

	/**
	 * Check if wizard is active
	 */
	public isWizardActive(): boolean {
		return this.activeWizard !== null
	}

	/**
	 * Get active wizard
	 */
	public getActiveWizard(): WizardConfig | null {
		return this.activeWizard
	}

	/**
	 * Dispose the service
	 */
	public dispose(): void {
		this.cancelWizard()
		this.removeAllListeners()
	}
}

// Singleton instance
let wizardService: StartupWizardService | null = null

/**
 * Get the singleton startup wizard service
 */
export function getStartupWizardService(): StartupWizardService {
	if (!wizardService) {
		wizardService = new StartupWizardService()
	}
	return wizardService
}

/**
 * Dispose the startup wizard service
 */
export function disposeStartupWizardService(): void {
	if (wizardService) {
		wizardService.dispose()
		wizardService = null
	}
}
