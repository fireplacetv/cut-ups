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

- **Quadrant method word-splitting - FIXED.** `quadrantCut2D()` slices each wrapped line at a
  fixed character column (`midCol = Math.floor(lineWidth / 2)`), which used to frequently fall in
  the middle of a word. This is now fixed by `prepareQuadrantLines()` (src/cutup.js), which
  pre-processes lines before calling `quadrantCut2D()` (replacing the old
  `smartWrap(text, lineWidth).split('\n')` step):
  1. Let `halfWidth = Math.floor(lineWidth / 2)` and `contentWidth = halfWidth - 1` (one column
     reserved as a guaranteed separator - see below). Wrap the text with
     `smartWrap(text, contentWidth)` and split into "half-lines" - since `smartWrap` never breaks
     a word, every half-line already ends on a word boundary.
  2. Walk the half-lines pairing them up two at a time (`half[0]`+`half[1]`, `half[2]`+`half[3]`,
     ...) - *except* when a half-line is itself one word too long to fit in `halfWidth`
     (`left.length >= halfWidth`): that half-line can't be the *left* of a pair, since its own
     length would already carry past column `halfWidth` and the cut would land inside it. It's
     used as a lone *right* half instead, paired with a blank left column, and the half-line that
     would have paired with it is carried over to pair with the next one, so nothing is dropped.
  3. For each pair `(left, right)`, compose a full line as `left.padEnd(halfWidth) + right + ' '`.
     Because `left` is at most `contentWidth` (`halfWidth - 1`) characters (or blank, in the
     overlong case), `padEnd` is guaranteed to add at least one real space before `right` begins
     at column `halfWidth`. Appending (rather than truncating to width) is what keeps `right`
     intact no matter how long it is - `quadrantCut2D()`'s slice at `midCol` only ever cuts
     *before* `right` starts, never through it.
  4. Pass the composed lines into the existing `quadrantCut2D(lines, lineWidth)` unchanged. Since
     `midCol` equals `halfWidth` by construction, the slice at `midCol` always falls on a
     guaranteed space or the start of `right` - never inside a word.

  Two non-obvious bugs turned up while building this and are worth recording so they don't
  reappear in a future rewrite:
  - **Reserved column (step 1/3).** An earlier version wrapped half-lines to `halfWidth` directly
    (no reserved column). That fixed mid-word slicing but introduced word-gluing: whenever a
    half-line happened to fill exactly to `halfWidth`, `padEnd` became a no-op and the last word
    of `left` glued directly onto the first word of `right` with no separator at all (e.g.
    `"two"` + `"kappa"` -> `"twokappa"`). Reserving one column guarantees `padEnd` always has at
    least one space to add.
  - **Trailing space (step 3).** `quadrantCut2D()` shuffles the four quadrant fragments as whole
    groups and reassembles rows by directly concatenating whichever fragment lands in each
    position - so a fragment from the *right* half of one row can end up placed first in a
    reassembled row, immediately before a fragment from a completely different original row. A
    right-type fragment at or past `halfWidth` in length (which the overlong-word case in step 2
    deliberately allows) got nothing from `quadrantCut2D()`'s own `padEnd(midCol)` in that
    position, so it glued onto whatever followed (e.g. `"epsilon"` + `"zeta"` ->
    `"epsilonzeta"`). Appending a guaranteed trailing space to every composed line fixes this: it
    always ends up as part of the *right* fragment, so every right fragment - not just every left
    fragment - is guaranteed to end in a real space, regardless of where it's shuffled to.

  This intentionally does **not** include a whitespace cleanup pass afterward - the padding
  spaces from step 3 and any ragged gaps introduced by the quadrant shuffle are left in the
  output as-is. Run `cleanWhitespace()` (or the "Wrap Text" tool) manually afterward if a
  cleaner-looking result is wanted; it is not applied automatically.

  Verified with a regression test (`tests/regression/test-regression.js`, "quadrant never splits
  or glues words across a spread of widths") plus ad hoc randomized trials across hundreds of
  width/input combinations, including deliberately overlong words - zero split or glued tokens
  observed.

- **Quadrant method row-count mismatch** - a separate, still-open issue: when the top and bottom
  halves end up with different numbers of lines, `quadrantCut2D()` pads the shorter side with
  blank rows rather than preserving the extra lines from the longer side, which can still drop
  words. The `prepareQuadrantLines()` fix above does not address this; it only fixes word-splitting
  and word-gluing at the column cut.
- Test framework intentionally catches the row-count mismatch bug to demonstrate value

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
