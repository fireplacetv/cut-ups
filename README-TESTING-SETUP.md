# Testing Framework Setup Guide

A comprehensive testing strategy to safely refactor the cut-ups project while ensuring behavior remains identical.

## What's Included

This testing branch includes:

- **test-regression.js** - Automated Node.js tests for text transformation logic
- **generate-golden-masters.js** - Captures baseline output from current implementation
- **test-ui-integration.html** - Browser-based UI interaction tests
- **run-tests.sh** - Bash script to run all tests
- **TESTING.md** - Detailed testing documentation

## Prerequisites

- Node.js 14+ (for regression tests and golden masters)
- A modern browser (for UI integration tests)
- curl or similar (for baseline capture)

## Quick Start

### Step 1: Generate Baseline (MUST DO FIRST)

Before making any refactoring changes, capture the current behavior:

```bash
# Navigate to project directory
cd /Users/fireplacetv/git/fireplacetv/cut-ups

# Generate golden masters (captures all current outputs)
node generate-golden-masters.js

# Backup for comparison
cp golden-masters.json golden-masters.json.baseline
```

This creates `golden-masters.json` containing:
- Every test input
- All method outputs (with multiple runs for non-deterministic methods)
- Word/token counts
- Validation results

**⚠️ Important:** Keep `golden-masters.json.baseline` as your reference throughout refactoring.

### Step 2: Verify With Regression Tests

```bash
node test-regression.js
```

Expected output:
```
=== REGRESSION TESTS ===

✓ PASS: quadrant with standard text
✓ PASS: word-scramble preserves word list
✓ PASS: fold-in interleaves lines
...
✓ PASS: single line returns input

=== SUMMARY ===
Passed: 8
Failed: 0
Total: 8
```

### Step 3: Browser UI Tests

Open in your browser:

```bash
# Option 1: Direct file open
open test-ui-integration.html

# Option 2: Local server (recommended)
python -m http.server 8000
# Then navigate to: http://localhost:8000/test-ui-integration.html
```

You should see 15+ test cases, all passing with green checkmarks.

## Testing Workflow During Refactoring

### Before You Start

```bash
# 1. Ensure you're on the testing-framework branch
git branch
# Output: * testing-framework

# 2. Create baseline
node generate-golden-masters.js
cp golden-masters.json golden-masters.json.baseline

# 3. Verify all tests pass
node test-regression.js
# All should show ✓ PASS
```

### During Refactoring

After each significant change:

```bash
# Run regression tests to catch breaking changes immediately
node test-regression.js

# If failures occur:
# 1. Review the error message
# 2. Fix the code
# 3. Re-run tests
```

### After Each Component

When you've finished refactoring a component:

```bash
# Re-generate golden masters with new implementation
node generate-golden-masters.js

# Compare with baseline
diff -u golden-masters.json.baseline golden-masters.json | head -100

# Check regression tests still pass
node test-regression.js

# Test UI in browser
open test-ui-integration.html
```

### Final Verification

When refactoring is complete:

```bash
# 1. All regression tests pass
node test-regression.js
# Expected: Passed: X, Failed: 0

# 2. Golden masters show only expected variations
node generate-golden-masters.js
diff -u golden-masters.json.baseline golden-masters.json
# Should show minimal differences (random seed variations OK)

# 3. UI tests pass in browser
open test-ui-integration.html
# All test sections should be green with ✓

# 4. Manual testing
# - Try various inputs in the actual app
# - Compare outputs with baseline behavior
# - Verify all buttons and controls work as before
```

## Understanding Test Results

### Regression Tests Pass ✓

Means:
- All text transformations preserve data
- Word/line/sentence counts are maintained
- Edge cases handled correctly
- Safe to proceed with refactoring

### Regression Tests Fail ✗

Example failure:
```
✗ FAIL: word-scramble preserves word list
  Error: Word count mismatch: expected 4, got 3
```

Indicates:
- Logic has changed and is dropping data
- Need to debug the implementation
- Refactoring introduced a bug

**Solution:**
1. Review the changed code
2. Check if logic is intentionally different
3. If not, revert changes and fix
4. Re-run tests

### Golden Masters Differ

```bash
diff golden-masters.json.baseline golden-masters.json
```

Expected differences:
- Random word order in `word-scramble` results (OK)
- Different run order in shuffle methods (OK)
- Different word order in `fold-in` (OK)

Unexpected differences:
- Word counts don't match (problem!)
- Missing words/lines (problem!)
- Different methods producing same output (problem!)

## Test Coverage Map

| Feature | Tested By |
|---------|-----------|
| Text tokenization | test-regression.js |
| Word shuffling | test-regression.js, UI tests |
| Line interleaving | test-regression.js, UI tests |
| Sentence shuffling | test-regression.js, UI tests |
| Quadrant cut | test-regression.js, UI tests |
| Width slider | UI tests |
| Method buttons | UI tests |
| Empty input | test-regression.js, UI tests |
| Data preservation | All tests |

## Extending Tests

### Add a Regression Test

Edit `test-regression.js`, add to `testCases`:

```javascript
{
  name: 'my new test',
  input: 'test text',
  method: 'word-scramble',
  checksWordCount: true,
}
```

### Add a UI Test

Edit `test-ui-integration.html`, add to script:

```javascript
test('my new feature', () => {
  const result = cutUp('test', 'quadrant', { segmentCount: 2 });
  assert(result.length > 0, 'Should produce output');
});
```

## Troubleshooting

### "Cannot find module 'cutup.js'"

**Cause:** Node.js isn't finding the module  
**Solution:** Ensure cutup.js exports correctly:
```javascript
export { cutUp, tokenize };  // At end of cutup.js
```

### UI tests show "ModuleError"

**Cause:** Script can't import cutup.js  
**Solution:** Use local server (not file:// protocol)
```bash
python -m http.server 8000
# Visit http://localhost:8000/test-ui-integration.html
```

### Golden masters file too large

**Cause:** Normal - it contains multiple runs of all methods  
**Solution:** Just compress for storage
```bash
gzip golden-masters.json.baseline
```

### Random differences in golden masters

**Cause:** Shuffle methods are randomized (normal)  
**Solution:** Focus on word counts, not exact output order

## Integration with Refactoring

This test framework enables:

1. **Safe extraction** of functions from index.html to separate modules
2. **Confident consolidation** of duplicate code (cutup.js + index.html)
3. **Zero-downtime refactoring** - tests catch errors before they reach users
4. **Documentation** - tests show what behavior is guaranteed

## Next Steps

1. ✅ Baseline created (`golden-masters.json.baseline`)
2. ✅ Regression tests passing
3. ✅ UI tests passing
4. → Start refactoring (make changes, run tests after each component)
5. → Final verification (all tests pass, behavior identical)
6. → Merge to main

## Files Overview

```
project/
├── cutup.js                    # Main logic (to be extracted/unified)
├── index.html                  # Main app (to be refactored)
├── test.js                     # Existing tests
│
├── test-regression.js          # NEW: Automated logic tests
├── generate-golden-masters.js  # NEW: Baseline generator
├── test-ui-integration.html    # NEW: Browser UI tests
├── golden-masters.json         # NEW: Generated baseline
├── golden-masters.json.baseline # NEW: Backed-up reference
├── run-tests.sh               # NEW: Test runner
│
├── TESTING.md                 # NEW: Detailed docs
└── README-TESTING-SETUP.md    # This file
```

## Questions?

Refer to:
- `TESTING.md` - In-depth testing strategies
- Test files themselves - They're well-commented
- Commit messages - Show what each test validates
