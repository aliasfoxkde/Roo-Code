import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance, InternalAxiosRequestConfig } from "axios"
import { ProxyManager } from "../proxy/ProxyManager"
import { ProviderSettings } from "@roo-code/types"

export class HttpClientWithProxy {
	private static instance: HttpClientWithProxy
	private proxyManager: ProxyManager

	private constructor() {
		this.proxyManager = ProxyManager.getInstance()
	}

	public static getInstance(): HttpClientWithProxy {
		if (!HttpClientWithProxy.instance) {
			HttpClientWithProxy.instance = new HttpClientWithProxy()
		}
		return HttpClientWithProxy.instance
	}

	/**
	 * Create an axios instance with proxy support
	 * @param providerSettings Optional provider-specific settings that may contain proxy configuration
	 * @returns Axios instance configured with proxy support
	 */
	public createProxyAxios(providerSettings?: ProviderSettings): AxiosInstance {
		const instance = axios.create()

		// Add request interceptor to inject proxy agent
		instance.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				if (config.url) {
					const agent = this.proxyManager.getProxyAgent(config.url, providerSettings)
					if (agent) {
						// @ts-ignore - axios types don't include httpAgent/httpsAgent
						if (config.url.startsWith("https://")) {
							config.httpsAgent = agent
						} else {
							config.httpAgent = agent
						}
					}
				}
				return config
			},
			(error) => {
				return Promise.reject(error)
			},
		)

		return instance
	}

	/**
	 * Make a GET request with proxy support
	 * @param url The URL to request
	 * @param config Optional axios request configuration
	 * @param providerSettings Optional provider-specific settings that may contain proxy configuration
	 * @returns Promise resolving to the response
	 */
	public async get<T = any>(url: string, config?: AxiosRequestConfig, providerSettings?: ProviderSettings): Promise<AxiosResponse<T>> {
		const client = this.createProxyAxios(providerSettings)
		return client.get<T>(url, config)
	}

	/**
	 * Make a POST request with proxy support
	 * @param url The URL to request
	 * @param data Optional data to send in the request body
	 * @param config Optional axios request configuration
	 * @param providerSettings Optional provider-specific settings that may contain proxy configuration
	 * @returns Promise resolving to the response
	 */
	public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig, providerSettings?: ProviderSettings): Promise<AxiosResponse<T>> {
		const client = this.createProxyAxios(providerSettings)
		return client.post<T>(url, data, config)
	}

	/**
	 * Make a PUT request with proxy support
	 * @param url The URL to request
	 * @param data Optional data to send in the request body
	 * @param config Optional axios request configuration
	 * @param providerSettings Optional provider-specific settings that may contain proxy configuration
	 * @returns Promise resolving to the response
	 */
	public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig, providerSettings?: ProviderSettings): Promise<AxiosResponse<T>> {
		const client = this.createProxyAxios(providerSettings)
		return client.put<T>(url, data, config)
	}

	/**
	 * Make a DELETE request with proxy support
	 * @param url The URL to request
	 * @param config Optional axios request configuration
	 * @param providerSettings Optional provider-specific settings that may contain proxy configuration
	 * @returns Promise resolving to the response
	 */
	public async delete<T = any>(url: string, config?: AxiosRequestConfig, providerSettings?: ProviderSettings): Promise<AxiosResponse<T>> {
		const client = this.createProxyAxios(providerSettings)
		return client.delete<T>(url, config)
	}

	/**
	 * Generic request method with proxy support
	 * @param config Axios request configuration
	 * @param providerSettings Optional provider-specific settings that may contain proxy configuration
	 * @returns Promise resolving to the response
	 */
	public async request<T = any>(config: AxiosRequestConfig, providerSettings?: ProviderSettings): Promise<AxiosResponse<T>> {
		const client = this.createProxyAxios(providerSettings)
		return client.request<T>(config)
	}

	/**
	 * Test proxy connectivity for a given URL and provider settings
	 * @param url The URL to test connectivity to
	 * @param providerSettings Optional provider-specific settings that may contain proxy configuration
	 * @returns Promise resolving to true if connectivity is successful, false otherwise
	 */
	public async testProxyConnectivity(url: string, providerSettings?: ProviderSettings): Promise<boolean> {
		try {
			// Create a test client with proxy configuration
			const testClient = this.createProxyAxios(providerSettings)
			
			// Set a short timeout for the test
			const config: AxiosRequestConfig = {
				timeout: 5000, // 5 second timeout
				validateStatus: () => true // Accept any status code for testing
			}
			
			// Make a simple HEAD request to test connectivity
			const response = await testClient.head(url, config)
			
			// Consider successful if we get any response (even 4xx/5xx)
			return response.status > 0
		} catch (error) {
			console.error(`Proxy connectivity test failed for ${url}:`, error)
			return false
		}
	}
}