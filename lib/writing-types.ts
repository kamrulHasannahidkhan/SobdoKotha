export type ConnectorCategory =
  | "adding"
  | "contrast"
  | "reason"
  | "result"
  | "example"
  | "opinion"
  | "emphasis"
  | "sequence"
  | "concluding";

export type ConnectorEntry = {
  id: string;
  category: ConnectorCategory;
  word: string;
  alternatives: string[];
  example: string;
};

export type WordAlternative = {
  id: string;
  common: string;
  alternatives: string[];
};

export type Collocation = {
  id: string;
  phrase: string;
  meaning: string;
  example: string;
};

export type SentenceUpgrade = {
  id: string;
  basic: string;
  upgraded: string;
};
