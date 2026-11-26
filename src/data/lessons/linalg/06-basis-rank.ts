import { defineLesson, r } from '../define.ts';
import { extra } from './06-basis-rank.extra.ts';

export default defineLesson({
  id: 'la-06',
  moduleId: 'linalg',
  title: 'Independence, basis and rank',
  blurb: 'How many directions a set of vectors really has',
  minutes: 8,
  lecture: [
    {
      title: 'Linear independence',
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
    {
      id: 'la-06-1',
      difficulty: 1,
      promptText: r`What is the dimension of the span of $(1, 2, 3)$, $(2, 4, 6)$ and $(0, 1, 1)$?`,
      options: [
        { id: 'a', label: '$2$', value: 2 },
        { id: 'b', label: '$3$', value: 3, trapExplanation: r`Three vectors span a 3-dimensional space only if they are independent. $(2, 4, 6) = 2(1, 2, 3)$ adds no new direction.` },
        { id: 'c', label: '$1$', value: 1, trapExplanation: r`The first two are parallel, but $(0, 1, 1)$ is not a multiple of $(1, 2, 3)$, so it adds a second direction.` },
        { id: 'd', label: '$0$', value: 0, trapExplanation: r`Dimension 0 would mean the span is only the origin, which happens only if all vectors are zero. Dependent vectors still span something.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$(2, 4, 6) = 2(1, 2, 3)$, so it can be dropped without changing the span.`,
        r`$(1, 2, 3)$ and $(0, 1, 1)$ are not multiples of each other, so they are independent.`,
        r`Two independent vectors span a plane: dimension 2.`,
      ],
      keyConceptTag: 'Dimension of a span',
    },
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
    {
      id: 'la-06-3',
      difficulty: 2,
      promptText: r`What is the rank of this matrix?`,
      mathFormula: r`\begin{pmatrix} 1 & 2 & 0 & 1 \\ 2 & 4 & 1 & 3 \\ 3 & 6 & 1 & 4 \end{pmatrix}`,
      options: [
        { id: 'a', label: '$2$', value: 2 },
        { id: 'b', label: '$3$', value: 3, trapExplanation: r`3 is the number of rows, only an upper bound. Row 3 = row 1 + row 2, so elimination produces a zero row.` },
        { id: 'c', label: '$4$', value: 4, trapExplanation: r`The rank can never exceed the number of rows (3), because each pivot needs its own row.` },
        { id: 'd', label: '$1$', value: 1, trapExplanation: r`Columns 1 and 2 are proportional, but column 3 is not a multiple of column 1, so there are at least two independent columns.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$R_2 - 2R_1 = (0, 0, 1, 1)$ and $R_3 - 3R_1 = (0, 0, 1, 1)$.`,
        r`$R_3 - R_2 = (0, 0, 0, 0)$.`,
        r`Two non-zero rows remain in echelon form: rank $= 2$.`,
      ],
      keyConceptTag: 'Rank by elimination',
    },
    {
      id: 'la-06-4',
      difficulty: 2,
      promptText: r`For which $k$ are the vectors $(1, 1, 0)$, $(0, 1, 1)$ and $(1, k, 1)$ linearly dependent?`,
      options: [
        { id: 'a', label: '$k = 2$', value: 2 },
        { id: 'b', label: '$k = -2$', value: -2, trapExplanation: r`The determinant is $2 - k$, which vanishes at $k = +2$. A sign slip in a cofactor turns it into $2 + k$.` },
        { id: 'c', label: '$k = 0$', value: 0, trapExplanation: r`With $k = 0$ the determinant is $2 \ne 0$. A zero entry does not make vectors dependent.` },
        { id: 'd', label: '$k = 1$', value: 1, trapExplanation: r`With $k = 1$: $(1, 1, 1)$ is not $(1, 1, 0) + (0, 1, 1) = (1, 2, 1)$. The sum of the first two vectors has a 2 in the middle.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Three vectors in $\mathbb{R}^3$ are dependent exactly when the matrix with these columns has determinant 0.`,
        r`$\det\begin{pmatrix} 1 & 0 & 1 \\ 1 & 1 & k \\ 0 & 1 & 1 \end{pmatrix} = 1(1 - k) - 0 + 1(1 - 0) = 2 - k$.`,
        r`$2 - k = 0$ gives $k = 2$. Indeed $(1, 2, 1) = (1, 1, 0) + (0, 1, 1)$.`,
      ],
      keyConceptTag: 'Dependence via determinant',
    },
    {
      id: 'la-06-5',
      difficulty: 3,
      promptText: r`$A$ is a $5 \times 7$ matrix of rank 4. What is the dimension of the solution space of $A\mathbf{x} = \mathbf{0}$?`,
      options: [
        { id: 'a', label: '$3$', value: 3 },
        { id: 'b', label: '$1$', value: 1, trapExplanation: r`$5 - 4$ uses the number of rows. Free variables are unknowns without a pivot, and there are 7 unknowns (columns).` },
        { id: 'c', label: '$4$', value: 4, trapExplanation: r`4 is the rank: the number of pivot variables. The solution space is measured by the <i>free</i> ones.` },
        { id: 'd', label: '$2$', value: 2, trapExplanation: r`$7 - 5$ assumes every row has a pivot. Here only 4 rows do.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$\mathbf{x}$ has 7 entries, one per column.`,
        r`Rank 4 means 4 pivot variables; the other $7 - 4 = 3$ are free.`,
        r`Rank–nullity: $\dim(\text{null space}) = n - \operatorname{rank} = 7 - 4 = 3$.`,
      ],
      keyConceptTag: 'Rank–nullity theorem',
    },
    {
      id: 'la-06-6',
      difficulty: 3,
      promptText: r`What are the coordinates of $\mathbf{v} = (4, 7)$ in the basis $\mathbf{b}_1 = (1, 1)$, $\mathbf{b}_2 = (1, 2)$?`,
      options: [
        { id: 'a', label: '$(1, 3)$', value: [1, 3] },
        { id: 'b', label: '$(4, 7)$', value: [4, 7], trapExplanation: r`These are the coordinates in the <i>standard</i> basis. In the new basis you need $a, b$ with $a\mathbf{b}_1 + b\mathbf{b}_2 = \mathbf{v}$.` },
        { id: 'c', label: '$(3, 1)$', value: [3, 1], trapExplanation: r`$3\mathbf{b}_1 + \mathbf{b}_2 = (4, 5) \ne (4, 7)$. The coefficients are in the wrong order.` },
        { id: 'd', label: '$(-1, 5)$', value: [-1, 5], trapExplanation: r`$-\mathbf{b}_1 + 5\mathbf{b}_2 = (4, 9)$. Substitute back: the second component does not match.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Solve $a(1, 1) + b(1, 2) = (4, 7)$: $a + b = 4$ and $a + 2b = 7$.`,
        r`Subtract: $b = 3$, then $a = 1$.`,
        r`Check: $(1, 1) + 3(1, 2) = (4, 7)$. ✓ Coordinates $(1, 3)$.`,
      ],
      keyConceptTag: 'Coordinates in a basis',
    },
  ],
});
