# Implementation Plan: Per-Profile Proxy Configuration

## Overview

This document outlines the step-by-step implementation plan for adding per-profile proxy configuration support to Roo Code, organized by phases and tasks.

## Phase 1: Core Infrastructure Enhancement

### Task 1.1: Enhance HttpClientWithProxy
**Estimated Time:** 2 hours

**Description:** Update the `HttpClientWithProxy` class to properly pass provider settings to the ProxyManager and ensure all HTTP operations respect per-profile proxy configurations.

**Subtasks:**
- [ ] Modify `createProxyAxios` method to accept `ProviderSettings` parameter
- [ ] Update request interceptors to use provider-specific proxy settings
- [ ] Add comprehensive error handling for proxy-related issues
- [ ] Implement connection timeout handling for proxy connections
- [ ] Add unit tests for proxy-aware HTTP client creation

**Files to Modify:**
- `src/core/http/HttpClientWithProxy.ts`
- `src/core/http/HttpClientWithProxy.test.ts`

### Task 1.2: Verify ProxyManager Integration
**Estimated Time:** 1.5 hours

**Description:** Ensure the `ProxyManager` correctly handles per-provider proxy settings and gracefully falls back to global configuration.

**Subtasks:**
- [ ] Test `getProxySettings` method with various provider configurations
- [ ] Verify proxy agent creation for different proxy types (HTTP, HTTPS, SOCKS)
- [ ] Test local address bypass functionality
- [ ] Validate backward compatibility with global proxy settings
- [ ] Add unit tests for proxy settings resolution

**Files to Modify:**
- `src/core/proxy/ProxyManager.ts`
- `src/core/proxy/ProxyManager.test.ts`

### Task 1.3: Create Proxy Testing Utilities
**Estimated Time:** 2 hours

**Description:** Implement utilities for testing proxy connectivity and validating proxy configurations.

**Subtasks:**
- [ ] Create `testProxyConnection` function to verify proxy accessibility
- [ ] Implement proxy configuration validation utilities
- [ ] Add support for different proxy authentication methods
- [ ] Create error handling and user feedback mechanisms
- [ ] Add unit tests for proxy testing utilities

**Files to Create:**
- `src/core/proxy/ProxyTester.ts`
- `src/core/proxy/ProxyTester.test.ts`

## Phase 2: Provider Handler Integration

### Task 2.1: Update OpenAI Provider Handler
**Estimated Time:** 3 hours

**Description:** Modify the OpenAI provider handler to use proxy-aware HTTP clients and pass proxy agents to the OpenAI SDK.

**Subtasks:**
- [ ] Update constructor to create proxy-aware HTTP client
- [ ] Pass proxy agents to OpenAI SDK client initialization
- [ ] Modify model fetching operations to use provider settings
- [ ] Update token counting endpoints to respect proxy settings
- [ ] Add integration tests for OpenAI provider with proxy

**Files to Modify:**
- `src/api/providers/openai.ts`
- `src/api/providers/openai.test.ts`

### Task 2.2: Update Anthropic Provider Handler
**Estimated Time:** 2.5 hours

**Description:** Modify the Anthropic provider handler to support proxy configuration for API calls.

**Subtasks:**
- [ ] Update constructor to handle proxy configuration
- [ ] Pass proxy settings to Anthropic SDK client
- [ ] Modify fetch operations to use provider-specific proxy
- [ ] Test with different proxy authentication methods
- [ ] Add integration tests for Anthropic provider with proxy

**Files to Modify:**
- `src/api/providers/anthropic.ts`
- `src/api/providers/anthropic.test.ts`

### Task 2.3: Update All API Provider Handlers
**Estimated Time:** 8 hours

**Description:** Update all remaining API provider handlers to support per-profile proxy configuration.

**Subtasks:**
- [ ] Update Bedrock provider handler
- [ ] Update Vertex provider handler
- [ ] Update Ollama provider handler
- [ ] Update LM Studio provider handler
- [ ] Update Gemini provider handler
- [ ] Update OpenRouter provider handler
- [ ] Update all other provider handlers
- [ ] Add comprehensive integration tests

**Files to Modify:**
- `src/api/providers/*.ts` (all provider handlers)
- Corresponding test files

### Task 2.4: Update Provider Fetchers
**Estimated Time:** 4 hours

**Description:** Update all provider fetcher functions to pass provider settings to HTTP clients.

**Subtasks:**
- [ ] Update Ollama model fetcher
- [ ] Update LM Studio model fetcher
- [ ] Update OpenRouter model fetcher
- [ ] Update all other provider fetchers
- [ ] Add unit tests for fetcher functions with proxy

**Files to Modify:**
- `src/api/providers/fetchers/*.ts`
- Corresponding test files

## Phase 3: UI Implementation

### Task 3.1: Design Proxy Configuration UI Component
**Estimated Time:** 3 hours

**Description:** Create the React component for configuring proxy settings in the provider profile UI.

**Subtasks:**
- [ ] Design proxy configuration form layout
- [ ] Implement form fields for proxy URL, authentication
- [ ] Add enable/disable toggle with proper state management
- [ ] Implement local address bypass option
- [ ] Create responsive and accessible UI components

