import { defineLesson, r } from '../define.ts';
import { extra } from './03-lines.extra.ts';
import { practice } from './03-lines.practice.ts';

export default defineLesson({
  id: 'sm-03',
  moduleId: 'school',
  title: 'Lines and linear systems',
  blurb: 'Linear equations, slopes and two equations in two unknowns',
  minutes: 7,
  lecture: [
    {
      title: 'Linear equations',
      blocks: [
        {
          kind: 'text',
          text: r`To solve a linear equation, do the same thing to both sides until $x$ stands alone: add or subtract to collect the $x$ terms on one side and the numbers on the other, then divide by the coefficient of $x$.

<i>Inequalities</i> follow the same rules with one exception: multiplying or dividing by a <i>negative</i> number flips the sign. From $-2x > 6$ follows $x < -3$ (check: $x = -4$ gives $8 > 6$).`,
        },
        {
          kind: 'example',
          title: 'Collecting terms',
          prompt: r`Solve $3x - 7 = x + 5$.`,
          steps: [
            r`Subtract $x$ from both sides: $2x - 7 = 5$.`,
            r`Add 7 to both sides: $2x = 12$.`,
            r`Divide by 2: $x = 6$. Check: $18 - 7 = 11 = 6 + 5$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'sm-03-q1',
          prompt: r`Solve $5x + 3 = 18$.`,
          options: [
            { id: 'a', label: '$x = 3$', value: 3 },
            { id: 'b', label: r`$x = \tfrac{21}{5}$`, value: 21 / 5, trapExplanation: r`Moving $+3$ to the other side makes it $-3$: $5x = 18 - 3$.` },
            { id: 'c', label: '$x = 15$', value: 15, trapExplanation: r`$5x = 15$ still has to be divided by 5.` },
          ],
          correctOptionId: 'a',
          explanation: r`$5x = 18 - 3 = 15$, so $x = 3$.`,
        },
      ],
    },
    {
      title: 'Lines and slopes',
      blocks: [
        {
          kind: 'text',
          text: r`Every non-vertical line is the graph of $y = mx + c$. The <i>intercept</i> $c$ is where it meets the $y$-axis ($x = 0$). The <i>slope</i> $m$ says how much $y$ changes when $x$ grows by 1; through two points $(x_1, y_1)$ and $(x_2, y_2)$:`,
        },
        {
          kind: 'formula',
          tex: r`m = \frac{\Delta y}{\Delta x} = \frac{y_2 - y_1}{x_2 - x_1}, \qquad c = y_1 - m x_1`,
        },
        {
          kind: 'text',
          text: r`• $m > 0$: the line rises; $m < 0$: it falls; $m = 0$: it is horizontal.

• Parallel lines have equal slopes. Perpendicular lines have slopes with $m_1 m_2 = -1$: the slope $\frac{2}{3}$ turns into $-\frac{3}{2}$.`,
        },
        {
          kind: 'example',
          title: 'The line through two points',
          prompt: r`Find the line through $(1, 2)$ and $(3, 8)$.`,
          steps: [
            r`$m = \frac{8 - 2}{3 - 1} = \frac{6}{2} = 3$.`,
            r`$c = y_1 - m x_1 = 2 - 3\cdot1 = -1$.`,
            r`$y = 3x - 1$. Check the second point: $3\cdot3 - 1 = 8$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'sm-03-q2',
          prompt: r`What is the slope of the line through $(2, 1)$ and $(4, 9)$?`,
          options: [
            { id: 'a', label: '$4$', value: 4 },
            { id: 'b', label: r`$\tfrac14$`, value: 1 / 4, trapExplanation: r`The change in $y$ goes on top: $\frac{\Delta y}{\Delta x} = \frac{8}{2}$.` },
            { id: 'c', label: '$8$', value: 8, trapExplanation: r`8 is the change in $y$; divide it by the change in $x$, 2.` },
          ],
          correctOptionId: 'a',
          explanation: r`$m = \frac{9 - 1}{4 - 2} = \frac{8}{2} = 4$.`,
        },
      ],
    },
    {
      title: 'Two equations, two unknowns',
      blocks: [
        {
          kind: 'text',
          text: r`Each linear equation in $x$ and $y$ is a line; a solution of the system is a point on both lines. Two methods:

• <i>Substitution</i>: solve one equation for one unknown and put the result into the other.

• <i>Elimination</i>: add a multiple of one equation to the other so that one unknown cancels.`,
        },
        {
          kind: 'example',
          title: 'Elimination',
          prompt: r`Solve $2x + y = 7$ and $x - y = 2$.`,
          steps: [
            r`Add the equations: the $y$ terms cancel, $3x = 9$, so $x = 3$.`,
            r`Substitute into the second equation: $3 - y = 2$, so $y = 1$.`,
            r`Check in the first: $2\cdot3 + 1 = 7$. ✓ The lines meet at $(3, 1)$.`,
          ],
        },
        { kind: 'diagram', type: 'lineCases', caption: r`Two lines meet in one point, never meet (parallel), or coincide.` },
      ],
    },
    {
      title: 'No solution or infinitely many',
      blocks: [
        {
          kind: 'text',
          text: r`If elimination removes <i>both</i> unknowns, look at what is left:

• $0 = 5$ (impossible): the lines are parallel, there is <i>no solution</i>.

• $0 = 0$ (always true): the equations describe the same line, there are <i>infinitely many</i> solutions.

For $ax + by = e$, $cx + dy = f$ the test is the number $ad - bc$: if it is not zero there is exactly one solution. This number is the <i>determinant</i>, one of the main characters of the Linear Algebra module.`,
        },
        {
          kind: 'quiz',
          id: 'sm-03-q3',
          prompt: r`How many solutions does the system $x + 2y = 3$, $2x + 4y = 7$ have?`,
          options: [
            { id: 'a', label: 'None', value: 0 },
            { id: 'b', label: 'Exactly one', value: 1, trapExplanation: r`$ad - bc = 1\cdot4 - 2\cdot2 = 0$, so there is not exactly one solution.` },
            { id: 'c', label: 'Infinitely many', value: -1, trapExplanation: r`The left sides are proportional, but the right sides are not: $2\cdot3 = 6 \ne 7$.` },
          ],
          correctOptionId: 'a',
          explanation: r`Twice the first equation says $2x + 4y = 6$, the second says $2x + 4y = 7$. Subtracting gives $0 = 1$: parallel lines, no solution.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Solve by doing the same to both sides; dividing an inequality by a negative number flips it.

• $y = mx + c$: slope $m = \frac{y_2 - y_1}{x_2 - x_1}$, intercept $c$. Parallel: equal slopes; perpendicular: $m_1m_2 = -1$.

• Systems: substitution or elimination; check the answer in both equations.

• $0 = \text{non-zero}$ means no solution, $0 = 0$ infinitely many; $ad - bc \ne 0$ means exactly one.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
