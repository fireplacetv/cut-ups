# Cut-Up Text Generator

A web-based tool for applying Burroughs & Gysin cut-up techniques to text. Transform your writing using five different algorithmic methods.

## Features

- **5 Text Transformation Methods:**
  - Quadrant Cut - Wraps text into a 2D grid and shuffles the 4 quadrants
  - Fold-In - Splits text by lines and interleaves them together
  - Line Shuffle - Cuts text into lines and randomly shuffles them
  - Sentence Shuffle - Cuts text into sentences and randomly shuffles them
  - Word Scramble - Cuts text into words and randomly shuffles them

- **Interactive UI** - Paste text, choose a method, get immediate results
- **Adjustable Line Width** - Set the display width from 40 to 120 characters
- **Iterative Cutting** - Apply cut-up operations repeatedly to refine results

## Quick Start

### Running the App

Open `src/index.html` in your web browser or serve via HTTP:

```bash
# Option 1: Direct open
open src/index.html

# Option 2: Local web server
python -m http.server 8000
# Then visit http://localhost:8000/src/index.html
```

### Testing

Comprehensive testing framework included to ensure behavior is preserved during refactoring:

```bash
# Run regression tests
node tests/regression/test-regression.js

# Generate baseline output
node tests/regression/generate-golden-masters.js

# Run UI tests in browser
open tests/regression/test-ui-integration.html
```

See `tests/TESTING.md` for detailed testing documentation.

## Project Structure

```
src/                          # Application source code
├── index.html               # Main web application
├── cutup.js                # Core text transformation logic
└── style.css               # Application styles

docs/                       # Documentation
├── help.html              # User guide and method explanations

tests/                      # Test suites
├── regression/            # Modern testing framework
│   ├── test-regression.js
│   ├── test-ui-integration.html
│   └── generate-golden-masters.js
├── legacy/                # Original tests (for reference)
│   ├── test.js
│   └── test-simple.html
├── TESTING.md             # Detailed testing guide
└── README-TESTING-SETUP.md # Quick start for testing
```

## Development

### File Organization

- **src/cutup.js** - Core algorithms (pure functions)
- **src/index.html** - Web UI and DOM interaction
- **src/style.css** - Visual styling

### Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `node tests/regression/test-regression.js`
3. Commit and push: `git push -u origin feature/your-feature`
4. Open a PR with test results

### Code Review Focus

- Data preservation (word/line/sentence counts)
- Edge case handling (empty input, single tokens)
- Performance (especially for large texts)
- Consistency across methods

## Testing Strategy

This project uses a comprehensive multi-layer testing approach:

1. **Regression Tests** - Validate core logic
2. **Golden Masters** - Compare outputs against baseline
3. **UI Integration** - Test browser interactions
4. **Manual Verification** - Visual inspection in browser

Before any refactoring:
```bash
node tests/regression/generate-golden-masters.js
cp golden-masters.json golden-masters.json.baseline
```

After changes:
```bash
node tests/regression/test-regression.js
diff golden-masters.json.baseline golden-masters.json
```

## Known Issues

- **Quadrant method data loss** - Currently losing words during transformation (tracked in PR #3)

## Contributing

1. Ensure all tests pass: `node tests/regression/test-regression.js`
2. Maintain data preservation across all methods
3. Update tests when adding new methods
4. Document algorithm changes clearly

## Technology Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Testing:** Node.js, Browser APIs
- **Version Control:** Git + GitHub

## License

MIT

## Resources

- [William S. Burroughs on Cut-Ups](https://en.wikipedia.org/wiki/Cut-up_technique)
- [Brion Gysin](https://en.wikipedia.org/wiki/Brion_Gysin)
- [Help Documentation](docs/help.html) - In-app guide to methods

---

**Status:** Under active development with comprehensive testing framework  
**Latest:** Testing framework (PR #3) adds regression tests and CI support
