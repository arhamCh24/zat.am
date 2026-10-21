/**
 * The number of verses in each chapter of the Bhagavad Gita.
 * Array positions are zero-based; chapter numbers are one-based.
 */
export const CHAPTER_VERSE_COUNTS = Object.freeze([
  46, 72, 43, 42, 29, 47, 30, 28, 34,
  42, 55, 20, 35, 27, 20, 24, 28, 78,
]);

export const DEFAULT_GRID_SIZE = 10;
export const MIN_GRID_SIZE = 4;
export const MAX_GRID_SIZE = 15;

function toInteger(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : null;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value.trim())) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function getParameter(params, name) {
  if (params && typeof params.get === "function") {
    return params.get(name);
  }

  return params?.[name];
}

function randomChapter(random) {
  const sample = Number(random());
  const normalizedSample = Number.isFinite(sample)
    ? Math.min(Math.max(sample, 0), 0.9999999999999999)
    : 0;

  return Math.floor(normalizedSample * CHAPTER_VERSE_COUNTS.length) + 1;
}

/**
 * Validates the URL state used to start a puzzle.
 *
 * @param {URLSearchParams | Record<string, unknown>} params
 * @param {() => number} random Random source, injectable for deterministic tests.
 * @returns {{chapter: number, verse: number, size: number, wordsToFind: number}}
 */
export function normalizePuzzleParams(params, random = Math.random) {
  const requestedChapter = toInteger(getParameter(params, "ch"));
  const chapter = requestedChapter && requestedChapter >= 1 && requestedChapter <= CHAPTER_VERSE_COUNTS.length
    ? requestedChapter
    : randomChapter(random);

  const requestedVerse = toInteger(getParameter(params, "v"));
  const verse = requestedVerse && requestedVerse >= 1 && requestedVerse <= CHAPTER_VERSE_COUNTS[chapter - 1]
    ? requestedVerse
    : 1;

  const requestedSize = toInteger(getParameter(params, "size"));
  const size = requestedSize && requestedSize >= MIN_GRID_SIZE && requestedSize <= MAX_GRID_SIZE
    ? requestedSize
    : DEFAULT_GRID_SIZE;

  return Object.freeze({
    chapter,
    verse,
    size,
    wordsToFind: Math.floor(size / 2),
  });
}

/**
 * Returns the zero-based position of a chapter/verse in the flattened data file.
 * Invalid chapter/verse pairs return null rather than pointing at another verse.
 */
export function verseOffset(chapter, verse) {
  const validChapter = toInteger(chapter);
  const validVerse = toInteger(verse);

  if (
    !validChapter ||
    validChapter < 1 ||
    validChapter > CHAPTER_VERSE_COUNTS.length ||
    !validVerse ||
    validVerse < 1 ||
    validVerse > CHAPTER_VERSE_COUNTS[validChapter - 1]
  ) {
    return null;
  }

  return CHAPTER_VERSE_COUNTS
    .slice(0, validChapter - 1)
    .reduce((total, verseCount) => total + verseCount, 0) + validVerse - 1;
}

/** Converts a number to the Devanagari numeral system used by the UI. */
export function toDevanagariNumber(value) {
  const parsed = Number(value);
  const number = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;

  return String(number).replace(/\d/g, (digit) => String.fromCharCode(0x0966 + Number(digit)));
}
