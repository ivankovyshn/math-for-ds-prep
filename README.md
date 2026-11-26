# Math Foundations of Data Science

A gamified course in the mathematics behind data science and machine learning. Every lesson starts with a short lecture
(5–8 minutes: key ideas, formulas, diagrams and worked examples) and ends with practice questions that train
reasoning from first principles and spotting the trap in a tempting wrong answer.

Runs entirely in the browser. No account, no server, no API keys.

## What is inside

- **Modules** — Mathematical Language, Linear Algebra, Calculus & Analysis, Probability, Statistics,
  Optimization, Programming Foundations. Mathematical Language (6 lessons) and Linear Algebra (7 lessons) are
  available; the other modules show their planned lessons as "coming soon".
- **Lessons** — each lesson is a lecture followed by practice. The lecture is shown one section at a time,
  with definition / key-fact / trap boxes, step-by-step worked examples and "check yourself" questions.
  Reading it to the end unlocks the practice; passing the practice unlocks the next lesson.
- **Practice** — 6 questions per lesson, easiest first, 3 hearts, streak counter, XP.
- **Feedback drawer** — after every answer: the step-by-step first-principles breakdown and, if you were wrong,
  an explanation of why the option you picked is a trap.
- **Boss Quiz** — 8 mixed questions from the whole module, unlocked after every lesson is passed.
- **Review Mistakes** — every missed question is queued. It leaves the queue after two correct answers in a row.
  A module shows 100 % only when its path is finished *and* its queue is empty.
- **Exam Simulator** — 10 mixed questions in 15 minutes, no feedback until the end, then a diagnostic by topic.
- Every answer key is re-computed by `npm run verify`.
- Dark mode by default, light mode toggle. Keyboard: `1`–`5` select, `Enter` check / continue, `←` `→` in lectures.
- Add `#all` to the address to proofread every lecture and question on one page.

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

## How to add a lesson

A lesson is one file in `src/data/lessons/<module>/` that holds the lecture and its questions together.
Add it to the module's `index.ts`; the module's `planned` list in `src/data/modules.ts` is only used while a
module has no lessons yet.

```ts
import { defineLesson, r } from '../define.ts';

export default defineLesson({
  id: 'la-08',                        // unique; question ids start with it
  moduleId: 'linalg',
  title: 'Orthogonality',
  blurb: 'Projections and orthonormal bases',
  minutes: 7,                         // planned reading time, 5–8
  lecture: [
    {
      title: 'Section title',
      blocks: [
        { kind: 'text', text: r`Paragraphs. An empty line starts a new one; "• " starts a bullet.` },
        { kind: 'formula', tex: r`\mathbf{u}\cdot\mathbf{v} = 0`, caption: 'optional' },
        { kind: 'box', variant: 'definition', title: 'Orthogonal', text: r`…` },   // definition | theorem | tip | pitfall
        { kind: 'example', title: 'A worked example', prompt: r`…`, steps: [r`…`, r`…`] },
        { kind: 'diagram', type: 'vectorAdd', caption: r`…` },                    // a figure from src/components/Diagram.tsx
        { kind: 'check', prompt: r`A quick question`, answer: r`Revealed on tap` },
      ],
    },
    // at least 3 sections; the last one is usually a summary
  ],
  questions: [ /* see below */ ],
});
```

### Questions

```ts
{
  id: 'la-08-1',                      // lesson id + number
  difficulty: 2,                      // 1 = intuition, 2 = core mechanics, 3 = exam level
  promptText: r`Let $\mathbf{u} = (1, 2)$ …`,
  // optional extras:
  // mathFormula: r`\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}`,   // large centred formula
  // codeSnippet: `INPUT: N\n  S = 0\n…`,                             // pseudocode block
  // svgDiagramType: 'eigen',                                         // a figure from src/components/Diagram.tsx
  options: [
    { id: 'a', label: r`$(3, -6)$`, value: [3, -6] },                 // the correct one has no trapExplanation
    { id: 'b', label: r`$(5, 2)$`, value: [5, 2], trapExplanation: r`Why this wrong answer is tempting…` },
    // 4 or 5 options in total
  ],
  correctOptionId: 'a',
  stepByStepSolution: [r`Step 1…`, r`Step 2…`, r`Step 3…`],  // at least 3 steps
  keyConceptTag: 'Vector operations are componentwise',
}
```

Rules of the format:

- Write maths between dollar signs: `$x^2$`. It is rendered with KaTeX. Use the `r` tag (`String.raw`)
  so that backslashes do not need escaping. Never write `${` — it starts a template substitution.
- `<i>word</i>` emphasises a word (it may contain maths).
- `value` is the option as a number or a list of numbers (a vector, or a matrix read row by row). The app does
  not show it; it exists so that the checker can confirm the key.
- Every lesson needs at least 5 questions and at least one of each difficulty.
- The order of options does not matter — the app shuffles them.

Then add an independent computation of the answer to `checks` in `scripts/verify.mjs`
(helpers for determinants, inverses, rank, eigenvalues and solving systems are at the top):

```js
'la-08-1': () => solve([[1, 1], [2, -1]], [1, 8]),
```

It may also return `{ id: 'b' }` when it decides which option is right without numeric values.
Run `npm run verify`. It fails if a key is wrong, if a distractor equals the answer, if a wrong option has no
trap explanation, if a lecture uses an unknown diagram or if a `$` is unbalanced. The deployment runs the same
check, so a broken question cannot be published.
