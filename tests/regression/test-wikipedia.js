import { parseWikipediaSections, filterUsableSections, pickRandomSection } from '../../src/wikipedia.js';

// These cover the pure, network-free parsing logic in src/wikipedia.js.
// fetchRandomWikipediaArticle/fetchRandomWikipediaText hit a live network
// endpoint and are intentionally left untested here — parseWikipediaSections,
// filterUsableSections, and pickRandomSection are where the actual text
// manipulation happens and can be tested deterministically.

const testCases = [
  {
    name: 'plain text with no headings is a single lead section',
    input: 'Just a lead paragraph with no headings at all.',
    check: (sections) => {
      if (sections.length !== 1) {
        throw new Error(`Expected 1 section, got ${sections.length}`);
      }
      if (sections[0].heading !== null) {
        throw new Error(`Expected null heading for lead, got ${JSON.stringify(sections[0].heading)}`);
      }
      if (sections[0].body !== 'Just a lead paragraph with no headings at all.') {
        throw new Error(`Unexpected lead body: "${sections[0].body}"`);
      }
    },
  },
  {
    name: 'splits lead and top-level headings',
    input: 'Lead text here.\n\n== History ==\nHistory text here.\n\n== Legacy ==\nLegacy text here.',
    check: (sections) => {
      if (sections.length !== 3) {
        throw new Error(`Expected 3 sections, got ${sections.length}`);
      }
      const [lead, history, legacy] = sections;
      if (lead.heading !== null || lead.body !== 'Lead text here.') {
        throw new Error(`Unexpected lead section: ${JSON.stringify(lead)}`);
      }
      if (history.heading !== 'History' || history.body !== 'History text here.') {
        throw new Error(`Unexpected history section: ${JSON.stringify(history)}`);
      }
      if (legacy.heading !== 'Legacy' || legacy.body !== 'Legacy text here.') {
        throw new Error(`Unexpected legacy section: ${JSON.stringify(legacy)}`);
      }
    },
  },
  {
    name: 'nested subsections split into their own entries, excluded from parent body',
    input: 'Lead text.\n\n== Career ==\nCareer intro.\n\n=== Early career ===\nEarly text.\n\n=== Later career ===\nLater text.',
    check: (sections) => {
      if (sections.length !== 4) {
        throw new Error(`Expected 4 sections, got ${sections.length}`);
      }
      const [, career, early, later] = sections;
      if (career.level !== 1 || career.body !== 'Career intro.') {
        throw new Error(`Unexpected career section: ${JSON.stringify(career)}`);
      }
      if (early.level !== 2 || early.heading !== 'Early career' || early.body !== 'Early text.') {
        throw new Error(`Unexpected early-career section: ${JSON.stringify(early)}`);
      }
      if (later.level !== 2 || later.heading !== 'Later career' || later.body !== 'Later text.') {
        throw new Error(`Unexpected later-career section: ${JSON.stringify(later)}`);
      }
    },
  },
  {
    name: 'empty extract yields a single empty lead section',
    input: '',
    check: (sections) => {
      if (sections.length !== 1 || sections[0].heading !== null || sections[0].body !== '') {
        throw new Error(`Expected single empty lead section, got ${JSON.stringify(sections)}`);
      }
    },
  },
];

/**
 * Runs all parseWikipediaSections test cases and logs pass/fail per case plus a summary.
 * @returns {boolean} True if every test case passed.
 */
function runParseSectionsTests() {
  console.log('\n=== WIKIPEDIA SECTION PARSING TESTS ===\n');

  let passed = 0;
  let failed = 0;

  testCases.forEach(test => {
    try {
      const sections = parseWikipediaSections(test.input);
      test.check(sections);
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

const filterTestCases = [
  {
    name: 'drops boilerplate headings like References and See also',
    input: [
      { heading: null, level: 0, body: 'A lead paragraph that is long enough to count as usable prose text.' },
      { heading: 'References', level: 1, body: 'Smith, J. (2020). Some Book. Publisher.' },
      { heading: 'See also', level: 1, body: 'Related Topic; Another Topic' },
    ],
    expectedHeadings: [null],
  },
  {
    name: 'drops sections shorter than the minimum length',
    input: [
      { heading: null, level: 0, body: 'This lead paragraph is long enough to be usable as cut-up source text.' },
      { heading: 'Stub', level: 1, body: 'Too short.' },
    ],
    expectedHeadings: [null],
  },
  {
    name: 'keeps ordinary prose sections with headings',
    input: [
      { heading: null, level: 0, body: 'A lead paragraph that is long enough to count as usable prose text.' },
      { heading: 'History', level: 1, body: 'A detailed history section with plenty of usable prose content here.' },
    ],
    expectedHeadings: [null, 'History'],
  },
];

/**
 * Runs all filterUsableSections test cases and logs pass/fail per case plus a summary.
 * @returns {boolean} True if every test case passed.
 */
function runFilterUsableSectionsTests() {
  console.log('\n=== WIKIPEDIA SECTION FILTERING TESTS ===\n');

  let passed = 0;
  let failed = 0;

  filterTestCases.forEach(test => {
    try {
      const result = filterUsableSections(test.input);
      const headings = result.map(s => s.heading);
      if (JSON.stringify(headings) !== JSON.stringify(test.expectedHeadings)) {
        throw new Error(`Expected headings ${JSON.stringify(test.expectedHeadings)}, got ${JSON.stringify(headings)}`);
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

/**
 * Runs pickRandomSection test cases and logs pass/fail per case plus a summary.
 * @returns {boolean} True if every test case passed.
 */
function runPickRandomSectionTests() {
  console.log('\n=== WIKIPEDIA RANDOM SECTION PICKING TESTS ===\n');

  let passed = 0;
  let failed = 0;

  const pickTests = [
    {
      name: 'returns null for an empty list',
      check: () => {
        const result = pickRandomSection([]);
        if (result !== null) {
          throw new Error(`Expected null, got ${JSON.stringify(result)}`);
        }
      },
    },
    {
      name: 'uses the injected RNG to pick deterministically',
      check: () => {
        const sections = [{ heading: 'A' }, { heading: 'B' }, { heading: 'C' }];
        const result = pickRandomSection(sections, () => 0.99);
        if (result.heading !== 'C') {
          throw new Error(`Expected last section "C", got ${JSON.stringify(result)}`);
        }
        const first = pickRandomSection(sections, () => 0);
        if (first.heading !== 'A') {
          throw new Error(`Expected first section "A", got ${JSON.stringify(first)}`);
        }
      },
    },
  ];

  pickTests.forEach(test => {
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

export { runParseSectionsTests, runFilterUsableSectionsTests, runPickRandomSectionTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const parseSuccess = runParseSectionsTests();
  const filterSuccess = runFilterUsableSectionsTests();
  const pickSuccess = runPickRandomSectionTests();
  process.exit(parseSuccess && filterSuccess && pickSuccess ? 0 : 1);
}
