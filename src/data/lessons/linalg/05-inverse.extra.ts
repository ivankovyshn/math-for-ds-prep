import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'la-05-x1',
    difficulty: 1,
    promptText: r`What is the inverse of $\begin{pmatrix} 3 & 0 \\ 0 & 4 \end{pmatrix}$?`,
    options: [
      { id: 'a', label: r`$\begin{pmatrix} 1/3 & 0 \\ 0 & 1/4 \end{pmatrix}$`, value: [1 / 3, 0, 0, 0.25] },
      { id: 'b', label: r`$\begin{pmatrix} -3 & 0 \\ 0 & -4 \end{pmatrix}$`, value: [-3, 0, 0, -4], trapExplanation: r`The inverse undoes multiplication, so it divides; it does not change signs.` },
      { id: 'c', label: r`$\begin{pmatrix} 1/4 & 0 \\ 0 & 1/3 \end{pmatrix}$`, value: [0.25, 0, 0, 1 / 3], trapExplanation: r`The $x$-axis was stretched by 3, so it must be shrunk by 3: the entries stay in their places.` },
      { id: 'd', label: r`$\begin{pmatrix} 4 & 0 \\ 0 & 3 \end{pmatrix}$`, value: [4, 0, 0, 3], trapExplanation: r`Swapping the diagonal is only half of the 2×2 formula; you must also divide by $\det = 12$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`The matrix stretches $x$ by 3 and $y$ by 4.`,
      r`To undo it, shrink $x$ by 3 and $y$ by 4.`,
      r`$A^{-1} = \operatorname{diag}(1/3, 1/4)$. Check: $AA^{-1} = I$.`,
    ],
    keyConceptTag: 'Inverse of a diagonal matrix',
  },
  {
    id: 'la-05-x2',
    difficulty: 1,
    promptText: r`Which matrix is invertible?`,
    options: [
      { id: 'a', label: r`$\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}$` },
      { id: 'b', label: r`$\begin{pmatrix} 2 & 4 \\ 1 & 2 \end{pmatrix}$`, trapExplanation: r`$\det = 4 - 4 = 0$: the first row is twice the second.` },
      { id: 'c', label: r`$\begin{pmatrix} 0 & 0 \\ 1 & 1 \end{pmatrix}$`, trapExplanation: r`A zero row means $\det = 0$; the plane is squashed onto a line.` },
      { id: 'd', label: r`$\begin{pmatrix} 3 & 6 \\ 1 & 2 \end{pmatrix}$`, trapExplanation: r`$\det = 6 - 6 = 0$: the columns $(3, 1)$ and $(6, 2)$ are parallel.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`A square matrix is invertible exactly when $\det \ne 0$.`,
      r`$\det\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix} = 4 - 6 = -2 \ne 0$.`,
      r`The other three determinants are all 0.`,
    ],
    keyConceptTag: 'Invertible ⟺ det ≠ 0',
  },
  {
    id: 'la-05-x3',
    difficulty: 1,
    promptText: r`Let $A = \begin{pmatrix} 2 & 1 \\ 1 & 1 \end{pmatrix}$ and $B = \begin{pmatrix} 1 & -1 \\ -1 & 2 \end{pmatrix}$. Compute $AB$.`,
    options: [
      { id: 'a', label: r`$\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$, so $B = A^{-1}$`, value: [1, 0, 0, 1] },
      { id: 'b', label: r`$\begin{pmatrix} 2 & -1 \\ -1 & 2 \end{pmatrix}$`, value: [2, -1, -1, 2], trapExplanation: r`That is the entry-by-entry product. A matrix product is rows times columns.` },
      { id: 'c', label: r`$\begin{pmatrix} 1 & 0 \\ 1 & 1 \end{pmatrix}$`, value: [1, 0, 1, 1], trapExplanation: r`Row 2 times column 1: $1 \cdot 1 + 1 \cdot (-1) = 0$, not 1.` },
      { id: 'd', label: r`$\begin{pmatrix} 3 & 0 \\ 0 & 3 \end{pmatrix}$`, value: [3, 0, 0, 3], trapExplanation: r`Row 1 times column 1: $2 - 1 = 1$. Recheck the signs.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$(AB)_{11} = 2 - 1 = 1$, $(AB)_{12} = -2 + 2 = 0$.`,
      r`$(AB)_{21} = 1 - 1 = 0$, $(AB)_{22} = -1 + 2 = 1$.`,
      r`$AB = I$, so $B$ is the inverse of $A$. That is how you check an inverse.`,
    ],
    keyConceptTag: 'Checking an inverse',
  },
  {
    id: 'la-05-x4',
    difficulty: 2,
    promptText: r`Find the inverse of $A = \begin{pmatrix} 4 & 7 \\ 2 & 4 \end{pmatrix}$.`,
    options: [
      { id: 'a', label: r`$\begin{pmatrix} 2 & -3.5 \\ -1 & 2 \end{pmatrix}$`, value: [2, -3.5, -1, 2] },
      { id: 'b', label: r`$\begin{pmatrix} 4 & -7 \\ -2 & 4 \end{pmatrix}$`, value: [4, -7, -2, 4], trapExplanation: r`You still need to divide by $\det A = 16 - 14 = 2$.` },
      { id: 'c', label: r`$\begin{pmatrix} 2 & 3.5 \\ 1 & 2 \end{pmatrix}$`, value: [2, 3.5, 1, 2], trapExplanation: r`The off-diagonal entries change sign in the formula.` },
      { id: 'd', label: r`$\begin{pmatrix} 1/4 & 1/7 \\ 1/2 & 1/4 \end{pmatrix}$`, value: [0.25, 1 / 7, 0.5, 0.25], trapExplanation: r`Inverting entry by entry works only for diagonal matrices.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$\det A = 4 \cdot 4 - 7 \cdot 2 = 2$.`,
      r`Swap the diagonal, negate the off-diagonal: $\begin{pmatrix} 4 & -7 \\ -2 & 4 \end{pmatrix}$.`,
      r`Divide by 2: $A^{-1} = \begin{pmatrix} 2 & -3.5 \\ -1 & 2 \end{pmatrix}$.`,
    ],
    keyConceptTag: '2×2 inverse formula',
  },
  {
    id: 'la-05-x5',
    difficulty: 2,
    promptText: r`$A^{-1} = \begin{pmatrix} 2 & -1 \\ -1 & 1 \end{pmatrix}$. Solve $A\mathbf{x} = \begin{pmatrix} 3 \\ 4 \end{pmatrix}$.`,
    options: [
      { id: 'a', label: r`$\mathbf{x} = (2, 1)$`, value: [2, 1] },
      { id: 'b', label: r`$\mathbf{x} = (7, 11)$`, value: [7, 11], trapExplanation: r`That is $A\mathbf{b}$. To undo $A$ you multiply by $A^{-1}$: $\mathbf{x} = A^{-1}\mathbf{b}$.` },
      { id: 'c', label: r`$\mathbf{x} = (6, -4)$`, value: [6, -4], trapExplanation: r`Entries were multiplied position by position; use rows times the vector.` },
      { id: 'd', label: r`$\mathbf{x} = (-2, 1)$`, value: [-2, 1], trapExplanation: r`Row 1: $2 \cdot 3 + (-1) \cdot 4 = 2$, positive.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Multiply both sides by $A^{-1}$: $\mathbf{x} = A^{-1}\mathbf{b}$.`,
      r`Row 1: $2 \cdot 3 - 4 = 2$. Row 2: $-3 + 4 = 1$.`,
      r`$\mathbf{x} = (2, 1)$.`,
    ],
    keyConceptTag: 'Solving with the inverse',
  },
  {
    id: 'la-05-x6',
    difficulty: 2,
    promptText: r`$A^{-1} = \begin{pmatrix} 1 & 2 \\ 0 & 1 \end{pmatrix}$. What is $A$?`,
    options: [
      { id: 'a', label: r`$\begin{pmatrix} 1 & -2 \\ 0 & 1 \end{pmatrix}$`, value: [1, -2, 0, 1] },
      { id: 'b', label: r`$\begin{pmatrix} 1 & 2 \\ 0 & 1 \end{pmatrix}$`, value: [1, 2, 0, 1], trapExplanation: r`A matrix equal to its own inverse would satisfy $A^2 = I$; here $A^{-1}A^{-1} \ne I$.` },
      { id: 'c', label: r`$\begin{pmatrix} -1 & -2 \\ 0 & -1 \end{pmatrix}$`, value: [-1, -2, 0, -1], trapExplanation: r`Negating every entry is not inverting.` },
      { id: 'd', label: r`$\begin{pmatrix} 1 & 0 \\ 2 & 1 \end{pmatrix}$`, value: [1, 0, 2, 1], trapExplanation: r`That is the transpose. For this matrix the transpose is not the inverse.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$A = (A^{-1})^{-1}$: invert the given matrix.`,
      r`$\det = 1$; swap the diagonal and negate the off-diagonal: $\begin{pmatrix} 1 & -2 \\ 0 & 1 \end{pmatrix}$.`,
      r`Geometrically: a shear by $+2$ is undone by a shear by $-2$.`,
    ],
    keyConceptTag: 'Inverse of the inverse',
  },
];
