# MCP Servers Setup

Complete TypeScript-based setup system for Model Context Protocol servers.

## Quick Start

### Windows (PowerShell)
```powershell
cd d:\Automation\mcp-servers
.\setup.ps1
```

### macOS/Linux (Bash)
```bash
cd /path/to/mcp-servers
chmod +x setup.sh
./setup.sh
```

## Setup Scripts

Three ways to set up all MCP servers:

### 1. PowerShell Script (Recommended for Windows)
```powershell
.\setup.ps1              # Standard setup
.\setup.ps1 -Clean       # Clean rebuild (removes node_modules and dist)
.\setup.ps1 -Help        # Show help
```

### 2. Bash Script (macOS/Linux)
```bash
./setup.sh               # Standard setup
./setup.sh --clean       # Clean rebuild
./setup.sh --help        # Show help
```

### 3. TypeScript Setup Script (Advanced)
```bash
# Install tsx first (if not already installed)
npm install -g tsx

# Run setup
cd d:\Automation\mcp-servers
npm run setup
```

Or compile TypeScript and run:
```bash
npm run setup-build
```

## What the Setup Does

1. **Installs Dependencies** - Runs `npm install` for each server
2. **Builds TypeScript** - Compiles `.ts` to `.js` via `npm run build`
3. **Cleans Duplicates** - Removes old `.js` source files (keeps only `.ts`)
4. **Verifies Builds** - Checks that `dist/index.js` exists for each server
5. **Updates Claude Config** - Modifies `claude_desktop_config.json` with new paths
6. **Reports Status** - Shows which servers built successfully

## Server Directories

| Server | Path | Type |
|--------|------|------|
| Filesystem | `src/filesystem` | TypeScript |
| Memory | `src/memory` | TypeScript |
| Fetch | `src/fetch` | TypeScript |
| Playwright Generator | `src/playwright-generator` | TypeScript |
| Everything | `src/everything` | TypeScript |
| Sequential Thinking | `src/sequentialthinking` | TypeScript |
| Time | `src/time` | TypeScript |
| Git | `src/git` | Python |

## Individual Server Setup

To build a single server:

```bash
# TypeScript servers
cd src/filesystem
npm install
npm run build

# View built files
ls dist/
```

## Configuration

### Claude Desktop Config
After setup, verify `claude_desktop_config.json` contains:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["D:\\Automation\\mcp-servers\\src\\filesystem\\dist\\index.js", "D:\\Automation"]
    },
    "memory": {
      "command": "node",
      "args": ["D:\\Automation\\mcp-servers\\src\\memory\\dist\\index.js"]
    },
    "fetch": {
      "command": "node",
      "args": ["D:\\Automation\\mcp-servers\\src\\fetch\\dist\\index.js"]
    },
    "playwright-generator": {
      "command": "node",
      "args": ["D:\\Automation\\mcp-servers\\src\\playwright-generator\\dist\\index.js"]
    }
  }
}
```

**Location:**
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

## Troubleshooting

### "Setup complete but MCP not connecting"
1. **Restart Claude Desktop** - Fully close and reopen (not minimize)
2. **Wait 5 seconds** before opening Claude
3. **Check status** - Should show "Connected to MCP Servers"

### "Build failed for [server]"
1. **Check Node.js version:** `node --version` (requires 16+)
2. **Check npm version:** `npm --version` (requires 8+)
3. **Clean and rebuild:**
   ```bash
   .\setup.ps1 -Clean  # on Windows
   ./setup.sh --clean   # on macOS/Linux
   ```

### "TypeScript compilation errors"
1. Each server has its own `tsconfig.json`
2. Check for syntax errors in TypeScript files
3. Verify all dependencies are installed: `npm install`

### "dist/index.js not found after build"
1. Check build output: `npm run build` in the server directory
2. Verify `tsconfig.json` has correct `outDir: "./dist"`
3. Ensure no TypeScript errors prevent compilation

## Development

### Watch Mode (Auto-rebuild on changes)
```bash
cd src/playwright-generator
npm run watch
```

### Building All Servers
```bash
npm run build --workspaces
```

### Testing
```bash
npm run test --workspaces
```

## Next Steps

After successful setup:

1. **Restart Claude Desktop** - Close completely and reopen
2. **Verify Connection** - Check "Connected to MCP Servers" appears
3. **Test Tools** - Use MCP tools in Claude conversation
4. **Generate Tests** - Use playwright-generator tool for test creation

## Examples

### Using Playwright Generator MCP

**Prompt in Claude:**
```
Use the playwright-generator MCP to create a TypeScript test 
for login on demoblaze.com with email and password
```

**Prompt in Claude:**
```
Create a page object in Python for the checkout flow 
using the playwright-generator MCP
```

## File Structure

```
mcp-servers/
├── setup.ts              # Main TypeScript setup script
├── setup.ps1             # PowerShell wrapper
├── setup.sh              # Bash wrapper
├── tsconfig.json         # Root TypeScript config
├── package.json          # Root package config (workspaces)
├── src/
│   ├── filesystem/
│   │   ├── src/          # TypeScript source
│   │   ├── dist/         # Compiled JavaScript
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── index.ts
│   ├── memory/
│   ├── fetch/
│   ├── playwright-generator/
│   └── ... (other servers)
└── README.md             # This file
```

## Maintenance

### Regular Maintenance
```bash
# Update all dependencies
npm update --workspaces

# Check for security vulnerabilities
npm audit --workspaces

# Fix vulnerabilities automatically  
npm audit fix --workspaces
```

### Clean Rebuild
```powershell
# Windows
.\setup.ps1 -Clean
```

```bash
# macOS/Linux
./setup.sh --clean
```

## Contributing

When adding a new MCP server:

1. Create directory: `src/[server-name]/`
2. Add TypeScript files (`.ts`)
3. Create `package.json` with build script
4. Create `tsconfig.json` 
5. Run `npm run setup` to build and configure

## Support

For issues:
1. Check TypeScript error messages
2. Verify Node.js/npm versions
3. Ensure paths in config are correct
4. Check terminal output for detailed errors

---

**Last Updated:** March 2026  
**Node.js Version Required:** 16+  
**npm Version Required:** 8+
