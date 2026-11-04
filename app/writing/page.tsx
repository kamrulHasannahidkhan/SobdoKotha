"use client";

import { useEffect, useState } from "react";
import { COLLOCATIONS, CONNECTORS, SENTENCE_UPGRADES, WORD_ALTERNATIVES } from "@/lib/writing-seed";
import type { ConnectorCategory } from "@/lib/writing-types";
import { normalize, shuffle } from "@/lib/utils";

type Tab = "connectors" | "alternatives" | "collocations" | "quiz" | "upgrade";

const TABS: { id: Tab; label: string }[] = [
  { id: "connectors", label: "Connectors" },
  { id: "alternatives", label: "Word upgrades" },
  { id: "collocations", label: "Collocations" },
  { id: "quiz", label: "Word-bank quiz" },
  { id: "upgrade", label: "Sentence upgrade" },
];

const CATEGORY_LABEL: Record<ConnectorCategory, string> = {
  adding: "Adding information",
  contrast: "Showing contrast",
  reason: "Giving reasons",
  result: "Showing results",
  example: "Giving examples",
  opinion: "Giving an opinion",
  emphasis: "Emphasising",
  sequence: "Sequencing",
  concluding: "Concluding",
};

/* ---------- 1. connectors ---------- */

function ConnectorsSection() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ConnectorCategory | "all">("all");
  const needle = normalize(q);
  const shown = CONNECTORS.filter(
    (c) =>
      (cat === "all" || c.category === cat) &&
      (!needle ||
        normalize(c.word).includes(needle) ||
        c.alternatives.some((a) => normalize(a).includes(needle)) ||
        normalize(c.example).includes(needle)),
  );
  const categories = Object.keys(CATEGORY_LABEL) as ConnectorCategory[];

  return (
    <section className="block" aria-labelledby="conn-h">
      <h2 id="conn-h">Connectors</h2>
      <p className="muted">Link your ideas clearly. Natural use beats quantity: don't open every sentence with one.</p>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
        <div className="field">
          <label htmlFor="conn-q">Search</label>
          <input id="conn-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. however" />
        </div>
        <div className="field">
          <label htmlFor="conn-cat">Type</label>
          <select id="conn-cat" value={cat} onChange={(e) => setCat(e.target.value as ConnectorCategory | "all")}>
            <option value="all">All types</option>
            {categories.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </select>
        </div>
      </div>
      {shown.length === 0 && <p className="empty">No connectors match.</p>}
      {categories.map((c) => {
        const group = shown.filter((x) => x.category === c);
        if (group.length === 0) return null;
        return (
          <div key={c}>
            <h3 className="muted" style={{ margin: "18px 0 8px" }}>{CATEGORY_LABEL[c]}</h3>
            <div className="passage-list">
              {group.map((x) => (
                <div className="passage" key={x.id}>
                  <h3>{x.word}</h3>
                  <p className="muted">Also: {x.alternatives.join(" · ")}</p>
                  <p className="passage-text">{x.example}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* ---------- 2. word upgrades ---------- */

function AlternativesSection() {
  const [q, setQ] = useState("");
  const needle = normalize(q);
  const shown = WORD_ALTERNATIVES.filter(
    (w) => !needle || normalize(w.common).includes(needle) || w.alternatives.some((a) => normalize(a).includes(needle)),
  );

  return (
    <section className="block" aria-labelledby="alt-h">
      <h2 id="alt-h">Word upgrades</h2>
      <p className="muted">Plain word on the left, stronger options on the right. They are not always interchangeable: check the meaning still fits.</p>
      <div className="field" style={{ maxWidth: 360, marginBottom: 12 }}>
        <label htmlFor="alt-q">Search</label>
        <input id="alt-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. big" />
      </div>
      {shown.length === 0 && <p className="empty">No words match.</p>}
      <div className="passage-list">
        {shown.map((w) => (
          <div className="passage" key={w.id}>
            <h3>{w.common}</h3>
            <p className="chips">
              {w.alternatives.map((a) => <span className="chip" key={a}>{a}</span>)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 3. collocations ---------- */

function CollocationsSection() {
  const [q, setQ] = useState("");
  const needle = normalize(q);
  const shown = COLLOCATIONS.filter(
    (c) => !needle || normalize(c.phrase).includes(needle) || normalize(c.meaning).includes(needle),
  );

  return (
    <section className="block" aria-labelledby="col-h">
      <h2 id="col-h">Collocations</h2>
      <p className="muted">Words that naturally go together. Often worth more than a rare synonym.</p>
      <div className="field" style={{ maxWidth: 360, marginBottom: 12 }}>
        <label htmlFor="col-q">Search</label>
        <input id="col-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. impact" />
      </div>
      {shown.length === 0 && <p className="empty">No phrases match.</p>}
      <div className="passage-list">
        {shown.map((c) => (
          <div className="passage" key={c.id}>
            <h3>{c.phrase}</h3>
            <p className="muted">{c.meaning}</p>
            <p className="passage-text">{c.example}</p>
          </div>
        ))}
      </div>
      <p className="muted">Try it: pick three phrases and use each in a sentence about your own life.</p>
    </section>
  );
}

/* ---------- 4. word-bank quiz ---------- */

type QuizKind = "collocations" | "connectors";
type QuizItem = { id: string; answer: string; before: string; after: string };

function blankPhrase(sentence: string, phrase: string) {
  const i = sentence.toLowerCase().indexOf(phrase.toLowerCase());
  if (i < 0) return null;
  return { before: sentence.slice(0, i), after: sentence.slice(i + phrase.length) };
}

function buildQuiz(kind: QuizKind, count: number): QuizItem[] {
  const source =
    kind === "collocations"
      ? COLLOCATIONS.map((c) => ({ id: c.id, answer: c.phrase, sentence: c.example }))
      : CONNECTORS.map((c) => ({ id: c.id, answer: c.word, sentence: c.example }));
  const items: QuizItem[] = [];
  for (const s of shuffle(source)) {
    const b = blankPhrase(s.sentence, s.answer);
    if (!b) continue;
    items.push({ id: s.id, answer: s.answer, ...b });
    if (items.length >= count) break;
  }
  return items;
}

function QuizSection() {
  const [kind, setKind] = useState<QuizKind>("collocations");
  const [count, setCount] = useState(6);
  const [items, setItems] = useState<QuizItem[]>([]);
  const [bank, setBank] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  function build() {
    const next = buildQuiz(kind, count);
    setItems(next);
    setBank(shuffle(next.map((i) => i.answer)));
    setAnswers({});
    setChecked(false);
  }

  useEffect(() => {
    build();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, count]);

  const isRight = (i: QuizItem) => normalize(answers[i.id] ?? "") === normalize(i.answer);
  const right = items.filter(isRight).length;
  const pct = items.length ? Math.round((right / items.length) * 100) : 0;

  return (
    <section className="block" aria-labelledby="quiz-h">
      <h2 id="quiz-h">Word-bank quiz</h2>
      <p className="muted">Fill each gap with the right item from the bank. Each one is used once.</p>

      <div className="leveltabs" style={{ flexWrap: "wrap" }}>
        <button type="button" className="leveltab" aria-selected={kind === "collocations"} onClick={() => setKind("collocations")}>Collocations</button>
        <button type="button" className="leveltab" aria-selected={kind === "connectors"} onClick={() => setKind("connectors")}>Connectors</button>
        <label className="inline" style={{ marginLeft: 12 }}>
          Sentences
          <input
            type="number"
            min={3}
            max={10}
            value={count}
            onChange={(e) => setCount(Math.max(3, Math.min(10, parseInt(e.target.value, 10) || 6)))}
            className="num"
          />
        </label>
      </div>

      <div className="passage" style={{ marginBottom: 16 }}>
        <h3>Word bank</h3>
        <p className="chips">
          {bank.map((b) => <span className="chip" key={b}>{b}</span>)}
        </p>
      </div>

      <ol className="qa-list">
        {items.map((it, n) => {
          const ok = isRight(it);
          return (
            <li className="qa-item" key={it.id}>
              <p className="passage-text" style={{ marginBottom: 6 }}>
                {n + 1}. {it.before}
                <input
                  aria-label={`Answer for sentence ${n + 1}`}
                  value={answers[it.id] ?? ""}
                  readOnly={checked}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  onChange={(e) => setAnswers((a) => ({ ...a, [it.id]: e.target.value }))}
                  style={{
                    width: `${Math.max(it.answer.length + 3, 12)}ch`,
                    display: "inline-block",
                    padding: "2px 8px",
                    margin: "0 4px",
                    borderColor: checked ? (ok ? "var(--good)" : "var(--bad)") : undefined,
                  }}
                />
                {it.after}
              </p>
              {checked && (
                <p className={`verdict ${ok ? "good" : "bad"}`} role="status">
                  {ok ? "Correct." : <>Answer: <b>{it.answer}</b></>}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {items.length === 0 && <p className="empty">Couldn't build a quiz from this list.</p>}
      {checked && items.length > 0 && (
        <p className="lede">{right} of {items.length} correct ({pct}%).</p>
      )}
      <div className="actions">
        {!checked ? (
          <button className="btn primary" onClick={() => setChecked(true)} disabled={items.length === 0}>Check answers</button>
        ) : (
          <button className="btn primary" onClick={build}>New quiz</button>
        )}
        {!checked && <button className="btn" onClick={build}>Shuffle</button>}
      </div>
    </section>
  );
}

/* ---------- 5. sentence upgrade ---------- */

const ATTEMPTS_KEY = "shobdo-khata:writing-attempts";

function useAttempts() {
  const [attempts, setAttempts] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ATTEMPTS_KEY);
      if (raw) setAttempts(JSON.parse(raw) as Record<string, string>);
    } catch {
      /* ignore corrupted or blocked storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch {
      /* storage full or blocked */
    }
  }, [attempts, loaded]);

  return [attempts, (id: string, text: string) => setAttempts((a) => ({ ...a, [id]: text }))] as const;
}

function UpgradeSection() {
  const [attempts, setAttempt] = useAttempts();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  return (
    <section className="block" aria-labelledby="up-h">
      <h2 id="up-h">Sentence upgrade</h2>
      <p className="muted">Rewrite each plain sentence at a higher level, then reveal a model version to compare. Yours can differ: look at word choice and structure, not exact wording.</p>
      <ol className="qa-list">
        {SENTENCE_UPGRADES.map((s, i) => (
          <li className="qa-item" key={s.id}>
            <p className="passage-text" style={{ marginBottom: 8 }}><b>{i + 1}. Basic:</b> {s.basic}</p>
            <textarea
              className="qa-answer"
              rows={2}
              placeholder="Your upgraded version…"
              value={attempts[s.id] ?? ""}
              onChange={(e) => setAttempt(s.id, e.target.value)}
              aria-label={`Your upgraded version of sentence ${i + 1}`}
            />
            <div className="actions" style={{ margin: "8px 0 0" }}>
              <button className="btn small" onClick={() => setRevealed((r) => ({ ...r, [s.id]: !r[s.id] }))}>
                {revealed[s.id] ? "Hide model" : "Show model"}
              </button>
            </div>
            {revealed[s.id] && <p className="passage-text" style={{ marginTop: 8 }}><b>Model:</b> {s.upgraded}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- page ---------- */

export default function WritingPage() {
  const [tab, setTab] = useState<Tab>("connectors");

  return (
    <>
      <h1>Writing</h1>
      <p className="lede">Tools for Writing Task 2 and Speaking: connectors, stronger word choices, collocations, and practice.</p>

      <div className="leveltabs" role="tablist" aria-label="Writing tools" style={{ flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" className="leveltab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "connectors" && <ConnectorsSection />}
      {tab === "alternatives" && <AlternativesSection />}
      {tab === "collocations" && <CollocationsSection />}
      {tab === "quiz" && <QuizSection />}
      {tab === "upgrade" && <UpgradeSection />}
    </>
  );
}
