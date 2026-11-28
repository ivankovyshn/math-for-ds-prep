import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dot, frac, outer, pm, sqrtTex, vec } from '../gen.ts';
import { charPoly } from './07-eigen.practice.ts';
import { legs } from './08-norms.practice.ts';
import { symFrom } from './10-spectral.practice.ts';

export const desc = (xs: number[]) => [...xs].sort((p, q) => q - p);
/** A list of numbers given as TeX strings, e.g. singular values. */
export const listTex = (xs: (number | string)[]) => `$${xs.join(', ')}$`;
/** A fraction with its rounded percentage: "\tfrac{6}{7} \approx 86\%". */
export const share = (p: number, q: number) => {
  const pct = Math.round((100 * p) / q);
  return `$${frac(p, q)}${(100 * p) % q === 0 ? ` = ${pct}\\%` : ` \\approx ${pct}\\%`}$`;
};

/** A diagonal matrix with distinct non-zero entries of distinct size, at least one negative. */
export function signedDiag(g: Rng, n: number) {
  return g.until(
    () => Array.from({ length: n }, () => g.nonzero(-9, 9)),
    (d) => new Set(d.map(Math.abs)).size === n && d.some((x) => x < 0) && d.some((x) => Math.abs(x) >= 2),
  );
}

/** Options for "singular values of a diagonal matrix": |d| sorted, the signed entries, squares, square roots. */
export function diagOptions(d: number[]) {
  const sv = desc(d.map(Math.abs));
  const signed = desc(d);
  const sq = desc(d.map((x) => x * x));
  const roots = sv.map((x) => Math.sqrt(x));
  return [
    { id: 'a', label: listTex(sv), value: sv },
    { id: 'b', label: listTex(signed), value: signed, trapExplanation: r`Singular values are never negative. A negative entry stretches by its absolute value and flips; the flip is part of $U$.` },
    { id: 'c', label: listTex(sq), value: sq, trapExplanation: r`Those are the eigenvalues of $A^TA$, i.e. $\sigma_i^2$. Take square roots.` },
    { id: 'd', label: listTex(sv.map(sqrtTex)), value: roots, trapExplanation: r`The square root is taken of the eigenvalues of $A^TA$ (the squares $d_i^2$), not of the entries themselves.` },
  ];
}

const SQUARE_PAIRS = [[4, 3, 5], [8, 6, 10], [12, 9, 15], [12, 5, 13], [15, 8, 17]];

