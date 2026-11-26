import { defineLesson, r } from '../define.ts';
import { extra } from './05-gradient.extra.ts';
import { practice } from './05-gradient.practice.ts';

export default defineLesson({
  id: 'ca-05',
  moduleId: 'calculus',
  title: 'Partial derivatives and the gradient',
  blurb: 'Slopes in many directions at once, and the way downhill',
  minutes: 8,
  lecture: [
    {
      title: 'Functions of several variables',
      blocks: [
        {
          kind: 'text',
          text: r`A loss function depends on many parameters at once: $f(x, y)$, or $f(\mathbf{w})$ with $\mathbf{w} \in \mathbb{R}^n$. Its graph is a surface; a map of it uses <i>level curves</i> $f(x, y) = c$, like contour lines on a hiking map.`,
        },
        { kind: 'diagram', type: 'contours', caption: r`Level curves of $f(x, y) = x^2 + 2y^2$. At every point the gradient is perpendicular to the level curve through it and points uphill.` },
      ],
    },
    {
      title: 'Partial derivatives',
      blocks: [
        {
          kind: 'text',
          text: r`The <i>partial derivative</i> $\frac{\partial f}{\partial x}$ (also $f_x$) is the ordinary derivative in $x$ with every other variable held fixed — the slope of the surface walking in the $x$ direction.`,
        },
        {
          kind: 'example',
          title: 'Two partial derivatives',
          prompt: r`Find $f_x$ and $f_y$ for $f(x, y) = x^2y + 3y^2$.`,
          steps: [
            r`For $f_x$, treat $y$ as a constant: $f_x = 2xy$ (the term $3y^2$ is a constant, derivative 0).`,
            r`For $f_y$, treat $x$ as a constant: $f_y = x^2 + 6y$.`,
            r`At $(1, 2)$: $f_x = 4$, $f_y = 13$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-05-q1',
          prompt: r`$f(x, y) = 3x^2 + xy$. What is $f_x(1, 2)$?`,
          options: [
            { id: 'a', label: '$8$', value: 8 },
            { id: 'b', label: '$6$', value: 6, trapExplanation: r`The term $xy$ contributes $y = 2$ to $f_x$: with $y$ fixed, it is a multiple of $x$.` },
            { id: 'c', label: '$1$', value: 1, trapExplanation: r`That is $f_y = x$ at $(1, 2)$, the slope in the $y$ direction.` },
          ],
          correctOptionId: 'a',
          explanation: r`$f_x = 6x + y$, so $f_x(1, 2) = 6 + 2 = 8$.`,
        },
      ],
    },
    {
      title: 'The gradient',
      blocks: [
        { kind: 'formula', tex: r`\nabla f = \Big(\frac{\partial f}{\partial x_1}, \dots, \frac{\partial f}{\partial x_n}\Big)` },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'What the gradient means',
          text: r`• The slope in the direction of a unit vector $\mathbf{u}$ is the <i>directional derivative</i> $D_{\mathbf{u}}f = \nabla f\cdot\mathbf{u}$.

• It is largest when $\mathbf{u}$ points along $\nabla f$: the gradient is the direction of steepest ascent, and $\|\nabla f\|$ is the steepest slope.

• $-\nabla f$ is the direction of steepest descent; $\nabla f$ is perpendicular to the level curves.`,
        },
        {
          kind: 'quiz',
          id: 'ca-05-q2',
          prompt: r`$f(x, y) = x^2 + y^2$. What is the steepest rate of increase of $f$ at $(3, 4)$?`,
          options: [
            { id: 'a', label: '$10$', value: 10 },
            { id: 'b', label: '$14$', value: 14, trapExplanation: r`That adds the components of $\nabla f = (6, 8)$. The steepest rate is its <i>length</i>.` },
            { id: 'c', label: '$5$', value: 5, trapExplanation: r`5 is the distance of $(3, 4)$ from the origin; the gradient is $(6, 8)$, twice as long.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\nabla f = (2x, 2y) = (6, 8)$, and $\|\nabla f\| = \sqrt{36 + 64} = 10$.`,
        },
      ],
    },
    {
      title: 'Gradient descent',
      blocks: [
        {
          kind: 'text',
          text: r`To minimise $f$, take small steps downhill. With learning rate $\eta > 0$:`,
        },
        { kind: 'formula', tex: r`\mathbf{x}_{\text{new}} = \mathbf{x} - \eta\,\nabla f(\mathbf{x})` },
        {
          kind: 'example',
          title: 'One step',
          prompt: r`$f(x, y) = x^2 + 2y^2$, start at $(2, 1)$, $\eta = 0.1$.`,
          steps: [
            r`$\nabla f = (2x, 4y) = (4, 4)$ at $(2, 1)$.`,
            r`$(2, 1) - 0.1\cdot(4, 4) = (1.6, 0.6)$.`,
            r`$f$ dropped from 6 to $2.56 + 0.72 = 3.28$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ca-05-q3',
          prompt: r`$f(x, y) = x^2 + y^2$, $\eta = 0.25$. Where does one gradient-descent step from $(4, -2)$ land?`,
          options: [
            { id: 'a', label: '$(2, -1)$', value: [2, -1] },
            { id: 'b', label: '$(6, -3)$', value: [6, -3], trapExplanation: r`That adds the gradient: a step uphill. Descent subtracts $\eta\nabla f$.` },
            { id: 'c', label: '$(3, -1.5)$', value: [3, -1.5], trapExplanation: r`$\nabla f = (2x, 2y) = (8, -4)$; the factor 2 is missing.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\nabla f(4, -2) = (8, -4)$; $(4, -2) - 0.25\cdot(8, -4) = (2, -1)$.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'In machine learning',
          text: r`The variables are the model's weights and $f$ is the loss on the training data. Too large an $\eta$ overshoots and can diverge; too small an $\eta$ crawls. Computing $\nabla f$ efficiently for millions of weights is the job of backpropagation (next lesson).`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $f_x$: differentiate in $x$, everything else fixed.

• $\nabla f = (f_{x_1}, \dots, f_{x_n})$.

• $D_{\mathbf{u}}f = \nabla f\cdot\mathbf{u}$ for a unit vector $\mathbf{u}$; the maximum is $\|\nabla f\|$, along $\nabla f$.

• $\nabla f$ is perpendicular to level curves.

• Gradient descent: $\mathbf{x} \leftarrow \mathbf{x} - \eta\nabla f(\mathbf{x})$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
