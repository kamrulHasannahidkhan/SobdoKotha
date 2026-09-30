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
  if (!ready) {
    return (
      <div className="skeleton-loader">
        <p className="muted">Opening your notebook…</p>
      </div>
    );
  }

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
    <div className="dashboard-container">
      {/* Hero / Overview Banner */}
      <header className="hero-banner">
        <div className="hero-text">
          <h1>Today’s Session</h1>
          {words.length === 0 ? (
            <p className="lede">
              Your notebook is empty.{" "}
              <Link href="/words" className="link-highlight">
                Add your first word
              </Link>{" "}
              to begin learning.
            </p>
          ) : due > 0 ? (
            <p className="lede">
              <span className="badge warning">{due}</span>{" "}
              {due === 1 ? "word is" : "words are"} ready for review.
            </p>
          ) : (
            <p className="lede">
              ✨ You’re all caught up! Practice extra words or add new ones to your notebook.
            </p>
          )}
        </div>
        <div className="actions">
          <Link href="/practice" className="btn primary lg">
            Start Practice
          </Link>
          <Link href="/words" className="btn secondary lg">
            Manage Words
          </Link>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Daily Goal & Progress */}
        <section className="block card goal-card" aria-labelledby="goal-h">
          <div className="card-header">
            <h2 id="goal-h">Daily Goal</h2>
            <label className="inline-goal">
              <span>Target</span>
              <input
                type="number"
                min={1}
                max={500}
                value={stats.dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value, 10))}
                className="num-input"
              />
            </label>
          </div>

          <div className="progress-wrapper">
            <div
              className="meter"
              role="progressbar"
              aria-valuenow={today}
              aria-valuemin={0}
              aria-valuemax={stats.dailyGoal}
            >
              <i style={{ width: `${pct}%` }} />
            </div>
            <div className="progress-details">
              <span>{today} of {stats.dailyGoal} completed</span>
              <span className="pct-label">{pct}%</span>
            </div>
          </div>
        </section>

        {/* Notebook Summary & SRS Distribution */}
        <section className="block card stats-card" aria-labelledby="num-h">
          <h2 id="num-h">Notebook Summary</h2>
          <dl className="facts-grid">
            <div className="fact-item">
              <dt>Total Words</dt>
              <dd>{words.length}</dd>
            </div>
            <div className="fact-item">
              <dt>Mastered</dt>
              <dd>{mastered}</dd>
            </div>
            <div className="fact-item">
              <dt>Current Streak</dt>
              <dd>{streak} {streak === 1 ? "day" : "days"}</dd>
            </div>
            <div className="fact-item">
              <dt>Best Streak</dt>
              <dd>{Math.max(stats.bestStreak, streak)} days</dd>
            </div>
          </dl>

          {words.length > 0 && (
            <div className="srs-breakdown">
              <div className="levels" aria-hidden="true">
                <i className="l-new" style={{ flexGrow: fresh }} />
                <i className="l-learn" style={{ flexGrow: learning }} />
                <i className="l-done" style={{ flexGrow: mastered }} />
              </div>
              <p className="legend muted">
                <span><b className="sw l-new" /> New ({fresh})</span>
                <span><b className="sw l-learn" /> Learning ({learning})</span>
                <span><b className="sw l-done" /> Mastered ({mastered})</span>
              </p>
            </div>
          )}
        </section>

        {/* Weekly Activity Bar Chart */}
        <section className="block card week-card" aria-labelledby="week-h">
          <h2 id="week-h">Last 7 Days</h2>
          <div className="week-chart">
            {week.map((d) => (
              <div key={d.key} className="day-column">
                <span className="n-count">{d.n || 0}</span>
                <div className="bar-track">
                  <i
                    className="bar-fill"
                    style={{
                      height: `${Math.max(d.n ? 12 : 4, (d.n / weekMax) * 100)}%`,
                    }}
                  />
                </div>
                <span className="d-label">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Word of the Day */}
        {wod && (
          <section className="block card wod-card" aria-labelledby="wod-h">
            <div className="card-header">
              <h2 id="wod-h">Word of the Day</h2>
              <SpeakButton text={wod.english} />
            </div>
            <div className="wod-content">
              <div className="wod-main">
                <p className="wod-en">{wod.english}</p>
                <p className="wod-bn" lang="bn">{wod.bangla}</p>
              </div>
              {wod.example && <p className="wod-example">“{wod.example}”</p>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}