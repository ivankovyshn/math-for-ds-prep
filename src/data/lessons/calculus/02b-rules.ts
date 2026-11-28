import { defineLesson, r } from '../define.ts';
import { extra } from './02b-rules.extra.ts';
import { practice } from './02b-rules.practice.ts';

export default defineLesson({
  id: 'ca-02b',
  moduleId: 'calculus',
  title: 'Differentiation rules and extrema',
  blurb: 'Chain, product and quotient rules, the second derivative and minima',
  minutes: 8,
  deeper: [
    { title: 'Visualizing the chain rule and product rule', url: 'https://www.3blue1brown.com/lessons/chain-rule-and-product-rule', source: '3Blue1Brown · animated video lesson' },
    { title: 'Chain rule', url: 'https://tutorial.math.lamar.edu/Classes/CalcI/ChainRule.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
    { title: 'The shape of a graph: the second derivative test', url: 'https://tutorial.math.lamar.edu/Classes/CalcI/ShapeofGraphPtII.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
  ],
  lecture: [
    {
      title: 'The chain rule',
      covers: ['2', '4', 'x2', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`Most functions in practice are compositions: $e^{3x}$, $\sin(x^2)$, $(3x - 1)^4$, $\ln(4x + 9)$. Each is an outer function applied to an inner one. Rates of change multiply along the chain: if the inside changes 3 times faster than $x$, everything downstream does too.`,
        },
        { kind: 'formula', tex: r`\big(f(g(x))\big)' = f'(g(x))\cdot g'(x)`, caption: 'Differentiate the outside, keep the inside, multiply by the derivative of the inside.' },
        {
          kind: 'example',
          title: 'Four compositions',
          prompt: r`Differentiate $\sin(x^2)$, $e^{3x}$, $(3x - 1)^4$ and $\ln(4x + 9)$.`,
          steps: [
            r`$\sin(x^2)$: outer $\sin u$, inner $u = x^2$. Derivative $\cos(x^2)\cdot 2x$.`,
            r`$e^{3x}$: outer $e^u$, inner $u = 3x$. Derivative $e^{3x}\cdot 3$.`,
            r`$(3x - 1)^4$: outer $u^4$, inner $u = 3x - 1$. Derivative $4(3x - 1)^3\cdot 3 = 12(3x - 1)^3$.`,
            r`$\ln(4x + 9)$: outer $\ln u$ with $(\ln u)' = \frac1u$. Derivative $\frac{1}{4x + 9}\cdot 4 = \frac{4}{4x + 9}$.`,
            r`In each case the last factor is the derivative of the inside. Forgetting it is the most common mistake in all of calculus.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-02b-q1',
          prompt: r`What is the derivative of $(2x + 1)^3$ at $x = 0$?`,
          options: [
            { id: 'a', label: '$6$', value: 6 },
            { id: 'b', label: '$3$', value: 3, trapExplanation: r`That is $3(2x + 1)^2$ at 0. The inner derivative $(2x + 1)' = 2$ is missing.` },
            { id: 'c', label: '$2$', value: 2, trapExplanation: r`That is only the inner derivative. The outer one, $3u^2 = 3$ at $u = 1$, multiplies it.` },
          ],
          correctOptionId: 'a',
          explanation: r`$3(2x + 1)^2\cdot 2$; at $x = 0$: $3\cdot 1\cdot 2 = 6$.`,
        },
      ],
    },
    {
      title: 'Product and quotient rules',
      covers: ['3', 'x1', 'x5'],
      blocks: [
        { kind: 'formula', tex: r`(uv)' = u'v + uv', \qquad \Big(\frac uv\Big)' = \frac{u'v - uv'}{v^2}` },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Not factor by factor',
          text: r`$(uv)' \ne u'v'$ and $\big(\frac uv\big)' \ne \frac{u'}{v'}$. Try $u = v = x$: $(x^2)' = 2x$, but $u'v' = 1$. In the quotient rule the order in the numerator matters: $u'v$ first, minus $uv'$.`,
        },
        {
          kind: 'example',
          title: 'A product with a chain inside',
          prompt: r`Find $f'(0)$ for $f(x) = (x - 2)\,e^{2x}$.`,
          steps: [
            r`$u = x - 2$, $u' = 1$; $v = e^{2x}$, $v' = 2e^{2x}$ (chain rule).`,
            r`$f'(x) = 1\cdot e^{2x} + (x - 2)\cdot 2e^{2x}$.`,
            r`At $x = 0$, $e^0 = 1$: $f'(0) = 1 + (-2)\cdot 2 = -3$.`,
          ],
        },
        {
          kind: 'example',
          title: 'A quotient',
          prompt: r`Find $g'(2)$ for $g(x) = \dfrac{x^2 + 1}{x - 1}$.`,
          steps: [
            r`$u = x^2 + 1$, $u' = 2x$; $v = x - 1$, $v' = 1$.`,
            r`$g'(x) = \dfrac{2x(x - 1) - (x^2 + 1)\cdot 1}{(x - 1)^2}$.`,
            r`At $x = 2$: $\dfrac{4\cdot 1 - 5}{1^2} = -1$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-02b-q2',
          prompt: r`What is the derivative of $x e^{x}$ at $x = 0$?`,
          options: [
            { id: 'a', label: '$1$', value: 1 },
            { id: 'b', label: '$0$', value: 0, trapExplanation: r`$(uv)' \ne u'v'$: the product rule gives $e^x + xe^x$, which is 1 at $x = 0$.` },
            { id: 'c', label: '$2$', value: 2, trapExplanation: r`At $x = 0$ the second term $xe^x$ is 0, so $(xe^x)' = 1 + 0$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$(xe^x)' = 1\cdot e^x + x\cdot e^x$; at 0 that is $1 + 0 = 1$.`,
        },
      ],
    },
    {
      title: 'The second derivative',
      covers: ['1', 'x3'],
      blocks: [
        {
          kind: 'box',
          variant: 'definition',
          title: 'Second derivative',
          text: r`The <i>second derivative</i> $f''$ is the derivative of $f'$. It measures how fast the slope itself changes. Higher derivatives continue the pattern: $f'''$, and in general $f^{(k)}$, differentiated $k$ times.`,
        },
        {
          kind: 'text',
          text: r`Where $f'' > 0$ the slope grows: the graph bends upwards like a cup (it is <i>convex</i>). Where $f'' < 0$ it bends downwards like a cap. For a moving object, $f'$ is velocity and $f''$ is acceleration.`,
        },
        {
          kind: 'example',
          title: 'Twice in a row',
          prompt: r`For $f(x) = x^3 - 6x^2 + 4x$, find $f''(x)$ and $f''(3)$.`,
          steps: [
            r`$f'(x) = 3x^2 - 12x + 4$.`,
            r`Differentiate again: $f''(x) = 6x - 12$. The constant 4 disappears.`,
            r`$f''(3) = 18 - 12 = 6 > 0$: near $x = 3$ the graph bends upwards.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-02b-q3',
          prompt: r`$f(x) = x^4$. What is $f''(1)$?`,
          options: [
            { id: 'a', label: '$12$', value: 12 },
            { id: 'b', label: '$4$', value: 4, trapExplanation: r`That is $f'(1)$: $f'(x) = 4x^3$ has to be differentiated once more.` },
            { id: 'c', label: '$1$', value: 1, trapExplanation: r`That is $f(1)$, the value of the function.` },
          ],
          correctOptionId: 'a',
          explanation: r`$f'(x) = 4x^3$, $f''(x) = 12x^2$, so $f''(1) = 12$.`,
        },
      ],
    },
    {
      title: 'Minima and maxima',
      covers: ['5', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`At the bottom of a valley or the top of a hill the tangent is horizontal, so $f'(a) = 0$. Such points are <i>critical points</i>: the candidates for minima and maxima. The second derivative tells which is which.`,
        },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Second derivative test',
          text: r`If $f'(a) = 0$ and $f''(a) > 0$, then $f$ has a local minimum at $a$ (a cup). If $f'(a) = 0$ and $f''(a) < 0$, a local maximum (a cap). If $f''(a) = 0$ the test says nothing.`,
        },
        {
          kind: 'example',
          title: 'Classifying critical points',
          prompt: r`Find the local minimum and maximum of $f(x) = x^3 - 3x + 1$.`,
          steps: [
            r`$f'(x) = 3x^2 - 3 = 3(x - 1)(x + 1)$: critical points $x = 1$ and $x = -1$.`,
            r`$f''(x) = 6x$.`,
            r`$f''(1) = 6 > 0$: a local minimum at $x = 1$, with $f(1) = -1$.`,
            r`$f''(-1) = -6 < 0$: a local maximum at $x = -1$, with $f(-1) = 3$.`,
          ],
        },
      ],
    },
    {
      title: 'The sigmoid',
      covers: ['6'],
      blocks: [
        {
          kind: 'text',
          text: r`Logistic regression and many neural networks use the sigmoid $\sigma(x) = \frac{1}{1 + e^{-x}}$, which squeezes any number into $(0, 1)$. Its derivative has a famous short form. Deriving it uses every rule of this lesson.`,
        },
        {
          kind: 'example',
          title: "σ' = σ(1 − σ)",
          prompt: r`Show that $\sigma'(x) = \sigma(x)\big(1 - \sigma(x)\big)$, and use it when $\sigma(x_0) = 0.2$.`,
          steps: [
            r`Write $\sigma = (1 + e^{-x})^{-1}$. Chain rule: outer $u^{-1}$ with derivative $-u^{-2}$; inner $1 + e^{-x}$ with derivative $-e^{-x}$.`,
            r`$\sigma'(x) = -(1 + e^{-x})^{-2}\cdot(-e^{-x}) = \dfrac{e^{-x}}{(1 + e^{-x})^2}$.`,
            r`Split it: $\dfrac{1}{1 + e^{-x}}\cdot\dfrac{e^{-x}}{1 + e^{-x}}$. The first factor is $\sigma$; the second is $\dfrac{(1 + e^{-x}) - 1}{1 + e^{-x}} = 1 - \sigma$.`,
            r`So $\sigma' = \sigma(1 - \sigma)$.`,
            r`With $\sigma(x_0) = 0.2$: $\sigma'(x_0) = 0.2\cdot 0.8 = 0.16$ — no need to know $x_0$ itself.`,
          ],
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'In machine learning',
          text: r`Gradient descent moves a parameter against the derivative of the loss: $w \leftarrow w - \eta\,L'(w)$. Every such derivative is computed with exactly these rules, applied mechanically by the computer — that is what backpropagation is.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Chain: $(f(g(x)))' = f'(g(x))\,g'(x)$ — never forget the inner derivative.

• Product: $(uv)' = u'v + uv'$. Quotient: $\big(\frac uv\big)' = \frac{u'v - uv'}{v^2}$.

• $f''$ is the derivative of $f'$: $f'' > 0$ bends up, $f'' < 0$ bends down.

• Critical points solve $f'(a) = 0$; $f''(a) > 0$ means a local minimum, $f''(a) < 0$ a maximum.

• $\sigma' = \sigma(1 - \sigma)$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
