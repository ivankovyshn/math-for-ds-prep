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
    id: 'la-11-x7',
    difficulty: 1,
    keyConceptTag: 'Error of a low-rank approximation',
    correctOptionId: 'a',
    generate: (g) => {
      const { s, k } = g.until(
        () => ({ s: desc([g.int(9, 14), g.int(5, 8), g.int(2, 4), 1]), k: g.int(1, 2) }),
        ({ s, k }) => {
          const dropped = s.slice(k);
          return new Set(s).size === 4 && allDistinct([s[k], s[k - 1], Math.sqrt(dropped.reduce((t, x) => t + x * x, 0)), dropped.reduce((t, x) => t + x, 0)]);
        },
      );
      const dropped = s.slice(k);
      const sq = dropped.reduce((t, x) => t + x * x, 0);
      const sum = dropped.reduce((t, x) => t + x, 0);
      return {
        params: { s, k },
        promptText: r`$A$ has singular values $${s.join(', ')}$, and $A_${k}$ is its best rank-${k} approximation. What is $\|A - A_${k}\|_2$?`,
        options: [
          { id: 'a', label: `$${s[k]}$`, value: s[k] },
          { id: 'b', label: `$${s[k - 1]}$`, value: s[k - 1], trapExplanation: r`$\sigma_${k} = ${s[k - 1]}$ is the last singular value that $A_${k}$ keeps. The error starts with the first one it drops.` },
          { id: 'c', label: `$${sqrtTex(sq)}$`, value: Math.sqrt(sq), trapExplanation: r`That is the Frobenius error $\sqrt{${dropped.map((x) => `${x}^2`).join(' + ')}}$. In the 2-norm only the largest dropped value counts.` },
          { id: 'd', label: `$${sum}$`, value: sum, trapExplanation: r`Dropped singular values do not add up: $\|A - A_k\|_2$ is the largest stretch of the error, which is the largest dropped value.` },
        ],
        stepByStepSolution: [
          r`$A - A_${k}$ consists of the dropped terms, with singular values $${dropped.join(', ')}$.`,
          r`The 2-norm of a matrix is its largest singular value.`,
          r`$\|A - A_${k}\|_2 = \sigma_${k + 1} = ${s[k]}$.`,
        ],
      };
    },
  },
  {
    id: 'la-11-x8',
    difficulty: 2,
    keyConceptTag: 'Squared singular values add up to the squared entries',
    correctOptionId: 'a',
    generate: (g) => {
      const A = g.until(
        () => [[g.int(-4, 4), g.int(-4, 4)], [g.int(-4, 4), g.int(-4, 4)]],
        (A) => {
          const f = A.flat();
          const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
          return d !== 0 && allDistinct([f.reduce((t, x) => t + x * x, 0), Math.abs(d), f.reduce((t, x) => t + x, 0), (A[0][0] + A[1][1]) ** 2]);
        },
      );
      const f = A.flat();
      const ss = f.reduce((t, x) => t + x * x, 0);
      const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      return {
        params: { A },
        promptText: r`Without computing them, find $\sigma_1^2 + \sigma_2^2$ for $A = ${pm(A)}$.`,
        options: [
          { id: 'a', label: `$${ss}$`, value: ss },
          { id: 'b', label: `$${Math.abs(d)}$`, value: Math.abs(d), trapExplanation: r`$|\det A| = ${Math.abs(d)}$ is the <i>product</i> $\sigma_1\sigma_2$, not the sum of squares.` },
          { id: 'c', label: `$${f.reduce((t, x) => t + x, 0)}$`, value: f.reduce((t, x) => t + x, 0), trapExplanation: r`The entries must be squared before adding: $\sum a_{ij}^2$.` },
          { id: 'd', label: `$${(A[0][0] + A[1][1]) ** 2}$`, value: (A[0][0] + A[1][1]) ** 2, trapExplanation: r`The trace is about eigenvalues, not singular values. $\sigma_1^2 + \sigma_2^2 = \|A\|_F^2$, the sum of all squared entries.` },
        ],
        stepByStepSolution: [
          r`$\sigma_1^2 + \sigma_2^2 = \|A\|_F^2 = \sum a_{ij}^2$.`,
          r`$${f.map((x) => (x < 0 ? `(${x})^2` : `${x}^2`)).join(' + ')}$.`,
          r`$= ${ss}$.`,
        ],
      };
    },
  },
];
