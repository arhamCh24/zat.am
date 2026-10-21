import {
  CHAPTER_VERSE_COUNTS,
  normalizePuzzleParams,
  toDevanagariNumber,
  verseOffset,
} from "./game/config.js";
import {
  previewWordSearchScore,
  wordSearchScoreOptions,
} from "./game/scoring.js";
import { GameTimer } from "./timer.js";

const MARKER_CLASS_COUNT = 7;
const SHARED_SCORE_MODULE_URL = "../../js/game-score.js";
const SCORE_INITIALIZATION_TIMEOUT_MS = 2500;
const DIRECTIONS = Object.freeze([
  Object.freeze({ row: 0, column: 1 }),
  Object.freeze({ row: 1, column: 0 }),
  Object.freeze({ row: 1, column: 1 }),
]);

const INDEPENDENT_VOWELS = new Set([
  "अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ॠ", "ए", "ऐ", "ओ", "औ",
]);
const VOWEL_SIGNS = new Set([
  "ा", "ि", "ी", "ु", "ू", "ृ", "ॄ", "े", "ै", "ो", "ौ",
]);
const CONSONANTS = new Set([
  "क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण",
  "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "स", "श",
  "ष", "ह", "क्ष", "ज्ञ",
]);
const HALANT = "्";
const ANUSVARA = "ं";
const VISARGA = "ः";

function cellId(row, column) {
  return `tblCell_${row}_${column}`;
}

