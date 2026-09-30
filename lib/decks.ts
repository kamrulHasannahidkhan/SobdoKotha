import type { WordInput } from "./types";
import { GRE_IBA_RAW } from "./data/gre-iba";
import { WORDS_1000_RAW } from "./data/words-1000";

export type DeckId = "gre-iba" | "words-1000" | "mine";

export const DECKS: { id: DeckId; label: string }[] = [
  { id: "gre-iba", label: "GRE / IBA" },
  { id: "words-1000", label: "1000 Words" },
  { id: "mine", label: "My words" },
];

const POS: Record<string, string> = { n: "noun", v: "verb", adj: "adjective", adv: "adverb" };

/** One word per line: english|bangla|pos|example|example2|example3 (example2/3 optional). */
export function parseDeck(raw: string): WordInput[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const [english, bangla, pos = "", example = "", example2 = "", example3 = ""] = line.split("|").map((s) => s.trim());
      if (!english || !bangla) return [];
      return [{ english, bangla, pos: POS[pos] ?? pos, example, example2, example3, tags: [] }];
    });
}

/** Lists that ship with the app. "My words" has none: it only holds what you add. */
export const BUILTIN_DECKS: Partial<Record<DeckId, WordInput[]>> = {
  "gre-iba": parseDeck(GRE_IBA_RAW),
  "words-1000": parseDeck(WORDS_1000_RAW),
};

/**
 * Bump a deck's version here whenever its built-in content changes and
 * already-saved words should be updated (not just newly-missing ones added).
 */
export const DECK_VERSION: Record<string, number> = {
  "gre-iba": 2, // v2: added compound/complex example sentences
  "words-1000": 1,
};

export const seedKey = (id: string) => `${id}:v${DECK_VERSION[id] ?? 1}`;

/** Words saved before lists existed have no deck: they belong to "My words". */
export const deckOf = (w: { deck?: string }): string => w.deck ?? "mine";
