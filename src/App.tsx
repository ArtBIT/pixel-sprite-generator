import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BUILTIN_TEMPLATES } from "./generator/builtinTemplates";
import { ACCENT, BODY, EMPTY, materializeMirror, resizeCells, shiftCells, type Brush } from "./generator/cells";
import { generateSprites } from "./generator/generator";
import { loadUserTemplates, storeUserTemplates } from "./generator/templateStore";
import type { Template } from "./generator/types";
import { useHistory } from "./hooks/useHistory";
import { randomSeed } from "./lib/random";
import { downloadCanvas, renderSheet, type SheetOptions } from "./render/sheet";
import {
  LIMITS,
  applyTemplate,
  decodeShareHash,
  defaultState,
  differsFromTemplate,
  encodeShareHash,
  loadSession,
  storeSession,
  toPalette,
  toShape,
  toTemplate,
  type AppState,
} from "./state";
import { ColorField, IconButton, Section, SliderField, Stepper, Toggle } from "./components/fields";
import { HelpDialog } from "./components/HelpDialog";
import { Icon } from "./components/Icon";
import { PixelEditor } from "./components/PixelEditor";
import { Preview } from "./components/Preview";
import { TemplatePicker } from "./components/TemplatePicker";
import { Toast } from "./components/Toast";

const initialState = () => decodeShareHash(window.location.hash) ?? loadSession() ?? defaultState();

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

const fileSafe = (text: string) => text.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "sprite";

