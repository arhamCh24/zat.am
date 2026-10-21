export const WORD_SEARCH_SCORE_POLICY = Object.freeze({
  baseScore: 100,
  hintPenalty: 10,
  mistakePenalty: 5,
});

function count(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.floor(parsed));
}

/**
 * Returns the exact inputs consumed by Zat.am's shared scoreFromPenalties
 * helper. Keeping the policy here makes the word-search rules testable without
 * importing the Firebase-backed shared leaderboard module in Node tests.
 */
export function wordSearchScoreOptions({ mistakes = 0, hints = 0 } = {}) {
  return {
    ...WORD_SEARCH_SCORE_POLICY,
    mistakes: count(mistakes),
    hints: count(hints),
  };
}

/**
 * Local preview of the shared penalty score for the live score display.
 * The final submitted score is still calculated by scoreFromPenalties from
 * ../../js/game-score.js.
 */
export function previewWordSearchScore(stats = {}) {
  const {
    baseScore,
    hintPenalty,
    hints,
    mistakePenalty,
    mistakes,
  } = wordSearchScoreOptions(stats);

  return Math.max(
    0,
    Math.min(100, baseScore - mistakes * mistakePenalty - hints * hintPenalty),
  );
}
