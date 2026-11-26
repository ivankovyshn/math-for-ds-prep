import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { shuffle } from '../gen.ts';
import { contrapositive, negateTwo } from './01-logic.practice.ts';

/** False statements, used as the "if" part of vacuously true implications. */
const FALSE_STATEMENTS = ['$2 + 2 = 5$', '$7$ is even', '$\\sqrt{4} = 3$', '$0 > 1$', '$10$ is a prime number', '$3 \\cdot 3 = 6$'];
/** Arbitrary "then" parts (true or false: it does not matter). */
const CONSEQUENTS = ['the Moon is made of cheese', 'every cat can fly', '$1 = 2$', 'it snows in July in Kyiv', 'pigs can sing', '$\\pi = 3$'];
/** "Some X is Y" statements. */
const SOME = [
  { x: 'prime number', y: 'even' },
  { x: 'triangle', y: 'a right triangle' },
  { x: 'integer', y: 'divisible by 7' },
  { x: 'square matrix', y: 'invertible' },
  { x: 'continuous function', y: 'differentiable' },
  { x: 'student in the group', y: 'left-handed' },
];

/** Extra practice (Practice 2): gentler questions on the same ideas, with new content every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ml-01-x1',
    difficulty: 1,
    keyConceptTag: 'Contrapositive',
    correctOptionId: 'a',
    generate: (g) => contrapositive(g, 'negation'),
  },
  {
    id: 'ml-01-x2',
    difficulty: 1,
    keyConceptTag: 'Truth table of implication',
    correctOptionId: 'a',
    generate: (g) => {
      const [p, q] = [g.pick(FALSE_STATEMENTS), g.pick(CONSEQUENTS)];
      return {
        params: { pTrue: 0 },
        promptText: r`Is the statement "if ${p}, then ${q}" true or false?`,
        options: [
          { id: 'a', label: 'True' },
          { id: 'b', label: 'False', trapExplanation: r`An implication is false only when the "if" part is true and the "then" part is false. Here the "if" part is false.` },
          { id: 'c', label: 'It is not a statement at all', trapExplanation: r`Both parts have a definite truth value, so the implication is a statement with a definite truth value too.` },
          { id: 'd', label: 'It depends on whether the "then" part is true', trapExplanation: r`Once the "if" part is false, the "then" part does not matter: both rows with false $P$ make $P \Rightarrow Q$ true.` },
        ],
        stepByStepSolution: [
          r`Let $P$ = "${p}" (false) and $Q$ = "${q}".`,
          r`$P \Rightarrow Q$ is false only in the row $P$ true, $Q$ false.`,
          r`With $P$ false the implication is <i>vacuously</i> true, whatever $Q$ is.`,
        ],
      };
    },
  },
  {
    id: 'ml-01-x3',
    difficulty: 1,
    keyConceptTag: 'Negating quantifiers',
    correctOptionId: 'a',
    generate: (g) => {
      const { x, y } = g.pick(SOME);
      return {
        params: { k: 0 },
        promptText: r`Which sentence is the negation of "some ${x} is ${y}"?`,
        options: [
          { id: 'a', label: `No ${x} is ${y}` },
          { id: 'b', label: `Some ${x} is not ${y}`, trapExplanation: r`"Some ${x} is ${y}" and "some ${x} is not ${y}" can both be true at once, so one is not the negation of the other.` },
          { id: 'c', label: `Every ${x} is ${y}`, trapExplanation: r`This is stronger than the original, not its opposite: if every ${x} is ${y}, then certainly some ${x} is.` },
          { id: 'd', label: `At least one ${x} is ${y}`, trapExplanation: r`This is just the original statement in other words.` },
        ],
        stepByStepSolution: [
          r`The statement is $\exists x:\ Y(x)$ — at least one ${x} has the property.`,
          r`Negating turns $\exists$ into $\forall$ and negates the inside: $\forall x:\ \neg Y(x)$.`,
          r`Every ${x} fails to be ${y}, i.e. no ${x} is ${y}.`,
        ],
      };
    },
  },
  {
    id: 'ml-01-x4',
    difficulty: 2,
    keyConceptTag: 'Order of quantifiers',
    correctOptionId: 'c',
    generate: (g) => {
      const S = shuffle(g, [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7]).slice(0, g.int(3, 4)).sort((a, b) => a - b);
      const set = `\\{${S.join(', ')}\\}`;
      return {
        params: { S },
        promptText: r`Let $S = ${set}$. Which statement is <i>false</i>?`,
        options: [
          { id: 'a', label: r`$\exists y \in S\ \forall x \in S:\ x \le y$`, trapExplanation: r`This is true: $y = ${S[S.length - 1]}$ is at least as large as every element of $S$.` },
          { id: 'b', label: r`$\forall x \in S\ \exists y \in S:\ x \le y$`, trapExplanation: r`This is true: for each $x$ take $y = x$.` },
          { id: 'c', label: r`$\forall x \in S\ \exists y \in S:\ y < x$` },
          { id: 'd', label: r`$\exists x \in S\ \forall y \in S:\ x \le y$`, trapExplanation: r`This is true: $x = ${S[0]}$ is at most every element of $S$.` },
        ],
        stepByStepSolution: [
          r`Check each statement against the finite set $S$.`,
          r`For $\forall x\ \exists y:\ y < x$ try the smallest element $x = ${S[0]}$: no element of $S$ is smaller.`,
          r`One failing $x$ is enough to make a "for all" statement false, so (c) is false; the others have explicit witnesses.`,
        ],
      };
    },
  },
  {
    id: 'ml-01-x5',
    difficulty: 2,
    keyConceptTag: 'Negating an implication',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.int(1, 6);
      const [P, Q, nP, nQ] = g.pick([
        [`x > ${a}`, `x^2 > ${a * a}`, `x \\le ${a}`, `x^2 \\le ${a * a}`],
        [`x < -${a}`, `x^2 > ${a * a}`, `x \\ge -${a}`, `x^2 \\le ${a * a}`],
        [`x = ${a}`, `x^2 = ${a * a}`, `x \\ne ${a}`, `x^2 \\ne ${a * a}`],
      ]);
      return {
        params: { a },
        promptText: r`For a fixed real number $x$, what is the negation of "if $${P}$ then $${Q}$"?`,
        options: [
          { id: 'a', label: r`$${P}$ and $${nQ}$` },
          { id: 'b', label: r`If $${P}$ then $${nQ}$`, trapExplanation: r`The negation of an implication is not another implication. Both "if…then" versions are true whenever $${nP}$.` },
          { id: 'c', label: r`If $${nP}$ then $${nQ}$`, trapExplanation: r`This is the inverse. It is a different implication, not the negation.` },
          { id: 'd', label: r`$${nP}$ and $${Q}$`, trapExplanation: r`The implication can only fail when its "if" part holds, so the negation must keep $${P}$.` },
        ],
        stepByStepSolution: [
          r`$P \Rightarrow Q$ is false exactly when $P$ is true and $Q$ is false.`,
          r`So $\neg(P \Rightarrow Q) \equiv P \land \neg Q$.`,
          r`Here: $${P}$ and $${nQ}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-01-x6',
    difficulty: 2,
    keyConceptTag: 'Negating quantifiers',
    correctOptionId: 'a',
    generate: (g) => negateTwo(g, [[0, 1], [1, 0], [0, 0], [1, 1]]),
  },
];
