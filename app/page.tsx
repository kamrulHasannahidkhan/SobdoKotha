"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { isDue, isMastered, isNew } from "@/lib/srs";
import { currentStreak, dayKey, daysAgo } from "@/lib/utils";
import { SpeakButton } from "@/components/SpeakButton";

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export default function Today() {
  const { ready, words, stats, setDailyGoal } = useStore();
  if (!ready) return <p className="muted">Opening your notebook…</p>;

  const now = Date.now();
  const due = words.filter((w) => isDue(w, now)).length;
  const fresh = words.filter(isNew).length;
  const mastered = words.filter(isMastered).length;
  const learning = words.length - fresh - mastered;
  const today = stats.history[dayKey()] ?? 0;
  const pct = Math.min(100, Math.round((today / stats.dailyGoal) * 100));
  const streak = currentStreak(stats);
  const wod = words.length ? words[hash(dayKey()) % words.length] : null;

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    return {
      key: dayKey(d),
      label: d.toLocaleDateString("en", { weekday: "short" }),
      n: stats.history[dayKey(d)] ?? 0,
    };
  });
  const weekMax = Math.max(1, ...week.map((d) => d.n));

  return (
    <>
      <h1>Today</h1>
      {words.length === 0 ? (
        <p className="lede">
          Your notebook is empty. <Link href="/words">Add your first word</Link> to begin.
        </p>
      ) : due > 0 ? (
        <p className="lede">
          {due} {due === 1 ? "word is" : "words are"} ready to review.
        </p>
      ) : (
        <p className="lede">Nothing is due right now. Practice any word, or add a few new ones.</p>
      )}
      <div className="actions">
        <Link href="/practice" className="btn primary">
          Start practice
        </Link>
        <Link href="/words" className="btn">
          Add or edit words
        </Link>
      </div>

      <section className="block" aria-labelledby="goal-h">
        <h2 id="goal-h">Daily goal</h2>
        <div className="meter" role="progressbar" aria-valuenow={today} aria-valuemin={0} aria-valuemax={stats.dailyGoal}>
          <i style={{ width: `${pct}%` }} />
        </div>
        <p className="row-between">
          <span>
            {today} of {stats.dailyGoal} answers today
          </span>
          <label className="inline">
            Goal
            <input
              type="number"
              min={1}
              max={500}
              value={stats.dailyGoal}
              onChange={(e) => setDailyGoal(parseInt(e.target.value, 10))}
              className="num"
            />
          </label>
        </p>
      </section>

      <section className="block" aria-labelledby="num-h">
        <h2 id="num-h">Your notebook</h2>
        <dl className="facts">
          <div>
            <dt>Words</dt>
            <dd>{words.length}</dd>
          </div>
          <div>
            <dt>Mastered</dt>
            <dd>{mastered}</dd>
          </div>
          <div>
            <dt>Day streak</dt>
            <dd>{streak}</dd>
          </div>
          <div>
            <dt>Best streak</dt>
            <dd>{Math.max(stats.bestStreak, streak)}</dd>
          </div>
        </dl>
        {words.length > 0 && (
          <>
            <div className="levels" aria-hidden="true">
              <i className="l-new" style={{ flexGrow: fresh }} />
              <i className="l-learn" style={{ flexGrow: learning }} />
              <i className="l-done" style={{ flexGrow: mastered }} />
            </div>
            <p className="legend muted">
              <span><b className="sw l-new" />New {fresh}</span>
              <span><b className="sw l-learn" />Learning {learning}</span>
              <span><b className="sw l-done" />Mastered {mastered}</span>
            </p>
          </>
        )}
      </section>

      <section className="block" aria-labelledby="week-h">
        <h2 id="week-h">Last 7 days</h2>
        <div className="week">
          {week.map((d) => (
            <div key={d.key} className="day">
              <span className="n">{d.n || ""}</span>
              <i style={{ height: `${Math.max(d.n ? 8 : 3, (d.n / weekMax) * 64)}px` }} />
              <span className="d">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      {wod && (
        <section className="block" aria-labelledby="wod-h">
          <h2 id="wod-h">Word of the day</h2>
          <div className="wod">
            <p className="wod-en">{wod.english}</p>
            <p className="wod-bn" lang="bn">
              {wod.bangla}
            </p>
            {wod.example && <p className="muted">{wod.example}</p>}
            <SpeakButton text={wod.english} />
          </div>
        </section>
      )}
    </>
  );
}
