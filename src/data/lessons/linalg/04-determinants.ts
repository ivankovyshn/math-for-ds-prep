import { defineLesson, r } from '../define.ts';
import { extra } from './04-determinants.extra.ts';
import { practice } from './04-determinants.practice.ts';

export default defineLesson({
  id: 'la-04',
  moduleId: 'linalg',
  title: 'Determinants',
  blurb: 'Area scaling, 3×3 expansion, properties',
  minutes: 8,
  deeper: [
    { title: 'The determinant', url: 'https://www.3blue1brown.com/lessons/determinant', source: '3Blue1Brown · animated video lesson' },
  ],
  lecture: [
    {
      title: 'One number that measures stretching',
      covers: ['1', '2', 'x1', 'x3'],
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
        {
          kind: 'quiz',
          id: 'la-04-q1',
          prompt: r`Compute $\det\begin{pmatrix} 2 & 1 \\ 1 & 3 \end{pmatrix}$.`,
          options: [
            { id: 'a', label: '$5$', value: 5 },
            { id: 'b', label: '$7$', value: 7, trapExplanation: r`$ad + bc$: the second product must be subtracted.` },
            { id: 'c', label: '$6$', value: 6, trapExplanation: r`Only $ad = 6$ was computed; subtract $bc = 1$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$ad - bc = 2 \cdot 3 - 1 \cdot 1 = 5$: this matrix stretches every area by a factor of 5.`,
        },
      ],
    },
    {
      title: 'Determinants of 3×3 matrices',
      covers: ['3', 'x4'],
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
        {
          kind: 'quiz',
          id: 'la-04-q2',
          prompt: r`Compute $\det\begin{pmatrix} 2 & 5 & 1 \\ 0 & 3 & 7 \\ 0 & 0 & 4 \end{pmatrix}$.`,
          options: [
            { id: 'a', label: '$24$', value: 24 },
            { id: 'b', label: '$9$', value: 9, trapExplanation: r`9 is the sum of the diagonal (the trace). The determinant of a triangular matrix is the <i>product</i>.` },
            { id: 'c', label: '$0$', value: 0, trapExplanation: r`Zeros below the diagonal do not make the determinant vanish.` },
          ],
          correctOptionId: 'a',
          explanation: r`Expanding along the first column leaves only $2 \cdot \det\begin{pmatrix} 3 & 7 \\ 0 & 4 \end{pmatrix} = 2 \cdot 12 = 24$ — the product of the diagonal.`,
        },
      ],
    },
    {
      title: 'Rules that save time',
      covers: ['4', '5', 'x5', 'x6'],
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
          kind: 'quiz',
          id: 'la-04-q3',
          prompt: r`$\det A = 4$ for a $2\times 2$ matrix $A$. What is $\det(3A)$?`,
          options: [
            { id: 'a', label: '$36$', value: 36 },
            { id: 'b', label: '$12$', value: 12, trapExplanation: r`$3A$ multiplies <i>each</i> of the 2 rows by 3, so the determinant gains a factor $3^2$, not 3.` },
            { id: 'c', label: '$108$', value: 108, trapExplanation: r`The power is the size of the matrix, $n = 2$: $3^2 \cdot 4$, not $3^3 \cdot 4$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\det(3A) = 3^2\cdot 4 = 36$. Similarly $\det(A^2) = \det A\cdot\det A = 16$.`,
        },
      ],
    },
    {
      title: 'When the determinant is zero',
      covers: ['6', 'x2'],
      blocks: [
        {
          kind: 'box',
          variant: 'theorem',
          title: 'The big equivalence',
          text: r`For a square matrix $A$ the following say the same thing:

• $\det A = 0$;

• the columns of $A$ are <i>linearly dependent</i>: one of them is a combination of the others, so together they lie in a plane or a line instead of filling space (the lesson on independence and rank makes this precise);

• $A\mathbf{x} = \mathbf{0}$ has a non-zero solution;

• $A$ has no inverse.`,
        },
        {
          kind: 'text',
          text: r`Geometrically this is one picture: the matrix squashes space into a lower dimension, so information is lost and cannot be undone. A determinant is the quickest test for that.`,
        },
        {
          kind: 'example',
          title: 'For which t is the determinant zero?',
          prompt: r`For which $t$ are the columns of $A = \begin{pmatrix} t & 1 & 1 \\ 1 & t & 1 \\ 1 & 1 & t \end{pmatrix}$ dependent?`,
          steps: [
            r`Expand along the first row: $t(t^2 - 1) - 1\cdot(t - 1) + 1\cdot(1 - t) = t^3 - 3t + 2$.`,
            r`A cubic: look for a simple root among the divisors of the constant term, $\pm1, \pm2$. $t = 1$ gives $1 - 3 + 2 = 0$.`,
            r`Divide by $t - 1$: $t^3 - 3t + 2 = (t - 1)(t^2 + t - 2) = (t - 1)^2(t + 2)$.`,
            r`$\det A = 0$ exactly for $t = 1$ and $t = -2$: there the columns are dependent. (At $t = 1$ all three columns are equal.)`,
          ],
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
  extra,
  questions: practice,
});
