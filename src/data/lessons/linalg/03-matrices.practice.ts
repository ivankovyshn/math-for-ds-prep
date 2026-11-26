import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { type Mat, allDistinct, flat, mat, mm, paren, pm, shuffle, tr, vec } from '../gen.ts';

/**
 * Simple maps of the plane. Their order is shared with scripts/verify.mjs (`PLANE_MAPS`),
 * which rebuilds each matrix from the geometric description independently.
 */
export const PLANE_MAPS: { name: string; does: string; M: Mat }[] = [
  { name: r`rotates every vector by $90^\circ$ counter-clockwise`, does: r`rotates by $90^\circ$ counter-clockwise`, M: [[0, -1], [1, 0]] },
  { name: r`rotates every vector by $90^\circ$ clockwise`, does: r`rotates by $90^\circ$ clockwise`, M: [[0, 1], [-1, 0]] },
  { name: r`reflects every vector in the line $y = x$`, does: r`reflects in the line $y = x$`, M: [[0, 1], [1, 0]] },
  { name: r`reflects every vector in the $x$-axis`, does: r`reflects in the $x$-axis`, M: [[1, 0], [0, -1]] },
  { name: r`reflects every vector in the $y$-axis`, does: r`reflects in the $y$-axis`, M: [[-1, 0], [0, 1]] },
  { name: r`rotates every vector by $180^\circ$`, does: r`rotates by $180^\circ$ (it is $-I$)`, M: [[-1, 0], [0, -1]] },
];
const col = (M: Mat, j: number) => [M[0][j], M[1][j]];
const add2 = (A: Mat, B: Mat) => A.map((row, i) => row.map((x, j) => x + B[i][j]));

