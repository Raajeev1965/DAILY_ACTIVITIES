"use client";

import { Flame, RotateCcw } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { CATEGORIES } from "@/lib/types";
import { categoryStyle } from "@/lib/categories";
import { cn, dateKey, lastNDays, streak } from "@/lib/utils";

export function Analytics() {
  const { state, resetDemo } = useStore();
  const days = lastNDays(7);
  const total = state.habits.length;

  const week = days.map((d) => {
    const k = dateKey(d);
    const done = (state.completions[k] ?? []).filter((id) => state.habits.some((h) => h.id === id)).length;
    return { k, label: d.toLocaleDateString([], { weekday: "narrow" }), pct: total ? done / total : 0, isToday: k === dateKey() };
  });
  const weekAvg = Math.round((week.reduce((a, d) => a + d.pct, 0) / week.length) * 100);

  const weekNotes = state.notes.filter((n) => new Date(n.createdAt) >= days[0] || dateKey(new Date(n.createdAt)) === dateKey(days[0]));
  const counts = CATEGORIES.map((c) => ({ c, n: weekNotes.filter((x) => x.category === c).length }));
  const maxCount = Math.max(1, ...counts.map((x) => x.n));
  const streaks = state.habits.map((h) => ({ h, s: streak(h.id, state.completions) })).sort((a, b) => b.s - a.s);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Stat value={`${weekAvg}%`} label="Habits done, 7-day average" />
        <Stat value={String(weekNotes.length)} label="Notes this week" />
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800">
        <h2 className="text-sm font-bold">Habit completion</h2>
        <div className="mt-4 flex h-28 items-end gap-2" role="img" aria-label="Habit completion for the last 7 days">
          {week.map((d) => (
            <div key={d.k} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-full w-full items-end rounded-md bg-zinc-100 dark:bg-zinc-800">
                <div className={cn("w-full rounded-md", d.isToday ? "bg-accent" : "bg-indigo-300 dark:bg-indigo-400/60")} style={{ height: `${Math.max(d.pct * 100, 4)}%` }} />
              </div>
              <span className={cn("text-xs font-semibold", d.isToday ? "text-accent dark:text-indigo-300" : "text-ink-soft dark:text-zinc-500")}>{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800">
        <h2 className="text-sm font-bold">Notes by category, last 7 days</h2>
        <ul className="mt-3 space-y-2.5">
          {counts.map(({ c, n }) => (
            <li key={c} className="flex items-center gap-3 text-sm">
              <span className="w-16 font-semibold">#{c}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className={cn("h-full rounded-full", categoryStyle[c].bar)} style={{ width: `${(n / maxCount) * 100}%` }} />
              </div>
              <span className="w-5 text-right tabular-nums text-ink-soft dark:text-zinc-400">{n}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800">
        <h2 className="text-sm font-bold">Streaks</h2>
        <ul className="mt-3 space-y-2">
          {streaks.map(({ h, s }) => (
            <li key={h.id} className="flex items-center gap-2 text-sm">
              <span aria-hidden>{h.emoji}</span>
              <span className="flex-1 font-medium">{h.name}</span>
              <span className={cn("inline-flex items-center gap-1 font-bold tabular-nums", s > 0 ? "text-orange-500" : "text-zinc-400")}>
                <Flame size={14} /> {s} {s === 1 ? "day" : "days"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <button
        onClick={() => {
          if (window.confirm("Replace all your data with the sample data?")) resetDemo();
        }}
        className="mx-auto flex items-center gap-2 text-xs font-semibold text-ink-soft dark:text-zinc-500"
      >
        <RotateCcw size={14} /> Reset to sample data
      </button>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800">
      <p className="text-3xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-ink-soft dark:text-zinc-400">{label}</p>
    </div>
  );
}
