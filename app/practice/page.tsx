"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { isDue, isNew, isWeak } from "@/lib/srs";
import { DECKS, deckOf } from "@/lib/decks";
import { acceptedAnswers, findClozeBlank, firstGrapheme, normalize, shuffle } from "@/lib/utils";
import { SpeakButton } from "@/components/SpeakButton";
import type { Direction, Word } from "@/lib/types";

type Mode = "flash" | "choice" | "type" | "cloze" | "game";
type DirSetting = Direction | "mixed";
type Source = "due" | "new" | "weak" | "starred" | "all" | "range";
type Order = "shuffled" | "serial";
type Item = { id: string; dir: Direction; tries: number };

const promptOf = (w: Word, d: Direction) => (d === "en-bn" ? w.english : w.bangla);
const answerOf = (w: Word, d: Direction) => (d === "en-bn" ? w.bangla : w.english);
const promptLang = (d: Direction) => (d === "en-bn" ? "en" : "bn");
const answerLang = (d: Direction) => (d === "en-bn" ? "bn" : "en");

const GAME_STREAK_CAP = 5;
const GAME_POINTS_BASE = 10;
const GAME_POINTS_PER_STREAK = 2;
const pointsFor = (streakBefore: number) => GAME_POINTS_BASE + Math.min(streakBefore, GAME_STREAK_CAP) * GAME_POINTS_PER_STREAK;

/** Splits example fields or strings joined by semicolons/newlines into distinct sentences. */
function getIndividualSentences(w: Word): string[] {
  const rawExamples = [w.example, w.example2, w.example3].filter((s): s is string => !!s && s.trim().length > 0);
  return rawExamples.flatMap((ex) =>
    ex.split(/;\s*|\n+/).map((s) => s.trim()).filter(Boolean)
  );
}

function hasClozeBlank(w: Word) {
  return getIndividualSentences(w).some((sentence) => findClozeBlank(sentence, w.english));
}

function eligible(words: Word[], tag: string, clozeOnly: boolean) {
  return words.filter((w) => {
    if (tag && !w.tags.includes(tag)) return false;
    if (clozeOnly && !hasClozeBlank(w)) return false;
    return true;
  });
}

function pool(words: Word[], source: Source, tag: string, clozeOnly = false) {
  const now = Date.now();
  return eligible(words, tag, clozeOnly).filter((w) => {
    switch (source) {
      case "due": return isDue(w, now);
      case "new": return isNew(w);
      case "weak": return isWeak(w);
      case "starred": return w.starred;
      default: return true;
    }
  });
}

function buildQueue(
  words: Word[],
  source: Source,
  tag: string,
  count: number,
  dir: DirSetting,
  clozeOnly: boolean,
  order: Order,
  range: { from: number; to: number },
): Item[] {
  let list: Word[];
  if (source === "range") {
    const base = eligible(words, tag, clozeOnly);
    const from = Math.max(1, Math.min(range.from, base.length));
    const to = Math.max(from, Math.min(range.to, base.length));
    
    list = base.slice(from - 1, to);
    
    if (order === "shuffled") {
      list = shuffle(list);
    }
  } else {
    list = pool(words, source, tag, clozeOnly);
    if (order === "shuffled") list = shuffle(list);
    if (count > 0) list = list.slice(0, count);
  }
  return list.map((w) => ({
    id: w.id,
    dir: dir === "mixed" ? (Math.random() < 0.5 ? "en-bn" : "bn-en") : dir,
    tries: 0,
  }));
}

/* ---------- small pieces ---------- */