export const practice: QuestionTemplate[] = [
  {
    id: 'la-03-1',
    difficulty: 1,
    keyConceptTag: 'Size rule for products',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n, p } = g.until(
        () => ({ m: g.int(1, 5), n: g.int(2, 5), p: g.int(1, 5) }),
        ({ m, n, p }) => allDistinct([[m, p], [n, n], [p, m], [0, 0]]),
      );
      return {
        params: { m, n, p },
        promptText: r`$A$ is a $${m} \times ${n}$ matrix and $B$ is a $${n} \times ${p}$ matrix. What is the size of $AB$?`,
        options: [
          { id: 'a', label: r`$${m} \times ${p}$`, value: [m, p] },
          { id: 'b', label: r`$${n} \times ${n}$`, value: [n, n], trapExplanation: r`The matching inner size ${n} is "used up" by the dot products; it does not survive in the result. The result takes the outer sizes.` },
          { id: 'c', label: r`$${p} \times ${m}$`, value: [p, m], trapExplanation: r`That would be the size of $(AB)^T$. Rows come from the left factor, columns from the right one.` },
          { id: 'd', label: 'The product is not defined', value: [0, 0], trapExplanation: r`Matrices do not need the same size to be multiplied. The product is defined because columns of $A$ (${n}) = rows of $B$ (${n}).` },
        ],
        stepByStepSolution: [
          r`Write the sizes side by side: $(${m} \times ${n})(${n} \times ${p})$.`,
          r`The inner numbers match (${n} and ${n}), so the product exists.`,
          r`The outer numbers give the size: $${m} \times ${p}$.`,
        ],
      };
    },
  },
  {
    id: 'la-03-2',
    difficulty: 1,
    keyConceptTag: 'Row times column',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, B, i, j } = g.until(
        () => ({ A: mat(g, 2, 2, -3, 5), B: mat(g, 2, 2, -3, 5), i: g.int(0, 1), j: g.int(0, 1) }),
        ({ A, B, i, j }) => i !== j && allDistinct([mm(A, B)[i][j], A[i][j] * B[i][j], mm(A, B)[j][i], mm(B, A)[i][j]]),
      );
      const AB = mm(A, B);
      const row = A[i];
      const column = col(B, j);
      return {
        params: { A, B, i: i + 1, j: j + 1 },
        promptText: r`Let $A = ${pm(A)}$ and $B = ${pm(B)}$. What is the entry $(AB)_{${i + 1}${j + 1}}$?`,
        options: [
          { id: 'a', label: r`$${AB[i][j]}$`, value: AB[i][j] },
          { id: 'b', label: r`$${A[i][j] * B[i][j]}$`, value: A[i][j] * B[i][j], trapExplanation: r`$a_{${i + 1}${j + 1}}b_{${i + 1}${j + 1}}$ multiplies single entries. A product entry is a whole row of $A$ dotted with a whole column of $B$.` },
          { id: 'c', label: r`$${AB[j][i]}$`, value: AB[j][i], trapExplanation: r`This is $(AB)_{${j + 1}${i + 1}}$. In $(AB)_{${i + 1}${j + 1}}$ the first index picks the row (${i + 1}), the second the column (${j + 1}).` },
          { id: 'd', label: r`$${mm(B, A)[i][j]}$`, value: mm(B, A)[i][j], trapExplanation: r`This is $(BA)_{${i + 1}${j + 1}}$: row ${i + 1} of $B$ with column ${j + 1} of $A$. The order of the factors matters.` },
        ],
        stepByStepSolution: [
          r`$(AB)_{${i + 1}${j + 1}}$ = row ${i + 1} of $A$ · column ${j + 1} of $B$.`,
          r`Row ${i + 1} of $A$ is $${vec(row)}$; column ${j + 1} of $B$ is $${vec(column)}$.`,
          r`$${paren(row[0])}\cdot ${paren(column[0])} + ${paren(row[1])}\cdot ${paren(column[1])} = ${AB[i][j]}$.`,
        ],
      };
    },
  },
  {
    id: 'la-03-3',
    difficulty: 2,
    keyConceptTag: 'Matrix powers',
    correctOptionId: 'a',
    generate: (g) => {
      const { s, n } = g.until(
        () => ({ s: g.nonzero(-3, 3), n: g.pick([3, 4]) }),
        ({ s, n }) => allDistinct([n * s, s ** n, (n - 1) * s]) && s ** n !== s,
      );
      const A = [[1, s], [0, 1]];
      const P = (k: number) => [[1, k * s], [0, 1]];
      return {
        params: { A, n },
        promptText: r`Compute $A^${n}$ for $A = ${pm(A)}$.`,
        options: [
          { id: 'a', label: r`$${pm(P(n))}$`, value: flat(P(n)) },
          { id: 'b', label: r`$${pm([[1, s ** n], [0, 1]])}$`, value: [1, s ** n, 0, 1], trapExplanation: r`This raises every entry to the power ${n}. A matrix power is repeated matrix multiplication, not entrywise powers.` },
          { id: 'c', label: r`$${pm([[n, n * s], [0, n]])}$`, value: [n, n * s, 0, n], trapExplanation: r`This is $${n}A = A + \dots + A$. A power multiplies: $A\cdot A \cdots A$.` },
          { id: 'd', label: r`$${pm(P(n - 1))}$`, value: flat(P(n - 1)), trapExplanation: r`This is $A^${n - 1}$. One more multiplication by $A$ adds another ${s} to the top-right entry.` },
        ],
        stepByStepSolution: [
          r`$A^2 = ${pm(A)}${pm(A)} = ${pm(P(2))}$.`,
          r`Each further factor $A$ adds ${s} to the top-right entry, so $A^k$ has $k \cdot ${paren(s)}$ in the corner.`,
          r`So $A^${n} = ${pm(P(n))}$: $A$ is a shear by ${s}, and doing it ${n} times is a shear by ${n * s}.`,
        ],
      };
    },
  },
  {
    id: 'la-03-4',
    difficulty: 2,
    keyConceptTag: 'Transpose of a product',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, B } = g.until(
        () => ({ A: mat(g, 2, 2, 0, 3), B: mat(g, 2, 2, 0, 3) }),
        ({ A, B }) => allDistinct([flat(tr(mm(A, B))), flat(mm(A, B)), flat(mm(tr(A), tr(B))), flat(mm(B, A))]),
      );
      const AB = mm(A, B);
      return {
        params: { A, B },
        promptText: r`Let $A = ${pm(A)}$ and $B = ${pm(B)}$. Compute $(AB)^T$.`,
        options: [
          { id: 'a', label: r`$${pm(tr(AB))}$`, value: flat(tr(AB)) },
          { id: 'b', label: r`$${pm(AB)}$`, value: flat(AB), trapExplanation: r`This is $AB$ itself — the transpose was forgotten at the end.` },
          { id: 'c', label: r`$${pm(mm(tr(A), tr(B)))}$`, value: flat(mm(tr(A), tr(B))), trapExplanation: r`This is $A^TB^T$, with the factors in the original order. The rule reverses the order: $(AB)^T = B^TA^T$.` },
          { id: 'd', label: r`$${pm(mm(B, A))}$`, value: flat(mm(B, A)), trapExplanation: r`This is $BA$. Transposing is not the same as swapping the factors.` },
        ],
        stepByStepSolution: [
          r`$AB = ${pm(AB)}$ (row times column for each entry).`,
          r`Transpose: rows become columns, $(AB)^T = ${pm(tr(AB))}$.`,
          r`Check with the rule: $B^TA^T = ${pm(tr(B))}${pm(tr(A))} = ${pm(mm(tr(B), tr(A)))}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-03-5',
    difficulty: 3,
    keyConceptTag: 'Build a matrix from images of basis vectors',
    correctOptionId: 'a',
    generate: (g) => {
      const [t, ...others] = shuffle(g, PLANE_MAPS.map((_, i) => i)).slice(0, 4);
      const target = PLANE_MAPS[t];
      const trap = (k: number) => {
        const M = PLANE_MAPS[k].M;
        return r`This matrix ${PLANE_MAPS[k].does}: it sends $\mathbf{e}_1$ to $${vec(col(M, 0))}$ and $\mathbf{e}_2$ to $${vec(col(M, 1))}$. The images of the basis vectors must be the columns.`;
      };
      return {
        params: { map: t },
        promptText: r`Which matrix ${target.name}?`,
        options: [
          { id: 'a', label: r`$${pm(target.M)}$`, value: flat(target.M) },
          ...others.map((k, n) => ({ id: 'bcd'[n], label: r`$${pm(PLANE_MAPS[k].M)}$`, value: flat(PLANE_MAPS[k].M), trapExplanation: trap(k) })),
        ],
        stepByStepSolution: [
          r`Apply the map to $\mathbf{e}_1 = (1, 0)$: it goes to $${vec(col(target.M, 0))}$.`,
          r`Apply it to $\mathbf{e}_2 = (0, 1)$: it goes to $${vec(col(target.M, 1))}$.`,
          r`The images are the columns: $${pm(target.M)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-03-6',
    difficulty: 3,
    keyConceptTag: 'Product = composition, right to left',
    correctOptionId: 'a',
    generate: (g) => {
      const { f, s } = g.until(
        () => ({ f: g.int(0, PLANE_MAPS.length - 1), s: g.int(0, PLANE_MAPS.length - 1) }),
        ({ f, s }) => {
          const [F, S] = [PLANE_MAPS[f].M, PLANE_MAPS[s].M];
          return allDistinct([flat(mm(S, F)), flat(mm(F, S)), flat(add2(F, S)), flat(F)]);
        },
      );
      const [F, S] = [PLANE_MAPS[f].M, PLANE_MAPS[s].M];
      const SF = mm(S, F);
      const e1 = col(F, 0);
      const e2 = col(F, 1);
      return {
        params: { first: f, second: s },
        promptText: r`$P = ${pm(F)}$ ${PLANE_MAPS[f].does} and $Q = ${pm(S)}$ ${PLANE_MAPS[s].does}. Which matrix means "first apply $P$, then $Q$"?`,
        options: [
          { id: 'a', label: r`$QP = ${pm(SF)}$`, value: flat(SF) },
          { id: 'b', label: r`$PQ = ${pm(mm(F, S))}$`, value: flat(mm(F, S)), trapExplanation: r`$PQ\mathbf{x} = P(Q\mathbf{x})$ applies $Q$ first. The map applied first stands on the <i>right</i>.` },
          { id: 'c', label: r`$P + Q = ${pm(add2(F, S))}$`, value: flat(add2(F, S)), trapExplanation: r`Adding matrices adds the outputs, $P\mathbf{x} + Q\mathbf{x}$. Doing one map after another is multiplication.` },
          { id: 'd', label: r`$P = ${pm(F)}$`, value: flat(F), trapExplanation: r`The second map changes the result: $\mathbf{e}_1$ goes to $${vec(e1)}$ and then to $${vec(col(SF, 0))}$.` },
        ],
        stepByStepSolution: [
          r`"First $P$, then $Q$" sends $\mathbf{x}$ to $Q(P\mathbf{x}) = (QP)\mathbf{x}$.`,
          r`Track the basis: $\mathbf{e}_1 \to ${vec(e1)} \to ${vec(col(SF, 0))}$ and $\mathbf{e}_2 \to ${vec(e2)} \to ${vec(col(SF, 1))}$.`,
          r`These images are the columns: $QP = ${pm(SF)}$.`,
        ],
      };
    },
  },
];
