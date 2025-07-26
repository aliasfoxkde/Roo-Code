# Product Requirements: Per-Profile Proxy Configuration

## Overview

This document outlines the product requirements for implementing per-profile proxy configuration support in Roo Code, allowing users to configure different proxy settings for each LLM API provider profile.

## Problem Statement

Currently, Roo Code only supports global proxy configuration that applies to all LLM API endpoints. This limitation prevents users from:
- Using different proxy servers for different providers (e.g., one proxy for OpenAI, another for Anthropic)
- Configuring proxy settings on a per-profile basis for different use cases
- Bypassing proxy for specific providers while using proxy for others
- Managing complex network environments where different services require different proxy configurations

## User Stories

### Primary User Stories

1. **As a** developer working in a corporate environment, **I want** to configure different proxy settings for each LLM provider **so that** I can access multiple services through their respective network requirements.

2. **As a** user with complex network setup, **I want** to enable proxy for some providers while disabling it for others **so that** I can optimize my network routing.

3. **As a** power user, **I want** to configure proxy authentication on a per-profile basis **so that** I can use different credentials for different proxy servers.

4. **As a** user migrating from global proxy settings, **I want** my existing configuration to be automatically applied to all profiles **so that** I don't lose my current setup.

### Secondary User Stories

5. **As a** user, **I want** a clear and intuitive UI for configuring proxy settings per profile **so that** I can easily manage my proxy configurations.

6. **As a** user with local LLM providers, **I want** the ability to bypass proxy for localhost connections **so that** I can access local services efficiently.

7. **As a** user, **I want** to test proxy configurations independently for each profile **so that** I can verify connectivity before using the provider.

## Functional Requirements

### Core Features

1. **Per-Profile Proxy Configuration**
   - Each provider profile can have independent proxy settings
   - Settings include: enabled/disabled, proxy URL, authentication credentials, bypass local addresses
   - Default to global proxy settings when not configured

2. **Proxy Settings Fields**
   - Enable/Disable proxy for the profile
   - Proxy server URL (HTTP/HTTPS/SOCKS)
   - Username and password for authentication
   - Bypass proxy for local addresses option
   - Test connectivity button

3. **Backward Compatibility**
   - Existing global proxy settings are preserved
   - Profiles without explicit proxy configuration inherit global settings
   - Automatic migration of existing proxy configurations

4. **UI/UX Requirements**
   - Proxy configuration section in provider profile settings
   - Clear visual indication when profile uses global vs. custom proxy settings
   - Validation for proxy URL format
   - Real-time feedback for proxy connectivity

### Technical Requirements

1. **Provider Integration**
   - All API provider handlers must support proxy configuration
   - HTTP clients must be proxy-aware
   - Model fetching operations must use proxy settings

2. **Configuration Management**
   - Proxy settings stored with provider profiles
   - Schema validation for proxy configuration
   - Secure storage of authentication credentials

3. **Network Handling**
   - Support for HTTP, HTTPS, and SOCKS proxies
   - Proper handling of authentication
   - Local address bypass functionality
   - Connection timeout and error handling

## Non-Functional Requirements

### Performance
- Proxy configuration should not significantly impact API response times
- Connection timeouts should be properly handled
- Proxy authentication should be cached appropriately

### Security
- Proxy credentials must be securely stored
- Authentication information should not be logged
- Proxy connections should support SSL/TLS

### Usability
- Proxy configuration should be optional and not required
- Clear error messages for proxy connectivity issues
- Intuitive UI that matches existing configuration patterns

## Acceptance Criteria

### Configuration Management
- [ ] Users can enable/disable proxy for each provider profile
- [ ] Users can specify proxy URL with proper validation
- [ ] Users can configure authentication credentials
- [ ] Users can choose to bypass proxy for local addresses
- [ ] Profiles without proxy configuration inherit global settings
- [ ] Existing global proxy settings are preserved during migration

### Provider Integration
- [ ] All API providers respect profile proxy settings
- [ ] HTTP clients use appropriate proxy agents
- [ ] Model fetching operations use proxy configuration
- [ ] Direct API calls use proxy settings

### UI/UX
- [ ] Proxy configuration section is accessible in provider settings
- [ ] Visual indication shows when custom proxy is configured
- [ ] Proxy URL validation prevents invalid formats
- [ ] Connectivity test provides clear feedback
- [ ] Error messages are informative and actionable

### Backward Compatibility
- [ ] Existing users retain their global proxy settings
- [ ] Profiles automatically inherit global settings
- [ ] No breaking changes to existing functionality
- [ ] Migration process is seamless and automatic

## Technical Constraints

1. **Existing Architecture**
   - Must integrate with current `ProviderSettings` schema
   - Should leverage existing `ProxyManager` singleton
   - Must work with current `HttpClientWithProxy` implementation

2. **Security Requirements**
   - Credentials must be stored using VS Code's secret storage
   - No plain text storage of sensitive information
   - Proper error handling for authentication failures

3. **Performance Considerations**
   - Proxy configuration should not add significant overhead
   - Connection pooling should be maintained where appropriate
   - Timeout handling should be consistent with existing patterns

## Dependencies

1. **Existing Components**
   - `ProxyManager` singleton for proxy agent creation
   - `ProviderSettings` schema for configuration storage
   - `HttpClientWithProxy` for HTTP operations

2. **External Libraries**
   - `https-proxy-agent` for HTTP/HTTPS proxy support
   - `socks-proxy-agent` for SOCKS proxy support
   - VS Code configuration API for settings management

## Success Metrics

1. **User Adoption**
   - Percentage of users configuring per-profile proxy settings
   - User feedback on configuration ease
   - Reduction in proxy-related support requests

2. **Technical Metrics**
   - Successful API calls through configured proxies
   - Proper handling of proxy authentication
   - Performance impact within acceptable thresholds

3. **Compatibility**
   - Seamless migration for existing users
   - No regression in existing proxy functionality
   - Support for all major proxy types and configurations

## Future Enhancements

1. **Advanced Features**
   - Proxy auto-detection based on network environment
   - Proxy chaining support
   - Custom proxy rules for specific endpoints
   - Proxy performance monitoring and statistics

2. **Integration Opportunities**
   - System proxy detection and import
   - Proxy configuration sharing between profiles
   - Environment-specific proxy presets