"use client";

import { Mic, Trash2 } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { categoryStyle } from "@/lib/categories";
import { cn, formatTime } from "@/lib/utils";
import type { Note } from "@/lib/types";

export function NoteItem({ note, showDelete = true }: { note: Note; showDelete?: boolean }) {
  const { deleteNote } = useStore();
  return (
    <div className="group flex-1 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800">
      <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{note.text}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-ink-soft dark:text-zinc-400">
        <span className={cn("rounded-full px-2 py-0.5 font-semibold", categoryStyle[note.category].chip)}>#{note.category}</span>
        {note.source === "voice" && (
          <span className="inline-flex items-center gap-1">
            <Mic size={12} /> Dictated
          </span>
        )}
        {showDelete && (
          <button onClick={() => deleteNote(note.id)} aria-label="Delete note" className="ml-auto rounded-full p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export function Timeline({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-ink-soft dark:border-zinc-700 dark:text-zinc-400">
        Nothing logged yet today. Type a note above or tap the mic.
      </p>
    );
  }

  return (
    <ol aria-label="Today's timeline" className="relative space-y-4 before:absolute before:bottom-2 before:left-[4.35rem] before:top-2 before:w-px before:bg-zinc-300 dark:before:bg-zinc-700">
      {notes.map((n) => (
        <li key={n.id} className="flex items-start gap-3">
          <time dateTime={n.createdAt} className="w-12 shrink-0 pt-3.5 text-right text-xs font-semibold tabular-nums text-ink-soft dark:text-zinc-400">
            {formatTime(n.createdAt)}
          </time>
          <span className={cn("relative z-10 mt-4 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-paper dark:ring-ink-night", categoryStyle[n.category].dot)} />
          <NoteItem note={n} />
        </li>
      ))}
    </ol>
  );
}
