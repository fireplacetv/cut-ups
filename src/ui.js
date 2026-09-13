import { cutUp, smartWrap, cleanWhitespace } from './cutup.js';
import { DEFAULT_LINE_WIDTH, WIDTH_SLIDER_MIN, WIDTH_SLIDER_MAX, WIDTH_SLIDER_STEP } from './constants.js';
import { getSelectedMethod, setSelectedMethod, getSelectedWidth, setSelectedWidth } from './state.js';

/**
 * Wires up all DOM event listeners for the cut-up UI: method buttons,
 * the width slider, and the wrap button. Reads/writes selection state via
 * state.js and delegates the actual text transforms to cutup.js. Call once
 * on page load.
 */
export function initializeUI() {
  const inputEl = document.getElementById('input');
  const methodButtons = document.querySelectorAll('.btn-method');
  const widthSlider = document.getElementById('widthSlider');
  const widthValue = document.getElementById('widthValue');
  const wrapButton = document.getElementById('wrapButton');
  const cleanWhitespaceButton = document.getElementById('cleanWhitespaceButton');

  // Initialize state
  const initialWidth = getSelectedWidth();

  // Set slider to initial width
  widthSlider.value = initialWidth;
  widthValue.textContent = initialWidth;

  // Applies the currently selected method to the input textarea in place.
  // Errors are logged rather than thrown so a bad transform doesn't leave
  // the UI's event handlers in a broken state.
  function performCutUp() {
    const text = inputEl.value;
    if (!text.trim()) {
      return;
    }

    try {
      const result = cutUp(text, getSelectedMethod(), { lineWidth: getSelectedWidth() });
      inputEl.value = result;
    } catch (error) {
      console.error('Cut-up error:', error.message);
    }
  }

  // Word-wraps the input textarea to the currently selected width, in place.
  function performWrap() {
    const text = inputEl.value;
    if (!text.trim()) {
      return;
    }

    inputEl.value = smartWrap(text, getSelectedWidth());
  }

  // Cleans up sparse/ragged whitespace (e.g. after quadrant or shuffle
  // methods) in the input textarea, in place.
  function performCleanWhitespace() {
    const text = inputEl.value;
    if (!text.trim()) {
      return;
    }

    inputEl.value = cleanWhitespace(text, getSelectedWidth());
  }

  methodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const method = btn.dataset.method;
      setSelectedMethod(method);
      performCutUp();
    });
  });

  widthSlider.addEventListener('input', () => {
    const width = parseInt(widthSlider.value);
    setSelectedWidth(width);
    widthValue.textContent = width;
  });

  wrapButton.addEventListener('click', performWrap);
  cleanWhitespaceButton.addEventListener('click', performCleanWhitespace);
}
