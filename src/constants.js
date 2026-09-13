// Default wrap width (in characters) used by smartWrap and the quadrant method.
export const DEFAULT_LINE_WIDTH = 80;
// Default number of segments for methods that split text into chunks.
export const DEFAULT_SEGMENT_COUNT = 4;

// Bounds and step for the width slider control in the UI.
export const WIDTH_SLIDER_MIN = 40;
export const WIDTH_SLIDER_MAX = 120;
export const WIDTH_SLIDER_STEP = 1;

// Maps each cut-up method to the text unit (word/line/sentence/quadrant)
// that cutUp() should tokenize on before applying the method.
export const METHOD_TO_UNIT = {
  'fold-in': 'line',
  'line-shuffle': 'line',
  'sentence-shuffle': 'sentence',
  'word-scramble': 'word',
  'quadrant': 'quadrant'
};

// All cut-up methods available in the UI, in display order.
export const METHODS = ['quadrant', 'fold-in', 'line-shuffle', 'sentence-shuffle', 'word-scramble'];

// Placeholder text preloaded into the input textarea so first-time users
// have something to cut up immediately.
export const DEFAULT_INPUT_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;
