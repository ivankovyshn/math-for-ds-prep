import { defineLesson, r } from '../define.ts';
import { extra } from './11-svd-pca.extra.ts';
import { practice } from './11-svd-pca.practice.ts';

export default defineLesson({
  id: 'la-11',
  moduleId: 'linalg',
  title: 'The singular value decomposition',
  blurb: 'Every matrix is a rotation, a stretch and a rotation',
  minutes: 8,
  deeper: [
    { title: 'Singular value decomposition', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/positive-definite-matrices-and-applications/singular-value-decomposition/', source: 'MIT OpenCourseWare 18.06SC (Gilbert Strang) · lecture video, notes and problems' },
    { title: 'Singular value decomposition', url: 'https://www.statlect.com/matrix-algebra/singular-value-decomposition', source: 'StatLect · free textbook page with proofs and exercises' },
  ],
  lecture: [
    {
      title: 'The singular value decomposition',
      covers: ['1', 'x1', 'x3'],
      blocks: [
        {
          kind: 'text',
          text: r`Eigenvalues need a square matrix, and only symmetric matrices come with perpendicular eigenvectors. The <i>singular value decomposition</i> (SVD) works for every matrix, of any shape.`,
        },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'SVD',
          text: r`Every $m\times n$ matrix can be written as

$A = U\Sigma V^T$,

with $U$ ($m\times m$) and $V$ ($n\times n$) orthogonal and $\Sigma$ ($m\times n$) zero except for the diagonal entries $\sigma_1 \ge \sigma_2 \ge \dots \ge 0$, the <i>singular values</i>.`,
        },
        {
          kind: 'text',
          text: r`Read it from right to left: $V^T$ rotates, $\Sigma$ stretches along the axes, $U$ rotates again. The unit circle becomes an ellipse with semi-axes $\sigma_1$ and $\sigma_2$, so the largest stretch of any unit vector is $\sigma_1$. The columns $\mathbf{v}_i$ of $V$ are mapped to $A\mathbf{v}_i = \sigma_i\mathbf{u}_i$.

For a diagonal matrix there is nothing to rotate: the singular values are the absolute values of the diagonal entries, sorted. A negative sign is a flip, which goes into $U$.`,
        },
        { kind: 'diagram', type: 'svd', caption: r`$A$ maps the perpendicular unit vectors $\mathbf{v}_1, \mathbf{v}_2$ onto the perpendicular semi-axes $\sigma_1\mathbf{u}_1, \sigma_2\mathbf{u}_2$ of an ellipse.` },
        {
          kind: 'quiz',
          id: 'la-11-q1',
          prompt: r`What are the singular values of $\begin{pmatrix} 2 & 0 \\ 0 & -3 \end{pmatrix}$?`,
          options: [
            { id: 'a', label: '$3$ and $2$', value: [3, 2] },
            { id: 'b', label: '$2$ and $-3$', value: [2, -3], trapExplanation: r`Singular values are never negative: the sign goes into $U$ (a reflection).` },
            { id: 'c', label: '$9$ and $4$', value: [9, 4], trapExplanation: r`Those are the eigenvalues of $A^TA$; take square roots.` },
          ],
          correctOptionId: 'a',
          explanation: r`The matrix stretches by 2 and by 3 (with a flip). Sorted: $\sigma_1 = 3$, $\sigma_2 = 2$.`,
        },
      ],
    },
    {
      title: 'Computing singular values',
      covers: ['3', '5', '7', '8', 'x2', 'x4', 'x8'],
      blocks: [
        {
          kind: 'text',
          text: r`$A^TA = V\Sigma^TU^TU\Sigma V^T = V(\Sigma^T\Sigma)V^T$ is symmetric, so the spectral theorem applies: the eigenvalues of $A^TA$ are $\sigma_i^2$ and its eigenvectors are the $\mathbf{v}_i$. Entry $(i, j)$ of $A^TA$ is column $i$ of $A$ dotted with column $j$.`,
        },
        { kind: 'formula', tex: r`\sigma_i = \sqrt{\lambda_i(A^TA)}, \qquad \mathbf{u}_i = \frac{A\mathbf{v}_i}{\sigma_i}` },
        {
          kind: 'example',
          title: 'A 2×2 matrix',
          prompt: r`Find the singular values of $A = \begin{pmatrix} 3 & 0 \\ 4 & 5 \end{pmatrix}$.`,
          steps: [
            r`$A^TA = \begin{pmatrix} 25 & 20 \\ 20 & 25 \end{pmatrix}$: trace 50, determinant $625 - 400 = 225$.`,
            r`Eigenvalues: $\lambda^2 - 50\lambda + 225 = 0$, so $\lambda = 45$ and $\lambda = 5$.`,
            r`$\sigma_1 = \sqrt{45} = 3\sqrt5$, $\sigma_2 = \sqrt5$. Check: $\sigma_1\sigma_2 = 15 = |\det A|$. ✓ The eigenvalues of $A$ itself are 3 and 5 — different numbers.`,
          ],
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'What the singular values tell you',
          text: r`• $\operatorname{rank}A$ = the number of non-zero singular values.

• $\sigma_1 = \max_{\|\mathbf{x}\| = 1}\|A\mathbf{x}\|$: the largest stretch ($\|A\|_2$).

• $\|A\|_F^2 = \sum a_{ij}^2 = \sigma_1^2 + \sigma_2^2 + \dots$ — the sum of squared entries, not of the entries.

• For a square matrix, $\sigma_1\sigma_2\cdots\sigma_n = |\det A|$.`,
        },
        {
          kind: 'example',
          title: 'Two shortcuts',
          prompt: r`Find the singular values of the rank-one matrix $B = \begin{pmatrix} 1 & 2 \\ 2 & 4 \end{pmatrix}$ and of the symmetric $S = \begin{pmatrix} 1 & 2 \\ 2 & -2 \end{pmatrix}$.`,
          steps: [
            r`$B$: the second row is twice the first, so the rank is 1 and $\sigma_2 = 0$.`,
            r`Then $\sigma_1^2 = \|B\|_F^2 = 1 + 4 + 4 + 16 = 25$, so $\sigma_1 = 5$.`,
            r`$S$ is symmetric: $S^TS = S^2$ has eigenvalues $\lambda^2$, so the singular values are $|\lambda|$.`,
            r`Eigenvalues of $S$: trace $-1$, determinant $-6$, so $\lambda = 2$ and $\lambda = -3$. Singular values: $3$ and $2$ — never negative.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-11-q2',
          prompt: r`A $3\times3$ matrix has singular values $7$, $2$ and $0$. What is its rank?`,
          options: [
            { id: 'a', label: '$2$', value: 2 },
            { id: 'b', label: '$3$', value: 3, trapExplanation: r`A zero singular value means one direction is flattened to $\mathbf{0}$: the rank drops.` },
            { id: 'c', label: '$1$', value: 1, trapExplanation: r`Count all the non-zero singular values: 7 and 2.` },
          ],
          correctOptionId: 'a',
          explanation: r`Two non-zero singular values: rank 2. The image of $A$ is a plane.`,
        },
      ],
    },
    {
      title: 'Low-rank approximation',
      covers: ['4', 'x7'],
      blocks: [
        {
          kind: 'text',
          text: r`Like the spectral decomposition, the SVD splits $A$ into rank-one pieces, ordered from most to least important:`,
        },
        { kind: 'formula', tex: r`A = \sigma_1\mathbf{u}_1\mathbf{v}_1^T + \sigma_2\mathbf{u}_2\mathbf{v}_2^T + \dots, \qquad A_k = \text{the first } k \text{ terms}` },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Eckart–Young',
          text: r`$A_k$ is the best approximation of $A$ by a matrix of rank $k$. The error is

$\|A - A_k\|_2 = \sigma_{k+1}$ and $\|A - A_k\|_F = \sqrt{\sigma_{k+1}^2 + \sigma_{k+2}^2 + \dots}$`,
        },
        {
          kind: 'example',
          title: 'Errors of a rank-1 approximation',
          prompt: r`$A$ has singular values $10$, $6$ and $3$. How far is $A_1$ from $A$, in both norms?`,
          steps: [
            r`$A - A_1 = 6\,\mathbf{u}_2\mathbf{v}_2^T + 3\,\mathbf{u}_3\mathbf{v}_3^T$: exactly the terms that were dropped.`,
            r`Spectral norm: the largest dropped singular value, $\|A - A_1\|_2 = 6$.`,
            r`Frobenius norm: $\sqrt{6^2 + 3^2} = \sqrt{45} \approx 6.7$ — the dropped values are squared and added, not just added.`,
            r`$A_1$ keeps $\frac{100}{100 + 36 + 9} \approx 69\%$ of $\|A\|_F^2$.`,
          ],
        },
        {
          kind: 'text',
          text: r`When the singular values decay fast, a few terms hold almost everything. This is behind image compression, recommender systems (a ratings matrix is close to low rank) and noise removal. The next lesson applies the same idea to data: principal component analysis.`,
        },
        {
          kind: 'quiz',
          id: 'la-11-q3',
          prompt: r`$A$ has singular values $5$, $3$ and $1$. What is $\|A - A_1\|_2$?`,
          options: [
            { id: 'a', label: '$3$', value: 3 },
            { id: 'b', label: '$1$', value: 1, trapExplanation: r`$\sigma_3 = 1$ is the error of $A_2$. $A_1$ also drops $\sigma_2 = 3$.` },
            { id: 'c', label: r`$\sqrt{10}$`, value: Math.sqrt(10), trapExplanation: r`That is the Frobenius error $\sqrt{3^2 + 1^2}$. The spectral norm takes only the largest dropped value.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\|A - A_k\|_2 = \sigma_{k+1}$; for $k = 1$ that is $\sigma_2 = 3$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Any matrix: $A = U\Sigma V^T$, with $\sigma_1 \ge \sigma_2 \ge \dots \ge 0$.

• $\sigma_i = \sqrt{\lambda_i(A^TA)}$; for a symmetric matrix $\sigma_i = |\lambda_i|$; for a diagonal one, $|d_i|$.

• Rank = number of non-zero $\sigma_i$; $\|A\|_2 = \sigma_1$; $\|A\|_F^2 = \sum\sigma_i^2 = \sum a_{ij}^2$.

• Best rank-$k$ approximation: keep the first $k$ terms. Errors: $\sigma_{k+1}$ in the 2-norm, $\sqrt{\sigma_{k+1}^2 + \dots}$ in the Frobenius norm.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
