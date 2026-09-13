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
// have something to cut up immediately. Pulled from the README's
// introduction (rather than lorem ipsum) so the effect of each technique
// is legible in English from the start.
export const DEFAULT_INPUT_TEXT = `The cut-up technique is a literary and visual art method where text is physically or digitally cut into pieces and rearranged to create new, often surreal, combinations. Rather than being a random scramble, it's a deliberate method of discovering unexpected connections and meanings within language.

Brion Gysin, an American painter and writer, pioneered the technique in the 1950s. William S. Burroughs adopted and popularized it, using it as a core element of his literary practice. He believed cut-ups could reveal hidden meanings and bypass the logical mind.`;
