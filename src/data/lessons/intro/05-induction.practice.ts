import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';

/**
 * Sums for "which term is added in the step from n to n + 1?". Options: a the next term, b the last term
 * of the n case, c a typical slip, d the new total. scripts/verify.mjs keeps the same table (STEP_SUMS)
 * as functions of n and checks S(n + 1) − S(n).
 */
export const STEP_SUMS = [
  { sum: r`1 + 3 + 5 + \dots + (2n - 1) = n^2`, a: '2n + 1', b: '2n - 1', c: 'n + 1', d: '(n + 1)^2', tc: r`The terms are odd numbers $2k - 1$, not $k$. Substitute $k = n + 1$ into $2k - 1$.` },
  { sum: r`1 + 2 + \dots + n = \frac{n(n + 1)}{2}`, a: 'n + 1', b: 'n', c: '2n + 1', d: '\\frac{(n + 1)(n + 2)}{2}', tc: r`$2n + 1$ is the next odd number; here every whole number is added, so the new term is $n + 1$.` },
  { sum: r`1^2 + 2^2 + \dots + n^2 = \frac{n(n + 1)(2n + 1)}{6}`, a: '(n + 1)^2', b: 'n^2', c: 'n^2 + 1', d: '\\frac{(n + 1)(n + 2)(2n + 3)}{6}', tc: r`The new term is the next square, $(n + 1)^2 = n^2 + 2n + 1$, not $n^2 + 1$.` },
  { sum: r`1 + 2 + 4 + \dots + 2^{n - 1} = 2^n - 1`, a: '2^n', b: '2^{n - 1}', c: '2^{n + 1}', d: '2^{n + 1} - 1', tc: r`The $k$-th term is $2^{k - 1}$; for $k = n + 1$ it is $2^n$, not $2^{n + 1}$.` },
  { sum: r`1\cdot 2 + 2\cdot 3 + \dots + n(n + 1) = \frac{n(n + 1)(n + 2)}{3}`, a: '(n + 1)(n + 2)', b: 'n(n + 1)', c: 'n(n + 2)', d: '\\frac{(n + 1)(n + 2)(n + 3)}{3}', tc: r`Substitute $k = n + 1$ into <i>both</i> factors of $k(k + 1)$: $(n + 1)(n + 2)$.` },
];

export function stepTerm(g: Rng) {
  const kind = g.int(0, STEP_SUMS.length - 1);
  const s = STEP_SUMS[kind];
  return {
    params: { kind },
    promptText: r`To prove $${s.sum}$ by induction, which term is added in the step from $n$ to $n + 1$?`,
    options: [
      { id: 'a', label: `$${s.a}$` },
      { id: 'b', label: `$${s.b}$`, trapExplanation: r`$${s.b}$ is the last term of the $n$ case. The step adds the <i>next</i> term, number $n + 1$.` },
      { id: 'c', label: `$${s.c}$`, trapExplanation: s.tc },
      { id: 'd', label: `$${s.d}$`, trapExplanation: r`$${s.d}$ is the new <i>total</i> you are aiming for, not the new term.` },
    ],
    stepByStepSolution: [
      r`Write $S(n)$ for the left side. Then $S(n + 1) = S(n) + (\text{term number } n + 1)$.`,
      r`Term number $n + 1$ is $${s.a}$.`,
      r`In the step you use the formula for $S(n)$, add $${s.a}$ and show the result equals $${s.d}$.`,
    ],
  };
}

/**
 * Inequalities "a(n) > b(n)" with the smallest n₀ from which they hold for good (scripts/verify.mjs has
 * the same list, INEQUALITIES, and finds n₀ by brute force).
 */
