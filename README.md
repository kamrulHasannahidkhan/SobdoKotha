# Shobdo Khata (শব্দ খাতা)

English ↔ Bangla vocabulary practice, built with Next.js (App Router) and TypeScript.
No backend and no database: everything is saved in your browser's localStorage.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build: `npm run build && npm start`.

## What it does

- **Practice** with flashcards, multiple choice, or typing. Direction: English to Bangla, Bangla to English, or mixed.
- **Spaced repetition** (Leitner boxes): correct answers push a word to longer intervals (1, 3, 7, 14, 30 days); a miss sends it back to today.
- **Add, edit, delete** words, with part of speech, example sentence and tags. Star the ones you care about.
- **Paste many words** at once (`brave - সাহসী`, one per line).
- **Import / export** CSV and JSON. The JSON backup keeps your progress.
- **Today** page: due words, daily goal, streak, 7-day activity, word of the day.
- **Hear it**: English pronunciation via the browser's speech synthesis.
- Keyboard shortcuts: Space to reveal, ← / → to grade a flashcard, 1-4 to choose an option, Enter for next.
- Follows your system light / dark setting.

## Files

```
app/page.tsx            Today dashboard
app/practice/page.tsx   Practice setup + the three practice modes
app/words/page.tsx      Add / edit / search / import / export
components/             Nav, WordForm, SpeakButton
lib/store.tsx           State + localStorage persistence
lib/srs.ts              Spaced-repetition rules
lib/seed.ts             40 starter words
```

## Ideas for later

- Sync across devices (MongoDB Atlas or Supabase + auth)
- Word lists / decks instead of tags
- Dictionary lookup when adding a word
- PWA install + offline
