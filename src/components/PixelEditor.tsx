import { useRef, type CSSProperties, type PointerEvent } from "react";
import { ACCENT, BODY, EMPTY, cellValue, isFixed, isMirroredCell, makeCell, sourceIndex, type Brush } from "../generator/cells";
import { Icon } from "./Icon";

interface Props {
  cols: number;
  rows: number;
  pixels: number[];
  mirrorX: boolean;
  mirrorY: boolean;
  foregroundColor: string;
  detailsColor: string;
  /** Shown behind the cells, like in the preview; null shows a checkerboard. */
  backgroundColor: string | null;
  brush: Brush;
  lock: boolean;
  onBrushChange: (brush: Brush) => void;
  onLockChange: (lock: boolean) => void;
  /** `key` groups the changes of one stroke into a single undo step. */
  onChange: (pixels: number[], key: string) => void;
}

const BRUSHES: { value: Brush; label: string; hint: string }[] = [
  { value: EMPTY, label: "Empty", hint: "Always transparent" },
  { value: BODY, label: "Body", hint: "Body color, 50% chance of being empty" },
  { value: ACCENT, label: "Accent", hint: "Accent color, 50% chance of being body" },
];

const GRID_WIDTH = 288;
const cellSize = (cols: number, rows: number) =>
  Math.max(6, Math.min(26, Math.floor(GRID_WIDTH / cols), Math.floor(420 / rows)));

let strokeCounter = 0;

export const PixelEditor = ({
  cols,
  rows,
  pixels,
  mirrorX,
  mirrorY,
  foregroundColor,
  detailsColor,
  backgroundColor,
  brush,
  lock,
  onBrushChange,
  onLockChange,
  onChange,
}: Props) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const stroke = useRef<{ key: string; pixels: number[] } | null>(null);
  const colors = ["transparent", foregroundColor, detailsColor];

  const cellAt = (e: PointerEvent) => {
    const rect = gridRef.current!.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * cols);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * rows);
    if (x < 0 || y < 0 || x >= cols || y >= rows) return null;
    return sourceIndex(x, y, cols, rows, mirrorX, mirrorY);
  };

  const paint = (e: PointerEvent) => {
    const index = cellAt(e);
    if (index === null || !stroke.current) return;
    const value = makeCell(brush, lock);
    if (Object.is(stroke.current.pixels[index], value)) return;
    stroke.current.pixels = [...stroke.current.pixels];
    stroke.current.pixels[index] = value;
    onChange(stroke.current.pixels, stroke.current.key);
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (e.button === 2) {
      // right click toggles whether the cell is randomized
      const index = cellAt(e);
      if (index === null) return;
      const next = [...pixels];
      next[index] = makeCell(cellValue(pixels[index]), !isFixed(pixels[index]));
      onChange(next, `lock:${++strokeCounter}`);
      return;
    }
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    stroke.current = { key: `stroke:${++strokeCounter}`, pixels };
    paint(e);
  };

  const endStroke = () => {
    stroke.current = null;
  };

  const size = cellSize(cols, rows);

  return (
    <div className="pixel-editor">
      <div className="brushes" role="radiogroup" aria-label="Brush">
        {BRUSHES.map((b, i) => (
          <button
            key={b.value}
            type="button"
            role="radio"
            aria-checked={brush === b.value}
            className="brush"
            title={`${b.hint} (${i + 1})`}
            onClick={() => onBrushChange(b.value)}
          >
            <span className="brush-swatch" style={{ background: colors[b.value] }} data-empty={b.value === EMPTY} />
            {b.label}
          </button>
        ))}
        <button
          type="button"
          className="brush brush-lock"
          aria-pressed={lock}
          title="Fixed: painted cells are never randomized (L). Right-click a cell to toggle."
          onClick={() => onLockChange(!lock)}
        >
          <Icon name="lock" size={14} />
          Fixed
        </button>
      </div>

      <div
        ref={gridRef}
        className="pixel-grid"
        style={{ "--cols": cols, "--rows": rows, "--cell": `${size}px`, backgroundColor: backgroundColor ?? undefined } as CSSProperties}
        data-transparent={backgroundColor === null}
        onPointerDown={handlePointerDown}
        onPointerMove={(e) => stroke.current && paint(e)}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onContextMenu={(e) => e.preventDefault()}
        role="img"
        aria-label={`Template grid, ${cols} by ${rows} cells`}
      >
        {Array.from({ length: rows * cols }, (_, i) => {
          const x = i % cols;
          const y = Math.floor(i / cols);
          const raw = pixels[sourceIndex(x, y, cols, rows, mirrorX, mirrorY)];
          const value = cellValue(raw);
          const classes = ["pixel-cell"];
          if (isFixed(raw)) classes.push(value === EMPTY ? "is-fixed-empty" : "is-fixed");
          if (isMirroredCell(x, y, cols, rows, mirrorX, mirrorY)) classes.push("is-mirrored");
          return <div key={i} className={classes.join(" ")} style={{ background: colors[value] }} />;
        })}
      </div>
    </div>
  );
};
