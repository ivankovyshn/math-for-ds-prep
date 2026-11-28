import { defineLesson, r } from '../define.ts';
import { extra } from './01-convexity.extra.ts';
import { practice } from './01-convexity.practice.ts';

export default defineLesson({
  id: 'op-01',
  moduleId: 'optimization',
  title: 'Convex sets and functions',
  blurb: 'The shape that makes every local minimum a global one',
  minutes: 7,
  deeper: [
    { title: 'Convex Optimization, chapter 3: convex functions', url: 'https://web.stanford.edu/~boyd/cvxbook/', source: 'Boyd & Vandenberghe, Convex Optimization · free textbook' },
  ],
  lecture: [
    {
      title: 'Convex sets',
      covers: ['x3'],
      blocks: [
        {
          kind: 'box',
          variant: 'definition',
          title: 'Convex set',
          text: r`A set $C$ is convex if the whole segment between any two of its points stays inside: for $x, y \in C$ and $0 \le \lambda \le 1$, also $\lambda x + (1 - \lambda)y \in C$.`,
        },
        {
          kind: 'text',
          text: r`Intervals, half-planes $\{a^\top x \le b\}$, balls $\{\lVert x\rVert \le r\}$ and boxes are convex, and so is any intersection of convex sets. A ring, a union of two separate intervals or the outside of a circle are not: some segment leaves the set.`,
        },
        {
          kind: 'quiz',
          id: 'op-01-q1',
          prompt: r`Which of these subsets of the real line is convex?`,
          options: [
            { id: 'a', label: r`$\{x : |x - 1| \le 3\}$` },
            { id: 'b', label: r`$\{x : |x| \ge 2\}$`, trapExplanation: r`It contains $-2$ and $2$ but not $0$, the midpoint between them.` },
            { id: 'c', label: r`$[0, 1] \cup [2, 3]$`, trapExplanation: r`It contains $1$ and $2$ but not $1.5$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$|x - 1| \le 3$ is the interval $[-2, 4]$, and an interval contains every point between two of its points.`,
        },
      ],
    },
    {
      title: 'Convex functions',
      covers: ['2', 'x1'],
      blocks: [
        {
          kind: 'box',
          variant: 'definition',
          title: 'Convex function',
          text: r`$f$ is convex if every chord lies on or above the graph: $f(\lambda x + (1 - \lambda)y) \le \lambda f(x) + (1 - \lambda)f(y)$ for all $x, y$ and $0 \le \lambda \le 1$. It is <i>concave</i> if $-f$ is convex.`,
        },
        { kind: 'diagram', type: 'convexity', caption: r`Left: a convex function, every chord above the graph. Right: a non-convex one, where a chord dips below and two separate valleys appear.` },
        {
          kind: 'text',
          text: r`For twice differentiable functions there is a practical test: $f$ is convex exactly when $f''(x) \ge 0$ everywhere. In several variables the condition is that the Hessian is positive semidefinite at every point. So $x^2$, $e^x$ and $|x|$ are convex; $-x^2$ is concave; $x^3$ and $\sin x$ are neither.`,
        },
        {
          kind: 'quiz',
          id: 'op-01-q2',
          prompt: r`On which interval is $f(x) = x^3$ convex?`,
          options: [
            { id: 'a', label: r`$[0, \infty)$` },
            { id: 'b', label: r`$(-\infty, 0]$`, trapExplanation: r`There $f''(x) = 6x \le 0$: the function is concave.` },
            { id: 'c', label: r`$(-\infty, \infty)$`, trapExplanation: r`$f''(x) = 6x$ is negative for $x < 0$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$f''(x) = 6x \ge 0$ exactly for $x \ge 0$.`,
        },
      ],
    },
    {
      title: 'Why convexity matters',
      covers: ['1', '5', 'x2', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`A differentiable convex function lies above each of its tangent lines:`,
        },
        { kind: 'formula', tex: r`f(y) \ge f(x) + f'(x)(y - x) \qquad \text{(in many variables: } f(y) \ge f(x) + \nabla f(x)^\top(y - x))` },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Local is global',
          text: r`For a convex function every local minimum is a global minimum, and a point with $\nabla f(x) = 0$ is a global minimiser. There are no traps for a descent method to get stuck in.`,
        },
        {
          kind: 'text',
          text: r`The losses of linear regression (squared error) and logistic regression (cross-entropy) are convex in the weights, so gradient descent finds the best weights. The loss of a neural network is not convex, which is why its training depends on initialisation and luck.`,
        },
        {
          kind: 'quiz',
          id: 'op-01-q3',
          prompt: r`For $f(x) = x^2$, how far does the chord between $x = 0$ and $x = 4$ lie above the graph at the midpoint $x = 2$?`,
          options: [
            { id: 'a', label: '$4$', value: 4 },
            { id: 'b', label: '$8$', value: 8, trapExplanation: r`8 is the height of the chord, $\frac{0 + 16}{2}$. The graph is at $f(2) = 4$; the gap is the difference.` },
            { id: 'c', label: '$0$', value: 0, trapExplanation: r`A chord touches the graph only at its ends unless $f$ is linear there.` },
          ],
          correctOptionId: 'a',
          explanation: r`Chord: $\frac{f(0) + f(4)}{2} = 8$; graph: $f(2) = 4$; gap $8 - 4 = 4$.`,
        },
      ],
    },
    {
      title: 'Building convex functions',
      covers: ['3', '4', '6', 'x5', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`Convexity survives the operations used to build losses:

• Sums with non-negative weights: $\alpha f + \beta g$ with $\alpha, \beta \ge 0$.

• Maximum: $\max(f, g)$; for example $|x| = \max(x, -x)$ and the hinge loss $\max(0, 1 - t)$.

• Composition with a linear map: $f(Ax + b)$; for example $\lVert Ax - b\rVert^2$.

Differences, products and minima of convex functions are in general <i>not</i> convex.`,
        },
        {
          kind: 'example',
          title: 'A quadratic in two variables',
          prompt: r`For which $b$ is $f(x, y) = x^2 + bxy + y^2$ convex?`,
          steps: [
            r`The Hessian is constant: $H = \begin{pmatrix} 2 & b \\ b & 2 \end{pmatrix}$.`,
            r`It is positive semidefinite when the diagonal is non-negative and $\det H = 4 - b^2 \ge 0$.`,
            r`So $f$ is convex exactly for $|b| \le 2$; for $|b| > 2$ the origin is a saddle.`,
          ],
        },
        {
          kind: 'example',
          title: 'Recognising convex functions',
          prompt: r`Which of $e^{-x} + x^2$, $\sqrt{x^2 + 1}$ and $\sin x$ are convex on $\mathbb{R}$? And what is the minimum of $\max(-2x + 4,\ x + 1)$?`,
          steps: [
            r`$e^{-x}$ and $x^2$ are convex, and a sum of convex functions is convex.`,
            r`$\sqrt{x^2 + 1}$ is the length of the vector $(x, 1)$: a norm of an affine map, hence convex. Directly: $f''(x) = (x^2 + 1)^{-3/2} > 0$.`,
            r`$\sin x$ has $f''(x) = -\sin x$, which changes sign: not convex.`,
            r`A maximum of convex functions is convex. Here one line falls and the other rises, so the minimum is where they cross: $-2x + 4 = x + 1$ gives $x = 1$ and the value 2.`,
          ],
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Convex set: contains every segment between its points.

• Convex function: chords above the graph; equivalently $f'' \ge 0$, or a positive semidefinite Hessian.

• Convex $\Rightarrow$ tangents lie below the graph, and every local minimum is global.

• Non-negative sums, maxima and linear substitutions keep convexity; differences and products need not.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
