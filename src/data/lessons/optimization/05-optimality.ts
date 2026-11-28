import { defineLesson, r } from '../define.ts';
import { extra } from './05-optimality.extra.ts';
import { practice } from './05-optimality.practice.ts';

export default defineLesson({
  id: 'op-05',
  moduleId: 'optimization',
  title: 'Optimality conditions',
  blurb: 'How to recognise a minimum, with and without inequality constraints',
  minutes: 8,
  deeper: [
    { title: 'Convex Optimization, section 5.5: optimality conditions and KKT', url: 'https://web.stanford.edu/~boyd/cvxbook/', source: 'Boyd & Vandenberghe, Convex Optimization · free textbook' },
  ],
  lecture: [
    {
      title: 'Without constraints',
      covers: ['1', '2', 'x1', 'x2', 'x3'],
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
          kind: 'example',
          title: 'A saddle in two variables',
          prompt: r`The origin is a stationary point of $f(x, y) = x^2 + 4xy + y^2$. What kind?`,
          steps: [
            r`Hessian: $H = \begin{pmatrix} 2 & 4 \\ 4 & 2 \end{pmatrix}$.`,
            r`$\det H = 4 - 16 = -12 < 0$: the eigenvalues have opposite signs (they are 6 and $-2$).`,
            r`So the origin is a saddle point: along $y = x$ the function rises ($6x^2$), along $y = -x$ it falls ($-2x^2$).`,
          ],
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
      covers: ['3', 'x4'],
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
      covers: ['4', '5', '6', 'x5', 'x6'],
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
          kind: 'example',
          title: 'Two constraints',
          prompt: r`Minimise $(x - 3)^2 + (y + 2)^2$ subject to $x \ge 0$ and $y \ge 0$.`,
          steps: [
            r`Without constraints the minimum is $(3, -2)$. The constraint $x \ge 0$ holds there; $y \ge 0$ does not.`,
            r`The function is separable, so handle each coordinate alone: $x = 3$ (constraint inactive), and $y$ as close to $-2$ as allowed: $y = 0$ (constraint active).`,
            r`Minimiser $(3, 0)$, value $0 + 4 = 4$.`,
            r`KKT check for $y$, writing the constraint as $h = -y \le 0$: $2(y + 2) + \mu\cdot(-1) = 0$ at $y = 0$ gives $\mu = 4 \ge 0$. ✓ For $x$ the multiplier is 0 (complementary slackness).`,
          ],
        },
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
