import { defineLesson, r } from '../define.ts';
import { extra } from './05-induction.extra.ts';

export default defineLesson({
  id: 'ml-05',
  moduleId: 'intro',
  title: 'Mathematical induction',
  blurb: 'Base case, inductive step, sums',
  minutes: 7,
  lecture: [
    {
      title: 'The domino principle',
      blocks: [
        {
          kind: 'text',
          text: r`How do you prove infinitely many statements $P(1), P(2), P(3), \dots$ at once? Imagine them as dominoes. If the first one falls, and every falling domino knocks over the next, then all of them fall.`,
        },
        { kind: 'diagram', type: 'dominoes' },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Principle of induction',
          text: r`If

• (base case) $P(1)$ is true, and

• (inductive step) for every $n \ge 1$, $P(n) \Rightarrow P(n + 1)$,

then $P(n)$ is true for every $n \ge 1$. The assumption "$P(n)$ is true" inside the step is called the <i>inductive hypothesis</i>.`,
        },
        {
          kind: 'quiz',
          id: 'ml-05-q1',
          prompt: r`Which two facts together prove $P(n)$ for every $n \ge 1$?`,
          options: [
            { id: 'a', label: r`$P(1)$ is true, and $P(n) \Rightarrow P(n + 1)$ for every $n \ge 1$` },
            { id: 'b', label: r`$P(1)$ and $P(2)$ are true`, trapExplanation: r`Checking cases never covers all $n$. Without the step, $P(3)$ could still fail.` },
            { id: 'c', label: r`$P(n) \Rightarrow P(n + 1)$ for every $n \ge 1$`, trapExplanation: r`The step alone knocks over nothing: without a first domino, the chain never starts.` },
          ],
          correctOptionId: 'a',
          explanation: r`Base case plus step: the first domino falls, and each falling domino knocks over the next.`,
        },
      ],
    },
    {
      title: 'A first proof',
      blocks: [
        {
          kind: 'example',
          title: 'The sum 1 + 2 + … + n',
          prompt: r`Prove $1 + 2 + \dots + n = \dfrac{n(n + 1)}{2}$ for all $n \ge 1$.`,
          steps: [
            r`Base case $n = 1$: left side $1$, right side $\frac{1\cdot2}{2} = 1$. ✓`,
            r`Inductive hypothesis: assume $1 + \dots + n = \frac{n(n+1)}{2}$ for some $n$.`,
            r`Then $1 + \dots + n + (n + 1) = \frac{n(n+1)}{2} + (n + 1) = \frac{(n+1)(n+2)}{2}$.`,
            r`That is the formula for $n + 1$. By induction it holds for all $n \ge 1$. $\blacksquare$`,
          ],
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Where the work happens',
          text: r`In the step, write the $(n+1)$ case so that the $n$ case appears inside it, replace that part using the hypothesis, then simplify towards the target.`,
        },
        {
          kind: 'quiz',
          id: 'ml-05-q2',
          prompt: r`Assume $1 + 2 + \dots + n = \frac{n(n+1)}{2}$. Then $1 + 2 + \dots + (n + 1) = \frac{n(n+1)}{2} + (n + 1)$ simplifies to…`,
          options: [
            { id: 'a', label: r`$\dfrac{(n + 1)(n + 2)}{2}$` },
            { id: 'b', label: r`$\dfrac{(n + 1)^2}{2}$`, trapExplanation: r`Test $n = 1$: the sum $1 + 2 = 3$, but $\frac{2^2}{2} = 2$.` },
            { id: 'c', label: r`$\dfrac{n(n + 1)}{2} + n$`, trapExplanation: r`The new term is $n + 1$, not $n$.` },
          ],
          correctOptionId: 'a',
          explanation: r`Factor out $n + 1$: $\frac{n(n+1)}{2} + \frac{2(n+1)}{2} = \frac{(n+1)(n+2)}{2}$ — exactly the formula with $n + 1$ in place of $n$.`,
        },
      ],
    },
    {
      title: 'Sums worth knowing',
      blocks: [
        {
          kind: 'text',
          text: r`The sigma notation $\sum_{k=1}^{n} a_k$ means $a_1 + a_2 + \dots + a_n$. All of these can be proved by induction:`,
        },
        {
          kind: 'formula',
          tex: r`\sum_{k=1}^{n} k = \frac{n(n+1)}{2}, \qquad \sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6}, \qquad \sum_{k=0}^{n} q^{k} = \frac{q^{n+1} - 1}{q - 1}\ (q \ne 1)`,
        },
        {
          kind: 'quiz',
          id: 'ml-05-q3',
          prompt: r`Compute $1 + 3 + 9 + 27 + 81$ with the geometric formula.`,
          options: [
            { id: 'a', label: '121', value: 121 },
            { id: 'b', label: '242', value: 242, trapExplanation: r`$3^5 - 1 = 242$ still has to be divided by $q - 1 = 2$.` },
            { id: 'c', label: '81', value: 81, trapExplanation: r`81 is only the last term, $3^4$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$q = 3$, last power $3^4$: $\dfrac{3^5 - 1}{3 - 1} = \dfrac{242}{2} = 121$.`,
        },
      ],
    },
    {
      title: 'Variations and traps',
      blocks: [
        {
          kind: 'text',
          text: r`• The base case need not be $n = 1$. "$2^n > n^2$ for $n \ge 5$" starts at $n = 5$ (it fails for $n = 2, 3, 4$).

• <i>Strong induction</i> assumes $P(1), \dots, P(n)$ all hold when proving $P(n+1)$. It is the natural tool for "every integer $\ge 2$ is a product of primes".`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: '"All horses have the same colour"',
          text: r`Claim: any $n$ horses have the same colour. Base $n = 1$ is true. Step: from $n + 1$ horses, remove one — the other $n$ match; remove another — those $n$ match; the overlap links them. The step silently assumes the two groups overlap, which fails for $n = 1 \to 2$: two horses, two groups of one, no overlap. The step must work for <i>every</i> $n$, including the first.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Induction = base case + inductive step $P(n) \Rightarrow P(n+1)$.

• In the step, find the $n$ case inside the $n+1$ case and use the hypothesis.

• $\sum k = \frac{n(n+1)}{2}$, $\sum k^2 = \frac{n(n+1)(2n+1)}{6}$, $\sum q^k = \frac{q^{n+1}-1}{q-1}$.

• The step must hold for every $n$ from the base case on.`,
        },
      ],
    },
  ],
  extra,
  questions: [
    {
      id: 'ml-05-1',
      difficulty: 1,
      promptText: r`Compute $\displaystyle\sum_{k=1}^{100} k$.`,
      options: [
        { id: 'a', label: '$5050$', value: 5050 },
        { id: 'b', label: '$10100$', value: 10100, trapExplanation: r`$100\cdot101$ forgets the division by 2. Pairing $1 + 100$, $2 + 99$, … gives 50 pairs of 101.` },
        { id: 'c', label: '$4950$', value: 4950, trapExplanation: r`$4950 = \frac{99\cdot100}{2}$ is the sum up to 99. The last term 100 is missing.` },
        { id: 'd', label: '$5000$', value: 5000, trapExplanation: r`$\frac{100^2}{2}$ approximates the sum but misses $\frac{n}{2} = 50$. The exact formula is $\frac{n(n+1)}{2}$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$\sum_{k=1}^{n} k = \frac{n(n+1)}{2}$.`,
        r`$n = 100$: $\frac{100\cdot101}{2}$.`,
        r`$= 5050$.`,
      ],
      keyConceptTag: 'Sum of the first n integers',
    },
    {
      id: 'ml-05-2',
      difficulty: 1,
      promptText: r`To prove $1 + 3 + 5 + \dots + (2n - 1) = n^2$ by induction, which term is added in the step from $n$ to $n + 1$?`,
      options: [
        { id: 'a', label: r`$2n + 1$` },
        { id: 'b', label: r`$2n - 1$`, trapExplanation: r`$2n - 1$ is the last term of the $n$ case. The next odd number, the $(n+1)$-th, is $2(n+1) - 1 = 2n + 1$.` },
        { id: 'c', label: r`$n + 1$`, trapExplanation: r`The terms are odd numbers $2k - 1$, not $k$. Substitute $k = n + 1$ into $2k - 1$.` },
        { id: 'd', label: r`$(n + 1)^2$`, trapExplanation: r`$(n + 1)^2$ is the new <i>total</i> you are aiming for, not the new term.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`The $k$-th term is $2k - 1$; for $k = n + 1$ it is $2n + 1$.`,
        r`Step: $n^2 + (2n + 1) = (n + 1)^2$.`,
        r`So adding $2n + 1$ turns the $n$ case into the $n + 1$ case.`,
      ],
      keyConceptTag: 'The inductive step',
    },
    {
      id: 'ml-05-3',
      difficulty: 2,
      promptText: r`Compute $\displaystyle\sum_{k=1}^{10} k^2$.`,
      options: [
        { id: 'a', label: '$385$', value: 385 },
        { id: 'b', label: '$3025$', value: 3025, trapExplanation: r`$3025 = 55^2 = (\sum k)^2$. The sum of squares is not the square of the sum.` },
        { id: 'c', label: '$55$', value: 55, trapExplanation: r`$55 = \sum k$, the sum without squaring.` },
        { id: 'd', label: '$1155$', value: 1155, trapExplanation: r`$\frac{10\cdot11\cdot21}{2}$ divides by 2 instead of 6 in $\frac{n(n+1)(2n+1)}{6}$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$\sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6}$.`,
        r`$n = 10$: $\frac{10\cdot11\cdot21}{6} = \frac{2310}{6}$.`,
        r`$= 385$.`,
      ],
      keyConceptTag: 'Sum of squares',
    },
    {
      id: 'ml-05-4',
      difficulty: 2,
      promptText: r`Compute $1 + 2 + 4 + 8 + \dots + 2^{9}$.`,
      options: [
        { id: 'a', label: '$1023$', value: 1023 },
        { id: 'b', label: '$1024$', value: 1024, trapExplanation: r`$2^{10}$ is one more than the sum: the geometric formula gives $2^{10} - 1$.` },
        { id: 'c', label: '$512$', value: 512, trapExplanation: r`$512 = 2^9$ is only the last term.` },
        { id: 'd', label: '$2047$', value: 2047, trapExplanation: r`$2^{11} - 1$ would be the sum up to $2^{10}$. The last term here is $2^9$, so there are 10 terms.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Geometric sum with $q = 2$ and terms $2^0, \dots, 2^9$: $\frac{2^{10} - 1}{2 - 1}$.`,
        r`$= 1024 - 1 = 1023$.`,
        r`Binary intuition: $1111111111_2 = 2^{10} - 1$.`,
      ],
      keyConceptTag: 'Geometric sum',
    },
    {
      id: 'ml-05-5',
      difficulty: 3,
      promptText: r`What is the smallest $n_0$ such that $2^n > n^2$ holds for <i>every</i> integer $n \ge n_0$?`,
      options: [
        { id: 'a', label: '$5$', value: 5 },
        { id: 'b', label: '$1$', value: 1, trapExplanation: r`It holds at $n = 1$ ($2 > 1$), but fails at $n = 2, 3, 4$ ($4 = 4$, $8 < 9$, $16 = 16$). It must hold for <i>all</i> $n \ge n_0$.` },
        { id: 'c', label: '$4$', value: 4, trapExplanation: r`At $n = 4$: $2^4 = 16 = 4^2$. The inequality is strict, so $n = 4$ fails.` },
        { id: 'd', label: '$3$', value: 3, trapExplanation: r`At $n = 3$: $8 < 9$. The inequality fails.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Check small cases: $n = 2$: $4 = 4$; $n = 3$: $8 < 9$; $n = 4$: $16 = 16$; $n = 5$: $32 > 25$.`,
        r`Inductive step for $n \ge 5$: $2^{n+1} = 2\cdot2^n > 2n^2 \ge (n+1)^2$, since $n^2 \ge 2n + 1$ for $n \ge 3$.`,
        r`So base case $n_0 = 5$ works and nothing smaller does.`,
      ],
      keyConceptTag: 'Choosing the base case',
    },
    {
      id: 'ml-05-6',
      difficulty: 3,
      promptText: r`"Any $n$ horses have the same colour" is "proved" by induction: base $n = 1$ is clear; for $n + 1$ horses, the first $n$ match and the last $n$ match, and they overlap. Where does the argument break?`,
      options: [
        { id: 'a', label: r`The step from $n = 1$ to $n = 2$` },
        { id: 'b', label: 'The base case', trapExplanation: r`One horse certainly has one colour. The base case is fine.` },
        { id: 'c', label: r`The step for large $n$`, trapExplanation: r`For $n \ge 2$ the two groups do overlap, and the step is valid. The gap is at the very first step.` },
        { id: 'd', label: 'Induction cannot be used for statements about objects', trapExplanation: r`Induction works for any statements indexed by $n$. The problem is a specific broken step.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`For $n + 1 = 2$ horses, "the first $n$" is horse 1 and "the last $n$" is horse 2.`,
        r`These groups do not overlap, so nothing links the two colours.`,
        r`The step $P(1) \Rightarrow P(2)$ fails, so the chain of dominoes breaks after the first one.`,
      ],
      keyConceptTag: 'The step must hold for every n',
    },
  ],
});
