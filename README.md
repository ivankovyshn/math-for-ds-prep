# Math for DS prep

A gamified trainer for the mathematics part of B.Sc. Data Science / Applied Mathematics entrance exams.
Every question is built to train reasoning from first principles: estimation, pattern recognition and
spotting the trap in a tempting wrong answer.

Runs entirely in the browser. No account, no server, no API keys.

## What is inside

- **Skill path** — 5 modules (Geometry, Calculus, Number Theory & Counting, Probability, Algorithmic Logic),
  each with 4 nodes: Intuition → Core Mechanics → Exam Speed Drill → Boss Quiz.
- **Sessions** — 5–7 questions, progress bar, 3 hearts, streak counter, XP.
- **Feedback drawer** — after every answer: the step-by-step first-principles breakdown and, if you were wrong,
  an explanation of why the option you picked is a trap.
- **Review Mistakes** — every missed question is queued. It leaves the queue after two correct answers in a row.
  A module shows 100 % only when its path is finished *and* its queue is empty.
- **Exam Simulator** — 10 mixed questions in 15 minutes, no feedback until the end, then a diagnostic by topic.
- **60 questions**, 12 per module, 4 per difficulty level. Every answer key is re-computed by `npm run verify`.
- Dark mode by default, light mode toggle. Keyboard: `1`–`5` select, `Enter` check / continue.

## Run it locally

Requires Node 22.18 or newer (Node 24 recommended).

```bash
npm install
npm run dev
```

Other commands:

```bash
npm run verify   # re-computes all answer keys and checks the question bank
npm run build    # type-check and build into dist/
npm run preview  # serve the built version
```

## How to add a question

Questions live in `src/data/questions/<module>.ts`. Each file is a plain array; add an object to it.

```ts
{
  id: 'pro-13',                       // unique: module prefix + number
  moduleId: 'probability',
  difficulty: 2,                      // 1 = intuition, 2 = core mechanics, 3 = exam level
  promptText: r`A fair die is rolled $n$ times. …`,
  // optional extras:
  // mathFormula: r`\int_0^1 x^2\,\mathrm{d}x`,   // large centred formula
  // codeSnippet: `INPUT: N\n  S = 0\n…`,           // pseudocode block
  // svgDiagramType: 'cylinder',                    // a figure from src/components/Diagram.tsx
  options: [
    { id: 'a', label: r`$\dfrac{1}{6}$`, value: 1 / 6, trapExplanation: r`Why this wrong answer is tempting…` },
    { id: 'b', label: r`$\dfrac{1}{36}$`, value: 1 / 36 },      // the correct one has no trapExplanation
    // 4 or 5 options in total
  ],
  correctOptionId: 'b',
  stepByStepSolution: [r`Step 1…`, r`Step 2…`, r`Step 3…`],  // at least 3 steps
  keyConceptTag: 'Independent events multiply',
}
```

Rules of the format:

- Write maths between dollar signs: `$x^2$`. It is rendered with KaTeX. Use the `r` tag (`String.raw`)
  so that backslashes do not need escaping.
- An empty line in `promptText` starts a new paragraph. A paragraph that starts with `• ` becomes a bullet.
- `<i>word</i>` emphasises a word.
- `value` is the option as a number. The app does not show it; it exists so that the checker can confirm the key.
- The order of options does not matter — the app shuffles them.

Then add an independent computation of the answer to `checks` in `scripts/verify.mjs`:

```js
'pro-13': () => { /* brute force, simulation or numeric integration that returns the answer */ },
```

and run `npm run verify`. It fails if the key is wrong, if a wrong option has no trap explanation,
or if a `$` is unbalanced. The deployment runs the same check, so a broken question cannot be published.

To proofread, open the app with `#all` at the end of the address: this page lists every question
with its key, trap explanations and solution.

To add a new figure, add an entry to `figures` in `src/components/Diagram.tsx` and use its key
as `svgDiagramType`.

## Project structure

```
src/
  types.ts                 Question schema and stored data types
  data/questions/*.ts      the question bank, one file per module
  data/questions.ts        combines the bank
  data/modules.ts          modules, path nodes, session constants
  lib/session.ts           which questions go into a node, a review, an exam
  store/useProgress.ts     XP, streak, completed nodes, mistakes, exams (Zustand + localStorage)
  components/              KaTeX text, pseudocode, SVG figures, answer cards, buttons
  views/                   Dashboard, Quiz, Exam, ExamSummary, SettingsDialog
scripts/verify.mjs         answer-key checker
```

## Data and privacy

Progress is stored only in the browser's `localStorage` (key `mathds-progress`). Settings → Export / Import
moves it between devices. The stored shape is documented in `src/store/useProgress.ts` and maps directly
onto database tables, so a later move to Supabase/PostgreSQL only needs a different storage adapter.

## Deployment

`.github/workflows/deploy.yml` builds the app and publishes it to GitHub Pages on every push to `main`.
In the repository settings, set **Pages → Source** to **GitHub Actions**.