function Segmented<T extends string | number>({ legend, value, onChange, options }: {
  legend: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; disabled?: boolean }[];
}) {
  return (
    <fieldset className="seg">
      <legend>{legend}</legend>
      <div>
        {options.map((o) => (
          <label key={String(o.value)} className={o.disabled ? "off" : ""}>
            <input type="radio" name={legend} checked={value === o.value} disabled={o.disabled} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Prompt({ word, dir }: { word: Word; dir: Direction }) {
  return (
    <>
      <p className="prompt" lang={promptLang(dir)}>{promptOf(word, dir)}</p>
      {word.pos && dir === "en-bn" && <p className="muted pos-line">{word.pos}</p>}
      {dir === "en-bn" && <SpeakButton text={word.english} />}
    </>
  );
}

function Example({ word }: { word: Word }) {
  return word.example ? <p className="muted example">{word.example}</p> : null;
}

type CardProps = { word: Word; dir: Direction; onDone: (correct: boolean) => void };

/* ---------- flashcards ---------- */

function Flash({ word, dir, onDone }: CardProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const onControl = (e.target as HTMLElement).closest("button,input,textarea,select");
      if (!shown) {
        if ((e.key === " " || e.key === "Enter") && !onControl) { e.preventDefault(); setShown(true); }
      } else {
        if (e.key === "ArrowLeft" || e.key === "1") onDone(false);
        if (e.key === "ArrowRight" || e.key === "2") onDone(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, onDone]);

  return (
    <>
      <div className="card">
        <Prompt word={word} dir={dir} />
        {shown && (
          <div className="answer">
            <p lang={answerLang(dir)}>{answerOf(word, dir)}</p>
            <Example word={word} />
            {dir === "bn-en" && <SpeakButton text={word.english} />}
          </div>
        )}
      </div>
      <div className="actions">
        {!shown ? (
          <button className="btn primary" onClick={() => setShown(true)}>Show answer <kbd>Space</kbd></button>
        ) : (
          <>
            <button className="btn bad" onClick={() => onDone(false)}>Missed it <kbd>←</kbd></button>
            <button className="btn good" onClick={() => onDone(true)}>Got it <kbd>→</kbd></button>
          </>
        )}
      </div>
    </>
  );
}

/* ---------- multiple choice ---------- */

function Choice({ word, dir, onDone }: CardProps) {
  const { words } = useStore();
  const answer = answerOf(word, dir);
  const options = useMemo(() => {
    const others = shuffle(words.filter((w) => w.id !== word.id && answerOf(w, dir) !== answer).map((w) => answerOf(w, dir)));
    return shuffle([answer, ...Array.from(new Set(others)).slice(0, 3)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.id, dir]);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (picked === null) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= options.length) setPicked(options[n - 1]);
      } else if ((e.key === "Enter" || e.key === " ") && !(e.target as HTMLElement).closest("button")) {
        e.preventDefault();
        onDone(picked === answer);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picked, options, answer, onDone]);

  return (
    <>
      <div className="card compact">
        <Prompt word={word} dir={dir} />
      </div>
      <div className="options" role="group" aria-label="Choose the meaning">
        {options.map((o, i) => {
          const state = picked === null ? "" : o === answer ? "good" : o === picked ? "bad" : "dim";
          return (
            <button key={o} className={`opt ${state}`} lang={answerLang(dir)} disabled={picked !== null} onClick={() => setPicked(o)}>
              <kbd>{i + 1}</kbd>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <>
          <p className={`verdict ${picked === answer ? "good" : "bad"}`} role="status">
            {picked === answer ? "Correct." : "Not quite."}
          </p>
          <Example word={word} />
          <div className="actions">
            <button className="btn primary" autoFocus onClick={() => onDone(picked === answer)}>Next <kbd>Enter</kbd></button>
          </div>
        </>
      )}
    </>
  );
}

/* ---------- typing ---------- */

function Type({ word, dir, onDone }: CardProps) {
  const answer = answerOf(word, dir);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [hint, setHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function check() {
    if (!value.trim()) return;
    setResult(acceptedAnswers(answer).includes(normalize(value)));
  }

  return (
    <>
      <div className="card compact">
        <Prompt word={word} dir={dir} />
      </div>
      <div className="typebox">
        <label htmlFor="typed">Type the {dir === "en-bn" ? "Bangla" : "English"} meaning</label>
        <input
          id="typed"
          ref={inputRef}
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          lang={answerLang(dir)}
          value={value}
          readOnly={result !== null}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (result === null) check();
            else onDone(result);
          }}
        />
        {result === null && hint && <p className="muted">Starts with <b lang={answerLang(dir)}>{firstGrapheme(answer)}</b></p>}
      </div>
      {result === null ? (
        <div className="actions">
          <button className="btn primary" onClick={check} disabled={!value.trim()}>Check <kbd>Enter</kbd></button>
          <button className="btn" onClick={() => setHint(true)} disabled={hint}>Hint</button>
          <button className="btn ghost" onClick={() => setResult(false)}>I don’t know</button>
        </div>
      ) : (
        <>
          <p className={`verdict ${result ? "good" : "bad"}`} role="status">
            {result ? "Correct." : <>Not quite. The answer is <b lang={answerLang(dir)}>{answer}</b></>}
          </p>
          <Example word={word} />
          <div className="actions">
            <button className="btn primary" onClick={() => onDone(result)}>Next <kbd>Enter</kbd></button>
            {!result && value.trim() && (
              <button className="btn" onClick={() => setResult(true)}>Count as correct</button>
            )}
          </div>
        </>
      )}
    </>
  );
}

/* ---------- fill in the blank ---------- */

function Cloze({ word, onDone }: CardProps) {
  const blanks = useMemo(() => {
    const sentences = getIndividualSentences(word);
    return sentences
      .map((sentence) => findClozeBlank(sentence, word.english))
      .filter((b): b is NonNullable<typeof b> => !!b);
  }, [word.id, word.english]);

  const [blankIdx, setBlankIdx] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [hint, setHint] = useState(false);
  const [hasMissed, setHasMissed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentBlank = blanks[blankIdx];

  function check() {
    if (!value.trim() || !currentBlank) return;
    const isCorrect = currentBlank.answers.includes(normalize(value));
    setResult(isCorrect);
    if (!isCorrect) {
      setHasMissed(true);
    }
  }

  function handleNext(isCorrect: boolean) {
    const finalCorrect = isCorrect && result;
    const currentMissed = hasMissed || !finalCorrect;

    if (blankIdx < blanks.length - 1) {
      setBlankIdx((i) => i + 1);
      setValue("");
      setResult(null);
      setHint(false);
      if (currentMissed) setHasMissed(true);
    } else {
      onDone(!currentMissed);
    }
  }

  if (blanks.length === 0 || !currentBlank) {
    return (
      <>
        <div className="card compact">
          <p className="prompt" lang="bn">{word.bangla}</p>
          <p className="muted pos-line">No usable example sentence for this word.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => onDone(false)}>Skip <kbd>Enter</kbd></button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="card compact">
        <div className="flex justify-between items-center">
          <p className="muted pos-line">
            {word.bangla}
            {word.pos ? ` · ${word.pos}` : ""}
          </p>
          {blanks.length > 1 && (
            <span className="chip">Sentence {blankIdx + 1} of {blanks.length}</span>
          )}
        </div>
        <p className="prompt cloze-sentence" lang="en">
          {currentBlank.before}
          <span className="cloze-gap">
            {result === null 
              ? "_____" 
              : currentBlank.answers.find((a) => a !== normalize(word.english)) ?? word.english}
          </span>
          {currentBlank.after}
        </p>
      </div>
      <div className="typebox">
        <label htmlFor="cloze-typed">Type the missing word</label>
        <input
          id="cloze-typed"
          ref={inputRef}
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          lang="en"
          value={value}
          readOnly={result !== null}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (result === null) check();
            else handleNext(result);
          }}
        />
        {result === null && hint && <p className="muted">Starts with <b lang="en">{firstGrapheme(word.english)}</b></p>}
      </div>
      {result === null ? (
        <div className="actions">
          <button className="btn primary" onClick={check} disabled={!value.trim()}>Check <kbd>Enter</kbd></button>
          <button className="btn" onClick={() => setHint(true)} disabled={hint}>Hint</button>
          <button className="btn ghost" onClick={() => {
            setResult(false);
            setHasMissed(true);
          }}>I don’t know</button>
        </div>
      ) : (
        <>
          <p className={`verdict ${result ? "good" : "bad"}`} role="status">
            {result ? "Correct." : <>Not quite. The word is <b lang="en">{word.english}</b></>}
          </p>
          <SpeakButton text={word.english} />
          <div className="actions">
            <button className="btn primary" onClick={() => handleNext(result)}>
              {blankIdx < blanks.length - 1 ? "Next sentence" : "Next word"} <kbd>Enter</kbd>
            </button>
            {!result && value.trim() && (
              <button className="btn" onClick={() => setResult(true)}>Count as correct</button>
            )}
          </div>
        </>
      )}
    </>
  );
}

/* ---------- a session ---------- */

function Session({ initial, mode, onExit, onAgain }: { initial: Item[]; mode: Mode; onExit: () => void; onAgain: () => void }) {
  const { words, recordAnswer, recordGameResult, gameResults } = useStore();
  const [queue, setQueue] = useState<Item[]>(initial);
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState<{ id: string; correct: boolean }[]>([]);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const bestStreakRef = useRef(0);
  const recordedRef = useRef(false);
  const byId = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);

  const item = queue[idx];
  const word = item ? byId.get(item.id) : undefined;
  const finished = idx >= queue.length;
  const isGame = mode === "game";

  function onDone(correct: boolean) {
    if (!item) return;
    if (item.tries === 0) {
      recordAnswer(item.id, correct);
      setLog((l) => [...l, { id: item.id, correct }]);
      if (isGame) {
        const gained = correct ? pointsFor(streak) : 0;
        setPoints((p) => p + gained);
        setStreak((s) => {
          const next = correct ? s + 1 : 0;
          bestStreakRef.current = Math.max(bestStreakRef.current, next);
          return next;
        });
      }
    }
    if (!correct && item.tries < 2) setQueue((q) => [...q, { ...item, tries: item.tries + 1 }]);
    setIdx((i) => i + 1);
  }

  if (finished || !word) {
    const right = log.filter((l) => l.correct).length;
    const missed = log.filter((l) => !l.correct).map((l) => byId.get(l.id)).filter((w): w is Word => !!w);

    if (isGame && log.length > 0 && !recordedRef.current) {
      recordedRef.current = true;
      recordGameResult({ total: log.length, correct: right, points, bestStreak: bestStreakRef.current });
    }
    const previousBest = isGame
      ? gameResults.filter((r) => r.total === log.length).reduce<number>((m, r) => Math.max(m, r.points), 0)
      : 0;
    const isNewBest = isGame && log.length > 0 && points >= previousBest;

    return (
      <>
        <h1>{isGame ? "Test complete" : "Session complete"}</h1>
        <p className="lede">
          {log.length === 0
            ? "No answers this time."
            : isGame
              ? <>{right} of {log.length} correct — {points} points{isNewBest && <span className="chip"> New best</span>}</>
              : `${right} of ${log.length} right on the first try.`}
        </p>
        {missed.length > 0 && (
          <section className="block">
            <h2>To look at again</h2>
            <ul className="missed">
              {missed.map((w) => (
                <li key={w.id}>
                  <span>{w.english}</span>
                  <span lang="bn">{w.bangla}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="actions">
          <button className="btn primary" onClick={onAgain}>{isGame ? "Play again" : "Practice again"}</button>
          <button className="btn" onClick={onExit}>Change settings</button>
          <Link href="/" className="btn">Back to today</Link>
        </div>
      </>
    );
  }

  const Card = mode === "flash" ? Flash : mode === "choice" ? Choice : mode === "cloze" ? Cloze : Type;
  return (
    <>
      <div className="session-head">
        <button className="btn small ghost" onClick={onExit}>End session</button>
        <span className="muted">{idx + 1} of {queue.length}</span>
        {isGame && <span className="chip">{points} pts</span>}
        {isGame && streak > 1 && <span className="chip">Streak {streak}</span>}
        {item.tries > 0 && <span className="chip">second look</span>}
      </div>
      <div className="meter thin" aria-hidden="true"><i style={{ width: `${(idx / queue.length) * 100}%` }} /></div>
      <Card key={`${idx}-${item.id}`} word={word} dir={item.dir} onDone={onDone} />
    </>
  );
}

/* ---------- setup ---------- */

export default function PracticePage() {
  const { ready, words } = useStore();
  const [deck, setDeck] = useState<string>("all");
  const [mode, setMode] = useState<Mode>("flash");
  const [dir, setDir] = useState<DirSetting>("en-bn");
  const [source, setSource] = useState<Source>("due");
  const [order, setOrder] = useState<Order>("shuffled");
  const [range, setRange] = useState({ from: 1, to: 20 });
  const [tag, setTag] = useState("");
  const [count, setCount] = useState(20);
  const [items, setItems] = useState<Item[] | null>(null);
  const [run, setRun] = useState(0);
  const touchedSource = useRef(false);

  const deckWords = deck === "all" ? words : words.filter((w) => deckOf(w) === deck);
  const now = Date.now();
  const dueCount = ready ? deckWords.filter((w) => isDue(w, now)).length : 0;
  useEffect(() => {
    if (ready && !touchedSource.current && dueCount === 0) setSource("all");
  }, [ready, dueCount]);

  if (!ready) return <p className="muted">Opening your notebook…</p>;

  const tags = Array.from(new Set(deckWords.flatMap((w) => w.tags))).sort();
  const clozeOnly = mode === "cloze";
  const eligibleWords = eligible(deckWords, tag, clozeOnly);
  const available = source === "range" ? eligibleWords.length : pool(deckWords, source, tag, clozeOnly).length;
  const rangeFrom = Math.max(1, Math.min(range.from || 1, eligibleWords.length || 1));
  const rangeTo = Math.max(rangeFrom, Math.min(range.to || rangeFrom, eligibleWords.length || 1));
  const planned = source === "range" ? Math.max(0, Math.min(rangeTo, eligibleWords.length) - rangeFrom + 1) : count > 0 ? Math.min(count, available) : available;
  const choiceOk = words.length >= 2;

  function start() {
    setItems(buildQueue(deckWords, source, tag, count, dir, clozeOnly, order, range));
    setRun((r) => r + 1);
  }

  if (items) {
    return <Session key={run} initial={items} mode={mode} onExit={() => setItems(null)} onAgain={start} />;
  }

  const note: ReactNode =
    source === "range"
      ? planned === 0
        ? "That range has no eligible words. Adjust the numbers above."
        : `Words ${rangeFrom} to ${Math.min(rangeTo, eligibleWords.length)} of ${eligibleWords.length}${order === "serial" ? ", in list order" : ", shuffled within range"}.`
      : available === 0
        ? source === "due" && !tag
          ? "Nothing is due right now. Pick “All words” to practice anyway."
          : "No words match these choices."
        : `${planned} ${planned === 1 ? "word" : "words"} in this session${order === "serial" ? ", in list order" : ""}.`;

  return (
    <>
      <h1>Practice</h1>
      <p className="lede">Choose how you want to practice, then start.</p>

      <div className="setup">
        <Segmented<string>
          legend="Word list"
          value={deck}
          onChange={setDeck}
          options={[
            { value: "all", label: `All (${words.length})` },
            ...DECKS.map((d) => {
              const n = words.filter((w) => deckOf(w) === d.id).length;
              return { value: d.id as string, label: `${d.label} (${n})`, disabled: n === 0 };
            }),
          ]}
        />
        <Segmented<Mode>
          legend="Style"
          value={mode}
          onChange={setMode}
          options={[
            { value: "flash", label: "Flashcards" },
            { value: "choice", label: "Multiple choice", disabled: !choiceOk },
            { value: "type", label: "Type the answer" },
            { value: "cloze", label: "Fill in the blank" },
            { value: "game", label: "Game (score points)" },
          ]}
        />
        <Segmented<DirSetting>
          legend="Direction"
          value={dir}
          onChange={setDir}
          options={[
            { value: "en-bn", label: "English to Bangla" },
            { value: "bn-en", label: "Bangla to English" },
            { value: "mixed", label: "Mixed" },
          ]}
        />
        <Segmented<Source>
          legend="Words"
          value={source}
          onChange={(v) => { touchedSource.current = true; setSource(v); }}
          options={[
            { value: "due", label: `Due (${pool(deckWords, "due", tag).length})` },
            { value: "all", label: "All" },
            { value: "new", label: "New" },
            { value: "weak", label: "Needs work" },
            { value: "starred", label: "Starred" },
            { value: "range", label: "Range" },
          ]}
        />
        {source === "range" ? (
          <>
            <div className="field">
              <label htmlFor="range-from">Word range (in list order)</label>
              <div className="rangepick">
                <input
                  id="range-from"
                  type="number"
                  min={1}
                  max={eligibleWords.length || 1}
                  value={range.from}
                  onChange={(e) => setRange((r) => ({ ...r, from: parseInt(e.target.value, 10) || 1 }))}
                />
                <span>to</span>
                <input
                  id="range-to"
                  type="number"
                  min={1}
                  max={eligibleWords.length || 1}
                  value={range.to}
                  onChange={(e) => setRange((r) => ({ ...r, to: parseInt(e.target.value, 10) || 1 }))}
                />
                <span className="muted">of {eligibleWords.length}</span>
              </div>
            </div>
            <Segmented<Order>
              legend="Order"
              value={order}
              onChange={setOrder}
              options={[
                { value: "shuffled", label: "Shuffled" },
                { value: "serial", label: "Serial (list order)" },
              ]}
            />
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="count">How many words</label>
              <div className="rangepick">
                <input
                  id="count"
                  type="number"
                  min={1}
                  max={available || 1}
                  value={count === 0 ? "" : count}
                  placeholder="All"
                  onChange={(e) => {
                    const v = e.target.value;
                    setCount(v === "" ? 0 : Math.max(1, parseInt(v, 10) || 1));
                  }}
                />
                <button type="button" className={`btn small ${count === 0 ? "primary" : ""}`} onClick={() => setCount(0)}>
                  All
                </button>
              </div>
            </div>
            <Segmented<Order>
              legend="Order"
              value={order}
              onChange={setOrder}
              options={[
                { value: "shuffled", label: "Shuffled" },
                { value: "serial", label: "Serial (list order)" },
              ]}
            />
          </>
        )}
        {tags.length > 0 && (
          <div className="field">
            <label htmlFor="tag">Only words tagged</label>
            <select id="tag" value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="">Any tag</option>
              {tags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
      </div>

      {(mode === "type" || mode === "game") && dir !== "bn-en" && (
        <p className="muted">Typing Bangla answers works best with a Bangla keyboard such as Avro or Bijoy.</p>
      )}
      {mode === "game" && (
        <p className="muted">Type the answer for each word. Correct answers score points, and a streak of correct answers earns a bonus.</p>
      )}
      {mode === "cloze" && (
        <p className="muted">You'll see each word's example sentence with the word blanked out — type the missing word. Direction doesn't apply here; only words with a usable example sentence are included.</p>
      )}

      <p className="notice" role="status">{note}</p>
      <div className="actions">
        <button className="btn primary" onClick={start} disabled={planned === 0}>Start</button>
        {words.length === 0 && <Link href="/words" className="btn">Add words first</Link>}
      </div>
    </>
  );
}