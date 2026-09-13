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
