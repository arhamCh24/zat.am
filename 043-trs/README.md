# Sanskrit T-Rex Runner

A Sanskrit-themed adaptation of Chrome's offline T-Rex runner. The game runs in the browser and uses the original local sprite sheets and embedded sound effects.

## How to play

- Press **Space** or **↑** to start and jump.
- Press **↓** to duck.
- Press **Enter** after a collision to restart.
- On touch devices, tap the play area to jump.

The distance score and personal high score are rendered in Devanagari. The personal high score is stored in `localStorage` under `trexsamszatamhs`.

## Project files

- `index.html` contains the game page, sprite/audio resources, and shared navigation.
- `index.js` contains the runner, physics, obstacles, input, score, and responsive canvas sizing.
- `index.css` contains game-specific canvas and touch layout styles.
- `assets/default_100_percent/` and `assets/default_200_percent/` contain the runner sprite sheets.
- `../shared/game-theme.css` supplies the shared Zat.am page theme and responsive shell.
- `../js/navbar-loader.js` loads the shared navigation.

## Run locally

Serve the repository with its Vite development server (`npm run dev`) and open `/043-trs/`. The page is static and does not require a backend. The runner scales its canvas to the available play area on resize; controls support keyboard and touch input.

## Credits

Adapted from the Chromium T-Rex runner and the `t-rex-runner` project by wayou. The original BSD license notice is in `LICENSE`.
