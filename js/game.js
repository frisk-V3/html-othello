// ===== 定数・盤面クラス =====
const EMPTY = 0, BLACK = 1, WHITE = 2;
const SIZE = 8;

class Board {
  constructor() {
    this.grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
    const m = SIZE / 2;
    this.grid[m - 1][m - 1] = WHITE;
    this.grid[m][m] = WHITE;
    this.grid[m - 1][m] = BLACK;
    this.grid[m][m - 1] = BLACK;
  }
  inBounds(x, y) {
    return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
  }
  get(x, y) {
    return this.grid[y][x];
  }
  set(x, y, v) {
    this.grid[y][x] = v;
  }
}

// ===== ルール関連 =====
const DIRS = [
  { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
  { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
  { dx: 1, dy: 1 }, { dx: 1, dy: -1 },
  { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
];

function countFlips(board, x, y, player) {
  if (board.get(x, y) !== EMPTY) return 0;
  const opponent = player === BLACK ? WHITE : BLACK;
  let total = 0;

  for (const { dx, dy } of DIRS) {
    let cx = x + dx, cy = y + dy;
    let count = 0;
    while (board.inBounds(cx, cy) && board.get(cx, cy) === opponent) {
      count++;
      cx += dx;
      cy += dy;
    }
    if (count > 0 && board.inBounds(cx, cy) && board.get(cx, cy) === player) {
      total += count;
    }
  }
  return total;
}

function getLegalMoves(board, player) {
  const moves = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (countFlips(board, x, y, player) > 0) moves.push({ x, y });
    }
  }
  return moves;
}

function applyMove(board, x, y, player) {
  const opponent = player === BLACK ? WHITE : BLACK;
  board.set(x, y, player);

  for (const { dx, dy } of DIRS) {
    let cx = x + dx, cy = y + dy;
    const toFlip = [];
    while (board.inBounds(cx, cy) && board.get(cx, cy) === opponent) {
      toFlip.push({ x: cx, y: cy });
      cx += dx;
      cy += dy;
    }
    if (toFlip.length > 0 && board.inBounds(cx, cy) && board.get(cx, cy) === player) {
      for (const p of toFlip) board.set(p.x, p.y, player);
    }
  }
}

// ===== 学習データ（プレイヤーの打ち筋） =====
let learnData = loadLearnData();

function loadLearnData() {
  const data = localStorage.getItem("othello_learn");
  if (data) {
    try { return JSON.parse(data); } catch { /* ignore */ }
  }
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function saveLearnData() {
  localStorage.setItem("othello_learn", JSON.stringify(learnData));
}

function recordPlayerMove(x, y) {
  learnData[y][x]++;
  saveLearnData();
}

// ===== CPU（AI） =====
function cpuChooseMove(board, level) {
  const moves = getLegalMoves(board, WHITE);
  if (moves.length === 0) return null;

  // かんたん：ランダム
  if (level === 1) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // ふつう：ひっくり返す枚数 + 学習データ少し参照
  if (level === 2) {
    return moves
      .map(m => ({
        ...m,
        score:
          countFlips(board, m.x, m.y, WHITE) -
          learnData[m.y][m.x] * 0.3
      }))
      .sort((a, b) => b.score - a.score)[0];
  }

  // むずかしい：角優先 + 学習データ強く参照
  if (level === 3) {
    const corners = moves.filter(m =>
      (m.x === 0 && m.y === 0) ||
      (m.x === 7 && m.y === 0) ||
      (m.x === 0 && m.y === 7) ||
      (m.x === 7 && m.y === 7)
    );
    if (corners.length > 0) return corners[0];

    return moves
      .map(m => ({
        ...m,
        score:
          countFlips(board, m.x, m.y, WHITE) -
          learnData[m.y][m.x] * 1.2
      }))
      .sort((a, b) => b.score - a.score)[0];
  }

  return null;
}

// ===== 描画 =====
function render(board, currentPlayer, onClick) {
  const table = document.getElementById("board");
  table.innerHTML = "";

  const legal = getLegalMoves(board, currentPlayer);

  for (let y = 0; y < SIZE; y++) {
    const tr = document.createElement("tr");
    for (let x = 0; x < SIZE; x++) {
      const td = document.createElement("td");
      td.dataset.x = x;
      td.dataset.y = y;

      const cell = board.get(x, y);
      if (cell === BLACK || cell === WHITE) {
        const disc = document.createElement("div");
        disc.classList.add("disc", cell === BLACK ? "black" : "white");
        td.appendChild(disc);
      } else if (legal.some(m => m.x === x && m.y === y)) {
        td.classList.add("hint");
      }

      td.addEventListener("click", onClick);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

// ===== ゲーム制御 =====
let board;
let currentPlayer = BLACK;

const infoElem = document.getElementById("info");
const cpuLevelElem = document.getElementById("cpuLevel");
const restartBtn = document.getElementById("restartBtn");

function updateInfo() {
  const flat = board.grid.flat();
  const black = flat.filter(v => v === BLACK).length;
  const white = flat.filter(v => v === WHITE).length;
  infoElem.textContent =
    `手番: ${currentPlayer === BLACK ? "黒" : "白"}　黒:${black} 白:${white}`;
}

function nextTurn() {
  const next = currentPlayer === BLACK ? WHITE : BLACK;

  if (getLegalMoves(board, next).length > 0) {
    currentPlayer = next;
  } else if (getLegalMoves(board, currentPlayer).length === 0) {
    infoElem.textContent += "　→ ゲーム終了";
    return;
  }

  render(board, currentPlayer, onClick);
  updateInfo();

  const level = Number(cpuLevelElem.value);
  if (currentPlayer === WHITE && level > 0) {
    setTimeout(cpuMove, 300);
  }
}

function cpuMove() {
  const level = Number(cpuLevelElem.value);
  const move = cpuChooseMove(board, level);
  if (!move) return;
  applyMove(board, move.x, move.y, WHITE);
  nextTurn();
}

function onClick(e) {
  const x = Number(e.currentTarget.dataset.x);
  const y = Number(e.currentTarget.dataset.y);

  if (!getLegalMoves(board, currentPlayer).some(m => m.x === x && m.y === y)) return;

  if (currentPlayer === BLACK) {
    recordPlayerMove(x, y);
  }

  applyMove(board, x, y, currentPlayer);
  nextTurn();
}

function start() {
  board = new Board();
  currentPlayer = BLACK;
  render(board, currentPlayer, onClick);
  updateInfo();
}

restartBtn.addEventListener("click", start);
start();
