export const CATEGORIES = ["Work", "Health", "Ideas", "Personal"] as const;
export type Category = (typeof CATEGORIES)[number];

export const HEADS = ["Grocery", "Communication", "Bills", "Fuel", "Health", "Miscellaneous"] as const;
export type Head = (typeof HEADS)[number];

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

export interface Transaction {
  id: string;
  type: "expense" | "income";
  amount: number;
  head: Head | null; // null for income
  note: string;
  createdAt: string; // ISO timestamp
  source: "text" | "voice";
}

export interface AppState {
  notes: Note[];
  habits: Habit[];
  /** dateKey (YYYY-MM-DD) -> ids of habits completed that day */
  completions: Record<string, string[]>;
  transactions: Transaction[];
  /** Money in the wallet before the first recorded transaction */
  startingBalance: number;
}
