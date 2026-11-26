import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { type Mat, allDistinct, chain, det2, det3, frac, mat, paren, pm, vec } from '../gen.ts';

/** A determinant bar matrix |A|. */
const vm = (A: Mat) => pm(A).replace(/pmatrix/g, 'vmatrix');

export const practice: QuestionTemplate[] = [
  {
    id: 'la-04-1',
    difficulty: 1,
    keyConceptTag: '2×2 determinant',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(
        () => mat(g, 2, 2, -3, 6),
        ([[a, b], [c, d]]) => allDistinct([a * d - b * c, a * d + b * c, b * c - a * d, a + d]),
      );
      const [[a, b], [c, d]] = A;
      return {
        params: { A },
        promptText: r`Compute $\det${pm(A)}$.`,
        options: [
          { id: 'a', label: r`$${det2(A)}$`, value: det2(A) },
          { id: 'b', label: r`$${a * d + b * c}$`, value: a * d + b * c, trapExplanation: r`$${paren(a)}\cdot ${paren(d)} + ${paren(b)}\cdot ${paren(c)}$ adds the two products. The determinant subtracts: $ad - bc$.` },
          { id: 'c', label: r`$${b * c - a * d}$`, value: b * c - a * d, trapExplanation: r`$bc - ad$ has the order reversed. The main diagonal (top-left to bottom-right) comes first.` },
          { id: 'd', label: r`$${a + d}$`, value: a + d, trapExplanation: r`$${a} + ${paren(d)} = ${a + d}$ is the trace (sum of the diagonal), a different number.` },
        ],
        stepByStepSolution: [
          r`Main diagonal product: $${paren(a)}\cdot ${paren(d)} = ${a * d}$.`,
          r`Other diagonal product: $${paren(b)}\cdot ${paren(c)} = ${b * c}$.`,
          r`$\det = ${a * d} - ${paren(b * c)} = ${det2(A)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-04-2',
    difficulty: 1,
    keyConceptTag: 'Determinant as area',
    correctOptionId: 'a',
    generate: (g) => {
      const { u, v } = g.until(
        () => ({ u: [g.int(1, 5), g.int(1, 4)], v: [g.int(1, 4), g.int(1, 5)] }),
        ({ u, v }) => {
          const D = Math.abs(u[0] * v[1] - v[0] * u[1]);
          return D !== 0 && allDistinct([D, u[0] * v[1] + v[0] * u[1], D / 2, u[0] * v[1]]);
        },
      );
      const M = [[u[0], v[0]], [u[1], v[1]]];
      const D = det2(M);
      const area = Math.abs(D);
      return {
        params: { u, v },
        promptText: r`What is the area of the parallelogram spanned by the vectors $${vec(u)}$ and $${vec(v)}$?`,
        options: [
          { id: 'a', label: r`$${area}$`, value: area },
          { id: 'b', label: r`$${u[0] * v[1] + v[0] * u[1]}$`, value: u[0] * v[1] + v[0] * u[1], trapExplanation: r`This adds the products. The area is $|ad - bc|$.` },
          { id: 'c', label: r`$${area / 2}$`, value: area / 2, trapExplanation: r`Half the determinant is the area of the <i>triangle</i> with these two sides. The parallelogram is twice as large.` },
          { id: 'd', label: r`$${u[0] * v[1]}$`, value: u[0] * v[1], trapExplanation: r`$${u[0]}\cdot ${v[1]}$ is the area of a rectangle. The slant of the vectors removes $${v[0]}\cdot ${u[1]}$ from it.` },
        ],
        stepByStepSolution: [
          r`Put the vectors in the columns of a matrix: $${pm(M)}$.`,
          r`$\det = ${u[0]}\cdot ${v[1]} - ${v[0]}\cdot ${u[1]} = ${D}$.`,
          r`Area $= |\det| = ${area}$.`,
        ],
      };
    },
  },
  {
    id: 'la-04-3',
    difficulty: 2,
    keyConceptTag: '3×3 cofactor expansion',
    correctOptionId: 'a',
    generate: (g) => {
      const sarrus = (A: Mat) => {
        const down = [0, 1, 2].reduce((s, k) => s + A[0][k] * A[1][(k + 1) % 3] * A[2][(k + 2) % 3], 0);
        const up = [0, 1, 2].reduce((s, k) => s + A[0][k] * A[1][(k + 2) % 3] * A[2][(k + 1) % 3], 0);
        return { down, up };
      };
      const A = g.until(
        () => mat(g, 3, 3, 0, 3),
        (A) => {
          const { down, up } = sarrus(A);
          return det3(A) !== 0 && up !== 0 && allDistinct([det3(A), down, down + up, -det3(A)]);
        },
      );
      const { down, up } = sarrus(A);
      const D = det3(A);
      const minor = (j: number) => {
        const [p, q] = [0, 1, 2].filter((k) => k !== j);
        return det2([[A[1][p], A[1][q]], [A[2][p], A[2][q]]]);
      };
      const m = [minor(0), minor(1), minor(2)];
      return {
        params: { A },
        promptText: r`Compute the determinant.`,
        mathFormula: vm(A),
        options: [
          { id: 'a', label: r`$${D}$`, value: D },
          { id: 'b', label: r`$${down}$`, value: down, trapExplanation: r`${down} is only the sum of the three "downward" diagonal products in Sarrus' rule. The three "upward" products (total ${up}) must be subtracted.` },
          { id: 'c', label: r`$${down + up}$`, value: down + up, trapExplanation: r`$${down} + ${up}$ adds the upward products instead of subtracting them.` },
          { id: 'd', label: r`$${-D}$`, value: -D, trapExplanation: r`The signs of the cofactors were reversed. Along the first row they are $+,-,+$, starting with $+$.` },
        ],
        stepByStepSolution: [
          r`Expand along row 1: $\det = ${A[0][0]}\cdot M_{11} - ${A[0][1]}\cdot M_{12} + ${A[0][2]}\cdot M_{13}$, where $M_{1j}$ is the $2\times2$ determinant left after deleting row 1 and column $j$.`,
          r`$M_{11} = ${m[0]}$, $M_{12} = ${m[1]}$, $M_{13} = ${m[2]}$, so $\det = ${chain([A[0][0] * m[0], -A[0][1] * m[1], A[0][2] * m[2]])}$.`,
          r`$\det = ${D}$.`,
        ],
      };
    },
  },
  {
    id: 'la-04-4',
    difficulty: 2,
    keyConceptTag: 'det(cA) = cⁿ det A',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, k, d } = g.until(
        () => ({ n: g.pick([2, 3]), k: g.pick([2, 3]), d: g.nonzero(-5, 5) }),
        ({ n, k, d }) => allDistinct([k ** n * d, k * d, k ** (5 - n) * d, k + d]),
      );
      const other = 5 - n; // 3 for 2×2, 2 for 3×3
      return {
        params: { n, k, d },
        promptText: r`$A$ is a $${n}\times${n}$ matrix with $\det A = ${d}$. What is $\det(${k}A)$?`,
        options: [
          { id: 'a', label: r`$${k ** n * d}$`, value: k ** n * d },
          { id: 'b', label: r`$${k * d}$`, value: k * d, trapExplanation: r`$${k}\det A$ would be right if only one row were scaled. $${k}A$ scales all ${n} rows, giving a factor $${k}^${n}$.` },
          { id: 'c', label: r`$${k ** other * d}$`, value: k ** other * d, trapExplanation: r`$${k}^${other}\cdot ${paren(d)}$ is the rule for a $${other}\times${other}$ matrix. The exponent is the size $n$, here ${n}.` },
          { id: 'd', label: r`$${k + d}$`, value: k + d, trapExplanation: r`Scaling a matrix multiplies the determinant; it never adds to it.` },
        ],
        stepByStepSolution: [
          r`$${k}A$ multiplies each of the ${n} rows by ${k}.`,
          r`Each row multiplication multiplies the determinant by ${k}: $\det(${k}A) = ${k}^${n}\det A$.`,
          r`$${k ** n}\cdot ${paren(d)} = ${k ** n * d}$. Geometrically: scaling every edge of a box by ${k} multiplies its volume by $${k}^${n}$.`,
        ],
      };
    },
  },
  {
    id: 'la-04-5',
    difficulty: 3,
    keyConceptTag: 'Multiplicativity of det',
    correctOptionId: 'a',
    generate: (g) => {
      const { dA, dB } = g.until(
        () => ({ dA: g.pick([-3, -2, 2, 3]), dB: g.pick([-5, -4, -3, -2, 2, 3, 4, 5]) }),
        ({ dA, dB }) => allDistinct([dA ** 3 / dB, -(dA ** 3) / dB, dA ** 3 * dB, (2 * dA * dA) / dB]),
      );
      return {
        params: { dA, dB },
        promptText: r`$A$ and $B$ are $3\times 3$ matrices with $\det A = ${dA}$ and $\det B = ${dB}$. Compute $\det(A^{T}B^{-1}A^{2})$.`,
        options: [
          { id: 'a', label: r`$${frac(dA ** 3, dB)}$`, value: dA ** 3 / dB },
          { id: 'b', label: r`$${frac(-(dA ** 3), dB)}$`, value: -(dA ** 3) / dB, trapExplanation: r`Check the signs: $\det(A^T) = ${dA}$, $\det(B^{-1}) = ${frac(1, dB)}$ and $\det(A^2) = ${dA * dA}$ multiply to $${frac(dA ** 3, dB)}$.` },
          { id: 'c', label: r`$${dA ** 3 * dB}$`, value: dA ** 3 * dB, trapExplanation: r`$\det(B^{-1})$ is $1/\det B$, not $\det B$. The inverse divides.` },
          { id: 'd', label: r`$${frac(2 * dA * dA, dB)}$`, value: (2 * dA * dA) / dB, trapExplanation: r`$\det(A^2) = (\det A)^2 = ${dA * dA}$, not $2\det A$. The square applies to the determinant.` },
        ],
        stepByStepSolution: [
          r`The determinant of a product is the product: $\det(A^T)\cdot\det(B^{-1})\cdot\det(A^2)$.`,
          r`$\det(A^T) = ${dA}$, $\det(B^{-1}) = ${frac(1, dB)}$, $\det(A^2) = ${paren(dA)}^2 = ${dA * dA}$.`,
          r`$${dA}\cdot ${frac(1, dB).startsWith('-') ? `(${frac(1, dB)})` : frac(1, dB)}\cdot ${dA * dA} = ${frac(dA ** 3, dB)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-04-6',
    difficulty: 3,
    keyConceptTag: 'det = 0 detects dependence',
    correctOptionId: 'a',
    generate: (g) => {
      const s = g.pick([1, 2, 3, -1, -2]);
      const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
      const show = (xs: number[]) => xs.map((x) => r`$t = ${x}$`).join(' or ');
      const ans = sorted([s, -2 * s]);
      const flipped = sorted([-s, 2 * s]);
      const wrong2 = sorted([s, 2 * s]);
      return {
        params: { s },
        promptText: r`For which values of $t$ are the columns of this matrix linearly dependent?`,
        mathFormula: pm([['t', s, s], [s, 't', s], [s, s, 't']] as unknown as Mat),
        options: [
          { id: 'a', label: show(ans), value: ans },
          { id: 'b', label: show(flipped), value: flipped, trapExplanation: r`Plug in $t = ${2 * s}$: the determinant is $(${2 * s} ${s < 0 ? '+' : '-'} ${Math.abs(s)})^2(${2 * s} ${s < 0 ? '-' : '+'} ${Math.abs(2 * s)}) \ne 0$. The signs of the roots were flipped.` },
          { id: 'c', label: r`Only $t = ${s}$`, value: [s], trapExplanation: r`At $t = ${s}$ all columns are equal, which is easy to spot — but $\det = (t ${s < 0 ? '+' : '-'} ${Math.abs(s)})^2(t ${s < 0 ? '-' : '+'} ${Math.abs(2 * s)})$ also vanishes at $t = ${-2 * s}$.` },
          { id: 'd', label: show(wrong2), value: wrong2, trapExplanation: r`At $t = ${2 * s}$ the determinant is not 0. The second root comes from the factor $t ${s < 0 ? '-' : '+'} ${Math.abs(2 * s)}$.` },
        ],
        stepByStepSolution: [
          r`Columns are dependent exactly when $\det = 0$.`,
          r`Expanding gives $\det = (t ${s < 0 ? '+' : '-'} ${Math.abs(s)})^2(t ${s < 0 ? '-' : '+'} ${Math.abs(2 * s)})$.`,
          r`So $\det = 0$ for $t = ${s}$ (all columns equal) and for $t = ${-2 * s}$ (the columns add up to the zero vector).`,
        ],
      };
    },
  },
];
