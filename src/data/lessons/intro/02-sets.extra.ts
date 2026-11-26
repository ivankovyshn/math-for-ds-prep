import type { QuestionDraft, QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, shuffle } from '../gen.ts';
import { deMorgan, inter, minus, set, twoSets, union } from './02-sets.practice.ts';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'p', 'q', 'x', 'y'];

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: (QuestionTemplate | QuestionDraft)[] = [
  {
    id: 'ml-02-x1',
    difficulty: 1,
    keyConceptTag: 'Union',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, B } = twoSets(g);
      const sym = union(minus(A, B), minus(B, A));
      return {
        params: { A, B },
        promptText: r`Let $A = ${set(A)}$ and $B = ${set(B)}$. What is $A \cup B$?`,
        options: [
          { id: 'a', label: `$${set(union(A, B))}$`, value: union(A, B) },
          { id: 'b', label: `$${set(inter(A, B))}$`, value: inter(A, B), trapExplanation: r`That is the intersection $A \cap B$: the elements in <i>both</i> sets. The union collects elements in <i>either</i> set.` },
          { id: 'c', label: `$${set(minus(A, B))}$`, value: minus(A, B), trapExplanation: r`That is the difference $A \setminus B$: elements of $A$ that are not in $B$.` },
          { id: 'd', label: `$${set(sym)}$`, value: sym, trapExplanation: r`The common elements ${inter(A, B).join(', ')} are in $A$, so they belong to the union. You removed them, which gives the symmetric difference.` },
        ],
        stepByStepSolution: [
          r`$x \in A \cup B$ means $x \in A$ or $x \in B$ (or both).`,
          r`From $A$: ${A.join(', ')}. From $B$: ${B.join(', ')}.`,
          r`Each element is listed once: $A \cup B = ${set(union(A, B))}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-02-x2',
    difficulty: 1,
    keyConceptTag: 'Size of the power set',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(3, 6);
      const els = shuffle(g, LETTERS).slice(0, n).sort().join(', ');
      return {
        params: { n },
        promptText: r`How many subsets does $\{${els}\}$ have (including $\varnothing$ and the set itself)?`,
        options: [
          { id: 'a', label: `${2 ** n}`, value: 2 ** n },
          { id: 'b', label: `${2 ** (n - 1)}`, value: 2 ** (n - 1), trapExplanation: r`$2^${n - 1}$ is the count for a ${n - 1}-element set. Each new element doubles the number of subsets.` },
          { id: 'c', label: `${2 ** n - 1}`, value: 2 ** n - 1, trapExplanation: r`You left out one subset — usually $\varnothing$. The empty set is a subset of every set.` },
          { id: 'd', label: `${n}`, value: n, trapExplanation: r`${n} counts the one-element subsets only. Subsets can have anything from 0 to ${n} elements.` },
        ],
        stepByStepSolution: [
          r`To build a subset, decide for each of the ${n} elements: in or out.`,
          r`That is 2 choices, ${n} times.`,
          r`$|\mathcal{P}(A)| = 2^{|A|} = 2^${n} = ${2 ** n}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-02-x3',
    difficulty: 1,
    keyConceptTag: 'Cartesian product',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n } = g.until(() => ({ m: g.int(2, 4), n: g.int(2, 4) }), ({ m, n }) => allDistinct([m * n, m + n, n ** m, m ** n]));
      const A = Array.from({ length: m }, (_, i) => i);
      const B = shuffle(g, LETTERS).slice(0, n).sort();
      return {
        params: { m, n },
        promptText: r`Let $A = ${set(A)}$ and $B = \{${B.join(', ')}\}$. How many elements does $A \times B$ have?`,
        options: [
          { id: 'a', label: `${m * n}`, value: m * n },
          { id: 'b', label: `${m + n}`, value: m + n, trapExplanation: r`Adding the sizes counts the elements of $A \cup B$ (when they are disjoint), not the ordered pairs.` },
          { id: 'c', label: `${n ** m}`, value: n ** m, trapExplanation: r`$${n}^${m}$ counts functions from $A$ to $B$. A pair takes one element from each set: $${m} \cdot ${n}$.` },
          { id: 'd', label: `${m ** n}`, value: m ** n, trapExplanation: r`$${m}^${n}$ counts functions from $B$ to $A$, not pairs.` },
        ],
        stepByStepSolution: [
          r`$A \times B$ is the set of ordered pairs $(x, y)$ with $x \in A$, $y \in B$.`,
          r`There are ${m} choices for $x$ and, for each, ${n} choices for $y$.`,
          r`$|A \times B| = |A| \cdot |B| = ${m} \cdot ${n} = ${m * n}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-02-x4',
    difficulty: 2,
    keyConceptTag: 'Inclusion–exclusion',
    correctOptionId: 'a',
    generate: (g) => {
      const { N, a, b } = g.until(
        () => {
          const N = g.pick([20, 25, 30, 40, 50]);
          return { N, a: g.int(Math.ceil(N / 2), N - 2), b: g.int(Math.ceil(N / 4), N - 2) };
        },
        ({ N, a, b }) => a + b - N >= 2 && allDistinct([a + b - N, 0, N - a, a + b]),
      );
      const both = a + b - N;
      return {
        params: { N, a, b },
        promptText: r`In a class of ${N} students, ${a} drink tea, ${b} drink coffee and every student drinks at least one of the two. How many drink both?`,
        options: [
          { id: 'a', label: `${both}`, value: both },
          { id: 'b', label: '0', value: 0, trapExplanation: r`If nobody drank both, there would be $${a} + ${b} = ${a + b}$ students — more than ${N}.` },
          { id: 'c', label: `${N - a}`, value: N - a, trapExplanation: r`$${N} - ${a} = ${N - a}$ is the number who do <i>not</i> drink tea — the coffee-only group.` },
          { id: 'd', label: `${a + b}`, value: a + b, trapExplanation: r`$${a} + ${b}$ counts the students who drink both twice; it is not the size of any group.` },
        ],
        stepByStepSolution: [
          r`Inclusion–exclusion: $|T \cup C| = |T| + |C| - |T \cap C|$.`,
          r`Everyone drinks at least one, so $|T \cup C| = ${N}$.`,
          r`$${N} = ${a} + ${b} - |T \cap C|$, hence $|T \cap C| = ${both}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-02-x5',
    difficulty: 2,
    keyConceptTag: "De Morgan's laws for sets",
    correctOptionId: 'a',
    generate: deMorgan,
  },
  {
    id: 'ml-02-x6',
    difficulty: 2,
    promptText: r`Which set is always equal to $A \setminus B$?`,
    options: [
      { id: 'a', label: r`$A \cap B^{c}$` },
      { id: 'b', label: r`$B \setminus A$`, trapExplanation: r`Set difference is not symmetric: $\{1, 2\} \setminus \{2\} = \{1\}$ but $\{2\} \setminus \{1, 2\} = \varnothing$.` },
      { id: 'c', label: r`$A^{c} \cap B$`, trapExplanation: r`This is the set of elements of $B$ outside $A$, i.e. $B \setminus A$.` },
      { id: 'd', label: r`$(A \cup B) \setminus A$`, trapExplanation: r`Removing $A$ from $A \cup B$ leaves what is in $B$ only — again $B \setminus A$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$x \in A \setminus B$ means $x \in A$ and $x \notin B$.`,
      r`$x \notin B$ is the same as $x \in B^c$.`,
      r`So $A \setminus B = A \cap B^c$ — a handy way to turn differences into intersections.`,
    ],
    keyConceptTag: 'Set difference',
  },
];
