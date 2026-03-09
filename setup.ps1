param([switch]$Clean, [switch]$Help)

function show-help {
    @"

MCP SERVERS SETUP

USAGE:
    .\setup.ps1 [OPTIONS]

OPTIONS:
    -Clean    Remove node_modules and dist before setup
    -Help     Show this message

"@
}

if ($Help) { show-help; exit 0 }

$dir = Split-Path $MyInvocation.MyCommand.Path
Push-Location $dir

"`n===============================================================" 
"MCP SERVERS SETUP"
"===============================================================`n"

if ($Clean) {
    "Cleaning build artifacts..."
    @("filesystem", "memory", "playwright-generator") | % {
        rm -r "src/$_/node_modules" -Force -EA 0
        rm -r "src/$_/dist" -Force -EA 0
        "  Cleaned $_"
    }
    "`n"
}

$success = $true

@("filesystem", "memory", "playwright-generator") | % {
    $server = $_
    ""
    "--- Processing: $server ---"
    
    Push-Location "src/$server"
    
    npm install 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        "[ERROR] npm install failed for $server"
        $success = $false
        Pop-Location
        return
    }
    
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        "[ERROR] npm build failed for $server"
        $success = $false
        Pop-Location
        return
    }
    
    if (-not (Test-Path "dist/index.js")) {
        "[ERROR] Build verification failed for $server"
        $success = $false
        Pop-Location
        return
    }
    
    "[SUCCESS] OK $server built"
    Pop-Location
}

""
"--- Updating Claude Desktop Configuration ---"

$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configPath) {
    $json = Get-Content $configPath | ConvertFrom-Json
    $srcDir = (Get-Location).Path + "\src"
    
    $json.mcpServers.filesystem.args = @("$srcDir\filesystem\dist\index.js", "D:\Automation")
    $json.mcpServers.memory.args = @("$srcDir\memory\dist\index.js")
    $json.mcpServers.'playwright-generator'.args = @("$srcDir\playwright-generator\dist\index.js")
    
    $json | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
    "[SUCCESS] OK Claude Desktop config updated"
} else {
    "[ERROR] Claude config not found at $configPath"
    $success = $false
}

Pop-Location

"`n==============================================================="
if ($success) {
    "[SUCCESS] SETUP COMPLETE"
    "[INFO] Restart Claude Desktop to activate MCP servers"
} else {
    "[ERROR] SETUP FAILED - Check errors above"
}
"===============================================================`n"

if ($success) { exit 0 } else { exit 1 }
