# Migration Strategy: Per-Profile Proxy Configuration

## Overview

This document outlines the migration strategy for transitioning existing users from global proxy configuration to per-profile proxy configuration in Roo Code.

## Current State Analysis

### Global Proxy Configuration
Currently, users configure proxy settings globally through VS Code settings:
```json
{
  "hivemind.proxy": {
    "enabled": true,
    "url": "http://proxy.example.com:8080",
    "auth": {
      "username": "user",
      "password": "pass"
    },
    "bypassForLocal": true
  }
}
```

### Provider Profile State
Existing provider profiles do not have explicit proxy configuration fields populated, relying on the global settings at runtime.

## Migration Goals

1. **Seamless Transition**: Existing users should not experience any disruption
2. **Data Preservation**: All existing proxy configurations must be preserved
3. **Backward Compatibility**: Global proxy settings continue to work as fallback
4. **User Choice**: Users can choose when to adopt per-profile configuration

## Migration Approach

### Phase 1: Automatic Migration on First Use

When users first launch Roo Code after the update:

1. **Detection**: Check if global proxy is configured and if migration has not been performed
2. **Inheritance**: Automatically populate all existing provider profiles with the global proxy settings
3. **Flag Setting**: Mark migration as complete to prevent re-execution

### Implementation Details

```typescript
// In ProviderSettingsManager.ts
private async migrateProxySettings(providerProfiles: ProviderProfiles) {
  // Check if migration is needed
  if (providerProfiles.migrations?.proxySettingsMigrated) {
    return
  }

  // Check for global proxy configuration
  const globalProxyConfig = vscode.workspace.getConfiguration("hivemind.proxy")
  const hasGlobalProxy = globalProxyConfig.get<boolean>("enabled", false)
  
  if (hasGlobalProxy) {
    // Migrate global proxy settings to all existing profiles
    for (const [name, config] of Object.entries(providerProfiles.apiConfigs)) {
      // Only migrate if profile doesn't already have proxy settings
      if (
        config.proxyRoutingEnabled === undefined &&
        !config.proxyUrl &&
        !config.proxyAuth &&
        config.proxyBypassLocal === undefined
      ) {
        providerProfiles.apiConfigs[name] = {
          ...config,
          proxyRoutingEnabled: globalProxyConfig.get<boolean>("enabled", false),
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
  
  // Mark migration as complete
  if (!providerProfiles.migrations) {
    providerProfiles.migrations = {}
  }
  providerProfiles.migrations.proxySettingsMigrated = true
  
  // Save updated profiles
  await this.saveProviderProfiles(providerProfiles)
}
```

### Phase 2: User Notification and Education

1. **Welcome Message**: Display a notification informing users about the new proxy capabilities
2. **Documentation Link**: Provide link to updated documentation
3. **Migration Confirmation**: Show what was migrated and how to customize per-profile settings

## Migration Scenarios

### Scenario 1: User with Global Proxy Enabled
**Before Migration:**
- Global proxy: Enabled, configured with URL and credentials
- Provider profiles: No explicit proxy settings

**After Migration:**
- All provider profiles: Inherit global proxy settings
- Global proxy: Remains as fallback for new profiles
- User can customize individual profiles as needed

### Scenario 2: User with Global Proxy Disabled
**Before Migration:**
- Global proxy: Disabled
- Provider profiles: No explicit proxy settings

**After Migration:**
- All provider profiles: proxyEnabled = false (inherited)
- Global proxy: Remains disabled as fallback
- User can enable proxy for specific profiles

### Scenario 3: User with Mixed Profile States
**Before Migration:**
- Global proxy: Enabled
- Some provider profiles: Already have custom proxy settings
- Other profiles: No explicit proxy settings

**After Migration:**
- Profiles with custom settings: Unchanged
- Profiles without settings: Inherit global proxy configuration
- Global proxy: Remains as fallback

## Edge Cases and Handling

### Case 1: Corrupted Global Proxy Configuration
If global proxy settings are invalid or corrupted:
- Migration will be skipped
- Profiles will inherit default (disabled) proxy settings
- User will be notified of the issue
- Global proxy will remain as fallback

