import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'la-06-x1',
    difficulty: 1,
    promptText: r`Which pair of vectors is linearly <i>dependent</i>?`,
    options: [
      { id: 'a', label: r`$(1, 2)$ and $(3, 6)$` },
      { id: 'b', label: r`$(1, 0)$ and $(0, 1)$`, trapExplanation: r`Neither is a multiple of the other: these are the standard basis vectors.` },
      { id: 'c', label: r`$(1, 1)$ and $(1, -1)$`, trapExplanation: r`They point in different directions (they are even perpendicular), so they are independent.` },
      { id: 'd', label: r`$(2, 1)$ and $(1, 2)$`, trapExplanation: r`$(1, 2) \ne c\,(2, 1)$ for every $c$: the ratios $1/2$ and $2/1$ differ.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Two vectors are dependent exactly when one is a multiple of the other.`,
      r`$(3, 6) = 3 \cdot (1, 2)$.`,
      r`So $3(1, 2) - (3, 6) = \mathbf{0}$ is a non-trivial combination giving zero.`,
    ],
    keyConceptTag: 'Linear dependence',
  },
  {
    id: 'la-06-x2',
    difficulty: 1,
    promptText: r`What is the dimension of the span of $(1, 0, 0)$, $(0, 1, 0)$ and $(1, 1, 0)$?`,
    options: [
      { id: 'a', label: '2', value: 2 },
      { id: 'b', label: '3', value: 3, trapExplanation: r`Three vectors do not guarantee dimension 3: $(1, 1, 0)$ is the sum of the other two.` },
      { id: 'c', label: '1', value: 1, trapExplanation: r`$(1, 0, 0)$ and $(0, 1, 0)$ already point in two independent directions.` },
      { id: 'd', label: '0', value: 0, trapExplanation: r`Only the span of the zero vector has dimension 0.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$(1, 1, 0) = (1, 0, 0) + (0, 1, 0)$ adds no new direction.`,
      r`$(1, 0, 0)$ and $(0, 1, 0)$ are independent.`,
      r`The span is the $xy$-plane: dimension 2.`,
    ],
    keyConceptTag: 'Dimension of a span',
  },
  {
    id: 'la-06-x3',
    difficulty: 1,
    promptText: r`How many vectors does every basis of $\mathbb{R}^3$ contain?`,
    options: [
      { id: 'a', label: '3', value: 3 },
      { id: 'b', label: '2', value: 2, trapExplanation: r`Two vectors span at most a plane; they cannot reach every point of $\mathbb{R}^3$.` },
      { id: 'c', label: '4', value: 4, trapExplanation: r`Four vectors in $\mathbb{R}^3$ are always dependent, so they are never a basis.` },
      { id: 'd', label: 'It depends on the basis', value: 99, trapExplanation: r`Bases differ, but they all have the same size — that size is the dimension.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`A basis is independent and spans the space.`,
      r`All bases of a space have the same number of vectors: the dimension.`,
      r`$\dim \mathbb{R}^3 = 3$, as the standard basis $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ shows.`,
    ],
    keyConceptTag: 'Basis and dimension',
  },
  {
    id: 'la-06-x4',
    difficulty: 2,
    promptText: r`What is the rank of $\begin{pmatrix} 1 & 2 \\ 2 & 4 \\ 0 & 1 \end{pmatrix}$?`,
    options: [
      { id: 'a', label: '2', value: 2 },
      { id: 'b', label: '1', value: 1, trapExplanation: r`Rows 1 and 2 are dependent, but row 3 $(0, 1)$ is not a multiple of $(1, 2)$.` },
      { id: 'c', label: '3', value: 3, trapExplanation: r`The rank is at most the number of columns, 2.` },
      { id: 'd', label: '0', value: 0, trapExplanation: r`Only the zero matrix has rank 0.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$R_2 - 2R_1 = (0, 0)$.`,
      r`The remaining rows $(1, 2)$ and $(0, 1)$ are in echelon form with 2 pivots.`,
      r`Rank $= 2$ (also: it can never exceed the 2 columns).`,
    ],
    keyConceptTag: 'Rank by elimination',
  },
  {
    id: 'la-06-x5',
    difficulty: 2,
    promptText: r`$A$ is a $3 \times 5$ matrix of rank 3. What is the dimension of the solution space of $A\mathbf{x} = \mathbf{0}$?`,
    options: [
      { id: 'a', label: '2', value: 2 },
      { id: 'b', label: '0', value: 0, trapExplanation: r`With 5 unknowns and only 3 pivots, two variables are free.` },
      { id: 'c', label: '3', value: 3, trapExplanation: r`3 is the rank. The null space has dimension (columns) $-$ (rank).` },
      { id: 'd', label: '5', value: 5, trapExplanation: r`Only the zero matrix would have every variable free.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Rank–nullity: $\operatorname{rank} A + \dim \ker A = $ number of columns.`,
      r`$3 + \dim \ker A = 5$.`,
      r`$\dim \ker A = 2$: two free variables.`,
    ],
    keyConceptTag: 'Rank–nullity theorem',
  },
  {
    id: 'la-06-x6',
    difficulty: 2,
    promptText: r`What are the coordinates of $\mathbf{v} = (3, 5)$ in the basis $\mathbf{b}_1 = (1, 0)$, $\mathbf{b}_2 = (1, 1)$?`,
    options: [
      { id: 'a', label: r`$(-2, 5)$`, value: [-2, 5] },
      { id: 'b', label: r`$(3, 5)$`, value: [3, 5], trapExplanation: r`Those are the standard coordinates. $3\mathbf{b}_1 + 5\mathbf{b}_2 = (8, 5)$.` },
      { id: 'c', label: r`$(5, -2)$`, value: [5, -2], trapExplanation: r`The order of the coordinates follows the order of the basis: first $\mathbf{b}_1$, then $\mathbf{b}_2$.` },
      { id: 'd', label: r`$(2, 5)$`, value: [2, 5], trapExplanation: r`$2(1, 0) + 5(1, 1) = (7, 5)$; the first coordinate must be $3 - 5 = -2$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Solve $a(1, 0) + b(1, 1) = (3, 5)$.`,
      r`Second component: $b = 5$. First: $a + b = 3$, so $a = -2$.`,
      r`Coordinates $(-2, 5)$. Check: $-2(1, 0) + 5(1, 1) = (3, 5)$.`,
    ],
    keyConceptTag: 'Coordinates in a basis',
  },
];
