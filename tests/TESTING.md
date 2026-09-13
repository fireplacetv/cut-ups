# Testing Framework for Cut-Ups Refactoring

This testing framework ensures that refactoring maintains the same behavior as the current implementation.

## Overview

The testing strategy consists of four layers:

1. **Regression Tests** - Verify core logic preserves data
2. **Golden Masters** - Capture baseline output for comparison
3. **UI Integration Tests** - Test browser interactions
4. **Visual Regression** - Manual verification of results

## Files

- `test-regression.js` - Automated tests for text transformation logic
- `generate-golden-masters.js` - Captures current behavior as baseline
- `test-ui-integration.html` - Browser-based UI tests
- `golden-masters.json` - Baseline outputs (generated)
- `run-tests.sh` - Test runner script

## Quick Start

### 1. Generate Baseline (Before Refactoring)

```bash
# Create baseline golden masters
node generate-golden-masters.js

# Backup golden masters for comparison
cp golden-masters.json golden-masters.json.baseline
```

This captures the current behavior across all methods with various inputs.

### 2. Run Regression Tests

```bash
# Run all automated tests
node test-regression.js

# Or use the test runner
chmod +x run-tests.sh
./run-tests.sh
```

Expected output:
```
=== REGRESSION TESTS ===

✓ PASS: quadrant with standard text
✓ PASS: word-scramble preserves word list
...

=== SUMMARY ===
Passed: 8
Failed: 0
Total: 8
```

### 3. Run UI Integration Tests

```bash
# Open in your browser
open test-ui-integration.html

# Or use live server
python -m http.server 8000
# Then visit http://localhost:8000/test-ui-integration.html
```

The page will display results for 15+ UI-focused tests:
- ✓ or ✗ for each test
- Detailed error messages for failures
- Summary of passed/failed counts

## Testing During Refactoring

### Workflow

1. **Before Making Changes**
   ```bash
   node generate-golden-masters.js
   cp golden-masters.json golden-masters.json.baseline
   ```

2. **After Each Major Change**
   ```bash
   node test-regression.js
   ```

3. **After Component Refactoring**
   - Update only that component's test cases if logic changed
   - Ensure tests still pass
   - Run full test suite: `./run-tests.sh`

4. **Final Validation**
   ```bash
   # Compare new output with baseline
   node generate-golden-masters.js
   diff golden-masters.json golden-masters.json.baseline

   # Should show minimal or no differences (except random seed variations)
   ```

## What Gets Tested

### Regression Tests (`test-regression.js`)

Each test verifies:

| Method | Checks |
|--------|--------|
| **quadrant** | Word count preserved |
| **fold-in** | Line count preserved, interleaving works |
| **line-shuffle** | Line count preserved, all lines present |
| **sentence-shuffle** | Sentence count preserved, sentences intact |
| **word-scramble** | Word count preserved |
| **edge cases** | Empty input, single token, single line |

### Golden Masters (`generate-golden-masters.js`)

Captures for each method + input combination:
- Original input
- 1-3 output runs (multiple for non-deterministic methods)
- Word count in/out
- Validation status

### UI Integration Tests (`test-ui-integration.html`)

Tests in the browser:
- Method buttons produce output
- Width changes don't lose data
- Shuffle methods produce variation
- Empty input handling
- Single item handling
- All methods preserve word count
- No original input mutation

## Common Issues

### Tests Fail After Changes

**Problem:** Regression tests fail after refactoring

**Solution:**
1. Check the error message for specific failure
2. If the logic is intentionally different, update test expectations
3. If unintended, debug the refactored code
4. Re-run: `node test-regression.js`

### Golden Masters Show Differences

**Problem:** `diff golden-masters.json golden-masters.json.baseline` shows many changes

**Common causes:**
- Random seed differences (expected for shuffle methods)
- Different implementation of same logic (not expected)
- Input/output format changed (needs investigation)

**Solution:**
```bash
# Review specific diffs
diff -u golden-masters.json.baseline golden-masters.json | head -50

# If differences are only in run order/content (not counts), it's OK
# If word counts differ, there's a real problem
```

### UI Integration Tests Won't Load

**Problem:** `test-ui-integration.html` shows "Module not found"

**Solution:**
1. Ensure `cutup.js` is in same directory
2. Open with live server: `python -m http.server 8000`
3. Navigate to: `http://localhost:8000/test-ui-integration.html`

## Extending Tests

### Add New Test Case (Regression)

Edit `test-regression.js`:

```javascript
const testCases = [
  // ... existing tests ...
  {
    name: 'new edge case',
    input: 'your test input',
    method: 'fold-in',
    checksWordCount: true,
  }
];
```

### Add New UI Test

Edit `test-ui-integration.html` in the script section:

```javascript
test('new UI behavior', () => {
  const input = 'test input';
  const result = cutUp(input, 'quadrant', { segmentCount: 2 });
  assert(result.length > 0, 'Result should not be empty');
});
```

## Performance Testing

Golden masters also help detect performance regressions:

```javascript
// Add timing to generate-golden-masters.js
const start = performance.now();
const output = cutUp(input, method);
const time = performance.now() - start;

// Compare baseline times with new implementation
```

## CI/CD Integration

To add to CI pipeline:

```yaml
# Example GitHub Actions
- name: Run Regression Tests
  run: node test-regression.js

- name: Generate Golden Masters
  run: node generate-golden-masters.js

- name: Check for Unexpected Changes
  run: diff golden-masters.json golden-masters.json.baseline || true
```

## When Tests Pass

All tests passing means:
- ✓ No data is lost during transformation
- ✓ All input tokens are preserved
- ✓ Word/line/sentence counts are maintained
- ✓ Edge cases (empty, single item) handled correctly
- ✓ UI responds to interactions
- ✓ No unintended side effects

You can proceed with confidence that refactoring hasn't broken core functionality.
