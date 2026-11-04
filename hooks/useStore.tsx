"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { createSeed } from "@/lib/seed";
import { dateKey, parseCategory, uid } from "@/lib/utils";
import type { AppState, Category, Note } from "@/lib/types";

interface Store {
  ready: boolean;
  state: AppState;
  addNote: (text: string, category: Category, source?: Note["source"]) => void;
  deleteNote: (id: string) => void;
  toggleHabit: (habitId: string, day?: string) => void;
  addHabit: (name: string, emoji?: string) => void;
  deleteHabit: (id: string) => void;
  resetDemo: () => void;
}

const empty: AppState = { notes: [], habits: [], completions: {} };
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<AppState>("dailylog:v1", createSeed);

  const store = useMemo<Store>(() => {
    const update = (fn: (s: AppState) => AppState) => setStored((s) => (s ? fn(s) : s));
    return {
      ready: stored !== null,
      state: stored ?? empty,
      addNote: (text, fallback, source = "text") => {
        const parsed = parseCategory(text, fallback);
        if (!parsed.text) return;
        const note: Note = { id: uid(), text: parsed.text, category: parsed.category, createdAt: new Date().toISOString(), source };
        update((s) => ({ ...s, notes: [note, ...s.notes] }));
      },
      deleteNote: (id) => update((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) })),
      toggleHabit: (habitId, day = dateKey()) =>
        update((s) => {
          const done = s.completions[day] ?? [];
          const next = done.includes(habitId) ? done.filter((id) => id !== habitId) : [...done, habitId];
          return { ...s, completions: { ...s.completions, [day]: next } };
        }),
      addHabit: (name, emoji = "✅") => {
        const trimmed = name.trim();
        if (!trimmed) return;
        update((s) => ({ ...s, habits: [...s.habits, { id: uid(), name: trimmed, emoji }] }));
      },
      deleteHabit: (id) => update((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) })),
      resetDemo: () => setStored(createSeed()),
    };
  }, [stored, setStored]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
