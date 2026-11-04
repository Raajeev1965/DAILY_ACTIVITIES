"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { HEADS, type Transaction } from "@/lib/types";
import { headMeta, incomeMeta } from "@/lib/wallet";
import { formatMoney } from "@/lib/money";
import { cn, formatTime } from "@/lib/utils";

export function TransactionRow({ tx }: { tx: Transaction }) {
  const { deleteTransaction, setTransactionHead } = useStore();
  const [open, setOpen] = useState(false);
  const income = tx.type === "income";
  const head = tx.head ?? "Miscellaneous";
  const { Icon, tile } = income ? incomeMeta : headMeta[head];

  return (
    <li className="rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 p-3 text-left">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tile)}>
          <Icon size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{tx.note}</span>
          <span className="block text-xs text-ink-soft dark:text-zinc-400">
            {income ? "Income" : head} · {formatTime(tx.createdAt)}
          </span>
        </span>
        <span className={cn("text-[15px] font-bold tabular-nums", income ? "text-emerald-600 dark:text-emerald-400" : "")}>
          {income ? "+" : "−"}
          {formatMoney(tx.amount)}
        </span>
      </button>

      {open && (
        <div className="flex items-end justify-between gap-3 border-t border-zinc-100 px-3 pb-3 pt-3 dark:border-zinc-800">
          {income ? (
            <span className="text-xs text-ink-soft dark:text-zinc-400">Income entry</span>
          ) : (
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Change head">
              {HEADS.map((h) => {
                const m = headMeta[h];
                return (
                  <button
                    key={h}
                    role="radio"
                    aria-checked={head === h}
                    onClick={() => setTransactionHead(tx.id, h)}
                    className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity", m.tile, head !== h && "opacity-40")}
                  >
                    <m.Icon size={13} /> {h}
                  </button>
                );
              })}
            </div>
          )}
          <button onClick={() => deleteTransaction(tx.id)} aria-label="Delete entry" className="shrink-0 rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </li>
  );
}
