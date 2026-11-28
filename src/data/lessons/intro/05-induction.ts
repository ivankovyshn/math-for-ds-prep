import { defineLesson, r } from '../define.ts';
import { extra } from './05-induction.extra.ts';
import { practice } from './05-induction.practice.ts';

export default defineLesson({
  id: 'ml-05',
  moduleId: 'intro',
  title: 'Mathematical induction',
  blurb: 'Base case, inductive step, sums',
  minutes: 7,
  deeper: [
    { title: 'Book of Proof, chapter 10: mathematical induction', url: 'https://richardhammack.github.io/BookOfProof/', source: 'Richard Hammack, Book of Proof · free textbook' },
  ],
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
      covers: ['2', 'x4'],
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
      covers: ['1', '3', '4', 'x1', 'x2', 'x3', 'x5'],
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
      covers: ['5', '6', 'x6'],
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
        {
          kind: 'example',
          title: 'Finding the base case',
          prompt: r`For which $n$ does $n! > 2^n$ hold? Prove it from that point on.`,
          steps: [
            r`Try small $n$: $1! = 1 < 2$, $2! = 2 < 4$, $3! = 6 < 8$, $4! = 24 > 16$. So the base case is $n_0 = 4$.`,
            r`Step: assume $n! > 2^n$ for some $n \ge 4$. Then $(n + 1)! = (n + 1)\cdot n! > (n + 1)\cdot 2^n$.`,
            r`Since $n + 1 \ge 2$, this is at least $2\cdot 2^n = 2^{n+1}$. ✓`,
            r`The step must work for <i>every</i> $n$ from the base case on. The "all horses have the same colour" step needs two overlapping groups, which fails exactly at the move from 1 horse to 2.`,
          ],
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
    ...practice,
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
