import { useEffect, useRef, useState } from 'react';

/**
 * Läser ett värde från localStorage vid start och skriver tillbaka det när det ändras.
 * Auto-spara utan spara-knapp. Sväljer fel tyst (privat läge, full disk).
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const rått = localStorage.getItem(key);
      return rått ? (JSON.parse(rått) as T) : initial;
    } catch {
      return initial;
    }
  });

  // Undvik att skriva tillbaka exakt det vi just läste in.
  const förstaRenderingen = useRef(true);
  useEffect(() => {
    if (förstaRenderingen.current) {
      förstaRenderingen.current = false;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignorera — persistens är en bonus, inte ett krav
    }
  }, [key, value]);

  return [value, setValue];
}

/** Läser ett värde en gång (utan att prenumerera). Bra för att seeda historik. */
export function lasLocalStorage<T>(key: string, fallback: T): T {
  try {
    const rått = localStorage.getItem(key);
    return rått ? (JSON.parse(rått) as T) : fallback;
  } catch {
    return fallback;
  }
}
