import type { AppState, Category, Head, Transaction } from "./types";
import { dateKey, uid } from "./utils";

function at(daysAgo: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Sample data so the app looks populated on first launch. */
export function createSeed(): AppState {
  const habits = [
    { id: "h-water", name: "Drink 2L water", emoji: "💧" },
    { id: "h-move", name: "Move for 30 min", emoji: "🏃" },
    { id: "h-read", name: "Read 20 pages", emoji: "📖" },
    { id: "h-calm", name: "Meditate", emoji: "🧘" },
    { id: "h-plan", name: "Plan tomorrow", emoji: "🗓️" },
  ];

  const n = (daysAgo: number, h: number, m: number, category: Category, text: string, source: "text" | "voice" = "text") => ({
    id: uid(),
    text,
    category,
    createdAt: at(daysAgo, h, m),
    source,
  });

  const notes = [
    n(0, 7, 45, "Health", "Woke up early, 10 min stretch before coffee"),
    n(0, 9, 30, "Work", "Standup done. Ship the onboarding fix before lunch"),
    n(0, 11, 10, "Ideas", "What if the weekly summary were a shareable card?", "voice"),
    n(1, 8, 15, "Personal", "Called mom, planning a visit next month"),
    n(1, 13, 5, "Work", "Reviewed two PRs and wrote the release notes"),
    n(1, 19, 40, "Health", "Evening run, 5 km, felt strong"),
    n(2, 10, 20, "Ideas", "Habit stacking: read right after the morning coffee", "voice"),
    n(2, 16, 50, "Work", "Planning session for next sprint went well"),
    n(3, 12, 0, "Personal", "Booked dentist appointment for Friday"),
  ];

  const pattern: string[][] = [
    ["h-water", "h-move", "h-read", "h-calm", "h-plan"],
    ["h-water", "h-read", "h-calm"],
    ["h-water", "h-move", "h-read", "h-plan"],
    ["h-water", "h-move", "h-calm", "h-plan"],
    ["h-water", "h-move", "h-read", "h-calm"],
    ["h-water", "h-read", "h-calm", "h-plan"],
    ["h-water", "h-calm"],
  ];
  const completions: Record<string, string[]> = {};
  pattern.forEach((ids, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    completions[dateKey(d)] = ids;
  });

  const ex = (daysAgo: number, h: number, m: number, head: Head, amount: number, note: string, source: "text" | "voice" = "voice"): Transaction => ({
    id: uid(), type: "expense", amount, head, note, createdAt: at(daysAgo, h, m), source,
  });
  const inc = (daysAgo: number, h: number, m: number, amount: number, note: string): Transaction => ({
    id: uid(), type: "income", amount, head: null, note, createdAt: at(daysAgo, h, m), source: "text",
  });

  const transactions: Transaction[] = [
    inc(12, 10, 0, 30000, "Salary received"),
    ex(6, 18, 10, "Grocery", 640, "Vegetables and fruits"),
    ex(6, 19, 30, "Fuel", 500, "Petrol"),
    ex(5, 9, 15, "Communication", 299, "Mobile recharge"),
    ex(4, 11, 40, "Health", 420, "Pharmacy medicines"),
    ex(4, 17, 5, "Grocery", 380, "Milk and bread"),
    ex(3, 10, 30, "Bills", 1850, "Electricity bill"),
    inc(3, 15, 0, 2500, "Freelance payment received"),
    ex(2, 8, 50, "Fuel", 600, "Petrol"),
    ex(2, 13, 20, "Miscellaneous", 150, "Parking and tea"),
    ex(1, 18, 0, "Grocery", 520, "Weekly groceries"),
    ex(0, 8, 5, "Grocery", 85, "Milk"),
  ];

  return { notes, habits, completions, transactions, startingBalance: 12000 };
}
