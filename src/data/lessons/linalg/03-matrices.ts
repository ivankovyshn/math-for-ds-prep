import { defineLesson, r } from '../define.ts';
import { extra } from './03-matrices.extra.ts';
import { practice } from './03-matrices.practice.ts';

export default defineLesson({
  id: 'la-03',
  moduleId: 'linalg',
  title: 'Matrices and matrix multiplication',
  blurb: 'Sizes, products, transpose, matrices as maps',
  minutes: 8,
  lecture: [
    {
      title: 'A matrix is a table — and a machine',
      blocks: [
        {
          kind: 'text',
          text: r`An $m \times n$ matrix is a rectangular table with $m$ rows and $n$ columns. The entry in row $i$ and column $j$ is written $a_{ij}$ — always <i>row first, column second</i>.`,
        },
        {
          kind: 'formula',
          tex: r`A = \begin{pmatrix} a_{11} & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \end{pmatrix} \quad (2 \times 3)`,
        },
        {
          kind: 'text',
          text: r`Adding matrices of the same size and multiplying by a number work entry by entry, just like vectors. The <i>transpose</i> $A^{T}$ swaps rows and columns: $(A^{T})_{ij} = a_{ji}$, so a $2\times 3$ matrix becomes $3 \times 2$.

The real power appears when a matrix <i>acts</i> on a vector.`,
        },
      ],
    },
    {
      title: 'Matrix times vector',
      blocks: [
        {
          kind: 'text',
          text: r`There are two ways to read $A\mathbf{x}$, and both are worth knowing.

• <i>Row view:</i> entry $i$ of $A\mathbf{x}$ is the dot product of row $i$ of $A$ with $\mathbf{x}$.

• <i>Column view:</i> $A\mathbf{x}$ is a linear combination of the columns of $A$, with the entries of $\mathbf{x}$ as coefficients.`,
        },
        {
          kind: 'formula',
          tex: r`\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}\begin{pmatrix} 5 \\ 6 \end{pmatrix} = \begin{pmatrix} 1\cdot5 + 2\cdot6 \\ 3\cdot5 + 4\cdot6 \end{pmatrix} = 5\begin{pmatrix} 1 \\ 3 \end{pmatrix} + 6\begin{pmatrix} 2 \\ 4 \end{pmatrix} = \begin{pmatrix} 17 \\ 39 \end{pmatrix}`,
        },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Columns are images of the basis vectors',
          text: r`$A\mathbf{e}_1$ is the first column of $A$, $A\mathbf{e}_2$ the second, and so on. So to know what a matrix does, look at where it sends $\mathbf{e}_1 = (1, 0)$ and $\mathbf{e}_2 = (0, 1)$ — and to <i>build</i> a matrix for a map, write those images as columns.`,
        },
        { kind: 'diagram', type: 'gridTransform', caption: r`The matrix with columns $(2, 1)$ and $(-1, 1)$ moves $\mathbf{e}_1$ and $\mathbf{e}_2$ to its columns; the whole grid follows. Grid lines stay straight, parallel and evenly spaced — that is what "linear" means.` },
        {
          kind: 'quiz',
          id: 'la-03-q1',
          prompt: r`Compute $\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix} \begin{pmatrix} 1 \\ 1 \end{pmatrix}$.`,
          options: [
            { id: 'a', label: r`$(3, 7)$`, value: [3, 7] },
            { id: 'b', label: r`$(4, 6)$`, value: [4, 6], trapExplanation: r`These are the column sums. Each output entry is a <i>row</i> times the vector.` },
            { id: 'c', label: r`$(1, 4)$`, value: [1, 4], trapExplanation: r`Only the diagonal was used. Row 1 gives $1 + 2 = 3$.` },
          ],
          correctOptionId: 'a',
          explanation: r`Row 1: $1 + 2 = 3$; row 2: $3 + 4 = 7$. Multiplying by $(1, 1)$ adds up the columns $(1, 3) + (2, 4)$.`,
        },
      ],
    },
    {
      title: 'Matrix times matrix',
      blocks: [
        {
          kind: 'text',
          text: r`The product $AB$ is defined only when the number of <i>columns of $A$</i> equals the number of <i>rows of $B$</i>. The inner sizes must match and the outer sizes give the result:`,
        },
        { kind: 'formula', tex: r`(m \times \underline{n}) \cdot (\underline{n} \times p) = m \times p, \qquad (AB)_{ij} = \sum_{k=1}^{n} a_{ik}\,b_{kj}` },
        {
          kind: 'text',
          text: r`In words: entry $(i, j)$ of $AB$ is <i>row $i$ of $A$ dotted with column $j$ of $B$</i>.`,
        },
        {
          kind: 'example',
          title: 'A 2×2 product',
          prompt: r`Compute $AB$ for $A = \begin{pmatrix} 1 & 2 \\ 0 & 1 \end{pmatrix}$ and $B = \begin{pmatrix} 3 & 0 \\ 1 & 1 \end{pmatrix}$.`,
          steps: [
            r`Entry $(1,1)$: row $(1, 2)$ · column $(3, 1)$ $= 3 + 2 = 5$.`,
            r`Entry $(1,2)$: row $(1, 2)$ · column $(0, 1)$ $= 0 + 2 = 2$.`,
            r`Entry $(2,1)$: row $(0, 1)$ · column $(3, 1)$ $= 1$. Entry $(2,2)$: row $(0, 1)$ · column $(0, 1)$ $= 1$.`,
            r`So $AB = \begin{pmatrix} 5 & 2 \\ 1 & 1 \end{pmatrix}$. Now try $BA$ — you will get $\begin{pmatrix} 3 & 6 \\ 1 & 3 \end{pmatrix}$, a different matrix.`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Order matters',
          text: r`In general $AB \ne BA$. Two other habits from ordinary numbers also fail: $AB = 0$ does not force $A = 0$ or $B = 0$, and you may not multiply entry by entry — that is a different operation.`,
        },
        {
          kind: 'quiz',
          id: 'la-03-q2',
          prompt: r`Let $A = \begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$ and $B = \begin{pmatrix} 1 & 0 \\ 1 & 1 \end{pmatrix}$. What is $AB$?`,
          options: [
            { id: 'a', label: r`$\begin{pmatrix} 2 & 1 \\ 1 & 1 \end{pmatrix}$`, value: [2, 1, 1, 1] },
            { id: 'b', label: r`$\begin{pmatrix} 1 & 1 \\ 1 & 2 \end{pmatrix}$`, value: [1, 1, 1, 2], trapExplanation: r`That is $BA$. Matrix multiplication is not commutative.` },
            { id: 'c', label: r`$\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$`, value: [1, 0, 0, 1], trapExplanation: r`Multiplying entry by entry gives this, but a product is rows times columns.` },
          ],
          correctOptionId: 'a',
          explanation: r`$(AB)_{11} = (1, 1) \cdot (1, 1) = 2$, $(AB)_{12} = (1, 1) \cdot (0, 1) = 1$, $(AB)_{21} = (0, 1) \cdot (1, 1) = 1$, $(AB)_{22} = 1$. Note $BA \ne AB$ here.`,
        },
      ],
    },
    {
      title: 'Products as composition',
      blocks: [
        {
          kind: 'text',
          text: r`Why this strange rule? Because it makes $(AB)\mathbf{x} = A(B\mathbf{x})$. The product $AB$ is the single matrix that does "first $B$, then $A$". Read it right to left, like function composition $f(g(x))$.

This also explains the transpose rule: reversing a composition reverses the order.`,
        },
        { kind: 'formula', tex: r`(AB)^{T} = B^{T}A^{T}` },
        {
          kind: 'box',
          variant: 'definition',
          title: 'Identity matrix',
          text: r`$I$ has 1s on the diagonal and 0s elsewhere. It sends every vector to itself, so $AI = IA = A$ — it plays the role of the number 1.`,
        },
        {
          kind: 'quiz',
          id: 'la-03-q3',
          prompt: r`Which matrix reflects the plane in the $y$-axis, $(x, y) \mapsto (-x, y)$?`,
          options: [
            { id: 'a', label: r`$\begin{pmatrix} -1 & 0 \\ 0 & 1 \end{pmatrix}$`, value: [-1, 0, 0, 1] },
            { id: 'b', label: r`$\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$`, value: [1, 0, 0, -1], trapExplanation: r`This flips $y$, i.e. reflects in the $x$-axis.` },
            { id: 'c', label: r`$\begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}$`, value: [0, -1, 1, 0], trapExplanation: r`This is the rotation by $90^\circ$, not a reflection.` },
          ],
          correctOptionId: 'a',
          explanation: r`The columns are the images of the basis vectors: $\mathbf{e}_1 = (1, 0) \mapsto (-1, 0)$ and $\mathbf{e}_2 = (0, 1) \mapsto (0, 1)$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $a_{ij}$: row $i$, column $j$. $A^{T}$ swaps rows and columns.

• $(m\times n)(n\times p) = m \times p$; entry $(i, j)$ = row $i$ · column $j$.

• Columns of $A$ are the images of $\mathbf{e}_1, \mathbf{e}_2, \dots$

• $AB$ means "first $B$, then $A$". Usually $AB \ne BA$, and $(AB)^{T} = B^{T}A^{T}$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
