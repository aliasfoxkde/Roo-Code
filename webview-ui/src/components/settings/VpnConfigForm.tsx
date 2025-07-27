import { useState, useCallback } from "react"
import { VSCodeTextField, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { type ProviderSettings } from "@roo-code/types"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { StandardTooltip } from "@src/components/ui"

interface VpnConfigFormProps {
	settings: ProviderSettings
	onChange: (settings: Partial<ProviderSettings>) => void
	showAdvanced?: boolean
}

export const VpnConfigForm = ({ settings, onChange, showAdvanced = false }: VpnConfigFormProps) => {
	const { t } = useAppTranslation()
	
	const [showAuth, setShowAuth] = useState(!!(settings.vpnUsername || settings.vpnPassword))

	const handleInputChange = useCallback(
		(field: string, value: any) => {
			onChange({ [field]: value })
		},
		[onChange],
	)

	const handleAuthChange = useCallback(
		(field: "vpnUsername" | "vpnPassword", value: string) => {
			onChange({
				[field]: value,
			})
		},
		[onChange],
	)

	const toggleAuthFields = useCallback(() => {
		const newShowAuth = !showAuth
		setShowAuth(newShowAuth)
		
		// Clear auth fields when hiding
		if (!newShowAuth) {
			onChange({
				vpnUsername: "",
				vpnPassword: "",
			})
		}
	}, [showAuth, onChange])

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<VSCodeCheckbox
					checked={settings.vpnEnabled ?? false}
					onChange={(e: any) => handleInputChange("vpnEnabled", e.target.checked)}>
					{t("settings:vpn.enableVpn")}
				</VSCodeCheckbox>
			</div>

			{settings.vpnEnabled && (
				<>
					<div>
						<VSCodeTextField
							value={settings.vpnServer || ""}
							onInput={(e: any) => handleInputChange("vpnServer", e.target.value)}
							placeholder={t("settings:vpn.serverPlaceholder")}
							className="w-full">
							<label className="block font-medium mb-1">{t("settings:vpn.server")}</label>
						</VSCodeTextField>
						<div className="text-sm text-vscode-descriptionForeground mt-1">
							{t("settings:vpn.serverDescription")}
						</div>
					</div>

					<div className="flex items-center gap-2">
						<VSCodeCheckbox
							checked={showAuth}
							onChange={toggleAuthFields}>
							{t("settings:proxy.enableAuthentication")}
						</VSCodeCheckbox>
					</div>

					{showAuth && (
						<div className="grid grid-cols-2 gap-3">
							<VSCodeTextField
								value={settings.vpnUsername || ""}
								onInput={(e: any) => handleAuthChange("vpnUsername", e.target.value)}
								placeholder={t("settings:vpn.usernamePlaceholder")}
								className="w-full">
								<label className="block font-medium mb-1">{t("settings:vpn.username")}</label>
							</VSCodeTextField>
							<VSCodeTextField
								value={settings.vpnPassword || ""}
								onInput={(e: any) => handleAuthChange("vpnPassword", e.target.value)}
								placeholder={t("settings:vpn.passwordPlaceholder")}
								type="password"
								className="w-full">
								<label className="block font-medium mb-1">{t("settings:vpn.password")}</label>
							</VSCodeTextField>
						</div>
					)}

					<div>
						<VSCodeTextField
							value={settings.vpnCertificatePath || ""}
							onInput={(e: any) => handleInputChange("vpnCertificatePath", e.target.value)}
							placeholder={t("settings:vpn.certificatePathPlaceholder")}
							className="w-full">
							<label className="block font-medium mb-1">{t("settings:vpn.certificatePath")}</label>
						</VSCodeTextField>
						<div className="text-sm text-vscode-descriptionForeground mt-1">
							{t("settings:vpn.certificatePathDescription")}
						</div>
					</div>

					{showAdvanced && (
						<div className="flex items-center gap-2">
							<VSCodeCheckbox
								checked={settings.vpnBypassLocal ?? false}
								onChange={(e: any) => handleInputChange("vpnBypassLocal", e.target.checked)}>
								{t("settings:vpn.bypassLocal")}
							</VSCodeCheckbox>
							<StandardTooltip content={t("settings:vpn.bypassLocalDescription")}>
								<i className="codicon codicon-info text-vscode-descriptionForeground" />
							</StandardTooltip>
						</div>
					)}
				</>
			)}
		</div>
	)
}