import { defineLesson, r } from '../define.ts';
import { extra } from './05-optimality.extra.ts';
import { practice } from './05-optimality.practice.ts';

export default defineLesson({
  id: 'op-05',
  moduleId: 'optimization',
  title: 'Optimality conditions',
  blurb: 'How to recognise a minimum, with and without inequality constraints',
  minutes: 8,
  lecture: [
    {
      title: 'Without constraints',
      blocks: [
        {
          kind: 'text',
          text: r`At an interior minimum of a differentiable $f$ the ground is flat: $\nabla f(x^*) = 0$. This <i>first-order condition</i> is necessary but not sufficient, since maxima and saddle points are flat too. The Hessian decides (second-order conditions):`,
        },
        {
          kind: 'text',
          text: r`• $\nabla f = 0$ and $H$ positive definite: strict local minimum.

• $\nabla f = 0$ and $H$ negative definite: strict local maximum.

• $\nabla f = 0$ and $H$ indefinite: saddle point.

• $H$ only semidefinite: the test is inconclusive ($x^4$ and $-x^4$ both have $f'' = 0$ at 0).`,
        },
        {
          kind: 'quiz',
          id: 'op-05-q1',
          prompt: r`$f(x) = x^3 - 3x$ has stationary points at $x = \pm1$. Which one is a local minimum?`,
          options: [
            { id: 'a', label: '$x = 1$', value: 1 },
            { id: 'b', label: '$x = -1$', value: -1, trapExplanation: r`$f''(-1) = -6 < 0$: that is a local maximum.` },
            { id: 'c', label: '$x = 0$', value: 0, trapExplanation: r`$f'(0) = -3 \ne 0$: not a stationary point at all.` },
          ],
          correctOptionId: 'a',
          explanation: r`$f''(x) = 6x$; $f''(1) = 6 > 0$, a minimum.`,
        },
      ],
    },
    {
      title: 'Convex problems',
      blocks: [
        {
          kind: 'text',
          text: r`For a convex $f$ the first-order condition is also sufficient: any point with $\nabla f = 0$ is a global minimum. The most important case is a quadratic with a positive definite matrix $A$:`,
        },
        { kind: 'formula', tex: r`f(x) = \tfrac12 x^\top A x - b^\top x, \qquad \nabla f = Ax - b = 0 \;\Longrightarrow\; x^* = A^{-1}b` },
        {
          kind: 'text',
          text: r`Least squares is exactly this with $A = X^\top X$ and $b = X^\top y$: the normal equations are the first-order condition.`,
        },
        {
          kind: 'quiz',
          id: 'op-05-q2',
          prompt: r`Minimise $f(x) = \tfrac12 x^\top Ax - b^\top x$ for $A = \operatorname{diag}(2, 4)$ and $b = (4, 8)$.`,
          options: [
            { id: 'a', label: '$(2, 2)$', value: [2, 2] },
            { id: 'b', label: '$(8, 32)$', value: [8, 32], trapExplanation: r`That is $Ab$; the minimiser solves $Ax = b$, i.e. $A^{-1}b$.` },
            { id: 'c', label: '$(-2, -2)$', value: [-2, -2], trapExplanation: r`$\nabla f = Ax - b$, so $Ax = +b$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$x^* = A^{-1}b = (\frac42, \frac84) = (2, 2)$.`,
        },
      ],
    },
    {
      title: 'Inequality constraints: KKT',
      blocks: [
        {
          kind: 'text',
          text: r`Now minimise $f(x)$ subject to $h(x) \le 0$. Either the optimum is inside the feasible region, where $\nabla f = 0$ as usual (the constraint is <i>inactive</i>), or it sits on the boundary $h(x) = 0$ and $f$ wants to leave the region (<i>active</i>). The Karush–Kuhn–Tucker conditions cover both cases:`,
        },
        { kind: 'formula', tex: r`\nabla f + \mu\nabla h = 0,\quad h(x) \le 0,\quad \mu \ge 0,\quad \mu\,h(x) = 0` },
        {
          kind: 'text',
          text: r`The last condition, <i>complementary slackness</i>, says that $\mu = 0$ for an inactive constraint, and $\mu > 0$ is possible only on the boundary. As with Lagrange, $\mu$ measures how much the optimum would improve if the constraint were loosened.`,
        },
        { kind: 'diagram', type: 'kkt', caption: r`Minimise $(x - 3)^2$ subject to $x \le 1$. The free minimum at 3 is infeasible, so the optimum is on the boundary $x^* = 1$, with $\mu = -f'(1) = 4 > 0$.` },
        {
          kind: 'quiz',
          id: 'op-05-q3',
          prompt: r`What is the minimiser of $(x - 2)^2$ subject to $x \le 5$?`,
          options: [
            { id: 'a', label: '$2$', value: 2 },
            { id: 'b', label: '$5$', value: 5, trapExplanation: r`The free minimum $x = 2$ already satisfies $x \le 5$; the constraint is inactive.` },
            { id: 'c', label: '$3.5$', value: 3.5, trapExplanation: r`Nothing pulls the optimum towards the boundary; $f$ is smallest at 2.` },
          ],
          correctOptionId: 'a',
          explanation: r`The unconstrained minimiser 2 is feasible, so $x^* = 2$ and $\mu = 0$.`,
        },
      ],
    },
    {
      title: 'Where it shows up',
      blocks: [
        {
          kind: 'text',
          text: r`• <i>Support vector machines</i> maximise the margin subject to every point being classified with margin at least 1. The training points with active constraints ($\mu_i > 0$) are the <i>support vectors</i>; all other points could be removed without changing the classifier.

• <i>Non-negativity</i>: probabilities, counts and many physical quantities must be $\ge 0$. With box constraints the solution is often simply the unconstrained answer clipped to the box.

• <i>Saddle points</i>: in high dimensions a random stationary point is far more likely to be a saddle (some eigenvalues negative) than a minimum, which is why plain "$\nabla f = 0$" is never the whole story when training networks.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Check the conditions you need',
          text: r`A zero gradient is not a minimum without a second-order or convexity argument, and a KKT point needs $\mu \ge 0$: a negative multiplier means moving into the feasible region would still lower $f$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Unconstrained: $\nabla f = 0$; Hessian positive definite $\Rightarrow$ minimum, negative definite $\Rightarrow$ maximum, indefinite $\Rightarrow$ saddle.

• Convex: $\nabla f = 0$ is enough; for $\frac12x^\top Ax - b^\top x$ the minimiser is $A^{-1}b$.

• KKT: $\nabla f + \mu\nabla h = 0$, $\mu \ge 0$, $\mu h = 0$: either the constraint is inactive ($\mu = 0$) or the optimum is on the boundary.

• In 1D with $x \le b$: the answer is the free minimiser clipped to the feasible side.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
