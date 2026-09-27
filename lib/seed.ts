import type { Word, WordInput } from "./types";
import { makeWord } from "./utils";

const w = (
  english: string,
  bangla: string,
  pos: string,
  example: string,
  tags: string[] = ["starter"],
): WordInput => ({ english, bangla, pos, example, tags });

export const STARTER: WordInput[] = [
  w("abundant", "প্রচুর", "adjective", "The region has abundant natural resources."),
  w("achieve", "অর্জন করা", "verb", "She worked hard to achieve her goal."),
  w("adapt", "খাপ খাওয়ানো", "verb", "It takes time to adapt to a new city."),
  w("ambition", "উচ্চাকাঙ্ক্ষা", "noun", "His ambition is to become a doctor."),
  w("ancient", "প্রাচীন", "adjective", "They visited an ancient temple."),
  w("authentic", "খাঁটি / প্রামাণিক", "adjective", "This restaurant serves authentic Bengali food."),
  w("benefit", "সুবিধা / উপকার", "noun", "Regular exercise has many benefits."),
  w("brave", "সাহসী", "adjective", "The brave boy saved his friend."),
  w("challenge", "চ্যালেঞ্জ", "noun", "Learning a language is a big challenge."),
  w("curious", "কৌতূহলী", "adjective", "Children are naturally curious."),
  w("deadline", "সময়সীমা", "noun", "The deadline for the project is Friday."),
  w("delicate", "নাজুক / সূক্ষ্ম", "adjective", "Handle the delicate glass carefully."),
  w("determine", "নির্ধারণ করা", "verb", "We need to determine the cause of the problem."),
  w("diligent", "পরিশ্রমী", "adjective", "A diligent student always finishes homework on time.", ["starter", "character"]),
  w("efficient", "দক্ষ", "adjective", "She is an efficient manager."),
  w("embrace", "আলিঙ্গন করা", "verb", "They embrace new ideas quickly."),
  w("encourage", "উৎসাহিত করা", "verb", "Teachers should encourage curiosity."),
  w("essential", "অপরিহার্য", "adjective", "Water is essential for life."),
  w("familiar", "পরিচিত", "adjective", "His face looks familiar to me."),
  w("generous", "উদার", "adjective", "He is generous with his time.", ["starter", "character"]),
  w("grateful", "কৃতজ্ঞ", "adjective", "I am grateful for your help.", ["starter", "character"]),
  w("hesitate", "দ্বিধা করা", "verb", "Don't hesitate to ask questions."),
  w("honest", "সৎ", "adjective", "An honest answer is always best.", ["starter", "character"]),
  w("humble", "বিনয়ী", "adjective", "Despite his success, he stayed humble.", ["starter", "character"]),
  w("improve", "উন্নত করা", "verb", "Reading daily will improve your vocabulary."),
  w("inspire", "অনুপ্রাণিত করা", "verb", "Her story inspires many young people."),
  w("journey", "যাত্রা", "noun", "The journey took three hours by bus."),
  w("knowledge", "জ্ঞান", "noun", "Knowledge grows when you share it."),
  w("maintain", "বজায় রাখা", "verb", "It is hard to maintain a healthy routine."),
  w("neighbour", "প্রতিবেশী", "noun", "Our neighbour brought us some sweets."),
  w("opportunity", "সুযোগ", "noun", "This job is a great opportunity."),
  w("patient", "ধৈর্যশীল", "adjective", "Be patient; good things take time.", ["starter", "character"]),
  w("reliable", "নির্ভরযোগ্য", "adjective", "He is a reliable friend.", ["starter", "character"]),
  w("responsible", "দায়িত্বশীল", "adjective", "You are responsible for your own choices.", ["starter", "character"]),
  w("sincere", "আন্তরিক", "adjective", "Please accept my sincere apology.", ["starter", "character"]),
  w("strengthen", "শক্তিশালী করা", "verb", "Exercise helps strengthen your muscles."),
  w("tradition", "ঐতিহ্য", "noun", "Pohela Boishakh is a beloved tradition."),
  w("urgent", "জরুরি", "adjective", "I have an urgent message for you."),
  w("vivid", "উজ্জ্বল / স্পষ্ট", "adjective", "She has vivid memories of her childhood."),
  w("wisdom", "প্রজ্ঞা", "noun", "With age comes wisdom."),
];

export function seedWords(): Word[] {
  const now = Date.now();
  // Offset timestamps so "newest first" keeps the list in reading order.
  return STARTER.map((s, i) => makeWord(s, now - i));
}
