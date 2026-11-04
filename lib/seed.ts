import type { AppState, Category } from "./types";
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

  // Deterministic-looking history for the past week; today is partly done.
  const pattern: string[][] = [
    ["h-water", "h-move", "h-read", "h-calm", "h-plan"], // 6 days ago
    ["h-water", "h-read", "h-calm"],
    ["h-water", "h-move", "h-read", "h-plan"],
    ["h-water", "h-move", "h-calm", "h-plan"],
    ["h-water", "h-move", "h-read", "h-calm"],
    ["h-water", "h-read", "h-calm", "h-plan"], // yesterday
    ["h-water", "h-calm"], // today
  ];
  const completions: Record<string, string[]> = {};
  pattern.forEach((ids, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    completions[dateKey(d)] = ids;
  });

  return { notes, habits, completions };
}
