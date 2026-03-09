#!/bin/bash

# MCP Servers Setup Script (Bash)
# Builds all MCP servers and configures Claude Desktop

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Functions
write_header() {
    echo -e "\n${CYAN}$(printf '=%.0s' {1..60})${NC}"
    echo -e "${CYAN}MCP SERVERS SETUP${NC}"
    echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}\n"
}

write_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

write_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

write_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

write_help() {
    cat << 'EOF'
MCP Servers Setup Script

USAGE:
    ./setup.sh [OPTIONS]

OPTIONS:
    --clean     Remove node_modules and dist directories before setup
    --help      Show this help message

EXAMPLES:
    ./setup.sh                 # Standard setup
    ./setup.sh --clean         # Clean rebuild
    ./setup.sh --help          # Show help

DESCRIPTION:
    This script:
    1. Installs npm dependencies for each MCP server
    2. Builds TypeScript to JavaScript
    3. Removes duplicate .js source files
    4. Updates Claude Desktop configuration
    5. Displays setup status

NEXT STEPS:
    1. Verify all servers built successfully
    2. Restart Claude Desktop (fully close, then reopen)
    3. Check "Connected to MCP Servers" notification
    4. Start using MCP tools in Claude
EOF
}

clean_servers() {
    write_info "Cleaning build artifacts..."
    
    local servers=("filesystem" "memory" "fetch" "playwright-generator" "everything" "sequentialthinking" "time")
    
    for server in "${servers[@]}"; do
        local server_path="$SCRIPT_DIR/src/$server"
        if [ -d "$server_path" ]; then
            write_info "Cleaning $server..."
            rm -rf "$server_path/node_modules" 2>/dev/null
            rm -rf "$server_path/dist" 2>/dev/null
            rm -f "$server_path/setup.js" 2>/dev/null
            rm -f "$server_path/setup.d.ts" 2>/dev/null
        fi
    done
    
    write_success "Clean complete"
}

build_server() {
    local server_name="$1"
    local server_path="$2"
    
    write_info "Building $server_name..."
    
    (
        cd "$server_path"
        npm install >/dev/null 2>&1 || { write_error "Failed to install dependencies for $server_name"; return 1; }
        npm run build >/dev/null 2>&1 || { write_error "Failed to build $server_name"; return 1; }
        
        if [ ! -f "$server_path/dist/index.js" ]; then
            write_error "$server_name build verification failed (dist/index.js not found)"
            return 1
        fi
        
        write_success "✓ $server_name built successfully"
    )
}

update_claude_config() {
    write_info "Updating Claude Desktop configuration..."
    
    local claude_config="$HOME/.config/Claude/claude_desktop_config.json"
    
    # Handle macOS path
    if [ -f "$HOME/Library/Application Support/Claude/claude_desktop_config.json" ]; then
        claude_config="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    fi
    
    if [ ! -f "$claude_config" ]; then
        write_error "Claude config not found at $claude_config"
        return 1
    fi
    
    # For now, show manual instruction since jq might not be available
    write_info "Please manually update Claude config at: $claude_config"
    write_info "Update these paths to point to the new builds:"
    write_info "  filesystem: $SCRIPT_DIR/src/filesystem/dist/index.js"
    write_info "  memory: $SCRIPT_DIR/src/memory/dist/index.js"
    write_info "  fetch: $SCRIPT_DIR/src/fetch/dist/index.js"
    write_info "  playwright-generator: $SCRIPT_DIR/src/playwright-generator/dist/index.js"
    
    return 0
}

# Main
write_header

all_success=true

# Parse arguments
for arg in "$@"; do
    case $arg in
        --clean)
            clean_servers
            ;;
        --help)
            write_help
            exit 0
            ;;
    esac
done

# Build servers
servers=(
    "filesystem:$SCRIPT_DIR/src/filesystem"
    "memory:$SCRIPT_DIR/src/memory"
    "fetch:$SCRIPT_DIR/src/fetch"
    "playwright-generator:$SCRIPT_DIR/src/playwright-generator"
)

for server_spec in "${servers[@]}"; do
    IFS=':' read -r name path <<< "$server_spec"
    echo ""
    echo -e "${YELLOW}--- Processing: $name ---${NC}"
    
    if [ ! -d "$path" ]; then
        write_error "Server not found at $path"
        all_success=false
        continue
    fi
    
    if ! build_server "$name" "$path"; then
        all_success=false
    fi
done

# Update config
echo ""
echo -e "${YELLOW}--- Updating Claude Desktop Configuration ---${NC}"
if ! update_claude_config; then
    all_success=false
fi

# Summary
echo ""
echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}"
if [ "$all_success" = true ]; then
    write_success "SETUP COMPLETE ✓"
    write_info "Next: Restart Claude Desktop to activate MCP servers"
else
    write_error "SETUP COMPLETED WITH ERRORS"
    write_info "Check errors above and retry"
fi
echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}\n"

exit $([ "$all_success" = true ] && echo 0 || echo 1)
