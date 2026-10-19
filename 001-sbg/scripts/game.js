import {
  CHAPTER_VERSE_COUNTS,
  normalizePuzzleParams,
  toDevanagariNumber,
  verseOffset,
} from "./game/config.js";
import { GameTimer } from "./timer.js";

const TIMER_DURATION_SECONDS = 30;
const MARKER_CLASS_COUNT = 7;
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
      timer: documentRef.getElementById("timer"),
      lead: documentRef.getElementById("lead"),
      lead2: documentRef.getElementById("lead2"),
      presentCount: documentRef.getElementById("nPresent"),
      foundCount: documentRef.getElementById("nFound"),
      finishMessage: documentRef.getElementById("finishMessage"),
      statusMessage: documentRef.getElementById("statusMessage"),
      answers: documentRef.getElementById("answers"),
      hintPopup: documentRef.getElementById("hintPopup"),
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
  }

  init() {
    if (!this.elements.grid) {
      return;
    }

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
    this.createPuzzle(availableWords);
    this.renderAnswerList();
    this.renderScore();
    this.hideHint();
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

    this.elements.hintPopup?.addEventListener("click", (event) => {
      if (event.target === this.elements.hintPopup) {
        this.hideHint();
      }
    });

    this.elements.hintPopup?.querySelector(".content")?.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    this.elements.hintPopup?.querySelectorAll("[data-close-hint]").forEach((button) => {
      button.addEventListener("click", () => this.hideHint());
    });

    this.document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.hideHint();
      }
    });

    this.elements.refreshButton?.addEventListener("click", (event) => {
      event.preventDefault();
      this.window.location.reload();
    });

    this.document.querySelectorAll(".difficulty-button[data-size]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        this.loadPuzzle({ size: button.dataset.size });
      });
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

    // Assigning only search also works when the game is opened via file://.
    this.window.location.search = nextQuery.toString();
  }

  renderVerse(emphasizeAnswerWords) {
    const container = this.elements.lead2;
    if (!container) {
      return;
    }

    const answerWords = new Set(this.placedWords.map(({ word }) => word));
    const fragment = this.document.createDocumentFragment();

    this.verseWords.forEach((word) => {
      const content = this.document.createElement(emphasizeAnswerWords && answerWords.has(word) ? "strong" : "span");
      content.classList.add("nob");
      content.title = getTransliteration(word, "iast", this.window.Sanscript);
      content.textContent = `${word} `;
      fragment.append(content);
    });

    fragment.append(`। ${toDevanagariNumber(this.params.chapter)}.${toDevanagariNumber(this.params.verse)}`);
    container.replaceChildren(fragment);
  }

  createPuzzle(words) {
    const puzzle = buildPuzzle(words, this.params.size, this.params.wordsToFind);
    this.placedWords = puzzle.placedWords;
    this.isActive = this.placedWords.length > 0;
    this.renderGrid(puzzle.board);
    this.renderVerse(false);
  }

  renderGrid(board) {
    const table = this.document.createElement("table");
    const body = this.document.createElement("tbody");

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

  renderAnswerList() {
    if (!this.elements.answers) {
      return;
    }

    const answers = this.placedWords.map(({ word }) => {
      const answer = this.document.createElement("li");
      answer.textContent = word;
      return answer;
    });

    this.elements.answers.replaceChildren(...answers);
  }

  renderScore() {
    if (this.elements.presentCount) {
      this.elements.presentCount.textContent = toDevanagariNumber(this.placedWords.length);
    }
    if (this.elements.foundCount) {
      this.elements.foundCount.textContent = toDevanagariNumber(this.foundWords.size);
    }
    if (this.elements.finishMessage) {
      this.elements.finishMessage.hidden = true;
    }
    if (this.elements.statusMessage) {
      this.elements.statusMessage.hidden = this.foundWords.size === 0;
    }
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

    matchingWords.forEach((word) => this.markWordFound(word));

    if (!matchingWords.length) {
      return;
    }

    this.renderScore();

    if (this.foundWords.size === this.placedWords.length) {
      this.finishGame();
    }
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
      duration: TIMER_DURATION_SECONDS,
      onTick: (remaining) => {
        if (this.elements.timer) {
          this.elements.timer.textContent = toDevanagariNumber(remaining);
        }
      },
      onExpire: () => this.expireGame(),
    });
    this.timer.start();
  }

  finishGame() {
    this.isActive = false;
    this.timer?.stop();
    this.elements.grid.classList.add("is-complete");

    if (this.elements.finishMessage) {
      this.elements.finishMessage.textContent = "।। शुभमस्तु ।।";
      this.elements.finishMessage.hidden = false;
    }
  }

  expireGame() {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.elements.grid.classList.add("is-locked");
    this.elements.grid.setAttribute("aria-disabled", "true");

    if (this.elements.finishMessage) {
      this.elements.finishMessage.textContent = "समयः समाप्तः अस्ति।";
      this.elements.finishMessage.hidden = false;
    }
  }

  showHint() {
    this.renderVerse(true);
    if (this.elements.hintPopup) {
      this.elements.hintPopup.hidden = false;
    }
    this.elements.hintButton?.setAttribute("aria-expanded", "true");
  }

  hideHint() {
    if (this.elements.hintPopup) {
      this.elements.hintPopup.hidden = true;
    }
    this.elements.hintButton?.setAttribute("aria-expanded", "false");
  }

  showSetupError(message) {
    this.isActive = false;
    this.elements.grid.replaceChildren();

    if (this.elements.finishMessage) {
      this.elements.finishMessage.textContent = message;
      this.elements.finishMessage.hidden = false;
    }
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
