#!/usr/bin/env node

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

/**
 * MCP Servers Setup & Build Script
 * Manages building, installing, and configuring all MCP servers
 */

const SERVERS_DIR = path.join(__dirname, "src");
const MCP_SERVERS = ["filesystem", "memory", "fetch", "playwright-generator"];
const CLAUDE_CONFIG_PATH = path.join(
  process.env.APPDATA || "",
  "Claude",
  "claude_desktop_config.json"
);

interface ServerConfig {
  name: string;
  path: string;
  type: "typescript" | "python";
  distFile: string;
}

const serverConfigs: ServerConfig[] = [
  {
    name: "filesystem",
    path: path.join(SERVERS_DIR, "filesystem"),
    type: "typescript",
    distFile: "dist/index.js",
  },
  {
    name: "memory",
    path: path.join(SERVERS_DIR, "memory"),
    type: "typescript",
    distFile: "dist/index.js",
  },
  {
    name: "fetch",
    path: path.join(SERVERS_DIR, "fetch"),
    type: "typescript",
    distFile: "dist/index.js",
  },
  {
    name: "playwright-generator",
    path: path.join(SERVERS_DIR, "playwright-generator"),
    type: "typescript",
    distFile: "dist/index.js",
  },
];

/**
 * Log with formatting
 */
function log(message: string, level: "info" | "success" | "error" | "warn" = "info") {
  const colors = {
    info: "\x1b[36m", // Cyan
    success: "\x1b[32m", // Green
    error: "\x1b[31m", // Red
    warn: "\x1b[33m", // Yellow
    reset: "\x1b[0m",
  };

  console.log(`${colors[level]}[${level.toUpperCase()}]${colors.reset} ${message}`);
}

/**
 * Execute command with error handling
 */
function execCommand(command: string, cwd: string): boolean {
  try {
    execSync(command, { cwd, stdio: "inherit" });
    return true;
  } catch (error) {
    log(`Failed: ${command}`, "error");
    return false;
  }
}

/**
 * Clean duplicate .js source files (keep only TypeScript)
 */
function cleanDuplicateSourceFiles(serverPath: string, serverName: string) {
  const sourceJsFiles = [
    "index.js",
    "lib.js",
    "path-utils.js",
    "path-validation.js",
    "roots-utils.js",
    "vitest.config.js",
  ];

  for (const file of sourceJsFiles) {
    const filePath = path.join(serverPath, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log(`Removed duplicate: ${serverName}/${file}`, "info");
    }
  }
}

/**
 * Install dependencies for a server
 */
function installDependencies(serverPath: string, serverName: string): boolean {
  log(`Installing dependencies for ${serverName}...`, "info");
  return execCommand("npm install", serverPath);
}

/**
 * Build TypeScript server
 */
function buildServer(serverPath: string, serverName: string): boolean {
  log(`Building ${serverName}...`, "info");
  
  if (!execCommand("npm run build", serverPath)) {
    return false;
  }

  // Verify dist file exists
  const distFile = path.join(serverPath, "dist", "index.js");
  if (!fs.existsSync(distFile)) {
    log(`Build verification failed: ${serverName}/dist/index.js not found`, "error");
    return false;
  }

  log(`✓ ${serverName} built successfully`, "success");
  return true;
}

/**
 * Update Claude Desktop configuration
 */
function updateClaudeConfig(servers: ServerConfig[]): boolean {
  try {
    if (!fs.existsSync(CLAUDE_CONFIG_PATH)) {
      log(`Claude config not found at ${CLAUDE_CONFIG_PATH}`, "warn");
      return false;
    }

    const config = JSON.parse(fs.readFileSync(CLAUDE_CONFIG_PATH, "utf-8"));

    // Update each MCP server config
    for (const server of servers) {
      const distPath = path.join(server.path, server.distFile).replace(/\\/g, "\\\\");
      
      if (server.type === "typescript") {
        config.mcpServers[server.name] = {
          command: "node",
          args: [distPath],
        };
      }
    }

    // Special case for filesystem: add workspace root argument
    const filesystemDistPath = path
      .join(SERVERS_DIR, "filesystem", "dist", "index.js")
      .replace(/\\/g, "\\\\");
    config.mcpServers.filesystem.args = [filesystemDistPath, "D:\\Automation"];

    fs.writeFileSync(CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2));
    log("✓ Claude Desktop config updated", "success");
    return true;
  } catch (error) {
    log(`Failed to update Claude config: ${error}`, "error");
    return false;
  }
}

/**
 * Main setup process
 */
async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("MCP SERVERS SETUP");
  console.log("=".repeat(60) + "\n");

  let allSuccess = true;

  // Setup each server
  for (const server of serverConfigs) {
    console.log(`\n--- Processing: ${server.name} ---`);

    if (!fs.existsSync(server.path)) {
      log(`Server not found at ${server.path}`, "error");
      allSuccess = false;
      continue;
    }

    // Clean duplicate source files
    cleanDuplicateSourceFiles(server.path, server.name);

    // Install dependencies
    if (!installDependencies(server.path, server.name)) {
      allSuccess = false;
      continue;
    }

    // Build
    if (!buildServer(server.path, server.name)) {
      allSuccess = false;
      continue;
    }
  }

  // Update Claude config
  console.log("\n--- Updating Claude Desktop Configuration ---");
  if (updateClaudeConfig(serverConfigs)) {
    console.log(
      "\n✓ All servers configured. Restart Claude Desktop to activate MCP servers."
    );
  } else {
    log("Warning: Could not update Claude config automatically", "warn");
    console.log("Please verify Claude Desktop configuration manually.");
  }

  console.log("\n" + "=".repeat(60));
  if (allSuccess) {
    log("SETUP COMPLETE ✓", "success");
  } else {
    log("SETUP COMPLETED WITH ERRORS", "error");
  }
  console.log("=".repeat(60) + "\n");

  process.exit(allSuccess ? 0 : 1);
}

main().catch((error) => {
  log(`Fatal error: ${error}`, "error");
  process.exit(1);
});