**Files to Create:**
- `webview-ui/src/components/ProxyConfigForm.tsx`
- `webview-ui/src/components/ProxyConfigForm.test.tsx`

### Task 3.2: Integrate Proxy Configuration into Provider Settings
**Estimated Time:** 2 hours

**Description:** Add the proxy configuration component to the provider settings form.

**Subtasks:**
- [ ] Update provider settings form to include proxy section
- [ ] Implement state management for proxy settings
- [ ] Add form validation for proxy URL format
- [ ] Implement save/cancel functionality
- [ ] Add proper error handling and user feedback

**Files to Modify:**
- `webview-ui/src/components/ProviderSettingsForm.tsx`
- `webview-ui/src/components/ProviderSettingsForm.test.tsx`

### Task 3.3: Implement Proxy Connectivity Testing
**Estimated Time:** 2.5 hours

**Description:** Add functionality to test proxy connectivity from the UI.

**Subtasks:**
- [ ] Create test proxy connection button
- [ ] Implement real-time feedback for connectivity tests
- [ ] Add loading states and progress indicators
- [ ] Handle various proxy test scenarios and errors
- [ ] Provide clear success/error messages

**Files to Modify:**
- `webview-ui/src/components/ProxyConfigForm.tsx`
- `webview-ui/src/services/api.ts`

### Task 3.4: Add Visual Indicators
**Estimated Time:** 1.5 hours

**Description:** Add visual indicators to show when profiles use custom proxy settings.

**Subtasks:**
- [ ] Add badge/icon for profiles with custom proxy settings
- [ ] Implement hover tooltips with proxy configuration details
- [ ] Add visual distinction in provider list
- [ ] Update styling to match existing UI patterns

**Files to Modify:**
- `webview-ui/src/components/ProviderList.tsx`
- `webview-ui/src/components/ProviderListItem.tsx`

## Phase 4: Migration and Testing

### Task 4.1: Implement Migration Strategy
**Estimated Time:** 2 hours

**Description:** Create migration logic to convert existing global proxy settings to per-profile configurations.

**Subtasks:**
- [ ] Implement migration function for existing profiles
- [ ] Add migration flag to prevent repeated migrations
- [ ] Handle edge cases and error conditions
- [ ] Add logging for migration process
- [ ] Create migration tests

**Files to Modify:**
- `src/core/config/ProviderSettingsManager.ts`
- `src/core/config/ProviderSettingsManager.test.ts`

### Task 4.2: Add Comprehensive Test Coverage
**Estimated Time:** 6 hours

**Description:** Implement comprehensive test coverage for all proxy-related functionality.

**Subtasks:**
- [ ] Add unit tests for core proxy components
- [ ] Add integration tests for provider handlers
- [ ] Add UI component tests
- [ ] Add end-to-end tests for proxy scenarios
- [ ] Add performance tests for proxy operations

**Files to Create/Modify:**
- Various test files throughout the codebase
- `src/__tests__/proxy-integration.test.ts`
- `webview-ui/src/__tests__/proxy-ui.test.tsx`

### Task 4.3: Performance Testing
**Estimated Time:** 2 hours

**Description:** Test the performance impact of proxy configurations on API calls.

**Subtasks:**
- [ ] Measure latency impact of proxy connections
- [ ] Test connection pooling effectiveness
- [ ] Validate timeout handling
- [ ] Test with various proxy server configurations
- [ ] Document performance characteristics

**Files to Create:**
- `src/__tests__/proxy-performance.test.ts`

### Task 4.4: Security Testing
**Estimated Time:** 2 hours

**Description:** Verify security aspects of proxy implementation.

**Subtasks:**
- [ ] Test credential storage and retrieval
- [ ] Validate SSL/TLS proxy connections
- [ ] Test authentication error handling
- [ ] Verify no credential leakage in logs
- [ ] Test with various authentication methods

**Files to Create:**
- `src/__tests__/proxy-security.test.ts`

## Phase 5: Documentation and Release

### Task 5.1: Update Documentation
**Estimated Time:** 2 hours

**Description:** Update user and developer documentation for the new proxy feature.

**Subtasks:**
- [ ] Update user guide with proxy configuration instructions
- [ ] Add developer documentation for proxy integration
- [ ] Create migration guide for existing users
- [ ] Add FAQ for common proxy issues
- [ ] Update API documentation

**Files to Modify:**
- `docs/user-guide.md`
- `docs/developer-guide.md`
- `README.md`

### Task 5.2: Create Release Notes
**Estimated Time:** 1 hour

**Description:** Prepare release notes highlighting the new proxy functionality.

**Subtasks:**
- [ ] Document new features and capabilities
- [ ] Include migration instructions
- [ ] Add known limitations and workarounds
- [ ] Provide configuration examples
- [ ] Add troubleshooting tips

**Files to Create:**
- `docs/release-notes-v3.24.0.md`

## Risk Assessment and Mitigation

### High-Risk Items
1. **Provider SDK Compatibility**: Some provider SDKs may not support proxy agents directly
   - **Mitigation**: Implement wrapper HTTP clients for unsupported SDKs

2. **Performance Impact**: Proxy connections may add latency to API calls
   - **