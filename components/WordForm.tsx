"use client";

import { useRef, useState, type FormEvent } from "react";
import type { WordInput } from "@/lib/types";
import { parseTags, parseWordList } from "@/lib/utils";

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
  const [synonyms, setSynonyms] = useState(initial?.synonyms?.join(", ") ?? "");
  const [antonyms, setAntonyms] = useState(initial?.antonyms?.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);
  const englishRef = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!english.trim() || !bangla.trim()) {
      setError("Fill in both the English word and its Bangla meaning.");
      return;
    }
    const err = onSubmit({
      english,
      bangla,
      pos,
      example,
      tags: parseTags(tags),
      synonyms: parseWordList(synonyms),
      antonyms: parseWordList(antonyms),
    });
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (!initial) {
      setEnglish("");
      setBangla("");
      setExample("");
      setSynonyms("");
      setAntonyms("");
      englishRef.current?.focus();
    }
  }

  return (
    <form onSubmit={submit} className="wordform" noValidate>
      <div className="field">
        <label htmlFor="wf-en">English</label>
        <input
          id="wf-en"
          ref={englishRef}
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          lang="en"
          autoComplete="off"
          placeholder="e.g. diligent"
        />
      </div>
      <div className="field">
        <label htmlFor="wf-bn">Bangla</label>
        <input
          id="wf-bn"
          value={bangla}
          onChange={(e) => setBangla(e.target.value)}
          lang="bn"
          autoComplete="off"
          placeholder="যেমন: পরিশ্রমী"
        />
      </div>
      <div className="field">
        <label htmlFor="wf-pos">Part of speech</label>
        <select id="wf-pos" value={pos} onChange={(e) => setPos(e.target.value)}>
          {POS.map((p) => (
            <option key={p} value={p}>
              {p || "Not set"}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="wf-tags">Tags</label>
        <input
          id="wf-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          autoComplete="off"
          placeholder="ielts, work, unit 3"
        />
      </div>
      <div className="field">
        <label htmlFor="wf-syn">Synonyms (up to 5)</label>
        <input
          id="wf-syn"
          value={synonyms}
          onChange={(e) => setSynonyms(e.target.value)}
          lang="en"
          autoComplete="off"
          placeholder="plentiful, ample"
        />
      </div>
      <div className="field">
        <label htmlFor="wf-ant">Antonyms (up to 5)</label>
        <input
          id="wf-ant"
          value={antonyms}
          onChange={(e) => setAntonyms(e.target.value)}
          lang="en"
          autoComplete="off"
          placeholder="scarce, sparse"
        />
      </div>
      <div className="field wide">
        <label htmlFor="wf-ex">Example sentence</label>
        <input
          id="wf-ex"
          value={example}
          onChange={(e) => setExample(e.target.value)}
          autoComplete="off"
          placeholder="A diligent student always finishes homework on time."
        />
      </div>
      {error && (
        <p className="form-error wide" role="alert">
          {error}
        </p>
      )}
      <div className="actions wide">
        <button type="submit" className="btn primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
