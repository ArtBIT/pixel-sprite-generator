import { describe, expect, it } from "vitest";
import { isMinusZero } from "./generator/cells";
import { decodeShareHash, defaultState, encodeShareHash, sanitizeState } from "./state";

describe("share links", () => {
  it("round-trips the full state", () => {
    const state = { ...defaultState(), seed: "héllo ✨", pixels: defaultState().pixels.map((_, i) => (i === 0 ? -0 : 1)) };
    const decoded = decodeShareHash(encodeShareHash(state));
    expect(decoded).toEqual(state);
    expect(isMinusZero(decoded!.pixels[0])).toBe(true);
  });

  it("rejects garbage", () => {
    expect(decodeShareHash("#s=@@@")).toBeNull();
    expect(decodeShareHash("#other")).toBeNull();
  });

  it("rejects out of range sizes and mismatched cells", () => {
    expect(sanitizeState({ cols: 500, rows: 1, cells: "0" })).toBeNull();
    expect(sanitizeState({ cols: 2, rows: 2, cells: "0" })).toBeNull();
  });

  it("falls back to defaults for invalid fields", () => {
    const state = sanitizeState({ cols: 1, rows: 1, cells: "1", foregroundColor: "red", zoom: 999 });
    expect(state?.foregroundColor).toBe(defaultState().foregroundColor);
    expect(state?.zoom).toBe(20);
  });
});
