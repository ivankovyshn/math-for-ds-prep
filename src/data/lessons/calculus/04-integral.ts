import { defineLesson, r } from '../define.ts';
import { extra } from './04-integral.extra.ts';
import { practice } from './04-integral.practice.ts';

export default defineLesson({
  id: 'ca-04',
  moduleId: 'calculus',
  title: 'The integral',
  blurb: 'Area, antiderivatives and the fundamental theorem of calculus',
  minutes: 8,
  deeper: [
    { title: 'Integration and the fundamental theorem of calculus', url: 'https://www.3blue1brown.com/lessons/integration', source: '3Blue1Brown · animated video lesson' },
    { title: 'Computing definite integrals', url: 'https://tutorial.math.lamar.edu/Classes/CalcI/ComputingDefiniteIntegrals.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
  ],
  lecture: [
    {
      title: 'Area as a limit of sums',
      covers: ['x3'],
      blocks: [
        {
          kind: 'text',
          text: r`To find the area under $f$ between $a$ and $b$, cut $[a, b]$ into $n$ strips of width $\Delta x = \frac{b - a}{n}$ and add up rectangles. As the strips get thinner, the <i>Riemann sums</i> approach the <i>definite integral</i>:`,
        },
        { kind: 'formula', tex: r`\int_a^b f(x)\,dx = \lim_{n\to\infty}\sum_{i=1}^{n} f(x_i)\,\Delta x` },
        { kind: 'diagram', type: 'riemann', caption: r`Left Riemann sum: each rectangle takes its height from the left end of its strip. More, thinner strips shrink the gap to the true area.` },
        {
          kind: 'quiz',
          id: 'ca-04-q1',
          prompt: r`Compute the left Riemann sum of $f(x) = x$ on $[0, 4]$ with 4 strips of width 1.`,
          options: [
            { id: 'a', label: '$6$', value: 6 },
            { id: 'b', label: '$8$', value: 8, trapExplanation: r`8 is the exact area $\frac{4^2}{2}$. The left sum uses heights $f(0), f(1), f(2), f(3)$ and comes out lower.` },
            { id: 'c', label: '$10$', value: 10, trapExplanation: r`That is the right sum: heights $f(1), \dots, f(4)$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$(0 + 1 + 2 + 3)\cdot1 = 6$. The exact area is 8: left sums underestimate an increasing function.`,
        },
      ],
    },
    {
      title: 'Antiderivatives',
      covers: ['2', 'x2'],
      blocks: [
        {
          kind: 'text',
          text: r`An <i>antiderivative</i> of $f$ is any $F$ with $F' = f$. They differ only by a constant, written $\int f(x)\,dx = F(x) + C$. Read the derivative table backwards:`,
        },
        { kind: 'formula', tex: r`\int x^n\,dx = \frac{x^{n+1}}{n + 1} + C \ (n \ne -1), \quad \int \frac{dx}{x} = \ln|x| + C, \quad \int e^{kx}dx = \frac{e^{kx}}{k} + C` },
        { kind: 'formula', tex: r`\int \sin x\,dx = -\cos x + C, \qquad \int \cos x\,dx = \sin x + C` },
        {
          kind: 'example',
          title: 'Three antiderivatives, each checked',
          prompt: r`Find $\int 8x^3\,dx$, $\int e^{3x}\,dx$ and $\int \frac4x\,dx$.`,
          steps: [
            r`$\int 8x^3\,dx = 8\cdot\frac{x^4}{4} + C = 2x^4 + C$. Check: $(2x^4)' = 8x^3$. ✓`,
            r`$\int e^{3x}\,dx = \frac13 e^{3x} + C$. Check: $\big(\frac13 e^{3x}\big)' = \frac13\cdot 3e^{3x} = e^{3x}$. ✓ The chain rule's factor 3 has to be divided out.`,
            r`$\int \frac4x\,dx = 4\ln|x| + C$. Check: $(4\ln x)' = \frac4x$. ✓`,
            r`Raise the exponent, then divide by the new exponent; for $e^{kx}$ divide by $k$. Differentiating the answer is always a quick check.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-04-q2',
          prompt: r`Which function is an antiderivative of $6x^2$?`,
          options: [
            { id: 'a', label: '$2x^3$' },
            { id: 'b', label: '$12x$', trapExplanation: r`That is the derivative of $6x^2$, the opposite direction.` },
            { id: 'c', label: '$6x^3$', trapExplanation: r`$(6x^3)' = 18x^2$. Divide by the new exponent: $\frac{6x^3}{3} = 2x^3$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$(2x^3)' = 6x^2$. ✓ Check an antiderivative by differentiating it.`,
        },
      ],
    },
    {
      title: 'The fundamental theorem',
      covers: ['1', '3', '8', 'x1', 'x4', 'x5'],
      blocks: [
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Fundamental theorem of calculus',
          text: r`If $F$ is an antiderivative of a continuous $f$, then

$\int_a^b f(x)\,dx = F(b) - F(a)$.

And conversely, $\frac{d}{dx}\int_a^x f(t)\,dt = f(x)$: accumulating and differentiating undo each other.`,
        },
        {
          kind: 'example',
          title: 'A definite integral',
          prompt: r`Compute $\int_0^2 (3x^2 + 1)\,dx$.`,
          steps: [
            r`Antiderivative: $F(x) = x^3 + x$.`,
            r`$F(2) - F(0) = (8 + 2) - 0 = 10$.`,
            r`No $+C$ needed: it cancels in $F(b) - F(a)$.`,
          ],
        },
        {
          kind: 'example',
          title: 'A rate adds up to a total',
          prompt: r`Water flows into a tank at $r(t) = 2t + 3$ litres per minute. How much flows in between $t = 1$ and $t = 4$? And if $V(x) = \int_0^x r(t)\,dt$, what is $V'(2)$?`,
          steps: [
            r`The integral of a rate is the total change: $\int_1^4 (2t + 3)\,dt$.`,
            r`Antiderivative $t^2 + 3t$: $(16 + 12) - (1 + 3) = 24$ litres.`,
            r`Not $r(4) - r(1) = 6$: that is how much the <i>rate</i> changed, not how much water arrived.`,
            r`Second half of the theorem: $V'(x) = r(x)$, so $V'(2) = r(2) = 7$ — no integration needed.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-04-q3',
          prompt: r`Compute $\int_0^{\pi}\sin x\,dx$.`,
          options: [
            { id: 'a', label: '$2$', value: 2 },
            { id: 'b', label: '$0$', value: 0, trapExplanation: r`$\sin x \ge 0$ on $[0, \pi]$, so the area cannot be 0. $-\cos\pi - (-\cos0) = 1 + 1$.` },
            { id: 'c', label: '$-2$', value: -2, trapExplanation: r`The antiderivative of $\sin x$ is $-\cos x$; with that sign the result is $+2$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$[-\cos x]_0^{\pi} = -\cos\pi + \cos 0 = 1 + 1 = 2$.`,
        },
      ],
    },
    {
      title: 'Signed area and average value',
      covers: ['4', '7', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`The integral is a <i>signed</i> area: parts of the graph below the $x$-axis count negatively. $\int_{-1}^{1} x\,dx = 0$, although the region between the graph and the axis is not empty. For the <i>total</i> area, split the interval where $f$ changes sign and add the pieces as positive numbers.

The <i>average value</i> of $f$ on $[a, b]$ is the height of the rectangle with the same area:`,
        },
        { kind: 'formula', tex: r`\bar f = \frac{1}{b - a}\int_a^b f(x)\,dx` },
        {
          kind: 'example',
          title: 'Signed, total and average',
          prompt: r`For $f(x) = x - 1$ on $[0, 3]$, find the integral, the total area between the graph and the axis, and the average value.`,
          steps: [
            r`Integral: $\big[\frac{x^2}{2} - x\big]_0^3 = \frac92 - 3 = \frac32$.`,
            r`$f$ is negative on $[0, 1]$ and positive on $[1, 3]$. Pieces: $\int_0^1 (x - 1)\,dx = -\frac12$ and $\int_1^3 (x - 1)\,dx = 2$.`,
            r`Total area $= \frac12 + 2 = \frac52$; the signed integral $\frac32$ is smaller because the part below the axis was subtracted.`,
            r`Average value $= \frac{1}{3 - 0}\cdot\frac32 = \frac12$.`,
          ],
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $\int_a^b f\,dx$ = limit of Riemann sums = signed area.

• Antiderivative: $F' = f$; $\int x^n dx = \frac{x^{n+1}}{n+1} + C$, $\int e^{kx}dx = \frac{e^{kx}}{k} + C$.

• $\int_a^b f(x)\,dx = F(b) - F(a)$: the integral of a rate is the total change. And $\frac{d}{dx}\int_a^x f = f(x)$.

• Total area: split where $f$ changes sign. Average value: $\frac{1}{b - a}\int_a^b f$.

Next lesson: substitution, integration by parts, infinite intervals and probability densities.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
