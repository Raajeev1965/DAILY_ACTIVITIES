"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";

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

/**
 * Live dictation that keeps listening through pauses until the user stops it.
 * - textRef must always hold the latest text of the field being dictated into.
 * - onChange receives the full text (existing text + transcript).
 * - onStop runs after the user taps the mic to stop (not on errors, not on stop(false)).
 */
export function useDictation(textRef: MutableRefObject<string>, onChange: (v: string) => void, onStop?: () => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef<Recognizer | null>(null);
  const wantRef = useRef(false);
  const userStopRef = useRef(false);
  const baseRef = useRef("");
  const usedVoice = useRef(false);
  const onChangeRef = useRef(onChange);
  const onStopRef = useRef(onStop);

  useEffect(() => {
    onChangeRef.current = onChange;
    onStopRef.current = onStop;
  });

  useEffect(
    () => () => {
      wantRef.current = false;
      userStopRef.current = false;
      recRef.current?.stop();
    },
    []
  );

  const stop = useCallback((notify = true) => {
    if (!wantRef.current) return;
    wantRef.current = false;
    userStopRef.current = notify;
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
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
      usedVoice.current = true;
      onChangeRef.current(baseRef.current + transcript.trimStart());
    };

    rec.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") return; // pauses are fine
      wantRef.current = false;
      userStopRef.current = false;
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microphone access is blocked. Allow it in your browser's site settings.");
      } else if (e.error === "network") {
        setError("Voice input needs an internet connection.");
      } else {
        setError("Voice input stopped. Tap the mic to try again.");
      }
    };

    rec.onend = () => {
      if (!wantRef.current) {
        setListening(false);
        if (userStopRef.current) {
          userStopRef.current = false;
          onStopRef.current?.();
        }
        return;
      }
      // The browser ends a session after a pause: start a new one and keep the words so far.
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
  }, [textRef]);

  const toggle = useCallback(() => (wantRef.current ? stop(true) : start()), [start, stop]);

  return { listening, error, setError, start, stop, toggle, usedVoice };
}
