import OpenAI from "openai"
import { Anthropic } from "@anthropic-ai/sdk"

import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import { convertToOpenAiMessages } from "../transform/openai-format"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
import { DEFAULT_HEADERS } from "./constants"
import { BaseProvider } from "./base-provider"
import { createProxyFetch } from "../../core/http/proxyFetch"

export class HuggingFaceHandler extends BaseProvider implements SingleCompletionHandler {
	private client: OpenAI
	private options: ApiHandlerOptions

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options

		if (!this.options.huggingFaceApiKey) {
			throw new Error("Hugging Face API key is required")
		}

		this.client = new OpenAI({
			baseURL: "https://router.huggingface.co/v1",
			fetch: createProxyFetch(this.options),
			apiKey: this.options.huggingFaceApiKey,
			defaultHeaders: DEFAULT_HEADERS,
		})
	}

	override async *createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream {
		const modelId = this.options.huggingFaceModelId || "meta-llama/Llama-3.3-70B-Instruct"
		const temperature = this.options.modelTemperature ?? 0.7

		const params: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming = {
			model: modelId,
			temperature,
			messages: [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messages)],
			stream: true,
			stream_options: { include_usage: true },
		}

		const stream = await this.client.chat.completions.create(params)

		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta

			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}

			if (chunk.usage) {
				yield {
					type: "usage",
					inputTokens: chunk.usage.prompt_tokens || 0,
					outputTokens: chunk.usage.completion_tokens || 0,
				}
			}
		}
	}

	async completePrompt(prompt: string): Promise<string> {
		const modelId = this.options.huggingFaceModelId || "meta-llama/Llama-3.3-70B-Instruct"

		try {
			const response = await this.client.chat.completions.create({
				model: modelId,
				messages: [{ role: "user", content: prompt }],
			})

			return response.choices[0]?.message.content || ""
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Hugging Face completion error: ${error.message}`)
			}

			throw error
		}
	}

	override getModel() {
		const modelId = this.options.huggingFaceModelId || "meta-llama/Llama-3.3-70B-Instruct"
		return {
			id: modelId,
			info: {
				maxTokens: 8192,
				contextWindow: 131072,
				supportsImages: false,
				supportsPromptCache: false,
			},
		}
	}
}
