import { defineLesson, r } from '../define.ts';
import { extra } from './02-sets.extra.ts';
import { practice } from './02-sets.practice.ts';

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
        {
          kind: 'quiz',
          id: 'ml-02-q1',
          prompt: r`How many elements does the set $\{1, 2, \{1, 2\}, \varnothing\}$ have?`,
          options: [
            { id: 'a', label: '4', value: 4 },
            { id: 'b', label: '2', value: 2, trapExplanation: r`$\{1, 2\}$ is one element of this set (a set inside a set), not a repeat of 1 and 2.` },
            { id: 'c', label: '3', value: 3, trapExplanation: r`$\varnothing$ listed as an element counts: this set contains the empty set as one of its members.` },
          ],
          correctOptionId: 'a',
          explanation: r`The elements are $1$, $2$, $\{1, 2\}$ and $\varnothing$ — four different objects. Sets can contain other sets.`,
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
        {
          kind: 'quiz',
          id: 'ml-02-q2',
          prompt: r`Let $A = \{1, 2, 3, 4\}$ and $B = \{2, 4, 6\}$. What is $A \cap B$?`,
          options: [
            { id: 'a', label: r`$\{2, 4\}$`, value: [2, 4] },
            { id: 'b', label: r`$\{1, 2, 3, 4, 6\}$`, value: [1, 2, 3, 4, 6], trapExplanation: r`That is the union. The intersection keeps only elements in <i>both</i> sets.` },
            { id: 'c', label: r`$\{1, 3\}$`, value: [1, 3], trapExplanation: r`That is $A \setminus B$, the elements of $A$ that are <i>not</i> in $B$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$x \in A \cap B$ iff $x \in A$ and $x \in B$. Only 2 and 4 are in both.`,
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
          kind: 'quiz',
          id: 'ml-02-q3',
          prompt: r`In a group of 30 people, 18 speak English, 12 speak German and 5 speak both. How many speak neither?`,
          options: [
            { id: 'a', label: '5', value: 5 },
            { id: 'b', label: '0', value: 0, trapExplanation: r`$18 + 12 = 30$ counts the 5 bilingual people twice. Subtract them once.` },
            { id: 'c', label: '25', value: 25, trapExplanation: r`25 is $|E \cup G|$, the number who speak at least one of the languages.` },
          ],
          correctOptionId: 'a',
          explanation: r`$|E \cup G| = 18 + 12 - 5 = 25$, so $30 - 25 = 5$ speak neither.`,
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
  extra,
  questions: [
    ...practice,
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
