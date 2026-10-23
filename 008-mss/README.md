# 008-mss — संस्कृतम् Minesweeper

A scoreable Minesweeper game that uses Sanskrit numerals for the mine clues.

## Project review

- **Type:** Game
- **Source:** Available and editable in this folder
- **README:** Available
- **Theme:** Uses `/shared/game-theme.css` with board-specific styles in `styles.css`
- **Scoring:** Uses the shared `/js/game-score.js` system

## How to play

1. Reveal squares until every safe square is open.
2. Use right-click, the `M` key, or Mark mode to mark suspected mines.
3. A mine ends the run. Clearing all safe squares wins the game.

The first square revealed is always safe. Boards are available in three sizes:

- **लघु:** 5 × 5
- **सरलम्:** 7 × 7
- **कठिनम्:** 10 × 10

## Scoring

Scores are integers from **0 to 100**, with a higher score representing a faster completed game.

- A winning game starts at **100**.
- The 5 × 5 board keeps 100 points for the first 30 seconds, then loses 1 point for every additional 2 full seconds.
- The 7 × 7 board keeps 100 points for the first 60 seconds, then loses 1 point for every additional 3 full seconds.
- The 10 × 10 board keeps 100 points for the first 150 seconds, then loses 1 point for every additional 6 full seconds.
- A loss does not submit a leaderboard score.
- A score is submitted only once, when a player clears every safe square.

The shared score system records the selected board size, mine count, safe-square total, and completion time. Players must be signed in for the completed score to appear on the Zat.am leaderboard.

## Local development

From the repository root:

```powershell
npm run dev
```

Open `/008-mss/` in the local site.

## Credits

The original game was based on the [Minesweeper JavaScript tutorial by 101 Computing](https://www.101computing.net/minesweeper-in-javascript/), then adapted for Zat.am.
