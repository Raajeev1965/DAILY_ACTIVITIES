"use client";

import { useState } from "react";
import { StoreProvider, useStore } from "@/hooks/useStore";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QuickInput } from "@/components/QuickInput";
import { Timeline } from "@/components/Timeline";
import { HabitList } from "@/components/HabitList";
import { Wallet } from "@/components/Wallet";
import { SearchArchive } from "@/components/SearchArchive";
import { Analytics } from "@/components/Analytics";
import { dateKey } from "@/lib/utils";

const titles: Record<Tab, string> = {
  today: "Today",
  habits: "Habits",
  wallet: "Wallet",
  search: "Archive",
  stats: "Summary",
};

function Shell() {
  const [tab, setTab] = useState<Tab>("today");
  const { ready, state } = useStore();
  const today = dateKey();
  const todayNotes = state.notes
    .filter((n) => dateKey(new Date(n.createdAt)) === today)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const dateLabel = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden md:my-6 md:h-[min(54rem,calc(100dvh_-_3rem))] md:rounded-[2rem] md:border md:border-zinc-200 md:shadow-xl md:dark:border-zinc-800">
      <header className="pt-safe flex shrink-0 items-start justify-between px-5 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{titles[tab]}</h1>
          <p className="text-sm text-ink-soft dark:text-zinc-400">{dateLabel}</p>
        </div>
        <ThemeToggle />
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        {!ready ? (
          <div className="space-y-3" aria-busy="true">
            <div className="h-28 animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
            <div className="h-16 animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
            <div className="h-16 animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
          </div>
        ) : (
          <>
            {tab === "today" && (
              <div className="space-y-6">
                <QuickInput />
                <Timeline notes={todayNotes} />
              </div>
            )}
            {tab === "habits" && <HabitList />}
            {tab === "wallet" && <Wallet />}
            {tab === "search" && <SearchArchive />}
            {tab === "stats" && <Analytics />}
          </>
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function Page() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
