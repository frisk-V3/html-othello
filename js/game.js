import { Board, BLACK, WHITE } from "./board.js";
import { getLegalMoves, applyMove } from "./rules.js";
import { render } from "./renderer.js";
import { cpuChooseMove, recordPlayerMove } from "./ai.js";

let board;
let currentPlayer = BLACK;

function updateInfo() {
  const black = board.grid.flat().filter(v => v === BLACK).length;
  const white = board.grid.flat().filter(v => v === WHITE).length;
  document.getElementById("info").textContent =
    `手番: ${currentPlayer === BLACK ? "黒" : "白"}　黒:${black} 白:${white}`;
}

function nextTurn() {
  const next = currentPlayer === BLACK ? WHITE : BLACK;

  if (getLegalMoves(board, next).length > 0) {
    currentPlayer = next;
  } else if (getLegalMoves(board, currentPlayer).length === 0) {
    document.getElementById("info").textContent += "　→ ゲーム終了";
    return;
  }

  render(board, currentPlayer, onClick);
  updateInfo();

  // CPU
  const level = Number(document.getElementById("cpuLevel").value);
  if (currentPlayer === WHITE && level > 0) {
    setTimeout(cpuMove, 300);
  }
}

function cpuMove() {
  const level = Number(document.getElementById("cpuLevel").value);
  const move = cpuChooseMove(board, level);
  if (!move) return;

  applyMove(board, move.x, move.y, WHITE);
  nextTurn();
}

function onClick(e) {
  const x = Number(e.currentTarget.dataset.x);
  const y = Number(e.currentTarget.dataset.y);

  if (!getLegalMoves(board, currentPlayer).some(m => m.x === x && m.y === y)) return;

  // 学習
  recordPlayerMove(x, y);

  applyMove(board, x, y, currentPlayer);
  nextTurn();
}

function start() {
  board = new Board();
  currentPlayer = BLACK;
  render(board, currentPlayer, onClick);
  updateInfo();
}

document.getElementById("restartBtn").addEventListener("click", start);
start();
