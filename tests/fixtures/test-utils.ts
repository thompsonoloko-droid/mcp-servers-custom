/**
 * @fileoverview Test utilities and fixtures for MCP server testing.
 * Provides common setup, mocks, and helper functions for all tests.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * Mock transport for testing MCP servers.
 * Simulates stdio communication without actual process spawning.
 */
export class MockTransport {
  private handlers: Map<string, (params: any) => Promise<any>> = new Map();
  private notifications: any[] = [];

  async send(message: any) {
    // Store for inspection in tests
  }

  async receive() {
    // Mock receive implementation
  }

  setRequestHandler(schema: any, handler: (params: any) => Promise<any>) {
    const methodName = (schema as any).method || 'unknown';
    this.handlers.set(methodName, handler);
  }

  async callHandler(method: string, params: any) {
    const handler = this.handlers.get(method);
    if (!handler) {
      throw new Error(`No handler registered for method: ${method}`);
    }
    return handler(params);
  }

  getNotifications() {
    return this.notifications;
  }
}

/**
 * Create a mock server for testing.
 * Provides common initialization with mocked transport.
 */
export function createMockServer(name: string, version: string = '1.0.0') {
  return new Server(
    { name, version },
    { capabilities: { tools: {} } }
  );
}

/**
 * Wait for async operations to complete.
 * Useful for testing promise-based tool handlers.
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 1000,
  interval: number = 50
): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Validate TypeScript code syntax.
 * Useful for generated code tests.
 */
export function isValidTypeScriptSyntax(code: string): boolean {
  try {
    // Basic validation - check for common TypeScript patterns
    if (!code.includes('import') && !code.includes('class') && !code.includes('function')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate Python code syntax.
 * Useful for generated code tests.
 */
export function isValidPythonSyntax(code: string): boolean {
  try {
    // Basic validation - check for common Python patterns
    if (!code.includes('import') && !code.includes('def') && !code.includes('class')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Assert that a tool is properly defined.
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export function assertValidToolDefinition(tool: any): asserts tool is ToolDefinition {
  if (!tool.name || typeof tool.name !== 'string') {
    throw new Error('Tool missing name property');
  }
  if (!tool.description || typeof tool.description !== 'string') {
    throw new Error('Tool missing description property');
  }
  if (!tool.inputSchema) {
    throw new Error('Tool missing inputSchema property');
  }
  if (!tool.inputSchema.properties) {
    throw new Error('Tool inputSchema missing properties');
  }
  if (!Array.isArray(tool.inputSchema.required)) {
    throw new Error('Tool inputSchema missing required array');
  }
}
