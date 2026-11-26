import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct } from '../gen.ts';
import { baseCase, stepTerm } from './05-induction.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ml-05-x1',
    difficulty: 1,
    keyConceptTag: 'Sum of the first n integers',
    correctOptionId: 'a',
    generate: (g) => {
      const n = 2 * g.int(4, 15); // even, so that the n²/2 slip is a whole number too
      const S = (n * (n + 1)) / 2;
      return {
        params: { n },
        promptText: r`Compute $\displaystyle\sum_{k=1}^{${n}} k$.`,
        options: [
          { id: 'a', label: `${S}`, value: S },
          { id: 'b', label: `${(n * n) / 2}`, value: (n * n) / 2, trapExplanation: r`$\frac{${n}^2}{2}$ uses pairs of sum ${n}; the pairs sum to $n + 1 = ${n + 1}$, not ${n}.` },
          { id: 'c', label: `${n * (n + 1)}`, value: n * (n + 1), trapExplanation: r`$${n} \cdot ${n + 1}$ forgets to divide by 2: each number was counted twice in the pairing.` },
          { id: 'd', label: `${((n - 1) * n) / 2}`, value: ((n - 1) * n) / 2, trapExplanation: r`$\frac{${n - 1} \cdot ${n}}{2}$ is the sum up to ${n - 1}. The formula uses $n(n+1)$ with $n = ${n}$.` },
        ],
        stepByStepSolution: [
          r`$\sum_{k=1}^{n} k = \dfrac{n(n + 1)}{2}$.`,
          r`With $n = ${n}$: $\dfrac{${n} \cdot ${n + 1}}{2}$.`,
          r`$= ${S}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-05-x2',
    difficulty: 1,
    keyConceptTag: 'Sum of odd numbers',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(6, 25);
      return {
        params: { n },
        promptText: r`Using $1 + 3 + 5 + \dots + (2n - 1) = n^2$, compute the sum of the first ${n} odd numbers.`,
        options: [
          { id: 'a', label: `${n * n}`, value: n * n },
          { id: 'b', label: `${(n + 1) ** 2}`, value: (n + 1) ** 2, trapExplanation: r`The ${n}th odd number is ${2 * n - 1}, so $n = ${n}$ and the sum is $${n}^2$, not $${n + 1}^2$.` },
          { id: 'c', label: `${(n * (n + 1)) / 2}`, value: (n * (n + 1)) / 2, trapExplanation: r`${(n * (n + 1)) / 2} is $1 + 2 + \dots + ${n}$, the sum of all the first ${n} integers, not the odd ones.` },
          { id: 'd', label: `${n * n - 1}`, value: n * n - 1, trapExplanation: r`Check small cases: $1 + 3 = 4 = 2^2$. The sum is exactly $n^2$, with no correction term.` },
        ],
        stepByStepSolution: [
          r`The first ${n} odd numbers are $1, 3, \dots, ${2 * n - 1}$, i.e. $2k - 1$ for $k = 1, \dots, ${n}$.`,
          r`By the formula their sum is $n^2$ with $n = ${n}$.`,
          r`$${n}^2 = ${n * n}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-05-x3',
    difficulty: 1,
    keyConceptTag: 'Geometric sum',
    correctOptionId: 'a',
    generate: (g) => {
      const m = g.int(4, 8);
      const S = 2 ** (m + 1) - 1;
      const terms = Array.from({ length: m + 1 }, (_, k) => 2 ** k);
      return {
        params: { q: 2, m },
        promptText: r`Compute $${terms.join(' + ')}$.`,
        options: [
          { id: 'a', label: `${S}`, value: S },
          { id: 'b', label: `${S + 1}`, value: S + 1, trapExplanation: r`$2^{${m + 1}} = ${S + 1}$ is the next power; the sum of all smaller powers is one less: $2^{${m + 1}} - 1$.` },
          { id: 'c', label: `${2 ** m - 1}`, value: 2 ** m - 1, trapExplanation: r`${2 ** m - 1} stops one term early. The last term here is $${2 ** m} = 2^{${m}}$, so the sum is $2^{${m + 1}} - 1$.` },
          { id: 'd', label: `${S - 1}`, value: S - 1, trapExplanation: r`That is $2 + 4 + \dots + ${2 ** m}$: the first term $1 = 2^0$ was left out.` },
        ],
        stepByStepSolution: [
          r`Geometric sum: $1 + q + \dots + q^{m} = \dfrac{q^{m+1} - 1}{q - 1}$.`,
          r`Here $q = 2$ and the last power is $2^{${m}}$, so $m = ${m}$.`,
          r`$\dfrac{2^{${m + 1}} - 1}{2 - 1} = ${S}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-05-x4',
    difficulty: 2,
    keyConceptTag: 'The inductive step',
    correctOptionId: 'a',
    generate: stepTerm,
  },
  {
    id: 'ml-05-x5',
    difficulty: 2,
    keyConceptTag: 'Sum of the first n integers',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(6, 20);
      const S = (n * (n + 1)) / 2;
      const opts = [n, n + 1, S, n - 1];
      if (!allDistinct(opts)) throw new Error('distinct');
      return {
        params: { S },
        promptText: r`For which $n$ is $1 + 2 + \dots + n = ${S}$?`,
        options: [
          { id: 'a', label: `${n}`, value: n },
          { id: 'b', label: `${n + 1}`, value: n + 1, trapExplanation: r`$\frac{${n + 1} \cdot ${n + 2}}{2} = ${((n + 1) * (n + 2)) / 2}$, too large.` },
          { id: 'c', label: `${S}`, value: S, trapExplanation: r`${S} is the value of the sum, not the number of terms.` },
          { id: 'd', label: `${n - 1}`, value: n - 1, trapExplanation: r`$\frac{${n - 1} \cdot ${n}}{2} = ${((n - 1) * n) / 2}$, too small.` },
        ],
        stepByStepSolution: [
          r`Solve $\dfrac{n(n + 1)}{2} = ${S}$, i.e. $n(n + 1) = ${2 * S}$.`,
          r`$${n} \cdot ${n + 1} = ${2 * S}$.`,
          r`So $n = ${n}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-05-x6',
    difficulty: 2,
    keyConceptTag: 'Choosing the base case',
    correctOptionId: 'a',
    generate: (g) => baseCase(g, [5, 6, 7, 0]),
  },
];
