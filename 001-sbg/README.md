# Sanskrit Board Game

A static Sanskrit word-search game based on verses from the Bhagavad Gita.

## Run locally

The game has no build step or runtime dependencies. From this folder, start a
static server:

```powershell
npx --yes serve . -l 4173
```

Then open `http://localhost:4173/index.html?size=10&ch=1&v=1`.

## Test

Run the dependency-free checks with:

```powershell
npm test
```

They cover URL validation, chapter/verse boundaries, Devanagari-number
formatting, timer behavior, and the module load order in the main page.

## Structure

- `index.html` — main game entry point.
- `styles/` — responsive layout and game stylesheets.
- `scripts/game.js` — UI controller and word-search board renderer.
- `scripts/game/config.js` — pure puzzle configuration and formatting helpers.
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
