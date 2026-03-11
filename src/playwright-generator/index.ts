#!/usr/bin/env node

/**
 * @fileoverview MCP Server for generating Playwright tests from natural language descriptions.
 * 
 * This server provides tools for:
 * - Generating TypeScript Playwright tests from natural language
 * - Generating Python Playwright tests from natural language
 * - Creating Page Object Model (POM) classes
 * - Analyzing page structure and extracting selectors
 * 
 * @author Automation Framework Team
 * @version 1.0.0
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, TextContent } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

/**
 * Initialize the MCP server with tool capabilities.
 * Declares support for tools before setting up request handlers.
 */
const server = new Server(
  {
    name: "playwright-generator",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // Declare tools capability to enable tool call handling
    },
  }
);

/**
 * Handle tool call requests from Claude.
 * Routes to appropriate tool handler based on tool name.
 * 
 * Supported tools:
 * - generate_ts_test: Generate TypeScript Playwright test
 * - generate_python_test: Generate Python Playwright test
 * - create_page_object: Generate Page Object Model class
 * - analyze_page_structure: Analyze page and extract selectors
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments as Record<string, string>;

  /**
   * Tool: generate_ts_test
   * Generates a TypeScript Playwright test template from natural language.
   * 
   * Parameters:
   * - description: Natural language description of what the test should do
   * - project_path: Optional path to the Playwright project
   * 
   * Returns: Test code template ready for customization
   */
  if (toolName === "generate_ts_test") {
    const testDescription = args.description;
    const projectPath = args.project_path || "D:\\Automation\\automation_playwright_ts";
    
    const testCode = `import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/home-page";
import { LoginPage } from "../pages/login-page";

test("${testDescription.replace(/"/g, '\\"')}", async ({ page }) => {
  // TODO: Implement test based on description
  // ${testDescription}
  // 
  // Generated from natural language prompt.
  // Please review and complete the implementation.
  
  const homePage = new HomePage(page);
  await homePage.goto();
  
  // Add your test steps here
});
`;

    return {
      content: [
        {
          type: "text" as const,
          text: `Generated TypeScript Playwright test:\n\n\`\`\`typescript\n${testCode}\n\`\`\`\n\n**Instructions:**\n1. Review the generated test template\n2. Implement the actual test steps\n3. Add assertions\n4. Save to: tests/ui/generated-tests.spec.ts`,
        },
      ],
    };
  }

  /**
   * Tool: generate_python_test
   * Generates a Python Playwright test template from natural language.
   * 
   * Parameters:
   * - description: Natural language description of what the test should do
   * 
   * Returns: Python test code template ready for customization
   */
  if (toolName === "generate_python_test") {
    const testDescription = args.description;
    
    const testCode = `import pytest
from pages.home_page import HomePage
from pages.login_page import LoginPage


def test_${testDescription.toLowerCase().replace(/[^a-z0-9]/g, "_")}(page):
    """${testDescription}
    
    Generated from natural language prompt.
    """
    home_page = HomePage(page)
    home_page.goto()
    
    # TODO: Implement test steps
    # ${testDescription}
    
    # Add your assertions here
    assert True
`;

    return {
      content: [
        {
          type: "text" as const,
          text: `Generated Python Playwright test:\n\n\`\`\`python\n${testCode}\n\`\`\`\n\n**Instructions:**\n1. Review the generated test template\n2. Implement the actual test steps\n3. Add assertions\n4. Save to: tests/ui/test_generated.py`,
        },
      ],
    };
  }

  if (toolName === "analyze_page_structure") {
    const pageFile = args.page_file;
    const projectPath = args.project_path || "D:\\Automation\\automation_playwright_ts";
    
    try {
      const filePath = path.join(projectPath, pageFile);
      const content = fs.readFileSync(filePath, "utf-8");
      
      // Extract locators and methods
      const locators = content.match(/^\s*[A-Z_]+\s*=\s*['"].*?['"]/gm) || [];
      const methods = content.match(/\s*(?:async\s+)?[a-z]\w*\s*\(.*?\)\s*{/gm) || [];

      return {
        content: [
          {
            type: "text" as const,
            text: `**Page Structure Analysis for ${pageFile}:**\n\n**Locators:**\n${locators.map(l => `- ${l.trim()}`).join("\n")}\n\n**Methods:**\n${methods.map(m => `- ${m.trim()}`).join("\n")}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error analyzing page: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
      };
    }
  }

  if (toolName === "create_page_object") {
    const pageName = args.page_name;
    const language = args.language || "typescript";
    
    if (language === "typescript") {
      const code = `import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

export class ${pageName}Page extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Define locators
  // Example: get submitButton(): Locator {
  //   return this.page.locator("button[type='submit']");
  // }

  // Define methods
  // Example: async clickSubmit(): Promise<void> {
  //   await this.submitButton.click();
  // }
}
`;

      return {
        content: [
          {
            type: "text" as const,
            text: `Generated Page Object (TypeScript):\n\n\`\`\`typescript\n${code}\n\`\`\`\n\n**Next Steps:**\n1. Add locator definitions\n2. Implement page methods\n3. Add JSDoc comments\n4. Save to: pages/${pageName.toLowerCase()}-page.ts`,
          },
        ],
      };
    } else {
      const code = `from playwright.sync_api import Page
from pages.base_page import BasePage


class ${pageName}Page(BasePage):
    """Page Object for ${pageName}."""
    
    def __init__(self, page: Page) -> None:
        super().__init__(page)
    
    # Define locators as class constants
    # Example: BUTTON_SUBMIT = "button[type='submit']"
    
    # Define methods
    # Example: def click_submit(self) -> None:
    #     self.click(self.BUTTON_SUBMIT)
`;

      return {
        content: [
          {
            type: "text" as const,
            text: `Generated Page Object (Python):\n\n\`\`\`python\n${code}\n\`\`\`\n\n**Next Steps:**\n1. Add locator definitions\n2. Implement page methods\n3. Add docstrings\n4. Save to: pages/${pageName.toLowerCase()}_page.py`,
          },
        ],
      };
    }
  }

  return {
    content: [
      {
        type: "text" as const,
        text: `Unknown tool: ${toolName}`,
      },
    ],
  };
});

