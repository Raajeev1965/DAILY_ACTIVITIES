"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { CATEGORIES, type Category } from "@/lib/types";
import { categoryStyle } from "@/lib/categories";
import { cn, dateKey, formatDay } from "@/lib/utils";
import { NoteItem } from "./Timeline";

export function SearchArchive() {
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Category | null>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = state.notes
      .filter((n) => (!filter || n.category === filter) && (!q || n.text.toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const map = new Map<string, typeof matches>();
    for (const n of matches) {
      const k = dateKey(new Date(n.createdAt));
      map.set(k, [...(map.get(k) ?? []), n]);
    }
    return Array.from(map.entries());
  }, [state.notes, query, filter]);

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800">
        <Search size={18} className="text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all notes"
          aria-label="Search notes"
          className="w-full bg-transparent text-base placeholder:text-zinc-400 focus:outline-none"
        />
      </label>

      <div className="flex gap-1.5 overflow-x-auto">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            aria-pressed={filter === c}
            onClick={() => setFilter(filter === c ? null : c)}
            className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-opacity", categoryStyle[c].chip, filter && filter !== c && "opacity-40")}
          >
            #{c}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft dark:text-zinc-400">No notes match. Try a different word or clear the filter.</p>
      ) : (
        groups.map(([day, notes]) => (
          <section key={day} aria-label={formatDay(day)} className="space-y-2">
            <h2 className="text-sm font-bold text-ink-soft dark:text-zinc-400">{formatDay(day)}</h2>
            {notes.map((n) => (
              <NoteItem key={n.id} note={n} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
