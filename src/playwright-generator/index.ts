#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, TextContent } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

const server = new Server({
  name: "playwright-generator",
  version: "1.0.0",
});

// Tool: Generate TypeScript Playwright test from natural language
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments as Record<string, string>;

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

// Define available tools
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[playwright-generator] MCP server started successfully");
}

main().catch((error) => {
  console.error("[playwright-generator] Server error:", error);
  process.exit(1);
});
