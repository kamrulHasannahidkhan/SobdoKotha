"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ImportItem, Stats, Word, WordInput } from "./types";
import { grade } from "./srs";
import { seedWords } from "./seed";
import { dayKey, daysAgo, makeWord, wordKey } from "./utils";

const KEY = "shobdo-khata:v1";
const DEFAULT_STATS: Stats = { streak: 0, bestStreak: 0, lastDay: "", history: {}, dailyGoal: 20 };

type State = { words: Word[]; stats: Stats };

type Store = {
  ready: boolean;
  words: Word[];
  stats: Stats;
  addWord: (input: WordInput) => void;
  updateWord: (id: string, input: WordInput) => void;
  deleteWord: (id: string) => void;
  toggleStar: (id: string) => void;
  recordAnswer: (id: string, correct: boolean) => void;
  importWords: (items: ImportItem[]) => { added: number; skipped: number };
  setDailyGoal: (n: number) => void;
  resetProgress: () => void;
  loadStarter: () => number;
  clearAll: () => void;
};

const Ctx = createContext<Store | null>(null);

function bump(stats: Stats): Stats {
  const today = dayKey();
  const history = { ...stats.history, [today]: (stats.history[today] ?? 0) + 1 };
  let streak = stats.streak;
  if (stats.lastDay !== today) {
    streak = stats.lastDay === dayKey(daysAgo(1)) ? stats.streak + 1 : 1;
  }
  return {
    ...stats,
    history,
    streak,
    bestStreak: Math.max(stats.bestStreak, streak),
    lastDay: today,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ words: [], stats: DEFAULT_STATS });
  const [ready, setReady] = useState(false);
  const ref = useRef(state);
  ref.current = state;

  // Load once on the client
  useEffect(() => {
    let next: State = { words: seedWords(), stats: DEFAULT_STATS };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<State>;
        next = {
          words: Array.isArray(p.words) ? p.words : [],
          stats: { ...DEFAULT_STATS, ...(p.stats ?? {}) },
        };
      }
    } catch {
      /* corrupted or blocked storage: start from the starter list */
    }
    setState(next);
    setReady(true);
  }, []);

  // Save on every change
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state, ready]);

  const store: Store = {
    ready,
    words: state.words,
    stats: state.stats,

    addWord: (input) => setState((s) => ({ ...s, words: [makeWord(input), ...s.words] })),

    updateWord: (id, input) =>
      setState((s) => ({
        ...s,
        words: s.words.map((w) =>
          w.id === id
            ? {
                ...w,
                english: input.english.trim(),
                bangla: input.bangla.trim(),
                pos: input.pos,
                example: input.example.trim(),
                tags: input.tags,
              }
            : w,
        ),
      })),

    deleteWord: (id) => setState((s) => ({ ...s, words: s.words.filter((w) => w.id !== id) })),

    toggleStar: (id) =>
      setState((s) => ({
        ...s,
        words: s.words.map((w) => (w.id === id ? { ...w, starred: !w.starred } : w)),
      })),

    recordAnswer: (id, correct) =>
      setState((s) => ({
        words: s.words.map((w) => (w.id === id ? grade(w, correct) : w)),
        stats: bump(s.stats),
      })),

    importWords: (items) => {
      const seen = new Set(ref.current.words.map((w) => wordKey(w.english, w.bangla)));
      const fresh: Word[] = [];
      let skipped = 0;
      const now = Date.now();
      items.forEach((it, i) => {
        const english = it.english?.trim();
        const bangla = it.bangla?.trim();
        const key = wordKey(english ?? "", bangla ?? "");
        if (!english || !bangla || seen.has(key)) {
          skipped++;
          return;
        }
        seen.add(key);
        const base = makeWord(it, now - i);
        fresh.push({
          ...base,
          box: typeof it.box === "number" ? it.box : 0,
          due: typeof it.due === "number" ? it.due : 0,
          correct: typeof it.correct === "number" ? it.correct : 0,
          wrong: typeof it.wrong === "number" ? it.wrong : 0,
          starred: !!it.starred,
        });
      });
      if (fresh.length) setState((s) => ({ ...s, words: [...fresh, ...s.words] }));
      return { added: fresh.length, skipped };
    },

    setDailyGoal: (n) =>
      setState((s) => ({ ...s, stats: { ...s.stats, dailyGoal: Math.max(1, Math.min(500, n || 1)) } })),

    resetProgress: () =>
      setState((s) => ({
        stats: { ...DEFAULT_STATS, dailyGoal: s.stats.dailyGoal },
        words: s.words.map((w) => ({ ...w, box: 0, due: 0, correct: 0, wrong: 0 })),
      })),

    loadStarter: () => {
      const seen = new Set(ref.current.words.map((w) => wordKey(w.english, w.bangla)));
      const add = seedWords().filter((w) => !seen.has(wordKey(w.english, w.bangla)));
      if (add.length) setState((s) => ({ ...s, words: [...add, ...s.words] }));
      return add.length;
    },

    clearAll: () => setState((s) => ({ ...s, words: [] })),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside <StoreProvider>");
  return v;
}
