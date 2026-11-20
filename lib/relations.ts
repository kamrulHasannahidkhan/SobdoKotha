import type { Word } from "./types";
import { GRE_IBA_RELATIONS_RAW } from "./data/gre-iba-relations";
import { normalize } from "./utils";

type Relations = { synonyms: string[]; antonyms: string[] };

function parseRelations(raw: string): Record<string, Relations> {
  const out: Record<string, Relations> = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const [english, syn = "", ant = ""] = t.split("|").map((s) => s.trim());
    if (!english) continue;
    const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 5);
    out[normalize(english)] = { synonyms: list(syn), antonyms: list(ant) };
  }
  return out;
}

export const GRE_IBA_RELATIONS = parseRelations(GRE_IBA_RELATIONS_RAW);

const MARK = "relations:gre-iba:v1";

/**
 * Fills in synonyms and antonyms for GRE / IBA words, once. A word that
 * already has its own synonyms or antonyms keeps them.
 */
export function applyRelations(state: { words: Word[]; seeded: string[] }) {
  if (state.seeded.includes(MARK)) return state;
  const words = state.words.map((w) => {
    if ((w.deck ?? "mine") !== "gre-iba") return w;
    const r = GRE_IBA_RELATIONS[normalize(w.english)];
    if (!r) return w;
    return {
      ...w,
      synonyms: w.synonyms && w.synonyms.length > 0 ? w.synonyms : r.synonyms,
      antonyms: w.antonyms && w.antonyms.length > 0 ? w.antonyms : r.antonyms,
    };
  });
  return { words, seeded: [...state.seeded, MARK] };
}
