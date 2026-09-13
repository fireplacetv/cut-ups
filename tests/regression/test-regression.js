import { cutUp, tokenize } from '../../src/cutup.js';

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

export { runRegressionTests };

// Only auto-run when this file is executed directly (e.g. `node
// test-regression.js`), not when imported by another test module.
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = runRegressionTests();
  process.exit(success ? 0 : 1);
}
