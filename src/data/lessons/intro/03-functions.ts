import { defineLesson, r } from '../define.ts';
import { extra } from './03-functions.extra.ts';

export default defineLesson({
  id: 'ml-03',
  moduleId: 'intro',
  title: 'Functions and mappings',
  blurb: 'Injective, surjective, composition, inverse',
  minutes: 7,
  lecture: [
    {
      title: 'What a function is',
      blocks: [
        {
          kind: 'text',
          text: r`A <i>function</i> $f: X \to Y$ assigns to <i>every</i> element $x$ of the set $X$ <i>exactly one</i> element $f(x)$ of $Y$. $X$ is the <i>domain</i>, $Y$ the <i>codomain</i>, and the set of values actually taken, $f(X) = \{f(x) : x \in X\}$, is the <i>image</i> (or range).

A function is more than a formula: the domain and codomain are part of it. $x \mapsto x^2$ from $\mathbb{R}$ to $\mathbb{R}$ and from $[0, \infty)$ to $[0, \infty)$ behave very differently, as we will see.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Image is not codomain',
          text: r`For $f: \mathbb{R} \to \mathbb{R}$, $f(x) = x^2$, the codomain is $\mathbb{R}$ but the image is only $[0, \infty)$. Negative numbers are allowed as outputs but never produced.`,
        },
      ],
    },
    {
      title: 'Injective, surjective, bijective',
      blocks: [
        {
          kind: 'text',
          text: r`• <i>Injective</i> (one-to-one): different inputs give different outputs. $f(x_1) = f(x_2) \Rightarrow x_1 = x_2$.

• <i>Surjective</i> (onto): every element of $Y$ is hit. $\forall y \in Y\ \exists x \in X:\ f(x) = y$.

• <i>Bijective</i>: both. Every $y$ is hit by exactly one $x$ — a perfect pairing.`,
        },
        { kind: 'diagram', type: 'mappingKinds', caption: 'Left: one element of Y is never hit. Middle: two arrows land on the same element. Right: a perfect pairing.' },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Horizontal line test',
          text: r`For $f: \mathbb{R} \to \mathbb{R}$ draw horizontal lines $y = c$. Injective: every line meets the graph <i>at most</i> once. Surjective: every line meets it <i>at least</i> once. So $x^3$ is bijective, $x^2$ is neither, $e^x$ is injective but not surjective onto $\mathbb{R}$.`,
        },
        {
          kind: 'quiz',
          id: 'ml-03-q1',
          prompt: r`Which function $\mathbb{R} \to \mathbb{R}$ is <i>not</i> injective?`,
          options: [
            { id: 'a', label: r`$f(x) = x^2$` },
            { id: 'b', label: r`$f(x) = 2x + 1$`, trapExplanation: r`A non-constant linear function never repeats a value: $2a + 1 = 2b + 1$ forces $a = b$.` },
            { id: 'c', label: r`$f(x) = x^3$`, trapExplanation: r`$x^3$ is strictly increasing, so different inputs give different outputs.` },
          ],
          correctOptionId: 'a',
          explanation: r`$x^2$ sends $-2$ and $2$ to the same value 4. One such collision is enough to break injectivity.`,
        },
      ],
    },
    {
      title: 'Composition and inverse',
      blocks: [
        {
          kind: 'text',
          text: r`The <i>composition</i> $g \circ f$ means "first $f$, then $g$": $(g \circ f)(x) = g(f(x))$. Read it right to left, just like matrix products. In general $g \circ f \ne f \circ g$.

A function has an <i>inverse</i> $f^{-1}: Y \to X$ with $f^{-1}(f(x)) = x$ and $f(f^{-1}(y)) = y$ exactly when it is bijective. To find it, solve $y = f(x)$ for $x$.`,
        },
        {
          kind: 'example',
          title: 'Inverting a formula',
          prompt: r`Find the inverse of $f(x) = 2x + 3$ and check it.`,
          steps: [
            r`Write $y = 2x + 3$ and solve for $x$: $x = \dfrac{y - 3}{2}$.`,
            r`Rename the variable: $f^{-1}(x) = \dfrac{x - 3}{2}$.`,
            r`Check: $f^{-1}(f(x)) = \dfrac{(2x + 3) - 3}{2} = x$. ✓`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'f⁻¹ is not 1/f',
          text: r`$f^{-1}(x)$ undoes $f$; $\dfrac{1}{f(x)}$ is the reciprocal of its value. For $f(x) = 2x + 3$: $f^{-1}(x) = \frac{x - 3}{2}$, while $\frac{1}{f(x)} = \frac{1}{2x + 3}$.`,
        },
        {
          kind: 'quiz',
          id: 'ml-03-q2',
          prompt: r`Let $f(x) = x + 1$ and $g(x) = x^2$. What is $(f \circ g)(2)$?`,
          options: [
            { id: 'a', label: '5', value: 5 },
            { id: 'b', label: '9', value: 9, trapExplanation: r`9 is $(g \circ f)(2) = g(3)$. In $f \circ g$, $g$ acts first.` },
            { id: 'c', label: '4', value: 4, trapExplanation: r`4 is only $g(2)$; $f$ still has to be applied to it.` },
          ],
          correctOptionId: 'a',
          explanation: r`$(f \circ g)(2) = f(g(2)) = f(4) = 5$. Read $f \circ g$ right to left.`,
        },
      ],
    },
    {
      title: 'Counting functions',
      blocks: [
        {
          kind: 'text',
          text: r`Let $|X| = k$ and $|Y| = n$. A function picks an output for each of the $k$ inputs independently, so there are $n^{k}$ functions $X \to Y$.

For an injective function each new input must avoid the outputs already used: $n$ choices, then $n - 1$, …, down to $n - k + 1$.`,
        },
        { kind: 'formula', tex: r`\#\{f: X \to Y\} = n^{k}, \qquad \#\{\text{injective } f\} = n(n-1)\cdots(n-k+1) = \frac{n!}{(n-k)!}` },
        {
          kind: 'quiz',
          id: 'ml-03-q3',
          prompt: r`How many bijections are there from a 4-element set to itself?`,
          options: [
            { id: 'a', label: '24', value: 24 },
            { id: 'b', label: '256', value: 256, trapExplanation: r`$4^4 = 256$ counts <i>all</i> functions, including those that repeat values.` },
            { id: 'c', label: '4', value: 4, trapExplanation: r`Each element has 4 possible images at first, but the choices shrink as values are used up: $4 \cdot 3 \cdot 2 \cdot 1$.` },
          ],
          correctOptionId: 'a',
          explanation: r`Injective with $k = n = 4$: $4 \cdot 3 \cdot 2 \cdot 1 = 24$. For finite sets of equal size, injective = surjective = bijective.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $f: X \to Y$: every input has exactly one output. Image ⊆ codomain.

• Injective: no two inputs share an output. Surjective: every output is hit. Bijective: both.

• $(g \circ f)(x) = g(f(x))$ — first $f$. Inverse exists ⟺ bijective; find it by solving $y = f(x)$.

• $n^k$ functions, $n!/(n-k)!$ injective ones.`,
        },
      ],
    },
  ],
  extra,
  questions: [
    {
      id: 'ml-03-1',
      difficulty: 1,
      promptText: r`Let $f(x) = x^2 + 1$ and $g(x) = 2x$. Compute $(g \circ f)(3)$.`,
      options: [
        { id: 'a', label: '$20$', value: 20 },
        { id: 'b', label: '$37$', value: 37, trapExplanation: r`$37 = f(g(3)) = 6^2 + 1$: the order is reversed. $g \circ f$ applies $f$ first.` },
        { id: 'c', label: '$10$', value: 10, trapExplanation: r`$10 = f(3)$ is only the first step. Then $g$ doubles it.` },
        { id: 'd', label: '$19$', value: 19, trapExplanation: r`$2\cdot 9 + 1$ doubles $x^2$ before adding 1. $g$ acts on the whole output $f(3) = 10$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$(g \circ f)(3) = g(f(3))$ — first $f$.`,
        r`$f(3) = 9 + 1 = 10$.`,
        r`$g(10) = 20$.`,
      ],
      keyConceptTag: 'Composition order',
    },
    {
      id: 'ml-03-2',
      difficulty: 1,
      promptText: r`Which function $\mathbb{R} \to \mathbb{R}$ is injective?`,
      options: [
        { id: 'a', label: r`$f(x) = x^3$` },
        { id: 'b', label: r`$f(x) = x^2$`, trapExplanation: r`$f(-2) = f(2) = 4$: two inputs share an output.` },
        { id: 'c', label: r`$f(x) = |x|$`, trapExplanation: r`$|-1| = |1|$. Any even function fails injectivity.` },
        { id: 'd', label: r`$f(x) = \sin x$`, trapExplanation: r`$\sin 0 = \sin\pi = 0$. A periodic function repeats every value infinitely often.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Injective: $f(x_1) = f(x_2)$ forces $x_1 = x_2$.`,
        r`$x^3$ is strictly increasing, so different inputs give different outputs; every horizontal line meets its graph once.`,
        r`The other three each have a pair like $f(-a) = f(a)$ or $f(0) = f(\pi)$.`,
      ],
      keyConceptTag: 'Injectivity',
    },
    {
      id: 'ml-03-3',
      difficulty: 2,
      promptText: r`Find the inverse of $f(x) = \dfrac{2x + 1}{x - 3}$ (for $x \ne 3$, values $\ne 2$).`,
      options: [
        { id: 'a', label: r`$f^{-1}(x) = \dfrac{3x + 1}{x - 2}$` },
        { id: 'b', label: r`$f^{-1}(x) = \dfrac{x - 3}{2x + 1}$`, trapExplanation: r`This is $1/f(x)$, the reciprocal. The inverse undoes $f$ — check: it does not return $x$ when applied to $f(x)$.` },
        { id: 'c', label: r`$f^{-1}(x) = \dfrac{3x - 1}{x + 2}$`, trapExplanation: r`Signs slipped when collecting the $x$ terms. Test $x = 4$: $f(4) = 9$, and this gives $26/11$, not $4$.` },
        { id: 'd', label: r`$f^{-1}(x) = \dfrac{x + 3}{2x - 1}$`, trapExplanation: r`Swapping signs and positions does not invert. Solve $y = f(x)$ for $x$ instead; test $f(4) = 9$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$y = \dfrac{2x + 1}{x - 3}$ gives $y(x - 3) = 2x + 1$, i.e. $xy - 3y = 2x + 1$.`,
        r`Collect $x$: $x(y - 2) = 3y + 1$, so $x = \dfrac{3y + 1}{y - 2}$.`,
        r`Check with $x = 4$: $f(4) = 9$ and $\dfrac{27 + 1}{9 - 2} = 4$. ✓`,
      ],
      keyConceptTag: 'Finding an inverse',
    },
    {
      id: 'ml-03-4',
      difficulty: 2,
      promptText: r`How many functions are there from $\{1, 2, 3\}$ to $\{a, b\}$?`,
      options: [
        { id: 'a', label: '$8$', value: 8 },
        { id: 'b', label: '$9$', value: 9, trapExplanation: r`$3^2$ would count functions from a 2-element set to a 3-element set. Here each of 3 inputs picks one of 2 outputs: $2^3$.` },
        { id: 'c', label: '$6$', value: 6, trapExplanation: r`$3 \cdot 2$ counts pairs (input, output), i.e. $|X \times Y|$. A function makes a choice for <i>every</i> input at once.` },
        { id: 'd', label: '$0$', value: 0, trapExplanation: r`That is the number of <i>injective</i> functions: 3 inputs cannot get different outputs from only 2. Ordinary functions may repeat outputs.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$f(1)$ has 2 choices, $f(2)$ has 2, $f(3)$ has 2.`,
        r`The choices are independent: $2\cdot2\cdot2$.`,
        r`$2^3 = 8$ functions.`,
      ],
      keyConceptTag: 'Counting functions',
    },
    {
      id: 'ml-03-5',
      difficulty: 3,
      promptText: r`How many <i>injective</i> functions are there from a 3-element set to a 5-element set?`,
      options: [
        { id: 'a', label: '$60$', value: 60 },
        { id: 'b', label: '$125$', value: 125, trapExplanation: r`$5^3$ counts all functions, including those that repeat an output.` },
        { id: 'c', label: '$10$', value: 10, trapExplanation: r`$\binom{5}{3} = 10$ counts which 3 outputs are used, but not which input goes to which. Multiply by $3! = 6$.` },
        { id: 'd', label: '$243$', value: 243, trapExplanation: r`$3^5$ has base and exponent swapped: it counts functions from the 5-element set to the 3-element set.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`The first input has 5 possible outputs.`,
        r`The second must avoid the first output: 4 choices. The third avoids both: 3 choices.`,
        r`$5\cdot4\cdot3 = 60$.`,
      ],
      keyConceptTag: 'Counting injections',
    },
    {
      id: 'ml-03-6',
      difficulty: 3,
      promptText: r`Consider $f: \mathbb{Z} \to \mathbb{Z}$, $f(n) = 2n$. Which statement is true?`,
      options: [
        { id: 'a', label: 'Injective but not surjective' },
        { id: 'b', label: 'Bijective', trapExplanation: r`Odd numbers are never hit: $2n = 3$ has no integer solution. So it is not surjective.` },
        { id: 'c', label: 'Surjective but not injective', trapExplanation: r`It is the other way round: $2n_1 = 2n_2$ forces $n_1 = n_2$ (injective), while odd numbers are missed.` },
        { id: 'd', label: 'Neither injective nor surjective', trapExplanation: r`$2n_1 = 2n_2$ gives $n_1 = n_2$, so it is injective.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Injective: $2n_1 = 2n_2 \Rightarrow n_1 = n_2$.`,
        r`Not surjective: the image is the even integers; $1$ has no preimage in $\mathbb{Z}$.`,
        r`Note the codomain matters: as a map $\mathbb{R} \to \mathbb{R}$, $x \mapsto 2x$ <i>is</i> bijective.`,
      ],
      keyConceptTag: 'Injective vs surjective',
    },
  ],
});
