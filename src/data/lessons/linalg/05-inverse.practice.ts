import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { type Mat, allDistinct, det2, flat, frac, mat, mm, mv, paren, pm, shuffle, vec } from '../gen.ts';

/** A random 2×2 integer matrix with determinant 1 (so its inverse is an integer matrix too). */
export const unimodular = (g: Rng, lo = -3, hi = 5): Mat =>
  g.until(() => mat(g, 2, 2, lo, hi), (A) => det2(A) === 1 && !(A[0][1] === 0 && A[1][0] === 0));
/** Swap the diagonal, negate the off-diagonal. */
export const adj2 = ([[a, b], [c, d]]: Mat): Mat => [[d, -b], [-c, a]];
/** A matrix whose entries are fractions p/q, shown in lowest terms. */
export const pmFrac = (A: Mat, q: number) => pm(A.map((row) => row.map((p) => frac(p, q))) as unknown as Mat);

export const practice: QuestionTemplate[] = [
  {
    id: 'la-05-1',
    difficulty: 1,
    keyConceptTag: '2×2 inverse formula',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(() => unimodular(g, 1, 6), (A) => flat(A).every((x) => x !== 0));
      const [[a, b], [c, d]] = A;
      const Ainv = adj2(A);
      const signsKept = [[d, b], [c, a]];
      const neg = Ainv.map((row) => row.map((x) => -x));
      const recip = A.map((row) => row.map((x) => 1 / x));
      return {
        params: { A },
        promptText: r`Find the inverse of $A = ${pm(A)}$.`,
        options: [
          { id: 'a', label: r`$${pm(Ainv)}$`, value: flat(Ainv) },
          { id: 'b', label: r`$${pm(signsKept)}$`, value: flat(signsKept), trapExplanation: r`The diagonal was swapped but the off-diagonal entries kept their signs. Multiply by $A$: the result is not $I$.` },
          { id: 'c', label: r`$${pm(neg)}$`, value: flat(neg), trapExplanation: r`This is $-A^{-1}$: the signs were changed on the diagonal instead of off it. The product with $A$ is $-I$.` },
          { id: 'd', label: r`$${pm(A.map((row) => row.map((x) => frac(1, x))) as unknown as Mat)}$`, value: flat(recip), trapExplanation: r`Inverting each entry is not matrix inversion. Multiply it by $A$ and you will not get $I$.` },
        ],
        stepByStepSolution: [
          r`$\det A = ${a}\cdot ${d} - ${b}\cdot ${c} = 1$.`,
          r`Swap $${a} \leftrightarrow ${d}$ and negate $${b}$ and $${c}$: $${pm(Ainv)}$, divided by $1$.`,
          r`Check: $AA^{-1} = ${pm(mm(A, Ainv))} = I$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-05-2',
    difficulty: 1,
    keyConceptTag: 'Invertible ⟺ det ≠ 0',
    correctOptionId: 'a',
    generate: (g) => {
      const { S, N, P, D } = g.until(
        () => {
          const [p, q, k] = [g.int(1, 4), g.int(1, 4), g.pick([2, 3])];
          const S = [[k * p, k * q], [p, q]]; // rows proportional: det 0
          const N = [[k * p, k * q], [p, q + 1]]; // looks similar, det = kp
          const P = g.pick([[[0, 1], [1, 0]], [[0, 2], [3, 0]], [[0, -1], [1, 0]]]);
          const D = [[g.int(1, 3), 0], [0, g.int(2, 6)]];
          return { S, N, P, D };
        },
        ({ S, N, P, D }) => allDistinct([flat(S), flat(N), flat(P), flat(D)]),
      );
      const ids = shuffle(g, ['b', 'c', 'd']);
      return {
        params: { a: S, [ids[0]]: N, [ids[1]]: P, [ids[2]]: D },
        promptText: r`Which of these matrices has <i>no</i> inverse?`,
        options: [
          { id: 'a', label: r`$${pm(S)}$` },
          { id: ids[0], label: r`$${pm(N)}$`, trapExplanation: r`$\det = ${det2(N)} \ne 0$, so it is invertible. It only looks similar to the singular one.` },
          { id: ids[1], label: r`$${pm(P)}$`, trapExplanation: r`Zeros on the diagonal do not matter. $\det = ${det2(P)} \ne 0$.` },
          { id: ids[2], label: r`$${pm(D)}$`, trapExplanation: r`A diagonal matrix with non-zero diagonal is invertible: $\det = ${det2(D)}$.` },
        ].sort((x, y) => x.id.localeCompare(y.id)),
        stepByStepSolution: [
          r`A matrix is invertible exactly when its determinant is non-zero.`,
          r`$\det${pm(S)} = ${S[0][0] * S[1][1]} - ${S[0][1] * S[1][0]} = 0$; the other three have non-zero determinants.`,
          r`Reason: the first row is ${S[0][0] / S[1][0]} times the second, so the map squashes the plane onto a line.`,
        ],
      };
    },
  },
  {
    id: 'la-05-3',
    difficulty: 2,
    keyConceptTag: 'Solving with the inverse',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, x } = g.until(
        () => ({ A: unimodular(g, 1, 7), x: [g.int(-3, 3), g.nonzero(-3, 3)] }),
        ({ A, x }) => {
          const b = mv(A, x);
          const Ai = adj2(A);
          return allDistinct([x, [b[0] * Ai[0][0] + b[1] * Ai[1][0], b[0] * Ai[0][1] + b[1] * Ai[1][1]], mv(A, b), [x[0], -x[1]]]);
        },
      );
      const Ai = adj2(A);
      const b = mv(A, x);
      const rowWise = [b[0] * Ai[0][0] + b[1] * Ai[1][0], b[0] * Ai[0][1] + b[1] * Ai[1][1]];
      return {
        params: { A, b },
        promptText: r`$A = ${pm(A)}$ has $A^{-1} = ${pm(Ai)}$. Solve $A\mathbf{x} = ${pm(b.map((v) => [v]))}$.`,
        options: [
          { id: 'a', label: r`$\mathbf{x} = ${vec(x)}$`, value: x },
          { id: 'b', label: r`$\mathbf{x} = ${vec(rowWise)}$`, value: rowWise, trapExplanation: r`This is $\mathbf{b}^TA^{-1}$: the vector was multiplied from the left as a row. The inverse must stand on the left: $\mathbf{x} = A^{-1}\mathbf{b}$.` },
          { id: 'c', label: r`$\mathbf{x} = ${vec(mv(A, b))}$`, value: mv(A, b), trapExplanation: r`This is $A\mathbf{b}$. To undo $A$ you multiply by $A^{-1}$, not by $A$ again.` },
          { id: 'd', label: r`$\mathbf{x} = ${vec([x[0], -x[1]])}$`, value: [x[0], -x[1]], trapExplanation: r`Check: $A${vec([x[0], -x[1]])} = ${vec(mv(A, [x[0], -x[1]]))} \ne ${vec(b)}$. A sign was lost.` },
        ],
        stepByStepSolution: [
          r`$\mathbf{x} = A^{-1}\mathbf{b} = ${pm(Ai)}${pm(b.map((v) => [v]))}$.`,
          r`$= (${Ai[0][0]}\cdot ${paren(b[0])} + ${paren(Ai[0][1])}\cdot ${paren(b[1])},\ ${Ai[1][0]}\cdot ${paren(b[0])} + ${paren(Ai[1][1])}\cdot ${paren(b[1])}) = ${vec(x)}$.`,
          r`Check: $A${vec(x)} = ${vec(b)}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-05-4',
    difficulty: 2,
    keyConceptTag: 'Inverse of a product',
    correctOptionId: 'a',
    generate: (g) => {
      const [s, t] = [g.nonzero(-3, 3), g.nonzero(-3, 3)];
      const Ai = [[1, s], [0, 1]];
      const Bi = [[1, 0], [t, 1]];
      const ans = mm(Bi, Ai);
      const wrong = mm(Ai, Bi);
      const sum = [[2, s], [t, 2]];
      return {
        params: { Ai, Bi },
        promptText: r`$A^{-1} = ${pm(Ai)}$ and $B^{-1} = ${pm(Bi)}$. What is $(AB)^{-1}$?`,
        options: [
          { id: 'a', label: r`$${pm(ans)}$`, value: flat(ans) },
          { id: 'b', label: r`$${pm(wrong)}$`, value: flat(wrong), trapExplanation: r`This is $A^{-1}B^{-1}$. Undoing "first $B$, then $A$" means undoing $A$ first: $(AB)^{-1} = B^{-1}A^{-1}$.` },
          { id: 'c', label: r`$${pm(sum)}$`, value: flat(sum), trapExplanation: r`Adding the inverses has no meaning here. The inverse of a product is a product of inverses.` },
          { id: 'd', label: r`$${pm([[1, 0], [0, 1]])}$`, value: [1, 0, 0, 1], trapExplanation: r`$I$ would be the inverse only if $AB = I$, i.e. if $B = A^{-1}$, which is not the case.` },
        ],
        stepByStepSolution: [
          r`$(AB)^{-1} = B^{-1}A^{-1}$ — reverse order.`,
          r`$B^{-1}A^{-1} = ${pm(Bi)}${pm(Ai)}$.`,
          r`$(AB)^{-1} = ${pm(ans)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-05-5',
    difficulty: 3,
    keyConceptTag: 'Gauss–Jordan inverse',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.nonzero(-3, 3), b: g.nonzero(-4, 4), c: g.nonzero(-3, 4) }),
        ({ a, b, c }) => allDistinct([a * c - b, -b, 1 / b, b - a * c]) && a * c - b !== 0,
      );
      const A = [[1, a, b], [0, 1, c], [0, 0, 1]];
      const e = a * c - b;
      const Ai = [[1, -a, e], [0, 1, -c], [0, 0, 1]];
      return {
        params: { A },
        promptText: r`Let $A = ${pm(A)}$. What is the entry in row 1, column 3 of $A^{-1}$?`,
        options: [
          { id: 'a', label: r`$${e}$`, value: e },
          { id: 'b', label: r`$${-b}$`, value: -b, trapExplanation: r`Negating the entry works only when there is a single off-diagonal entry. Here clearing the $${a}$ in row 1 changes the third entry too.` },
          { id: 'c', label: r`$${frac(1, b)}$`, value: 1 / b, trapExplanation: r`Reciprocals of entries have nothing to do with the inverse (except for diagonal matrices).` },
          { id: 'd', label: r`$${-e}$`, value: -e, trapExplanation: r`$${-e}$ is the value with the wrong sign: the last step <i>adds</i> $${paren(a)}\cdot ${paren(c)}$ after the first one subtracted $${b}$.` },
        ],
        stepByStepSolution: [
          r`Gauss–Jordan on $(A \mid I)$ from the bottom up: $R_2 \to R_2 - ${paren(c)}R_3$ gives the right half row 2 $= (0, 1, ${-c})$.`,
          r`$R_1 \to R_1 - ${paren(b)}R_3$ gives right row 1 $= (1, 0, ${-b})$; then $R_1 \to R_1 - ${paren(a)}R_2$ gives $(1, ${-a}, ${-b} - ${paren(a)}\cdot ${paren(-c)}) = (1, ${-a}, ${e})$.`,
          r`So $A^{-1} = ${pm(Ai)}$ and the entry is $${e}$. Check: row 1 of $A^{-1}$ times column 3 of $A$ is $${b} ${-a * c < 0 ? '-' : '+'} ${Math.abs(a * c)} ${e < 0 ? '-' : '+'} ${Math.abs(e)} = 0$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-05-6',
    difficulty: 3,
    keyConceptTag: 'det of the inverse',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, k, m } = g.until(
        () => ({ n: g.pick([2, 3]), k: g.pick([2, 3]), m: g.pick([2, 3, 4, 5, 6, -2, -3]) }),
        ({ n, k, m }) => allDistinct([1 / m, k / (k ** n * m), 1 / (k ** n * m), m]) && k ** n * m <= 200,
      );
      const D = k ** n * m;
      return {
        params: { n, k, D },
        promptText: r`$A$ is a $${n}\times${n}$ matrix with $\det(${k}A) = ${D}$. What is $\det(A^{-1})$?`,
        options: [
          { id: 'a', label: r`$${frac(1, m)}$`, value: 1 / m },
          { id: 'b', label: r`$${frac(k, D)}$`, value: k / D, trapExplanation: r`From $\det(${k}A) = ${D}$ you cannot conclude $\det A = ${frac(D, k)}$: scaling a $${n}\times${n}$ matrix by ${k} multiplies its determinant by $${k}^${n}$.` },
          { id: 'c', label: r`$${frac(1, D)}$`, value: 1 / D, trapExplanation: r`$${frac(1, D)}$ is $\det\big((${k}A)^{-1}\big)$, the inverse of $${k}A$, not of $A$.` },
          { id: 'd', label: r`$${m}$`, value: m, trapExplanation: r`$${m}$ is $\det A$. The inverse has the reciprocal determinant.` },
        ],
        stepByStepSolution: [
          r`$\det(${k}A) = ${k}^${n}\det A = ${k ** n}\det A = ${D}$, so $\det A = ${m}$.`,
          r`$\det(A^{-1}) = \dfrac{1}{\det A}$ because $\det A\cdot\det A^{-1} = \det I = 1$.`,
          r`$\det(A^{-1}) = ${frac(1, m)}$.`,
        ],
      };
    },
  },
];
