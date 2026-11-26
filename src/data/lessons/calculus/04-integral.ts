import { defineLesson, r } from '../define.ts';
import { extra } from './04-integral.extra.ts';
import { practice } from './04-integral.practice.ts';

export default defineLesson({
  id: 'ca-04',
  moduleId: 'calculus',
  title: 'The integral',
  blurb: 'Accumulated area, and the theorem that links it to derivatives',
  minutes: 8,
  lecture: [
    {
      title: 'Area as a limit of sums',
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
      blocks: [
        {
          kind: 'text',
          text: r`An <i>antiderivative</i> of $f$ is any $F$ with $F' = f$. They differ only by a constant, written $\int f(x)\,dx = F(x) + C$. Read the derivative table backwards:`,
        },
        { kind: 'formula', tex: r`\int x^n\,dx = \frac{x^{n+1}}{n + 1} + C \ (n \ne -1), \quad \int \frac{dx}{x} = \ln|x| + C, \quad \int e^{kx}dx = \frac{e^{kx}}{k} + C` },
        { kind: 'formula', tex: r`\int \sin x\,dx = -\cos x + C, \qquad \int \cos x\,dx = \sin x + C` },
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
          kind: 'text',
          text: r`The integral is a <i>signed</i> area: parts of the graph below the $x$-axis count negatively. $\int_{-1}^{1} x\,dx = 0$, although the shaded region is not empty.`,
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
      title: 'Techniques and uses',
      blocks: [
        {
          kind: 'text',
          text: r`<i>Substitution</i> is the chain rule backwards: if the integrand has the form $f(g(x))\,g'(x)$, set $u = g(x)$. For example $\int 2x\,e^{x^2}dx = \int e^u\,du = e^{x^2} + C$. <i>Integration by parts</i>, $\int u\,dv = uv - \int v\,du$, is the product rule backwards.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Integrals in probability',
          text: r`A probability density $p(x)$ has $\int p(x)\,dx = 1$; probabilities are areas, $P(a \le X \le b) = \int_a^b p(x)\,dx$; and the mean is $E[X] = \int x\,p(x)\,dx$. The average value of $f$ on $[a, b]$ is $\frac{1}{b - a}\int_a^b f(x)\,dx$.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Watch for blow-ups',
          text: r`$\int_{-1}^{1}\frac{dx}{x^2}$ is not $\big[-\frac1x\big]_{-1}^{1} = -2$: the integrand is infinite at 0 and the area there is unbounded. The fundamental theorem needs $f$ continuous on the whole interval.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $\int_a^b f\,dx$ = limit of Riemann sums = signed area.

• Antiderivative: $F' = f$; $\int x^n dx = \frac{x^{n+1}}{n+1} + C$.

• $\int_a^b f(x)\,dx = F(b) - F(a)$, and $\frac{d}{dx}\int_a^x f = f(x)$.

• Substitution reverses the chain rule.

• Densities integrate to 1; $E[X] = \int x\,p(x)\,dx$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
