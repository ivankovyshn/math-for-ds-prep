import { defineLesson, r } from '../define.ts';
import { extra } from './05-inverse.extra.ts';
import { practice } from './05-inverse.practice.ts';

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
        {
          kind: 'quiz',
          id: 'la-05-q1',
          prompt: r`$A = 2I$ doubles every vector. What is $A^{-1}$?`,
          options: [
            { id: 'a', label: r`$\tfrac12 I$`, value: [0.5, 0, 0, 0.5] },
            { id: 'b', label: r`$-2I$`, value: [-2, 0, 0, -2], trapExplanation: r`$-2I$ doubles and flips; it does not bring vectors back.` },
            { id: 'c', label: r`$2I$`, value: [2, 0, 0, 2], trapExplanation: r`Applying $2I$ twice gives $4I$, not $I$.` },
          ],
          correctOptionId: 'a',
          explanation: r`To undo "double" you halve: $(2I)(\tfrac12 I) = I$.`,
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
        {
          kind: 'quiz',
          id: 'la-05-q2',
          prompt: r`What is the inverse of $\begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$?`,
          options: [
            { id: 'a', label: r`$\begin{pmatrix} 1 & -1 \\ 0 & 1 \end{pmatrix}$`, value: [1, -1, 0, 1] },
            { id: 'b', label: r`$\begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$`, value: [1, 1, 0, 1], trapExplanation: r`Its square is $\begin{pmatrix} 1 & 2 \\ 0 & 1 \end{pmatrix} \ne I$, so it is not its own inverse.` },
            { id: 'c', label: r`$\begin{pmatrix} -1 & 1 \\ 0 & -1 \end{pmatrix}$`, value: [-1, 1, 0, -1], trapExplanation: r`Only the off-diagonal entries change sign; the diagonal is swapped (here both are 1).` },
          ],
          correctOptionId: 'a',
          explanation: r`$\det = 1$. Swap the diagonal, negate the off-diagonal, divide by 1: $\begin{pmatrix} 1 & -1 \\ 0 & 1 \end{pmatrix}$ — the opposite shear.`,
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
          kind: 'quiz',
          id: 'la-05-q3',
          prompt: r`What is the inverse of the diagonal matrix $\operatorname{diag}(2, 5, -1)$?`,
          options: [
            { id: 'a', label: r`$\operatorname{diag}(1/2,\ 1/5,\ -1)$`, value: [0.5, 0, 0, 0, 0.2, 0, 0, 0, -1] },
            { id: 'b', label: r`$\operatorname{diag}(-2,\ -5,\ 1)$`, value: [-2, 0, 0, 0, -5, 0, 0, 0, 1], trapExplanation: r`Negating is not inverting. Each scaling must be divided out.` },
            { id: 'c', label: r`$\operatorname{diag}(1/2,\ 1/5,\ 1)$`, value: [0.5, 0, 0, 0, 0.2, 0, 0, 0, 1], trapExplanation: r`$1/(-1) = -1$: a flip is undone by the same flip.` },
          ],
          correctOptionId: 'a',
          explanation: r`Each axis is scaled separately, so undo each scaling. For diagonal matrices — and only for them — inverting entry by entry is correct.`,
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
  extra,
  questions: practice,
});
