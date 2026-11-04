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
  const wantRef = useRef(false); // true until the user taps the mic to stop
  const textRef = useRef(""); // always the latest text, readable inside callbacks
  const baseRef = useRef(""); // text that existed before the current recognition session
  const voiceRef = useRef(false);

  const updateText = (v: string) => {
    textRef.current = v;
    setText(v);
  };

  const stopListening = () => {
    wantRef.current = false;
    recRef.current?.stop();
    setListening(false);
  };

  useEffect(
    () => () => {
      wantRef.current = false;
      recRef.current?.stop();
    },
    []
  );

  const submit = () => {
    if (!textRef.current.trim()) return;
    stopListening();
    addNote(textRef.current, category, voiceRef.current ? "voice" : "text");
    voiceRef.current = false;
    updateText("");
    setError("");
  };

  const startListening = () => {
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setError("Voice input isn't supported in this browser. Try Chrome, Edge or Safari.");
      return;
    }
    setError("");

    const rec: Recognizer = new Ctor();
    rec.lang = navigator.language || "en-US"; // e.g. "hi-IN" or "gu-IN" to force a language
    rec.interimResults = true;
    // Android Chrome repeats words in continuous mode, so it relies on auto-restart instead.
    rec.continuous = !/Android/i.test(navigator.userAgent);

    const rebase = () => {
      const t = textRef.current;
      baseRef.current = t ? t.trimEnd() + " " : "";
    };
    rebase();

    rec.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      voiceRef.current = true;
      updateText(baseRef.current + transcript.trimStart());
    };

    rec.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") return; // pauses are fine, keep going
      wantRef.current = false;
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microphone access is blocked. Allow it in your browser's site settings.");
      } else if (e.error === "network") {
        setError("Voice input needs an internet connection.");
      } else {
        setError("Voice input stopped. Tap the mic to try again.");
      }
    };

    // The browser ends a session after a pause. Start a new one unless the user stopped it.
    rec.onend = () => {
      if (!wantRef.current) {
        setListening(false);
        return;
      }
      rebase();
      setTimeout(() => {
        if (!wantRef.current) return;
        try {
          rec.start();
        } catch {
          /* already started */
        }
      }, 150);
    };

    recRef.current = rec;
    wantRef.current = true;
    try {
      rec.start();
      setListening(true);
    } catch {
      wantRef.current = false;
      setListening(false);
    }
  };

  const toggleMic = () => (listening ? stopListening() : startListening());

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
        placeholder={listening ? "Listening… tap the mic to stop" : "What's happening? Add #Work, #Health…"}
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
          onClick={toggleMic}
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
