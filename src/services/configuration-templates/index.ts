import * as path from "path"
import * as fs from "fs/promises"
import { EventEmitter } from "events"

/**
 * Configuration template for different development stacks
 */
export interface ConfigurationTemplate {
	id: string
	name: string
	description: string
	category: string
	tags: string[]
	files: TemplateFile[]
	dependencies?: string[]
	postInstallInstructions?: string
}

/**
 * Template file definition
 */
export interface TemplateFile {
	path: string
	content: string
	description: string
	overwrite?: boolean
}

/**
 * Template installation result
 */
export interface TemplateInstallResult {
	success: boolean
	installedFiles: string[]
	skippedFiles: string[]
	errors: string[]
	instructions?: string
}

/**
 * Configuration template service for providing pre-built configurations
 */
export class ConfigurationTemplateService extends EventEmitter {
	private templates: Map<string, ConfigurationTemplate> = new Map()

	constructor() {
		super()
		this.initializeBuiltInTemplates()
	}

	/**
	 * Get all available templates
	 */
	public getTemplates(): ConfigurationTemplate[] {
		return Array.from(this.templates.values())
	}

	/**
	 * Get templates by category
	 */
	public getTemplatesByCategory(category: string): ConfigurationTemplate[] {
		return this.getTemplates().filter(template => template.category === category)
	}

	/**
	 * Get template by ID
	 */
	public getTemplate(id: string): ConfigurationTemplate | undefined {
		return this.templates.get(id)
	}

	/**
	 * Install a template to a project directory
	 */
	public async installTemplate(templateId: string, projectPath: string, options: {
		overwrite?: boolean
		skipExisting?: boolean
	} = {}): Promise<TemplateInstallResult> {
		const template = this.templates.get(templateId)
		if (!template) {
			return {
				success: false,
				installedFiles: [],
				skippedFiles: [],
				errors: [`Template '${templateId}' not found`]
			}
		}

		const result: TemplateInstallResult = {
			success: true,
			installedFiles: [],
			skippedFiles: [],
			errors: []
		}

		try {
			// Ensure .roo directory exists
			const rooDir = path.join(projectPath, '.roo')
			await fs.mkdir(rooDir, { recursive: true })

			// Install each file
			for (const file of template.files) {
				const filePath = path.join(rooDir, file.path)
				const fileDir = path.dirname(filePath)

				try {
					// Create directory if it doesn't exist
					await fs.mkdir(fileDir, { recursive: true })

					// Check if file exists
					const fileExists = await this.fileExists(filePath)
					
					if (fileExists && !options.overwrite && !file.overwrite) {
						if (options.skipExisting) {
							result.skippedFiles.push(file.path)
							continue
						} else {
							result.errors.push(`File ${file.path} already exists`)
							continue
						}
					}

					// Write file
					await fs.writeFile(filePath, file.content, 'utf-8')
					result.installedFiles.push(file.path)

				} catch (error) {
					result.errors.push(`Failed to install ${file.path}: ${error}`)
				}
			}

			// Add post-install instructions
			if (template.postInstallInstructions) {
				result.instructions = template.postInstallInstructions
			}

			// Set success based on whether any files were installed
			result.success = result.installedFiles.length > 0

			this.emit('templateInstalled', { template, projectPath, result })

		} catch (error) {
			result.success = false
			result.errors.push(`Template installation failed: ${error}`)
		}

		return result
	}

	/**
	 * Register a custom template
	 */
	public registerTemplate(template: ConfigurationTemplate): void {
		this.templates.set(template.id, template)
		this.emit('templateRegistered', template)
	}

	/**
	 * Remove a template
	 */
	public removeTemplate(templateId: string): boolean {
		const removed = this.templates.delete(templateId)
		if (removed) {
			this.emit('templateRemoved', templateId)
		}
		return removed
	}

