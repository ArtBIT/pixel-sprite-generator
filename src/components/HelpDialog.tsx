import { useEffect, useRef } from "react";

const SHORTCUTS: [string, string][] = [
  ["R / Space", "New random seed"],
  ["1 / 2 / 3", "Empty / Body / Accent brush"],
  ["L", "Toggle the Fixed brush"],
  ["Ctrl+Z", "Undo"],
  ["Ctrl+Shift+Z / Ctrl+Y", "Redo"],
  ["S", "Download sprite sheet"],
  ["?", "Show this help"],
];

export const HelpDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="help-title"
    >
      <div className="dialog-body">
        <header className="dialog-header">
          <h2 id="help-title">How it works</h2>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </header>
        <p>
          Draw a template on the grid. Every sprite in the preview is generated from it, with some cells randomly
          switched on or off. The random seed decides the outcome, so the same seed always gives the same sprites.
        </p>
        <ul className="legend">
          <li>
            <span className="legend-swatch" data-kind="empty" /> <b>Empty</b>: always transparent.
          </li>
          <li>
            <span className="legend-swatch" data-kind="body" /> <b>Body</b>: 50% chance of being body colored, 50% empty.
          </li>
          <li>
            <span className="legend-swatch" data-kind="accent" /> <b>Accent</b>: 50% accent, 50% body colored.
          </li>
          <li>
            <span className="legend-swatch" data-kind="fixed" /> <b>Fixed</b>: the cell is never randomized. A fixed empty
            cell also stops the outline from growing into it.
          </li>
        </ul>
        <p>
          Paint with the selected brush by clicking or dragging. Right-click a cell to toggle Fixed. With mirroring on,
          you only edit one half and the faded half follows. Click any sprite in the preview to download it.
        </p>
        <h3>Keyboard shortcuts</h3>
        <dl className="shortcuts">
          {SHORTCUTS.map(([keys, action]) => (
            <div key={keys}>
              <dt>
                <kbd>{keys}</kbd>
              </dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>
      </div>
    </dialog>
  );
};
