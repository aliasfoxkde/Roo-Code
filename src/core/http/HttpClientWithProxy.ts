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
	 */
	public async get<T = any>(url: string, config?: AxiosRequestConfig, providerSettings?: ProviderSettings): Promise<AxiosResponse<T>> {
		const client = this.createProxyAxios(providerSettings)
		return client.get<T>(url, config)
	}

	/**
	 * Make a POST request with proxy support
	 */
	public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig, providerSettings?: ProviderSettings): Promise<AxiosResponse<T>> {
		const client = this.createProxyAxios(providerSettings)
		return client.post<T>(url, data, config)
	}

	/**
	 * Make a PUT request with proxy support
	 */
	public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig, providerSettings?: ProviderSettings): Promise<AxiosResponse<T>> {
		const client = this.createProxyAxios(providerSettings)
		return client.put<T>(url, data, config)
	}

	/**
	 * Make a DELETE request with proxy support
	 */
	public async delete<T = any>(url: string, config?: AxiosRequestConfig, providerSettings?: ProviderSettings): Promise<AxiosResponse<T>> {
		const client = this.createProxyAxios(providerSettings)
		return client.delete<T>(url, config)
	}

	/**
	 * Generic request method with proxy support
	 */
	public async request<T = any>(config: AxiosRequestConfig, providerSettings?: ProviderSettings): Promise<AxiosResponse<T>> {
		const client = this.createProxyAxios(providerSettings)
		return client.request<T>(config)
	}
}