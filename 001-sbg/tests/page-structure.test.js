import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const indexHtml = readFileSync(
  new URL("../index.html", import.meta.url),
  "utf8",
);
const gameScript = readFileSync(
  new URL("../scripts/game.js", import.meta.url),
  "utf8",
);

test("the game starts as a module after the classic verse-data script", () => {
  assert.match(
    indexHtml,
    /<script\s+src=["']data\/bhagavad-gita\.js["']><\/script>\s*<script\s+type=["']module["']\s+src=["']scripts\/game\.js["']><\/script>/,
  );
});
test("the page uses unique native controls without legacy event handlers or dependencies", () => {
  for (const id of [
    "chapter-select",
    "verse-select",
    "load-verse",
    "hint-button",
    "refresh-button",
  ]) {
    const matches = indexHtml.match(new RegExp(`id=["']${id}["']`, "g")) ?? [];
    assert.equal(matches.length, 1, `${id} should appear exactly once`);
  }

  assert.doesNotMatch(indexHtml, /\son[a-z]+\s*=/i);
  assert.doesNotMatch(indexHtml, /jquery|popper|bootstrap|timer\.css/i);
});

test("the verse selector keeps its original Go label and the hint stays in the shloka", () => {
  assert.match(
    indexHtml,
    /<button[^>]*id=["']load-verse["'][^>]*>\s*Go\s*<\/button>/,
  );
  assert.doesNotMatch(indexHtml, /hintPopup|role=["']dialog["']/);
  assert.match(gameScript, /showHint\(\)[\s\S]*?this\.renderVerse\(true\)/);
  assert.match(gameScript, /content\.classList\.add\("is-hint"\)/);
  assert.doesNotMatch(gameScript, /hintPopup|trapHintFocus|hideHint/);
});

test("the page uses the shared Zat.am game theme and score UI", () => {
  assert.match(indexHtml, /href=["']\.\.\/shared\/game-theme\.css["']/);
  assert.match(indexHtml, /class=["'][^"']*zatam-themed-game[^"']*["']/);

  for (const id of [
    "scoreValue",
    "hintsValue",
    "resultPanel",
    "resultScore",
    "scoreSaveStatus",
    "play-again",
  ]) {
    assert.match(indexHtml, new RegExp(`id=["']${id}["']`));
  }

  assert.match(gameScript, /\.\.\/\.\.\/js\/game-score\.js/);
  assert.match(gameScript, /import\(SHARED_SCORE_MODULE_URL\)/);
  assert.match(gameScript, /Shared leaderboard is unavailable/);
  assert.match(gameScript, /SCORE_INITIALIZATION_TIMEOUT_MS/);
  assert.match(gameScript, /await this\.waitForScoreApi\(\)/);
  assert.match(gameScript, /startedAt: this\.runStartedAt/);
  assert.match(gameScript, /initGameScore\(/);
  assert.match(gameScript, /scoreFromPenalties\(/);
  assert.match(gameScript, /submitGameScore\(/);
});
