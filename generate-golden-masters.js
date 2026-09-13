import { cutUp } from './cutup.js';
import fs from 'fs';
import path from 'path';

const testInputs = [
  'The quick brown fox jumps over the lazy dog',
  'Hello world. This is a test. It should work.',
  'one\ntwo\nthree\nfour\nfive',
  'apple banana cherry',
  'First sentence. Second sentence. Third sentence.',
  'a\nb\nc\nd',
  '',
];

const methods = ['quadrant', 'fold-in', 'line-shuffle', 'sentence-shuffle', 'word-scramble'];

function sanitizeInputKey(input) {
  return input
    .substring(0, 50)
    .replace(/\n/g, '\\n')
    .replace(/[^a-zA-Z0-9\\.-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

function generateGoldenMasters() {
  console.log('Generating golden masters for current implementation...\n');

  const goldenMasters = {};

  testInputs.forEach((input, inputIdx) => {
    const key = sanitizeInputKey(input) || `empty_${inputIdx}`;
    console.log(`Processing: "${input.substring(0, 40)}${input.length > 40 ? '...' : ''}"`);

    goldenMasters[key] = {
      input: input,
      outputs: {}
    };

    methods.forEach(method => {
      // For deterministic testing, we'll capture 3 runs for shuffle methods
      const outputs = [];
      const numRuns = ['word-scramble', 'line-shuffle', 'sentence-shuffle', 'quadrant'].includes(method) ? 3 : 1;

      for (let i = 0; i < numRuns; i++) {
        const output = cutUp(input, method, { segmentCount: 2 });
        outputs.push(output);
      }

      goldenMasters[key].outputs[method] = {
        runs: outputs,
        wordCount: input.split(/\s+/).filter(w => w).length,
        outputWordCounts: outputs.map(o => o.split(/\s+/).filter(w => w).length),
      };
    });
  });

  // Write to file
  const outputPath = path.join(process.cwd(), 'golden-masters.json');
  fs.writeFileSync(outputPath, JSON.stringify(goldenMasters, null, 2));
  console.log(`\n✓ Golden masters saved to: ${outputPath}`);

  return goldenMasters;
}

function validateGoldenMasters(goldenMasters) {
  console.log('\n=== VALIDATION ===\n');

  let issues = 0;

  Object.entries(goldenMasters).forEach(([key, data]) => {
    const inputWordCount = data.wordCount;

    Object.entries(data.outputs).forEach(([method, output]) => {
      const { outputWordCounts } = output;

      // Check that all runs preserve word count
      outputWordCounts.forEach((count, runIdx) => {
        if (count !== inputWordCount) {
          console.log(
            `⚠ ${key} / ${method} / run ${runIdx}: word count ${count} !== input ${inputWordCount}`
          );
          issues++;
        }
      });
    });
  });

  if (issues === 0) {
    console.log('✓ All validations passed');
  } else {
    console.log(`✗ Found ${issues} issues`);
  }

  return issues === 0;
}

const masters = generateGoldenMasters();
validateGoldenMasters(masters);
