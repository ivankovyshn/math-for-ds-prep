import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, det2, det3, frac, mat, paren, pm, vec } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with fresh numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-04-x1',
    difficulty: 1,
    keyConceptTag: '2×2 determinant',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(
        () => mat(g, 2, 2, 1, 6),
        ([[a, b], [c, d]]) => allDistinct([a * d - b * c, a * d + b * c, b * c - a * d, a * b]),
      );
      const [[a, b], [c, d]] = A;
      return {
        params: { A },
        promptText: r`Compute $\det${pm(A)}$.`,
        options: [
          { id: 'a', label: r`$${det2(A)}$`, value: det2(A) },
          { id: 'b', label: r`$${a * d + b * c}$`, value: a * d + b * c, trapExplanation: r`The formula is $ad - bc$: the two products are subtracted, not added.` },
          { id: 'c', label: r`$${b * c - a * d}$`, value: b * c - a * d, trapExplanation: r`The order is main diagonal minus the other one: $${a} \cdot ${d} - ${b} \cdot ${c}$.` },
          { id: 'd', label: r`$${a * b}$`, value: a * b, trapExplanation: r`$${a} \cdot ${b}$ multiplies entries of the first row; the determinant uses the diagonals.` },
        ],
        stepByStepSolution: [
          r`$\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$.`,
          r`$${a} \cdot ${d} - ${b} \cdot ${c} = ${a * d} - ${b * c}$.`,
          r`$= ${det2(A)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-04-x2',
    difficulty: 1,
    keyConceptTag: 'det = 0 detects dependence',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, c, k] = [g.nonzero(-4, 4), g.nonzero(-4, 4), g.pick([-3, -2, 2, 3])];
      const A = [[a, k * a], [c, k * c]];
      const p = k * a * c;
      return {
        params: { A },
        promptText: r`Compute $\det${pm(A)}$.`,
        options: [
          { id: 'a', label: r`$0$ — the columns are parallel`, value: 0 },
          { id: 'b', label: r`$${2 * p}$`, value: 2 * p, trapExplanation: r`$ad + bc$ adds the products. They must be subtracted, and here they are equal.` },
          { id: 'c', label: r`$${p}$`, value: p, trapExplanation: r`Only $ad = ${p}$ was computed; subtract $bc = ${p}$ as well.` },
          { id: 'd', label: r`$${-2 * p}$`, value: -2 * p, trapExplanation: r`$ad$ and $bc$ are both $${p}$, so $ad - bc = 0$. Check the sign of each product.` },
        ],
        stepByStepSolution: [
          r`$${paren(a)} \cdot ${paren(k * c)} - ${paren(k * a)} \cdot ${paren(c)} = ${p} - ${paren(p)} = 0$.`,
          r`The second column $${vec([k * a, k * c])}$ is ${k} times the first $${vec([a, c])}$.`,
          r`Parallel columns span a flat parallelogram: area 0, so the matrix is not invertible.`,
        ],
      };
    },
  },
  {
    id: 'la-04-x3',
    difficulty: 1,
    keyConceptTag: 'Determinant as area',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.int(1, 6), b: g.nonzero(-3, 3), c: g.int(1, 6) }),
        ({ a, b, c }) => allDistinct([a * c, (a * c) / 2, a + c, (a + Math.abs(b)) * c]),
      );
      return {
        params: { u: [a, 0], v: [b, c] },
        promptText: r`What is the area of the parallelogram spanned by $(${a}, 0)$ and $(${b}, ${c})$?`,
        options: [
          { id: 'a', label: r`$${a * c}$`, value: a * c },
          { id: 'b', label: r`$${(a * c) / 2}$`, value: (a * c) / 2, trapExplanation: r`${(a * c) / 2} is the area of the triangle — half the parallelogram.` },
          { id: 'c', label: r`$${a + c}$`, value: a + c, trapExplanation: r`Adding coordinates does not give an area; use $|\det|$.` },
          { id: 'd', label: r`$${(a + Math.abs(b)) * c}$`, value: (a + Math.abs(b)) * c, trapExplanation: r`The area is $|${a} \cdot ${c} - 0 \cdot ${paren(b)}| = ${a * c}$; it does not depend on the slant ${b}.` },
        ],
        stepByStepSolution: [
          r`Area $= |\det(\mathbf{u}\ \mathbf{v})|$.`,
          r`$\det${pm([[a, b], [0, c]])} = ${a * c} - 0 = ${a * c}$.`,
          r`Base ${a} along the $x$-axis, height ${c}: area ${a * c}.`,
        ],
      };
    },
  },
  {
    id: 'la-04-x4',
    difficulty: 2,
    keyConceptTag: 'Triangular determinants',
    correctOptionId: 'a',
    generate: (g) => {
      const d = g.until(
        () => [g.nonzero(-3, 4), g.nonzero(-3, 4), g.nonzero(-3, 4)],
        (d) => d.some((x) => x < 0) && allDistinct([d[0] * d[1] * d[2], d[0] + d[1] + d[2], Math.abs(d[0] * d[1] * d[2]), 0]),
      );
      const A = [[d[0], 0, 0], [0, d[1], 0], [0, 0, d[2]]];
      const P = d[0] * d[1] * d[2];
      return {
        params: { A },
        promptText: r`Compute $\det${pm(A)}$.`,
        options: [
          { id: 'a', label: r`$${P}$`, value: P },
          { id: 'b', label: r`$${d[0] + d[1] + d[2]}$`, value: d[0] + d[1] + d[2], trapExplanation: r`The determinant of a diagonal matrix is the <i>product</i> of the diagonal, not the sum (that is the trace).` },
          { id: 'c', label: r`$${Math.abs(P)}$`, value: Math.abs(P), trapExplanation: r`The negative entries count: the sign of the product matters.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`Zeros off the diagonal do not make the determinant 0; only a zero <i>on</i> the diagonal would.` },
        ],
        stepByStepSolution: [
          r`For a diagonal (or triangular) matrix the determinant is the product of the diagonal entries.`,
          r`$${d.map(paren).join(' \\cdot ')}$.`,
          r`$= ${P}$.`,
        ],
      };
    },
  },
  {
    id: 'la-04-x5',
    difficulty: 2,
    keyConceptTag: 'Multiplicativity of det',
    correctOptionId: 'a',
    generate: (g) => {
      const d = g.pick([-5, -4, -3, -2, 2, 3, 4, 5, 6]);
      return {
        params: { d },
        promptText: r`$A$ is invertible with $\det A = ${d}$. What is $\det(A^{-1})$?`,
        options: [
          { id: 'a', label: r`$${frac(1, d)}$`, value: 1 / d },
          { id: 'b', label: r`$${-d}$`, value: -d, trapExplanation: r`Inverting does not flip the sign; it undoes the scaling.` },
          { id: 'c', label: r`$${d}$`, value: d, trapExplanation: r`$A^{-1}$ undoes $A$, so it must shrink volumes by the factor $A$ stretched them.` },
          { id: 'd', label: '$1$', value: 1, trapExplanation: r`1 is $\det(AA^{-1}) = \det I$, not $\det A^{-1}$ alone.` },
        ],
        stepByStepSolution: [
          r`$AA^{-1} = I$, so $\det A \cdot \det A^{-1} = \det I = 1$.`,
          r`$${d} \cdot \det A^{-1} = 1$.`,
          r`$\det A^{-1} = ${frac(1, d)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-04-x6',
    difficulty: 2,
    keyConceptTag: 'Row operations and det',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(() => mat(g, 3, 3, -2, 3), (A) => det3(A) !== 0);
      const d = det3(A);
      const [i, j] = g.pick([[0, 1], [0, 2], [1, 2]]);
      return {
        params: { A, i, j },
        promptText: r`$\det A = ${d}$. Swapping rows ${i + 1} and ${j + 1} of $A$ gives a matrix $B$. What is $\det B$?`,
        options: [
          { id: 'a', label: r`$${-d}$`, value: -d },
          { id: 'b', label: r`$${d}$`, value: d, trapExplanation: r`A row swap reverses orientation, which flips the sign.` },
          { id: 'c', label: '$0$', value: 0, trapExplanation: r`Swapping rows keeps them independent; only equal or dependent rows give 0.` },
          { id: 'd', label: r`$${2 * d}$`, value: 2 * d, trapExplanation: r`Doubling happens when a row is multiplied by 2, not when two rows are swapped.` },
        ],
        stepByStepSolution: [
          r`Each row swap multiplies the determinant by $-1$.`,
          r`$\det B = -\det A$.`,
          r`$= ${-d}$.`,
        ],
      };
    },
  },
];
