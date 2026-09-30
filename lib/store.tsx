"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { GameResult, ImportItem, Stats, Word, WordInput } from "./types";
import { grade } from "./srs";
import { BUILTIN_DECKS, DECKS, deckOf, seedKey, type DeckId } from "./decks";
import { dayKey, daysAgo, makeWord, uid, wordKey } from "./utils";

const KEY = "shobdo-khata:v1";
const DEFAULT_STATS: Stats = { streak: 0, bestStreak: 0, lastDay: "", history: {}, dailyGoal: 20 };
const MAX_GAME_RESULTS = 100;

type State = { words: Word[]; stats: Stats; gameResults: GameResult[]; seeded: string[] };

type Store = {
  ready: boolean;
  words: Word[];
  stats: Stats;
  gameResults: GameResult[];
  addWord: (input: WordInput, deck: string) => void;
  updateWord: (id: string, input: WordInput) => void;
  deleteWord: (id: string) => void;
  toggleStar: (id: string) => void;
  recordAnswer: (id: string, correct: boolean) => void;
  recordGameResult: (result: Omit<GameResult, "id" | "date">) => void;
  importWords: (items: ImportItem[], deck: string) => { added: number; skipped: number };
  setDailyGoal: (n: number) => void;
  resetProgress: () => void;
  restoreDeck: (deck: string) => number;
  clearDeck: (deck: string) => void;
};

const Ctx = createContext<Store | null>(null);

const inDeck = (w: Word, deck: string) => deckOf(w) === deck;
const keyIn = (deck: string, english: string, bangla: string) => `${deck}|${wordKey(english, bangla)}`;

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

/** Adds every built-in list that has not been added yet (a list you delete is not re-added by itself). */
function seedBuiltins(words: Word[], seeded: string[]) {
  let out = words;
  const done = [...seeded];
  const now = Date.now();
  for (const d of DECKS) {
    const list = BUILTIN_DECKS[d.id];
    if (!list || list.length === 0) continue;
    const mark = seedKey(d.id);
    if (done.includes(mark)) continue;

    const byKey = new Map(list.map((s) => [wordKey(s.english, s.bangla), s]));
    const have = new Set<string>();
    // Merge current built-in content (e.g. sentences added later) into words
    // already saved from an earlier version, keeping their id and progress.
    out = out.map((w) => {
      if (!inDeck(w, d.id)) return w;
      const k = wordKey(w.english, w.bangla);
      have.add(k);
      const src = byKey.get(k);
      if (!src) return w;
      return {
        ...w,
        pos: src.pos || w.pos,
        example: src.example || w.example,
        example2: src.example2 || w.example2,
        example3: src.example3 || w.example3,
      };
    });

    const add: Word[] = [];
    list.forEach((s, i) => {
      const k = wordKey(s.english, s.bangla);
      if (have.has(k)) return;
      have.add(k);
      add.push({ ...makeWord(s, now - i), deck: d.id });
    });
    out = [...add, ...out];
    done.push(mark);
  }
  return { words: out, seeded: done };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ words: [], stats: DEFAULT_STATS, gameResults: [], seeded: [] });
  const [ready, setReady] = useState(false);
  const ref = useRef(state);
  ref.current = state;

  // Load once on the client
  useEffect(() => {
    let base: State = { words: [], stats: DEFAULT_STATS, gameResults: [], seeded: [] };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<State>;
        const stored = Array.isArray(p.words) ? p.words : [];
        base = {
          // The old built-in lists (starter / gre500) are dropped; words you added yourself move to "My words".
          words: stored
            .filter((w) => !(w.deck === undefined && ((w.tags ?? []).includes("starter") || (w.tags ?? []).includes("gre500"))))
            .map((w) => ({ ...w, deck: w.deck ?? "mine" })),
          stats: { ...DEFAULT_STATS, ...(p.stats ?? {}) },
          gameResults: Array.isArray(p.gameResults) ? p.gameResults : [],
          seeded: Array.isArray(p.seeded) ? p.seeded : [],
        };
      }
    } catch {
      /* corrupted or blocked storage: start fresh */
    }
    const seeded = seedBuiltins(base.words, base.seeded);
    setState({ ...base, ...seeded });
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
    gameResults: state.gameResults,

    addWord: (input, deck) =>
      setState((s) => ({ ...s, words: [{ ...makeWord(input), deck }, ...s.words] })),

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
        ...s,
        words: s.words.map((w) => (w.id === id ? grade(w, correct) : w)),
        stats: bump(s.stats),
      })),

    recordGameResult: (result) =>
      setState((s) => ({
        ...s,
        stats: bump(s.stats),
        gameResults: [{ ...result, id: uid(), date: Date.now() }, ...s.gameResults].slice(0, MAX_GAME_RESULTS),
      })),

    importWords: (items, deck) => {
      const seen = new Set(ref.current.words.map((w) => keyIn(deckOf(w), w.english, w.bangla)));
      const fresh: Word[] = [];
      let skipped = 0;
      const now = Date.now();
      items.forEach((it, i) => {
        const english = it.english?.trim();
        const bangla = it.bangla?.trim();
        const target = it.deck ?? deck;
        const key = keyIn(target, english ?? "", bangla ?? "");
        if (!english || !bangla || seen.has(key)) {
          skipped++;
          return;
        }
        seen.add(key);
        const base = makeWord(it, now - i);
        fresh.push({
          ...base,
          deck: target,
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
        ...s,
        stats: { ...DEFAULT_STATS, dailyGoal: s.stats.dailyGoal },
        words: s.words.map((w) => ({ ...w, box: 0, due: 0, correct: 0, wrong: 0 })),
      })),

    restoreDeck: (deck) => {
      const list = BUILTIN_DECKS[deck as DeckId] ?? [];
      const have = new Set(ref.current.words.filter((w) => inDeck(w, deck)).map((w) => wordKey(w.english, w.bangla)));
      const now = Date.now();
      const add: Word[] = [];
      list.forEach((s, i) => {
        const k = wordKey(s.english, s.bangla);
        if (have.has(k)) return;
        have.add(k);
        add.push({ ...makeWord(s, now - i), deck });
      });
      if (add.length) setState((s) => ({ ...s, words: [...add, ...s.words] }));
      return add.length;
    },

    clearDeck: (deck) => setState((s) => ({ ...s, words: s.words.filter((w) => !inDeck(w, deck)) })),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside <StoreProvider>");
  return v;
}
