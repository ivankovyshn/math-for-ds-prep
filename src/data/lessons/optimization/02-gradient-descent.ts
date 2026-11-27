import { defineLesson, r } from '../define.ts';
import { extra } from './02-gradient-descent.extra.ts';
import { practice } from './02-gradient-descent.practice.ts';

export default defineLesson({
  id: 'op-02',
  moduleId: 'optimization',
  title: 'Gradient descent',
  blurb: 'Walk downhill in small steps, and choose the step size well',
  minutes: 8,
  lecture: [
    {
      title: 'The update rule',
      blocks: [
        {
          kind: 'text',
          text: r`Most losses cannot be minimised with a formula. Gradient descent starts somewhere and repeatedly steps against the gradient, the direction of steepest descent:`,
        },
        { kind: 'formula', tex: r`x_{k+1} = x_k - \eta\,\nabla f(x_k)` },
        {
          kind: 'text',
          text: r`The <i>learning rate</i> (step size) $\eta > 0$ sets how far each step goes. Near a point, $f(x - \eta\nabla f) \approx f(x) - \eta\lVert\nabla f\rVert^2$, so a small enough step always decreases $f$ unless the gradient is zero.`,
        },
        { kind: 'diagram', type: 'contours', caption: r`$-\nabla f$ points across the level curves, towards lower values. Gradient descent follows it in steps.` },
        {
          kind: 'quiz',
          id: 'op-02-q1',
          prompt: r`$f(x) = x^2$, $x_0 = 3$ and $\eta = 0.1$. What is $x_1$?`,
          options: [
            { id: 'a', label: '$2.4$', value: 2.4 },
            { id: 'b', label: '$3.6$', value: 3.6, trapExplanation: r`That steps <i>along</i> the gradient, uphill. Subtract $\eta f'(x_0)$.` },
            { id: 'c', label: '$2.7$', value: 2.7, trapExplanation: r`$f'(x) = 2x$, so $f'(3) = 6$, not 3.` },
          ],
          correctOptionId: 'a',
          explanation: r`$f'(3) = 6$; $x_1 = 3 - 0.1\cdot6 = 2.4$.`,
        },
      ],
    },
    {
      title: 'Choosing the learning rate',
      blocks: [
        {
          kind: 'text',
          text: r`On the model problem $f(x) = \frac a2 x^2$ (curvature $f'' = a$) the update is $x_{k+1} = x_k - \eta a x_k = (1 - \eta a)\,x_k$. The error is multiplied by $1 - \eta a$ at every step:`,
        },
        {
          kind: 'text',
          text: r`• $0 < \eta < \frac1a$: factor in $(0, 1)$, a smooth slide to the minimum.

• $\eta = \frac1a$: factor 0, the minimum in one step.

• $\frac1a < \eta < \frac2a$: factor in $(-1, 0)$, jumping across the minimum but converging.

• $\eta > \frac2a$: $|1 - \eta a| > 1$, every step overshoots further: divergence.`,
        },
        { kind: 'diagram', type: 'stepSizes', caption: r`Three learning rates on the same parabola: too small crawls, a good one converges quickly, too large bounces outwards.` },
        {
          kind: 'quiz',
          id: 'op-02-q2',
          prompt: r`For $f(x) = 5x^2$, what is the largest learning rate for which gradient descent still converges?`,
          options: [
            { id: 'a', label: '$0.2$', value: 0.2 },
            { id: 'b', label: '$0.4$', value: 0.4, trapExplanation: r`The curvature is $f'' = 10$, not 5: the limit is $\frac{2}{10}$.` },
            { id: 'c', label: '$0.1$', value: 0.1, trapExplanation: r`$\eta = 0.1 = \frac{1}{10}$ is the ideal step (one-step convergence), not the limit.` },
          ],
          correctOptionId: 'a',
          explanation: r`$f'' = 10$; each step multiplies $x$ by $1 - 10\eta$, which needs $|1 - 10\eta| < 1$: $\eta < 0.2$.`,
        },
      ],
    },
    {
      title: 'Many directions: conditioning',
      blocks: [
        {
          kind: 'text',
          text: r`For $f(x) = \frac12 x^\top A x$ with eigenvalues $\lambda_{\min} \le \dots \le \lambda_{\max}$ of $A$, each eigendirection behaves like its own parabola with factor $1 - \eta\lambda_i$. One learning rate must serve all of them:`,
        },
        { kind: 'formula', tex: r`\eta < \frac{2}{\lambda_{\max}}, \qquad \kappa = \frac{\lambda_{\max}}{\lambda_{\min}}` },
        {
          kind: 'text',
          text: r`The steep direction caps $\eta$, and then the flat direction crawls with factor about $1 - \frac{1}{\kappa}$. A large <i>condition number</i> $\kappa$ means long, narrow valleys where gradient descent zigzags across and creeps along. Standardising features in regression is a cheap way to make $\kappa$ smaller.`,
        },
        {
          kind: 'quiz',
          id: 'op-02-q3',
          prompt: r`The Hessian of a quadratic loss has eigenvalues 1 and 50. What is the largest stable learning rate?`,
          options: [
            { id: 'a', label: '$0.04$', value: 0.04 },
            { id: 'b', label: '$2$', value: 2, trapExplanation: r`$\frac{2}{\lambda_{\min}}$ would make the steep direction diverge. The steepest direction sets the limit.` },
            { id: 'c', label: '$0.02$', value: 0.02, trapExplanation: r`$\frac{1}{\lambda_{\max}}$ is safe but not the limit; that is $\frac{2}{\lambda_{\max}}$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\eta < \frac{2}{50} = 0.04$.`,
        },
      ],
    },
    {
      title: 'Gradient descent in practice',
      blocks: [
        {
          kind: 'example',
          title: 'One step in two variables',
          prompt: r`$f(x, y) = x^2 + 3y^2$, start at $(2, 1)$, $\eta = 0.1$.`,
          steps: [
            r`$\nabla f = (2x, 6y) = (4, 6)$ at the start.`,
            r`$(2, 1) - 0.1\cdot(4, 6) = (1.6, 0.4)$.`,
            r`$f$ drops from $4 + 3 = 7$ to $2.56 + 0.48 = 3.04$. The steep $y$-direction shrank by the factor $0.4$, the $x$-direction only by $0.8$.`,
          ],
        },
        {
          kind: 'text',
          text: r`For least squares $L(w) = \lVert Xw - y\rVert^2$ the gradient is $\nabla L = 2X^\top(Xw - y)$: the residuals, sent back through the features. Training stops when $\lVert\nabla f\rVert$ is small, the loss stops improving, or a step budget runs out.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'A loss that goes up',
          text: r`If the training loss grows or turns into NaN, the learning rate is almost always too large for the steepest direction. Halve it and try again.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $x_{k+1} = x_k - \eta\nabla f(x_k)$: step against the gradient.

• On $\frac a2x^2$ the error is multiplied by $1 - \eta a$: converges for $0 < \eta < \frac2a$, fastest at $\eta = \frac1a$.

• In many dimensions $\eta < \frac{2}{\lambda_{\max}}$; a large condition number $\kappa = \frac{\lambda_{\max}}{\lambda_{\min}}$ means slow zigzagging.

• Loss exploding $\Rightarrow$ learning rate too large.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
