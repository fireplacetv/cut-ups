function tokenize(text, unit, segmentCount = 4) {
  if (!text || !text.trim()) {
    return [];
  }

  switch (unit) {
    case 'word':
      return text.split(/\s+/).filter(w => w.length > 0);

    case 'line':
      return text.split('\n');

    case 'sentence': {
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

    case 'segment': {
      if (segmentCount < 2) return [text];
      const chunkSize = Math.ceil(text.length / segmentCount);
      const segments = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        segments.push(text.slice(i, i + chunkSize));
      }
      return segments;
    }

    default:
      return [text];
  }
}

function shuffle(chunks) {
  const arr = [...chunks];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function quadrantCut2D(lines, pageWidth = 80) {
  if (lines.length < 2) return lines;

  const midRow = Math.floor(lines.length / 2);
  const topLines = lines.slice(0, midRow);
  const bottomLines = lines.slice(midRow);

  const topLeft = [];
  const topRight = [];
  const bottomLeft = [];
  const bottomRight = [];

  const midCol = Math.floor(pageWidth / 2);

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

  return result.join('\n');
}

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

function join(chunks, unit) {
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

function cutUp(text, method, options = {}) {
  const { pageWidth = 80 } = options;

  if (!text || !text.trim()) {
    return text;
  }

  // Special handling for quadrant (2D grid-based)
  if (method === 'quadrant') {
    const lines = text.split('\n');
    if (lines.length < 2) {
      return text;
    }
    return quadrantCut2D(lines, pageWidth);
  }

  let unit;
  switch (method) {
    case 'fold-in':
      unit = 'line';
      break;
    case 'line-shuffle':
      unit = 'line';
      break;
    case 'sentence-shuffle':
      unit = 'sentence';
      break;
    case 'word-scramble':
      unit = 'word';
      break;
    default:
      return text;
  }

  let chunks = tokenize(text, unit);

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

  return join(result, unit);
}

export { cutUp, tokenize };
