(() => {
  const wheel = document.querySelector('.wheel');
  const spinButton = document.querySelector('#spin-button');
  const drawnSign = document.querySelector('#drawn-sign');

  const signs = [
    { devanagari: 'मेषः', transliteration: 'meShaH', wheelIndex: 3 },
    { devanagari: 'वृषभः', transliteration: 'vRRiShabhaH', wheelIndex: 2 },
    { devanagari: 'मिथुनम्', transliteration: 'mithunam', wheelIndex: 1 },
    { devanagari: 'कर्कटः', transliteration: 'karkaTaH', wheelIndex: 12 },
    { devanagari: 'सिंहः', transliteration: 'siMhaH', wheelIndex: 11 },
    { devanagari: 'कन्या', transliteration: 'kanyaa', wheelIndex: 10 },
    { devanagari: 'तुला', transliteration: 'tulaa', wheelIndex: 9 },
    { devanagari: 'वृश्चिकः', transliteration: 'vRRishchikaH', wheelIndex: 8 },
    { devanagari: 'धनुः', transliteration: 'dhanuH', wheelIndex: 7 },
    { devanagari: 'मकरः', transliteration: 'makaraH', wheelIndex: 6 },
    { devanagari: 'कुम्भः', transliteration: 'kumbhaH', wheelIndex: 5 },
    { devanagari: 'मीनः', transliteration: 'miinaH', wheelIndex: 4 },
  ];

  let wheelRotation = 0;
  let spinning = false;

  function spin() {
    if (spinning) return;

    const sign = signs[Math.floor(Math.random() * signs.length)];
    const targetAngle = (sign.wheelIndex % 12) * 30;
    const currentAngle = wheelRotation % 360;
    const alignment = (targetAngle - currentAngle + 360) % 360;
    wheelRotation += 5 * 360 + alignment;
    spinning = true;
    spinButton.disabled = true;
    drawnSign.textContent = '';
    wheel.style.transition = 'transform 1.5s cubic-bezier(0.12, 0.72, 0.16, 1)';
    wheel.classList.add('blur');
    wheel.style.transform = `rotate(${wheelRotation}deg)`;

    wheel.addEventListener('transitionend', function onSpinEnd(event) {
      if (event.propertyName !== 'transform') return;
      wheel.removeEventListener('transitionend', onSpinEnd);
      wheel.style.transition = 'none';
      wheel.style.transform = `rotate(${wheelRotation}deg)`;
      wheel.classList.remove('blur');
      drawnSign.textContent = `${sign.devanagari} - ${sign.transliteration}`;
      spinning = false;
      spinButton.disabled = false;
    });
  }

  spinButton.addEventListener('click', spin);
})();
