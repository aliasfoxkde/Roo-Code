import * as vscode from "vscode"
// @ts-ignore
import { HttpsProxyAgent } from "https-proxy-agent"
// @ts-ignore
import { SocksProxyAgent } from "socks-proxy-agent"
import { ProviderSettings } from "@roo-code/types"

export interface ProxySettings {
	proxyEnabled?: boolean
	proxyUrl?: string
	proxyAuth?: {
		username?: string
		password?: string
	}
	proxyBypassLocal?: boolean
}

export interface VpnSettings {
	vpnEnabled?: boolean
	vpnServer?: string
	vpnUsername?: string
	vpnPassword?: string
	vpnCertificatePath?: string
	vpnBypassLocal?: boolean
}

export class ProxyManager {
	private static instance: ProxyManager

	private constructor() {}

	public static getInstance(): ProxyManager {
		if (!ProxyManager.instance) {
			ProxyManager.instance = new ProxyManager()
		}
		return ProxyManager.instance
	}

	/**
	 * Get proxy settings from either provider settings or global VSCode configuration
	 */
	public getProxySettings(providerSettings?: ProviderSettings): ProxySettings {
		// First check provider-specific settings
		if (providerSettings) {
			if (
				providerSettings.proxyEnabled !== undefined ||
				providerSettings.proxyUrl ||
				providerSettings.proxyAuth ||
				providerSettings.proxyBypassLocal !== undefined
			) {
				return {
					proxyEnabled: providerSettings.proxyEnabled,
					proxyUrl: providerSettings.proxyUrl,
					proxyAuth: providerSettings.proxyAuth,
					proxyBypassLocal: providerSettings.proxyBypassLocal,
				}
			}
		}

		// Fall back to global VSCode configuration
		const config = vscode.workspace.getConfiguration("hivemind.proxy")
		return {
			proxyEnabled: config.get<boolean>("enabled", false),
			proxyUrl: config.get<string>("url", ""),
			proxyAuth: {
				username: config.get<string>("auth.username", ""),
				password: config.get<string>("auth.password", ""),
			},
			proxyBypassLocal: config.get<boolean>("bypassForLocal", true),
		}
	}

	/**
	 * Get VPN settings from provider settings
	 */
	public getVpnSettings(providerSettings?: ProviderSettings): VpnSettings {
		// Check provider-specific VPN settings
		if (providerSettings) {
			if (
				providerSettings.vpnEnabled !== undefined ||
				providerSettings.vpnServer ||
				providerSettings.vpnUsername ||
				providerSettings.vpnPassword ||
				providerSettings.vpnCertificatePath ||
				providerSettings.vpnBypassLocal !== undefined
			) {
				return {
					vpnEnabled: providerSettings.vpnEnabled,
					vpnServer: providerSettings.vpnServer,
					vpnUsername: providerSettings.vpnUsername,
					vpnPassword: providerSettings.vpnPassword,
					vpnCertificatePath: providerSettings.vpnCertificatePath,
					vpnBypassLocal: providerSettings.vpnBypassLocal,
				}
			}
		}

		// No global VPN configuration support yet
		return {
			vpnEnabled: false,
		}
	}

	/**
	 * Get the appropriate proxy agent for a given URL
	 */
	public getProxyAgent(targetUrl: string, providerSettings?: ProviderSettings): any {
		const settings = this.getProxySettings(providerSettings)

		// Check if proxy is enabled
		if (!settings.proxyEnabled || !settings.proxyUrl) {
			return null
		}

		// Check if we should bypass proxy for local addresses
		if (settings.proxyBypassLocal && this.isLocalAddress(targetUrl)) {
			return null
		}

		// Construct proxy URL with auth if provided
		let proxyUrl = settings.proxyUrl
		if (settings.proxyAuth?.username) {
			const username = encodeURIComponent(settings.proxyAuth.username)
			const password = settings.proxyAuth.password ? encodeURIComponent(settings.proxyAuth.password) : ""
			proxyUrl = `${proxyUrl.startsWith("http") ? "" : "http://"}${username}${password ? `:${password}` : ""}@${proxyUrl.replace(/^https?:\/\//, "")}`
		} else if (!proxyUrl.startsWith("http") && !proxyUrl.startsWith("socks")) {
			proxyUrl = `http://${proxyUrl}`
		}

		// Return appropriate agent based on proxy type
		if (proxyUrl.startsWith("socks")) {
			return new SocksProxyAgent(proxyUrl)
		} else {
			return new HttpsProxyAgent(proxyUrl)
		}
	}

	/**
	 * Check if a URL is a local address that should bypass the proxy
	 */
	private isLocalAddress(url: string): boolean {
		try {
			const parsed = new URL(url)
			const hostname = parsed.hostname.toLowerCase()
			return (
				hostname === "localhost" ||
				hostname === "127.0.0.1" ||
				hostname === "[::1]" ||
				hostname.startsWith("192.168.") ||
				hostname.startsWith("10.") ||
				(hostname.startsWith("172.") &&
					parseInt(hostname.split(".")[1]) >= 16 &&
					parseInt(hostname.split(".")[1]) <= 31)
			)
		} catch {
			return false
		}
	}
}