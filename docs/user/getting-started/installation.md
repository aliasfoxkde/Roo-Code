# Installation Guide

This guide will help you install and set up the Roo Code VS Code Extension.

## Prerequisites

Before installing Roo Code, ensure you have:

- **VS Code**: Version 1.74.0 or later
- **Node.js**: Version 16.0 or later (for TypeScript projects)
- **Operating System**: Windows 10+, macOS 10.15+, or Linux

## Installation Methods

### Method 1: VS Code Marketplace (Recommended)

1. Open VS Code
2. Go to the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Roo Code"
4. Click "Install" on the official Roo Code extension
5. Reload VS Code when prompted

### Method 2: Command Line

```bash
code --install-extension roo-code.roo-code
```

### Method 3: Manual Installation

1. Download the `.vsix` file from the [releases page](https://github.com/RooCodeInc/Roo-Code/releases)
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
4. Click the "..." menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

## Initial Setup

### 1. Verify Installation

After installation, you should see:
- Roo Code icon in the Activity Bar
- "Roo Code" in the Extensions list (marked as enabled)
- New commands available in the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)

### 2. First Launch

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Roo Code: Welcome" and select it
3. Follow the welcome wizard to configure basic settings

### 3. Global Configuration (Optional)

Roo Code works out-of-the-box, but you can create global configurations:

1. Create a global `.roo` directory in your home folder:
   ```bash
   # macOS/Linux
   mkdir ~/.roo
   
   # Windows
   mkdir %USERPROFILE%\.roo
   ```

2. Add global rules or settings (see [Configuration Guide](../configuration/roo-directory.md))

## Verification

### Test Basic Functionality

1. Open any project in VS Code
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Type "Roo Code" - you should see available commands
4. Try "Roo Code: Show Status" to verify the extension is working

### Check Extension Status

1. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Find "Roo Code" in the list
3. Ensure it shows as "Enabled"
4. Check the extension details for version information

## Configuration

### Basic Settings

Access Roo Code settings through:
1. File → Preferences → Settings (`Ctrl+,` / `Cmd+,`)
2. Search for "Roo Code"
3. Configure basic options like:
   - Enable/disable features
   - Set default modes
   - Configure file watching

### Project-Specific Setup

For project-specific configuration:
1. Create a `.roo` directory in your project root
2. Add configuration files as needed
3. See [Configuration Guide](../configuration/roo-directory.md) for details

## Troubleshooting Installation

### Extension Not Loading

If the extension doesn't load:
1. Check VS Code version compatibility
2. Restart VS Code completely
3. Check the Output panel for error messages:
   - View → Output
   - Select "Roo Code" from the dropdown

### Permission Issues

On some systems, you may need to:
1. Run VS Code as administrator (Windows)
2. Check file permissions for the `.roo` directory
3. Ensure VS Code has access to the workspace folder

### Network Issues

If installation fails due to network issues:
1. Check your internet connection
2. Try using a VPN if behind a corporate firewall
3. Use the manual installation method with a downloaded `.vsix` file

### Common Error Messages

**"Extension activation failed"**
- Check VS Code version compatibility
- Look for conflicting extensions
- Check the Developer Console for detailed errors

**"Cannot read .roo directory"**
- Verify directory permissions
- Check if the path exists
- Ensure VS Code has file system access

**"TypeScript service unavailable"**
- Install Node.js if not present
- Check TypeScript installation
- Verify project has valid `tsconfig.json`

## Next Steps

After successful installation:

1. **[Quick Start Tutorial](quick-start.md)** - Learn basic usage
2. **[First Project Setup](first-project.md)** - Set up your first project
3. **[Configuration Guide](../configuration/roo-directory.md)** - Customize Roo Code
4. **[Features Overview](../features/)** - Explore available features

## Getting Help

If you encounter issues:

1. **[Troubleshooting Guide](../troubleshooting/common-issues.md)** - Common solutions
2. **[FAQ](../faq.md)** - Frequently asked questions
3. **[GitHub Issues](https://github.com/RooCodeInc/Roo-Code/issues)** - Report bugs or request features
4. **[Community Discord](https://discord.gg/roocode)** - Get help from the community

## System Requirements

### Minimum Requirements
- **VS Code**: 1.74.0+
- **RAM**: 4GB
- **Storage**: 100MB free space
- **OS**: Windows 10, macOS 10.15, Ubuntu 18.04

### Recommended Requirements
- **VS Code**: Latest version
- **RAM**: 8GB+
- **Storage**: 1GB free space
- **Node.js**: 18.0+ (for optimal TypeScript support)

## Updates

Roo Code automatically updates through VS Code's extension update mechanism:

1. Updates are checked automatically
2. You'll be notified when updates are available
3. Updates can be installed without restarting VS Code
4. Check [CHANGELOG.md](../../CHANGELOG.md) for update details

---

**Next**: [Quick Start Tutorial](quick-start.md)  
**Related**: [Configuration Guide](../configuration/roo-directory.md) | [Troubleshooting](../troubleshooting/common-issues.md)
