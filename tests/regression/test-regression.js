import { cutUp, tokenize, cleanWhitespace, reassemble } from '../../src/cutup.js';

// Each case exercises one method against the invariants documented in
// CLAUDE.md ("Key Invariants"): word/sentence count preservation, and
// exact-match behavior for empty/single-chunk input. `checksWordCount` and
// `checksSentenceCount` opt a case into the corresponding invariant check
// below; `expected` opts into an exact string match instead.
const testCases = [
  {
    name: 'quadrant with standard text',
    input: 'The quick brown fox\njumps over the lazy dog\nand runs away',
    method: 'quadrant',
    options: { lineWidth: 80 },
    checksWordCount: true,
  },
  {
    name: 'word-scramble preserves word list',
    input: 'apple banana cherry date',
    method: 'word-scramble',
    checksWordCount: true,
  },
  {
    name: 'fold-in interleaves lines',
    input: 'line1\nline2\nline3\nline4',
    method: 'fold-in',
    checksWordCount: true,
  },
  {
    name: 'line-shuffle preserves lines',
    input: 'first line\nsecond line\nthird line',
    method: 'line-shuffle',
    checksWordCount: true,
  },
  {
    name: 'sentence-shuffle preserves sentences',
    input: 'First sentence. Second sentence. Third sentence.',
    method: 'sentence-shuffle',
    checksSentenceCount: true,
  },
  {
    name: 'empty input returns empty',
    input: '',
    method: 'word-scramble',
    expected: ''
  },
  {
    name: 'single word returns input',
    input: 'hello',
    method: 'word-scramble',
    expected: 'hello'
  },
  {
    name: 'single line returns input',
    input: 'hello world',
    method: 'line-shuffle',
    expected: 'hello world'
  },
];

