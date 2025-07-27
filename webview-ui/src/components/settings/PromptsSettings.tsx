import React, { useState, useEffect } from "react"
import { VSCodeTextArea } from "@vscode/webview-ui-toolkit/react"

import { supportPrompt, SupportPromptType } from "@roo/support-prompt"

import { vscode } from "@src/utils/vscode"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { useExtensionState } from "@src/context/ExtensionStateContext"
import {
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StandardTooltip,
} from "@src/components/ui"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"
import { MessageSquare } from "lucide-react"

interface PromptsSettingsProps {
	customSupportPrompts: Record<string, string | undefined>
	setCustomSupportPrompts: (prompts: Record<string, string | undefined>) => void
	promptBatchingEnabled?: boolean
	setPromptBatchingEnabled: (enabled: boolean) => void
	promptBatchSize?: number
	setPromptBatchSize: (size: number) => void
	promptBatchDelay?: number
	setPromptBatchDelay: (delay: number) => void
	promptMaxQueueSize?: number
	setPromptMaxQueueSize: (size: number) => void
	eventTriggersEnabled?: boolean
	setEventTriggersEnabled: (enabled: boolean) => void
	eventTriggers?: Array<{ eventName: string; triggerPrompt: string; enabled?: boolean }>
	setEventTriggers: (triggers: Array<{ eventName: string; triggerPrompt: string; enabled?: boolean }>) => void
}

