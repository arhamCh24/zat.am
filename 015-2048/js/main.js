// Default: Devanagari numerals.
var useEnglishNumbers = false;

function formatGameNumber(value) {
    var text = String(value);

    return useEnglishNumbers
        ? text
        : text.replace(/[0-9]/g, function (digit) {
            return '०१२३४५६७८९'[Number(digit)];
        });
}

function refreshNumberDisplay() {
    document.querySelectorAll('.tile[data-val]').forEach(function (tile) {
        tile.textContent = formatGameNumber(
            tile.getAttribute('data-val')
        );
    });

    document.querySelector('.score-container .score').textContent =
        formatGameNumber(data.score);

    document.querySelector('.best-container .score').textContent =
        formatGameNumber(data.best);

    document.querySelector('.game-heading h1').textContent =
        formatGameNumber(config.max);

    document.querySelector('.game-heading p').textContent =
        'Slide, merge, and reach the ' +
        formatGameNumber(config.max) + ' tile.';

    document.querySelector('.game-instructions').innerHTML =
        'Use <b>arrow keys</b> or <b>swipe</b>. ' +
        'Merge matching tiles to reach <b>' +
        formatGameNumber(config.max) + '</b>.';

    document.querySelector('.winning-container span').textContent =
        'You reached ' + formatGameNumber(config.max) + '!';

    document.title = formatGameNumber(config.max) + ' - Zat.am';
}

on(window, 'load', function () {
    var view = new View();
    var game = new Game();

    game.init(view);
    event(game);

    var toggle = document.getElementById('englishNumbers');

    toggle.checked = false;

    toggle.addEventListener('change', function () {
        useEnglishNumbers = toggle.checked;
        refreshNumberDisplay();
        game.updateTimer();
    });

    refreshNumberDisplay();
    game.updateTimer();
});