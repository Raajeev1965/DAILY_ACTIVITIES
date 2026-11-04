export const CATEGORIES = ["Work", "Health", "Ideas", "Personal"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Note {
  id: string;
  text: string;
  category: Category;
  createdAt: string; // ISO timestamp
  source: "text" | "voice";
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
}

export interface AppState {
  notes: Note[];
  habits: Habit[];
  /** dateKey (YYYY-MM-DD) -> ids of habits completed that day */
  completions: Record<string, string[]>;
}
