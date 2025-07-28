import { useState, useCallback } from "react"
import { VSCodeTextField, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { type ProviderSettings } from "@roo-code/types"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { StandardTooltip } from "@src/components/ui"

interface ProxyConfigFormProps {
	settings: ProviderSettings
	onChange: (settings: Partial<ProviderSettings>) => void
	showAdvanced?: boolean
}

export const ProxyConfigForm = ({ settings, onChange, showAdvanced = false }: ProxyConfigFormProps) => {
	const { t } = useAppTranslation()
	
	const [showAuth, setShowAuth] = useState(!!(settings.proxyAuth?.username || settings.proxyAuth?.password))

	const handleInputChange = useCallback(
		(field: string, value: any) => {
			onChange({ [field]: value })
		},
		[onChange],
	)

	const handleAuthChange = useCallback(
		(field: "username" | "password", value: string) => {
			onChange({
				proxyAuth: {
					...(settings.proxyAuth || {}),
					[field]: value,
				},
			})
		},
		[onChange, settings.proxyAuth],
	)

	const toggleAuthFields = useCallback(() => {
		const newShowAuth = !showAuth
		setShowAuth(newShowAuth)
		
		// Clear auth fields when hiding
		if (!newShowAuth) {
			onChange({
				proxyAuth: {
					...(settings.proxyAuth || {}),
					username: "",
					password: "",
				},
			})
		}
	}, [showAuth, onChange, settings.proxyAuth])

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<VSCodeCheckbox
					checked={settings.proxyRoutingEnabled ?? false}
					onChange={(e: any) => handleInputChange("proxyRoutingEnabled", e.target.checked)}>
					{t("settings:proxy.enableProxy")}
				</VSCodeCheckbox>
			</div>

			{settings.proxyRoutingEnabled && (
				<div className="border border-vscode-settings-dropdownBorder rounded-md p-3 ml-6">
					<div>
						<VSCodeTextField
							value={settings.proxyUrl || ""}
							onInput={(e: any) => handleInputChange("proxyUrl", e.target.value)}
							placeholder={t("settings:proxy.urlPlaceholder")}
							className="w-full">
							<label className="block font-medium mb-1">{t("settings:proxy.url")}</label>
						</VSCodeTextField>
						<div className="text-sm text-vscode-descriptionForeground mt-1">
							{t("settings:proxy.urlDescription")}
						</div>
					</div>

					<div className="ml-4 mt-3">
						<div className="flex items-center gap-2">
							<VSCodeCheckbox
								checked={showAuth}
								onChange={toggleAuthFields}>
								{t("settings:proxy.enableAuthentication")}
							</VSCodeCheckbox>
						</div>

						{showAuth && (
							<div className="grid grid-cols-2 gap-3 mt-2 ml-6">
								<VSCodeTextField
									value={settings.proxyAuth?.username || ""}
									onInput={(e: any) => handleAuthChange("username", e.target.value)}
									placeholder={t("settings:proxy.usernamePlaceholder")}
									className="w-full">
									<label className="block font-medium mb-1">{t("settings:proxy.username")}</label>
								</VSCodeTextField>
								<VSCodeTextField
									value={settings.proxyAuth?.password || ""}
									onInput={(e: any) => handleAuthChange("password", e.target.value)}
									placeholder={t("settings:proxy.passwordPlaceholder")}
									type="password"
									className="w-full">
									<label className="block font-medium mb-1">{t("settings:proxy.password")}</label>
								</VSCodeTextField>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2 mt-3">
						<VSCodeCheckbox
							checked={settings.proxyBypassLocal ?? false}
							onChange={(e: any) => handleInputChange("proxyBypassLocal", e.target.checked)}>
							{t("settings:proxy.bypassLocal")}
						</VSCodeCheckbox>
						<StandardTooltip content={t("settings:proxy.bypassLocalDescription")}>
							<i className="codicon codicon-info text-vscode-descriptionForeground" />
						</StandardTooltip>
					</div>
				</div>
			)}
		</div>
	)
}