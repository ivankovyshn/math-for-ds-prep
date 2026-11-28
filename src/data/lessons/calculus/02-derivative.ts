import { defineLesson, r } from '../define.ts';
import { extra } from './02-derivative.extra.ts';
import { practice } from './02-derivative.practice.ts';

export default defineLesson({
  id: 'ca-02',
  moduleId: 'calculus',
  title: 'The derivative',
  blurb: 'Rate of change, the slope of the tangent and the table of derivatives',
  minutes: 8,
  deeper: [
    { title: 'The paradox of the derivative', url: 'https://www.3blue1brown.com/lessons/derivatives', source: '3Blue1Brown · animated video lesson' },
    { title: 'Differentiation formulas', url: 'https://tutorial.math.lamar.edu/Classes/CalcI/DiffFormulas.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
  ],
  lecture: [
    {
      title: 'From average to instantaneous',
      covers: ['8', 'x3'],
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
          kind: 'example',
          title: 'Average and instantaneous velocity',
          prompt: r`A ball's height is $s(t) = 20t - 5t^2$ metres after $t$ seconds. Find its average velocity over the first second and its velocity at $t = 1$.`,
          steps: [
            r`Average: $\frac{s(1) - s(0)}{1 - 0} = \frac{15 - 0}{1} = 15$ m/s — the slope of a secant.`,
            r`Instantaneous: velocity is the derivative, $s'(t) = 20 - 10t$ (the rules come in the next section).`,
            r`$s'(1) = 10$ m/s: the ball is already slower than its average over the first second.`,
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
      title: 'The table of derivatives',
      covers: ['1', '7', 'x1', 'x2', 'x7'],
      blocks: [
        {
          kind: 'text',
          text: r`Nobody uses the definition in practice. A short table, worked out once from the definition, covers the basic functions:`,
        },
        { kind: 'formula', tex: r`(x^n)' = nx^{n-1}, \quad (e^x)' = e^x, \quad (\ln x)' = \frac1x, \quad (\sin x)' = \cos x, \quad (\cos x)' = -\sin x` },
        {
          kind: 'text',
          text: r`Constants factor out and sums are differentiated term by term. The derivative of a constant is 0: a flat line has slope 0.

The power rule is for a variable base and a constant exponent. $e^x$ is the other way round, and its derivative is $e^x$ itself, not $xe^{x-1}$.`,
        },
        {
          kind: 'example',
          title: 'Term by term',
          prompt: r`Differentiate $f(x) = 3x^4 - 2x + 5$, $g(x) = 2e^x - 3\ln x$ and $h(x) = 4\sin x + \cos x$; find $f'(2)$, $g'(1)$ and $h'(0)$.`,
          steps: [
            r`$f'(x) = 3\cdot 4x^3 - 2 + 0 = 12x^3 - 2$, so $f'(2) = 96 - 2 = 94$.`,
            r`$g'(x) = 2e^x - \frac3x$, so $g'(1) = 2e - 3 \approx 2.44$.`,
            r`$h'(x) = 4\cos x - \sin x$, so $h'(0) = 4\cdot 1 - 0 = 4$.`,
            r`Note that $h'(0)$ is not $h(0) = 1$: the value of a function and its slope are different numbers.`,
          ],
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
      title: 'The tangent line',
      covers: ['2', '9', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`The tangent at $x = a$ passes through the point $(a, f(a))$ with slope $f'(a)$. It is the best straight-line approximation of $f$ near $a$:`,
        },
        { kind: 'formula', tex: r`y = f(a) + f'(a)\,(x - a)` },
        {
          kind: 'example',
          title: 'A tangent, and a point with a given slope',
          prompt: r`For $f(x) = x^2 - 2x$: find the tangent at $x = 3$, and the point where the tangent is parallel to the line $y = 2x + 5$.`,
          steps: [
            r`$f(3) = 9 - 6 = 3$ and $f'(x) = 2x - 2$, so $f'(3) = 4$.`,
            r`Tangent: $y = 3 + 4(x - 3) = 4x - 9$.`,
            r`Parallel lines have equal slopes, so we need $f'(x) = 2$: $2x - 2 = 2$, $x = 2$.`,
            r`The point lies on the curve, so its height is $f(2) = 4 - 4 = 0$: the point $(2, 0)$. (The line's own height at $x = 2$, which is 9, is a different point.)`,
          ],
        },
      ],
    },
    {
      title: 'Increasing and decreasing',
      covers: ['10', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`The sign of the derivative tells the direction: where $f'(x) > 0$ the function increases, where $f'(x) < 0$ it decreases. To find these intervals, factor $f'$ and check the sign of each factor.`,
        },
        {
          kind: 'example',
          title: 'Where a cubic goes down',
          prompt: r`Where is $f(x) = x^3 - 12x$ decreasing?`,
          steps: [
            r`$f'(x) = 3x^2 - 12 = 3(x - 2)(x + 2)$, zero at $x = \pm 2$.`,
            r`For $x > 2$ both brackets are positive: $f' > 0$. For $x < -2$ both are negative, and the product is again positive.`,
            r`For $-2 < x < 2$ the brackets have opposite signs: $f' < 0$.`,
            r`So $f$ decreases exactly on $-2 < x < 2$ and increases on both sides.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-02-q3',
          prompt: r`$f'(x) = 2x - 6$. Where is $f$ increasing?`,
          options: [
            { id: 'a', label: '$x > 3$' },
            { id: 'b', label: '$x < 3$', trapExplanation: r`At $x = 0$, $f'(0) = -6 < 0$: $f$ decreases there.` },
            { id: 'c', label: '$x > 6$', trapExplanation: r`$f'(x) = 2x - 6 > 0$ means $x > 3$: divide by 2 as well.` },
          ],
          correctOptionId: 'a',
          explanation: r`$2x - 6 > 0 \iff x > 3$. A parabola with its vertex at $x = 3$ behaves like this.`,
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
          text: r`• $f'(x) = \lim_{h\to0}\frac{f(x + h) - f(x)}{h}$: slope of the tangent, instantaneous rate. The average rate is a secant slope.

• $(x^n)' = nx^{n-1}$, $(e^x)' = e^x$, $(\ln x)' = 1/x$, $(\sin x)' = \cos x$, $(\cos x)' = -\sin x$; constants factor out, sums go term by term.

• Tangent line: $y = f(a) + f'(a)(x - a)$. A given slope $k$: solve $f'(x) = k$, then take $y = f(x)$.

• $f' > 0$: increasing; $f' < 0$: decreasing.

Next lesson: products, quotients, compositions, and finding minima.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
