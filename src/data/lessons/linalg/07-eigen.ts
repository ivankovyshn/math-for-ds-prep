import { defineLesson, r } from '../define.ts';
import { extra } from './07-eigen.extra.ts';

export default defineLesson({
  id: 'la-07',
  moduleId: 'linalg',
  title: 'Eigenvalues and eigenvectors',
  blurb: 'Directions a matrix only stretches',
  minutes: 8,
  lecture: [
    {
      title: 'Directions that survive',
      blocks: [
        {
          kind: 'text',
          text: r`Most vectors change direction when a matrix acts on them. A few special ones do not: they are only stretched, shrunk or flipped. These directions are the skeleton of the matrix.`,
        },
        {
          kind: 'box',
          variant: 'definition',
          title: 'Eigenvector and eigenvalue',
          text: r`A non-zero vector $\mathbf{v}$ is an <i>eigenvector</i> of the square matrix $A$ if

$A\mathbf{v} = \lambda\mathbf{v}$ for some number $\lambda$.

The number $\lambda$ is the corresponding <i>eigenvalue</i>: the stretching factor along that direction.`,
        },
        { kind: 'diagram', type: 'eigen', caption: r`For $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$: $\mathbf{v} = (1, 1)$ stays on its line and is tripled ($\lambda = 3$). $\mathbf{w} = (1, 0)$ is knocked off its line, so it is not an eigenvector.` },
        {
          kind: 'text',
          text: r`Any non-zero multiple of an eigenvector is again an eigenvector with the same $\lambda$ — it is really a <i>direction</i> that matters. The zero vector is excluded because $A\mathbf{0} = \lambda\mathbf{0}$ for every $\lambda$.`,
        },
        {
          kind: 'quiz',
          id: 'la-07-q1',
          prompt: r`$A = \begin{pmatrix} 3 & 1 \\ 0 & 2 \end{pmatrix}$. Is $(1, 0)$ an eigenvector, and with which eigenvalue?`,
          options: [
            { id: 'a', label: r`Yes, $\lambda = 3$`, value: 3 },
            { id: 'b', label: r`Yes, $\lambda = 2$`, value: 2, trapExplanation: r`$A(1, 0)$ is the first column, $(3, 0) = 3 \cdot (1, 0)$.` },
            { id: 'c', label: 'No', value: -99, trapExplanation: r`$A(1, 0) = (3, 0)$ stays on the same line as $(1, 0)$, so it is an eigenvector.` },
          ],
          correctOptionId: 'a',
          explanation: r`$A(1, 0) = (3, 0) = 3 \cdot (1, 0)$: the direction survives and is stretched by 3.`,
        },
      ],
    },
    {
      title: 'Finding eigenvalues',
      blocks: [
        {
          kind: 'text',
          text: r`Rewrite $A\mathbf{v} = \lambda\mathbf{v}$ as $(A - \lambda I)\mathbf{v} = \mathbf{0}$. A <i>non-zero</i> solution exists only if $A - \lambda I$ squashes space, i.e. if its determinant is zero. This gives the <i>characteristic equation</i>:`,
        },
        { kind: 'formula', tex: r`\det(A - \lambda I) = 0` },
        {
          kind: 'text',
          text: r`For a $2\times2$ matrix it is a quadratic that only needs the trace $\operatorname{tr}A = a + d$ and the determinant:`,
        },
        { kind: 'formula', tex: r`\lambda^2 - (\operatorname{tr}A)\,\lambda + \det A = 0` },
        {
          kind: 'example',
          title: 'A 2×2 matrix',
          prompt: r`Find the eigenvalues of $A = \begin{pmatrix} 4 & 1 \\ 2 & 3 \end{pmatrix}$.`,
          steps: [
            r`$\operatorname{tr}A = 4 + 3 = 7$ and $\det A = 12 - 2 = 10$.`,
            r`Characteristic equation: $\lambda^2 - 7\lambda + 10 = 0$.`,
            r`$(\lambda - 2)(\lambda - 5) = 0$, so $\lambda_1 = 2$, $\lambda_2 = 5$. Check: $2 + 5 = 7 = \operatorname{tr}A$ and $2\cdot5 = 10 = \det A$. ✓`,
          ],
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Triangular matrices',
          text: r`For a triangular (or diagonal) matrix the eigenvalues are simply the diagonal entries — the determinant of $A - \lambda I$ is the product of $(a_{ii} - \lambda)$. For any other matrix the diagonal tells you nothing directly.`,
        },
        {
          kind: 'quiz',
          id: 'la-07-q2',
          prompt: r`What are the eigenvalues of $\begin{pmatrix} 1 & 2 \\ 2 & 1 \end{pmatrix}$?`,
          options: [
            { id: 'a', label: r`$-1$ and $3$`, value: [-1, 3] },
            { id: 'b', label: r`$1$ and $1$`, value: [1, 1], trapExplanation: r`The diagonal gives the eigenvalues only for triangular matrices.` },
            { id: 'c', label: r`$1$ and $3$`, value: [1, 3], trapExplanation: r`The product of the eigenvalues must equal $\det A = 1 - 4 = -3$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$(1 - \lambda)^2 - 4 = 0$ gives $1 - \lambda = \pm 2$, so $\lambda = -1$ or $3$. Check: sum 2 = trace, product $-3$ = det.`,
        },
      ],
    },
    {
      title: 'Finding eigenvectors',
      blocks: [
        {
          kind: 'text',
          text: r`For each eigenvalue, solve the homogeneous system $(A - \lambda I)\mathbf{v} = \mathbf{0}$. It always has free variables (that is how $\lambda$ was chosen), and the solutions are the eigenvectors.`,
        },
        {
          kind: 'example',
          title: 'Eigenvector for λ = 5',
          prompt: r`Continue with $A = \begin{pmatrix} 4 & 1 \\ 2 & 3 \end{pmatrix}$ and $\lambda = 5$.`,
          steps: [
            r`$A - 5I = \begin{pmatrix} -1 & 1 \\ 2 & -2 \end{pmatrix}$. The second row is $-2$ times the first, as expected.`,
            r`The first row says $-x + y = 0$, so $y = x$.`,
            r`Eigenvectors: all multiples of $(1, 1)$. Check: $A(1, 1) = (5, 5) = 5(1, 1)$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-07-q3',
          prompt: r`Which vector is an eigenvector of the same $A$ for $\lambda = 2$?`,
          options: [
            { id: 'a', label: r`$(1, -2)$` },
            { id: 'b', label: r`$(1, 1)$`, trapExplanation: r`$A(1, 1) = (5, 5)$: this is the eigenvector for $\lambda = 5$.` },
            { id: 'c', label: r`$(2, 1)$`, trapExplanation: r`$A(2, 1) = (9, 7)$ is not a multiple of $(2, 1)$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$A - 2I = \begin{pmatrix} 2 & 1 \\ 2 & 1 \end{pmatrix}$, so $2x + y = 0$: $\mathbf{v} = (1, -2)$. Check: $A(1, -2) = (2, -4) = 2(1, -2)$.`,
        },
      ],
    },
    {
      title: 'Why they matter',
      blocks: [
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Trace and determinant',
          text: r`For an $n\times n$ matrix with eigenvalues $\lambda_1, \dots, \lambda_n$ (counted with multiplicity, complex ones included):

$\lambda_1 + \dots + \lambda_n = \operatorname{tr}A$ and $\lambda_1\cdots\lambda_n = \det A$.`,
        },
        {
          kind: 'text',
          text: r`If $A$ has $n$ independent eigenvectors, use them as a basis. In that basis $A$ just stretches each axis: $A = PDP^{-1}$, where the columns of $P$ are eigenvectors and $D$ is diagonal with the eigenvalues. Then powers are easy:`,
        },
        { kind: 'formula', tex: r`A^{k} = P\,D^{k}P^{-1}, \qquad D^{k} = \operatorname{diag}(\lambda_1^{k}, \dots, \lambda_n^{k})` },
        {
          kind: 'text',
          text: r`Also, $A^{-1}$ has eigenvalues $1/\lambda_i$ and $A^k$ has $\lambda_i^k$, with the same eigenvectors. Eigenvalues are behind principal component analysis (PCA), Google's PageRank, the long-run behaviour of Markov chains and the stability of dynamical systems.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Not every matrix has real eigenvalues',
          text: r`A rotation by $90^\circ$ turns every direction, so it has no real eigenvector. Its characteristic equation $\lambda^2 + 1 = 0$ has only complex roots.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $A\mathbf{v} = \lambda\mathbf{v}$, $\mathbf{v} \ne \mathbf{0}$: $\mathbf{v}$ keeps its direction, $\lambda$ is the stretch.

• Eigenvalues: $\det(A - \lambda I) = 0$; for $2\times2$, $\lambda^2 - (\operatorname{tr}A)\lambda + \det A = 0$.

• Eigenvectors: solve $(A - \lambda I)\mathbf{v} = \mathbf{0}$.

• Sum of eigenvalues = trace, product = determinant; triangular ⇒ read them off the diagonal.

• $A = PDP^{-1}$ makes powers easy: $A^k = PD^kP^{-1}$.`,
        },
      ],
    },
  ],
  extra,
  questions: [
    {
      id: 'la-07-1',
      difficulty: 1,
      promptText: r`What are the eigenvalues of $A = \begin{pmatrix} 2 & 5 \\ 0 & 3 \end{pmatrix}$?`,
      options: [
        { id: 'a', label: '$2$ and $3$', value: [2, 3] },
        { id: 'b', label: '$2$ and $5$', value: [2, 5], trapExplanation: r`These are the entries of the first row. For a triangular matrix the eigenvalues sit on the <i>diagonal</i>.` },
        { id: 'c', label: '$-3$ and $-2$', value: [-3, -2], trapExplanation: r`$\det(A - \lambda I) = (2 - \lambda)(3 - \lambda)$ vanishes at $\lambda = 2$ and $3$, not at their negatives.` },
        { id: 'd', label: '$3$ and $5$', value: [3, 5], trapExplanation: r`These are the entries of the second column. The off-diagonal 5 does not affect the eigenvalues of a triangular matrix.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$A - \lambda I = \begin{pmatrix} 2 - \lambda & 5 \\ 0 & 3 - \lambda \end{pmatrix}$ is triangular.`,
        r`Its determinant is the product of the diagonal: $(2 - \lambda)(3 - \lambda)$.`,
        r`Zero at $\lambda = 2$ and $\lambda = 3$.`,
      ],
      keyConceptTag: 'Eigenvalues of a triangular matrix',
    },
    {
      id: 'la-07-2',
      difficulty: 1,
      promptText: r`$\mathbf{v} = (1, 1)$ is an eigenvector of $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$. What is its eigenvalue?`,
      options: [
        { id: 'a', label: '$3$', value: 3 },
        { id: 'b', label: '$2$', value: 2, trapExplanation: r`2 is a diagonal entry. This matrix is not triangular, so the diagonal entries are not its eigenvalues. Compute $A\mathbf{v}$.` },
        { id: 'c', label: '$1$', value: 1, trapExplanation: r`$1$ is the other eigenvalue of $A$, belonging to the direction $(1, -1)$. For $(1, 1)$ compute $A\mathbf{v}$.` },
        { id: 'd', label: '$6$', value: 6, trapExplanation: r`$A\mathbf{v} = (3, 3)$, and $3 + 3 = 6$ — but the eigenvalue is the factor $\lambda$ in $A\mathbf{v} = \lambda\mathbf{v}$, not the sum of the entries.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$A\mathbf{v} = (2 + 1,\ 1 + 2) = (3, 3)$.`,
        r`$(3, 3) = 3\cdot(1, 1)$.`,
        r`So $\lambda = 3$.`,
      ],
      keyConceptTag: 'Eigenvalue from Av = λv',
    },
    {
      id: 'la-07-3',
      difficulty: 2,
      promptText: r`Find the eigenvalues of $A = \begin{pmatrix} 4 & 1 \\ 2 & 3 \end{pmatrix}$.`,
      options: [
        { id: 'a', label: '$2$ and $5$', value: [2, 5] },
        { id: 'b', label: '$3$ and $4$', value: [3, 4], trapExplanation: r`These are the diagonal entries, which are eigenvalues only for triangular matrices. Here the 1 and the 2 off the diagonal change them.` },
        { id: 'c', label: '$-5$ and $-2$', value: [-5, -2], trapExplanation: r`The roots of $\lambda^2 - 7\lambda + 10$ are positive: their sum is $+7$. The sign was lost when factoring.` },
        { id: 'd', label: 'There are no real eigenvalues', value: [], trapExplanation: r`With $\det A = 12 - 2 = 10$ the discriminant is $49 - 40 = 9 > 0$. Using $ad + bc = 14$ instead would make it negative.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$\operatorname{tr}A = 7$, $\det A = 4\cdot3 - 1\cdot2 = 10$.`,
        r`$\lambda^2 - 7\lambda + 10 = (\lambda - 2)(\lambda - 5) = 0$.`,
        r`$\lambda = 2$ and $\lambda = 5$; check: sum 7 = trace, product 10 = det.`,
      ],
      keyConceptTag: 'Characteristic equation',
    },
    {
      id: 'la-07-4',
      difficulty: 2,
      promptText: r`Which vector is an eigenvector of $A = \begin{pmatrix} 4 & 1 \\ 2 & 3 \end{pmatrix}$ for the eigenvalue $\lambda = 5$?`,
      options: [
        { id: 'a', label: '$(1, 1)$', value: [1, 1] },
        { id: 'b', label: '$(1, -2)$', value: [1, -2], trapExplanation: r`$A(1, -2) = (2, -4) = 2(1, -2)$: an eigenvector, but for $\lambda = 2$, not $5$.` },
        { id: 'c', label: '$(1, 0)$', value: [1, 0], trapExplanation: r`$A(1, 0) = (4, 2)$ is not a multiple of $(1, 0)$, so it is not an eigenvector at all.` },
        { id: 'd', label: '$(-1, 1)$', value: [-1, 1], trapExplanation: r`$A - 5I$ gives $-x + y = 0$, i.e. $y = x$. Writing $y = -x$ is a sign slip; $A(-1, 1) = (-3, 1)$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$A - 5I = \begin{pmatrix} -1 & 1 \\ 2 & -2 \end{pmatrix}$.`,
        r`$(A - 5I)\mathbf{v} = \mathbf{0}$ gives $-x + y = 0$, so $y = x$.`,
        r`$\mathbf{v} = (1, 1)$. Check: $A(1, 1) = (5, 5)$. ✓`,
      ],
      keyConceptTag: 'Eigenvector from (A − λI)v = 0',
    },
    {
      id: 'la-07-5',
      difficulty: 3,
      promptText: r`A $3\times 3$ matrix $A$ has eigenvalues $1$, $2$ and $4$. What is $\det(2A^{-1})$?`,
      options: [
        { id: 'a', label: '$1$', value: 1 },
        { id: 'b', label: r`$\tfrac14$`, value: 1 / 4, trapExplanation: r`$2\cdot\det A^{-1} = 2/8$ forgets that $2A^{-1}$ scales all 3 rows: the factor is $2^3 = 8$.` },
        { id: 'c', label: '$16$', value: 16, trapExplanation: r`$2\cdot\det A = 16$ uses $A$ instead of $A^{-1}$. The inverse has eigenvalues $1, \tfrac12, \tfrac14$.` },
        { id: 'd', label: r`$\tfrac18$`, value: 1 / 8, trapExplanation: r`$\tfrac18 = \det(A^{-1})$. The factor 2 in front still multiplies the determinant by $2^3$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$\det A$ = product of eigenvalues $= 1\cdot2\cdot4 = 8$, so $\det A^{-1} = \tfrac18$.`,
        r`$\det(2A^{-1}) = 2^3\det A^{-1}$ for a $3\times3$ matrix.`,
        r`$8\cdot\tfrac18 = 1$. (Equivalently: $2A^{-1}$ has eigenvalues $2, 1, \tfrac12$, whose product is 1.)`,
      ],
      keyConceptTag: 'det = product of eigenvalues',
    },
    {
      id: 'la-07-6',
      difficulty: 3,
      promptText: r`Let $A = \begin{pmatrix} 2 & 1 \\ 0 & 1 \end{pmatrix}$. What is the top-right entry of $A^{10}$?`,
      options: [
        { id: 'a', label: '$1023$', value: 1023 },
        { id: 'b', label: '$1024$', value: 1024, trapExplanation: r`$1024 = 2^{10}$ is the top-left entry. The top-right one collects $2^9 + 2^8 + \dots + 1 = 2^{10} - 1$.` },
        { id: 'c', label: '$10$', value: 10, trapExplanation: r`For $\begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$ the corner grows by 1 each time. Here the diagonal entry 2 doubles what was there before, so it grows much faster.` },
        { id: 'd', label: '$1$', value: 1, trapExplanation: r`$1^{10} = 1$ raises the entry to the power. Matrix powers are repeated matrix products, not entrywise powers.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Eigenvalues 2 and 1 (triangular). Eigenvectors: $(1, 0)$ for 2 and $(1, -1)$ for 1, so $A = PDP^{-1}$ with $P = \begin{pmatrix} 1 & 1 \\ 0 & -1 \end{pmatrix}$, $D = \operatorname{diag}(2, 1)$.`,
        r`$A^{n} = PD^{n}P^{-1} = \begin{pmatrix} 2^{n} & 2^{n} - 1 \\ 0 & 1 \end{pmatrix}$. Check $n = 1$: $\begin{pmatrix} 2 & 1 \\ 0 & 1 \end{pmatrix}$. ✓`,
        r`For $n = 10$: $2^{10} - 1 = 1023$.`,
      ],
      keyConceptTag: 'Powers via diagonalisation',
    },
  ],
});
