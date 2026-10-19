import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const indexHtml = readFileSync(
  new URL("../index.html", import.meta.url),
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
