"use client";

import { BarChart3, CheckCircle2, NotebookPen, Search, Wallet as WalletIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "today" | "habits" | "wallet" | "search" | "stats";

const items = [
  { id: "today", label: "Today", Icon: NotebookPen },
  { id: "habits", label: "Habits", Icon: CheckCircle2 },
  { id: "wallet", label: "Wallet", Icon: WalletIcon },
  { id: "search", label: "Archive", Icon: Search },
  { id: "stats", label: "Summary", Icon: BarChart3 },
] as const;

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      aria-label="Primary"
      className="pb-safe shrink-0 border-t border-zinc-200 bg-white px-1 pt-2 dark:border-zinc-800 dark:bg-ink-night"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <li key={id}>
              <button
                onClick={() => onChange(id)}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-colors",
                  on ? "text-accent dark:text-indigo-300" : "text-ink-soft dark:text-zinc-500"
                )}
              >
                <span className={cn("rounded-full px-3.5 py-1 transition-colors", on && "bg-accent-soft dark:bg-indigo-500/15")}>
                  <Icon size={20} strokeWidth={on ? 2.5 : 2} />
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
