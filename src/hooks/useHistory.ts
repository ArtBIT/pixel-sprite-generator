import { useCallback, useState } from "react";

const MAX_HISTORY = 100;

interface History<T> {
  past: T[];
  present: T;
  future: T[];
  /** Consecutive updates with the same key are merged into a single undo step. */
  lastKey: string | null;
}

export const useHistory = <T,>(initial: () => T) => {
  const [history, setHistory] = useState<History<T>>(() => ({
    past: [],
    present: initial(),
    future: [],
    lastKey: null,
  }));

  const update = useCallback((updater: (state: T) => T, key?: string) => {
    setHistory((h) => {
      const next = updater(h.present);
      if (next === h.present) return h;
      if (key && key === h.lastKey) return { ...h, present: next, future: [] };
      return {
        past: [...h.past, h.present].slice(-MAX_HISTORY),
        present: next,
        future: [],
        lastKey: key ?? null,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) =>
      h.past.length
        ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future], lastKey: null }
        : h,
    );
  }, []);

  const redo = useCallback(() => {
    setHistory((h) =>
      h.future.length
        ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1), lastKey: null }
        : h,
    );
  }, []);

  return {
    state: history.present,
    update,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
};
