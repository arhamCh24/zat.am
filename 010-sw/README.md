# Zodiac Symbol Match

`010-sw` is a Sanskrit zodiac matching game. Spin the wheel to draw the twelve
zodiac symbols one at a time, then match each symbol to the Sanskrit name and
transliteration shown on a card.

## How to play

1. Select **Spin** to draw a zodiac symbol.
2. Drag the symbol onto the matching name. On a touch screen, tap the symbol
   and then tap the matching name.
3. Match all twelve signs as quickly as possible.

The timer starts on the first spin. Each correct match adds 5 points. After all
twelve signs are matched, the time bonus is +40 under 50 seconds, +30 under
75 seconds, +20 under 90 seconds, and +10 under 120 seconds; slower finishes
receive no time bonus. The final score and its breakdown appear in a results
popup. Correct matches stay locked in place; incorrect matches can be tried
again.

Completed scores are submitted through the shared leaderboard service when the
player is signed in. Match points, time bonus, and game time are recorded as
score metadata.

## Files

- `index.html` contains the game interface and shared theme integration.
- `script.js` controls the wheel, symbol draws, matching, timer, and score.
- `styles.css` contains the game layout and responsive styles.
- `wheel.png` and `marker.png` are the wheel and pointer images.
- `../shared/game-theme.css` provides the shared page shell, stats, cards,
  buttons, and status styles.
- `../js/game-score.js` submits completed scores to the shared leaderboard.
- `../js/navbar-loader.js` loads the shared site navigation.

## Responsive layout

On wide screens the wheel and matching board sit side by side. On narrower
screens they stack vertically; on small screens, the compact matching board
uses three columns and four rows.
