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
      covers: ['2', '6', 'x2', 'x6'],
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
          kind: 'box',
          variant: 'definition',
          title: 'Strictly increasing',
          text: r`$f$ is <i>strictly increasing</i> if $x_1 < x_2$ always gives $f(x_1) < f(x_2)$, and <i>strictly decreasing</i> if it always gives $f(x_1) > f(x_2)$. Such a function never takes a value twice, so it is injective.`,
        },
        {
          kind: 'example',
          title: 'Does it take every value?',
          prompt: r`Which of $f(x) = x^3 - x$, $g(x) = e^x$ and $h(x) = x^2$ are surjective as functions $\mathbb{R} \to \mathbb{R}$?`,
          steps: [
            r`A continuous function — a graph drawn without lifting the pen — that is below a level $y$ somewhere and above it somewhere else must cross it in between. This is the <i>intermediate value theorem</i>.`,
            r`$f(x) = x^3 - x$ runs from $-\infty$ on the left to $+\infty$ on the right, so it crosses every level $y$: surjective. It is not injective: $f(-1) = f(0) = f(1) = 0$.`,
            r`$g(x) = e^x$ is always positive: it never takes the value $-1$. Not surjective onto $\mathbb{R}$.`,
            r`$h(x) = x^2 \ge 0$ misses every negative number: not surjective.`,
          ],
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
      covers: ['1', '3', 'x1', 'x3', 'x5'],
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
          kind: 'example',
          title: 'Inverting a fraction',
          prompt: r`Find the inverse of $f(x) = \dfrac{x + 1}{x - 2}$ (for $x \ne 2$).`,
          steps: [
            r`Write $y = \dfrac{x + 1}{x - 2}$ and solve for $x$. Multiply by $x - 2$: $y(x - 2) = x + 1$.`,
            r`Expand and collect the $x$ terms on one side: $yx - x = 1 + 2y$, so $x(y - 1) = 2y + 1$.`,
            r`$x = \dfrac{2y + 1}{y - 1}$. Renaming the variable: $f^{-1}(x) = \dfrac{2x + 1}{x - 1}$, for $x \ne 1$.`,
            r`Check at one point: $f(3) = \frac41 = 4$ and $f^{-1}(4) = \frac93 = 3$. ✓`,
          ],
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
      covers: ['4', '5', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`Let $|X| = k$ and $|Y| = n$. A function picks an output for each of the $k$ inputs independently, so there are $n^{k}$ functions $X \to Y$.

For an injective function each new input must avoid the outputs already used: $n$ choices, then $n - 1$, …, down to $n - k + 1$.`,
        },
        { kind: 'formula', tex: r`\#\{f: X \to Y\} = n^{k}, \qquad \#\{\text{injective } f\} = n(n-1)\cdots(n-k+1) = \frac{n!}{(n-k)!}` },
        {
          kind: 'box',
          variant: 'definition',
          title: 'Factorial',
          text: r`$n! = n\cdot(n - 1)\cdots 2\cdot 1$ is the number of ways to put $n$ objects in order, with $0! = 1$. So $4! = 24$, and $\frac{n!}{(n - k)!} = n(n - 1)\cdots(n - k + 1)$ is the product of the first $k$ of these factors.`,
        },
        {
          kind: 'example',
          title: 'Counting injections',
          prompt: r`How many injective functions are there from $\{1, 2\}$ to $\{a, b, c, d\}$?`,
          steps: [
            r`$f(1)$ can be any of the 4 letters.`,
            r`$f(2)$ must differ from $f(1)$: 3 choices are left.`,
            r`$4\cdot 3 = 12 = \frac{4!}{(4 - 2)!}$. Without the injectivity condition there would be $4^2 = 16$ functions.`,
          ],
        },
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
