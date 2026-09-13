# Test Suite

Comprehensive testing framework for the Cut-Up Text Generator.

## Quick Start

### Run Regression Tests
```bash
cd tests/regression
node test-regression.js
```

### Generate Baseline (Before Refactoring)
```bash
cd tests/regression
node generate-golden-masters.js
cp golden-masters.json golden-masters.json.baseline
```

### Run UI Tests in Browser
```bash
# From project root
python -m http.server 8000

# Then visit in browser:
# http://localhost:8000/tests/regression/test-ui-integration.html
```

## Structure

### `regression/` - Modern Testing Framework

The main test suite used for validating and refactoring code.

- **test-regression.js** (3.1K) - Automated unit tests
  - 8 core test cases
  - Validates data preservation
  - Checks edge cases
  - Run with: `node test-regression.js`

- **generate-golden-masters.js** (2.7K) - Baseline generator
  - Captures current behavior
  - Generates multiple runs for non-deterministic methods
  - Produces `golden-masters.json`
  - Run with: `node generate-golden-masters.js`

- **test-ui-integration.html** (8.0K) - Browser tests
  - 15+ interactive test cases
  - Tests all methods and UI elements
  - Visual pass/fail feedback
  - Open in browser via HTTP server

### `legacy/` - Original Tests

Historical tests kept for reference. Do not rely on these for validation.

- **test.js** - Original Node.js tests
- **test-simple.html** - Original browser test

## Workflows

### Before Refactoring

Capture the baseline behavior:

```bash
cd tests/regression
node generate-golden-masters.js
cp golden-masters.json golden-masters.json.baseline
node test-regression.js
# All tests should pass
```

### During Refactoring

Test frequently to catch breaking changes:

```bash
cd tests/regression
node test-regression.js
# Should show: Passed: X, Failed: 0
```

### After Refactoring

Verify behavior is preserved:

```bash
cd tests/regression

# Re-generate outputs with new implementation
node generate-golden-masters.js

# Compare with baseline
diff golden-masters.json.baseline golden-masters.json
# Should show minimal or no differences

# Run regression tests
node test-regression.js
# All should pass

# Open UI tests in browser
python -m http.server 8000
# Visit: http://localhost:8000/tests/regression/test-ui-integration.html
```

## Test Coverage

| Method | Regression | UI | Golden |
|--------|------------|-----|--------|
| quadrant | ✓ | ✓ | ✓ |
| fold-in | ✓ | ✓ | ✓ |
| line-shuffle | ✓ | ✓ | ✓ |
| sentence-shuffle | ✓ | ✓ | ✓ |
| word-scramble | ✓ | ✓ | ✓ |
| edge cases | ✓ | ✓ | ✓ |

## Troubleshooting

### "Cannot find module '../../src/cutup.js'"

Make sure you're running from the correct directory:
```bash
# Correct:
cd tests/regression
node test-regression.js

# Wrong:
cd tests
node regression/test-regression.js
```

### UI tests won't load

Use a local HTTP server, not file:// protocol:
```bash
cd /path/to/cut-ups
python -m http.server 8000
# Then visit: http://localhost:8000/tests/regression/test-ui-integration.html
```

### Golden masters not updating

Ensure you're in the regression directory:
```bash
cd tests/regression
node generate-golden-masters.js
# Creates: golden-masters.json (in regression/ directory)
```

## Files

- `TESTING.md` - Detailed testing strategies and advanced workflows
- `README-TESTING-SETUP.md` - Setup guide and first-time instructions
- `regression/` - Production test suite
- `legacy/` - Historical tests (reference only)

## Contributing Tests

To add a new test case:

1. **Regression test:** Add to `regression/test-regression.js` testCases array
2. **UI test:** Add to `regression/test-ui-integration.html` test() calls
3. **Golden master:** Re-run `generate-golden-masters.js` to capture new baseline

## CI/CD Integration

For GitHub Actions or other CI systems:

```yaml
- name: Run Regression Tests
  run: cd tests/regression && node test-regression.js

- name: Generate Golden Masters
  run: cd tests/regression && node generate-golden-masters.js

- name: Check for Regressions
  run: cd tests/regression && diff golden-masters.json.baseline golden-masters.json || echo "Output differences detected (may be expected for shuffle methods)"
```

---

See `TESTING.md` for comprehensive documentation.
