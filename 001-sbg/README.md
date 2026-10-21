# Sanskrit Board Game

A static Sanskrit word-search game based on verses from the Bhagavad Gita.

## Run locally

The game has no build step. It uses the repository-wide navbar, theme, and
leaderboard modules, so start a static server from the repository root:

```powershell
cd C:\Zatam\zat.am
npx --yes serve . -l 4173
```

Then open `http://localhost:4173/001-sbg/index.html?size=10&ch=1&v=1`.

## Test

From the repository root, run the dependency-free checks with:

```powershell
npm --prefix .\001-sbg test
```

They cover URL validation, chapter/verse boundaries, Devanagari-number
formatting, timer behavior, scoring rules, and the module load order in the
main page.

## Phone controls

- Instructions and puzzle settings fold away to leave more room for the board.
  Open **श्लोकः / कठिनता** to choose the chapter, verse, or difficulty; **Go**
  loads the selected verse.
- The board stays fitted to the phone screen, so every column remains visible.
- Hint and restart stay at the bottom of the screen while playing on a phone.
  **पदानि कानि?** highlights answer words directly in the shloka and brings
  them into view without opening a dialog or shifting the verse layout.
- Time starts at zero and counts up. Normal browser zoom remains available.

For layout changes, also check the running game at 320px, 390px, and 768px
widths, landscape orientation, and desktop size. Verify both open and closed
settings, all three difficulties, and that highlighting a word does not move
the board or introduce page-wide horizontal scrolling.

## Shared theme and scoring

This game uses the shared Zat.am game shell from `../shared/game-theme.css`
and the shared leaderboard module at `../js/game-score.js`.

- A new puzzle starts at **100 points**.
- Each incorrect grid click costs **5 points**.
- The first hint costs **10 points**; reopening it does not cost more.
- Completing the full puzzle submits the final 0–100 score once for signed-in
  players. The completion time is recorded as a leaderboard metric.
- If the shared leaderboard is temporarily unavailable, the puzzle and its
  local score still work normally.

## Project review

- **Type:** A scoreable word-search game, rather than a learning tool.
- **Theme:** Uses the shared game shell in `../shared/game-theme.css` for the
  page chrome, instructions, statistics, actions, completion panel, and
  responsive layout. The letter board keeps its game-specific presentation.
- **Scoring:** Uses the shared `../js/game-score.js` module. Scores range from
  0–100, with higher scores better, and are submitted only after the full
  puzzle is completed.
- **Source:** Available and editable in this `001-sbg/` directory; the main
  implementation is `index.html`, `styles/game.css`, and `scripts/game.js`.
- **README:** Available and current (this file).

## Structure

- `index.html` — main game entry point.
- `styles/` — responsive layout and game stylesheets.
- `scripts/game.js` — UI controller and word-search board renderer.
- `scripts/game/config.js` — pure puzzle configuration and formatting helpers.
- `scripts/game/scoring.js` — local, testable inputs for the shared scoring policy.
- `scripts/timer.js` — reusable count-up and countdown timer.
- `scripts/` — remaining variant and presentation scripts.
- `data/` — Bhagavad Gita verse data. Despite its former `.json` name, this is a JavaScript data file that defines `data`.
- `assets/images/` — UI images and word-search screenshots.
- `variants/` — alternative word-search implementations.
- `presentations/` — Gita presentation pages.
- `tests/` — Node's built-in test suite for the main game helpers.
- `cover.jpg` — catalog thumbnail; this stays at the project root because the parent site reads it from there.

## Compatibility pages

The former root-level variant and presentation page names remain as redirect pages, so existing links continue to work.

## Attribution

Verse data originates from the Bhagavad Gita CSV maintained at https://github.com/rohit-yadav/bhagavad-gita/.
