import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'la-07-x1',
    difficulty: 1,
    promptText: r`What are the eigenvalues of $\begin{pmatrix} 3 & 0 \\ 0 & -2 \end{pmatrix}$?`,
    options: [
      { id: 'a', label: r`$-2$ and $3$`, value: [-2, 3] },
      { id: 'b', label: r`$2$ and $3$`, value: [2, 3], trapExplanation: r`The sign matters: $\mathbf{e}_2$ is flipped and scaled by 2, so its eigenvalue is $-2$.` },
      { id: 'c', label: r`$0$ and $0$`, value: [0, 0], trapExplanation: r`The zeros off the diagonal are not eigenvalues. For a diagonal matrix the eigenvalues sit <i>on</i> the diagonal.` },
      { id: 'd', label: r`$1$ and $1$`, value: [1, 1], trapExplanation: r`Eigenvalue 1 would mean vectors are left unchanged; this matrix scales them by 3 and $-2$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`A diagonal matrix scales each axis separately.`,
      r`$A\mathbf{e}_1 = 3\mathbf{e}_1$ and $A\mathbf{e}_2 = -2\mathbf{e}_2$.`,
      r`So the eigenvalues are the diagonal entries, $3$ and $-2$.`,
    ],
    keyConceptTag: 'Eigenvalues of a diagonal matrix',
  },
  {
    id: 'la-07-x2',
    difficulty: 1,
    promptText: r`$A = \begin{pmatrix} 5 & 0 \\ 0 & 2 \end{pmatrix}$ and $\mathbf{v} = (1, 0)$. Is $\mathbf{v}$ an eigenvector, and with which eigenvalue?`,
    options: [
      { id: 'a', label: r`Yes, $\lambda = 5$`, value: 5 },
      { id: 'b', label: r`Yes, $\lambda = 2$`, value: 2, trapExplanation: r`$\lambda = 2$ belongs to $(0, 1)$. $A(1, 0) = (5, 0)$.` },
      { id: 'c', label: r`Yes, $\lambda = 0$`, value: 0, trapExplanation: r`$A\mathbf{v} = (5, 0) \ne \mathbf{0}$, so the eigenvalue is not 0.` },
      { id: 'd', label: 'No', value: -99, trapExplanation: r`$A\mathbf{v} = (5, 0) = 5\mathbf{v}$ lies on the same line as $\mathbf{v}$, so it is an eigenvector.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Compute $A\mathbf{v} = (5 \cdot 1 + 0,\ 0 + 2 \cdot 0) = (5, 0)$.`,
      r`$(5, 0) = 5 \cdot (1, 0)$.`,
      r`So $A\mathbf{v} = 5\mathbf{v}$: eigenvector with $\lambda = 5$.`,
    ],
    keyConceptTag: 'Eigenvalue from Av = λv',
  },
  {
    id: 'la-07-x3',
    difficulty: 1,
    promptText: r`$A\mathbf{v} = 4\mathbf{v}$ for $\mathbf{v} = (1, 2)$. What is $A\,(3, 6)$?`,
    options: [
      { id: 'a', label: r`$(12, 24)$`, value: [12, 24] },
      { id: 'b', label: r`$(3, 6)$`, value: [3, 6], trapExplanation: r`$(3, 6)$ is an eigenvector too, so it is scaled by 4, not left alone.` },
      { id: 'c', label: r`$(4, 8)$`, value: [4, 8], trapExplanation: r`$(4, 8) = A(1, 2)$. Here the input is $3(1, 2)$, so the output is $3 \cdot (4, 8)$.` },
      { id: 'd', label: r`$(7, 10)$`, value: [7, 10], trapExplanation: r`Adding 4 is not what eigenvalues do; they multiply.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$(3, 6) = 3\mathbf{v}$.`,
      r`By linearity $A(3\mathbf{v}) = 3A\mathbf{v} = 3 \cdot 4\mathbf{v}$.`,
      r`$= 12\mathbf{v} = (12, 24)$. Every non-zero multiple of an eigenvector is an eigenvector.`,
    ],
    keyConceptTag: 'Multiples of eigenvectors',
  },
  {
    id: 'la-07-x4',
    difficulty: 2,
    promptText: r`Find the eigenvalues of $\begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$.`,
    options: [
      { id: 'a', label: r`$1$ and $3$`, value: [1, 3] },
      { id: 'b', label: r`$2$ and $2$`, value: [2, 2], trapExplanation: r`Reading off the diagonal works only for triangular matrices. This one has non-zero entries off the diagonal.` },
      { id: 'c', label: r`$-1$ and $3$`, value: [-1, 3], trapExplanation: r`The eigenvalues multiply to $\det A = 3$; $-1 \cdot 3 = -3$.` },
      { id: 'd', label: r`$0$ and $4$`, value: [0, 4], trapExplanation: r`An eigenvalue 0 would need $\det A = 0$, but $\det A = 3$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$\det(A - \lambda I) = (2 - \lambda)^2 - 1 = 0$.`,
      r`$2 - \lambda = \pm 1$.`,
      r`$\lambda = 1$ or $\lambda = 3$. Check: sum $= 4 = \operatorname{tr} A$, product $= 3 = \det A$.`,
    ],
    keyConceptTag: 'Characteristic equation',
  },
  {
    id: 'la-07-x5',
    difficulty: 2,
    promptText: r`A $2 \times 2$ matrix has trace 7 and determinant 10. What are its eigenvalues?`,
    options: [
      { id: 'a', label: r`$2$ and $5$`, value: [2, 5] },
      { id: 'b', label: r`$3$ and $4$`, value: [3, 4], trapExplanation: r`They add up to 7, but $3 \cdot 4 = 12 \ne 10$.` },
      { id: 'c', label: r`$-5$ and $-2$`, value: [-5, -2], trapExplanation: r`Their product is 10, but their sum is $-7$, not 7.` },
      { id: 'd', label: r`$1$ and $10$`, value: [1, 10], trapExplanation: r`Their product is 10, but their sum is 11.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`For a $2 \times 2$ matrix: $\lambda_1 + \lambda_2 = \operatorname{tr} A$ and $\lambda_1 \lambda_2 = \det A$.`,
      r`So $\lambda$ solves $\lambda^2 - 7\lambda + 10 = 0$.`,
      r`$(\lambda - 2)(\lambda - 5) = 0$: $\lambda = 2, 5$.`,
    ],
    keyConceptTag: 'Trace and determinant',
  },
  {
    id: 'la-07-x6',
    difficulty: 2,
    promptText: r`$A\mathbf{v} = 3\mathbf{v}$ with $\mathbf{v} \ne \mathbf{0}$. What is $A^2\mathbf{v}$?`,
    options: [
      { id: 'a', label: r`$9\mathbf{v}$`, value: 9 },
      { id: 'b', label: r`$6\mathbf{v}$`, value: 6, trapExplanation: r`Applying $A$ twice multiplies by 3 twice: $3 \cdot 3$, not $3 + 3$.` },
      { id: 'c', label: r`$3\mathbf{v}$`, value: 3, trapExplanation: r`That is one application of $A$. $A^2\mathbf{v} = A(A\mathbf{v})$.` },
      { id: 'd', label: r`$\tfrac13\mathbf{v}$`, value: 1 / 3, trapExplanation: r`$\tfrac13$ is the eigenvalue of $A^{-1}$, not of $A^2$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$A^2\mathbf{v} = A(A\mathbf{v}) = A(3\mathbf{v})$.`,
      r`$= 3A\mathbf{v} = 3 \cdot 3\mathbf{v}$.`,
      r`$= 9\mathbf{v}$. In general $A^k\mathbf{v} = \lambda^k\mathbf{v}$ — the reason eigenvectors make powers easy.`,
    ],
    keyConceptTag: 'Powers via eigenvalues',
  },
];
