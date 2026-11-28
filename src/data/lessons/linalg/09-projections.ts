import { defineLesson, r } from '../define.ts';
import { extra } from './09-projections.extra.ts';
import { practice } from './09-projections.practice.ts';

export default defineLesson({
  id: 'la-09',
  moduleId: 'linalg',
  title: 'Projections and least squares',
  blurb: 'The closest point, and the best fit to data',
  minutes: 8,
  deeper: [
    { title: 'Projections onto subspaces', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/least-squares-determinants-and-eigenvalues/projections-onto-subspaces/', source: 'MIT OpenCourseWare 18.06SC (Gilbert Strang) · lecture video, notes and problems' },
  ],
  lecture: [
    {
      title: 'Projecting onto a line',
      covers: ['1', 'x1', 'x2'],
      blocks: [
        {
          kind: 'text',
          text: r`The <i>projection</i> of $\mathbf{b}$ onto the line through $\mathbf{a}$ is the point $\mathbf{p}$ of that line closest to $\mathbf{b}$. "Closest" means the error $\mathbf{e} = \mathbf{b} - \mathbf{p}$ is perpendicular to $\mathbf{a}$.`,
        },
        { kind: 'diagram', type: 'projection', caption: r`$\mathbf{p}$ is the shadow of $\mathbf{b}$ on the line through $\mathbf{a}$; the error $\mathbf{e} = \mathbf{b} - \mathbf{p}$ meets the line at a right angle.` },
        {
          kind: 'text',
          text: r`Write $\mathbf{p} = \hat{x}\mathbf{a}$. The condition $\mathbf{a}\cdot(\mathbf{b} - \hat{x}\mathbf{a}) = 0$ gives $\hat{x} = \frac{\mathbf{a}\cdot\mathbf{b}}{\mathbf{a}\cdot\mathbf{a}}$:`,
        },
        { kind: 'formula', tex: r`\mathbf{p} = \frac{\mathbf{a}\cdot\mathbf{b}}{\mathbf{a}\cdot\mathbf{a}}\,\mathbf{a}` },
        {
          kind: 'example',
          title: 'A projection in the plane',
          prompt: r`Project $\mathbf{b} = (3, 1)$ onto the line through $\mathbf{a} = (1, 2)$.`,
          steps: [
            r`$\mathbf{a}\cdot\mathbf{b} = 3 + 2 = 5$ and $\mathbf{a}\cdot\mathbf{a} = 1 + 4 = 5$, so $\hat{x} = 1$.`,
            r`$\mathbf{p} = 1\cdot(1, 2) = (1, 2)$ and $\mathbf{e} = \mathbf{b} - \mathbf{p} = (2, -1)$.`,
            r`Check: $\mathbf{e}\cdot\mathbf{a} = 2 - 2 = 0$. ✓ The distance from $\mathbf{b}$ to the line is $\|\mathbf{e}\| = \sqrt5$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-09-q1',
          prompt: r`Project $\mathbf{b} = (4, 2)$ onto the line through $\mathbf{a} = (1, 1)$.`,
          options: [
            { id: 'a', label: '$(3, 3)$', value: [3, 3] },
            { id: 'b', label: '$(6, 6)$', value: [6, 6], trapExplanation: r`That is $(\mathbf{a}\cdot\mathbf{b})\,\mathbf{a}$: divide by $\mathbf{a}\cdot\mathbf{a} = 2$ as well.` },
            { id: 'c', label: '$(1, -1)$', value: [1, -1], trapExplanation: r`That is the error $\mathbf{e} = \mathbf{b} - \mathbf{p}$, perpendicular to the line.` },
            { id: 'd', label: '$(4, 0)$', value: [4, 0], trapExplanation: r`That is the projection onto the $x$-axis, not onto the line through $(1, 1)$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\hat{x} = \frac{4 + 2}{1 + 1} = 3$, so $\mathbf{p} = (3, 3)$. Check: $\mathbf{e} = (1, -1)$ is perpendicular to $(1, 1)$.`,
        },
      ],
    },
    {
      title: 'Projection matrices',
      covers: ['2', '4', '6', 'x3'],
      blocks: [
        {
          kind: 'text',
          text: r`The map $\mathbf{b} \mapsto \mathbf{p}$ is linear, so it has a matrix. For a line, $\mathbf{p} = \mathbf{a}\frac{\mathbf{a}^T\mathbf{b}}{\mathbf{a}^T\mathbf{a}}$ gives $P = \frac{\mathbf{a}\mathbf{a}^T}{\mathbf{a}^T\mathbf{a}}$. For the column space of a matrix $A$ with independent columns:`,
        },
        { kind: 'formula', tex: r`P = A\,(A^TA)^{-1}A^T` },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Properties of a projection matrix',
          text: r`• $P^2 = P$: projecting twice changes nothing.

• $P^T = P$: it is symmetric.

• Eigenvalues 1 (on the subspace) and 0 (perpendicular to it), so $\operatorname{tr}P$ is the dimension of the subspace.

• $I - P$ projects onto the perpendicular directions: it gives the error $\mathbf{e}$.`,
        },
        {
          kind: 'example',
          title: 'Projecting onto a plane',
          prompt: r`$\mathbf{u}_1 = (1, 1, 0)$ and $\mathbf{u}_2 = (1, -1, 1)$ are orthogonal. Project $\mathbf{b} = (3, 1, 4)$ onto the plane they span.`,
          steps: [
            r`With an <i>orthogonal</i> basis the projection onto the plane is the sum of the projections onto the two lines: $\mathbf{p} = \frac{\mathbf{b}\cdot\mathbf{u}_1}{\mathbf{u}_1\cdot\mathbf{u}_1}\mathbf{u}_1 + \frac{\mathbf{b}\cdot\mathbf{u}_2}{\mathbf{u}_2\cdot\mathbf{u}_2}\mathbf{u}_2$.`,
            r`$\mathbf{b}\cdot\mathbf{u}_1 = 4$ and $\mathbf{u}_1\cdot\mathbf{u}_1 = 2$; $\mathbf{b}\cdot\mathbf{u}_2 = 3 - 1 + 4 = 6$ and $\mathbf{u}_2\cdot\mathbf{u}_2 = 3$.`,
            r`$\mathbf{p} = 2\,(1, 1, 0) + 2\,(1, -1, 1) = (4, 0, 2)$.`,
            r`Check: the error $\mathbf{b} - \mathbf{p} = (-1, 1, 2)$ is perpendicular to both: $-1 + 1 + 0 = 0$ and $-1 - 1 + 2 = 0$. ✓ For a non-orthogonal basis this shortcut fails; use $A(A^TA)^{-1}A^T$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-09-q2',
          prompt: r`$P$ projects onto the line through $\mathbf{a} = (1, 2)$. What is $P\mathbf{b}$ for $\mathbf{b} = (2, -1)$?`,
          options: [
            { id: 'a', label: '$(0, 0)$', value: [0, 0] },
            { id: 'b', label: '$(2, -1)$', value: [2, -1], trapExplanation: r`$P\mathbf{b} = \mathbf{b}$ only for $\mathbf{b}$ already on the line. Here $\mathbf{a}\cdot\mathbf{b} = 0$.` },
            { id: 'c', label: '$(1, 2)$', value: [1, 2], trapExplanation: r`The projection is a multiple of $\mathbf{a}$, but the multiple is $\frac{\mathbf{a}\cdot\mathbf{b}}{\mathbf{a}\cdot\mathbf{a}} = 0$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\mathbf{a}\cdot\mathbf{b} = 2 - 2 = 0$: $\mathbf{b}$ is perpendicular to the line, so its shadow is the origin.`,
        },
      ],
    },
    {
      title: 'Least squares',
      covers: ['3', '5', 'x4', 'x5', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`A system $A\mathbf{x} = \mathbf{b}$ with more equations than unknowns usually has no solution: $\mathbf{b}$ is not in the column space. <i>Least squares</i> picks the $\hat{\mathbf{x}}$ that makes $\|A\mathbf{x} - \mathbf{b}\|^2$ as small as possible. Then $A\hat{\mathbf{x}}$ is the projection of $\mathbf{b}$ onto the column space, so the residual $\mathbf{b} - A\hat{\mathbf{x}}$ is perpendicular to every column: $A^T(\mathbf{b} - A\hat{\mathbf{x}}) = \mathbf{0}$.`,
        },
        { kind: 'formula', tex: r`A^TA\,\hat{\mathbf{x}} = A^T\mathbf{b}`, caption: 'The normal equations' },
        {
          kind: 'example',
          title: 'The best line through three points',
          prompt: r`Fit $y = c + dt$ to the points $(0, 6)$, $(1, 0)$, $(2, 0)$.`,
          steps: [
            r`One equation per point: $A = \begin{pmatrix} 1 & 0 \\ 1 & 1 \\ 1 & 2 \end{pmatrix}$, $\mathbf{b} = (6, 0, 0)$, unknowns $(c, d)$.`,
            r`$A^TA = \begin{pmatrix} 3 & 3 \\ 3 & 5 \end{pmatrix}$ and $A^T\mathbf{b} = (6, 0)$. Solve $3c + 3d = 6$, $3c + 5d = 0$: $d = -3$, $c = 5$.`,
            r`Best line $y = 5 - 3t$. Residuals $\mathbf{e} = (6, 0, 0) - (5, 2, -1) = (1, -2, 1)$: they add up to 0 and $\mathbf{e}\cdot(0, 1, 2) = 0$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-09-q3',
          prompt: r`Fit a constant $y = c$ to the values $2, 3, 7$ by least squares. What is $\hat c$?`,
          options: [
            { id: 'a', label: '$4$', value: 4 },
            { id: 'b', label: '$3$', value: 3, trapExplanation: r`3 is the median. Least squares minimises the sum of <i>squared</i> errors, which gives the mean.` },
            { id: 'c', label: '$12$', value: 12, trapExplanation: r`12 is $A^T\mathbf{b}$. Divide by $A^TA = 3$.` },
            { id: 'd', label: '$4.5$', value: 4.5, trapExplanation: r`4.5 is the midpoint of the smallest and largest values, which ignores the middle one.` },
          ],
          correctOptionId: 'a',
          explanation: r`$A$ is the column $(1, 1, 1)$: $A^TA = 3$, $A^T\mathbf{b} = 12$, so $\hat c = 4$, the mean.`,
        },
      ],
    },
    {
      title: 'Regression is least squares',
      blocks: [
        {
          kind: 'text',
          text: r`In linear regression the columns of $A$ are the features (plus a column of ones for the intercept) and $\mathbf{b}$ holds the targets. The fitted values $A\hat{\mathbf{x}}$ are the projection of the targets onto the span of the features, and $\hat{\mathbf{x}} = (A^TA)^{-1}A^T\mathbf{b}$ is the ordinary least squares (OLS) estimator.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Residuals sum to zero',
          text: r`If the model has an intercept, the column of ones is one of the columns the residual is perpendicular to: $\sum_i e_i = 0$.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Dependent features',
          text: r`If the columns of $A$ are dependent (say, a feature in metres and the same feature in feet), $A^TA$ is singular and $\hat{\mathbf{x}}$ is not unique. Numerical libraries also avoid forming $A^TA$ and use the QR or SVD factorisation instead.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Onto a line: $\mathbf{p} = \frac{\mathbf{a}\cdot\mathbf{b}}{\mathbf{a}\cdot\mathbf{a}}\mathbf{a}$, with error $\mathbf{e} = \mathbf{b} - \mathbf{p} \perp \mathbf{a}$.

• Projection matrices: $P = A(A^TA)^{-1}A^T$, $P^2 = P = P^T$, $\operatorname{tr}P$ = dimension.

• Least squares: solve the normal equations $A^TA\hat{\mathbf{x}} = A^T\mathbf{b}$.

• The residual is perpendicular to every column of $A$.

• Linear regression is exactly this projection.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
