/**
 * Template cells are plain numbers:
 *   0 = empty, 1 = body (50% chance of being empty), 2 = accent (50% chance of being body).
 * A negative sign marks a "fixed" cell that is never randomized. Fixed empty cells are
 * stored as -0, which also prevents the outline from growing into them.
 */
export const EMPTY = 0;
export const BODY = 1;
export const ACCENT = 2;
export const OUTLINE = 3;

export type Brush = typeof EMPTY | typeof BODY | typeof ACCENT;

export const isMinusZero = (value: number) => value === 0 && 1 / value === -Infinity;
export const isFixed = (value: number) => value < 0 || isMinusZero(value);
export const cellValue = (value: number) => Math.abs(value);
export const makeCell = (value: number, fixed: boolean) => (fixed ? -value : value);

const RANDOM_CHARS = "012";
const FIXED_CHARS = "abc";

/** Compact, lossless (keeps -0) string encoding of template cells. */
export const encodeCells = (data: number[]) =>
  data.map((v) => (isFixed(v) ? FIXED_CHARS : RANDOM_CHARS)[cellValue(v)] ?? "0").join("");

export const decodeCells = (encoded: string) =>
  [...encoded].map((ch) => {
    const random = RANDOM_CHARS.indexOf(ch);
    if (random >= 0) return random;
    const fixed = FIXED_CHARS.indexOf(ch);
    return fixed >= 0 ? -fixed : 0;
  });

/** Maps a grid coordinate to the cell that is actually edited when mirroring is on. */
export const sourceIndex = (
  x: number,
  y: number,
  cols: number,
  rows: number,
  mirrorX: boolean,
  mirrorY: boolean,
) => {
  const ix = mirrorX && x >= Math.ceil(cols / 2) ? cols - 1 - x : x;
  const iy = mirrorY && y >= Math.ceil(rows / 2) ? rows - 1 - y : y;
  return iy * cols + ix;
};

export const isMirroredCell = (
  x: number,
  y: number,
  cols: number,
  rows: number,
  mirrorX: boolean,
  mirrorY: boolean,
) => sourceIndex(x, y, cols, rows, mirrorX, mirrorY) !== y * cols + x;

/** Resizes the grid, keeping the drawing centered along mirrored axes. */
export const resizeCells = (
  data: number[],
  cols: number,
  rows: number,
  newCols: number,
  newRows: number,
  mirrorX: boolean,
  mirrorY: boolean,
) => {
  const dx = mirrorX ? Math.floor((newCols - cols) / 2) : 0;
  const dy = mirrorY ? Math.floor((newRows - rows) / 2) : 0;
  const result = new Array<number>(newCols * newRows).fill(0);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < newCols && ny < newRows) {
        result[ny * newCols + nx] = data[y * cols + x] ?? 0;
      }
    }
  }
  return result;
};

/** Moves the whole drawing, wrapping around the edges. */
export const shiftCells = (data: number[], cols: number, rows: number, dx: number, dy: number) => {
  const result = new Array<number>(cols * rows).fill(0);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx = (((x + dx) % cols) + cols) % cols;
      const ny = (((y + dy) % rows) + rows) % rows;
      result[ny * cols + nx] = data[y * cols + x];
    }
  }
  return result;
};

/** Bakes the mirrored halves into the data, so the grid shows exactly what was visible. */
export const materializeMirror = (
  data: number[],
  cols: number,
  rows: number,
  mirrorX: boolean,
  mirrorY: boolean,
) => {
  const result = [...data];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      result[y * cols + x] = data[sourceIndex(x, y, cols, rows, mirrorX, mirrorY)];
    }
  }
  return result;
};
