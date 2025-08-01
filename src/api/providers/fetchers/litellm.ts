import { HttpClientWithProxy } from "../../../core/http/HttpClientWithProxy"

import { LITELLM_COMPUTER_USE_MODELS } from "@roo-code/types"

import type { ModelRecord } from "../../../shared/api"

import { DEFAULT_HEADERS } from "../constants"
/**
 * Fetches available models from a LiteLLM server
 *
 * @param apiKey The API key for the LiteLLM server
 * @param baseUrl The base URL of the LiteLLM server
 * @returns A promise that resolves to a record of model IDs to model info
 * @throws Will throw an error if the request fails or the response is not as expected.
 */
export async function getLiteLLMModels(apiKey: string, baseUrl: string, options?: any): Promise<ModelRecord> {
	const httpClient = HttpClientWithProxy.getInstance()
	try {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			...DEFAULT_HEADERS,
		}

		if (apiKey) {
			headers["Authorization"] = `Bearer ${apiKey}`
		}
		// Use URL constructor to properly join base URL and path
		// This approach handles all edge cases including paths, query params, and fragments
		const urlObj = new URL(baseUrl)
		// Normalize the pathname by removing trailing slashes and multiple slashes
		urlObj.pathname = urlObj.pathname.replace(/\/+$/, "").replace(/\/+/g, "/") + "/v1/model/info"
		const url = urlObj.href
		// Added timeout to prevent indefinite hanging
		const response = await httpClient.get(url, { headers, timeout: 5000 }, options)
		const models: ModelRecord = {}

		const computerModels = Array.from(LITELLM_COMPUTER_USE_MODELS)

		// Process the model info from the response
		if (response.data && response.data.data && Array.isArray(response.data.data)) {
			for (const model of response.data.data) {
				const modelName = model.model_name
				const modelInfo = model.model_info
				const litellmModelName = model?.litellm_params?.model as string | undefined

				if (!modelName || !modelInfo || !litellmModelName) continue

				// Use explicit supports_computer_use if available, otherwise fall back to hardcoded list
				let supportsComputerUse: boolean
				if (modelInfo.supports_computer_use !== undefined) {
					supportsComputerUse = Boolean(modelInfo.supports_computer_use)
				} else {
					// Fallback for older LiteLLM versions that don't have supports_computer_use field
					supportsComputerUse = computerModels.some((computer_model) =>
						litellmModelName.endsWith(computer_model),
					)
				}

				models[modelName] = {
					maxTokens: modelInfo.max_tokens || 8192,
					contextWindow: modelInfo.max_input_tokens || 200000,
					supportsImages: Boolean(modelInfo.supports_vision),
					// litellm_params.model may have a prefix like openrouter/
					supportsComputerUse,
					supportsPromptCache: Boolean(modelInfo.supports_prompt_caching),
					inputPrice: modelInfo.input_cost_per_token ? modelInfo.input_cost_per_token * 1000000 : undefined,
					outputPrice: modelInfo.output_cost_per_token
						? modelInfo.output_cost_per_token * 1000000
						: undefined,
					cacheWritesPrice: modelInfo.cache_creation_input_token_cost
						? modelInfo.cache_creation_input_token_cost * 1000000
						: undefined,
					cacheReadsPrice: modelInfo.cache_read_input_token_cost
						? modelInfo.cache_read_input_token_cost * 1000000
						: undefined,
					description: `${modelName} via LiteLLM proxy`,
				}
			}
		} else {
			// If response.data.data is not in the expected format, consider it an error.
			console.error("Error fetching LiteLLM models: Unexpected response format", response.data)
			throw new Error("Failed to fetch LiteLLM models: Unexpected response format.")
		}

		return models
	} catch (error: any) {
		console.error("Error fetching LiteLLM models:", error.message ? error.message : error)
		// Note: Error handling for axios errors needs to be updated since we're using a wrapper
		// For now, we'll handle generic errors
		if (error.response) {
			throw new Error(
				`Failed to fetch LiteLLM models: ${error.response.status} ${error.response.statusText}. Check base URL and API key.`,
			)
		} else if (error.request) {
			throw new Error(
				"Failed to fetch LiteLLM models: No response from server. Check LiteLLM server status and base URL.",
			)
		} else {
			throw new Error(`Failed to fetch LiteLLM models: ${error.message || "An unknown error occurred."}`)
		}
	}
}
