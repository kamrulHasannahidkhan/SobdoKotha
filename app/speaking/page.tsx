"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { speak } from "@/lib/speech";
import type { ReadingLevel } from "@/lib/types";

const LEVELS: { id: ReadingLevel; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

function InterviewSection() {
  const { interviewQuestions, addInterviewQuestion, updateInterviewAnswer, updateInterviewQuestion, deleteInterviewQuestion } = useStore();
  const [newQ, setNewQ] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  function addQuestion() {
    if (!newQ.trim()) return;
    addInterviewQuestion(newQ);
    setNewQ("");
  }

  return (
    <section className="block" aria-labelledby="interview-h">
      <h2 id="interview-h">Partner interview</h2>
      <p className="muted">Practice answering out loud with a partner, then write your answer below to lock it in.</p>

      <ol className="qa-list">
        {interviewQuestions.map((q, i) => (
          <li key={q.id} className="qa-item">
            <div className="qa-q">
              {editingId === q.id ? (
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => { updateInterviewQuestion(q.id, editText); setEditingId(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  className="qa-q-text"
                  onClick={() => { setEditingId(q.id); setEditText(q.question); }}
                  title="Edit question"
                >
                  {i + 1}. {q.question}
                </button>
              )}
              <button
                type="button"
                className="btn small danger ghost"
                onClick={() => { if (confirm("Delete this question?")) deleteInterviewQuestion(q.id); }}
              >
                Delete
              </button>
            </div>
            <textarea
              className="qa-answer"
              rows={2}
              placeholder="Your answer…"
              value={q.answer}
              onChange={(e) => updateInterviewAnswer(q.id, e.target.value)}
            />
          </li>
        ))}
      </ol>

      <div className="qa-add">
        <input
          value={newQ}
          onChange={(e) => setNewQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addQuestion(); }}
          placeholder="Add another question…"
        />
        <button type="button" className="btn" onClick={addQuestion}>Add question</button>
      </div>
    </section>
  );
}

function PassageCard({ passage }: { passage: ReturnType<typeof useStore>["readingPassages"][number] }) {
  const { updateReadingPassage, deleteReadingPassage, markPassagePracticed } = useStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(passage.title);
  const [text, setText] = useState(passage.text);
  const count = passage.practiced.length;
  const last = count > 0 ? new Date(passage.practiced[count - 1]).toLocaleDateString() : null;

  function save() {
    updateReadingPassage(passage.id, { level: passage.level, title, text });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="passage editing">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Passage text…" />
        <div className="actions">
          <button className="btn primary" onClick={save}>Save</button>
          <button className="btn" onClick={() => { setTitle(passage.title); setText(passage.text); setEditing(false); }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="passage">
      <h3>{passage.title}</h3>
      <p className="passage-text">{passage.text}</p>
      <p className="muted">
        {count > 0 ? `Practiced ${count} ${count === 1 ? "time" : "times"} — last on ${last}.` : "Not practiced yet."}
      </p>
      <div className="actions">
        <button className="btn" onClick={() => speak(passage.text)}>Hear it</button>
        <button className="btn primary" onClick={() => markPassagePracticed(passage.id)}>Mark practiced</button>
        <button className="btn small" onClick={() => setEditing(true)}>Edit</button>
        <button
          className="btn small danger"
          onClick={() => { if (confirm(`Delete "${passage.title}"?`)) deleteReadingPassage(passage.id); }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function AddPassageForm() {
  const { addReadingPassage } = useStore();
  const [level, setLevel] = useState<ReadingLevel>("beginner");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  function submit() {
    if (!title.trim() || !text.trim()) return;
    addReadingPassage({ level, title, text });
    setTitle("");
    setText("");
    titleRef.current?.focus();
  }

  return (
    <details className="bulk">
      <summary>Add a passage</summary>
      <div className="passage-form">
        <div className="field">
          <label htmlFor="pass-level">Level</label>
          <select id="pass-level" value={level} onChange={(e) => setLevel(e.target.value as ReadingLevel)}>
            {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pass-title">Title</label>
          <input id="pass-title" ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field wide">
          <label htmlFor="pass-text">Passage</label>
          <textarea id="pass-text" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="actions">
          <button type="button" className="btn primary" onClick={submit}>Add passage</button>
        </div>
      </div>
    </details>
  );
}

function ReadAloudSection() {
  const { readingPassages } = useStore();
  const [level, setLevel] = useState<ReadingLevel>("beginner");
  const shown = readingPassages.filter((p) => p.level === level);

  return (
    <section className="block" aria-labelledby="reading-h">
      <h2 id="reading-h">Read aloud practice</h2>
      <p className="muted">Pick a level, read the passage a few times out loud, then mark it practiced.</p>

      <div className="leveltabs" role="tablist" aria-label="Reading level">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            className="leveltab"
            aria-selected={level === l.id}
            onClick={() => setLevel(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="empty">No passages at this level yet.</p>
      ) : (
        <div className="passage-list">
          {shown.map((p) => <PassageCard key={p.id} passage={p} />)}
        </div>
      )}

      <AddPassageForm />
    </section>
  );
}

export default function SpeakingPage() {
  const { ready } = useStore();
  if (!ready) return <p className="muted">Opening your notebook…</p>;

  return (
    <>
      <h1>Speaking</h1>
      <p className="lede">Two short exercises: answer interview-style questions, and read a passage aloud at your level.</p>
      <InterviewSection />
      <ReadAloudSection />
    </>
  );
}
