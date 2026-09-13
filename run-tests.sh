#!/bin/bash

# Test runner for cut-ups project
# Run this script to execute all regression tests and generate golden masters

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
echo "   Open 'test-ui-integration.html' in your browser to run tests"
echo ""

echo "✅ Test suite complete!"
echo ""
echo "Next steps:"
echo "  1. Make your refactoring changes"
echo "  2. Run this script again: ./run-tests.sh"
echo "  3. Compare output with baseline: diff golden-masters.json golden-masters.json.baseline"
