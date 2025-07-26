# Technical Design: Per-Profile Proxy Configuration

## Overview

This document outlines the technical design for implementing per-profile proxy configuration support in Roo Code, enabling users to configure different proxy settings for each LLM API provider profile.

## Architecture Overview

The implementation will enhance the existing proxy architecture by extending per-profile proxy support to all API provider handlers while maintaining backward compatibility with global proxy settings.

## Component Design

### 1. Enhanced Provider Settings Schema

The existing `ProviderSettings` schema in `packages/types/src/provider-settings.ts` already includes the necessary proxy fields:

```typescript
const baseProviderSettingsSchema = z.object({
  // ... existing fields ...
  
  // Proxy settings (already present)
  proxyEnabled: z.boolean().optional(),
  proxyUrl: z.string().optional(),
  proxyAuth: z.object({
    username: z.string().optional(),
    password: z.string().optional()
  }).optional(),
  proxyBypassLocal: z.boolean().optional(),
})
```

No schema changes are required as the fields are already in place.

### 2. ProxyManager Integration

The `ProxyManager` singleton in `src/core/proxy/ProxyManager.ts` already supports per-provider proxy settings:

```typescript
export class ProxyManager {
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
}
```

The existing implementation already supports the required functionality.

### 3. HTTP Client Enhancement

The `HttpClientWithProxy` in `src/core/http/HttpClientWithProxy.ts` needs to be enhanced to pass provider settings to the ProxyManager:

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

  public get(providerSettings?: ProviderSettings) {
    const client = this.createProxyAxios(providerSettings)
    return {
      get: <T>(url: string, config?: AxiosRequestConfig) => client.get<T>(url, config),
      post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => client.post<T>(url, data, config),
      put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => client.put<T>(url, data, config),
      delete: <T>(url: string, config?: AxiosRequestConfig) => client.delete<T>(url, config),
      patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => client.patch<T>(url, data, config),
    }
  }
}
```

### 4. Provider Handler Integration

All API provider handlers need to be updated to use provider-specific proxy settings. The key changes involve:

#### A. OpenAI Provider Handler
```typescript
// src/api/providers/openai.ts
constructor(options: ApiHandlerOptions) {
  super()
  this.options = options

  const baseURL = this.options.openAiBaseUrl ?? "https://api.openai.com/v1"
  const apiKey = this.options.openAiApiKey ?? "not-provided"
  
  // Create proxy-aware HTTP client for API calls that don't use OpenAI SDK
  this.httpClient = HttpClientWithProxy.getInstance().createProxyAxios(this.options)
  
  // For OpenAI SDK, we need to pass proxy agent directly
  const proxyAgent = ProxyManager.getInstance().getProxyAgent(baseURL, this.options)
  
  const headers = {
    ...DEFAULT_HEADERS,
    ...(this.options.openAiHeaders || {}),
  }

  this.client = new OpenAI({
    baseURL,
    apiKey,
    defaultHeaders: headers,
    httpAgent: proxyAgent,
    httpsAgent: proxyAgent,
  })
}
```

#### B. Provider Fetchers
```typescript
// src/api/providers/fetchers/ollama.ts
export async function getOllamaModels(baseUrl = "http://localhost:11434", options?: ApiHandlerOptions): Promise<Record<string, ModelInfo>> {
  const models: Record<string, ModelInfo> = {}
  const httpClient = HttpClientWithProxy.getInstance().get(options) // Pass provider settings
  
  try {
    const response = await httpClient.get<OllamaModelsResponse>(`${baseUrl}/api/tags`)
    // ... rest of implementation
  } catch (error) {
    // ... error handling
  }
}
```

### 5. UI Integration Design

#### Provider Settings Component
The proxy configuration UI will be integrated into the provider settings form:

```typescript
interface ProxyConfigFormProps {
  settings: ProviderSettings
  onChange: (settings: Partial<ProviderSettings>) => void
}

