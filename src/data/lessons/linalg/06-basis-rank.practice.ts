import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { add, allDistinct, det3, ints, lin, paren, pm, times, tr, vec } from '../gen.ts';

/** True if u and v are parallel (one is a multiple of the other). */
export const parallel = (u: number[], v: number[]) => u.every((_, i) => u.every((_, j) => u[i] * v[j] === u[j] * v[i]));

export const practice: QuestionTemplate[] = [
  {
    id: 'la-06-1',
    difficulty: 1,
    keyConceptTag: 'Dimension of a span',
    correctOptionId: 'a',
    generate: (g) => {
      const { v1, k, v3 } = g.until(
        () => ({ v1: [g.int(1, 3), g.int(-3, 3), g.int(-3, 3)], k: g.pick([-2, 2, 3]), v3: ints(g, 3, -2, 3) }),
        ({ v1, v3 }) => v3.some((x) => x !== 0) && !parallel(v1, v3),
      );
      const v2 = times(k, v1);
      return {
        params: { vs: [v1, v2, v3] },
        promptText: r`What is the dimension of the span of $${vec(v1)}$, $${vec(v2)}$ and $${vec(v3)}$?`,
        options: [
          { id: 'a', label: '$2$', value: 2 },
          { id: 'b', label: '$3$', value: 3, trapExplanation: r`Three vectors span a 3-dimensional space only if they are independent. $${vec(v2)} = ${k}${vec(v1)}$ adds no new direction.` },
          { id: 'c', label: '$1$', value: 1, trapExplanation: r`The first two are parallel, but $${vec(v3)}$ is not a multiple of $${vec(v1)}$, so it adds a second direction.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`Dimension 0 would mean the span is only the origin, which happens only if all vectors are zero. Dependent vectors still span something.` },
        ],
        stepByStepSolution: [
          r`$${vec(v2)} = ${k}${vec(v1)}$, so it can be dropped without changing the span.`,
          r`$${vec(v1)}$ and $${vec(v3)}$ are not multiples of each other, so they are independent.`,
          r`Two independent vectors span a plane: dimension 2.`,
        ],
      };
    },
  },
  {
    id: 'la-06-3',
    difficulty: 2,
    keyConceptTag: 'Rank by elimination',
    correctOptionId: 'a',
    generate: (g) => {
      const [m, w, k, c] = [g.pick([2, 3, -2]), g.int(-2, 3), g.pick([2, 3]), g.nonzero(-2, 3)];
      const R1 = [1, m, 0, w];
      const R2 = add(times(k, R1), [0, 0, 1, c]);
      const R3 = add(R1, R2);
      const A = [R1, R2, R3];
      const reduced = [0, 0, 1, c];
      return {
        params: { A },
        promptText: r`What is the rank of this matrix?`,
        mathFormula: pm(A),
        options: [
          { id: 'a', label: '$2$', value: 2 },
          { id: 'b', label: '$3$', value: 3, trapExplanation: r`3 is the number of rows, only an upper bound. Row 3 = row 1 + row 2, so elimination produces a zero row.` },
          { id: 'c', label: '$4$', value: 4, trapExplanation: r`The rank can never exceed the number of rows (3), because each pivot needs its own row.` },
          { id: 'd', label: '$1$', value: 1, trapExplanation: r`Columns 1 and 2 are proportional, but column 3 is not a multiple of column 1, so there are at least two independent columns.` },
        ],
        stepByStepSolution: [
          r`$R_2 - ${k}R_1 = ${vec(reduced)}$ and $R_3 - ${k + 1}R_1 = ${vec(reduced)}$.`,
          r`Subtracting these two rows leaves $(0, 0, 0, 0)$.`,
          r`Two non-zero rows remain in echelon form: rank $= 2$.`,
        ],
      };
    },
  },
  {
    id: 'la-06-4',
    difficulty: 2,
    keyConceptTag: 'Dependence via determinant',
    correctOptionId: 'a',
    generate: (g) => {
      // u = (1, a, 0), v = (0, 1, b), w = (1, k, c): dependent iff w = u + (c/b) v, i.e. k = a + c/b.
      const { a, b, c } = g.until(
        () => {
          const b = g.pick([1, -1, 2]);
          return { a: g.int(-2, 3), b, c: b * g.nonzero(-2, 2) };
        },
        ({ a, b, c }) => {
          const k = a + c / b;
          return k !== 0 && allDistinct([k, -k, 0, k + 1]);
        },
      );
      const k = a + c / b;
      const beta = c / b;
      const u = [1, a, 0];
      const v = [0, 1, b];
      const M = tr([u, v, [1, 0, c]]); // det is linear in k: det(k) = det(0) + k·(cofactor)
      const d0 = det3(M);
      const slope = det3(tr([u, v, [1, 1, c]])) - d0;
      return {
        params: { a, b, c },
        promptText: r`For which $k$ are the vectors $${vec(u)}$, $${vec(v)}$ and $(1, k, ${c})$ linearly dependent?`,
        options: [
          { id: 'a', label: r`$k = ${k}$`, value: k },
          { id: 'b', label: r`$k = ${-k}$`, value: -k, trapExplanation: r`The determinant vanishes at $k = ${k}$. A sign slip in a cofactor moves the root to $${-k}$.` },
          { id: 'c', label: '$k = 0$', value: 0, trapExplanation: r`With $k = 0$ the determinant is $${d0} \ne 0$. A zero entry does not make vectors dependent.` },
          { id: 'd', label: r`$k = ${k + 1}$`, value: k + 1, trapExplanation: r`With $k = ${k + 1}$ the third vector is not $${vec(u)} + ${paren(beta)}${vec(v)} = ${vec(add(u, times(beta, v)))}$: the middle entry is off by 1.` },
        ],
        stepByStepSolution: [
          r`Three vectors in $\mathbb{R}^3$ are dependent exactly when the matrix with these columns has determinant 0.`,
          r`Expanding gives $\det = ${d0} ${slope < 0 ? '-' : '+'} ${lin([Math.abs(slope)], ['k'])}$ (it is linear in $k$).`,
          r`$\det = 0$ gives $k = ${k}$. Indeed then $(1, ${k}, ${c}) = ${vec(u)} + ${paren(beta)}${vec(v)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-06-5',
    difficulty: 3,
    keyConceptTag: 'Rank–nullity theorem',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n, rk } = g.until(
        () => {
          const m = g.int(3, 6);
          return { m, n: g.int(m + 1, 9), rk: g.int(2, m - 1) };
        },
        ({ m, n, rk }) => allDistinct([n - rk, m - rk, rk, n - m]),
      );
      return {
        params: { m, n, rk },
        promptText: r`$A$ is a $${m} \times ${n}$ matrix of rank ${rk}. What is the dimension of the solution space of $A\mathbf{x} = \mathbf{0}$?`,
        options: [
          { id: 'a', label: r`$${n - rk}$`, value: n - rk },
          { id: 'b', label: r`$${m - rk}$`, value: m - rk, trapExplanation: r`$${m} - ${rk}$ uses the number of rows. Free variables are unknowns without a pivot, and there are ${n} unknowns (columns).` },
          { id: 'c', label: r`$${rk}$`, value: rk, trapExplanation: r`${rk} is the rank: the number of pivot variables. The solution space is measured by the <i>free</i> ones.` },
          { id: 'd', label: r`$${n - m}$`, value: n - m, trapExplanation: r`$${n} - ${m}$ assumes every row has a pivot. Here only ${rk} rows do.` },
        ],
        stepByStepSolution: [
          r`$\mathbf{x}$ has ${n} entries, one per column.`,
          r`Rank ${rk} means ${rk} pivot variables; the other $${n} - ${rk} = ${n - rk}$ are free.`,
          r`Rank–nullity: $\dim(\text{null space}) = n - \operatorname{rank} = ${n} - ${rk} = ${n - rk}$.`,
        ],
      };
    },
  },
  {
    id: 'la-06-6',
    difficulty: 3,
    keyConceptTag: 'Coordinates in a basis',
    correctOptionId: 'a',
    generate: (g) => {
      const { b1, b2, a, b } = g.until(
        () => ({ b1: [g.int(1, 2), g.int(-1, 2)], b2: [g.int(-1, 2), g.int(1, 3)], a: g.int(-3, 4), b: g.nonzero(-3, 4) }),
        ({ b1, b2, a, b }) => {
          const v = add(times(a, b1), times(b, b2));
          return b1[0] * b2[1] - b1[1] * b2[0] !== 0 && allDistinct([[a, b], v, [b, a], [a, b + 1]]);
        },
      );
      const v = add(times(a, b1), times(b, b2));
      return {
        params: { b1, b2, v },
        promptText: r`What are the coordinates of $\mathbf{v} = ${vec(v)}$ in the basis $\mathbf{b}_1 = ${vec(b1)}$, $\mathbf{b}_2 = ${vec(b2)}$?`,
        options: [
          { id: 'a', label: r`$(${a}, ${b})$`, value: [a, b] },
          { id: 'b', label: r`$${vec(v)}$`, value: v, trapExplanation: r`These are the coordinates in the <i>standard</i> basis. In the new basis you need $a, b$ with $a\mathbf{b}_1 + b\mathbf{b}_2 = \mathbf{v}$.` },
          { id: 'c', label: r`$(${b}, ${a})$`, value: [b, a], trapExplanation: r`$${b}\mathbf{b}_1 + ${paren(a)}\mathbf{b}_2 = ${vec(add(times(b, b1), times(a, b2)))}$. The coefficients are in the wrong order.` },
          { id: 'd', label: r`$(${a}, ${b + 1})$`, value: [a, b + 1], trapExplanation: r`$${a}\mathbf{b}_1 + ${paren(b + 1)}\mathbf{b}_2 = ${vec(add(times(a, b1), times(b + 1, b2)))} \ne ${vec(v)}$. Substitute back to check.` },
        ],
        stepByStepSolution: [
          r`Solve $a${vec(b1)} + b${vec(b2)} = ${vec(v)}$ component by component.`,
          r`The two equations give $a = ${a}$ and $b = ${b}$.`,
          r`Check: $${a}${vec(b1)} + ${paren(b)}${vec(b2)} = ${vec(v)}$. ✓ Coordinates $(${a}, ${b})$.`,
        ],
      };
    },
  },
];

