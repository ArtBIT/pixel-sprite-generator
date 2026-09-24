import { PixelData } from "./PixelData";
import { mirrorX, mirrorY, outline, randomize } from "./transformers";
import { createRng, type Rng } from "../lib/random";
import type { SpriteShape } from "./types";

export const generateSprite = (shape: SpriteShape, rng: Rng) => {
  const pixels = new PixelData(shape.width, shape.height, shape.data);
  randomize(pixels, rng);
  if (shape.mirrorX) mirrorX(pixels);
  if (shape.mirrorY) mirrorY(pixels);
  if (shape.outline) outline(pixels);
  return pixels;
};

/** Generates `count` sprites; the n-th sprite for a given seed is always the same. */
export const generateSprites = (shape: SpriteShape, seed: string, count: number) => {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => generateSprite(shape, rng));
};
