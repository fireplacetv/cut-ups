import { cutUp, smartWrap } from './cutup.js';
import { DEFAULT_LINE_WIDTH, WIDTH_SLIDER_MIN, WIDTH_SLIDER_MAX, WIDTH_SLIDER_STEP } from './constants.js';
import { getSelectedMethod, setSelectedMethod, getSelectedWidth, setSelectedWidth } from './state.js';

function updateActiveMethodButton(method) {
  document.querySelectorAll('.btn-method').forEach(btn => {
    const isActive = btn.dataset.method === method;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

export function initializeUI() {
  const inputEl = document.getElementById('input');
  const methodButtons = document.querySelectorAll('.btn-method');
  const widthSlider = document.getElementById('widthSlider');
  const widthValue = document.getElementById('widthValue');
  const wrapButton = document.getElementById('wrapButton');

  // Initialize state
  const initialMethod = getSelectedMethod();
  const initialWidth = getSelectedWidth();

  // Set slider to initial width
  widthSlider.value = initialWidth;
  widthValue.textContent = initialWidth;

  // Show initial active method
  updateActiveMethodButton(initialMethod);

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

  function performWrap() {
    const text = inputEl.value;
    if (!text.trim()) {
      return;
    }

    inputEl.value = smartWrap(text, getSelectedWidth());
  }

  methodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const method = btn.dataset.method;
      setSelectedMethod(method);
      updateActiveMethodButton(method);
      performCutUp();
    });
  });

  widthSlider.addEventListener('input', () => {
    const width = parseInt(widthSlider.value);
    setSelectedWidth(width);
    widthValue.textContent = width;
  });

  wrapButton.addEventListener('click', performWrap);
}
