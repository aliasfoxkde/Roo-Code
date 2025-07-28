// npx vitest run src/core/http/HttpClientWithProxy.test.ts

import axios from "axios"
import { HttpClientWithProxy } from "./HttpClientWithProxy"
import { ProxyManager } from "../proxy/ProxyManager"
import { ProviderSettings } from "@roo-code/types"

// Mock axios
vi.mock("axios", () => {
	const mockAxiosInstance = {
		interceptors: {
			request: {
				use: vi.fn(),
			},
		},
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
		head: vi.fn(),
		request: vi.fn(),
	}

	const mockCreate = vi.fn(() => mockAxiosInstance)
	
	return {
		default: {
			create: mockCreate,
		},
	}
})

// Mock ProxyManager
vi.mock("../proxy/ProxyManager", () => {
	const mockProxyManager = {
		getProxyAgent: vi.fn(),
		getProxySettings: vi.fn(),
	}

	const mockGetInstance = vi.fn(() => mockProxyManager)

	return {
		ProxyManager: {
			getInstance: mockGetInstance,
		},
	}
})

describe("HttpClientWithProxy", () => {
	let httpClient: HttpClientWithProxy
	let mockAxiosInstance: any
	let mockProxyManager: any

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks()

		// Setup axios mock
		mockAxiosInstance = {
			interceptors: {
				request: {
					use: vi.fn(),
				},
			},
			get: vi.fn().mockResolvedValue({ data: "test", status: 200 }),
			post: vi.fn().mockResolvedValue({ data: "test", status: 200 }),
			put: vi.fn().mockResolvedValue({ data: "test", status: 200 }),
			delete: vi.fn().mockResolvedValue({ data: "test", status: 200 }),
			head: vi.fn().mockResolvedValue({ status: 200 }),
			request: vi.fn().mockResolvedValue({ data: "test", status: 200 }),
		}

		;(axios.create as any).mockReturnValue(mockAxiosInstance)

		// Setup ProxyManager mock
		mockProxyManager = {
			getProxyAgent: vi.fn(),
			getProxySettings: vi.fn(),
		}

		ProxyManager.getInstance = vi.fn(() => mockProxyManager)

		// Create new instance
		httpClient = HttpClientWithProxy.getInstance()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe("getInstance", () => {
		it("should return a singleton instance", () => {
			const instance1 = HttpClientWithProxy.getInstance()
			const instance2 = HttpClientWithProxy.getInstance()
			expect(instance1).toBe(instance2)
		})
	})

	describe("createProxyAxios", () => {
		it("should create an axios instance with request interceptor", () => {
			const providerSettings: ProviderSettings = {
				proxyRoutingEnabled: true,
				proxyUrl: "http://proxy.example.com:8080",
			}

			const instance = httpClient.createProxyAxios(providerSettings)

			expect(axios.create).toHaveBeenCalled()
			expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
		})
	})

	describe("HTTP methods with proxy settings", () => {
		const testUrl = "https://api.example.com/test"
		const providerSettings: ProviderSettings = {
			proxyRoutingEnabled: true,
			proxyUrl: "http://proxy.example.com:8080",
		}

		beforeEach(() => {
			// Reset mock calls
			mockAxiosInstance.get.mockClear()
			mockAxiosInstance.post.mockClear()
			mockAxiosInstance.put.mockClear()
			mockAxiosInstance.delete.mockClear()
			mockAxiosInstance.request.mockClear()
		})

		it("should make GET requests with provider settings", async () => {
			await httpClient.get(testUrl, {}, providerSettings)
			expect(mockAxiosInstance.get).toHaveBeenCalledWith(testUrl, {})
		})

		it("should make POST requests with provider settings", async () => {
			const testData = { test: "data" }
			await httpClient.post(testUrl, testData, {}, providerSettings)
			expect(mockAxiosInstance.post).toHaveBeenCalledWith(testUrl, testData, {})
		})

		it("should make PUT requests with provider settings", async () => {
			const testData = { test: "data" }
			await httpClient.put(testUrl, testData, {}, providerSettings)
			expect(mockAxiosInstance.put).toHaveBeenCalledWith(testUrl, testData, {})
		})

		it("should make DELETE requests with provider settings", async () => {
			await httpClient.delete(testUrl, {}, providerSettings)
			expect(mockAxiosInstance.delete).toHaveBeenCalledWith(testUrl, {})
		})

		it("should make generic requests with provider settings", async () => {
			const config = { url: testUrl, method: "GET" }
			await httpClient.request(config, providerSettings)
			expect(mockAxiosInstance.request).toHaveBeenCalledWith(config)
		})
	})

	describe("testProxyConnectivity", () => {
		const testUrl = "https://api.example.com/test"
		const providerSettings: ProviderSettings = {
			proxyRoutingEnabled: true,
			proxyUrl: "http://proxy.example.com:8080",
		}

		it("should return true when connectivity test is successful", async () => {
			mockAxiosInstance.head.mockResolvedValue({ status: 200 })
			
			const result = await httpClient.testProxyConnectivity(testUrl, providerSettings)
			
			expect(mockAxiosInstance.head).toHaveBeenCalledWith(testUrl, {
				timeout: 5000,
				validateStatus: expect.any(Function)
			})
			expect(result).toBe(true)
		})

		it("should return true even when receiving 4xx/5xx status codes", async () => {
			mockAxiosInstance.head.mockResolvedValue({ status: 404 })
			
			const result = await httpClient.testProxyConnectivity(testUrl, providerSettings)
			
			expect(result).toBe(true)
		})

		it("should return false when connectivity test fails", async () => {
			mockAxiosInstance.head.mockRejectedValue(new Error("Network error"))
			
			const result = await httpClient.testProxyConnectivity(testUrl, providerSettings)
			
			expect(result).toBe(false)
		})

		it("should handle timeout errors gracefully", async () => {
			mockAxiosInstance.head.mockRejectedValue(new Error("timeout"))
			
			const result = await httpClient.testProxyConnectivity(testUrl, providerSettings)
			
			expect(result).toBe(false)
		})
	})
})