import { cutUp, smartWrap } from './cutup.js';
import { DEFAULT_LINE_WIDTH, WIDTH_SLIDER_MIN, WIDTH_SLIDER_MAX, WIDTH_SLIDER_STEP } from './constants.js';

export function initializeUI() {
  const inputEl = document.getElementById('input');
  const methodButtons = document.querySelectorAll('.btn-method');
  const widthSlider = document.getElementById('widthSlider');
  const widthValue = document.getElementById('widthValue');

  let selectedMethod = 'quadrant';
  let selectedWidth = DEFAULT_LINE_WIDTH;

  function performCutUp() {
    const text = inputEl.value;
    if (!text.trim()) {
      return;
    }

    const result = cutUp(text, selectedMethod, { pageWidth: selectedWidth });
    const wrapped = smartWrap(result, selectedWidth);
    inputEl.value = wrapped;
  }

  methodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedMethod = btn.dataset.method;
      performCutUp();
    });
  });

  widthSlider.addEventListener('input', () => {
    selectedWidth = parseInt(widthSlider.value);
    widthValue.textContent = selectedWidth;
    performCutUp();
  });
}
