import { defineLesson, r } from '../define.ts';
import { extra } from './07-jacobian-hessian.extra.ts';
import { practice } from './07-jacobian-hessian.practice.ts';

export default defineLesson({
  id: 'ca-07',
  moduleId: 'calculus',
  title: 'Jacobians and Hessians',
  blurb: 'All first and second derivatives, arranged as matrices',
  minutes: 8,
  lecture: [
    {
      title: 'The Jacobian',
      blocks: [
        {
          kind: 'text',
          text: r`A function $F: \mathbb{R}^n \to \mathbb{R}^m$ has $m$ output components, each with $n$ partial derivatives. They form the $m\times n$ <i>Jacobian</i>: row $i$ is the gradient of $F_i$, column $j$ says how all outputs react to $x_j$.`,
        },
        { kind: 'formula', tex: r`J_F = \begin{pmatrix} \frac{\partial F_1}{\partial x_1} & \cdots & \frac{\partial F_1}{\partial x_n} \\ \vdots & & \vdots \\ \frac{\partial F_m}{\partial x_1} & \cdots & \frac{\partial F_m}{\partial x_n} \end{pmatrix}, \qquad F(\mathbf{x} + \mathbf{h}) \approx F(\mathbf{x}) + J_F\,\mathbf{h}` },
        {
          kind: 'example',
          title: 'A 2×2 Jacobian',
          prompt: r`$F(x, y) = (x^2y,\ 5x + \sin y)$.`,
          steps: [
            r`Row 1, gradient of $x^2y$: $(2xy,\ x^2)$.`,
            r`Row 2, gradient of $5x + \sin y$: $(5,\ \cos y)$.`,
            r`$J_F = \begin{pmatrix} 2xy & x^2 \\ 5 & \cos y \end{pmatrix}$ — the best linear approximation of $F$ near a point.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-07-q1',
          prompt: r`$F(x, y) = (x + y,\ xy)$. What is $J_F(2, 3)$?`,
          options: [
            { id: 'a', label: r`$\begin{pmatrix} 1 & 1 \\ 3 & 2 \end{pmatrix}$`, value: [1, 1, 3, 2] },
            { id: 'b', label: r`$\begin{pmatrix} 1 & 3 \\ 1 & 2 \end{pmatrix}$`, value: [1, 3, 1, 2], trapExplanation: r`That is the transpose. Each <i>row</i> is the gradient of one component.` },
            { id: 'c', label: r`$\begin{pmatrix} 1 & 1 \\ 2 & 3 \end{pmatrix}$`, value: [1, 1, 2, 3], trapExplanation: r`$\frac{\partial(xy)}{\partial x} = y = 3$ and $\frac{\partial(xy)}{\partial y} = x = 2$.` },
          ],
          correctOptionId: 'a',
          explanation: r`Row 1: $\nabla(x + y) = (1, 1)$. Row 2: $\nabla(xy) = (y, x) = (3, 2)$.`,
        },
      ],
    },
    {
      title: 'Chain rule as matrix multiplication',
      blocks: [
        { kind: 'formula', tex: r`J_{F\circ G}(\mathbf{x}) = J_F\big(G(\mathbf{x})\big)\;J_G(\mathbf{x})` },
        {
          kind: 'text',
          text: r`The multivariable chain rule of the previous lesson is exactly this product: summing over paths is what matrix multiplication does. For a linear map $F(\mathbf{x}) = A\mathbf{x}$ the Jacobian is $A$ itself, so composing linear layers multiplies their matrices.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'The Jacobian determinant',
          text: r`For $F: \mathbb{R}^n \to \mathbb{R}^n$, $|\det J_F|$ is the local factor by which $F$ scales areas (volumes). It appears in changes of variables, $dx\,dy = r\,dr\,d\theta$ for polar coordinates, and in normalising flows, which transform probability densities.`,
        },
      ],
    },
    {
      title: 'The Hessian',
      blocks: [
        {
          kind: 'text',
          text: r`For a scalar function $f: \mathbb{R}^n \to \mathbb{R}$, the second derivatives form the $n\times n$ <i>Hessian</i> $H_{ij} = \frac{\partial^2 f}{\partial x_i\,\partial x_j}$ — the Jacobian of the gradient. For smooth $f$ the order of differentiation does not matter (Schwarz), so $H$ is symmetric.`,
        },
        {
          kind: 'example',
          title: 'A Hessian',
          prompt: r`$f(x, y) = x^3 + 2xy^2$.`,
          steps: [
            r`$f_x = 3x^2 + 2y^2$, $f_y = 4xy$.`,
            r`$f_{xx} = 6x$, $f_{xy} = f_{yx} = 4y$, $f_{yy} = 4x$.`,
            r`$H = \begin{pmatrix} 6x & 4y \\ 4y & 4x \end{pmatrix}$.`,
          ],
        },
        {
          kind: 'text',
          text: r`Second-order Taylor in several variables: $f(\mathbf{x} + \mathbf{h}) \approx f(\mathbf{x}) + \nabla f\cdot\mathbf{h} + \frac12\mathbf{h}^TH\mathbf{h}$. For a quadratic $f(\mathbf{x}) = \frac12\mathbf{x}^TA\mathbf{x} - \mathbf{b}^T\mathbf{x}$ with symmetric $A$, the gradient is $A\mathbf{x} - \mathbf{b}$ and $H = A$.`,
        },
        {
          kind: 'quiz',
          id: 'ca-07-q2',
          prompt: r`What is the Hessian of $f(x, y) = x^2 + 3xy + 2y^2$?`,
          options: [
            { id: 'a', label: r`$\begin{pmatrix} 2 & 3 \\ 3 & 4 \end{pmatrix}$`, value: [2, 3, 3, 4] },
            { id: 'b', label: r`$\begin{pmatrix} 1 & 3 \\ 3 & 2 \end{pmatrix}$`, value: [1, 3, 3, 2], trapExplanation: r`Those are the coefficients; $\frac{\partial^2}{\partial x^2}(x^2) = 2$, so the diagonal doubles.` },
            { id: 'c', label: r`$\begin{pmatrix} 2 & 6 \\ 6 & 4 \end{pmatrix}$`, value: [2, 6, 6, 4], trapExplanation: r`$\frac{\partial^2(3xy)}{\partial x\,\partial y} = 3$: the cross term is differentiated once in each variable, with no doubling.` },
          ],
          correctOptionId: 'a',
          explanation: r`$f_{xx} = 2$, $f_{xy} = 3$, $f_{yy} = 4$.`,
        },
      ],
    },
    {
      title: 'The second-derivative test',
      blocks: [
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Classifying a critical point',
          text: r`At a point where $\nabla f = \mathbf{0}$:

• $H$ positive definite (all eigenvalues $> 0$): local minimum.

• $H$ negative definite: local maximum.

• $H$ indefinite: saddle point.

• Otherwise (some eigenvalue 0): the test is inconclusive.

In 2D: $\det H > 0$ and $f_{xx} > 0$ means minimum; $\det H > 0$, $f_{xx} < 0$ maximum; $\det H < 0$ saddle.`,
        },
        {
          kind: 'quiz',
          id: 'ca-07-q3',
          prompt: r`$f(x, y) = x^2 - 4xy + y^2$ has a critical point at the origin. What kind?`,
          options: [
            { id: 'a', label: 'A saddle point' },
            { id: 'b', label: 'A local minimum', trapExplanation: r`$f_{xx} = 2 > 0$ is not enough: $\det H = 2\cdot2 - 16 < 0$. Along $y = x$, $f = -2x^2$ decreases.` },
            { id: 'c', label: 'A local maximum', trapExplanation: r`Along the $x$-axis $f = x^2$ increases, so the origin is not a maximum.` },
          ],
          correctOptionId: 'a',
          explanation: r`$H = \begin{pmatrix} 2 & -4 \\ -4 & 2 \end{pmatrix}$, $\det H = -12 < 0$: eigenvalues of both signs, a saddle.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: "Newton's method and convexity",
          text: r`Newton's method jumps to the minimum of the local quadratic model: $\mathbf{x} \leftarrow \mathbf{x} - H^{-1}\nabla f(\mathbf{x})$. For a quadratic $f$ it lands on the minimum in one step. A function whose Hessian is positive semidefinite everywhere is <i>convex</i> — every critical point is a global minimum, the topic of the Optimization module.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Jacobian of $F: \mathbb{R}^n \to \mathbb{R}^m$: $m\times n$, rows are gradients of the components.

• $J_{F\circ G} = J_F\,J_G$; for $F(\mathbf{x}) = A\mathbf{x}$, $J = A$; $|\det J|$ scales areas.

• Hessian: symmetric matrix of second derivatives; for $\frac12\mathbf{x}^TA\mathbf{x} - \mathbf{b}^T\mathbf{x}$ it is $A$.

• Critical point: positive definite $H$ ⇒ min, negative definite ⇒ max, indefinite ⇒ saddle.

• Newton: $\mathbf{x} \leftarrow \mathbf{x} - H^{-1}\nabla f$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
