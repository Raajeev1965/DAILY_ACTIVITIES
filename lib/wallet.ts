import { Banknote, Fuel, HeartPulse, Package, Receipt, ShoppingBasket, Smartphone, type LucideIcon } from "lucide-react";
import { HEADS, type Head, type Transaction } from "./types";

export const headMeta: Record<Head, { Icon: LucideIcon; tile: string; bar: string }> = {
  Grocery: { Icon: ShoppingBasket, tile: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", bar: "bg-emerald-500" },
  Communication: { Icon: Smartphone, tile: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300", bar: "bg-sky-500" },
  Bills: { Icon: Receipt, tile: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", bar: "bg-amber-500" },
  Fuel: { Icon: Fuel, tile: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300", bar: "bg-orange-500" },
  Health: { Icon: HeartPulse, tile: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", bar: "bg-rose-500" },
  Miscellaneous: { Icon: Package, tile: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300", bar: "bg-zinc-500" },
};

export const incomeMeta = { Icon: Banknote, tile: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300" };

export type Period = "day" | "week" | "month";

/** start is inclusive, end is exclusive. Weeks run Monday to Sunday. */
export function periodRange(period: Period, offset: number) {
  const n = new Date();
  const y = n.getFullYear();
  const m = n.getMonth();
  const d = n.getDate();
  const short = (x: Date) => x.toLocaleDateString([], { month: "short", day: "numeric" });
  let start: Date, end: Date, label: string, sub = "";

  if (period === "day") {
    start = new Date(y, m, d + offset);
    end = new Date(y, m, d + offset + 1);
    label = offset === 0 ? "Today" : offset === -1 ? "Yesterday" : start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  } else if (period === "week") {
    const dow = (n.getDay() + 6) % 7;
    start = new Date(y, m, d - dow + offset * 7);
    end = new Date(y, m, d - dow + offset * 7 + 7);
    const last = new Date(y, m, d - dow + offset * 7 + 6);
    label = offset === 0 ? "This week" : `${short(start)} – ${short(last)}`;
    sub = offset === 0 ? `${short(start)} – ${short(last)}` : "";
  } else {
    start = new Date(y, m + offset, 1);
    end = new Date(y, m + offset + 1, 1);
    label = start.toLocaleDateString([], { month: "long", year: "numeric" });
  }
  return { start, end, label, sub };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function summarize(txs: Transaction[], startingBalance: number, start: Date, end: Date) {
  let opening = startingBalance;
  let income = 0;
  let expense = 0;
  const byHead = Object.fromEntries(HEADS.map((h) => [h, 0])) as Record<Head, number>;

  for (const t of txs) {
    const at = new Date(t.createdAt).getTime();
    if (at < start.getTime()) {
      opening += t.type === "income" ? t.amount : -t.amount;
    } else if (at < end.getTime()) {
      if (t.type === "income") income += t.amount;
      else {
        expense += t.amount;
        byHead[t.head ?? "Miscellaneous"] += t.amount;
      }
    }
  }
  return { opening: r2(opening), income: r2(income), expense: r2(expense), closing: r2(opening + income - expense), byHead };
}
