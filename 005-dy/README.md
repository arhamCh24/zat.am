# द्वन्द्वयुद्धम् (Dvandvayuddham)

`005-dy` is a two-player tic-tac-toe game. Players enter their names in a
themed dialog, then take turns marking the 3×3 board with `x` and `☺`. The game
announces a winner when a player completes a row, column, or diagonal.

## Files

- `index.html` contains the game page and board markup.
- `ttt.js` contains the game state and win detection.
- `ttti.js` handles the player name form and board interaction.
- `ttt.css` styles the game board and adapts it to smaller screens.
- `../shared/game-theme.css` provides the shared page shell, heading, and card.
- `../js/navbar-loader.js` loads the shared site navigation.

## Responsive layout

The board scales to the available width while preserving its square shape. Cell
marks and headings use fluid font sizes, and the card spacing is reduced on
small screens.
