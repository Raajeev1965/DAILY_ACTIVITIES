"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { HEADS } from "@/lib/types";
import { headMeta, periodRange, summarize, type Period } from "@/lib/wallet";
import { formatMoney } from "@/lib/money";
import { cn, dateKey, formatDay } from "@/lib/utils";
import { WalletEntry } from "./WalletEntry";
import { TransactionRow } from "./TransactionRow";

const periods: { id: Period; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

const card = "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800";

export function Wallet() {
  const { state, setStartingBalance } = useStore();
  const [period, setPeriod] = useState<Period>("day");
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const range = useMemo(() => periodRange(period, offset), [period, offset]);
  const sum = useMemo(() => summarize(state.transactions, state.startingBalance, range.start, range.end), [state.transactions, state.startingBalance, range]);
  const today = useMemo(() => {
    const r = periodRange("day", 0);
    return summarize(state.transactions, state.startingBalance, r.start, r.end);
  }, [state.transactions, state.startingBalance]);

  const inRange = useMemo(
    () =>
      state.transactions
        .filter((t) => {
          const at = new Date(t.createdAt).getTime();
          return at >= range.start.getTime() && at < range.end.getTime();
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.transactions, range]
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof inRange>();
    for (const t of inRange) {
      const k = dateKey(new Date(t.createdAt));
      map.set(k, [...(map.get(k) ?? []), t]);
    }
    return Array.from(map.entries());
  }, [inRange]);

  const balanceNow = today.closing;
  const rows = HEADS.map((h) => ({ h, amount: sum.byHead[h] })).sort((a, b) => b.amount - a.amount);
  const maxHead = Math.max(1, ...rows.map((r) => r.amount));

  const changePeriod = (p: Period) => {
    setPeriod(p);
    setOffset(0);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-ink p-4 text-white dark:bg-ink-raised">
        <p className="text-sm font-semibold text-zinc-300">Balance now</p>
        <p className={cn("mt-1 text-3xl font-extrabold tabular-nums", balanceNow < 0 && "text-red-300")}>{formatMoney(balanceNow)}</p>
        <p className="mt-2 text-xs text-zinc-300">
          Today: spent {formatMoney(today.expense)}
          {today.income > 0 && ` · received ${formatMoney(today.income)}`}
        </p>
      </div>

      <WalletEntry />

      <div className="space-y-3">
        <div className="flex rounded-full bg-zinc-200/70 p-1 text-sm font-semibold dark:bg-zinc-800" role="tablist" aria-label="Period">
          {periods.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={period === p.id}
              onClick={() => changePeriod(p.id)}
              className={cn("flex-1 rounded-full py-1.5 transition-colors", period === p.id && "bg-white shadow-sm dark:bg-zinc-600")}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button onClick={() => setOffset(offset - 1)} aria-label="Previous period" className="rounded-full p-2 hover:bg-zinc-200/70 dark:hover:bg-zinc-800">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-bold">{range.label}</p>
            {range.sub && <p className="text-xs text-ink-soft dark:text-zinc-400">{range.sub}</p>}
          </div>
          <button
            onClick={() => setOffset(offset + 1)}
            disabled={offset >= 0}
            aria-label="Next period"
            className="rounded-full p-2 hover:bg-zinc-200/70 disabled:opacity-30 dark:hover:bg-zinc-800"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <section className={card} aria-label="Period summary">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          <Figure label="Opening balance" value={formatMoney(sum.opening)} />
          <Figure label="Closing balance" value={formatMoney(sum.closing)} strong negative={sum.closing < 0} />
          <Figure label="Income" value={`+${formatMoney(sum.income)}`} tone="text-emerald-600 dark:text-emerald-400" />
          <Figure label="Expenses" value={`−${formatMoney(sum.expense)}`} />
        </dl>
      </section>

      <section className={card} aria-label="Expenses by head">
        <h2 className="text-sm font-bold">Where it went</h2>
        <ul className="mt-3 space-y-3">
          {rows.map(({ h, amount }) => {
            const { Icon, tile, bar } = headMeta[h];
            return (
              <li key={h} className={cn("flex items-center gap-3", amount === 0 && "opacity-45")}>
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tile)}>
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{h}</span>
                    <span className="tabular-nums">{formatMoney(amount)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className={cn("h-full rounded-full", bar)} style={{ width: `${(amount / maxHead) * 100}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Entries" className="space-y-2">
        <h2 className="text-sm font-bold text-ink-soft dark:text-zinc-400">Entries ({inRange.length})</h2>
        {inRange.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-ink-soft dark:border-zinc-700 dark:text-zinc-400">
            Nothing recorded for this period. Tap the mic and say what you spent.
          </p>
        ) : period === "day" ? (
          <ul className="space-y-2">{inRange.map((t) => <TransactionRow key={t.id} tx={t} />)}</ul>
        ) : (
          groups.map(([day, txs]) => (
            <div key={day} className="space-y-2">
              <h3 className="pt-2 text-xs font-bold text-ink-soft dark:text-zinc-400">{formatDay(day)}</h3>
              <ul className="space-y-2">{txs.map((t) => <TransactionRow key={t.id} tx={t} />)}</ul>
            </div>
          ))
        )}
      </section>

      <div className="flex items-center justify-center gap-2 pt-1 text-xs text-ink-soft dark:text-zinc-400">
        {editing ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = parseFloat(draft.replace(/,/g, ""));
              if (!Number.isNaN(v)) setStartingBalance(v);
              setEditing(false);
            }}
          >
            <input
              autoFocus
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Starting balance"
              placeholder="0"
              className="w-28 rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800"
            />
            <button type="submit" className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white">
              Save
            </button>
          </form>
        ) : (
          <button
            onClick={() => {
              setDraft(String(state.startingBalance));
              setEditing(true);
            }}
            className="inline-flex items-center gap-1.5 font-semibold"
          >
            <Pencil size={13} /> Starting balance: {formatMoney(state.startingBalance)}
          </button>
        )}
      </div>
    </div>
  );
}

function Figure({ label, value, strong, negative, tone }: { label: string; value: string; strong?: boolean; negative?: boolean; tone?: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-soft dark:text-zinc-400">{label}</dt>
      <dd className={cn("mt-0.5 tabular-nums", strong ? "text-xl font-extrabold" : "text-lg font-bold", negative && "text-red-600 dark:text-red-400", tone)}>{value}</dd>
    </div>
  );
}
