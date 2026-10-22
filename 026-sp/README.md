# 026-sp — स्वराः Paint

Paint over a randomly selected Sanskrit vowel without moving the centre
of the brush outside its shape. Based on Christian Heilmann's
[Letterpaint](https://github.com/codepo8/letterpaint).

## Run

Serve the full Zat.am repository using its development server and open
`/026-sp/`. The page uses `../shared/game-theme.css` and the existing
`../js/navbar-loader.js`.

## Controls

- Start: paint the displayed vowel with a mouse, finger, or pen.
- Release between separate strokes.
- Try again: clear and repeat the same vowel after an error.
- Next letter / New letter: choose a random vowel, as in the original.
- Sound on/off: toggle feedback sounds.

The vowels remain `अ आ इ ई उ ऊ ऋ ॠ ए ऐ ओ औ`. Completion is checked on
release when at least 98% of the letter is within one brush-width
of actual painted letter pixels. This accepts a full trace with narrow
red edges without accepting large untraced sections. Only painted pixels
inside the original letter seed this tolerance check. At least 60% of the
letter must also be actually painted, preventing small patches from winning.
The brush centre is checked along the entire stroke.

## Fixes

- Canvas coordinates account for its position, CSS scaling, and scrolling.
- Pointer events support mouse, touch and pen with capture and cancellation.
- Strokes cannot continue after an error, completion, or outside release.
- A stable bitmap preserves the current trace when the page resizes.
- Shared theme classes style the title, cards, buttons and instructions.
- Local CSS is scoped to the game and does not style the shared navbar.
- Removed obsolete Application Cache calls and accidental global variables.

## Assets and scoring

Keep the existing `win.ogg`, cover image and other original assets.
The original repository references `error.ogg` but does not contain it.
This version uses a short synthesized error tone when browser audio is
available; blocked or unavailable audio does not prevent play.

This update does not add timer, points, levels, or leaderboard submission.
It preserves the original open-ended tracing activity. Any later scoring
must use the shared scoring module and a defined completion rule.

## Verification

Test mouse/touch/pen tracing, outside strokes, retry, completion, random
next letter, sound toggling, scrolling and mobile resizing. Automated
canvas tests use mocked DOM events; browser and device testing is also
needed for real font rendering, touch capture and audio playback.
