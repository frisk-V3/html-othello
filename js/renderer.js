import { BLACK, WHITE } from "./board.js";
import { getLegalMoves } from "./rules.js";

export function render(board, currentPlayer, onClick) {
  const table = document.getElementById("board");
  table.innerHTML = "";

  const legal = getLegalMoves(board, currentPlayer);

  for (let y = 0; y < 8; y++) {
    const tr = document.createElement("tr");

    for (let x = 0; x < 8; x++) {
      const td = document.createElement("td");
      td.dataset.x = x;
      td.dataset.y = y;

      const cell = board.get(x, y);

      // 石の描画
      if (cell === BLACK || cell === WHITE) {
        const disc = document.createElement("div");
        disc.classList.add("disc", cell === BLACK ? "black" : "white");
        td.appendChild(disc);
      }

      // 合法手のハイライト
      if (legal.some(m => m.x === x && m.y === y)) {
        td.classList.add("hint");
      }

      // クリックイベント
      td.addEventListener("click", onClick);

      tr.appendChild(td);
    }

    table.appendChild(tr);
  }
}
