"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, SendHorizontal } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { CATEGORIES, type Category } from "@/lib/types";
import { categoryStyle } from "@/lib/categories";
import { cn } from "@/lib/utils";

const DICTATION_SAMPLES = [
  "Remember to follow up with the design team about the new onboarding flow",
  "Felt much more focused after the afternoon walk",
  "Idea: a weekly recap that highlights the habits I kept up",
  "Grocery run tonight: eggs, spinach, oat milk",
];

export function QuickInput() {
  const { addNote } = useStore();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("Personal");
  const [listening, setListening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const submit = () => {
    if (!text.trim()) return;
    addNote(text, category);
    setText("");
  };

  // Simulated dictation: "listens" briefly, then adds a sample transcript.
  const dictate = () => {
    if (listening) return;
    setListening(true);
    timer.current = setTimeout(() => {
      const phrase = DICTATION_SAMPLES[Math.floor(Math.random() * DICTATION_SAMPLES.length)];
      addNote(phrase, category, "voice");
      setListening(false);
    }, 1600);
  };

  return (
    <section aria-label="Add a note" className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={2}
        placeholder={listening ? "Listening…" : "What's happening? Add #Work, #Health…"}
        aria-label="Note text"
        className="w-full resize-none bg-transparent px-1 py-1 text-base placeholder:text-zinc-400 focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 gap-1.5 overflow-x-auto" role="radiogroup" aria-label="Category">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-opacity",
                categoryStyle[c].chip,
                category !== c && "opacity-50"
              )}
            >
              #{c}
            </button>
          ))}
        </div>
        <button
          onClick={dictate}
          aria-label={listening ? "Listening" : "Dictate a note"}
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors",
            listening ? "mic-live bg-red-500 text-white" : "bg-zinc-100 text-ink dark:bg-zinc-800 dark:text-zinc-100"
          )}
        >
          <Mic size={18} />
        </button>
        <button
          onClick={submit}
          disabled={!text.trim()}
          aria-label="Save note"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white transition-opacity disabled:opacity-35"
        >
          <SendHorizontal size={18} />
        </button>
      </div>
    </section>
  );
}
