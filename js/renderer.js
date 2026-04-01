import { BLACK, WHITE } from "./board.js";
import { getLegalMoves } from "./rules.js";

export function render(board, currentPlayer, onClick) {
  const table = document.getElementById("board");
  table.innerHTML = "";

  const legal = getLegalMoves(board, currentPlayer);

  for (let y = 0; y < board.grid.length; y++) {
    const tr = document.createElement("tr");
    for (let x = 0; x < board.grid[y].length; x++) {
      const td = document.createElement("td");
      td.dataset.x = x;
      td.dataset.y = y;

      const cell = board.get(x, y);
      if (cell === BLACK || cell === WHITE) {
        const d = document.createElement("div");
        d.classList.add("disc", cell === BLACK ? "black" : "white");
        td.appendChild(d);
      } else if (legal.some(m => m.x === x && m.y === y)) {
        td.classList.add("hint");
      }

      td.addEventListener("click", onClick);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}
