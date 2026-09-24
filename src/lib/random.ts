export interface Rng {
  /** Random integer in the inclusive range [min, max]. */
  int(min: number, max: number): number;
}

export const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

/** Small, fast seeded PRNG (sfc32), good enough for sprite generation. */
export const createRng = (seed: string): Rng => {
  let a = 0x9e3779b9;
  let b = 0x243f6a88;
  let c = 0xb7e15162;
  let d = hashString(seed) ^ 0xdeadbeef;
  const next = () => {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  // warm up so similar seeds diverge quickly
  for (let i = 0; i < 15; i++) next();
  return { int: (min, max) => min + Math.floor(next() * (max - min + 1)) };
};

const SEED_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export const randomSeed = (length = 6) =>
  Array.from({ length }, () => SEED_ALPHABET[Math.floor(Math.random() * SEED_ALPHABET.length)]).join("");
