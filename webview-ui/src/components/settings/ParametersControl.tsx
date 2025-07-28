import { VSCodeCheckbox, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { useDebounce } from "react-use"

import { Slider } from "@/components/ui"

interface ParametersControlProps {
	value: {
		temperature?: number | null
		topP?: number | null
		frequencyPenalty?: number | null
		presencePenalty?: number | null
		maxTokens?: number | null
	}
	onChange: (value: {
		temperature?: number | null
		topP?: number | null
		frequencyPenalty?: number | null
		presencePenalty?: number | null
		maxTokens?: number | null
	}) => void
	maxTemperature?: number // Some providers like OpenAI use 0-2 range.
}

export const ParametersControl = ({ value, onChange, maxTemperature = 1 }: ParametersControlProps) => {
	const { t } = useAppTranslation()
	const [isCustomParameters, setIsCustomParameters] = useState(
		value.temperature !== undefined ||
		value.topP !== undefined ||
		value.frequencyPenalty !== undefined ||
		value.presencePenalty !== undefined ||
		value.maxTokens !== undefined
	)
	const [inputValues, setInputValues] = useState(value)

	useDebounce(() => {
		if (isCustomParameters) {
			onChange(inputValues)
		} else {
			onChange({
				temperature: null,
				topP: null,
				frequencyPenalty: null,
				presencePenalty: null,
				maxTokens: null
			})
		}
	}, 50, [onChange, inputValues, isCustomParameters])

	// Sync internal state with prop changes when switching profiles.
	useEffect(() => {
		const hasCustomParameters = 
			value.temperature !== undefined ||
			value.topP !== undefined ||
			value.frequencyPenalty !== undefined ||
			value.presencePenalty !== undefined ||
			value.maxTokens !== undefined
		setIsCustomParameters(hasCustomParameters)
		setInputValues(value)
	}, [value])

	const handleParameterChange = (field: keyof typeof inputValues, newValue: number | null) => {
		setInputValues(prev => ({
			...prev,
			[field]: newValue
		}))
	}

	const handleNumberInputChange = (field: keyof typeof inputValues, value: string) => {
		const numValue = value === '' ? null : Number(value)
		if (numValue === null || !isNaN(numValue)) {
			handleParameterChange(field, numValue)
		}
	}

	return (
		<>
			<div>
				<VSCodeCheckbox
					checked={isCustomParameters}
					onChange={(e: any) => {
						const isChecked = e.target.checked
						setIsCustomParameters(isChecked)

						if (!isChecked) {
							setInputValues({
								temperature: null,
								topP: null,
								frequencyPenalty: null,
								presencePenalty: null,
								maxTokens: null
							})
						} else {
							setInputValues(value)
						}
					}}>
					<label className="block font-medium mb-1">{t("settings:temperature.useCustom")}</label>
				</VSCodeCheckbox>
				<div className="text-sm text-vscode-descriptionForeground mt-1">
					{t("settings:temperature.description")}
				</div>
			</div>

			{isCustomParameters && (
				<div className="flex flex-col gap-4 pl-3 border-l-2 border-vscode-button-background">
					{/* Temperature */}
					<div>
						<label className="block font-medium mb-2">Temperature</label>
						<div className="flex items-center gap-2">
							<Slider
								min={0}
								max={maxTemperature}
								step={0.01}
								value={[inputValues.temperature ?? 0]}
								onValueChange={([value]) => handleParameterChange('temperature', value)}
							/>
							<VSCodeTextField
								value={inputValues.temperature?.toString() ?? ''}
								onInput={(e: any) => handleNumberInputChange('temperature', e.target.value)}
								className="w-20"
							/>
						</div>
						<div className="text-vscode-descriptionForeground text-sm mt-1">
							{t("settings:temperature.rangeDescription")}
						</div>
					</div>

					{/* Top P */}
					<div>
						<label className="block font-medium mb-2">Top P</label>
						<div className="flex items-center gap-2">
							<Slider
								min={0}
								max={1}
								step={0.01}
								value={[inputValues.topP ?? 0]}
								onValueChange={([value]) => handleParameterChange('topP', value)}
							/>
							<VSCodeTextField
								value={inputValues.topP?.toString() ?? ''}
								onInput={(e: any) => handleNumberInputChange('topP', e.target.value)}
								className="w-20"
							/>
						</div>
						<div className="text-vscode-descriptionForeground text-sm mt-1">
							Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.
						</div>
					</div>

					{/* Frequency Penalty */}
					<div>
						<label className="block font-medium mb-2">Frequency Penalty</label>
						<div className="flex items-center gap-2">
							<Slider
								min={-2}
								max={2}
								step={0.01}
								value={[inputValues.frequencyPenalty ?? 0]}
								onValueChange={([value]) => handleParameterChange('frequencyPenalty', value)}
							/>
							<VSCodeTextField
								value={inputValues.frequencyPenalty?.toString() ?? ''}
								onInput={(e: any) => handleNumberInputChange('frequencyPenalty', e.target.value)}
								className="w-20"
							/>
						</div>
						<div className="text-vscode-descriptionForeground text-sm mt-1">
							Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
						</div>
					</div>

					{/* Presence Penalty */}
					<div>
						<label className="block font-medium mb-2">Presence Penalty</label>
						<div className="flex items-center gap-2">
							<Slider
								min={-2}
								max={2}
								step={0.01}
								value={[inputValues.presencePenalty ?? 0]}
								onValueChange={([value]) => handleParameterChange('presencePenalty', value)}
							/>
							<VSCodeTextField
								value={inputValues.presencePenalty?.toString() ?? ''}
								onInput={(e: any) => handleNumberInputChange('presencePenalty', e.target.value)}
								className="w-20"
							/>
						</div>
						<div className="text-vscode-descriptionForeground text-sm mt-1">
							Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
						</div>
					</div>

					{/* Max Tokens */}
					<div>
						<label className="block font-medium mb-2">Max Tokens</label>
						<div className="flex items-center gap-2">
							<VSCodeTextField
								value={inputValues.maxTokens?.toString() ?? ''}
								onInput={(e: any) => handleNumberInputChange('maxTokens', e.target.value)}
								className="w-full"
								placeholder="Enter maximum number of tokens"
							/>
						</div>
						<div className="text-vscode-descriptionForeground text-sm mt-1">
							The maximum number of tokens to generate in the chat completion.
						</div>
					</div>
				</div>
			)}
		</>
	)
}