const PromptsSettings = ({
	customSupportPrompts,
	setCustomSupportPrompts,
	promptBatchingEnabled,
	setPromptBatchingEnabled,
	promptBatchSize,
	setPromptBatchSize,
	promptBatchDelay,
	setPromptBatchDelay,
	promptMaxQueueSize,
	setPromptMaxQueueSize,
	eventTriggersEnabled,
	setEventTriggersEnabled,
	eventTriggers,
	setEventTriggers,
}: PromptsSettingsProps) => {
	const { t } = useAppTranslation()
	const {
		listApiConfigMeta,
		enhancementApiConfigId,
		setEnhancementApiConfigId,
		condensingApiConfigId,
		setCondensingApiConfigId,
		customCondensingPrompt,
		setCustomCondensingPrompt,
	} = useExtensionState()

	const [testPrompt, setTestPrompt] = useState("")
	const [isEnhancing, setIsEnhancing] = useState(false)
	const [activeSupportOption, setActiveSupportOption] = useState<SupportPromptType>("ENHANCE")

	useEffect(() => {
		const handler = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "enhancedPrompt") {
				if (message.text) {
					setTestPrompt(message.text)
				}
				setIsEnhancing(false)
			}
		}

		window.addEventListener("message", handler)
		return () => window.removeEventListener("message", handler)
	}, [])

	const updateSupportPrompt = (type: SupportPromptType, value: string | undefined) => {
		if (type === "CONDENSE") {
			setCustomCondensingPrompt(value || supportPrompt.default.CONDENSE)
			vscode.postMessage({
				type: "updateCondensingPrompt",
				text: value || supportPrompt.default.CONDENSE,
			})
		} else {
			const updatedPrompts = { ...customSupportPrompts, [type]: value }
			setCustomSupportPrompts(updatedPrompts)
		}
	}

	const handleSupportReset = (type: SupportPromptType) => {
		if (type === "CONDENSE") {
			setCustomCondensingPrompt(supportPrompt.default.CONDENSE)
			vscode.postMessage({
				type: "updateCondensingPrompt",
				text: supportPrompt.default.CONDENSE,
			})
		} else {
			const updatedPrompts = { ...customSupportPrompts }
			delete updatedPrompts[type]
			setCustomSupportPrompts(updatedPrompts)
		}
	}

	const getSupportPromptValue = (type: SupportPromptType): string => {
		if (type === "CONDENSE") {
			return customCondensingPrompt || supportPrompt.default.CONDENSE
		}
		return supportPrompt.get(customSupportPrompts, type)
	}

	const handleTestEnhancement = () => {
		if (!testPrompt.trim()) return

		setIsEnhancing(true)
		vscode.postMessage({
			type: "enhancePrompt",
			text: testPrompt,
		})
	}

	return (
		<div>
			<SectionHeader description={t("settings:prompts.description")}>
				<div className="flex items-center gap-2">
					<MessageSquare className="w-4" />
					<div>{t("settings:sections.prompts")}</div>
				</div>
			</SectionHeader>

			<Section>
				<div>
					<Select
						value={activeSupportOption}
						onValueChange={(type) => setActiveSupportOption(type as SupportPromptType)}>
						<SelectTrigger className="w-full" data-testid="support-prompt-select-trigger">
							<SelectValue placeholder={t("settings:common.select")} />
						</SelectTrigger>
						<SelectContent>
							{Object.keys(supportPrompt.default).map((type) => (
								<SelectItem key={type} value={type} data-testid={`${type}-option`}>
									{t(`prompts:supportPrompts.types.${type}.label`)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<div className="text-sm text-vscode-descriptionForeground mt-1">
						{t(`prompts:supportPrompts.types.${activeSupportOption}.description`)}
					</div>
				</div>

				<div key={activeSupportOption} className="mt-4">
					<div className="flex justify-between items-center mb-1">
						<label className="block font-medium">{t("prompts:supportPrompts.prompt")}</label>
						<StandardTooltip
							content={t("prompts:supportPrompts.resetPrompt", {
								promptType: activeSupportOption,
							})}>
							<Button variant="ghost" size="icon" onClick={() => handleSupportReset(activeSupportOption)}>
								<span className="codicon codicon-discard"></span>
							</Button>
						</StandardTooltip>
					</div>

					<VSCodeTextArea
						resize="vertical"
						value={getSupportPromptValue(activeSupportOption)}
						onChange={(e) => {
							const value =
								(e as unknown as CustomEvent)?.detail?.target?.value ||
								((e as any).target as HTMLTextAreaElement).value
							const trimmedValue = value.trim()
							updateSupportPrompt(activeSupportOption, trimmedValue || undefined)
						}}
						rows={6}
						className="w-full"
					/>

					{(activeSupportOption === "ENHANCE" || activeSupportOption === "CONDENSE") && (
						<div className="mt-4 flex flex-col gap-3 pl-3 border-l-2 border-vscode-button-background">
							<div>
								<label className="block font-medium mb-1">
									{activeSupportOption === "ENHANCE"
										? t("prompts:supportPrompts.enhance.apiConfiguration")
										: t("prompts:supportPrompts.condense.apiConfiguration")}
								</label>
								<Select
									value={
										activeSupportOption === "ENHANCE"
											? enhancementApiConfigId || "-"
											: condensingApiConfigId || "-"
									}
									onValueChange={(value) => {
										const newConfigId = value === "-" ? "" : value
										if (activeSupportOption === "ENHANCE") {
											setEnhancementApiConfigId(newConfigId)
											vscode.postMessage({
												type: "enhancementApiConfigId",
												text: value,
											})
										} else {
											setCondensingApiConfigId(newConfigId)
											vscode.postMessage({
												type: "condensingApiConfigId",
												text: newConfigId,
											})
										}
									}}>
									<SelectTrigger data-testid="api-config-select" className="w-full">
										<SelectValue
											placeholder={
												activeSupportOption === "ENHANCE"
													? t("prompts:supportPrompts.enhance.useCurrentConfig")
													: t("prompts:supportPrompts.condense.useCurrentConfig")
											}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="-">
											{activeSupportOption === "ENHANCE"
												? t("prompts:supportPrompts.enhance.useCurrentConfig")
												: t("prompts:supportPrompts.condense.useCurrentConfig")}
										</SelectItem>
										{(listApiConfigMeta || []).map((config) => (
											<SelectItem
												key={config.id}
												value={config.id}
												data-testid={`${config.id}-option`}>
												{config.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<div className="text-sm text-vscode-descriptionForeground mt-1">
									{activeSupportOption === "ENHANCE"
										? t("prompts:supportPrompts.enhance.apiConfigDescription")
										: t("prompts:supportPrompts.condense.apiConfigDescription")}
								</div>
							</div>

							{activeSupportOption === "ENHANCE" && (
								<div>
									<label className="block font-medium mb-1">
										{t("prompts:supportPrompts.enhance.testEnhancement")}
									</label>
									<VSCodeTextArea
										resize="vertical"
										value={testPrompt}
										onChange={(e) => setTestPrompt((e.target as HTMLTextAreaElement).value)}
										placeholder={t("prompts:supportPrompts.enhance.testPromptPlaceholder")}
										rows={3}
										className="w-full"
										data-testid="test-prompt-textarea"
									/>
									<div className="mt-2 flex justify-start items-center gap-2">
										<Button
											variant="default"
											onClick={handleTestEnhancement}
											disabled={isEnhancing}>
											{t("prompts:supportPrompts.enhance.previewButton")}
										</Button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</Section>

			{/* Prompt Batching Section */}
			<Section>
				<div className="flex items-center justify-between mb-3">
					<h3 className="font-medium">{t("settings:prompts.batching.title")}</h3>
				</div>
				<div className="text-sm text-vscode-descriptionForeground mb-4">
					{t("settings:prompts.batching.description")}
				</div>
				
				<div className="flex items-center justify-between mb-4">
					<div>
						<label className="block font-medium text-sm">
							{t("settings:prompts.batching.enableBatching")}
						</label>
						<div className="text-xs text-vscode-descriptionForeground mt-1">
							{t("settings:prompts.batching.enableBatchingDescription")}
						</div>
					</div>
					<Button
						variant={promptBatchingEnabled ? "default" : "secondary"}
						size="sm"
						onClick={() => setPromptBatchingEnabled(!promptBatchingEnabled)}>
						{promptBatchingEnabled ? t("common:enabled") : t("common:disabled")}
					</Button>
				</div>
				
				{promptBatchingEnabled && (
					<div className="space-y-4 pl-3 border-l-2 border-vscode-button-background">
						<div>
							<label className="block font-medium text-sm mb-1">
								{t("settings:prompts.batching.batchSize")}
							</label>
							<input
								type="number"
								min="1"
								max="100"
								value={promptBatchSize || 5}
								onChange={(e) => setPromptBatchSize(parseInt(e.target.value) || 5)}
								className="w-full px-3 py-2 border border-vscode-input-border rounded bg-vscode-input-background text-vscode-input-foreground"
							/>
							<div className="text-xs text-vscode-descriptionForeground mt-1">
								{t("settings:prompts.batching.batchSizeDescription")}
							</div>
						</div>
						
						<div>
							<label className="block font-medium text-sm mb-1">
								{t("settings:prompts.batching.batchDelay")}
							</label>
							<input
								type="number"
								min="0"
								max="10000"
								value={promptBatchDelay || 1000}
								onChange={(e) => setPromptBatchDelay(parseInt(e.target.value) || 1000)}
								className="w-full px-3 py-2 border border-vscode-input-border rounded bg-vscode-input-background text-vscode-input-foreground"
							/>
							<div className="text-xs text-vscode-descriptionForeground mt-1">
								{t("settings:prompts.batching.batchDelayDescription")}
							</div>
						</div>
						
						<div>
							<label className="block font-medium text-sm mb-1">
								{t("settings:prompts.batching.maxQueueSize")}
							</label>
							<input
								type="number"
								min="1"
								max="1000"
								value={promptMaxQueueSize || 100}
								onChange={(e) => setPromptMaxQueueSize(parseInt(e.target.value) || 100)}
								className="w-full px-3 py-2 border border-vscode-input-border rounded bg-vscode-input-background text-vscode-input-foreground"
							/>
							<div className="text-xs text-vscode-descriptionForeground mt-1">
								{t("settings:prompts.batching.maxQueueSizeDescription")}
							</div>
						</div>
					</div>
				)}
			</Section>

			{/* Event Triggers Section */}
			<Section>
				<div className="flex items-center justify-between mb-3">
					<h3 className="font-medium">{t("settings:prompts.eventTriggers.title")}</h3>
				</div>
				<div className="text-sm text-vscode-descriptionForeground mb-4">
					{t("settings:prompts.eventTriggers.description")}
				</div>
				
				<div className="flex items-center justify-between mb-4">
					<div>
						<label className="block font-medium text-sm">
							{t("settings:prompts.eventTriggers.enableTriggers")}
						</label>
						<div className="text-xs text-vscode-descriptionForeground mt-1">
							{t("settings:prompts.eventTriggers.enableTriggersDescription")}
						</div>
					</div>
					<Button
						variant={eventTriggersEnabled ? "default" : "secondary"}
						size="sm"
						onClick={() => setEventTriggersEnabled(!eventTriggersEnabled)}>
						{eventTriggersEnabled ? t("common:enabled") : t("common:disabled")}
					</Button>
				</div>
				
				{eventTriggersEnabled && (
					<div className="space-y-4 pl-3 border-l-2 border-vscode-button-background">
						{/* Built-in Event Triggers */}
						<div className="space-y-3">
							{[
								{ key: 'fileSave', label: t("settings:prompts.eventTriggers.triggerEvents.fileSave"), description: t("settings:prompts.eventTriggers.triggerEvents.fileSaveDescription") },
								{ key: 'terminalCommand', label: t("settings:prompts.eventTriggers.triggerEvents.terminalCommand"), description: t("settings:prompts.eventTriggers.triggerEvents.terminalCommandDescription") },
								{ key: 'gitCommit', label: t("settings:prompts.eventTriggers.triggerEvents.gitCommit"), description: t("settings:prompts.eventTriggers.triggerEvents.gitCommitDescription") },
								{ key: 'codeReview', label: t("settings:prompts.eventTriggers.triggerEvents.codeReview"), description: t("settings:prompts.eventTriggers.triggerEvents.codeReviewDescription") },
								{ key: 'errorDetection', label: t("settings:prompts.eventTriggers.triggerEvents.errorDetection"), description: t("settings:prompts.eventTriggers.triggerEvents.errorDetectionDescription") },
							].map(({ key, label, description }) => (
								<div key={key} className="flex items-start justify-between">
									<div>
										<label className="block font-medium text-sm">
											{label}
										</label>
										<div className="text-xs text-vscode-descriptionForeground mt-1">
											{description}
										</div>
									</div>
									<Button
										variant="secondary"
										size="sm"
										className="mt-1">
										{t("common:configure")}
									</Button>
								</div>
							))}
						</div>
						
						{/* Custom Event Triggers */}
						<div>
							<h4 className="font-medium text-sm mb-2">
								{t("settings:prompts.eventTriggers.customTrigger.label")}
							</h4>
							<div className="text-xs text-vscode-descriptionForeground mb-3">
								{t("settings:prompts.eventTriggers.customTrigger.description")}
							</div>
							
							<div className="space-y-3">
								{(eventTriggers || []).map((trigger, index) => (
									<div key={index} className="flex gap-2">
										<input
											type="text"
											value={trigger.eventName}
											onChange={(e) => {
												const newTriggers = [...(eventTriggers || [])];
												newTriggers[index] = { ...trigger, eventName: e.target.value };
												setEventTriggers(newTriggers);
											}}
											placeholder={t("settings:prompts.eventTriggers.customTrigger.eventNamePlaceholder")}
											className="flex-1 px-2 py-1 text-sm border border-vscode-input-border rounded bg-vscode-input-background text-vscode-input-foreground"
										/>
										<input
											type="text"
											value={trigger.triggerPrompt}
											onChange={(e) => {
												const newTriggers = [...(eventTriggers || [])];
												newTriggers[index] = { ...trigger, triggerPrompt: e.target.value };
												setEventTriggers(newTriggers);
											}}
											placeholder={t("settings:prompts.eventTriggers.customTrigger.triggerPromptPlaceholder")}
											className="flex-1 px-2 py-1 text-sm border border-vscode-input-border rounded bg-vscode-input-background text-vscode-input-foreground"
										/>
										<Button
											variant="secondary"
											size="sm"
											onClick={() => {
												const newTriggers = [...(eventTriggers || [])];
												newTriggers.splice(index, 1);
												setEventTriggers(newTriggers);
											}}>
											<span className="codicon codicon-trash"></span>
										</Button>
									</div>
								))}
								<Button
									variant="secondary"
									size="sm"
									onClick={() => {
										const newTriggers = [...(eventTriggers || []), { eventName: "", triggerPrompt: "" }];
										setEventTriggers(newTriggers);
									}}>
									<span className="codicon codicon-add"></span>
									{t("settings:prompts.eventTriggers.customTrigger.addTrigger")}
								</Button>
							</div>
						</div>
					</div>
				)}
			</Section>
		</div>
	)
}

export default PromptsSettings
