import { EMPTY, BLACK, WHITE, SIZE } from "./board.js";

const dirs = [
  { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
  { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
  { dx: 1, dy: 1 }, { dx: 1, dy: -1 },
  { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
];

export function countFlips(board, x, y, player) {
  if (board.get(x, y) !== EMPTY) return 0;

  const opponent = player === BLACK ? WHITE : BLACK;
  let total = 0;

  for (const { dx, dy } of dirs) {
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

export function getLegalMoves(board, player) {
  const moves = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (countFlips(board, x, y, player) > 0) moves.push({ x, y });
    }
  }
  return moves;
}

export function applyMove(board, x, y, player) {
  const opponent = player === BLACK ? WHITE : BLACK;
  board.set(x, y, player);

  for (const { dx, dy } of dirs) {
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
