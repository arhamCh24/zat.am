From https://github.com/berkerol/typer

# Sankhya Typer — Zat.am

Sankhya Typer is a browser-based number survival game built for Zat.am. Players practise recognising Devanagari numerals by typing the matching number before it reaches the central circle.

## Gameplay

Numbers appear from the edges of the game area and move toward the circle.

- Press the matching key from **0–9** to destroy a number.
- If multiple matching numbers are present, the one closest to the circle is destroyed first.
- Each correct match produces an explosion effect.
- You have **one life**. A number reaching the circle ends the game.
- Survive for **2 minutes 30 seconds** to complete the challenge.

The game supports the keyboard number row, numeric keypad, and Devanagari digit input.

## Scoring

Earn **1 point per full second survived**. Pressing a number that is not currently on the screen incurs a **3-point penalty**.

The final score is limited to **0–100**:

    Score = seconds survived − (incorrect presses × 3)

For example, surviving 60 seconds with four incorrect presses earns:

    60 − (4 × 3) = 48 points

Correct matches do not directly award points; they help you survive longer.

## Controls

| Input | Action |
|-------|--------|
| 0–9 | Destroy a matching number |
| Esc or P | Pause or resume |
| Submit Score | Save the finished attempt to the leaderboard |
| Try Again | Reset the game and start another attempt |

Holding down a number key does not repeatedly destroy numbers or apply repeated penalties.

Switching to another browser tab pauses the game. Press **Esc** or **P** after returning to resume.

## Results and Leaderboard

When the player loses or completes the challenge, a result popup displays the time survived and final score.

Players can choose to:

- **Submit Score** to save the attempt through Zat.am’s shared leaderboard integration.
- **Try Again** to start a fresh attempt.

Score submission is manual, including after completing the challenge. Players must be signed in to save a score. An attempt cannot be submitted again after a successful submission.

The game uses the shared `js/game-score.js` module rather than implementing its own Firebase writes.

## Interface

The game includes:

- A dashboard displaying score, time passed, and remaining lives.
- Instructions explaining controls, scoring, and the survival target.
- A canvas play area with moving Devanagari numerals.
- Particle effects when numbers are destroyed.
- Pause and result overlays.
- The shared Zat.am navigation bar.

## Technologies

- HTML5 Canvas
- CSS3
- JavaScript
- Bootstrap 4
- Particle animation library
- Zat.am’s shared Firebase authentication and scoring integration

## Project Structure

    <game-folder>/
    ├── index.html     # Page structure, dashboard, and result popup
    ├── typer.css      # Game and interface styling
    ├── typer.js       # Gameplay, scoring, input, and submission
    └── canvas.js      # Animation loop and drawing utilities

Shared dependencies are located outside the game folder:

    <repository-root>/
    ├── js/
    │   ├── navbar-loader.js
    │   └── game-score.js
    └── auth/
        └── api/
            ├── middleware.js
            └── firebase-config.js

## Running Locally

1. Clone the Zat.am repository:

       git clone https://github.com/arhamCh24/zat.am.git

2. Open the repository root in Visual Studio Code.
3. Start Live Server from the repository root.
4. Navigate to the game folder’s `index.html`.
5. Sign in through Zat.am if you want to submit scores.

Serve the complete repository rather than opening the HTML file directly or serving only the game folder. Shared navigation, authentication, and scoring depend on the repository’s directory structure.

An internet connection is required for externally hosted libraries and Firebase services.

## Game Configuration

Gameplay settings are defined in `typer.js`:

- `letter.lowestSpeed` and `letter.highestSpeed` control movement speed.
- `letter.probability` controls how frequently numbers appear.
- `updateScore()` calculates the score and incorrect-press penalties.
- The survival timer determines when the challenge completes.
- `initializeScoring()` sets the leaderboard game ID and display name.

Canvas dimensions are set in `canvas.js` and updated by `resizeHandler()` in `typer.js`. Keep both height calculations consistent when changing the play area.

## Troubleshooting

### Shared files return 404 errors

Ensure Live Server is serving the repository root and that the shared `js` and `auth` folders are present.

### A score does not submit

Confirm that you are signed in, check your internet connection, and inspect the browser console for authentication or Firebase errors.

### The game remains paused after switching tabs

Press **Esc** or **P** to resume.

### The game area has an unexpected height

Check the canvas height settings in both `canvas.js` and `resizeHandler()` in `typer.js`.