# Math Foundations of Data Science

A gamified course in the mathematics behind data science and machine learning. Every lesson starts with a short lecture
(5–8 minutes: key ideas, formulas, diagrams and worked examples) and ends with practice questions that train
reasoning from first principles and spotting the trap in a tempting wrong answer.

Runs entirely in the browser. No account, no server, no API keys.

## What is inside

- **Modules** — Mathematical Language, Linear Algebra, Calculus & Analysis, Probability, Statistics,
  Optimization, Programming Foundations. Mathematical Language (6 lessons), Linear Algebra (11 lessons), Calculus & Analysis (7 lessons), Probability (6 lessons), Statistics (5 lessons) and Optimization (5 lessons) are
  available; the other modules show their planned lessons as "coming soon".
- **Lessons** — lecture → Practice 1 → (Extra practice if needed) → next lesson. The lecture is shown one
  section at a time, with definition / key-fact / trap boxes, step-by-step worked examples and 2–3 quick checks:
  multiple-choice questions with an instant explanation and no hearts. Answering a section's quick checks
  opens the next section; reading to the end unlocks the practice.
- **Practice 1** — 6 questions per lesson, easiest first, 3 hearts, streak counter, XP. At most one mistake
  passes the lesson.
- **Extra practice (Practice 2)** — opens when Practice 1 ends with two or more mistakes (or out of hearts):
  6 new, gentler questions on the same ideas and traps. Passing it also passes the lesson.
- **Feedback drawer** — after every answer: the step-by-step first-principles breakdown and, if you were wrong,
  an explanation of why the option you picked is a trap.
- **Module Test** — 8 mixed questions from the whole module, unlocked after every lesson is passed.
- **Mistakes** — every missed question is queued. It leaves the queue after two correct answers in a row.
  A module shows 100 % only when its path is finished *and* its queue is empty.
- **Review** — 15 mixed questions from the lessons passed so far, spread evenly over them; a lesson joins the
  pool as soon as it is passed. No hearts, instant feedback; missed questions go to Mistakes.
- Numeric questions are parametric: every attempt brings new numbers (same idea, same traps).
- Every answer key is re-computed by `npm run verify` — for parametric questions, on 300 generated variants each.
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
        {
          kind: 'quiz', id: 'la-08-q1',                                          // quick check: 3–4 options
          prompt: r`A quick question`,
          options: [{ id: 'a', label: r`…`, value: 1 }, { id: 'b', label: r`…`, value: 2, trapExplanation: r`…` }, /* … */],
          correctOptionId: 'a',
          explanation: r`Shown after any answer`,
        },
      ],
    },
    // at least 3 sections and 2 quick checks; the last section is usually a summary
  ],
  questions: [ /* Practice 1, see below */ ],
  extra,      // Extra practice, kept in 08-orthogonality.extra.ts: ids la-08-x1…, difficulty 1–2 only
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
- Every lesson needs at least 5 Practice 1 questions with at least one of each difficulty, at least 5 Extra
  practice questions (difficulty 1–2) and at least 2 quick checks in the lecture.
- The order of options does not matter — the app shuffles them.

Then add an independent computation of the answer — for every question and every quick check — to `checks`
in `scripts/verify.mjs`
(helpers for determinants, inverses, rank, eigenvalues and solving systems are at the top):

```js
'la-08-1': () => solve([[1, 1], [2, -1]], [1, 8]),
```

It may also return `{ id: 'b' }` when it decides which option is right without numeric values.
Run `npm run verify`. It fails if a key is wrong, if a distractor equals the answer, if a wrong option has no
trap explanation, if a lecture uses an unknown diagram, if a `$` is unbalanced or if a formula does not render.
The deployment runs the same check, so a broken question cannot be published.

### Parametric questions (fresh numbers on every attempt)

A numeric question can be written as a template: `generate` draws random values from a seeded source and
returns the prompt, options, traps and solution built from them. Every practice session, module test and review
draws new numbers; Mistakes first shows the exact numbers that were missed (the seed is stored), then
fresh ones. All modules with content use templates (`NN-name.practice.ts`, `NN-name.extra.ts`). Calculus answers are re-checked
numerically from the function itself (finite differences, Simpson's rule, limits evaluated near the point),
probability answers by enumerating the sample space or integrating the density, statistics answers by
maximising the log-likelihood numerically, solving the normal equations or deriving z from the normal CDF,
optimization answers by running gradient descent, momentum and constrained searches numerically; in
logic and proofs the variation comes from pools of statements, sets and functions rather than only from numbers.

```ts
{
  id: 'la-04-1',
  difficulty: 1,
  keyConceptTag: '2×2 determinant',
  correctOptionId: 'a',                     // fixed across variants
  generate: (g) => {
    // g.int, g.nonzero, g.pick; g.until(draw, ok) redraws until the constraints hold
    const A = g.until(() => mat(g, 2, 2, -3, 6), ([[a, b], [c, d]]) => allDistinct([a * d - b * c, a * d + b * c, a + d]));
    return {
      params: { A },                        // handed to the independent check in verify.mjs
      promptText: r`Compute $\det${pm(A)}$.`,
      options: [
        { id: 'a', label: r`$${det2(A)}$`, value: det2(A) },
        { id: 'b', label: r`$${A[0][0] * A[1][1] + A[0][1] * A[1][0]}$`, value: …, trapExplanation: r`…adds the two products…` },
        // …
      ],
      stepByStepSolution: [r`…with the drawn numbers…`, …],
    };
  },
}
```

Formatting and exact integer helpers (`pm`, `vec`, `lin`, `system`, `frac`, `paren`, `det2`, `mm`, …) are in
`src/data/lessons/gen.ts`. Inside `${…}` use the `r` tag for nested template strings too, otherwise `\cdot`
loses its backslash (the checker reports such text). The check in `scripts/verify.mjs` receives the params:

```js
'la-04-1': ({ A }) => det(A),
```

`npm run verify` generates every template with 300 seeds and checks each variant: structure, unique options,
renderable formulas and the recomputed key. On the `#all` page, "New numbers" draws another set of variants.
Conceptual questions (which proof technique, which statement is true) stay fixed.
