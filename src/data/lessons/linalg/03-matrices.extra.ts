import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, flat, mat, mm, mv, paren, pm, shuffle, tr, vec } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with fresh numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-03-x1',
    difficulty: 1,
    keyConceptTag: 'Size rule for products',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n, p } = g.until(
        () => ({ m: g.int(1, 6), n: g.int(2, 5), p: g.int(1, 6) }),
        ({ m, n, p }) => allDistinct([[m, p], [n, n], [p, m], [n, p]]),
      );
      return {
        params: { m, n, p },
        promptText: r`$A$ is a $${m} \times ${n}$ matrix and $B$ is a $${n} \times ${p}$ matrix. What is the size of $AB$?`,
        options: [
          { id: 'a', label: r`$${m} \times ${p}$`, value: [m, p] },
          { id: 'b', label: r`$${n} \times ${n}$`, value: [n, n], trapExplanation: r`The inner sizes (${n} and ${n}) must match and then disappear. The outer sizes remain.` },
          { id: 'c', label: r`$${p} \times ${m}$`, value: [p, m], trapExplanation: r`$AB$ keeps the rows of $A$ and the columns of $B$, in that order.` },
          { id: 'd', label: r`$${n} \times ${p}$`, value: [n, p], trapExplanation: r`$AB$ has as many rows as $A$ (${m}), not as $B$.` },
        ],
        stepByStepSolution: [
          r`$(m \times n)(n \times p) = m \times p$.`,
          r`Here $(${m} \times ${n})(${n} \times ${p})$: the inner ${n}s match.`,
          r`The result is $${m} \times ${p}$.`,
        ],
      };
    },
  },
  {
    id: 'la-03-x2',
    difficulty: 1,
    keyConceptTag: 'Matrix times vector',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, v } = g.until(
        () => ({ A: mat(g, 2, 2, -3, 4), v: [g.int(-3, 3), g.int(-3, 3)] }),
        ({ A, v }) => allDistinct([mv(A, v), mv(tr(A), v), [A[0][0] * v[0], A[1][1] * v[1]], mv(A, [1, 1])]),
      );
      const Av = mv(A, v);
      return {
        params: { A, v },
        promptText: r`Compute $${pm(A)} ${pm(v.map((x) => [x]))}$.`,
        options: [
          { id: 'a', label: r`$${vec(Av)}$`, value: Av },
          { id: 'b', label: r`$${vec(mv(tr(A), v))}$`, value: mv(tr(A), v), trapExplanation: r`You used the columns of the matrix as rows. Each output entry is a <i>row</i> times the vector.` },
          { id: 'c', label: r`$${vec([A[0][0] * v[0], A[1][1] * v[1]])}$`, value: [A[0][0] * v[0], A[1][1] * v[1]], trapExplanation: r`Only the diagonal entries were used. Every entry of a row takes part.` },
          { id: 'd', label: r`$${vec(mv(A, [1, 1]))}$`, value: mv(A, [1, 1]), trapExplanation: r`These are the row sums: the entries were added without multiplying by the vector's components.` },
        ],
        stepByStepSolution: [
          r`Row 1: $${paren(A[0][0])} \cdot ${paren(v[0])} + ${paren(A[0][1])} \cdot ${paren(v[1])} = ${Av[0]}$.`,
          r`Row 2: $${paren(A[1][0])} \cdot ${paren(v[0])} + ${paren(A[1][1])} \cdot ${paren(v[1])} = ${Av[1]}$.`,
          r`Result $${vec(Av)}$ — equivalently $${paren(v[0])} \cdot ${vec([A[0][0], A[1][0]])} + ${paren(v[1])} \cdot ${vec([A[0][1], A[1][1]])}$, a combination of the columns.`,
        ],
      };
    },
  },
  {
    id: 'la-03-x3',
    difficulty: 1,
    keyConceptTag: 'Transpose',
    correctOptionId: 'a',
    generate: (g) => {
      const e = shuffle(g, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6);
      const M = [e.slice(0, 3), e.slice(3)];
      const refilled = [e.slice(0, 2), e.slice(2, 4), e.slice(4)];
      const swapped = [M[1], M[0]];
      const reversed = M.map((row) => [...row].reverse());
      return {
        params: { M },
        promptText: r`What is the transpose of $${pm(M)}$?`,
        options: [
          { id: 'a', label: r`$${pm(tr(M))}$`, value: flat(tr(M)) },
          { id: 'b', label: r`$${pm(refilled)}$`, value: flat(refilled), trapExplanation: r`The shape is right ($3 \times 2$) but the entries were refilled row by row. Rows must become columns.` },
          { id: 'c', label: r`$${pm(swapped)}$`, value: flat(swapped), trapExplanation: r`Swapping the rows is not transposing; the transpose of a $2 \times 3$ matrix is $3 \times 2$.` },
          { id: 'd', label: r`$${pm(reversed)}$`, value: flat(reversed), trapExplanation: r`Reversing each row is a different operation; the transpose flips the matrix across its diagonal.` },
        ],
        stepByStepSolution: [
          r`$(A^T)_{ij} = A_{ji}$: row $i$ of $A$ becomes column $i$ of $A^T$.`,
          r`Row $${vec(M[0])}$ becomes the first column, row $${vec(M[1])}$ the second.`,
          r`$A^T$ is $3 \times 2$: $${pm(tr(M))}$.`,
        ],
      };
    },
  },
  {
    id: 'la-03-x4',
    difficulty: 2,
    keyConceptTag: 'Row times column',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, B } = g.until(
        () => ({ A: mat(g, 2, 2, -2, 4), B: mat(g, 2, 2, -2, 4) }),
        ({ A, B }) => allDistinct([mm(A, B)[0][1], mm(A, B)[1][0], A[0][1] * B[0][1], mm(B, A)[0][1]]),
      );
      const AB = mm(A, B);
      return {
        params: { A, B },
        promptText: r`Let $A = ${pm(A)}$ and $B = ${pm(B)}$. What is the entry $(AB)_{12}$?`,
        options: [
          { id: 'a', label: r`$${AB[0][1]}$`, value: AB[0][1] },
          { id: 'b', label: r`$${AB[1][0]}$`, value: AB[1][0], trapExplanation: r`That is $(AB)_{21}$ = row 2 of $A$ times column 1 of $B$. The indices are (row 1, column 2).` },
          { id: 'c', label: r`$${A[0][1] * B[0][1]}$`, value: A[0][1] * B[0][1], trapExplanation: r`$a_{12} \cdot b_{12}$: matrix entries are not multiplied position by position.` },
          { id: 'd', label: r`$${mm(B, A)[0][1]}$`, value: mm(B, A)[0][1], trapExplanation: r`That is $(BA)_{12}$. In $AB$ the rows come from $A$ and the columns from $B$.` },
        ],
        stepByStepSolution: [
          r`$(AB)_{12}$ = row 1 of $A$ times column 2 of $B$.`,
          r`$${vec(A[0])} \cdot ${vec([B[0][1], B[1][1]])} = ${paren(A[0][0])} \cdot ${paren(B[0][1])} + ${paren(A[0][1])} \cdot ${paren(B[1][1])}$.`,
          r`$= ${AB[0][1]}$.`,
        ],
      };
    },
  },
  {
    id: 'la-03-x5',
    difficulty: 2,
    keyConceptTag: 'Matrix powers',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(
        () => mat(g, 2, 2, -2, 3),
        (A) => allDistinct([flat(mm(A, A)), flat(A).map((x) => x * x), flat(A).map((x) => 2 * x), flat(tr(A))]),
      );
      const A2 = mm(A, A);
      return {
        params: { A },
        promptText: r`Compute $A^2$ for $A = ${pm(A)}$.`,
        options: [
          { id: 'a', label: r`$${pm(A2)}$`, value: flat(A2) },
          { id: 'b', label: r`$${pm(A.map((row) => row.map((x) => x * x)))}$`, value: flat(A).map((x) => x * x), trapExplanation: r`Squaring each entry gives this, but $A^2$ means the product $AA$: row times column.` },
          { id: 'c', label: r`$${pm(A.map((row) => row.map((x) => 2 * x)))}$`, value: flat(A).map((x) => 2 * x), trapExplanation: r`$A^2$ is not $2A$: a power multiplies the matrix by itself.` },
          { id: 'd', label: r`$${pm(tr(A))}$`, value: flat(tr(A)), trapExplanation: r`That is the transpose $A^T$, not $A^2$.` },
        ],
        stepByStepSolution: [
          r`$A^2 = AA$: each entry is a row of $A$ times a column of $A$.`,
          r`For example $(A^2)_{11} = ${paren(A[0][0])} \cdot ${paren(A[0][0])} + ${paren(A[0][1])} \cdot ${paren(A[1][0])} = ${A2[0][0]}$.`,
          r`Doing this for all four entries: $A^2 = ${pm(A2)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-03-x6',
    difficulty: 2,
    keyConceptTag: 'Build a matrix from images of basis vectors',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = g.until(() => [g.int(2, 5), g.int(1, 5)], ([a, b]) => a !== b);
      const D = [[a, 0], [0, b]];
      return {
        params: { a, b },
        promptText: b === 1
          ? r`Which matrix stretches the $x$-direction by ${a} and leaves the $y$-direction unchanged?`
          : r`Which matrix stretches the $x$-direction by ${a} and the $y$-direction by ${b}?`,
        options: [
          { id: 'a', label: r`$${pm(D)}$`, value: flat(D) },
          { id: 'b', label: r`$${pm([[b, 0], [0, a]])}$`, value: [b, 0, 0, a], trapExplanation: r`This sends $\mathbf{e}_1$ to $(${b}, 0)$ and $\mathbf{e}_2$ to $(0, ${a})$: the two stretch factors are swapped.` },
          { id: 'c', label: r`$${pm([[a, 0], [0, a]])}$`, value: [a, 0, 0, a], trapExplanation: r`This stretches <i>both</i> directions by ${a}.` },
          { id: 'd', label: r`$${pm([[0, a], [b, 0]])}$`, value: [0, a, b, 0], trapExplanation: r`The first column (the image of $\mathbf{e}_1$) is $(0, ${b})$: this matrix also swaps the axes.` },
        ],
        stepByStepSolution: [
          r`The columns of a matrix are the images of $\mathbf{e}_1$ and $\mathbf{e}_2$.`,
          r`We need $\mathbf{e}_1 \mapsto (${a}, 0)$ and $\mathbf{e}_2 \mapsto (0, ${b})$.`,
          r`Columns $(${a}, 0)$ and $(0, ${b})$ give $${pm(D)}$.`,
        ],
      };
    },
  },
];