function cellKey(row, column) {
  return `${row},${column}`;
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function splitAksharas(word) {
  const aksharas = [];
  let current = "";

  for (const character of String(word)) {
    if (INDEPENDENT_VOWELS.has(character)) {
      if (current) {
        aksharas.push(current);
      }
      current = character;
      continue;
    }

    if (VOWEL_SIGNS.has(character) || character === HALANT) {
      current += character;
      continue;
    }

    if (character === ANUSVARA || character === VISARGA) {
      current += character;
      if (current) {
        aksharas.push(current);
      }
      current = "";
      continue;
    }

    if (CONSONANTS.has(character)) {
      if (current && !current.endsWith(HALANT)) {
        aksharas.push(current);
        current = "";
      }
      current += character;
      continue;
    }

    if (current) {
      aksharas.push(current);
      current = "";
    }
    aksharas.push(character);
  }

  if (current) {
    aksharas.push(current);
  }

  return aksharas;
}

function randomAkshara() {
  const vowels = [...INDEPENDENT_VOWELS];
  const consonants = [...CONSONANTS];
  const useSingleCharacter = Math.random() < 0.5;

  if (useSingleCharacter) {
    const alphabet = [...vowels, ...consonants];
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  const first = consonants[Math.floor(Math.random() * consonants.length)];
  const second = consonants[Math.floor(Math.random() * consonants.length)];
  const vowelSign = [...VOWEL_SIGNS][Math.floor(Math.random() * VOWEL_SIGNS.size)];
  const ending = Math.random() < 0.2 ? VISARGA : "";

  return `${first}${HALANT}${second}${vowelSign}${ending}`;
}

function getWords(verseText, gridSize) {
  const seen = new Set();
  const words = [];

  for (const rawWord of String(verseText).trim().split(/\s+/)) {
    const word = rawWord.trim();
    const length = splitAksharas(word).length;

    if (!word || seen.has(word) || length < 2 || length > gridSize) {
      continue;
    }

    seen.add(word);
    words.push({ word, aksharas: splitAksharas(word) });
  }

  return words;
}

function getTransliteration(value, targetScheme, sanscript) {
  if (!sanscript || typeof sanscript.t !== "function") {
    return "";
  }

  try {
    return sanscript.t(String(value), "devanagari", targetScheme);
  } catch {
    return "";
  }
}

function convertIastToDevanagari(value, sanscript) {
  if (!sanscript || typeof sanscript.t !== "function") {
    return String(value);
  }

  try {
    return sanscript.t(String(value), "iast", "devanagari");
  } catch {
    return String(value);
  }
}

function makeEmptyBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function canPlaceWord(board, aksharas, row, column, direction) {
  const size = board.length;
  const endRow = row + direction.row * (aksharas.length - 1);
  const endColumn = column + direction.column * (aksharas.length - 1);

  if (endRow >= size || endColumn >= size) {
    return false;
  }

  return aksharas.every((akshara, index) => {
    const currentRow = row + direction.row * index;
    const currentColumn = column + direction.column * index;
    const current = board[currentRow][currentColumn];

    return current === null || current === akshara;
  });
}

function placeWord(board, word, row, column, direction) {
  const cells = [];

  word.aksharas.forEach((akshara, index) => {
    const currentRow = row + direction.row * index;
    const currentColumn = column + direction.column * index;

    board[currentRow][currentColumn] = akshara;
    cells.push({ row: currentRow, column: currentColumn });
  });

  return {
    ...word,
    cells,
    start: cellKey(row, column),
  };
}

function findPlacement(board, word) {
  const placements = [];

  for (let row = 0; row < board.length; row += 1) {
    for (let column = 0; column < board.length; column += 1) {
      for (const direction of DIRECTIONS) {
        if (canPlaceWord(board, word.aksharas, row, column, direction)) {
          placements.push({ row, column, direction });
        }
      }
    }
  }

  if (!placements.length) {
    return null;
  }

  return placements[Math.floor(Math.random() * placements.length)];
}

function buildPuzzle(words, size, targetWordCount) {
  const requestedWordCount = Math.min(targetWordCount, words.length);
  let bestPuzzle = { board: makeEmptyBoard(size), placedWords: [] };

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const board = makeEmptyBoard(size);
    const placedWords = [];

    for (const word of shuffle(words)) {
      if (placedWords.length === requestedWordCount) {
        break;
      }

      const placement = findPlacement(board, word);
      if (!placement) {
        continue;
      }

      placedWords.push(placeWord(
        board,
        word,
        placement.row,
        placement.column,
        placement.direction,
      ));
    }

    if (placedWords.length > bestPuzzle.placedWords.length) {
      bestPuzzle = { board, placedWords };
    }

    if (placedWords.length === requestedWordCount) {
      break;
    }
  }

  bestPuzzle.board.forEach((row) => {
    row.forEach((akshara, column) => {
      if (akshara === null) {
        row[column] = randomAkshara();
      }
    });
  });

  return bestPuzzle;
}

export class WordSearchGame {
  constructor(documentRef = document) {
    this.document = documentRef;
    this.window = documentRef.defaultView ?? globalThis;
    this.elements = {
      grid: documentRef.getElementById("grid"),
      gridParent: documentRef.getElementById("gridParent"),
      puzzleSettings: documentRef.getElementById("puzzle-settings"),
      puzzleSummary: documentRef.getElementById("puzzle-summary"),
      timer: documentRef.getElementById("timer"),
      lead2: documentRef.getElementById("lead2"),
      presentCount: documentRef.getElementById("nPresent"),
      foundCount: documentRef.getElementById("nFound"),
      statusMessage: documentRef.getElementById("statusMessage"),
      scoreValue: documentRef.getElementById("scoreValue"),
      hintsValue: documentRef.getElementById("hintsValue"),
      resultPanel: documentRef.getElementById("resultPanel"),
      resultTitle: documentRef.getElementById("resultTitle"),
      resultScore: documentRef.getElementById("resultScore"),
      resultDetails: documentRef.getElementById("resultDetails"),
      scoreSaveStatus: documentRef.getElementById("scoreSaveStatus"),
      playAgainButton: documentRef.getElementById("play-again"),
      hintButton: documentRef.getElementById("hint-button"),
      chapterSelect: documentRef.getElementById("chapter-select"),
      verseSelect: documentRef.getElementById("verse-select"),
      loadVerse: documentRef.getElementById("load-verse"),
      refreshButton: documentRef.getElementById("refresh-button"),
    };
    this.params = null;
    this.verseWords = [];
    this.placedWords = [];
    this.cellElements = [];
    this.foundWords = new Set();
    this.markerClasses = new Map();
    this.isActive = false;
    this.timer = null;
    this.mistakes = 0;
    this.hints = 0;
    this.hintUsed = false;
    this.finalScore = null;
    this.scoreSubmissionStarted = false;
    this.scoreApi = null;
    this.scoreApiReady = null;
    this.runStartedAt = null;
  }

  init() {
    if (!this.elements.grid) {
      return;
    }

    this.bindRestartEvent();
    this.runStartedAt = Date.now();
    void this.initializeScoring();
    this.params = normalizePuzzleParams(new URLSearchParams(this.window.location.search));
    const verse = this.getSelectedVerse();

    if (!verse) {
      this.showSetupError("श्लोकः न प्राप्तः।");
      return;
    }

    const verseText = convertIastToDevanagari(verse.t, this.window.Sanscript);
    this.verseWords = verseText.trim().split(/\s+/).filter(Boolean);
    const availableWords = getWords(verseText, this.params.size);

    if (!availableWords.length) {
      this.showSetupError("अन्वेषणाय पदानि न प्राप्तानि।");
      return;
    }

    this.populateChapterOptions();
    this.populateVerseOptions(this.params.chapter, this.params.verse);
    this.bindEvents();
    this.setupResponsiveControls();
    this.createPuzzle(availableWords);
    this.renderScore();
    this.hideResult();
    this.startTimer();
  }

  getSelectedVerse() {
    const index = verseOffset(this.params.chapter, this.params.verse);
    const data = this.window.data;

    if (!Array.isArray(data) || index === null) {
      return null;
    }

    return data[index] && typeof data[index].t === "string" ? data[index] : null;
  }

  bindEvents() {
    this.elements.grid.addEventListener("click", (event) => this.handleGridClick(event));
    this.elements.grid.addEventListener("selectstart", (event) => event.preventDefault());

    this.elements.chapterSelect?.addEventListener("change", () => {
      this.populateVerseOptions(Number(this.elements.chapterSelect.value), 1);
    });

    this.elements.loadVerse?.addEventListener("click", (event) => {
      event.preventDefault();
      this.loadSelectedVerse();
    });

    this.elements.hintButton?.addEventListener("click", (event) => {
      event.preventDefault();
      this.showHint();
    });

    this.elements.refreshButton?.addEventListener("click", (event) => {
      event.preventDefault();
      this.restartGame();
    });

    this.document.querySelectorAll(".difficulty-button[data-size]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        this.loadPuzzle({ size: button.dataset.size });
      });
    });
  }

  setupResponsiveControls() {
    const compactLayout = this.window.matchMedia?.("(max-width: 64rem)");
    if (compactLayout && this.elements.puzzleSettings) {
      const updateSettings = () => {
        this.elements.puzzleSettings.open = !compactLayout.matches;
      };
      updateSettings();
      compactLayout.addEventListener("change", updateSettings);
    }

    const { chapter, verse, size } = this.params;
    if (this.elements.puzzleSummary) {
      this.elements.puzzleSummary.textContent = `${toDevanagariNumber(chapter)}.${toDevanagariNumber(verse)} · ${size} × ${size}`;
    }
    this.document.querySelectorAll(".difficulty-button[data-size]").forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.size) === size));
    });
  }

  populateChapterOptions() {
    const select = this.elements.chapterSelect;
    if (!select) {
      return;
    }

    select.replaceChildren();

    CHAPTER_VERSE_COUNTS.forEach((_, index) => {
      const chapter = index + 1;
      const option = this.document.createElement("option");
      option.value = String(chapter);
      option.textContent = toDevanagariNumber(chapter);
      option.selected = chapter === this.params.chapter;
      select.append(option);
    });
  }

  populateVerseOptions(chapter, selectedVerse) {
    const select = this.elements.verseSelect;
    if (!select || !Number.isInteger(chapter) || !CHAPTER_VERSE_COUNTS[chapter - 1]) {
      return;
    }

    select.replaceChildren();
    select.disabled = false;
    if (this.elements.loadVerse) {
      this.elements.loadVerse.disabled = false;
    }

    for (let verse = 1; verse <= CHAPTER_VERSE_COUNTS[chapter - 1]; verse += 1) {
      const option = this.document.createElement("option");
      option.value = String(verse);
      option.textContent = toDevanagariNumber(verse);
      option.selected = verse === selectedVerse;
      select.append(option);
    }
  }

  loadSelectedVerse() {
    this.loadPuzzle({
      ch: this.elements.chapterSelect?.value,
      v: this.elements.verseSelect?.value,
    });
  }

  loadPuzzle(overrides = {}) {
    const next = normalizePuzzleParams({
      ch: overrides.ch ?? this.params.chapter,
      v: overrides.v ?? this.params.verse,
      size: overrides.size ?? this.params.size,
    });
    const nextQuery = new URLSearchParams({
      size: String(next.size),
      ch: String(next.chapter),
      v: String(next.verse),
    });

    this.resetSharedScore();

    // Assigning only search also works when the game is opened via file://.
    this.window.location.search = nextQuery.toString();
  }

  restartGame() {
    this.resetSharedScore();
    this.window.location.reload();
  }

  bindRestartEvent() {
    this.elements.playAgainButton?.addEventListener("click", (event) => {
      event.preventDefault();
      this.restartGame();
    });
  }

  initializeScoring() {
    if (this.scoreApiReady) {
      return this.scoreApiReady;
    }

    // Loading the shared scorer dynamically keeps the word-search playable
    // if Firebase or its CDN is temporarily unavailable.
    this.scoreApiReady = import(/* @vite-ignore */ SHARED_SCORE_MODULE_URL)
      .then((scoreApi) => {
        scoreApi.initGameScore({
          gameId: "001-sbg",
          gameName: "अन्वेषणम्",
          startedAt: this.runStartedAt,
        });
        this.scoreApi = scoreApi;
        return scoreApi;
      })
      .catch((error) => {
        console.warn("[001-sbg] Shared leaderboard is unavailable:", error);
        return null;
      });

    return this.scoreApiReady;
  }

  resetSharedScore() {
    this.scoreApi?.resetGameScore();
  }

  waitForScoreApi() {
    return new Promise((resolve) => {
      let settled = false;
      let timeoutId = null;

      const finish = (scoreApi) => {
        if (settled) {
          return;
        }

        settled = true;
        if (timeoutId !== null) {
          this.window.clearTimeout?.(timeoutId);
        }
        resolve(scoreApi);
      };

      timeoutId = this.window.setTimeout(
        () => finish(null),
        SCORE_INITIALIZATION_TIMEOUT_MS,
      );

      this.initializeScoring().then((scoreApi) => {
        finish(scoreApi);
      });
    });
  }

  renderVerse(emphasizeAnswerWords) {
    const container = this.elements.lead2;
    if (!container) {
      return;
    }

    const answerWords = new Set(this.placedWords.map(({ word }) => word));
    const fragment = this.document.createDocumentFragment();

    this.verseWords.forEach((word) => {
      const isAnswerWord = emphasizeAnswerWords && answerWords.has(word);
      const content = this.document.createElement("span");
      content.classList.add("nob");
      if (isAnswerWord) {
        content.classList.add("is-hint");
      }
      content.title = getTransliteration(word, "iast", this.window.Sanscript);
      content.textContent = word;
      fragment.append(content, " ");
    });

    fragment.append(`। ${toDevanagariNumber(this.params.chapter)}.${toDevanagariNumber(this.params.verse)}`);
    container.replaceChildren(fragment);
  }

  createPuzzle(words) {
    const puzzle = buildPuzzle(words, this.params.size, this.params.wordsToFind);

    this.placedWords = puzzle.placedWords;
    this.foundWords.clear();
    this.markerClasses.clear();
    this.mistakes = 0;
    this.hints = 0;
    this.hintUsed = false;
    this.finalScore = null;
    this.scoreSubmissionStarted = false;
    this.isActive = this.placedWords.length > 0;
    this.renderGrid(puzzle.board);
    this.renderVerse(false);
  }

  renderGrid(board) {
    const table = this.document.createElement("table");
    const body = this.document.createElement("tbody");
    this.elements.gridParent.style.setProperty("--grid-size", String(board.length));

    this.cellElements = board.map((row, rowIndex) => {
      const tableRow = this.document.createElement("tr");
      const cells = row.map((akshara, columnIndex) => {
        const cell = this.document.createElement("td");
        const character = this.document.createElement("span");

        cell.id = cellId(rowIndex, columnIndex);
        cell.dataset.row = String(rowIndex);
        cell.dataset.column = String(columnIndex);
        character.title = getTransliteration(akshara, "itrans", this.window.Sanscript);
        character.textContent = akshara;
        cell.append(character);
        tableRow.append(cell);

        return cell;
      });

      body.append(tableRow);
      return cells;
    });

    table.append(body);
    this.elements.grid.replaceChildren(table);
    this.elements.grid.classList.remove("is-locked", "is-complete");
    this.elements.grid.removeAttribute("aria-disabled");
  }

  renderScore() {
    if (this.elements.presentCount) {
      this.elements.presentCount.textContent = toDevanagariNumber(this.placedWords.length);
    }
    if (this.elements.foundCount) {
      this.elements.foundCount.textContent = toDevanagariNumber(this.foundWords.size);
    }
    if (this.elements.scoreValue) {
      this.elements.scoreValue.textContent = String(this.getCurrentScore());
    }
    if (this.elements.hintsValue) {
      this.elements.hintsValue.textContent = String(this.hints);
    }
  }

  getScoreOptions() {
    return wordSearchScoreOptions({
      mistakes: this.mistakes,
      hints: this.hints,
    });
  }

  getCurrentScore() {
    return previewWordSearchScore({
      mistakes: this.mistakes,
      hints: this.hints,
    });
  }

  getElapsedSeconds() {
    return this.timer?.elapsed ?? 0;
  }

  setGameStatus(message, tone = "info") {
    const status = this.elements.statusMessage;

    if (!status) {
      return;
    }

    if (!message) {
      status.hidden = true;
      status.textContent = "";
      return;
    }

    status.hidden = false;
    status.className = `zatam-game-status zatam-game-status-${tone}`;
    status.textContent = message;
  }

  setScoreSaveStatus(message, tone = "info") {
    const status = this.elements.scoreSaveStatus;

    if (!status) {
      return;
    }

    status.hidden = !message;
    status.className = `zatam-game-status zatam-game-status-${tone}`;
    status.textContent = message ?? "";
  }

  hideResult() {
    this.elements.resultPanel?.setAttribute("hidden", "");
    this.setScoreSaveStatus("");
  }

  showResult({ title, score, details }) {
    if (this.elements.resultTitle) {
      this.elements.resultTitle.textContent = title;
    }
    if (this.elements.resultScore) {
      this.elements.resultScore.textContent = String(score);
    }
    if (this.elements.resultDetails) {
      this.elements.resultDetails.textContent = details;
    }

    this.elements.resultPanel?.removeAttribute("hidden");
  }

  resultDetails() {
    return [
      `Words found: ${this.foundWords.size}/${this.placedWords.length}`,
      `Mistakes: ${this.mistakes}`,
      `Hints: ${this.hints}`,
      `Time: ${this.getElapsedSeconds()}s`,
    ].join(" · ");
  }

  handleGridClick(event) {
    if (!this.isActive) {
      return;
    }

    const cell = event.target.closest("td[data-row][data-column]");
    if (!cell || !this.elements.grid.contains(cell)) {
      return;
    }

    const matchingWords = this.placedWords.filter((word) => (
      word.start === cellKey(Number(cell.dataset.row), Number(cell.dataset.column))
      && !this.foundWords.has(word.word)
    ));

    if (!matchingWords.length) {
      const clickedKey = cellKey(Number(cell.dataset.row), Number(cell.dataset.column));
      const isFoundWordStart = this.placedWords.some((word) => (
        word.start === clickedKey && this.foundWords.has(word.word)
      ));

      if (!isFoundWordStart) {
        this.recordMistake(cell);
      }

      return;
    }

    matchingWords.forEach((word) => this.markWordFound(word));

    this.renderScore();

    if (this.foundWords.size === this.placedWords.length) {
      this.finishGame();
      return;
    }

    this.setGameStatus("Word found. Keep going!", "success");
  }

  recordMistake(cell) {
    this.mistakes += 1;
    this.renderScore();
    this.setGameStatus("That is not the first cell of a remaining word. 5 points deducted.", "error");

    cell.classList.add("is-mistake");
    this.window.setTimeout?.(() => cell.classList.remove("is-mistake"), 500);
  }

  markWordFound(word) {
    this.foundWords.add(word.word);
    const markerClass = this.getMarkerClass(word.word);

    word.cells.forEach(({ row, column }) => {
      const cell = this.cellElements[row][column];
      const markers = this.document.createElement("div");
      const marker = this.document.createElement("div");

      cell.classList.add("found");
      markers.className = "markers";
      marker.className = `marker ${markerClass}`;
      markers.append(marker);
      cell.append(markers);
    });
  }

  getMarkerClass(word) {
    if (!this.markerClasses.has(word)) {
      const markerIndex = this.markerClasses.size;
      this.markerClasses.set(word, markerIndex < MARKER_CLASS_COUNT ? `marker${markerIndex}` : "markerX");
    }

    return this.markerClasses.get(word);
  }

  startTimer() {
    this.timer = new GameTimer({
      direction: "up",
      onTick: (elapsed) => {
        if (this.elements.timer) {
          this.elements.timer.textContent = toDevanagariNumber(elapsed);
        }
      },
    });
    this.timer.start();
  }

  finishGame() {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.timer?.stop();
    this.elements.grid.classList.add("is-complete");
    this.finalScore = this.getCurrentScore();
    this.renderScore();
    this.setGameStatus("");
    this.showResult({
      title: "॥ शुभमस्तु ॥",
      score: this.finalScore,
      details: this.resultDetails(),
    });
    this.setScoreSaveStatus("Saving your score...", "info");
    void this.submitCompletedScore();
  }

  async submitCompletedScore() {
    if (this.scoreSubmissionStarted || this.finalScore === null) {
      return;
    }

    this.scoreSubmissionStarted = true;

    try {
      const scoreApi = await this.waitForScoreApi();

      if (!scoreApi) {
        this.setScoreSaveStatus("The leaderboard is not available right now.", "error");
        return;
      }

      this.finalScore = scoreApi.scoreFromPenalties(this.getScoreOptions());
      this.renderScore();
      if (this.elements.resultScore) {
        this.elements.resultScore.textContent = String(this.finalScore);
      }

      const result = await scoreApi.submitGameScore(this.finalScore, {
        result: "completed",
        metrics: {
          chapter: this.params.chapter,
          gameTimerSeconds: this.getElapsedSeconds(),
          gridSize: this.params.size,
          hints: this.hints,
          mistakes: this.mistakes,
          timeElapsed: this.getElapsedSeconds(),
          wordsFound: this.foundWords.size,
          wordsTotal: this.placedWords.length,
        },
      });

      if (result?.ok) {
        this.setScoreSaveStatus("Score saved to the leaderboard ✓", "success");
      } else if (result?.reason === "not-signed-in") {
        this.setScoreSaveStatus("Sign in to save your score to the leaderboard.", "info");
      } else if (result?.reason === "already-submitted") {
        this.setScoreSaveStatus("Score already saved ✓", "success");
      } else {
        this.setScoreSaveStatus("Your score could not be saved.", "error");
      }
    } catch (error) {
      console.error("[001-sbg] Score submission failed:", error);
      this.setScoreSaveStatus("The leaderboard score could not be saved.", "error");
    }
  }

  showHint() {
    if (!this.isActive) {
      return;
    }

    if (!this.hintUsed) {
      this.hintUsed = true;
      this.hints += 1;
      this.renderScore();
      this.setGameStatus("Hint used. 10 points deducted.", "info");
    }

    this.renderVerse(true);
    this.elements.hintButton?.setAttribute("aria-pressed", "true");
    if (this.window.matchMedia?.("(max-width: 64rem)")?.matches) {
      this.elements.lead2?.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }

  showSetupError(message) {
    this.isActive = false;
    this.elements.grid.replaceChildren();
    this.showResult({
      title: "Unable to start the game",
      score: 0,
      details: message,
    });
    this.setScoreSaveStatus("");
  }
}

function boot() {
  const game = new WordSearchGame(document);
  game.init();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
}
