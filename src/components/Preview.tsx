import { useEffect, useMemo, useRef, useState } from "react";
import { generateSprites } from "../generator/generator";
import type { SpriteShape } from "../generator/types";
import { renderSheet, spriteCellSize, type SheetOptions } from "../render/sheet";

interface Props {
  shape: SpriteShape;
  seed: string;
  options: SheetOptions;
  onSpriteClick: (index: number) => void;
}

/** Larger previews repeat a block of this many sprites per side instead of generating thousands. */
const MAX_BLOCK = 48;

const useElementSize = (ref: React.RefObject<HTMLElement | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
};

export const Preview = ({ shape, seed, options, onSpriteClick }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useElementSize(containerRef);
  const [hover, setHover] = useState<{ col: number; row: number } | null>(null);

  const cell = spriteCellSize(shape.width, shape.height, options);
  const gridCols = Math.max(1, Math.ceil(size.width / cell.width));
  const gridRows = Math.max(1, Math.ceil(size.height / cell.height));
  const blockCols = Math.min(gridCols, MAX_BLOCK);
  const blockRows = Math.min(gridRows, MAX_BLOCK);

  const sprites = useMemo(
    () => generateSprites(shape, seed, blockCols * blockRows),
    [shape, seed, blockCols, blockRows],
  );
  const sheet = useMemo(
    () => renderSheet(sprites, blockCols, blockRows, options),
    [sprites, blockCols, blockRows, options],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width || !size.height) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size.width, size.height);
    for (let y = 0; y < size.height; y += sheet.height) {
      for (let x = 0; x < size.width; x += sheet.width) {
        ctx.drawImage(sheet, x, y);
      }
    }
    if (hover) {
      const inset = 0.5;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.strokeRect(hover.col * cell.width + inset, hover.row * cell.height + inset, cell.width - 1, cell.height - 1);
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.strokeRect(hover.col * cell.width + 1.5, hover.row * cell.height + 1.5, cell.width - 3, cell.height - 3);
    }
  }, [sheet, size, hover, cell.width, cell.height]);

  const cellFromEvent = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      col: Math.floor((e.clientX - rect.left) / cell.width),
      row: Math.floor((e.clientY - rect.top) / cell.height),
    };
  };

  return (
    <div ref={containerRef} className="preview">
      <canvas
        ref={canvasRef}
        className="preview-canvas"
        style={{ width: size.width, height: size.height }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const next = cellFromEvent(e);
          if (next.col !== hover?.col || next.row !== hover?.row) setHover(next);
        }}
        onPointerLeave={() => setHover(null)}
        onClick={(e) => {
          const { col, row } = cellFromEvent(e as unknown as React.PointerEvent);
          onSpriteClick((row % blockRows) * blockCols + (col % blockCols));
        }}
        role="img"
        aria-label="Generated sprites. Click a sprite to download it."
      />
    </div>
  );
};