	/**
	 * Check if a file exists
	 */
	private async fileExists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Initialize built-in templates
	 */
	private initializeBuiltInTemplates(): void {
		// React TypeScript Template
		this.templates.set('react-typescript', {
			id: 'react-typescript',
			name: 'React TypeScript',
			description: 'Configuration for React projects with TypeScript',
			category: 'Frontend',
			tags: ['react', 'typescript', 'frontend', 'spa'],
			files: [
				{
					path: 'config/roo.config.json',
					description: 'Main Roo configuration for React TypeScript projects',
					content: JSON.stringify({
						version: "1.0",
						typescript: {
							enabled: true,
							validateOnSave: true,
							compilerOptions: {
								jsx: "react-jsx",
								strict: true,
								noUnusedLocals: true,
								noUnusedParameters: true
							}
						},
						modes: {
							development: {
								testFilePatterns: ["**/*.test.tsx", "**/*.test.ts", "**/*.spec.tsx", "**/*.spec.ts"],
								includePatterns: ["**/*.ts", "**/*.tsx"],
								excludePatterns: ["**/node_modules/**", "**/dist/**", "**/build/**"]
							},
							production: {
								excludePatterns: ["**/*.test.*", "**/*.spec.*", "**/node_modules/**", "**/dist/**", "**/build/**"]
							}
						}
					}, null, 2)
				},
				{
					path: 'rules/react-patterns.md',
					description: 'React development patterns and best practices',
					content: `# React Development Patterns

## Component Structure
- Use functional components with hooks
- Implement proper prop types with TypeScript
- Follow single responsibility principle
- Use composition over inheritance

## State Management
- Use useState for local component state
- Use useReducer for complex state logic
- Consider Context API for shared state
- Implement proper state lifting patterns

## Performance
- Use React.memo for expensive components
- Implement proper dependency arrays in hooks
- Use useMemo and useCallback judiciously
- Avoid inline object/function creation in render

## Testing
- Write unit tests for components
- Use React Testing Library
- Test user interactions, not implementation details
- Aim for high test coverage on critical paths`
				},
				{
					path: 'rules/typescript-react.md',
					description: 'TypeScript specific rules for React',
					content: `# TypeScript React Rules

## Type Definitions
- Define proper interfaces for props
- Use generic types for reusable components
- Implement proper event handler types
- Define custom hook return types

## Best Practices
- Use strict TypeScript configuration
- Avoid 'any' type usage
- Implement proper error boundaries
- Use type guards for runtime checks

## Component Patterns
\`\`\`typescript
// Proper component typing
interface ButtonProps {
  children: React.ReactNode
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', disabled = false }) => {
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
\`\`\``
				},
				{
					path: 'custom-instructions.md',
					description: 'Custom instructions for React TypeScript development',
					content: `# React TypeScript Project Instructions

## Project Context
This is a React application built with TypeScript, focusing on:
- Modern React patterns with hooks
- Type-safe development with TypeScript
- Component-based architecture
- Responsive design principles

## Development Preferences
- Use functional components over class components
- Implement proper TypeScript interfaces for all props
- Follow React best practices for state management
- Use CSS modules or styled-components for styling
- Implement comprehensive testing with React Testing Library

## Code Style
- Use arrow functions for components
- Implement proper error handling
- Use descriptive variable and function names
- Follow ESLint and Prettier configurations
- Maintain consistent file and folder structure`
				}
			],
			postInstallInstructions: `React TypeScript template installed successfully!

Next steps:
1. Install dependencies: npm install
2. Start development server: npm start
3. Run tests: npm test
4. Review the generated rules in .roo/rules/
5. Customize the configuration in .roo/config/roo.config.json`
		})

		// Node.js API Template
		this.templates.set('nodejs-api', {
			id: 'nodejs-api',
			name: 'Node.js API',
			description: 'Configuration for Node.js REST API projects',
			category: 'Backend',
			tags: ['nodejs', 'api', 'backend', 'rest'],
			files: [
				{
					path: 'config/roo.config.json',
					description: 'Main configuration for Node.js API projects',
					content: JSON.stringify({
						version: "1.0",
						typescript: {
							enabled: true,
							validateOnSave: true,
							compilerOptions: {
								target: "ES2020",
								module: "commonjs",
								strict: true,
								esModuleInterop: true
							}
						},
						modes: {
							development: {
								testFilePatterns: ["**/*.test.ts", "**/*.spec.ts"],
								includePatterns: ["**/*.ts", "**/*.js"],
								excludePatterns: ["**/node_modules/**", "**/dist/**"]
							},
							production: {
								excludePatterns: ["**/*.test.*", "**/*.spec.*", "**/node_modules/**", "**/dist/**"]
							},
							test: {
								includePatterns: ["**/*.test.ts", "**/*.spec.ts", "**/src/**/*.ts"],
								excludePatterns: ["**/node_modules/**", "**/dist/**"]
							}
						}
					}, null, 2)
				},
				{
					path: 'rules/api-design.md',
					description: 'API design principles and patterns',
					content: `# API Design Principles

## RESTful Design
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Implement consistent URL patterns
- Use appropriate HTTP status codes
- Follow REST naming conventions

## Error Handling
- Implement global error handling middleware
- Return consistent error response format
- Log errors appropriately
- Use proper HTTP status codes for errors

## Security
- Implement authentication and authorization
- Validate all input data
- Use HTTPS in production
- Implement rate limiting
- Sanitize user inputs

## Performance
- Implement caching strategies
- Use database indexing
- Implement pagination for large datasets
- Monitor API performance metrics`
				},
				{
					path: 'rules/database-patterns.md',
					description: 'Database design and usage patterns',
					content: `# Database Patterns

## Schema Design
- Use proper normalization
- Implement foreign key constraints
- Design for scalability
- Use appropriate data types

## Query Optimization
- Use indexes effectively
- Avoid N+1 query problems
- Implement query caching
- Monitor slow queries

## Migrations
- Use version-controlled migrations
- Make migrations reversible
- Test migrations thoroughly
- Document schema changes

## ORM Best Practices
- Use proper model relationships
- Implement data validation
- Use transactions for complex operations
- Handle connection pooling`
				}
			],
			postInstallInstructions: `Node.js API template installed successfully!

Next steps:
1. Install dependencies: npm install
2. Set up environment variables
3. Configure database connection
4. Start development server: npm run dev
5. Review API design rules in .roo/rules/`
		})

		// Python FastAPI Template
		this.templates.set('python-fastapi', {
			id: 'python-fastapi',
			name: 'Python FastAPI',
			description: 'Configuration for Python FastAPI projects',
			category: 'Backend',
			tags: ['python', 'fastapi', 'api', 'backend'],
			files: [
				{
					path: 'config/roo.config.json',
					description: 'Configuration for Python FastAPI projects',
					content: JSON.stringify({
						version: "1.0",
						typescript: {
							enabled: false
						},
						modes: {
							development: {
								testFilePatterns: ["**/test_*.py", "**/*_test.py"],
								includePatterns: ["**/*.py"],
								excludePatterns: ["**/venv/**", "**/__pycache__/**", "**/dist/**"]
							},
							production: {
								excludePatterns: ["**/test_*.py", "**/*_test.py", "**/venv/**", "**/__pycache__/**", "**/dist/**"]
							}
						}
					}, null, 2)
				},
				{
					path: 'rules/python-fastapi.md',
					description: 'FastAPI development best practices',
					content: `# FastAPI Development Best Practices

## Project Structure
- Organize code into logical modules
- Use dependency injection
- Implement proper error handling
- Follow PEP 8 style guidelines

## API Design
- Use Pydantic models for request/response
- Implement proper validation
- Use type hints throughout
- Document APIs with OpenAPI

## Testing
- Write comprehensive unit tests
- Use pytest for testing framework
- Implement integration tests
- Test API endpoints thoroughly

## Performance
- Use async/await for I/O operations
- Implement proper database connection pooling
- Use caching where appropriate
- Monitor application performance`
				}
			]
		})

		// Vue.js Template
		this.templates.set('vue-typescript', {
			id: 'vue-typescript',
			name: 'Vue.js TypeScript',
			description: 'Configuration for Vue.js projects with TypeScript',
			category: 'Frontend',
			tags: ['vue', 'typescript', 'frontend', 'spa'],
			files: [
				{
					path: 'config/roo.config.json',
					description: 'Vue.js TypeScript configuration',
					content: JSON.stringify({
						version: "1.0",
						typescript: {
							enabled: true,
							validateOnSave: true,
							compilerOptions: {
								strict: true,
								jsx: "preserve"
							}
						},
						modes: {
							development: {
								testFilePatterns: ["**/*.spec.ts", "**/*.test.ts"],
								includePatterns: ["**/*.ts", "**/*.vue"],
								excludePatterns: ["**/node_modules/**", "**/dist/**"]
							}
						}
					}, null, 2)
				},
				{
					path: 'rules/vue-patterns.md',
					description: 'Vue.js development patterns',
					content: `# Vue.js Development Patterns

## Component Composition
- Use Composition API for complex logic
- Implement proper component lifecycle
- Use props and emits correctly
- Follow single file component structure

## State Management
- Use Pinia for state management
- Implement proper store patterns
- Use composables for reusable logic
- Handle async operations properly

## Performance
- Use v-memo for expensive renders
- Implement proper key usage in v-for
- Use computed properties for derived state
- Implement lazy loading for routes`
				}
			]
		})
	}
}

// Singleton instance
let templateService: ConfigurationTemplateService | null = null

/**
 * Get the singleton configuration template service
 */
export function getConfigurationTemplateService(): ConfigurationTemplateService {
	if (!templateService) {
		templateService = new ConfigurationTemplateService()
	}
	return templateService
}

/**
 * Dispose the configuration template service
 */
export function disposeConfigurationTemplateService(): void {
	if (templateService) {
		templateService.removeAllListeners()
		templateService = null
	}
}
