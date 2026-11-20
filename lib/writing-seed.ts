import type { Collocation, ConnectorEntry, SentenceUpgrade, WordAlternative } from "./writing-types";

/**
 * Original reference content for the Writing tab — connectors, word
 * alternatives, collocations and sentence-upgrade pairs. Written from
 * scratch, not copied from any book or worksheet.
 */

export const CONNECTORS: ConnectorEntry[] = [
  { id: "c1", category: "adding", word: "Furthermore", alternatives: ["Moreover", "In addition"], example: "The course is free; furthermore, it includes a certificate." },
  { id: "c2", category: "adding", word: "Also", alternatives: ["Besides", "In addition"], example: "She studies full-time. Also, she works part-time on weekends." },
  { id: "c3", category: "adding", word: "What's more", alternatives: ["Moreover", "On top of that"], example: "The flat is cheap. What's more, it is close to the station." },
  { id: "c4", category: "contrast", word: "However", alternatives: ["Nevertheless", "Yet"], example: "The team practiced hard. However, they lost the match." },
  { id: "c5", category: "contrast", word: "Although", alternatives: ["Even though", "While"], example: "Although it rained all day, the festival continued as planned." },
  { id: "c6", category: "contrast", word: "On the other hand", alternatives: ["Conversely", "In contrast"], example: "City life is exciting. On the other hand, it can be exhausting." },
  { id: "c7", category: "reason", word: "Because", alternatives: ["Since", "As"], example: "He left the meeting early because he felt unwell." },
  { id: "c8", category: "reason", word: "Due to", alternatives: ["Owing to", "Because of"], example: "The flight was delayed due to heavy fog." },
  { id: "c9", category: "result", word: "Therefore", alternatives: ["Consequently", "As a result"], example: "Demand increased sharply; therefore, prices rose." },
  { id: "c10", category: "result", word: "As a result", alternatives: ["Consequently", "Hence"], example: "The bridge was closed. As a result, traffic slowed down for hours." },
  { id: "c11", category: "example", word: "For instance", alternatives: ["For example", "Such as"], example: "Some habits improve focus; for instance, reading before bed." },
  { id: "c12", category: "example", word: "Specifically", alternatives: ["In particular", "Namely"], example: "Costs rose across the board, specifically in housing and food." },
  { id: "c13", category: "opinion", word: "In my view", alternatives: ["Personally", "From my perspective"], example: "In my view, public transport should be free for students." },
  { id: "c14", category: "opinion", word: "Arguably", alternatives: ["It could be argued that", "Some would say"], example: "Arguably, the policy has done more harm than good." },
  { id: "c15", category: "emphasis", word: "Above all", alternatives: ["Most importantly", "Particularly"], example: "Above all, the team values honesty with its clients." },
  { id: "c16", category: "sequence", word: "To begin with", alternatives: ["First of all", "Initially"], example: "To begin with, gather all the documents you will need." },
  { id: "c17", category: "sequence", word: "Subsequently", alternatives: ["Afterwards", "Then"], example: "She finished her degree and subsequently found a job abroad." },
  { id: "c18", category: "concluding", word: "In conclusion", alternatives: ["To conclude", "Overall"], example: "In conclusion, both options have clear advantages worth weighing." },
];

export const WORD_ALTERNATIVES: WordAlternative[] = [
  { id: "w1", common: "good", alternatives: ["beneficial", "favorable", "valuable"] },
  { id: "w2", common: "bad", alternatives: ["harmful", "unfavorable", "damaging"] },
  { id: "w3", common: "big", alternatives: ["substantial", "considerable", "significant"] },
  { id: "w4", common: "small", alternatives: ["minor", "modest", "limited"] },
  { id: "w5", common: "important", alternatives: ["essential", "vital", "significant"] },
  { id: "w6", common: "interesting", alternatives: ["engaging", "compelling", "intriguing"] },
  { id: "w7", common: "difficult", alternatives: ["challenging", "demanding", "complex"] },
  { id: "w8", common: "easy", alternatives: ["straightforward", "manageable", "effortless"] },
  { id: "w9", common: "get", alternatives: ["obtain", "acquire", "receive"] },
  { id: "w10", common: "show", alternatives: ["demonstrate", "reveal", "illustrate"] },
  { id: "w11", common: "think", alternatives: ["believe", "consider", "argue"] },
  { id: "w12", common: "say", alternatives: ["state", "claim", "mention"] },
  { id: "w13", common: "help", alternatives: ["assist", "support", "facilitate"] },
  { id: "w14", common: "use", alternatives: ["utilize", "employ", "apply"] },
  { id: "w15", common: "change", alternatives: ["alter", "modify", "transform"] },
  { id: "w16", common: "start", alternatives: ["begin", "initiate", "launch"] },
  { id: "w17", common: "stop", alternatives: ["cease", "halt", "prevent"] },
  { id: "w18", common: "keep", alternatives: ["maintain", "retain", "preserve"] },
  { id: "w19", common: "grow", alternatives: ["expand", "increase", "develop"] },
  { id: "w20", common: "reduce", alternatives: ["decrease", "diminish", "lower"] },
  { id: "w21", common: "problem", alternatives: ["issue", "challenge", "difficulty"] },
  { id: "w22", common: "a lot of", alternatives: ["numerous", "considerable", "a substantial amount of"] },
];

