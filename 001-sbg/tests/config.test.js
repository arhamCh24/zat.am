import test from "node:test";
import assert from "node:assert/strict";

import {
  CHAPTER_VERSE_COUNTS,
  normalizePuzzleParams,
  toDevanagariNumber,
  verseOffset,
} from "../scripts/game/config.js";

test("chapter metadata contains all 18 Bhagavad Gita chapters", () => {
  assert.deepEqual(CHAPTER_VERSE_COUNTS, [
    46, 72, 43, 42, 29, 47, 30, 28, 34,
    42, 55, 20, 35, 27, 20, 24, 28, 78,
  ]);
  assert.equal(CHAPTER_VERSE_COUNTS.length, 18);
  assert.equal(Object.isFrozen(CHAPTER_VERSE_COUNTS), true);
});

test("normalization uses safe defaults for a missing puzzle URL", () => {
  assert.deepEqual(normalizePuzzleParams({}, () => 0), {
    chapter: 1,
    verse: 1,
    size: 10,
    wordsToFind: 5,
  });
});

test("normalization includes chapter 18 when selecting a random chapter", () => {
  const puzzle = normalizePuzzleParams({ ch: "not-a-number" }, () => 0.999999);

  assert.equal(puzzle.chapter, 18);
  assert.equal(puzzle.verse, 1);
});

test("normalization accepts valid URL query values and derives a word target", () => {
  const puzzle = normalizePuzzleParams(
    new URLSearchParams("ch=18&v=78&size=15"),
    () => 0,
  );

  assert.deepEqual(puzzle, {
    chapter: 18,
    verse: 78,
    size: 15,
    wordsToFind: 7,
  });
});

test("normalization rejects invalid chapters, verses, and grid sizes", () => {
  const invalidChapter = normalizePuzzleParams(
    { ch: "19", v: "1", size: "10" },
    () => 0,
  );
  const invalidVerse = normalizePuzzleParams(
    { ch: "18", v: "79", size: "10" },
    () => 0,
  );
  const invalidSmallGrid = normalizePuzzleParams(
    { ch: "1", v: "1", size: "3" },
    () => 0,
  );
  const invalidLargeGrid = normalizePuzzleParams(
    { ch: "1", v: "1", size: "16" },
    () => 0,
  );
  const fractionalValues = normalizePuzzleParams(
    { ch: "1.5", v: "2.5", size: "8.5" },
    () => 0,
  );

  assert.deepEqual(invalidChapter, {
    chapter: 1,
    verse: 1,
    size: 10,
    wordsToFind: 5,
  });
  assert.deepEqual(invalidVerse, {
    chapter: 18,
    verse: 1,
    size: 10,
    wordsToFind: 5,
  });
  assert.equal(invalidSmallGrid.size, 10);
  assert.equal(invalidLargeGrid.size, 10);
  assert.deepEqual(fractionalValues, {
    chapter: 1,
    verse: 1,
    size: 10,
    wordsToFind: 5,
  });
});

test("normalization accepts inclusive grid size boundaries", () => {
  const smallest = normalizePuzzleParams({ ch: "1", v: "1", size: "4" });
  const largest = normalizePuzzleParams({ ch: "1", v: "1", size: "15" });

  assert.deepEqual(smallest, {
    chapter: 1,
    verse: 1,
    size: 4,
    wordsToFind: 2,
  });
  assert.deepEqual(largest, {
    chapter: 1,
    verse: 1,
    size: 15,
    wordsToFind: 7,
  });
});

test("verse offsets map chapter and verse pairs into the source data", () => {
  assert.equal(verseOffset(1, 1), 0);
  assert.equal(verseOffset(1, 46), 45);
  assert.equal(verseOffset(2, 1), 46);
  assert.equal(verseOffset(18, 1), 622);
  assert.equal(verseOffset(18, 78), 699);
});

test("verse offsets reject invalid chapter and verse combinations", () => {
  assert.equal(verseOffset(0, 1), null);
  assert.equal(verseOffset(19, 1), null);
  assert.equal(verseOffset(1, 47), null);
  assert.equal(verseOffset(18, 79), null);
  assert.equal(verseOffset(1.5, 1), null);
  assert.equal(verseOffset(1, 1.5), null);
});

test("Sanskrit numeral formatting preserves every digit", () => {
  assert.equal(toDevanagariNumber(0), "०");
  assert.equal(toDevanagariNumber(9), "९");
  assert.equal(toDevanagariNumber(10), "१०");
  assert.equal(toDevanagariNumber(18078), "१८०७८");
});