export const App = () => {
  const { state, update, undo, redo, canUndo, canRedo } = useHistory<AppState>(initialState);
  const [userTemplates, setUserTemplates] = useState<Record<string, Template>>(loadUserTemplates);
  const [brush, setBrush] = useState<Brush>(BODY);
  const [lock, setLock] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sheetSize, setSheetSize] = useState({ cols: 8, rows: 8 });
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  /** Updates a single field; repeated changes to the same field (e.g. dragging a slider) are one undo step. */
  const set = useCallback(
    <K extends keyof AppState>(key: K, value: AppState[K]) =>
      update((s) => (Object.is(s[key], value) ? s : { ...s, [key]: value }), `field:${key}`),
    [update],
  );

  // Remember the session, and drop a consumed share link from the address bar.
  useEffect(() => {
    const timer = window.setTimeout(() => storeSession(state), 300);
    return () => window.clearTimeout(timer);
  }, [state]);
  useEffect(() => {
    if (window.location.hash.startsWith("#s=")) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const allTemplates = useMemo(() => ({ ...BUILTIN_TEMPLATES, ...userTemplates }), [userTemplates]);
  const currentTemplate = state.templateName !== null ? allTemplates[state.templateName] : undefined;
  const modified = !!currentTemplate && differsFromTemplate(state, currentTemplate);

  const shape = useMemo(
    () => toShape(state),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.cols, state.rows, state.pixels, state.mirrorX, state.mirrorY, state.outline],
  );
  const sheetOptions = useMemo<SheetOptions>(
    () => ({
      pixelSize: state.zoom,
      padding: state.padding,
      background: state.backgroundEnabled ? state.backgroundColor : null,
      palette: toPalette(state),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.zoom, state.padding, state.backgroundEnabled, state.backgroundColor, state.foregroundColor, state.detailsColor, state.outlineColor],
  );

  const selectTemplate = (name: string) => {
    const template = allTemplates[name];
    if (template) update((s) => applyTemplate(s, name, template));
  };

  const saveTemplate = (name: string) => {
    if (!name) return "Please enter a name.";
    if (BUILTIN_TEMPLATES[name]) return "That name belongs to a built-in template.";
    if (userTemplates[name] && name !== state.templateName && !confirm(`Replace the template "${name}"?`)) {
      return "Choose another name.";
    }
    const next = { ...userTemplates, [name]: toTemplate(state) };
    setUserTemplates(next);
    storeUserTemplates(next);
    update((s) => ({ ...s, templateName: name }));
    notify(`Saved "${name}"`);
    return null;
  };

  const deleteTemplate = (name: string) => {
    const next = { ...userTemplates };
    delete next[name];
    setUserTemplates(next);
    storeUserTemplates(next);
    update((s) => ({ ...s, templateName: null }));
    notify(`Deleted "${name}"`);
  };

  const resize = (cols: number, rows: number) =>
    update(
      (s) => ({
        ...s,
        cols,
        rows,
        pixels: resizeCells(s.pixels, s.cols, s.rows, cols, rows, s.mirrorX, s.mirrorY),
      }),
      "resize",
    );

  const setMirror = (axis: "mirrorX" | "mirrorY", on: boolean) =>
    update((s) => ({
      ...s,
      [axis]: on,
      // when turning mirroring off, keep the mirrored half that was visible
      pixels: on ? s.pixels : materializeMirror(s.pixels, s.cols, s.rows, s.mirrorX, s.mirrorY),
    }));

  const shift = (dx: number, dy: number) =>
    update((s) => ({ ...s, pixels: shiftCells(s.pixels, s.cols, s.rows, dx, dy) }), "shift");

  const clearGrid = () => update((s) => ({ ...s, pixels: new Array(s.cols * s.rows).fill(0) }));

  const newSeed = useCallback(() => update((s) => ({ ...s, seed: randomSeed() })), [update]);

  const baseName = fileSafe(`${state.templateName ?? "sprites"}-${state.seed}`);

  const downloadSheet = useCallback(async () => {
    const { cols, rows } = sheetSize;
    const sprites = generateSprites(shape, state.seed, cols * rows);
    await downloadCanvas(renderSheet(sprites, cols, rows, sheetOptions), `${baseName}-sheet.png`);
    notify(`Downloaded a ${cols}×${rows} sprite sheet`);
  }, [sheetSize, shape, state.seed, sheetOptions, baseName, notify]);

  const downloadSprite = async (index: number) => {
    const sprite = generateSprites(shape, state.seed, index + 1)[index];
    await downloadCanvas(renderSheet([sprite], 1, 1, sheetOptions), `${baseName}-${index + 1}.png`);
    notify(`Downloaded sprite #${index + 1}`);
  };

  const copyLink = async () => {
    const url = window.location.href.split("#")[0] + encodeShareHash(state);
    try {
      await navigator.clipboard.writeText(url);
      notify("Link copied to clipboard");
    } catch {
      prompt("Copy this link:", url);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (helpOpen || isTyping(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && key === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (mod || e.altKey) return;
      const actions: Record<string, () => void> = {
        r: newSeed,
        " ": newSeed,
        "1": () => setBrush(EMPTY),
        "2": () => setBrush(BODY),
        "3": () => setBrush(ACCENT),
        l: () => setLock((v) => !v),
        s: downloadSheet,
        "?": () => setHelpOpen(true),
      };
      const action = actions[key];
      if (action) {
        e.preventDefault();
        action();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [helpOpen, undo, redo, newSeed, downloadSheet]);

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="logo">
          <span className="logo-mark" aria-hidden="true" />
          Pixel Sprite Generator
        </h1>
        <div className="topbar-actions">
          <IconButton icon="undo" label="Undo" shortcut="Ctrl+Z" disabled={!canUndo} onClick={undo} />
          <IconButton icon="redo" label="Redo" shortcut="Ctrl+Shift+Z" disabled={!canRedo} onClick={redo} />
          <IconButton icon="help" label="Help" shortcut="?" onClick={() => setHelpOpen(true)} />
          <a className="icon-button" href="https://github.com/ArtBIT/pixel-sprite-generator" title="Source on GitHub" aria-label="Source on GitHub">
            <Icon name="github" />
          </a>
          <a className="coffee" href="https://www.buymeacoffee.com/artbit" target="_blank" rel="noopener">
            <Icon name="coffee" size={16} />
            <span>Buy me a coffee</span>
          </a>
        </div>
      </header>

      <aside className="sidebar">
        <Section title="Template">
          <TemplatePicker
            templateName={state.templateName}
            modified={modified}
            builtinNames={Object.keys(BUILTIN_TEMPLATES)}
            userNames={Object.keys(userTemplates)}
            onSelect={selectTemplate}
            onSave={saveTemplate}
            onDelete={deleteTemplate}
          />
        </Section>

        <Section
          title="Draw"
          actions={
            <>
              <IconButton icon="left" label="Move left" disabled={state.mirrorX} onClick={() => shift(-1, 0)} />
              <IconButton icon="right" label="Move right" disabled={state.mirrorX} onClick={() => shift(1, 0)} />
              <IconButton icon="up" label="Move up" disabled={state.mirrorY} onClick={() => shift(0, -1)} />
              <IconButton icon="down" label="Move down" disabled={state.mirrorY} onClick={() => shift(0, 1)} />
              <IconButton icon="clear" label="Clear grid" onClick={clearGrid} />
            </>
          }
        >
          <PixelEditor
            cols={state.cols}
            rows={state.rows}
            pixels={state.pixels}
            mirrorX={state.mirrorX}
            mirrorY={state.mirrorY}
            foregroundColor={state.foregroundColor}
            detailsColor={state.detailsColor}
            backgroundColor={state.backgroundEnabled ? state.backgroundColor : null}
            brush={brush}
            lock={lock}
            onBrushChange={setBrush}
            onLockChange={setLock}
            onChange={(pixels, key) => update((s) => ({ ...s, pixels }), key)}
          />
          <div className="field-row">
            <Stepper label="Width" value={state.cols} {...LIMITS.cols} onChange={(cols) => resize(cols, state.rows)} />
            <Stepper label="Height" value={state.rows} {...LIMITS.rows} onChange={(rows) => resize(state.cols, rows)} />
          </div>
          <div className="field-row">
            <Toggle label="Mirror X" title="Left half is mirrored to the right" checked={state.mirrorX} onChange={(on) => setMirror("mirrorX", on)} />
            <Toggle label="Mirror Y" title="Top half is mirrored to the bottom" checked={state.mirrorY} onChange={(on) => setMirror("mirrorY", on)} />
          </div>
        </Section>

        <Section title="Colors">
          <div className="color-grid">
            <ColorField label="Body" value={state.foregroundColor} onChange={(v) => set("foregroundColor", v)} />
            <ColorField label="Accent" value={state.detailsColor} onChange={(v) => set("detailsColor", v)} />
            <div className="color-with-toggle">
              <Toggle label="Outline" checked={state.outline} onChange={(v) => set("outline", v)} />
              <ColorField label="Outline" value={state.outlineColor} disabled={!state.outline} onChange={(v) => set("outlineColor", v)} />
            </div>
            <div className="color-with-toggle">
              <Toggle label="Background" checked={state.backgroundEnabled} onChange={(v) => set("backgroundEnabled", v)} />
              <ColorField
                label="Background"
                value={state.backgroundColor}
                disabled={!state.backgroundEnabled}
                onChange={(v) => set("backgroundColor", v)}
              />
            </div>
          </div>
        </Section>
      </aside>

      <main className="stage">
        <div className="toolbar">
          <div className="seed-field">
            <label htmlFor="seed">Seed</label>
            <input id="seed" value={state.seed} maxLength={64} spellCheck={false} onChange={(e) => set("seed", e.target.value)} />
            <button type="button" className="button primary" title="New random seed (R)" onClick={newSeed}>
              <Icon name="dice" /> Randomize
            </button>
          </div>
          <SliderField label="Zoom" unit="×" value={state.zoom} {...LIMITS.zoom} onChange={(v) => set("zoom", v)} />
          <SliderField label="Padding" unit="px" value={state.padding} {...LIMITS.padding} onChange={(v) => set("padding", v)} />
          <div className="export">
            <Stepper label="Sheet columns" value={sheetSize.cols} {...LIMITS.sheet} onChange={(cols) => setSheetSize((s) => ({ ...s, cols }))} />
            <Stepper label="Sheet rows" value={sheetSize.rows} {...LIMITS.sheet} onChange={(rows) => setSheetSize((s) => ({ ...s, rows }))} />
            <button type="button" className="button primary" title="Download sprite sheet (S)" onClick={downloadSheet}>
              <Icon name="download" /> PNG
            </button>
            <button type="button" className="button" title="Copy a link to this exact setup" onClick={copyLink}>
              <Icon name="link" /> Share
            </button>
          </div>
        </div>
        <div className={`preview-frame${state.backgroundEnabled ? "" : " is-transparent"}`}>
          <Preview shape={shape} seed={state.seed} options={sheetOptions} onSpriteClick={downloadSprite} />
        </div>
      </main>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <Toast message={toast} />
    </div>
  );
};
