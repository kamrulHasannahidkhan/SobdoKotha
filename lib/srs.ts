import type { Word } from "./types";

/** Days until the next review for each Leitner box. */
export const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
export const MAX_BOX = 5;
export const MASTERED_BOX = 4;
const DAY = 86_400_000;

export function grade(word: Word, correct: boolean, now = Date.now()): Word {
  if (correct) {
    const box = Math.min(word.box + 1, MAX_BOX);
    return { ...word, box, due: now + INTERVAL_DAYS[box] * DAY, correct: word.correct + 1 };
  }
  return { ...word, box: 0, due: now, wrong: word.wrong + 1 };
}

export const isDue = (w: Word, now = Date.now()) => w.due <= now;
export const isNew = (w: Word) => w.correct + w.wrong === 0;
export const isMastered = (w: Word) => w.box >= MASTERED_BOX;
export const isWeak = (w: Word) => w.wrong > 0 && (w.wrong >= w.correct || w.box <= 1);
