export const EMPTY = 0, BLACK = 1, WHITE = 2;
export const SIZE = 8;

export class Board {
  constructor() {
    this.grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
    const m = SIZE / 2;
    this.grid[m - 1][m - 1] = WHITE;
    this.grid[m][m] = WHITE;
    this.grid[m - 1][m] = BLACK;
    this.grid[m][m - 1] = BLACK;
  }

  clone() {
    const b = new Board();
    b.grid = this.grid.map(row => [...row]);
    return b;
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
