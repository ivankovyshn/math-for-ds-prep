import { defineLesson, r } from '../define.ts';
import { extra } from './10-spectral.extra.ts';
import { practice } from './10-spectral.practice.ts';

export default defineLesson({
  id: 'la-10',
  moduleId: 'linalg',
  title: 'Spectral decomposition',
  blurb: 'Symmetric matrices: perpendicular axes and real stretches',
  minutes: 8,
  deeper: [
    { title: 'Symmetric matrices and positive definiteness', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/positive-definite-matrices-and-applications/symmetric-matrices-and-positive-definiteness/', source: 'MIT OpenCourseWare 18.06SC (Gilbert Strang) · lecture video, notes and problems' },
  ],
  lecture: [
    {
      title: 'Symmetric matrices',
      covers: ['2', 'x1', 'x3'],
      blocks: [
        {
          kind: 'text',
          text: r`A matrix is <i>symmetric</i> if $A = A^T$: the entry in row $i$, column $j$ equals the one in row $j$, column $i$. Symmetric matrices are everywhere in data science: covariance matrices, $A^TA$, Hessians of smooth functions, kernel matrices.`,
        },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Spectral theorem',
          text: r`Every real symmetric $n\times n$ matrix $A$ has $n$ real eigenvalues and an orthonormal basis of eigenvectors $\mathbf{q}_1, \dots, \mathbf{q}_n$. In matrix form:

$A = Q\Lambda Q^T$, with $Q$ orthogonal (columns $\mathbf{q}_i$) and $\Lambda = \operatorname{diag}(\lambda_1, \dots, \lambda_n)$.`,
        },
        {
          kind: 'example',
          title: 'A 2×2 example',
          prompt: r`Decompose $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$.`,
          steps: [
            r`$\operatorname{tr}A = 4$, $\det A = 3$: eigenvalues $3$ and $1$.`,
            r`$\lambda = 3$: $(1, 1)$; $\lambda = 1$: $(1, -1)$. They are perpendicular, as the theorem promises.`,
            r`Normalise: $Q = \tfrac{1}{\sqrt2}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$, $\Lambda = \begin{pmatrix} 3 & 0 \\ 0 & 1 \end{pmatrix}$, and $A = Q\Lambda Q^T$.`,
          ],
        },
        {
          kind: 'text',
          text: r`Why perpendicular? If $A\mathbf{v} = \lambda\mathbf{v}$ and $A\mathbf{w} = \mu\mathbf{w}$ with $\lambda \ne \mu$, then $\lambda\,\mathbf{v}\cdot\mathbf{w} = (A\mathbf{v})\cdot\mathbf{w} = \mathbf{v}\cdot(A\mathbf{w}) = \mu\,\mathbf{v}\cdot\mathbf{w}$. The middle step uses $A = A^T$. So $\mathbf{v}\cdot\mathbf{w} = 0$.`,
        },
        {
          kind: 'quiz',
          id: 'la-10-q1',
          prompt: r`$A = \begin{pmatrix} 5 & 2 \\ 2 & 2 \end{pmatrix}$ has the eigenvector $(2, 1)$ with $\lambda = 6$. Which vector is an eigenvector for its other eigenvalue?`,
          options: [
            { id: 'a', label: '$(-1, 2)$' },
            { id: 'b', label: '$(1, 2)$', trapExplanation: r`$(1, 2)\cdot(2, 1) = 4 \ne 0$. For a symmetric matrix the other eigenvector is perpendicular to $(2, 1)$.` },
            { id: 'c', label: '$(2, -1)$', trapExplanation: r`$(2, -1)\cdot(2, 1) = 3 \ne 0$, and $A(2, -1) = (8, 2)$ is not a multiple of $(2, -1)$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$A(-1, 2) = (-1, 2)$, so it is an eigenvector with $\lambda = 1$, perpendicular to $(2, 1)$. Check: $6 + 1 = 7 = \operatorname{tr}A$.`,
        },
      ],
    },
    {
      title: 'A sum of rank-one pieces',
      covers: ['4', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`Multiplying out $Q\Lambda Q^T$ column by column writes $A$ as a weighted sum of projections:`,
        },
        { kind: 'formula', tex: r`A = \lambda_1\mathbf{q}_1\mathbf{q}_1^T + \lambda_2\mathbf{q}_2\mathbf{q}_2^T + \dots + \lambda_n\mathbf{q}_n\mathbf{q}_n^T` },
        {
          kind: 'text',
          text: r`Each $\mathbf{q}_i\mathbf{q}_i^T$ is the projection onto the line through $\mathbf{q}_i$ (previous lesson). So a symmetric matrix splits a vector into its components along the eigenvectors and stretches each one by its $\lambda_i$.`,
        },
        { kind: 'diagram', type: 'spectral', caption: r`$A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$ turns the unit circle into an ellipse whose axes are the eigenvectors, stretched by $\lambda_1 = 3$ and $\lambda_2 = 1$.` },
        {
          kind: 'quiz',
          id: 'la-10-q2',
          prompt: r`A symmetric matrix has $\lambda_1 = 4$ with $\mathbf{q}_1 = \tfrac{1}{\sqrt2}(1, 1)$ and $\lambda_2 = 0$ with $\mathbf{q}_2 = \tfrac{1}{\sqrt2}(1, -1)$. What is $A$?`,
          options: [
            { id: 'a', label: r`$\begin{pmatrix} 2 & 2 \\ 2 & 2 \end{pmatrix}$`, value: [2, 2, 2, 2] },
            { id: 'b', label: r`$\begin{pmatrix} 4 & 0 \\ 0 & 0 \end{pmatrix}$`, value: [4, 0, 0, 0], trapExplanation: r`That is $\Lambda$ alone. It equals $A$ only when the eigenvectors are the coordinate axes.` },
            { id: 'c', label: r`$\begin{pmatrix} 4 & 4 \\ 4 & 4 \end{pmatrix}$`, value: [4, 4, 4, 4], trapExplanation: r`$\mathbf{q}_1\mathbf{q}_1^T$ carries the factor $\tfrac12$ from the normalisation: $4 \cdot \tfrac12\begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix}$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$A = 4\cdot\tfrac12\begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix} + 0 = \begin{pmatrix} 2 & 2 \\ 2 & 2 \end{pmatrix}$. Check: $A(1, 1) = (4, 4)$ and $A(1, -1) = (0, 0)$.`,
        },
      ],
    },
    {
      title: 'Quadratic forms and definiteness',
      covers: ['1', '3', '6', 'x2', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`For a symmetric $A$ the number $\mathbf{x}^TA\mathbf{x}$ is a <i>quadratic form</i>. For $A = \begin{pmatrix} a & b \\ b & d \end{pmatrix}$ it is $ax_1^2 + 2bx_1x_2 + dx_2^2$. In the eigenvector coordinates $\mathbf{y} = Q^T\mathbf{x}$ the cross term disappears: $\mathbf{x}^TA\mathbf{x} = \lambda_1y_1^2 + \dots + \lambda_ny_n^2$. So the signs of the eigenvalues decide the shape.`,
        },
        {
          kind: 'box',
          variant: 'definition',
          title: 'Definiteness',
          text: r`• <i>Positive definite</i>: $\mathbf{x}^TA\mathbf{x} > 0$ for all $\mathbf{x} \ne \mathbf{0}$ ⇔ all $\lambda_i > 0$.

• <i>Positive semidefinite</i>: $\mathbf{x}^TA\mathbf{x} \ge 0$ ⇔ all $\lambda_i \ge 0$.

• <i>Negative definite</i>: all $\lambda_i < 0$. <i>Indefinite</i>: eigenvalues of both signs.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'The 2×2 test',
          text: r`$\begin{pmatrix} a & b \\ b & d \end{pmatrix}$ is positive definite exactly when $a > 0$ and $ad - b^2 > 0$: the determinant is the product of the eigenvalues, and $a > 0$ rules out both being negative.`,
        },
        {
          kind: 'text',
          text: r`Covariance matrices are always positive semidefinite, since a variance is never negative. A point where the gradient vanishes and the Hessian is positive definite is a strict local minimum — the basis of second-order checks in optimisation.`,
        },
        {
          kind: 'example',
          title: 'Evaluating a quadratic form',
          prompt: r`Compute $\mathbf{x}^TA\mathbf{x}$ for $A = \begin{pmatrix} 3 & 1 \\ 1 & -2 \end{pmatrix}$ and $\mathbf{x} = (1, 2)$. What does the result say?`,
          steps: [
            r`$A\mathbf{x} = (3 + 2,\ 1 - 4) = (5, -3)$.`,
            r`$\mathbf{x}^TA\mathbf{x} = (1, 2)\cdot(5, -3) = 5 - 6 = -1$.`,
            r`Same with the formula: $3\cdot1^2 + 2\cdot1\cdot1\cdot2 - 2\cdot2^2 = 3 + 4 - 8 = -1$.`,
            r`A negative value for some $\mathbf{x}$ means $A$ is not positive definite.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-10-q3',
          prompt: r`Is $\begin{pmatrix} 1 & 2 \\ 2 & 1 \end{pmatrix}$ positive definite?`,
          options: [
            { id: 'a', label: 'No, it is indefinite' },
            { id: 'b', label: 'Yes, all its entries are positive', trapExplanation: r`Positive entries are not enough: $\mathbf{x} = (1, -1)$ gives $1 - 4 + 1 = -2 < 0$.` },
            { id: 'c', label: 'Yes, its diagonal is positive', trapExplanation: r`The diagonal test is only half of it: $ad - b^2 = 1 - 4 = -3 < 0$.` },
          ],
          correctOptionId: 'a',
          explanation: r`The eigenvalues are 3 and $-1$, one of each sign: the matrix is indefinite.`,
        },
      ],
    },
    {
      title: 'Functions of a symmetric matrix',
      covers: ['5', 'x6'],
      blocks: [
        { kind: 'formula', tex: r`A^k = Q\Lambda^kQ^T, \qquad A^{-1} = Q\Lambda^{-1}Q^T` },
        {
          kind: 'text',
          text: r`Same eigenvectors, eigenvalues $\lambda_i^k$ and $1/\lambda_i$. A positive semidefinite matrix even has a square root $Q\Lambda^{1/2}Q^T$. To apply $A^k$ to a vector, split the vector along the eigenvectors and raise each $\lambda_i$ to the power $k$.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Only for symmetric matrices',
          text: r`A non-symmetric matrix may have eigenvectors that are not perpendicular, complex eigenvalues, or too few eigenvectors to diagonalise at all, like $\begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$. The spectral theorem is about symmetric matrices only; for any matrix, use the SVD (next lesson).`,
        },
        {
          kind: 'example',
          title: 'A power without multiplying',
          prompt: r`$A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$ has $\lambda_1 = 3$ with $\mathbf{q}_1 = \frac{1}{\sqrt2}(1, 1)$ and $\lambda_2 = 1$ with $\mathbf{q}_2 = \frac{1}{\sqrt2}(1, -1)$. Compute $A^3$.`,
          steps: [
            r`$A^3 = Q\Lambda^3Q^T = 3^3\,\mathbf{q}_1\mathbf{q}_1^T + 1^3\,\mathbf{q}_2\mathbf{q}_2^T$: the same eigenvectors, with the eigenvalues cubed (27 and 1).`,
            r`$\mathbf{q}_1\mathbf{q}_1^T = \frac12\begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix}$ and $\mathbf{q}_2\mathbf{q}_2^T = \frac12\begin{pmatrix} 1 & -1 \\ -1 & 1 \end{pmatrix}$.`,
            r`$A^3 = \frac{27}{2}\begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix} + \frac12\begin{pmatrix} 1 & -1 \\ -1 & 1 \end{pmatrix} = \begin{pmatrix} 14 & 13 \\ 13 & 14 \end{pmatrix}$.`,
            r`Check: $A^2 = \begin{pmatrix} 5 & 4 \\ 4 & 5 \end{pmatrix}$, and $A^2A$ has top-left entry $10 + 4 = 14$. ✓`,
          ],
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Symmetric $A$: real eigenvalues, perpendicular eigenvectors, $A = Q\Lambda Q^T$.

• $A = \sum \lambda_i\mathbf{q}_i\mathbf{q}_i^T$: stretches along perpendicular axes.

• $\mathbf{x}^TA\mathbf{x} = \sum\lambda_iy_i^2$: definiteness is decided by the signs of the eigenvalues.

• $2\times2$: positive definite ⇔ $a > 0$ and $\det A > 0$.

• $A^k = Q\Lambda^kQ^T$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
