# Claude Code Configuration

Configuration and guidelines for Claude Code assistance in this project.

## Project Overview

**Cut-Up Text Generator** - A web-based tool for applying algorithmic text transformation techniques inspired by Burroughs & Gysin.

- **Type:** Web Application (Vanilla JavaScript)
- **Purpose:** Educational/experimental text manipulation
- **Audience:** Writers, artists, students exploring algorithmic creativity
- **Status:** Under active development with comprehensive testing

## Code Style & Conventions

### File Organization
- **Application code:** `src/` directory only
- **Tests:** `tests/` directory (regression tests in `regression/`, legacy tests in `legacy/`)
- **Documentation:** `docs/` directory and root `.md` files

### JavaScript Conventions

#### Pure Functions (src/cutup.js)
- All text transformation functions are pure (no side effects)
- Accept text and options, return transformed text
- Named clearly: `tokenize()`, `shuffle()`, `foldIn()`, `cutUp()`

#### DOM Interaction (src/index.html)
- UI event handlers and DOM manipulation inline
- State stored in variables (to be refactored into module)
- Functions update `#input` textarea with results

#### Naming
- Methods: camelCase for functions, kebab-case for data attributes
- Variables: `selectedMethod`, `selectedWidth`, `textData`
- Constants: UPPERCASE (to be standardized via constants file)

### Comments
- Only for non-obvious logic or workarounds
- Document WHY, not WHAT (good names explain the what)
- Link to related issues/commits if relevant

## Testing

### Running Tests

```bash
# Quick validation
node tests/regression/test-regression.js

# Generate baseline (before refactoring)
node tests/regression/generate-golden-masters.js

# Browser-based UI tests
open tests/regression/test-ui-integration.html
```

### Test Framework

- **8 core regression tests** validate data preservation
- **15 UI integration tests** verify browser interactions
- **Golden masters** capture output baseline for comparison
- Tests are designed to catch bugs and regressions immediately

### Key Invariants (Always True)

These properties must hold across ALL methods:
- ✓ Word count preserved (shuffle methods)
- ✓ Line count preserved (line-based methods)
- ✓ Sentence count preserved (sentence methods)
- ✓ Empty input returns empty output
- ✓ Single token returns unchanged
- ✓ No mutation of original input

Violation of these = bug.

## Refactoring Guidelines

### Safe Refactoring Pattern

1. **Before:** `node tests/regression/generate-golden-masters.js && cp golden-masters.json golden-masters.json.baseline`
2. **Change:** Extract/consolidate/reorganize code
3. **Test:** `node tests/regression/test-regression.js`
4. **Compare:** `diff golden-masters.json.baseline golden-masters.json`
5. **Verify:** `open tests/regression/test-ui-integration.html`

### Known Issues to Preserve

- **Quadrant method data loss** - Currently loses words (to be fixed, tracked in issue)
- Test framework intentionally catches this bug to demonstrate value

### High-Priority Refactoring

1. **Consolidate duplicate code** - `index.html` and `cutup.js` have identical functions
2. **Separate concerns** - Move DOM logic from index.html into a UI controller module
3. **Standardize parameters** - `pageWidth` vs `segmentCount` inconsistency
4. **Add constants file** - Replace magic numbers (80, 4, etc.)
5. **Input validation** - Validate all function inputs at boundaries

### Low-Priority (Nice-to-Have)

- Performance optimization for large texts
- Better sentence detection (currently naive regex)
- Configuration UI for method-specific options
- Export/download results
- Undo/redo history

## Project Context

### Origin & Purpose

This tool explores creative writing techniques developed by William S. Burroughs and Brion Gysin. The cut-up method is both a literary technique and a conceptual framework for thinking about rearrangement and emergence.

### Current Development

- **Branch:** `design/improve-usability` (main development)
- **Testing:** `worktree-testing-framework` (comprehensive test suite)
- **Next:** Consolidate code structure while preserving behavior

### Team

- **Primary Dev:** Derrick Low
- **Email:** derrick@sonic.net

## Claude Guidelines

### When Reviewing Code

- Prioritize data preservation over elegance
- Test assumptions with regression tests
- Check for unintended side effects
- Verify all methods still pass invariant checks

### When Suggesting Changes

- Provide diff-friendly changes (small, focused edits)
- Suggest test cases for new features
- Consider LLM-readability: clear names, no implicit state
- Explain WHY a change is better, not just that it works

### When Stuck

- Run regression tests to see what broke
- Compare current output with `golden-masters.json.baseline`
- Check test error messages for clues
- Verify assumptions with actual test runs

## Useful Commands

```bash
# Navigate to project
cd /Users/fireplacetv/git/fireplacetv/cut-ups

# Test before refactoring
node tests/regression/generate-golden-masters.js
cp golden-masters.json golden-masters.json.baseline
node tests/regression/test-regression.js

# Work on feature
git checkout -b feature/your-feature

# Test during work
node tests/regression/test-regression.js

# Verify before PR
./tests/run-tests.sh
diff golden-masters.json.baseline golden-masters.json

# View tests in browser
python -m http.server 8000
open http://localhost:8000/tests/regression/test-ui-integration.html
```

## Files NOT to Touch Without Discussion

- `tests/legacy/test.js` - Original tests (historical reference only)
- `tests/legacy/test-simple.html` - Original UI test (historical reference)

These are kept for reference and should not be modified or relied upon for validation.

## Questions or Clarifications?

When in doubt:
1. Check `README.md` for project overview
2. Read `tests/TESTING.md` for testing approach
3. Run `node tests/regression/test-regression.js` to validate assumptions
4. Look at recent commits for context on recent changes
