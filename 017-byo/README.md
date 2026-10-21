# Build Your Own Portrait

`017-byo` is a portrait creator rather than a conventional game. It combines
the top, middle, and bottom sections of twelve portraits so you can make a
mixed portrait. Use the arrows beside each section to change it independently
or use the wheel for a random combination. Use the **Show choices** button to
reveal the numbered portrait choices; selecting a number matches all three
sections. The dropdown selects which portrait data set to use.

When all three portrait sections match, the page shows the corresponding
Sanskrit label and its transliteration.

## Files

- `index.html` contains the page structure and portrait sections.
- `ExquisiteCorpse.js` handles portrait selection, animation, and labels.
- `style.css` contains the page layout and responsive styles.
- `../cmpk-jul.json` provides the portrait image URLs and Sanskrit labels.
- `img/` contains the wheel and navigation arrow images.
- `../shared/game-theme.css` provides the shared page shell and heading.
- `../js/navbar-loader.js` loads the shared site navigation.

## Responsive layout

On wide screens, the portrait and controls sit side by side. On narrow screens,
the portrait scales to the available width and the six section controls stay
beside it. At medium widths, the random control, result label, choice toggle,
and set selector share one row; at small widths, they wrap into two rows above
the portrait choices.
