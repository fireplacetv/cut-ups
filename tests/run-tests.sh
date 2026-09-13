#!/bin/bash

# Test runner for cut-ups project
# Run this script from the project root: ./tests/run-tests.sh

set -e

echo "================================"
echo "Cut-Up Text Generator Test Suite"
echo "================================"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

# Navigate to regression tests directory
cd "$(dirname "$0")/regression"

# Generate golden masters (captures current behavior)
echo "📊 Generating golden masters..."
node generate-golden-masters.js
echo ""

# Run regression tests
echo "🧪 Running regression tests..."
node test-regression.js
echo ""

# Print UI test instructions
echo "🌐 UI Integration Tests:"
echo "   From project root, run: python -m http.server 8000"
echo "   Then open: http://localhost:8000/tests/regression/test-ui-integration.html"
echo ""

echo "✅ Test suite complete!"
echo ""
echo "Next steps:"
echo "  1. Make your refactoring changes"
echo "  2. Run this script again: ./tests/run-tests.sh"
echo "  3. Compare output with baseline: diff regression/golden-masters.json.baseline regression/golden-masters.json"
