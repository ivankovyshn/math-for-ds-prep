import { defineLesson, r } from '../define.ts';
import { extra } from './02-derivative.extra.ts';
import { practice } from './02-derivative.practice.ts';

export default defineLesson({
  id: 'ca-02',
  moduleId: 'calculus',
  title: 'The derivative',
  blurb: 'Instantaneous rate of change and the slope of the tangent',
  minutes: 8,
  lecture: [
    {
      title: 'From average to instantaneous',
      blocks: [
        {
          kind: 'text',
          text: r`The average rate of change of $f$ between $x$ and $x + h$ is the slope of the secant line, $\frac{f(x + h) - f(x)}{h}$. Let $h$ shrink and the secant turns into the tangent:`,
        },
        { kind: 'formula', tex: r`f'(x) = \lim_{h\to0}\frac{f(x + h) - f(x)}{h}` },
        { kind: 'diagram', type: 'tangent', caption: r`Secants through $(a, f(a))$ and a nearby point approach the tangent line, whose slope is $f'(a)$.` },
        {
          kind: 'example',
          title: 'From the definition',
          prompt: r`Differentiate $f(x) = x^2$.`,
          steps: [
            r`$f(x + h) - f(x) = x^2 + 2xh + h^2 - x^2 = 2xh + h^2$.`,
            r`Divide by $h$: $2x + h$.`,
            r`Let $h \to 0$: $f'(x) = 2x$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-02-q1',
          prompt: r`What is the average rate of change of $f(x) = x^2$ between $x = 1$ and $x = 3$?`,
          options: [
            { id: 'a', label: '$4$', value: 4 },
            { id: 'b', label: '$8$', value: 8, trapExplanation: r`$f(3) - f(1) = 8$ is the change in $f$; divide by the change in $x$, which is 2.` },
            { id: 'c', label: '$6$', value: 6, trapExplanation: r`$6 = f'(3)$ is the instantaneous rate at $x = 3$, not the average over the interval.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{f(3) - f(1)}{3 - 1} = \frac{9 - 1}{2} = 4$.`,
        },
      ],
    },
    {
      title: 'The rules',
      blocks: [
        {
          kind: 'text',
          text: r`Nobody uses the definition in practice. A short table and a few rules cover almost everything:`,
        },
        { kind: 'formula', tex: r`(x^n)' = nx^{n-1}, \quad (e^x)' = e^x, \quad (\ln x)' = \frac1x, \quad (\sin x)' = \cos x, \quad (\cos x)' = -\sin x` },
        {
          kind: 'text',
          text: r`Constants factor out and sums are differentiated term by term: $(3x^4 - 2x + 5)' = 12x^3 - 2$. The derivative of a constant is 0.`,
        },
        {
          kind: 'quiz',
          id: 'ca-02-q2',
          prompt: r`What is the derivative of $f(x) = 2x^3 - 5x + 7$ at $x = 1$?`,
          options: [
            { id: 'a', label: '$1$', value: 1 },
            { id: 'b', label: '$4$', value: 4, trapExplanation: r`That is $f(1)$, the value, not the slope.` },
            { id: 'c', label: '$8$', value: 8, trapExplanation: r`The constant 7 has derivative 0: $f'(x) = 6x^2 - 5$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$f'(x) = 6x^2 - 5$, so $f'(1) = 1$.`,
        },
      ],
    },
    {
      title: 'Product, quotient and chain rules',
      blocks: [
        { kind: 'formula', tex: r`(uv)' = u'v + uv', \qquad \Big(\frac uv\Big)' = \frac{u'v - uv'}{v^2}, \qquad \big(f(g(x))\big)' = f'(g(x))\,g'(x)` },
        {
          kind: 'example',
          title: 'The chain rule',
          prompt: r`Differentiate $\sin(x^2)$ and $e^{3x}$.`,
          steps: [
            r`$\sin(x^2)$: outer $\sin u$, inner $u = x^2$. Derivative $\cos(x^2)\cdot 2x$.`,
            r`$e^{3x}$: outer $e^u$, inner $u = 3x$. Derivative $e^{3x}\cdot 3$.`,
            r`Rule of thumb: differentiate the outside, keep the inside, multiply by the derivative of the inside.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-02-q3',
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
      title: 'What the derivative tells you',
      blocks: [
        {
          kind: 'text',
          text: r`• Tangent line at $a$: $y = f(a) + f'(a)(x - a)$ — the best straight-line approximation near $a$.

• $f' > 0$: $f$ increases; $f' < 0$: $f$ decreases.

• Critical points $f'(a) = 0$: candidates for maxima and minima. If also $f''(a) > 0$ it is a local minimum, if $f''(a) < 0$ a local maximum.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'In machine learning',
          text: r`Gradient descent moves a parameter against the derivative of the loss: $w \leftarrow w - \eta\,L'(w)$. The sigmoid $\sigma(x) = \frac{1}{1 + e^{-x}}$ has the convenient derivative $\sigma'(x) = \sigma(x)\big(1 - \sigma(x)\big)$.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Continuous is not differentiable',
          text: r`$|x|$ and ReLU are continuous at 0 but have a corner there: the slope from the left (0 or $-1$) differs from the slope from the right (1). No tangent, no derivative at that point.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $f'(x) = \lim_{h\to0}\frac{f(x + h) - f(x)}{h}$: slope of the tangent, instantaneous rate.

• $(x^n)' = nx^{n-1}$, $(e^x)' = e^x$, $(\ln x)' = 1/x$, $(\sin x)' = \cos x$.

• Product: $u'v + uv'$. Chain: $f'(g(x))\,g'(x)$.

• Tangent line: $y = f(a) + f'(a)(x - a)$.

• $f' = 0$ at a minimum or maximum; $f'' > 0$ means a minimum.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
