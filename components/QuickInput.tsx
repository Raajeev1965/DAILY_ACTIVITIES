"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, SendHorizontal } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { CATEGORIES, type Category } from "@/lib/types";
import { categoryStyle } from "@/lib/categories";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Recognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
}

export function QuickInput() {
  const { addNote } = useStore();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("Personal");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef<Recognizer | null>(null);
  const baseRef = useRef("");
  const voiceRef = useRef(false);

  useEffect(() => () => recRef.current?.stop(), []);

  const submit = () => {
    if (!text.trim()) return;
    recRef.current?.stop();
    addNote(text, category, voiceRef.current ? "voice" : "text");
    voiceRef.current = false;
    setText("");
    setError("");
  };

  const dictate = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setError("Voice input isn't supported in this browser. Try Chrome, Edge or Safari.");
      return;
    }
    setError("");
    const rec: Recognizer = new Ctor();
    rec.lang = navigator.language || "en-US"; // e.g. set "hi-IN" or "gu-IN" to force a language
    rec.interimResults = true;
    rec.continuous = false;
    baseRef.current = text ? text.trimEnd() + " " : "";

    rec.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      voiceRef.current = true;
      setText(baseRef.current + transcript);
    };
    rec.onerror = (e: any) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microphone access is blocked. Allow it in your browser's site settings.");
      } else if (e.error === "no-speech") {
        setError("Didn't catch anything. Tap the mic and try again.");
      } else {
        setError("Voice input failed. Try again.");
      }
    };
    rec.onend = () => setListening(false);

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
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
      {error && (
        <p role="alert" className="px-1 pb-1 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
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
          aria-label={listening ? "Stop dictation" : "Dictate a note"}
          aria-pressed={listening}
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