export const COLLOCATIONS: Collocation[] = [
  { id: "k1", phrase: "play a key role", meaning: "be very important in something", example: "Teachers play a key role in shaping students' confidence." },
  { id: "k2", phrase: "raise concerns", meaning: "make people worried about something", example: "The report aims to raise concerns about air quality in the city." },
  { id: "k3", phrase: "pose a risk", meaning: "create a danger", example: "Heavy traffic can pose a risk to cyclists on this road." },
  { id: "k4", phrase: "reach a decision", meaning: "decide after careful thought", example: "The committee took two hours to reach a decision." },
  { id: "k5", phrase: "take action", meaning: "do something to deal with a situation", example: "Local authorities must take action before the river floods again." },
  { id: "k6", phrase: "meet a deadline", meaning: "finish something by the required time", example: "The team worked late to meet a deadline." },
  { id: "k7", phrase: "strike a balance", meaning: "find a fair middle point between two things", example: "Parents often struggle to strike a balance between work and family." },
  { id: "k8", phrase: "have an impact on", meaning: "affect something noticeably", example: "Sleep quality can have an impact on exam performance." },
  { id: "k9", phrase: "come to terms with", meaning: "gradually accept a difficult situation", example: "It took him months to come to terms with the loss of his job." },
  { id: "k10", phrase: "draw a conclusion", meaning: "decide something based on evidence", example: "It is too early to draw a conclusion from such a small sample." },
  { id: "k11", phrase: "carry out research", meaning: "do a study or investigation", example: "The university plans to carry out research on renewable energy." },
  { id: "k12", phrase: "set a precedent", meaning: "establish an example that others may follow", example: "The court's ruling set a precedent for similar cases." },
  { id: "k13", phrase: "bridge the gap", meaning: "reduce the difference between two things", example: "The scholarship aims to bridge the gap between rich and poor students." },
  { id: "k14", phrase: "gain momentum", meaning: "become stronger or more popular over time", example: "The campaign for cleaner energy continues to gain momentum worldwide." },
  { id: "k15", phrase: "shed light on", meaning: "help explain something unclear", example: "The new study could shed light on why the species is disappearing." },
];

export const SENTENCE_UPGRADES: SentenceUpgrade[] = [
  { id: "s1", basic: "Lots of people use social media every day.", upgraded: "A substantial number of people engage with social media on a daily basis." },
  { id: "s2", basic: "The city has a big traffic problem.", upgraded: "The city faces a significant traffic congestion problem." },
  { id: "s3", basic: "I think online classes are good for students.", upgraded: "I believe online classes offer considerable benefits for students." },
  { id: "s4", basic: "The company wants to make more money.", upgraded: "The company aims to increase its profitability." },
  { id: "s5", basic: "This plan will help the environment.", upgraded: "This plan is likely to have a positive impact on the environment." },
  { id: "s6", basic: "Many students find exams stressful.", upgraded: "A considerable number of students find examinations highly stressful." },
  { id: "s7", basic: "The new law will stop pollution.", upgraded: "The new legislation is intended to reduce pollution levels." },
  { id: "s8", basic: "People should recycle more.", upgraded: "Individuals ought to increase their recycling efforts." },
  { id: "s9", basic: "Technology makes life easier.", upgraded: "Technology has considerably simplified everyday life." },
  { id: "s10", basic: "The government should spend more on healthcare.", upgraded: "The government ought to allocate greater funding to healthcare services." },
];
