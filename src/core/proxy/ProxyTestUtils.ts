import { ProxyManager } from "./ProxyManager"
import { ProviderSettings } from "@roo-code/types"
import axios from "axios"

/**
 * Utility functions for testing proxy connectivity
 */
export class ProxyTestUtils {
	private static proxyManager = ProxyManager.getInstance()

	/**
	 * Test proxy connectivity for a given URL and provider settings
	 * @param url The URL to test connectivity to
	 * @param providerSettings Optional provider-specific settings that may contain proxy configuration
	 * @returns Promise resolving to true if connectivity is successful, false otherwise
	 */
	public static async testProxyConnectivity(url: string, providerSettings?: ProviderSettings): Promise<boolean> {
		try {
			// Get proxy agent for the URL
			const agent = this.proxyManager.getProxyAgent(url, providerSettings)
			
			// If no proxy agent is configured, test direct connectivity
			if (!agent) {
				const response = await axios.head(url, {
					timeout: 5000,
					validateStatus: () => true // Accept any status code for testing
				})
				return response.status > 0
			}
			
			// Test connectivity through proxy
			const response = await axios.head(url, {
				httpsAgent: url.startsWith("https://") ? agent : undefined,
				httpAgent: url.startsWith("http://") ? agent : undefined,
				timeout: 5000,
				validateStatus: () => true // Accept any status code for testing
			})
			
			// Consider successful if we get any response (even 4xx/5xx)
			return response.status > 0
		} catch (error) {
			console.error(`Proxy connectivity test failed for ${url}:`, error)
			return false
		}
	}

	/**
	 * Test multiple URLs for proxy connectivity
	 * @param urls Array of URLs to test connectivity to
	 * @param providerSettings Optional provider-specific settings that may contain proxy configuration
	 * @returns Promise resolving to an array of results for each URL
	 */
	public static async testMultipleProxyConnectivity(
		urls: string[],
		providerSettings?: ProviderSettings
	): Promise<{ url: string; success: boolean }[]> {
		const results = await Promise.all(
			urls.map(async (url) => {
				const success = await this.testProxyConnectivity(url, providerSettings)
				return { url, success }
			})
		)
		return results
	}

	/**
	 * Get detailed information about proxy configuration for a given URL
	 * @param url The URL to check proxy configuration for
	 * @param providerSettings Optional provider-specific settings that may contain proxy configuration
	 * @returns Object containing proxy configuration details
	 */
	public static getProxyConfigurationInfo(url: string, providerSettings?: ProviderSettings): {
		hasProxy: boolean
		proxyUrl?: string
		isBypassed: boolean
		agentType?: string
	} {
		const settings = this.proxyManager.getProxySettings(providerSettings)
		const agent = this.proxyManager.getProxyAgent(url, providerSettings)
		
		return {
			hasProxy: !!agent,
			proxyUrl: settings?.proxyUrl,
			isBypassed: settings?.proxyBypassLocal ? this.proxyManager["isLocalAddress"](url) : false,
			agentType: agent ? (agent.constructor.name) : undefined
		}
	}
}