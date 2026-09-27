"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { acceptedAnswers, normalize, shuffle } from "@/lib/utils";
import type { GameResult, Word } from "@/lib/types";

type Length = 10 | 20 | 50 | 0; // 0 = all words
type Phase = "setup" | "playing" | "done";

const STREAK_CAP = 5;
const POINTS_BASE = 10;
const POINTS_PER_STREAK = 2;

function pointsFor(streakBefore: number) {
  return POINTS_BASE + Math.min(streakBefore, STREAK_CAP) * POINTS_PER_STREAK;
}

function bestFor(results: GameResult[], total: number) {
  return results
    .filter((r) => r.total === total)
    .reduce<GameResult | null>((best, r) => (!best || r.points > best.points ? r : best), null);
}

function Setup({ onStart }: { onStart: (length: Length, tag: string) => void }) {
  const { words, gameResults } = useStore();
  const [length, setLength] = useState<Length>(10);
  const tags = useMemo(() => Array.from(new Set(words.flatMap((w) => w.tags))).sort(), [words]);
  const [tag, setTag] = useState("");

  const poolSize = tag ? words.filter((w) => w.tags.includes(tag)).length : words.length;
  const planned = length === 0 ? poolSize : Math.min(length, poolSize);
  const best = bestFor(gameResults, planned);
  const recent = gameResults.slice(0, 5);

  return (
    <>
      <h1>Word test</h1>
      <p className="lede">You&rsquo;ll see a Bangla word. Type the English word before you check the next one. Answer streaks earn bonus points.</p>

      {words.length < 4 ? (
        <p className="empty">
          You need at least a few words for a fair test. <Link href="/words">Add some words</Link> first.
        </p>
      ) : (
        <>
          <div className="setup">
            <fieldset className="seg">
              <legend>How many words</legend>
              <div>
                {([10, 20, 50, 0] as Length[]).map((n) => (
                  <label key={n}>
                    <input type="radio" name="len" checked={length === n} onChange={() => setLength(n)} />
                    <span>{n === 0 ? "All" : n}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {tags.length > 0 && (
              <div className="field">
                <label htmlFor="gtag">Only words tagged</label>
                <select id="gtag" value={tag} onChange={(e) => setTag(e.target.value)}>
                  <option value="">Any tag</option>
                  {tags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <p className="notice" role="status">
            {planned} {planned === 1 ? "word" : "words"} in this test.
            {best ? ` Best for this length: ${best.points} pts (${best.correct}/${best.total}).` : ""}
          </p>
          <div className="actions">
            <button className="btn primary" disabled={planned < 1} onClick={() => onStart(length, tag)}>
              Start test
            </button>
          </div>

          {recent.length > 0 && (
            <section className="block" aria-labelledby="recent-h">
              <h2 id="recent-h">Recent results</h2>
              <ul className="missed">
                {recent.map((r) => (
                  <li key={r.id}>
                    <span>{new Date(r.date).toLocaleDateString()}</span>
                    <span>
                      {r.correct}/{r.total} correct — {r.points} pts
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}

function Round({
  queue,
  onFinish,
}: {
  queue: Word[];
  onFinish: (log: { word: Word; correct: boolean; userAnswer: string }[]) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<null | { correct: boolean; points: number }>(null);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const logRef = useRef<{ word: Word; correct: boolean; userAnswer: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const word = queue[idx];
  const total = queue.length;

  useEffect(() => {
    inputRef.current?.focus();
  }, [idx]);

  function submit() {
    if (result !== null) return;
    const correct = acceptedAnswers(word.english).includes(normalize(value));
    const gained = correct ? pointsFor(streak) : 0;
    logRef.current.push({ word, correct, userAnswer: value });
    setResult({ correct, points: gained });
    setPoints((p) => p + gained);
    setStreak((s) => (correct ? s + 1 : 0));
  }

  function giveUp() {
    if (result !== null) return;
    logRef.current.push({ word, correct: false, userAnswer: value });
    setResult({ correct: false, points: 0 });
    setStreak(0);
  }

  function next() {
    if (idx + 1 >= total) {
      onFinish(logRef.current);
      return;
    }
    setIdx((i) => i + 1);
    setValue("");
    setResult(null);
  }

  return (
    <>
      <div className="session-head">
        <span className="muted">
          Word {idx + 1} of {total}
        </span>
        <span className="chip">{points} pts</span>
        {streak > 1 && <span className="chip">Streak {streak}</span>}
      </div>
      <div className="meter thin" aria-hidden="true">
        <i style={{ width: `${(idx / total) * 100}%` }} />
      </div>

      <div className="card compact">
        <p className="prompt" lang="bn">
          {word.bangla}
        </p>
        {word.pos && <p className="muted pos-line">{word.pos}</p>}
      </div>

      <div className="typebox">
        <label htmlFor="gtyped">Type the English word</label>
        <input
          id="gtyped"
          ref={inputRef}
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
            if (result === null) submit();
            else next();
          }}
        />
      </div>

      {result === null ? (
        <div className="actions">
          <button className="btn primary" onClick={submit} disabled={!value.trim()}>
            Submit <kbd>Enter</kbd>
          </button>
          <button className="btn ghost" onClick={giveUp}>
            I don&rsquo;t know
          </button>
        </div>
      ) : (
        <>
          <p className={`verdict ${result.correct ? "good" : "bad"}`} role="status">
            {result.correct ? (
              <>Correct! +{result.points} pts</>
            ) : (
              <>
                Not quite. The answer is <b lang="en">{word.english}</b>
              </>
            )}
          </p>
          {word.example && <p className="muted example">{word.example}</p>}
          <div className="actions">
            <button className="btn primary" autoFocus onClick={next}>
              {idx + 1 >= total ? "See score" : "Next"} <kbd>Enter</kbd>
            </button>
          </div>
        </>
      )}
    </>
  );
}

function Results({
  log,
  onAgain,
  onSetup,
}: {
  log: { word: Word; correct: boolean; userAnswer: string }[];
  onAgain: () => void;
  onSetup: () => void;
}) {
  const { gameResults } = useStore();
  const total = log.length;
  const correct = log.filter((l) => l.correct).length;
  const missed = log.filter((l) => !l.correct);
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  const thisResult = gameResults[0];
  const points = thisResult?.points ?? 0;
  const previousBest = bestFor(gameResults.slice(1), total);
  const isNewBest = total > 0 && (!previousBest || points > previousBest.points);

  return (
    <>
      <h1>Test complete</h1>
      <p className="lede">
        {correct} of {total} correct ({accuracy}%) — {points} points
        {isNewBest && <span className="chip"> New best</span>}
      </p>

      {missed.length > 0 ? (
        <section className="block">
          <h2>Words to review</h2>
          <ul className="missed">
            {missed.map((l, i) => (
              <li key={i}>
                <span lang="bn">{l.word.bangla}</span>
                <span>
                  <b lang="en">{l.word.english}</b>
                  {l.userAnswer && <span className="muted"> — you wrote &ldquo;{l.userAnswer}&rdquo;</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        total > 0 && <p className="notice">Perfect score — every word correct.</p>
      )}

      <div className="actions">
        <button className="btn primary" onClick={onAgain}>
          Play again
        </button>
        <button className="btn" onClick={onSetup}>
          Change settings
        </button>
        <Link href="/practice" className="btn">
          Practice these words
        </Link>
      </div>
    </>
  );
}

export default function GamePage() {
  const { ready, words, recordGameResult } = useStore();
  const [phase, setPhase] = useState<Phase>("setup");
  const [queue, setQueue] = useState<Word[]>([]);
  const [log, setLog] = useState<{ word: Word; correct: boolean; userAnswer: string }[]>([]);
  const [run, setRun] = useState(0);
  const [lastPick, setLastPick] = useState<{ length: Length; tag: string }>({ length: 10, tag: "" });

  if (!ready) return <p className="muted">Opening your notebook…</p>;

  function buildQueue(length: Length, tag: string) {
    const base = tag ? words.filter((w) => w.tags.includes(tag)) : words;
    const list = shuffle(base);
    return length === 0 ? list : list.slice(0, length);
  }

  function start(length: Length, tag: string) {
    setLastPick({ length, tag });
    setQueue(buildQueue(length, tag));
    setPhase("playing");
    setRun((r) => r + 1);
  }

  function finish(finishedLog: { word: Word; correct: boolean; userAnswer: string }[]) {
    const correct = finishedLog.filter((l) => l.correct).length;
    let streak = 0;
    let best = 0;
    let points = 0;
    for (const l of finishedLog) {
      if (l.correct) {
        points += pointsFor(streak);
        streak += 1;
        best = Math.max(best, streak);
      } else {
        streak = 0;
      }
    }
    recordGameResult({ total: finishedLog.length, correct, points, bestStreak: best });
    setLog(finishedLog);
    setPhase("done");
  }

  if (phase === "playing") {
    return <Round key={run} queue={queue} onFinish={finish} />;
  }
  if (phase === "done") {
    return <Results log={log} onAgain={() => start(lastPick.length, lastPick.tag)} onSetup={() => setPhase("setup")} />;
  }
  return <Setup onStart={start} />;
}
