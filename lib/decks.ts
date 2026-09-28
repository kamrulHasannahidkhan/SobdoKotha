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

/** One word per line: english|bangla|pos  (an optional 4th field is an example sentence). */
export function parseDeck(raw: string): WordInput[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const [english, bangla, pos = "", example = ""] = line.split("|").map((s) => s.trim());
      if (!english || !bangla) return [];
      return [{ english, bangla, pos: POS[pos] ?? pos, example, tags: [] }];
    });
}

/** Lists that ship with the app. "My words" has none: it only holds what you add. */
export const BUILTIN_DECKS: Partial<Record<DeckId, WordInput[]>> = {
  "gre-iba": parseDeck(GRE_IBA_RAW),
  "words-1000": parseDeck(WORDS_1000_RAW),
};

/** Bump the version if a built-in list is replaced and should be added again. */
export const seedKey = (id: string) => `${id}:v1`;

/** Words saved before lists existed have no deck: they belong to "My words". */
export const deckOf = (w: { deck?: string }): string => w.deck ?? "mine";
