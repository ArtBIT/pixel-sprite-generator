export interface TemplateOptions {
  mirrorX?: boolean;
  mirrorY?: boolean;
  outline?: boolean;
  outlineColor?: string;
  foregroundColor?: string;
  detailsColor?: string;
  zoom?: number;
  padding?: number;
}

export interface Template {
  width: number;
  height: number;
  /** Row-major cell values, see cells.ts for the encoding. */
  data: number[];
  options: TemplateOptions;
}

/** Everything the generator needs to produce sprites. */
export interface SpriteShape {
  width: number;
  height: number;
  data: number[];
  mirrorX: boolean;
  mirrorY: boolean;
  outline: boolean;
}
