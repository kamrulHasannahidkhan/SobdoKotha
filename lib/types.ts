export type Direction = "en-bn" | "bn-en";

export type Word = {
  id: string;
  english: string;
  bangla: string;
  pos: string;
  /** Simple example sentence. */
  example: string;
  /** Optional compound-sentence example. */
  example2: string;
  /** Optional complex-sentence example. */
  example3: string;
  tags: string[];
  /** Which list the word lives in: "gre-iba", "words-1000" or "mine" */
  deck?: string;
  /** Leitner box, 0 (new / missed) to 5 (long interval) */
  box: number;
  /** Timestamp (ms) when the word is next due for review */
  due: number;
  correct: number;
  wrong: number;
  starred: boolean;
  createdAt: number;
};

export type WordInput = Pick<Word, "english" | "bangla" | "pos" | "example" | "tags"> &
  Partial<Pick<Word, "example2" | "example3">>;

export type ImportItem = WordInput &
  Partial<Pick<Word, "box" | "due" | "correct" | "wrong" | "starred" | "deck">>;

export type Stats = {
  streak: number;
  bestStreak: number;
  /** yyyy-mm-dd of the last day something was practiced */
  lastDay: string;
  /** answers per day, keyed by yyyy-mm-dd */
  history: Record<string, number>;
  dailyGoal: number;
  /** Daily checklist: yyyy-mm-dd -> list of completed category ids. */
  dailyTasks: Record<string, string[]>;
};

export type DailyCategory = { id: string; label: string };

export const DAILY_CATEGORIES: DailyCategory[] = [
  { id: "speaking", label: "Speaking" },
  { id: "grammar", label: "Grammar" },
  { id: "vocab", label: "Vocab" },
  { id: "math", label: "Math" },
  { id: "analytical", label: "Analytical" },
];

/** One completed run of the scored Bangla-to-English test. */
export type GameResult = {
  id: string;
  date: number;
  total: number;
  correct: number;
  points: number;
  bestStreak: number;
};
