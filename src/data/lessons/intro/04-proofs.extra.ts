import type { QuestionDraft, QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { shuffle } from '../gen.ts';
import { squareRemainder } from './04-proofs.practice.ts';

const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};

/** "Every … is prime" claims: hypothesis as a predicate and in words. */
const PRIME_CLAIMS = [
  { s: 'every odd number greater than 1 is prime', hyp: (n: number) => n > 1 && n % 2 === 1, outside: 'is even, so the claim says nothing about it' },
  { s: 'every number ending in 3 is prime', hyp: (n: number) => n % 10 === 3, outside: 'does not end in 3, so the claim says nothing about it' },
  { s: 'every number of the form $6k + 1$ is prime', hyp: (n: number) => n % 6 === 1, outside: 'is not of the form $6k + 1$, so the claim says nothing about it' },
];

/**
 * Statements about all integers a, b. scripts/verify.mjs keeps the same lists (AB_TRUE / AB_FALSE)
 * and checks them by brute force.
 */
export const AB_TRUE = [
  { s: r`If $a$ and $b$ are even, then $ab$ is divisible by 4`, steps: [r`Write $a = 2m$ and $b = 2n$.`, r`Then $ab = 4mn$, a multiple of 4.`] },
  { s: r`If $a$ and $b$ are odd, then $a + b$ is even`, steps: [r`Write $a = 2m + 1$ and $b = 2n + 1$.`, r`Then $a + b = 2(m + n + 1)$, which is even.`] },
  { s: r`If $a$ is even, then $ab$ is even`, steps: [r`Write $a = 2m$.`, r`Then $ab = 2(mb)$, which is even.`] },
  { s: r`If $a$ and $b$ are odd, then $ab$ is odd`, steps: [r`Write $a = 2m + 1$ and $b = 2n + 1$.`, r`Then $ab = 2(2mn + m + n) + 1$, which is odd.`] },
];
export const AB_FALSE = [
  { s: r`If $ab$ is even, then $a$ and $b$ are both even`, cex: r`One even factor is enough: $2 \cdot 3 = 6$ is even, but 3 is odd.` },
  { s: r`If $a + b$ is even, then $a$ and $b$ are both even`, cex: r`Two odd numbers also have an even sum: $1 + 1 = 2$.` },
  { s: r`If $ab$ is divisible by 4, then $a$ or $b$ is divisible by 4`, cex: r`$2 \cdot 2 = 4$ is divisible by 4, yet neither factor is.` },
  { s: r`If $a + b$ is odd, then $a$ is odd`, cex: r`$2 + 1 = 3$ is odd, but $a = 2$ is even.` },
  { s: r`If $ab$ is odd, then $a + b$ is odd`, cex: r`$1 \cdot 1 = 1$ is odd, but $1 + 1 = 2$ is even.` },
];

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: (QuestionTemplate | QuestionDraft)[] = [
  {
    id: 'ml-04-x1',
    difficulty: 1,
    keyConceptTag: 'Disproof by counterexample',
    correctOptionId: 'a',
    generate: (g) => {
      const claim = g.int(0, PRIME_CLAIMS.length - 1);
      const c = PRIME_CLAIMS[claim];
      const range = Array.from({ length: 120 }, (_, i) => i + 2);
      const cex = g.pick(range.filter((n) => c.hyp(n) && !isPrime(n)));
      const [p1, p2] = shuffle(g, range.filter((n) => c.hyp(n) && isPrime(n) && n !== cex)).slice(0, 2);
      const out = g.pick(range.filter((n) => !c.hyp(n) && !isPrime(n)));
      const factor = range.find((d) => cex % d === 0)!;
      return {
        params: { claim, ns: [cex, p1, p2, out] },
        promptText: r`Which number is a counterexample to "${c.s}"?`,
        options: [
          { id: 'a', label: `${cex}`, value: cex },
          { id: 'b', label: `${p1}`, value: p1, trapExplanation: r`${p1} satisfies the hypothesis <i>and</i> is prime, so it agrees with the claim. A counterexample must satisfy the hypothesis and break the conclusion.` },
          { id: 'c', label: `${p2}`, value: p2, trapExplanation: r`${p2} is prime — it supports the claim instead of refuting it.` },
          { id: 'd', label: `${out}`, value: out, trapExplanation: r`${out} is not prime, but it ${c.outside}.` },
        ],
        stepByStepSolution: [
          r`A counterexample to "every $x$ with property $A$ has property $B$" is one $x$ with $A$ but not $B$.`,
          r`${cex} satisfies the hypothesis, but $${cex} = ${factor} \cdot ${cex / factor}$ is not prime.`,
          r`One counterexample is enough: the claim is false.`,
        ],
      };
    },
  },
  {
    id: 'ml-04-x2',
    difficulty: 1,
    promptText: r`Let $n = 2k + 1$ be odd. Expanding $n^2 = 4k^2 + 4k + 1$ shows that $n^2$ is…`,
    options: [
      { id: 'a', label: r`odd: $n^2 = 2(2k^2 + 2k) + 1$` },
      { id: 'b', label: r`even: $n^2 = 2(2k^2 + 2k)$`, trapExplanation: r`The "+1" was dropped. $4k^2 + 4k$ is even, and adding 1 makes it odd.` },
      { id: 'c', label: r`of the form $4m + 3$`, trapExplanation: r`$4k^2 + 4k + 1 = 4(k^2 + k) + 1$ leaves remainder 1 on division by 4, not 3.` },
      { id: 'd', label: r`divisible by 4`, trapExplanation: r`$4k^2 + 4k$ is divisible by 4, but the remaining $+1$ is not.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Direct proof: start from the hypothesis $n = 2k + 1$.`,
      r`$n^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$.`,
      r`It has the form $2m + 1$ with the integer $m = 2k^2 + 2k$, so $n^2$ is odd.`,
    ],
    keyConceptTag: 'Direct proof',
  },
  {
    id: 'ml-04-x3',
    difficulty: 1,
    promptText: r`How does a proof by contradiction of a statement $S$ begin?`,
    options: [
      { id: 'a', label: r`Assume $S$ is false and derive something impossible` },
      { id: 'b', label: r`Assume $S$ is true and derive something true`, trapExplanation: r`Deriving true facts from $S$ proves nothing about $S$ — you can derive true facts from false assumptions too.` },
      { id: 'c', label: r`Check $S$ on many examples`, trapExplanation: r`Examples never prove a general statement; $n^2 + n + 41$ is prime for $n = 1, \dots, 39$ and then fails.` },
      { id: 'd', label: r`Find a counterexample to $S$`, trapExplanation: r`A counterexample would <i>disprove</i> $S$. A proof by contradiction is used to show $S$ is true.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Assume $\neg S$.`,
      r`Reason correctly from it until you reach a contradiction, such as $p$ being both even and odd.`,
      r`Since correct reasoning from $\neg S$ led to something impossible, $\neg S$ is false, so $S$ is true.`,
    ],
    keyConceptTag: 'Proof by contradiction',
  },
  {
    id: 'ml-04-x4',
    difficulty: 2,
    keyConceptTag: 'Working with remainders',
    correctOptionId: 'a',
    generate: (g) => squareRemainder(g, [3, 4]),
  },
  {
    id: 'ml-04-x5',
    difficulty: 2,
    keyConceptTag: 'Direct proof',
    correctOptionId: 'a',
    generate: (g) => {
      const t = g.int(0, AB_TRUE.length - 1);
      const f = shuffle(g, AB_FALSE.map((_, i) => i)).slice(0, 3);
      return {
        params: { t, f },
        promptText: r`Which statement is true for <i>all</i> integers $a$ and $b$?`,
        options: [
          { id: 'a', label: AB_TRUE[t].s },
          ...f.map((i, n) => ({ id: 'bcd'[n], label: AB_FALSE[i].s, trapExplanation: AB_FALSE[i].cex })),
        ],
        stepByStepSolution: [...AB_TRUE[t].steps, r`Each of the other statements has a small counterexample.`],
      };
    },
  },
  {
    id: 'ml-04-x6',
    difficulty: 2,
    keyConceptTag: 'Disproof by counterexample',
    correctOptionId: 'a',
    generate: (g) => {
      const [d, root] = g.pick([[4, 2], [9, 3], [8, 4], [25, 5]]);
      // n² divisible by d, n itself not divisible by d.
      const cex = g.pick(Array.from({ length: 30 }, (_, i) => i + 1).filter((n) => n % root === 0 && (n * n) % d === 0 && n % d !== 0));
      const mult = d * g.int(1, 2);
      const noHyp = g.pick([1, 3, 5, 7].filter((n) => (n * n) % d !== 0));
      const mult2 = d * 3;
      return {
        params: { d, ns: [cex, mult, noHyp, mult2] },
        promptText: r`Which $n$ is a counterexample to "if $n^2$ is divisible by ${d}, then $n$ is divisible by ${d}"?`,
        options: [
          { id: 'a', label: `$n = ${cex}$`, value: cex },
          { id: 'b', label: `$n = ${mult}$`, value: mult, trapExplanation: r`${mult} is divisible by ${d}, so the conclusion holds; it does not refute anything.` },
          { id: 'c', label: `$n = ${noHyp}$`, value: noHyp, trapExplanation: r`$${noHyp}^2 = ${noHyp * noHyp}$ is not divisible by ${d}, so the hypothesis fails and the implication is (vacuously) true.` },
          { id: 'd', label: `$n = ${mult2}$`, value: mult2, trapExplanation: r`${mult2} is divisible by ${d}, so the conclusion holds.` },
        ],
        stepByStepSolution: [
          r`We need $n$ with ${d} dividing $n^2$ (hypothesis true) but not $n$ (conclusion false).`,
          r`$n = ${cex}$: $n^2 = ${cex * cex}$ is divisible by ${d}, but ${cex} is not.`,
          r`So the statement is false: divisibility of $n^2$ by a non-prime like ${d} does not pass to $n$.`,
        ],
      };
    },
  },
];