export const practice: QuestionTemplate[] = [
  {
    id: 'la-11-1',
    difficulty: 1,
    keyConceptTag: 'Singular values of a diagonal matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const d = signedDiag(g, 3);
      const D = d.map((x, i) => d.map((_, j) => (i === j ? x : 0)));
      return {
        params: { A: D },
        promptText: r`What are the singular values of $A = ${pm(D)}$?`,
        options: diagOptions(d),
        stepByStepSolution: [
          r`$A^TA = ${pm(D.map((row) => row.map((x) => x * x)))}$, with eigenvalues $${d.map((x) => x * x).join(', ')}$.`,
          r`$\sigma_i = \sqrt{\lambda_i(A^TA)} = |d_i|$: $${d.map(Math.abs).join(', ')}$.`,
          r`In decreasing order: ${listTex(desc(d.map(Math.abs)))}.`,
        ],
      };
    },
  },
  {
    id: 'la-11-3',
    difficulty: 2,
    keyConceptTag: 'Singular values from AᵀA',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, k1, k2 } = g.until(
        () => ({ ...legs(g, [[3, 4, 5], [5, 12, 13]]), k1: g.int(1, 3), k2: g.int(1, 3) }),
        ({ a, b, c, k1, k2 }) => {
          const rows = desc([k1 * k1 * a * a + k2 * k2 * b * b, k1 * k1 * b * b + k2 * k2 * a * a]).map(Math.sqrt);
          return k1 !== k2 && c * Math.max(k1, k2) <= 15 && allDistinct([desc([k1 * c, k2 * c]), desc([k1 * k1 * c * c, k2 * k2 * c * c]), desc([Math.abs(k1 * a), Math.abs(k2 * a)]), rows]);
        },
      );
      const A = [[k1 * a, -k2 * b], [k1 * b, k2 * a]];
      const sv = desc([k1 * c, k2 * c]);
      const rowSq = desc([k1 * k1 * a * a + k2 * k2 * b * b, k1 * k1 * b * b + k2 * k2 * a * a]);
      const diag = desc([Math.abs(k1 * a), Math.abs(k2 * a)]);
      return {
        params: { A },
        promptText: r`The columns of $A = ${pm(A)}$ are perpendicular. What are its singular values?`,
        options: [
          { id: 'a', label: listTex(sv), value: sv },
          { id: 'b', label: listTex(sv.map((x) => x * x)), value: sv.map((x) => x * x), trapExplanation: r`Those are the eigenvalues of $A^TA$, the squared column lengths. Take square roots.` },
          { id: 'c', label: listTex(diag), value: diag, trapExplanation: r`The diagonal entries say nothing directly about a non-diagonal matrix. Use the columns: here $A^TA$ is diagonal.` },
          { id: 'd', label: listTex(rowSq.map(sqrtTex)), value: rowSq.map(Math.sqrt), trapExplanation: r`Those are the lengths of the rows. The rows are not perpendicular; the columns are, so $A^TA$ (columns dotted with columns) is diagonal.` },
        ],
        stepByStepSolution: [
          r`Entry $(i, j)$ of $A^TA$ is column $i$ dotted with column $j$. The columns are perpendicular, so $A^TA$ is diagonal.`,
          r`Squared column lengths: $${k1 * k1 * c * c}$ and $${k2 * k2 * c * c}$, so $A^TA = ${pm([[k1 * k1 * c * c, 0], [0, k2 * k2 * c * c]])}$.`,
          r`$\sigma = \sqrt{${sv[0] ** 2}}, \sqrt{${sv[1] ** 2}}$: ${listTex(sv)}. Check: $\sigma_1\sigma_2 = ${sv[0] * sv[1]} = |\det A|$.`,
        ],
      };
    },
  },
  {
    id: 'la-11-4',
    difficulty: 2,
    keyConceptTag: 'Error of a low-rank approximation',
    correctOptionId: 'a',
    generate: (g) => {
      const [s2, s3, h] = g.pick(SQUARE_PAIRS);
      const s1 = s2 + g.int(1, 10);
      return {
        params: { s: [s1, s2, s3] },
        promptText: r`$A$ has singular values $${s1}, ${s2}, ${s3}$, and $A_1$ is its best rank-1 approximation. What is $\|A - A_1\|_F$?`,
        options: [
          { id: 'a', label: `$${h}$`, value: h },
          { id: 'b', label: `$${s2}$`, value: s2, trapExplanation: r`$\sigma_2 = ${s2}$ is the error in the spectral norm $\|A - A_1\|_2$. The Frobenius norm counts every dropped singular value.` },
          { id: 'c', label: `$${s2 + s3}$`, value: s2 + s3, trapExplanation: r`Frobenius errors add as squares, not directly: $\sqrt{\sigma_2^2 + \sigma_3^2}$.` },
          { id: 'd', label: `$${h * h}$`, value: h * h, trapExplanation: r`${h * h} is $\|A - A_1\|_F^2$. Take the square root.` },
        ],
        stepByStepSolution: [
          r`$A_1 = \sigma_1\mathbf{u}_1\mathbf{v}_1^T$, so $A - A_1 = \sigma_2\mathbf{u}_2\mathbf{v}_2^T + \sigma_3\mathbf{u}_3\mathbf{v}_3^T$.`,
          r`$\|A - A_1\|_F^2 = \sigma_2^2 + \sigma_3^2 = ${s2 * s2} + ${s3 * s3} = ${h * h}$.`,
          r`$\|A - A_1\|_F = ${h}$.`,
        ],
      };
    },
  },
  {
    id: 'la-11-5',
    difficulty: 3,
    keyConceptTag: 'Singular values of a rank-one matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: [g.nonzero(-3, 3), g.nonzero(-3, 3)], b: [g.nonzero(-3, 3), g.nonzero(-3, 3)] }),
        ({ a, b }) => a[0] * b[1] !== a[1] * b[0] && dot(a, b) !== 0 && dot(a, a) !== dot(b, b),
      );
      const A = outer(a, b);
      const N = dot(a, a) * dot(b, b);
      const ab = dot(a, b);
      const lens = desc([dot(a, a), dot(b, b)]);
      return {
        params: { A },
        promptText: r`Find the singular values of $A = ${pm(A)}$.`,
        options: [
          { id: 'a', label: listTex([sqrtTex(N), 0]), value: [Math.sqrt(N), 0] },
          { id: 'b', label: listTex([ab, 0]), value: [ab, 0], trapExplanation: r`$${ab}$ and 0 are the <i>eigenvalues</i> of $A$ ($\operatorname{tr}A = ${ab}$, $\det A = 0$). Singular values come from $A^TA$ and are never negative.` },
          { id: 'c', label: listTex([N, 0]), value: [N, 0], trapExplanation: r`${N} is $\sigma_1^2$, the non-zero eigenvalue of $A^TA$. Take the square root.` },
          { id: 'd', label: listTex(lens.map(sqrtTex)), value: lens.map(Math.sqrt), trapExplanation: r`Those are the lengths of $${vec(a)}$ and $${vec(b)}$ with $A = ${vec(a)}${vec(b)}^T$. Their product is $\sigma_1$; and a rank-one matrix has $\sigma_2 = 0$.` },
        ],
        stepByStepSolution: [
          r`The second row is a multiple of the first, so $\operatorname{rank}A = 1$: one singular value is 0.`,
          r`$\|A\|_F^2 = \sum a_{ij}^2 = ${A.flat().map((x) => x * x).join(' + ')} = ${N}$, and $\|A\|_F^2 = \sigma_1^2 + \sigma_2^2 = \sigma_1^2$.`,
          r`$\sigma_1 = \sqrt{${N}}${sqrtTex(N) === `\\sqrt{${N}}` ? '' : ` = ${sqrtTex(N)}`}$, $\sigma_2 = 0$.`,
        ],
      };
    },
  },
  {
    id: 'la-11-7',
    difficulty: 1,
    keyConceptTag: 'Frobenius norm from singular values',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b, c] = g.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15]]);
      return {
        params: { s: [b, a] },
        promptText: r`A matrix $A$ has singular values $${b}$ and $${a}$. What is $\|A\|_F$?`,
        options: [
          { id: 'a', label: `$${c}$`, value: c },
          { id: 'b', label: `$${a + b}$`, value: a + b, trapExplanation: r`$\|A\|_F^2$ is the sum of the <i>squared</i> singular values; the root comes at the end.` },
          { id: 'c', label: `$${b}$`, value: b, trapExplanation: r`That is $\sigma_1 = \|A\|_2$, the spectral norm. The Frobenius norm uses all singular values.` },
          { id: 'd', label: `$${c * c}$`, value: c * c, trapExplanation: r`That is $\|A\|_F^2$; take the square root.` },
        ],
        stepByStepSolution: [
          r`$\|A\|_F^2 = \sigma_1^2 + \sigma_2^2$, the same as the sum of the squared entries.`,
          r`$${b}^2 + ${a}^2 = ${b * b} + ${a * a} = ${c * c}$.`,
          r`$\|A\|_F = \sqrt{${c * c}} = ${c}$.`,
        ],
      };
    },
  },
  {
    id: 'la-11-8',
    difficulty: 3,
    keyConceptTag: 'Singular values of a symmetric matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, l1, l2 } = g.until(
        () => symFrom(g),
        ({ A, l1, l2 }) =>
          l1 * l2 < 0 && l1 + l2 !== 0 && A.flat().every((x) => Math.abs(x) <= 9) &&
          allDistinct([desc([Math.abs(l1), Math.abs(l2)]), desc([l1, l2]), desc([l1 * l1, l2 * l2]), desc([Math.abs(A[0][0]), Math.abs(A[1][1])])]),
      );
      const sv = desc([Math.abs(l1), Math.abs(l2)]);
      const ev = desc([l1, l2]);
      const sq = desc([l1 * l1, l2 * l2]);
      const dg = desc([Math.abs(A[0][0]), Math.abs(A[1][1])]);
      const t = A[0][0] + A[1][1];
      const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      return {
        params: { A },
        promptText: r`$A = ${pm(A)}$ is symmetric. What are its singular values?`,
        options: [
          { id: 'a', label: listTex(sv), value: sv },
          { id: 'b', label: listTex(ev), value: ev, trapExplanation: r`Those are the eigenvalues. Singular values are never negative: for a symmetric matrix they are $|\lambda|$.` },
          { id: 'c', label: listTex(sq), value: sq, trapExplanation: r`Those are the eigenvalues of $A^TA = A^2$. Singular values are their square roots.` },
          { id: 'd', label: listTex(dg), value: dg, trapExplanation: r`The diagonal entries give the singular values only for a diagonal matrix. Here the off-diagonal ${A[0][1]} matters.` },
        ],
        stepByStepSolution: [
          r`$A$ is symmetric, so $A^TA = A^2$ has eigenvalues $\lambda^2$, and the singular values are $|\lambda|$.`,
          r`Eigenvalues of $A$: trace $${t}$, determinant $${d}$, so $\lambda^2 ${t < 0 ? '+' : '-'} ${Math.abs(t)}\lambda ${d < 0 ? '-' : '+'} ${Math.abs(d)} = 0$ gives $\lambda = ${ev[0]}$ and $\lambda = ${ev[1]}$.`,
          r`Singular values: $${sv[0]}$ and $${sv[1]}$.`,
        ],
      };
    },
  },
];
