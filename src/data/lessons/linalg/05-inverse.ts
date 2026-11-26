import { defineLesson, r } from '../define.ts';

export default defineLesson({
  id: 'la-05',
  moduleId: 'linalg',
  title: 'The inverse matrix',
  blurb: 'Undoing a map, 2×2 formula, Gauss–Jordan',
  minutes: 7,
  lecture: [
    {
      title: 'Undoing a matrix',
      blocks: [
        {
          kind: 'text',
          text: r`For numbers, dividing by $a$ undoes multiplying by $a$ — as long as $a \ne 0$. For a square matrix the role of $1/a$ is played by the <i>inverse</i> $A^{-1}$: the matrix that sends every output of $A$ back to its input.`,
        },
        { kind: 'formula', tex: r`A^{-1}A = AA^{-1} = I` },
        { kind: 'diagram', type: 'inverseUndo' },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'When does an inverse exist?',
          text: r`Only for square matrices, and exactly when $\det A \ne 0$. If $\det A = 0$, the map squashes space flat: different inputs land on the same output, and no matrix can tell them apart again. Such a matrix is called <i>singular</i>.`,
        },
      ],
    },
    {
      title: 'The 2×2 formula',
      blocks: [
        {
          kind: 'text',
          text: r`For $2\times 2$ matrices there is a formula worth memorising: swap the diagonal entries, change the signs of the other two, and divide by the determinant.`,
        },
        { kind: 'formula', tex: r`\begin{pmatrix} a & b \\ c & d \end{pmatrix}^{-1} = \frac{1}{ad - bc}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}` },
        {
          kind: 'example',
          title: 'Inverting and checking',
          prompt: r`Find the inverse of $A = \begin{pmatrix} 2 & 1 \\ 5 & 3 \end{pmatrix}$.`,
          steps: [
            r`$\det A = 2\cdot3 - 1\cdot5 = 1$, so the inverse exists.`,
            r`Swap the diagonal, negate the off-diagonal: $\begin{pmatrix} 3 & -1 \\ -5 & 2 \end{pmatrix}$; dividing by 1 changes nothing.`,
            r`Check: $\begin{pmatrix} 2 & 1 \\ 5 & 3 \end{pmatrix}\begin{pmatrix} 3 & -1 \\ -5 & 2 \end{pmatrix} = \begin{pmatrix} 6 - 5 & -2 + 2 \\ 15 - 15 & -5 + 6 \end{pmatrix} = I$. ✓`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Not entry by entry',
          text: r`$A^{-1}$ is <i>not</i> the matrix of reciprocals $1/a_{ij}$. Multiply your answer by $A$: if you do not get $I$, it is not the inverse.`,
        },
      ],
    },
    {
      title: 'Gauss–Jordan for larger matrices',
      blocks: [
        {
          kind: 'text',
          text: r`Write $A$ and $I$ side by side and row-reduce until the left half becomes $I$. The same row operations turn the right half into $A^{-1}$.`,
        },
        { kind: 'formula', tex: r`(A \mid I) \;\xrightarrow{\text{row operations}}\; (I \mid A^{-1})` },
        {
          kind: 'text',
          text: r`Why it works: row operations are themselves multiplications by matrices. If their combined effect turns $A$ into $I$, that combined matrix <i>is</i> $A^{-1}$ — and applied to $I$ it gives $A^{-1}$ itself. If a zero row appears on the left, $A$ is singular and there is no inverse.`,
        },
        {
          kind: 'check',
          prompt: r`What is the inverse of the diagonal matrix $\begin{pmatrix} 2 & 0 & 0 \\ 0 & 5 & 0 \\ 0 & 0 & -1 \end{pmatrix}$?`,
          answer: r`Each axis is scaled separately, so undo each scaling: $\begin{pmatrix} 1/2 & 0 & 0 \\ 0 & 1/5 & 0 \\ 0 & 0 & -1 \end{pmatrix}$. For diagonal matrices — and only for them — inverting entry by entry is correct.`,
        },
      ],
    },
    {
      title: 'Using the inverse',
      blocks: [
        {
          kind: 'text',
          text: r`If $A$ is invertible, the system $A\mathbf{x} = \mathbf{b}$ has exactly one solution for every $\mathbf{b}$: multiply both sides by $A^{-1}$ <i>on the left</i>.`,
        },
        { kind: 'formula', tex: r`A\mathbf{x} = \mathbf{b} \quad\Longrightarrow\quad \mathbf{x} = A^{-1}\mathbf{b}` },
        {
          kind: 'text',
          text: r`Rules for inverses follow from "undo in reverse order" — to undo putting on socks and then shoes, take off the shoes first:`,
        },
        { kind: 'formula', tex: r`(AB)^{-1} = B^{-1}A^{-1}, \qquad (A^{T})^{-1} = (A^{-1})^{T}, \qquad \det(A^{-1}) = \frac{1}{\det A}` },
        {
          kind: 'box',
          variant: 'tip',
          title: 'In practice',
          text: r`Computers rarely form $A^{-1}$ explicitly; solving $A\mathbf{x} = \mathbf{b}$ by elimination is faster and more accurate. The inverse is mainly a thinking tool — and the formula above is what you use by hand.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $A^{-1}A = AA^{-1} = I$; it exists ⟺ $A$ is square and $\det A \ne 0$.

• $2\times2$: swap the diagonal, negate the rest, divide by $ad - bc$.

• Larger: $(A \mid I) \to (I \mid A^{-1})$ by row operations.

• $\mathbf{x} = A^{-1}\mathbf{b}$; $(AB)^{-1} = B^{-1}A^{-1}$; $\det A^{-1} = 1/\det A$.`,
        },
      ],
    },
  ],
  questions: [
    {
      id: 'la-05-1',
      difficulty: 1,
      promptText: r`Find the inverse of $A = \begin{pmatrix} 2 & 1 \\ 5 & 3 \end{pmatrix}$.`,
      options: [
        { id: 'a', label: r`$\begin{pmatrix} 3 & -1 \\ -5 & 2 \end{pmatrix}$`, value: [3, -1, -5, 2] },
        { id: 'b', label: r`$\begin{pmatrix} 3 & 1 \\ 5 & 2 \end{pmatrix}$`, value: [3, 1, 5, 2], trapExplanation: r`The diagonal was swapped but the off-diagonal entries kept their signs. Check: the top-right entry of $A$ times this is $2 + 2 = 4$, not $0$.` },
        { id: 'c', label: r`$\begin{pmatrix} -3 & 1 \\ 5 & -2 \end{pmatrix}$`, value: [-3, 1, 5, -2], trapExplanation: r`This is $-A^{-1}$: the signs were changed on the diagonal instead of off it. The product with $A$ is $-I$.` },
        { id: 'd', label: r`$\begin{pmatrix} 1/2 & 1 \\ 1/5 & 1/3 \end{pmatrix}$`, value: [1 / 2, 1, 1 / 5, 1 / 3], trapExplanation: r`Inverting each entry is not matrix inversion. Multiply it by $A$ and you will not get $I$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$\det A = 6 - 5 = 1$.`,
        r`Swap $2 \leftrightarrow 3$ and negate $1$ and $5$: $\begin{pmatrix} 3 & -1 \\ -5 & 2 \end{pmatrix}$, divided by $1$.`,
        r`Check: $AA^{-1} = \begin{pmatrix} 6-5 & -2+2 \\ 15-15 & -5+6 \end{pmatrix} = I$. ✓`,
      ],
      keyConceptTag: '2×2 inverse formula',
    },
    {
      id: 'la-05-2',
      difficulty: 1,
      promptText: r`Which of these matrices has <i>no</i> inverse?`,
      options: [
        { id: 'a', label: r`$\begin{pmatrix} 2 & 4 \\ 1 & 2 \end{pmatrix}$` },
        { id: 'b', label: r`$\begin{pmatrix} 2 & 4 \\ 1 & 3 \end{pmatrix}$`, trapExplanation: r`$\det = 6 - 4 = 2 \ne 0$, so it is invertible. It only looks similar to the singular one.` },
        { id: 'c', label: r`$\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$`, trapExplanation: r`Zeros on the diagonal do not matter. $\det = -1$; this matrix swaps the coordinates and is its own inverse.` },
        { id: 'd', label: r`$\begin{pmatrix} 1 & 0 \\ 0 & 5 \end{pmatrix}$`, trapExplanation: r`A diagonal matrix with non-zero diagonal is invertible: $\det = 5$, and the inverse has $1$ and $\tfrac15$ on the diagonal.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`A matrix is invertible exactly when its determinant is non-zero.`,
        r`$\det\begin{pmatrix} 2 & 4 \\ 1 & 2 \end{pmatrix} = 4 - 4 = 0$; the other three have determinants $2$, $-1$ and $5$.`,
        r`Reason: the first column $(2, 1)$ is half of the second $(4, 2)$, so the map squashes the plane onto a line.`,
      ],
      keyConceptTag: 'Invertible ⟺ det ≠ 0',
    },
    {
      id: 'la-05-3',
      difficulty: 2,
      promptText: r`$A = \begin{pmatrix} 1 & 2 \\ 3 & 7 \end{pmatrix}$ has $A^{-1} = \begin{pmatrix} 7 & -2 \\ -3 & 1 \end{pmatrix}$. Solve $A\mathbf{x} = \begin{pmatrix} 3 \\ 10 \end{pmatrix}$.`,
      options: [
        { id: 'a', label: r`$\mathbf{x} = (1, 1)$`, value: [1, 1] },
        { id: 'b', label: r`$\mathbf{x} = (-9, 4)$`, value: [-9, 4], trapExplanation: r`This is $\mathbf{b}^TA^{-1}$: the vector was multiplied from the left as a row. The inverse must stand on the left: $\mathbf{x} = A^{-1}\mathbf{b}$.` },
        { id: 'c', label: r`$\mathbf{x} = (23, 79)$`, value: [23, 79], trapExplanation: r`This is $A\mathbf{b}$. To undo $A$ you multiply by $A^{-1}$, not by $A$ again.` },
        { id: 'd', label: r`$\mathbf{x} = (1, -1)$`, value: [1, -1], trapExplanation: r`Check: $A(1, -1) = (1 - 2,\ 3 - 7) = (-1, -4) \ne (3, 10)$. A sign was lost in the second row.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$\mathbf{x} = A^{-1}\mathbf{b} = \begin{pmatrix} 7 & -2 \\ -3 & 1 \end{pmatrix}\begin{pmatrix} 3 \\ 10 \end{pmatrix}$.`,
        r`$= (21 - 20,\ -9 + 10) = (1, 1)$.`,
        r`Check: $A(1, 1) = (1 + 2,\ 3 + 7) = (3, 10)$. ✓`,
      ],
      keyConceptTag: 'Solving with the inverse',
    },
    {
      id: 'la-05-4',
      difficulty: 2,
      promptText: r`$A^{-1} = \begin{pmatrix} 1 & 2 \\ 0 & 1 \end{pmatrix}$ and $B^{-1} = \begin{pmatrix} 1 & 0 \\ 3 & 1 \end{pmatrix}$. What is $(AB)^{-1}$?`,
      options: [
        { id: 'a', label: r`$\begin{pmatrix} 1 & 2 \\ 3 & 7 \end{pmatrix}$`, value: [1, 2, 3, 7] },
        { id: 'b', label: r`$\begin{pmatrix} 7 & 2 \\ 3 & 1 \end{pmatrix}$`, value: [7, 2, 3, 1], trapExplanation: r`This is $A^{-1}B^{-1}$. Undoing "first $B$, then $A$" means undoing $A$ first: $(AB)^{-1} = B^{-1}A^{-1}$.` },
        { id: 'c', label: r`$\begin{pmatrix} 2 & 2 \\ 3 & 2 \end{pmatrix}$`, value: [2, 2, 3, 2], trapExplanation: r`Adding the inverses has no meaning here. The inverse of a product is a product of inverses.` },
        { id: 'd', label: r`$\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$`, value: [1, 0, 0, 1], trapExplanation: r`$I$ would be the inverse only if $AB = I$, i.e. if $B = A^{-1}$, which is not the case.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$(AB)^{-1} = B^{-1}A^{-1}$ — reverse order.`,
        r`$B^{-1}A^{-1} = \begin{pmatrix} 1 & 0 \\ 3 & 1 \end{pmatrix}\begin{pmatrix} 1 & 2 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1 & 2 \\ 3 & 6 + 1 \end{pmatrix}$.`,
        r`$(AB)^{-1} = \begin{pmatrix} 1 & 2 \\ 3 & 7 \end{pmatrix}$.`,
      ],
      keyConceptTag: 'Inverse of a product',
    },
    {
      id: 'la-05-5',
      difficulty: 3,
      promptText: r`Let $A = \begin{pmatrix} 1 & 2 & 3 \\ 0 & 1 & 4 \\ 0 & 0 & 1 \end{pmatrix}$. What is the entry in row 1, column 3 of $A^{-1}$?`,
      options: [
        { id: 'a', label: '$5$', value: 5 },
        { id: 'b', label: '$-3$', value: -3, trapExplanation: r`Negating the entry works only when there is a single off-diagonal entry. Here clearing the $2$ in row 1 changes the third entry too: $3 - 2\cdot4 = -5$, and then the sign flips.` },
        { id: 'c', label: r`$\tfrac13$`, value: 1 / 3, trapExplanation: r`Reciprocals of entries have nothing to do with the inverse (except for diagonal matrices).` },
        { id: 'd', label: '$-5$', value: -5, trapExplanation: r`$-5$ appears halfway through: after $R_1 - 2R_2$ the row is $(1, 0, -5)$. To clear it you add $5R_3$, so the inverse gets $+5$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Gauss–Jordan on $(A \mid I)$ from the bottom up: $R_2 \to R_2 - 4R_3$ gives the right half row 2 $= (0, 1, -4)$.`,
        r`$R_1 \to R_1 - 3R_3$ gives right row 1 $= (1, 0, -3)$; then $R_1 \to R_1 - 2R_2$ gives $(1, -2, -3 + 8) = (1, -2, 5)$.`,
        r`So $A^{-1} = \begin{pmatrix} 1 & -2 & 5 \\ 0 & 1 & -4 \\ 0 & 0 & 1 \end{pmatrix}$ and the entry is $5$. Check row 1 · column 3 of $A$: $1\cdot3 - 2\cdot4 + 5\cdot1 = 0$. ✓`,
      ],
      keyConceptTag: 'Gauss–Jordan inverse',
    },
    {
      id: 'la-05-6',
      difficulty: 3,
      promptText: r`$A$ is a $3\times3$ matrix with $\det(2A) = 40$. What is $\det(A^{-1})$?`,
      options: [
        { id: 'a', label: r`$\tfrac15$`, value: 1 / 5 },
        { id: 'b', label: r`$\tfrac1{20}$`, value: 1 / 20, trapExplanation: r`From $\det(2A) = 40$ you cannot conclude $\det A = 20$: scaling a $3\times3$ matrix by 2 multiplies its determinant by $2^3 = 8$.` },
        { id: 'c', label: r`$\tfrac1{40}$`, value: 1 / 40, trapExplanation: r`$\tfrac1{40}$ is $\det\big((2A)^{-1}\big)$, the inverse of $2A$, not of $A$.` },
        { id: 'd', label: '$5$', value: 5, trapExplanation: r`$5$ is $\det A$. The inverse has the reciprocal determinant.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$\det(2A) = 2^3\det A = 8\det A = 40$, so $\det A = 5$.`,
        r`$\det(A^{-1}) = \dfrac{1}{\det A}$ because $\det A\cdot\det A^{-1} = \det I = 1$.`,
        r`$\det(A^{-1}) = \tfrac15$.`,
      ],
      keyConceptTag: 'det of the inverse',
    },
  ],
});
