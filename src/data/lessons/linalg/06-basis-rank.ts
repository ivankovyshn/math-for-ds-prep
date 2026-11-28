import { defineLesson, r } from '../define.ts';
import { extra } from './06-basis-rank.extra.ts';
import { practice } from './06-basis-rank.practice.ts';

export default defineLesson({
  id: 'la-06',
  moduleId: 'linalg',
  title: 'Independence, basis and rank',
  blurb: 'How many directions a set of vectors really has',
  minutes: 8,
  deeper: [
    { title: 'Linear combinations, span, and basis vectors', url: 'https://www.3blue1brown.com/lessons/span', source: '3Blue1Brown · animated video lesson' },
    { title: 'Independence, basis and dimension', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/independence-basis-and-dimension/', source: 'MIT OpenCourseWare 18.06SC (Gilbert Strang) · lecture video, notes and problems' },
  ],
  lecture: [
    {
      title: 'Linear independence',
      covers: ['2', 'x1'],
      blocks: [
        {
          kind: 'text',
          text: r`Some sets of vectors contain redundancy: one of them can be built from the others and adds no new direction. Independence is the precise way to say "no redundancy".`,
        },
        {
          kind: 'box',
          variant: 'definition',
          title: 'Linearly independent',
          text: r`Vectors $\mathbf{v}_1, \dots, \mathbf{v}_k$ are <i>linearly independent</i> if the only way to get the zero vector is the trivial one:

$c_1\mathbf{v}_1 + \dots + c_k\mathbf{v}_k = \mathbf{0}$ forces $c_1 = \dots = c_k = 0$.

Otherwise they are <i>dependent</i>: some non-trivial combination gives $\mathbf{0}$, and then at least one vector is a combination of the others.`,
        },
        { kind: 'diagram', type: 'independence' },
        {
          kind: 'text',
          text: r`Quick tests:

• Two vectors are dependent exactly when one is a multiple of the other.

• Any set containing $\mathbf{0}$ is dependent ($1\cdot\mathbf{0} = \mathbf{0}$).

• $n$ vectors in $\mathbb{R}^n$ are independent exactly when the matrix with these columns has $\det \ne 0$.

• <i>More</i> than $n$ vectors in $\mathbb{R}^n$ are always dependent.`,
        },
        {
          kind: 'quiz',
          id: 'la-06-q1',
          prompt: r`Are $(1, 2)$ and $(2, 4)$ linearly independent?`,
          options: [
            { id: 'a', label: r`No: $(2, 4) = 2 \cdot (1, 2)$` },
            { id: 'b', label: 'Yes: they are two different vectors', trapExplanation: r`Different is not enough. Independence fails when one vector is a combination of the others.` },
            { id: 'c', label: 'Yes: neither is the zero vector', trapExplanation: r`Non-zero vectors can still be parallel, and parallel vectors are dependent.` },
          ],
          correctOptionId: 'a',
          explanation: r`$2(1, 2) - (2, 4) = \mathbf{0}$ is a non-trivial combination equal to zero, so the vectors are dependent: they lie on one line.`,
        },
      ],
    },
    {
      title: 'Basis and dimension',
      covers: ['6', 'x3', 'x6'],
      blocks: [
        {
          kind: 'box',
          variant: 'definition',
          title: 'Basis',
          text: r`A <i>basis</i> of a space $V$ is a set of vectors that is linearly independent <i>and</i> spans $V$. Every vector of $V$ is then a combination of the basis vectors in <i>exactly one</i> way.`,
        },
        {
          kind: 'text',
          text: r`A space has many bases, but they all have the same number of vectors. That number is the <i>dimension</i> of the space. The standard basis $\mathbf{e}_1, \dots, \mathbf{e}_n$ shows that $\dim\mathbb{R}^n = n$.

The unique coefficients are the <i>coordinates</i> of a vector in that basis. Changing the basis changes the coordinates, not the vector.`,
        },
        { kind: 'diagram', type: 'basisCoords', caption: r`In the basis $\mathbf{b}_1 = (2, 1)$, $\mathbf{b}_2 = (1, 2)$ the vector $(4, 5)$ has coordinates $(1, 2)$: one step along $\mathbf{b}_1$, two along $\mathbf{b}_2$.` },
        {
          kind: 'example',
          title: 'Coordinates in a new basis',
          prompt: r`Find the coordinates of $\mathbf{v} = (4, 5)$ in the basis $\mathbf{b}_1 = (2, 1)$, $\mathbf{b}_2 = (1, 2)$.`,
          steps: [
            r`We need $a\mathbf{b}_1 + b\mathbf{b}_2 = \mathbf{v}$: $2a + b = 4$ and $a + 2b = 5$.`,
            r`Double the second equation and subtract the first: $3b = 6$, so $b = 2$ and $a = 1$.`,
            r`Coordinates $(1, 2)$. Check: $(2, 1) + 2(1, 2) = (4, 5)$. ✓`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-06-q2',
          prompt: r`Is $\{(1, 0),\ (1, 1)\}$ a basis of $\mathbb{R}^2$?`,
          options: [
            { id: 'a', label: 'Yes: two independent vectors in a 2-dimensional space' },
            { id: 'b', label: 'No: the vectors are not perpendicular', trapExplanation: r`A basis does not have to be orthogonal; it only has to be independent and spanning.` },
            { id: 'c', label: r`No: a basis of $\mathbb{R}^2$ must contain $(0, 1)$`, trapExplanation: r`$\mathbb{R}^2$ has infinitely many bases; the standard one is just the most convenient.` },
          ],
          correctOptionId: 'a',
          explanation: r`Neither vector is a multiple of the other, so they are independent; two independent vectors in $\mathbb{R}^2$ automatically span it.`,
        },
      ],
    },
    {
      title: 'Rank',
      covers: ['1', '3', '4', '5', 'x2', 'x4', 'x5'],
      blocks: [
        {
          kind: 'box',
          variant: 'definition',
          title: 'Rank',
          text: r`The <i>rank</i> of a matrix is the number of pivots in its echelon form. Equivalently, it is the largest number of independent columns — the dimension of the space the columns span — and, surprisingly, also the largest number of independent rows.`,
        },
        {
          kind: 'text',
          text: r`To compute it, row-reduce and count the non-zero rows of the echelon form. Rank tells you how many genuinely different directions the matrix can produce: a $3\times3$ matrix of rank 2 squashes space onto a plane.`,
        },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Rank–nullity',
          text: r`For an $m\times n$ matrix $A$, the solutions of $A\mathbf{x} = \mathbf{0}$ form a space (the <i>null space</i>) whose dimension is the number of free variables:

$\operatorname{rank}A + \dim(\text{null space}) = n$ (the number of columns).`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Rank is not the size',
          text: r`A $3\times4$ matrix has rank <i>at most</i> 3, but it can be less. Proportional or combined rows lower it. Always reduce before counting.`,
        },
        {
          kind: 'example',
          title: 'Rank, nullity and a determinant test',
          prompt: r`Find the rank of $A = \begin{pmatrix} 1 & 2 & 1 \\ 2 & 4 & 3 \\ 3 & 6 & 4 \end{pmatrix}$ and the dimension of the solutions of $A\mathbf{x} = \mathbf{0}$. Then: for which $k$ are $(1, 0, 0)$, $(0, 1, 1)$ and $(1, k, 3)$ dependent?`,
          steps: [
            r`Eliminate: $R_2 - 2R_1 = (0, 0, 1)$ and $R_3 - 3R_1 = (0, 0, 1)$; then $R_3 - R_2 = (0, 0, 0)$.`,
            r`Two non-zero rows remain: rank 2. The columns span a plane, a space of dimension 2.`,
            r`Rank–nullity: $3$ columns $- 2 = 1$, so the solutions of $A\mathbf{x} = \mathbf{0}$ form a line.`,
            r`Three vectors in $\mathbb{R}^3$ are dependent exactly when the matrix with them as columns has determinant 0: $\det\begin{pmatrix} 1 & 0 & 1 \\ 0 & 1 & k \\ 0 & 1 & 3 \end{pmatrix} = 3 - k$, which is 0 for $k = 3$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'la-06-q3',
          prompt: r`What is the rank of $\begin{pmatrix} 1 & 2 & 3 \\ 2 & 4 & 6 \\ 3 & 6 & 9 \end{pmatrix}$?`,
          options: [
            { id: 'a', label: '1', value: 1 },
            { id: 'b', label: '3', value: 3, trapExplanation: r`A $3 \times 3$ matrix has rank 3 only if its rows are independent. Here every row is a multiple of $(1, 2, 3)$.` },
            { id: 'c', label: '0', value: 0, trapExplanation: r`Rank 0 belongs to the zero matrix only.` },
          ],
          correctOptionId: 'a',
          explanation: r`Every row is a multiple of $(1, 2, 3)$, so the rank is 1. Every column is a multiple of $(1, 2, 3)$ too: the whole of $\mathbb{R}^3$ is squashed onto the line through $(1, 2, 3)$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Independent: only the trivial combination gives $\mathbf{0}$. More than $n$ vectors in $\mathbb{R}^n$ are always dependent.

• Basis = independent + spanning. All bases have the same size: the dimension.

• Coordinates in a basis = the unique coefficients; find them by solving a system.

• Rank = number of pivots = number of independent columns = number of independent rows.

• rank + (number of free variables) = number of columns.`,
        },
      ],
    },
  ],
  extra,
  questions: [
    ...practice,
    {
      id: 'la-06-2',
      difficulty: 1,
      promptText: r`You are given four vectors in $\mathbb{R}^3$, but not their entries. What can you say for sure?`,
      options: [
        { id: 'a', label: 'They are linearly dependent' },
        { id: 'b', label: r`They span $\mathbb{R}^3$`, trapExplanation: r`Four vectors can all lie on one line (for example four multiples of $(1, 0, 0)$). Having many vectors does not guarantee they point in enough directions.` },
        { id: 'c', label: r`They form a basis of $\mathbb{R}^3$`, trapExplanation: r`A basis of $\mathbb{R}^3$ has exactly 3 vectors. Four vectors are never a basis of a 3-dimensional space.` },
        { id: 'd', label: 'Nothing, without the actual numbers', trapExplanation: r`One fact holds for any four vectors in $\mathbb{R}^3$: at most 3 of them can be independent, so the set is dependent.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Put the four vectors as columns of a $3\times4$ matrix.`,
        r`At most 3 pivots fit in 3 rows, so at least one column has no pivot: $A\mathbf{c} = \mathbf{0}$ has a non-zero solution $\mathbf{c}$.`,
        r`That $\mathbf{c}$ is a non-trivial combination giving $\mathbf{0}$: the vectors are dependent.`,
      ],
      keyConceptTag: 'More than n vectors in ℝⁿ are dependent',
    },
  ],
});
