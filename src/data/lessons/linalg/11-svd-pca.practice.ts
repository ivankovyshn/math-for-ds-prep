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
    id: 'la-11-2',
    difficulty: 1,
    keyConceptTag: 'Explained variance',
    correctOptionId: 'a',
    generate: (g) => {
      const S = g.pick([20, 25, 50, 100]);
      const ls = g.until(
        () => {
          const three = [g.int(1, S), g.int(1, S), g.int(1, S)];
          return desc([...three, S - three[0] - three[1] - three[2]]);
        },
        (ls) => ls[3] > 0 && new Set(ls).size === 4 && allDistinct([ls[0] + ls[1], ls[0], ls[2] + ls[3], S / 2]),
      );
      const pct = (x: number) => (100 * x) / S;
      return {
        params: { ls },
        promptText: r`The covariance matrix of a centred dataset with 4 features has eigenvalues $${ls.join(', ')}$. What share of the total variance do the first two principal components explain?`,
        options: [
          { id: 'a', label: r`$${pct(ls[0] + ls[1])}\%$`, value: pct(ls[0] + ls[1]) },
          { id: 'b', label: r`$${pct(ls[0])}\%$`, value: pct(ls[0]), trapExplanation: r`That is PC1 alone. Add PC2's share, $\frac{${ls[1]}}{${S}}$.` },
          { id: 'c', label: r`$${pct(ls[2] + ls[3])}\%$`, value: pct(ls[2] + ls[3]), trapExplanation: r`That is the share left out: the last two components.` },
          { id: 'd', label: r`$50\%$`, value: 50, trapExplanation: r`Two of four components do not explain half the variance: each carries its own eigenvalue's share.` },
        ],
        stepByStepSolution: [
          r`Total variance $= \lambda_1 + \dots + \lambda_4 = ${ls.join(' + ')} = ${S}$.`,
          r`The first two components carry $${ls[0]} + ${ls[1]} = ${ls[0] + ls[1]}$.`,
          r`Share: $\frac{${ls[0] + ls[1]}}{${S}} = ${pct(ls[0] + ls[1])}\%$.`,
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
    id: 'la-11-6',
    difficulty: 3,
    keyConceptTag: 'Explained variance from a covariance matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const { A: C, l1, l2 } = g.until(
        () => symFrom(g, [[1, 1], [1, -1], [1, 2], [2, 1], [1, -2], [2, -1]], [1, 2], [1, 2, 3, 4]),
        ({ A, l1, l2 }) => {
          const t = l1 + l2;
          return A.flat().every((x) => Math.abs(x) <= 12) && allDistinct([l1 / t, Math.max(A[0][0], A[1][1]) / t, l2 / t, l1 / l2]);
        },
      );
      const t = l1 + l2;
      const d = l1 * l2;
      const top = Math.max(C[0][0], C[1][1]);
      return {
        params: { C },
        promptText: r`A centred dataset with two features has covariance matrix $C = ${pm(C)}$. What share of the total variance does the first principal component explain?`,
        options: [
          { id: 'a', label: share(l1, t), value: l1 / t },
          { id: 'b', label: share(top, t), value: top / t, trapExplanation: r`${top} is the variance of the more spread-out original feature. PC1 is a mix of both features and captures more: the largest eigenvalue, ${l1}.` },
          { id: 'c', label: share(l2, t), value: l2 / t, trapExplanation: r`That is PC2, the direction with the <i>smallest</i> variance.` },
          { id: 'd', label: `$${frac(l1, l2)}$`, value: l1 / l2, trapExplanation: r`$\frac{\lambda_1}{\lambda_2}$ compares PC1 with PC2. The share divides by the total, $\lambda_1 + \lambda_2 = ${t}$.` },
        ],
        stepByStepSolution: [
          r`Total variance $= \operatorname{tr}C = ${t}$; $\det C = ${d}$.`,
          r`Eigenvalues: $${charPoly(t, d)} = 0$ gives $\lambda_1 = ${l1}$, $\lambda_2 = ${l2}$.`,
          r`PC1 explains $\frac{\lambda_1}{\lambda_1 + \lambda_2} = \frac{${l1}}{${t}}$: ${share(l1, t)}.`,
        ],
      };
    },
  },
];
