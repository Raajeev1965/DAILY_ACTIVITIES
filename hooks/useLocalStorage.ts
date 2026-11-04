"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hydration-safe localStorage state. Returns `null` until the stored value
 * (or the initial value) has loaded on the client.
 */
export function useLocalStorage<T>(key: string, init: () => T) {
  const [value, setValue] = useState<T | null>(null);
  const initRef = useRef(init);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      setValue(raw ? (JSON.parse(raw) as T) : initRef.current());
    } catch {
      setValue(initRef.current());
    }
  }, [key]);

  useEffect(() => {
    if (value === null) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable: keep working in memory */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
