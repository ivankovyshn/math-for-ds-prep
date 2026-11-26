import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'la-03-x1',
    difficulty: 1,
    promptText: r`$A$ is a $3 \times 2$ matrix and $B$ is a $2 \times 5$ matrix. What is the size of $AB$?`,
    options: [
      { id: 'a', label: r`$3 \times 5$`, value: [3, 5] },
      { id: 'b', label: r`$2 \times 2$`, value: [2, 2], trapExplanation: r`The inner sizes (2 and 2) must match and then disappear. The outer sizes remain.` },
      { id: 'c', label: r`$5 \times 3$`, value: [5, 3], trapExplanation: r`That would be the size of $BA$'s transpose. $AB$ keeps the rows of $A$ and the columns of $B$.` },
      { id: 'd', label: r`$2 \times 5$`, value: [2, 5], trapExplanation: r`$AB$ has as many rows as $A$ (3), not as $B$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$(m \times n)(n \times p) = m \times p$.`,
      r`Here $(3 \times 2)(2 \times 5)$: the inner 2s match.`,
      r`The result is $3 \times 5$.`,
    ],
    keyConceptTag: 'Size rule for products',
  },
  {
    id: 'la-03-x2',
    difficulty: 1,
    promptText: r`Compute $\begin{pmatrix} 2 & 0 \\ 1 & 3 \end{pmatrix} \begin{pmatrix} 1 \\ 2 \end{pmatrix}$.`,
    options: [
      { id: 'a', label: r`$(2, 7)$`, value: [2, 7] },
      { id: 'b', label: r`$(4, 6)$`, value: [4, 6], trapExplanation: r`You used the columns of the matrix as rows. Each output entry is a <i>row</i> times the vector.` },
      { id: 'c', label: r`$(2, 6)$`, value: [2, 6], trapExplanation: r`Only the diagonal entries were used. The second row is $(1, 3)$: $1 \cdot 1 + 3 \cdot 2 = 7$.` },
      { id: 'd', label: r`$(3, 5)$`, value: [3, 5], trapExplanation: r`Adding the vector to the rows is not matrix multiplication.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Row 1: $2 \cdot 1 + 0 \cdot 2 = 2$.`,
      r`Row 2: $1 \cdot 1 + 3 \cdot 2 = 7$.`,
      r`Result $(2, 7)$ — equivalently $1 \cdot (2, 1) + 2 \cdot (0, 3)$, a combination of the columns.`,
    ],
    keyConceptTag: 'Matrix times vector',
  },
  {
    id: 'la-03-x3',
    difficulty: 1,
    promptText: r`What is the transpose of $\begin{pmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{pmatrix}$?`,
    options: [
      { id: 'a', label: r`$\begin{pmatrix} 1 & 4 \\ 2 & 5 \\ 3 & 6 \end{pmatrix}$`, value: [1, 4, 2, 5, 3, 6] },
      { id: 'b', label: r`$\begin{pmatrix} 1 & 2 \\ 3 & 4 \\ 5 & 6 \end{pmatrix}$`, value: [1, 2, 3, 4, 5, 6], trapExplanation: r`The shape is right ($3 \times 2$) but the entries were refilled row by row. Rows must become columns.` },
      { id: 'c', label: r`$\begin{pmatrix} 4 & 5 & 6 \\ 1 & 2 & 3 \end{pmatrix}$`, value: [4, 5, 6, 1, 2, 3], trapExplanation: r`Swapping the rows is not transposing; the transpose of a $2 \times 3$ matrix is $3 \times 2$.` },
      { id: 'd', label: r`$\begin{pmatrix} 3 & 2 & 1 \\ 6 & 5 & 4 \end{pmatrix}$`, value: [3, 2, 1, 6, 5, 4], trapExplanation: r`Reversing each row is a different operation; the transpose flips the matrix across its diagonal.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$(A^T)_{ij} = A_{ji}$: row $i$ of $A$ becomes column $i$ of $A^T$.`,
      r`Row $(1, 2, 3)$ becomes the first column, row $(4, 5, 6)$ the second.`,
      r`$A^T$ is $3 \times 2$ with rows $(1, 4)$, $(2, 5)$, $(3, 6)$.`,
    ],
    keyConceptTag: 'Transpose',
  },
  {
    id: 'la-03-x4',
    difficulty: 2,
    promptText: r`Let $A = \begin{pmatrix} 2 & 1 \\ 0 & 3 \end{pmatrix}$ and $B = \begin{pmatrix} 1 & 4 \\ 2 & -1 \end{pmatrix}$. What is the entry $(AB)_{12}$?`,
    options: [
      { id: 'a', label: '$7$', value: 7 },
      { id: 'b', label: '$6$', value: 6, trapExplanation: r`6 is $(AB)_{21}$ = row 2 of $A$ times column 1 of $B$. The indices are (row 1, column 2).` },
      { id: 'c', label: '$4$', value: 4, trapExplanation: r`$a_{12} \cdot b_{12} = 1 \cdot 4$: matrix entries are not multiplied position by position.` },
      { id: 'd', label: '$9$', value: 9, trapExplanation: r`$1 \cdot (-1) = -1$, not $+1$: $8 - 1 = 7$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$(AB)_{12}$ = row 1 of $A$ times column 2 of $B$.`,
      r`$(2, 1) \cdot (4, -1) = 8 - 1$.`,
      r`$= 7$.`,
    ],
    keyConceptTag: 'Row times column',
  },
  {
    id: 'la-03-x5',
    difficulty: 2,
    promptText: r`Compute $A^2$ for $A = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$.`,
    options: [
      { id: 'a', label: r`$\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$`, value: [1, 0, 0, 1] },
      { id: 'b', label: r`$\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$`, value: [0, 1, 1, 0], trapExplanation: r`Squaring each entry gives this, but $A^2$ means the product $AA$: row times column.` },
      { id: 'c', label: r`$\begin{pmatrix} 2 & 0 \\ 0 & 2 \end{pmatrix}$`, value: [2, 0, 0, 2], trapExplanation: r`Row 1 times column 1 is $0 \cdot 0 + 1 \cdot 1 = 1$, not 2.` },
      { id: 'd', label: r`$\begin{pmatrix} 0 & 2 \\ 2 & 0 \end{pmatrix}$`, value: [0, 2, 2, 0], trapExplanation: r`$A^2$ is not $2A$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$A$ swaps the coordinates: $(x, y) \mapsto (y, x)$.`,
      r`Swapping twice gives back $(x, y)$.`,
      r`So $A^2 = I$. Check one entry: $(A^2)_{11} = 0 \cdot 0 + 1 \cdot 1 = 1$.`,
    ],
    keyConceptTag: 'Matrix powers',
  },
  {
    id: 'la-03-x6',
    difficulty: 2,
    promptText: r`Which matrix stretches the $x$-direction by 2 and leaves the $y$-direction unchanged?`,
    options: [
      { id: 'a', label: r`$\begin{pmatrix} 2 & 0 \\ 0 & 1 \end{pmatrix}$`, value: [2, 0, 0, 1] },
      { id: 'b', label: r`$\begin{pmatrix} 1 & 0 \\ 0 & 2 \end{pmatrix}$`, value: [1, 0, 0, 2], trapExplanation: r`This sends $\mathbf{e}_2$ to $(0, 2)$: it stretches $y$, not $x$.` },
      { id: 'c', label: r`$\begin{pmatrix} 2 & 0 \\ 0 & 2 \end{pmatrix}$`, value: [2, 0, 0, 2], trapExplanation: r`This doubles <i>every</i> vector, so $y$ changes too.` },
      { id: 'd', label: r`$\begin{pmatrix} 0 & 2 \\ 1 & 0 \end{pmatrix}$`, value: [0, 2, 1, 0], trapExplanation: r`The first column (the image of $\mathbf{e}_1$) is $(0, 1)$: this matrix also swaps the axes.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`The columns of a matrix are the images of $\mathbf{e}_1$ and $\mathbf{e}_2$.`,
      r`We need $\mathbf{e}_1 \mapsto (2, 0)$ and $\mathbf{e}_2 \mapsto (0, 1)$.`,
      r`Columns $(2, 0)$ and $(0, 1)$ give $\begin{pmatrix} 2 & 0 \\ 0 & 1 \end{pmatrix}$.`,
    ],
    keyConceptTag: 'Build a matrix from images of basis vectors',
  },
];
