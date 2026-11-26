import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { type Mat, allDistinct, det2, flat, frac, mat, mm, mv, paren, pm, shuffle, tr, vec } from '../gen.ts';
import { adj2, pmFrac, unimodular } from './05-inverse.practice.ts';

const diag = (a: number, b: number): Mat => [[a, 0], [0, b]];

/** Extra practice (Practice 2): gentler questions on the same ideas, with fresh numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-05-x1',
    difficulty: 1,
    keyConceptTag: 'Inverse of a diagonal matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = g.until(() => [g.int(2, 6), g.int(2, 6)], ([a, b]) => a !== b);
      const frs = (x: number, y: number) => pm([[frac(1, x), 0], [0, frac(1, y)]] as unknown as Mat);
      return {
        params: { a, b },
        promptText: r`What is the inverse of $${pm(diag(a, b))}$?`,
        options: [
          { id: 'a', label: r`$${frs(a, b)}$`, value: [1 / a, 0, 0, 1 / b] },
          { id: 'b', label: r`$${pm(diag(-a, -b))}$`, value: [-a, 0, 0, -b], trapExplanation: r`The inverse undoes multiplication, so it divides; it does not change signs.` },
          { id: 'c', label: r`$${frs(b, a)}$`, value: [1 / b, 0, 0, 1 / a], trapExplanation: r`The $x$-axis was stretched by ${a}, so it must be shrunk by ${a}: the entries stay in their places.` },
          { id: 'd', label: r`$${pm(diag(b, a))}$`, value: [b, 0, 0, a], trapExplanation: r`Swapping the diagonal is only half of the 2×2 formula; you must also divide by $\det = ${a * b}$.` },
        ],
        stepByStepSolution: [
          r`The matrix stretches $x$ by ${a} and $y$ by ${b}.`,
          r`To undo it, shrink $x$ by ${a} and $y$ by ${b}.`,
          r`$A^{-1} = \operatorname{diag}(${frac(1, a)}, ${frac(1, b)})$. Check: $AA^{-1} = I$.`,
        ],
      };
    },
  },
  {
    id: 'la-05-x2',
    difficulty: 1,
    keyConceptTag: 'Invertible ⟺ det ≠ 0',
    correctOptionId: 'a',
    generate: (g) => {
      const { good, s1, s2, s3 } = g.until(
        () => {
          const [p, q, k] = [g.int(1, 4), g.int(1, 4), g.pick([2, 3])];
          return {
            good: mat(g, 2, 2, 1, 5),
            s1: [[k * p, k * q], [p, q]],
            s2: [[0, 0], [g.int(1, 4), g.int(1, 4)]],
            s3: [[p, k * p], [q, k * q]],
          };
        },
        ({ good, s1, s2, s3 }) => det2(good) !== 0 && allDistinct([flat(good), flat(s1), flat(s2), flat(s3)]),
      );
      const ids = shuffle(g, ['b', 'c', 'd']);
      return {
        params: { a: good, [ids[0]]: s1, [ids[1]]: s2, [ids[2]]: s3 },
        promptText: r`Which matrix is invertible?`,
        options: [
          { id: 'a', label: r`$${pm(good)}$` },
          { id: ids[0], label: r`$${pm(s1)}$`, trapExplanation: r`$\det = ${s1[0][0] * s1[1][1]} - ${s1[0][1] * s1[1][0]} = 0$: the first row is a multiple of the second.` },
          { id: ids[1], label: r`$${pm(s2)}$`, trapExplanation: r`A zero row means $\det = 0$; the plane is squashed onto a line.` },
          { id: ids[2], label: r`$${pm(s3)}$`, trapExplanation: r`$\det = 0$: the second column is a multiple of the first, so the columns are parallel.` },
        ].sort((x, y) => x.id.localeCompare(y.id)),
        stepByStepSolution: [
          r`A square matrix is invertible exactly when $\det \ne 0$.`,
          r`$\det${pm(good)} = ${good[0][0] * good[1][1]} - ${good[0][1] * good[1][0]} = ${det2(good)} \ne 0$.`,
          r`The other three determinants are all 0.`,
        ],
      };
    },
  },
  {
    id: 'la-05-x3',
    difficulty: 1,
    keyConceptTag: 'Checking an inverse',
    correctOptionId: 'a',
    generate: (g) => {
      const { A } = g.until(
        () => ({ A: unimodular(g, 1, 5) }),
        ({ A }) => {
          const B = adj2(A);
          return allDistinct([[1, 0, 0, 1], flat(A).map((x, i) => x * flat(B)[i]), flat(A).map((x, i) => x + flat(B)[i]), flat(mm(A, A))]);
        },
      );
      const B = adj2(A);
      const entry = A.map((row, i) => row.map((x, j) => x * B[i][j]));
      const sum = A.map((row, i) => row.map((x, j) => x + B[i][j]));
      return {
        params: { A, B },
        promptText: r`Let $A = ${pm(A)}$ and $B = ${pm(B)}$. Compute $AB$.`,
        options: [
          { id: 'a', label: r`$${pm([[1, 0], [0, 1]])}$, so $B = A^{-1}$`, value: [1, 0, 0, 1] },
          { id: 'b', label: r`$${pm(entry)}$`, value: flat(entry), trapExplanation: r`That is the entry-by-entry product. A matrix product is rows times columns.` },
          { id: 'c', label: r`$${pm(sum)}$`, value: flat(sum), trapExplanation: r`That is $A + B$. The product multiplies rows by columns.` },
          { id: 'd', label: r`$${pm(mm(A, A))}$`, value: flat(mm(A, A)), trapExplanation: r`That is $A^2$: the second factor must be $B$, not $A$.` },
        ],
        stepByStepSolution: [
          r`$(AB)_{11} = ${paren(A[0][0])}\cdot ${paren(B[0][0])} + ${paren(A[0][1])}\cdot ${paren(B[1][0])} = 1$, $(AB)_{12} = ${paren(A[0][0])}\cdot ${paren(B[0][1])} + ${paren(A[0][1])}\cdot ${paren(B[1][1])} = 0$.`,
          r`Likewise $(AB)_{21} = 0$ and $(AB)_{22} = 1$.`,
          r`$AB = I$, so $B$ is the inverse of $A$. That is how you check an inverse.`,
        ],
      };
    },
  },
  {
    id: 'la-05-x4',
    difficulty: 2,
    keyConceptTag: '2×2 inverse formula',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(() => mat(g, 2, 2, 1, 7), (A) => det2(A) === 2);
      const [[a, b], [c, d]] = A;
      const adj = adj2(A);
      const noSign = [[d, b], [c, a]];
      const recip = A.map((row) => row.map((x) => 1 / x));
      return {
        params: { A },
        promptText: r`Find the inverse of $A = ${pm(A)}$.`,
        options: [
          { id: 'a', label: r`$${pmFrac(adj, 2)}$`, value: flat(adj).map((x) => x / 2) },
          { id: 'b', label: r`$${pm(adj)}$`, value: flat(adj), trapExplanation: r`You still need to divide by $\det A = ${a * d} - ${b * c} = 2$.` },
          { id: 'c', label: r`$${pmFrac(noSign, 2)}$`, value: flat(noSign).map((x) => x / 2), trapExplanation: r`The off-diagonal entries change sign in the formula.` },
          { id: 'd', label: r`$${pm(A.map((row) => row.map((x) => frac(1, x))) as unknown as Mat)}$`, value: flat(recip), trapExplanation: r`Inverting entry by entry works only for diagonal matrices.` },
        ],
        stepByStepSolution: [
          r`$\det A = ${a} \cdot ${d} - ${b} \cdot ${c} = 2$.`,
          r`Swap the diagonal, negate the off-diagonal: $${pm(adj)}$.`,
          r`Divide by 2: $A^{-1} = ${pmFrac(adj, 2)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-05-x5',
    difficulty: 2,
    keyConceptTag: 'Solving with the inverse',
    correctOptionId: 'a',
    generate: (g) => {
      const { Ai, b } = g.until(
        () => ({ Ai: unimodular(g, -2, 4), b: [g.int(-4, 5), g.int(-4, 5)] }),
        ({ Ai, b }) => {
          const x = mv(Ai, b);
          return x[0] !== 0 && allDistinct([x, mv(adj2(Ai), b), [-x[0], x[1]], mv(tr(Ai), b)]);
        },
      );
      const x = mv(Ai, b);
      const A = adj2(Ai);
      return {
        params: { Ai, b },
        promptText: r`$A^{-1} = ${pm(Ai)}$. Solve $A\mathbf{x} = ${pm(b.map((v) => [v]))}$.`,
        options: [
          { id: 'a', label: r`$\mathbf{x} = ${vec(x)}$`, value: x },
          { id: 'b', label: r`$\mathbf{x} = ${vec(mv(A, b))}$`, value: mv(A, b), trapExplanation: r`That is $A\mathbf{b}$. To undo $A$ you multiply by $A^{-1}$: $\mathbf{x} = A^{-1}\mathbf{b}$.` },
          { id: 'c', label: r`$\mathbf{x} = ${vec([-x[0], x[1]])}$`, value: [-x[0], x[1]], trapExplanation: r`Row 1: $${paren(Ai[0][0])} \cdot ${paren(b[0])} + ${paren(Ai[0][1])} \cdot ${paren(b[1])} = ${x[0]}$; a sign was lost.` },
          { id: 'd', label: r`$\mathbf{x} = ${vec(mv(tr(Ai), b))}$`, value: mv(tr(Ai), b), trapExplanation: r`The columns of $A^{-1}$ were used as rows. Each entry is a <i>row</i> of $A^{-1}$ times $\mathbf{b}$.` },
        ],
        stepByStepSolution: [
          r`Multiply both sides by $A^{-1}$: $\mathbf{x} = A^{-1}\mathbf{b}$.`,
          r`Row 1: $${paren(Ai[0][0])} \cdot ${paren(b[0])} + ${paren(Ai[0][1])} \cdot ${paren(b[1])} = ${x[0]}$. Row 2: $${paren(Ai[1][0])} \cdot ${paren(b[0])} + ${paren(Ai[1][1])} \cdot ${paren(b[1])} = ${x[1]}$.`,
          r`$\mathbf{x} = ${vec(x)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-05-x6',
    difficulty: 2,
    keyConceptTag: 'Inverse of the inverse',
    correctOptionId: 'a',
    generate: (g) => {
      const Ai = g.until(
        () => unimodular(g, -2, 4),
        (Ai) => allDistinct([flat(adj2(Ai)), flat(Ai), flat(Ai).map((x) => -x), flat(tr(Ai))]),
      );
      const A = adj2(Ai);
      return {
        params: { Ai },
        promptText: r`$A^{-1} = ${pm(Ai)}$. What is $A$?`,
        options: [
          { id: 'a', label: r`$${pm(A)}$`, value: flat(A) },
          { id: 'b', label: r`$${pm(Ai)}$`, value: flat(Ai), trapExplanation: r`A matrix equal to its own inverse would satisfy $M^2 = I$; check $A^{-1}A^{-1}$ — it is not $I$ here.` },
          { id: 'c', label: r`$${pm(Ai.map((row) => row.map((x) => -x)))}$`, value: flat(Ai).map((x) => -x), trapExplanation: r`Negating every entry is not inverting.` },
          { id: 'd', label: r`$${pm(tr(Ai))}$`, value: flat(tr(Ai)), trapExplanation: r`That is the transpose. For this matrix the transpose is not the inverse.` },
        ],
        stepByStepSolution: [
          r`$A = (A^{-1})^{-1}$: invert the given matrix.`,
          r`$\det A^{-1} = 1$; swap the diagonal and negate the off-diagonal: $${pm(A)}$.`,
          r`Check: $${pm(A)}${pm(Ai)} = I$.`,
        ],
      };
    },
  },
];
