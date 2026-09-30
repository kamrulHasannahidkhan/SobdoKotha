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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Opening your notebook…</p>
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
    <div className="dashboard-container space-y-6 max-w-5xl mx-auto pb-10">
      {/* Hero / Overview Banner */}
      <header className="hero-banner bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="hero-text space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Today’s Session 🚀</h1>
          {words.length === 0 ? (
            <p className="lede text-indigo-100 text-lg">
              Your notebook is empty.{" "}
              <Link href="/words" className="link-highlight underline underline-offset-4 font-bold text-amber-300 hover:text-white transition-colors">
                Add your first word
              </Link>{" "}
              to begin learning.
            </p>
          ) : due > 0 ? (
            <p className="lede text-indigo-100 text-lg flex items-center gap-2 flex-wrap">
              <span className="badge warning bg-amber-400 text-amber-950 font-black px-3 py-1 rounded-full text-base shadow-sm">
                {due}
              </span>{" "}
              {due === 1 ? "word is" : "words are"} ready for review.
            </p>
          ) : (
            <p className="lede text-indigo-100 text-lg">
              ✨ You’re all caught up! Practice extra words or add new ones to your notebook.
            </p>
          )}
        </div>

        <div className="actions flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
          <Link
            href="/practice"
            className="btn primary lg bg-white text-indigo-600 hover:bg-indigo-50 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95 text-center flex-1 sm:flex-none"
          >
            Start Practice
          </Link>
          <Link
            href="/words"
            className="btn secondary lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold px-6 py-3.5 rounded-2xl transition-transform active:scale-95 text-center flex-1 sm:flex-none"
          >
            Manage Words
          </Link>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Redesigned Student-Friendly Daily Goal & Progress */}
        <section 
          className="block card goal-card bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden" 
          aria-labelledby="goal-h"
        >
          {/* Header & Target Input */}
          <div className="card-header flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h2 id="goal-h" className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span>🎯</span> Today's Target
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                {pct >= 100 ? "🎉 Daily goal smashed!" : "Keep the momentum going!"}
              </p>
            </div>

            <label className="inline-goal flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-1.5 rounded-2xl border border-slate-200 cursor-pointer">
              <span className="uppercase tracking-wider text-slate-400">Target</span>
              <input
                type="number"
                min={1}
                max={500}
                value={stats.dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value, 10))}
                className="num-input w-12 text-center font-extrabold text-indigo-600 bg-white border border-slate-200 rounded-lg py-0.5 px-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </label>
          </div>

          {/* Progress Bar & Counter */}
          <div className="progress-wrapper space-y-3">
            <div className="flex justify-between items-end">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{today}</span>
                <span className="text-sm font-extrabold text-slate-400">/ {stats.dailyGoal} words</span>
              </div>
              <span className={`pct-label px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                pct >= 100 
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" 
                  : "bg-indigo-50 text-indigo-600"
              }`}>
                {pct}% DONE
              </span>
            </div>

            {/* Custom Meter Track */}
            <div
              className="meter relative h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60"
              role="progressbar"
              aria-valuenow={today}
              aria-valuemin={0}
              aria-valuemax={stats.dailyGoal}
            >
              <i
                className={`block h-full rounded-full transition-all duration-700 ease-out ${
                  pct >= 100 
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm" 
                    : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Student Micro-Motivation Footer */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span className="flex items-center gap-2">
              {pct >= 100 ? "🌟" : "⚡"} 
              {pct >= 100 ? "Awesome focus today!" : `${Math.max(0, stats.dailyGoal - today)} more to hit your goal`}
            </span>
            {pct < 100 && (
              <Link href="/practice" className="text-indigo-600 hover:text-indigo-700 underline font-extrabold">
                Practice now →
              </Link>
            )}
          </div>
        </section>

        {/* Notebook Summary & SRS Distribution */}
        <section className="block card stats-card bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5" aria-labelledby="num-h">
          <h2 id="num-h" className="text-xl font-bold text-slate-800 flex items-center gap-2">
            📊 Notebook Summary
          </h2>

          <dl className="facts-grid grid grid-cols-2 gap-3">
            <div className="fact-item bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Words</dt>
              <dd className="text-2xl font-black text-slate-800">{words.length}</dd>
            </div>
            <div className="fact-item bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/60">
              <dt className="text-xs font-bold uppercase tracking-wider text-emerald-600">Mastered</dt>
              <dd className="text-2xl font-black text-emerald-700">{mastered}</dd>
            </div>
            <div className="fact-item bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/60">
              <dt className="text-xs font-bold uppercase tracking-wider text-amber-600">Current Streak</dt>
              <dd className="text-2xl font-black text-amber-700">
                🔥 {streak} {streak === 1 ? "day" : "days"}
              </dd>
            </div>
            <div className="fact-item bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100/60">
              <dt className="text-xs font-bold uppercase tracking-wider text-purple-600">Best Streak</dt>
              <dd className="text-2xl font-black text-purple-700">🏆 {Math.max(stats.bestStreak, streak)} days</dd>
            </div>
          </dl>

          {words.length > 0 && (
            <div className="srs-breakdown space-y-2 pt-2 border-t border-slate-100">
              <div className="levels flex h-3 rounded-full overflow-hidden gap-1" aria-hidden="true">
                <i className="l-new bg-sky-400 rounded-full transition-all duration-300" style={{ flexGrow: fresh }} />
                <i className="l-learn bg-amber-400 rounded-full transition-all duration-300" style={{ flexGrow: learning }} />
                <i className="l-done bg-emerald-400 rounded-full transition-all duration-300" style={{ flexGrow: mastered }} />
              </div>
              <p className="legend muted flex justify-between text-xs font-bold text-slate-500 pt-1">
                <span className="flex items-center gap-1.5"><b className="sw l-new w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> New ({fresh})</span>
                <span className="flex items-center gap-1.5"><b className="sw l-learn w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Learning ({learning})</span>
                <span className="flex items-center gap-1.5"><b className="sw l-done w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Mastered ({mastered})</span>
              </p>
            </div>
          )}
        </section>

        {/* Weekly Activity Bar Chart */}
        <section className="block card week-card bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4" aria-labelledby="week-h">
          <h2 id="week-h" className="text-xl font-bold text-slate-800 flex items-center gap-2">
            📅 Last 7 Days
          </h2>
          <div className="week-chart flex justify-between items-end h-36 gap-2 pt-4">
            {week.map((d) => (
              <div key={d.key} className="day-column flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="n-count text-xs font-bold text-slate-400">{d.n || 0}</span>
                <div className="bar-track w-full bg-slate-100 rounded-2xl h-24 flex items-end p-1">
                  <i
                    className="bar-fill w-full bg-indigo-500 rounded-xl transition-all duration-500 shadow-sm"
                    style={{
                      height: `${Math.max(d.n ? 12 : 6, (d.n / weekMax) * 100)}%`,
                    }}
                  />
                </div>
                <span className="d-label text-xs font-bold text-slate-600 uppercase">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Word of the Day */}
        {wod && (
          <section className="block card wod-card bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-3xl p-6 shadow-lg shadow-orange-100 flex flex-col justify-between" aria-labelledby="wod-h">
            <div className="card-header flex items-center justify-between mb-3">
              <h2 id="wod-h" className="text-xl font-black text-amber-100 uppercase tracking-wider text-xs">
                🌟 Word of the Day
              </h2>
              <div className="bg-white/20 rounded-full p-1 backdrop-blur-sm">
                <SpeakButton text={wod.english} />
              </div>
            </div>
            <div className="wod-content space-y-3">
              <div className="wod-main space-y-1">
                <p className="wod-en text-3xl font-extrabold">{wod.english}</p>
                <p className="wod-bn text-2xl font-bold text-amber-100" lang="bn">{wod.bangla}</p>
              </div>
              {wod.example && (
                <p className="wod-example text-sm font-medium text-amber-50 bg-black/10 p-3 rounded-2xl border border-white/10 italic">
                  “{wod.example}”
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}