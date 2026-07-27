import { useCallback, useRef, useState } from 'react';

interface UndoableApi<T> {
  state: T;
  /** Sätt nytt värde och lägg det på historiken. Accepterar värde eller uppdaterare. */
  set: (next: T | ((prev: T) => T)) => void;
  /** Ersätt nuvarande värde UTAN att skapa ett nytt historiksteg (för kontinuerliga drag/reglage). */
  replace: (next: T | ((prev: T) => T)) => void;
  /** Nollställ historiken till ett värde (t.ex. vid öppna JSON). */
  reset: (value: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Ångra/gör om med en historik-stack. Behåller minst `limit` steg (default 50, spec kräver ≥10).
 * `replace` används för snabba kontinuerliga ändringar (reglage) så att historiken inte fylls.
 */
export function useUndoable<T>(initial: T, limit = 50): UndoableApi<T> {
  const [history, setHistory] = useState<T[]>([initial]);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  indexRef.current = index;
  const historyRef = useRef(history);
  historyRef.current = history;

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const cur = historyRef.current[indexRef.current];
      const value = typeof next === 'function' ? (next as (p: T) => T)(cur) : next;
      if (Object.is(value, cur)) return;
      // klipp bort ev. "framtid" och lägg till det nya värdet
      const trimmed = historyRef.current.slice(0, indexRef.current + 1);
      trimmed.push(value);
      // håll längden inom limit
      const overflow = trimmed.length - (limit + 1);
      const kept = overflow > 0 ? trimmed.slice(overflow) : trimmed;
      setHistory(kept);
      setIndex(kept.length - 1);
    },
    [limit]
  );

  const replace = useCallback((next: T | ((prev: T) => T)) => {
    setHistory((h) => {
      const i = indexRef.current;
      const cur = h[i];
      const value = typeof next === 'function' ? (next as (p: T) => T)(cur) : next;
      const copy = [...h];
      copy[i] = value;
      return copy;
    });
  }, []);

  const reset = useCallback((value: T) => {
    setHistory([value]);
    setIndex(0);
  }, []);

  const undo = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex((i) => Math.min(historyRef.current.length - 1, i + 1));
  }, []);

  return {
    state: history[index],
    set,
    replace,
    reset,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
}
