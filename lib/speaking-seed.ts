import type { InterviewQuestion, ReadingPassage } from "./types";

/**
 * Starter content for the Speaking section. Original wording, not copied
 * from any worksheet or textbook — meant purely as an editable example you
 * can change, delete, or add to.
 */

export function defaultInterviewQuestions(): InterviewQuestion[] {
  const prompts = [
    "What is your name?",
    "Where are you from?",
    "Where do you live now?",
    "What do you do (job or study)?",
    "What do you like to do in your free time?",
    "How would you describe your personality?",
  ];
  return prompts.map((question, i) => ({ id: `iq-${i}`, question, answer: "" }));
}

export function defaultReadingPassages(): ReadingPassage[] {
  return [
    {
      id: "rp-beginner",
      level: "beginner",
      title: "Introducing myself",
      text: "Hello, my name is Rafi. I am from Bangladesh. I live in Dhaka with my family. I am a student. I enjoy reading and playing football. It is nice to meet you.",
      practiced: [],
    },
    {
      id: "rp-intermediate",
      level: "intermediate",
      title: "A short introduction",
      text: "Good morning, everyone. My name is Sumaiya, and I am twenty-two years old. I currently work as a junior developer in Dhaka. In my spare time, I like learning new languages and trying different kinds of food. I would describe myself as curious and fairly patient, though I am still working on my public speaking.",
      practiced: [],
    },
    {
      id: "rp-advanced",
      level: "advanced",
      title: "A fuller self-introduction",
      text: "Thank you for having me. I'm Tanvir, and for the past three years I've been working in product design here in Dhaka, although I originally grew up in Khulna. What drew me to this field was the chance to combine a fairly technical mindset with something more creative, and that balance still keeps me interested in the work today. Outside the office, I spend most weekends either hiking somewhere just outside the city or experimenting with recipes I've picked up from friends abroad. If I had to sum myself up, I'd say I'm someone who enjoys a good, honest conversation and who tends to learn best by simply trying things and seeing what happens.",
      practiced: [],
    },
  ];
}
