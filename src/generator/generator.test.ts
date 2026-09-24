import { describe, expect, it } from "vitest";
import { BUILTIN_TEMPLATES } from "./builtinTemplates";
import { decodeCells, encodeCells, isMinusZero, materializeMirror, resizeCells, shiftCells, sourceIndex } from "./cells";
import { generateSprites } from "./generator";
import { parseTemplates, serializeTemplates } from "./templateStore";
import type { SpriteShape } from "./types";

const shape = (data: number[], width: number, extra: Partial<SpriteShape> = {}): SpriteShape => ({
  width,
  height: data.length / width,
  data,
  mirrorX: false,
  mirrorY: false,
  outline: false,
  ...extra,
});

describe("built-in templates", () => {
  it.each(Object.entries(BUILTIN_TEMPLATES))("%s has data matching its size", (_name, t) => {
    expect(t.data).toHaveLength(t.width * t.height);
  });
});

describe("generateSprites", () => {
  const robot = BUILTIN_TEMPLATES.robot;
  const robotShape = shape(robot.data, robot.width, { mirrorX: true, outline: true });

  it("is deterministic for a seed", () => {
    const a = generateSprites(robotShape, "abc", 5).map((s) => s.data);
    const b = generateSprites(robotShape, "abc", 5).map((s) => s.data);
    expect(a).toEqual(b);
    expect(generateSprites(robotShape, "abd", 5).map((s) => s.data)).not.toEqual(a);
  });

  it("keeps earlier sprites stable when generating more", () => {
    const few = generateSprites(robotShape, "x", 3).map((s) => s.data);
    const many = generateSprites(robotShape, "x", 10).map((s) => s.data);
    expect(many.slice(0, 3)).toEqual(few);
  });

  it("never randomizes fixed cells", () => {
    for (const sprite of generateSprites(shape([-1, -2, -0, 0], 4), "s", 20)) {
      expect(sprite.data.map(Math.abs)).toEqual([1, 2, 0, 0]);
    }
  });

  it("resolves body to 0/1 and accent to 1/2", () => {
    const seen = { body: new Set<number>(), accent: new Set<number>() };
    for (const sprite of generateSprites(shape([1, 2], 2), "s", 50)) {
      seen.body.add(sprite.data[0]);
      seen.accent.add(sprite.data[1]);
    }
    expect([...seen.body].sort()).toEqual([0, 1]);
    expect([...seen.accent].sort()).toEqual([1, 2]);
  });

  it("mirrors horizontally and vertically", () => {
    const [sprite] = generateSprites(shape([-1, -2, 0, 0, -0, 0, 0, 0, 0], 3, { mirrorX: true, mirrorY: true }), "s", 1);
    expect(sprite.data.map(Math.abs)).toEqual([1, 2, 1, 0, 0, 0, 1, 2, 1]);
  });

  it("outlines filled cells but not into fixed empty cells", () => {
    const [sprite] = generateSprites(shape([0, 0, 0, 0, -1, -0, 0, 0, 0], 3, { outline: true }), "s", 1);
    expect(sprite.data.map(Math.abs)).toEqual([0, 3, 0, 3, 1, 0, 0, 3, 0]);
  });
});

describe("cells", () => {
  it("round-trips the compact encoding, including -0", () => {
    const data = [0, 1, 2, -0, -1, -2];
    const decoded = decodeCells(encodeCells(data));
    expect(decoded).toEqual(data);
    expect(isMinusZero(decoded[3])).toBe(true);
    expect(isMinusZero(decoded[0])).toBe(false);
  });

  it("maps mirrored cells to their source", () => {
    expect(sourceIndex(4, 0, 5, 1, true, false)).toBe(0);
    expect(sourceIndex(2, 0, 5, 1, true, false)).toBe(2);
    expect(sourceIndex(3, 0, 4, 1, true, false)).toBe(0);
    expect(sourceIndex(0, 2, 1, 3, false, true)).toBe(0);
  });

  it("resizes from the top left, or centered along mirrored axes", () => {
    expect(resizeCells([1, 2, 3, 4], 2, 2, 3, 1, false, false)).toEqual([1, 2, 0]);
    expect(resizeCells([1, 2, 2, 1], 4, 1, 6, 1, true, false)).toEqual([0, 1, 2, 2, 1, 0]);
  });

  it("shifts with wrap-around", () => {
    expect(shiftCells([1, 2, 3], 3, 1, 1, 0)).toEqual([3, 1, 2]);
    expect(shiftCells([1, 2], 1, 2, 0, -1)).toEqual([2, 1]);
  });

  it("bakes the mirror into the data", () => {
    expect(materializeMirror([1, 2, 9, 9], 4, 1, true, false)).toEqual([1, 2, 2, 1]);
  });
});

describe("template storage", () => {
  it("round-trips -0 values", () => {
    const templates = { mine: { width: 2, height: 1, data: [-0, 1], options: {} } };
    const parsed = parseTemplates(serializeTemplates(templates));
    expect(isMinusZero(parsed.mine.data[0])).toBe(true);
  });

  it("drops unchanged copies of built-ins stored by v1, and keeps changed ones", () => {
    const changed = { ...BUILTIN_TEMPLATES.robot, data: BUILTIN_TEMPLATES.robot.data.map(() => 1) };
    const parsed = parseTemplates(serializeTemplates({ robot: BUILTIN_TEMPLATES.robot, helmet: changed as never }));
    expect(Object.keys(parsed)).toEqual(["helmet (saved)"]);
  });

  it("ignores malformed data", () => {
    expect(parseTemplates("not json")).toEqual({});
    expect(parseTemplates(JSON.stringify({ bad: { width: 2, height: 2, data: [1] } }))).toEqual({});
  });
});
