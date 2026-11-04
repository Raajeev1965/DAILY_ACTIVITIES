"use client";

import { useRef, useState } from "react";
import { Mic, SendHorizontal } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useDictation } from "@/hooks/useDictation";
import { CATEGORIES, type Category } from "@/lib/types";
import { categoryStyle } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function QuickInput() {
  const { addNote } = useStore();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("Personal");
  const textRef = useRef("");

  const updateText = (v: string) => {
    textRef.current = v;
    setText(v);
  };
  const dict = useDictation(textRef, updateText);

  const submit = () => {
    if (!textRef.current.trim()) return;
    dict.stop(false);
    addNote(textRef.current, category, dict.usedVoice.current ? "voice" : "text");
    dict.usedVoice.current = false;
    dict.setError("");
    updateText("");
  };

  return (
    <section aria-label="Add a note" className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-ink-raised dark:ring-zinc-800">
      <textarea
        value={text}
        onChange={(e) => updateText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={2}
        placeholder={dict.listening ? "Listening… tap the mic to stop" : "What's happening? Add #Work, #Health…"}
        aria-label="Note text"
        className="w-full resize-none bg-transparent px-1 py-1 text-base placeholder:text-zinc-400 focus:outline-none"
      />
      {dict.error && (
        <p role="alert" className="px-1 pb-1 text-xs font-medium text-red-600 dark:text-red-400">
          {dict.error}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 gap-1.5 overflow-x-auto" role="radiogroup" aria-label="Category">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={category === c}
              onClick={() => setCategory(c)}
              className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-opacity", categoryStyle[c].chip, category !== c && "opacity-50")}
            >
              #{c}
            </button>
          ))}
        </div>
        <button
          onClick={dict.toggle}
          aria-label={dict.listening ? "Stop dictation" : "Dictate a note"}
          aria-pressed={dict.listening}
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors",
            dict.listening ? "mic-live bg-red-500 text-white" : "bg-zinc-100 text-ink dark:bg-zinc-800 dark:text-zinc-100"
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
