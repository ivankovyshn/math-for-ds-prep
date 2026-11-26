import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'la-04-x1',
    difficulty: 1,
    promptText: r`Compute $\det\begin{pmatrix} 5 & 2 \\ 1 & 1 \end{pmatrix}$.`,
    options: [
      { id: 'a', label: '$3$', value: 3 },
      { id: 'b', label: '$7$', value: 7, trapExplanation: r`The formula is $ad - bc$: the two products are subtracted, not added.` },
      { id: 'c', label: '$-3$', value: -3, trapExplanation: r`The order is main diagonal minus the other one: $5 \cdot 1 - 2 \cdot 1$.` },
      { id: 'd', label: '$10$', value: 10, trapExplanation: r`$5 \cdot 2$ multiplies entries of the first row; the determinant uses the diagonals.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$.`,
      r`$5 \cdot 1 - 2 \cdot 1$.`,
      r`$= 3$.`,
    ],
    keyConceptTag: '2×2 determinant',
  },
  {
    id: 'la-04-x2',
    difficulty: 1,
    promptText: r`Compute $\det\begin{pmatrix} 1 & 2 \\ 2 & 4 \end{pmatrix}$.`,
    options: [
      { id: 'a', label: r`$0$ — the columns are parallel`, value: 0 },
      { id: 'b', label: '$8$', value: 8, trapExplanation: r`$ad + bc = 4 + 4$. The products must be subtracted.` },
      { id: 'c', label: '$4$', value: 4, trapExplanation: r`Only $ad$ was computed; subtract $bc = 4$.` },
      { id: 'd', label: '$-8$', value: -8, trapExplanation: r`$1 \cdot 4 - 2 \cdot 2 = 0$. Check the arithmetic of each product.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$1 \cdot 4 - 2 \cdot 2 = 0$.`,
      r`The second column $(2, 4)$ is twice the first $(1, 2)$.`,
      r`Parallel columns span a flat parallelogram: area 0, so the matrix is not invertible.`,
    ],
    keyConceptTag: 'det = 0 detects dependence',
  },
  {
    id: 'la-04-x3',
    difficulty: 1,
    promptText: r`What is the area of the parallelogram spanned by $(2, 0)$ and $(1, 3)$?`,
    options: [
      { id: 'a', label: '$6$', value: 6 },
      { id: 'b', label: '$3$', value: 3, trapExplanation: r`3 is the area of the triangle — half the parallelogram.` },
      { id: 'c', label: '$5$', value: 5, trapExplanation: r`Adding coordinates does not give an area; use $|\det|$.` },
      { id: 'd', label: '$9$', value: 9, trapExplanation: r`The area is $|2 \cdot 3 - 0 \cdot 1| = 6$; it does not depend on the "slant" 1.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Area $= |\det(\mathbf{u}\ \mathbf{v})|$.`,
      r`$\det\begin{pmatrix} 2 & 1 \\ 0 & 3 \end{pmatrix} = 6 - 0 = 6$.`,
      r`Base 2 along the $x$-axis, height 3: area 6.`,
    ],
    keyConceptTag: 'Determinant as area',
  },
  {
    id: 'la-04-x4',
    difficulty: 2,
    promptText: r`Compute $\det\begin{pmatrix} 2 & 0 & 0 \\ 0 & -1 & 0 \\ 0 & 0 & 3 \end{pmatrix}$.`,
    options: [
      { id: 'a', label: '$-6$', value: -6 },
      { id: 'b', label: '$4$', value: 4, trapExplanation: r`The determinant of a diagonal matrix is the <i>product</i> of the diagonal, not the sum (that is the trace).` },
      { id: 'c', label: '$6$', value: 6, trapExplanation: r`The factor $-1$ flips the sign: $2 \cdot (-1) \cdot 3 = -6$.` },
      { id: 'd', label: '$0$', value: 0, trapExplanation: r`Zeros off the diagonal do not make the determinant 0; only a zero <i>on</i> the diagonal would.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`For a diagonal (or triangular) matrix the determinant is the product of the diagonal entries.`,
      r`$2 \cdot (-1) \cdot 3$.`,
      r`$= -6$: volumes are scaled by 6 and the orientation is reversed.`,
    ],
    keyConceptTag: 'Triangular determinants',
  },
  {
    id: 'la-04-x5',
    difficulty: 2,
    promptText: r`$A$ is invertible with $\det A = 5$. What is $\det(A^{-1})$?`,
    options: [
      { id: 'a', label: r`$\dfrac15$`, value: 0.2 },
      { id: 'b', label: '$-5$', value: -5, trapExplanation: r`Inverting does not flip the sign; it undoes the scaling.` },
      { id: 'c', label: '$5$', value: 5, trapExplanation: r`$A^{-1}$ undoes $A$, so it must shrink areas by the factor $A$ stretched them.` },
      { id: 'd', label: '$1$', value: 1, trapExplanation: r`1 is $\det(AA^{-1}) = \det I$, not $\det A^{-1}$ alone.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$AA^{-1} = I$, so $\det A \cdot \det A^{-1} = \det I = 1$.`,
      r`$5 \cdot \det A^{-1} = 1$.`,
      r`$\det A^{-1} = \dfrac15$.`,
    ],
    keyConceptTag: 'Multiplicativity of det',
  },
  {
    id: 'la-04-x6',
    difficulty: 2,
    promptText: r`$\det A = 7$. Swapping two rows of $A$ gives a matrix $B$. What is $\det B$?`,
    options: [
      { id: 'a', label: '$-7$', value: -7 },
      { id: 'b', label: '$7$', value: 7, trapExplanation: r`A row swap reverses orientation, which flips the sign.` },
      { id: 'c', label: '$0$', value: 0, trapExplanation: r`Swapping rows keeps them independent; only equal or dependent rows give 0.` },
      { id: 'd', label: '$14$', value: 14, trapExplanation: r`Doubling happens when a row is multiplied by 2, not when two rows are swapped.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Each row swap multiplies the determinant by $-1$.`,
      r`$\det B = -\det A$.`,
      r`$= -7$.`,
    ],
    keyConceptTag: 'Row operations and det',
  },
];