export const INEQUALITIES = [
  { s: '2^n > n^2', l: (n: number) => 2 ** n, rr: (n: number) => n * n },
  { s: '2^n > n^3', l: (n: number) => 2 ** n, rr: (n: number) => n ** 3 },
  { s: '3^n > n^3', l: (n: number) => 3 ** n, rr: (n: number) => n ** 3 },
  { s: 'n! > 2^n', l: (n: number) => fact(n), rr: (n: number) => 2 ** n },
  { s: 'n! > 3^n', l: (n: number) => fact(n), rr: (n: number) => 3 ** n },
  { s: '2^n > 3n', l: (n: number) => 2 ** n, rr: (n: number) => 3 * n },
  { s: '2^n > 5n', l: (n: number) => 2 ** n, rr: (n: number) => 5 * n },
  { s: '3^n > 5n', l: (n: number) => 3 ** n, rr: (n: number) => 5 * n },
];
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const n0Of = (i: number) => {
  const { l, rr } = INEQUALITIES[i];
  for (let n0 = 1; n0 < 30; n0++) {
    let ok = true;
    for (let n = n0; n <= 40; n++) if (!(l(n) > rr(n))) ok = false;
    if (ok) return n0;
  }
  throw new Error('no n0');
};

export function baseCase(g: Rng, pool: number[]) {
  const i = g.pick(pool);
  const { s, l, rr } = INEQUALITIES[i];
  const n0 = n0Of(i);
  const cmp = (n: number) => `$${l(n)} ${l(n) > rr(n) ? '>' : l(n) === rr(n) ? '=' : '<'} ${rr(n)}$`;
  const fourth = n0 - 1 > 1 && n0 - 1 !== 1 ? 1 : n0 + 2;
  const lowWhy = l(1) > rr(1)
    ? r`At $n = 1$ it holds (${cmp(1)}), but it fails at $n = ${n0 - 1}$ (${cmp(n0 - 1)}). It must hold for <i>all</i> $n \ge n_0$.`
    : r`At $n = 1$ it already fails: ${cmp(1)}.`;
  return {
    params: { i },
    promptText: r`What is the smallest $n_0 \ge 1$ such that $${s}$ holds for <i>every</i> integer $n \ge n_0$?`,
    options: [
      { id: 'a', label: `$${n0}$`, value: n0 },
      { id: 'b', label: `$${n0 - 1}$`, value: n0 - 1, trapExplanation: r`At $n = ${n0 - 1}$: ${cmp(n0 - 1)}. The inequality is strict, so $n = ${n0 - 1}$ fails.` },
      { id: 'c', label: `$${n0 + 1}$`, value: n0 + 1, trapExplanation: r`It already holds at $n = ${n0}$ (${cmp(n0)}), so $${n0 + 1}$ is not the smallest starting point.` },
      fourth === 1
        ? { id: 'd', label: '$1$', value: 1, trapExplanation: lowWhy }
        : { id: 'd', label: `$${n0 + 2}$`, value: n0 + 2, trapExplanation: r`It already holds from $n = ${n0}$ on, so $${n0 + 2}$ is not the smallest starting point.` },
    ],
    stepByStepSolution: [
      r`Test small $n$: ${[n0 - 2, n0 - 1, n0, n0 + 1].filter((n) => n >= 1).map((n) => `$n = ${n}$: ${cmp(n)}`).join('; ')}.`,
      r`The base case $n = ${n0}$ holds, and the inductive step works from there on (the left side grows faster).`,
      r`It fails at $n = ${n0 - 1}$, so $n_0 = ${n0}$.`,
    ],
  };
}

