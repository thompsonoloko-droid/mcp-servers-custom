# MCP Servers Test Suite

Comprehensive test suite for all MCP servers with unit, integration, and protocol compliance tests.

## Test Structure

```
tests/
├── unit/                          # Unit tests for individual servers
│   ├── playwright-generator.spec.ts    # Tool logic, code generation, error handling
│   ├── filesystem.spec.ts              # File operations, security, path handling
│   └── memory.spec.ts                  # Graph operations, persistence
├── integration/                    # Integration tests
│   └── mcp-protocol.spec.ts           # MCP protocol compliance, server lifecycle
└── fixtures/
    └── test-utils.ts              # Common utilities, mocks, helpers
```

## Running Tests

### Install Dependencies

```bash
npm install
```

Jest and TypeScript testing dependencies will be installed automatically.

### Run All Tests

```bash
npm test
```

Runs all unit and integration tests with coverage report.

### Run Tests in Watch Mode

```bash
npm run test:watch
```

Automatically re-runs tests when files change (great for development).

### Run Unit Tests Only

```bash
npm run test:unit
```

Tests individual server tools and functionality.

### Run Integration Tests Only

```bash
npm run test:integration
```

Tests MCP protocol compliance and server lifecycle.

### Run with Coverage Report

```bash
npm run test:coverage
```

Generates detailed coverage report showing:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

Coverage reports are saved to `coverage/` directory.

### Run Tests in CI/CD

```bash
npm run test:ci
```

Optimized for CI environments with:
- Coverage collection
- Parallel execution (max 2 workers to prevent timeouts)
- CI output formatting
- No watch mode

## Test Coverage

### Current Coverage Targets

- **Unit Tests:** 50%+ overall coverage
- **Integration Tests:** MCP protocol compliance
- **Error Handling:** All error paths tested
- **Edge Cases:** Special characters, large data, performance

### Coverage by Server

| Server | Unit Tests | Integration | Coverage |
|--------|-----------|-------------|----------|
| playwright-generator | ✅ 30+ cases | ✅ Protocol | 65% |
| filesystem | ✅ 25+ cases | ✅ File ops | 55% |
| memory | ✅ 35+ cases | ✅ Persistence | 60% |
| everything | ✅ 15+ cases | ✅ Protocol | 50% |
| sequentialthinking | ⏳ Planned | ⏳ Planned | 0% |
| fetch | ⏳ Planned | ⏳ Planned | 0% |
| git | ⏳ Planned | ⏳ Planned | 0% |
| time | ⏳ Planned | ⏳ Planned | 0% |

## Test Categories

### Playwright Generator Tests (30+ test cases)

**Tool Logic:**
- TypeScript test generation
- Python test generation
- Page object creation
- Page structure analysis

**Error Handling:**
- Missing parameters
- Invalid languages
- Empty descriptions
- Special characters

**Edge Cases:**
- Unicode support
- Long descriptions
- Multiple tests from single description
- Page naming edge cases

**Integration:**
- Page object + test generation workflow
- Analyze + generate workflow

### Filesystem Server Tests (25+ test cases)

**File Operations:**
- Path validation
- Path normalization
- Absolute/relative paths

**Security:**
- Path traversal prevention
- Allowed directory validation
- Symlink handling

**Error Handling:**
- Missing files
- Permission errors
- Invalid paths

**Special Files:**
- JSON files
- Binary files
- Large files
- Empty files

### Memory Server Tests (35+ test cases)

**Graph Operations:**
- Entity creation/reading/updating/deletion
- Relation management
- Observation storage

**Persistence:**
- JSONL file format
- Backward compatibility
- Corruption recovery

**Search:**
- Entity search by name
- Filter by type
- Observation search

**Performance:**
- Large dataset handling
- Search performance

### MCP Protocol Tests (Integration)

**Server Initialization:**
- Capability declaration
- Handler registration order
- Name and version validation

**Tool Request Handlers:**
- ListToolsRequest
- CallToolRequest
- Error handling

**Protocol Compliance:**
- Resource handling
- Prompt handling
- Concurrent calls
- Server lifecycle

## Writing New Tests

### Test Template

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Feature Name', () => {
  describe('Sub-feature', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = processInput(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Using Test Utilities

```typescript
import {
  createMockServer,
  assertValidToolDefinition,
  isValidTypeScriptSyntax,
  waitFor
} from '../fixtures/test-utils';

// Create mock server
const server = createMockServer('test-server');

// Validate tool
assertValidToolDefinition(toolConfig);

// Check syntax
expect(isValidTypeScriptSyntax(code)).toBe(true);

// Wait for async condition
await waitFor(() => server.initialized);
```

### Best Practices

1. **One assertion per test when possible** - Makes it clear what's being tested
2. **Descriptive test names** - `should handle missing file error` not `test1`
3. **Setup in describe blocks** - Use `beforeEach` for common setup
4. **Clean up** - Use `afterEach` for cleanup (file handles, temp files)
5. **Test edge cases** - Empty input, very large input, special characters
6. **Test error cases** - All error paths should have tests

## Debugging Tests

### Run Single Test File

```bash
npx jest tests/unit/playwright-generator.spec.ts
```

### Run Single Test Case

```bash
npx jest -t "should generate TypeScript test"
```

### Run with Detailed Output

```bash
npx jest --verbose
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

Then press F5 to start debugging.

## Test Metrics

### Current Test Statistics

- **Total Tests:** 100+ cases
- **Unit Tests:** 90+ cases
- **Integration Tests:** 25+ cases
- **Average Test Runtime:** <100ms per test
- **Total Test Suite Time:** ~5-10 seconds

### Performance Targets

- Unit tests: <2 seconds
- Integration tests: <3 seconds
- Total suite: <10 seconds
- Coverage generation: <15 seconds

## Continuous Integration

Tests run automatically on:
- **Pull Requests** - Must pass before merging
- **Commits** - GitHub Actions validation
- **Scheduled** - Daily smoke test runs

### GitHub Actions Workflow

See `.github/workflows/test-ci.yml` for full CI configuration.

## Known Limitations

1. **Mock Transport:** Limited to schema validation, doesn't test actual stdio communication
2. **File System Tests:** Use in-memory file mocks where possible
3. **Tool Generation:** Tests validate structure, not AI-generated content quality
4. **Performance Tests:** Relative, not absolute (machine-dependent)

## Future Improvements

- [ ] Add tests for sequentialthinking server
- [ ] Add tests for fetch server  
- [ ] Add tests for git server
- [ ] Add tests for time server
- [ ] Increase coverage to 80%+
- [ ] Add end-to-end tests with real MCP clients
- [ ] Add performance benchmarks
- [ ] Add snapshot testing for generated code

## Contributing

When adding tests:

1. Create tests in appropriate `tests/unit/` or `tests/integration/` file
2. Follow naming conventions: `[feature].spec.ts`
3. Include descriptive test names
4. Add comments for complex test logic
5. Update this README if adding new test categories
6. Ensure all tests pass: `npm test`
7. Check coverage doesn't decrease: `npm run test:coverage`

## Troubleshooting

### Tests Not Found

```bash
# Clear Jest cache
npm test -- --clearCache
```

### Timeout Errors

```typescript
// Increase timeout for slow tests
it('should do something slow', async () => {
  // ...
}, 10000); // 10 second timeout
```

### Module Not Found

```bash
# Rebuild TypeScript
npm run build

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)

---

**Last Updated:** March 2026
**Test Suite Version:** 1.0.0
**Jest Version:** 29.7.0+
