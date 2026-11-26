import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, pm, sqrtTex, vec } from '../gen.ts';
import { symFrom } from './10-spectral.practice.ts';
import { desc, diagOptions, listTex, share, signedDiag } from './11-svd-pca.practice.ts';

/** Pairs of perfect squares with the same parity, so that (λ₁ ± λ₂)/2 are integers. */
const SQUARES = [[9, 1], [25, 1], [25, 9], [16, 4], [36, 4], [36, 16], [49, 1], [49, 9], [49, 25], [64, 16], [64, 36]];

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-11-x1',
    difficulty: 1,
    keyConceptTag: 'Singular values of a diagonal matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const d = signedDiag(g, 2);
      const D = [[d[0], 0], [0, d[1]]];
      return {
        params: { A: D },
        promptText: r`What are the singular values of $${pm(D)}$?`,
        options: diagOptions(d),
        stepByStepSolution: [
          r`A diagonal matrix stretches the axes by $|d_1| = ${Math.abs(d[0])}$ and $|d_2| = ${Math.abs(d[1])}$; a negative sign only adds a flip.`,
          r`Formally: $A^TA = ${pm([[d[0] * d[0], 0], [0, d[1] * d[1]]])}$ and $\sigma_i = \sqrt{\lambda_i(A^TA)}$.`,
          r`In decreasing order: ${listTex(desc(d.map(Math.abs)))}.`,
        ],
      };
    },
  },
  {
    id: 'la-11-x2',
    difficulty: 1,
    keyConceptTag: 'Rank from singular values',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(3, 5);
      const k = g.int(2, n - 1);
      const m = n + g.int(1, 3);
      const sv = g.until(
        () => desc(Array.from({ length: k }, () => g.int(1, 12))),
        (s) => new Set(s).size === k,
      );
      const all = [...sv, ...Array(n - k).fill(0)];
      return {
        params: { m, n, s: all },
        promptText: r`A $${m}\times${n}$ matrix has singular values $${all.join(', ')}$. What is its rank?`,
        options: [
          { id: 'a', label: `$${k}$`, value: k },
          { id: 'b', label: `$${n}$`, value: n, trapExplanation: r`A ${m}×${n} matrix has ${n} singular values, but the zero ones do not count: each zero means a direction is flattened.` },
          { id: 'c', label: `$${m}$`, value: m, trapExplanation: r`The rank is at most $\min(${m}, ${n}) = ${n}$; it can never exceed the number of columns.` },
          { id: 'd', label: `$${k - 1}$`, value: k - 1, trapExplanation: r`Every non-zero singular value counts, however small: there are ${k} of them.` },
        ],
        stepByStepSolution: [
          r`$A = U\Sigma V^T$ with $U$, $V$ invertible, so $\operatorname{rank}A = \operatorname{rank}\Sigma$.`,
          r`$\Sigma$ is diagonal: its rank is the number of non-zero entries.`,
          r`Non-zero singular values: $${sv.join(', ')}$, so the rank is ${k}.`,
        ],
      };
    },
  },
  {
    id: 'la-11-x3',
    difficulty: 1,
    keyConceptTag: 'The largest stretch',
    correctOptionId: 'a',
    generate: (g) => {
      const [s1, s2] = g.until(() => desc([g.int(1, 9), g.int(1, 9)]), ([p, q]) => p > q && allDistinct([p, q, p * p, p + q]));
      return {
        params: { s: [s1, s2] },
        promptText: r`A $2\times2$ matrix $A$ has singular values $${s1}$ and $${s2}$. What is the largest value of $\|A\mathbf{x}\|$ over all unit vectors $\mathbf{x}$?`,
        options: [
          { id: 'a', label: `$${s1}$`, value: s1 },
          { id: 'b', label: `$${s2}$`, value: s2, trapExplanation: r`$\sigma_2 = ${s2}$ is the <i>smallest</i> stretch, reached at $\mathbf{x} = \mathbf{v}_2$.` },
          { id: 'c', label: `$${s1 * s1}$`, value: s1 * s1, trapExplanation: r`${s1 * s1} is $\sigma_1^2$, the largest value of $\|A\mathbf{x}\|^2$.` },
          { id: 'd', label: `$${s1 + s2}$`, value: s1 + s2, trapExplanation: r`The stretches do not add up: the unit circle becomes an ellipse whose longest semi-axis is $\sigma_1$.` },
        ],
        stepByStepSolution: [
          r`$A$ maps the unit circle to an ellipse with semi-axes $\sigma_1$ and $\sigma_2$.`,
          r`The longest vector on that ellipse has length $\sigma_1$, reached at $\mathbf{x} = \mathbf{v}_1$.`,
          r`So $\max_{\|\mathbf{x}\| = 1}\|A\mathbf{x}\| = \|A\|_2 = ${s1}$.`,
        ],
      };
    },
  },
  {
    id: 'la-11-x4',
    difficulty: 2,
    keyConceptTag: 'Singular values from AᵀA',
    correctOptionId: 'a',
    generate: (g) => {
      const [l1, l2] = g.pick(SQUARES);
      const [s, h] = [(l1 + l2) / 2, (l1 - l2) / 2];
      const M = [[s, h], [h, s]];
      return {
        params: { M },
        promptText: r`For some matrix $A$, $A^TA = ${pm(M)}$. What are the singular values of $A$?`,
        options: [
          { id: 'a', label: listTex([Math.sqrt(l1), Math.sqrt(l2)]), value: [Math.sqrt(l1), Math.sqrt(l2)] },
          { id: 'b', label: listTex([l1, l2]), value: [l1, l2], trapExplanation: r`${l1} and ${l2} are the eigenvalues of $A^TA$, i.e. $\sigma_i^2$. Take square roots.` },
          { id: 'c', label: listTex([sqrtTex(s), sqrtTex(s)]), value: [Math.sqrt(s), Math.sqrt(s)], trapExplanation: r`Square roots of the diagonal entries are column lengths of $A$, not singular values; the off-diagonal ${h} matters.` },
          { id: 'd', label: listTex([s, h]), value: [s, h], trapExplanation: r`Those are entries of $A^TA$. Find its eigenvalues first.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{tr} = ${2 * s}$, $\det = ${s * s - h * h}$: the eigenvalues of $A^TA$ are $${l1}$ and $${l2}$ (sum ${2 * s}, product ${l1 * l2}).`,
          r`$\sigma_i = \sqrt{\lambda_i(A^TA)}$.`,
          r`$\sigma_1 = \sqrt{${l1}} = ${Math.sqrt(l1)}$, $\sigma_2 = \sqrt{${l2}} = ${Math.sqrt(l2)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-11-x5',
    difficulty: 2,
    keyConceptTag: 'The first principal component',
    correctOptionId: 'a',
    generate: (g) => {
      const { A: C, v, w, l1, l2 } = g.until(
        () => symFrom(g, [[1, 2], [2, 1], [1, -2], [2, -1], [1, 3], [3, 1], [1, -3], [3, -1]], [1, 2], [1, 2, 3]),
        ({ A }) => A.flat().every((x) => Math.abs(x) <= 12),
      );
      const sg = g.pick([1, -1]);
      const a = v.map((x) => sg * x);
      const axis = C[0][0] >= C[1][1] ? [1, 0] : [0, 1];
      const swapped = [v[1], v[0]];
      return {
        params: { C, a, b: w, c: axis, d: swapped },
        promptText: r`A centred dataset has covariance matrix $C = ${pm(C)}$. Which vector points along its first principal component?`,
        options: [
          { id: 'a', label: `$${vec(a)}$` },
          { id: 'b', label: `$${vec(w)}$`, trapExplanation: r`$C${vec(w)} = ${l2}\cdot${vec(w)}$: that is PC2, the direction of <i>least</i> variance.` },
          { id: 'c', label: `$${vec(axis)}$`, trapExplanation: r`That is the feature with the larger variance (${Math.max(C[0][0], C[1][1])}). With non-zero covariance, PC1 is a mix of both features.` },
          { id: 'd', label: `$${vec(swapped)}$`, trapExplanation: r`$C${vec(swapped)} = (${C[0][0] * swapped[0] + C[0][1] * swapped[1]}, ${C[1][0] * swapped[0] + C[1][1] * swapped[1]})$ is not a multiple of $${vec(swapped)}$: not an eigenvector.` },
        ],
        stepByStepSolution: [
          r`PC1 is the eigenvector of $C$ with the largest eigenvalue.`,
          r`$C${vec(a)} = (${C[0][0] * a[0] + C[0][1] * a[1]}, ${C[1][0] * a[0] + C[1][1] * a[1]}) = ${l1}\cdot${vec(a)}$ and $C${vec(w)} = ${l2}\cdot${vec(w)}$.`,
          r`$${l1} > ${l2}$, so PC1 points along $${vec(a)}$ (the sign does not matter).`,
        ],
      };
    },
  },
  {
    id: 'la-11-x6',
    difficulty: 2,
    keyConceptTag: 'Explained variance from singular values',
    correctOptionId: 'a',
    generate: (g) => {
      const [s1, s2] = g.until(
        () => desc([g.int(1, 6), g.int(1, 6)]),
        ([p, q]) => p > q && allDistinct([(p * p) / (p * p + q * q), p / (p + q), (q * q) / (p * p + q * q), (p * p) / (q * q)]),
      );
      const tot = s1 * s1 + s2 * s2;
      return {
        params: { s: [s1, s2] },
        promptText: r`The centred data matrix $X$ (two features) has singular values $${s1}$ and $${s2}$. What share of the variance does PC1 explain?`,
        options: [
          { id: 'a', label: share(s1 * s1, tot), value: (s1 * s1) / tot },
          { id: 'b', label: share(s1, s1 + s2), value: s1 / (s1 + s2), trapExplanation: r`Variance goes with $\sigma_i^2$, not $\sigma_i$: $\lambda_i = \frac{\sigma_i^2}{n - 1}$.` },
          { id: 'c', label: share(s2 * s2, tot), value: (s2 * s2) / tot, trapExplanation: r`That is PC2's share, from the smaller singular value.` },
          { id: 'd', label: `$${frac(s1 * s1, s2 * s2)}$`, value: (s1 * s1) / (s2 * s2), trapExplanation: r`That compares PC1 with PC2. A share divides by the total $\sigma_1^2 + \sigma_2^2 = ${tot}$.` },
        ],
        stepByStepSolution: [
          r`The variance along PC $i$ is $\lambda_i = \frac{\sigma_i^2}{n - 1}$; the factor $\frac{1}{n-1}$ cancels in a share.`,
          r`$\sigma_1^2 = ${s1 * s1}$, $\sigma_2^2 = ${s2 * s2}$, total ${tot}.`,
          r`PC1: $\frac{${s1 * s1}}{${tot}}$, i.e. ${share(s1 * s1, tot)}.`,
        ],
      };
    },
  },
];
