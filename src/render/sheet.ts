import type { PixelData } from "../generator/PixelData";

export interface Palette {
  body: string;
  accent: string;
  outline: string;
}

export interface SheetOptions {
  pixelSize: number;
  padding: number;
  background: string | null;
  palette: Palette;
}

const hexToRgba = (hex: string): [number, number, number, number] => {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16), 255] : [0, 0, 0, 255];
};

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  return canvas;
};

/** Packs the sprites at 1px per cell, so they can be scaled up with a single drawImage each. */
const renderAtlas = (sprites: PixelData[], cols: number, palette: Palette) => {
  const { width: w, height: h } = sprites[0];
  const rows = Math.ceil(sprites.length / cols);
  const atlas = createCanvas(cols * w, rows * h);
  const ctx = atlas.getContext("2d")!;
  const image = ctx.createImageData(atlas.width, atlas.height);
  const colors = [null, hexToRgba(palette.body), hexToRgba(palette.accent), hexToRgba(palette.outline)];
  sprites.forEach((sprite, i) => {
    const ox = (i % cols) * w;
    const oy = Math.floor(i / cols) * h;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const color = colors[Math.abs(sprite.get(x, y))];
        if (!color) continue;
        image.data.set(color, ((oy + y) * atlas.width + ox + x) * 4);
      }
    }
  });
  ctx.putImageData(image, 0, 0);
  return atlas;
};

export const spriteCellSize = (width: number, height: number, { pixelSize, padding }: SheetOptions) => ({
  width: width * pixelSize + 2 * padding,
  height: height * pixelSize + 2 * padding,
});

/** Renders sprites in a grid, row by row. */
export const renderSheet = (sprites: PixelData[], cols: number, rows: number, options: SheetOptions) => {
  const { pixelSize, padding, background, palette } = options;
  const { width: w, height: h } = sprites[0];
  const cell = spriteCellSize(w, h, options);
  const canvas = createCanvas(cols * cell.width, rows * cell.height);
  const ctx = canvas.getContext("2d")!;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const atlas = renderAtlas(sprites, cols, palette);
  ctx.imageSmoothingEnabled = false;
  sprites.slice(0, cols * rows).forEach((_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.drawImage(
      atlas,
      col * w,
      row * h,
      w,
      h,
      col * cell.width + padding,
      row * cell.height + padding,
      w * pixelSize,
      h * pixelSize,
    );
  });
  return canvas;
};

export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) =>
  new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Could not create image"));
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, "image/png");
  });
