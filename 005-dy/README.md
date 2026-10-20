# द्वन्द्वयुद्धम् (Dvandvayuddham)

`005-dy` is a two-player tic-tac-toe game. Enter a name for each player, then
take turns placing `x` and `☺` on the 3×3 board. The game highlights the winning
player's marks when they complete a row, column, or diagonal.

## Files

- `index.html` contains the page, name-entry dialog, and game board.
- `ttt.js` contains the board state and win detection.
- `ttti.js` handles player names, turn changes, and board interaction.
- `ttt.css` contains the board, dialog, and responsive styles.
- `../shared/game-theme.css` provides the shared page shell, typography,
  buttons, cards, and dialog styles.
- `../js/navbar-loader.js` loads the shared site navigation.

## Responsive layout

The board remains square and scales down to fit the available screen width.
Cell marks scale with the viewport, while the turn heading and grid lines are
reduced on small screens. The name dialog uses the shared responsive modal and
can scroll on short screens.
