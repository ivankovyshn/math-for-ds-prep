import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'ml-02-x1',
    difficulty: 1,
    promptText: r`Let $A = \{1, 2, 3\}$ and $B = \{3, 4\}$. What is $A \cup B$?`,
    options: [
      { id: 'a', label: r`$\{1, 2, 3, 4\}$`, value: [1, 2, 3, 4] },
      { id: 'b', label: r`$\{3\}$`, value: [3], trapExplanation: r`That is the intersection $A \cap B$: the elements in <i>both</i> sets. The union collects elements in <i>either</i> set.` },
      { id: 'c', label: r`$\{1, 2\}$`, value: [1, 2], trapExplanation: r`That is the difference $A \setminus B$: elements of $A$ that are not in $B$.` },
      { id: 'd', label: r`$\{1, 2, 4\}$`, value: [1, 2, 4], trapExplanation: r`The common element 3 is in $A$, so it belongs to the union. You removed it, which gives the symmetric difference.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$x \in A \cup B$ means $x \in A$ or $x \in B$ (or both).`,
      r`From $A$: 1, 2, 3. From $B$: 3, 4.`,
      r`Each element is listed once: $A \cup B = \{1, 2, 3, 4\}$.`,
    ],
    keyConceptTag: 'Union',
  },
  {
    id: 'ml-02-x2',
    difficulty: 1,
    promptText: r`How many subsets does $\{1, 2, 3, 4\}$ have (including $\varnothing$ and the set itself)?`,
    options: [
      { id: 'a', label: '16', value: 16 },
      { id: 'b', label: '8', value: 8, trapExplanation: r`$2^3 = 8$ is the count for a 3-element set. Each new element doubles the number of subsets.` },
      { id: 'c', label: '15', value: 15, trapExplanation: r`You left out one subset — usually $\varnothing$. The empty set is a subset of every set.` },
      { id: 'd', label: '4', value: 4, trapExplanation: r`4 counts the one-element subsets only. Subsets can have 0, 1, 2, 3 or 4 elements.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`To build a subset, decide for each of the 4 elements: in or out.`,
      r`That is 2 choices, 4 times: $2 \cdot 2 \cdot 2 \cdot 2$.`,
      r`$|\mathcal{P}(A)| = 2^{|A|} = 2^4 = 16$.`,
    ],
    keyConceptTag: 'Size of the power set',
  },
  {
    id: 'ml-02-x3',
    difficulty: 1,
    promptText: r`Let $A = \{0, 1\}$ and $B = \{a, b, c\}$. How many elements does $A \times B$ have?`,
    options: [
      { id: 'a', label: '6', value: 6 },
      { id: 'b', label: '5', value: 5, trapExplanation: r`Adding the sizes counts the elements of $A \cup B$ (when they are disjoint), not the ordered pairs.` },
      { id: 'c', label: '8', value: 8, trapExplanation: r`$2^3$ counts functions from $B$ to $A$. A pair takes one element from each set: $2 \cdot 3$.` },
      { id: 'd', label: '9', value: 9, trapExplanation: r`$3^2$ counts functions from $A$ to $B$, not pairs.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$A \times B$ is the set of ordered pairs $(x, y)$ with $x \in A$, $y \in B$.`,
      r`There are 2 choices for $x$ and, for each, 3 choices for $y$.`,
      r`$|A \times B| = |A| \cdot |B| = 2 \cdot 3 = 6$.`,
    ],
    keyConceptTag: 'Cartesian product',
  },
  {
    id: 'ml-02-x4',
    difficulty: 2,
    promptText: r`In a class of 40 students, 25 drink tea, 20 drink coffee and every student drinks at least one of the two. How many drink both?`,
    options: [
      { id: 'a', label: '5', value: 5 },
      { id: 'b', label: '0', value: 0, trapExplanation: r`If nobody drank both, there would be $25 + 20 = 45$ students — more than 40.` },
      { id: 'c', label: '15', value: 15, trapExplanation: r`$40 - 25 = 15$ is the number who do <i>not</i> drink tea — the coffee-only group.` },
      { id: 'd', label: '45', value: 45, trapExplanation: r`$25 + 20$ counts the students who drink both twice; it is not the size of any group.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Inclusion–exclusion: $|T \cup C| = |T| + |C| - |T \cap C|$.`,
      r`Everyone drinks at least one, so $|T \cup C| = 40$.`,
      r`$40 = 25 + 20 - |T \cap C|$, hence $|T \cap C| = 5$.`,
    ],
    keyConceptTag: 'Inclusion–exclusion',
  },
  {
    id: 'ml-02-x5',
    difficulty: 2,
    promptText: r`Which set is always equal to $(A \cap B)^{c}$?`,
    options: [
      { id: 'a', label: r`$A^{c} \cup B^{c}$` },
      { id: 'b', label: r`$A^{c} \cap B^{c}$`, trapExplanation: r`The complement flips $\cap$ into $\cup$. $A^c \cap B^c$ is $(A \cup B)^c$, a smaller set.` },
      { id: 'c', label: r`$A \cup B$`, trapExplanation: r`No complement was taken. An element in both $A$ and $B$ lies in $A \cup B$ but not in $(A \cap B)^c$.` },
      { id: 'd', label: r`$A^{c} \cap B$`, trapExplanation: r`This misses the elements outside $B$ — for example one that is in $A$ but not in $B$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$x \in (A \cap B)^c$ means: not ($x \in A$ and $x \in B$).`,
      r`By De Morgan for statements this is: $x \notin A$ or $x \notin B$.`,
      r`That is $x \in A^c \cup B^c$.`,
    ],
    keyConceptTag: "De Morgan's laws for sets",
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