/**
 * Handles ListToolsRequest to return all available tools.
 * This handler defines the schema and descriptions for all tools supported by the server.
 * Clients use this to discover available capabilities and construct tool invocations.
 *
 * @async
 * @returns {Promise<Object>} Object containing array of tool definitions with schemas
 * @example
 * // Returns all 4 tools with their input schemas:
 * // - generate_ts_test: TypeScript test generation
 * // - generate_python_test: Python test generation
 * // - analyze_page_structure: Page object analysis
 * // - create_page_object: Page object template generation
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_ts_test",
        description: "Generate a TypeScript Playwright test from a natural language description",
        inputSchema: {
          type: "object" as const,
          properties: {
            description: {
              type: "string",
              description: "Natural language description of what the test should do",
            },
            project_path: {
              type: "string",
              description: "Path to the Playwright project (optional)",
            },
          },
          required: ["description"],
        },
      },
      {
        name: "generate_python_test",
        description: "Generate a Python Playwright test from a natural language description",
        inputSchema: {
          type: "object" as const,
          properties: {
            description: {
              type: "string",
              description: "Natural language description of what the test should do",
            },
          },
          required: ["description"],
        },
      },
      {
        /**
         * Tool: analyze_page_structure
         * Analyzes an existing page object file to extract locators and methods.
         * Useful for understanding page object organization and identifying patterns.
         *
         * @param {string} page_file - Path to page object file (relative to project root)
         * @param {string} project_path - Root path to Playwright project
         * @returns {Object} Analysis results with extracted locators and methods
         * @example
         * // Analyzes pages/login_page.py or pages/login-page.ts
         * // Returns: list of locators (selectors), methods, and class structure
         */
        name: "analyze_page_structure",
        description: "Analyze a page object file to extract locators and methods",
        inputSchema: {
          type: "object" as const,
          properties: {
            page_file: {
              type: "string",
              description: "Path to the page object file (relative to project)",
            },
            project_path: {
              type: "string",
              description: "Path to the Playwright project",
            },
          },
          required: ["page_file", "project_path"],
        },
      },
      {
        /**
         * Tool: create_page_object
         * Generates a new page object template for either TypeScript or Python.
         * Provides boilerplate structure following Page Object Model best practices.
         *
         * @param {string} page_name - Name of the page (e.g., 'Login', 'Dashboard', 'Checkout')
         * @param {string} language - Target language: 'typescript' or 'python'
         * @returns {Object} Generated page object template code
         * @example
         * // Language: 'typescript' returns ts class with PlaywrightLocators
         * // Language: 'python' returns Python class inheriting from BasePage
         * // Include comments on how to add locators and implement methods
         */
        name: "create_page_object",
        description: "Generate a new page object template",
        inputSchema: {
          type: "object" as const,
          properties: {
            page_name: {
              type: "string",
              description: "Name of the page (e.g., 'Login', 'Dashboard')",
            },
            language: {
              type: "string",
              description: "Language: 'typescript' or 'python'",
            },
          },
          required: ["page_name", "language"],
        },
      },
    ],
  };
});

/**
 * Main entry point for the MCP server.
 * Initializes the server transport and establishes connection with the MCP host.
 * The server remains running, listening for tool call requests over stdio.
 *
 * Execution Flow:
 * 1. Creates StdioServerTransport for stdio-based communication
 * 2. Connects the server to the transport
 * 3. Logs success confirmation
 * 4. Server enters listening state until process termination
 *
 * @async
 * @returns {Promise<void>} Resolves when server connects successfully
 * @throws {Error} If server fails to connect (caught by .catch() below)
 *
 * @example
 * // Called automatically on script execution
 * // Process will exit with code 1 if connection fails
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[playwright-generator] MCP server started successfully");
}

/**
 * Execute main() and handle startup errors.
 * If the main function fails, logs the error and exits with error code.
 * This is critical for CI/CD systems to detect startup failures.
 */
main().catch((error) => {
  console.error("[playwright-generator] Server error:", error);
  process.exit(1);
});
