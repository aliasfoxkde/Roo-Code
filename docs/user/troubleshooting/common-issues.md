# Common Issues and Solutions

This guide covers the most frequently encountered issues with Roo Code and their solutions.

## Quick Diagnostics

### Check Extension Status
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run "Roo Code: Show Status"
3. Check the output for any error messages

### View Extension Logs
1. Go to View → Output
2. Select "Roo Code" from the dropdown
3. Look for error messages or warnings

## Configuration Issues

### .roo Directory Not Found

**Symptoms:**
- Extension shows "No .roo configuration found"
- Rules and custom instructions not loading
- Default behavior only

**Solutions:**

1. **Check Directory Location**
   ```bash
   # Verify .roo directory exists
   ls -la .roo/  # macOS/Linux
   dir .roo\     # Windows
   ```

2. **Create Missing Directory**
   ```bash
   mkdir .roo
   mkdir .roo/rules
   echo "# Project Rules" > .roo/rules/rules.md
   ```

3. **Check Permissions**
   ```bash
   # Ensure VS Code can read the directory
   chmod 755 .roo/        # macOS/Linux
   chmod -R 755 .roo/     # Recursive
   ```

### Configuration Not Loading

**Symptoms:**
- Changes to .roo files don't take effect
- Extension uses default settings only
- No hot reloading

**Solutions:**

1. **Verify File Format**
   ```json
   // config/roo.config.json - Check JSON syntax
   {
     "version": "1.0",
     "typescript": {
       "enabled": true
     }
   }
   ```

2. **Check File Encoding**
   - Ensure files are saved as UTF-8
   - Avoid BOM (Byte Order Mark)
   - Use consistent line endings

3. **Restart Extension**
   ```
   Command Palette → "Developer: Reload Window"
   ```

### Hot Reloading Not Working

**Symptoms:**
- Changes to .roo files require VS Code restart
- File watcher not detecting changes
- Configuration cache not updating

**Solutions:**

1. **Enable File Watching**
   ```json
   // config/roo.config.json
   {
     "fileWatching": {
       "enabled": true,
       "debounceMs": 300
     }
   }
   ```

2. **Check Exclude Patterns**
   ```json
   {
     "fileWatching": {
       "excludePatterns": [
         "**/*.tmp",
         "**/node_modules/**"
         // Don't exclude .roo files!
       ]
     }
   }
   ```

3. **File System Limitations**
   - Some network drives don't support file watching
   - Docker containers may need polling mode
   - WSL2 may have file watching issues

## TypeScript Integration Issues

### TypeScript Service Not Available

**Symptoms:**
- No TypeScript validation
- Compiler errors not shown
- IntelliSense not working

**Solutions:**

1. **Install Node.js**
   ```bash
   # Check Node.js installation
   node --version
   npm --version
   ```

2. **Verify TypeScript Installation**
   ```bash
   # Global TypeScript
   npm install -g typescript
   
   # Project TypeScript
   npm install --save-dev typescript
   ```

