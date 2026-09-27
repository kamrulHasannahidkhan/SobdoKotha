"use client";

import { useEffect, useState } from "react";
import { canSpeak, speak } from "@/lib/speech";

export function SpeakButton({ text, label = "Hear it" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(canSpeak()), []);
  if (!ok) return null;
  return (
    <button type="button" className="btn small ghost" onClick={() => speak(text)} aria-label={`${label}: ${text}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
      {label}
    </button>
  );
}
