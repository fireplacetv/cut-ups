import { DEFAULT_LINE_WIDTH, METHOD_TO_UNIT } from './constants.js';

/**
 * Splits text into an array of chunks for a given unit.
 * @param {string} text - Source text.
 * @param {'word'|'line'|'sentence'} unit - Granularity to split on.
 * @returns {string[]} Chunks in original order; empty array for empty/blank input.
 */
function tokenize(text, unit) {
  if (!text || !text.trim()) {
    return [];
  }

  switch (unit) {
    case 'word':
      return text.split(/\s+/).filter(w => w.length > 0);

    case 'line':
      return text.split('\n');

    case 'sentence': {
      // Naive sentence detection: walk character-by-character and end a
      // sentence at a terminator (. ! ?) that is followed by whitespace or
      // end-of-string. This deliberately avoids a regex lookbehind so it
      // handles abbreviations/decimals no better or worse than a simple
      // split would — see "Better sentence detection" in low-priority TODOs.
      const sentences = [];
      let current = '';
      for (let i = 0; i < text.length; i++) {
        current += text[i];
        if ((text[i] === '.' || text[i] === '!' || text[i] === '?') &&
            (i === text.length - 1 || /\s/.test(text[i + 1]))) {
          sentences.push(current.trim());
          current = '';
        }
      }
      if (current.trim()) {
        sentences.push(current.trim());
      }
      return sentences.filter(s => s.length > 0);
    }

    default:
      return [text];
  }
}

/**
 * Returns a new array containing the same chunks in random order
 * (Fisher-Yates shuffle). Does not mutate the input array.
 * @param {Array} chunks
 * @returns {Array} Shuffled copy of chunks.
 */
function shuffle(chunks) {
  const arr = [...chunks];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Splits text into four quadrants (top-left/top-right/bottom-left/bottom-right)
 * by row and column midpoints, shuffles the quadrants, then reassembles them
 * back into full-width rows.
 *
 * KNOWN ISSUE (tracked, intentionally left as-is per CLAUDE.md): when a
 * quadrant has fewer lines than its counterpart, the missing rows are
 * padded rather than preserved, which loses words. The regression suite
 * exercises this to demonstrate the bug rather than to hide it — do not
 * "fix" it here without updating the tests and CLAUDE.md.
 *
 * @param {string[]} lines - Text split into lines.
 * @param {number} lineWidth - Character width used to find the column midpoint.
 * @returns {string[]} Reassembled lines with quadrants shuffled.
 */
function quadrantCut2D(lines, lineWidth) {
  if (lines.length < 2) return lines;

  const midRow = Math.floor(lines.length / 2);
  const topLines = lines.slice(0, midRow);
  const bottomLines = lines.slice(midRow);

  const topLeft = [];
  const topRight = [];
  const bottomLeft = [];
  const bottomRight = [];

  const midCol = Math.floor(lineWidth / 2);

  for (const line of topLines) {
    topLeft.push(line.slice(0, midCol));
    topRight.push(line.slice(midCol));
  }

  for (const line of bottomLines) {
    bottomLeft.push(line.slice(0, midCol));
    bottomRight.push(line.slice(midCol));
  }

  const quadrants = [topLeft, topRight, bottomLeft, bottomRight];
  const shuffled = shuffle(quadrants);

  const result = [];
  const maxLines = Math.max(...shuffled.map(q => q.length));

  for (let i = 0; i < maxLines; i++) {
    let row = '';
    row += (shuffled[0][i] || '').padEnd(midCol);
    row += (shuffled[1][i] || '').padEnd(midCol);
    result.push(row);
  }

  for (let i = 0; i < maxLines; i++) {
    let row = '';
    row += (shuffled[2][i] || '').padEnd(midCol);
    row += (shuffled[3][i] || '').padEnd(midCol);
    result.push(row);
  }

  return result;
}

/**
 * Interleaves the first and second halves of chunks (Burroughs/Gysin
 * "fold-in": first[0], second[0], first[1], second[1], ...). Preserves
 * every chunk, just reorders them, so chunk count is always unchanged.
 * @param {Array} chunks
 * @returns {Array} Interleaved chunks; returned as-is if fewer than 2.
 */
function foldIn(chunks) {
  if (chunks.length < 2) return chunks;

  const mid = Math.floor(chunks.length / 2);
  const first = chunks.slice(0, mid);
  const second = chunks.slice(mid);

  const result = [];
  const maxLen = Math.max(first.length, second.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < first.length) result.push(first[i]);
    if (i < second.length) result.push(second[i]);
  }

  return result;
}

