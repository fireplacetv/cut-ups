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
 * Pre-processes text for quadrantCut2D() so its column cut (at
 * Math.floor(lineWidth / 2)) never lands in the middle of a word, and so
 * the fragments it produces never get glued together with no separator
 * once quadrantCut2D() shuffles and reassembles them.
 *
 * Wraps to one less than half of lineWidth first — since smartWrap() never
 * breaks a word, every resulting half-line already ends on a word boundary,
 * and the reserved column guarantees a half-line that fits in one column
 * (see below) is short enough that padding it out always adds at least one
 * real space. Half-lines are then paired up two at a time: the left half of
 * each pair is padded with spaces out to exactly halfWidth, the right half
 * is appended directly after it, and a single guaranteed space is appended
 * after that. Appending (rather than slicing to width) is what keeps the
 * right half intact — quadrantCut2D()'s slice at midCol only ever cuts
 * *before* it, at column halfWidth, never through it, no matter how long
 * it is.
 *
 * The two guaranteed spaces (one after the left half, one at the very end
 * of the line) are what make the result safe to shuffle. quadrantCut2D()
 * slices each composed line into a left fragment (chars before halfWidth)
 * and a right fragment (chars from halfWidth on, including the trailing
 * space we appended), shuffles the four resulting quadrants as whole
 * groups, and reassembles rows by directly concatenating whichever
 * fragment lands in each position - so any left fragment can end up next
 * to any right fragment from a *different* original row. Without a
 * guaranteed trailing space on *both* fragment types, a right fragment at
 * least halfWidth characters long (e.g. one holding an overlong word) would
 * have nothing added by quadrantCut2D()'s own padEnd(midCol) if it landed
 * in the first position of a reassembled row, and would glue directly onto
 * whatever followed it (e.g. "epsilon" + "zeta" -> "epsilonzeta"). Because
 * every composed line here always ends in a real space, every right
 * fragment does too, so that can't happen; the left half's own guaranteed
 * space (from the reserved column) covers the equivalent case for left
 * fragments the same way.
 *
 * A half-line that is itself one word too long to fit in halfWidth can't be
 * used as the *left* half of a pair — its own length would already carry
 * past column halfWidth, so the cut would land inside it instead of before
 * it. Such a half-line is used as a lone *right* half instead, paired with
 * a blank left column, so it starts exactly at column halfWidth and — like
 * any right half — is never cut into. The half-line that would have paired
 * with it is carried over to pair with the next one instead, so nothing is
 * dropped.
 *
 * @param {string} text - Source text.
 * @param {number} lineWidth - Target full width that will be passed to quadrantCut2D.
 * @returns {string[]} Composed full-width lines, ready for quadrantCut2D().
 */
function prepareQuadrantLines(text, lineWidth) {
  const halfWidth = Math.floor(lineWidth / 2);
  // One column shorter than halfWidth, so padEnd(halfWidth) below always has
  // at least one space to add for any half-line that fits within it.
  const contentWidth = Math.max(halfWidth - 1, 1);
  const halfLines = smartWrap(text, contentWidth).split('\n');

  const composed = [];
  let i = 0;
  while (i < halfLines.length) {
    const left = halfLines[i];

    if (left.length >= halfWidth) {
      // A single word too long to fit left of the cut. Put it in the right
      // slot instead (with a blank left) so it starts exactly at column
      // halfWidth rather than straddling it, and try the next half-line
      // again as a fresh left.
      composed.push(''.padEnd(halfWidth) + left + ' ');
      i += 1;
    } else {
      const right = halfLines[i + 1] || '';
      composed.push(left.padEnd(halfWidth) + right + ' ');
      i += 2;
    }
  }

  return composed;
}

/**
 * Splits text into four quadrants (top-left/top-right/bottom-left/bottom-right)
 * by row and column midpoints, shuffles the quadrants, then reassembles them
 * back into full-width rows.
 *
 * Callers should pass lines produced by prepareQuadrantLines() rather than a
 * plain smartWrap()+split('\n'), so the column cut at midCol lands on a word
 * boundary instead of splitting a word (see prepareQuadrantLines() for how).
 *
 * KNOWN ISSUE (tracked, intentionally left as-is per CLAUDE.md): when a
 * quadrant has fewer lines than its counterpart, the missing rows are
 * padded rather than preserved, which loses words. The regression suite
 * exercises this to demonstrate the bug rather than to hide it — do not
 * "fix" it here without updating the tests and CLAUDE.md.
 *
 * @param {string[]} lines - Text split into lines (see prepareQuadrantLines()).
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
 * @param {'word'|'line'|'sentence'|'quadrant'|'segment'} unit
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
    case 'quadrant':
      // quadrantCut2D() returns one string per grid row; rows join like lines.
      return chunks.join('\n');
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
 *   which uses it (via prepareQuadrantLines()) to build lines whose column
 *   midpoint always falls on a word boundary before splitting into a 2D grid.
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

  // Quadrant uses lines as its unit, and needs them pre-processed so its
  // column midpoint always falls on a word boundary (see prepareQuadrantLines()).
  if (method === 'quadrant') {
    chunks = prepareQuadrantLines(text, lineWidth);
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

/**
 * Cleans up sparse whitespace left behind by cut-up methods (e.g. quadrant's
 * padded columns, or fold-in/shuffle runs producing ragged gaps between
 * words). Recognizes double line breaks as paragraph boundaries, re-wraps
 * the text with smartWrap (which collapses any run of whitespace between
 * words down to a single space), then caps any remaining run of line
 * breaks at 2 so paragraph breaks are preserved without letting blank
 * lines pile up beyond that.
 * @param {string} text
 * @param {number} width - Max characters per line, passed through to smartWrap.
 * @returns {string} Whitespace-normalized text; returned as-is if width <= 0 or text is empty.
 */
function cleanWhitespace(text, width) {
  if (!text || width <= 0) return text;
  return smartWrap(text, width).replace(/\n{3,}/g, '\n\n');
}

export { cutUp, tokenize, smartWrap, cleanWhitespace, reassemble };
