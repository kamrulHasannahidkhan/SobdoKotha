"use client";

import { useStore } from "@/lib/store";
import { DAILY_CATEGORIES } from "@/lib/types";
import { dayKey, daysAgo } from "@/lib/utils";

export default function DailyPage() {
  const { ready, stats, toggleDailyCategory, setDailyAll } = useStore();
  if (!ready) return <p className="muted">Opening your notebook…</p>;

  const today = dayKey();
  const todayDone = stats.dailyTasks[today] ?? [];
  const allIds = DAILY_CATEGORIES.map((c) => c.id);
  const allDoneToday = allIds.every((id) => todayDone.includes(id));

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    const key = dayKey(d);
    return {
      key,
      label: d.toLocaleDateString("en", { weekday: "short" }),
      date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      done: stats.dailyTasks[key] ?? [],
    };
  });
  const completeDays = week.filter((d) => allIds.every((id) => d.done.includes(id))).length;

  return (
    <>
      <h1>Daily</h1>
      <p className="lede">Five quick categories to cover every day. Tap a category to check it off, or mark the whole day done at once.</p>

      <section className="block" aria-labelledby="today-h">
        <h2 id="today-h">Today</h2>
        <ul className="daily-list">
          {DAILY_CATEGORIES.map((c) => {
            const done = todayDone.includes(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={`daily-item ${done ? "done" : ""}`}
                  aria-pressed={done}
                  onClick={() => toggleDailyCategory(today, c.id)}
                >
                  <span className="daily-check" aria-hidden="true">{done ? "✓" : ""}</span>
                  {c.label}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="actions">
          <button className={`btn ${allDoneToday ? "" : "primary"}`} onClick={() => setDailyAll(today, allIds, !allDoneToday)}>
            {allDoneToday ? "Unmark all" : "Mark all done"}
          </button>
          {allDoneToday && <span className="chip">Today complete</span>}
        </div>
      </section>

      <section className="block" aria-labelledby="week-h">
        <h2 id="week-h">Last 7 days</h2>
        <p className="muted">{completeDays} of 7 days fully complete. Tap any cell to toggle it, including earlier days.</p>
        <div className="weekgrid-wrap">
          <div className="weekgrid" role="table" aria-label="Last 7 days by category">
            <div className="weekgrid-row weekgrid-head" role="row">
              <span role="columnheader" />
              {week.map((d) => (
                <span key={d.key} role="columnheader" className={`weekgrid-day ${d.key === today ? "today" : ""}`}>
                  <b>{d.label}</b>
                  <small>{d.date}</small>
                </span>
              ))}
            </div>
            {DAILY_CATEGORIES.map((c) => (
              <div className="weekgrid-row" role="row" key={c.id}>
                <span role="rowheader" className="weekgrid-label">{c.label}</span>
                {week.map((d) => {
                  const done = d.done.includes(c.id);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      role="cell"
                      className={`weekgrid-cell ${done ? "done" : ""} ${d.key === today ? "today" : ""}`}
                      aria-pressed={done}
                      aria-label={`${c.label}, ${d.date}, ${done ? "done" : "not done"}`}
                      onClick={() => toggleDailyCategory(d.key, c.id)}
                    >
                      {done ? "✓" : ""}
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="weekgrid-row weekgrid-foot" role="row">
              <span role="rowheader" className="weekgrid-label">All done</span>
              {week.map((d) => {
                const done = allIds.every((id) => d.done.includes(id));
                return (
                  <span key={d.key} role="cell" className={`weekgrid-cell static ${done ? "done" : ""}`}>
                    {done ? "✓" : ""}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