/**
 * Joins chunks back into a single string using the separator appropriate
 * for the given unit (mirrors how tokenize() split them).
 * @param {string[]} chunks
 * @param {'word'|'line'|'sentence'|'segment'} unit
 * @returns {string} Joined text; empty string for empty input.
 */
function reassemble(chunks, unit) {
  if (chunks.length === 0) return '';

  switch (unit) {
    case 'word':
      return chunks.join(' ');
    case 'line':
      return chunks.join('\n');
    case 'sentence':
      return chunks.join(' ');
    case 'segment':
      return chunks.join('');
    default:
      return chunks.join('');
  }
}

/**
 * Applies a cut-up method to text: tokenizes into the method's unit,
 * transforms the chunks (shuffle, fold-in, or 2D quadrant split), then
 * reassembles into a string.
 * @param {string} text - Source text.
 * @param {'quadrant'|'fold-in'|'line-shuffle'|'sentence-shuffle'|'word-scramble'} method
 * @param {{lineWidth?: number}} [options] - lineWidth is only used by 'quadrant',
 *   which wraps text to this width internally before splitting it into a 2D
 *   grid (quadrantCut2D's column midpoint is only meaningful once lines are
 *   uniformly wrapped to lineWidth).
 * @returns {string} Transformed text. Empty/blank input and single-chunk
 *   input are returned unchanged (see "Key Invariants" in CLAUDE.md).
 * @throws {Error} If method is not a recognized cut-up method.
 */
function cutUp(text, method, options = {}) {
  const { lineWidth = DEFAULT_LINE_WIDTH } = options;

  if (!text || !text.trim()) {
    return text;
  }

  // Validate method
  const unit = METHOD_TO_UNIT[method];
  if (!unit) {
    throw new Error(`Unknown method: ${method}`);
  }

  let chunks;

  // Quadrant uses lines as its unit, and needs them wrapped to lineWidth
  // first so its column midpoint corresponds to an actual visual midpoint.
  if (method === 'quadrant') {
    chunks = smartWrap(text, lineWidth).split('\n');
    if (chunks.length < 2) {
      return text;
    }
    chunks = quadrantCut2D(chunks, lineWidth);
  } else {
    chunks = tokenize(text, unit);
    if (chunks.length < 2) {
      return text;
    }

    let result;
    switch (method) {
      case 'fold-in':
        result = foldIn(chunks);
        break;
      case 'line-shuffle':
      case 'sentence-shuffle':
      case 'word-scramble':
        result = shuffle(chunks);
        break;
      default:
        result = chunks;
    }
    chunks = result;
  }

  return reassemble(chunks, unit);
}

/**
 * Word-wraps text to a maximum width without breaking words mid-word.
 * Within a paragraph, existing line breaks are treated as soft and words
 * are reflowed freely, so narrow lines get combined into wider ones as
 * well as wide lines split into narrower ones. Double line breaks are
 * treated as paragraph boundaries and are never joined across.
 * @param {string} text
 * @param {number} width - Max characters per output line.
 * @returns {string} Re-wrapped text; returned as-is if width <= 0 or text is empty.
 */
function smartWrap(text, width) {
  if (!text || width <= 0) return text;

  const paragraphs = text.split(/\n{2,}/);

  const wrappedParagraphs = paragraphs.map(paragraph => {
    const words = paragraph.split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return paragraph;

    const wrappedLines = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length === 0) {
        currentLine = word;
      } else if ((currentLine + ' ' + word).length <= width) {
        currentLine += ' ' + word;
      } else {
        wrappedLines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) wrappedLines.push(currentLine);
    return wrappedLines.join('\n');
  });

  return wrappedParagraphs.join('\n\n');
}

export { cutUp, tokenize, smartWrap, reassemble };
