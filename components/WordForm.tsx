"use client";

import { useRef, useState, type FormEvent } from "react";
import type { WordInput } from "@/lib/types";
import { parseTags } from "@/lib/utils";

const POS = ["", "noun", "verb", "adjective", "adverb", "phrase", "other"];

type Props = {
  initial?: WordInput;
  submitLabel: string;
  /** Return an error message to keep the form open, or null when saved. */
  onSubmit: (value: WordInput) => string | null;
  onCancel?: () => void;
};

export function WordForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [english, setEnglish] = useState(initial?.english ?? "");
  const [bangla, setBangla] = useState(initial?.bangla ?? "");
  const [pos, setPos] = useState(initial?.pos ?? "");
  const [example, setExample] = useState(initial?.example ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);
  const englishRef = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!english.trim() || !bangla.trim()) {
      setError("Fill in both the English word and its Bangla meaning.");
      return;
    }
    const err = onSubmit({ english, bangla, pos, example, tags: parseTags(tags) });
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (!initial) {
      setEnglish("");
      setBangla("");
      setExample("");
      englishRef.current?.focus();
    }
  }

  return (
    <form
      onSubmit={submit}
      className="wordform bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/80 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto"
      noValidate
    >
      {/* English Input */}
      <div className="field flex flex-col gap-1.5">
        <label htmlFor="wf-en" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <span>🔤</span> English Word <span className="text-rose-500">*</span>
        </label>
        <input
          id="wf-en"
          ref={englishRef}
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          lang="en"
          autoComplete="off"
          placeholder="e.g. diligent"
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
        />
      </div>

      {/* Bangla Input */}
      <div className="field flex flex-col gap-1.5">
        <label htmlFor="wf-bn" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <span>🇧🇩</span> Bangla Meaning <span className="text-rose-500">*</span>
        </label>
        <input
          id="wf-bn"
          value={bangla}
          onChange={(e) => setBangla(e.target.value)}
          lang="bn"
          autoComplete="off"
          placeholder="যেমন: পরিশ্রমী"
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
        />
      </div>

      {/* Part of Speech */}
      <div className="field flex flex-col gap-1.5">
        <label htmlFor="wf-pos" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <span>🏷️</span> Part of Speech
        </label>
        <div className="relative">
          <select
            id="wf-pos"
            value={pos}
            onChange={(e) => setPos(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 capitalize focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none appearance-none cursor-pointer"
          >
            {POS.map((p) => (
              <option key={p} value={p}>
                {p || "Not set"}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            ▼
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="field flex flex-col gap-1.5">
        <label htmlFor="wf-tags" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <span>📌</span> Tags
        </label>
        <input
          id="wf-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          autoComplete="off"
          placeholder="ielts, work, unit 3"
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
        />
      </div>

      {/* Example Sentence */}
      <div className="field wide sm:col-span-2 flex flex-col gap-1.5">
        <label htmlFor="wf-ex" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <span>💬</span> Example Sentence
        </label>
        <input
          id="wf-ex"
          value={example}
          onChange={(e) => setExample(e.target.value)}
          autoComplete="off"
          placeholder="A diligent student always finishes homework on time."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="form-error wide sm:col-span-2 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs p-3.5 rounded-2xl flex items-center gap-2 animate-shake" role="alert">
          <span>⚠️</span> {error}
        </p>
      )}

      {/* Actions */}
      <div className="actions wide sm:col-span-2 flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            className="btn px-5 py-2.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-sm"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn primary px-6 py-2.5 rounded-2xl font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-95 transition-all text-sm"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}