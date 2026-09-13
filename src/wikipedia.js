// Client-side integration with Wikipedia's MediaWiki API for the "Random
// Wikipedia Article" insert feature. Everything here runs in the browser —
// the API supports anonymous cross-origin requests via the `origin=*`
// query param, so no backend or API key is needed.

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php';

// Section headings that are typically citation/link lists rather than
// prose, and make poor cut-up source material.
const BOILERPLATE_HEADINGS = new Set([
  'see also',
  'references',
  'external links',
  'further reading',
  'notes',
  'bibliography',
  'sources',
  'citations',
]);

// Wikipedia's plain-text extracts (explaintext + exsectionformat=wiki) mark
// headings inline as `== Heading ==`, `=== Subheading ===`, etc. (`=` is
// reserved for the page title, so the lowest heading level is `==`).
const HEADING_PATTERN = /^(={2,6})\s*(.+?)\s*\1\s*$/gm;

/**
 * Splits a Wikipedia plain-text extract into sections on its `==` headings.
 * The first section (before any heading) has `heading: null` and represents
 * the article's lead/intro. Each other section's `body` is just the text
 * under that heading, not including any nested subsections.
 * @param {string} extractText - Plain text from the `extracts` API prop.
 * @returns {Array<{heading: string|null, level: number, body: string}>}
 */
export function parseWikipediaSections(extractText) {
  const sections = [];
  let heading = null;
  let level = 0;
  let cursor = 0;

  HEADING_PATTERN.lastIndex = 0;
  let match;
  while ((match = HEADING_PATTERN.exec(extractText)) !== null) {
    const body = extractText.slice(cursor, match.index).trim();
    sections.push({ heading, level, body });
    level = match[1].length - 1;
    heading = match[2];
    cursor = HEADING_PATTERN.lastIndex;
  }
  sections.push({ heading, level, body: extractText.slice(cursor).trim() });

  return sections;
}

/**
 * Filters out sections with no usable prose: empty bodies, boilerplate
 * headings (References, See also, ...), and very short scraps.
 * @param {Array<{heading: string|null, level: number, body: string}>} sections
 * @returns {Array<{heading: string|null, level: number, body: string}>}
 */
export function filterUsableSections(sections) {
  return sections.filter(section => {
    if (section.body.length < 40) {
      return false;
    }
    if (section.heading && BOILERPLATE_HEADINGS.has(section.heading.toLowerCase())) {
      return false;
    }
    return true;
  });
}

/**
 * Picks one section at random.
 * @param {Array<object>} sections
 * @param {() => number} [random] - Injectable RNG for testing, defaults to Math.random.
 * @returns {object|null} A random section, or null if the list is empty.
 */
export function pickRandomSection(sections, random = Math.random) {
  if (sections.length === 0) {
    return null;
  }
  return sections[Math.floor(random() * sections.length)];
}

/**
 * Fetches a random Wikipedia article (main namespace only) and its plain
 * text, split into sections. Uses a single MediaWiki API request
 * (`generator=random` + `prop=extracts`).
 * @param {object} [options]
 * @param {typeof fetch} [options.fetchImpl] - Injectable fetch for testing.
 * @returns {Promise<{title: string, pageUrl: string, sections: Array<object>}>}
 */
export async function fetchRandomWikipediaArticle({ fetchImpl = fetch } = {}) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'random',
    grnnamespace: '0',
    grnlimit: '1',
    prop: 'extracts',
    explaintext: '1',
    exsectionformat: 'wiki',
  });

  const response = await fetchImpl(`${WIKIPEDIA_API_BASE}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Wikipedia API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const pages = data && data.query && data.query.pages;
  const page = pages && Object.values(pages)[0];
  if (!page || typeof page.extract !== 'string' || !page.extract.trim()) {
    throw new Error('Wikipedia API returned no article text');
  }

  const sections = filterUsableSections(parseWikipediaSections(page.extract));
  return {
    title: page.title,
    pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
    sections,
  };
}

/**
 * Fetches a random Wikipedia article and returns ready-to-insert text: a
 * heading line naming the article (and section, if not the lead) followed
 * by a blank line and the section's prose. Retries a few times if an
 * article happens to have no usable sections (e.g. disambiguation pages).
 * @param {object} [options]
 * @param {typeof fetch} [options.fetchImpl] - Injectable fetch for testing.
 * @param {() => number} [options.random] - Injectable RNG for testing.
 * @param {number} [options.maxAttempts]
 * @returns {Promise<{title: string, pageUrl: string, heading: string|null, text: string}>}
 */
export async function fetchRandomWikipediaText({ fetchImpl = fetch, random = Math.random, maxAttempts = 3 } = {}) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { title, pageUrl, sections } = await fetchRandomWikipediaArticle({ fetchImpl });
      const section = pickRandomSection(sections, random);
      if (!section) {
        lastError = new Error(`"${title}" had no usable text; trying another article`);
        continue;
      }
      const label = section.heading ? `${title} — ${section.heading}` : title;
      return {
        title,
        pageUrl,
        heading: section.heading,
        text: `${label}\n\n${section.body}`,
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Could not fetch a random Wikipedia article');
}