function countWords(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// Counts sentence terminators rather than reusing cutup.js's tokenize(),
// so this check stays an independent verification of the sentence-shuffle
// invariant instead of testing the implementation against itself.
function countSentences(text) {
  return text.match(/[.!?]+/g)?.length || 0;
}

/**
 * Runs all testCases against cutUp() and logs pass/fail per case plus a
 * summary. Intended to be run directly via `node tests/regression/test-regression.js`.
 * @returns {boolean} True if every test case passed.
 */
function runRegressionTests() {
  console.log('=== REGRESSION TESTS ===\n');

  let passed = 0;
  let failed = 0;

  testCases.forEach(test => {
    try {
      const result = cutUp(test.input, test.method, test.options || {});

      // Test: Word count preservation
      if (test.checksWordCount) {
        const resultWords = countWords(result);
        const inputWords = countWords(test.input);
        if (resultWords !== inputWords) {
          throw new Error(
            `Word count mismatch: expected ${inputWords}, got ${resultWords}`
          );
        }
      }

      // Test: Sentence count preservation
      if (test.checksSentenceCount) {
        const resultSentences = countSentences(result);
        const inputSentences = countSentences(test.input);
        if (resultSentences !== inputSentences) {
          throw new Error(
            `Sentence count mismatch: expected ${inputSentences}, got ${resultSentences}`
          );
        }
      }

      // Test: Exact match
      if (test.expected !== undefined) {
        if (result !== test.expected) {
          throw new Error(
            `Output mismatch:\nExpected: "${test.expected}"\nGot: "${result}"`
          );
        }
      }

      console.log(`✓ PASS: ${test.name}`);
      passed++;
    } catch (err) {
      console.log(`✗ FAIL: ${test.name}`);
      console.log(`  Error: ${err.message}\n`);
      failed++;
    }
  });

  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  return failed === 0;
}

// Cases for cleanWhitespace(), exercised separately from the cutUp() suite
// above since it isn't a cut-up method. Each case supplies a custom
// `check(result)` that throws on failure, mirroring the invariant checks
// used for cutUp() cases.
const cleanWhitespaceTestCases = [
  {
    name: 'collapses wide gaps between words',
    input: 'The     quick   brown      fox',
    width: 80,
    check: result => {
      if (result !== 'The quick brown fox') {
        throw new Error(`Expected gaps collapsed, got: "${result}"`);
      }
    },
  },
  {
    name: 'caps runs of 3+ linebreaks at 2',
    input: 'First paragraph.\n\n\n\n\nSecond paragraph.',
    width: 80,
    check: result => {
      if (result !== 'First paragraph.\n\nSecond paragraph.') {
        throw new Error(`Expected linebreaks capped at 2, got: "${result}"`);
      }
    },
  },
  {
    name: 'preserves a single paragraph break',
    input: 'First paragraph text here.\n\nSecond paragraph text here.',
    width: 80,
    check: result => {
      const breaks = result.match(/\n{2,}/g) || [];
      if (breaks.length !== 1 || breaks[0] !== '\n\n') {
        throw new Error(`Expected exactly one "\\n\\n" break, got: "${result}"`);
      }
    },
  },
  {
    name: 'preserves word count',
    input: 'alpha    beta\ngamma\n\n\ndelta      epsilon',
    width: 80,
    check: result => {
      const inputWords = countWords('alpha beta gamma delta epsilon');
      const resultWords = countWords(result);
      if (resultWords !== inputWords) {
        throw new Error(`Word count mismatch: expected ${inputWords}, got ${resultWords}`);
      }
    },
  },
  {
    name: 'empty input returns empty',
    input: '',
    width: 80,
    check: result => {
      if (result !== '') {
        throw new Error(`Expected empty output, got: "${result}"`);
      }
    },
  },
];

/**
 * Runs all cleanWhitespaceTestCases against cleanWhitespace() and logs
 * pass/fail per case plus a summary.
 * @returns {boolean} True if every test case passed.
 */
function runCleanWhitespaceTests() {
  console.log('\n=== CLEAN WHITESPACE TESTS ===\n');

  let passed = 0;
  let failed = 0;

  cleanWhitespaceTestCases.forEach(test => {
    try {
      const result = cleanWhitespace(test.input, test.width);
      test.check(result);
      console.log(`✓ PASS: ${test.name}`);
      passed++;
    } catch (err) {
      console.log(`✗ FAIL: ${test.name}`);
      console.log(`  Error: ${err.message}\n`);
      failed++;
    }
  });

  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  return failed === 0;
}

// Guards against regressing the fix for reassemble()'s missing 'quadrant'
// case, which previously fell through to the default `chunks.join('')` and
// concatenated grid rows with no separator at all — losing every row break
// and gluing words together wherever a row filled exactly to its padded
// width. See tests below for the direct reassemble() check and an
// integration check that cutUp('quadrant') produces real line breaks.
const reassembleTestCases = [
  {
    name: 'reassemble joins quadrant rows with newlines',
    check: () => {
      const result = reassemble(['row1', 'row2', 'row3'], 'quadrant');
      if (result !== 'row1\nrow2\nrow3') {
        throw new Error(`Expected rows joined by newline, got: "${result}"`);
      }
    },
  },
  {
    name: 'cutUp quadrant output contains line breaks',
    check: () => {
      const input = 'The quick brown fox\njumps over the lazy dog\nand runs away\ninto the forest at night';
      const result = cutUp(input, 'quadrant', { lineWidth: 20 });
      if (!result.includes('\n')) {
        throw new Error(`Expected quadrant output to contain line breaks, got: "${result}"`);
      }
    },
  },
];

/**
 * Runs all reassembleTestCases and logs pass/fail per case plus a summary.
 * @returns {boolean} True if every test case passed.
 */
function runReassembleTests() {
  console.log('\n=== REASSEMBLE TESTS ===\n');

  let passed = 0;
  let failed = 0;

  reassembleTestCases.forEach(test => {
    try {
      test.check();
      console.log(`✓ PASS: ${test.name}`);
      passed++;
    } catch (err) {
      console.log(`✗ FAIL: ${test.name}`);
      console.log(`  Error: ${err.message}\n`);
      failed++;
    }
  });

  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  return failed === 0;
}

export { runRegressionTests, runCleanWhitespaceTests, runReassembleTests };

// Only auto-run when this file is executed directly (e.g. `node
// test-regression.js`), not when imported by another test module.
if (import.meta.url === `file://${process.argv[1]}`) {
  const regressionSuccess = runRegressionTests();
  const cleanWhitespaceSuccess = runCleanWhitespaceTests();
  const reassembleSuccess = runReassembleTests();
  process.exit(regressionSuccess && cleanWhitespaceSuccess && reassembleSuccess ? 0 : 1);
}
