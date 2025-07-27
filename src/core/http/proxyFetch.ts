import { ProxyManager } from "../proxy/ProxyManager"
import { ProviderSettings } from "@roo-code/types"

/**
 * Creates a custom fetch function that supports proxy configuration
 * @param providerSettings Optional provider-specific settings
 * @returns A fetch function that respects proxy settings
 */
export function createProxyFetch(providerSettings?: ProviderSettings): typeof fetch {
	const proxyManager = ProxyManager.getInstance()

	return async function proxyFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		// Convert input to URL string for proxy agent lookup
		const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url

		// Get proxy agent for this URL
		const agent = proxyManager.getProxyAgent(url, providerSettings)

		// If no proxy agent, use default fetch
		if (!agent) {
			return fetch(input, init)
		}

		// Add the agent to the request options
		const fetchInit = {
			...init,
			// @ts-ignore - Node.js specific option
			agent: agent,
		}

		// Use the default fetch with the agent
		return fetch(input, fetchInit)
	}
}