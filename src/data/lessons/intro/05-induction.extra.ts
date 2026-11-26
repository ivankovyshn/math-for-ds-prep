import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'ml-05-x1',
    difficulty: 1,
    promptText: r`Compute $\displaystyle\sum_{k=1}^{20} k$.`,
    options: [
      { id: 'a', label: '210', value: 210 },
      { id: 'b', label: '200', value: 200, trapExplanation: r`$20 \cdot 10$ uses $\frac{n}{2}$ pairs of sum $n$; the pairs sum to $n + 1 = 21$, not 20.` },
      { id: 'c', label: '420', value: 420, trapExplanation: r`$20 \cdot 21 = 420$ forgets to divide by 2: each number was counted twice in the pairing.` },
      { id: 'd', label: '190', value: 190, trapExplanation: r`$\frac{19 \cdot 20}{2} = 190$ is the sum up to 19. The formula uses $n(n+1)$ with $n = 20$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$\sum_{k=1}^{n} k = \dfrac{n(n + 1)}{2}$.`,
      r`With $n = 20$: $\dfrac{20 \cdot 21}{2}$.`,
      r`$= 210$.`,
    ],
    keyConceptTag: 'Sum of the first n integers',
  },
  {
    id: 'ml-05-x2',
    difficulty: 1,
    promptText: r`Using $1 + 3 + 5 + \dots + (2n - 1) = n^2$, compute the sum of the first 10 odd numbers.`,
    options: [
      { id: 'a', label: '100', value: 100 },
      { id: 'b', label: '121', value: 121, trapExplanation: r`The 10th odd number is 19, so $n = 10$ and the sum is $10^2$, not $11^2$.` },
      { id: 'c', label: '55', value: 55, trapExplanation: r`55 is $1 + 2 + \dots + 10$, the sum of all the first 10 integers, not the odd ones.` },
      { id: 'd', label: '99', value: 99, trapExplanation: r`Check small cases: $1 + 3 = 4 = 2^2$. The sum is exactly $n^2$, with no correction term.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`The first 10 odd numbers are $1, 3, \dots, 19$, i.e. $2n - 1$ for $n = 1, \dots, 10$.`,
      r`By the formula their sum is $n^2$ with $n = 10$.`,
      r`$10^2 = 100$.`,
    ],
    keyConceptTag: 'Sum of odd numbers',
  },
  {
    id: 'ml-05-x3',
    difficulty: 1,
    promptText: r`Compute $1 + 2 + 4 + 8 + 16 + 32$.`,
    options: [
      { id: 'a', label: '63', value: 63 },
      { id: 'b', label: '64', value: 64, trapExplanation: r`$2^6 = 64$ is the next power; the sum of all smaller powers is one less: $2^6 - 1$.` },
      { id: 'c', label: '31', value: 31, trapExplanation: r`31 stops at 16. The last term here is $32 = 2^5$, so the sum is $2^6 - 1$.` },
      { id: 'd', label: '62', value: 62, trapExplanation: r`That is $2 + 4 + \dots + 32$: the first term $1 = 2^0$ was left out.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Geometric sum: $1 + q + \dots + q^{n} = \dfrac{q^{n+1} - 1}{q - 1}$.`,
      r`Here $q = 2$ and the last power is $2^5$, so $n = 5$.`,
      r`$\dfrac{2^6 - 1}{2 - 1} = 63$.`,
    ],
    keyConceptTag: 'Geometric sum',
  },
  {
    id: 'ml-05-x4',
    difficulty: 2,
    promptText: r`To prove a formula for $1^2 + 2^2 + \dots + n^2$ by induction, which term is added in the step from $n$ to $n + 1$?`,
    options: [
      { id: 'a', label: r`$(n + 1)^2$` },
      { id: 'b', label: r`$n^2 + 1$`, trapExplanation: r`The new term is the next square, $(n + 1)^2 = n^2 + 2n + 1$, not $n^2 + 1$.` },
      { id: 'c', label: r`$2n + 1$`, trapExplanation: r`$2n + 1$ is the difference between consecutive squares, $(n+1)^2 - n^2$, not the new term of the sum.` },
      { id: 'd', label: r`$n + 1$`, trapExplanation: r`That is the new term for the sum $1 + 2 + \dots + n$. Here every term is squared.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$S(n) = 1^2 + \dots + n^2$ and $S(n + 1) = 1^2 + \dots + n^2 + (n + 1)^2$.`,
      r`So $S(n + 1) = S(n) + (n + 1)^2$.`,
      r`In the step you use the formula for $S(n)$ and add $(n + 1)^2$.`,
    ],
    keyConceptTag: 'The inductive step',
  },
  {
    id: 'ml-05-x5',
    difficulty: 2,
    promptText: r`For which $n$ is $1 + 2 + \dots + n = 55$?`,
    options: [
      { id: 'a', label: '10', value: 10 },
      { id: 'b', label: '11', value: 11, trapExplanation: r`$\frac{11 \cdot 12}{2} = 66$, too large.` },
      { id: 'c', label: '55', value: 55, trapExplanation: r`55 is the value of the sum, not the number of terms.` },
      { id: 'd', label: '9', value: 9, trapExplanation: r`$\frac{9 \cdot 10}{2} = 45$, too small.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Solve $\dfrac{n(n + 1)}{2} = 55$, i.e. $n(n + 1) = 110$.`,
      r`$10 \cdot 11 = 110$.`,
      r`So $n = 10$.`,
    ],
    keyConceptTag: 'Sum of the first n integers',
  },
  {
    id: 'ml-05-x6',
    difficulty: 2,
    promptText: r`What is the smallest $n_0 \ge 1$ such that $2^n > 3n$ holds for every integer $n \ge n_0$?`,
    options: [
      { id: 'a', label: '4', value: 4 },
      { id: 'b', label: '3', value: 3, trapExplanation: r`$2^3 = 8$ but $3 \cdot 3 = 9$: the inequality fails at $n = 3$.` },
      { id: 'c', label: '1', value: 1, trapExplanation: r`$2^1 = 2 < 3$: it already fails at $n = 1$.` },
      { id: 'd', label: '5', value: 5, trapExplanation: r`It already holds at $n = 4$ ($16 > 12$), so 5 is not the smallest starting point.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Test small $n$: $2 < 3$, $4 < 6$, $8 < 9$, then $16 > 12$.`,
      r`Base case $n = 4$ holds. Step: if $2^n > 3n$ and $n \ge 4$, then $2^{n+1} = 2 \cdot 2^n > 6n \ge 3n + 3$.`,
      r`So the inequality holds for all $n \ge 4$, and fails at $n = 3$: $n_0 = 4$.`,
    ],
    keyConceptTag: 'Choosing the base case',
  },
];
