/**
 * Pos-aware sentence templates used to generate simple / compound / complex
 * example sentences for a word list. Pure functions, no I/O — used by
 * scripts/build-deck.ts and safe to import from anywhere else in the app
 * (e.g. to regenerate sentences for a word added later).
 */

export type Pos = "n" | "v" | "adj" | "adv";

const ADJ_SIMPLE = [
  "The plan seemed utterly {w}.",
  "Her reply was {w}.",
  "Everyone found the whole situation {w}.",
  "The old building looked {w} in the fading light.",
  "His tone stayed {w} throughout the meeting.",
  "That excuse sounded rather {w} to the judge.",
  "The critics called the ending {w}.",
  "Her behavior at the party was {w}.",
];
const ADJ_COMPOUND = [
  "The report was {w}, and few people understood it fully.",
  "She stayed calm, but her answer sounded {w}.",
  "The film was called {w}, yet audiences still enjoyed it.",
  "His plan seemed {w}, so the board asked for changes.",
  "The speech grew {w}, and the crowd began to lose interest.",
  "Her manner was usually gentle, but tonight it felt {w}.",
];
const ADJ_COMPLEX = [
  "Although the topic was {w}, the students kept asking questions.",
  "Because the manager seemed {w}, no one dared to disagree.",
  "When the results turned out to be {w}, everyone was surprised.",
  "Since her explanation was {w}, the committee asked for more detail.",
  "While the plan looked {w} on paper, it worked well in practice.",
  "If his tone stays this {w}, the negotiation will likely fail.",
];

const NOUN_SIMPLE = [
  "The room was filled with a strange sense of {w}.",
  "There was a certain {w} in her voice that morning.",
  "The audience could easily sense the {w} in his words.",
  "Years of hard work finally gave him that {w}.",
  "Her letter carried an unmistakable sense of {w}.",
  "The whole story left behind a quiet sense of {w}.",
  "His speech was marked by real {w}.",
  "The committee noted a growing sense of {w}.",
];
const NOUN_COMPOUND = [
  "The report lacked detail, and its {w} confused the readers.",
  "She felt nervous at first, but her {w} slowly grew.",
  "He spoke for nearly an hour, so the {w} in his voice was obvious.",
  "The city changed quickly, yet its old {w} remained the same.",
  "The team worked all night, and their {w} finally paid off.",
  "Critics praised the book, but its {w} still puzzled many readers.",
];
const NOUN_COMPLEX = [
  "Although his {w} was obvious, no one mentioned it directly.",
  "Because of the sudden {w}, the meeting was postponed until Monday.",
  "When the {w} became clear, the whole team changed its plan.",
  "Since her {w} was well known, the board trusted her judgment completely.",
  "While the {w} surprised the younger staff, older employees expected it.",
  "If this sense of {w} continues, the company will need a new strategy.",
];

const VERB_SIMPLE = [
  "In the end, she chose to {w}.",
  "He was the first to {w}.",
  "No one expected them to {w}.",
  "It took real courage to {w}.",
  "The committee finally agreed to {w}.",
  "She promised never to {w} again.",
  "They felt forced to {w}.",
  "He seemed strangely determined to {w}.",
];
const VERB_COMPOUND = [
  "She wanted to {w}, and no one tried to stop her.",
  "He refused to {w} at first, but the board insisted.",
  "They hesitated to {w}, so the deadline passed quietly.",
  "The staff chose to {w}, yet the results surprised everyone.",
  "He began to {w}, and the whole room fell silent.",
  "She tried not to {w}, but the pressure grew too strong.",
];
const VERB_COMPLEX = [
  "Although they tried to {w}, it was already too late.",
  "Because she chose to {w}, the whole team took notice.",
  "When he finally decided to {w}, everyone was relieved.",
  "Since the manager refused to {w}, the staff grew frustrated.",
  "While others hesitated to {w}, she acted at once.",
  "If they continue to {w}, the situation will only worsen.",
];

/** Deterministic pick so the same word always gets the same sentence. */
function pick(seed: string, bank: string[]): string {
  let sum = 0;
  for (const ch of seed) sum += ch.charCodeAt(0);
  return bank[sum % bank.length];
}

const BANKS: Record<"n" | "v" | "adj", { simple: string[]; compound: string[]; complex: string[] }> = {
  adj: { simple: ADJ_SIMPLE, compound: ADJ_COMPOUND, complex: ADJ_COMPLEX },
  n: { simple: NOUN_SIMPLE, compound: NOUN_COMPOUND, complex: NOUN_COMPLEX },
  v: { simple: VERB_SIMPLE, compound: VERB_COMPOUND, complex: VERB_COMPLEX },
};

/**
 * Generates a simple, a compound, and a complex example sentence for a word,
 * chosen deterministically from pos-aware templates. "adv" falls back to the
 * verb bank (rare in these lists; adjust manually if it reads oddly).
 */
export function generateSentences(english: string, pos: Pos | string): { simple: string; compound: string; complex: string } {
  const bank = BANKS[pos === "n" || pos === "v" || pos === "adj" ? pos : "v"];
  return {
    simple: pick(english, bank.simple).replace("{w}", english),
    compound: pick(english + "c", bank.compound).replace("{w}", english),
    complex: pick(english + "x", bank.complex).replace("{w}", english),
  };
}
