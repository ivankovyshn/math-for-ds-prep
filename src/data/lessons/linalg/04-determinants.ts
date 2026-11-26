import { defineLesson, r } from '../define.ts';

export default defineLesson({
  id: 'la-04',
  moduleId: 'linalg',
  title: 'Determinants',
  blurb: 'Area scaling, 3×3 expansion, properties',
  minutes: 8,
  lecture: [
    {
      title: 'One number that measures stretching',
      blocks: [
        {
          kind: 'text',
          text: r`A $2\times 2$ matrix sends the unit square to a parallelogram spanned by its two columns. The <i>determinant</i> is the factor by which areas change — with a sign that records whether the picture was flipped.`,
        },
        { kind: 'diagram', type: 'detArea', caption: r`$A = \begin{pmatrix} 3 & 1 \\ 1 & 2 \end{pmatrix}$ turns the unit square (area 1) into a parallelogram of area $3\cdot 2 - 1\cdot 1 = 5$.` },
        { kind: 'formula', tex: r`\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = \begin{vmatrix} a & b \\ c & d \end{vmatrix} = ad - bc` },
        {
          kind: 'text',
          text: r`• $|\det A|$ is the area of the image of the unit square (in 3D: the volume of the image of the unit cube).

• $\det A < 0$ means the map flips orientation, like a mirror: going from $\mathbf{e}_1$ to $\mathbf{e}_2$ counter-clockwise becomes clockwise.

• $\det A = 0$ means the square is squashed flat onto a line or a point.`,
        },
      ],
    },
    {
      title: 'Determinants of 3×3 matrices',
      blocks: [
        {
          kind: 'text',
          text: r`Expand along the first row: each entry multiplies the $2\times2$ determinant left after deleting its row and column (its <i>minor</i>), with signs alternating $+,-,+$.`,
        },
        {
          kind: 'formula',
          tex: r`\begin{vmatrix} a & b & c \\ d & e & f \\ g & h & i \end{vmatrix} = a\begin{vmatrix} e & f \\ h & i \end{vmatrix} - b\begin{vmatrix} d & f \\ g & i \end{vmatrix} + c\begin{vmatrix} d & e \\ g & h \end{vmatrix}`,
          caption: r`The sign of position $(i, j)$ is $(-1)^{i+j}$: a chessboard of $+$ and $-$ starting with $+$ in the corner. You may expand along any row or column.`,
        },
        {
          kind: 'example',
          title: 'Expanding along the first row',
          prompt: r`Compute $\det\begin{pmatrix} 2 & 0 & 1 \\ 1 & 3 & 2 \\ 1 & 1 & 2 \end{pmatrix}$.`,
          steps: [
            r`First term: $2\cdot\begin{vmatrix} 3 & 2 \\ 1 & 2 \end{vmatrix} = 2(6 - 2) = 8$.`,
            r`Second term: $-0\cdot(\ldots) = 0$. A zero entry saves work — choose the row with most zeros.`,
            r`Third term: $+1\cdot\begin{vmatrix} 1 & 3 \\ 1 & 1 \end{vmatrix} = 1 - 3 = -2$.`,
            r`$\det = 8 + 0 - 2 = 6$.`,
          ],
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Triangular matrices are free',
          text: r`If all entries below (or above) the diagonal are zero, the determinant is just the product of the diagonal entries. That is why elimination is the fastest way to compute large determinants.`,
        },
      ],
    },
    {
      title: 'Rules that save time',
      blocks: [
        {
          kind: 'text',
          text: r`For $n \times n$ matrices $A$ and $B$:`,
        },
        {
          kind: 'formula',
          tex: r`\det(AB) = \det A\cdot\det B, \qquad \det(A^{T}) = \det A, \qquad \det(A^{-1}) = \frac{1}{\det A}`,
        },
        {
          kind: 'text',
          text: r`Row operations change the determinant in a predictable way:

• swapping two rows multiplies it by $-1$;

• multiplying one row by $c$ multiplies it by $c$;

• adding a multiple of one row to another does <i>not</i> change it.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'det(cA) is not c·det(A)',
          text: r`$cA$ multiplies <i>every</i> row by $c$, and each row contributes one factor. For an $n\times n$ matrix, $\det(cA) = c^{n}\det A$. Doubling a $3\times3$ matrix multiplies the volume by $2^3 = 8$.`,
        },
        {
          kind: 'check',
          prompt: r`$\det A = 4$ for a $2\times 2$ matrix $A$. What is $\det(3A)$, and what is $\det(A^2)$?`,
          answer: r`$\det(3A) = 3^2\cdot 4 = 36$. $\det(A^2) = \det A\cdot\det A = 16$.`,
        },
      ],
    },
    {
      title: 'When the determinant is zero',
      blocks: [
        {
          kind: 'box',
          variant: 'theorem',
          title: 'The big equivalence',
          text: r`For a square matrix $A$ the following say the same thing:

• $\det A = 0$;

• the columns of $A$ are linearly dependent (they lie in a smaller subspace);

• $A\mathbf{x} = \mathbf{0}$ has a non-zero solution;

• $A$ has no inverse.`,
        },
        {
          kind: 'text',
          text: r`Geometrically this is one picture: the matrix squashes space into a lower dimension, so information is lost and cannot be undone. A determinant is the quickest test for that.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $2\times2$: $ad - bc$. $3\times3$: expand along a row with signs $+,-,+$.

• $|\det A|$ = area/volume scaling factor; negative = orientation flipped.

• $\det(AB) = \det A\det B$, $\det A^{T} = \det A$, $\det(cA) = c^{n}\det A$.

• Swap rows → sign flips; adding a multiple of a row → no change.

• $\det A = 0$ ⟺ dependent columns ⟺ not invertible.`,
        },
      ],
    },
  ],
  questions: [
    {
      id: 'la-04-1',
      difficulty: 1,
      promptText: r`Compute $\det\begin{pmatrix} 3 & 1 \\ 4 & 2 \end{pmatrix}$.`,
      options: [
        { id: 'a', label: '$2$', value: 2 },
        { id: 'b', label: '$10$', value: 10, trapExplanation: r`$3\cdot2 + 1\cdot4 = 10$ adds the two products. The determinant subtracts: $ad - bc$.` },
        { id: 'c', label: '$-2$', value: -2, trapExplanation: r`$bc - ad$ has the order reversed. The main diagonal (top-left to bottom-right) comes first.` },
        { id: 'd', label: '$5$', value: 5, trapExplanation: r`$3 + 2 = 5$ is the trace (sum of the diagonal), a different number.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Main diagonal product: $3\cdot 2 = 6$.`,
        r`Other diagonal product: $1\cdot 4 = 4$.`,
        r`$\det = 6 - 4 = 2$.`,
      ],
      keyConceptTag: '2×2 determinant',
    },
    {
      id: 'la-04-2',
      difficulty: 1,
      promptText: r`What is the area of the parallelogram spanned by the vectors $(3, 1)$ and $(1, 2)$?`,
      options: [
        { id: 'a', label: '$5$', value: 5 },
        { id: 'b', label: '$7$', value: 7, trapExplanation: r`$3\cdot2 + 1\cdot1 = 7$ adds the products. The area is $|ad - bc|$.` },
        { id: 'c', label: r`$2.5$`, value: 2.5, trapExplanation: r`Half the determinant is the area of the <i>triangle</i> with these two sides. The parallelogram is twice as large.` },
        { id: 'd', label: '$6$', value: 6, trapExplanation: r`$3\cdot 2$ is the area of a rectangle with sides 3 and 2. The slant of the vectors removes $1\cdot 1$ from it.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Put the vectors in the columns of a matrix: $\begin{pmatrix} 3 & 1 \\ 1 & 2 \end{pmatrix}$.`,
        r`$\det = 3\cdot2 - 1\cdot1 = 5$.`,
        r`Area $= |\det| = 5$.`,
      ],
      keyConceptTag: 'Determinant as area',
    },
    {
      id: 'la-04-3',
      difficulty: 2,
      promptText: r`Compute the determinant.`,
      mathFormula: r`\begin{vmatrix} 2 & 0 & 1 \\ 1 & 3 & 2 \\ 1 & 1 & 2 \end{vmatrix}`,
      options: [
        { id: 'a', label: '$6$', value: 6 },
        { id: 'b', label: '$13$', value: 13, trapExplanation: r`$13$ is only the sum of the three "downward" diagonal products in Sarrus' rule. The three "upward" products (total 7) must be subtracted.` },
        { id: 'c', label: '$20$', value: 20, trapExplanation: r`$13 + 7$ adds the upward products instead of subtracting them.` },
        { id: 'd', label: '$-6$', value: -6, trapExplanation: r`The signs of the cofactors were reversed. Along the first row they are $+,-,+$, starting with $+$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Expand along row 1: $2\begin{vmatrix} 3 & 2 \\ 1 & 2 \end{vmatrix} - 0 + 1\begin{vmatrix} 1 & 3 \\ 1 & 1 \end{vmatrix}$.`,
        r`$= 2(6 - 2) + (1 - 3) = 8 - 2$.`,
        r`$\det = 6$.`,
      ],
      keyConceptTag: '3×3 cofactor expansion',
    },
    {
      id: 'la-04-4',
      difficulty: 2,
      promptText: r`$A$ is a $3\times3$ matrix with $\det A = 3$. What is $\det(2A)$?`,
      options: [
        { id: 'a', label: '$24$', value: 24 },
        { id: 'b', label: '$6$', value: 6, trapExplanation: r`$2\det A$ would be right if only one row were doubled. $2A$ doubles all three rows, giving a factor $2^3$.` },
        { id: 'c', label: '$12$', value: 12, trapExplanation: r`$2^2\cdot 3$ is the rule for a $2\times2$ matrix. The exponent is the size $n$, here 3.` },
        { id: 'd', label: '$5$', value: 5, trapExplanation: r`Scaling a matrix multiplies the determinant; it never adds to it.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$2A$ multiplies each of the 3 rows by 2.`,
        r`Each row multiplication multiplies the determinant by 2: $\det(2A) = 2^3\det A$.`,
        r`$8\cdot 3 = 24$. Geometrically: doubling every edge of a box multiplies its volume by 8.`,
      ],
      keyConceptTag: 'det(cA) = cⁿ det A',
    },
    {
      id: 'la-04-5',
      difficulty: 3,
      promptText: r`$A$ and $B$ are $3\times 3$ matrices with $\det A = 2$ and $\det B = -3$. Compute $\det(A^{T}B^{-1}A^{2})$.`,
      options: [
        { id: 'a', label: r`$-\tfrac83$`, value: -8 / 3 },
        { id: 'b', label: r`$\tfrac83$`, value: 8 / 3, trapExplanation: r`The sign comes from $\det(B^{-1}) = 1/(-3)$, which is negative. Nothing cancels it.` },
        { id: 'c', label: '$-24$', value: -24, trapExplanation: r`$\det(B^{-1})$ is $1/\det B$, not $\det B$. The inverse divides.` },
        { id: 'd', label: r`$-\tfrac43$`, value: -4 / 3, trapExplanation: r`$\det(A^2) = (\det A)^2 = 4$, not $2\det A$. The square applies to the determinant.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`The determinant of a product is the product: $\det(A^T)\cdot\det(B^{-1})\cdot\det(A^2)$.`,
        r`$\det(A^T) = 2$, $\det(B^{-1}) = -\tfrac13$, $\det(A^2) = 2^2 = 4$.`,
        r`$2\cdot(-\tfrac13)\cdot 4 = -\tfrac83$.`,
      ],
      keyConceptTag: 'Multiplicativity of det',
    },
    {
      id: 'la-04-6',
      difficulty: 3,
      promptText: r`For which values of $t$ are the columns of this matrix linearly dependent?`,
      mathFormula: r`\begin{pmatrix} t & 1 & 1 \\ 1 & t & 1 \\ 1 & 1 & t \end{pmatrix}`,
      options: [
        { id: 'a', label: r`$t = 1$ or $t = -2$`, value: [-2, 1] },
        { id: 'b', label: r`$t = -1$ or $t = 2$`, value: [-1, 2], trapExplanation: r`Plug in $t = 2$: all rows sum to 4 and the determinant is $(2-1)^2(2+2) = 4 \ne 0$. The signs of the roots were flipped.` },
        { id: 'c', label: r`Only $t = 1$`, value: [1], trapExplanation: r`At $t = 1$ all columns are equal, which is easy to spot — but $\det = (t - 1)^2(t + 2)$ also vanishes at $t = -2$.` },
        { id: 'd', label: r`$t = 1$ or $t = 2$`, value: [1, 2], trapExplanation: r`$\det$ at $t = 2$ is $8 - 6 + 2 = 4 \ne 0$. The second root comes from the factor $t + 2$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Columns are dependent exactly when $\det = 0$.`,
        r`Expand: $\det = t(t^2 - 1) - (t - 1) + (1 - t) = t^3 - 3t + 2 = (t - 1)^2(t + 2)$.`,
        r`So $\det = 0$ for $t = 1$ (all columns equal) and for $t = -2$ (the columns add up to the zero vector).`,
      ],
      keyConceptTag: 'det = 0 detects dependence',
    },
  ],
});
