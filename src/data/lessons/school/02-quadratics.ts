import { defineLesson, r } from '../define.ts';
import { extra } from './02-quadratics.extra.ts';
import { practice } from './02-quadratics.practice.ts';

export default defineLesson({
  id: 'sm-02',
  moduleId: 'school',
  title: 'Quadratic equations',
  blurb: 'Factoring, the formula, the discriminant and the parabola',
  minutes: 8,
  lecture: [
    {
      title: 'Solving by factoring',
      covers: ['1', 'x1', 'x3', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`A quadratic equation has the form $ax^2 + bx + c = 0$ with $a \ne 0$. The key fact is the <i>zero-product rule</i>: if $A\cdot B = 0$, then $A = 0$ or $B = 0$. So once the left side is written as a product of two brackets, each bracket gives one solution (a <i>root</i>).

For $x^2 + bx + c$ look for two numbers whose <i>product is $c$</i> and whose <i>sum is $b$</i>: then $x^2 + bx + c = (x + p)(x + q)$.`,
        },
        {
          kind: 'example',
          title: 'Two numbers with a given sum and product',
          prompt: r`Solve $x^2 - 5x + 6 = 0$.`,
          steps: [
            r`We need $p\cdot q = 6$ and $p + q = -5$: the pair $-2$ and $-3$ works.`,
            r`So $x^2 - 5x + 6 = (x - 2)(x - 3)$.`,
            r`$x - 2 = 0$ or $x - 3 = 0$: the roots are $x = 2$ and $x = 3$. Check: $4 - 10 + 6 = 0$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'sm-02-q1',
          prompt: r`What are the solutions of $x^2 - 7x + 12 = 0$?`,
          options: [
            { id: 'a', label: r`$x = 3$ or $x = 4$`, value: [3, 4] },
            { id: 'b', label: r`$x = -4$ or $x = -3$`, value: [-4, -3], trapExplanation: r`$(x - 3)(x - 4) = 0$ gives $x = 3$ and $x = 4$: the root has the opposite sign to the number in the bracket.` },
            { id: 'c', label: r`$x = 2$ or $x = 6$`, value: [2, 6], trapExplanation: r`$2\cdot6 = 12$, but $2 + 6 = 8$, not 7.` },
          ],
          correctOptionId: 'a',
          explanation: r`$3\cdot4 = 12$ and $3 + 4 = 7$, so $x^2 - 7x + 12 = (x - 3)(x - 4)$.`,
        },
      ],
    },
    {
      title: 'The quadratic formula',
      covers: ['3'],
      blocks: [
        {
          kind: 'text',
          text: r`When no nice pair of numbers exists, the formula always works. It comes from completing the square and uses the <i>discriminant</i> $D = b^2 - 4ac$:`,
        },
        {
          kind: 'formula',
          tex: r`ax^2 + bx + c = 0 \quad\Longrightarrow\quad x = \frac{-b \pm \sqrt{D}}{2a}, \qquad D = b^2 - 4ac`,
        },
        {
          kind: 'example',
          title: 'A leading coefficient other than 1',
          prompt: r`Solve $2x^2 + 3x - 2 = 0$.`,
          steps: [
            r`$a = 2$, $b = 3$, $c = -2$: $D = 3^2 - 4\cdot2\cdot(-2) = 9 + 16 = 25$, so $\sqrt D = 5$.`,
            r`$x = \frac{-3 \pm 5}{2\cdot2} = \frac{-3 \pm 5}{4}$.`,
            r`$x = \frac{2}{4} = \frac12$ or $x = \frac{-8}{4} = -2$. The denominator is $2a = 4$, not 2.`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Signs inside the formula',
          text: r`With $c$ negative, $-4ac$ becomes positive: $-4\cdot2\cdot(-2) = +16$. Write the numbers into the formula with brackets and most sign slips disappear.`,
        },
      ],
    },
    {
      title: 'The discriminant',
      covers: ['2', '5', 'x2'],
      blocks: [
        {
          kind: 'text',
          text: r`The sign of $D$ tells you how many real roots there are before you compute them:

• $D > 0$: two different real roots.

• $D = 0$: one (double) root $x = -\frac{b}{2a}$.

• $D < 0$: no real root, because $\sqrt{D}$ is not a real number. With the complex number $i$, $i^2 = -1$ (lesson "Complex numbers"), there are two complex roots: $x = \frac{-b}{2a} \pm \frac{\sqrt{-D}}{2a}\,i$.`,
        },
        {
          kind: 'example',
          title: 'A negative discriminant',
          prompt: r`Solve $x^2 + 2x + 5 = 0$.`,
          steps: [
            r`$D = 4 - 20 = -16 < 0$: no real roots.`,
            r`$\sqrt{-D} = 4$, so $x = \frac{-2 \pm 4i}{2}$.`,
            r`$x = -1 \pm 2i$. Check: $(-1 + 2i)^2 + 2(-1 + 2i) + 5 = (-3 - 4i) + (-2 + 4i) + 5 = 0$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'sm-02-q2',
          prompt: r`How many real solutions does $x^2 + 4x + 4 = 0$ have?`,
          options: [
            { id: 'a', label: 'Exactly one', value: 1 },
            { id: 'b', label: 'Two', value: 2, trapExplanation: r`$D = 16 - 16 = 0$: the two roots of the formula coincide. Indeed $x^2 + 4x + 4 = (x + 2)^2$.` },
            { id: 'c', label: 'None', value: 0, trapExplanation: r`No real roots needs $D < 0$; here $D = 0$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$D = 4^2 - 4\cdot1\cdot4 = 0$, so there is one double root, $x = -2$.`,
        },
      ],
    },
    {
      title: 'The parabola',
      covers: ['4', '6', 'x5', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`The graph of $y = ax^2 + bx + c$ is a parabola. It opens upwards if $a > 0$ and downwards if $a < 0$. The roots are where it crosses the $x$-axis, and halfway between them (on the axis of symmetry) sits the <i>vertex</i>, the lowest or highest point:`,
        },
        {
          kind: 'formula',
          tex: r`x_{\text{vertex}} = -\frac{b}{2a}, \qquad x_1 + x_2 = -\frac{b}{a}, \qquad x_1x_2 = \frac{c}{a}`,
          caption: r`The last two are Vieta's formulas: the roots' sum and product, read off without solving.`,
        },
        { kind: 'diagram', type: 'parabola' },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Where this comes back',
          text: r`Minimising a quadratic is the simplest optimisation problem: the minimum of $x^2 - 6x + 1$ is at $x = 3$. And the eigenvalues of a $2\times2$ matrix are the roots of $\lambda^2 - (\text{trace})\lambda + \det = 0$: by Vieta, they add up to the trace and multiply to the determinant.`,
        },
        {
          kind: 'example',
          title: 'Vieta without solving',
          prompt: r`The roots of $x^2 - 5x + 3 = 0$ are $x_1$ and $x_2$. Find $x_1 + x_2$, $x_1x_2$ and $x_1^2 + x_2^2$ without computing the roots.`,
          steps: [
            r`Here $a = 1$, $b = -5$, $c = 3$: $x_1 + x_2 = -\frac ba = 5$ and $x_1x_2 = \frac ca = 3$.`,
            r`Square the sum: $(x_1 + x_2)^2 = x_1^2 + 2x_1x_2 + x_2^2$.`,
            r`So $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2 = 25 - 6 = 19$.`,
            r`The roots themselves, $\frac{5 \pm \sqrt{13}}{2}$, were never needed.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'sm-02-q3',
          prompt: r`What is the smallest value of $f(x) = x^2 - 6x + 1$?`,
          options: [
            { id: 'a', label: '$-8$', value: -8 },
            { id: 'b', label: '$3$', value: 3, trapExplanation: r`3 is <i>where</i> the minimum is (the vertex $x = -\frac{b}{2a}$). The minimum value is $f(3)$.` },
            { id: 'c', label: '$1$', value: 1, trapExplanation: r`$f(0) = 1$, but the parabola goes lower: $f(3) = 9 - 18 + 1 = -8$.` },
          ],
          correctOptionId: 'a',
          explanation: r`The vertex is at $x = \frac{6}{2} = 3$, and $f(3) = 9 - 18 + 1 = -8$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Factor when you can: $x^2 + bx + c = (x + p)(x + q)$ with $pq = c$, $p + q = b$; then each bracket gives a root.

• Otherwise $x = \frac{-b \pm \sqrt{D}}{2a}$ with $D = b^2 - 4ac$; mind the $2a$ and the signs.

• $D > 0$: two roots; $D = 0$: one; $D < 0$: none real, two complex $\frac{-b}{2a} \pm \frac{\sqrt{-D}}{2a}i$.

• The vertex is at $x = -\frac{b}{2a}$; Vieta: $x_1 + x_2 = -\frac ba$, $x_1x_2 = \frac ca$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
