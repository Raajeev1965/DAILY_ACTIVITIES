"use client";

import { useRef, useState } from "react";
import { Mic, Plus } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useDictation } from "@/hooks/useDictation";
import { parseTransaction } from "@/lib/parseTransaction";
import { HEADS, type Head } from "@/lib/types";
import { headMeta } from "@/lib/wallet";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type TxType = "expense" | "income";

function resolve(text: string, headPick: Head | null, typePick: TxType | null) {
  const p = parseTransaction(text);
  const type = typePick ?? p.type;
  const head = type === "expense" ? headPick ?? p.head ?? "Miscellaneous" : null;
  return { p, type, head };
}

export function WalletEntry() {
  const { addTransaction } = useStore();
  const [text, setText] = useState("");
  const [headPick, setHeadPick] = useState<Head | null>(null);
  const [typePick, setTypePick] = useState<TxType | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const textRef = useRef("");
  const headRef = useRef<Head | null>(null);
  const typeRef = useRef<TxType | null>(null);

  const setT = (v: string) => {
    textRef.current = v;
    setText(v);
    setMsg(null);
  };
  const pickHead = (h: Head) => {
    headRef.current = h;
    setHeadPick(h);
  };
  const pickType = (t: TxType) => {
    typeRef.current = t;
    setTypePick(t);
  };

  // Saves automatically when you tap the mic to stop, if an amount was heard.
  const save = () => {
    if (!textRef.current.trim()) return;
    const { p, type, head } = resolve(textRef.current, headRef.current, typeRef.current);
    if (p.amount === null || p.amount <= 0) {
      setMsg({ ok: false, text: "No amount found. Say or type something like “250 for petrol”." });
      return;
    }
    addTransaction({ type, amount: p.amount, head, note: p.note, source: dict.usedVoice.current ? "voice" : "text" });
    dict.usedVoice.current = false;
    headRef.current = null;
    typeRef.current = null;
    setHeadPick(null);
    setTypePick(null);
    textRef.current = "";
    setText("");
    setMsg({ ok: true, text: `Added ${type} ${formatMoney(p.amount)}${head ? ` to ${head}` : ""}` });
  };

  const dict = useDictation(textRef, setT, save);

  const view = resolve(text, headPick, typePick);

  return (
    <section aria-label="Add income or expense" className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800">
      <textarea
        value={text}
        onChange={(e) => setT(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            dict.stop(false);
            save();
          }
        }}
        rows={2}
        placeholder={dict.listening ? "Listening… tap the mic to save" : "Say or type: “spent 250 on petrol”"}
        aria-label="Describe the expense or income"
        className="w-full resize-none bg-transparent px-1 py-1 text-base placeholder:text-zinc-400 focus:outline-none"
      />

      {text.trim() && (
        <div className="mt-1 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <p className="text-lg font-extrabold tabular-nums">
              {view.p.amount !== null ? formatMoney(view.p.amount) : <span className="text-sm font-semibold text-zinc-400">No amount yet</span>}
            </p>
            <div className="flex rounded-full bg-zinc-100 p-0.5 text-xs font-semibold dark:bg-zinc-800" role="radiogroup" aria-label="Type">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  role="radio"
                  aria-checked={view.type === t}
                  onClick={() => pickType(t)}
                  className={cn("rounded-full px-3 py-1 capitalize", view.type === t && "bg-white shadow-sm dark:bg-zinc-600")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {view.type === "expense" && (
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Head">
              {HEADS.map((h) => {
                const { Icon, tile } = headMeta[h];
                const on = view.head === h;
                return (
                  <button
                    key={h}
                    role="radio"
                    aria-checked={on}
                    onClick={() => pickHead(h)}
                    className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity", tile, !on && "opacity-40")}
                  >
                    <Icon size={13} /> {h}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {(dict.error || msg) && (
        <p role="status" className={cn("px-1 pt-2 text-xs font-medium", dict.error || !msg?.ok ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
          {dict.error || msg?.text}
        </p>
      )}

      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          onClick={dict.toggle}
          aria-label={dict.listening ? "Stop and save" : "Speak an expense"}
          aria-pressed={dict.listening}
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors",
            dict.listening ? "mic-live bg-red-500 text-white" : "bg-zinc-100 text-ink dark:bg-zinc-800 dark:text-zinc-100"
          )}
        >
          <Mic size={20} />
        </button>
        <button
          onClick={() => {
            dict.stop(false);
            save();
          }}
          disabled={!text.trim()}
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-accent px-5 text-sm font-bold text-white transition-opacity disabled:opacity-35"
        >
          <Plus size={18} /> Add
        </button>
      </div>
    </section>
  );
}
