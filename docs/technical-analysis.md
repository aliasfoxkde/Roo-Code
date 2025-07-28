# Technical Analysis: Current Proxy Architecture

## Overview

The current proxy implementation in Roo Code provides global proxy configuration that applies to all LLM API endpoints. This analysis documents the existing architecture and identifies gaps for implementing per-profile proxy support.

## Current Architecture

### 1. Global Proxy Configuration

The proxy configuration is defined in `package.json` under `hivemind.proxy`:

```json
"hivemind.proxy": {
  "type": "object",
  "scope": "application",
  "description": "Proxy settings for LLM API connections",
  "properties": {
    "enabled": {
      "type": "boolean",
      "default": false,
      "description": "Enable proxy for LLM API calls"
    },
    "url": {
      "type": "string",
      "default": "",
      "description": "Proxy URL (e.g., http://proxy.example.com:8080)"
    },
    "auth": {
      "type": "object",
      "description": "Proxy authentication settings",
      "properties": {
        "username": {
          "type": "string",
          "default": ""
        },
        "password": {
          "type": "string",
          "default": ""
        }
      }
    },
    "bypassForLocal": {
      "type": "boolean",
      "default": true,
      "description": "Bypass proxy for local addresses"
    }
  }
}
```

### 2. Proxy Settings Schema

The `ProviderSettings` schema in `packages/types/src/provider-settings.ts` already includes proxy configuration fields:

```typescript
const baseProviderSettingsSchema = z.object({
  // ... other settings ...
  
  // Proxy settings
  proxyRoutingEnabled: z.boolean().optional(),
  proxyUrl: z.string().optional(),
  proxyAuth: z.object({
    username: z.string().optional(),
    password: z.string().optional()
  }).optional(),
  proxyBypassLocal: z.boolean().optional(),
})
```

### 3. Proxy Manager Implementation

The `ProxyManager` singleton in `src/core/proxy/ProxyManager.ts` handles proxy configuration:

```typescript
export class ProxyManager {
  public getProxySettings(providerSettings?: ProviderSettings): ProxySettings {
    // First check provider-specific settings
    if (providerSettings) {
      if (
        providerSettings.proxyRoutingEnabled !== undefined ||
        providerSettings.proxyUrl ||
        providerSettings.proxyAuth ||
        providerSettings.proxyBypassLocal !== undefined
      ) {
        return {
          proxyRoutingEnabled: providerSettings.proxyRoutingEnabled,
          proxyUrl: providerSettings.proxyUrl,
          proxyAuth: providerSettings.proxyAuth,
          proxyBypassLocal: providerSettings.proxyBypassLocal,
        }
      }
    }

    // Fall back to global VSCode configuration
    const config = vscode.workspace.getConfiguration("hivemind.proxy")
    return {
      proxyRoutingEnabled: config.get<boolean>("enabled", false),
      proxyUrl: config.get<string>("url", ""),
      proxyAuth: {
        username: config.get<string>("auth.username", ""),
        password: config.get<string>("auth.password", ""),
      },
      proxyBypassLocal: config.get<boolean>("bypassForLocal", true),
    }
  }

  public getProxyAgent(targetUrl: string, providerSettings?: ProviderSettings): any {
    const settings = this.getProxySettings(providerSettings)
    // ... implementation ...
  }
}
```

### 4. HTTP Client Integration

The `HttpClientWithProxy` in `src/core/http/HttpClientWithProxy.ts` uses the ProxyManager:

```typescript
export class HttpClientWithProxy {
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
}
```

### 5. Provider Integration

API providers use the HttpClientWithProxy:

```typescript
// In provider fetchers like src/api/providers/fetchers/ollama.ts
export async function getOllamaModels(baseUrl = "http://localhost:11434"): Promise<Record<string, ModelInfo>> {
  const models: Record<string, ModelInfo> = {}
  const httpClient = HttpClientWithProxy.getInstance()
  // ... implementation ...
}

// In provider handlers like src/api/providers/openai.ts
constructor(options: ApiHandlerOptions) {
  super()
  this.options = options
  
  // The OpenAI client is created directly without proxy support
  // But fetch operations use HttpClientWithProxy
}
```

## Current Gaps

### 1. Provider Handler Limitation

While the `ProviderSettings` schema includes proxy fields and the `ProxyManager` can handle provider-specific settings, the actual API provider handlers (like `OpenAiHandler`) create their HTTP clients directly using the OpenAI SDK, which bypasses the proxy configuration.

The proxy support is only available for fetch operations (model listing, etc.) but not for the actual API calls.

### 2. Missing UI Integration

There's no UI/UX designed for configuring per-profile proxy settings in the configuration interface.

### 3. Migration Strategy

Existing users with global proxy settings need a clear migration path to per-profile configurations.

## Implementation Requirements

### 1. Enhanced Proxy Support for All Providers

All API provider handlers need to be updated to support proxy configuration for their HTTP clients.

### 2. UI/UX Design

A configuration interface needs to be designed for per-profile proxy settings.

### 3. Backward Compatibility

The implementation must maintain backward compatibility with existing global proxy configurations.

## Technical Approach

1. **Schema Enhancement**: The existing proxy fields in `ProviderSettings` are already in place
2. **Proxy Integration**: Update all provider handlers to use proxy-aware HTTP clients
3. **UI Implementation**: Add proxy configuration to the provider settings UI
4. **Migration**: Implement automatic migration from global to per-profile settings

This analysis shows that the foundation is already in place, but the implementation needs to be extended to cover all API provider handlers.