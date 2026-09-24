import { BUILTIN_TEMPLATES } from "./generator/builtinTemplates";
import { decodeCells, encodeCells } from "./generator/cells";
import type { SpriteShape, Template } from "./generator/types";
import type { Palette } from "./render/sheet";

export interface AppState {
  templateName: string | null;
  cols: number;
  rows: number;
  pixels: number[];
  mirrorX: boolean;
  mirrorY: boolean;
  outline: boolean;
  outlineColor: string;
  foregroundColor: string;
  detailsColor: string;
  backgroundEnabled: boolean;
  backgroundColor: string;
  zoom: number;
  padding: number;
  seed: string;
}

export const LIMITS = {
  cols: { min: 1, max: 32 },
  rows: { min: 1, max: 48 },
  zoom: { min: 1, max: 20 },
  padding: { min: 0, max: 50 },
  sheet: { min: 1, max: 64 },
} as const;

export const clamp = (value: number, { min, max }: { min: number; max: number }) =>
  Math.min(max, Math.max(min, Math.round(value)));

export const DEFAULT_TEMPLATE = "robot";

const BASE_STATE: AppState = {
  templateName: null,
  cols: 5,
  rows: 5,
  pixels: new Array(25).fill(0),
  mirrorX: false,
  mirrorY: false,
  outline: false,
  outlineColor: "#000000",
  foregroundColor: "#ffffff",
  detailsColor: "#333333",
  backgroundEnabled: true,
  backgroundColor: "#777777",
  zoom: 10,
  padding: 10,
  seed: "1337",
};

export const applyTemplate = (state: AppState, name: string, template: Template): AppState => {
  const o = template.options;
  return {
    ...state,
    templateName: name,
    cols: template.width,
    rows: template.height,
    pixels: [...template.data],
    mirrorX: !!o.mirrorX,
    mirrorY: !!o.mirrorY,
    outline: !!o.outline,
    outlineColor: o.outlineColor ?? state.outlineColor,
    foregroundColor: o.foregroundColor ?? BASE_STATE.foregroundColor,
    detailsColor: o.detailsColor ?? BASE_STATE.detailsColor,
    zoom: o.zoom ?? BASE_STATE.zoom,
    padding: o.padding ?? BASE_STATE.padding,
  };
};

export const defaultState = () =>
  applyTemplate(BASE_STATE, DEFAULT_TEMPLATE, BUILTIN_TEMPLATES[DEFAULT_TEMPLATE]);

export const toTemplate = (s: AppState): Template => ({
  width: s.cols,
  height: s.rows,
  data: [...s.pixels],
  options: {
    mirrorX: s.mirrorX,
    mirrorY: s.mirrorY,
    outline: s.outline,
    outlineColor: s.outlineColor,
    foregroundColor: s.foregroundColor,
    detailsColor: s.detailsColor,
    zoom: s.zoom,
    padding: s.padding,
  },
});

/** True when the grid or generation settings differ from the template it was loaded from. */
export const differsFromTemplate = (s: AppState, t: Template) =>
  s.cols !== t.width ||
  s.rows !== t.height ||
  encodeCells(s.pixels) !== encodeCells(t.data) ||
  s.mirrorX !== !!t.options.mirrorX ||
  s.mirrorY !== !!t.options.mirrorY ||
  s.outline !== !!t.options.outline;

export const toShape = (s: AppState): SpriteShape => ({
  width: s.cols,
  height: s.rows,
  data: s.pixels,
  mirrorX: s.mirrorX,
  mirrorY: s.mirrorY,
  outline: s.outline,
});

export const toPalette = (s: AppState): Palette => ({
  body: s.foregroundColor,
  accent: s.detailsColor,
  outline: s.outlineColor,
});

const isHexColor = (v: unknown): v is string => typeof v === "string" && /^#[\da-f]{6}$/i.test(v);

/** Validates untrusted input (URL hash, localStorage) and fills gaps from the defaults. */
export const sanitizeState = (input: unknown): AppState | null => {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const base = defaultState();
  const cols = Number(raw.cols);
  const rows = Number(raw.rows);
  if (!Number.isInteger(cols) || !Number.isInteger(rows)) return null;
  if (cols !== clamp(cols, LIMITS.cols) || rows !== clamp(rows, LIMITS.rows)) return null;
  const pixels = typeof raw.cells === "string" ? decodeCells(raw.cells) : null;
  if (!pixels || pixels.length !== cols * rows) return null;
  const bool = (key: keyof AppState) => (typeof raw[key] === "boolean" ? (raw[key] as boolean) : (base[key] as boolean));
  const color = (key: keyof AppState) => (isHexColor(raw[key]) ? (raw[key] as string) : (base[key] as string));
  const num = (key: "zoom" | "padding") =>
    Number.isFinite(Number(raw[key])) ? clamp(Number(raw[key]), LIMITS[key]) : base[key];
  return {
    templateName: typeof raw.templateName === "string" ? raw.templateName : null,
    cols,
    rows,
    pixels,
    mirrorX: bool("mirrorX"),
    mirrorY: bool("mirrorY"),
    outline: bool("outline"),
    outlineColor: color("outlineColor"),
    foregroundColor: color("foregroundColor"),
    detailsColor: color("detailsColor"),
    backgroundEnabled: bool("backgroundEnabled"),
    backgroundColor: color("backgroundColor"),
    zoom: num("zoom"),
    padding: num("padding"),
    seed: typeof raw.seed === "string" ? raw.seed.slice(0, 64) : base.seed,
  };
};

const toSerializable = ({ pixels, ...rest }: AppState) => ({ ...rest, cells: encodeCells(pixels) });

const toBase64Url = (text: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(text)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (encoded: string) => {
  const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
};

export const encodeShareHash = (state: AppState) => `#s=${toBase64Url(JSON.stringify(toSerializable(state)))}`;

export const decodeShareHash = (hash: string) => {
  const match = /^#s=([\w-]+)$/.exec(hash);
  if (!match) return null;
  try {
    return sanitizeState(JSON.parse(fromBase64Url(match[1])));
  } catch {
    return null;
  }
};

const SESSION_KEY = "pixel-sprite-generator-session";

export const loadSession = () => {
  try {
    const json = localStorage.getItem(SESSION_KEY);
    return json ? sanitizeState(JSON.parse(json)) : null;
  } catch {
    return null;
  }
};

export const storeSession = (state: AppState) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(toSerializable(state)));
  } catch {
    // storage full or unavailable: the session just is not remembered
  }
};
