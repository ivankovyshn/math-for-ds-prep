import { defineLesson, r } from '../define.ts';
import { extra } from './03-functions.extra.ts';
import { practice } from './03-functions.practice.ts';

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
  questions: practice,
});
