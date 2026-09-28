"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { WordForm } from "@/components/WordForm";
import { SpeakButton } from "@/components/SpeakButton";
import { isDue, isMastered, isNew, isWeak, MAX_BOX } from "@/lib/srs";
import { BUILTIN_DECKS, DECKS, deckOf, type DeckId } from "@/lib/decks";
import { download, parseCSV, parseTags, toCSV, wordKey, normalize } from "@/lib/utils";
import type { ImportItem, Word, WordInput } from "@/lib/types";

type Filter = "all" | "starred" | "due" | "weak" | "new" | "mastered";
type Sort = "newest" | "az" | "weakest";
const PAGE = 50;

function EditDialog({ word, onClose, onSave }: { word: Word | null; onClose: () => void; onSave: (v: WordInput) => string | null }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (word && !d.open) d.showModal();
    if (!word && d.open) d.close();
  }, [word]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="edit-h"
    >
      {word && (
        <>
          <h2 id="edit-h">Edit word</h2>
          <WordForm
            key={word.id}
            initial={word}
            submitLabel="Save changes"
            onSubmit={(v) => {
              const err = onSave(v);
              if (!err) onClose();
              return err;
            }}
            onCancel={onClose}
          />
        </>
      )}
    </dialog>
  );
}

function parseBulk(text: string): ImportItem[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const m = line.match(/^(.*?)(?:\t|\s+[-–—=:]\s+|\s*=\s*)(.+)$/) ?? line.match(/^([^,]+),(.+)$/);
      if (!m) return [];
      return [{ english: m[1].trim(), bangla: m[2].trim(), pos: "", example: "", tags: [] }];
    });
}

function fromRows(rows: string[][]): ImportItem[] {
  if (!rows.length) return [];
  const head = rows[0].map((c) => c.trim().toLowerCase());
  const hasHeader = head[0] === "english";
  const col = (name: string, fallback: number) => (hasHeader && head.indexOf(name) >= 0 ? head.indexOf(name) : fallback);
  const iEn = col("english", 0), iBn = col("bangla", 1), iPos = col("pos", 2), iEx = col("example", 3), iTags = col("tags", 4);
  return rows.slice(hasHeader ? 1 : 0).map((r) => ({
    english: r[iEn] ?? "",
    bangla: r[iBn] ?? "",
    pos: (r[iPos] ?? "").trim().toLowerCase(),
    example: r[iEx] ?? "",
    tags: parseTags(r[iTags] ?? ""),
  }));
}

function fromJSON(data: unknown): ImportItem[] {
  const list = Array.isArray(data) ? data : Array.isArray((data as { words?: unknown })?.words) ? (data as { words: unknown[] }).words : [];
  return list.flatMap((x) => {
    if (!x || typeof x !== "object") return [];
    const o = x as Record<string, unknown>;
    if (typeof o.english !== "string" || typeof o.bangla !== "string") return [];
    const num = (v: unknown) => (typeof v === "number" ? v : undefined);
    return [{
      english: o.english,
      bangla: o.bangla,
      pos: typeof o.pos === "string" ? o.pos : "",
      example: typeof o.example === "string" ? o.example : "",
      tags: Array.isArray(o.tags) ? o.tags.filter((t): t is string => typeof t === "string") : typeof o.tags === "string" ? parseTags(o.tags) : [],
      deck: typeof o.deck === "string" ? o.deck : undefined,
      box: num(o.box), due: num(o.due), correct: num(o.correct), wrong: num(o.wrong),
      starred: o.starred === true,
    }];
  });
}

