(() => {
  const wheel = document.querySelector('.wheel');
  const spinButton = document.querySelector('.button');
  const token = document.querySelector('#symbol-token');
  const targets = document.querySelector('#targets');
  const status = document.querySelector('#game-status');
  const timeValue = document.querySelector('#time-value');
  const matchedValue = document.querySelector('#matched-value');
  const scoreValue = document.querySelector('#score-value');
  const resultModal = document.querySelector('#result-modal');
  const finalTime = document.querySelector('#final-time');
  const matchPointsValue = document.querySelector('#match-points');
  const timeBonusValue = document.querySelector('#time-bonus');
  const finalScoreValue = document.querySelector('#final-score');
  const scoreSaveStatus = document.querySelector('#score-save-status');
  const newGameButton = document.querySelector('#new-game');

  const signs = [
    { id: 'aries', name: 'Aries', devanagari: 'मेषः', transliteration: 'meShaH', symbol: '♈', wheelIndex: 3 },
    { id: 'taurus', name: 'Taurus', devanagari: 'वृषभः', transliteration: 'vRRiShabhaH', symbol: '♉', wheelIndex: 2 },
    { id: 'gemini', name: 'Gemini', devanagari: 'मिथुनम्', transliteration: 'mithunam', symbol: '♊', wheelIndex: 1 },
    { id: 'cancer', name: 'Cancer', devanagari: 'कर्कटः', transliteration: 'karkaTaH', symbol: '♋', wheelIndex: 12 },
    { id: 'leo', name: 'Leo', devanagari: 'सिंहः', transliteration: 'siMhaH', symbol: '♌', wheelIndex: 11 },
    { id: 'virgo', name: 'Virgo', devanagari: 'कन्या', transliteration: 'kanyaa', symbol: '♍', wheelIndex: 10 },
    { id: 'libra', name: 'Libra', devanagari: 'तुला', transliteration: 'tulaa', symbol: '♎', wheelIndex: 9 },
    { id: 'scorpio', name: 'Scorpio', devanagari: 'वृश्चिकः', transliteration: 'vRRishchikaH', symbol: '♏', wheelIndex: 8 },
    { id: 'sagittarius', name: 'Sagittarius', devanagari: 'धनुः', transliteration: 'dhanuH', symbol: '♐', wheelIndex: 7 },
    { id: 'capricorn', name: 'Capricorn', devanagari: 'मकरः', transliteration: 'makaraH', symbol: '♑', wheelIndex: 6 },
    { id: 'aquarius', name: 'Aquarius', devanagari: 'कुम्भः', transliteration: 'kumbhaH', symbol: '♒', wheelIndex: 5 },
    { id: 'pisces', name: 'Pisces', devanagari: 'मीनः', transliteration: 'miinaH', symbol: '♓', wheelIndex: 4 },
  ];

  let remainingSigns = [];
  let currentSign = null;
  let wheelRotation = 0;
  let startedAt = null;
  let timerInterval = null;
  let spinning = false;
  let selected = false;
  let matchPoints = 0;

  function setStatus(message) {
    status.textContent = message;
  }

  function renderTargets(targetOrder) {
    targets.innerHTML = targetOrder.map(sign => `
      <button class="target zatam-game-card" type="button" data-sign="${sign.id}">
        <span class="target-devanagari" lang="sa">${sign.devanagari}</span>
        <span class="target-transliteration">${sign.transliteration}</span>
        <span class="target-match" aria-hidden="true"></span>
      </button>
    `).join('');

    targets.querySelectorAll('.target').forEach(target => {
      target.addEventListener('click', () => tryMatch(target));
      target.addEventListener('dragover', event => event.preventDefault());
      target.addEventListener('drop', event => {
        event.preventDefault();
        tryMatch(target, true);
      });
    });
  }

  function updateStats() {
    const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    timeValue.textContent = `${minutes}:${seconds}`;
    return elapsed;
  }

  function startTimer() {
    if (startedAt !== null) return;
    startedAt = Date.now();
    timerInterval = window.setInterval(updateStats, 1000);
    updateStats();
  }

  function setTokenState(sign) {
    currentSign = sign;
    selected = false;
    token.classList.remove('is-selected');
    token.disabled = !sign;
    token.draggable = Boolean(sign);
    token.textContent = sign ? sign.symbol : '';
    token.setAttribute('aria-label', sign ? `Symbol ${sign.name}; drag it to its matching name, or select it` : 'No symbol drawn yet');
  }

  function spin() {
    if (spinning || currentSign || remainingSigns.length === 0) return;
    startTimer();
    const signIndex = Math.floor(Math.random() * remainingSigns.length);
    const [sign] = remainingSigns.splice(signIndex, 1);
    // wheelIndex increases counter-clockwise from Gemini at 11 o'clock.
    // The matching artwork is clockwise around the wheel, so rotate the
    // selected pictogram by its index angle to bring it under the top pointer.
    const targetAngle = (sign.wheelIndex % 12) * 30;
    const currentAngle = wheelRotation % 360;
    const alignment = (targetAngle - currentAngle + 360) % 360;
    wheelRotation += 5 * 360 + alignment;
    spinning = true;
    spinButton.disabled = true;
    token.disabled = true;
    setStatus('The wheel is spinning…');
    wheel.style.transition = 'transform 1.5s cubic-bezier(0.12, 0.72, 0.16, 1)';
    wheel.classList.add('blur');
    wheel.style.transform = `rotate(${wheelRotation}deg)`;

    wheel.addEventListener('transitionend', function onSpinEnd(event) {
      if (event.propertyName !== 'transform') return;
      wheel.removeEventListener('transitionend', onSpinEnd);
      wheel.style.transition = 'none';
      wheel.style.transform = `rotate(${wheelRotation}deg)`;
      wheel.classList.remove('blur');
      spinning = false;
      setTokenState(sign);
      setStatus(`The wheel landed on ${sign.name} (${sign.symbol}). Match it to its Sanskrit name.`);
      updateStats();
    });
  }

  function tryMatch(target, isDrop = false) {
    if (!currentSign || spinning || target.classList.contains('is-matched')) return;
    if (!isDrop && !selected) {
      setStatus('Tap the symbol first, then tap its matching name.');
      return;
    }
    if (target.dataset.sign !== currentSign.id) {
      setStatus('That is not the match. Try another name.');
      target.classList.add('is-wrong', 'zatam-game-status-error');
      window.setTimeout(() => target.classList.remove('is-wrong', 'zatam-game-status-error'), 450);
      return;
    }

    target.classList.add('is-matched');
    target.querySelector('.target-match').textContent = currentSign.symbol;
    matchPoints += 5;
    scoreValue.textContent = String(matchPoints);
    matchedValue.textContent = `${12 - remainingSigns.length} / 12`;
    setStatus(`${currentSign.name} matched! Spin for the next symbol.`);
    setTokenState(null);

    if (remainingSigns.length === 0) finishGame();
    else spinButton.disabled = false;
  }

  function finishGame() {
    window.clearInterval(timerInterval);
    const elapsed = updateStats();
    const timeBonus = elapsed < 50 ? 40 : elapsed < 75 ? 30 : elapsed < 90 ? 20 : elapsed < 120 ? 10 : 0;
    const finalScore = matchPoints + timeBonus;
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    finalTime.textContent = `Completed in ${minutes}:${String(seconds).padStart(2, '0')}`;
    matchPointsValue.textContent = `+${matchPoints}`;
    timeBonusValue.textContent = `+${timeBonus}`;
    finalScoreValue.textContent = String(finalScore);
    scoreValue.textContent = String(finalScore);
    setStatus('All twelve zodiac signs matched.');
    spinButton.disabled = true;
    resultModal.classList.remove('zatam-hidden');
    newGameButton.focus();
    submitLeaderboardScore(finalScore, elapsed, matchPoints, timeBonus);
  }

  async function submitLeaderboardScore(score, elapsedSeconds, points, bonus) {
    scoreSaveStatus.className = 'zatam-game-status zatam-game-status-info';
    scoreSaveStatus.textContent = 'Saving your score...';

    if (!window.zatamScore || typeof window.zatamScore.submit !== 'function') {
      scoreSaveStatus.className = 'zatam-game-status zatam-game-status-error';
      scoreSaveStatus.textContent = 'The leaderboard is not available right now.';
      return;
    }

    try {
      const result = await window.zatamScore.submit(score, {
        metrics: {
          matches: 12,
          matchPoints: points,
          timeBonus: bonus,
          gameTimerSeconds: elapsedSeconds,
        },
      });

      if (result && result.ok) {
        scoreSaveStatus.className = 'zatam-game-status zatam-game-status-success';
        scoreSaveStatus.textContent = 'Score saved to the leaderboard ✓';
      } else if (result && result.reason === 'not-signed-in') {
        scoreSaveStatus.className = 'zatam-game-status zatam-game-status-info';
        scoreSaveStatus.textContent = 'Sign in to save your score to the leaderboard.';
      } else if (result && result.reason === 'already-submitted') {
        scoreSaveStatus.className = 'zatam-game-status zatam-game-status-success';
        scoreSaveStatus.textContent = 'Score already saved ✓';
      } else {
        scoreSaveStatus.className = 'zatam-game-status zatam-game-status-error';
        scoreSaveStatus.textContent = 'Your score could not be saved.';
      }
    } catch (error) {
      console.error('[010-sw] Score submission failed:', error);
      scoreSaveStatus.className = 'zatam-game-status zatam-game-status-error';
      scoreSaveStatus.textContent = 'The leaderboard score could not be saved.';
    }
  }

  function newGame() {
    if (window.zatamScore && typeof window.zatamScore.reset === 'function') {
      window.zatamScore.reset();
    }
    window.clearInterval(timerInterval);
    remainingSigns = [...signs];
    startedAt = null;
    timerInterval = null;
    spinning = false;
    matchPoints = 0;
    wheelRotation = 0;
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    wheel.classList.remove('blur');
    setTokenState(null);
    const targetOrder = [...signs];
    for (let index = targetOrder.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [targetOrder[index], targetOrder[swapIndex]] = [targetOrder[swapIndex], targetOrder[index]];
    }
    renderTargets(targetOrder);
    timeValue.textContent = '00:00';
    matchedValue.textContent = '0 / 12';
    scoreValue.textContent = '0';
    setStatus('Spin the wheel to draw your first symbol.');
    scoreSaveStatus.className = 'zatam-game-status zatam-game-status-info';
    scoreSaveStatus.textContent = 'Checking leaderboard...';
    spinButton.disabled = false;
    resultModal.classList.add('zatam-hidden');
  }

  spinButton.addEventListener('click', spin);
  token.addEventListener('click', () => {
    if (!currentSign || spinning) return;
    selected = !selected;
    token.classList.toggle('is-selected', selected);
    setStatus(selected
      ? 'Symbol selected. Tap its matching zodiac name.'
      : `Match ${currentSign.symbol} to the correct zodiac name.`);
  });
  token.addEventListener('dragstart', event => {
    if (!currentSign || spinning) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('text/plain', currentSign.id);
    event.dataTransfer.effectAllowed = 'move';
  });
  newGameButton.addEventListener('click', newGame);

  newGame();
})();