const ProxyConfigForm: React.FC<ProxyConfigFormProps> = ({ settings, onChange }) => {
  return (
    <div className="proxy-config-section">
      <h3>Proxy Configuration</h3>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={settings.proxyEnabled ?? false}
            onChange={(e) => onChange({ proxyEnabled: e.target.checked })}
          />
          Enable Proxy for this profile
        </label>
      </div>
      
      {settings.proxyEnabled && (
        <>
          <div className="form-group">
            <label>Proxy URL</label>
            <input
              type="text"
              value={settings.proxyUrl ?? ""}
              onChange={(e) => onChange({ proxyUrl: e.target.value })}
              placeholder="http://proxy.example.com:8080"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={settings.proxyAuth?.username ?? ""}
                onChange={(e) => onChange({ 
                  proxyAuth: { 
                    ...settings.proxyAuth, 
                    username: e.target.value 
                  } 
                })}
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={settings.proxyAuth?.password ?? ""}
                onChange={(e) => onChange({ 
                  proxyAuth: { 
                    ...settings.proxyAuth, 
                    password: e.target.value 
                  } 
                })}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={settings.proxyBypassLocal ?? true}
                onChange={(e) => onChange({ proxyBypassLocal: e.target.checked })}
              />
              Bypass proxy for local addresses
            </label>
          </div>
          
          <div className="form-group">
            <button 
              onClick={() => testProxyConnection(settings)}
              disabled={!settings.proxyUrl}
            >
              Test Proxy Connection
            </button>
          </div>
        </>
      )}
    </div>
  )
}
```

### 6. Migration Strategy

The existing proxy fields in `ProviderSettings` will be populated during initialization:

```typescript
// In ProviderSettingsManager.ts
private async migrateProxySettings(providerProfiles: ProviderProfiles) {
  const globalProxyConfig = vscode.workspace.getConfiguration("hivemind.proxy")
  const hasGlobalProxy = globalProxyConfig.get<boolean>("enabled", false)
  
  if (hasGlobalProxy) {
    // For existing profiles, if they don't have proxy settings, inherit from global
    for (const [name, config] of Object.entries(providerProfiles.apiConfigs)) {
      if (
        config.proxyEnabled === undefined &&
        !config.proxyUrl &&
        !config.proxyAuth &&
        config.proxyBypassLocal === undefined
      ) {
        // Inherit global settings
        providerProfiles.apiConfigs[name] = {
          ...config,
          proxyEnabled: globalProxyConfig.get<boolean>("enabled", false),
          proxyUrl: globalProxyConfig.get<string>("url", ""),
          proxyAuth: {
            username: globalProxyConfig.get<string>("auth.username", ""),
            password: globalProxyConfig.get<string>("auth.password", ""),
          },
          proxyBypassLocal: globalProxyConfig.get<boolean>("bypassForLocal", true),
        }
      }
    }
  }
  
  providerProfiles.migrations!.proxySettingsMigrated = true
}
```

## Implementation Plan

### Phase 1: Core Infrastructure
1. Enhance `HttpClientWithProxy` to properly pass provider settings
2. Update `ProxyManager` to ensure proper proxy agent creation
3. Create proxy testing utilities

### Phase 2: Provider Integration
1. Update all API provider handlers to use proxy-aware HTTP clients
2. Update provider fetchers to pass provider settings
3. Ensure OpenAI SDK and other provider SDKs use proxy agents

### Phase 3: UI Implementation
1. Add proxy configuration section to provider settings UI
2. Implement form validation and error handling
3. Add proxy connectivity testing functionality

### Phase 4: Migration and Testing
1. Implement migration from global to per-profile proxy settings
2. Add comprehensive test coverage
3. Perform integration testing with various proxy configurations

## Security Considerations

1. **Credential Storage**: Proxy authentication credentials will be stored using VS Code's secret storage mechanism
2. **Secure Transmission**: Proxy connections will support SSL/TLS encryption
3. **Input Validation**: Proxy URLs and credentials will be properly validated
4. **Error Handling**: Proxy authentication errors will be handled gracefully without exposing credentials

## Performance Considerations

1. **Connection Pooling**: HTTP clients will maintain connection pooling where appropriate
2. **Caching**: Proxy agents will be cached to avoid repeated creation
3. **Timeouts**: Proper timeout handling will prevent hanging connections
4. **Lazy Initialization**: Proxy agents will be created only when needed

## Testing Strategy

### Unit Tests
1. Test `ProxyManager.getProxySettings()` with various provider configurations
2. Test proxy agent creation for different proxy types (HTTP, HTTPS, SOCKS)
3. Test local address bypass functionality
4. Test backward compatibility with global proxy settings

### Integration Tests
1. Test API provider handlers with proxy configurations
2. Test provider fetchers with proxy settings
3. Test proxy connectivity testing functionality
4. Test migration from global to per-profile settings

### End-to-End Tests
1. Test proxy configuration UI functionality
2. Test proxy settings persistence
3. Test real-world proxy scenarios with different providers
4. Test error handling and user feedback

## Backward Compatibility

1. **Existing Configurations**: Users with global proxy settings will have them automatically applied to all profiles
2. **API Compatibility**: No breaking changes to existing APIs
3. **Storage Format**: Existing provider profile storage format remains compatible
4. **Default Behavior**: Profiles without explicit proxy configuration will inherit global settings

## Dependencies

1. **Existing Libraries**: 
   - `https-proxy-agent` for HTTP/HTTPS proxy support
   - `socks-proxy-agent` for SOCKS proxy support
   - VS Code configuration and secret storage APIs

2. **Internal Components**:
   - `ProxyManager` singleton
   - `HttpClientWithProxy` for HTTP operations
   - `ProviderSettings` schema and storage

## Rollout Plan

1. **Development**: Implement core functionality and testing
2. **Internal Testing**: Test with various proxy configurations
3. **Beta Release**: Limited release to gather feedback
4. **Full Release**: General availability with documentation

## Monitoring and Metrics

1. **Usage Tracking**: Track adoption of per-profile proxy settings
2. **Error Monitoring**: Monitor proxy-related connection errors
3. **Performance Metrics**: Track impact on API response times
4. **User Feedback**: Collect feedback on configuration experience