import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'ml-04-x1',
    difficulty: 1,
    promptText: r`Which number is a counterexample to "every odd number greater than 1 is prime"?`,
    options: [
      { id: 'a', label: '9', value: 9 },
      { id: 'b', label: '7', value: 7, trapExplanation: r`7 is odd <i>and</i> prime, so it agrees with the claim. A counterexample must satisfy the hypothesis and break the conclusion.` },
      { id: 'c', label: '2', value: 2, trapExplanation: r`2 is not odd, so the claim says nothing about it.` },
      { id: 'd', label: '11', value: 11, trapExplanation: r`11 is odd and prime — it supports the claim instead of refuting it.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`A counterexample to "every $x$ with property $A$ has property $B$" is one $x$ with $A$ but not $B$.`,
      r`9 is odd and greater than 1, but $9 = 3 \cdot 3$ is not prime.`,
      r`One counterexample is enough: the claim is false.`,
    ],
    keyConceptTag: 'Disproof by counterexample',
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
    promptText: r`An integer has the form $n = 3k + 1$. What remainder does $n^2$ leave on division by 3?`,
    options: [
      { id: 'a', label: '1', value: 1 },
      { id: 'b', label: '0', value: 0, trapExplanation: r`$9k^2 + 6k$ is divisible by 3, but the extra $+1$ remains.` },
      { id: 'c', label: '2', value: 2, trapExplanation: r`Squaring the remainder 1 gives 1, not 2. You may have doubled instead of squared.` },
      { id: 'd', label: r`It depends on $k$`, value: -1, trapExplanation: r`All terms containing $k$ are multiples of 3, so $k$ does not affect the remainder.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$n^2 = (3k + 1)^2 = 9k^2 + 6k + 1$.`,
      r`$9k^2 + 6k = 3(3k^2 + 2k)$ is a multiple of 3.`,
      r`So $n^2 = 3(3k^2 + 2k) + 1$ leaves remainder 1, for every $k$.`,
    ],
    keyConceptTag: 'Working with remainders',
  },
  {
    id: 'ml-04-x5',
    difficulty: 2,
    promptText: r`Which statement is true for <i>all</i> integers $a$ and $b$?`,
    options: [
      { id: 'a', label: r`If $a$ and $b$ are even, then $ab$ is divisible by 4` },
      { id: 'b', label: r`If $ab$ is even, then $a$ and $b$ are both even`, trapExplanation: r`One even factor is enough: $2 \cdot 3 = 6$ is even, but 3 is odd.` },
      { id: 'c', label: r`If $a + b$ is even, then $a$ and $b$ are both even`, trapExplanation: r`Two odd numbers also have an even sum: $1 + 1 = 2$.` },
      { id: 'd', label: r`If $ab$ is divisible by 4, then $a$ or $b$ is divisible by 4`, trapExplanation: r`$2 \cdot 2 = 4$ is divisible by 4, yet neither factor is.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Write $a = 2m$ and $b = 2n$.`,
      r`Then $ab = 4mn$, a multiple of 4.`,
      r`Each other statement has a small counterexample: $(2, 3)$, $(1, 1)$, $(2, 2)$.`,
    ],
    keyConceptTag: 'Direct proof',
  },
  {
    id: 'ml-04-x6',
    difficulty: 2,
    promptText: r`Which $n$ is a counterexample to "if $n^2$ is divisible by 4, then $n$ is divisible by 4"?`,
    options: [
      { id: 'a', label: r`$n = 2$`, value: 2 },
      { id: 'b', label: r`$n = 4$`, value: 4, trapExplanation: r`4 is divisible by 4, so the conclusion holds; it does not refute anything.` },
      { id: 'c', label: r`$n = 3$`, value: 3, trapExplanation: r`$3^2 = 9$ is not divisible by 4, so the hypothesis fails and the implication is (vacuously) true.` },
      { id: 'd', label: r`$n = 8$`, value: 8, trapExplanation: r`8 is divisible by 4, so the conclusion holds.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`We need $n$ with $4 \mid n^2$ (hypothesis true) but $4 \nmid n$ (conclusion false).`,
      r`$n = 2$: $n^2 = 4$ is divisible by 4, but 2 is not.`,
      r`So the statement is false. (The true version: $4 \mid n^2 \Rightarrow 2 \mid n$.)`,
    ],
    keyConceptTag: 'Disproof by counterexample',
  },
];
