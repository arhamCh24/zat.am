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

Run the dependency-free checks with:

```powershell
npm test
```

They cover URL validation, chapter/verse boundaries, Devanagari-number
formatting, timer behavior, scoring rules, and the module load order in the
main page.

## Shared theme and scoring

This game uses the shared Zat.am game shell from `../shared/game-theme.css`
and the shared leaderboard module at `../js/game-score.js`.

- A new puzzle starts at **100 points**.
- Each incorrect grid click costs **5 points**.
- The first hint costs **10 points**; reopening it does not cost more.
- Completing the full puzzle submits the final 0–100 score once for signed-in
  players. The completion time is recorded as a leaderboard metric.
- A time-out shows a local score of 0 but does not create a leaderboard entry.
- If the shared leaderboard is temporarily unavailable, the puzzle and its
  local score still work normally.

## Structure

- `index.html` — main game entry point.
- `styles/` — responsive layout and game stylesheets.
- `scripts/game.js` — UI controller and word-search board renderer.
- `scripts/game/config.js` — pure puzzle configuration and formatting helpers.
- `scripts/game/scoring.js` — local, testable inputs for the shared scoring policy.
- `scripts/timer.js` — reusable countdown timer.
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
