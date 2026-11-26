import { defineLesson, r } from '../define.ts';
import { extra } from './08-norms.extra.ts';
import { practice } from './08-norms.practice.ts';

export default defineLesson({
  id: 'la-08',
  moduleId: 'linalg',
  title: 'Norms and orthogonality',
  blurb: 'Ways to measure size, and bases at right angles',
  minutes: 8,
  lecture: [
    {
      title: 'Three ways to measure a vector',
      blocks: [
        {
          kind: 'text',
          text: r`A <i>norm</i> $\|\mathbf{v}\|$ measures the size of a vector. The length from lesson 1 is one norm, but data science uses several, each with its own idea of distance.`,
        },
        { kind: 'formula', tex: r`\|\mathbf{v}\|_2 = \sqrt{v_1^2 + \dots + v_n^2}, \qquad \|\mathbf{v}\|_1 = |v_1| + \dots + |v_n|, \qquad \|\mathbf{v}\|_\infty = \max_i |v_i|` },
        {
          kind: 'example',
          title: 'One vector, three sizes',
          prompt: r`Compute the three norms of $\mathbf{v} = (3, -4)$.`,
          steps: [
            r`$\|\mathbf{v}\|_2 = \sqrt{9 + 16} = 5$: the straight-line length.`,
            r`$\|\mathbf{v}\|_1 = |3| + |-4| = 7$: the distance walking along the grid.`,
            r`$\|\mathbf{v}\|_\infty = \max(3, 4) = 4$: the largest single coordinate. Always $\|\mathbf{v}\|_\infty \le \|\mathbf{v}\|_2 \le \|\mathbf{v}\|_1$.`,
          ],
        },
        {
          kind: 'box',
          variant: 'definition',
          title: 'What makes a norm',
          text: r`• $\|\mathbf{v}\| \ge 0$, and $\|\mathbf{v}\| = 0$ only for $\mathbf{v} = \mathbf{0}$.

• $\|c\mathbf{v}\| = |c|\,\|\mathbf{v}\|$.

• Triangle inequality: $\|\mathbf{u} + \mathbf{v}\| \le \|\mathbf{u}\| + \|\mathbf{v}\|$.`,
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'Norms in machine learning',
          text: r`Penalising $\|\mathbf{w}\|_2^2$ in a regression gives <i>ridge</i> regression; penalising $\|\mathbf{w}\|_1$ gives the <i>lasso</i>, which pushes many weights to exactly zero. The choice of norm also decides what "nearest" means in $k$-nearest neighbours.`,
        },
        {
          kind: 'quiz',
          id: 'la-08-q1',
          prompt: r`What is $\|\mathbf{v}\|_1$ for $\mathbf{v} = (2, -3, 1)$?`,
          options: [
            { id: 'a', label: '$6$', value: 6 },
            { id: 'b', label: '$0$', value: 0, trapExplanation: r`$2 - 3 + 1 = 0$ keeps the sign of $-3$. The L1 norm adds <i>absolute</i> values.` },
            { id: 'c', label: r`$\sqrt{14}$`, value: Math.sqrt(14), trapExplanation: r`$\sqrt{4 + 9 + 1}$ is the L2 norm $\|\mathbf{v}\|_2$.` },
            { id: 'd', label: '$3$', value: 3, trapExplanation: r`3 is the largest absolute entry, $\|\mathbf{v}\|_\infty$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\|\mathbf{v}\|_1 = |2| + |-3| + |1| = 6$.`,
        },
      ],
    },
    {
      title: 'Unit vectors and orthonormal bases',
      blocks: [
        {
          kind: 'text',
          text: r`Dividing a non-zero vector by its length gives a <i>unit vector</i> in the same direction: $\mathbf{v}/\|\mathbf{v}\|$. This is called <i>normalising</i>.`,
        },
        {
          kind: 'box',
          variant: 'definition',
          title: 'Orthonormal',
          text: r`Vectors $\mathbf{q}_1, \dots, \mathbf{q}_k$ are <i>orthonormal</i> if each has length 1 and any two are perpendicular:

$\mathbf{q}_i \cdot \mathbf{q}_j = 0$ for $i \ne j$, and $\mathbf{q}_i \cdot \mathbf{q}_i = 1$.`,
        },
        {
          kind: 'text',
          text: r`An orthonormal basis makes coordinates trivial. If $\mathbf{v} = c_1\mathbf{q}_1 + \dots + c_n\mathbf{q}_n$, take the dot product of both sides with $\mathbf{q}_i$: every term but one vanishes, so $c_i = \mathbf{v}\cdot\mathbf{q}_i$. No system of equations to solve.`,
        },
        {
          kind: 'example',
          title: 'Coordinates by dot products',
          prompt: r`$\mathbf{q}_1 = (\tfrac35, \tfrac45)$ and $\mathbf{q}_2 = (-\tfrac45, \tfrac35)$. Find the coordinates of $\mathbf{v} = (5, 10)$.`,
          steps: [
            r`Orthonormal: $\mathbf{q}_1\cdot\mathbf{q}_2 = -\tfrac{12}{25} + \tfrac{12}{25} = 0$ and both have length $\sqrt{\tfrac{9}{25} + \tfrac{16}{25}} = 1$.`,
            r`$c_1 = \mathbf{v}\cdot\mathbf{q}_1 = 3 + 8 = 11$ and $c_2 = \mathbf{v}\cdot\mathbf{q}_2 = -4 + 6 = 2$.`,
            r`Check: $11\mathbf{q}_1 + 2\mathbf{q}_2 = (\tfrac{33 - 8}{5}, \tfrac{44 + 6}{5}) = (5, 10)$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-08-q2',
          prompt: r`With the same $\mathbf{q}_1, \mathbf{q}_2$, what are the coordinates $(c_1, c_2)$ of $\mathbf{v} = (0, 5)$?`,
          options: [
            { id: 'a', label: '$(4, 3)$', value: [4, 3] },
            { id: 'b', label: '$(3, 4)$', value: [3, 4], trapExplanation: r`$c_1 = \mathbf{v}\cdot\mathbf{q}_1 = 0 \cdot \tfrac35 + 5\cdot\tfrac45 = 4$: the order is swapped.` },
            { id: 'c', label: '$(20, 15)$', value: [20, 15], trapExplanation: r`That uses $(3, 4)$ and $(-4, 3)$, which have length 5. Dot with the unit vectors $\mathbf{q}_i$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$c_1 = 5 \cdot \tfrac45 = 4$ and $c_2 = 5\cdot\tfrac35 = 3$. Check: $4\mathbf{q}_1 + 3\mathbf{q}_2 = (\tfrac{12 - 12}{5}, \tfrac{16 + 9}{5}) = (0, 5)$.`,
        },
      ],
    },
    {
      title: 'Orthogonal matrices',
      blocks: [
        {
          kind: 'text',
          text: r`Put an orthonormal basis into the columns of a square matrix $Q$. Entry $(i, j)$ of $Q^TQ$ is $\mathbf{q}_i\cdot\mathbf{q}_j$, so $Q^TQ = I$.`,
        },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Orthogonal matrix',
          text: r`A square $Q$ with orthonormal columns satisfies:

• $Q^{-1} = Q^T$ — inverting costs nothing;

• $\|Q\mathbf{x}\| = \|\mathbf{x}\|$ and $Q\mathbf{x}\cdot Q\mathbf{y} = \mathbf{x}\cdot\mathbf{y}$: lengths and angles are preserved;

• $\det Q = \pm 1$.`,
        },
        {
          kind: 'text',
          text: r`Rotations ($\det Q = 1$) and reflections ($\det Q = -1$) are orthogonal. They never amplify rounding errors, which is why numerical algorithms such as QR and the SVD are built from them.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Perpendicular columns are not enough',
          text: r`The columns must also have length 1. $\begin{pmatrix} 2 & 0 \\ 0 & 1 \end{pmatrix}$ has perpendicular columns but stretches: $Q^TQ = \begin{pmatrix} 4 & 0 \\ 0 & 1 \end{pmatrix} \ne I$.`,
        },
        {
          kind: 'quiz',
          id: 'la-08-q3',
          prompt: r`Which matrix is orthogonal?`,
          options: [
            { id: 'a', label: r`$\tfrac15\begin{pmatrix} 3 & -4 \\ 4 & 3 \end{pmatrix}$` },
            { id: 'b', label: r`$\begin{pmatrix} 3 & -4 \\ 4 & 3 \end{pmatrix}$`, trapExplanation: r`The columns are perpendicular but have length 5, so $Q^TQ = 25I$.` },
            { id: 'c', label: r`$\begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$`, trapExplanation: r`$\det = 1$ is not enough: the columns $(1, 0)$ and $(1, 1)$ are not perpendicular.` },
            { id: 'd', label: r`$\tfrac12\begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix}$`, trapExplanation: r`The two columns are equal, so they are not perpendicular (and $\det = 0$).` },
          ],
          correctOptionId: 'a',
          explanation: r`The columns $(\tfrac35, \tfrac45)$ and $(-\tfrac45, \tfrac35)$ are perpendicular unit vectors: this is a rotation.`,
        },
      ],
    },
    {
      title: 'Gram–Schmidt',
      blocks: [
        {
          kind: 'text',
          text: r`Any basis can be straightened into an orthogonal one. Keep the first vector; from each next vector subtract its components along the vectors already chosen; normalise at the end.`,
        },
        { kind: 'formula', tex: r`\mathbf{u}_1 = \mathbf{v}_1, \qquad \mathbf{u}_2 = \mathbf{v}_2 - \frac{\mathbf{v}_2\cdot\mathbf{u}_1}{\mathbf{u}_1\cdot\mathbf{u}_1}\,\mathbf{u}_1` },
        {
          kind: 'example',
          title: 'Two vectors in 3D',
          prompt: r`Apply Gram–Schmidt to $\mathbf{v}_1 = (1, 1, 0)$ and $\mathbf{v}_2 = (2, 0, 1)$.`,
          steps: [
            r`$\mathbf{u}_1 = (1, 1, 0)$; $\mathbf{v}_2\cdot\mathbf{u}_1 = 2$ and $\mathbf{u}_1\cdot\mathbf{u}_1 = 2$, so the coefficient is 1.`,
            r`$\mathbf{u}_2 = (2, 0, 1) - 1\cdot(1, 1, 0) = (1, -1, 1)$. Check: $\mathbf{u}_1\cdot\mathbf{u}_2 = 1 - 1 + 0 = 0$. ✓`,
            r`Normalise: $\mathbf{q}_1 = \tfrac{1}{\sqrt2}(1, 1, 0)$, $\mathbf{q}_2 = \tfrac{1}{\sqrt3}(1, -1, 1)$.`,
          ],
        },
        {
          kind: 'text',
          text: r`The subtracted part is the <i>projection</i> of $\mathbf{v}_2$ onto $\mathbf{u}_1$ — the next lesson is about exactly that. With more vectors, subtract the component along every earlier $\mathbf{u}$. Written with matrices, Gram–Schmidt is the QR factorisation $A = QR$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $\|\mathbf{v}\|_2 = \sqrt{\sum v_i^2}$, $\|\mathbf{v}\|_1 = \sum |v_i|$, $\|\mathbf{v}\|_\infty = \max |v_i|$.

• Unit vector: $\mathbf{v}/\|\mathbf{v}\|$. Orthonormal: unit length and pairwise perpendicular.

• In an orthonormal basis the coordinates are dot products: $c_i = \mathbf{v}\cdot\mathbf{q}_i$.

• Orthogonal matrix: $Q^TQ = I$, $Q^{-1} = Q^T$, lengths and angles preserved.

• Gram–Schmidt: $\mathbf{u}_2 = \mathbf{v}_2 - \frac{\mathbf{v}_2\cdot\mathbf{u}_1}{\mathbf{u}_1\cdot\mathbf{u}_1}\mathbf{u}_1$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
