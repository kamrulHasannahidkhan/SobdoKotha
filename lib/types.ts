export type Direction = "en-bn" | "bn-en";

export type Word = {
  id: string;
  english: string;
  bangla: string;
  pos: string;
  example: string;
  tags: string[];
  /** Leitner box, 0 (new / missed) to 5 (long interval) */
  box: number;
  /** Timestamp (ms) when the word is next due for review */
  due: number;
  correct: number;
  wrong: number;
  starred: boolean;
  createdAt: number;
};

export type WordInput = Pick<Word, "english" | "bangla" | "pos" | "example" | "tags">;

export type ImportItem = WordInput &
  Partial<Pick<Word, "box" | "due" | "correct" | "wrong" | "starred">>;

export type Stats = {
  streak: number;
  bestStreak: number;
  /** yyyy-mm-dd of the last day something was practiced */
  lastDay: string;
  /** answers per day, keyed by yyyy-mm-dd */
  history: Record<string, number>;
  dailyGoal: number;
};

/** One completed run of the scored Bangla-to-English test. */
export type GameResult = {
  id: string;
  date: number;
  total: number;
  correct: number;
  points: number;
  bestStreak: number;
};
