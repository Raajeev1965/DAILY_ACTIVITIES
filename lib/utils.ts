import type { Category } from "./types";
import { CATEGORIES } from "./types";

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Oldest first, ending today. */
export function lastNDays(n: number): Date[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
}

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function formatDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = dateKey();
  if (key === today) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === dateKey(yesterday)) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

/** Pulls a #Category tag out of the text. Falls back to the given category. */
export function parseCategory(text: string, fallback: Category): { text: string; category: Category } {
  const match = text.match(/(^|\s)#(work|health|ideas|personal)\b/i);
  if (!match) return { text: text.trim(), category: fallback };
  const category = CATEGORIES.find((c) => c.toLowerCase() === match[2].toLowerCase()) ?? fallback;
  const cleaned = text.replace(match[0], match[1]).replace(/\s{2,}/g, " ").trim();
  return { text: cleaned || text.trim(), category };
}

/** Consecutive days a habit was completed, counting back from today (or yesterday if today is still open). */
export function streak(habitId: string, completions: Record<string, string[]>): number {
  const d = new Date();
  if (!completions[dateKey(d)]?.includes(habitId)) d.setDate(d.getDate() - 1);
  let count = 0;
  while (completions[dateKey(d)]?.includes(habitId)) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
