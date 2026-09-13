# Cut-Up Text Generator

A web-based tool that applies surrealist literary cut-up techniques to your text. Inspired by the pioneering work of **Brion Gysin** and popularized by **William S. Burroughs**.

🚀 **[Try it live on GitHub Pages](https://fireplacetv.github.io/cut-ups/)**

## What is the Cut-Up Technique?

The cut-up technique is a literary and visual art method where text is physically or digitally cut into pieces and rearranged to create new, often surreal, combinations. Rather than being a random scramble, it's a deliberate method of discovering unexpected connections and meanings within language.

Brion Gysin, an American painter and writer, pioneered the technique in the 1950s. William S. Burroughs adopted and popularized it, using it as a core element of his literary practice. He believed cut-ups could reveal hidden meanings and bypass the logical mind.

This web application brings these analog techniques into the digital age, allowing you to apply various cut-up methods to any text.

## Available Techniques

### Quadrant Cut (2D)
The closest digital recreation of the original Burroughs method. Your text is wrapped into a 2D grid, divided by a horizontal and vertical line through the middle (creating 4 quadrants), then the quadrants are randomly shuffled and reassembled.

**When to use:** For a faithful reproduction of the physical cut-up process that captures the true randomness and structural disruption Burroughs employed.

### Fold-In
Based on Brion Gysin's original fold-in technique. The text is split in half by lines, then lines from the first half and second half are interleaved (alternated), mimicking the effect of folding a page in half and reading across the seam.

**When to use:** For a gentler disruption that maintains line structure while creating unexpected juxtapositions.

### Line Shuffle
Cuts your text into individual lines and randomly shuffles them. Destroys paragraph structure while keeping each line intact.

**When to use:** For quick, playful rearrangements that work well with poetry or short passages.

### Sentence Shuffle
Cuts your text into sentences and randomly shuffles them. Creates new narrative possibilities while maintaining grammatical coherence.

**When to use:** For exploring different story structures and narrative flows within your text.

### Word Scramble
Cuts your text into individual words and randomly shuffles them. The most chaotic technique—perfect for abstract, surrealist results.

**When to use:** For maximum disruption and abstract linguistic exploration.

## Features

- **Five cut-up methods** to choose from
- **Adjustable line width** (40-120 characters) with smart text wrapping
- **In-place editing** – results appear directly in the text area
- **Visual icons** for each technique
- **Help page** with detailed explanations and examples
- **No installation needed** – runs entirely in your browser
- **Responsive design** – works on desktop and mobile
- **Comprehensive testing framework** – ensures quality and enables safe refactoring

## How to Use

1. **Visit the [live application](https://fireplacetv.github.io/cut-ups/)**
2. **Paste your text** into the text area
3. **Choose a technique** by clicking one of the method buttons
4. **Adjust the line width** if desired (affects wrapping and quadrant cuts)
5. **Repeat!** Each click of a button applies the technique again, creating new variations

## Installation & Development

If you want to run this locally or contribute:

```bash
git clone https://github.com/fireplacetv/cut-ups.git
cd cut-ups
# Open src/index.html in your browser
```

No build process or dependencies required. This is pure HTML, CSS, and vanilla JavaScript.

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

## Technical Details

The application implements each cut-up algorithm in JavaScript:

- **Tokenization**: Text is split into units (words, lines, sentences, or 2D grid)
- **Shuffling**: Units are randomly rearranged using Fisher-Yates shuffle
- **Reassembly**: Units are rejoined with appropriate delimiters
- **Smart Wrapping**: Text is re-wrapped to the specified width after cutting

Each method produces different results on the same input, and running a method multiple times on its own output creates new variations.

## Philosophy

This tool is both a tribute to the original cut-up artists and an exploration of how algorithmic randomness can reveal unexpected patterns in language. As Burroughs himself wrote: "The cut-up method is a way of letting the future in."

## Development & Contributing

### For Contributors

1. **Run tests before submitting PRs:**
   ```bash
   cd tests/regression
   node test-regression.js
   ```

2. **Generate golden master baseline for refactoring:**
   ```bash
   cd tests/regression
   node generate-golden-masters.js
   cp golden-masters.json golden-masters.json.baseline
   ```

3. **Key requirements:**
   - Data preservation (word/line/sentence counts)
   - Edge case handling (empty input, single tokens)
   - All regression tests must pass
   - Document algorithm changes clearly

### Testing Framework

Comprehensive multi-layer testing ensures code safety:
- **Regression Tests** (`tests/regression/test-regression.js`) - Unit tests for core logic
- **Golden Masters** - Baseline output comparison for refactoring safety
- **UI Integration Tests** (`tests/regression/test-ui-integration.html`) - Browser-based tests
- See `tests/TESTING.md` for detailed testing guide

### Known Issues

- **Quadrant method**: Currently losing words during transformation (will be fixed in upcoming release)

## Inspiration & Credits

- **Brion Gysin** – Originator of the cut-up technique
- **William S. Burroughs** – Pioneering practitioner and theorist
- **Joe Dalton** – Collaborator who documented and refined the techniques

## License

This project is open source. Feel free to fork, modify, and use for your own creative projects.

## Feedback

Found a bug? Have ideas for improvements? Feel free to open an issue on the [GitHub repository](https://github.com/fireplacetv/cut-ups/issues).

---

**Status:** Under active development with comprehensive testing framework
