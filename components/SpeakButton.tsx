"use client";

import { useEffect, useState } from "react";
import { canSpeak, speak } from "@/lib/speech";

export function SpeakButton({ text, label = "Hear it" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => setOk(canSpeak()), []);

  if (!ok) return null;

  const handleSpeak = () => {
    setIsSpeaking(true);
    speak(text);
    // Reset visual bounce effect after audio playback starts
    setTimeout(() => setIsSpeaking(false), 800);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      aria-label={`${label}: ${text}`}
      className={`btn small ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 hover:text-indigo-700 active:scale-95 transition-all duration-150 border border-indigo-100/80 shadow-sm ${
        isSpeaking ? "scale-105 ring-2 ring-indigo-400" : ""
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`transition-transform duration-200 ${isSpeaking ? "animate-bounce" : ""}`}
      >
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
      <span>{label}</span>
    </button>
  );
}