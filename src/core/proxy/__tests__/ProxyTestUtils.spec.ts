// npx vitest run src/core/proxy/__tests__/ProxyTestUtils.spec.ts

import { ProxyTestUtils } from "../ProxyTestUtils"
import axios from "axios"

// Mock axios
vi.mock("axios")

// Mock ProxyManager
vi.mock("../ProxyManager", () => {
	const mockProxyManager = {
		getProxyAgent: vi.fn(),
		getProxySettings: vi.fn(),
		isLocalAddress: vi.fn(),
	}

	return {
		ProxyManager: {
			getInstance: vi.fn(() => mockProxyManager),
		},
	}
})

// Import ProxyManager after mocking
import { ProxyManager } from "../ProxyManager"

describe("ProxyTestUtils", () => {
	let mockProxyManager: any

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks()

		// Get the mock instance
		mockProxyManager = ProxyManager.getInstance()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe("testProxyConnectivity", () => {
		const testUrl = "https://api.example.com/test"

		it("should return true when connectivity test is successful without proxy", async () => {
			mockProxyManager.getProxyAgent.mockReturnValue(null)
			;(axios.head as any).mockResolvedValue({ status: 200 })

			const result = await ProxyTestUtils.testProxyConnectivity(testUrl)

			expect(mockProxyManager.getProxyAgent).toHaveBeenCalledWith(testUrl, undefined)
			expect(axios.head).toHaveBeenCalledWith(testUrl, {
				timeout: 5000,
				validateStatus: expect.any(Function)
			})
			expect(result).toBe(true)
		})

		it("should return true when connectivity test is successful with proxy", async () => {
			const mockAgent = { proxy: "test-agent" }
			mockProxyManager.getProxyAgent.mockReturnValue(mockAgent)
			;(axios.head as any).mockResolvedValue({ status: 200 })

			const result = await ProxyTestUtils.testProxyConnectivity(testUrl)

			expect(mockProxyManager.getProxyAgent).toHaveBeenCalledWith(testUrl, undefined)
			expect(axios.head).toHaveBeenCalledWith(testUrl, {
				httpsAgent: mockAgent,
				httpAgent: undefined,
				timeout: 5000,
				validateStatus: expect.any(Function)
			})
			expect(result).toBe(true)
		})

		it("should return true even when receiving 4xx/5xx status codes", async () => {
			mockProxyManager.getProxyAgent.mockReturnValue(null)
			;(axios.head as any).mockResolvedValue({ status: 404 })

			const result = await ProxyTestUtils.testProxyConnectivity(testUrl)

			expect(result).toBe(true)
		})

		it("should return false when connectivity test fails", async () => {
			mockProxyManager.getProxyAgent.mockReturnValue(null)
			;(axios.head as any).mockRejectedValue(new Error("Network error"))

			const result = await ProxyTestUtils.testProxyConnectivity(testUrl)

			expect(result).toBe(false)
		})

		it("should handle timeout errors gracefully", async () => {
			mockProxyManager.getProxyAgent.mockReturnValue(null)
			;(axios.head as any).mockRejectedValue(new Error("timeout"))

			const result = await ProxyTestUtils.testProxyConnectivity(testUrl)

			expect(result).toBe(false)
		})

		it("should pass provider settings to ProxyManager", async () => {
			const providerSettings = {
				proxyRoutingEnabled: true,
				proxyUrl: "http://proxy.example.com:8080",
			}
			mockProxyManager.getProxyAgent.mockReturnValue(null)
			;(axios.head as any).mockResolvedValue({ status: 200 })

			const result = await ProxyTestUtils.testProxyConnectivity(testUrl, providerSettings)

			expect(mockProxyManager.getProxyAgent).toHaveBeenCalledWith(testUrl, providerSettings)
			expect(result).toBe(true)
		})
	})

	describe("testMultipleProxyConnectivity", () => {
		it("should test multiple URLs and return results", async () => {
			const urls = [
				"https://api1.example.com/test",
				"https://api2.example.com/test",
				"https://api3.example.com/test"
			]

			// Mock the testProxyConnectivity method to return alternating true/false
			const testProxyConnectivitySpy = vi.spyOn(ProxyTestUtils, "testProxyConnectivity")
			testProxyConnectivitySpy.mockResolvedValueOnce(true)
			testProxyConnectivitySpy.mockResolvedValueOnce(false)
			testProxyConnectivitySpy.mockResolvedValueOnce(true)

			const results = await ProxyTestUtils.testMultipleProxyConnectivity(urls)

			expect(results).toEqual([
				{ url: urls[0], success: true },
				{ url: urls[1], success: false },
				{ url: urls[2], success: true }
			])

			// Verify that testProxyConnectivity was called for each URL
			expect(testProxyConnectivitySpy).toHaveBeenCalledTimes(3)
			expect(testProxyConnectivitySpy).toHaveBeenCalledWith(urls[0], undefined)
			expect(testProxyConnectivitySpy).toHaveBeenCalledWith(urls[1], undefined)
			expect(testProxyConnectivitySpy).toHaveBeenCalledWith(urls[2], undefined)

			testProxyConnectivitySpy.mockRestore()
		})

		it("should pass provider settings to individual tests", async () => {
			const urls = ["https://api.example.com/test"]
			const providerSettings = {
				proxyRoutingEnabled: true,
				proxyUrl: "http://proxy.example.com:8080",
			}

			const testProxyConnectivitySpy = vi.spyOn(ProxyTestUtils, "testProxyConnectivity")
			testProxyConnectivitySpy.mockResolvedValue(true)

			const results = await ProxyTestUtils.testMultipleProxyConnectivity(urls, providerSettings)

			expect(results).toEqual([{ url: urls[0], success: true }])
			expect(testProxyConnectivitySpy).toHaveBeenCalledWith(urls[0], providerSettings)

			testProxyConnectivitySpy.mockRestore()
		})
	})

	describe("getProxyConfigurationInfo", () => {
		const testUrl = "https://api.example.com/test"

		it("should return proxy configuration info when proxy is configured", () => {
			const mockAgent = { proxy: "test-agent" }
			const proxySettings = {
				proxyRoutingEnabled: true,
				proxyUrl: "http://proxy.example.com:8080",
				proxyBypassLocal: false
			}

			mockProxyManager.getProxyAgent.mockReturnValue(mockAgent)
			mockProxyManager.getProxySettings.mockReturnValue(proxySettings)

			const result = ProxyTestUtils.getProxyConfigurationInfo(testUrl)

			expect(result).toEqual({
				hasProxy: true,
				proxyUrl: "http://proxy.example.com:8080",
				isBypassed: false,
				agentType: "Object"
			})
		})

		it("should return correct info when no proxy is configured", () => {
			mockProxyManager.getProxyAgent.mockReturnValue(null)
			mockProxyManager.getProxySettings.mockReturnValue({
				proxyRoutingEnabled: false,
				proxyUrl: "",
				proxyBypassLocal: false
			})

			const result = ProxyTestUtils.getProxyConfigurationInfo(testUrl)

			expect(result).toEqual({
				hasProxy: false,
				proxyUrl: "",
				isBypassed: false,
				agentType: undefined
			})
		})

		it("should return correct info when URL is bypassed", () => {
			const proxySettings = {
				proxyRoutingEnabled: true,
				proxyUrl: "http://proxy.example.com:8080",
				proxyBypassLocal: true
			}

			mockProxyManager.getProxyAgent.mockReturnValue(null)
			mockProxyManager.getProxySettings.mockReturnValue(proxySettings)
			mockProxyManager.isLocalAddress.mockReturnValue(true)

			const result = ProxyTestUtils.getProxyConfigurationInfo("http://localhost:3000")

			expect(result).toEqual({
				hasProxy: false,
				proxyUrl: "http://proxy.example.com:8080",
				isBypassed: true,
				agentType: undefined
			})
		})

		it("should pass provider settings to ProxyManager", () => {
			const providerSettings = {
				proxyRoutingEnabled: true,
				proxyUrl: "http://proxy.example.com:8080",
			}
			const mockAgent = { proxy: "test-agent" }

			mockProxyManager.getProxyAgent.mockReturnValue(mockAgent)
			mockProxyManager.getProxySettings.mockReturnValue(providerSettings)

			const result = ProxyTestUtils.getProxyConfigurationInfo(testUrl, providerSettings)

			expect(mockProxyManager.getProxyAgent).toHaveBeenCalledWith(testUrl, providerSettings)
			expect(mockProxyManager.getProxySettings).toHaveBeenCalledWith(providerSettings)
		})
	})
})