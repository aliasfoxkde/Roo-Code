# Adding Proxy/VPN Support for LLM API Endpoints in Roo Code

To add proxy/VPN configuration support for LLM API endpoints in your Roo Code extension, here's a comprehensive approach:

## 1. Add Configuration Options

First, extend the extension's configuration schema in `package.json`:

```json
"contributes": {
  "configuration": {
    "title": "Roo Code",
    "properties": {
      "rooCode.llmProxySettings": {
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
              "username": {"type": "string", "default": ""},
              "password": {"type": "string", "default": ""}
            }
          },
          "bypassForLocal": {
            "type": "boolean",
            "default": true,
            "description": "Bypass proxy for local addresses"
          }
        }
      }
    }
  }
}
```

## 2. Create Proxy Configuration Handler

Add a new file `src/proxyConfig.ts`:

```typescript
import * as vscode from 'vscode';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

export interface ProxySettings {
    enabled: boolean;
    url: string;
    auth?: {
        username: string;
        password: string;
    };
    bypassForLocal: boolean;
}

export function getProxyAgent(targetUrl: string): any {
    const config = vscode.workspace.getConfiguration('rooCode.llmProxySettings');
    const settings: ProxySettings = {
        enabled: config.get<boolean>('enabled', false),
        url: config.get<string>('url', ''),
        auth: {
            username: config.get<string>('auth.username', ''),
            password: config.get<string>('auth.password', '')
        },
        bypassForLocal: config.get<boolean>('bypassForLocal', true)
    };

    if (!settings.enabled || !settings.url) {
        return null;
    }

    // Check if we should bypass proxy for local addresses
    if (settings.bypassForLocal && isLocalAddress(targetUrl)) {
        return null;
    }

    // Construct proxy URL with auth if provided
    let proxyUrl = settings.url;
    if (settings.auth?.username) {
        proxyUrl = `http://${encodeURIComponent(settings.auth.username)}:${encodeURIComponent(settings.auth.password)}@${proxyUrl.replace(/^https?:\/\//, '')}`;
    }

    // Return appropriate agent based on proxy type
    if (proxyUrl.startsWith('socks')) {
        return new SocksProxyAgent(proxyUrl);
    } else {
        return new HttpsProxyAgent(proxyUrl);
    }
}

function isLocalAddress(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    } catch {
        return false;
    }
}
```

## 3. Modify LLM API Calls

Update your LLM API client to use the proxy:

```typescript
import { getProxyAgent } from './proxyConfig';
import axios from 'axios';

export async function callLlmApi(endpoint: string, payload: any) {
    const proxyAgent = getProxyAgent(endpoint);

    const config: AxiosRequestConfig = {
        url: endpoint,
        method: 'POST',
        data: payload
    };

    if (proxyAgent) {
        config.httpsAgent = proxyAgent;
        config.httpAgent = proxyAgent;
    }

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}
```

## 4. Add Proxy Settings UI

Create a settings UI in your extension's activation:

```typescript
export function activate(context: vscode.ExtensionContext) {
    // ... existing code ...

    // Register proxy configuration command
    context.subscriptions.push(
        vscode.commands.registerCommand('rooCode.configureProxy', async () => {
            await vscode.window.showQuickPick([
                {
                    label: '$(gear) Configure Proxy Settings',
                    description: 'Open settings to configure LLM API proxy',
                    action: 'openSettings'
                },
                {
                    label: '$(debug-disconnect) Disable Proxy',
                    description: 'Temporarily disable proxy',
                    action: 'disable'
                }
            ]).then(selection => {
                if (selection?.action === 'openSettings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'rooCode.llmProxySettings');
                } else if (selection?.action === 'disable') {
                    vscode.workspace.getConfiguration().update('rooCode.llmProxySettings.enabled', false, true);
                }
            });
        })
    );
}
```

## 5. Update Dependencies

Add these to your `package.json`:

```json
"dependencies": {
    "https-proxy-agent": "^7.0.0",
    "socks-proxy-agent": "^7.0.0",
    "axios": "^1.3.0"
}
```

## 6. Add Context Menu Items

In your extension's UI, add options to quickly enable/disable the proxy:

```typescript
vscode.commands.registerCommand('rooCode.toggleProxy', async () => {
    const config = vscode.workspace.getConfiguration('rooCode.llmProxySettings');
    const current = config.get<boolean>('enabled', false);
    await config.update('enabled', !current, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`Proxy ${!current ? 'enabled' : 'disabled'}`);
});
```

## Testing

1. Test with different proxy types (HTTP, HTTPS, SOCKS)
2. Verify authentication works
3. Check bypass for local addresses
4. Test with various LLM endpoints

This implementation gives users flexible proxy configuration while maintaining security and supporting different proxy types. Would you like me to elaborate on any specific part of this implementation?
