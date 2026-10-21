import test from "node:test";
import assert from "node:assert/strict";

import {
  WORD_SEARCH_SCORE_POLICY,
  previewWordSearchScore,
  wordSearchScoreOptions,
} from "../scripts/game/scoring.js";

test("word-search scoring uses the shared word-search penalty policy", () => {
  assert.deepEqual(WORD_SEARCH_SCORE_POLICY, {
    baseScore: 100,
    hintPenalty: 10,
    mistakePenalty: 5,
  });

  assert.deepEqual(wordSearchScoreOptions({ mistakes: 2, hints: 1 }), {
    baseScore: 100,
    hintPenalty: 10,
    hints: 1,
    mistakePenalty: 5,
    mistakes: 2,
  });
});

test("word-search score preview deducts mistakes and one hint", () => {
  assert.equal(previewWordSearchScore(), 100);
  assert.equal(previewWordSearchScore({ mistakes: 1 }), 95);
  assert.equal(previewWordSearchScore({ hints: 1 }), 90);
  assert.equal(previewWordSearchScore({ mistakes: 3, hints: 1 }), 75);
});

test("word-search score preview clamps invalid counts and never drops below zero", () => {
  assert.deepEqual(wordSearchScoreOptions({ mistakes: -4.2, hints: "not-a-number" }), {
    baseScore: 100,
    hintPenalty: 10,
    hints: 0,
    mistakePenalty: 5,
    mistakes: 0,
  });
  assert.equal(previewWordSearchScore({ mistakes: 40, hints: 20 }), 0);
});
