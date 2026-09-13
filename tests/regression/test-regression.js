import { cutUp, tokenize } from '../../src/cutup.js';

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

function countSentences(text) {
  return text.match(/[.!?]+/g)?.length || 0;
}

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

if (import.meta.url === `file://${process.argv[1]}`) {
  const success = runRegressionTests();
  process.exit(success ? 0 : 1);
}
