import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'ml-03-x1',
    difficulty: 1,
    promptText: r`Let $f(x) = 3x - 1$ and $g(x) = x^2$. Compute $(f \circ g)(2)$.`,
    options: [
      { id: 'a', label: '11', value: 11 },
      { id: 'b', label: '25', value: 25, trapExplanation: r`25 is $(g \circ f)(2) = g(5)$. In $f \circ g$ the function written on the right, $g$, acts first.` },
      { id: 'c', label: '20', value: 20, trapExplanation: r`That is the product $f(2) \cdot g(2) = 5 \cdot 4$. Composition feeds one output into the other function.` },
      { id: 'd', label: '9', value: 9, trapExplanation: r`That is the sum $f(2) + g(2)$, not a composition.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$(f \circ g)(2) = f(g(2))$: apply $g$ first.`,
      r`$g(2) = 2^2 = 4$.`,
      r`$f(4) = 3 \cdot 4 - 1 = 11$.`,
    ],
    keyConceptTag: 'Composition order',
  },
  {
    id: 'ml-03-x2',
    difficulty: 1,
    promptText: r`Which function $\mathbb{R} \to \mathbb{R}$ is surjective (takes every real value)?`,
    options: [
      { id: 'a', label: r`$f(x) = x^3$` },
      { id: 'b', label: r`$f(x) = x^2$`, trapExplanation: r`$x^2 \ge 0$, so negative values such as $-1$ are never taken.` },
      { id: 'c', label: r`$f(x) = e^x$`, trapExplanation: r`$e^x > 0$ for every $x$: zero and the negative numbers are missed.` },
      { id: 'd', label: r`$f(x) = \sin x$`, trapExplanation: r`$\sin x$ stays between $-1$ and $1$, so a value like 2 is never reached.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Surjective means: every $y \in \mathbb{R}$ equals $f(x)$ for some $x$.`,
      r`For $f(x) = x^3$ take $x = \sqrt[3]{y}$, which exists for every real $y$, including negative ones.`,
      r`The other functions miss values: $x^2$ and $e^x$ miss negatives, $\sin x$ misses everything outside $[-1, 1]$.`,
    ],
    keyConceptTag: 'Surjectivity',
  },
  {
    id: 'ml-03-x3',
    difficulty: 1,
    promptText: r`What is the inverse of $f(x) = 2x + 3$?`,
    options: [
      { id: 'a', label: r`$f^{-1}(x) = \dfrac{x - 3}{2}$` },
      { id: 'b', label: r`$f^{-1}(x) = \dfrac{x + 3}{2}$`, trapExplanation: r`To undo "add 3" you must subtract 3. Check: $f(0) = 3$, but this formula sends 3 to 3, not back to 0.` },
      { id: 'c', label: r`$f^{-1}(x) = \dfrac{1}{2x + 3}$`, trapExplanation: r`$f^{-1}$ is the inverse <i>function</i> (undo $f$), not the reciprocal $1/f(x)$.` },
      { id: 'd', label: r`$f^{-1}(x) = 2x - 3$`, trapExplanation: r`The operations must be undone in reverse order: first subtract 3, then divide by 2.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Write $y = 2x + 3$ and solve for $x$.`,
      r`$y - 3 = 2x$, so $x = \dfrac{y - 3}{2}$.`,
      r`Rename the variable: $f^{-1}(x) = \dfrac{x - 3}{2}$. Check: $f^{-1}(f(0)) = f^{-1}(3) = 0$.`,
    ],
    keyConceptTag: 'Finding an inverse',
  },
  {
    id: 'ml-03-x4',
    difficulty: 2,
    promptText: r`How many functions are there from $\{1, 2\}$ to $\{a, b, c\}$?`,
    options: [
      { id: 'a', label: '9', value: 9 },
      { id: 'b', label: '8', value: 8, trapExplanation: r`$2^3$ swaps the roles: it counts functions from a 3-element set to a 2-element set.` },
      { id: 'c', label: '6', value: 6, trapExplanation: r`$3 \cdot 2 = 6$ counts the <i>injective</i> functions. A function may send 1 and 2 to the same letter.` },
      { id: 'd', label: '5', value: 5, trapExplanation: r`Adding the set sizes does not count anything useful here; choices multiply.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`A function picks one value in $\{a, b, c\}$ for each element of $\{1, 2\}$.`,
      r`3 choices for $f(1)$ and, independently, 3 choices for $f(2)$.`,
      r`$3 \cdot 3 = 3^2 = 9$. In general there are $|B|^{|A|}$ functions $A \to B$.`,
    ],
    keyConceptTag: 'Counting functions',
  },
  {
    id: 'ml-03-x5',
    difficulty: 2,
    promptText: r`A function $f: \{1, 2, 3\} \to \{1, 2, 3\}$ has $f(1) = 2$, $f(2) = 3$, $f(3) = 1$. What is $f^{-1}(1)$?`,
    options: [
      { id: 'a', label: '3', value: 3 },
      { id: 'b', label: '2', value: 2, trapExplanation: r`2 is $f(1)$. The inverse asks the opposite question: which input is sent to 1?` },
      { id: 'c', label: '1', value: 1, trapExplanation: r`$f(1) = 2$, not 1, so 1 is not the preimage of 1.` },
      { id: 'd', label: 'It does not exist', value: -1, trapExplanation: r`$f$ is a bijection (each value is hit exactly once), so the inverse exists.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$f^{-1}(1)$ is the input $x$ with $f(x) = 1$.`,
      r`Scan the table: $f(3) = 1$.`,
      r`So $f^{-1}(1) = 3$. The inverse simply reads the arrows backwards.`,
    ],
    keyConceptTag: 'Inverse function',
  },
  {
    id: 'ml-03-x6',
    difficulty: 2,
    promptText: r`Consider $f: \mathbb{Z} \to \mathbb{Z}$, $f(n) = n + 1$. Which statement is true?`,
    options: [
      { id: 'a', label: r`$f$ is bijective` },
      { id: 'b', label: r`$f$ is injective but not surjective`, trapExplanation: r`Every integer $m$ is hit: $f(m - 1) = m$. On $\mathbb{N}$ this would fail at 0, but the domain here is $\mathbb{Z}$.` },
      { id: 'c', label: r`$f$ is surjective but not injective`, trapExplanation: r`$n + 1 = m + 1$ forces $n = m$, so different inputs give different outputs.` },
      { id: 'd', label: r`$f$ is neither`, trapExplanation: r`A shift by 1 can be undone by a shift by $-1$, so it is both injective and surjective.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Injective: $f(n) = f(m) \Rightarrow n + 1 = m + 1 \Rightarrow n = m$.`,
      r`Surjective: for any $m \in \mathbb{Z}$, the input $n = m - 1$ gives $f(n) = m$.`,
      r`Both hold, so $f$ is a bijection with inverse $f^{-1}(m) = m - 1$.`,
    ],
    keyConceptTag: 'Injective vs surjective',
  },
];