3. **Check tsconfig.json**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "strict": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules"]
   }
   ```

### TypeScript Validation Errors

**Symptoms:**
- False positive errors
- Validation too strict/lenient
- Performance issues

**Solutions:**

1. **Adjust TypeScript Config**
   ```json
   // config/typescript.json
   {
     "enabled": true,
     "validateOnSave": true,
     "compilerOptions": {
       "strict": false,  // Reduce strictness
       "skipLibCheck": true
     }
   }
   ```

2. **Exclude Problem Files**
   ```json
   {
     "excludePatterns": [
       "**/node_modules/**",
       "**/dist/**",
       "**/*.d.ts"
     ]
   }
   ```

3. **Disable for Performance**
   ```json
   {
     "enabled": false  // Disable TypeScript integration
   }
   ```

## Mode Management Issues

### Mode Switching Not Working

**Symptoms:**
- Mode commands not available
- Mode doesn't change
- Mode-specific rules not applying

**Solutions:**

1. **Check Mode Configuration**
   ```json
   // config/modes.json
   {
     "currentMode": "development",
     "customModes": {
       "development": {
         "name": "Development",
         "description": "Dev mode"
       }
     }
   }
   ```

2. **Verify Mode Commands**
   ```
   Command Palette → "Roo Code: Switch Mode"
   Command Palette → "Roo Code: Show Current Mode"
   ```

3. **Check Mode-Specific Rules**
   ```
   .roo/
   ├── rules-development/
   │   └── dev-rules.md
   └── rules-production/
       └── prod-rules.md
   ```

### Test File Isolation Issues

**Symptoms:**
- Test files not moved in production mode
- Files moved to wrong location
- Files not restored in development mode

**Solutions:**

1. **Check Test Patterns**
   ```json
   {
     "modes": {
       "production": {
         "testFilePatterns": [
           "**/*.test.ts",
           "**/*.spec.ts",
           "**/*.test.tsx",
           "**/*.spec.tsx"
         ]
       }
     }
   }
   ```

2. **Verify File Handling Config**
   ```json
   {
     "fileHandling": {
       "isolateTests": true,
       "testDirectory": ".roo/temp/tests"
     }
   }
   ```

3. **Manual File Restoration**
   ```bash
   # If automatic restoration fails
   cp -r .roo/temp/tests/* ./src/
   rm -rf .roo/temp/tests/
   ```

## Performance Issues

### Slow Extension Startup

**Symptoms:**
- VS Code takes long to load
- Extension activation timeout
- High CPU usage during startup

**Solutions:**

1. **Reduce File Watching Scope**
   ```json
   {
     "fileWatching": {
       "excludePatterns": [
         "**/node_modules/**",
         "**/dist/**",
         "**/build/**",
         "**/.git/**"
       ]
     }
   }
   ```

2. **Disable Heavy Features**
   ```json
   {
     "typescript": {
       "enabled": false  // Disable if not needed
     },
     "fileWatching": {
       "enabled": false  // Disable hot reloading
     }
   }
   ```

3. **Optimize Rule Files**
   - Split large rule files into smaller ones
   - Remove unused rules
   - Use specific patterns instead of broad ones

### High Memory Usage

**Symptoms:**
- VS Code using excessive RAM
- System slowdown
- Out of memory errors

**Solutions:**

1. **Clear Configuration Cache**
   ```
   Command Palette → "Roo Code: Clear Cache"
   ```

2. **Reduce Cache Size**
   ```json
   {
     "cache": {
       "maxSize": "50MB",
       "ttl": 300000  // 5 minutes
     }
   }
   ```

3. **Restart Extension**
   ```
   Command Palette → "Developer: Reload Window"
   ```

## File System Issues

### Permission Denied Errors

**Symptoms:**
- Cannot read .roo directory
- Cannot write configuration files
- File watching fails

**Solutions:**

1. **Fix Directory Permissions**
   ```bash
   # macOS/Linux
   chmod -R 755 .roo/
   chown -R $USER .roo/
   
   # Windows (run as administrator)
   icacls .roo /grant %USERNAME%:F /T
   ```

2. **Check VS Code Permissions**
   - Ensure VS Code has file system access
   - Check security software restrictions
   - Verify workspace trust settings

3. **Use Alternative Location**
   ```json
   {
     "configPath": "./config/roo/"  // Alternative location
   }
   ```

### Network Drive Issues

**Symptoms:**
- File watching not working on network drives
- Slow file operations
- Intermittent connection issues

**Solutions:**

1. **Enable Polling Mode**
   ```json
   {
     "fileWatching": {
       "usePolling": true,
       "pollingInterval": 1000
     }
   }
   ```

2. **Local Configuration**
   - Use local .roo directory
   - Sync configuration manually
   - Use version control for sharing

## Error Messages

### "Extension activation failed"

**Cause:** Extension failed to start properly

**Solutions:**
1. Check VS Code version compatibility
2. Look for conflicting extensions
3. Check Developer Console for detailed errors
4. Reinstall the extension

### "Cannot parse configuration file"

**Cause:** Invalid JSON in configuration files

**Solutions:**
1. Validate JSON syntax using online tools
2. Check for trailing commas
3. Ensure proper quote usage
4. Use VS Code's JSON validation

### "TypeScript compiler not found"

**Cause:** TypeScript not installed or not in PATH

**Solutions:**
1. Install TypeScript globally: `npm install -g typescript`
2. Install in project: `npm install --save-dev typescript`
3. Check PATH environment variable
4. Restart VS Code after installation

### "File watcher limit exceeded"

**Cause:** Too many files being watched

**Solutions:**
1. Increase system file watcher limit
2. Add more exclude patterns
3. Disable file watching for large projects
4. Use polling mode instead

## Getting Additional Help

### Diagnostic Information

Collect this information when reporting issues:

1. **Extension Version**
   ```
   Extensions view → Roo Code → Version
   ```

2. **VS Code Version**
   ```
   Help → About
   ```

3. **System Information**
   ```
   Help → About → Copy (includes system details)
   ```

4. **Extension Logs**
   ```
   View → Output → Roo Code
   ```

### Reporting Issues

When reporting issues, include:
- Steps to reproduce
- Expected vs actual behavior
- Error messages from Output panel
- Configuration files (sanitized)
- System information

### Community Support

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/RooCodeInc/Roo-Code/issues)
- **Discord**: [Join the community](https://discord.gg/roocode)
- **Documentation**: [Browse all guides](../../README.md)

---

**Related**: [Performance Guide](performance.md) | [Configuration Guide](../configuration/roo-directory.md) | [FAQ](../faq.md)