export const practice: QuestionTemplate[] = [
  {
    id: 'ml-05-1',
    difficulty: 1,
    keyConceptTag: 'Sum of the first n integers',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([20, 30, 40, 50, 60, 80, 100, 200]);
      const S = (n * (n + 1)) / 2;
      return {
        params: { n },
        promptText: r`Compute $\displaystyle\sum_{k=1}^{${n}} k$.`,
        options: [
          { id: 'a', label: `$${S}$`, value: S },
          { id: 'b', label: `$${n * (n + 1)}$`, value: n * (n + 1), trapExplanation: r`$${n}\cdot${n + 1}$ forgets the division by 2. Pairing $1 + ${n}$, $2 + ${n - 1}$, … gives ${n / 2} pairs of ${n + 1}.` },
          { id: 'c', label: `$${((n - 1) * n) / 2}$`, value: ((n - 1) * n) / 2, trapExplanation: r`$${((n - 1) * n) / 2} = \frac{${n - 1}\cdot${n}}{2}$ is the sum up to ${n - 1}. The last term ${n} is missing.` },
          { id: 'd', label: `$${(n * n) / 2}$`, value: (n * n) / 2, trapExplanation: r`$\frac{${n}^2}{2}$ approximates the sum but misses $\frac{n}{2} = ${n / 2}$. The exact formula is $\frac{n(n+1)}{2}$.` },
        ],
        stepByStepSolution: [
          r`$\sum_{k=1}^{n} k = \frac{n(n+1)}{2}$.`,
          r`$n = ${n}$: $\frac{${n}\cdot${n + 1}}{2}$.`,
          r`$= ${S}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-05-2',
    difficulty: 1,
    keyConceptTag: 'The inductive step',
    correctOptionId: 'a',
    generate: stepTerm,
  },
  {
    id: 'ml-05-3',
    difficulty: 2,
    keyConceptTag: 'Sum of squares',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(5, 15);
      const S = (n * (n + 1) * (2 * n + 1)) / 6;
      const T = (n * (n + 1)) / 2;
      return {
        params: { n },
        promptText: r`Compute $\displaystyle\sum_{k=1}^{${n}} k^2$.`,
        options: [
          { id: 'a', label: `$${S}$`, value: S },
          { id: 'b', label: `$${T * T}$`, value: T * T, trapExplanation: r`$${T * T} = ${T}^2 = (\sum k)^2$. The sum of squares is not the square of the sum.` },
          { id: 'c', label: `$${T}$`, value: T, trapExplanation: r`$${T} = \sum k$, the sum without squaring.` },
          { id: 'd', label: `$${3 * S}$`, value: 3 * S, trapExplanation: r`$\frac{${n}\cdot${n + 1}\cdot${2 * n + 1}}{2}$ divides by 2 instead of 6 in $\frac{n(n+1)(2n+1)}{6}$.` },
        ],
        stepByStepSolution: [
          r`$\sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6}$.`,
          r`$n = ${n}$: $\frac{${n}\cdot${n + 1}\cdot${2 * n + 1}}{6} = \frac{${6 * S}}{6}$.`,
          r`$= ${S}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-05-4',
    difficulty: 2,
    keyConceptTag: 'Geometric sum',
    correctOptionId: 'a',
    generate: (g) => {
      const q = g.pick([2, 3]);
      const m = q === 2 ? g.int(5, 10) : g.int(3, 6);
      const S = (q ** (m + 1) - 1) / (q - 1);
      const first = [1, q, q * q, q ** 3].join(' + ');
      return {
        params: { q, m },
        promptText: r`Compute $${first} + \dots + ${q}^{${m}}$.`,
        options: [
          { id: 'a', label: `$${S}$`, value: S },
          { id: 'b', label: `$${q ** (m + 1)}$`, value: q ** (m + 1), trapExplanation: r`$${q}^{${m + 1}}$ is the next power; the formula gives $\frac{${q}^{${m + 1}} - 1}{${q} - 1}$.` },
          { id: 'c', label: `$${q ** m}$`, value: q ** m, trapExplanation: r`$${q ** m} = ${q}^{${m}}$ is only the last term.` },
          { id: 'd', label: `$${(q ** (m + 2) - 1) / (q - 1)}$`, value: (q ** (m + 2) - 1) / (q - 1), trapExplanation: r`That is the sum up to $${q}^{${m + 1}}$. The last term here is $${q}^{${m}}$, so there are ${m + 1} terms.` },
        ],
        stepByStepSolution: [
          r`Geometric sum with ratio $${q}$ and terms $${q}^0, \dots, ${q}^{${m}}$: $\frac{${q}^{${m + 1}} - 1}{${q} - 1}$.`,
          r`$= \frac{${q ** (m + 1)} - 1}{${q - 1}}$.`,
          r`$= ${S}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-05-5',
    difficulty: 3,
    keyConceptTag: 'Choosing the base case',
    correctOptionId: 'a',
    generate: (g) => baseCase(g, [0, 1, 2, 3, 4]),
  },
];

