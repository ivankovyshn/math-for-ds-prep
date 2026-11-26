import { defineLesson, r } from '../define.ts';
import { extra } from './11-svd-pca.extra.ts';
import { practice } from './11-svd-pca.practice.ts';

export default defineLesson({
  id: 'la-11',
  moduleId: 'linalg',
  title: 'SVD and PCA',
  blurb: 'Every matrix is a rotation, a stretch and a rotation',
  minutes: 8,
  lecture: [
    {
      title: 'The singular value decomposition',
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
          text: r`Read it from right to left: $V^T$ rotates, $\Sigma$ stretches along the axes, $U$ rotates again. The unit circle becomes an ellipse with semi-axes $\sigma_1$ and $\sigma_2$. The columns $\mathbf{v}_i$ of $V$ are mapped to $A\mathbf{v}_i = \sigma_i\mathbf{u}_i$.`,
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
      blocks: [
        {
          kind: 'text',
          text: r`$A^TA = V\Sigma^TU^TU\Sigma V^T = V(\Sigma^T\Sigma)V^T$ is symmetric, so the spectral theorem applies: the eigenvalues of $A^TA$ are $\sigma_i^2$ and its eigenvectors are the $\mathbf{v}_i$.`,
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

• $\|A\|_F^2 = \sum a_{ij}^2 = \sigma_1^2 + \sigma_2^2 + \dots$`,
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
          kind: 'text',
          text: r`When the singular values decay fast, a few terms hold almost everything. This is behind image compression, recommender systems (a ratings matrix is close to low rank) and noise removal.`,
        },
      ],
    },
    {
      title: 'Principal component analysis',
      blocks: [
        {
          kind: 'text',
          text: r`Take data $X$ with $n$ rows (samples) and $d$ columns (features), each column <i>centred</i> to mean 0. Its covariance matrix $C = \frac{1}{n-1}X^TX$ is symmetric and positive semidefinite. The <i>principal components</i> are the eigenvectors of $C$ — equivalently, the right singular vectors of $X$. The variance along PC $i$ is $\lambda_i = \frac{\sigma_i^2}{n - 1}$.`,
        },
        { kind: 'diagram', type: 'pca', caption: r`PC1 points along the direction of largest spread; PC2 is perpendicular to it. Keeping only PC1 turns 2D data into 1D with little loss.` },
        { kind: 'formula', tex: r`\text{share of variance explained by PC}_i = \frac{\lambda_i}{\lambda_1 + \dots + \lambda_d} = \frac{\sigma_i^2}{\sigma_1^2 + \dots + \sigma_d^2}` },
        {
          kind: 'example',
          title: 'Two features',
          prompt: r`Centred data has covariance $C = \begin{pmatrix} 5 & 2 \\ 2 & 2 \end{pmatrix}$. How much variance does PC1 explain?`,
          steps: [
            r`Eigenvalues of $C$: trace 7, determinant 6, so $\lambda_1 = 6$ (direction $(2, 1)$) and $\lambda_2 = 1$ (direction $(-1, 2)$).`,
            r`Total variance $= \operatorname{tr}C = 7$.`,
            r`PC1 explains $\frac{6}{7} \approx 86\%$. Projecting onto $(2, 1)/\sqrt5$ keeps 86% of the variance with half the numbers.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-11-q3',
          prompt: r`The covariance matrix of some data has eigenvalues $8$, $1.5$ and $0.5$. What share of the variance does PC1 explain?`,
          options: [
            { id: 'a', label: '$80\\%$', value: 80 },
            { id: 'b', label: r`$33\%$`, value: 100 / 3, trapExplanation: r`The components do not share the variance equally: PC1 carries $\frac{8}{10}$ of it.` },
            { id: 'c', label: r`$94\%$`, value: (8 / 8.5) * 100, trapExplanation: r`$\frac{8}{8.5}$ leaves out the last eigenvalue: the total is $8 + 1.5 + 0.5 = 10$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{8}{8 + 1.5 + 0.5} = \frac{8}{10} = 80\%$.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Centre and scale first',
          text: r`Without centring, PC1 just points at the mean of the data. And if features are in different units (metres and grams), the one with the biggest numbers dominates: standardise the columns first unless the units are comparable.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Any matrix: $A = U\Sigma V^T$, with $\sigma_1 \ge \sigma_2 \ge \dots \ge 0$.

• $\sigma_i = \sqrt{\lambda_i(A^TA)}$; rank = number of non-zero $\sigma_i$; $\|A\|_2 = \sigma_1$.

• Best rank-$k$ approximation: keep the first $k$ terms; Frobenius error $\sqrt{\sigma_{k+1}^2 + \dots}$.

• PCA: eigenvectors of the covariance of centred data = right singular vectors of $X$.

• PC $i$ explains $\lambda_i / \sum\lambda_j$ of the variance.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
