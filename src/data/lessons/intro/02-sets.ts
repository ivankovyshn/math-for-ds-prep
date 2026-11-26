import { defineLesson, r } from '../define.ts';

export default defineLesson({
  id: 'ml-02',
  moduleId: 'intro',
  title: 'Sets and operations',
  blurb: 'Union, intersection, complement, counting',
  minutes: 7,
  lecture: [
    {
      title: 'Sets and subsets',
      blocks: [
        {
          kind: 'text',
          text: r`A <i>set</i> is a collection of distinct objects, its <i>elements</i>. Order and repetition do not matter: $\{1, 2, 3\} = \{3, 1, 2, 2\}$. We write $x \in A$ for "$x$ is an element of $A$".

Sets are given by listing elements or by a property (set-builder notation):`,
        },
        { kind: 'formula', tex: r`A = \{x \in \mathbb{R} : x^2 < 4\} = (-2, 2)` },
        {
          kind: 'text',
          text: r`The standard number sets are nested: $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R} \subset \mathbb{C}$. The empty set $\varnothing$ has no elements and is a subset of every set.

$A \subseteq B$ ("$A$ is a subset of $B$") means every element of $A$ is in $B$. To prove $A = B$, show both $A \subseteq B$ and $B \subseteq A$ — the standard <i>double inclusion</i> argument.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Element or subset?',
          text: r`$1 \in \{1, 2\}$ but $\{1\} \subseteq \{1, 2\}$. And $\varnothing \ne \{\varnothing\}$: the first is empty, the second has one element (which happens to be a set).`,
        },
      ],
    },
    {
      title: 'Operations',
      blocks: [
        {
          kind: 'text',
          text: r`Inside a universal set $U$:

• $A \cup B$ (union): elements in $A$ <i>or</i> $B$ (or both).

• $A \cap B$ (intersection): elements in $A$ <i>and</i> $B$.

• $A \setminus B$ (difference): elements in $A$ but not in $B$.

• $A^{c} = U \setminus A$ (complement): everything not in $A$.`,
        },
        { kind: 'diagram', type: 'vennOps' },
        {
          kind: 'example',
          title: 'Computing with small sets',
          prompt: r`$A = \{1, 2, 3, 4\}$, $B = \{3, 4, 5\}$. Find $A \cup B$, $A \cap B$, $A \setminus B$ and $B \setminus A$.`,
          steps: [
            r`$A \cup B = \{1, 2, 3, 4, 5\}$ — every element appears once.`,
            r`$A \cap B = \{3, 4\}$.`,
            r`$A \setminus B = \{1, 2\}$ and $B \setminus A = \{5\}$. Difference is not symmetric.`,
          ],
        },
      ],
    },
    {
      title: 'Laws and counting',
      blocks: [
        {
          kind: 'text',
          text: r`Set operations mirror logic: $\cup$ is "or", $\cap$ is "and", complement is "not". So the same laws hold, for example De Morgan's laws:`,
        },
        { kind: 'formula', tex: r`(A \cup B)^{c} = A^{c} \cap B^{c}, \qquad (A \cap B)^{c} = A^{c} \cup B^{c}` },
        {
          kind: 'text',
          text: r`For finite sets, $|A|$ denotes the number of elements. Adding $|A| + |B|$ counts the overlap twice, so subtract it once — the <i>inclusion–exclusion</i> principle:`,
        },
        { kind: 'formula', tex: r`|A \cup B| = |A| + |B| - |A \cap B|` },
        {
          kind: 'check',
          prompt: r`In a group of 30 people, 18 speak English, 12 speak German and 5 speak both. How many speak neither?`,
          answer: r`$|E \cup G| = 18 + 12 - 5 = 25$, so $30 - 25 = 5$ speak neither.`,
        },
      ],
    },
    {
      title: 'Products and power sets',
      blocks: [
        {
          kind: 'text',
          text: r`The <i>Cartesian product</i> $A \times B$ is the set of ordered pairs $(a, b)$ with $a \in A$, $b \in B$. The plane $\mathbb{R}^2 = \mathbb{R} \times \mathbb{R}$ is the most famous example. For finite sets $|A \times B| = |A|\cdot|B|$.

The <i>power set</i> $\mathcal{P}(A)$ is the set of all subsets of $A$. Each element is either in a subset or not — two choices per element:`,
        },
        { kind: 'formula', tex: r`|\mathcal{P}(A)| = 2^{|A|}`, caption: r`$\mathcal{P}(\{a, b\}) = \{\varnothing, \{a\}, \{b\}, \{a, b\}\}$: $2^2 = 4$ subsets, including $\varnothing$ and $A$ itself.` },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $x \in A$ (element) vs $A \subseteq B$ (subset); $A = B$ ⟺ $A \subseteq B$ and $B \subseteq A$.

• $\cup$ = or, $\cap$ = and, $\setminus$ = but not, complement = not.

• De Morgan: $(A \cup B)^c = A^c \cap B^c$.

• $|A \cup B| = |A| + |B| - |A \cap B|$; $|A \times B| = |A||B|$; $|\mathcal{P}(A)| = 2^{|A|}$.`,
        },
      ],
    },
  ],
  questions: [
    {
      id: 'ml-02-1',
      difficulty: 1,
      promptText: r`Let $A = \{1, 2, 3, 4\}$ and $B = \{3, 4, 5\}$. What is $A \setminus B$?`,
      options: [
        { id: 'a', label: r`$\{1, 2\}$`, value: [1, 2] },
        { id: 'b', label: r`$\{5\}$`, value: [5], trapExplanation: r`$\{5\}$ is $B \setminus A$. $A \setminus B$ keeps the elements of $A$ and removes those also in $B$.` },
        { id: 'c', label: r`$\{3, 4\}$`, value: [3, 4], trapExplanation: r`$\{3, 4\}$ is the intersection — exactly the elements that $A \setminus B$ removes.` },
        { id: 'd', label: r`$\{1, 2, 5\}$`, value: [1, 2, 5], trapExplanation: r`This is the symmetric difference: elements in exactly one of the sets. $A \setminus B$ contains only elements of $A$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Go through $A$: 1 and 2 are not in $B$, keep them.`,
        r`3 and 4 are in $B$, remove them.`,
        r`$A \setminus B = \{1, 2\}$.`,
      ],
      keyConceptTag: 'Set difference',
    },
    {
      id: 'ml-02-2',
      difficulty: 1,
      promptText: r`How many subsets does $\{a, b, c\}$ have?`,
      options: [
        { id: 'a', label: '$8$', value: 8 },
        { id: 'b', label: '$6$', value: 6, trapExplanation: r`$6 = 3!$ counts orderings. A subset is a yes/no choice for each element: $2\cdot2\cdot2$.` },
        { id: 'c', label: '$7$', value: 7, trapExplanation: r`The empty set is a subset too (choose "no" for every element). Including it gives 8.` },
        { id: 'd', label: '$9$', value: 9, trapExplanation: r`$3^2 = 9$ has base and exponent swapped. Two choices per element, three elements: $2^3$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Each of the 3 elements is either in the subset or not: 2 choices each.`,
        r`$2^3 = 8$.`,
        r`List: $\varnothing, \{a\}, \{b\}, \{c\}, \{a,b\}, \{a,c\}, \{b,c\}, \{a,b,c\}$.`,
      ],
      keyConceptTag: 'Size of the power set',
    },
    {
      id: 'ml-02-3',
      difficulty: 2,
      promptText: r`Of 100 students, 60 take Maths, 50 take Computer Science and 25 take both. How many take neither?`,
      options: [
        { id: 'a', label: '$15$', value: 15 },
        { id: 'b', label: '$-10$', value: -10, trapExplanation: r`$100 - 60 - 50$ subtracts the 25 students who take both twice. A count can never be negative — that is the warning sign.` },
        { id: 'c', label: '$40$', value: 40, trapExplanation: r`$100 - 60$ removes only the Maths students; Computer Science students who do not take Maths still have to be removed.` },
        { id: 'd', label: '$35$', value: 35, trapExplanation: r`$60 - 25 = 35$ is the number who take Maths but not Computer Science.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Inclusion–exclusion: $|M \cup C| = 60 + 50 - 25 = 85$.`,
        r`Neither: $100 - 85 = 15$.`,
        r`Sanity check by parts: $35$ Maths only, $25$ Computer Science only, $25$ both, $15$ neither: $35 + 25 + 25 + 15 = 100$. ✓`,
      ],
      keyConceptTag: 'Inclusion–exclusion',
    },
    {
      id: 'ml-02-4',
      difficulty: 2,
      promptText: r`Which set is always equal to $(A \cup B)^{c}$?`,
      options: [
        { id: 'a', label: r`$A^{c} \cap B^{c}$` },
        { id: 'b', label: r`$A^{c} \cup B^{c}$`, trapExplanation: r`This is $(A \cap B)^{c}$. Taking a complement swaps $\cup$ and $\cap$ (De Morgan).` },
        { id: 'c', label: r`$A \cap B$`, trapExplanation: r`An element of $A \cap B$ is in $A \cup B$, so it is definitely <i>not</i> in the complement.` },
        { id: 'd', label: r`$A \setminus B$`, trapExplanation: r`Elements of $A \setminus B$ are in $A$, hence in $A \cup B$ — the opposite of what we want.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$x \in (A \cup B)^{c}$ means: not ($x \in A$ or $x \in B$).`,
        r`By De Morgan's law in logic: $x \notin A$ and $x \notin B$.`,
        r`That is $x \in A^{c} \cap B^{c}$.`,
      ],
      keyConceptTag: "De Morgan's laws for sets",
    },
    {
      id: 'ml-02-5',
      difficulty: 3,
      promptText: r`Let $A = \{x \in \mathbb{Z} : x^2 \le 4\}$ and $B = \{\text{red}, \text{green}, \text{blue}\}$. How many elements does $A \times B$ have?`,
      options: [
        { id: 'a', label: '$15$', value: 15 },
        { id: 'b', label: '$8$', value: 8, trapExplanation: r`$5 + 3$ adds the sizes; that would be $|A \cup B|$ for disjoint sets. Pairs multiply: $|A|\cdot|B|$.` },
        { id: 'c', label: '$9$', value: 9, trapExplanation: r`$A$ is not $\{0, 1, 2\}$: negative integers also satisfy $x^2 \le 4$, so $A = \{-2, -1, 0, 1, 2\}$.` },
        { id: 'd', label: '$243$', value: 243, trapExplanation: r`$3^5$ counts functions from $A$ to $B$. The product only pairs one element of each.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$x^2 \le 4$ for integers means $-2 \le x \le 2$: $A = \{-2, -1, 0, 1, 2\}$, so $|A| = 5$.`,
        r`$|B| = 3$.`,
        r`$|A \times B| = 5 \cdot 3 = 15$ ordered pairs.`,
      ],
      keyConceptTag: 'Cartesian product',
    },
    {
      id: 'ml-02-6',
      difficulty: 3,
      promptText: r`Which identity holds for <i>all</i> sets $A$, $B$, $C$?`,
      options: [
        { id: 'a', label: r`$A \setminus (B \cup C) = (A \setminus B) \cap (A \setminus C)$` },
        { id: 'b', label: r`$A \setminus (B \cap C) = (A \setminus B) \cap (A \setminus C)$`, trapExplanation: r`Take $A = \{1\}$, $B = \{1\}$, $C = \varnothing$: the left side is $\{1\}$, the right side is $\varnothing \cap \{1\} = \varnothing$. The right side should use $\cup$.` },
        { id: 'c', label: r`$A \cup (B \cap C) = (A \cup B) \cap C$`, trapExplanation: r`Take $A = \{1\}$, $B = C = \varnothing$: the left side is $\{1\}$, the right side is $\varnothing$. The distributive law gives $(A \cup B) \cap (A \cup C)$.` },
        { id: 'd', label: r`$A \setminus (B \setminus C) = (A \setminus B) \setminus C$`, trapExplanation: r`Take $A = B = C = \{1\}$: the left side is $\{1\} \setminus \varnothing = \{1\}$, the right side is $\varnothing$. Difference is not associative.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$x \in A \setminus (B \cup C)$ means $x \in A$ and not ($x \in B$ or $x \in C$).`,
        r`De Morgan: $x \in A$ and $x \notin B$ and $x \notin C$.`,
        r`That is ($x \in A$, $x \notin B$) and ($x \in A$, $x \notin C$): $x \in (A \setminus B) \cap (A \setminus C)$.`,
      ],
      keyConceptTag: 'Set identities',
    },
  ],
});
