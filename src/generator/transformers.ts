import { BODY, OUTLINE, cellValue, isFixed, isMinusZero } from "./cells";
import type { PixelData } from "./PixelData";
import type { Rng } from "../lib/random";

/** Resolves random cells: body may vanish, accent may turn into body. Fixed cells lose their mark. */
export const randomize = (pixels: PixelData, rng: Rng) => {
  pixels.data = pixels.data.map((value) => {
    if (isFixed(value)) {
      // keep -0 so the outline cannot grow into fixed empty cells
      return isMinusZero(value) ? value : cellValue(value);
    }
    if (value === BODY) return rng.int(0, 1);
    if (value > BODY) return rng.int(BODY, value);
    return 0;
  });
};

export const mirrorX = (pixels: PixelData) => {
  const { width: w, height: h } = pixels;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w >> 1; x++) {
      pixels.set(w - 1 - x, y, pixels.get(x, y));
    }
  }
};

export const mirrorY = (pixels: PixelData) => {
  const { width: w, height: h } = pixels;
  for (let y = 0; y < h >> 1; y++) {
    for (let x = 0; x < w; x++) {
      pixels.set(x, h - 1 - y, pixels.get(x, y));
    }
  }
};

const isOpenSpace = (value: number | undefined) => value === 0 && !isMinusZero(value);

/** Surrounds every filled cell with an outline, except where a fixed empty cell forbids it. */
export const outline = (pixels: PixelData) => {
  const { width: w, height: h } = pixels;
  const source = [...pixels.data];
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? undefined : source[y * w + x]);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isOpenSpace(at(x, y))) continue;
      const neighbours = [at(x, y - 1), at(x, y + 1), at(x - 1, y), at(x + 1, y)];
      if (neighbours.some((v) => v !== undefined && v > 0 && v !== OUTLINE)) {
        pixels.set(x, y, OUTLINE);
      }
    }
  }
};
