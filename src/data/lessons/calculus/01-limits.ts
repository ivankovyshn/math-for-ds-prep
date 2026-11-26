import { defineLesson, r } from '../define.ts';
import { extra } from './01-limits.extra.ts';
import { practice } from './01-limits.practice.ts';

export default defineLesson({
  id: 'ca-01',
  moduleId: 'calculus',
  title: 'Limits and continuity',
  blurb: 'What a function approaches, and when it has no jumps',
  minutes: 8,
  lecture: [
    {
      title: 'Approaching a point',
      blocks: [
        {
          kind: 'text',
          text: r`$\lim_{x\to a} f(x) = L$ means: as $x$ gets closer to $a$ (but never equals it), $f(x)$ gets as close to $L$ as we like. The value $f(a)$ itself plays no role — $f$ need not even be defined at $a$.`,
        },
        {
          kind: 'example',
          title: 'A hole in the graph',
          prompt: r`Find $\lim_{x\to1}\dfrac{x^2 - 1}{x - 1}$.`,
          steps: [
            r`At $x = 1$ the fraction is $\frac{0}{0}$: undefined, but that says nothing about the limit yet.`,
            r`For $x \ne 1$: $\dfrac{x^2 - 1}{x - 1} = \dfrac{(x - 1)(x + 1)}{x - 1} = x + 1$.`,
            r`As $x \to 1$, $x + 1 \to 2$. The graph is the line $y = x + 1$ with a hole at $(1, 2)$; the limit is 2.`,
          ],
        },
        {
          kind: 'box',
          variant: 'definition',
          title: 'The precise definition',
          text: r`$\lim_{x\to a} f(x) = L$ if for every $\varepsilon > 0$ there is a $\delta > 0$ such that $0 < |x - a| < \delta$ implies $|f(x) - L| < \varepsilon$.

The quantifiers $\forall\varepsilon\,\exists\delta$ from the logic lesson: whatever accuracy you demand, some neighbourhood of $a$ delivers it.`,
        },
        {
          kind: 'quiz',
          id: 'ca-01-q1',
          prompt: r`What is $\lim_{x\to2}\dfrac{x^2 - 4}{x - 2}$?`,
          options: [
            { id: 'a', label: '$4$', value: 4 },
            { id: 'b', label: '$0$', value: 0, trapExplanation: r`$\frac00$ is not 0: it is undefined, and it means "simplify first". Cancel the factor $x - 2$.` },
            { id: 'c', label: '$2$', value: 2, trapExplanation: r`After cancelling, $\frac{(x-2)(x+2)}{x-2} = x + 2$, which tends to $4$, not 2.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{x^2 - 4}{x - 2} = x + 2$ for $x \ne 2$, and $x + 2 \to 4$.`,
        },
      ],
    },
    {
      title: 'Limit laws and the form 0/0',
      blocks: [
        {
          kind: 'text',
          text: r`Limits respect arithmetic: the limit of a sum, product or quotient is the sum, product or quotient of the limits — for a quotient, as long as the denominator's limit is not 0. So for polynomials (and any function built from them without dividing by 0) you can simply substitute $x = a$.`,
        },
        {
          kind: 'text',
          text: r`When substitution gives $\frac00$, the limit can be anything. Typical fixes: factor and cancel, or multiply by a conjugate to remove a square root. Two limits worth remembering:`,
        },
        { kind: 'formula', tex: r`\lim_{x\to0}\frac{\sin x}{x} = 1, \qquad \lim_{n\to\infty}\Big(1 + \frac1n\Big)^n = e` },
        {
          kind: 'example',
          title: 'Removing a square root',
          prompt: r`Find $\lim_{x\to0}\dfrac{\sqrt{x + 9} - 3}{x}$.`,
          steps: [
            r`Multiply top and bottom by the conjugate $\sqrt{x + 9} + 3$.`,
            r`The numerator becomes $(x + 9) - 9 = x$, so the fraction is $\dfrac{1}{\sqrt{x + 9} + 3}$.`,
            r`Now substitute: $\frac{1}{3 + 3} = \frac16$.`,
          ],
        },
      ],
    },
    {
      title: 'Limits at infinity',
      blocks: [
        {
          kind: 'text',
          text: r`For $x \to \infty$, the highest powers win. Divide the top and the bottom of a rational function by the highest power of $x$ in the denominator:`,
        },
        { kind: 'formula', tex: r`\lim_{x\to\infty}\frac{3x^2 + 1}{2x^2 - x} = \lim_{x\to\infty}\frac{3 + 1/x^2}{2 - 1/x} = \frac32` },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Compare the degrees',
          text: r`• Same degree: the limit is the ratio of the leading coefficients.

• Denominator of higher degree: the limit is 0.

• Numerator of higher degree: the function grows without bound.`,
        },
        {
          kind: 'quiz',
          id: 'ca-01-q2',
          prompt: r`What is $\lim_{x\to\infty}\dfrac{5x^3 - x}{2x^3 + 7}$?`,
          options: [
            { id: 'a', label: r`$\tfrac52$`, value: 2.5 },
            { id: 'b', label: r`$-\tfrac17$`, value: -1 / 7, trapExplanation: r`Those terms matter near $x = 0$. At infinity only the leading terms $5x^3$ and $2x^3$ count.` },
            { id: 'c', label: '$0$', value: 0, trapExplanation: r`The limit is 0 only when the denominator has the higher degree. Here both have degree 3.` },
          ],
          correctOptionId: 'a',
          explanation: r`Divide by $x^3$: $\frac{5 - 1/x^2}{2 + 7/x^3} \to \frac52$.`,
        },
      ],
    },
    {
      title: 'Continuity',
      blocks: [
        {
          kind: 'box',
          variant: 'definition',
          title: 'Continuous',
          text: r`$f$ is <i>continuous at $a$</i> if $\lim_{x\to a} f(x) = f(a)$: the limit exists, $f(a)$ exists, and they agree. No holes, no jumps.`,
        },
        {
          kind: 'text',
          text: r`Polynomials, $e^x$, $\sin x$ and $\cos x$ are continuous everywhere; rational functions everywhere except where the denominator is 0. For a function defined piece by piece, check that the pieces meet at the boundary.`,
        },
        {
          kind: 'quiz',
          id: 'ca-01-q3',
          prompt: r`$f(x) = x^2 + 1$ for $x < 2$ and $f(x) = kx - 1$ for $x \ge 2$. For which $k$ is $f$ continuous?`,
          options: [
            { id: 'a', label: '$k = 3$', value: 3 },
            { id: 'b', label: '$k = 4$', value: 4, trapExplanation: r`$k = 4$ makes the slopes match ($2x = 4$ at $x = 2$). Continuity only needs the <i>values</i> to match: $2k - 1 = 5$.` },
            { id: 'c', label: '$k = 2$', value: 2, trapExplanation: r`At $x = 2$ the left piece gives $5$, so $2k - 1 = 5$, i.e. $k = 3$.` },
          ],
          correctOptionId: 'a',
          explanation: r`Left limit: $2^2 + 1 = 5$. Value: $f(2) = 2k - 1$. They agree when $k = 3$.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Why ML cares',
          text: r`Optimisation needs losses that change gradually. ReLU, $\max(0, x)$, is continuous everywhere but has a corner at 0 — continuous is weaker than differentiable, the subject of the next lesson.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $\lim_{x\to a} f(x)$ is about $x$ near $a$, never at $a$.

• Substitute when you can; for $\frac00$, factor and cancel or use a conjugate.

• $\frac{\sin x}{x} \to 1$ as $x \to 0$.

• At infinity, compare degrees: equal degrees give the ratio of leading coefficients.

• Continuous at $a$: $\lim_{x\to a} f(x) = f(a)$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
