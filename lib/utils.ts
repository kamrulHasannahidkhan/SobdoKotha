import type { Stats, Word, WordInput } from "./types";

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export function dayKey(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/** Streak shown to the user: it lapses if you skipped yesterday. */
export function currentStreak(stats: Stats) {
  if (stats.lastDay === dayKey() || stats.lastDay === dayKey(daysAgo(1))) return stats.streak;
  return 0;
}

export function makeWord(input: WordInput, createdAt: number = Date.now()): Word {
  return {
    id: uid(),
    english: input.english.trim(),
    bangla: input.bangla.trim(),
    pos: input.pos ?? "",
    example: (input.example ?? "").trim(),
    tags: input.tags ?? [],
    box: 0,
    due: 0,
    correct: 0,
    wrong: 0,
    starred: false,
    createdAt,
  };
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function parseTags(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/[,;]/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

/** Lowercase, strip punctuation and joiners so typed answers compare fairly. */
export function normalize(s: string) {
  return s
    .normalize("NFC")
    .replace(/[\u200c\u200d]/g, "")
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}।]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "খাঁটি / প্রামাণিক" accepts either meaning, or the whole string. */
export function acceptedAnswers(text: string): string[] {
  const parts = text.split(/[,;/|]/).map(normalize).filter(Boolean);
  return Array.from(new Set([normalize(text), ...parts]));
}

export function firstGrapheme(text: string) {
  const t = text.trim();
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    for (const s of seg.segment(t)) return s.segment;
  }
  return Array.from(t)[0] ?? "";
}

export function wordKey(english: string, bangla: string) {
  return `${normalize(english)}|${normalize(bangla)}`;
}

/* ---------- CSV ---------- */

export function toCSV(words: Word[]) {
  const esc = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const rows = [
    ["english", "bangla", "pos", "example", "tags"],
    ...words.map((w) => [w.english, w.bangla, w.pos, w.example, w.tags.join(";")]),
  ];
  // BOM keeps Bangla readable when the file is opened in Excel
  return "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
}

export function parseCSV(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export function download(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