export default function WordsPage() {
  const { ready, words, addWord, updateWord, deleteWord, toggleStar, importWords, restoreDeck, resetProgress, clearDeck } = useStore();
  const [deck, setDeck] = useState<string>("gre-iba");
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [limit, setLimit] = useState(PAGE);
  const [editing, setEditing] = useState<Word | null>(null);
  const [bulk, setBulk] = useState("");
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const deckInfo = DECKS.find((d) => d.id === deck) ?? DECKS[0];
  const deckWords = useMemo(() => words.filter((w) => deckOf(w) === deck), [words, deck]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const w of words) c[deckOf(w)] = (c[deckOf(w)] ?? 0) + 1;
    return c;
  }, [words]);
  const allTags = useMemo(() => Array.from(new Set(deckWords.flatMap((w) => w.tags))).sort(), [deckWords]);

  const shown = useMemo(() => {
    const needle = normalize(q);
    const now = Date.now();
    const list = deckWords.filter((w) => {
      if (tag && !w.tags.includes(tag)) return false;
      if (filter === "starred" && !w.starred) return false;
      if (filter === "due" && !isDue(w, now)) return false;
      if (filter === "weak" && !isWeak(w)) return false;
      if (filter === "new" && !isNew(w)) return false;
      if (filter === "mastered" && !isMastered(w)) return false;
      if (!needle) return true;
      return normalize(w.english).includes(needle) || normalize(w.bangla).includes(needle) || normalize(w.example).includes(needle);
    });
    if (sort === "az") list.sort((a, b) => a.english.localeCompare(b.english));
    if (sort === "weakest") list.sort((a, b) => a.box - b.box || b.wrong - a.wrong);
    return list;
  }, [deckWords, q, tag, filter, sort]);

  if (!ready) return <p className="muted">Opening your notebook…</p>;

  const builtinCount = BUILTIN_DECKS[deck as DeckId]?.length ?? 0;

  const exists = (english: string, bangla: string, ignoreId?: string) =>
    deckWords.some((w) => w.id !== ignoreId && wordKey(w.english, w.bangla) === wordKey(english, bangla));

  function switchDeck(id: string) {
    setDeck(id);
    setQ("");
    setTag("");
    setFilter("all");
    setLimit(PAGE);
    setNotice("");
  }

  function onAdd(v: WordInput) {
    if (exists(v.english, v.bangla)) return "This word and meaning are already in this list.";
    addWord(v, deck);
    setNotice(`Added "${v.english.trim()}" to ${deckInfo.label}.`);
    return null;
  }

  function onSaveEdit(v: WordInput) {
    if (!editing) return null;
    if (exists(v.english, v.bangla, editing.id)) return "Another entry in this list already has this word and meaning.";
    updateWord(editing.id, v);
    setNotice(`Saved "${v.english.trim()}".`);
    return null;
  }

  function onBulk() {
    const items = parseBulk(bulk);
    if (!items.length) {
      setNotice("Nothing to add. Write one pair per line, like: brave - সাহসী");
      return;
    }
    const { added, skipped } = importWords(items, deck);
    setNotice(`Added ${added} ${added === 1 ? "word" : "words"} to ${deckInfo.label}${skipped ? `, skipped ${skipped} duplicate or incomplete` : ""}.`);
    if (added) setBulk("");
  }

  async function onFile(file: File) {
    try {
      const text = await file.text();
      const items = file.name.toLowerCase().endsWith(".json") ? fromJSON(JSON.parse(text)) : fromRows(parseCSV(text));
      if (!items.length) {
        setNotice("No words found in that file. Use a CSV (english, bangla, pos, example, tags) or a JSON backup.");
        return;
      }
      const { added, skipped } = importWords(items, deck);
      setNotice(`Imported ${added} ${added === 1 ? "word" : "words"}${skipped ? `, skipped ${skipped} duplicate or incomplete` : ""}.`);
    } catch {
      setNotice("That file could not be read. Check that it is valid CSV or JSON.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <>
      <h1>Words</h1>

      <div className="decktabs" role="tablist" aria-label="Word lists">
        {DECKS.map((d) => (
          <button
            key={d.id}
            id={`tab-${d.id}`}
            type="button"
            role="tab"
            className="decktab"
            aria-selected={deck === d.id}
            aria-controls="deck-panel"
            onClick={() => switchDeck(d.id)}
          >
            {d.label}
            <span className="count">{counts[d.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div id="deck-panel" role="tabpanel" aria-labelledby={`tab-${deck}`}>
        <p className="lede">
          {deckWords.length} {deckWords.length === 1 ? "word" : "words"} in {deckInfo.label}.
        </p>

        <section className="panel" aria-labelledby="add-h">
          <h2 id="add-h">Add a word to {deckInfo.label}</h2>
          <WordForm submitLabel="Add word" onSubmit={onAdd} />
          <details className="bulk">
            <summary>Paste many words at once</summary>
            <p className="muted">One pair per line: <code>brave - সাহসী</code>. You can also separate with a tab or "=".</p>
            <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} rows={5} aria-label="Words to add, one per line" />
            <div className="actions">
              <button type="button" className="btn" onClick={onBulk}>Add all</button>
            </div>
          </details>
        </section>

        <p className="notice" role="status" aria-live="polite">{notice}</p>

        <section aria-labelledby="list-h">
          <h2 id="list-h">Your list</h2>
          <div className="toolbar">
            <div className="field grow">
              <label htmlFor="q">Search</label>
              <input id="q" type="search" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="English or Bangla" />
            </div>
            <div className="field">
              <label htmlFor="f">Show</label>
              <select id="f" value={filter} onChange={(e) => { setFilter(e.target.value as Filter); setLimit(PAGE); }}>
                <option value="all">All words</option>
                <option value="starred">Starred</option>
                <option value="due">Due for review</option>
                <option value="weak">Needs work</option>
                <option value="new">Not practiced yet</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="t">Tag</label>
              <select id="t" value={tag} onChange={(e) => { setTag(e.target.value); setLimit(PAGE); }}>
                <option value="">Any tag</option>
                {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="s">Sort</label>
              <select id="s" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="newest">Original order</option>
                <option value="az">A to Z</option>
                <option value="weakest">Weakest first</option>
              </select>
            </div>
          </div>

          {deckWords.length === 0 ? (
            <div className="empty">
              {builtinCount > 0 ? (
                <>
                  <p>This list is empty.</p>
                  <div className="actions">
                    <button className="btn primary" onClick={() => setNotice(`Restored ${restoreDeck(deck)} words.`)}>Restore {deckInfo.label} list</button>
                  </div>
                </>
              ) : deck === "words-1000" ? (
                <p>No words here yet. Add words above, or use “Paste many words at once”.</p>
              ) : (
                <p>No words yet. Words you add yourself are kept here.</p>
              )}
            </div>
          ) : shown.length === 0 ? (
            <p className="empty">No words match these filters.</p>
          ) : (
            <ul className="wordlist">
              {shown.slice(0, limit).map((w) => (
                <li key={w.id}>
                  <div className="w-main">
                    <span className="w-en">{w.english}</span>
                    {w.pos && <span className="pos">{w.pos}</span>}
                    <SpeakButton text={w.english} label="Hear" />
                  </div>
                  <div className="w-bn" lang="bn">{w.bangla}</div>
                  <div className="w-meta">
                    {w.example && <p className="muted ex">{w.example}</p>}
                    <p className="chips">
                      <span className="pips" role="img" aria-label={`Level ${w.box} of ${MAX_BOX}`}>
                        {Array.from({ length: MAX_BOX }, (_, i) => <i key={i} className={i < w.box ? "on" : ""} />)}
                      </span>
                      {w.tags.map((t) => <span key={t} className="chip">{t}</span>)}
                    </p>
                  </div>
                  <div className="w-actions">
                    <button className="btn small ghost" onClick={() => toggleStar(w.id)} aria-pressed={w.starred} aria-label={w.starred ? `Unstar ${w.english}` : `Star ${w.english}`}>
                      {w.starred ? "★ Starred" : "☆ Star"}
                    </button>
                    <button className="btn small" onClick={() => setEditing(w)} aria-label={`Edit ${w.english}`}>Edit</button>
                    <button
                      className="btn small danger"
                      onClick={() => { if (confirm(`Delete "${w.english}"?`)) { deleteWord(w.id); setNotice(`Deleted "${w.english}".`); } }}
                      aria-label={`Delete ${w.english}`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {shown.length > limit && (
            <div className="actions">
              <button className="btn" onClick={() => setLimit((l) => l + PAGE)}>Show more ({shown.length - limit} left)</button>
            </div>
          )}
        </section>

        <section className="block" aria-labelledby="data-h">
          <h2 id="data-h">Backup and import</h2>
          <p className="muted">Your words are saved in this browser only. Export a backup now and then.</p>
          <div className="actions">
            <button className="btn" onClick={() => download(`shobdo-khata-${stamp}.json`, JSON.stringify({ words }, null, 2), "application/json")}>Export backup (all lists, JSON)</button>
            <button className="btn" onClick={() => download(`shobdo-khata-${deck}-${stamp}.csv`, toCSV(deckWords), "text/csv;charset=utf-8")}>Export CSV ({deckInfo.label})</button>
            <button className="btn" onClick={() => fileRef.current?.click()}>Import file into {deckInfo.label}</button>
            <input ref={fileRef} type="file" accept=".csv,.json,text/csv,application/json" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            {builtinCount > 0 && (
              <button className="btn" onClick={() => setNotice(`Restored ${restoreDeck(deck)} missing words.`)}>Restore {deckInfo.label} list</button>
            )}
          </div>
          <div className="actions">
            <button className="btn danger" onClick={() => { if (confirm("Reset levels, scores and streak for every word in every list? Your words stay.")) { resetProgress(); setNotice("Progress reset."); } }}>Reset progress (all lists)</button>
            <button className="btn danger" onClick={() => { if (confirm(`Delete ALL words in ${deckInfo.label}? Export a backup first if you might need them.`)) { clearDeck(deck); setNotice(`All words in ${deckInfo.label} deleted.`); } }}>Delete all words in {deckInfo.label}</button>
          </div>
        </section>
      </div>

      <EditDialog word={editing} onClose={() => setEditing(null)} onSave={onSaveEdit} />
    </>
  );
}
