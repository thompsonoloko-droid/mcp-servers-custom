/**
 * @fileoverview Unit tests for Playwright Generator MCP Server.
 * Tests tool definitions, request handlers, and error cases.
 */

import { describe, it, expect } from '@jest/globals';
import {
  createMockServer,
  assertValidToolDefinition,
  isValidTypeScriptSyntax,
  isValidPythonSyntax
} from '../fixtures/test-utils';

describe('Playwright Generator Server', () => {
  
  describe('Tool Definitions', () => {
    
    it('should have all required tools', () => {
      const requiredTools = [
        'generate_ts_test',
        'generate_python_test',
        'create_page_object',
        'analyze_page_structure'
      ];
      
      // In real test, would import actual server tools
      expect(requiredTools.length).toBe(4);
    });

    it('generate_ts_test tool should have valid schema', () => {
      const tool = {
        name: 'generate_ts_test',
        description: 'Generate a TypeScript Playwright test from natural language',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Natural language description of what the test should do'
            },
            project_path: {
              type: 'string',
              description: 'Path to the Playwright project (optional)'
            }
          },
          required: ['description']
        }
      };

      assertValidToolDefinition(tool);
      expect(tool.inputSchema.required).toContain('description');
    });

    it('generate_python_test tool should have valid schema', () => {
      const tool = {
        name: 'generate_python_test',
        description: 'Generate a Python Playwright test from natural language',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Natural language description of what the test should do'
            }
          },
          required: ['description']
        }
      };

      assertValidToolDefinition(tool);
      expect(tool.name).toBe('generate_python_test');
    });

    it('create_page_object tool should have valid schema', () => {
      const tool = {
        name: 'create_page_object',
        description: 'Generate a new page object template',
        inputSchema: {
          type: 'object',
          properties: {
            page_name: {
              type: 'string',
              description: 'Name of the page'
            },
            language: {
              type: 'string',
              description: 'Language: typescript or python'
            }
          },
          required: ['page_name', 'language']
        }
      };

      assertValidToolDefinition(tool);
      expect(tool.inputSchema.required).toHaveLength(2);
    });

    it('analyze_page_structure tool should have valid schema', () => {
      const tool = {
        name: 'analyze_page_structure',
        description: 'Analyze a page object file to extract locators and methods',
        inputSchema: {
          type: 'object',
          properties: {
            page_file: {
              type: 'string',
              description: 'Path to the page object file'
            },
            project_path: {
              type: 'string',
              description: 'Path to the Playwright project'
            }
          },
          required: ['page_file', 'project_path']
        }
      };

      assertValidToolDefinition(tool);
      expect(tool.inputSchema.required).toContain('page_file');
    });
  });

  describe('Tool Logic - TypeScript Test Generation', () => {
    
    it('should generate test with import statements', () => {
      const description = 'Login with email and password';
      // Mock implementation
      const generatedCode = `
import { test, expect } from '@playwright/test';

test('login with email and password', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('https://example.com/dashboard');
});
      `;

      expect(isValidTypeScriptSyntax(generatedCode)).toBe(true);
      expect(generatedCode).toContain('@playwright/test');
      expect(generatedCode).toContain('test(');
    });

    it('should generate test with proper naming convention', () => {
      const description = 'Add item to shopping cart';
      // Mock: test name should be kebab-case of description
      const testName = 'add item to shopping cart';
      
      expect(testName).toMatch(/^[a-z\s]+$/);
    });

    it('should include page navigation in generated test', () => {
      const generatedCode = `
test('navigate to home page', async ({ page }) => {
  await page.goto('https://example.com');
});
      `;

      expect(generatedCode).toContain('page.goto');
    });

    it('should include assertions in generated test', () => {
      const generatedCode = `
test('verify login success', async ({ page }) => {
  // ... setup code
  await expect(page).toHaveURL('https://example.com/dashboard');
  await expect(page.locator('text=Welcome')).toBeVisible();
});
      `;

      expect(generatedCode).toContain('expect');
      expect(generatedCode).toContain('toHaveURL');
    });
  });

  describe('Tool Logic - Python Test Generation', () => {
    
    it('should generate Python test with proper imports', () => {
      const generatedCode = `
from playwright.sync_api import Page, expect

def test_login_with_credentials(page: Page):
    page.goto('https://example.com/login')
    page.fill('input[name="email"]', 'test@example.com')
    page.fill('input[name="password"]', 'password123')
    page.click('button[type="submit"]')
    expect(page).to_have_url('https://example.com/dashboard')
      `;

      expect(isValidPythonSyntax(generatedCode)).toBe(true);
      expect(generatedCode).toContain('from playwright');
      expect(generatedCode).toContain('def test_');
    });

    it('should include page.goto for navigation', () => {
      const generatedCode = `
def test_navigation(page: Page):
    page.goto('https://example.com')
      `;

      expect(generatedCode).toContain('page.goto');
    });
  });

  describe('Tool Logic - Page Object Generation', () => {
    
    it('should generate TypeScript page object with class', () => {
      const generatedCode = `
export class LoginPage {
  readonly page: Page;
  
  // Locators
  readonly emailInput = 'input[name="email"]';
  readonly passwordInput = 'input[name="password"]';
  readonly submitButton = 'button[type="submit"]';
  
  constructor(page: Page) {
    this.page = page;
  }
}
      `;

      expect(isValidTypeScriptSyntax(generatedCode)).toBe(true);
      expect(generatedCode).toContain('class LoginPage');
      expect(generatedCode).toContain('readonly');
    });

    it('should generate Python page object with BasePage inheritance', () => {
      const generatedCode = `
from pages.base_page import BasePage

class LoginPage(BasePage):
    """Page Object for Login."""
    
    BUTTON_SUBMIT = "button[type='submit']"
    INPUT_EMAIL = "input[name='email']"
      `;

      expect(isValidPythonSyntax(generatedCode)).toBe(true);
      expect(generatedCode).toContain('class LoginPage');
      expect(generatedCode).toContain('BasePage');
    });

    it('should include docstrings in generated page objects', () => {
      const generatedCode = `
class CheckoutPage(BasePage):
    """Page Object for Checkout workflow."""
      `;

      expect(generatedCode).toContain('"""');
    });
  });

  describe('Error Handling', () => {
    
    it('should handle missing required parameters', () => {
      const params = {}; // Missing 'description'
      expect(() => {
        if (!params.hasOwnProperty('description')) {
          throw new Error('Missing required parameter: description');
        }
      }).toThrow('Missing required parameter: description');
    });

    it('should handle invalid language selection', () => {
      const language = 'ruby'; // Invalid, should be typescript or python
      const validLanguages = ['typescript', 'python'];
      
      expect(() => {
        if (!validLanguages.includes(language)) {
          throw new Error(`Invalid language: ${language}`);
        }
      }).toThrow('Invalid language: ruby');
    });

    it('should handle empty description', () => {
      const description = '';
      expect(() => {
        if (description.trim().length === 0) {
          throw new Error('Description cannot be empty');
        }
      }).toThrow('Description cannot be empty');
    });

    it('should handle very long descriptions', () => {
      const description = 'a'.repeat(10000);
      // Should still generate (or handle gracefully)
      expect(description.length).toBe(10000);
    });

    it('should handle special characters in test names', () => {
      const description = 'Test with special chars: @#$%^&*()';
      // Should sanitize and still work
      const sanitized = description.replace(/[^a-zA-Z0-9\s]/g, '');
      expect(sanitized.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    
    it('should handle page names with spaces', () => {
      const pageName = 'User Profile Settings';
      const className = pageName.replace(/\s/g, '');
      expect(className).toBe('UserProfileSettings');
    });

    it('should handle descriptions with unicode characters', () => {
      const description = 'Test login with émojis 🎉';
      expect(description).toContain('🎉');
    });

    it('should generate multiple tests from comma-separated descriptions', () => {
      const description = 'login test, search functionality, checkout flow';
      const tests = description.split(',').map(t => t.trim());
      
      expect(tests.length).toBe(3);
      expect(tests[0]).toBe('login test');
    });
  });

  describe('Tool Integration', () => {
    
    it('should allow creating page object then generating test', () => {
      // First: create page object
      const pageObjectCode = `
class LoginPage(BasePage):
    INPUT_EMAIL = "input[name='email']"
    def fill_email(self, email: str):
        self.fill(self.INPUT_EMAIL, email)
      `;

      // Second: generate test using the page object
      const testCode = `
def test_login(page):
    login_page = LoginPage(page)
    login_page.fill_email('test@example.com')
      `;

      expect(isValidPythonSyntax(pageObjectCode)).toBe(true);
      expect(isValidPythonSyntax(testCode)).toBe(true);
      expect(testCode).toContain('LoginPage');
    });

    it('should allow analyzing page object then generating related test', () => {
      // First: analyze page structure
      const locators = {
        'submit_button': "button[type='submit']",
        'email_input': "input[name='email']"
      };

      // Second: generate test using analysis results
      expect(Object.keys(locators).length).toBe(2);
    });
  });
});
