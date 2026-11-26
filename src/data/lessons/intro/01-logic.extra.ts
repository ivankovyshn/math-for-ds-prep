import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'ml-01-x1',
    difficulty: 1,
    promptText: r`What is the contrapositive of "if $n$ is divisible by 6, then $n$ is even"?`,
    options: [
      { id: 'a', label: r`If $n$ is not even, then $n$ is not divisible by 6` },
      { id: 'b', label: r`If $n$ is even, then $n$ is divisible by 6`, trapExplanation: r`This swaps $P$ and $Q$ but does not negate them: it is the <i>converse</i>, and it is false ($n = 4$).` },
      { id: 'c', label: r`If $n$ is not divisible by 6, then $n$ is not even`, trapExplanation: r`This negates both parts but keeps the order: it is the <i>inverse</i>, and it is false ($n = 4$ again).` },
      { id: 'd', label: r`$n$ is divisible by 6 and $n$ is not even`, trapExplanation: r`This is the <i>negation</i> of the implication, $P \wedge \neg Q$ — the opposite claim, not an equivalent one.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Write $P$ = "$n$ is divisible by 6" and $Q$ = "$n$ is even". The statement is $P \Rightarrow Q$.`,
      r`The contrapositive swaps the parts <i>and</i> negates both: $\neg Q \Rightarrow \neg P$.`,
      r`Read aloud: if $n$ is not even, then $n$ is not divisible by 6. It has the same truth table as the original.`,
    ],
    keyConceptTag: 'Contrapositive',
  },
  {
    id: 'ml-01-x2',
    difficulty: 1,
    promptText: r`Is the statement "if $2 + 2 = 5$, then the Moon is made of cheese" true or false?`,
    options: [
      { id: 'a', label: 'True' },
      { id: 'b', label: 'False', trapExplanation: r`An implication is false only when the "if" part is true and the "then" part is false. Here the "if" part is false.` },
      { id: 'c', label: 'It is not a statement at all', trapExplanation: r`Both parts have a definite truth value, so the implication is a statement with a definite truth value too.` },
      { id: 'd', label: 'It depends on what the Moon is made of', trapExplanation: r`Once the "if" part is false, the "then" part does not matter: both rows with false $P$ make $P \Rightarrow Q$ true.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Let $P$ = "$2 + 2 = 5$" (false) and $Q$ = "the Moon is made of cheese" (false).`,
      r`$P \Rightarrow Q$ is false only in the row $P$ true, $Q$ false.`,
      r`With $P$ false the implication is <i>vacuously</i> true, whatever $Q$ is.`,
    ],
    keyConceptTag: 'Truth table of implication',
  },
  {
    id: 'ml-01-x3',
    difficulty: 1,
    promptText: r`Which sentence is the negation of "some prime number is even"?`,
    options: [
      { id: 'a', label: 'Every prime number is odd' },
      { id: 'b', label: 'Some prime number is odd', trapExplanation: r`"Some prime is even" and "some prime is odd" can both be true (2 and 3), so one is not the negation of the other.` },
      { id: 'c', label: 'Some even number is not prime', trapExplanation: r`This changes the subject from primes to even numbers. The negation must talk about the same objects.` },
      { id: 'd', label: 'No number is even', trapExplanation: r`This says far too much: it also rules out even numbers that are not prime, such as 4.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`The statement is $\exists x:\ \text{prime}(x) \wedge \text{even}(x)$.`,
      r`Negating turns $\exists$ into $\forall$ and negates the inside: $\forall x:\ \neg(\text{prime}(x) \wedge \text{even}(x))$.`,
      r`That is: for every $x$, if $x$ is prime then $x$ is not even — every prime is odd.`,
    ],
    keyConceptTag: 'Negating quantifiers',
  },
  {
    id: 'ml-01-x4',
    difficulty: 2,
    promptText: r`Let $S = \{1, 2, 3\}$. Which statement is <i>false</i>?`,
    options: [
      { id: 'a', label: r`$\exists y \in S\ \forall x \in S:\ x \le y$`, trapExplanation: r`This is true: $y = 3$ is at least as large as every element of $S$.` },
      { id: 'b', label: r`$\forall x \in S\ \exists y \in S:\ x \le y$`, trapExplanation: r`This is true: for each $x$ take $y = x$.` },
      { id: 'c', label: r`$\forall x \in S\ \exists y \in S:\ y < x$` },
      { id: 'd', label: r`$\exists x \in S\ \forall y \in S:\ x \le y$`, trapExplanation: r`This is true: $x = 1$ is at most every element of $S$.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Check each statement against the finite set $\{1, 2, 3\}$.`,
      r`For $\forall x\ \exists y:\ y < x$ try $x = 1$: no element of $S$ is smaller than 1.`,
      r`One failing $x$ is enough to make a "for all" statement false, so (c) is false; the others have explicit witnesses.`,
    ],
    keyConceptTag: 'Order of quantifiers',
  },
  {
    id: 'ml-01-x5',
    difficulty: 2,
    promptText: r`For a fixed real number $x$, what is the negation of "if $x > 2$ then $x^2 > 4$"?`,
    options: [
      { id: 'a', label: r`$x > 2$ and $x^2 \le 4$` },
      { id: 'b', label: r`If $x > 2$ then $x^2 \le 4$`, trapExplanation: r`The negation of an implication is not another implication. Both "if…then" versions are true when $x \le 2$.` },
      { id: 'c', label: r`If $x \le 2$ then $x^2 \le 4$`, trapExplanation: r`This is the inverse. It is a different implication, not the negation.` },
      { id: 'd', label: r`$x \le 2$ and $x^2 > 4$`, trapExplanation: r`The implication can only fail when its "if" part holds, so the negation must keep $x > 2$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$P \Rightarrow Q$ is false exactly when $P$ is true and $Q$ is false.`,
      r`So $\neg(P \Rightarrow Q) \equiv P \wedge \neg Q$.`,
      r`Here: $x > 2$ and not $x^2 > 4$, i.e. $x > 2$ and $x^2 \le 4$.`,
    ],
    keyConceptTag: 'Negating an implication',
  },
  {
    id: 'ml-01-x6',
    difficulty: 2,
    promptText: r`What is the negation of $\forall x\ \exists y:\ x + y = 0$?`,
    options: [
      { id: 'a', label: r`$\exists x\ \forall y:\ x + y \ne 0$` },
      { id: 'b', label: r`$\forall x\ \exists y:\ x + y \ne 0$`, trapExplanation: r`Only the inner statement was negated. Each quantifier must flip as the negation passes it.` },
      { id: 'c', label: r`$\exists x\ \exists y:\ x + y \ne 0$`, trapExplanation: r`The first quantifier flipped but the second did not. $\exists y$ must become $\forall y$.` },
      { id: 'd', label: r`$\forall x\ \forall y:\ x + y \ne 0$`, trapExplanation: r`$\forall x$ must become $\exists x$; this version claims much more than the negation does.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Move the negation from left to right, flipping each quantifier it passes.`,
      r`$\neg \forall x\ \exists y\ P \equiv \exists x\ \neg \exists y\ P \equiv \exists x\ \forall y\ \neg P$.`,
      r`With $P$ = "$x + y = 0$": there is an $x$ such that $x + y \ne 0$ for every $y$.`,
    ],
    keyConceptTag: 'Negating quantifiers',
  },
];
