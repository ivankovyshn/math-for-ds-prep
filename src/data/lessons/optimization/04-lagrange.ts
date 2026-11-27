import { defineLesson, r } from '../define.ts';
import { extra } from './04-lagrange.extra.ts';
import { practice } from './04-lagrange.practice.ts';

export default defineLesson({
  id: 'op-04',
  moduleId: 'optimization',
  title: 'Lagrange multipliers',
  blurb: 'Optimising under an equality constraint, and what the multiplier is worth',
  minutes: 8,
  lecture: [
    {
      title: 'Optimising on a constraint',
      blocks: [
        {
          kind: 'text',
          text: r`Often the variables must satisfy a constraint: a budget, a fixed total, a unit length. The problem is $\min f(x)$ subject to $g(x) = c$. At the best point you cannot improve $f$ by sliding along the constraint curve, so the level curve of $f$ touches the constraint tangentially. Then their gradients are parallel:`,
        },
        { kind: 'formula', tex: r`\nabla f(x^*) = \lambda\,\nabla g(x^*), \qquad g(x^*) = c` },
        { kind: 'diagram', type: 'lagrange', caption: r`The constraint line touches the smallest reachable level curve of $f$. At the touching point $\nabla f$ and $\nabla g$ point along the same line.` },
        {
          kind: 'quiz',
          id: 'op-04-q1',
          prompt: r`Which point minimises $x^2 + y^2$ subject to $x + y = 2$?`,
          options: [
            { id: 'a', label: '$(1, 1)$', value: [1, 1] },
            { id: 'b', label: '$(2, 0)$', value: [2, 0], trapExplanation: r`It satisfies the constraint, but $f(2, 0) = 4 > f(1, 1) = 2$.` },
            { id: 'c', label: '$(0, 0)$', value: [0, 0], trapExplanation: r`The unconstrained minimum does not satisfy $x + y = 2$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\nabla f = (2x, 2y)$ must be parallel to $\nabla g = (1, 1)$, so $x = y$; with $x + y = 2$ that gives $(1, 1)$.`,
        },
      ],
    },
    {
      title: 'The Lagrangian',
      blocks: [
        {
          kind: 'text',
          text: r`Package the conditions into one function, the <i>Lagrangian</i> $\mathcal L(x, \lambda) = f(x) - \lambda\big(g(x) - c\big)$. Setting all its partial derivatives to zero gives $\nabla f = \lambda\nabla g$ (from the $x$-derivatives) and $g(x) = c$ (from the $\lambda$-derivative): $n + 1$ equations for $n + 1$ unknowns.`,
        },
        {
          kind: 'example',
          title: 'A fence with a fixed length',
          prompt: r`Maximise the area $xy$ of a rectangle with $x + y = 10$.`,
          steps: [
            r`$\mathcal L = xy - \lambda(x + y - 10)$.`,
            r`$\partial_x$: $y = \lambda$; $\partial_y$: $x = \lambda$; so $x = y$.`,
            r`With $x + y = 10$: $x = y = 5$, area 25 and $\lambda = 5$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'op-04-q2',
          prompt: r`What is the largest value of $xy$ subject to $x + y = 8$?`,
          options: [
            { id: 'a', label: '$16$', value: 16 },
            { id: 'b', label: '$64$', value: 64, trapExplanation: r`$8^2$ would need $x = y = 8$, which breaks $x + y = 8$.` },
            { id: 'c', label: '$15$', value: 15, trapExplanation: r`$3\cdot5 = 15$ is feasible but not the best; the optimum splits the sum equally.` },
          ],
          correctOptionId: 'a',
          explanation: r`$x = y = 4$ gives $xy = 16$.`,
        },
      ],
    },
    {
      title: 'What λ means',
      blocks: [
        {
          kind: 'text',
          text: r`The multiplier is not just a helper variable. If $f^*(c)$ is the optimal value for the constraint level $c$, then`,
        },
        { kind: 'formula', tex: r`\frac{d f^*}{d c} = \lambda` },
        {
          kind: 'text',
          text: r`$\lambda$ is the <i>shadow price</i> of the constraint: how much the optimum changes per unit of extra budget. In the fence example $\lambda = 5$: one more metre of fence adds about 5 square metres of area (exactly $5.5^2 - 25 = 5.25$).`,
        },
        {
          kind: 'quiz',
          id: 'op-04-q3',
          prompt: r`A cost minimisation under a budget constraint has multiplier $\lambda = 3$. About how much does the optimal value change if the budget grows by 0.2?`,
          options: [
            { id: 'a', label: '$0.6$', value: 0.6 },
            { id: 'b', label: '$3$', value: 3, trapExplanation: r`$\lambda$ is the rate per unit; multiply by the change 0.2.` },
            { id: 'c', label: '$15$', value: 15, trapExplanation: r`Multiply $\lambda$ by the change, do not divide.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\Delta f^* \approx \lambda\,\Delta c = 3\cdot0.2 = 0.6$.`,
        },
      ],
    },
    {
      title: 'Where it appears in data science',
      blocks: [
        {
          kind: 'text',
          text: r`• <i>PCA</i>: maximise the variance $u^\top\Sigma u$ subject to $u^\top u = 1$. The Lagrange condition $2\Sigma u = 2\lambda u$ says $u$ is an eigenvector, and the variance equals $\lambda$, so the best direction is the top eigenvector.

• <i>Maximum entropy</i>: maximise $-\sum p_i\log p_i$ subject to $\sum p_i = 1$; the answer is the uniform distribution.

• <i>Regularisation</i>: minimising a loss with $\lVert w\rVert^2 \le t$ is equivalent to adding $\lambda\lVert w\rVert^2$ to the loss (ridge regression).`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Candidates, not answers',
          text: r`The Lagrange equations find every point where the gradients are parallel: minima, maxima and saddle points along the constraint. Compare the values of $f$ at all candidates (or use convexity) to pick the one you want.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• At a constrained optimum $\nabla f = \lambda\nabla g$ and $g(x) = c$: level curve and constraint touch.

• Lagrangian $\mathcal L = f - \lambda(g - c)$: set all partial derivatives to zero.

• $\lambda = \frac{df^*}{dc}$, the shadow price of the constraint.

• PCA is a Lagrange problem: the best direction is the top eigenvector of $\Sigma$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