### Case 2: Migration Failure
If migration process fails:
- Error will be logged
- User will be notified
- Migration will be retried on next launch
- Global proxy settings will continue to work as fallback

### Case 3: New Profile Creation
For newly created profiles after migration:
- Default to global proxy settings as fallback
- No automatic inheritance of existing profile settings
- User must explicitly configure per-profile settings

## Rollback Strategy

### If Issues Arise
1. **Automatic Rollback**: Migration can be reversed by clearing the migration flag
2. **Manual Reset**: Users can reset proxy settings to global defaults
3. **Support Path**: Clear documentation for support team to assist users

### Recovery Process
```typescript
// Emergency rollback function
public async rollbackProxyMigration() {
  const profiles = await this.loadProviderProfiles()
  
  // Clear proxy settings from all profiles
  for (const [name, config] of Object.entries(profiles.apiConfigs)) {
    delete config.proxyRoutingEnabled
    delete config.proxyUrl
    delete config.proxyAuth
    delete config.proxyBypassLocal
  }
  
  // Clear migration flag
  if (profiles.migrations) {
    delete profiles.migrations.proxySettingsMigrated
  }
  
  // Save rolled-back profiles
  await this.saveProviderProfiles(profiles)
}
```

## Testing Strategy

### Migration Testing
1. **Unit Tests**: Test migration function with various global proxy states
2. **Integration Tests**: Test complete migration flow
3. **Edge Case Tests**: Test corrupted configurations and error conditions
4. **Performance Tests**: Ensure migration doesn't significantly impact startup time

### Backward Compatibility Testing
1. **Global Proxy Only**: Test with only global proxy configuration
2. **Mixed Configurations**: Test with mix of global and profile settings
3. **No Proxy**: Test with all proxy disabled
4. **New User**: Test with fresh installation

## User Communication

### Pre-Migration
- Release notes highlighting new proxy capabilities
- Blog post explaining benefits of per-profile configuration
- Updated documentation with migration guide

### During Migration
- Status indicator during first launch
- Success/failure notifications
- Link to customization guide

### Post-Migration
- Follow-up notification with customization tips
- Survey for feedback on new feature
- Monitoring for migration-related issues

## Monitoring and Metrics

### Success Metrics
1. **Migration Completion Rate**: Percentage of users successfully migrated
2. **Adoption Rate**: Percentage of users customizing per-profile settings
3. **Error Rate**: Number of migration-related errors reported
4. **Performance Impact**: Startup time impact of migration process

### Monitoring Strategy
1. **Telemetry**: Track migration events and outcomes
2. **Error Reporting**: Monitor for migration failures
3. **User Feedback**: Collect feedback through surveys
4. **Support Tickets**: Monitor for migration-related issues

## Timeline

### Development Phase
- **Week 1-2**: Implement migration logic and testing
- **Week 3**: Integration testing and edge case handling
- **Week 4**: Documentation and user communication preparation

### Release Phase
- **Week 5**: Beta release with limited user group
- **Week 6**: Gather feedback and make adjustments
- **Week 7**: Full release with migration enabled
- **Week 8+**: Monitor and support

## Risk Mitigation

### High-Risk Items
1. **Data Loss**: Comprehensive backup strategy and rollback capability
2. **Performance Impact**: Optimized migration process with progress feedback
3. **User Confusion**: Clear communication and documentation
4. **Compatibility Issues**: Extensive testing with various proxy configurations

### Contingency Plans
1. **Immediate Rollback**: Ability to disable migration for specific users
2. **Hotfix Release**: Process for rapid deployment of fixes
3. **Support Escalation**: Clear path for user issues to development team
4. **Communication Plan**: Process for informing users of issues and solutions

## Conclusion

This migration strategy ensures a smooth transition for existing users while providing the enhanced flexibility of per-profile proxy configuration. The approach prioritizes data preservation, maintains backward compatibility, and provides clear paths for user education and support.