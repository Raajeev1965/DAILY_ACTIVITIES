"use client";

import { useState } from "react";
import { Check, Flame, Plus, X } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { cn, dateKey, streak } from "@/lib/utils";

export function HabitList() {
  const { state, toggleHabit, addHabit, deleteHabit } = useStore();
  const [name, setName] = useState("");
  const today = dateKey();
  const done = state.completions[today] ?? [];
  const total = state.habits.length;
  const pct = total ? Math.round((done.filter((id) => state.habits.some((h) => h.id === id)).length / total) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-ink p-4 text-white dark:bg-ink-raised">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-zinc-300">Today's progress</p>
          <p className="text-2xl font-extrabold tabular-nums">{pct}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ul className="space-y-2">
        {state.habits.map((h) => {
          const checked = done.includes(h.id);
          const s = streak(h.id, state.completions);
          return (
            <li key={h.id} className="flex items-center gap-1 rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800">
              <button
                onClick={() => toggleHabit(h.id)}
                role="checkbox"
                aria-checked={checked}
                className="flex flex-1 items-center gap-3 p-3.5 text-left"
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    checked ? "border-accent bg-accent text-white" : "border-zinc-300 dark:border-zinc-600"
                  )}
                >
                  {checked && <Check size={16} strokeWidth={3} />}
                </span>
                <span className="text-lg" aria-hidden>{h.emoji}</span>
                <span className={cn("flex-1 text-[15px] font-semibold", checked && "text-zinc-400 line-through dark:text-zinc-500")}>{h.name}</span>
                {s > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-500">
                    <Flame size={14} /> {s}
                  </span>
                )}
              </button>
              <button onClick={() => deleteHabit(h.id)} aria-label={`Remove ${h.name}`} className="mr-2 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X size={16} />
              </button>
            </li>
          );
        })}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addHabit(name);
          setName("");
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New habit, e.g. Stretch for 5 min"
          aria-label="New habit name"
          className="min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 text-sm ring-1 ring-zinc-200 placeholder:text-zinc-400 dark:bg-ink-raised dark:ring-zinc-800"
        />
        <button type="submit" disabled={!name.trim()} aria-label="Add habit" className="grid h-10 w-10 place-items-center rounded-full bg-accent text-white disabled:opacity-35">
          <Plus size={20} />
        </button>
      </form>
    </div>
  );
}
