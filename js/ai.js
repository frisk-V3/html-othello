import { WHITE } from "./board.js";
import { getLegalMoves, countFlips } from "./rules.js";

/* -----------------------------
   学習データ管理
----------------------------- */

// 学習データの構造：
// learnData[y][x] = プレイヤーがそこに打った回数
let learnData = loadLearnData();

function loadLearnData() {
  const data = localStorage.getItem("othello_learn");
  if (data) return JSON.parse(data);

  // 初期化（全部0）
  return Array.from({ length: 8 }, () => Array(8).fill(0));
}

export function recordPlayerMove(x, y) {
  learnData[y][x]++;
  saveLearnData();
}

function saveLearnData() {
  localStorage.setItem("othello_learn", JSON.stringify(learnData));
}

/* -----------------------------
   AIの手選択
----------------------------- */

export function cpuChooseMove(board, level) {
  const moves = getLegalMoves(board, WHITE);
  if (moves.length === 0) return null;

  // かんたん：ランダム
  if (level === 1) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // ふつう：ひっくり返す枚数 + 学習データを少し参照
  if (level === 2) {
    return moves
      .map(m => ({
        ...m,
        score:
          countFlips(board, m.x, m.y, WHITE) -
          learnData[m.y][m.x] * 0.3 // プレイヤーがよく打つ場所は危険
      }))
      .sort((a, b) => b.score - a.score)[0];
  }

  // むずかしい：角優先 + 学習データを強く参照
  if (level === 3) {
    // 角
    const corners = moves.filter(m =>
      (m.x === 0 && m.y === 0) ||
      (m.x === 7 && m.y === 0) ||
      (m.x === 0 && m.y === 7) ||
      (m.x === 7 && m.y === 7)
    );
    if (corners.length > 0) return corners[0];

    // 学習データを強く反映
    return moves
      .map(m => ({
        ...m,
        score:
          countFlips(board, m.x, m.y, WHITE) -
          learnData[m.y][m.x] * 1.2 // プレイヤーの得意位置を強く避ける
      }))
      .sort((a, b) => b.score - a.score)[0];
  }

  return null;
}
